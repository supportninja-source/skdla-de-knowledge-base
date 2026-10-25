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
