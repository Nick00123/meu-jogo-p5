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

// Object Pools
let projectilePool;
let particlePool;

// Game state variables
let score = 0;
let highScore = 0;
let level = 1;
let canEnterPortal = false;
let portalActivatedAt = 0; // quando o portal foi habilitado
let lastLevelChangeTime = 0; // debounce de transição de nível
let portal = { x: 1500, y: 1500, size: 80 };

// Armas
let availableWeapons = ['RIFLE']; // Start with 1 basic weapon
let currentWeaponIndex = 0;
let playerWeapon;

// Sistema de Moedas e Upgrades
let playerCoins = 0;
let totalCoinsEarned = 0;
let upgrades = {
  HEALTH: 0,
  SPEED: 0,
  DAMAGE: 0,
  FIRE_RATE: 0,
  DASH_COOLDOWN: 0,
  REGENERATION: 0
};
let lastRegenTime = 0;
let showShop = false;
let selectedUpgrade = null;

// New systems
// weaponProgression é criado em weaponProgression.js
// adaptiveDifficulty é criado em adaptiveDifficulty.js

// ===========================================
// FUNÇÕES PRINCIPAIS DO P5.JS
// ===========================================

function setup() {
  createCanvas(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
  
  // Carregar dados salvos
  highScore = localStorage.getItem('highScore') || 0;
  UpgradeSystem.loadUpgrades();
  
  // Inicializar sistemas do jogo
  gameStateManager = new GameStateManager();
  initializeGame();
  
  // Inicializar pools
  projectilePool = new ObjectPool(createProjectile, resetProjectile);
  particlePool = new ObjectPool(createParticle, resetParticle);
}

function draw() {
  if (showShop) {
    drawShop();
  } else {
    gameStateManager.update();
    gameStateManager.draw();
  }
}

function keyPressed() {
  if (key === 'Escape') {
    showShop = !showShop;
  } else if (!showShop) {
    gameStateManager.handleKeyPressed();
  }
}

function mousePressed() {
  if (showShop) {
    handleShopClick();
  }
}

// ===========================================
// INICIALIZAÇÃO E RESET DO JOGO
// ===========================================

function resetGame() {
  // Limpar todos os pools
  if (projectilePool) projectilePool.releaseAll();
  if (particlePool) particlePool.releaseAll();
  
  // Reinicializar o jogo
  initializeGame();
}

function initializeGame() {
  // Inicializar player
  player = new Player(CONFIG.MAP.WIDTH / 2, CONFIG.MAP.HEIGHT / 2);
  
  // Aplicar upgrades ao player
  UpgradeSystem.applyUpgrades();
  
  // Inicializar sistemas
  cameraSystem = new Camera(player);
  gameMap = new GameMap();
  
  // Inicializar sistema de armas com progressão
  weaponProgression.checkWeaponUnlocks(level, false);
  availableWeapons = weaponProgression.unlockedWeapons;
  currentWeaponIndex = 0;
  playerWeapon = new Weapon(availableWeapons[currentWeaponIndex]);
  
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
  // Verificar se é nível de boss
  if (level % 5 === 0 && level >= 5) {
    spawnBossLevel();
    return;
  }
  
  // Get difficulty multiplier
  const difficulty = adaptiveDifficulty.getDifficultyMultiplier();
  let baseEnemies = 3 * difficulty.enemySpawnRate;
  let enemiesPerLevel = 2 * difficulty.enemySpawnRate;
  let enemyCount = Math.floor(baseEnemies + (level - 1) * enemiesPerLevel);
  enemyCount = max(1, enemyCount); // nunca zero em níveis normais
  
  for (let i = 0; i < enemyCount; i++) {
    let x, y;
    do {
      x = random(50, CONFIG.MAP.WIDTH - 50);
      y = random(50, CONFIG.MAP.HEIGHT - 50);
    } while (dist(x, y, player.x, player.y) < 200);
    
    // Determinar tipo de inimigo baseado no nível
    let enemyType = random();
    let spawnedEnemy = null;
    
    // Enhanced enemy types
    if (level >= 5 && enemyType < 0.1) {
      // Ranged enemies
      spawnedEnemy = new EnhancedEnemy(x, y, 'RANGED');
    } else if (level >= 4 && enemyType < 0.15) {
      // Explosive enemies
      spawnedEnemy = new EnhancedEnemy(x, y, 'EXPLOSIVE');
    } else if (level >= 4 && enemyType < 0.2) {
      // Shielded enemies
      spawnedEnemy = new EnhancedEnemy(x, y, 'SHIELDED');
    } else if (level >= 3 && enemyType < 0.25) {
      // Multiplying enemies
      spawnedEnemy = new EnhancedEnemy(x, y, 'MULTIPLYING');
    } else if (level >= 3 && enemyType < 0.3) {
      // Teleporter enemies
      spawnedEnemy = new EnhancedEnemy(x, y, 'TELEPORTER');
    } else if (level >= 2 && enemyType < 0.4) {
      // Enhanced existing types
      spawnedEnemy = new EnhancedEnemy(x, y, 'TANK');
    } else {
      // Normal enemies
      spawnedEnemy = new EnhancedEnemy(x, y, 'NORMAL');
    }
    
    if (spawnedEnemy) {
      enemies.push(spawnedEnemy);
    }
  }
}

// ===========================================
// SISTEMA DE BOSS BATTLES
// ===========================================

function spawnBossLevel() {
  // Limpar inimigos existentes
  enemies = [];
  
  // Criar boss em posição segura (nunca em cima do player)
  const minDist = (CONFIG && CONFIG.ENEMY && CONFIG.ENEMY.BOSS && CONFIG.ENEMY.BOSS.MIN_SPAWN_DISTANCE) ? CONFIG.ENEMY.BOSS.MIN_SPAWN_DISTANCE : 400;
  let spawnX = CONFIG.MAP.WIDTH / 2;
  let spawnY = CONFIG.MAP.HEIGHT / 2;
  // Se player estiver muito perto do centro, spawnar em um anel afastado
  if (dist(player.x, player.y, spawnX, spawnY) < minDist) {
    const angle = random(TWO_PI);
    const ringRadius = minDist + 100;
    spawnX = constrain(player.x + cos(angle) * ringRadius, 50, CONFIG.MAP.WIDTH - 50);
    spawnY = constrain(player.y + sin(angle) * ringRadius, 50, CONFIG.MAP.HEIGHT - 50);
  }
  let boss = new BossEnemy(
    spawnX,
    spawnY,
    Math.floor(level / 5)
  );
  
  enemies.push(boss);
  
  // Adicionar alguns inimigos de apoio
  let supportCount = min(3, Math.floor(level / 5));
  for (let i = 0; i < supportCount; i++) {
    let angle = (TWO_PI / supportCount) * i;
    let distance = 200;
    let x = CONFIG.MAP.WIDTH / 2 + cos(angle) * distance;
    let y = CONFIG.MAP.HEIGHT / 2 + sin(angle) * distance;
    
    enemies.push(new Enemy(x, y, 'NORMAL'));
  }
}

// ===========================================
// SISTEMA DE NOTIFICAÇÕES DE BOSS
// ===========================================

// Array para notificações de boss
window.bossNotifications = [];

function drawBossNotifications() {
  push();
  textAlign(CENTER, CENTER);
  textSize(24);
  
  for (let i = window.bossNotifications.length - 1; i >= 0; i--) {
    let notification = window.bossNotifications[i];
    
    // Fade out
    let alpha = map(notification.life, 0, 120, 0, 255);
    fill(...notification.color, alpha);
    
    text(notification.text, notification.x, notification.y);
    
    notification.life--;
    notification.y -= 1;
    
    if (notification.life <= 0) {
      window.bossNotifications.splice(i, 1);
    }
  }
  pop();
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
  
  projectilePool.draw();
  particlePool.draw();
  
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
  drawBossNotifications();
}

// ===========================================
// ATUALIZAÇÃO DO JOGO
// ===========================================

function updateGame() {
  // Update camera
  cameraSystem.update();
  
  // Update player
  player.update();
  
  // Handle regeneration
  UpgradeSystem.handleRegeneration();
  
  // Weapon switching - teclas 1, 2, 3, 4
  if (keyIsDown(49)) switchWeapon(0); // '1'
  if (keyIsDown(50)) switchWeapon(1); // '2'
  if (keyIsDown(51)) switchWeapon(2); // '3'
  if (keyIsDown(52)) switchWeapon(3); // '4'
  
  // Player shooting
  if (keyIsDown(79)) { // 'O'
    let closest = findClosestEnemy();
    if (closest) {
      playerWeapon.shoot(player.x, player.y, closest.x, closest.y);
    }
  }
  
  // Update enemies
  for (let enemy of enemies) {
    enemy.update(player);
    if (enemy.shoot) enemy.shoot();
  }
  
  projectilePool.update();
  particlePool.update();
  
  // Check collisions
  checkCollisions();

  // Removido bloco redundante de dano manual; checkCollisions() já trata colisões dos projéteis ativos
  
  // Clean up arrays
  powerUps = powerUps.filter(p => !p.remove);
  coins = coins.filter(c => !c.remove);
  
  // Check game over
  if (player.health <= 0) {
    gameStateManager.changeState('GAME_OVER');
    return;
  }
  
  // Check level completion
  if (enemies.length === 0 && !canEnterPortal) {
    canEnterPortal = true;
    portalActivatedAt = millis();
  }
  
  // Check portal entry
  const activationDelay = (CONFIG && CONFIG.PORTAL && CONFIG.PORTAL.ACTIVATION_DELAY) ? CONFIG.PORTAL.ACTIVATION_DELAY : 300;
  if (
    canEnterPortal &&
    (millis() - portalActivatedAt) >= activationDelay &&
    (millis() - lastLevelChangeTime) >= 300 && // debounce extra de segurança
    dist(player.x, player.y, portal.x, portal.y) < portal.size / 2
  ) {
    nextLevel();
  }
}

// ===========================================
// SISTEMA DE NÍVEIS
// ===========================================

function nextLevel() {
  level++;
  canEnterPortal = false;
  lastLevelChangeTime = millis();
  
  // Check weapon unlocks
  const bossInterval = (CONFIG && CONFIG.GAMEPLAY && CONFIG.GAMEPLAY.BOSS_LEVEL_INTERVAL) ? CONFIG.GAMEPLAY.BOSS_LEVEL_INTERVAL : 5;
  const bossDefeated = ((level - 1) % bossInterval) === 0; // chefão foi no nível anterior
  weaponProgression.checkWeaponUnlocks(level, bossDefeated);
  availableWeapons = weaponProgression.unlockedWeapons;
  
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
  text(`Vida: ${player.health}/${UpgradeSystem.getMaxHealth()}`, 10, 10);
  
  // Score and coins
  fill(255, 255, 0);
  text(`Score: ${score}`, 10, 30);
  fill(100, 255, 100);
  text(`Moedas: ${totalCoinsEarned}`, 10, 50);
  
  // Level info
  fill(255, 255, 255);
  text(`Nível: ${level}`, 200, 10);
  text(`Inimigos: ${enemies.length}`, 200, 30);
  
  // Dash cooldown indicator
  let dashCooldownRemaining = max(0, CONFIG.PLAYER.DASH.COOLDOWN - (millis() - player.lastDash));
  let dashProgress = 1 - (dashCooldownRemaining / CONFIG.PLAYER.DASH.COOLDOWN);
  
  // Dash bar
  fill(50, 50, 50);
  rect(200, 50, 100, 8);
  fill(player.canDash() ? [0, 255, 100] : [255, 100, 0]);
  rect(200, 50, 100 * dashProgress, 8);
  
  fill(255, 255, 255);
  textSize(12);
  text("DASH", 200, 62);
  
  // Current weapon and dash status
  fill(255, 255, 255);
  textSize(14);
  text(`Arma: ${playerWeapon.type}`, 350, 10);
  
  if (player.isDashing) {
    fill(255, 255, 0);
    text("DASHANDO!", 350, 30);
  } else if (player.canDash()) {
    fill(0, 255, 100);
    text("DASH PRONTO", 350, 30);
  } else {
    fill(255, 100, 0);
    text(`DASH: ${(dashCooldownRemaining/1000).toFixed(1)}s`, 350, 30);
  }
  
  // Shop hint
  fill(150, 150, 150);
  textSize(10);
  text("Pressione ESC para abrir a loja", 350, 50);
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
