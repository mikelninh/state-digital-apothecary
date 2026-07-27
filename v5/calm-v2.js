(() => {
  const experience = document.getElementById('experience');
  if (!experience) return;

  let guideTimer = null;
  let audioContext = null;
  let soundEnabled = false;
  let hapticsEnabled = false;
  let lastPhase = '';
  let selectedPattern = 'balanced';
  const patterns = {
    easy: { inhale: 3, exhale: 4, label: 'Easy · 3 in / 4 out' },
    balanced: { inhale: 4, exhale: 6, label: 'Balanced · 4 in / 6 out' },
    natural: { inhale: 0, exhale: 0, label: 'Natural breath' }
  };

  const parseTime = value => {
    const [minutes, seconds] = String(value || '00:00').split(':').map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
  };

  function softTone(direction) {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = direction === 'inhale' ? 420 : 310;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.32);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.34);
    } catch {}
  }

  function haptic(direction) {
    if (!hapticsEnabled || !navigator.vibrate) return;
    navigator.vibrate(direction === 'inhale' ? 18 : [12, 35, 12]);
  }

  function announcePhase(phase) {
    if (phase === lastPhase) return;
    lastPhase = phase;
    if (phase === 'inhale' || phase === 'exhale') {
      softTone(phase);
      haptic(phase);
    }
  }

  function calmMarkup(existing) {
    const oldPause = existing.querySelector('#pauseDose');
    const oldComplete = existing.querySelector('#completeDose');
    const timerText = existing.querySelector('#doseTimer')?.textContent || '10:00';
    const context = existing.querySelector('.dose-subprompt')?.textContent || '';
    const pauseLabel = oldPause?.textContent || 'Pause';
    const completeLabel = oldComplete?.textContent || 'The action is complete';

    existing.innerHTML = `
      <section class="calm-room">
        <div>
          <div class="calm-meta"><span class="calm-dot"></span><span>CALM 10 · GUIDED BREATH</span><span id="calmTimer">${timerText}</span></div>
        </div>
        <div>
          <div class="breath-stage" id="breathStage" data-phase="inhale">
            <div class="breath-orbit"></div>
            <div class="breath-orb"></div>
            <div class="breath-copy" aria-live="polite">
              <span class="breath-phase" id="breathPhase">INHALE</span>
              <span class="breath-count" id="breathCount">4</span>
            </div>
          </div>
          <p class="calm-guidance" id="dosePrompt">Breathe gently. Let the exhale be a little longer.</p>
          <p class="calm-context">${context}</p>
          <div class="calm-options" aria-label="CALM guidance options">
            <label><span>Pace</span><select id="breathPattern"><option value="easy">Easy · 3 / 4</option><option value="balanced" selected>Balanced · 4 / 6</option><option value="natural">Natural</option></select></label>
            <label><input type="checkbox" id="soundGuide"> soft sound</label>
            <label><input type="checkbox" id="hapticGuide"> haptic cue</label>
          </div>
          <p class="calm-safety">Keep the breath comfortable and unforced. No breath holds. Return to natural breathing and stop the exercise if you feel light-headed, short of breath or uncomfortable.</p>
        </div>
        <div class="calm-controls">
          <button class="button" id="pauseDose">${pauseLabel}</button>
          <button class="button state" id="completeDose">${completeLabel}</button>
        </div>
        <div class="dose-timer" id="doseTimer" hidden>${timerText}</div>
      </section>`;

    /* Preserve the original nodes because the formula engine already attached its
       pause and completion listeners before this enhancement runs. */
    if (oldPause) {
      const placeholder = existing.querySelector('#pauseDose');
      oldPause.className = 'button';
      oldPause.textContent = pauseLabel;
      placeholder?.replaceWith(oldPause);
    }
    if (oldComplete) {
      const placeholder = existing.querySelector('#completeDose');
      oldComplete.className = 'button state';
      oldComplete.textContent = completeLabel;
      placeholder?.replaceWith(oldComplete);
    }

    document.getElementById('breathPattern')?.addEventListener('change', event => {
      selectedPattern = event.target.value;
      lastPhase = '';
    });
    document.getElementById('soundGuide')?.addEventListener('change', event => {
      soundEnabled = event.target.checked;
      if (soundEnabled) softTone('inhale');
    });
    document.getElementById('hapticGuide')?.addEventListener('change', event => {
      hapticsEnabled = event.target.checked;
      if (hapticsEnabled) haptic('inhale');
    });
  }

  function updateGuide(totalSeconds) {
    const timerNode = document.getElementById('doseTimer');
    const visibleTimer = document.getElementById('calmTimer');
    const stage = document.getElementById('breathStage');
    const phaseNode = document.getElementById('breathPhase');
    const countNode = document.getElementById('breathCount');
    const promptNode = document.getElementById('dosePrompt');
    if (!timerNode || !visibleTimer || !stage || !phaseNode || !countNode || !promptNode) return;

    const remaining = parseTime(timerNode.textContent);
    visibleTimer.textContent = timerNode.textContent;
    const elapsed = Math.max(0, totalSeconds - remaining);
    const progress = totalSeconds ? elapsed / totalSeconds : 0;
    const guidedShare = totalSeconds <= 90 ? 0.75 : 0.60;
    const orientShare = totalSeconds <= 90 ? 0.92 : 0.82;

    if (progress >= orientShare) {
      stage.dataset.phase = 'natural';
      phaseNode.textContent = 'REST';
      countNode.textContent = '•';
      promptNode.textContent = 'Nothing to solve. Choose the next kind action, not the fastest reaction.';
      announcePhase('natural');
      return;
    }

    if (progress >= guidedShare || selectedPattern === 'natural') {
      stage.dataset.phase = 'natural';
      phaseNode.textContent = 'NOTICE';
      countNode.textContent = '3';
      promptNode.textContent = 'Let the breath find its own rhythm. Notice three neutral things you can see or feel.';
      announcePhase('natural');
      return;
    }

    const pattern = patterns[selectedPattern] || patterns.balanced;
    const cycle = pattern.inhale + pattern.exhale;
    const cyclePosition = elapsed % cycle;
    const isInhale = cyclePosition < pattern.inhale;
    const phase = isInhale ? 'inhale' : 'exhale';
    const phaseLength = isInhale ? pattern.inhale : pattern.exhale;
    const phaseElapsed = isInhale ? cyclePosition : cyclePosition - pattern.inhale;
    const count = Math.max(1, Math.ceil(phaseLength - phaseElapsed));

    stage.dataset.phase = phase;
    phaseNode.textContent = phase.toUpperCase();
    countNode.textContent = count;
    promptNode.textContent = phase === 'inhale'
      ? 'Inhale gently through the nose. Do not pull in more air than feels easy.'
      : 'Exhale softly and a little longer. Let the shoulders and jaw release.';
    announcePhase(phase);
  }

  function enhanceCalmRoom() {
    clearInterval(guideTimer);
    if (experience.dataset.formula !== 'calm') return;
    const room = experience.querySelector('.experience-main.dose-room');
    if (!room || room.dataset.calmEnhanced === 'true') return;
    const totalSeconds = parseTime(room.querySelector('#doseTimer')?.textContent);
    room.dataset.calmEnhanced = 'true';
    lastPhase = '';
    selectedPattern = 'balanced';
    calmMarkup(room);
    updateGuide(totalSeconds);
    guideTimer = setInterval(() => updateGuide(totalSeconds), 200);
  }

  const observer = new MutationObserver(() => {
    const room = experience.querySelector('.experience-main.dose-room');
    if (experience.classList.contains('open') && experience.dataset.formula === 'calm' && room) {
      enhanceCalmRoom();
    } else if (!room) {
      clearInterval(guideTimer);
      guideTimer = null;
      lastPhase = '';
    }
  });

  observer.observe(experience, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'data-formula'] });
})();