function ensureWebSheets_() {
  const ss=ss_();
  let config=getSheet_(HUB.SHEETS.WEB_CONFIG);
  if(!config){ config=ss.insertSheet(HUB.SHEETS.WEB_CONFIG); config.getRange(1,1,1,6).setValues([['Shift Date','Opening ClearPath Queue','Closing ClearPath Queue','Other / Client Uploads','Updated At','Updated By']]); config.setFrozenRows(1); }
  let audit=getSheet_(HUB.SHEETS.WEB_AUDIT);
  if(!audit){ audit=ss.insertSheet(HUB.SHEETS.WEB_AUDIT); audit.getRange(1,1,1,5).setValues([['Timestamp','User','Action','Details JSON','Operational Shift Date']]); audit.setFrozenRows(1); }
}

function audit_(action,details){
  try{ ensureWebSheets_(); const s=requireSheet_(HUB.SHEETS.WEB_AUDIT); s.appendRow([new Date(),Session.getActiveUser().getEmail()||'',action,JSON.stringify(details||{}),currentOperationalShiftDate_()]); }catch(e){}
}

function firstEmptyInputRow_(sheet,startRow,maxRow){
  const end=Math.min(maxRow,sheet.getMaxRows());
  const vals=sheet.getRange(startRow,1,end-startRow+1,1).getValues();
  for(let i=0;i<vals.length;i++) if(vals[i][0]===''||vals[i][0]==null) return startRow+i;
  sheet.insertRowsAfter(sheet.getMaxRows(),1000); return end+1;
}

function readRows_(sheet,lastCol){
  const rows=sheet.getMaxRows();
  const firstCol=sheet.getRange(1,1,rows,1).getDisplayValues();
  let last=firstCol.length-1;
  while(last>0 && String(firstCol[last][0]||'').trim()==='') last--;
  const height=Math.max(last+1,1);
  return sheet.getRange(1,1,height,lastCol).getValues();
}

function rowObject_(headers,row){ const o={}; headers.forEach((h,i)=>{if(h)o[h]=serialize_(row[i]);}); return o; }
function findHeaderIndex_(headers,names){ for(const name of names){const x=headers.findIndex(h=>String(h).trim().toLowerCase()===String(name).trim().toLowerCase()); if(x>=0)return x;} return -1; }
function ss_(){ const id=PropertiesService.getScriptProperties().getProperty(HUB.PROPERTY_SHEET_ID); if(!id) throw new Error('TRACKER_SPREADSHEET_ID is not configured in Script Properties.'); return SpreadsheetApp.openById(id); }
function getSheet_(name){ return ss_().getSheetByName(name); }
function requireSheet_(name){ const s=getSheet_(name); if(!s) throw new Error('Required sheet not found: '+name); return s; }
function clearCache_(shiftDate){
  try{
    const keys=['absRows','scrapeRows'];
    if(shiftDate) keys.push('recon:'+shiftDate);
    CacheService.getScriptCache().removeAll(keys);
  }catch(e){}
}

function authorize_(){
  const allowed=PropertiesService.getScriptProperties().getProperty(HUB.PROPERTY_ALLOWED_EMAILS);
  if(!allowed) return true;
  const email=(Session.getActiveUser().getEmail()||'').toLowerCase();
  const list=allowed.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!email || !list.includes(email)) throw new Error('You are not authorized to use this Operations Hub.');
  return true;
}

