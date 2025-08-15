// Enhanced Enemy System with new enemy types
class EnhancedEnemy extends Enemy {
  constructor(x, y, type) {
    super(x, y, type);
    this.initializeEnhancedProperties();
    this.maxHealth = this.health;
    this.active = true;
    // Track multiplying lineage and produced children
    this.generation = this.generation || 0; // 0 = original
    this.spawnedChildren = this.spawnedChildren || 0;
  }
  
  initializeEnhancedProperties() {
    this.behavior = this.getBehaviorPattern();
    this.attackPattern = this.getAttackPattern();
    this.specialAbility = this.getSpecialAbility();
    this.alertRadius = 150;
    this.isAlerted = false;
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    this.shieldHealth = 0;
    this.canMultiply = false;
    this.multiplyCooldown = 0;
    this.explosionRadius = 0;
    this.explosionDamage = 0;
    this.lastTeleport = 0;
    this.teleportCooldown = 120;
    this.coverPosition = null;
    this.lastCoverCheck = 0;
    this.explosionWindupFrames = 30; // ~0.5s a 60fps
    this.exploding = false;
    this.explodeAtFrame = 0;
    this.reengageCooldown = 0; // cooldown curto após cancelar wind-up
    
    switch(this.type) {
      case 'NORMAL':
        this.health = 50;
        this.size = 30;
        this.speed = 2;
        this.damage = 15;
        this.color = [255, 0, 0];
        this.behavior = 'CHASE';
        break;
        
      case 'FAST':
        this.health = 30;
        this.size = 20;
        this.speed = 4;
        this.damage = 12;
        this.color = [255, 255, 0];
        this.behavior = 'CHASE';
        break;
        
      case 'TANK':
        this.health = 120;
        this.size = 50;
        this.speed = 1;
        this.damage = 25;
        this.color = [100, 100, 100];
        this.behavior = 'CHASE';
        this.damageReduction = 0.5; // 50% damage reduction
        break;
        
      case 'SNIPER':
        this.health = 40;
        this.size = 35;
        this.speed = 1.5;
        this.damage = 30;
        this.attackRange = 300;
        this.shootCooldown = 90;
        this.color = [0, 255, 0];
        this.behavior = 'SNIPER';
        break;
        
      case 'SWARM':
        this.health = 20;
        this.size = 15;
        this.speed = 3.5;
        this.damage = 8;
        this.color = [255, 0, 255];
        this.behavior = 'SWARM';
        break;
        
      case 'RANGED':
        this.health = 60;
        this.size = 28;
        this.speed = 1.5;
        this.damage = 15;
        this.attackRange = 200;
        this.shootCooldown = 60;
        this.color = [100, 100, 255];
        this.behavior = 'COVER_SHOOTER';
        break;
        
      case 'EXPLOSIVE':
        this.health = 40;
        this.size = 30;
        this.speed = 1.0; // ainda mais baixo para não grudar
        this.damage = 30;
        this.explosionRadius = 65; // raio um pouco menor
        // Dano em 'corações' para o jogador (evita hit-kill)
        this.explosionDamage = 2;
        this.explosionWindupFrames = 45; // ~0.75s a 60fps
        this.exploding = false;
        this.explodeAtFrame = 0;
        this.slowModeUntil = 0; // até quando fica em modo lento (ms)
        this.color = [255, 100, 0];
        this.behavior = 'SUICIDE_CHARGE';
        break;
        
      case 'SHIELDED':
        this.health = 80;
        this.size = 40;
        this.shieldHealth = 40;
        this.maxShield = 40;
        this.speed = 1;
        this.damage = 20;
        this.color = [150, 150, 150];
        this.behavior = 'SHIELD_WALL';
        break;
        
      case 'MULTIPLYING':
        this.health = 30;
        this.size = 25;
        this.speed = 2.5;
        this.damage = 10;
        this.canMultiply = true;
        // Use CONFIG limits if provided
        const mcfg = (CONFIG && CONFIG.ENEMY && CONFIG.ENEMY.MULTIPLYING) ? CONFIG.ENEMY.MULTIPLYING : {};
        this.multiplyCooldown = (typeof mcfg.COOLDOWN === 'number') ? mcfg.COOLDOWN : 300;
        this.color = [200, 0, 200];
        this.behavior = 'SPAWNER';
        break;
        
      case 'TELEPORTER':
        this.health = 50;
        this.size = 25;
        this.speed = 2.5;
        this.damage = 12;
        this.teleportCooldown = 180;
        this.color = [0, 200, 200];
        this.behavior = 'BLINK_STRIKE';
        break;
        
      default:
        // Default values for unknown types
        this.health = 50;
        this.size = 30;
        this.speed = 2;
        this.damage = 15;
        this.color = [255, 0, 0];
        this.behavior = 'CHASE';
        break;
    }
  }
  
