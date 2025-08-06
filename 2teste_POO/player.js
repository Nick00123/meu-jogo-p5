class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 32;
    this.speed = 3;
    this.hp = 100;
    this.maxHp = 100;
  }

  update() {
    if (this.hp <= 0) return;

    let nextX = this.x;
    let nextY = this.y;

    if (keyIsDown(LEFT_ARROW)) nextX -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) nextX += this.speed;
    if (keyIsDown(UP_ARROW)) nextY -= this.speed;
    if (keyIsDown(DOWN_ARROW)) nextY += this.speed;

    if (!isColliding(nextX, this.y, this.size)) this.x = nextX;
    if (!isColliding(this.x, nextY, this.size)) this.y = nextY;
  }

  draw() {
    fill(0, 0, 255);
    rect(this.x - camX, this.y - camY, this.size, this.size);
  }

  drawHUD() {
    fill(255, 0, 0);
    rect(20, 20, 200, 20);
    fill(0, 255, 0);
    let healthBar = map(this.hp, 0, this.maxHp, 0, 200);
    rect(20, 20, healthBar, 20);

    noStroke();
    fill(0);
    textSize(12);
    textAlign(LEFT, CENTER);
    text("Vida: " + this.hp, 230, 30);

    let aliveEnemies = enemies.filter(e => e.alive).length;
    fill(0);
    textSize(14);
    text("Inimigos restantes: " + aliveEnemies, 20, 50);
  }
}