function canonicalNinja_(value){
  const s=String(value||'').trim().toLowerCase(); if(!s)return '';
  const aliases={
    'reignaire louise bardiano':'Reignaire Louise Bardiano','rain':'Reignaire Louise Bardiano','rainier':'Reignaire Louise Bardiano',
    'laarnie morales':'Laarnie Morales','laarnie morales justo':'Laarnie Morales','laarni':'Laarnie Morales',
    'norvic carreon':'Norvic Carreon','norvic matias carreon':'Norvic Carreon','norvik':'Norvic Carreon',
    'cathlene may layco':'Cathlene May Layco','cathlene':'Cathlene May Layco','kathleen':'Cathlene May Layco',
    'rosemarie bendita':'Rosemarie Bendita','rosemarie esteban bendita':'Rosemarie Bendita','rosemary':'Rosemarie Bendita'
  };
  if(aliases[s]) return aliases[s];
  return HUB.NINJAS.find(n=>n.toLowerCase()===s)||'';
}
function currentOperationalShiftDate_(d){ d=d||new Date(); const p=new Date(d); const hour=Number(Utilities.formatDate(p,HUB.TZ,'H')); if(hour<21){p.setDate(p.getDate()-1);} return Utilities.formatDate(p,HUB.TZ,'yyyy-MM-dd'); }
function normalizeShiftDate_(v){ if(!v)return ''; if(v instanceof Date&&!isNaN(v))return Utilities.formatDate(v,HUB.TZ,'yyyy-MM-dd'); const s=String(v).trim(); if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s; const d=new Date(s); return isNaN(d)?'':Utilities.formatDate(d,HUB.TZ,'yyyy-MM-dd'); }
function dateKey_(v){ if(!v)return ''; if(v instanceof Date&&!isNaN(v))return Utilities.formatDate(v,HUB.TZ,'yyyy-MM-dd'); const s=String(v).trim(); if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s; const d=new Date(s); return isNaN(d)?'':Utilities.formatDate(d,HUB.TZ,'yyyy-MM-dd'); }
function parseDateKey_(s){ const p=String(s).split('-').map(Number); return new Date(p[0],p[1]-1,p[2],12,0,0); }
function stripTime_(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(); }
function shiftStart_(shiftDate){ const d=parseDateKey_(shiftDate); d.setHours(21,0,0,0); return d; }
function shiftEnd_(shiftDate){ const d=parseDateKey_(shiftDate); d.setDate(d.getDate()+1); d.setHours(8,0,0,0); return d; }
function shiftCoverageLabel_(shiftDate){ const a=shiftStart_(shiftDate),b=shiftEnd_(shiftDate); return Utilities.formatDate(a,HUB.TZ,'MMM d, yyyy h:mm a')+' → '+Utilities.formatDate(b,HUB.TZ,'MMM d, yyyy h:mm a'); }
function toIso_(v){ if(!v)return ''; const d=v instanceof Date?v:new Date(v); return isNaN(d)?'':d.toISOString(); }
function displayDateTime_(v){ if(!v)return ''; const d=v instanceof Date?v:new Date(v); return isNaN(d)?String(v):Utilities.formatDate(d,HUB.TZ,'M/d/yyyy h:mm:ss a'); }
function cleanText_(v){ return v==null?'':String(v).trim(); }
function round2_(n){ return Math.round((Number(n)||0)*100)/100; }
function mod_(n,m){ return ((n%m)+m)%m; }
function serialize_(v){ if(v instanceof Date)return Utilities.formatDate(v,HUB.TZ,'yyyy-MM-dd HH:mm:ss'); return v; }
function nonNegativeNumber_(v){ const n=Number(v||0); if(!isFinite(n)||n<0) throw new Error('Queue values must be zero or positive numbers.'); return n; }
function insideIso_(iso,startIso,endIso){ if(!iso)return false; const t=new Date(iso).getTime(); return t>=new Date(startIso).getTime()&&t<new Date(endIso).getTime(); }
function overlapMinutes_(aStart,aEnd,bStart,bEnd){ if(!aStart||!aEnd||!bStart||!bEnd)return 0; const s=Math.max(new Date(aStart).getTime(),new Date(bStart).getTime()),e=Math.min(new Date(aEnd).getTime(),new Date(bEnd).getTime()); return e>s?Math.round((e-s)/60000):0; }

function parseTimeRangeForShift_(shiftDate,text){
  const s=String(text||'').trim(); if(!s||!s.includes('–')&&!s.includes('-'))return null;
  const parts=s.split(/\s*[–-]\s*/); if(parts.length<2)return null;
  const base=shiftStart_(shiftDate);
  const start=parseClock_(parts[0],base); let end=parseClock_(parts[1],base);
  if(!start||!end)return null;
  if(end<=start)end=new Date(end.getTime()+86400000);
  if(start.getHours()<12 && base.getHours()>=12) start.setDate(start.getDate()+1);
  if(end.getHours()<12 && base.getHours()>=12 && end<=start) end.setDate(end.getDate()+1);
  if(end<=start) end=new Date(end.getTime()+86400000);
  return {start,end};
}
function parseClock_(text,base){
  const m=String(text).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i); if(!m)return null;
  let h=Number(m[1])%12; const min=Number(m[2]||0); if(m[3].toUpperCase()==='PM')h+=12;
  return new Date(base.getFullYear(),base.getMonth(),base.getDate(),h,min,0,0);
}
