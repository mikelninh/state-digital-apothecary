const STORAGE_KEY = 'state-v4-sessions';
const screens = [...document.querySelectorAll('[data-screen]')];
const progress = document.getElementById('progress');
const phaseLabel = document.getElementById('phaseLabel');
const steps = { landing: 0, before: 20, prepare: 40, dose: 65, after: 85, receipt: 100 };
let modeSeconds = 25 * 60;
let remaining = modeSeconds;
let interval = null;
let paused = false;
let startedAt = null;
let currentSession = {};
let latestResult = null;

function showScreen(name) {
  screens.forEach(s => s.classList.toggle('active', s.dataset.screen === name));
  progress.style.width = `${steps[name]}%`;
  phaseLabel.textContent = name === 'landing' ? 'V4 / FIRST REAL DOSE' : `FOCUS 25 / ${name.toUpperCase()}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function updateMetrics() {
  const sessions = loadSessions();
  document.getElementById('metricSessions').textContent = sessions.length;
  if (!sessions.length) {
    document.getElementById('metricCompletion').textContent = '—';
    document.getElementById('metricScore').textContent = '—';
    return;
  }
  const completed = sessions.filter(s => s.status === 'completed').length;
  const scored = sessions.filter(s => Number.isFinite(s.nextHourScore));
  document.getElementById('metricCompletion').textContent = `${Math.round(completed / sessions.length * 100)}%`;
  document.getElementById('metricScore').textContent = scored.length ? `${(scored.reduce((a,s) => a + s.nextHourScore, 0) / scored.length).toFixed(1)}/5` : '—';
}

function startJourney(preview = false) {
  modeSeconds = preview ? 60 : 25 * 60;
  currentSession = { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, preview, createdAt: new Date().toISOString() };
  showScreen('before');
  document.getElementById('task').focus();
}

document.querySelectorAll('[data-action="begin"]').forEach(b => b.addEventListener('click', () => startJourney(false)));
document.querySelectorAll('[data-action="preview"]').forEach(b => b.addEventListener('click', () => startJourney(true)));
document.querySelectorAll('[data-action="home"], [data-action="finish"]').forEach(b => b.addEventListener('click', () => { clearInterval(interval); showScreen('landing'); updateMetrics(); }));
document.querySelector('[data-action="back-before"]').addEventListener('click', () => showScreen('before'));

const resistanceBefore = document.getElementById('resistanceBefore');
resistanceBefore.addEventListener('input', () => document.getElementById('resistanceBeforeValue').textContent = resistanceBefore.value);
const resistanceAfter = document.getElementById('resistanceAfter');
resistanceAfter.addEventListener('input', () => document.getElementById('resistanceAfterValue').textContent = resistanceAfter.value);

document.getElementById('beforeForm').addEventListener('submit', event => {
  event.preventDefault();
  const task = document.getElementById('task').value.trim();
  if (task.length < 5) { toast('Make the outcome a little more specific.'); return; }
  currentSession.task = task;
  currentSession.resistanceBefore = Number(resistanceBefore.value);
  currentSession.energy = new FormData(event.currentTarget).get('energy');
  document.getElementById('doseTask').textContent = task;
  showScreen('prepare');
});

const prepChecks = [...document.querySelectorAll('.prep-check')];
prepChecks.forEach(check => check.addEventListener('change', () => {
  const done = prepChecks.filter(c => c.checked).length;
  const button = document.getElementById('enterDose');
  button.disabled = done !== prepChecks.length;
  document.getElementById('prepStatus').textContent = done === prepChecks.length ? 'The exits are closed. Begin gently.' : `${done}/3 prepared`;
}));

function renderTimer() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  document.getElementById('timer').textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  document.title = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')} — FOCUS 25`;
}

function beginDose() {
  remaining = modeSeconds;
  paused = false;
  startedAt = Date.now();
  currentSession.startedAt = new Date(startedAt).toISOString();
  currentSession.status = 'active';
  document.getElementById('doseModeLabel').textContent = currentSession.preview ? '60-second preview' : '25-minute dose';
  document.getElementById('pauseButton').textContent = 'Pause';
  document.getElementById('doseMessage').textContent = 'Begin before motivation arrives.';
  renderTimer();
  showScreen('dose');
  clearInterval(interval);
  interval = setInterval(() => {
    if (paused) return;
    remaining -= 1;
    renderTimer();
    if (remaining <= 0) finishDose('completed');
  }, 1000);
}

document.getElementById('enterDose').addEventListener('click', beginDose);
document.getElementById('pauseButton').addEventListener('click', () => {
  paused = !paused;
  document.getElementById('pauseButton').textContent = paused ? 'Resume' : 'Pause';
  document.getElementById('doseMessage').textContent = paused ? 'Paused without punishment.' : 'Return to the next visible action.';
});
document.getElementById('completeEarly').addEventListener('click', () => finishDose('completed'));
document.getElementById('exitDose').addEventListener('click', () => {
  if (confirm('End this dose and record an honest incomplete session?')) finishDose('exited');
});

function finishDose(status) {
  clearInterval(interval);
  currentSession.status = status;
  currentSession.durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  currentSession.finishedAt = new Date().toISOString();
  document.title = 'STATE V4 — FOCUS 25';
  showScreen('after');
}

function simpleHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) { hash ^= text.charAt(i).charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return `STATE-${(hash >>> 0).toString(16).toUpperCase().padStart(8,'0')}`;
}

document.getElementById('afterForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  currentSession.outcome = data.get('outcome');
  currentSession.resistanceAfter = Number(resistanceAfter.value);
  currentSession.nextHourScore = Number(data.get('score'));
  currentSession.note = document.getElementById('note').value.trim();
  currentSession.savedAt = new Date().toISOString();
  currentSession.proofId = simpleHash(JSON.stringify(currentSession));
  const sessions = loadSessions();
  sessions.push(currentSession);
  saveSessions(sessions);
  latestResult = currentSession;
  document.getElementById('receiptHeadline').textContent = currentSession.outcome === 'yes' ? 'The outcome exists.' : currentSession.outcome === 'partly' ? 'Something moved.' : 'The result was honest.';
  document.getElementById('proofOutcome').textContent = currentSession.outcome;
  const change = currentSession.resistanceBefore - currentSession.resistanceAfter;
  document.getElementById('proofResistance').textContent = `${currentSession.resistanceBefore} → ${currentSession.resistanceAfter} (${change >= 0 ? '-' + change : '+' + Math.abs(change)})`;
  document.getElementById('proofScore').textContent = `${currentSession.nextHourScore}/5`;
  document.getElementById('proofId').textContent = currentSession.proofId;
  showScreen('receipt');
});

document.getElementById('exportResult').addEventListener('click', () => {
  if (!latestResult) return;
  const blob = new Blob([JSON.stringify(latestResult, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${latestResult.proofId.toLowerCase()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast('Result exported. Sharing remains your choice.');
});

const stage = document.getElementById('productStage');
const pack = document.getElementById('pack');
stage.addEventListener('pointermove', event => {
  const rect = stage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  pack.style.transform = `rotate(5deg) rotateY(${x * 15 - 7}deg) rotateX(${-y * 10}deg)`;
});
stage.addEventListener('pointerleave', () => pack.style.transform = 'rotate(5deg) rotateY(-7deg)');

window.addEventListener('beforeunload', event => {
  if (currentSession.status === 'active') { event.preventDefault(); event.returnValue = ''; }
});

updateMetrics();