  getBehaviorPattern() {
    const behaviors = {
      'RANGED': 'COVER_SHOOTER',
      'EXPLOSIVE': 'SUICIDE_CHARGE',
      'SHIELDED': 'SHIELD_WALL',
      'MULTIPLYING': 'SPAWNER',
      'TELEPORTER': 'BLINK_STRIKE',
      'SNIPER': 'SNIPER',
      'SWARM': 'SWARM',
      'TANK': 'CHASE',
      'NORMAL': 'CHASE',
      'FAST': 'CHASE'
    };
    return behaviors[this.type] || 'CHASE';
  }
  
  getAttackPattern() {
    const patterns = {
      'RANGED': 'PROJECTILE_AIM',
      'EXPLOSIVE': 'MELEE_CHARGE',
      'SHIELDED': 'SHIELD_BASH',
      'MULTIPLYING': 'SPAWN_MINIONS',
      'TELEPORTER': 'TELEPORT_STRIKE',
      'SNIPER': 'PRECISION_SHOT',
      'SWARM': 'ERRATIC_ATTACK',
      'TANK': 'DIRECT',
      'NORMAL': 'DIRECT',
      'FAST': 'DIRECT'
    };
    return patterns[this.type] || 'DIRECT';
  }
  
  getSpecialAbility() {
    const abilities = {
      'RANGED': 'COVER_FIRE',
      'EXPLOSIVE': 'SELF_DESTRUCT',
      'SHIELDED': 'SHIELD_REGEN',
      'MULTIPLYING': 'CLONE',
      'TELEPORTER': 'BLINK',
      'SNIPER': 'PRECISION_SHOT',
      'SWARM': 'ERRATIC_MOVEMENT',
      'TANK': 'DAMAGE_REDUCTION',
      'NORMAL': 'NONE',
      'FAST': 'NONE'
    };
    return abilities[this.type] || 'NONE';
  }
  
  update(player) {
    super.update(player);
    
    // Enhanced behaviors
    this.executeBehavior(player);
    this.handleSpecialAbilities(player);
    this.checkAlertStatus(player);
    
    // Se estiver no wind-up da explosão, checar o momento de detonar
    if (this.exploding && frameCount >= this.explodeAtFrame) {
      this.exploding = false;
      this.explode();
      this.health = 0; // remover após explodir
    }
    
    // Reduzir cooldown de reengajamento
    if (this.reengageCooldown > 0) this.reengageCooldown--;
    
    if (this.canMultiply && this.multiplyCooldown <= 0) {
      this.attemptMultiply();
    }
    
    if (this.multiplyCooldown > 0) {
      this.multiplyCooldown--;
    }
    
    if (this.lastTeleport > 0) {
      this.lastTeleport--;
    }
  }
  
  executeBehavior(player) {
    switch(this.behavior) {
      case 'COVER_SHOOTER':
        this.coverShooterBehavior(player);
        break;
      case 'SUICIDE_CHARGE':
        this.suicideChargeBehavior(player);
        break;
      case 'SHIELD_WALL':
        this.shieldWallBehavior(player);
        break;
      case 'SPAWNER':
        this.spawnerBehavior(player);
        break;
      case 'BLINK_STRIKE':
        this.blinkStrikeBehavior(player);
        break;
      case 'SNIPER':
        this.sniperBehavior(player);
        break;
      case 'SWARM':
        this.swarmBehavior(player);
        break;
    }
  }
  
