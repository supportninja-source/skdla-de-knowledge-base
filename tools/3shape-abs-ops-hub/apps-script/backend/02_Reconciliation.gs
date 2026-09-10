function buildDashboard_(shiftDate) {
  const key = normalizeShiftDate_(shiftDate);
  const rec = reconciliationRows_(key);
  let completed = 0, escalated = 0, pending = 0;
  rec.forEach(r => {
    if (r.absDisposition === 'Completed') completed++;
    else if (r.absDisposition === 'Escalated') escalated++;
    else pending++;
  });
  const total = rec.length;
  const reconciled = completed + escalated;
  const issues = rec.reduce((n,r) => n + (r.qualityIssues.length ? 1 : 0), 0);
  const ninjaTotals = buildNinjaOutcomeTotals_(key);
  const oldCarryover = buildCarryover_(key);
  return {
    shiftDate:key,
    coverage:shiftCoverageLabel_(key),
    totalScraped:total,
    completed,
    escalated,
    pending,
    reconciled,
    reconciliationRate: total ? round2_(reconciled/total*100) : 0,
    dataQualityIssues:issues,
    eodResult: (pending === 0 && issues === 0) ? 'PASS' : 'ACTION NEEDED',
    ninjaTotals,
    carryover: oldCarryover,
    recent: rec.slice().sort((a,b)=>String(b.scrapeTimestamp).localeCompare(String(a.scrapeTimestamp))).slice(0,10)
  };
}

function reconciliationRows_(shiftDate) {
  const cache = CacheService.getScriptCache();
  const cKey = 'recon:'+shiftDate;
  const cached = cache.get(cKey);
  if (cached) return JSON.parse(cached);
  const sheet = requireSheet_(HUB.SHEETS.RECON);
  const rows = readRows_(sheet, 15);
  const out = [];
  rows.slice(1).forEach(r => {
    if (!r[0]) return;
    const d = dateKey_(r[14]);
    if (d !== shiftDate) return;
    const disp = cleanText_(r[6]) || 'Pending';
    const reason = cleanText_(r[9]);
    const matchCount = Number(r[10] || 0);
    const status = cleanText_(r[11]);
    const issues = [];
    if (disp === 'Completed' && !cleanText_(r[7])) issues.push('MISSING ABS CASE ID');
    if (disp === 'Escalated' && !reason) issues.push('MISSING ESCALATION REASON');
    if (matchCount > 1) issues.push('MULTIPLE ABS UPDATES');
    if (!disp) issues.push('MISSING ABS DISPOSITION');
    out.push({
      trackerId: cleanText_(r[0]), patientName: cleanText_(r[1]),
      scrapeTimestamp: displayDateTime_(r[2]), sourceLink: cleanText_(r[3]),
      scrapedBy: cleanText_(r[4]), uploadStatus: cleanText_(r[5]),
      absDisposition: disp, absCaseId: cleanText_(r[7]), processedBy: cleanText_(r[8]),
      escalationReason: reason, absMatchCount: matchCount,
      reconciliationStatus: status, ageHours: Number(r[12] || 0),
      eodAction: cleanText_(r[13]), shiftDate:d, qualityIssues:issues
    });
  });
  try { cache.put(cKey, JSON.stringify(out), HUB.CACHE_SECONDS); } catch(e) {}
  return out;
}

function buildNinjaOutcomeTotals_(shiftDate) {
  const data = absOutcomeRows_().filter(r => r.operationalShiftDate === shiftDate);
  const map = {};
  HUB.NINJAS.forEach(n => map[n] = {ninja:n, completed:0, escalated:0, total:0});
  data.forEach(r => {
    if (!map[r.ninja]) return;
    if (r.disposition === 'Completed') map[r.ninja].completed++;
    if (r.disposition === 'Escalated') map[r.ninja].escalated++;
    if (['Completed','Escalated'].includes(r.disposition)) map[r.ninja].total++;
  });
  return HUB.NINJAS.map(n=>map[n]);
}

