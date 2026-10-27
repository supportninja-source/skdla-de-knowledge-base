(function(root){
  const STOP=new Set('a an the and or but in on at to of for with is are was were be been being i we you they it this that these those do does did how what when where why can could should would please tell me about process procedure steps help need know from my our your case cases already just really very put get want trying someone mean means meaning stand stands definition exactly customer patient doing ask question explain also then next first would like have has had not if so all any based training video recordings wants says said trying please situation update enough someone'.split(' '));
  const groups=[['rx','prescription'],['shipping','shipment','ship','carrier','delivery','deliver','fedex','ups'],['ticket','tickets','hubspot'],['account','accounts','onboarding','entry','nce'],['urgent','urgency','emergency','chair','chairtime'],['scan','scans','scanner','upload','digital'],['hold','held','missing','incomplete'],['note','notes','document','documentation'],['doctor','dentist','office','practice'],['duplicate','duplicates','existing'],['followup','callback','follow','call'],['shade','color','colour']];
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
  function tokens(s){return [...new Set(norm(s).split(' ').filter(x=>x.length>1&&!STOP.has(x)))]}
  function forms(t){const set=new Set([t,t.replace(/s$/,'')]);for(const g of groups)if(g.includes(t))g.forEach(x=>set.add(x));return set}
  function makeIndex(records){const out=[];for(const r of records){if(r.duplicateOf)continue;r.sections.forEach((s,i)=>out.push({id:r.id+'-'+(i+1),recordId:r.id,slug:r.slug,title:s.title,recordTitle:r.title,timestamp:s.timestamp,text:s.content.join('\n'),category:r.category,uncertainties:r.uncertainties,words:tokens(s.title+' '+s.content.join(' ')),titleWords:tokens(s.title)}))}return out}
  function rank(query,index,limit=5){const ts=tokens(query);if(!ts.length)return [];const total=index.length;const scored=index.map(c=>{let score=0,exact=0,intentMatch=false;for(const t of ts){const f=forms(t);let match=0;for(const v of f){if(c.words.includes(v))match=Math.max(match,v===t?1:.5);if(c.titleWords.includes(v))match=Math.max(match,v===t?2.8:1.2)}if(match){const df=index.filter(x=>x.words.includes(t)).length;score+=match*(1+Math.log(1+(total+1)/(df+1)));if(c.words.includes(t))exact++}}const nq=norm(query),nt=norm(c.title);
if(/\b(scan|scans)\b/.test(nq)&&/missing|not found|cannot find|sent|not showing/.test(nq)){if(/scan.*access|intake channels|find an upload/.test(nt))score+=18;if(/night guard/.test(nt))score-=12;}
if(/account/.test(nq)&&/create|new|enter/.test(nq)&&!/portal|principal|subaccount/.test(nq)){if(/private practice account creation|private practice profile|verify that the account/.test(nt))score+=22;if(/portal login|portal account/.test(nt))score-=8;}
if(/\bchair\b|chairtime|chair time|emergency|urgent/.test(nq)){
 if(/urgent chair/.test(nt)){score+=55;intentMatch=true;}
 else if(/focus ownership|local driver delivery|late and at risk/.test(nt)){score+=28;intentMatch=true;}
}
if(/\bscan(s)?\b/.test(nq)&&/missing|not found|cannot find|sent|not showing/.test(nq)){
 if(/scan access/.test(nt)){score+=35;intentMatch=true;}
 if(/intake channels/.test(nt))score+=28;
}
const coverage=exact/ts.length;return {...c,score,coverage,exact,intentMatch}}).filter(x=>(x.intentMatch&&x.exact>=1)||(x.exact>=Math.min(2,ts.length)&&x.coverage>=Math.min(.4,2/ts.length)&&x.score>=3)).sort((a,b)=>b.score-a.score);return scored.slice(0,limit)}
  const api={norm,tokens,makeIndex,rank};root.TrainingSearch=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
