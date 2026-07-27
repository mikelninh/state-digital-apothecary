async function requestWakeLock(){
  try{ if('wakeLock' in navigator){ wakeLock=await navigator.wakeLock.request('screen'); $('#wakeStatus').textContent='SCREEN WAKE: ACTIVE WHILE PRACTISING'; wakeLock.addEventListener('release',()=>$('#wakeStatus').textContent='SCREEN WAKE: RELEASED'); }
  else $('#wakeStatus').textContent='SCREEN WAKE: NOT SUPPORTED ON THIS DEVICE'; }
  catch{ $('#wakeStatus').textContent='SCREEN WAKE: UNAVAILABLE'; }
}
async function releaseWakeLock(){ try{if(wakeLock)await wakeLock.release()}catch{} wakeLock=null; }
function activeRemaining(){
  if(!active) return 0;
  if(active.paused) return active.remaining;
  return Math.max(0,Math.ceil((active.endsAt-Date.now())/1000));
}
function saveActiveTick(){ if(active){active.remaining=activeRemaining();safeSet(ACTIVE_KEY,JSON.stringify(active));} }
function guidance(){
  const remaining=activeRemaining(),elapsed=active.total-remaining;
  $('#practiceTime').textContent=format(remaining);
  $('#progressRing').style.setProperty('--progress',`${Math.min(100,(elapsed/active.total)*100)}%`);
  if(current.mode==='breath'){
    const cycle=Math.max(0,elapsed)%10,inhale=cycle<4,phase=inhale?'inhale':'exhale';
    $('#practice').dataset.phase=phase; $('#phaseLabel').textContent=phase.toUpperCase(); $('#phaseCount').textContent=inhale?Math.max(1,4-cycle):Math.max(1,10-cycle);
    $('#practiceGuidance').textContent=inhale?'Inhale gently. Do not pull in more air than feels easy.':'Exhale softly and a little longer. Let the jaw and shoulders release.';
    $('#practiceSub').textContent='No holds · nothing to achieve · return to natural breathing if uncomfortable';
    return;
  }
  $('#practice').dataset.phase='inhale'; $('#phaseLabel').textContent=current.name; $('#phaseCount').textContent=remaining;
  const copy={focus:'Open the exact place where the work begins. Choose only the next visible action.',release:'Notice jaw, shoulders and hands. Soften only what releases without force.',walk:'Stand up. Find daylight if available. Let the first steps happen before analysis.',courage:'Make the threshold smaller. Open it, dial it, or write the first honest line.',connect:'Choose one reasonably safe person. Write one specific, pressure-free invitation.',pause:'Name what is here in one accurate sentence. Nothing more is required.'};
  $('#practiceGuidance').textContent=copy[current.mode]; $('#practiceSub').textContent='One finite condition · no performance · stop whenever needed';
}
function runTimer(){
  clearInterval(timer); guidance();
  timer=setInterval(()=>{ if(!active||active.paused)return; const remaining=activeRemaining(); guidance(); if(remaining%5===0)saveActiveTick(); if(remaining<=0)finishPractice('completed'); },250);
}
function openPractice(){
  $('#practice').classList.remove('hidden'); $('#practice').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; $('#pauseDose').textContent=active.paused?'Resume gently':'Pause'; practiceStatus='active'; requestWakeLock(); runTimer();
}
function beginPractice(){
  const now=Date.now(); currentSessionId=id();
  active={phase:'practice',id:currentSessionId,state:selectedState,other:selectedState==='other'?$('#otherText').value.trim():'',formula:`${current.name} ${current.number}`,mode,doseSeconds:selectedSeconds,total:selectedSeconds,startedAt:new Date(now).toISOString(),endsAt:now+selectedSeconds*1000,remaining:selectedSeconds,paused:false,before:Number(before.value),testSession};
  saveActive(active); openPractice();
}
async function finishPractice(nextStatus){
  if(!active||active.phase!=='practice')return; clearInterval(timer);
  active.remaining=activeRemaining(); active.phase='reflection'; active.practiceStatus=nextStatus; active.finishedAt=new Date().toISOString(); saveActive(active);
  await releaseWakeLock();
  $('#practice').classList.add('hidden'); $('#practice').setAttribute('aria-hidden','true'); document.body.style.overflow=''; practiceStatus=nextStatus;
  const b=Number(active.before); before.value=b; $('#beforeValue').textContent=b; after.value=Math.max(1,b-2); $('#afterValue').textContent=after.value; updateShiftFeedback(); show('return','REFLECT NOW');
}
$('#beginDose').addEventListener('click',beginPractice);
$('#pauseDose').addEventListener('click',()=>{
  if(!active)return;
  if(active.paused){ active.paused=false; active.endsAt=Date.now()+active.remaining*1000; $('#pauseDose').textContent='Pause'; requestWakeLock(); }
  else { active.remaining=activeRemaining(); active.paused=true; active.endsAt=null; $('#pauseDose').textContent='Resume gently'; releaseWakeLock(); $('#practiceGuidance').textContent='Breathe naturally. Nothing needs to be completed right now.'; $('#practiceSub').textContent='Resume only if it feels useful.'; }
  saveActive(active);
});
$('#completeDose').addEventListener('click',()=>finishPractice('completed-early'));
$('#exitPractice').addEventListener('click',()=>{ if(confirm('End the dose and continue to an honest reflection?')) finishPractice('exited'); });

