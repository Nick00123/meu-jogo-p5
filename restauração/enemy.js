// Exemplo para Enemy
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = CONFIG.ENEMY.NORMAL.SIZE;
    this.health = CONFIG.ENEMY.NORMAL.HEALTH;
    this.maxHealth = CONFIG.ENEMY.NORMAL.HEALTH;
    this.speed = CONFIG.ENEMY.NORMAL.SPEED;
  }
  
  update(player) {
    // Safety check - ensure player exists
    if (!player) return;
    
    // Movimento simples em direção ao player
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      this.x += (dx / mag) * this.speed;
      this.y += (dy / mag) * this.speed;
    }
  }
  
  shoot() {
    // Base enemies don't shoot
  }
  
  draw() {
    fill(...CONFIG.ENEMY.NORMAL.COLOR);
    ellipse(this.x, this.y, this.size);
    fill(...CONFIG.ENEMY.HEALTH_BAR.COLOR);
    rect(
      this.x - this.size / 2, 
      this.y - this.size / 2 - CONFIG.ENEMY.HEALTH_BAR.Y_OFFSET, 
      this.size * (this.health / this.maxHealth), 
      CONFIG.ENEMY.HEALTH_BAR.HEIGHT, 
      2
    );
  }
}