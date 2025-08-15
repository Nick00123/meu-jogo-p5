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

// ===========================================
// FUNÇÕES DE CRIAÇÃO E RESET DOS POOLS
// ===========================================

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
