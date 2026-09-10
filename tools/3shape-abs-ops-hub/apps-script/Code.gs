/**
 * 3Shape → ABS Operations Hub
 * Google Apps Script backend for the existing reconciliation tracker.
 *
 * IMPORTANT
 * - Keep TRACKER_SPREADSHEET_ID in Apps Script > Project Settings > Script properties.
 * - Do not commit patient data, PDF files, spreadsheet IDs, or credentials to GitHub.
 * - The existing Google Sheet remains the source of truth in v1.
 */

const HUB = {
  TZ: 'Asia/Manila',
  PROPERTY_SHEET_ID: 'TRACKER_SPREADSHEET_ID',
  PROPERTY_ALLOWED_EMAILS: 'ALLOWED_EMAILS',
  CACHE_SECONDS: 30,
  TARGET_PER_HOUR: 12,
  // Anchor copied from the current Shift Productivity workbook: 2026-09-10 = Cycle 2 of 5.
  ROTATION_ANCHOR_DATE: '2026-09-10',
  ROTATION_ANCHOR_CYCLE: 2,
  SHEETS: {
    EOD: 'EOD Dashboard',
    RECON: 'Reconciliation',
    PENDING: 'Pending Queue',
    UNMATCHED: 'Unmatched ABS',
    SETUP: 'Setup & Process',
    HOURLY: 'Hourly Activity',
    CLEARPATH: 'ClearPath Queue Control',
    QUALITY: 'Data Quality Issues',
    REASONS: 'Productivity Reason Store',
    PRODUCTIVITY: 'Shift Productivity',
    SCRAPE: 'Scrape Log',
    ABS: 'ABS Outcome',
    CALLOUT: 'Callout & Escalation History',
    WEB_CONFIG: 'Web Hub Config',
    WEB_AUDIT: 'Web Hub Audit'
  },
  NINJAS: [
    'Reignaire Louise Bardiano',
    'Laarnie Morales',
    'Norvic Carreon',
    'Cathlene May Layco',
    'Rosemarie Bendita'
  ]
};

