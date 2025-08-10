class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(2, 5);
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.life = 60;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw() {
    noStroke();
    fill(255, 150, 0, map(this.life, 0, 60, 0, 255));
    ellipse(this.x, this.y, this.size);
  }
}
