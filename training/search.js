(function(root){
 const STOP=new Set('a an the and or but in on at to of for with is are was were be been being i we you they it this that these those do does did how what when where why can could should would please tell me about process procedure steps help need know from my our your case cases already just really very get want trying someone mean means meaning stand stands definition exactly customer patient doing ask question explain also then next first like have has had if so all any based training video recordings wants says said trying situation update someone'.split(' '));
 // Carrier and account names stay distinct. A UPS procedure is not a FedEx procedure.
 const groups=[['rx','prescription'],['ship','shipping','shipment','shipped'],['deliver','delivery','delivered'],['pickup','collect','collection','courier'],['package','parcel','box'],['ticket','tickets','hubspot'],['onboard','onboarding','nce'],['urgent','urgency','emergency','chairtime'],['scan','scans','scanner','stl'],['upload','uploaded','submission'],['hold','held'],['missing','absent','unavailable'],['note','notes','document','documentation'],['doctor','dentist'],['office','practice','clinic'],['duplicate','duplicates'],['followup','callback'],['shade','color','colour'],['cancel','cancellation'],['photo','photos','picture','pictures','image','images'],['notify','notification','notified','inform'],['account','accounts'],['create','creating','creation'],['close','closing','closed'],['identify','identification','verify','verification'],['only','alone','sufficient'],['number','numbers','identifier'],['using','use'],['outside','scope','limits','beyond']];
 const families=['mb2','aspen','incisive','biohorizons','carabelli','clearchoice','trri'];
 function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/clear choice/g,'clearchoice').replace(/follow[ -]up/g,'followup').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
 function tokens(s){return [...new Set(norm(s).split(' ').filter(x=>x.length>1&&!STOP.has(x)))]}
 function forms(t){const set=new Set([t,t.replace(/s$/,'')]);for(const g of groups)if(g.includes(t))g.forEach(x=>set.add(x));return set}
 function compatible(query,section){
  const q=tokens(query), text=norm(section.title+' '+section.text);
  const named=families.filter(f=>q.includes(f));
  if(named.length&&!named.some(f=>text.split(' ').includes(f)))return false;
  if(q.includes('ups')&&!q.includes('fedex')&&/\bfedex\b/.test(norm(section.title))&&!/\bups\b/.test(norm(section.title))&&!(section.kind==='caption'&&/\bups\b/.test(norm(section.text))))return false;
  if(q.includes('fedex')&&!q.includes('ups')&&/\bups\b/.test(norm(section.title))&&!/\bfedex\b/.test(norm(section.title))&&!(section.kind==='caption'&&/\bfedex\b/.test(norm(section.text))))return false;
  return true;
 }
 function makeIndex(records){
  const out=[];
  for(const r of records){if(r.duplicateOf)continue;
   r.sections.forEach((s,i)=>out.push({id:r.id+'-'+(i+1),section:i+1,recordId:r.id,slug:r.slug,title:s.title,recordTitle:r.title,timestamp:s.timestamp,
    text:s.content.join('\n'),paragraphs:s.content.slice(),category:r.category,uncertainties:r.uncertainties,
    aliases:records.filter(a=>a.duplicateOf===r.id).map(a=>({id:a.id,title:a.title,videoUrl:a.videoUrl})),
    words:tokens(s.title+' '+s.content.join(' ')),titleWords:tokens(s.title)}));
  }
  return out;
 }
 const caches=new WeakMap();
 function makeDocumentIndex(documents){
  return documents.flatMap(d=>d.sections.map(s=>({id:d.id+'-'+s.id,kind:'document',section:s.id,recordId:d.id,recordTitle:d.title,title:s.title,
   text:s.content.join('\n'),paragraphs:s.content.slice(),category:d.category,uncertainties:d.uncertainties||[],aliases:[],purpose:s.steps?'procedure':'reference',
   locator:typeof s.page==='number'?(d.format==='PDF'?'PDF page '+s.page+(s.pageEnd!==s.page?'–'+s.pageEnd:''):'Image reference'):String(s.page),
   sourceUrl:d.sourceUrl||d.fileUrl+(d.format==='PDF'&&typeof s.page==='number'?'#page='+s.page:''),revision:d.revision,
   words:tokens(s.title+' '+s.content.join(' ')),titleWords:tokens(s.title)})));
 }
 function stats(index){
  if(caches.has(index))return caches.get(index);
  const df=new Map();let length=0;
  for(const s of index){length+=s.words.length;for(const w of new Set(s.words))df.set(w,(df.get(w)||0)+1)}
  const result={df,avg:length/Math.max(1,index.length)};caches.set(index,result);return result;
 }
 function passageScore(query,text,title,meta,total){
  const terms=tokens(query), words=tokens(text), heading=tokens(title);let score=0,exact=0,matched=0;
  for(const t of terms){let best=0;for(const v of forms(t)){
   const inText=words.includes(v),inTitle=heading.includes(v);
   if(inText||inTitle){const idf=Math.log(1+(total-(meta.df.get(t)||0)+.5)/((meta.df.get(t)||0)+.5));
    const length=1.2*(.25+.75*words.length/Math.max(1,meta.avg));
    best=Math.max(best,idf*(v===t?1:.65)*((inText?2.2/(1+length):0)+(inTitle?1.8:0)));
   }}
   if(best){score+=best;matched++;if(words.includes(t)||heading.includes(t))exact++}
  }
  const phrase=norm(query).replace(/^(how do i|how to|what is|what are|what should i do|can i|should i) /,'');
  if(phrase.length>8&&norm(title).includes(phrase))score+=12;
  return {score,exact,matched,coverage:matched/Math.max(1,terms.length)};
 }
 function rank(query,index,limit=8){
  const terms=tokens(query);if(!terms.length)return [];
  const meta=stats(index),out=[];
  for(const s of index){
   if(!compatible(query,s))continue;
   const passages=(s.paragraphs||s.text.split('\n')).map((text,n)=>({...passageScore(query,text,s.title,meta,index.length),text,n}));
   const best=passages.slice().sort((a,b)=>b.score-a.score)[0];
   if(!best||best.matched<Math.min(2,terms.length)||best.coverage<.35||best.score<2)continue;
   const heading=passageScore(query,s.title,s.title,meta,index.length);
   let score=best.score+heading.score*.35;
   // Specific scenarios retain their corrected/exceptional source preference.
   const nq=norm(query),nt=norm(s.title);let intentMatch=false;
   if(/\bscan(s)?\b/.test(nq)&&/missing|not found|cannot find|sent|not showing/.test(nq)){
    if(/scan access|intake channels|find an upload/.test(nt)){score+=14;intentMatch=true}
    if(/night guard/.test(nt))score-=12;
   }
   if(/account/.test(nq)&&/create|new|enter/.test(nq)&&!/portal|principal|subaccount|mb2|aspen|incisive|biohorizons|dso/.test(nq)&&/private practice account creation|private practice profile|verify that the account/.test(nt)){score+=16;intentMatch=true}
   if(/\bchair\b|chairtime|emergency|urgent/.test(nq)&&!/not urgent|non urgent/.test(nq)&&/urgent chair/.test(nt)){score+=30;intentMatch=true}
   out.push({...s,score,exact:best.exact,coverage:best.coverage,intentMatch,passageScores:passages,bestPassage:best.n});
  }
  return out.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,limit);
 }
 function semanticDocs(index){
  const docs=[];
  for(const s of index)for(const [p,text]of (s.paragraphs||s.text.split('\n')).entries()){
   const words=text.split(/\s+/);
   // Bounded overlapping windows cover EVERY word, including paragraph tails.
   for(let start=0;start<words.length;start+=50){const end=Math.min(start+65,words.length);
    docs.push({id:s.id+'-p'+p+'-w'+start,sectionId:s.id,passage:p,text:s.title.split(/\s+/).slice(0,18).join(' ')+'. '+words.slice(start,end).join(' '),start,end});
    if(end===words.length)break;
   }
  }
  return docs;
 }
 function coverage(index,records){return {recordings:records.length,unique:records.filter(r=>!r.duplicateOf).length,sections:index.length,passages:index.reduce((n,s)=>n+s.paragraphs.length,0)}}
 function scorePassages(query,source,index){const meta=stats(index);return (source.paragraphs||source.text.split('\n')).map((text,n)=>({...passageScore(query,text,source.title,meta,index.length),text,n}));}
 const api={norm,tokens,forms,makeIndex,makeDocumentIndex,rank,compatible,semanticDocs,coverage,scorePassages};root.TrainingSearch=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
