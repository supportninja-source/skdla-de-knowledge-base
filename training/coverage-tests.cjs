const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.window=global;require('./data.js');
const S=require('./search.js'),C=require('./caption-search.js'),A=require('./answer-core.js');require('./process-answers.js');const P=require('./process-assistant.js');
const index=S.makeIndex(TRAINING_DATA),audit=require('./caption-audit.json');
assert.deepEqual(S.coverage(index,TRAINING_DATA),{recordings:13,unique:11,sections:150,passages:538});
const docs=S.semanticDocs(index);let checked=0;
for(const section of index)for(const [p,text]of section.paragraphs.entries()){
 const words=text.split(/\s+/),covered=new Set();
 for(const doc of docs.filter(d=>d.sectionId===section.id&&d.passage===p)){
  assert(doc.end-doc.start<=65);assert(doc.text.endsWith(words.slice(doc.start,doc.end).join(' ')));
  for(let n=doc.start;n<doc.end;n++)covered.add(n);
 }
 assert.equal(covered.size,words.length,section.id+' paragraph '+p);checked++;
}
function answer(q,ix=index){const sources=A.evidence(q,P.retrieve(q,ix,S),S),result=P.compose(q,sources,S);A.validate({answer:[...result.blocks,...result.related]},sources);return {result,sources};}
const fixtures=[
 ['Can I identify a case using only the PAN number?','R01-8',/not sufficient/],
 ['Does the invoice month change the correction path?','R02-9',/invoice|invoiced/i],
 ['How long should the UPS pickup window be?','R09-3',/three.hour/],
 ['Can I promise that a digital design is still available?','R05-5',/confirm|check|available/i],
 ['How do private-practice and DSO email preferences differ?','R07-7',/DSO email options differ/],
 ['Does a Technical Support note automatically notify production?','R07-6',/does not notify/],
 ['Should I handle a technical incident outside my scope?','R08-8',/trained scope|technical assistance/],
 ['Where do I send a saved UPS label and log the pickup?','R09-4',/spreadsheet/],
 ['Are OC and LA AR settings handled separately?','R10-15',/location-specific|separately/i],
 ['Can I change the primary email after portal creation?','R11-8',/cannot|instructs|change/i],
 ['Should photos for an already shipped case stay pending?','R13-4',/pending/]
];
for(const [q,id,text]of fixtures){const {result,sources}=answer(q);assert(result.blocks.some(b=>sources.find(s=>s.sourceId===b.source).id===id&&text.test(b.text)),q);}
const qualified=answer('How do I create a new MB2 account?').result;assert(qualified.needsDetails);assert.equal(qualified.blocks.length,0);assert.match(qualified.clarification,/principal.*subaccount/);
const cancel=answer('How do I cancel a case after invoicing?').result;assert.equal(cancel.blocks.length,0);assert.match(cancel.clarification,/before entry/);
const multi=answer('How do I create UPS and FedEx labels?').result;assert.equal(multi.groups.length,2);assert(multi.groups.every(g=>g.blocks.length&&g.procedural));
const topics=new Set(index.map(s=>s.recordId));assert.equal(topics.size,11);for(const r of TRAINING_DATA.filter(r=>r.duplicateOf))assert(index.some(s=>s.aliases.some(a=>a.id===r.id)));
const bundlePath=process.argv[2];
if(bundlePath){
 const bundle=JSON.parse(fs.readFileSync(bundlePath,'utf8')),captions=C.makeIndex(bundle.files,TRAINING_DATA,S);
 assert.equal(captions.loaded.length,13);assert.equal(captions.unique,11);
 for(const record of audit.recordings.filter(r=>!r.duplicate_of)){
  const chunks=captions.index.filter(c=>c.recordId===record.id),covered=new Set();
  for(const chunk of chunks)for(let n=chunk.cueStart;n<chunk.cueEnd;n++)covered.add(n);
  assert.equal(covered.size,record.caption_cues,record.id+' original cues');
  assert(chunks.every(c=>c.text.length<=1500),record.id+' answer quote length');
 }
 assert.throws(()=>C.makeIndex([{filename:'unknown.vtt',content:'x'}],TRAINING_DATA,S));
 const special={filename:TRAINING_DATA[0].filename,content:'WEBVTT\n\n00:30:00.000 --> 00:30:10.000\nThe violet zebra protocol requires two checks before proceeding.\n'};
 const privateIndex=[...index,...C.makeIndex([special],TRAINING_DATA,S).index];
 const specific=answer('What does the violet zebra protocol require?',privateIndex);assert(specific.result.blocks.some(b=>/violet zebra/.test(b.text)));
 console.log('Full original caption coverage verified: 13 labels, 11 unique transcripts, every cue indexed; private-only wording is retrievable.');
}
console.log('Passed: all '+checked+' note passages and '+docs.length+' semantic windows, cross-recording questions, account qualification, cancellation limits, and multiple questions.');
