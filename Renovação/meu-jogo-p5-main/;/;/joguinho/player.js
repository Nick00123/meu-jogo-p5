class Player {
    constructor(x, y, size, speed, health) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
        this.bullets = [];
    }

    display() {
        push();
        fill(0, 150, 255);
        noStroke();
        ellipse(this.x, this.y, this.size, this.size);
        pop();
    }

    update() {
        // Movimento
        if (keyIsDown(65)) { // A
            this.x -= this.speed;
        }
        if (keyIsDown(68)) { // D
            this.x += this.speed;
        }
        if (keyIsDown(87)) { // W
            this.y -= this.speed;
        }
        if (keyIsDown(83)) { // S
            this.y += this.speed;
        }

        // Atirar (exemplo simples com a tecla ESPAÇO)
        if (keyIsDown(32)) {
            // Lógica de tiro do jogador pode ser adicionada aqui
        }
    }

    displayBullets() {
        // Lógica para desenhar as balas do jogador
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            gameOver = true; // Assumindo que 'gameOver' é uma variável global
        }
        updatePlayerHealthHUD(this.health, this.maxHealth);
    }
}