  coverShooterBehavior(player) {
    let distance = dist(this.x, this.y, player.x, player.y);
    
    // Find cover if too close
    if (distance < 100 && this.lastCoverCheck <= 0) {
      this.findCover(player);
      this.lastCoverCheck = 30;
    }
    
    if (this.coverPosition) {
      // Move to cover
      this.moveTowards(this.coverPosition.x, this.coverPosition.y, this.speed);
      
      // Shoot from cover
      if (distance < this.attackRange && this.shootCooldown <= 0) {
        this.shootAtPlayer(player);
      }
    } else {
      // Maintain optimal distance
      if (distance < 150) {
        let angle = atan2(this.y - player.y, this.x - player.x);
        this.x += cos(angle) * this.speed * 0.5;
        this.y += sin(angle) * this.speed * 0.5;
      } else if (distance > 200) {
        this.moveTowards(player.x, player.y, this.speed * 0.3);
      }
      
      if (this.shootCooldown <= 0) {
        this.shootAtPlayer(player);
      }
    }
    
    if (this.lastCoverCheck > 0) this.lastCoverCheck--;
  }
  
  suicideChargeBehavior(player) {
    let distance = dist(this.x, this.y, player.x, player.y);
    const innerStickRadius = this.explosionRadius * 0.9; // manter distância maior
    const minSeparation = (this.size + player.size) * 0.5 + 6; // nunca encostar
    const now = millis();
     
    // Separação dura: se colar, empurra para fora
    if (distance < minSeparation) {
      const ang = atan2(this.y - player.y, this.x - player.x);
      const push = (minSeparation - distance) + 1;
      this.x += cos(ang) * push * 0.6;
      this.y += sin(ang) * push * 0.6;
      distance = dist(this.x, this.y, player.x, player.y);
    }
    
    // Se muito perto e não em slow-mode, entrar em slow-mode por ~2s
    if (distance < innerStickRadius && now >= this.slowModeUntil) {
      this.slowModeUntil = now + 2000; // 2 segundos
      this.exploding = false; // bloquear qualquer wind-up atual
    }
    
    if (distance < this.explosionRadius) {
      // Durante slow-mode: mover muito lentamente e não iniciar wind-up
      if (now < this.slowModeUntil) {
        // manter distância e mover devagar
        if (distance < innerStickRadius) {
          const ang = atan2(this.y - player.y, this.x - player.x);
          this.x += cos(ang) * this.speed * 0.6;
          this.y += sin(ang) * this.speed * 0.6;
        } else {
          this.moveTowards(player.x, player.y, this.speed * 0.1);
        }
        return;
      }
      
      // Iniciar wind-up da explosão (se ainda não iniciou)
      if (!this.exploding) {
        this.exploding = true;
        this.explodeAtFrame = frameCount + (this.explosionWindupFrames || 30);
        // Efeito visual de aviso (pulsos de partículas rápidas)
        for (let i = 0; i < 10; i++) {
          let ang = random(TWO_PI);
          let spd = random(1, 3);
          particles.push(new Particle(
            this.x, this.y,
            cos(ang) * spd, sin(ang) * spd,
            [255, 180, 0], 15
          ));
        }
      }
      // Durante o wind-up, reduzir avanço para dar chance de escapar
      // (mantém uma leve aproximação para pressão)
      if (distance < innerStickRadius) {
        // Muito perto: recuar um pouco para não grudar
        const ang = atan2(this.y - player.y, this.x - player.x);
        this.x += cos(ang) * this.speed * 1.0;
        this.y += sin(ang) * this.speed * 1.0;
      } else {
        this.moveTowards(player.x, player.y, this.speed * 0.2);
      }
    } else {
      // Cancelar wind-up se o jogador se afastar bastante
      if (this.exploding && distance > this.explosionRadius * 1.2) {
        this.exploding = false;
        this.reengageCooldown = 45; // ~0.75s sem perseguir forte
      }
      // Charge at player
      if (this.reengageCooldown > 0) {
        // Durante cooldown, não perseguir agressivamente e manter distância
        if (distance < innerStickRadius) {
          const ang = atan2(this.y - player.y, this.x - player.x);
          this.x += cos(ang) * this.speed * 0.8;
          this.y += sin(ang) * this.speed * 0.8;
        } else {
          // patrulha leve em direção, sem colar
          this.moveTowards(player.x, player.y, this.speed * 0.6);
        }
      } else {
        this.moveTowards(player.x, player.y, this.speed * 0.8);
      }
    }
  }
  
