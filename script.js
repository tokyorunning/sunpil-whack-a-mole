const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('.score');
const moles = document.querySelectorAll('.mole');
let lastHole;
let timeUp = false;
let score = 0;

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    console.log('Ah nah thats the same one bud');
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

  setTimeout(() => {
    hole.classList.remove('up');
    if (!timeUp) peep();
  }, time);
}

function startGame() {
  scoreBoard.textContent = 0;
  timeUp = false;
  score = 0;
  peep();
  setTimeout(() => {
    timeUp = true;
    alert('Game Over! Your score: ' + score);
  }, 10000); // Game lasts 10 seconds
}

function bonk(e) {
  if(!e.isTrusted) return; // cheater!
  
  // Check if already bonked to prevent double scoring on same pop-up
  if(this.classList.contains('bonked')) return;

  score++;
  this.classList.add('bonked'); // Add visual effect
  this.classList.remove('up'); // Hide immediately (optional, or wait for timeout)
  // Actually, let's keep it up but change appearance, or hide it. 
  // Standard whack-a-mole hides it. Let's hide it by removing 'up' from parent hole.
  this.parentNode.classList.remove('up');
  
  scoreBoard.textContent = score;
}

moles.forEach(mole => mole.addEventListener('click', bonk));
