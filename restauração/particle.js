class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(CONFIG.PARTICLE.MIN_SIZE, CONFIG.PARTICLE.MAX_SIZE);
    this.vx = random(CONFIG.PARTICLE.MIN_VELOCITY, CONFIG.PARTICLE.MAX_VELOCITY);
    this.vy = random(CONFIG.PARTICLE.MIN_VELOCITY, CONFIG.PARTICLE.MAX_VELOCITY);
    this.life = CONFIG.PARTICLE.LIFETIME;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw() {
    noStroke();
    fill(...CONFIG.PARTICLE.COLOR, map(this.life, 0, CONFIG.PARTICLE.LIFETIME, 0, 255));
    ellipse(this.x, this.y, this.size);
  }
}