  shieldWallBehavior(player) {
    let distance = dist(this.x, this.y, player.x, player.y);
    
    if (this.shieldHealth > 0) {
      // Defensive positioning
      if (distance < 100) {
        // Back away while shield is up
        let angle = atan2(this.y - player.y, this.x - player.x);
        this.x += cos(angle) * this.speed * 0.3;
        this.y += sin(angle) * this.speed * 0.3;
      } else if (distance > 150) {
        // Move closer
        this.moveTowards(player.x, player.y, this.speed * 0.5);
      }
    } else {
      // More aggressive when shield is down
      this.moveTowards(player.x, player.y, this.speed);
    }
    
    // Shield regeneration
    if (this.shieldHealth < this.maxShield && frameCount % 60 === 0) {
      this.shieldHealth = min(this.shieldHealth + 1, this.maxShield);
    }
  }
  
  spawnerBehavior(player) {
    let distance = dist(this.x, this.y, player.x, player.y);
    
    // Keep distance and spawn
    if (distance < 100) {
      let angle = atan2(this.y - player.y, this.x - player.x);
      this.x += cos(angle) * this.speed;
      this.y += sin(angle) * this.speed;
    } else if (distance > 200) {
      this.moveTowards(player.x, player.y, this.speed * 0.5);
    }
  }
  
  blinkStrikeBehavior(player) {
    let distance = dist(this.x, this.y, player.x, player.y);
    
    // Teleportar apenas se estiver realmente longe
    if (distance > 180 && this.lastTeleport <= 0) {
      // Teleport closer (mas não em cima do player)
      let angle = random(TWO_PI);
      let teleportDistance = random(140, 180);
      this.x = player.x + cos(angle + PI) * teleportDistance;
      this.y = player.y + sin(angle + PI) * teleportDistance;
      this.lastTeleport = this.teleportCooldown;
      this.createTeleportEffect();
      // Após teleporte, segurar avanço por um curto período
      this.reengageCooldown = 45; // ~0.75s
      return;
    }
    
    // Manter distância ideal (ring 110–160)
    const tooClose = 90;
    const idealMin = 110;
    const idealMax = 160;
    
    if (this.reengageCooldown > 0) {
      // Durante cooldown, priorizar não colar
      if (distance < idealMin) {
        let angle = atan2(this.y - player.y, this.x - player.x);
        this.x += cos(angle) * this.speed * 0.9;
        this.y += sin(angle) * this.speed * 0.9;
      } else if (distance > idealMax) {
        this.moveTowards(player.x, player.y, this.speed * 0.4);
      }
      this.reengageCooldown--;
      return;
    }
    
    // Fora do cooldown: recuar se muito perto, aproximar se muito longe
    if (distance < tooClose) {
      let angle = atan2(this.y - player.y, this.x - player.x);
      this.x += cos(angle) * this.speed * 1.1;
      this.y += sin(angle) * this.speed * 1.1;
    } else if (distance > idealMax) {
      this.moveTowards(player.x, player.y, this.speed);
    } // se dentro do anel ideal, não fazer nada agressivo (mantém posição)
  }
  
  sniperBehavior(player) {
    let distance = dist(this.x, this.y, player.x, player.y);
    
    if (distance < 80) {
      // Retreat when player gets too close
      let angle = atan2(this.y - player.y, this.x - player.x);
      this.x += cos(angle) * this.speed * 1.5;
      this.y += sin(angle) * this.speed * 1.5;
    } else {
      // Precision shooting
      if (distance < this.attackRange && this.shootCooldown <= 0) {
        this.shootAtPlayer(player);
      }
    }
  }
  
  swarmBehavior(player) {
    let distance = dist(this.x, this.y, player.x, player.y);
    
    if (frameCount % 30 === 0) {
      this.x += random(-20, 20);
      this.y += random(-20, 20);
    }
    
    // Chase player
    this.moveTowards(player.x, player.y, this.speed);
  }
  
