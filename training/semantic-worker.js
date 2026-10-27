let extractor,docs=[],vectors=[],pending='';
self.onmessage=async({data})=>{try{
 if(data.type==='load'){
  docs=data.docs;self.postMessage({type:'progress',text:'Loading the small AI search model. Your source-based answer is available immediately…'});
  const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');env.allowLocalModels=false;
  extractor=await pipeline('feature-extraction','Xenova/all-MiniLM-L6-v2',{dtype:'q8'});
  for(let i=0;i<docs.length;i+=8){const batch=docs.slice(i,i+8);const result=await extractor(batch.map(d=>d.text),{pooling:'mean',normalize:true});vectors.push(...result.tolist());self.postMessage({type:'progress',text:'Preparing meaning-based search · '+Math.min(i+8,docs.length)+'/'+docs.length+' training topics'});}
  self.postMessage({type:'ready'});return;
 }
 if(data.type==='query'&&extractor&&vectors.length===docs.length){
  pending=data.query;const output=await extractor([data.query.slice(0,1100)],{pooling:'mean',normalize:true}),v=output.tolist()[0];
  if(pending!==data.query)return;
  self.postMessage({type:'result',query:data.query,scores:docs.map((d,i)=>[d.id,v.reduce((sum,x,j)=>sum+x*vectors[i][j],0)])});
 }
}catch(err){self.postMessage({type:'error'});}};
