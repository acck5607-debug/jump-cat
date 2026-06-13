const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let best = Number(localStorage.getItem('jumpCatBest') || 0);
bestEl.textContent = best;

const game = {
  running: false,
  over: false,
  score: 0,
  speed: 5,
  gravity: 0.72,
  ground: 338,
  frame: 0,
  obstacles: [],
  fish: []
};

const cat = { x: 95, y: 280, w: 48, h: 48, vy: 0, jumps: 0 };

function resetGame() {
  game.running = false;
  game.over = false;
  game.score = 0;
  game.speed = 5;
  game.frame = 0;
  game.obstacles = [];
  game.fish = [];
  cat.y = 280;
  cat.vy = 0;
  cat.jumps = 0;
  scoreEl.textContent = 0;
  drawStart();
}

function startGame() {
  if (!game.running) {
    game.running = true;
    game.over = false;
    requestAnimationFrame(loop);
  }
}

function jump() {
  if (game.over) {
    resetGame();
    startGame();
    return;
  }
  if (!game.running) startGame();
  if (cat.jumps < 2) {
    cat.vy = -13;
    cat.jumps++;
  }
}

function spawnObstacle() {
  const h = 34 + Math.random() * 24;
  game.obstacles.push({ x: canvas.width + 20, y: game.ground - h, w: 34, h });
}

function spawnFish() {
  game.fish.push({ x: canvas.width + 20, y: 150 + Math.random() * 110, r: 13, taken: false });
}

function update() {
  game.frame++;
  game.score += 1;
  game.speed = Math.min(12, 5 + game.score / 900);

  cat.vy += game.gravity;
  cat.y += cat.vy;
  if (cat.y + cat.h >= game.ground) {
    cat.y = game.ground - cat.h;
    cat.vy = 0;
    cat.jumps = 0;
  }

  if (game.frame % 92 === 0) spawnObstacle();
  if (game.frame % 145 === 0) spawnFish();

  game.obstacles.forEach(o => o.x -= game.speed);
  game.fish.forEach(f => f.x -= game.speed);

  game.obstacles = game.obstacles.filter(o => o.x + o.w > -20);
  game.fish = game.fish.filter(f => f.x + f.r > -20 && !f.taken);

  for (const o of game.obstacles) {
    if (hitRect(cat, o)) endGame();
  }

  for (const f of game.fish) {
    if (!f.taken && hitCircleRect(f, cat)) {
      f.taken = true;
      game.score += 120;
    }
  }

  scoreEl.textContent = Math.floor(game.score);
}

function hitRect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function hitCircleRect(circle, rect) {
  const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - cx;
  const dy = circle.y - cy;
  return dx * dx + dy * dy < circle.r * circle.r;
}

function endGame() {
  game.running = false;
  game.over = true;
  best = Math.max(best, Math.floor(game.score));
  localStorage.setItem('jumpCatBest', best);
  bestEl.textContent = best;
  draw();
  ctx.fillStyle = 'rgba(15,23,42,.72)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 46px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, 180);
  ctx.font = '24px Arial';
  ctx.fillText('Tap or press Space to restart', canvas.width / 2, 225);
}

function drawCat() {
  ctx.save();
  ctx.translate(cat.x, cat.y);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.roundRect(4, 12, 38, 32, 12);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(21, 18, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(8, 8); ctx.lineTo(14, -5); ctx.lineTo(20, 10); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(27, 8); ctx.lineTo(35, -5); ctx.lineTo(37, 13); ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.beginPath(); ctx.arc(15, 17, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(28, 17, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(21, 25, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#7dd3fc');
  sky.addColorStop(1, '#dcfce7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,.8)';
  for (let i = 0; i < 5; i++) {
    const x = (i * 210 + (game.frame || 0) * -0.35) % 1050 - 80;
    cloud(x, 60 + i * 28);
  }

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, game.ground, canvas.width, canvas.height - game.ground);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(0, game.ground, canvas.width, 14);

  drawCat();

  game.obstacles.forEach(o => {
    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, 6);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(o.x + 4, o.y);
    ctx.lineTo(o.x + o.w / 2, o.y - 20);
    ctx.lineTo(o.x + o.w - 4, o.y);
    ctx.fill();
  });

  game.fish.forEach(f => {
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(f.x + 15, f.y);
    ctx.lineTo(f.x + 30, f.y - 10);
    ctx.lineTo(f.x + 30, f.y + 10);
    ctx.fill();
  });

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + Math.floor(game.score), 22, 34);
}

function cloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.arc(x + 22, y - 8, 22, 0, Math.PI * 2);
  ctx.arc(x + 48, y, 17, 0, Math.PI * 2);
  ctx.fill();
}

function drawStart() {
  draw();
  ctx.fillStyle = 'rgba(15,23,42,.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Jump Cat', canvas.width / 2, 165);
  ctx.font = '23px Arial';
  ctx.fillText('Tap / Space to jump. Avoid rocks. Collect fish.', canvas.width / 2, 210);
}

function loop() {
  if (!game.running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

window.addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
    e.preventDefault();
    jump();
  }
});
canvas.addEventListener('pointerdown', jump);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => { resetGame(); startGame(); });

resetGame();
