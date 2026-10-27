(function(root){
 const documents=root.CSR_RESOURCES||[],guides=root.CSR_REFERENCE_GUIDES||[],all=[...documents,...guides],$=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const visualItems=[
  {title:'Permanent tooth numbers',image:'images/tooth-number-chart.webp',type:'Supplied tooth chart',description:'Universal permanent-tooth numbering, upper/lower arches, quadrants, and dental directions. Right and left refer to the patient.',document:'D07',topic:'chart'},
  {title:'Shade-code families',image:'images/shade-family-reference.svg',type:'Added KB illustration',description:'VITA classical A1–D4 code families. Illustrative colors only; use the approved physical guide and the office’s exact shade instruction.',document:'G01',topic:'families'},
  {title:'Full-arch and quadrant models',image:'images/dental-model-reference.svg',type:'Added KB illustration',description:'Full-arch models, quadrant models, and opposing arches. Terminology only; verify actual model selection against the Rx.',document:'G02',topic:'models'},
  {title:'Restoration types',image:'images/restoration-reference.svg',type:'Added KB illustration',description:'Crown, bridge, implant, and full-arch restoration terminology. A model and a finished restoration are different things.',document:'G02',topic:'restorations'},
  {title:'PAN colors and material routing',image:'images/pan-color-reference.webp',type:'Supplied PAN ID image',description:'Color, identifier prefix, and restoration/material routing. Verify the actual case; a PAN alone is not unique identification.',document:'D09',topic:'black'},
  {title:'Case-pickup phone script',image:'images/case-pickup-flow.webp',type:'Supplied call-flow diagram',description:'The local-driver and UPS pickup call paths, office questions, confirmation, and documentation.',document:'D11',topic:'opening'}
 ];
 function bindOpen(container){container.querySelectorAll('[data-open-document]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();go(b.dataset.openDocument,b.dataset.topic);}));}
 function renderList(){
  const terms=root.TrainingSearch.tokens($('resourceSearch').value),category=$('resourceCategory').value;
  const filtered=documents.filter(d=>(!category||d.category===category)&&terms.every(t=>root.TrainingSearch.norm(d.title+' '+d.category+' '+d.summary+' '+d.sections.map(s=>s.title+' '+s.content.join(' ')).join(' ')).includes(t)));
  $('resourceGrid').innerHTML=filtered.map(d=>`<button class="resource-card" data-open-document="${esc(d.id)}"><span class="resource-format">${esc(d.format)} · ${esc(d.category)}</span><h3>${esc(d.title)}</h3><p>${esc(d.summary)}</p><span class="resource-card-footer">${d.pages?d.pages+(d.pages===1?' page':' pages'):d.format==='XLSX'?'8 call scenarios':'Visual reference'} <span aria-hidden="true">↗</span></span></button>`).join('')||'<p class="empty">No matching guides. Try a broader topic.</p>';
  $('resourceResultCount').textContent=`${filtered.length} of ${documents.length} supplied reference files`;bindOpen($('resourceGrid'));
 }
 function go(id,topic){
  const d=all.find(x=>x.id===id);if(!d)return;
  history.replaceState(null,'','#document='+encodeURIComponent(id)+(topic?'&topic='+encodeURIComponent(topic):''));
  const detail=$('resourceDetail');detail.hidden=false;
  detail.innerHTML=`<div class="record-meta"><span>${esc(d.format)} / ${esc(d.category)}</span><span>${esc(d.revision)}</span></div><div class="resource-detail-heading"><h2>${esc(d.title)}</h2><button class="subtle" id="closeResource" type="button">Close guide ×</button></div><p class="record-summary">${esc(d.summary)}</p><div class="filename">Source file: ${esc(d.filename)}</div><div class="record-links"><a href="${esc(d.fileUrl)}" target="_blank" rel="noopener">Open ${d.sanitized?'published copy':'source reference'} ↗</a>${d.fileUrl.startsWith('https:')?'':`<a href="${esc(d.fileUrl)}" download>Download ${d.format} ↓</a>`}</div>${d.sanitized?'<p class="copy-notice">This published copy removes embedded credentials and selected example account/customer details. The procedure text and useful source visuals are retained.</p>':''}${d.image?`<a class="resource-image" href="${esc(d.image)}" target="_blank" rel="noopener"><img src="${esc(d.image)}" alt="${esc(d.title)}"></a>`:''}${d.sections.map(s=>`<section class="note-section" id="doc-${esc(d.id)}-${esc(s.id)}"><span class="source-locator">${typeof s.page==='number'?(d.format==='PDF'?'PDF page '+s.page+(s.pageEnd!==s.page?'–'+s.pageEnd:''):'Image reference'):esc(s.page)}</span><h3>${esc(s.title)}</h3>${s.image?`<a class="resource-image" href="${esc(s.image)}" target="_blank" rel="noopener"><img src="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy"></a>`:''}${s.steps?'<ol class="document-steps">'+s.content.map(p=>`<li>${esc(p)}</li>`).join('')+'</ol>':s.content.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')}${d.uncertainties?.length?'<section class="uncertainties"><h3>Source differences and points to confirm</h3><ul>'+d.uncertainties.map(p=>`<li>${esc(p)}</li>`).join('')+'</ul></section>':''}${d.sourceUrl?`<p class="reference-link">Reference: <a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener">${d.id==='G01'?'VITA manufacturer shade-family reference':'ADA MouthHealthy dental terminology'} ↗</a>${d.id==='G02'?' · Illustrations are terminology aids. Definitions also use the ADA pages on crowns, bridges, implants, and dentures.':''}</p>`:''}`;
  if(d.sourceLinks?.length){const references=document.createElement('p');references.className='reference-link';references.innerHTML=d.sourceLinks.map(a=>`<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.label)} ↗</a>`).join(' · ');detail.append(references);}
  $('closeResource').addEventListener('click',()=>{detail.hidden=true;history.replaceState(null,'','#documents');$('resourceSearch').focus();});
  (topic?document.getElementById('doc-'+id+'-'+topic):detail)?.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function renderVisuals(){
  $('visualGrid').innerHTML=visualItems.map((v,i)=>`<button class="visual-card" data-open-visual="${i}"><span class="visual-image-wrap"><img src="${esc(v.image)}" alt="${esc(v.title)}" loading="lazy"></span><span class="resource-format">${esc(v.type)}</span><h3>${esc(v.title)}</h3><p>${esc(v.description)}</p><span class="visual-zoom">Enlarge visual ↗</span></button>`).join('');
  $('visualGrid').querySelectorAll('[data-open-visual]').forEach(b=>b.addEventListener('click',()=>{
   const v=visualItems[Number(b.dataset.openVisual)];$('visualDialogTitle').textContent=v.title;$('visualDialogDescription').textContent=v.description;$('visualDialogImage').src=v.image;$('visualDialogImage').alt=v.title;$('visualFullSize').href=v.image;
   $('visualReadGuide').onclick=()=>{$('visualDialog').close();go(v.document,v.topic);};$('visualDialog').showModal();
  }));
 }
 $('resourceCategory').innerHTML='<option value="">All topics</option>'+[...new Set(documents.map(d=>d.category))].sort().map(c=>`<option>${esc(c)}</option>`).join('');
 $('resourceSearch').addEventListener('input',renderList);$('resourceCategory').addEventListener('change',renderList);$('closeVisual').addEventListener('click',()=>$('visualDialog').close());
 $('visualDialog').addEventListener('click',e=>{if(e.target===$('visualDialog')){const r=$('visualDialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('visualDialog').close();}});
 $('documentCount').textContent=documents.length;$('visualCount').textContent=visualItems.length;
 renderList();renderVisuals();bindOpen(document.querySelector('.quick-standards'));
 root.CSRLibrary={go};
 const hash=new URLSearchParams(location.hash.slice(1));if(hash.get('document'))go(hash.get('document'),hash.get('topic'));
})(window);
