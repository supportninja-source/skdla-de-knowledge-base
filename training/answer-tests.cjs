const assert=require('node:assert/strict');
global.window=global;
require('./data.js');
const S=require('./search.js');
const A=require('./answer-core.js');
require('./process-answers.js');
const P=require('./process-assistant.js');
const index=S.makeIndex(TRAINING_DATA);
function answer(q,scores){const hits=P.retrieve(q,index,S,scores);const sources=A.evidence(q,hits,S);const result=P.compose(q,sources,S);if(result.blocks.length)A.validate({answer:result.blocks},sources);return result;}
const scenarios=[
 ['How do I handle a patient already in the chair?','R03-6',true],
 ['How do I create a new account in ABS?','R07-7',true],
 ['How do I respond to a HubSpot ticket?','R09-13',true],
 ['What should I do if a scan is missing?','R01-3',true],
 ['What does FOCUS stand for?','R01-2',false],
 ['What is a DSO?','R01-3',false],
 ['How do I handle photos for a held case?','R13-10',true],
 ['How do I handle photos when there is no active case?','R13-4',true],
 ['How do I cancel an intake before entry?','R13-8',true],
 ['How do I handle duplicate HubSpot tickets?','R13-6',true],
 ['How do I process a new upload for entry?','R13-5',true],
 ['How do I handle a missing night guard?','R13-7',true],
 ['How do I handle a late case without tracking?','R13-9',true],
 ['How do I create a FedEx label?','R03-8',true],
 ['How do I create a UPS label?','R09-2',true],
 ['How do I make a warm transfer?','R13-1',false],
 ['Should I create a new Incisive portal login?','R10-14',true],
 ['Is a Technical Support note enough to notify production?','R07-6',true]
];
for(const [q,id,steps]of scenarios){const r=answer(q);assert(r.blocks.length,q);assert.equal(r.procedural,steps,q);const sources=A.evidence(q,P.retrieve(q,index,S),S);assert.equal(sources.find(s=>s.sourceId===r.blocks[0].source).id,id,q);}
for(const q of ['Who won the world cup?','What is bitcoin?','zzzzzz qqqqqq']){assert.equal(answer(q).blocks.length,0,q);assert.equal(answer(q,new Map(index.map(s=>[s.id,.99]))).blocks.length,0,q+' semantic');}
const fallback=answer('How do I schedule a local driver pickup?');assert(fallback.procedural);assert(fallback.blocks.length>1);assert.equal(new Set(fallback.blocks.map(b=>b.source)).size,1);
const cancel=answer('How do I cancel an intake before entry?');assert.match(cancel.clarification,/already been entered/);
assert.throws(()=>A.validate({answer:[{text:'Unsupported',source:'S999',quote:'made up supporting quote'}]},[]));
console.log('Passed: 18 workflows, 6 unsupported-query checks, ordered fallback, scope clarification, and citation validation.');