  findCover(player) {
    // Simple cover finding - move away from player
    let angle = atan2(this.y - player.y, this.x - player.x);
    this.coverPosition = {
      x: this.x + cos(angle) * 100,
      y: this.y + sin(angle) * 100
    };
  }
  
  attemptMultiply() {
    // Read config with safe defaults
    const mcfg = (CONFIG && CONFIG.ENEMY && CONFIG.ENEMY.MULTIPLYING) ? CONFIG.ENEMY.MULTIPLYING : {};
    const MAX_SPAWNS_PER_ENEMY = (typeof mcfg.MAX_SPAWNS_PER_ENEMY === 'number') ? mcfg.MAX_SPAWNS_PER_ENEMY : 2;
    const MAX_GENERATION = (typeof mcfg.MAX_GENERATION === 'number') ? mcfg.MAX_GENERATION : 2;
    const GLOBAL_CAP = (typeof mcfg.GLOBAL_CAP === 'number') ? mcfg.GLOBAL_CAP : 20;
    const CHANCE = (typeof mcfg.CHANCE === 'number') ? mcfg.CHANCE : 0.3;
    const COOLDOWN = (typeof mcfg.COOLDOWN === 'number') ? mcfg.COOLDOWN : 300;

    // Global cap of existing MULTIPLYING enemies
    const currentGlobal = (typeof enemies !== 'undefined' && enemies.length)
      ? enemies.reduce((acc, e) => acc + ((e && e.type === 'MULTIPLYING') ? 1 : 0), 0)
      : 0;

    // Check all constraints
    if (this.spawnedChildren >= MAX_SPAWNS_PER_ENEMY) return;
    if (this.generation >= MAX_GENERATION) return;
    if (currentGlobal >= GLOBAL_CAP) return;
    if (random() >= CHANCE) return;

    // Perform spawn
    let angle = random(TWO_PI);
    let distance = 30;
    let newX = this.x + cos(angle) * distance;
    let newY = this.y + sin(angle) * distance;
    
    // Ensure within bounds
    newX = constrain(newX, 50, CONFIG.MAP.WIDTH - 50);
    newY = constrain(newY, 50, CONFIG.MAP.HEIGHT - 50);
    
    const child = new EnhancedEnemy(newX, newY, 'MULTIPLYING');
    child.generation = (this.generation || 0) + 1;
    child.spawnedChildren = 0;
    enemies.push(child);
    
    this.spawnedChildren++;
    this.multiplyCooldown = COOLDOWN;
  }
  
  explode() {
    // Create explosion effect
    for (let i = 0; i < 20; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 8);
      particles.push(new Particle(
        this.x, this.y,
        cos(angle) * speed, sin(angle) * speed,
        [255, 100, 0], 30
      ));
    }
    
    // Damage nearby entities
    for (let enemy of enemies) {
      if (enemy !== this && dist(this.x, this.y, enemy.x, enemy.y) < this.explosionRadius) {
        enemy.health -= this.explosionDamage;
      }
    }
    
