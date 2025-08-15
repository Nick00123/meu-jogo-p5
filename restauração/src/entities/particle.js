class Particle {
  constructor(x, y, color = [255, 150, 0]) {
    this.x = x;
    this.y = y;
    this.size = random(CONFIG.PARTICLE.MIN_SIZE, CONFIG.PARTICLE.MAX_SIZE);
    this.vx = random(CONFIG.PARTICLE.MIN_VELOCITY, CONFIG.PARTICLE.MAX_VELOCITY);
    this.vy = random(CONFIG.PARTICLE.MIN_VELOCITY, CONFIG.PARTICLE.MAX_VELOCITY);
    this.life = CONFIG.PARTICLE.LIFETIME;
    this.color = color;
    this.remove = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    
    // Marcar para remoção quando vida acabar
    if (this.life <= 0) {
      this.remove = true;
    }
  }

  draw() {
    noStroke();
    let alpha = map(this.life, 0, CONFIG.PARTICLE.LIFETIME, 0, 255);
    fill(this.color[0], this.color[1], this.color[2], alpha);
    ellipse(this.x, this.y, this.size);
  }
}
