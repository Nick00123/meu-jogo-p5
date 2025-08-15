// ===========================================
// SISTEMA DE BOSS BATTLES ÉPICOS
// ===========================================

class BossEnemy extends Enemy {
  constructor(x, y, level = 1) {
    super(x, y, 'BOSS');
    
    // Configurações do boss escalonadas por nível
    this.level = level;
    this.maxHealth = CONFIG.ENEMY.BOSS.HEALTH * (1 + (level - 1) * 0.5);
    this.health = this.maxHealth;
    this.size = CONFIG.ENEMY.BOSS.SIZE * (1 + level * 0.1);
    this.speed = CONFIG.ENEMY.BOSS.SPEED * (1 - level * 0.05);
    
    // Multiplicadores de escalonamento (ficam mais fortes a cada boss)
    this.damageScale = 1 + (level - 1) * 0.25;           // +25% de dano por nível
    this.cooldownScale = 1 + (level - 1) * 0.10;         // -10% cooldown por nível (aplicado como divisão)
    this.projectileSpeedScale = 1 + (level - 1) * 0.10;  // +10% velocidade projétil por nível
    
    // Sistema de fases
    this.phases = 3;
    this.currentPhase = 1;
    this.phaseHealthThresholds = [
      this.maxHealth * 0.66, // Fase 2 em 66%
      this.maxHealth * 0.33  // Fase 3 em 33%
    ];
    
    // Sistema de ataques
    this.attackPatterns = [];
    this.currentAttack = null;
    this.attackCooldown = 0;
    this.nextAttackTime = 0;
    
    // Efeitos visuais
    this.glowIntensity = 0;
    this.warningBeams = [];
    this.attackIndicators = [];
    
    // Configurar ataques baseados na fase
    this.setupAttackPatterns();
    
    // Partículas do boss
    this.bossParticles = [];
    this.auraParticles = [];
    
    // Estado especial
    this.isEnraged = false;
    this.enrageThreshold = this.maxHealth * 0.2;
    
    // Sistema de invulnerabilidade
    this.isInvulnerable = true; // invulnerável ao spawn
    this.invulnerabilityTime = 2000; // ms
    setTimeout(() => { this.isInvulnerable = false; }, this.invulnerabilityTime);
  }
  
  setupAttackPatterns() {
    // Ataques mudam conforme a fase
    this.attackPatterns = [
      // Fase 1 - Ataques básicos
      {
        name: "Círculo de Projéteis",
        damage: 1,
        cooldown: 2000,
        execute: () => this.circleAttack(),
        phase: 1
      },
      {
        name: "Rajada Direta",
        damage: 2,
        cooldown: 1500,
        execute: () => this.burstAttack(),
        phase: 1
      },
      
      // Fase 2 - Ataques intermediários
      {
        name: "Onda de Choque",
        damage: 3,
        cooldown: 3000,
        execute: () => this.shockwaveAttack(),
        phase: 2
      },
      {
        name: "Chuva de Projéteis",
        damage: 1,
        cooldown: 2500,
        execute: () => this.rainAttack(),
        phase: 2
      },
      
      // Fase 3 - Ataques devastadores
      {
        name: "Laser Giratório",
        damage: 4,
        cooldown: 4000,
        execute: () => this.laserSpinAttack(),
        phase: 3
      },
      {
        name: "Meteoro",
        damage: 5,
        cooldown: 5000,
        execute: () => this.meteorAttack(),
        phase: 3
      }
    ];
  }
  
  update(player) {
    super.update(player);
    
    // Atualizar fases
    this.updatePhase();
    
    // Atualizar ataques
    this.updateAttacks(player);
    
    // Atualizar efeitos visuais
    this.updateVisualEffects();
    
    // Verificar enrage
    this.checkEnrage();
    
    // Atualizar partículas
    this.updateParticles();
  }
  
  updatePhase() {
    if (this.currentPhase === 1 && this.health <= this.phaseHealthThresholds[0]) {
      this.currentPhase = 2;
      this.enterPhase(2);
    } else if (this.currentPhase === 2 && this.health <= this.phaseHealthThresholds[1]) {
      this.currentPhase = 3;
      this.enterPhase(3);
    }
  }
  
  enterPhase(phase) {
    // Efeito visual de transição
    this.createPhaseTransitionEffect();
    
    // Aumentar velocidade e dano
    this.speed *= 1.2;
    
    // Notificar o jogador
    this.showPhaseNotification(phase);
  }
  
  updateAttacks(player) {
    let currentTime = millis();
    
    if (currentTime > this.nextAttackTime && !this.isInvulnerable) {
      // Selecionar ataque apropriado para a fase
      let availableAttacks = this.attackPatterns.filter(a => a.phase <= this.currentPhase);
      
      if (availableAttacks.length > 0) {
        let attack = random(availableAttacks);
        this.currentAttack = attack;
        // Reduzir cooldown com o nível do boss
        this.nextAttackTime = currentTime + (attack.cooldown / this.cooldownScale);
        attack.execute();
      }
    }
  }
  
