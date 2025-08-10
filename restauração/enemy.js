// Exemplo para Enemy
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.health = 3;
    this.maxHealth = 3; // Adicionado
    this.speed = 2;
  }
  update(player) {
    // Movimento simples em direção ao player
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      this.x += (dx / mag) * this.speed;
      this.y += (dy / mag) * this.speed;
    }
  }
  draw() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.size);
    fill(0, 200, 0);
    rect(this.x - this.size / 2, this.y - this.size / 2 - 10, this.size * (this.health / this.maxHealth), 5, 2);
  }
}