class Bullet {
    constructor(x, y, angle, speed, size, type, bulletColor) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.size = size;
        this.type = type; // "player", "boss", ou "tnt"
        this.color = bulletColor || [255, 255, 255];
        this.damage = 5; // Dano padrão para o jogador

        if (this.type === 'boss') {
            this.damage = 10; // Dano específico para as balas do chefe
        }

        this.isExploded = false;
        this.explosionRadius = this.size * 2;
        this.explosionTimer = 60; // 1 segundo (60 frames)
    }

    display() {
        push();
        translate(this.x, this.y);

        if (this.isExploded) {
            // Desenha a explosão
            noStroke();
            fill(255, 100, 0, 150);
            ellipse(0, 0, this.explosionRadius * 2);
        } else {
            // Desenha a bala/projétil
            noStroke();
            fill(this.color);

            if (this.type === "tnt") {
                // Simula um barril/caixa de TNT
                rectMode(CENTER);
                rect(0, 0, this.size * 0.8, this.size);
                fill(0);
                rect(0, -this.size * 0.4, this.size * 0.1, 5); // Pavio
            } else {
                // Balas normais
                rotate(this.angle);
                rectMode(CENTER);
                rect(0, 0, this.size, this.size / 2);
            }
        }
        pop();
    }

    update() {
        if (this.isExploded) {
            this.explosionTimer--;
            return;
        }

        // Movimento
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;

        // Lógica de explosão do TNT (após um tempo ou ao bater na parede)
        if (this.type === "tnt" && (frameCount % 180 === 0 || this.isOffscreen())) { // Explode após 3 segundos ou fora da tela
            this.explode();
        }
    }

    explode() {
        this.isExploded = true;
        this.speed = 0;
        // Verifica dano ao jogador na explosão
        let d = dist(this.x, this.y, jogador.x, jogador.y);
        if (d < this.explosionRadius + jogador.tamanho / 2) {
            jogador.receberDano(15); // Dano alto por explosão
        }
    }

    isOffscreen() {
        // Balas normais são removidas ao sair da tela
        if (this.type !== "tnt") {
            return (this.x < 0 || this.x > CONFIG.MAPA.LARGURA || this.y < 0 || this.y > CONFIG.MAPA.ALTURA);
        }
        // TNT tem um tempo de vida após a explosão
        return this.isExploded && this.explosionTimer <= 0;
    }
}