    // Damage player if close
    if (dist(this.x, this.y, player.x, player.y) < this.explosionRadius) {
      // Respeitar invulnerabilidade e i-frames do dash
      if (!player.invulnerable && !player.isInvincible()) {
        // Perfect dodge: se o jogador deu dash até 200ms antes, não toma dano
        if (typeof player.lastDash === 'number' && (millis() - player.lastDash) < 200) {
          return; // Sem dano: esquiva perfeita
        }
        // Aplicar knockback leve
        const ang = atan2(player.y - this.y, player.x - this.x);
        player.x += cos(ang) * 15;
        player.y += sin(ang) * 15;
        
        // Dano limitado em corações (evita hit-kill)
        const dmg = Math.max(1, Math.min(2, this.explosionDamage));
        player.health = Math.max(0, player.health - dmg);
        
        // Ativar i-frames padrão do jogador
        player.invulnerable = true;
        setTimeout(() => {
          if (player) player.invulnerable = false;
        }, CONFIG.PLAYER.INVINCIBILITY_TIME);
      }
    }
  }
  
  createTeleportEffect() {
    for (let i = 0; i < 10; i++) {
      let angle = random(TWO_PI);
      let speed = random(1, 4);
      particles.push(new Particle(
        this.x, this.y,
        cos(angle) * speed, sin(angle) * speed,
        [0, 200, 200], 20
      ));
    }
  }
  
  moveTowards(targetX, targetY, speed) {
    let angle = atan2(targetY - this.y, targetX - this.x);
    this.x += cos(angle) * speed;
    this.y += sin(angle) * speed;
    
    // Constrain to map bounds
    this.x = constrain(this.x, this.size / 2, CONFIG.MAP.WIDTH - this.size / 2);
    this.y = constrain(this.y, this.size / 2, CONFIG.MAP.HEIGHT - this.size / 2);
  }
  
  shootAtPlayer(player) {
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
      return;
    }
    
    // Create projectile towards player
    let angle = atan2(player.y - this.y, player.x - this.x);
    let projectileSpeed = 4;
    
    // Use object pool if available, otherwise create new projectile
    if (typeof projectilePool !== 'undefined' && projectilePool) {
      let projectile = projectilePool.acquire();
      if (projectile) {
        projectile.x = this.x;
        projectile.y = this.y;
        projectile.vx = cos(angle) * projectileSpeed;
        projectile.vy = sin(angle) * projectileSpeed;
        projectile.damage = this.damage;
        projectile.owner = 'enemy';
        projectile.remove = false;
        projectile.life = 120; // 2 seconds at 60fps
      }
    } else {
      // Fallback to adding to enemyProjectiles array
      if (typeof enemyProjectiles !== 'undefined') {
        enemyProjectiles.push({
          x: this.x,
          y: this.y,
          vx: cos(angle) * projectileSpeed,
          vy: sin(angle) * projectileSpeed,
          damage: this.damage,
          size: 4,
          color: [255, 255, 0],
          life: 120,
          remove: false,
          update: function() {
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
            if (this.life <= 0 || this.x < 0 || this.x > CONFIG.MAP.WIDTH || 
                this.y < 0 || this.y > CONFIG.MAP.HEIGHT) {
              this.remove = true;
            }
          },
          draw: function() {
            fill(...this.color);
            noStroke();
            ellipse(this.x, this.y, this.size);
          }
        });
      }
    }
    
    // Reset cooldown
    this.shootCooldown = this.type === 'SNIPER' ? 90 : 60;
  }
  
  handleSpecialAbilities(player) {
    // Handle cooldowns
    if (this.lastTeleport > 0) {
      this.lastTeleport--;
    }
    
    // Type-specific special abilities
    switch(this.type) {
      case 'TELEPORTER':
        if (this.lastTeleport <= 0 && dist(this.x, this.y, player.x, player.y) > 100) {
          this.teleportToPlayer(player);
        }
        break;
        
      case 'EXPLOSIVE':
        if (dist(this.x, this.y, player.x, player.y) < 30) {
          this.explode();
          this.health = 0; // Self-destruct
        }
        break;
        
      case 'SHIELDED':
        // Shield regeneration handled in behavior
        break;
        
      case 'MULTIPLYING':
        if (this.canMultiply && this.multiplyCooldown <= 0 && random() < 0.01) {
          this.attemptMultiply();
        }
        break;
        
      case 'RANGED':
        // Shooting handled in behavior
        break;
        
      case 'SNIPER':
        // Precision shooting and retreat behavior
        if (dist(this.x, this.y, player.x, player.y) < 80) {
          // Retreat when player gets too close
          let angle = atan2(this.y - player.y, this.x - player.x);
          this.x += cos(angle) * this.speed * 1.5;
          this.y += sin(angle) * this.speed * 1.5;
        }
        break;
        
      case 'TANK':
        // Damage reduction is passive
        break;
        
      case 'SWARM':
        // Erratic movement pattern
        if (frameCount % 30 === 0) {
          this.x += random(-20, 20);
          this.y += random(-20, 20);
        }
        break;
    }
  }
  
  teleportToPlayer(player) {
    // Create teleport effect at current position
    this.createTeleportEffect();
    
    // Teleport para um anel mais distante do player
    let angle = random(TWO_PI);
    let distance = random(120, 180);
    this.x = player.x + cos(angle) * distance;
    this.y = player.y + sin(angle) * distance;
    
    // Constrain to map bounds
    this.x = constrain(this.x, this.size, CONFIG.MAP.WIDTH - this.size);
    this.y = constrain(this.y, this.size, CONFIG.MAP.HEIGHT - this.size);
    
    // Create teleport effect at new position
    this.createTeleportEffect();
    
    // Set cooldowns
    this.lastTeleport = this.teleportCooldown;
    this.reengageCooldown = 45; // curto tempo sem avançar
  }
  
  checkAlertStatus(player) {
    // Check if player is within alert radius
    if (dist(this.x, this.y, player.x, player.y) < this.alertRadius) {
      this.isAlerted = true;
    } else {
      this.isAlerted = false;
    }
  }
  
  draw() {
    push();
    
    // Draw shield if active
    if (this.shieldHealth > 0) {
      stroke(100, 100, 255);
      strokeWeight(2);
      noFill();
      ellipse(this.x, this.y, this.size + 10);
      
      // Shield health indicator
      let shieldRatio = this.shieldHealth / this.maxShield;
      stroke(100, 100, 255, 150);
      arc(this.x, this.y, this.size + 10, this.size + 10, 0, TWO_PI * shieldRatio);
    }
    
    // Draw enemy
    fill(...this.color);
    if (this.isAlerted) {
      fill(255, 0, 0); // Alerted state
    }
    ellipse(this.x, this.y, this.size);
    
    // Barra de vida
    this.drawHealthBar();
    
    // Draw type indicator
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(8);
    text(this.type.charAt(0), this.x, this.y);
    
    pop();
  }
  
  drawHealthBar() {
    // Draw health bar
    let healthRatio = this.health / this.maxHealth;
    let barWidth = 20;
    let barHeight = 5;
    let barX = this.x - barWidth / 2;
    let barY = this.y + this.size / 2 + 5;
    
    // Background
    fill(100);
    noStroke();
    rect(barX, barY, barWidth, barHeight);
    
    // Health
    fill(255, 0, 0);
    rect(barX, barY, barWidth * healthRatio, barHeight);
  }
}

