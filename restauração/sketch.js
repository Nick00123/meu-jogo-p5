// ===========================================
// VARIÁVEIS GLOBAIS DO JOGO
// ===========================================

let gameStateManager;
let player;
let enemies = [];
let enemyProjectiles = [];
let particles = [];
let powerUps = [];
let coins = [];
let cameraSystem;
let gameMap;

// Game state variables
let score = 0;
let highScore = 0;
let level = 1;
let canEnterPortal = false;
let portal = { x: 1500, y: 1500, size: 80 };

// ===========================================
// FUNÇÕES PRINCIPAIS DO P5.JS
// ===========================================

function setup() {
  createCanvas(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
  
  // Carregar high score do localStorage
  highScore = localStorage.getItem('highScore') || 0;
  
  // Inicializar sistemas do jogo
  gameStateManager = new GameStateManager();
  initializeGame();
}

function draw() {
  gameStateManager.update();
  gameStateManager.draw();
}

function keyPressed() {
  gameStateManager.handleKeyPressed();
}

// ===========================================
// INICIALIZAÇÃO DO JOGO
// ===========================================

function initializeGame() {
  // Inicializar player
  player = new Player(CONFIG.MAP.WIDTH / 2, CONFIG.MAP.HEIGHT / 2);
  
  // Inicializar sistemas
  cameraSystem = new Camera(player);
  gameMap = new GameMap();
  
  // Resetar arrays
  enemies = [];
  enemyProjectiles = [];
  particles = [];
  powerUps = [];
  coins = [];
  
  // Resetar variáveis do jogo
  score = 0;
  level = 1;
  canEnterPortal = false;
  
  // Spawnar inimigos iniciais
  spawnEnemies();
}

// ===========================================
// SISTEMA DE SPAWN DE INIMIGOS
// ===========================================

function spawnEnemies() {
  // Usar valores padrão já que CONFIG.LEVEL não existe
  let baseEnemies = 3;
  let enemiesPerLevel = 2;
  let enemyCount = baseEnemies + (level - 1) * enemiesPerLevel;
  
  for (let i = 0; i < enemyCount; i++) {
    let x, y;
    do {
      x = random(50, CONFIG.MAP.WIDTH - 50);
      y = random(50, CONFIG.MAP.HEIGHT - 50);
    } while (dist(x, y, player.x, player.y) < 200);
    
    // Determinar tipo de inimigo baseado no nível
    let enemyType = random();
    if (level >= 3 && enemyType < 0.1) {
      enemies.push(new BossEnemy(x, y));
    } else if (level >= 2 && enemyType < 0.3) {
      enemies.push(new FastEnemy(x, y));
    } else {
      enemies.push(new Enemy(x, y));
    }
  }
}

// ===========================================
// FUNÇÃO DE DESENHO DO JOGO
// ===========================================

function drawGame() {
  // Apply camera transformation
  cameraSystem.apply();

  // Draw map
  gameMap.draw();

  // Draw portal
  if (canEnterPortal && enemies.length === 0) {
    push();
    fill(255, 255, 0, 150 + sin(millis() * 0.01) * 50);
    noStroke();
    ellipse(portal.x, portal.y, portal.size);
    fill(255, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(12);
    text('PORTAL', portal.x, portal.y);
    pop();
  }

  // Draw game objects
  player.draw();
  
  for (let enemy of enemies) {
    enemy.draw();
  }
  
  for (let projectile of player.projectiles) {
    projectile.draw();
  }
  
  for (let projectile of enemyProjectiles) {
    projectile.draw();
  }
  
  for (let particle of particles) {
    particle.draw();
  }
  
  for (let powerUp of powerUps) {
    powerUp.draw();
  }
  
  for (let coin of coins) {
    coin.draw();
  }

  cameraSystem.reset(); // Reset camera transformation

  // Draw HUD (not affected by camera)
  drawHUD();
  drawMinimap();
}

// ===========================================
// ATUALIZAÇÃO DO JOGO
// ===========================================

function updateGame() {
  // Update camera
  cameraSystem.update();
  
  // Update player
  player.update();
  
  // Player shooting - mudança do mouse para tecla 'O'
  if (keyIsDown(79)) { // Tecla 'O' (código 79)
    player.shoot();
  }
  
  // Update enemies
  for (let enemy of enemies) {
    enemy.update(player);
    if (enemy.shoot) enemy.shoot();
  }
  
  // Update projectiles
  for (let projectile of enemyProjectiles) {
    projectile.update();
  }
  
  // Update particles
  for (let particle of particles) {
    particle.update();
  }
  
  // Check collisions
  checkCollisions();
  
  // Clean up arrays
  enemyProjectiles = enemyProjectiles.filter(p => !p.remove);
  particles = particles.filter(p => !p.remove);
  powerUps = powerUps.filter(p => !p.remove);
  coins = coins.filter(c => !c.remove);
  
  // Check game over PRIMEIRO - antes de outras verificações
  if (player.health <= 0) {
    gameStateManager.changeState('GAME_OVER');
    return; // Sair imediatamente para evitar processamento adicional
  }
  
  // Check level completion
  if (enemies.length === 0 && !canEnterPortal) {
    canEnterPortal = true;
  }
  
  // Check portal entry
  if (canEnterPortal && dist(player.x, player.y, portal.x, portal.y) < portal.size / 2) {
    nextLevel();
  }
}

// ===========================================
// SISTEMA DE COLISÕES
// ===========================================

function checkCollisions() {
  // Player projectiles vs enemies
  for (let i = player.projectiles.length - 1; i >= 0; i--) {
    let projectile = player.projectiles[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      if (dist(projectile.x, projectile.y, enemy.x, enemy.y) < (projectile.size + enemy.size) / 2) {
        // Hit enemy
        enemy.health--;
        projectile.remove = true;
        
        // Create particles
        for (let k = 0; k < 5; k++) {
          particles.push(new Particle(enemy.x, enemy.y, [255, 100, 100]));
        }
        
        if (enemy.health <= 0) {
          // Enemy destroyed - usar valores padrão para pontuação
          score += 10; // Valor padrão para kill
          enemies.splice(j, 1);
          
          // Chance to drop power-up or coin - usar valores padrão
          if (random() < 0.15) { // 15% chance para power-up
            let type = random(['health', 'speed']);
            powerUps.push(new PowerUp(enemy.x, enemy.y, type));
          }
          if (random() < 0.25) { // 25% chance para coin
            coins.push(new Coin(enemy.x, enemy.y));
          }
        }
        break;
      }
    }
  }
  
  // Enemy projectiles vs player
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    let projectile = enemyProjectiles[i];
    if (dist(projectile.x, projectile.y, player.x, player.y) < (projectile.size + player.size) / 2) {
      player.health--;
      enemyProjectiles.splice(i, 1);
      
      // Create particles
      for (let k = 0; k < 3; k++) {
        particles.push(new Particle(player.x, player.y, [255, 0, 0]));
      }
      
      // Verificação imediata de game over
      if (player.health <= 0) {
        return; // Sair imediatamente para evitar mais colisões
      }
    }
  }
  
  // Player vs power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let powerUp = powerUps[i];
    if (dist(player.x, player.y, powerUp.x, powerUp.y) < (player.size + powerUp.size) / 2) {
      if (powerUp.type === 'health') {
        player.health = min(player.health + 1, CONFIG.PLAYER.MAX_HEALTH);
      } else if (powerUp.type === 'speed') {
        player.speed = min(player.speed + 0.5, CONFIG.PLAYER.SPEED * 2);
      }
      powerUps.splice(i, 1);
    }
  }
  
  // Player vs coins
  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    if (dist(player.x, player.y, coin.x, coin.y) < (player.size + coin.size) / 2) {
      score += 5; // Valor padrão para coin
      coins.splice(i, 1);
    }
  }
  
  // Player vs enemies - adicionar proteção contra múltiplas colisões
  for (let enemy of enemies) {
    if (dist(player.x, player.y, enemy.x, enemy.y) < (player.size + enemy.size) / 2) {
      // Verificar se já não perdeu vida recentemente (proteção contra spam)
      if (!player.invulnerable) {
        player.health--;
        player.invulnerable = true;
        
        // Remover invulnerabilidade após um tempo
        setTimeout(() => {
          if (player) player.invulnerable = false;
        }, 500); // 500ms de invulnerabilidade
        
        // Push player away
        let angle = atan2(player.y - enemy.y, player.x - enemy.x);
        player.x += cos(angle) * 20; // Empurrar mais longe
        player.y += sin(angle) * 20;
        
        // Verificação imediata de game over
        if (player.health <= 0) {
          return; // Sair imediatamente
        }
      }
    }
  }
}

