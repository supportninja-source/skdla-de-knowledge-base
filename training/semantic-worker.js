let extractor,docs=[],vectors=[],pending='',cacheKey='',privateMode=false;
async function cache(mode,key,value){
 try{return await new Promise((resolve,reject)=>{const request=indexedDB.open('training-search-v7',1);request.onupgradeneeded=()=>request.result.createObjectStore('vectors');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('vectors',mode),store=tx.objectStore('vectors');if(mode==='readwrite'){store.clear();store.put(value,key);tx.oncomplete=()=>{db.close();resolve(value)}}else{const get=store.get(key);get.onsuccess=()=>{db.close();resolve(get.result)};get.onerror=()=>reject(get.error)}}})}catch{return null}
}
self.onmessage=async({data})=>{try{
 if(data.type==='load'){
  docs=data.docs;vectors=[];privateMode=!!data.private;self.postMessage({type:'progress',text:'Loading full-library meaning-based search. Your source-based answer is available immediately…'});
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(docs)));
  cacheKey='minilm-q8-v7-'+Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
  const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');env.allowLocalModels=false;
  extractor=await pipeline('feature-extraction','Xenova/all-MiniLM-L6-v2',{dtype:'q8'});
  const saved=privateMode?null:await cache('readonly',cacheKey);if(saved?.length===docs.length)vectors=saved;
  else{for(let i=0;i<docs.length;i+=8){const batch=docs.slice(i,i+8);const result=await extractor(batch.map(d=>d.text),{pooling:'mean',normalize:true});vectors.push(...result.tolist());self.postMessage({type:'progress',text:'Indexing every passage · '+Math.min(i+8,docs.length)+'/'+docs.length+' search windows'});}if(!privateMode)await cache('readwrite',cacheKey,vectors);}
  self.postMessage({type:'ready',count:docs.length});return;
 }
 if(data.type==='query'&&extractor&&vectors.length===docs.length){
  pending=data.query;const output=await extractor([data.query.slice(0,1100)],{pooling:'mean',normalize:true}),v=output.tolist()[0];
  if(pending!==data.query)return;
  const sections=new Map();const passages=[];
  docs.forEach((d,i)=>{const score=v.reduce((sum,x,j)=>sum+x*vectors[i][j],0);sections.set(d.sectionId,Math.max(sections.get(d.sectionId)||0,score));passages.push([d.sectionId+'-p'+d.passage,score]);});
  self.postMessage({type:'result',query:data.query,scores:[...sections],passages});
 }
}catch(err){self.postMessage({type:'error'});}};
