class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 32;
    this.speed = 1.5;
    this.hp = 30;
    this.alive = true;

    this.dirX = random([-1, 1]);
    this.dirY = random([-1, 1]);
  }

  update() {
    if (!this.alive) return;

    let nextX = this.x + this.dirX * this.speed;
    let nextY = this.y + this.dirY * this.speed;

    if (!isColliding(nextX, this.y, this.size)) {
      this.x = nextX;
    } else {
      this.dirX *= -1;
    }

    if (!isColliding(this.x, nextY, this.size)) {
      this.y = nextY;
    } else {
      this.dirY *= -1;
    }
  }

  draw() {
    if (!this.alive) return;

    fill(255, 0, 0);
    rect(this.x - camX, this.y - camY, this.size, this.size);
  }

  checkPlayerCollision(player) {
    if (!this.alive) return false;

    let collidesX = player.x < this.x + this.size && player.x + player.size > this.x;
    let collidesY = player.y < this.y + this.size && player.y + player.size > this.y;

    return collidesX && collidesY;
  }
}
