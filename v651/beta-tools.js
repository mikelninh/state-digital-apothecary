function recoveryDetails(item){ const remaining=item.phase==='practice'?(item.paused?item.remaining:Math.max(0,Math.ceil((item.endsAt-Date.now())/1000))):0; return `${item.formula}\nState: ${item.state}\nPhase: ${item.phase}\nRemaining: ${format(remaining)}\nStarted: ${new Date(item.startedAt).toLocaleString()}`; }
function checkRecovery(){
  const item=loadActive(); if(!item)return; active=item; selectedState=item.state; current=FORMULAS[item.state]||FORMULAS.other; currentSessionId=item.id; before.value=item.before||7; $('#beforeValue').textContent=before.value;
  $('#recoverySummary').textContent=recoveryDetails(item);
  if(item.phase==='reflection'){
    $('#recoveryTitle').textContent='Your reflection is still waiting.'; $('#recoveryCopy').textContent='Finish the honest record or discard it. No session should become a task debt.'; $('#resumeRecovery').textContent='Continue reflection'; $('#reflectRecovery').classList.add('hidden');
  } else {
    const expired=!item.paused&&item.endsAt<=Date.now(); $('#recoveryTitle').textContent=expired?'The dose ended while you were away.':'A dose was left unfinished.'; $('#recoveryCopy').textContent=expired?'Continue to reflection, or discard the session.':'Resume where you stopped, or end gently and reflect.'; $('#resumeRecovery').textContent=expired?'Reflect now':'Resume dose'; $('#reflectRecovery').classList.toggle('hidden',expired);
  }
  openLayer('recovery');
}
$('#resumeRecovery').addEventListener('click',()=>{
  closeLayer('recovery');
  if(active.phase==='reflection' || (!active.paused&&active.endsAt<=Date.now())){ active.phase='reflection'; active.practiceStatus=active.practiceStatus||'completed-background'; saveActive(active); after.value=Math.max(1,Number(active.before)-2); $('#afterValue').textContent=after.value; updateShiftFeedback(); show('return','REFLECT NOW'); }
  else { selectedState=active.state;current=FORMULAS[selectedState];updateFormula();openPractice(); }
});
$('#reflectRecovery').addEventListener('click',()=>{ closeLayer('recovery'); active.phase='reflection';active.practiceStatus='recovered-exit';active.finishedAt=new Date().toISOString();saveActive(active);after.value=Number(active.before);$('#afterValue').textContent=after.value;updateShiftFeedback();show('return','REFLECT NOW'); });
$('#discardRecovery').addEventListener('click',()=>{ if(confirm('Discard this unfinished session?')){saveActive(null);active=null;closeLayer('recovery');toast('Unfinished session discarded.');} });

function diagnostics(){
  return [BUILD,`URL: ${location.href}`,`Screen: ${currentScreen()}`,`Viewport: ${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio||1}x`,`Browser: ${navigator.userAgent}`,`Language: ${navigator.language}`,`Storage available: ${storageAvailable()}`,`Sessions: ${loadSessions().length}`,`Active recovery: ${Boolean(loadActive())}`,`Wake Lock support: ${'wakeLock' in navigator}`].join('\n');
}
function feedbackMessage(){
  const lines=[BUILD,`Type: ${$('#feedbackType').value}`,`Clarity: ${$('#feedbackClarity').value}/5`,`Would return: ${$('#feedbackReturn').value}`,`Feedback: ${$('#feedbackText').value.trim()}`];
  if($('#includeDiagnostics').checked) lines.push('',diagnostics());
  return lines.join('\n');
}
function updateFeedbackPreview(){ $('#feedbackPreview').textContent=feedbackMessage(); }
['feedbackType','feedbackClarity','feedbackReturn','feedbackText','includeDiagnostics'].forEach(id=>$('#'+id).addEventListener('input',updateFeedbackPreview));
function openFeedback(){ updateFeedbackPreview(); openLayer('feedbackModal'); setTimeout(()=>$('#feedbackText').focus(),80); }
function closeFeedback(){ closeLayer('feedbackModal'); }
$('#openFeedback').addEventListener('click',openFeedback); $('#doorFeedback').addEventListener('click',openFeedback); $('#finalFeedback').addEventListener('click',openFeedback); $('#nudgeFeedback').addEventListener('click',openFeedback); $('#closeFeedback').addEventListener('click',closeFeedback);
$('#copyFeedback').addEventListener('click',async()=>{ try{await navigator.clipboard.writeText(feedbackMessage());toast('Feedback message copied.');}catch{toast('Copy was unavailable. Select the preview text manually.');} });
$('#feedbackForm').addEventListener('submit',async event=>{
  event.preventDefault(); const text=feedbackMessage();
  try{ if(navigator.share) await navigator.share({title:'STATE private beta feedback',text}); else {await navigator.clipboard.writeText(text);toast('Feedback copied. Share it with the beta team.');} safeSet(FEEDBACK_DONE_KEY,'1');safeRemove(FEEDBACK_DUE_KEY);$('#feedbackNudge').classList.add('hidden');closeFeedback(); }
  catch(error){ if(error?.name!=='AbortError') toast('Sharing failed. Copy the message instead.'); }
});
$('#dismissNudge').addEventListener('click',()=>{safeRemove(FEEDBACK_DUE_KEY);$('#feedbackNudge').classList.add('hidden');});