$('#reflectionForm').addEventListener('submit',event=>{
  event.preventDefault(); if(!active||active.phase!=='reflection'){toast('No recoverable reflection was found.');return;}
  const form=new FormData(event.currentTarget),finishedAt=new Date();
  const record={id:active.id,state:active.state,other:active.other||'',formula:active.formula,mode:active.mode,doseSeconds:active.doseSeconds,status:active.practiceStatus,startedAt:active.startedAt,finishedAt:active.finishedAt||finishedAt.toISOString(),timeBucket:timeBucket(finishedAt),before:Number(active.before),after:Number(after.value),nextAction:form.get('nextAction'),note:$('#note').value.trim(),followUpDueAt:new Date(finishedAt.getTime()+60*60*1000).toISOString(),hourScore:null,hourNote:'',followedUpAt:null,testSession:Boolean(active.testSession)};
  const items=loadSessions(); items.push(record); saveSessions(items); saveActive(null); active=null;
  const realCount=items.filter(r=>!r.testSession).length; if(realCount>=3&&!safeGet(FEEDBACK_DONE_KEY)) safeSet(FEEDBACK_DUE_KEY,'1');
  $('#exitCopy').textContent=current.exit+' STATE will ask once, later, whether the next hour actually improved.'; show('door','OPEN DOOR'); toast(record.testSession?'Test session saved and excluded from personal patterns.':'Saved privately. One-hour follow-up is pending.');
});
$('#leaveState').addEventListener('click',()=>{ $('#final').classList.remove('hidden'); document.body.style.overflow='hidden'; document.title='STATE has ended — go use the hour'; });

function dueFollowup(){ const now=Date.now(); return loadSessions().find(r=>!r.testSession&&r.hourScore===null&&new Date(r.followUpDueAt).getTime()<=now); }
function checkFollowup(){ const item=dueFollowup(); if(!item)return; pendingFollowupId=item.id; $('#followupContext').textContent=`Earlier you used ${item.formula} for ${item.state}. Rate the hour that followed—not the beauty of the exercise.`; openLayer('followup'); $('#followup').setAttribute('aria-hidden','false'); }
$('#followupForm').addEventListener('submit',event=>{
  event.preventDefault(); const form=new FormData(event.currentTarget),items=loadSessions(),item=items.find(r=>r.id===pendingFollowupId),score=Number(form.get('hourScore'));
  if(item){item.hourScore=score;item.hourNote=$('#followupNote').value.trim();item.followedUpAt=new Date().toISOString();saveSessions(items);}
  closeLayer('followup'); $('#followup').setAttribute('aria-hidden','true'); pendingFollowupId=null;
  toast(score<=2?'Low usefulness saved. STATE will not pretend the dose worked.':'Your next-hour result was saved privately.'); renderPatterns();
});
$('#dismissFollowup').addEventListener('click',()=>{closeLayer('followup');$('#followup').setAttribute('aria-hidden','true');pendingFollowupId=null;});

