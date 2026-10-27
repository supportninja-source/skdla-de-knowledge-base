const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
global.window=global;require('./data.js');require('./resources.js');
const S=require('./search.js'),A=require('./answer-core.js');require('./process-answers.js');require('./document-answers.js');const P=require('./process-assistant.js');
const docIndex=S.makeDocumentIndex([...CSR_RESOURCES,...CSR_REFERENCE_GUIDES]),index=[...S.makeIndex(TRAINING_DATA),...docIndex];
assert.equal(CSR_RESOURCES.length,15);assert.equal(CSR_REFERENCE_GUIDES.length,2);assert.equal(docIndex.length,84);
for(const d of CSR_RESOURCES){assert(fs.existsSync(path.join(__dirname,d.fileUrl)),d.fileUrl);assert(d.sections.length,d.title);for(const s of d.sections){assert(s.content.length);if(s.image)assert(fs.existsSync(path.join(__dirname,s.image)));}}
assert.equal(new Set(CSR_RESOURCES.map(d=>d.filename)).size,15);
function answer(q){const sources=A.evidence(q,P.retrieve(q,index,S),S),result=P.compose(q,sources,S);A.validate({answer:[...result.blocks,...result.related]},sources);return {result,sources};}
const fixtures=[
 ['How do I log a case-specific complaint in ABS?','D15-case',/Save Note/],
 ['How do I log an account-specific complaint in CRM?','D15-account',/Account Activity/],
 ['How do I record positive feedback in ABS?','D13-case',/Positive Feedback/],
 ['How do I record account-specific positive feedback?','D13-account',/Account Activity/],
 ['How do I create a FedEx label?','D10-label',/3.hour/],
 ['How do I create a UPS label?','D12-label',/Create a Shipment/],
 ['How do I schedule UPS pickup only when the office already has a label?','D12-pickup',/unnecessary second label/],
 ['What should the UPS label email subject be?','D12-email',/UPS Label for Pickup/],
 ['What does a black PAN mean?','D09-black',/Implants/],
 ['What color PAN is used for implants?','D09-black',/BLK123/],
 ['What does a beige PAN mean?','D09-beige',/BG123/],
 ['What is tooth number 8?','D07-ur',/upper right central incisor/],
 ['What is tooth number 24?','D07-ll',/lower left central incisor/],
 ['What is tooth number 32?','D07-lr',/lower right third molar/],
 ['What are the VITA shade-code families?','G01-families',/A3.5/],
 ['What is a full arch model?','G02-models',/one complete upper or lower/],
 ['What is the difference between a crown and bridge?','G02-restorations',/bridge replaces/],
 ['Who receives positive feedback for Los Angeles?','D01-la',/Sierra Riter/],
 ['Who is the shipping backup?','D01-shipping',/Ubaldo/],
 ['How long can I leave a caller on hold?','D06-hold',/2 minutes/],
 ['How quickly should I respond to an email?','D06-email',/2 hours/],
 ['What do I do with voicemails at the end of the day?','D06-voicemail',/screenshot/],
 ['How many incoming calls per day are expected?','D06-calls',/35/],
 ['How many Google reviews are expected per month?','D06-reviews',/one five.star/],
 ['What fields are required in every call note?','D03-required',/subject/],
 ['What should I do for a late case?','D05-late',/30 minutes/],
 ['What information should I collect for a rush inquiry?','D05-rush',/preferred lab/],
 ['What are the call audit rating parameters?','D14-rating',/5 Excellent/]
];
for(const [q,id,pattern]of fixtures){const {result,sources}=answer(q);assert(result.blocks.some(b=>sources.find(s=>s.sourceId===b.source)?.id===id&&pattern.test(b.text)),q+' -> '+JSON.stringify(result));}
for(const q of ['What is tooth number 99?','What is tooth 11 in FDI notation?']){const r=answer(q).result;assert(r.needsDetails&&r.blocks.length===0);}
assert.match(answer('How do I record positive feedback in ABS?').result.clarification,/Quality.*Positive Feedback/);
const multi=answer('How do I create UPS and FedEx labels?').result;assert.equal(multi.groups.length,2);assert(multi.groups.every(g=>g.blocks.length&&g.procedural));
const urgent=answer('How do I handle a patient already in the chair?');assert(urgent.result.blocks.some(b=>/immediately/.test(b.text)));
const technical=answer('Is a Technical Support note enough to notify production?');assert(technical.result.blocks.some(b=>/does not notify/.test(b.text)));
for(const q of ['Who won the world cup?','What is bitcoin?'])assert.equal(answer(q).result.blocks.length,0,q);
console.log('Passed: 15 source files, 84 reference sections, 28 CSR questions, tooth-notation safeguards, source conflicts, both carriers, urgent escalation, and technical notification.');
