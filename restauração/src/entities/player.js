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
    
    // Sistema de Dash
    this.isDashing = false;
    this.dashStartTime = 0;
    this.lastDash = 0;
    this.dashDirection = { x: 0, y: 0 };
    this.dashTrail = []; // Array para o rastro visual
  }

  update() {
    this.handleDash();
    this.handleMovement();
    this.updateDashTrail();

    // Limitar o movimento do player ao tamanho do mapa (todas as bordas)
    this.x = constrain(this.x, this.size / 2, CONFIG.MAP.WIDTH - this.size / 2);
    this.y = constrain(this.y, this.size / 2, CONFIG.MAP.HEIGHT - this.size / 2);

    for (let p of this.projectiles) p.update();
    this.projectiles = this.projectiles.filter(p => !p.remove);
  }

  handleDash() {
    // Verificar se deve iniciar dash (Shift pressionado)
    if (keyIsDown(16) && this.canDash()) { // 16 = Shift
      this.startDash();
    }

    // Atualizar dash em andamento
    if (this.isDashing) {
      let dashElapsed = millis() - this.dashStartTime;
      
      if (dashElapsed < CONFIG.PLAYER.DASH.DURATION) {
        // Continuar dash
        let dashSpeed = this.speed * CONFIG.PLAYER.DASH.SPEED_MULTIPLIER;
        this.x += this.dashDirection.x * dashSpeed;
        this.y += this.dashDirection.y * dashSpeed;
        
        // Adicionar partículas do rastro
        this.addDashTrailParticle();
      } else {
        // Finalizar dash
        this.isDashing = false;
      }
    }
  }

  handleMovement() {
    // Movimento normal (apenas se não estiver dashando)
    if (!this.isDashing) {
      if (keyIsDown(87)) this.y -= this.speed; // W
      if (keyIsDown(83)) this.y += this.speed; // S
      if (keyIsDown(65)) this.x -= this.speed; // A
      if (keyIsDown(68)) this.x += this.speed; // D
    }
  }

  canDash() {
    return !this.isDashing && (millis() - this.lastDash > CONFIG.PLAYER.DASH.COOLDOWN);
  }

  startDash() {
    // Determinar direção do dash baseado nas teclas pressionadas
    let dashX = 0, dashY = 0;
    
    if (keyIsDown(87)) dashY = -1; // W
    if (keyIsDown(83)) dashY = 1;  // S
    if (keyIsDown(65)) dashX = -1; // A
    if (keyIsDown(68)) dashX = 1;  // D
    
    // Se nenhuma direção, dash para frente (direção do mouse)
    if (dashX === 0 && dashY === 0) {
      let angle = atan2(mouseY - this.y, mouseX - this.x);
      dashX = cos(angle);
      dashY = sin(angle);
    }
    
    // Normalizar direção
    let magnitude = sqrt(dashX * dashX + dashY * dashY);
    if (magnitude > 0) {
      this.dashDirection.x = dashX / magnitude;
      this.dashDirection.y = dashY / magnitude;
    }
    
    this.isDashing = true;
    this.dashStartTime = millis();
    this.lastDash = millis();
  }

  addDashTrailParticle() {
    // Adicionar partícula do rastro
    this.dashTrail.push({
      x: this.x,
      y: this.y,
      life: 255,
      maxLife: 255
    });
    
    // Limitar número de partículas
    if (this.dashTrail.length > CONFIG.PLAYER.DASH.TRAIL_PARTICLES) {
      this.dashTrail.shift();
    }
  }

  updateDashTrail() {
    // Atualizar partículas do rastro
    for (let i = this.dashTrail.length - 1; i >= 0; i--) {
      let particle = this.dashTrail[i];
      particle.life -= 15; // Fade out
      
      if (particle.life <= 0) {
        this.dashTrail.splice(i, 1);
      }
    }
  }

  isInvincible() {
    // I-frames durante dash
    if (this.isDashing) {
      let dashElapsed = millis() - this.dashStartTime;
      return dashElapsed < CONFIG.PLAYER.DASH.INVINCIBILITY;
    }
    return false;
  }

  draw() {
    // Desenhar rastro do dash
    this.drawDashTrail();
    
    // Desenhar player com efeito visual durante dash
    if (this.isDashing) {
      // Efeito de brilho durante dash
      fill(255, 255, 255, 100);
      ellipse(this.x, this.y, this.size + 10);
    }
    
    // Player normal
    fill(...CONFIG.PLAYER.COLOR);
    if (this.isInvincible()) {
      // Piscar durante i-frames
      fill(CONFIG.PLAYER.COLOR[0], CONFIG.PLAYER.COLOR[1], CONFIG.PLAYER.COLOR[2], 150);
    }
    ellipse(this.x, this.y, this.size);

    for (let p of this.projectiles) p.draw();
  }

  drawDashTrail() {
    // Desenhar rastro de partículas
    for (let i = 0; i < this.dashTrail.length; i++) {
      let particle = this.dashTrail[i];
      let alpha = map(particle.life, 0, particle.maxLife, 0, 150);
      let size = map(i, 0, this.dashTrail.length - 1, this.size * 0.3, this.size * 0.8);
      
      fill(CONFIG.PLAYER.COLOR[0], CONFIG.PLAYER.COLOR[1], CONFIG.PLAYER.COLOR[2], alpha);
      ellipse(particle.x, particle.y, size);
    }
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
