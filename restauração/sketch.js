// ===========================================
// SISTEMA DE ARMAS
// ===========================================

class Weapon {
  constructor(type) {
    this.type = type;
    this.config = CONFIG.WEAPONS[type];
    this.lastShot = 0;
  }
  
  canShoot() {
    return millis() - this.lastShot > this.config.COOLDOWN;
  }
  
  shoot(x, y, targetX, targetY) {
    if (!this.canShoot()) return;
    
    this.lastShot = millis();
    
    switch(this.type) {
      case 'RIFLE':
        this.shootRifle(x, y, targetX, targetY);
        break;
      case 'SHOTGUN':
        this.shootShotgun(x, y, targetX, targetY);
        break;
      case 'MACHINE_GUN':
        this.shootMachineGun(x, y, targetX, targetY);
        break;
      case 'LASER':
        this.shootLaser(x, y, targetX, targetY);
        break;
    }
  }
  
  shootRifle(x, y, targetX, targetY) {
    let dx = targetX - x;
    let dy = targetY - y;
    let mag = sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      let vx = (dx / mag) * this.config.PROJECTILE_SPEED;
      let vy = (dy / mag) * this.config.PROJECTILE_SPEED;
      
      let projectile = projectilePool.get();
      projectile.x = x;
      projectile.y = y;
      projectile.vx = vx;
      projectile.vy = vy;
      projectile.isEnemyProjectile = false;
      projectile.size = this.config.PROJECTILE_SIZE;
      projectile.color = this.config.COLOR;
      projectile.damage = this.config.DAMAGE;
      projectile.remove = false;
    }
  }
  
  shootShotgun(x, y, targetX, targetY) {
    let baseAngle = atan2(targetY - y, targetX - x);
    let spreadRad = radians(this.config.SPREAD_ANGLE);
    
    for (let i = 0; i < this.config.PROJECTILE_COUNT; i++) {
      let angleOffset = map(i, 0, this.config.PROJECTILE_COUNT - 1, -spreadRad/2, spreadRad/2);
      let angle = baseAngle + angleOffset;
      
      let vx = cos(angle) * this.config.PROJECTILE_SPEED;
      let vy = sin(angle) * this.config.PROJECTILE_SPEED;
      
      let projectile = projectilePool.get();
      projectile.x = x;
      projectile.y = y;
      projectile.vx = vx;
      projectile.vy = vy;
      projectile.isEnemyProjectile = false;
      projectile.size = this.config.PROJECTILE_SIZE;
      projectile.color = this.config.COLOR;
      projectile.damage = this.config.DAMAGE;
      projectile.remove = false;
    }
  }
  
  shootMachineGun(x, y, targetX, targetY) {
    let dx = targetX - x;
    let dy = targetY - y;
    let mag = sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      // Adicionar pequeno spread aleatório
      let baseAngle = atan2(dy, dx);
      let spreadRad = radians(this.config.SPREAD_ANGLE);
      let angle = baseAngle + random(-spreadRad/2, spreadRad/2);
      
      let vx = cos(angle) * this.config.PROJECTILE_SPEED;
      let vy = sin(angle) * this.config.PROJECTILE_SPEED;
      
      let projectile = projectilePool.get();
      projectile.x = x;
      projectile.y = y;
      projectile.vx = vx;
      projectile.vy = vy;
      projectile.isEnemyProjectile = false;
      projectile.size = this.config.PROJECTILE_SIZE;
      projectile.color = this.config.COLOR;
      projectile.damage = this.config.DAMAGE;
      projectile.remove = false;
    }
  }
  
  shootLaser(x, y, targetX, targetY) {
    // Para o laser, vamos criar um efeito visual diferente
    // Por enquanto, vamos fazer um projétil mais rápido e fino
    let dx = targetX - x;
    let dy = targetY - y;
    let mag = sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      let vx = (dx / mag) * (this.config.PROJECTILE_SPEED || 12);
      let vy = (dy / mag) * (this.config.PROJECTILE_SPEED || 12);
      
      let projectile = projectilePool.get();
      projectile.x = x;
      projectile.y = y;
      projectile.vx = vx;
      projectile.vy = vy;
      projectile.isEnemyProjectile = false;
      projectile.size = this.config.BEAM_WIDTH;
      projectile.color = this.config.COLOR;
      projectile.damage = this.config.DAMAGE;
      projectile.remove = false;
      projectile.isLaser = true; // Marcador especial para laser
    }
  }
}

// ===========================================
// OBJECT POOLING SYSTEM - OTIMIZAÇÃO DE PERFORMANCE
// ===========================================

class ObjectPool {
  constructor(createFn, resetFn, initialSize = 50) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = [];
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  get() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  releaseAll() {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }
  
  update() {
    // Update all active objects and release those marked for removal
    for (let i = this.active.length - 1; i >= 0; i--) {
      const obj = this.active[i];
      obj.update();
      
      if (obj.remove || (obj.life !== undefined && obj.life <= 0)) {
        this.release(obj);
      }
    }
  }
  
  draw() {
    for (let obj of this.active) {
      obj.draw();
    }
  }
}

// Pool creation functions
function createProjectile() {
  return new Projectile(0, 0, 0, 0, false);
}

function resetProjectile(projectile) {
  projectile.x = 0;
  projectile.y = 0;
  projectile.vx = 0;
  projectile.vy = 0;
  projectile.remove = false;
  projectile.isEnemyProjectile = false;
  projectile.size = CONFIG.PROJECTILE.PLAYER.SIZE;
  projectile.color = CONFIG.PROJECTILE.PLAYER.COLOR;
  projectile.damage = 1;
  projectile.isLaser = false;
}

function createParticle() {
  return new Particle(0, 0, [255, 255, 255]);
}

