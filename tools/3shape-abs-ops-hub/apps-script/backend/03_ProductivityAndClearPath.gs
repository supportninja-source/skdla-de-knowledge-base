function buildProductivity_(shiftDate) {
  const cycle = cycleForDate_(shiftDate);
  const scrapeBlocks = loadScrapeBlocks_(cycle, shiftDate);
  const schedules = loadNinjaSchedules_(shiftDate);
  const outcomes = absOutcomeRows_().filter(r => r.operationalShiftDate === shiftDate && r.timestamp);
  const reasons = loadProductivityReasons_(shiftDate);
  const intervals = standardIntervals_(shiftDate);
  const rows = [];
  HUB.NINJAS.forEach(ninja => {
    intervals.forEach(intv => {
      const schedule = schedules[ninja];
      const intervalStart = new Date(intv.start), intervalEnd = new Date(intv.end);
      const onShiftMinutes = schedule ? overlapMinutes_(intervalStart, intervalEnd, schedule.shiftStart, schedule.shiftEnd) : 0;
      let activity = 'PRODUCTIVITY';
      let adjustedMinutes = 0;
      let adjustmentParts = [];
      if (onShiftMinutes <= 0) {
        activity = 'OFF SHIFT'; adjustedMinutes = 60; adjustmentParts.push('Off shift');
      } else {
        const breakMinutes = schedule ? schedule.blocks.reduce((sum,b)=>sum+overlapMinutes_(intervalStart, intervalEnd,b.start,b.end),0) : 0;
        const scrapeMinutes = scrapeBlocks.filter(b=>b.ninja===ninja).reduce((sum,b)=>sum+overlapMinutes_(intervalStart, intervalEnd,b.start,b.end),0);
        adjustedMinutes = Math.min(60, (60-onShiftMinutes) + breakMinutes + scrapeMinutes);
        if (adjustedMinutes >= 60) {
          if (breakMinutes >= 60 || ((60-onShiftMinutes)+breakMinutes)>=60) activity='NO TARGET - BREAK/LUNCH';
          else if (scrapeMinutes >= 60) activity='NO TARGET - SCRAPING';
          else activity='NO TARGET';
        } else if (adjustedMinutes > 0) activity='PRORATED TARGET';
        if (breakMinutes) adjustmentParts.push(breakMinutes+' min break/lunch');
        if (scrapeMinutes) adjustmentParts.push(scrapeMinutes+' min scheduled scraping');
        if (60-onShiftMinutes) adjustmentParts.push((60-onShiftMinutes)+' min off shift');
      }
      const productiveMinutes = Math.max(0, 60-adjustedMinutes);
      const target = Math.round(productiveMinutes * HUB.TARGET_PER_HOUR / 60);
      const done = outcomes.filter(r=>r.ninja===ninja && r.disposition==='Completed' && insideIso_(r.timestamp,intv.start,intv.end)).length;
      const esc = outcomes.filter(r=>r.ninja===ninja && r.disposition==='Escalated' && insideIso_(r.timestamp,intv.start,intv.end)).length;
      const actual = done + esc;
      const status = target === 0 ? activity : (actual >= target ? 'MET' : 'NOT MET');
      rows.push({
        ninja, interval:intv.label, activity, target, completed:done, escalated:esc, actual, status,
        missReason: reasons[ninja+'|'+intv.label] || '',
        adjustmentReason: target === 12 ? 'Full hourly target — no adjustment' : (target === 0 ? 'No target — '+(adjustmentParts.join('; ')||activity.toLowerCase()) : 'Target reduced from 12 to '+target+' — '+adjustmentParts.join('; '))
      });
    });
  });
  const summary = HUB.NINJAS.map(ninja => {
    const x = rows.filter(r=>r.ninja===ninja);
    const target = x.reduce((s,r)=>s+r.target,0);
    const actual = x.reduce((s,r)=>s+r.actual,0);
    const completed = x.reduce((s,r)=>s+r.completed,0);
    const escalated = x.reduce((s,r)=>s+r.escalated,0);
    return {ninja,target,actual,completed,escalated,attainment:target?round2_(actual/target*100):0};
  });
  return {shiftDate, cycle, targetPerHour:HUB.TARGET_PER_HOUR, summary, rows, scrapeBlocks: scrapeBlocks.map(b=>({label:b.label,ninja:b.ninja}))};
}

function buildClearPath_(shiftDate) {
  ensureWebSheets_();
  const rec = reconciliationRows_(shiftDate);
  const totalScraped = rec.length;
  const uploaded = rec.filter(r => String(r.uploadStatus).toLowerCase()==='uploaded').length;
  const ninjaCompleted = rec.filter(r=>r.absDisposition==='Completed').length;
  const ninjaEscalated = rec.filter(r=>r.absDisposition==='Escalated').length;
  const ninjaProcessed = ninjaCompleted+ninjaEscalated;
  const inputs = loadClearPathInputs_(shiftDate);
  const opening = inputs.openingQueue;
  const closing = inputs.closingQueue;
  const otherUploads = inputs.otherUploads;
  const totalAvailable = opening + uploaded + otherUploads;
  const totalProcessedEveryone = Math.max(0,totalAvailable-closing);
  const clientOther = Math.max(0,totalProcessedEveryone-ninjaProcessed);
  const accounted = ninjaProcessed+clientOther+closing;
  const difference = totalAvailable-accounted;
  return {
    shiftDate, coverage:shiftCoverageLabel_(shiftDate), openingQueue:opening, closingQueue:closing, otherUploads,
    totalScraped, uploaded, uploadVariance:totalScraped-uploaded,
    totalAvailable, ninjaCompleted, ninjaEscalated, ninjaProcessed,
    totalProcessedEveryone, clientOtherProcessed:clientOther,
    clientOtherShare: totalProcessedEveryone ? round2_(clientOther/totalProcessedEveryone*100) : 0,
    accounted, difference,
    status: difference===0 ? 'BALANCED' : 'CHECK DIFFERENCE'
  };
}

