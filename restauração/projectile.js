class Projectile {
  constructor(x, y, vx, vy, isEnemyProjectile = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isEnemyProjectile = isEnemyProjectile;
    this.size = isEnemyProjectile ? CONFIG.PROJECTILE.ENEMY.SIZE : CONFIG.PROJECTILE.PLAYER.SIZE;
    this.remove = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // Remove se sair do mapa
    if (
      this.x < 0 || this.x > CONFIG.MAP.WIDTH ||
      this.y < 0 || this.y > CONFIG.MAP.HEIGHT
    ) {
      this.remove = true;
    }
  }

  isOffScreen() {
    return this.remove || 
           this.x < 0 || this.x > CONFIG.MAP.WIDTH ||
           this.y < 0 || this.y > CONFIG.MAP.HEIGHT;
  }

  draw() {
    if (this.isEnemyProjectile) {
      fill(...CONFIG.PROJECTILE.ENEMY.COLOR);
    } else {
      fill(...CONFIG.PROJECTILE.PLAYER.COLOR);
    }
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}