function doGet() {
  authorize_();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('3Shape → ABS Operations Hub')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getBootstrap(requestedShiftDate) {
  authorize_();
  const shiftDate = normalizeShiftDate_(requestedShiftDate) || currentOperationalShiftDate_();
  ensureWebSheets_();
  const dashboard = buildDashboard_(shiftDate);
  return {
    appName: '3Shape → ABS Operations Hub',
    shiftDate,
    shiftCoverage: shiftCoverageLabel_(shiftDate),
    targetPerHour: HUB.TARGET_PER_HOUR,
    ninjas: HUB.NINJAS,
    dashboard,
    productivity: buildProductivity_(shiftDate),
    clearPath: buildClearPath_(shiftDate),
    hourly: buildHourly_(shiftDate),
    serverTime: Utilities.formatDate(new Date(), HUB.TZ, 'yyyy-MM-dd HH:mm:ss')
  };
}

function getDashboard(shiftDate) {
  authorize_();
  return buildDashboard_(normalizeShiftDate_(shiftDate));
}

function getProductivity(shiftDate) {
  authorize_();
  return buildProductivity_(normalizeShiftDate_(shiftDate));
}

function getClearPath(shiftDate) {
  authorize_();
  return buildClearPath_(normalizeShiftDate_(shiftDate));
}

function getHourly(shiftDate) {
  authorize_();
  return buildHourly_(normalizeShiftDate_(shiftDate));
}

function getReconciliation(shiftDate, statusFilter, limit) {
  authorize_();
  const key = normalizeShiftDate_(shiftDate);
  const rows = reconciliationRows_(key);
  const filter = String(statusFilter || 'ALL').toUpperCase();
  let out = rows;
  if (filter === 'PENDING') out = rows.filter(r => String(r.reconciliationStatus).includes('PENDING'));
  if (filter === 'COMPLETED') out = rows.filter(r => r.absDisposition === 'Completed');
  if (filter === 'ESCALATED') out = rows.filter(r => r.absDisposition === 'Escalated');
  if (filter === 'ISSUES') out = rows.filter(r => r.qualityIssues.length);
  return out.slice(0, Math.min(Number(limit) || 1000, 5000));
}

function getPending(shiftDate, limit) {
  authorize_();
  return reconciliationRows_(normalizeShiftDate_(shiftDate))
    .filter(r => String(r.reconciliationStatus).includes('PENDING'))
    .slice(0, Math.min(Number(limit) || 1000, 5000));
}

function getUnmatched(shiftDate, limit) {
  authorize_();
  const key = normalizeShiftDate_(shiftDate);
  const sheet = getSheet_(HUB.SHEETS.UNMATCHED);
  if (!sheet) return [];
  const values = readRows_(sheet, 13);
  if (!values.length) return [];
  const headers = values[0].map(v => String(v || '').trim());
  const shiftIdx = findHeaderIndex_(headers, ['Shift Date', 'Operational Shift Date', 'ABS Operational Shift Date']);
  const data = values.slice(1).filter(r => r.some(v => v !== '' && v != null));
  const filtered = shiftIdx >= 0 ? data.filter(r => dateKey_(r[shiftIdx]) === key) : data;
  return filtered.slice(0, Math.min(Number(limit) || 1000, 5000)).map(r => rowObject_(headers, r));
}

function getHistory(fromDate, toDate) {
  authorize_();
  const from = normalizeShiftDate_(fromDate);
  const to = normalizeShiftDate_(toDate);
  const sheet = getSheet_(HUB.SHEETS.RECON);
  const rows = readRows_(sheet, 15);
  if (!rows.length) return [];
  const map = {};
  rows.slice(1).forEach(r => {
    if (!r[0]) return;
    const d = dateKey_(r[14]);
    if (!d || (from && d < from) || (to && d > to)) return;
    if (!map[d]) map[d] = {shiftDate:d, scraped:0, completed:0, escalated:0, pending:0, reconciled:0};
    const x = map[d];
    x.scraped++;
    const disp = String(r[6] || '').trim();
    if (disp === 'Completed') { x.completed++; x.reconciled++; }
    else if (disp === 'Escalated') { x.escalated++; x.reconciled++; }
    else x.pending++;
  });
  return Object.values(map).sort((a,b) => b.shiftDate.localeCompare(a.shiftDate)).map(x => ({
    ...x,
    reconciliationRate: x.scraped ? round2_(x.reconciled / x.scraped * 100) : 0
  }));
}

function addScrape(payload) {
  authorize_();
  if (!payload) throw new Error('Missing scrape payload.');
  const patient = cleanText_(payload.patientName);
  const link = cleanText_(payload.sourceLink);
  const ninja = canonicalNinja_(payload.scrapedBy);
  if (!patient) throw new Error('Patient name is required.');
  if (!link) throw new Error('Source/PDF link is required.');
  if (!ninja) throw new Error('Scraped By is required.');

  const sheet = requireSheet_(HUB.SHEETS.SCRAPE);
  const row = firstEmptyInputRow_(sheet, 2, Math.max(sheet.getMaxRows(), 16000));
  copyTemplateFormulas_(sheet, 2, row, 18);
  const now = new Date();
  sheet.getRange(row, 1).setValue(now);
  sheet.getRange(row, 2).setValue(patient);
  sheet.getRange(row, 3).setValue(link);
  sheet.getRange(row, 4).setValue(ninja);
  sheet.getRange(row, 5).setValue(cleanText_(payload.uploadStatus) || 'Uploaded');
  SpreadsheetApp.flush();
  audit_('ADD_SCRAPE', {row, patient, ninja, link});
  clearCache_(currentOperationalShiftDate_(now));
  return {ok:true, row, shiftDate: currentOperationalShiftDate_(now)};
}

function addAbsOutcome(payload) {
  authorize_();
  if (!payload) throw new Error('Missing ABS payload.');
  const link = cleanText_(payload.pdfLink);
  const ninja = canonicalNinja_(payload.processedBy);
  const disposition = cleanText_(payload.disposition);
  const absCaseId = cleanText_(payload.absCaseId);
  const escalationReason = cleanText_(payload.escalationReason);
  const notes = cleanText_(payload.notes);
  if (!link) throw new Error('PDF link is required.');
  if (!ninja) throw new Error('Processed By is required.');
  if (!['Completed','Escalated'].includes(disposition)) throw new Error('Disposition must be Completed or Escalated.');
  if (disposition === 'Completed' && !absCaseId) throw new Error('ABS Case ID is required for Completed cases.');
  if (disposition === 'Escalated' && !(escalationReason || notes)) throw new Error('Escalation reason is required for Escalated cases.');

  const sheet = requireSheet_(HUB.SHEETS.ABS);
  const row = firstEmptyInputRow_(sheet, 2, Math.max(sheet.getMaxRows(), 16989));
  copyTemplateFormulas_(sheet, 2, row, 27);
  const now = new Date();
  sheet.getRange(row, 1).setValue(now);
  sheet.getRange(row, 3).setValue(link);
  sheet.getRange(row, 6).setValue(ninja);
  sheet.getRange(row, 7).setValue(disposition);
  sheet.getRange(row, 8).setValue(absCaseId);
  sheet.getRange(row, 9).setValue(escalationReason);
  sheet.getRange(row, 13).setValue(notes);
  SpreadsheetApp.flush();
  audit_('ADD_ABS_OUTCOME', {row, ninja, disposition, absCaseId, link});
  clearCache_(currentOperationalShiftDate_(now));
  return {ok:true, row, shiftDate: currentOperationalShiftDate_(now)};
}

function saveClearPathInputs(payload) {
  authorize_();
  if (!payload) throw new Error('Missing ClearPath payload.');
  ensureWebSheets_();
  const shiftDate = normalizeShiftDate_(payload.shiftDate);
  if (!shiftDate) throw new Error('Shift Date is required.');
  const opening = nonNegativeNumber_(payload.openingQueue);
  const closing = nonNegativeNumber_(payload.closingQueue);
  const otherUploads = nonNegativeNumber_(payload.otherUploads);
  const sheet = requireSheet_(HUB.SHEETS.WEB_CONFIG);
  const values = sheet.getDataRange().getValues();
  let row = -1;
  for (let i = 1; i < values.length; i++) {
    if (dateKey_(values[i][0]) === shiftDate) { row = i + 1; break; }
  }
  if (row < 0) row = Math.max(sheet.getLastRow() + 1, 2);
  sheet.getRange(row,1,1,6).setValues([[
    parseDateKey_(shiftDate), opening, closing, otherUploads,
    new Date(), Session.getActiveUser().getEmail() || ''
  ]]);
  audit_('SAVE_CLEARPATH', {shiftDate, opening, closing, otherUploads});
  return buildClearPath_(shiftDate, true);
}

function saveProductivityReason(payload) {
  authorize_();
  if (!payload) throw new Error('Missing reason payload.');
  const shiftDate = normalizeShiftDate_(payload.shiftDate);
  const ninja = canonicalNinja_(payload.ninja);
  const interval = cleanText_(payload.interval);
  const reason = cleanText_(payload.reason);
  if (!shiftDate || !ninja || !interval) throw new Error('Shift Date, Ninja, and interval are required.');
  const sheet = requireSheet_(HUB.SHEETS.REASONS);
  const vals = readRows_(sheet, 5);
  let row = -1;
  for (let i=1;i<vals.length;i++) {
    if (dateKey_(vals[i][0])===shiftDate && canonicalNinja_(vals[i][1])===ninja && cleanText_(vals[i][2])===interval) { row=i+1; break; }
  }
  if (row<0) row=Math.max(sheet.getLastRow()+1,2);
  sheet.getRange(row,1,1,5).setValues([[parseDateKey_(shiftDate),ninja,interval,reason,new Date()]]);
  audit_('SAVE_PRODUCTIVITY_REASON',{shiftDate,ninja,interval,reason});
  return {ok:true};
}

function buildDashboard_(shiftDate) {
  const recon = reconciliationRows_(shiftDate);
  const total = recon.length;
  const completed = recon.filter(r => r.absDisposition === 'Completed').length;
  const escalated = recon.filter(r => r.absDisposition === 'Escalated').length;
  const pending = recon.filter(r => String(r.reconciliationStatus).includes('PENDING')).length;
  const reconciled = completed + escalated;
  const dataQuality = recon.reduce((n,r) => n + (r.qualityIssues.length ? 1 : 0), 0);
  const rate = total ? round2_(reconciled / total * 100) : 0;
  const eodResult = pending === 0 && dataQuality === 0 ? 'PASS' : 'ACTION NEEDED';
  const byNinja = buildShiftOutcomeByNinja_(shiftDate);
  const carryover = buildCarryover_(shiftDate);
  return {
    shiftDate, shiftCoverage: shiftCoverageLabel_(shiftDate),
    totalScraped: total, completed, escalated, pending, dataQuality,
    reconciled, reconciliationRate: rate, eodResult, byNinja, carryover
  };
}

function reconciliationRows_(shiftDate) {
  const cache = CacheService.getScriptCache();
  const cacheKey='recon:'+shiftDate;
  const hit=cache.get(cacheKey); if(hit){try{return JSON.parse(hit);}catch(e){}}
  const sheet = requireSheet_(HUB.SHEETS.RECON);
  const vals = readRows_(sheet, 15);
  const rows = [];
  vals.slice(1).forEach(r => {
    if (!r[0]) return;
    if (dateKey_(r[14]) !== shiftDate) return;
    const disp = cleanText_(r[6]) || 'Pending';
    const reason = cleanText_(r[9]);
    const matchCount = Number(r[10] || 0);
    const issues=[];
    if (disp === 'Completed' && !cleanText_(r[7])) issues.push('MISSING ABS CASE ID');
    if (disp === 'Escalated' && !reason) issues.push('MISSING ESCALATION REASON');
    if (matchCount > 1) issues.push('MULTIPLE ABS UPDATES');
    if (!disp) issues.push('MISSING ABS DISPOSITION');
    rows.push({
      trackerId: cleanText_(r[0]), patientName: cleanText_(r[1]),
      scrapeTimestamp: displayDateTime_(r[2]), scrapeTimestampIso: toIso_(r[2]),
      sourceLink: cleanText_(r[3]), scrapedBy: canonicalNinja_(r[4]) || cleanText_(r[4]),
      uploadStatus: cleanText_(r[5]), absDisposition: disp,
      absCaseId: cleanText_(r[7]), processedBy: canonicalNinja_(r[8]) || cleanText_(r[8]),
      escalationReason: reason, absMatchCount: matchCount,
      reconciliationStatus: cleanText_(r[11]) || (disp==='Pending'?'PENDING / NO ABS UPDATE':'RECONCILED'),
      ageHours: Number(r[12] || 0), eodAction: cleanText_(r[13]), shiftDate,
      qualityIssues: issues
    });
  });
  try{cache.put(cacheKey,JSON.stringify(rows),HUB.CACHE_SECONDS);}catch(e){}
  return rows;
}

function buildShiftOutcomeByNinja_(shiftDate) {
  const intervals = standardIntervals_(shiftDate);
  const start=intervals[0].startIso, end=intervals[intervals.length-1].endIso;
  const out=Object.fromEntries(HUB.NINJAS.map(n=>[n,{ninja:n,completed:0,escalated:0,total:0}]));
  absRows_().forEach(r=>{
    if(!insideIso_(r.timestampIso,start,end))return;
    const n=canonicalNinja_(r.processedBy); if(!out[n])return;
    if(r.disposition==='Completed')out[n].completed++;
    if(r.disposition==='Escalated')out[n].escalated++;
    if(r.disposition==='Completed'||r.disposition==='Escalated')out[n].total++;
  });
  return Object.values(out);
}

function buildCarryover_(shiftDate) {
  const sheet=requireSheet_(HUB.SHEETS.RECON); const vals=readRows_(sheet,15); const out={};
  vals.slice(1).forEach(r=>{
    if(!r[0])return; const d=dateKey_(r[14]); if(!d||d>=shiftDate)return;
    const disp=cleanText_(r[6]); if(disp==='Completed'||disp==='Escalated')return;
    if(!out[d])out[d]={sourceShiftDate:d,pending:0}; out[d].pending++;
  });
  return Object.values(out).sort((a,b)=>b.sourceShiftDate.localeCompare(a.sourceShiftDate)).slice(0,10);
}

function buildClearPath_(shiftDate, skipSeed) {
  ensureWebSheets_();
  const dashboard=buildDashboard_(shiftDate);
  const recon=reconciliationRows_(shiftDate);
  const uploaded=recon.filter(r=>String(r.uploadStatus).toLowerCase()==='uploaded').length;
  let cfg=readClearPathConfig_(shiftDate);
  if(!cfg && !skipSeed) cfg=seedClearPathConfigFromLegacy_(shiftDate);
  cfg=cfg||{openingQueue:0,closingQueue:0,otherUploads:0};
  const totalAvailable=cfg.openingQueue+uploaded+cfg.otherUploads;
  const ninjaCompleted=dashboard.completed, ninjaEscalated=dashboard.escalated;
  const ninjaProcessed=ninjaCompleted+ninjaEscalated;
  const totalProcessedByEveryone=Math.max(totalAvailable-cfg.closingQueue,0);
  const clientOtherProcessed=Math.max(totalProcessedByEveryone-ninjaProcessed,0);
  const totalAccounted=ninjaProcessed+clientOtherProcessed+cfg.closingQueue;
  const difference=round2_(totalAvailable-totalAccounted);
  return {
    shiftDate, openingQueue:cfg.openingQueue, uploaded, otherUploads:cfg.otherUploads,
    totalAvailable, ninjaCompleted, ninjaEscalated, ninjaProcessed,
    closingQueue:cfg.closingQueue, totalProcessedByEveryone, clientOtherProcessed,
    clientOtherShare: totalProcessedByEveryone?round2_(clientOtherProcessed/totalProcessedByEveryone*100):0,
    totalAccounted, difference, status: Math.abs(difference)<0.001?'BALANCED':'CHECK'
  };
}

function readClearPathConfig_(shiftDate){
  const s=requireSheet_(HUB.SHEETS.WEB_CONFIG); const vals=s.getDataRange().getValues();
  for(let i=1;i<vals.length;i++) if(dateKey_(vals[i][0])===shiftDate) return {openingQueue:Number(vals[i][1]||0),closingQueue:Number(vals[i][2]||0),otherUploads:Number(vals[i][3]||0)};
  return null;
}

function seedClearPathConfigFromLegacy_(shiftDate){
  const s=getSheet_(HUB.SHEETS.CLEARPATH); if(!s)return null;
  const legacyDate=dateKey_(s.getRange('B4').getValue()); if(legacyDate!==shiftDate)return null;
  const cfg={openingQueue:Number(s.getRange('B7').getValue()||0),otherUploads:Number(s.getRange('B11').getValue()||0),closingQueue:Number(s.getRange('B16').getValue()||0)};
  try{saveClearPathInputs({...cfg,shiftDate});}catch(e){}
  return cfg;
}

function buildProductivity_(shiftDate){
  const intervals=standardIntervals_(shiftDate); const schedules=readNinjaSchedules_(shiftDate); const cycle=rotationCycle_(shiftDate); const scrapeBlocks=readScrapeBlocks_(shiftDate,cycle); const reasons=loadProductivityReasons_(shiftDate);
  const abs=absRows_(); const rows=[];
  HUB.NINJAS.forEach(ninja=>{
    intervals.forEach(iv=>{
      const sched=schedules[ninja]; let productive=0, breakMin=0, scrapeMin=0, offShift=false;
      if(!sched){offShift=true;}else{
        const overlapShift=overlapMinutes_(iv.startIso,iv.endIso,sched.shiftStartIso,sched.shiftEndIso);
        if(overlapShift<=0){offShift=true;}else{
          breakMin=(sched.breaks||[]).reduce((n,b)=>n+overlapMinutes_(iv.startIso,iv.endIso,b.startIso,b.endIso),0);
          scrapeMin=scrapeBlocks.filter(b=>canonicalNinja_(b.ninja)===ninja).reduce((n,b)=>n+overlapMinutes_(iv.startIso,iv.endIso,b.startIso,b.endIso),0);
          productive=Math.max(overlapShift-breakMin-scrapeMin,0);
        }
      }
      const target=offShift?0:Math.round(HUB.TARGET_PER_HOUR*productive/60);
      let completed=0,escalated=0;
      abs.forEach(r=>{if(canonicalNinja_(r.processedBy)!==ninja||!insideIso_(r.timestampIso,iv.startIso,iv.endIso))return;if(r.disposition==='Completed')completed++;if(r.disposition==='Escalated')escalated++;});
      const actual=completed+escalated;
      let activity='PRODUCTIVITY', status=actual>=target?'MET':'NOT MET', adjust='Full hourly target — no adjustment';
      if(offShift){activity='OFF SHIFT';status='OFF SHIFT';adjust='Off shift — no productivity target';}
      else if(productive===0){
        if(scrapeMin>0 && breakMin===0){activity='NO TARGET - SCRAPING';status=activity;adjust='No target — '+scrapeMin+' min scheduled scraping';}
        else {activity='NO TARGET - BREAK/LUNCH';status=activity;adjust='No target — '+breakMin+' min break/lunch'+(scrapeMin?' + '+scrapeMin+' min scraping':'');}
      } else if(productive<60){activity='PRORATED TARGET';status=actual>=target?'MET':'NOT MET'; const parts=[]; if(breakMin)parts.push(breakMin+' min break/lunch');if(scrapeMin)parts.push(scrapeMin+' min scheduled scraping');adjust='Target reduced from 12 to '+target+' — '+parts.join('; ');}
      const key=reasonKey_(shiftDate,ninja,iv.label);
      rows.push({shiftDate,ninja,interval:iv.label,activity,target,completed,escalated,actual,status,adjustmentReason:adjust,missReason:reasons[key]||'',productiveMinutes:productive,breakMinutes:breakMin,scrapeMinutes:scrapeMin});
    });
  });
  const summary=HUB.NINJAS.map(ninja=>{const x=rows.filter(r=>r.ninja===ninja);const target=x.reduce((n,r)=>n+r.target,0),completed=x.reduce((n,r)=>n+r.completed,0),escalated=x.reduce((n,r)=>n+r.escalated,0),actual=completed+escalated;return{ninja,target,completed,escalated,actual,attainment:target?round2_(actual/target*100):0};});
  return {shiftDate,cycle,cycleLabel:'Cycle '+cycle+' of 5',targetPerHour:HUB.TARGET_PER_HOUR,summary,rows,scrapeBlocks};
}

function readNinjaSchedules_(shiftDate){
  const s=requireSheet_(HUB.SHEETS.PRODUCTIVITY); const vals=s.getRange('K3:O7').getDisplayValues(); const out={};
  vals.forEach(r=>{
    const ninja=canonicalNinja_(r[0]); if(!ninja)return; const shift=parseTimeRangeForShift_(shiftDate,r[1]); if(!shift)return;
    const breaks=[]; [r[2],r[3],r[4]].forEach(x=>{const b=parseTimeRangeForShift_(shiftDate,x);if(b)breaks.push(b);});
    out[ninja]={shiftStartIso:shift.startIso,shiftEndIso:shift.endIso,breaks};
  }); return out;
}

function readScrapeBlocks_(shiftDate,cycle){
  const s=requireSheet_(HUB.SHEETS.PRODUCTIVITY); const vals=s.getRange('Z2:AE75').getDisplayValues(); const base=shiftStart_(shiftDate); const out=[];
  vals.forEach(r=>{if(Number(r[0])!==Number(cycle))return;const startMin=Number(r[1]),endMin=Number(r[2]);const ninja=canonicalNinja_(r[4]);if(!isFinite(startMin)||!isFinite(endMin)||!ninja)return;const a=new Date(base.getTime()+startMin*60000),b=new Date(base.getTime()+endMin*60000);out.push({label:r[3]||timeLabel_(a,b),ninja,startIso:a.toISOString(),endIso:b.toISOString(),startMin,endMin});}); return out;
}

function rotationCycle_(shiftDate){const a=parseDateKey_(HUB.ROTATION_ANCHOR_DATE),d=parseDateKey_(shiftDate);const days=Math.round((stripTime_(d)-stripTime_(a))/86400000);return mod_(HUB.ROTATION_ANCHOR_CYCLE-1+days,5)+1;}

function loadProductivityReasons_(shiftDate){const s=requireSheet_(HUB.SHEETS.REASONS);const vals=readRows_(s,5);const out={};vals.slice(1).forEach(r=>{const d=dateKey_(r[0]);const n=canonicalNinja_(r[1]);const i=cleanText_(r[2]);if(d===shiftDate&&n&&i)out[reasonKey_(d,n,i)]=cleanText_(r[3]);});return out;}
function reasonKey_(d,n,i){return [d,n,i].join('|');}

function buildHourly_(shiftDate){
  const intervals=standardIntervals_(shiftDate);const start=intervals[0].startIso,end=intervals[intervals.length-1].endIso;const scr=scrapeRows_(),abs=absRows_();
  const totals=HUB.NINJAS.map(ninja=>{let scraped=0,completed=0,escalated=0;scr.forEach(r=>{if(canonicalNinja_(r.scrapedBy)===ninja&&insideIso_(r.timestampIso,start,end))scraped++;});abs.forEach(r=>{if(canonicalNinja_(r.processedBy)!==ninja||!insideIso_(r.timestampIso,start,end))return;if(r.disposition==='Completed')completed++;if(r.disposition==='Escalated')escalated++;});return{ninja,scraped,completed,escalated,total:completed+escalated};});
  const detail=intervals.map(iv=>({label:iv.label,startIso:iv.startIso,endIso:iv.endIso,ninjas:HUB.NINJAS.map(ninja=>{let scraped=0,completed=0,escalated=0;scr.forEach(r=>{if(canonicalNinja_(r.scrapedBy)===ninja&&insideIso_(r.timestampIso,iv.startIso,iv.endIso))scraped++;});abs.forEach(r=>{if(canonicalNinja_(r.processedBy)!==ninja||!insideIso_(r.timestampIso,iv.startIso,iv.endIso))return;if(r.disposition==='Completed')completed++;if(r.disposition==='Escalated')escalated++;});return{ninja,scraped,completed,escalated,total:completed+escalated};})}));
  return{shiftDate,totals,intervals:detail};
}

function scrapeRows_(){const cache=CacheService.getScriptCache();const hit=cache.get('scrapeRows');if(hit){try{return JSON.parse(hit);}catch(e){}}const s=requireSheet_(HUB.SHEETS.SCRAPE),v=readRows_(s,18),out=[];v.slice(1).forEach(r=>{if(!r[0])return;out.push({timestampIso:toIso_(r[0]),patientName:cleanText_(r[1]),sourceLink:cleanText_(r[2]),scrapedBy:cleanText_(r[3]),uploadStatus:cleanText_(r[4]),trackerId:cleanText_(r[13]||r[5]),shiftDate:dateKey_(r[17]||r[10])});});try{cache.put('scrapeRows',JSON.stringify(out),HUB.CACHE_SECONDS);}catch(e){}return out;}
function absRows_(){const cache=CacheService.getScriptCache();const hit=cache.get('absRows');if(hit){try{return JSON.parse(hit);}catch(e){}}const s=requireSheet_(HUB.SHEETS.ABS),v=readRows_(s,27),out=[];v.slice(1).forEach(r=>{if(!r[0]&&!r[5]&&!r[6])return;out.push({timestampIso:toIso_(r[0]),patientName:cleanText_(r[1]),pdfLink:cleanText_(r[2]),trackerId:cleanText_(r[4]),processedBy:cleanText_(r[5]),disposition:cleanText_(r[6]),absCaseId:cleanText_(r[7]),escalationReason:cleanText_(r[8]||r[12]),sourceShiftDate:dateKey_(r[14]),operationalShiftDate:dateKey_(r[15]),matchStatus:cleanText_(r[18])});});try{cache.put('absRows',JSON.stringify(out),HUB.CACHE_SECONDS);}catch(e){}return out;}

function standardIntervals_(shiftDate){const base=shiftStart_(shiftDate);const arr=[];for(let i=0;i<11;i++){const a=new Date(base.getTime()+i*3600000),b=new Date(base.getTime()+(i+1)*3600000);arr.push({label:Utilities.formatDate(a,HUB.TZ,'h:mm a')+' - '+Utilities.formatDate(b,HUB.TZ,'h:mm a'),startIso:a.toISOString(),endIso:b.toISOString()});}return arr;}

function ensureWebSheets_(){
  const ss=ss_(); let cfg=getSheet_(HUB.SHEETS.WEB_CONFIG);
  if(!cfg){cfg=ss.insertSheet(HUB.SHEETS.WEB_CONFIG);cfg.getRange(1,1,1,6).setValues([['Shift Date','Opening Queue','Closing Queue','Other Uploads','Updated At','Updated By']]);cfg.setFrozenRows(1);}
  let audit=getSheet_(HUB.SHEETS.WEB_AUDIT);
  if(!audit){audit=ss.insertSheet(HUB.SHEETS.WEB_AUDIT);audit.getRange(1,1,1,5).setValues([['Timestamp','User','Action','Details JSON','Operational Shift Date']]);audit.setFrozenRows(1);}
}

function audit_(action,details){
  try{ensureWebSheets_();const s=requireSheet_(HUB.SHEETS.WEB_AUDIT);s.appendRow([new Date(),Session.getActiveUser().getEmail()||'',action,JSON.stringify(details||{}),currentOperationalShiftDate_()]);}catch(e){}
}

function copyTemplateFormulas_(sheet,templateRow,targetRow,lastCol){
  if(targetRow===templateRow)return;
  sheet.getRange(templateRow,1,1,lastCol).copyTo(sheet.getRange(targetRow,1,1,lastCol),SpreadsheetApp.CopyPasteType.PASTE_FORMULA,false);
  sheet.getRange(templateRow,1,1,lastCol).copyTo(sheet.getRange(targetRow,1,1,lastCol),SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,false);
  sheet.getRange(templateRow,1,1,lastCol).copyTo(sheet.getRange(targetRow,1,1,lastCol),SpreadsheetApp.CopyPasteType.PASTE_FORMAT,false);
}

function firstEmptyInputRow_(sheet,startRow,maxRow){
  const end=Math.min(maxRow,sheet.getMaxRows());
  const vals=sheet.getRange(startRow,1,end-startRow+1,1).getValues();
  for(let i=0;i<vals.length;i++)if(vals[i][0]===''||vals[i][0]==null)return startRow+i;
  sheet.insertRowsAfter(sheet.getMaxRows(),1000);return end+1;
}

function readRows_(sheet,lastCol){
  const rows=sheet.getMaxRows();
  const firstCol=sheet.getRange(1,1,rows,1).getDisplayValues();
  let last=firstCol.length-1;
  while(last>0&&String(firstCol[last][0]||'').trim()==='')last--;
  const height=Math.max(last+1,1);
  return sheet.getRange(1,1,height,lastCol).getValues();
}

function rowObject_(headers,row){const o={};headers.forEach((h,i)=>{if(h)o[h]=serialize_(row[i]);});return o;}
function findHeaderIndex_(headers,names){for(const name of names){const x=headers.findIndex(h=>String(h).trim().toLowerCase()===String(name).trim().toLowerCase());if(x>=0)return x;}return-1;}
function ss_(){const id=PropertiesService.getScriptProperties().getProperty(HUB.PROPERTY_SHEET_ID);if(!id)throw new Error('TRACKER_SPREADSHEET_ID is not configured in Script Properties.');return SpreadsheetApp.openById(id);}
function getSheet_(name){return ss_().getSheetByName(name);}
function requireSheet_(name){const s=getSheet_(name);if(!s)throw new Error('Required sheet not found: '+name);return s;}
function clearCache_(shiftDate){try{const keys=['absRows','scrapeRows'];if(shiftDate)keys.push('recon:'+shiftDate);CacheService.getScriptCache().removeAll(keys);}catch(e){}}

function authorize_(){
  const allowed=PropertiesService.getScriptProperties().getProperty(HUB.PROPERTY_ALLOWED_EMAILS);
  if(!allowed)return true;
  const email=(Session.getActiveUser().getEmail()||'').toLowerCase();
  const list=allowed.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!email||!list.includes(email))throw new Error('You are not authorized to use this Operations Hub.');
  return true;
}

