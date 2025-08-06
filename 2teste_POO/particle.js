class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(4, 8);
    this.lifespan = 60;
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.lifespan--;
  }

  draw() {
    noStroke();
    fill(255, 150, 0, map(this.lifespan, 0, 60, 0, 255));
    ellipse(this.x - camX, this.y - camY, this.size);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
