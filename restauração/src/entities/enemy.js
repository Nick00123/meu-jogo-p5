// Exemplo para Enemy
class Enemy {
  constructor(x, y, type = 'NORMAL') {
    this.x = x;
    this.y = y;
    this.type = type;
    // Fallback para tipos não presentes em CONFIG (ex.: EnhancedEnemy especiais)
    this.config = CONFIG.ENEMY[type] || CONFIG.ENEMY.NORMAL;
    this.size = (this.config && this.config.SIZE) ? this.config.SIZE : 30;
    this.health = (this.config && this.config.HEALTH) ? this.config.HEALTH : 3;
    this.maxHealth = this.health;
    this.speed = (this.config && this.config.SPEED) ? this.config.SPEED : 2;
    this.lastShot = 0;
    this.lastTeleport = 0;
    this.teleportParticles = [];
  }
  
  update(player) {
    // Safety check - ensure player exists
    if (!player) return;
    
    // Comportamento específico por tipo
    switch(this.type) {
      case 'SNIPER':
        this.updateSniper(player);
        break;
      case 'TANK':
        this.updateTank(player);
        break;
      case 'SWARM':
        this.updateSwarm(player);
        break;
      case 'TELEPORTER':
        this.updateTeleporter(player);
        break;
      default:
        this.updateNormal(player);
    }
    
    // Atualizar partículas de teletransporte
    if (this.type === 'TELEPORTER') {
      this.updateTeleportParticles();
    }
  }
  
