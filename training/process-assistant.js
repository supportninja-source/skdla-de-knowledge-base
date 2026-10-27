(function(root){
 function retrieve(query,index,S,scores){
  const pinned=root.ProcessAnswers?.pinned(query,index)||[];const merge=hits=>[...new Map([...pinned,...hits].map(s=>[s.id,s])).values()].slice(0,6);const lexical=S.rank(query,index,12);if(!scores)return merge(lexical);
  const lex=new Map(lexical.map((s,i)=>[s.id,{...s,priority:1-i/15}]));
  return merge(index.map(s=>{const l=lex.get(s.id),similarity=scores.get(s.id)||0;return {...s,...l,similarity,hybrid:(l?.priority||0)*.55+similarity*.45+(l?.intentMatch?.35:0)};}).filter(s=>lex.has(s.id)||s.similarity>=.43).sort((a,b)=>b.hybrid-a.hybrid).slice(0,6));
 }
 function compose(query,sources,S){
  if(!sources.length)return {blocks:[],clarification:''};const reviewed=root.ProcessAnswers?.compose(query,sources);if(reviewed)return reviewed;
  const terms=S.tokens(query), definition=/stand for|meaning|define/i.test(query)||/^what (?:is|are) (?:a |an )?(?:dso|abs|nce|focus)\b/i.test(query);
  const blocks=[],seen=[];
  for(let i=0;i<Math.min(3,sources.length);i++){
   const source=sources[i];
   const ps=source.text.split('\n').filter(p=>p.length>=20&&p.length<=1500).map((text,n)=>({text,n,score:terms.reduce((v,t)=>v+(S.norm(text).includes(t)?1:0),0)}));
   const chosen=i===0&&!definition?ps.slice(0,4):ps.sort((a,b)=>b.score-a.score).slice(0,i===0?1:1);
   for(const p of chosen){const words=new Set(S.tokens(p.text));if(seen.some(old=>[...words].filter(w=>old.has(w)).length/Math.max(words.size,old.size)>.72))continue;
    if(i>0&&p.score===0)continue;blocks.push({text:p.text,source:source.sourceId,quote:p.text});seen.push(words);if(blocks.length===6)break;}
   if(definition&&blocks.length)break;if(blocks.length===6)break;
  }
  return {blocks,clarification:/incisive/i.test(query)&&/portal/i.test(query)?'The recordings describe different account and portal workflows. Confirm which approved Incisive workflow applies before creating a portal account.':''};
 }
 const api={retrieve,compose};root.ProcessAssistant=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