// ===========================================
// SISTEMA DE NÍVEIS
// ===========================================

function nextLevel() {
  level++;
  canEnterPortal = false;
  
  // Reset player position
  player.x = CONFIG.MAP.WIDTH / 2;
  player.y = CONFIG.MAP.HEIGHT / 2;
  
  // Spawn new enemies
  spawnEnemies();
  
  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
}

// ===========================================
// INTERFACE DO USUÁRIO
// ===========================================

function drawHUD() {
  // Background for HUD
  fill(0, 0, 0, 150);
  noStroke();
  rect(0, 0, width, 80);
  
  // Health
  fill(255, 0, 0);
  textAlign(LEFT, TOP);
  textSize(16);
  text(`Vida: ${player.health}`, 10, 10);
  
  // Score
  fill(255, 255, 0);
  text(`Score: ${score}`, 10, 30);
  
  // High Score
  fill(0, 255, 0);
  text(`High Score: ${highScore}`, 10, 50);
  
  // Level
  fill(255, 255, 255);
  text(`Nível: ${level}`, 200, 10);
  
  // Enemies remaining
  text(`Inimigos: ${enemies.length}`, 200, 30);
}

function drawMinimap() {
  let mapSize = 120;
  let mapX = width - mapSize - 10;
  let mapY = 10;
  
  // Minimap background
  fill(0, 0, 0, 150);
  stroke(255);
  rect(mapX, mapY, mapSize, mapSize);
  
  // Player position
  let playerMapX = map(player.x, 0, CONFIG.MAP.WIDTH, mapX, mapX + mapSize);
  let playerMapY = map(player.y, 0, CONFIG.MAP.HEIGHT, mapY, mapY + mapSize);
  fill(0, 200, 255);
  noStroke();
  ellipse(playerMapX, playerMapY, 4);
  
  // Enemies
  fill(255, 0, 0);
  for (let enemy of enemies) {
    let enemyMapX = map(enemy.x, 0, CONFIG.MAP.WIDTH, mapX, mapX + mapSize);
    let enemyMapY = map(enemy.y, 0, CONFIG.MAP.HEIGHT, mapY, mapY + mapSize);
    ellipse(enemyMapX, enemyMapY, 2);
  }
  
  // Portal
  if (canEnterPortal) {
    fill(255, 255, 0);
    let portalMapX = map(portal.x, 0, CONFIG.MAP.WIDTH, mapX, mapX + mapSize);
    let portalMapY = map(portal.y, 0, CONFIG.MAP.HEIGHT, mapY, mapY + mapSize);
    ellipse(portalMapX, portalMapY, 6);
  }
}