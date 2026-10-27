(function(root){
  const clean=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
  function evidence(question,hits,search){
    const terms=search.tokens(question), budget=5600;
    const selected=hits.slice(0,6).map((h,i)=>{
      const paragraphs=h.text.split('\n').filter(Boolean);
      const scored=paragraphs.map((text,n)=>({text,n,score:terms.reduce((sum,t)=>sum+(search.norm(text).includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score);
      return {...h,sourceId:'S'+(i+1),text:scored.slice(0,2).sort((a,b)=>a.n-b.n).map(x=>x.text).join('\n')};
    });
    let used=0;return selected.filter(h=>{const size=h.text.length+h.title.length+h.recordTitle.length+100;if(used+size>budget)return false;used+=size;return true;}).map((h,i)=>({...h,sourceId:'S'+(i+1)}));
  }
  function validate(reply,sources){
    if(!reply||!Array.isArray(reply.answer)||reply.answer.length>6)throw new Error('Invalid answer structure.');
    const blocks=reply.answer.map(b=>{
      const source=sources.find(s=>s.sourceId===b.source);
      if(!source||typeof b.text!=='string'||!b.text.trim()||b.text.length>1500||typeof b.quote!=='string'||clean(b.quote).length<20||!clean(source.text).includes(clean(b.quote)))throw new Error('An answer reference could not be verified.');
      return {text:b.text.trim(),source:b.source,quote:b.quote.trim()};
    });
    return {blocks,clarification:typeof reply.clarification==='string'?reply.clarification.slice(0,800):''};
  }
  const api={evidence,validate};root.TrainingAnswer=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
