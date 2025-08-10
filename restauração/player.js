class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 3;
    this.projectiles = [];
    this.health = 5;
    this.lastShot = 0;
    this.shootCooldown = 300; // ms
  }

  update() {
    if (keyIsDown(87)) this.y -= this.speed; // W
    if (keyIsDown(83)) this.y += this.speed; // S
    if (keyIsDown(65)) this.x -= this.speed; // A
    if (keyIsDown(68)) this.x += this.speed; // D

    // Limitar o movimento do player ao tamanho do mapa (todas as bordas)
    this.x = constrain(this.x, this.size / 2, gameMap.width - this.size / 2);
    this.y = constrain(this.y, this.size / 2, gameMap.height - this.size / 2);

    for (let p of this.projectiles) p.update();
    this.projectiles = this.projectiles.filter(p => !p.remove);
  }

  draw() {
    fill(0, 200, 255);
    ellipse(this.x, this.y, this.size);

    for (let p of this.projectiles) p.draw();
  }

  shoot() {
    if (millis() - this.lastShot > this.shootCooldown) {
      // Se não houver inimigos, não atira
      if (!enemies || enemies.length === 0) return;

      // Encontra o inimigo mais próximo
      let closest = null;
      let minDist = Infinity;
      for (let e of enemies) {
        let d = dist(this.x, this.y, e.x, e.y);
        if (d < minDist) {
          minDist = d;
          closest = e;
        }
      }

      // Calcula direção para o inimigo mais próximo
      let dx = closest.x - this.x;
      let dy = closest.y - this.y;
      let mag = sqrt(dx * dx + dy * dy);
      let speed = 8;
      let vx = (dx / mag) * speed;
      let vy = (dy / mag) * speed;

      this.projectiles.push(new Projectile(this.x, this.y, vx, vy));
      this.lastShot = millis();
    }
  }
}

// PowerUp
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.type = type; // 'life', 'speed', etc
  }
  draw() {
    if (this.type === 'life') fill(0,255,0);
    else if (this.type === 'speed') fill(255,255,0);
    else fill(255); // cor padrão
    ellipse(this.x, this.y, this.size);
  }
}

// Coin
class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 15;
  }
  draw() {
    fill(255, 215, 0);
    ellipse(this.x, this.y, this.size);
  }
}

// FastEnemy
class FastEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.speed = 4;
    this.size = 20;
  }
}

// BossEnemy
class BossEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.size = 50;
    this.health = 20;
    this.speed = 2;
  }

  update() {
    super.update();
    // Atira projéteis em direção ao jogador
    if (frameCount % 60 === 0) {
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      let mag = sqrt(dx * dx + dy * dy);
      let speed = 5;
      let vx = (dx / mag) * speed;
      let vy = (dy / mag) * speed;

      // Adicione o projétil ao array global enemyProjectiles (definido em sketch.js)
      enemyProjectiles.push(new Projectile(this.x, this.y, vx, vy));
    }
  }
}