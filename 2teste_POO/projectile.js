class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.speed = 5;
    this.active = true;

    let target = this.findClosestEnemy();
    if (target) {
      let dx = target.x - this.x;
      let dy = target.y - this.y;
      let angle = atan2(dy, dx);
      this.vx = cos(angle);
      this.vy = sin(angle);
    } else {
      this.vx = 0;
      this.vy = -1;
    }
  }

  findClosestEnemy() {
    let closest = null;
    let closestDist = Infinity;
    for (let e of enemies) {
      if (!e.alive) continue;
      let d = dist(this.x, this.y, e.x, e.y);
      if (d < closestDist) {
        closest = e;
        closestDist = d;
      }
    }
    return closest;
  }

  update() {
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;

    for (let e of enemies) {
      if (!e.alive) continue;
      let d = dist(this.x, this.y, e.x + e.size / 2, e.y + e.size / 2);
      if (d < e.size / 2) {
        e.hp -= 30;
        if (e.hp <= 0) {
          e.alive = false;
          for (let i = 0; i < 15; i++) {
            particles.push(new Particle(e.x + e.size / 2, e.y + e.size / 2));
          }
        }
        this.active = false;
        return;
      }
    }

    if (this.x < 0 || this.y < 0 || this.x > 2000 || this.y > 2000) {
      this.active = false;
    }
  }

  draw() {
    fill(0, 255, 255);
    ellipse(this.x - camX, this.y - camY, this.size);
  }
}
