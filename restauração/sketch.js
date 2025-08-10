let player, enemies, particles, gameMap, cameraSystem;
let currentLevel = 1;
let portal = { x: 700, y: 500, size: 40 };
let score = 0;
let highscore = 0;
let enemyProjectiles = [];
let powerUps = [];
let coins = [];
let gameOver = false;
let canEnterPortal = true;
let transitioning = false;
let lastDamageTime = 0; // Adicione no topo do arquivo

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent("game-container");

  gameMap = new GameMap();
  player = new Player(400, 300);
  particles = [];
  cameraSystem = new Camera(player, gameMap.width, gameMap.height);

  // Carrega highscore salvo
  highscore = Number(localStorage.highscore || 0);

  startLevel(1);
}

function startLevel(level) {
  currentLevel = level;
  player.x = gameMap.width / 2;
  player.y = gameMap.height / 2;
  player.health = 5;
  player.projectiles = [];
  enemyProjectiles = [];
  particles = [];
  powerUps = [];
  coins = [];
  canEnterPortal = false;
  transitioning = false;

  // Portal em local distante do player
  let minPortalDist = 200;
  let portalPos;
  do {
    let angle = random(TWO_PI);
    let distance = min(gameMap.width, gameMap.height) / 2 - 100;
    portalPos = {
      x: player.x + cos(angle) * distance,
      y: player.y + sin(angle) * distance,
      size: 40
    };
  } while (dist(player.x, player.y, portalPos.x, portalPos.y) < minPortalDist);
  portal = portalPos;

  // Sempre inicialize o array de inimigos
  enemies = [];
  enemies.push(new Enemy(100, 100));
  enemies.push(new FastEnemy(300, 400));

  if (level > 1) {
    // Chefão a cada 5 fases
    if (level % 5 === 0) {
      enemies.push(new BossEnemy(random(100, gameMap.width - 100), random(100, gameMap.height - 100)));
    }
    // Inimigos normais e rápidos
    for (let i = 0; i < level + 1; i++) {
      let pos = randomPositionAwayFromPlayer();
      if (random() < 0.3) {
        enemies.push(new FastEnemy(pos.x, pos.y));
      } else {
        enemies.push(new Enemy(pos.x, pos.y));
      }
    }
  }

  // Power-ups e moedas aleatórios (em todas as fases)
  if (random() < 0.5) powerUps.push(new PowerUp(random(100, gameMap.width - 100), random(100, gameMap.height - 100), 'life'));
  if (random() < 0.5) powerUps.push(new PowerUp(random(100, gameMap.width - 100), random(100, gameMap.height - 100), 'speed'));
  for (let i = 0; i < 3; i++) {
    coins.push(new Coin(random(100, gameMap.width - 100), random(100, gameMap.height - 100)));
  }

  setTimeout(() => { canEnterPortal = true; }, 1000);
}

