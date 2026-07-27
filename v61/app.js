(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const chapter = $('#chapterLabel');
  const toast = $('#toast');
  const screens = $$('[data-screen]');
  const practice = $('#practiceOverlay');

  const formulas = {
    overwhelmed: {
      stateLabel:'OVERWHELM', room:'mind', roomLabel:'Mind', formula:'FORMULA 002', name:'CALM', number:'10', unit:'GUIDED EXHALE · 10 MIN',
      recognition:'You do not need to solve everything from here.', text:'Let us create a little more space before deciding what comes next.',
      roomIntro:'The Inner Room is opening. The rest of the house can wait.', title:'Create a little more space.',
      description:'A gentle body-first practice using a comfortable longer exhale, sensory orientation and a clear return to the next kind action.',
      feel:['Breathing becomes slower and less effortful.','The moment feels less compressed.','The next choice becomes easier to see.'], mode:'breath', accent:'#9bcaff'
    },
    tense: {
      stateLabel:'TENSION', room:'body', roomLabel:'Body', formula:'FORMULA 006', name:'RELEASE', number:'05', unit:'BODY SOFTENING · 5 MIN',
      recognition:'Your body may be carrying the conversation for you.', text:'Before asking the mind for answers, let the muscles receive a different message.',
      roomIntro:'The Body Room is warming. Nothing else needs your attention yet.', title:'Let the body put something down.',
      description:'A short release sequence for jaw, shoulders, hands and breath—without forcing relaxation.',
      feel:['The jaw and shoulders become easier to notice.','Effort becomes more voluntary.','Physical tension may soften enough for a clearer choice.'], mode:'release', accent:'#ee785f'
    },
    scattered: {
      stateLabel:'SCATTER', room:'mind', roomLabel:'Mind', formula:'FORMULA 001', name:'FOCUS', number:'25', unit:'ONE VISIBLE OUTCOME · 25 MIN',
      recognition:'Your attention may need fewer doors, not more motivation.', text:'We will make one useful action more visible than the surrounding noise.',
      roomIntro:'The Inner Room is narrowing into one clear line.', title:'Make one outcome visible.',
      description:'A finite work room that removes exits, names one observable result and begins before motivation arrives.',
      feel:['Competing tasks lose visual priority.','The next action becomes concrete.','Progress replaces mental rehearsal.'], mode:'focus', accent:'#f08a66'
    },
    flat: {
      stateLabel:'FLATNESS', room:'body', roomLabel:'Body', formula:'FORMULA 007', name:'WALK', number:'20', unit:'MOVEMENT + PERSPECTIVE · 20 MIN',
      recognition:'You may not need a better thought before you move.', text:'Let light, rhythm and a changing horizon meet you outside the screen.',
      roomIntro:'The Body Room is opening toward daylight and movement.', title:'Let the world move around you.',
      description:'An outdoor walking ritual that combines movement, visual distance and a deliberate break from cognitive fixation.',
      feel:['Energy may rise gradually rather than dramatically.','Attention widens beyond the problem.','A stuck thought may become less total.'], mode:'walk', accent:'#9bcfa6'
    },
    avoidant: {
      stateLabel:'AVOIDANCE', room:'mind', roomLabel:'Mind', formula:'FORMULA 003', name:'COURAGE', number:'01', unit:'ONE BRAVE ACT · 15 MIN',
      recognition:'Fear does not need to disappear before action begins.', text:'We will shrink the threshold until the first honest movement fits inside this minute.',
      roomIntro:'The Inner Room is becoming a doorway rather than a debate.', title:'Cross one visible threshold.',
      description:'A tiny-action ritual for beginning the necessary thing while fear is still present.',
      feel:['The feared task becomes specific.','The first action becomes smaller than the story around it.','Completion becomes observable.'], mode:'courage', accent:'#c7b7ff'
    },
    lonely: {
      stateLabel:'LONELINESS', room:'love', roomLabel:'Relationships', formula:'FORMULA 004', name:'CONNECT', number:'02', unit:'TWO REAL QUESTIONS · 20 MIN',
      recognition:'Longing for connection is not a personal defect.', text:'Let us make one safe bridge toward another person—not an audience.',
      roomIntro:'The Relationship Room is setting two chairs across from each other.', title:'Make one safe bridge.',
      description:'A consent-based invitation into honest attention, two real questions and listening without immediately fixing.',
      feel:['Isolation becomes a specific need.','One safe person becomes easier to identify.','Connection becomes an action rather than a vague wish.'], mode:'connect', accent:'#e9c968'
    }
  };

  let selectedState = 'overwhelmed';
  let current = formulas[selectedState];
  let practiceTimer = null;
  let remaining = 60;
  let paused = false;
  let practiceStartedAt = null;
  let beforeIntensity = 7;

  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__thresholdToast);
    window.__thresholdToast = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  const showScreen = (id, label) => {
    screens.forEach(screen => screen.classList.toggle('hidden', screen.id !== id));
    chapter.textContent = `THE THRESHOLD / ${label}`;
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const updateRecognition = () => {
    current = formulas[selectedState];
    $('#recognitionTitle').textContent = current.recognition;
    $('#recognitionText').textContent = current.text;
    $('#namedState').textContent = current.stateLabel;
    const field = $('#feelingField');
    field.style.filter = selectedState === 'scattered' ? 'blur(.8px)' : 'none';
  };

  const updateHouse = () => {
    $('#roomIntro').textContent = current.roomIntro;
    const sanctuary = $('#sanctuary');
    sanctuary.dataset.room = current.room;
    sanctuary.querySelector('.room-glow').style.background = `linear-gradient(180deg,${current.accent},rgba(248,243,233,.55))`;
    $('#vesselMeta').textContent = current.formula;
    $('#vesselName').textContent = current.name;
    $('#vesselNumber').textContent = current.number;
    $('#vesselUnit').textContent = current.unit.split(' · ')[0];
    const vessel = $('#formulaVessel');
    vessel.style.background = `linear-gradient(155deg,rgba(248,243,233,.96),${current.accent})`;
    $$('.room-key span').forEach(item => item.classList.toggle('active', item.textContent.trim().toLowerCase() === current.roomLabel.toLowerCase()));
  };

  const understandMarkup = item => {
    const science = item.mode === 'breath'
      ? 'Exhale-emphasised slow breathing may influence respiratory rate and cardiac autonomic regulation.'
      : item.mode === 'focus'
        ? 'Constraining task scope and reducing external distractions are behavioural mechanisms; STATE does not claim to read attention networks.'
        : item.mode === 'walk'
          ? 'Walking combines physical activity, changing sensory input and environmental context. Effects depend on duration, setting and the person.'
          : item.mode === 'connect'
            ? 'Perceived social support and responsive listening are associated with wellbeing; this ritual does not guarantee safety or repair.'
            : item.mode === 'courage'
              ? 'Approach behaviour can reduce avoidance over time, but safety, consent and context determine whether an action is appropriate.'
              : 'Gentle awareness and voluntary release may change perceived tension; STATE does not measure muscle activity or clinical symptoms.';
    return `<p class="panel-number">02</p><h3>Science, lineage, limits</h3><div class="evidence-lanes"><article><span>SCIENCE</span><b>Bounded claim</b><p>${science}</p>${item.mode === 'breath' ? '<a href="https://pubmed.ncbi.nlm.nih.gov/36630953/" target="_blank" rel="noreferrer">Source example · PMID 36630953 ↗</a>' : '<a href="../docs/v6-source-standard.md">Review standard ↗</a>'}</article><article><span>WISDOM</span><b>Context required</b><p>When a practice comes from a contemplative or cultural tradition, STATE names the adaptation and keeps its ethical context visible.</p><a href="../docs/v6-source-standard.md">Read the source standard ↗</a></article><article><span>LIMIT</span><b>Not measured</b><p>STATE did not measure hormones, neurotransmitters or brain activation. Visual systems are explanatory models, not live scans.</p></article></div>`;
  };

  const updateFormula = () => {
    $('#objectFormula').textContent = `STATE / ${current.formula}`;
    $('#objectName').textContent = current.name;
    $('#objectNumber').textContent = current.number;
    $('#objectUnit').textContent = current.unit;
    $('#formulaTitle').textContent = current.title;
    $('#formulaDescription').textContent = current.description;
    $('#feelList').innerHTML = current.feel.map(line => `<li>${line}</li>`).join('');
    $('#formulaObject').querySelector('.object-body').style.background = `linear-gradient(145deg,#f8f3e9,${current.accent} 68%,#c7b7ff)`;
    $('[data-panel="understand"]').innerHTML = understandMarkup(current);
    $('#beginPractice').textContent = current.mode === 'breath' ? 'Begin 60-second preview' : 'Begin one-minute threshold';
  };

  $$('.state-star').forEach(button => button.addEventListener('click', () => {
    selectedState = button.dataset.state;
    updateRecognition();
    showScreen('recognition','RECOGNITION');
  }));

  $('#chooseAgain').addEventListener('click', () => showScreen('arrival','ARRIVAL'));
  $('#enterHouse').addEventListener('click', () => { updateHouse(); showScreen('houseScreen','THE HOUSE'); });
  $('#formulaVessel').addEventListener('click', () => { updateFormula(); showScreen('formulaScreen','ONE CONDITION'); });

  $$('.formula-tabs button').forEach(button => button.addEventListener('click', () => {
    $$('.formula-tabs button').forEach(item => item.classList.toggle('active', item === button));
    $$('.formula-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === button.dataset.tab));
  }));

  const beforeRange = $('#beforeIntensity');
  beforeRange.addEventListener('input', () => { $('#beforeValue').textContent = beforeRange.value; beforeIntensity = Number(beforeRange.value); });
  const afterRange = $('#afterIntensity');
  afterRange.addEventListener('input', () => {
    $('#afterValue').textContent = afterRange.value;
    const shift = beforeIntensity - Number(afterRange.value);
    $('#shiftMessage').textContent = shift > 0 ? `Intensity shifted by ${shift}. Small changes still count.` : shift === 0 ? 'No measured shift. Honest results still teach us.' : 'Intensity rose. That matters and should not be disguised.';
  });

  const formatTime = seconds => `00:${String(Math.max(0,seconds)).padStart(2,'0')}`;
  const updatePracticeVisual = () => {
    const elapsed = 60 - remaining;
    const visual = $('#breathVisual');
    const phase = $('#breathPhase');
    const count = $('#breathCount');
    const guide = $('#breathGuidance');

    if (current.mode === 'breath') {
      const cycle = elapsed % 10;
      const inhale = cycle < 4;
      visual.dataset.phase = inhale ? 'inhale' : 'exhale';
      phase.textContent = inhale ? 'INHALE' : 'EXHALE';
      count.textContent = inhale ? Math.max(1,4-cycle) : Math.max(1,10-cycle);
      guide.textContent = inhale ? 'Inhale gently. Do not pull in more air than feels easy.' : 'Exhale softly and a little longer. Let the jaw and shoulders release.';
      return;
    }

    visual.dataset.phase = 'inhale';
    phase.textContent = current.name;
    count.textContent = remaining;
    const guidance = {
      focus:'Open the exact place where the work begins. Choose only the next visible action.',
      walk:'Stand up. Find daylight if available. Let the first steps happen before the analysis.',
      courage:'Make the threshold smaller. Open it, dial it, or write the first honest line.',
      connect:'Choose one reasonably safe person. Write one specific, pressure-free invitation.',
      release:'Notice jaw, shoulders and hands. Release only what can soften without force.'
    };
    guide.textContent = guidance[current.mode] || 'Begin one small observable action.';
  };

  const beginPractice = () => {
    beforeIntensity = Number(beforeRange.value);
    remaining = 60; paused = false; practiceStartedAt = new Date().toISOString();
    practice.classList.remove('hidden');
    practice.setAttribute('aria-hidden','false');
    document.body.classList.add('locked');
    $('#practiceTime').textContent = formatTime(remaining);
    $('#pausePractice').textContent = 'Pause';
    updatePracticeVisual();
    clearInterval(practiceTimer);
    practiceTimer = setInterval(() => {
      if (paused) return;
      remaining -= 1;
      $('#practiceTime').textContent = formatTime(remaining);
      updatePracticeVisual();
      if (remaining <= 0) finishPractice('completed');
    },1000);
  };

  const finishPractice = status => {
    clearInterval(practiceTimer);
    practice.classList.add('hidden');
    practice.setAttribute('aria-hidden','true');
    document.body.classList.remove('locked');
    const record = {state:selectedState,formula:`${current.name} ${current.number}`,status,startedAt:practiceStartedAt,finishedAt:new Date().toISOString(),beforeIntensity};
    try {
      const records = JSON.parse(localStorage.getItem('state-threshold-sessions') || '[]');
      records.push(record);
      localStorage.setItem('state-threshold-sessions',JSON.stringify(records.slice(-50)));
    } catch {}
    afterRange.value = Math.max(1,beforeIntensity-3);
    $('#afterValue').textContent = afterRange.value;
    $('#shiftMessage').textContent = 'A shift does not need to be dramatic to be useful.';
    showScreen('returnScreen','RETURN');
  };

  $('#beginPractice').addEventListener('click', beginPractice);
  $('#pausePractice').addEventListener('click', () => { paused = !paused; $('#pausePractice').textContent = paused ? 'Resume gently' : 'Pause'; });
  $('#finishPractice').addEventListener('click', () => finishPractice('completed-early'));
  $('#exitPractice').addEventListener('click', () => {
    if (confirm('End the practice and return to an honest reflection?')) finishPractice('exited');
  });

  const depart = () => {
    clearInterval(practiceTimer);
    document.body.classList.remove('locked');
    document.body.innerHTML = `<main style="min-height:100vh;background:#11140f;color:#f8f3e9;display:grid;place-items:center;padding:30px;text-align:center;font-family:Inter,system-ui,sans-serif"><section><div style="width:54px;height:54px;border-radius:50%;background:#dcff58;color:#11140f;display:grid;place-items:center;margin:0 auto 30px;font:13px monospace">S</div><p style="font:10px monospace;letter-spacing:.14em">STATE HAS ENDED</p><h1 style="font:clamp(55px,9vw,120px)/.88 Georgia,serif;letter-spacing:-.06em;margin:25px 0">Go use<br>the hour.</h1><p style="color:rgba(248,243,233,.65);font-size:18px;line-height:1.6">Close this tab. The next useful place is outside STATE.</p><button onclick="location.reload()" style="margin-top:25px;border:1px solid #f8f3e9;border-radius:999px;background:transparent;color:#f8f3e9;padding:12px 17px;font-weight:800;cursor:pointer">Return later</button></section></main>`;
    document.title = 'STATE has ended — go use the hour';
  };

  $('#exitToLife').addEventListener('click', depart);
  $('#leaveButton').addEventListener('click', depart);

  updateRecognition();
})();