function showBetaPanel(){ $('#debugOutput').textContent=diagnostics(); openLayer('betaPanel'); }
const betaMode=new URLSearchParams(location.search).get('beta')==='1';
$('#buildChip').addEventListener('click',()=>{ betaTapCount++; if(betaMode||betaTapCount>=7)showBetaPanel(); else toast(BUILD+(betaTapCount>=4?' · '+(7-betaTapCount)+' taps to unlock tester tools':'')); });
$('#closeBetaPanel').addEventListener('click',()=>closeLayer('betaPanel'));
$('#copyDebug').addEventListener('click',async()=>{ const text=diagnostics();$('#debugOutput').textContent=text;try{await navigator.clipboard.writeText(text);toast('Debug report copied.');}catch{toast('Copy unavailable.');} });
$('#fastDose').addEventListener('click',()=>{closeLayer('betaPanel');testSession=true;selectedState='overwhelmed';current=FORMULAS.overwhelmed;before.value=7;$('#beforeValue').textContent='7';updateFormula();chooseDose(15);show('recommendation','15-SECOND TEST');toast('Fast test enabled. It will not affect personal patterns.');});
$('#simulateFollowup').addEventListener('click',()=>{const items=loadSessions(),item=[...items].reverse().find(r=>!r.testSession&&r.hourScore===null);if(!item){toast('No unresolved real follow-up found.');return;}item.followUpDueAt=new Date(Date.now()-1000).toISOString();saveSessions(items);closeLayer('betaPanel');setTimeout(checkFollowup,100);});
$('#seedPatterns').addEventListener('click',()=>{const now=Date.now(),states=['overwhelmed','scattered','tense','overwhelmed','flat','overwhelmed'],items=loadSessions();states.forEach((state,index)=>{const formula=FORMULAS[state],beforeValue=7-(index%2),afterValue=Math.max(2,beforeValue-(1+index%3));items.push({id:'demo-'+id(),state,other:'',formula:`${formula.name} ${formula.number}`,mode:index%2?'quick':'ritual',doseSeconds:index%3===0?formula.minutes*60:60,status:'completed',startedAt:new Date(now-(index+2)*86400000).toISOString(),finishedAt:new Date(now-(index+2)*86400000+60000).toISOString(),timeBucket:['morning','afternoon','evening'][index%3],before:beforeValue,after:afterValue,nextAction:'work',note:'Demo record',followUpDueAt:new Date(now-(index+2)*86400000+3660000).toISOString(),hourScore:[4,3,4,5,2,4][index],hourNote:'Demo follow-up',followedUpAt:new Date(now-(index+2)*86400000+3660000).toISOString(),demo:true,testSession:true});});saveSessions(items);renderPatterns();toast('Demo records added and excluded from personal metrics.');$('#debugOutput').textContent='Demo records are labelled as tester data and excluded from personal recommendations and metrics.';});
$('#resetOnboarding').addEventListener('click',()=>{safeRemove(ONBOARD_KEY);toast('Onboarding will return on reload.');});
$('#clearBetaData').addEventListener('click',()=>{if(confirm('Delete sessions, active recovery, onboarding and beta preferences?')){[STORAGE_KEY,ACTIVE_KEY,ONBOARD_KEY,MODE_KEY,FEEDBACK_DUE_KEY,FEEDBACK_DONE_KEY].forEach(safeRemove);location.reload();}});

function initOnboarding(){
  const check=$('#storageCheck'); if(storageAvailable()){check.textContent='LOCAL STORAGE AVAILABLE · records remain in this browser';}else{check.textContent='WARNING · this browser may not preserve your records';check.classList.add('warning');}
  const consents=$$('[data-consent]'),update=()=>$('#startBeta').disabled=!consents.every(input=>input.checked); consents.forEach(input=>input.addEventListener('change',update));
  if(!safeGet(ONBOARD_KEY)) openLayer('onboarding');
}
$('#startBeta').addEventListener('click',()=>{safeSet(ONBOARD_KEY,new Date().toISOString());closeLayer('onboarding');toast('Welcome to the private beta.');setTimeout(()=>{checkRecovery();if(!loadActive())checkFollowup();},120);});
$('#declineBeta').addEventListener('click',()=>{closeLayer('onboarding');$('#final').classList.remove('hidden');$('#final').querySelector('h2').innerHTML='No pressure.<br>Come back later.';$('#final').querySelector('p').textContent='STATE should only be entered by choice.';});

document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&active?.phase==='practice'){ if(!active.paused&&!wakeLock)requestWakeLock(); guidance(); if(activeRemaining()<=0)finishPractice('completed-background'); } });
window.addEventListener('pagehide',saveActiveTick);
document.addEventListener('keydown',event=>{ if(event.key==='Escape'){ ['feedbackModal','betaPanel'].forEach(id=>{if(!$('#'+id).classList.contains('hidden'))closeLayer(id);}); } });

migrateLegacy(); setMode(mode); renderPatterns(); initOnboarding();
if(safeGet(FEEDBACK_DUE_KEY)&&!safeGet(FEEDBACK_DONE_KEY)) $('#feedbackNudge').classList.remove('hidden');
setTimeout(()=>{if($('#onboarding').classList.contains('hidden')){checkRecovery();if(!loadActive())checkFollowup();}},500);
