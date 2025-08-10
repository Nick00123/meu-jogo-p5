class Projectile {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = 10;
    this.remove = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // Remove se sair do mapa
    if (
      this.x < 0 || this.x > gameMap.width ||
      this.y < 0 || this.y > gameMap.height
    ) {
      this.remove = true;
    }
  }

  draw() {
    fill(255, 255, 0);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}