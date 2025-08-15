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
        // Use the new takeDamage method
        let enemyDestroyed = enemy.takeDamage(projectile.damage);
        projectilePool.release(projectile);
        
        // Create hit particles
        createHitParticles(enemy.x, enemy.y, enemy.config.COLOR);
        
        if (enemyDestroyed) {
          // Enemy destroyed - give different scores based on type
          // Explode on-death for EXPLOSIVE enemies (se tiver lógica de explosão)
          if (enemy && enemy.type === 'EXPLOSIVE' && typeof enemy.explode === 'function') {
            enemy.explode();
          }
          
          let scoreValue = getEnemyScore(enemy.type);
          score += scoreValue;
          enemies.splice(j, 1);
          
          // Drop rewards
          dropRewards(enemy.x, enemy.y);
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
      // Check if player is invincible (dash or normal invulnerability)
      if (!player.invulnerable && !player.isInvincible()) {
        player.health--;
        projectilePool.release(projectile);
        
        // Create damage particles
        createHitParticles(player.x, player.y, [255, 0, 0]);
        
        // Activate temporary invulnerability
        player.invulnerable = true;
        setTimeout(() => {
          if (player) player.invulnerable = false;
        }, CONFIG.PLAYER.INVINCIBILITY_TIME);
        
        // Check game over
        if (player.health <= 0) {
          return;
        }
      } else {
        // Player invincible - just remove projectile
        projectilePool.release(projectile);
      }
    }
  }
  
  // Player vs power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let powerUp = powerUps[i];
    if (dist(player.x, player.y, powerUp.x, powerUp.y) < (player.size + powerUp.size) / 2) {
      if (powerUp.type === 'health') {
        player.health = min(player.health + 1, UpgradeSystem.getMaxHealth());
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
      UpgradeSystem.addCoins(5);
      score += 5;
      coins.splice(i, 1);
      
      // Coin collection effect
      createHitParticles(coin.x, coin.y, [255, 255, 0]);
    }
  }
  
  // Player vs enemies - contact damage
  for (let enemy of enemies) {
    if (dist(player.x, player.y, enemy.x, enemy.y) < (player.size + enemy.size) / 2) {
      if (!player.invulnerable && !player.isInvincible()) {
        player.health--;
        player.invulnerable = true;
        
        // Remove invulnerability after time
        setTimeout(() => {
          if (player) player.invulnerable = false;
        }, CONFIG.PLAYER.INVINCIBILITY_TIME);
        
        // Push player away
        let angle = atan2(player.y - enemy.y, player.x - enemy.x);
        player.x += cos(angle) * 20;
        player.y += sin(angle) * 20;
        
        // Create damage particles
        createHitParticles(player.x, player.y, [255, 50, 50]);
        
        // Check game over
        if (player.health <= 0) {
          return;
        }
      }
    }
  }
}

function getEnemyScore(enemyType) {
  switch(enemyType) {
    case 'SWARM': return 5;      // Fácil de matar, menos pontos
    case 'NORMAL': return 10;    // Pontuação padrão
    case 'FAST': return 15;      // Um pouco mais difícil
    case 'SNIPER': return 20;    // Perigoso à distância
    case 'TANK': return 25;      // Muito resistente
    case 'TELEPORTER': return 30; // Difícil de acertar
    case 'BOSS': return 100;     // Chefe vale muito
    default: return 10;
  }
}

// ===========================================
// FUNÇÕES AUXILIARES DE COLISÃO
// ===========================================

function createHitParticles(x, y, color) {
  for (let k = 0; k < 5; k++) {
    let particle = particlePool.get();
    particle.x = x;
    particle.y = y;
    particle.vx = random(-3, 3);
    particle.vy = random(-3, 3);
    particle.life = CONFIG.PARTICLE.LIFETIME;
    particle.size = CONFIG.PARTICLE.MIN_SIZE;
    particle.color = color;
  }
}

function dropRewards(x, y) {
  // Chance to drop power-up
  if (random() < 0.15) {
    let type = random(['health', 'speed']);
    powerUps.push(new PowerUp(x, y, type));
  }
  
  // Chance to drop coin
  if (random() < 0.25) {
    coins.push(new Coin(x, y));
  }
}
