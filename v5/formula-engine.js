(() => {
  const STORAGE_KEY = 'state-v5-sessions';
  const formulas = {
    focus: {name:'FOCUS 25',number:'25',formula:'FORMULA 001',minutes:25,previewSeconds:60,description:'A finite room for moving one visible task from resistance into motion.',intro:'Attention becomes easier when the outcome is visible and the exits are closed.',prompt:'What visible result should exist when this dose ends?',placeholder:'Example: Send the first complete draft of my application.',beforeLabel:'How strong is the resistance right now?',afterLabel:'How strong is the resistance now?',prep:[['Choose one outcome','Anything else can wait until the dose ends.'],['Close the exits','Silence notifications and remove unrelated tabs.'],['Make the first move obvious','Open the exact document, tool or page you need.']],dosePrompts:['Begin before motivation arrives.','Only the next visible action.','When attention wanders, return without punishment.'],returnLine:'Use the remaining momentum before opening another feed.',safety:'This is a productivity ritual, not a treatment for attention disorders.'},
    calm: {name:'CALM 10',number:'10',formula:'FORMULA 002',minutes:10,previewSeconds:60,description:'A body-first reset for lowering intensity before choosing what comes next.',intro:'You do not have to solve the entire universe while your nervous system is sounding the alarm.',prompt:'Where do you notice the overload most clearly?',placeholder:'Example: Tight chest, rushing thoughts, clenched jaw.',beforeLabel:'How intense does this moment feel?',afterLabel:'How intense does this moment feel now?',prep:[['Let the ground hold you','Place both feet or your body against a stable surface.'],['Reduce one stimulus','Lower sound, brightness or visual clutter if possible.'],['Release the performance','There is nothing to achieve during this dose.']],dosePrompts:['Inhale gently. Let the exhale be a little longer.','Notice three neutral things you can see.','Let the body receive the message: this moment is here, and you are here.'],returnLine:'Choose the next kind action, not the fastest reaction.',safety:'STATE is not crisis support. In immediate danger or severe distress, contact local emergency or professional support.'},
    courage: {name:'COURAGE 01',number:'01',formula:'FORMULA 003',minutes:15,previewSeconds:45,description:'A tiny-action ritual for doing the necessary thing while fear is still present.',intro:'Courage does not require fear to disappear. It requires the next action to become smaller than the story around it.',prompt:'What necessary action are you avoiding?',placeholder:'Example: Open the email and write the first honest sentence.',beforeLabel:'How strong is the avoidance right now?',afterLabel:'How strong is the avoidance now?',prep:[['Name the feared moment','Be specific: rejection, embarrassment, conflict, uncertainty.'],['Shrink the action','Reduce it to something that can begin in under sixty seconds.'],['Keep consent intact','Bravery never requires entering an unsafe situation.']],dosePrompts:['Five breaths. Then cross the threshold.','Open it. Dial it. Write the first line.','Fear may come with you; it does not get the steering wheel.'],returnLine:'Do not negotiate with the completed first step. Let it be real.',safety:'Do not use this ritual to pressure yourself into danger, coercion or contact with an unsafe person.'},
    connection: {name:'TWO QUESTIONS',number:'02',formula:'FORMULA 004',minutes:20,previewSeconds:90,description:'A guided conversation that makes it safer to be known and to listen.',intro:'Connection is not maximum disclosure. It is mutual consent, honest attention and enough safety for one real exchange.',prompt:'Who feels safe enough to invite into a more genuine conversation?',placeholder:'Their name, or “someone I trust”.',beforeLabel:'How disconnected do you feel right now?',afterLabel:'How disconnected do you feel now?',prep:[['Ask for consent','Both people should be free to decline or stop.'],['Remove divided attention','Put away the second screen and face one another if possible.'],['Listen without fixing','Understanding comes before advice.']],dosePrompts:['Question one: What has been taking up more space inside you than people realise?','Listen until they are finished. Do not prepare your reply.','Question two: What would make the coming week feel a little more supported?'],returnLine:'Let the conversation remain human. It does not need a perfect conclusion.',safety:'Choose someone reasonably safe. This ritual is not suitable for abusive, coercive or threatening relationships.'},
    purpose: {name:'ONE GOOD DEED',number:'01',formula:'FORMULA 005',minutes:30,previewSeconds:60,description:'A service ritual that turns care into one completed useful action.',intro:'Purpose grows less from thinking about being useful and more from becoming useful to someone specific.',prompt:'Who or what could benefit from one bounded act today?',placeholder:'Example: My neighbour, an animal shelter, the park outside.',beforeLabel:'How far does your care feel from concrete action?',afterLabel:'How far does your care feel from action now?',prep:[['Choose one beneficiary','A person, animal, place or cause—not “the whole world”.'],['Confirm the action is useful','Help should respond to a real need, not only our wish to help.'],['Bound the contribution','Choose something honest that can be completed in this session.']],dosePrompts:['Complete one useful act, quietly and fully.','Prefer concrete help over symbolic busyness.','Leave the beneficiary with more agency, not more dependence.'],returnLine:'Let contribution become evidence that care can move through you.',safety:'Respect consent, local rules and the wishes of the people or communities you intend to support.'}
  };

  const labelToKey = {'FOCUS 25':'focus','CALM 10':'calm','COURAGE 01':'courage','TWO QUESTIONS':'connection','ONE GOOD DEED':'purpose'};
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const makeId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  if (!document.querySelector('link[href$="experience.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../brand/experience.css';
    document.head.appendChild(link);
  }

  document.body.insertAdjacentHTML('beforeend', `
    <section class="experience" id="experience" aria-hidden="true" data-formula="focus">
      <header class="experience-top">
        <div class="experience-lockup"><i>S</i><span>STATE</span></div>
        <div class="experience-phase" id="experiencePhase">FORMULA / ARRIVE</div>
        <button class="experience-exit" id="experienceExit">Exit honestly</button>
        <div class="experience-progress"><span id="experienceProgress"></span></div>
      </header>
      <div class="experience-main" id="experienceMain"></div>
      <footer class="experience-footer"><span>Finite by design · private on this device</span><span id="experienceFooterState">Human states, consciously designed.</span></footer>
    </section>`);

  const experience = $('#experience');
  const experienceMain = $('#experienceMain');
  const phaseLabel = $('#experiencePhase');
  const progressBar = $('#experienceProgress');
  const footerState = $('#experienceFooterState');
  let currentKey = 'focus';
  let currentFormula = formulas.focus;
  let currentSession = null;
  let currentPhase = 'arrive';
  let timer = null;
  let remaining = 0;
  let totalSeconds = 0;
  let paused = false;
  let promptIndex = 0;
  const phaseProgress = {arrive:14,prepare:34,dose:66,reflect:86,receipt:100};

  function showToast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.__stateV5Toast);
    window.__stateV5Toast = setTimeout(() => el.classList.remove('show'), 2800);
  }

  function visualMarkup(key) {
    return `<aside class="experience-art" aria-hidden="true"><span class="experience-art-label">${formulas[key].formula}<br>${escapeHTML(formulas[key].name)}</span><div class="state-symbol symbol-${key}"><i></i></div><span class="experience-art-number">${formulas[key].number}</span></aside>`;
  }

  function setPhase(name) {
    currentPhase = name;
    phaseLabel.textContent = `${currentFormula.formula} / ${name.toUpperCase()}`;
    progressBar.style.width = `${phaseProgress[name]}%`;
    footerState.textContent = `${currentFormula.name} · ${currentFormula.minutes} minute full dose`;
    experience.scrollTo({top:0,behavior:'smooth'});
  }

  function openExperience(key) {
    clearInterval(timer);
    currentKey = formulas[key] ? key : 'focus';
    currentFormula = formulas[currentKey];
    currentSession = {id:makeId(),formula:currentKey,formulaName:currentFormula.name,createdAt:new Date().toISOString(),status:'started'};
    experience.dataset.formula = currentKey;
    experience.classList.add('open');
    experience.setAttribute('aria-hidden','false');
    document.body.classList.add('experience-open');
    renderArrive();
  }

  function closeExperience() {
    clearInterval(timer);
    document.title = 'STATE V5 — The Human Starter Pack';
    experience.classList.remove('open');
    experience.setAttribute('aria-hidden','true');
    document.body.classList.remove('experience-open');
  }

  function renderArrive() {
    setPhase('arrive');
    experienceMain.className = 'experience-main';
    const titleParts = currentFormula.name.split(' ');
    experienceMain.innerHTML = `<section class="experience-copy"><p class="experience-kicker">Arrive honestly</p><h1>${escapeHTML(titleParts[0])}<br><em>${escapeHTML(titleParts.slice(1).join(' ') || '01')}</em></h1><p class="experience-intro">${escapeHTML(currentFormula.intro)}</p><form class="experience-panel" id="arriveForm"><div class="experience-field"><label for="sessionContext">${escapeHTML(currentFormula.prompt)}</label><textarea id="sessionContext" required minlength="3" placeholder="${escapeHTML(currentFormula.placeholder)}"></textarea></div><div class="experience-field"><label for="beforeRating">${escapeHTML(currentFormula.beforeLabel)}</label><div class="range-row"><input id="beforeRating" type="range" min="1" max="10" value="6"><output class="range-value" id="beforeValue">6</output></div><small>1 = very little · 10 = extremely strong</small></div><fieldset class="experience-field"><legend>Choose the dose length</legend><div class="mode-grid"><label class="choice"><input type="radio" name="doseMode" value="preview" checked><span>${currentFormula.previewSeconds}-second preview</span></label><label class="choice"><input type="radio" name="doseMode" value="full"><span>Full ${currentFormula.minutes}-minute dose</span></label></div></fieldset><p class="micro">${escapeHTML(currentFormula.safety)}</p><div class="experience-actions"><button class="button state" type="submit">Prepare the dose →</button></div></form></section>${visualMarkup(currentKey)}`;
    const range = $('#beforeRating');
    range.addEventListener('input', () => $('#beforeValue').textContent = range.value);
    $('#arriveForm').addEventListener('submit', event => {
      event.preventDefault();
      const context = $('#sessionContext').value.trim();
      if (context.length < 3) return showToast('Make the intention a little more specific.');
      const data = new FormData(event.currentTarget);
      Object.assign(currentSession,{context,beforeRating:Number(range.value),doseMode:data.get('doseMode')});
      renderPrepare();
    });
    setTimeout(() => $('#sessionContext')?.focus(),80);
  }

  function renderPrepare() {
    setPhase('prepare');
    const prep = currentFormula.prep.map(item => `<label class="prep-item"><input type="checkbox" data-prep><span><strong>${escapeHTML(item[0])}</strong><span>${escapeHTML(item[1])}</span></span></label>`).join('');
    experienceMain.innerHTML = `<section class="experience-copy"><p class="experience-kicker">Prepare the conditions</p><h1>Make the<br><em>state possible.</em></h1><p class="experience-intro">The ritual begins before the timer. Small environmental changes often matter more than another speech about willpower.</p><div class="experience-panel"><div class="prep-list">${prep}</div><div class="experience-actions"><button class="button" id="backToArrive">← Back</button><button class="button state" id="enterDose" disabled>Enter ${escapeHTML(currentFormula.name)}</button></div></div></section>${visualMarkup(currentKey)}`;
    const checks = $$('[data-prep]');
    const button = $('#enterDose');
    checks.forEach(check => check.addEventListener('change', () => button.disabled = !checks.every(item => item.checked)));
    $('#backToArrive').addEventListener('click',renderArrive);
    button.addEventListener('click',beginDose);
  }

  function beginDose() {
    setPhase('dose');
    totalSeconds = currentSession.doseMode === 'preview' ? currentFormula.previewSeconds : currentFormula.minutes * 60;
    remaining = totalSeconds; paused = false; promptIndex = 0;
    Object.assign(currentSession,{startedAt:new Date().toISOString(),status:'active'});
    experienceMain.className = 'experience-main dose-room';
    experienceMain.innerHTML = `<section class="experience-copy" style="max-width:none;grid-column:1/-1"><p class="experience-kicker">${escapeHTML(currentFormula.name)} · ${currentSession.doseMode === 'preview' ? 'preview' : 'full dose'}</p><div class="dose-timer" id="doseTimer">${formatTime(remaining)}</div><p class="dose-prompt" id="dosePrompt">${escapeHTML(currentFormula.dosePrompts[0])}</p><p class="dose-subprompt">${escapeHTML(currentSession.context)}</p><div class="experience-actions"><button class="button" id="pauseDose">Pause</button><button class="button state" id="completeDose">The action is complete</button></div></section>`;
    $('#pauseDose').addEventListener('click',togglePause);
    $('#completeDose').addEventListener('click',() => finishDose('completed-early'));
    renderTimer(); timer = setInterval(tick,1000);
  }

  const formatTime = seconds => `${String(Math.floor(Math.max(0,seconds)/60)).padStart(2,'0')}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`;
  function renderTimer(){const el=$('#doseTimer');if(el)el.textContent=formatTime(remaining);document.title=`${formatTime(remaining)} — ${currentFormula.name}`}
  function tick(){if(paused)return;remaining-=1;renderTimer();const elapsed=totalSeconds-remaining;const next=Math.min(currentFormula.dosePrompts.length-1,Math.floor(elapsed/Math.max(1,totalSeconds/currentFormula.dosePrompts.length)));if(next!==promptIndex){promptIndex=next;const prompt=$('#dosePrompt');if(prompt)prompt.textContent=currentFormula.dosePrompts[promptIndex]}if(remaining<=0)finishDose('completed')}
  function togglePause(){paused=!paused;$('#pauseDose').textContent=paused?'Resume gently':'Pause';$('#dosePrompt').textContent=paused?'Paused without punishment.':currentFormula.dosePrompts[promptIndex]}
  function finishDose(status){clearInterval(timer);Object.assign(currentSession,{status,finishedAt:new Date().toISOString(),durationSeconds:Math.max(0,totalSeconds-remaining)});document.title='STATE V5 — The Human Starter Pack';renderReflect()}

  function renderReflect() {
    setPhase('reflect'); experienceMain.className='experience-main';
    experienceMain.innerHTML = `<section class="experience-copy"><p class="experience-kicker">Return to real life</p><h1>What<br><em>actually changed?</em></h1><p class="experience-intro">No forced positivity. Useful products learn from the sessions that did not work, too.</p><form class="experience-panel" id="reflectForm"><fieldset class="experience-field"><legend>Did the intended outcome happen?</legend><div class="outcome-grid"><label class="choice"><input type="radio" name="outcome" value="yes" required><span>Yes</span></label><label class="choice"><input type="radio" name="outcome" value="partly"><span>Partly</span></label><label class="choice"><input type="radio" name="outcome" value="no"><span>Not yet</span></label></div></fieldset><div class="experience-field"><label for="afterRating">${escapeHTML(currentFormula.afterLabel)}</label><div class="range-row"><input id="afterRating" type="range" min="1" max="10" value="4"><output class="range-value" id="afterValue">4</output></div></div><fieldset class="experience-field"><legend>Did this improve the next hour of your actual life?</legend><div class="score-grid">${[1,2,3,4,5].map(n=>`<label class="choice"><input type="radio" name="score" value="${n}" ${n===4?'checked':''}><span>${n}</span></label>`).join('')}</div></fieldset><div class="experience-field"><label for="sessionNote">One private note <span style="font-weight:400">(optional)</span></label><textarea id="sessionNote" placeholder="What helped, or what got in the way?"></textarea><small>Stored only in this browser unless you export it.</small></div><div class="experience-actions"><button class="button state" type="submit">Save honest result →</button></div></form></section>${visualMarkup(currentKey)}`;
    const range=$('#afterRating');range.addEventListener('input',()=>$('#afterValue').textContent=range.value);
    $('#reflectForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);if(!data.get('outcome'))return showToast('Choose the most honest outcome.');Object.assign(currentSession,{outcome:data.get('outcome'),afterRating:Number(range.value),nextHourScore:Number(data.get('score')),note:$('#sessionNote').value.trim(),savedAt:new Date().toISOString()});currentSession.proofId=simpleHash(JSON.stringify(currentSession));const sessions=loadSessions();sessions.push(currentSession);saveSessions(sessions);renderReceipt()});
  }

  function renderReceipt() {
    setPhase('receipt');
    const shift=currentSession.beforeRating-currentSession.afterRating;
    const outcomeText={yes:'The intended outcome happened.',partly:'Something meaningful moved.',no:'The result was honest, not manufactured.'}[currentSession.outcome];
    experienceMain.className='experience-main';
    experienceMain.innerHTML=`<section class="experience-copy"><p class="experience-kicker">Private proof receipt</p><h1>Return<br><em>stronger.</em></h1><p class="experience-intro">${escapeHTML(outcomeText)} ${escapeHTML(currentFormula.returnLine)}</p><div class="receipt"><p class="micro">${escapeHTML(currentFormula.formula)} / LOCAL RESULT</p><div class="receipt-grid"><div class="receipt-item"><span>Formula</span><strong>${escapeHTML(currentFormula.name)}</strong></div><div class="receipt-item"><span>Outcome</span><strong>${escapeHTML(currentSession.outcome)}</strong></div><div class="receipt-item"><span>State shift</span><strong>${currentSession.beforeRating} → ${currentSession.afterRating} (${shift>=0?'-'+shift:'+'+Math.abs(shift)})</strong></div><div class="receipt-item"><span>Next hour</span><strong>${currentSession.nextHourScore}/5</strong></div></div><p class="proof-id">${escapeHTML(currentSession.proofId)} · This receipt proves only that this browser recorded a session. It is not an ownership claim or scientific evidence.</p><div class="experience-actions"><button class="button" id="exportSession">Export result</button><button class="button state" id="finishExperience">Close STATE and use the hour</button></div></div></section>${visualMarkup(currentKey)}`;
    $('#exportSession').addEventListener('click',exportCurrentSession);$('#finishExperience').addEventListener('click',closeExperience);
  }

  function simpleHash(text){let hash=2166136261;for(let i=0;i<text.length;i+=1){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)}return`STATE-V5-${(hash>>>0).toString(16).toUpperCase().padStart(8,'0')}`}
  function loadSessions(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
  function saveSessions(sessions){localStorage.setItem(STORAGE_KEY,JSON.stringify(sessions))}
  function exportCurrentSession(){const blob=new Blob([JSON.stringify(currentSession,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`${currentSession.proofId.toLowerCase()}.json`;link.click();URL.revokeObjectURL(url);showToast('Result exported. Sharing remains your choice.')}

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-dose],#beginRecommended');
    if (!button) return;
    const label = button.dataset.dose || $('#resultName')?.textContent || 'FOCUS 25';
    const key = labelToKey[label] || 'focus';
    event.preventDefault();
    event.stopImmediatePropagation();
    openExperience(key);
  }, true);

  $('#experienceExit').addEventListener('click',()=>{if(currentPhase==='dose'&&currentSession?.status==='active'){if(confirm('End this dose and continue to an honest reflection?'))finishDose('exited');return}if(currentPhase==='receipt')return closeExperience();if(confirm('Leave this formula? Unsaved progress will stay private and be discarded.'))closeExperience()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&experience.classList.contains('open'))$('#experienceExit').click()});
  window.addEventListener('beforeunload',event=>{if(currentSession?.status==='active'){event.preventDefault();event.returnValue=''}});
})();