  updateNormal(player) {
    // Movimento simples em direção ao player
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      this.x += (dx / mag) * this.speed;
      this.y += (dy / mag) * this.speed;
    }
  }
  
  updateSniper(player) {
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let distance = sqrt(dx * dx + dy * dy);
    
    // Manter distância do jogador
    if (distance < this.config.SHOOT_RANGE) {
      // Se muito perto, recuar
      if (distance < this.config.SHOOT_RANGE * 0.7) {
        let mag = sqrt(dx * dx + dy * dy);
        if (mag > 0) {
          this.x -= (dx / mag) * this.speed;
          this.y -= (dy / mag) * this.speed;
        }
      }
      // Atirar se no alcance
      this.shoot(player);
    } else {
      // Se muito longe, aproximar lentamente
      let mag = sqrt(dx * dx + dy * dy);
      if (mag > 0) {
        this.x += (dx / mag) * this.speed * 0.5;
        this.y += (dy / mag) * this.speed * 0.5;
      }
    }
  }
  
  updateTank(player) {
    // Movimento lento mas direto
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      this.x += (dx / mag) * this.speed;
      this.y += (dy / mag) * this.speed;
    }
  }
  
  updateSwarm(player) {
    // Movimento rápido e errático
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      // Adicionar movimento errático
      let randomX = random(-0.5, 0.5);
      let randomY = random(-0.5, 0.5);
      this.x += (dx / mag) * this.speed + randomX;
      this.y += (dy / mag) * this.speed + randomY;
    }
  }
  
  updateTeleporter(player) {
    let currentTime = millis();
    
    // Verificar se deve teletransportar
    if (currentTime - this.lastTeleport > this.config.TELEPORT_COOLDOWN) {
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      
      // Teletransportar se muito perto do jogador
      if (distance < 100 || random() < 0.3) {
        this.teleport();
        this.lastTeleport = currentTime;
      }
    }
    
    // Movimento normal quando não teletransportando
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      this.x += (dx / mag) * this.speed;
      this.y += (dy / mag) * this.speed;
    }
  }
  
  teleport() {
    // Criar partículas no local atual
    for (let i = 0; i < 10; i++) {
      this.teleportParticles.push({
        x: this.x + random(-this.size/2, this.size/2),
        y: this.y + random(-this.size/2, this.size/2),
        vx: random(-3, 3),
        vy: random(-3, 3),
        life: 30,
        maxLife: 30
      });
    }
    
    // Teletransportar para nova posição
    let angle = random(0, TWO_PI);
    let distance = random(100, this.config.TELEPORT_RANGE);
    this.x += cos(angle) * distance;
    this.y += sin(angle) * distance;
    
    // Manter dentro dos limites do mapa
    this.x = constrain(this.x, 50, CONFIG.MAP.WIDTH - 50);
    this.y = constrain(this.y, 50, CONFIG.MAP.HEIGHT - 50);
    
    // Criar partículas no novo local
    for (let i = 0; i < 10; i++) {
      this.teleportParticles.push({
        x: this.x + random(-this.size/2, this.size/2),
        y: this.y + random(-this.size/2, this.size/2),
        vx: random(-3, 3),
        vy: random(-3, 3),
        life: 30,
        maxLife: 30
      });
    }
  }
  
  updateTeleportParticles() {
    for (let i = this.teleportParticles.length - 1; i >= 0; i--) {
      let p = this.teleportParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      
      if (p.life <= 0) {
        this.teleportParticles.splice(i, 1);
      }
    }
  }
  
  shoot(player) {
    if (!player) return;
    
    let currentTime = millis();
    let cooldown = this.config.SHOOT_COOLDOWN || 1000;
    
    if (currentTime - this.lastShot > cooldown) {
      this.lastShot = currentTime;
      
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      let mag = sqrt(dx * dx + dy * dy);
      
      if (mag > 0) {
        let speed = this.config.PROJECTILE_SPEED || CONFIG.PROJECTILE.ENEMY.SPEED;
        let accuracy = this.config.ACCURACY || 0.8;
        
        // Adicionar imprecisão baseada na accuracy
        let spread = (1 - accuracy) * 0.5;
        let vx = (dx / mag) * speed + random(-spread, spread);
        let vy = (dy / mag) * speed + random(-spread, spread);
        
        // Criar projétil inimigo
        let projectile = projectilePool.get();
        projectile.x = this.x;
        projectile.y = this.y;
        projectile.vx = vx;
        projectile.vy = vy;
        projectile.isEnemyProjectile = true;
        projectile.size = CONFIG.PROJECTILE.ENEMY.SIZE;
        projectile.color = CONFIG.PROJECTILE.ENEMY.COLOR;
        projectile.damage = 1;
        projectile.remove = false;
      }
    }
  }
  
  takeDamage(damage) {
    // Qualquer inimigo com ARMOR reduz dano (Tank, Boss, etc.)
    if (this.config && typeof this.config.ARMOR === 'number') {
      damage *= (1 - this.config.ARMOR);
    }
     
     this.health -= damage;
     return this.health <= 0;
   }
  
  draw() {
    // Desenhar partículas de teletransporte primeiro
    if (this.type === 'TELEPORTER') {
      this.drawTeleportParticles();
    }
    
    // Desenhar inimigo (robusto caso this.config não exista)
    const colorArr = (this.config && this.config.COLOR) ? this.config.COLOR : (this.color || [255, 0, 0]);
    const sizeVal = (this.size) ? this.size : ((this.config && this.config.SIZE) ? this.config.SIZE : 30);
    fill(...colorArr);
    
    // Efeito especial para Teleporter
    if (this.type === 'TELEPORTER') {
      // Adicionar brilho
      drawingContext.shadowColor = `rgba(${colorArr[0]}, ${colorArr[1]}, ${colorArr[2]}, 0.8)`;
      drawingContext.shadowBlur = 15;
    }
    
    ellipse(this.x, this.y, sizeVal);
    
    // Resetar sombra
    if (this.type === 'TELEPORTER') {
      drawingContext.shadowBlur = 0;
    }
    
    // Barra de vida
    this.drawHealthBar();
  }
  
  drawHealthBar() {
    const localSize = (this.size) ? this.size : ((this.config && this.config.SIZE) ? this.config.SIZE : 30);
    const barWidth = localSize;
    const barHeight = CONFIG.ENEMY.HEALTH_BAR.HEIGHT;
    const barY = this.y - localSize/2 - CONFIG.ENEMY.HEALTH_BAR.Y_OFFSET;
    
    // Fundo da barra
    noStroke();
    fill(100, 100, 100);
    rect(this.x - barWidth/2, barY, barWidth, barHeight, 2);
    
    // Barra de vida
    const healthPercent = constrain(this.health / this.maxHealth, 0, 1);
    const healthColor = healthPercent > 0.6 ? [0, 200, 0] : 
                         healthPercent > 0.3 ? [255, 255, 0] : [255, 0, 0];
    
    fill(...healthColor);
    rect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight, 2);
    
    // Borda para visibilidade
    noFill();
    stroke(0);
    rect(this.x - barWidth/2, barY, barWidth, barHeight, 2);
    noStroke();
  }
  
  drawTeleportParticles() {
    for (let p of this.teleportParticles) {
      const particleColor = (this.config && this.config.PARTICLE_COLOR) ? this.config.PARTICLE_COLOR : [200, 100, 255];
      let alpha = map(p.life, 0, p.maxLife, 0, 255);
      fill(particleColor[0], particleColor[1], particleColor[2], alpha);
      ellipse(p.x, p.y, 4);
    }
  }
}