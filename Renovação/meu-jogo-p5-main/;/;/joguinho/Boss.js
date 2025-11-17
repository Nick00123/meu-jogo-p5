class Boss {
    constructor(x, y, size, health, speed) {
        this.x = x;
        this.y = y;
        this.tamanho = size; // 80 - Renomeado de 'size' para 'tamanho' para consistência
        this.health = health; // 500
        this.maxHealth = health;
        this.speed = speed; // 1
        this.attackPhase = 1; // 1: 100-75% HP, 2: 75-50%, 3: 50-25%, 4: <25%
        this.attackPattern = 0;
        this.lastAttackTime = 0;
        this.baseAttackDelay = 1800; // Tempo base entre ataques (mais lento que antes para dar espaço aos padrões)

        this.targetX = jogador.x;
        this.targetY = jogador.y;
    }

    display() {
        push();
        translate(this.x, this.y);
        noStroke();
        fill(255, 215, 0); 
        rectMode(CENTER);
        rect(0, 0, this.tamanho * 0.7, this.tamanho * 0.7, 10); 

        
        fill(139, 69, 19); 
        ellipse(0, this.tamanho * 0.4, this.tamanho, this.tamanho * 1.2);

        // Arma 1 (PKP - Alto Espalhamento)
        fill(100); 
        rect(-this.tamanho * 0.5, this.tamanho * 0.2, 40, 10);
        // Arma 2 (Splitter Cannon)
        rect(this.tamanho * 0.5, this.tamanho * 0.2, 30, 8);

        pop();
    }

    update() {
        this.updatePhase();
        this.move();
        this.handleAttacks();
    }

    updatePhase() {
        let healthPercentage = (this.health / this.maxHealth) * 100;
        if (healthPercentage <= 25) {
            this.attackPhase = 4; // FASE 4: Mais rápido, TNT + PKP + Splitter juntos
            this.speed = 2.5;
            this.baseAttackDelay = 600;
        } else if (healthPercentage <= 50) {
            this.attackPhase = 3; // FASE 3: Introduz Splitter Cannon
            this.speed = 1.8;
            this.baseAttackDelay = 1000;
        } else if (healthPercentage <= 75) {
            this.attackPhase = 2; // FASE 2: Introduz TNT (lento, explosivo)
            this.speed = 1.2;
            this.baseAttackDelay = 1500;
        } else {
            this.attackPhase = 1; // FASE 1: Apenas PKP (o tiro de espalhamento)
            this.speed = 0.8;
            this.baseAttackDelay = 1800;
        }
        // A função updateBossHealthHUD não existe, mas podemos criar uma no HUD.js
        // Por enquanto, vamos comentar para evitar erros.
        // updateBossHealthHUD(this.health, this.maxHealth);
    }

    move() {
        // Boss se move lentamente em direção ao jogador
        let angle = atan2(jogador.y - this.y, jogador.x - this.x);
        this.x += cos(angle) * this.speed * 0.5;
        this.y += sin(angle) * this.speed * 0.5;

        // Limita o boss
        this.x = constrain(this.x, this.tamanho / 2, CONFIG.MAPA.LARGURA - this.tamanho / 2);
        this.y = constrain(this.y, this.tamanho / 2, CONFIG.MAPA.ALTURA - this.tamanho / 2);
    }

    handleAttacks() {
        if (millis() - this.lastAttackTime > this.baseAttackDelay) {
            this.attackPattern = (this.attackPattern + 1) % this.attackPhase;

            switch (this.attackPhase) {
                case 1: // Fase 1: PKP (espalhamento)
                    this.shootPKP(12, 6);
                    break;
                case 2: // Fase 2: PKP e TNT
                    if (this.attackPattern === 0) {
                        this.shootPKP(15, 7);
                    } else if (this.attackPattern === 1) {
                        this.throwTNT(3);
                    }
                    break;
                case 3: // Fase 3: PKP, TNT, e Splitter Cannon (Tiros rápidos)
                    if (this.attackPattern === 0) {
                        this.shootPKP(18, 8);
                    } else if (this.attackPattern === 1) {
                        this.throwTNT(4);
                    } else if (this.attackPattern === 2) {
                        this.shootSplitterCannon(3, 12);
                    }
                    break;
                case 4: // Fase 4: Combina ataques
                    if (this.attackPattern === 0) {
                        this.shootPKP(25, 9); // Mais balas
                    } else if (this.attackPattern === 1) {
                        this.throwTNT(5); // Mais TNT
                    } else if (this.attackPattern === 2) {
                        this.shootSplitterCannon(5, 15); // Mais rápido e mais tiros
                    } else if (this.attackPattern === 3) {
                         // Combinação final: PKP e TNT ao mesmo tempo
                        this.shootPKP(10, 8);
                        this.throwTNT(2);
                    }
                    break;
            }
            this.lastAttackTime = millis();
        }
    }

    // Ataque 1: PKP - Balas de alto espalhamento (como uma shotgun)
    shootPKP(numBullets, bulletSpeed) {
        let baseAngle = atan2(jogador.y - this.y, jogador.x - this.x);
        let spread = PI / 3; // 60 graus de espalhamento
        for (let i = 0; i < numBullets; i++) {
            let angleOffset = map(i, 0, numBullets - 1, -spread / 2, spread / 2);
            let angle = baseAngle + angleOffset;
            
            let p = poolProjeteis.obter();
            p.x = this.x;
            p.y = this.y;
            p.vx = cos(angle) * bulletSpeed;
            p.vy = sin(angle) * bulletSpeed;
            p.dano = 0.5;
            p.tamanho = 10;
            p.cor = [255, 100, 100];
            p.ehProjetilInimigo = true;
        }
    }

    // Ataque 2: TNT - Projéteis lentos que explodem
    throwTNT(numTNTs) {
        for (let i = 0; i < numTNTs; i++) {
            let targetX = jogador.x + random(-100, 100);
            let targetY = jogador.y + random(-100, 100);
            let angle = atan2(targetY - this.y, targetX - this.x);

            let p = poolProjeteis.obter();
            p.x = this.x;
            p.y = this.y;
            p.vx = cos(angle) * 3;
            p.vy = sin(angle) * 3;
            p.dano = 0.5; // Dano da explosão
            p.tamanho = 25;
            p.cor = [255, 165, 0];
            p.ehProjetilInimigo = true;
            // Adicionar lógica de TNT/explosão ao projétil base se necessário
        }
    }

    // Ataque 3: Splitter Cannon - Rajada de tiros rápidos
    shootSplitterCannon(numShots, speed) {
        let baseAngle = atan2(jogador.y - this.y, jogador.x - this.x);
        let spread = PI / 16; // Leve espalhamento
        for (let i = 0; i < numShots; i++) {
            let angleOffset = random(-spread / 2, spread / 2);
            let angle = baseAngle + angleOffset;

            let p = poolProjeteis.obter();
            p.x = this.x;
            p.y = this.y;
            p.vx = cos(angle) * speed;
            p.vy = sin(angle) * speed;
            p.dano = 0.5;
            p.tamanho = 8;
            p.cor = [100, 255, 100];
            p.ehProjetilInimigo = true;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            // A lógica de vitória/próximo nível deve ser tratada no loop principal
        }
    }

    // Método para compatibilidade com o sistema de colisão
    receberDano(amount) {
        this.takeDamage(amount);
        return this.health <= 0; // Retorna true se o chefe foi derrotado
    }
}