function renderPatterns(){
  const all=loadSessions(),items=all.filter(r=>!r.testSession),resolved=items.filter(r=>Number.isFinite(r.hourScore)),shifts=items.filter(r=>Number.isFinite(r.after)).map(r=>r.before-r.after);
  $('#metricSessions').textContent=items.length; $('#metricFollowups').textContent=resolved.length; $('#metricShift').textContent=shifts.length?`${avg(shifts)>=0?'+':''}${avg(shifts).toFixed(1)}`:'—'; $('#metricHour').textContent=resolved.length?`${avg(resolved.map(r=>r.hourScore)).toFixed(1)}/5`:'—';
  const insights=[]; if(items.length<3) insights.push(['Still learning','Fewer than three real sessions means STATE should not pretend to know a personal pattern yet.']);
  const byState={}; resolved.forEach(r=>(byState[r.state]??=[]).push(r));
  const ranked=Object.entries(byState).filter(([,v])=>v.length>=2).map(([state,v])=>({state,n:v.length,score:avg(v.map(r=>r.hourScore))})).sort((a,b)=>b.score-a.score);
  if(ranked[0]) insights.push(['Most useful recorded condition',`${FORMULAS[ranked[0].state].name} averaged ${ranked[0].score.toFixed(1)}/5 across ${ranked[0].n} one-hour follow-ups.`]);
  const byTime={morning:[],afternoon:[],evening:[]}; resolved.forEach(r=>byTime[r.timeBucket]?.push(r.hourScore));
  const timeRank=Object.entries(byTime).filter(([,v])=>v.length>=2).map(([time,v])=>({time,n:v.length,score:avg(v)})).sort((a,b)=>b.score-a.score);
  if(timeRank[0]) insights.push(['Time-of-day signal',`Recorded sessions in the ${timeRank[0].time} averaged ${timeRank[0].score.toFixed(1)}/5 across ${timeRank[0].n} follow-ups.`]);
  const quick=resolved.filter(r=>r.doseSeconds===60),full=resolved.filter(r=>r.doseSeconds>60);
  if(quick.length>=2&&full.length>=2) insights.push(['Dose-length comparison',`Quick doses averaged ${avg(quick.map(r=>r.hourScore)).toFixed(1)}/5; full doses averaged ${avg(full.map(r=>r.hourScore)).toFixed(1)}/5. Context may explain the difference.`]);
  if(resolved.length&&avg(resolved.map(r=>r.hourScore))<2.7) insights.push(['Important weak signal','Recent sessions have not translated into strong next-hour usefulness. STATE should not hide that.']);
  const testCount=all.filter(r=>r.testSession).length; if(testCount) insights.push(['Tester note',`${testCount} fast-test record${testCount===1?' is':'s are'} excluded from the personal metrics above.`]);
  insights.push(['What this does not prove','These are self-reports without a control condition. They can guide reflection, not establish causality, efficacy or diagnosis.']);
  $('#insightList').innerHTML=insights.map(([title,text])=>`<article class="insight"><b>${title}</b><p>${text}</p></article>`).join('');
}
$('#openPatterns').addEventListener('click',()=>show('patterns','YOUR PATTERNS'));
$('#backFromPatterns').addEventListener('click',()=>show('arrival','ARRIVE'));
$$('[data-dock]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.dock,button.dataset.dock==='patterns'?'YOUR PATTERNS':'ARRIVE')));
$('#exportData').addEventListener('click',()=>{ const blob=new Blob([JSON.stringify({build:BUILD,exportedAt:new Date().toISOString(),sessions:loadSessions()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a'); a.href=url;a.download='state-private-beta-data.json';a.click();URL.revokeObjectURL(url); });
$('#clearData').addEventListener('click',()=>{ if(confirm('Delete all STATE session records stored in this browser? This cannot be undone.')){safeRemove(STORAGE_KEY);safeRemove(ACTIVE_KEY);renderPatterns();toast('Local session data deleted.');} });