// Patrol Group System
class PatrolGroup {
  constructor(centerX, centerY, memberCount) {
    this.members = [];
    this.centerX = centerX;
    this.centerY = centerY;
    this.patrolRadius = 100;
    this.patrolSpeed = 0.5;
    this.alertLevel = 0;
    this.alertDecay = 0.5;
    
    // Create patrol formation
    for (let i = 0; i < memberCount; i++) {
      let angle = (TWO_PI / memberCount) * i;
      let x = centerX + cos(angle) * this.patrolRadius;
      let y = centerY + sin(angle) * this.patrolRadius;
      
      let enemy = new EnhancedEnemy(x, y, 'NORMAL');
      enemy.patrolGroup = this;
      enemy.patrolIndex = i;
      this.members.push(enemy);
    }
  }
  
  update(player) {
    // Update patrol movement
    this.centerX += cos(frameCount * 0.01) * this.patrolSpeed;
    this.centerY += sin(frameCount * 0.01) * this.patrolSpeed;
    
    // Check for player detection
    let playerDetected = false;
    for (let member of this.members) {
      if (dist(member.x, member.y, player.x, player.y) < member.alertRadius) {
        playerDetected = true;
        break;
      }
    }
    
    if (playerDetected) {
      this.alertLevel = min(this.alertLevel + 2, 100);
      
      // Alert all members
      for (let member of this.members) {
        member.isAlerted = true;
      }
    } else {
      this.alertLevel = max(this.alertLevel - this.alertDecay, 0);
      
      if (this.alertLevel <= 0) {
        for (let member of this.members) {
          member.isAlerted = false;
        }
      }
    }
    
    // Update member positions
    for (let i = 0; i < this.members.length; i++) {
      let member = this.members[i];
      let angle = (TWO_PI / this.members.length) * i + frameCount * 0.01;
      
      if (!member.isAlerted) {
        // Patrol formation
        let targetX = this.centerX + cos(angle) * this.patrolRadius;
        let targetY = this.centerY + sin(angle) * this.patrolRadius;
        member.moveTowards(targetX, targetY, member.speed * 0.5);
      }
    }
  }
}