function canonicalNinja_(value){
  const s=String(value||'').trim().toLowerCase();if(!s)return'';
  const aliases={
    'reignaire louise bardiano':'Reignaire Louise Bardiano','rain':'Reignaire Louise Bardiano','rainier':'Reignaire Louise Bardiano',
    'laarnie morales':'Laarnie Morales','laarnie morales justo':'Laarnie Morales','laarni':'Laarnie Morales',
    'norvic carreon':'Norvic Carreon','norvic matias carreon':'Norvic Carreon','norvik':'Norvic Carreon',
    'cathlene may layco':'Cathlene May Layco','cathlene':'Cathlene May Layco','kathleen':'Cathlene May Layco',
    'rosemarie bendita':'Rosemarie Bendita','rosemarie esteban bendita':'Rosemarie Bendita','rosemary':'Rosemarie Bendita'
  };
  if(aliases[s])return aliases[s];
  return HUB.NINJAS.find(n=>n.toLowerCase()===s)||'';
}
function currentOperationalShiftDate_(d){d=d||new Date();const p=new Date(d);const hour=Number(Utilities.formatDate(p,HUB.TZ,'H'));if(hour<21){p.setDate(p.getDate()-1);}return Utilities.formatDate(p,HUB.TZ,'yyyy-MM-dd');}
function normalizeShiftDate_(v){if(!v)return'';if(v instanceof Date&&!isNaN(v))return Utilities.formatDate(v,HUB.TZ,'yyyy-MM-dd');const s=String(v).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const d=new Date(s);return isNaN(d)?'':Utilities.formatDate(d,HUB.TZ,'yyyy-MM-dd');}
function dateKey_(v){if(!v)return'';if(v instanceof Date&&!isNaN(v))return Utilities.formatDate(v,HUB.TZ,'yyyy-MM-dd');const s=String(v).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const d=new Date(s);return isNaN(d)?'':Utilities.formatDate(d,HUB.TZ,'yyyy-MM-dd');}
function parseDateKey_(s){const p=String(s).split('-').map(Number);return new Date(p[0],p[1]-1,p[2],12,0,0);}
function stripTime_(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();}
function shiftStart_(shiftDate){const d=parseDateKey_(shiftDate);d.setHours(21,0,0,0);return d;}
function shiftEnd_(shiftDate){const d=parseDateKey_(shiftDate);d.setDate(d.getDate()+1);d.setHours(8,0,0,0);return d;}
function shiftCoverageLabel_(shiftDate){const a=shiftStart_(shiftDate),b=shiftEnd_(shiftDate);return Utilities.formatDate(a,HUB.TZ,'MMM d, yyyy h:mm a')+' → '+Utilities.formatDate(b,HUB.TZ,'MMM d, yyyy h:mm a');}
function toIso_(v){if(!v)return'';const d=v instanceof Date?v:new Date(v);return isNaN(d)?'':d.toISOString();}
function displayDateTime_(v){if(!v)return'';const d=v instanceof Date?v:new Date(v);return isNaN(d)?String(v):Utilities.formatDate(d,HUB.TZ,'M/d/yyyy h:mm:ss a');}
function cleanText_(v){return v==null?'':String(v).trim();}
function round2_(n){return Math.round((Number(n)||0)*100)/100;}
function mod_(n,m){return((n%m)+m)%m;}
function serialize_(v){if(v instanceof Date)return Utilities.formatDate(v,HUB.TZ,'yyyy-MM-dd HH:mm:ss');return v;}
function nonNegativeNumber_(v){const n=Number(v||0);if(!isFinite(n)||n<0)throw new Error('Queue values must be zero or positive numbers.');return n;}
function insideIso_(iso,startIso,endIso){if(!iso)return false;const t=new Date(iso).getTime();return t>=new Date(startIso).getTime()&&t<new Date(endIso).getTime();}
function overlapMinutes_(aStart,aEnd,bStart,bEnd){if(!aStart||!aEnd||!bStart||!bEnd)return 0;const s=Math.max(new Date(aStart).getTime(),new Date(bStart).getTime()),e=Math.min(new Date(aEnd).getTime(),new Date(bEnd).getTime());return e>s?Math.round((e-s)/60000):0;}

