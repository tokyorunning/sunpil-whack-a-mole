const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('.score');
const moles = document.querySelectorAll('.mole');
let lastHole;
let timeUp = false;
let score = 0;

// Sound Controller
let voices = [];

function setVoice() {
  voices = window.speechSynthesis.getVoices();
}

// Populate voices when they are loaded
window.speechSynthesis.onvoiceschanged = setVoice;

function speak(text, { pitch = 0.5, rate = 1 } = {}) {
  // Cancel previous speech to prevent overlapping/queueing delay
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR'; // Korean

  // Try to find a male voice if possible (often system dependent)
  // This is a heuristic; pitch adjustment is the most reliable method for "roughness"
  const maleVoice = voices.find(v => v.lang === 'ko-KR' && (v.name.includes('Google') || v.name.includes('Male')));
  if (maleVoice) utterance.voice = maleVoice;

  utterance.pitch = pitch; // Low pitch for rough/male voice
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    return randomHole(holes);
  }
  lastHole = hole;
  return hole;
}

function peep() {
  const time = randomTime(200, 1000);
  const hole = randomHole(holes);
  hole.classList.add('up');

  // Remove 'bonked' class if it exists from previous pop-up
  const mole = hole.querySelector('.mole');
  mole.classList.remove('bonked');

  // Random teasing sound (30% chance)
  if (Math.random() < 0.3) {
    const phrases = ['메롱!', '여기지롱!', '못잡겠지?', '약오르지?', '바보!', '느려터졌네!'];
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    speak(text, { pitch: 0.1 + Math.random() * 0.4, rate: 1.1 }); // Low pitch, slightly fast
  }

  setTimeout(() => {
    hole.classList.remove('up');
    if (!timeUp) peep();
  }, time);
}

function startGame() {
  scoreBoard.textContent = 0;
  timeUp = false;
  score = 0;

  // Ensure voices are loaded
  if (voices.length === 0) setVoice();

  speak('게임 시작! 나를 잡아봐라! 크하하!', { pitch: 0.1, rate: 1.0 });

  peep();

  // Countdown sounds
  setTimeout(() => speak('3', { pitch: 0.1 }), 7000);
  setTimeout(() => speak('2', { pitch: 0.1 }), 8000);
  setTimeout(() => speak('1', { pitch: 0.1 }), 9000);

  setTimeout(() => {
    timeUp = true;
    speak('게임 오버! 점수는 ' + score + '점이다. 크크크.', { pitch: 0.1 });
    // Small delay for alert so sound can start
    setTimeout(() => alert('Game Over! Your score: ' + score), 100);
  }, 10000); // Game lasts 10 seconds
}

// Audio Context for Sound Effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBonkSound() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

function bonk(e) {
  if (!e.isTrusted) return; // cheater!

  // Check if already bonked to prevent double scoring on same pop-up
  if (this.classList.contains('bonked')) return;

  score++;
  this.classList.add('bonked'); // Add visual effect
  this.classList.remove('up'); // Hide immediately
  this.parentNode.classList.remove('up');

  // Play Thud Sound
  playBonkSound();

  // Screen Shake
  document.body.classList.add('shaking');
  setTimeout(() => {
    document.body.classList.remove('shaking');
  }, 500);

  // Dramatic scream sound
  const screams = ['으악!', '아이고!', '내 머리!', '살려줘!', '뼈 맞았어!', '억!', '꽥!'];
  const text = screams[Math.floor(Math.random() * screams.length)];
  speak(text, { pitch: 0.1 + Math.random() * 0.2, rate: 1.4 });

  scoreBoard.textContent = score;
}

moles.forEach(mole => {
  mole.addEventListener('click', bonk);
  mole.addEventListener('touchstart', bonk); // Mobile touch support
});
