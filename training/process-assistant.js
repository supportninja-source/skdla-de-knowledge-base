(function(root){
 const procedural=q=>/\b(how|steps?|procedure|process|workflow)\b|what (?:should|do|can) (?:i|we) do/i.test(q);
 const definition=q=>/stand for|meaning|define|^what (?:is|are)\b/i.test(q)&&!procedural(q);
 function retrieve(query,index,S,scores){
  const pinned=root.ProcessAnswers?.pinned(query,index)||[];
  const merge=hits=>[...new Map([...pinned,...hits].map(s=>[s.id,s])).values()].slice(0,6);
  const lexical=S.rank(query,index,12);if(!scores)return merge(lexical);
  // Similarity alone must not turn an unsupported question into a process answer.
  return merge(lexical.map((s,i)=>({...s,hybrid:(1-i/15)*.65+(scores.get(s.id)||0)*.35})).sort((a,b)=>b.hybrid-a.hybrid));
 }
 function compose(query,sources,S){
  if(!sources.length)return {blocks:[],clarification:'Please name the tool, task, or account type you need help with.'};
  const reviewed=root.ProcessAnswers?.compose(query,sources);
  if(reviewed)return {...reviewed,procedural:reviewed.blocks.length>1&&!definition(query)};
  const terms=S.tokens(query), source=sources[0];
  const paragraphs=source.text.split('\n').filter(p=>p.trim()).map((text,n)=>({text,n,score:terms.reduce((v,t)=>v+(S.norm(text).includes(t)?1:0),0)}));
  const isProcess=procedural(query);
  // Keep one workflow and its original order, including conditions and exceptions.
  const chosen=isProcess?paragraphs:paragraphs.filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.n-b.n).slice(0,2).sort((a,b)=>a.n-b.n);
  const blocks=chosen.map(p=>({text:p.text,source:source.sourceId,quote:p.text}));
  const alternatives=sources.slice(1).filter(s=>s.recordId!==source.recordId&&s.score>=source.score*.9&&!s.intentMatch);
  return {blocks,procedural:isProcess,reviewed:false,topic:source.title,
   clarification:alternatives.length?'This is the closest documented workflow. Which account type and tool are you using? Other sessions may describe a different process.':''};
 }
 const api={retrieve,compose,procedural};root.ProcessAssistant=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