function buildCarryover_(selectedShift) {
  const sheet = requireSheet_(HUB.SHEETS.RECON);
  const rows = readRows_(sheet, 15).slice(1);
  const map = {};
  rows.forEach(r => {
    if (!r[0]) return;
    const source = dateKey_(r[14]);
    if (!source || source >= selectedShift) return;
    const disp = cleanText_(r[6]);
    if (disp === 'Completed' || disp === 'Escalated') return;
    if (!map[source]) map[source] = {sourceShiftDate:source, pending:0};
    map[source].pending++;
  });
  return Object.values(map).sort((a,b)=>b.sourceShiftDate.localeCompare(a.sourceShiftDate)).slice(0,14);
}

function absOutcomeRows_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('absRows');
  if (cached) return JSON.parse(cached);
  const sheet = requireSheet_(HUB.SHEETS.ABS);
  const rows = readRows_(sheet, 27);
  const out = [];
  rows.slice(1).forEach(r => {
    const ninja = canonicalNinja_(r[5]);
    const disp = cleanText_(r[6]);
    if (!ninja || !disp) return;
    out.push({
      timestamp: toIso_(r[0]),
      patientName: cleanText_(r[1]) || cleanText_(r[23]),
      pdfLink: cleanText_(r[2]), trackerId: cleanText_(r[4]), ninja,
      disposition: disp, absCaseId: cleanText_(r[7]), escalationReason: cleanText_(r[8]) || cleanText_(r[12]),
      sourceScrapeShiftDate: dateKey_(r[14]), operationalShiftDate: dateKey_(r[15]),
      trackerMatchStatus: cleanText_(r[18]), calloutType: cleanText_(r[19]), calloutReason: cleanText_(r[20])
    });
  });
  try { cache.put('absRows', JSON.stringify(out), HUB.CACHE_SECONDS); } catch(e) {}
  return out;
}

function buildHourly_(shiftDate) {
  const outcomes = absOutcomeRows_().filter(r => r.operationalShiftDate === shiftDate && r.timestamp);
  const scrapes = scrapeRows_().filter(r => r.shiftDate === shiftDate && r.timestamp);
  const intervals = standardIntervals_(shiftDate);
  const byNinja = {};
  HUB.NINJAS.forEach(n => byNinja[n] = {ninja:n, scraped:0, completed:0, escalated:0, total:0});
  scrapes.forEach(r=> { if(byNinja[r.scrapedBy]) byNinja[r.scrapedBy].scraped++; });
  outcomes.forEach(r=> {
    if (!byNinja[r.ninja]) return;
    if (r.disposition === 'Completed') byNinja[r.ninja].completed++;
    if (r.disposition === 'Escalated') byNinja[r.ninja].escalated++;
    if (['Completed','Escalated'].includes(r.disposition)) byNinja[r.ninja].total++;
  });
  const intervalRows = intervals.map(intv => {
    const ninjas = HUB.NINJAS.map(n => {
      const s = scrapes.filter(r=>r.scrapedBy===n && insideIso_(r.timestamp,intv.start,intv.end)).length;
      const done = outcomes.filter(r=>r.ninja===n && r.disposition==='Completed' && insideIso_(r.timestamp,intv.start,intv.end)).length;
      const esc = outcomes.filter(r=>r.ninja===n && r.disposition==='Escalated' && insideIso_(r.timestamp,intv.start,intv.end)).length;
      return {ninja:n, scraped:s, completed:done, escalated:esc, total:done+esc};
    });
    return {label:intv.label, start:intv.start, end:intv.end, ninjas};
  });
  return {shiftDate, totals:HUB.NINJAS.map(n=>byNinja[n]), intervals:intervalRows};
}

function scrapeRows_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('scrapeRows');
  if (cached) return JSON.parse(cached);
  const sheet = requireSheet_(HUB.SHEETS.SCRAPE);
  const rows = readRows_(sheet, 18);
  const out = [];
  rows.slice(1).forEach(r => {
    if (!r[0] && !r[1] && !r[2]) return;
    out.push({
      timestamp: toIso_(r[0]), patientName: cleanText_(r[1]), sourceLink: cleanText_(r[2]),
      scrapedBy: canonicalNinja_(r[3]) || cleanText_(r[3]), uploadStatus: cleanText_(r[4]),
      trackerId: cleanText_(r[13]) || cleanText_(r[5]), shiftDate: dateKey_(r[17]) || dateKey_(r[10])
    });
  });
  try { cache.put('scrapeRows', JSON.stringify(out), HUB.CACHE_SECONDS); } catch(e) {}
  return out;
}
