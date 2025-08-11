class Projectile {
  constructor(x, y, vx, vy, isEnemyProjectile = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isEnemyProjectile = isEnemyProjectile;
    this.size = isEnemyProjectile ? CONFIG.PROJECTILE.ENEMY.SIZE : CONFIG.PROJECTILE.PLAYER.SIZE;
    this.color = isEnemyProjectile ? CONFIG.PROJECTILE.ENEMY.COLOR : CONFIG.PROJECTILE.PLAYER.COLOR;
    this.damage = 1;
    this.isLaser = false;
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
    noStroke();
    
    if (this.isLaser) {
      // Efeito especial para laser
      fill(this.color[0], this.color[1], this.color[2], 200);
      ellipse(this.x, this.y, this.size + 2);
      fill(this.color[0], this.color[1], this.color[2], 255);
      ellipse(this.x, this.y, this.size);
      
      // Efeito de brilho
      fill(255, 255, 255, 100);
      ellipse(this.x, this.y, this.size / 2);
    } else {
      // Projétil normal
      fill(this.color[0], this.color[1], this.color[2]);
      ellipse(this.x, this.y, this.size);
    }
  }
}