function draw() {
  if (gameOver) {
    background(0, 150);
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2);
    textSize(24);
    fill(255);
    text("Pontuação: " + score, width / 2, height / 2 + 50);
    text("Recorde: " + highscore, width / 2, height / 2 + 90);
    text("Pressione R para reiniciar", width / 2, height / 2 + 130);
    return;
  }

  cameraSystem.begin();
  gameMap.draw();

  // Power-ups
  for (let pu of powerUps) pu.draw();

  // Moedas
  for (let c of coins) c.draw();

  player.update();
  player.draw();

  // Desenhar portal
  push();
  stroke(255, 255, 0);
  strokeWeight(4);
  fill(120, 0, 255, 220);
  ellipse(portal.x, portal.y, portal.size + 10, portal.size + 10);
  fill(200, 200, 255, 180);
  ellipse(portal.x, portal.y, portal.size, portal.size);
  pop();

  // INIMIGOS DEVEM SER DESENHADOS AQUI, DENTRO DO BLOCO DA CÂMERA
  for (let e of enemies) {
    e.update(player);
    e.draw();
    // Dano ao player se encostar no inimigo
    if (
      dist(player.x, player.y, e.x, e.y) < (player.size / 2 + e.size / 2) &&
      millis() - lastDamageTime > 1000 // 1 segundo de invencibilidade
    ) {
      player.health--;
      lastDamageTime = millis();
    }
  }

  cameraSystem.end();

  // HUD e minimapa sempre visíveis
  drawHUD();
  drawMinimap();

  // Checar se player entrou no portal (com proteção extra)
  if (
    !transitioning &&
    canEnterPortal &&
    dist(player.x, player.y, portal.x, portal.y) < (player.size / 2 + portal.size / 2)
  ) {
    transitioning = true;
    setTimeout(() => {
      startLevel(currentLevel + 1);
      transitioning = false;
    }, 300);
  }

  // Power-up coleta
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let pu = powerUps[i];
    if (dist(player.x, player.y, pu.x, pu.y) < (player.size / 2 + pu.size / 2)) {
      if (pu.type === 'life') player.health = min(player.health + 2, 5);
      if (pu.type === 'speed') player.speed += 1;
      powerUps.splice(i, 1);
    }
  }

  // Moeda coleta
  for (let i = coins.length - 1; i >= 0; i--) {
    let c = coins[i];
    if (dist(player.x, player.y, c.x, c.y) < (player.size / 2 + c.size / 2)) {
      score += 5;
      coins.splice(i, 1);
    }
  }

  // Projéteis dos inimigos (boss)
  for (let ep of enemyProjectiles) {
    ep.update();
    ep.draw();
    if (dist(ep.x, ep.y, player.x, player.y) < (player.size / 2 + ep.size / 2)) {
      player.health--;
      ep.remove = true;
    }
  }
  enemyProjectiles = enemyProjectiles.filter(ep => !ep.remove);

  // Partículas
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
  particles = particles.filter(p => p.life > 0);

  // HUD
  drawHUD();
  drawMinimap();

  // Checa game over
  if (player.health <= 0) {
    // Salva recorde
    if (score > highscore) {
      highscore = score;
      localStorage.highscore = highscore;
    }
    gameOver = true;
  }

  // Verifica colisão dos projéteis do player com os inimigos
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    for (let j = player.projectiles.length - 1; j >= 0; j--) {
      let proj = player.projectiles[j];
      if (dist(enemy.x, enemy.y, proj.x, proj.y) < (enemy.size / 2 + proj.size / 2)) {
        enemy.health--;
        proj.remove = true;
        // Efeito de partícula opcional:
        for (let k = 0; k < 8; k++) particles.push(new Particle(enemy.x, enemy.y));
        if (enemy.health <= 0) {
          enemies.splice(i, 1);
          score += 10;
          break; // Sai do loop de projéteis, pois o inimigo foi removido
        }
      }
    }
  }
}

function drawHUD() {
  let maxHealth = 5;
  let barWidth = 150;
  let healthRatio = player.health / maxHealth;
  fill(100);
  rect(10, 10, barWidth, 20, 5);
  fill(0, 200, 0);
  rect(10, 10, barWidth * healthRatio, 20, 5);

  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Vida: " + player.health, 10, 35);
  text("Inimigos: " + enemies.length, 10, 55);
  text("Fase: " + currentLevel, 10, 75);
  text("Pontuação: " + score, 10, 95);
  text("Recorde: " + highscore, 10, 115);
}

function drawMinimap() {
  let scale = 0.08; // Menor escala
  let mapW = gameMap.width * scale;
  let mapH = gameMap.height * scale;
  let margin = 20;
  push();
  // Centralizado no canto superior direito
  translate(width - mapW - margin, margin);
  fill(50, 100);
  rect(0, 0, mapW, mapH, 5);
  // Player
  fill(0,200,255);
  ellipse(player.x * scale, player.y * scale, player.size * scale);
  // Inimigos
  fill(255,0,0);
  for (let e of enemies) ellipse(e.x * scale, e.y * scale, e.size * scale);
  // Portal
  fill(120,0,255);
  ellipse(portal.x * scale, portal.y * scale, portal.size * scale);
  // PowerUps
  fill(0,255,0);
  for (let pu of powerUps) ellipse(pu.x * scale, pu.y * scale, pu.size * scale);
  // Moedas
  fill(255,215,0);
  for (let c of coins) ellipse(c.x * scale, c.y * scale, c.size * scale);
  pop();
}

function keyPressed() {
  if (key === 'p' || key === 'P') {
    player.shoot();
  }
  if (gameOver && (key === 'r' || key === 'R')) {
    score = 0;
    gameOver = false;
    canEnterPortal = false; // <-- Reinicia proteção do portal
    startLevel(1);
  }
}

function randomPositionAwayFromPlayer(minDist = 120) {
  let x, y;
  do {
    x = random(100, gameMap.width - 100);
    y = random(100, gameMap.height - 100);
  } while (dist(x, y, player.x, player.y) < minDist);
  return { x, y };
}