class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = CONFIG.PLAYER.SIZE;
    this.speed = CONFIG.PLAYER.SPEED;
    this.projectiles = [];
    this.health = CONFIG.PLAYER.MAX_HEALTH;
    this.lastShot = 0;
    this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN;
  }

  update() {
    if (keyIsDown(87)) this.y -= this.speed; // W
    if (keyIsDown(83)) this.y += this.speed; // S
    if (keyIsDown(65)) this.x -= this.speed; // A
    if (keyIsDown(68)) this.x += this.speed; // D

    // Limitar o movimento do player ao tamanho do mapa (todas as bordas)
    this.x = constrain(this.x, this.size / 2, CONFIG.MAP.WIDTH - this.size / 2);
    this.y = constrain(this.y, this.size / 2, CONFIG.MAP.HEIGHT - this.size / 2);

    for (let p of this.projectiles) p.update();
    this.projectiles = this.projectiles.filter(p => !p.remove);
  }

  draw() {
    fill(...CONFIG.PLAYER.COLOR);
    ellipse(this.x, this.y, this.size);

    for (let p of this.projectiles) p.draw();
  }
}

// PowerUp
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = CONFIG.POWERUP.SIZE;
    this.type = type; // 'life', 'speed', etc
  }
  draw() {
    if (this.type === 'life') fill(...CONFIG.POWERUP.LIFE.COLOR);
    else if (this.type === 'speed') fill(...CONFIG.POWERUP.SPEED.COLOR);
    else fill(255); // cor padrão
    ellipse(this.x, this.y, this.size);
  }
}

// Coin
class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = CONFIG.COIN.SIZE;
  }
  draw() {
    fill(...CONFIG.COIN.COLOR);
    ellipse(this.x, this.y, this.size);
  }
}

// FastEnemy
class FastEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.speed = CONFIG.ENEMY.FAST.SPEED;
    this.size = CONFIG.ENEMY.FAST.SIZE;
    this.health = CONFIG.ENEMY.FAST.HEALTH;
    this.maxHealth = CONFIG.ENEMY.FAST.HEALTH;
  }
}

// BossEnemy
class BossEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.size = CONFIG.ENEMY.BOSS.SIZE;
    this.health = CONFIG.ENEMY.BOSS.HEALTH;
    this.speed = CONFIG.ENEMY.BOSS.SPEED;
    this.lastShot = 0;
  }

  update(player) {
    // Safety check
    if (!player) return;
    
    super.update(player);
    
    // Shoot projectiles towards player
    if (millis() - this.lastShot > CONFIG.ENEMY.BOSS.SHOOT_COOLDOWN) {
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      let mag = sqrt(dx * dx + dy * dy);
      
      if (mag > 0) {
        let speed = CONFIG.PROJECTILE.ENEMY.SPEED;
        let vx = (dx / mag) * speed;
        let vy = (dy / mag) * speed;

        // Usar object pool para projéteis de inimigos
        let projectile = projectilePool.get();
        projectile.x = this.x;
        projectile.y = this.y;
        projectile.vx = vx;
        projectile.vy = vy;
        projectile.isEnemyProjectile = true;
        projectile.size = CONFIG.PROJECTILE.ENEMY.SIZE;
        projectile.remove = false;
        
        this.lastShot = millis();
      }
    }
  }
}