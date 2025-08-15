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
      projectile.damage = this.config.DAMAGE * UpgradeSystem.getDamageMultiplier();
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
      projectile.damage = this.config.DAMAGE * UpgradeSystem.getDamageMultiplier();
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
      projectile.damage = this.config.DAMAGE * UpgradeSystem.getDamageMultiplier();
      projectile.remove = false;
    }
  }
  
  shootLaser(x, y, targetX, targetY) {
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
      projectile.damage = this.config.DAMAGE * UpgradeSystem.getDamageMultiplier();
      projectile.remove = false;
      projectile.isLaser = true;
    }
  }
}

// ===========================================
// FUNÇÕES AUXILIARES DE ARMAS
// ===========================================

function switchWeapon(weaponIndex) {
  if (!availableWeapons || !playerWeapon) {
    console.log("Sistema de armas não inicializado ainda");
    return;
  }
  
  if (weaponIndex >= 0 && weaponIndex < availableWeapons.length && weaponIndex !== currentWeaponIndex) {
    let oldWeapon = availableWeapons[currentWeaponIndex];
    currentWeaponIndex = weaponIndex;
    playerWeapon = new Weapon(availableWeapons[currentWeaponIndex]);
    
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
  }
}

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
