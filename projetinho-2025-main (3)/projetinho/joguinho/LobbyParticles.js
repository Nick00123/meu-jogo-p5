class LobbyParticles {
  constructor() {
    this.particles = [];
  }

  addParticle(x, y, options = {}) {
    const particle = {
      x: x,
      y: y,
      size: options.size || random(2, 6),
      speed: options.speed || random(0.5, 2),
      color: options.color || [255, 255, 255],
      alpha: options.alpha || random(100, 200),
      life: options.life || random(60, 180),
      angle: options.angle || random(TWO_PI),
      type: options.type || 'float', // 'float', 'fountain', 'explosion'
      vx: options.vx || 0,
      vy: options.vy || 0,
      gravity: options.gravity || 0,
      friction: options.friction || 0.98,
      maxLife: options.life || random(60, 180)
    };

    // Configurações específicas por tipo
    if (particle.type === 'float') {
      particle.vx = cos(particle.angle) * particle.speed;
      particle.vy = sin(particle.angle) * particle.speed;
    } else if (particle.type === 'fountain') {
      particle.vx = random(-1, 1) * particle.speed;
      particle.vy = random(-3, -1) * particle.speed;
      particle.gravity = 0.1;
    } else if (particle.type === 'explosion') {
      particle.vx = cos(particle.angle) * random(1, 5);
      particle.vy = sin(particle.angle) * random(1, 5);
      particle.gravity = 0.05;
      particle.friction = 0.95;
    }

    this.particles.push(particle);
    return particle;
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Atualizar física
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      
      // Atualizar vida
      p.life--;
      p.alpha = map(p.life, p.maxLife, 0, 255, 0);
      
      // Remover partículas mortas
      if (p.life <= 0 || p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    for (const p of this.particles) {
      push();
      noStroke();
      fill(p.color[0], p.color[1], p.color[2], p.alpha);
      
      if (p.type === 'sparkle') {
        // Efeito de brilho para partículas especiais
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.alpha/255})`;
      }
      
      ellipse(p.x, p.y, p.size, p.size);
      
      if (p.type === 'sparkle') {
        drawingContext.shadowBlur = 0;
      }
      
      pop();
    }
  }

  // Métodos auxiliares
  createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      this.addParticle(x, y, {
        type: 'explosion',
        color: color || [255, 200, 100],
        life: random(30, 90),
        size: random(3, 8)
      });
    }
  }

  createFountain(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.addParticle(x, y, {
        type: 'fountain',
        color: color || [255, 255, 255],
        life: random(60, 120),
        size: random(2, 5)
      });
    }
  }

  clear() {
    this.particles = [];
  }
}
