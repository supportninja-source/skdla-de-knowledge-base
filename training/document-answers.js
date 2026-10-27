(function(root){
 const rules=[
  {match:q=>/who|which.*leader|responsible|assign/i.test(q)&&!/log|record|document/i.test(q)&&/los angeles|\bla\b/i.test(q)&&/feedback|complaint|technical|high esthetic|leader/i.test(q),ids:()=>['D01-la']},
  {match:q=>/complaint|negative feedback/i.test(q)&&/log|record|document|template|file|activity|assign/i.test(q),ids:q=>[/account activity|account.specific|account.level|\bcrm\b/i.test(q)?'D15-account':'D15-case'],clarification:'For an account-specific complaint, use CRM → Account Activity rather than the case’s Call Notes. Verify the case/account and current BU owner.'},
  {match:q=>/positive feedback|praise|compliment/i.test(q)&&/log|record|document|activity|assign|subject/i.test(q),ids:q=>[/account activity|account.specific|account.level|\bcrm\b/i.test(q)?'D13-account':'D13-case'],clarification:'The quick reference uses Quality; the detailed SOP uses Positive Feedback. Confirm the current ABS label. The SOP’s “positive complaint” wording conflicts with its screenshot and later step.'},
  {match:q=>/fedex/i.test(q)&&/label|pickup|pick.up|returns sop/i.test(q),ids:q=>/prepare|collect|information.*need/i.test(q)?['D10-prepare']:['D10-label','D10-carrier']},
  {match:q=>/\bups\b/i.test(q)&&/label|pickup|pick.up/i.test(q),ids:q=>/only|already.*label|no.*label/i.test(q)?['D12-pickup']:/email|send|subject/i.test(q)&&!/create|schedule/i.test(q)?['D12-email']:['D12-label','D12-email'],clarification:'Verify current carrier dates, cutoffs, package weight, service, and destination. The supplied guide’s examples are not a delivery guarantee.'},
  {match:q=>/\bpan\b/i.test(q)&&/color|colour|white|gray|grey|black|blue|yellow|red|pink|beige|orange|green|prefix|material/i.test(q),ids:q=>{const color=q.toLowerCase().match(/\b(white|gray|grey|black|blue|yellow|red|pink|beige|orange|green)\b/)?.[0];if(color)return ['D09-'+(color==='grey'?'gray':color)];if(/implant/i.test(q))return ['D09-black'];if(/zirconia|ceramax|pfz/i.test(q))return ['D09-white'];if(/emax|e.max/i.test(q))return ['D09-gray'];if(/pfm|metal|gold/i.test(q))return ['D09-blue'];if(/remake|adjustment/i.test(q))return ['D09-red'];if(/wax/i.test(q))return ['D09-pink'];if(/removable|denture/i.test(q))return ['D09-yellow','D09-beige','D09-orange'];return ['D09-white','D09-gray','D09-black','D09-blue','D09-yellow','D09-red','D09-pink','D09-beige','D09-orange','D09-green'];}},
  {match:q=>/\btooth\s*(?:number\s*)?#?\s*\d{1,2}\b|tooth number|teeth number|dental direction|maxilla|mandible|mesial|distal/i.test(q),ids:q=>{const n=Number(q.match(/\btooth\s*(?:number\s*)?#?\s*(\d{1,2})\b/i)?.[1]);return n>=1&&n<=32?['D07-'+(n<=8?'ur':n<=16?'ul':n<=24?'ll':'lr')]:['D07-chart'];},select:(q,p)=>{const n=Number(q.match(/\btooth\s*(?:number\s*)?#?\s*(\d{1,2})\b/i)?.[1]);return n>=1&&n<=32?p.startsWith('Tooth '+n+':'):true;}},
  {match:q=>/shade/i.test(q)&&!/hold|release|missing|provided|received/i.test(q)&&/guide|famil|a1|a2|a3|a4|b1|c1|d2|vita|code|system|screen|color|colour|choose|select/i.test(q),ids:q=>/record|relay|send|document/i.test(q)?['G01-handoff']:['G01-families'],clarification:'This is a shade-code reference. Preserve the office’s exact code and system; do not choose a patient shade from screen colors.'},
  {match:q=>/full.arch|quadrant|opposing arch/i.test(q)&&/model|difference|what|mean|explain/i.test(q),ids:()=>['G02-models'],clarification:'The diagram explains model terminology. Confirm actual model selection against the Rx and approved technical instructions.'},
  {match:q=>/crown|bridge|implant|denture|full.arch restoration/i.test(q)&&/difference|what is|what are|mean|types|explain/i.test(q),ids:()=>['G02-restorations']},
  {match:q=>/who|leader|contact|assign|responsible|manager/i.test(q)&&/los angeles|\bla\b/i.test(q)&&/feedback|technical|high esthetic|leader/i.test(q),ids:()=>['D01-la']},
  {match:q=>/who|leader|contact|backup|responsible/i.test(q)&&/shipping/i.test(q),ids:()=>['D01-shipping']},
  {match:q=>/who|leader|contact|manager/i.test(q)&&/customer service|csr|cs lead/i.test(q),ids:()=>['D01-csr']},
  {match:q=>/who|leader|contact|planner|advisor/i.test(q)&&/implants/i.test(q),ids:()=>['D01-oc-implants']},
  {match:q=>/who|leader|contact|advisor/i.test(q)&&/removable/i.test(q),ids:()=>['D01-oc-removables']},
  {match:q=>/who|leader|contact|planner|advisor/i.test(q)&&/crown|bridge/i.test(q),ids:()=>['D01-oc-cb']},
  {match:q=>/hold/i.test(q)&&/how long|minute|phone|caller.*wait|hold standard/i.test(q),ids:()=>['D06-hold']},
  {match:q=>/email/i.test(q)&&/respond|response|acknowledge|deadline|how long|target/i.test(q)&&!/template|word|technical|send|shade|notify/i.test(q),ids:()=>['D06-email']},
  {match:q=>/voicemail/i.test(q),ids:()=>['D06-voicemail']},
  {match:q=>/portal.*ticket|ticket.*portal/i.test(q)&&/hour|deadline|target|how long/i.test(q),ids:()=>['D06-tickets'],clarification:'The overview sets a two-business-hour target. Recording examples keep unresolved work pending. Confirm the applicable exception with your lead and keep follow-up visible.'},
  {match:q=>/call/i.test(q)&&/minimum|how many|per day|daily|volume|outbound.*expect/i.test(q),ids:()=>['D06-calls']},
  {match:q=>/google review|five.star|5.star/i.test(q)&&/month|minimum|bcc|management|expect|how many/i.test(q),ids:()=>['D06-reviews']},
  {match:q=>/call note|callnote/i.test(q)&&/required|include|fields|every/i.test(q),ids:()=>['D03-required']},
  {match:q=>/due.date|due date/i.test(q)&&/note|document|include|fields/i.test(q),ids:()=>['D03-due']},
  {match:q=>/late|overdue/i.test(q)&&/case|runner/i.test(q)&&!/chair|911|emergency/i.test(q),ids:()=>['D05-late'],clarification:'The guide calls for rapid response within 30 minutes. A patient already in the chair requires immediate lead escalation, not waiting for this target.'},
  {match:q=>/at.risk/i.test(q)&&/case/i.test(q),ids:()=>['D05-risk']},
  {match:q=>/rush/i.test(q)&&/inquiry|request|case|information|collect/i.test(q),ids:()=>['D05-rush']},
  {match:q=>/technical/i.test(q)&&/inquiry|support|question/i.test(q)&&!/note|notify|notification|email.*enough/i.test(q),ids:q=>/potential|general|not.*lab/i.test(q)?['D05-potential']:['D05-technical']},
  {match:q=>/professional.*email|email.*standard|email.*structure|email.*salutation|email.*closing/i.test(q),ids:()=>['D04-structure','D04-updates']},
  {match:q=>/call audit|audit parameter|audit.*rating|quality.*checklist/i.test(q),ids:()=>['D14-opening','D14-resolution','D14-rating']}
 ];
 function rule(q){return rules.find(r=>r.match(q));}
 function pinned(q,index){const r=rule(q);return r?r.ids(q).map(id=>index.find(s=>s.id===id)).filter(Boolean):[];}
 function compose(q,sources){const r=rule(q);if(!r)return null;const selected=r.ids(q).map(id=>sources.find(s=>s.id===id)).filter(Boolean);if(!selected.length)return null;
  const tooth=q.match(/\btooth\s*(?:number\s*)?#?\s*(\d{1,2})\b/i);if(tooth&&(Number(tooth[1])<1||Number(tooth[1])>32||/primary|baby|fdi|iso/i.test(q)))return {blocks:[],needsDetails:true,fromDocuments:true,clarification:'The supplied chart uses Universal permanent-tooth numbers 1–32. Confirm the tooth number and notation system; primary-tooth and FDI notation are different.'};
  const blocks=selected.flatMap(s=>(s.paragraphs||s.text.split('\n')).filter(p=>!r.select||r.select(q,p)).map(text=>({text,source:s.sourceId,quote:text})));
  return {blocks,fromDocuments:true,reviewed:false,procedural:selected[0].purpose==='procedure'&&blocks.length>1,topic:selected[0].title,clarification:r.clarification||''};
 }
 const api={pinned,compose};root.CSRAnswers=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