function loadClearPathInputs_(shiftDate) {
  const sheet = requireSheet_(HUB.SHEETS.WEB_CONFIG);
  const values = sheet.getDataRange().getValues();
  for (let i=1;i<values.length;i++) {
    if (dateKey_(values[i][0])===shiftDate) return {openingQueue:Number(values[i][1]||0),closingQueue:Number(values[i][2]||0),otherUploads:Number(values[i][3]||0)};
  }
  const cp = getSheet_(HUB.SHEETS.CLEARPATH);
  if (cp) {
    const selected = dateKey_(cp.getRange('B4').getValue());
    if (selected === shiftDate) {
      const opening = Number(cp.getRange('B7').getValue()||0);
      const other = Number(cp.getRange('B11').getValue()||0);
      const closing = Number(cp.getRange('B16').getValue()||0);
      const row = Math.max(sheet.getLastRow()+1,2);
      sheet.getRange(row,1,1,6).setValues([[parseDateKey_(shiftDate),opening,closing,other,new Date(),'AUTO-SEEDED']]);
      return {openingQueue:opening,closingQueue:closing,otherUploads:other};
    }
  }
  return {openingQueue:0,closingQueue:0,otherUploads:0};
}

function loadScrapeBlocks_(cycle, shiftDate) {
  const sheet = requireSheet_(HUB.SHEETS.PRODUCTIVITY);
  const vals = sheet.getRange('Z2:AE75').getValues();
  const start = shiftStart_(shiftDate);
  const blocks=[];
  vals.forEach(r=>{
    if (Number(r[0])!==Number(cycle)) return;
    const startMin = Number(r[1]), endMin=Number(r[2]);
    const label=cleanText_(r[3]), ninja=canonicalNinja_(r[4]);
    if (!isFinite(startMin)||!isFinite(endMin)||!ninja) return;
    blocks.push({label,ninja,start:new Date(start.getTime()+startMin*60000),end:new Date(start.getTime()+endMin*60000)});
  });
  return blocks;
}

function loadNinjaSchedules_(shiftDate) {
  const sheet = requireSheet_(HUB.SHEETS.PRODUCTIVITY);
  const vals = sheet.getRange('K3:O7').getDisplayValues();
  const map={};
  vals.forEach(r=>{
    const ninja=canonicalNinja_(r[0]); if(!ninja) return;
    const shift=parseTimeRangeForShift_(shiftDate,r[1]);
    const blocks=[];
    [r[2],r[3],r[4]].forEach(text=>{ const b=parseTimeRangeForShift_(shiftDate,text); if(b) blocks.push(b); });
    map[ninja]={shiftStart:shift?shift.start:null,shiftEnd:shift?shift.end:null,blocks:blocks.map(b=>({start:b.start,end:b.end}))};
  });
  return map;
}

function loadProductivityReasons_(shiftDate) {
  const sheet=getSheet_(HUB.SHEETS.REASONS); if(!sheet) return {};
  const values=readRows_(sheet,Math.max(sheet.getLastColumn(),5)); if(!values.length) return {};
  const h=values[0].map(String);
  const d=findHeaderIndex_(h,['Shift Date']); const n=findHeaderIndex_(h,['Ninja']); const i=findHeaderIndex_(h,['Interval']); const r=findHeaderIndex_(h,['Reason','Productivity Miss Reason']);
  if([d,n,i,r].some(x=>x<0)) return {};
  const map={};
  values.slice(1).forEach(row=>{ if(dateKey_(row[d])===shiftDate) map[canonicalNinja_(row[n])+'|'+String(row[i]||'')]=String(row[r]||''); });
  return map;
}

function cycleForDate_(shiftDate) {
  const d=parseDateKey_(shiftDate); const a=parseDateKey_(HUB.ROTATION_ANCHOR_DATE);
  const days=Math.round((stripTime_(d)-stripTime_(a))/86400000);
  return mod_((HUB.ROTATION_ANCHOR_CYCLE-1)+days,5)+1;
}

function standardIntervals_(shiftDate) {
  const start=shiftStart_(shiftDate); const labels=['9:00 PM – 10:00 PM','10:00 PM – 11:00 PM','11:00 PM – 12:00 AM','12:00 AM – 1:00 AM','1:00 AM – 2:00 AM','2:00 AM – 3:00 AM','3:00 AM – 4:00 AM','4:00 AM – 5:00 AM','5:00 AM – 6:00 AM','6:00 AM – 7:00 AM','7:00 AM – 8:00 AM'];
  return labels.map((label,i)=>({label,start:new Date(start.getTime()+i*3600000).toISOString(),end:new Date(start.getTime()+(i+1)*3600000).toISOString()}));
}