  // ===== ATAQUES ESPECIAIS =====
  
  circleAttack() {
    let projectileCount = 8 + this.currentPhase * 2 + Math.max(0, Math.floor(this.level));
    let angleStep = TWO_PI / projectileCount;
    
    for (let i = 0; i < projectileCount; i++) {
      let angle = i * angleStep;
      let vx = cos(angle) * 5 * this.projectileSpeedScale;
      let vy = sin(angle) * 5 * this.projectileSpeedScale;
      
      this.createBossProjectile(this.x, this.y, vx, vy, 1);
    }
    
    this.createAttackWarning("Círculo de Projéteis!");
  }
  
  burstAttack() {
    // Rajada de 3 projéteis direcionados ao player
    let player = this.getPlayer();
    if (!player) return;
    
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      for (let i = 0; i < 3; i++) {
        let vx = (dx / mag) * 6 * this.projectileSpeedScale;
        let vy = (dy / mag) * 6 * this.projectileSpeedScale;
        
        // Adicionar pequena variação
        let spread = 0.1;
        vx += random(-spread, spread);
        vy += random(-spread, spread);
        
        this.createBossProjectile(this.x, this.y, vx, vy, 2);
      }
    }
    
    this.createAttackWarning("Rajada Direta!");
  }
  
  shockwaveAttack() {
    // Onda de choque que se expande
    let shockwaves = 3;
    
    for (let i = 0; i < shockwaves; i++) {
      setTimeout(() => {
        this.createShockwave(i * 50);
      }, i * 200);
    }
    
    this.createAttackWarning("Onda de Choque!");
  }
  
  rainAttack() {
    // Chuva de projéteis do céu
    let rainCount = 10 + this.currentPhase * 3 + Math.max(0, Math.floor(this.level));
    
    for (let i = 0; i < rainCount; i++) {
      setTimeout(() => {
        let x = random(0, CONFIG.MAP.WIDTH);
        let y = -50;
        let vx = random(-1, 1) * this.projectileSpeedScale;
        let vy = (3 + random(0, 2)) * this.projectileSpeedScale;
        
        this.createBossProjectile(x, y, vx, vy, 1);
      }, i * 100);
    }
    
    this.createAttackWarning("Chuva de Projéteis!");
  }
  
  laserSpinAttack() {
    // Laser giratório
    let duration = 3000;
    let startTime = millis();
    
    this.createAttackWarning("Laser Giratório!");
    
    let laserInterval = setInterval(() => {
      let elapsed = millis() - startTime;
      if (elapsed > duration) {
        clearInterval(laserInterval);
        return;
      }
      
      let angle = (elapsed / duration) * TWO_PI * 2;
      let vx = cos(angle) * 8 * this.projectileSpeedScale;
      let vy = sin(angle) * 8 * this.projectileSpeedScale;
      
      this.createBossProjectile(this.x, this.y, vx, vy, 4);
    }, 50);
  }
  
  meteorAttack() {
    // Meteoros caindo do céu
    let meteorCount = 3 + this.currentPhase + Math.max(0, Math.floor(this.level));
    
    for (let i = 0; i < meteorCount; i++) {
      setTimeout(() => {
        let targetX = this.getPlayer().x + random(-100, 100);
        let targetY = this.getPlayer().y + random(-100, 100);
        
        this.createMeteor(targetX, targetY);
      }, i * 1000);
    }
    
    this.createAttackWarning("Meteoro!");
  }
  
  // ===== SISTEMA DE PROJÉTEIS DO BOSS =====
  
  createBossProjectile(x, y, vx, vy, damage) {
    let projectile = projectilePool.get();
    projectile.x = x;
    projectile.y = y;
    projectile.vx = vx * this.projectileSpeedScale;
    projectile.vy = vy * this.projectileSpeedScale;
    projectile.isEnemyProjectile = true;
    projectile.isBossProjectile = true;
    projectile.size = 12;
    projectile.color = [255, 0, 255];
    projectile.damage = Math.ceil(damage * this.damageScale);
    projectile.remove = false;
    
    // Adicionar brilho especial
    projectile.glow = true;
  }
  
  createShockwave(radius) {
    // Criar onda de choque visual
    this.warningBeams.push({
      x: this.x,
      y: this.y,
      radius: radius,
      maxRadius: 200,
      life: 60,
      damage: 3
    });
  }
  
  createMeteor(targetX, targetY) {
    // Criar meteoro que cai do céu
    let meteor = {
      x: targetX,
      y: -100,
      targetX: targetX,
      targetY: targetY,
      size: 30,
      speed: 5,
      damage: 5,
      warningTime: 60,
      falling: false
    };
    
    this.attackIndicators.push(meteor);
  }
  
  // ===== SISTEMA DE EFEITOS VISUAIS =====
  
  updateVisualEffects() {
    // Atualizar intensidade do brilho
    this.glowIntensity = 0.5 + 0.5 * sin(millis() * 0.005);
    
    // Atualizar avisos de ataque
    this.updateWarningBeams();
    this.updateAttackIndicators();
  }
  
  updateWarningBeams() {
    for (let i = this.warningBeams.length - 1; i >= 0; i--) {
      let beam = this.warningBeams[i];
      beam.life--;
      
      if (beam.life <= 0) {
        this.warningBeams.splice(i, 1);
      }
    }
  }
  
  updateAttackIndicators() {
    for (let i = this.attackIndicators.length - 1; i >= 0; i--) {
      let indicator = this.attackIndicators[i];
      
      if (indicator.warningTime > 0) {
        indicator.warningTime--;
      } else {
        indicator.falling = true;
        indicator.y += indicator.speed;
        
        if (indicator.y > indicator.targetY) {
          // Impacto do meteoro
          this.createMeteorImpact(indicator.x, indicator.y);
          this.attackIndicators.splice(i, 1);
        }
      }
    }
  }
  
  createMeteorImpact(x, y) {
    // Criar explosão no impacto
    for (let i = 0; i < 20; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 8);
      
      let particle = particlePool.get();
      particle.x = x;
      particle.y = y;
      particle.vx = cos(angle) * speed;
      particle.vy = sin(angle) * speed;
      particle.life = 60;
      particle.size = random(5, 15);
      particle.color = [255, 100, 0];
      particle.remove = false;
    }
  }
  
  // ===== SISTEMA DE ENRAGE =====
  
  checkEnrage() {
    if (!this.isEnraged && this.health <= this.enrageThreshold) {
      this.enterEnrage();
    }
  }
  
  enterEnrage() {
    this.isEnraged = true;
    this.speed *= 1.5;
    this.createEnrageEffect();
    this.showEnrageNotification();
  }
  
  createEnrageEffect() {
    // Criar efeito visual de enrage
    for (let i = 0; i < 50; i++) {
      let angle = random(TWO_PI);
      let distance = random(50, 100);
      
      let particle = particlePool.get();
      particle.x = this.x + cos(angle) * distance;
      particle.y = this.y + sin(angle) * distance;
      particle.vx = cos(angle) * 3;
      particle.vy = sin(angle) * 3;
      particle.life = 120;
      particle.size = 8;
      particle.color = [255, 0, 0];
      particle.remove = false;
    }
  }
  
  // ===== SISTEMA DE NOTIFICAÇÕES =====
  
  createAttackWarning(text) {
    // Adicionar notificação na tela
    this.showNotification(text, [255, 100, 100]);
  }
  
  showPhaseNotification(phase) {
    let text = `FASE ${phase} - PREPARE-SE!`;
    this.showNotification(text, [255, 255, 0]);
  }
  
  showEnrageNotification() {
    let text = "BOSS ENRAGED! CUIDADO!";
    this.showNotification(text, [255, 0, 0]);
  }
  
  showNotification(text, color) {
    // Criar notificação na tela
    let notification = {
      text: text,
      color: color,
      life: 120,
      x: width / 2,
      y: height / 2
    };
    
    // Adicionar ao sistema de notificações
    if (window.bossNotifications) {
      window.bossNotifications.push(notification);
    }
  }
  
  // ===== SISTEMA DE PARTÍCULAS =====
  
  updateParticles() {
    // Atualizar partículas do boss
    this.updateBossParticles();
    this.updateAuraParticles();
  }
  
  updateBossParticles() {
    // Criar partículas constantes
    if (frameCount % 5 === 0) {
      let particle = particlePool.get();
      particle.x = this.x + random(-this.size, this.size);
      particle.y = this.y + random(-this.size, this.size);
      particle.vx = random(-1, 1);
      particle.vy = random(-1, 1);
      particle.life = 30;
      particle.size = 3;
      particle.color = this.isEnraged ? [255, 0, 0] : [150, 0, 150];
      particle.remove = false;
    }
  }
  
  updateAuraParticles() {
    // Criar aura ao redor do boss
    if (frameCount % 2 === 0) {
      let angle = random(TWO_PI);
      let distance = this.size + 20;
      
      let particle = particlePool.get();
      particle.x = this.x + cos(angle) * distance;
      particle.y = this.y + sin(angle) * distance;
      particle.vx = cos(angle) * 0.5;
      particle.vy = sin(angle) * 0.5;
      particle.life = 60;
      particle.size = 2;
      particle.color = [255, 255, 0];
      particle.remove = false;
    }
  }
  
  // ===== FUNÇÕES AUXILIARES =====
  
  getPlayer() {
    return player;
  }
  
  createPhaseTransitionEffect() {
    // Criar efeito de transição entre fases
    for (let i = 0; i < 100; i++) {
      let angle = random(TWO_PI);
      let distance = random(0, 200);
      
      let particle = particlePool.get();
      particle.x = this.x + cos(angle) * distance;
      particle.y = this.y + sin(angle) * distance;
      particle.vx = cos(angle) * 2;
      particle.vy = sin(angle) * 2;
      particle.life = 90;
      particle.size = 5;
      particle.color = [255, 255, 0];
      particle.remove = false;
    }
  }
  
  // ===== FUNÇÃO DE DESENHO APRIMORADA =====
  
  draw() {
    // Desenhar aura
    this.drawAura();
    
    // Desenhar boss com efeitos
    this.drawBossWithEffects();
    
    // Desenhar avisos de ataque
    this.drawAttackWarnings();
    
    // Desenhar indicadores de ataque
    this.drawAttackIndicators();
    
    // Desenhar barra de vida especial
    this.drawBossHealthBar();
  }
  
  drawAura() {
    push();
    // Aura pulsante
    let auraSize = this.size * 2 + sin(millis() * 0.005) * 10;
    fill(150, 0, 150, 50 * this.glowIntensity);
    noStroke();
    ellipse(this.x, this.y, auraSize);
    
    // Segunda camada de aura
    let innerAuraSize = this.size * 1.5;
    fill(255, 0, 255, 30 * this.glowIntensity);
    ellipse(this.x, this.y, innerAuraSize);
    pop();
  }
  
  drawBossWithEffects() {
    push();
    
    // Efeito de brilho quando enraged
    if (this.isEnraged) {
      drawingContext.shadowColor = "rgba(255, 0, 0, 0.8)";
      drawingContext.shadowBlur = 20;
    }
    
    // Cor baseada na fase
    let bossColor = this.isEnraged ? [255, 0, 0] : [150, 0, 150];
    fill(...bossColor);
    
    // Desenhar boss maior que inimigos normais
    ellipse(this.x, this.y, this.size);
    
    // Detalhes do boss
    fill(255, 255, 0);
    ellipse(this.x - this.size/4, this.y - this.size/4, this.size/4);
    ellipse(this.x + this.size/4, this.y - this.size/4, this.size/4);
    
    // Resetar sombra
    drawingContext.shadowBlur = 0;
    pop();
  }
  
  drawAttackWarnings() {
    for (let beam of this.warningBeams) {
      push();
      stroke(255, 0, 0, 150);
      strokeWeight(3);
      noFill();
      ellipse(this.x, this.y, beam.radius * 2);
      pop();
    }
  }
  
  drawAttackIndicators() {
    for (let indicator of this.attackIndicators) {
      if (!indicator.falling) {
        // Aviso de meteoro
        push();
        fill(255, 0, 0, 150);
        stroke(255, 255, 0);
        strokeWeight(2);
        ellipse(indicator.x, indicator.y - 100, indicator.size);
        
        fill(255, 255, 0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text("!", indicator.x, indicator.y - 100);
        pop();
      }
    }
  }
  
  drawBossHealthBar() {
    // Barra de vida especial do boss
    let barWidth = 300;
    let barHeight = 20;
    let barY = this.y - this.size - 30;
    
    push();
    
    // Fundo da barra
    fill(0, 0, 0, 200);
    rect(this.x - barWidth/2 - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    // Barra de vida
    let healthPercent = this.health / this.maxHealth;
    let healthColor = this.isEnraged ? [255, 0, 0] : [0, 200, 0];
    
    fill(...healthColor);
    rect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
    
    // Borda
    noFill();
    stroke(255);
    rect(this.x - barWidth/2, barY, barWidth, barHeight);
    
    // Texto
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(`BOSS - Fase ${this.currentPhase}`, this.x, barY - 15);
    
    // Indicadores de fase
    for (let i = 0; i < this.phases; i++) {
      let phaseX = this.x - barWidth/2 + (barWidth / this.phases) * (i + 0.5);
      let phaseColor = i < this.currentPhase ? [255, 255, 0] : [100, 100, 100];
      
      fill(...phaseColor);
      ellipse(phaseX, barY + barHeight + 10, 8);
    }
    
    pop();
  }
  
  // Não receber dano durante invulnerabilidade de spawn
  takeDamage(damage) {
    if (this.isInvulnerable) {
      return false; // não morre, não perde vida
    }
    return super.takeDamage(damage);
  }
}
