// Plays a short tone using the Web Audio API.
let beeperAudioContext;

function getBeeperAudioContext() {
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextType) {
    return null;
  }

  if (!beeperAudioContext) {
    beeperAudioContext = new AudioContextType();
  }

  return beeperAudioContext;
}

function unlockBeeperAudio() {
  const audioContext = getBeeperAudioContext();
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playBeeper(entity) {
  const audioContext = getBeeperAudioContext();
  if (!audioContext) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.frequency.setValueAtTime(entity.beeper.pitch, now);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.08);
}