function resetParticle(particle) {
  particle.x = 0;
  particle.y = 0;
  particle.vx = 0;
  particle.vy = 0;
  particle.life = CONFIG.PARTICLE.LIFETIME;
  particle.size = CONFIG.PARTICLE.MIN_SIZE;
  particle.color = [255, 255, 255];
  particle.remove = false;
}

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
let portal = { x: 1500, y: 1500, size: 80 };

// Armas
let availableWeapons = ['RIFLE', 'SHOTGUN', 'MACHINE_GUN', 'LASER'];
let currentWeaponIndex = 0;
let playerWeapon;

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
  
  // Inicializar pools
  projectilePool = new ObjectPool(createProjectile, resetProjectile);
  particlePool = new ObjectPool(createParticle, resetParticle);
}

function draw() {
  gameStateManager.update();
  gameStateManager.draw();
}

function keyPressed() {
  gameStateManager.handleKeyPressed();
}

// ===========================================
// SISTEMA DE RESET DO JOGO
// ===========================================

function resetGame() {
  // Limpar todos os pools
  if (projectilePool) {
    projectilePool.releaseAll();
  }
  if (particlePool) {
    particlePool.releaseAll();
  }
  
  // Reinicializar o jogo
  initializeGame();
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
  
  // Inicializar sistema de armas
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
}

// ===========================================
// ATUALIZAÇÃO DO JOGO
// ===========================================

function updateGame() {
  // Update camera
  cameraSystem.update();
  
  // Update player
  player.update();
  
  // Weapon switching - teclas 1, 2, 3, 4
  if (keyIsDown(49)) { // Tecla '1'
    switchWeapon(0);
  } else if (keyIsDown(50)) { // Tecla '2'
    switchWeapon(1);
  } else if (keyIsDown(51)) { // Tecla '3'
    switchWeapon(2);
  } else if (keyIsDown(52)) { // Tecla '4'
    switchWeapon(3);
  }
  
  // Player shooting com novo sistema de armas
  if (keyIsDown(79)) { // Tecla 'O'
    // Encontrar inimigo mais próximo para mira automática
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
  
  // Clean up arrays
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
  for (let i = projectilePool.active.length - 1; i >= 0; i--) {
    let projectile = projectilePool.active[i];
    if (projectile.isEnemyProjectile) continue;
    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      if (dist(projectile.x, projectile.y, enemy.x, enemy.y) < (projectile.size + enemy.size) / 2) {
        // Hit enemy
        enemy.health--;
        projectilePool.release(projectile);
        
        // Create particles
        for (let k = 0; k < 5; k++) {
          let particle = particlePool.get();
          particle.x = enemy.x;
          particle.y = enemy.y;
          particle.vx = random(-2, 2);
          particle.vy = random(-2, 2);
          particle.life = CONFIG.PARTICLE.LIFETIME;
          particle.size = CONFIG.PARTICLE.MIN_SIZE;
          particle.color = [255, 100, 100];
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
  for (let i = projectilePool.active.length - 1; i >= 0; i--) {
    let projectile = projectilePool.active[i];
    if (!projectile.isEnemyProjectile) continue;
    if (dist(projectile.x, projectile.y, player.x, player.y) < (projectile.size + player.size) / 2) {
      player.health--;
      projectilePool.release(projectile);
      
      // Create particles
      for (let k = 0; k < 3; k++) {
        let particle = particlePool.get();
        particle.x = player.x;
        particle.y = player.y;
        particle.vx = random(-2, 2);
        particle.vy = random(-2, 2);
        particle.life = CONFIG.PARTICLE.LIFETIME;
        particle.size = CONFIG.PARTICLE.MIN_SIZE;
        particle.color = [255, 0, 0];
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

// ===========================================
// SISTEMA DE ARMAS - FUNÇÕES AUXILIARES
// ===========================================

// Função auxiliar para trocar armas
function switchWeapon(weaponIndex) {
  // Verificar se o sistema de armas está inicializado
  if (!availableWeapons || !playerWeapon) {
    console.log("Sistema de armas não inicializado ainda");
    return;
  }
  
  if (weaponIndex >= 0 && weaponIndex < availableWeapons.length && weaponIndex !== currentWeaponIndex) {
    let oldWeapon = availableWeapons[currentWeaponIndex];
    currentWeaponIndex = weaponIndex;
    playerWeapon = new Weapon(availableWeapons[currentWeaponIndex]);
    
    // Debug e feedback visual
    console.log(`Arma trocada de ${oldWeapon} para ${availableWeapons[currentWeaponIndex]}`);
    
    // Criar partícula visual para feedback da troca
    if (particlePool && player) {
      for (let i = 0; i < 3; i++) {
        let particle = particlePool.get();
        particle.x = player.x + random(-20, 20);
        particle.y = player.y + random(-20, 20);
        particle.vx = random(-1, 1);
        particle.vy = random(-1, 1);
        particle.life = 30;
        particle.size = 5;
        particle.color = CONFIG.WEAPONS[availableWeapons[currentWeaponIndex]].COLOR;
        particle.remove = false;
      }
    }
  } else if (weaponIndex === currentWeaponIndex) {
    console.log(`Arma ${availableWeapons[currentWeaponIndex]} já está selecionada`);
  }
}

// Função auxiliar para encontrar inimigo mais próximo
function findClosestEnemy() {
  if (!enemies || enemies.length === 0) return null;
  
  let closest = null;
  let minDist = Infinity;
  
  for (let enemy of enemies) {
    if (!enemy || typeof enemy.x !== 'number' || typeof enemy.y !== 'number') continue;
    
    let d = dist(player.x, player.y, enemy.x, enemy.y);
    if (d < minDist) {
      minDist = d;
      closest = enemy;
    }
  }
  
  return closest;
}