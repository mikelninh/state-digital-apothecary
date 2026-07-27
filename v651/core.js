'use strict';
const BUILD = 'STATE PRIVATE BETA 0.1 · BUILD 6.5.1';
const STORAGE_KEY = 'state-v651-sessions';
const LEGACY_KEY = 'state-v65-sessions';
const MODE_KEY = 'state-v651-mode';
const ONBOARD_KEY = 'state-v651-onboarded';
const ACTIVE_KEY = 'state-v651-active';
const FEEDBACK_DUE_KEY = 'state-v651-feedback-due';
const FEEDBACK_DONE_KEY = 'state-v651-feedback-done';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const screens = $$('.screen');
const before = $('#beforeIntensity');
const after = $('#afterIntensity');

let selectedState = null;
let current = FORMULAS.overwhelmed;
let mode = safeGet(MODE_KEY) || 'ritual';
let selectedSeconds = 60;
let currentSessionId = null;
let practiceStatus = 'idle';
let active = null;
let timer = null;
let wakeLock = null;
let pendingFollowupId = null;
let testSession = false;
let betaTapCount = 0;

function storageAvailable(){
  try { const key='__state_test__'; localStorage.setItem(key,'1'); localStorage.removeItem(key); return true; }
  catch { return false; }
}
function safeGet(key){ try{return localStorage.getItem(key)}catch{return null} }
function safeSet(key,value){ try{localStorage.setItem(key,value);return true}catch{return false} }
function safeRemove(key){ try{localStorage.removeItem(key)}catch{} }
function parse(value,fallback){ try{return JSON.parse(value)}catch{return fallback} }
function loadSessions(){ return parse(safeGet(STORAGE_KEY) || '[]',[]); }
function saveSessions(items){ safeSet(STORAGE_KEY,JSON.stringify(items.slice(-300))); }
function loadActive(){ return parse(safeGet(ACTIVE_KEY) || 'null',null); }
function saveActive(value){ active=value; value?safeSet(ACTIVE_KEY,JSON.stringify(value)):safeRemove(ACTIVE_KEY); }
function id(){ return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function avg(values){ return values.length?values.reduce((a,b)=>a+b,0)/values.length:null; }
function timeBucket(date){ const h=new Date(date).getHours(); return h<12?'morning':h<18?'afternoon':'evening'; }
function format(seconds){ const s=Math.max(0,Math.ceil(seconds)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function currentScreen(){ return screens.find(s=>!s.classList.contains('hidden'))?.id || 'overlay'; }
function toast(message){ const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(window.__stateToast); window.__stateToast=setTimeout(()=>el.classList.remove('show'),2600); }
function openLayer(id){ $('#'+id).classList.remove('hidden'); document.body.style.overflow='hidden'; }
function closeLayer(id){ $('#'+id).classList.add('hidden'); if($('#practice').classList.contains('hidden')) document.body.style.overflow=''; }
function setDock(id){ $$('[data-dock]').forEach(button=>button.classList.toggle('active',button.dataset.dock===id)); }
function show(id,label){ screens.forEach(screen=>screen.classList.toggle('hidden',screen.id!==id)); $('#chapter').textContent='DAILY DOSE / '+label; setDock(id==='patterns'?'patterns':'arrival'); window.scrollTo({top:0,behavior:'smooth'}); if(id==='patterns')renderPatterns(); }

function migrateLegacy(){
  if(!safeGet(STORAGE_KEY) && safeGet(LEGACY_KEY)) safeSet(STORAGE_KEY,safeGet(LEGACY_KEY));
}

function setMode(next){ mode=next; safeSet(MODE_KEY,mode); $$('[data-mode]').forEach(button=>button.classList.toggle('active',button.dataset.mode===mode)); }
$$('[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));

function selectState(card){
  testSession=false;
  selectedState=card.dataset.state;
  current=FORMULAS[selectedState];
  $$('.state-card').forEach(item=>{ const selected=item===card; item.classList.toggle('selected',selected); item.setAttribute('aria-pressed',String(selected)); });
  $('#otherInput').classList.toggle('show',selectedState==='other');
  $('#selectionHint').textContent=`Selected: ${card.querySelector('strong').textContent}`;
  document.documentElement.style.setProperty('--accent',current.accent);
  document.documentElement.style.setProperty('--accent2',current.accent2);
  validateSelection();
  if(navigator.vibrate) navigator.vibrate(12);
}
function validateSelection(){
  const valid=Boolean(selectedState) && (selectedState!=='other' || $('#otherText').value.trim().length>=3);
  $('#continueButton').disabled=!valid;
  if(selectedState==='other' && !valid) $('#selectionHint').textContent='Add a few private words to continue.';
}
$$('.state-card').forEach(card=>card.addEventListener('click',()=>selectState(card)));
$('#otherText').addEventListener('input',validateSelection);

function recordsForState(state){ return loadSessions().filter(r=>!r.testSession && r.state===state); }
function resolvedForState(state){ return recordsForState(state).filter(r=>Number.isFinite(r.hourScore)); }
function doseRecommendation(state){
  const resolved=resolvedForState(state),quick=resolved.filter(r=>r.doseSeconds===60),full=resolved.filter(r=>r.doseSeconds>60);
  if(quick.length>=2&&full.length>=2){
    const q=avg(quick.map(r=>r.hourScore)),f=avg(full.map(r=>r.hourScore));
    return f>q+.35?{seconds:current.minutes*60,reason:`Your full doses averaged ${f.toFixed(1)}/5 versus ${q.toFixed(1)}/5 for quick doses.`}:{seconds:60,reason:`Your quick doses averaged ${q.toFixed(1)}/5 versus ${f.toFixed(1)}/5 for full doses.`};
  }
  return {seconds:60,reason:'Not enough comparable follow-ups yet. Quick remains the low-friction default.'};
}
function updatePersonalEvidence(){
  const stateRecords=recordsForState(selectedState),resolved=resolvedForState(selectedState),box=$('#personalEvidence');
  box.classList.remove('caution');
  if(!stateRecords.length){ box.innerHTML='<span class="label">YOUR EVIDENCE</span><strong>STATE starts at zero.</strong><p>After a few honest sessions, this space can show patterns from your own data—not universal claims.</p>'; return; }
  const shift=avg(stateRecords.filter(r=>Number.isFinite(r.after)).map(r=>r.before-r.after));
  const hour=avg(resolved.map(r=>r.hourScore));
  let copy=`${stateRecords.length} similar session${stateRecords.length===1?'':'s'}`;
  if(shift!==null) copy+=` · immediate shift ${shift>=0?'+':''}${shift.toFixed(1)}`;
  if(hour!==null) copy+=` · next-hour usefulness ${hour.toFixed(1)}/5`;
  const low=resolved.length>=3&&hour<2.7;
  if(low) box.classList.add('caution');
  box.innerHTML=`<span class="label">YOUR EVIDENCE · ${resolved.length} FOLLOW-UP${resolved.length===1?'':'S'}</span><strong>${low?'This condition may not be helping enough yet.':'A personal pattern is beginning.'}</strong><p>${copy}. This is observation, not proof. ${low?'Consider choosing another state or discussing persistent difficulty with appropriate support.':''}</p>`;
}
function chooseDose(seconds){
  selectedSeconds=seconds;
  $$('.dose-option').forEach(button=>button.classList.toggle('active',Number(button.dataset.seconds)===seconds));
  $('#beginDose').textContent=`Begin ${seconds===60?'60-second':seconds===15?'15-second test':'full'} dose →`;
}
function updateFormula(){
  $('#recognitionTitle').textContent=current.recognition; $('#recognitionText').textContent=current.recognitionText;
  $('#sceneName').textContent=current.name; $('#sceneNumber').textContent=current.number; $('#sceneUnit').textContent=current.unit;
  $('#recommendTitle').textContent=current.title; $('#recommendDescription').textContent=current.description;
  $('#formulaName').textContent=current.name; $('#formulaNumber').textContent=current.number; $('#formulaUnit').textContent=`${current.unit} · ${current.minutes} MINUTES`;
  $('#fullDoseLabel').textContent=`${current.minutes} minutes`; $$('.dose-option')[1].dataset.seconds=String(current.minutes*60);
  $('#scienceClaim').textContent=current.science; $('#scienceSource').href=current.source; $('#practiceFormula').textContent=`${current.name} ${current.number}`;
  document.documentElement.style.setProperty('--accent',current.accent); document.documentElement.style.setProperty('--accent2',current.accent2);
  updatePersonalEvidence(); const learned=doseRecommendation(selectedState); chooseDose(testSession?15:learned.seconds);
  $('#learningLimit').textContent=learned.reason+' Personal records guide the suggestion but do not establish causality or diagnosis.';
}
$$('.dose-option').forEach(button=>button.addEventListener('click',()=>{testSession=false;chooseDose(Number(button.dataset.seconds));}));

$('#continueButton').addEventListener('click',()=>{ if(!selectedState||$('#continueButton').disabled)return; updateFormula(); show(mode==='quick'?'recommendation':'recognition',mode==='quick'?'ONE CONDITION':'RECOGNITION'); });
$('#backToStates').addEventListener('click',()=>show('arrival','ARRIVE'));
$('#seeCondition').addEventListener('click',()=>show('recommendation','ONE CONDITION'));
$('#backRecommendation').addEventListener('click',()=>show(mode==='quick'?'arrival':'recognition',mode==='quick'?'ARRIVE':'RECOGNITION'));
before.addEventListener('input',()=>$('#beforeValue').textContent=before.value);
after.addEventListener('input',()=>{ $('#afterValue').textContent=after.value; updateShiftFeedback(); });
function updateShiftFeedback(){
  const shift=Number(before.value)-Number(after.value),el=$('#shiftFeedback'); el.className='shift-feedback';
  if(shift>0){el.classList.add('positive');el.textContent=`Intensity shifted by ${shift}. A small honest change is enough.`;}
  else if(shift===0){el.textContent='No change recorded. That is useful information—STATE will not disguise it.';}
  else {el.classList.add('negative');el.textContent=`Intensity increased by ${Math.abs(shift)}. Keep the result honest and choose support outside STATE if needed.`;}
}
