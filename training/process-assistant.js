(function(root){
 const procedural=q=>!/\bdiffer|difference|versus|compare|how long|how many|how much/i.test(q)&&(/\b(how|steps?|procedure|process|workflow)\b|what (?:should|do|can) (?:i|we) do/i.test(q));
 const definition=q=>/stand for|meaning|define|^what (?:is|are)\b/i.test(q)&&!procedural(q);
 function plan(query){
  const parts=query.split(/\?\s*(?=\S)|[;\n]+|\s+and\s+(?=how\b|what\b|should\b|can\b)/i).map(q=>q.trim()).filter(Boolean);
  if(parts.length>1)return parts.slice(0,4);
  if(/\bups\b.*\band\b.*\bfedex\b|\bfedex\b.*\band\b.*\bups\b/i.test(query)&&/label|shipment/i.test(query))
   return [query.replace(/\band\s+fedex\b|\bfedex\s+and\b/ig,''),query.replace(/\bups\s+and\b|\band\s+ups\b/ig,'')];
  return [query];
 }
 function retrieve(query,index,S,scores){
  const parts=plan(query),all=[];
  for(const part of parts){
   const lexical=S.rank(part,index,24), byId=new Map(lexical.map(s=>[s.id,s]));
   const pinned=(root.ProcessAnswers?.pinned(part,index)||[]).filter(s=>S.compatible(part,s)).map(s=>({...s,...byId.get(s.id),pinned:true}));
   const sorted=scores?lexical.map((s,i)=>({...s,hybrid:(1/(i+2))*.7+(scores.get(s.id)||0)*.3})).sort((a,b)=>b.hybrid-a.hybrid):lexical;
   all.push(...pinned,...sorted.slice(0,8));
  }
  return [...new Map(all.map(s=>[s.id,s])).values()].slice(0,16);
 }
 function composeOne(query,sources,S){
  if(!sources.length)return {blocks:[],clarification:'Please name the tool, task, and account type. These recordings do not establish an answer to this question.'};
  if(/mb2|aspen|incisive|clearchoice|carabelli|trri/i.test(query)&&/create|new|onboard|set up|setup/i.test(query)&&/account/i.test(query)&&!/principal|doctor|subaccount|portal|login|ar |pricing/i.test(query))
   return {blocks:[],needsDetails:true,clarification:'Do you need the billing principal, a doctor subaccount, portal access, or AR setup? These are separate workflows. Please specify the account level and whether the location is OC or LA.'};
  if(/\bcancel|cancellation/i.test(query)&&/\balready\b.*\b(entered|fabricated|invoiced)\b|\bafter\b.*\b(entry|fabrication|invoicing)\b/i.test(query))
   return {blocks:[],clarification:'The documented cancellation example applies before entry. These notes do not establish the cancellation, refund, or charge rules for work already entered, fabricated, or invoiced. Confirm this case with your lead.'};
  const reviewed=root.ProcessAnswers?.compose(query,sources);
  if(reviewed)return {...reviewed,procedural:reviewed.blocks.length>1&&!definition(query)};
  const terms=S.tokens(query),source=sources[0];
  const scores=source.passageScores||S.scorePassages(query,source,sources);
  const paragraphs=(source.paragraphs||source.text.split('\n')).map((text,n)=>({text,n,score:scores.find(p=>p.n===n)?.score||0}));
  const isProcess=procedural(query)&&source.kind!=='caption';
  // Procedures preserve the whole section's original order and exceptions.
  // Fact questions select the strongest supporting paragraph, not just the start.
  const chosen=isProcess?paragraphs:paragraphs.filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.n-b.n).slice(0,1);
  const blocks=chosen.map(p=>({text:p.text,source:source.sourceId,quote:p.text}));
  const alternatives=sources.slice(1).filter(s=>s.recordId!==source.recordId&&s.score>=source.score*.9&&!s.intentMatch);
  return {blocks,procedural:isProcess,reviewed:false,topic:source.kind==='caption'?'Original caption excerpt · '+source.title:source.title,
   clarification:alternatives.length?'Other sessions describe related workflows. Confirm the tool, account type, and current approved process before applying these steps.':''};
 }
 function compose(query,sources,S){
  const parts=plan(query);
  const groups=parts.map(part=>{
   const ranked=parts.length===1?sources.filter(s=>S.compatible(part,s)):S.rank(part,sources,sources.length),pinned=(root.ProcessAnswers?.pinned(part,sources)||[]).filter(s=>S.compatible(part,s));
   const ordered=[...new Map([...pinned,...ranked].map(s=>[s.id,s])).values()];
   const result=composeOne(part,ordered,S);
   const used=new Set(result.blocks.map(b=>b.source)),terms=S.tokens(part);
   // Related evidence is separate from the ordered workflow. Similarity does not
   // establish agreement, and historical sessions are never labeled current policy.
   const related=[];
   for(const s of ranked){
    if(used.has(s.sourceId)||!result.blocks.length||s.recordId===ordered[0]?.recordId)continue;
    const best=s.passageScores?.slice().sort((a,b)=>b.score-a.score)[0];
    if(!best||best.coverage<.6||best.matched<Math.min(3,terms.length))continue;
    const words=new Set(S.tokens(best.text));
    if(result.blocks.some(b=>{const old=new Set(S.tokens(b.text));return [...words].filter(w=>old.has(w)).length/Math.max(1,words.size)>.75}))continue;
    related.push({text:best.text,quote:best.text,source:s.sourceId,title:s.title});
    if(related.length===2)break;
   }
   const limits=[];
   for(const source of ordered.filter(s=>used.has(s.sourceId))){
    for(const text of source.uncertainties||[]){
     const words=S.tokens(text);if(terms.filter(t=>words.includes(t)).length>=2&&!limits.some(l=>l.text===text))limits.push({text,source:source.sourceId});
    }
   }
   return {...result,question:part,related,limits:limits.slice(0,2)};
  });
  const blocks=groups.flatMap(g=>g.blocks);
  return {...groups[0],blocks,groups:parts.length>1?groups:null,
   related:groups.flatMap(g=>g.related),limits:groups.flatMap(g=>g.limits)};
 }
 const api={retrieve,compose,procedural,plan};root.ProcessAssistant=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
