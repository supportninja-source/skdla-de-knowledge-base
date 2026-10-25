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
  clearCache_();
  return buildClearPath_(shiftDate);
}

function saveProductivityReason(payload) {
  authorize_();
  if (!payload) throw new Error('Missing reason payload.');
  ensureWebSheets_();
  const shiftDate = normalizeShiftDate_(payload.shiftDate);
  const ninja = canonicalNinja_(payload.ninja);
  const interval = cleanText_(payload.interval);
  const reason = cleanText_(payload.reason);
  if (!shiftDate || !ninja || !interval) throw new Error('Shift Date, Ninja and interval are required.');

  let sheet = getSheet_(HUB.SHEETS.REASONS);
  if (!sheet) {
    sheet = ss_().insertSheet(HUB.SHEETS.REASONS);
    sheet.getRange(1,1,1,5).setValues([['Shift Date','Ninja','Interval','Reason','Updated At']]);
  }
  const values = readRows_(sheet, Math.max(sheet.getLastColumn(), 5));
  const headers = values.length ? values[0].map(String) : [];
  const dIdx = findHeaderIndex_(headers,['Shift Date']);
  const nIdx = findHeaderIndex_(headers,['Ninja','Processed By Ninja']);
  const iIdx = findHeaderIndex_(headers,['Interval','Hour Interval']);
  const rIdx = findHeaderIndex_(headers,['Reason','Productivity Miss Reason']);
  const uIdx = findHeaderIndex_(headers,['Updated At','Timestamp']);
  if ([dIdx,nIdx,iIdx,rIdx].some(x => x < 0)) throw new Error('Productivity Reason Store columns could not be identified.');
  let targetRow = -1;
  for (let r=1;r<values.length;r++) {
    if (dateKey_(values[r][dIdx]) === shiftDate && String(values[r][nIdx]||'') === ninja && String(values[r][iIdx]||'') === interval) {
      targetRow = r+1; break;
    }
  }
  if (targetRow < 0) targetRow = Math.max(sheet.getLastRow()+1, 2);
  sheet.getRange(targetRow,dIdx+1).setValue(parseDateKey_(shiftDate));
  sheet.getRange(targetRow,nIdx+1).setValue(ninja);
  sheet.getRange(targetRow,iIdx+1).setValue(interval);
  sheet.getRange(targetRow,rIdx+1).setValue(reason);
  if (uIdx >= 0) sheet.getRange(targetRow,uIdx+1).setValue(new Date());
  clearCache_();
  return {ok:true};
}