function parseTimeRangeForShift_(shiftDate,text){
  const s=String(text||'').trim();if(!s||!s.includes('–')&&!s.includes('-'))return null;
  const parts=s.split(/\s*[–-]\s*/);if(parts.length<2)return null;
  const start=parseClockOnDate_(shiftDate,parts[0]),end=parseClockOnDate_(shiftDate,parts[1]);if(!start||!end)return null;
  if(end.getTime()<=start.getTime())end.setDate(end.getDate()+1);
  const sh=Number(Utilities.formatDate(start,HUB.TZ,'H'));if(sh<12)start.setDate(start.getDate()+1);
  const eh=Number(Utilities.formatDate(end,HUB.TZ,'H'));if(eh<12&&end.getTime()<=start.getTime())end.setDate(end.getDate()+1);
  return{startIso:start.toISOString(),endIso:end.toISOString()};
}
function parseClockOnDate_(shiftDate,t){const m=String(t||'').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);if(!m)return null;let h=Number(m[1])%12;if(m[3].toUpperCase()==='PM')h+=12;const d=parseDateKey_(shiftDate);d.setHours(h,Number(m[2]),0,0);return d;}
function timeLabel_(a,b){return Utilities.formatDate(a,HUB.TZ,'h:mm a')+' - '+Utilities.formatDate(b,HUB.TZ,'h:mm a');}
