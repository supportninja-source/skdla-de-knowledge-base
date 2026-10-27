(function(root){
 const seconds=t=>String(t).replace(',', '.').split(':').reduce((n,x)=>n*60+Number(x),0);
 function parse(content){
  const cues=[];
  for(const block of String(content).replace(/\r/g,'').split(/\n\s*\n/)){
   const lines=block.trim().split('\n'),n=lines.findIndex(l=>/\d{2}:\d{2}.*-->/.test(l));if(n<0)continue;
   const times=lines[n].split('-->').map(s=>s.trim().split(/\s/)[0]);
   const text=lines.slice(n+1).join(' ').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
   if(text)cues.push({start:times[0],end:times[1],text});
  }
  return cues;
 }
 function makeIndex(files,records,S){
  const out=[],seen=new Set(),loaded=[];
  for(const file of files){
   const label=records.find(r=>r.filename===file.filename);if(!label)throw new Error('A caption filename does not match the training inventory.');
   loaded.push(label.id);const r=records.find(r=>r.id===(label.duplicateOf||label.id));if(seen.has(r.id))continue;seen.add(r.id);
   const cues=parse(file.content);if(!cues.length)throw new Error('No caption cues found in '+file.filename);
   for(let i=0;i<cues.length;){
    const batch=[];let words=0,j=i;
    while(j<cues.length&&(words<100||!batch.length)){batch.push(cues[j]);words+=cues[j].text.split(/\s+/).length;j++;}
    const time=seconds(batch[0].start);let section=0;
    for(let n=0;n<r.sections.length;n++)if(seconds(r.sections[n].timestamp)<=time)section=n+1;
    const title=section?r.sections[section-1].title:'Recording introduction';
    const text=batch.map(c=>c.text).join(' ');
    out.push({id:r.id+'-caption-'+i,kind:'caption',section,recordId:r.id,recordTitle:r.title,slug:r.slug,title,
     timestamp:batch[0].start.split(/[.,]/)[0],endTimestamp:batch.at(-1).end,paragraphs:[text],text,
     cueStart:i,cueEnd:j,captionCueCount:cues.length,category:r.category,uncertainties:r.uncertainties,
     aliases:records.filter(a=>a.duplicateOf===r.id).map(a=>({id:a.id,title:a.title,videoUrl:a.videoUrl})),
     words:S.tokens(title+' '+text),titleWords:S.tokens(title)});
    // One-cue overlap keeps answers that span a window boundary searchable.
    i=j<cues.length&&j-i>1?j-1:j;
   }
  }
  return {index:out,loaded:[...new Set(loaded)],unique:seen.size};
 }
 const api={parse,makeIndex};root.CaptionSearch=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
