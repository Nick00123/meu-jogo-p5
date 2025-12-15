class Boss2 extends Boss {
    constructor(x, y, size, health, speed) {
        super(x, y, size, health, speed);
        this.name = "CRYSTAL GUARDIAN"; // Nome para a HUD
        this.baseAttackDelay = 2000;

        // Propriedades do Laser
        this.laserChargeTime = 0;
        this.laserDuration = 0;
        this.isChargingLaser = false;
        this.isFiringLaser = false;
        this.laserAngle = 0;
        this.laserMaxLength = CONFIG.MAPA.LARGURA * 0.8;
        this.laserDamageCooldown = 0; // Cooldown para o dano do laser

        // Propriedades do novo ataque "Chuva de Gelo"
        this.iceShards = [];
        this.iceRainTimer = 0;
    }

    desenhar() {
        push();
        translate(this.x, this.y);
        noStroke();

        // Corpo principal (cristal)
        fill(180, 220, 255, 220);
        beginShape();
        vertex(0, -this.tamanho * 0.8);
        vertex(this.tamanho * 0.5, -this.tamanho * 0.3);
        vertex(this.tamanho * 0.3, this.tamanho * 0.8);
        vertex(-this.tamanho * 0.3, this.tamanho * 0.8);
        vertex(-this.tamanho * 0.5, -this.tamanho * 0.3);
        endShape(CLOSE);

        // Núcleo brilhante
        fill(255, 255, 255, 200 + sin(millis() * 0.005) * 55);
        ellipse(0, 0, this.tamanho * 0.4);

        // Garante que o laser seja desenhado em todas as suas fases
        if (this.isChargingLaser || this.isFiringLaser) {
            this.desenharLaser();
        }

        // Desenha a chuva de gelo
        for (const shard of this.iceShards) {
            shard.desenhar();
        }

        pop();
    }

    atualizar() {
        // A lógica de `super.update()` foi movida para cá para que possamos
        // usar uma função `updatePhase` específica para este chefe.
        this.atualizarFase();
        super.mover(); // Reutiliza o movimento do Boss1
        this.gerenciarAtaques();

        // Atualiza a lógica do laser
        if (this.isChargingLaser) {
            this.laserChargeTime--;
            // Trava a mira no jogador durante o carregamento
            this.laserAngle = atan2(jogador.y - this.y, jogador.x - this.x);

            if (this.laserChargeTime <= 0) {
                this.isChargingLaser = false;
                this.isFiringLaser = true;
                this.laserDuration = 120; // 2 segundos de disparo
            }
        }

        if (this.isFiringLaser) {
            this.laserDuration--;
            // Garante que o laser seja desenhado e cause dano
            this.dispararLaser();

            if (this.laserDuration <= 0) {
                this.isFiringLaser = false;
            }
        }

        // Atualiza o cooldown do dano do laser
        if (this.laserDamageCooldown > 0) {
            this.laserDamageCooldown--;
        }

        // Lógica da Chuva de Gelo (contínua a partir da fase 2)
        if (this.faseDeAtaque >= 2) {
            this.iceRainTimer--;

            if (this.iceRainTimer <= 0) {
                this.criarFragmentoDeGelo();
                // A frequência aumenta nas fases mais difíceis
                switch (this.faseDeAtaque) {
                    case 2:
                        this.iceRainTimer = 20; // Fase 2: Frequência diminuída
                        break;
                    case 3:
                    case 4: // Na fase 4, a chuva continua intensa junto com os outros ataques
                        this.iceRainTimer = 5; // Fase 3 e 4: Frequência diminuída
                        break;
                }
            }
        }

        // Atualiza os fragmentos de gelo
        for (let i = this.iceShards.length - 1; i >= 0; i--) {
            const shard = this.iceShards[i];
            shard.atualizar();
            if (shard.isDone()) {
                this.iceShards.splice(i, 1);
            }
        }
    }

    // Sobrescreve o updatePhase para o Boss2
    atualizarFase() {
        let healthPercentage = (this.vida / this.vidaMaxima) * 100;
        if (healthPercentage <= 25) {
            this.faseDeAtaque = 4; // FASE 4: Frenético
            this.velocidade = 2.8;
            this.atrasoAtaqueBase = 800;
        } else if (healthPercentage <= 50) {
            this.faseDeAtaque = 3; // FASE 3: Ataques mais rápidos
            this.velocidade = 2.0;
            this.atrasoAtaqueBase = 1200;
        } else if (healthPercentage <= 75) {
            this.faseDeAtaque = 2; // FASE 2: Introduz o Laser
            this.velocidade = 1.5;
            this.atrasoAtaqueBase = 1800;
        } else {
            this.faseDeAtaque = 1; // FASE 1: Apenas Disparo de Fragmentos
            this.velocidade = 1.2;
            this.atrasoAtaqueBase = 2000;
        }
    }

    gerenciarAtaques() {
        if (millis() - this.ultimoAtaque > this.atrasoAtaqueBase && !this.isFiringLaser && !this.isChargingLaser) {
            let numPatterns = 1; // Padrão para a Fase 1

            switch (this.faseDeAtaque) {
                case 1: // Fase 1: Disparo de Fragmentos
                    numPatterns = 1;
                    this.padraoDeAtaque = (this.padraoDeAtaque + 1) % numPatterns;
                    this.atirarFragmentosDeCristal(8, 5);
                    break;
                case 2: // Fase 2: Fragmentos e Laser
                    numPatterns = 2;
                    this.padraoDeAtaque = (this.padraoDeAtaque + 1) % numPatterns;
                    if (this.padraoDeAtaque % 2 === 0) {
                        this.atirarFragmentosDeCristal(12, 6);
                    } else {
                        this.carregarLaser();
                    }
                    break;
                case 3: // Fase 3: Ataques mais rápidos
                    numPatterns = 2;
                    this.padraoDeAtaque = (this.padraoDeAtaque + 1) % numPatterns;
                    if (this.padraoDeAtaque === 0) {
                        this.atirarFragmentosDeCristal(16, 7);
                    } else if (this.padraoDeAtaque === 1) {
                        this.carregarLaser();
                    }
                    break;
                case 4: // Fase 4: Frenético
                    numPatterns = 2;
                    this.padraoDeAtaque = (this.padraoDeAtaque + 1) % numPatterns;
                    if (this.padraoDeAtaque === 0) {
                        this.carregarLaser();
                    } else if (this.padraoDeAtaque === 1) {
                        this.atirarFragmentosDeCristal(20, 8);
                    }
                    break;
            }
            this.ultimoAtaque = millis();
        }
    }

    // Ataque 1: Disparo de Fragmentos de Cristal
    atirarFragmentosDeCristal(numBullets, bulletSpeed) {
        let baseAngle = atan2(jogador.y - this.y, jogador.x - this.x);
        let spread = PI / 4; // 45 graus
        for (let i = 0; i < numBullets; i++) {
            let angleOffset = random(-spread / 2, spread / 2);
            let angle = baseAngle + angleOffset;

            let p = poolProjeteis.obter();
            if (p) {
                p.x = this.x;
                p.y = this.y;
                p.vx = cos(angle) * bulletSpeed;
                p.vy = sin(angle) * bulletSpeed;
                p.dano = 0.5;
                p.tamanho = 12;
                p.cor = [180, 220, 255];
                p.ehProjetilInimigo = true;
                if (poolProjeteis.ativar) poolProjeteis.ativar(p);
            }
        }
    }

    // Ataque 2: Raio Laser
    carregarLaser() {
        this.isChargingLaser = true;
        this.laserChargeTime = 60; // 1 segundo de carga
        this.laserAngle = atan2(jogador.y - this.y, jogador.x - this.x);
    }

    dispararLaser() {
        const laserX2 = this.x + cos(this.laserAngle) * this.laserMaxLength;
        const laserY2 = this.y + sin(this.laserAngle) * this.laserMaxLength;

        // Detecção de colisão do laser com o jogador
        const d = distToSegment(jogador, { x: this.x, y: this.y }, { x: laserX2, y: laserY2 });

        // Aplica dano apenas se o cooldown tiver terminado
        if (d < jogador.tamanho / 2 + 5 && this.laserDamageCooldown <= 0) { // 5 é a metade da espessura do laser
            jogador.receberDano(0.5); // Dano de meio coração a cada intervalo
            this.laserDamageCooldown = 15; // Intervalo de 15 frames (0.25s) entre danos
        }
    }

    desenharLaser() {
        push();
        rotate(this.laserAngle);

        if (this.isChargingLaser) {
            // Linha fina de aviso
            stroke(255, 255, 255, 100);
            strokeWeight(2);
            line(0, 0, this.laserMaxLength, 0);
        } else if (this.isFiringLaser) {
            // Raio principal
            stroke(200, 230, 255, 200);
            strokeWeight(10);
            line(0, 0, this.laserMaxLength, 0);
            // Núcleo do raio
            stroke(255, 255, 255, 255);
            strokeWeight(4);
            line(0, 0, this.laserMaxLength, 0);
        }
        pop();
    }

    // Ataque 3: Chuva de Gelo
    criarFragmentoDeGelo() {
        // Gera um único fragmento de gelo em uma posição aleatória do mapa.
        const x = random(0, CONFIG.MAPA.LARGURA);
        const y = random(0, CONFIG.MAPA.ALTURA);
        this.iceShards.push(new IceShard(x, y));
    }
}

// Classe para o novo ataque "Chuva de Gelo"
class IceShard {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 200; // Tamanho aumentado
        this.warningTime = 60; // 1 segundo de aviso
        this.impactTime = 10;  // Duração do impacto
        this.state = 'warning'; // 'warning', 'impact', 'fading'
        this.damageDealt = false;
    }

    atualizar() {
        // Causa dano se o jogador estiver na área de impacto no momento certo
        if (this.state === 'warning' && this.warningTime <= 1) { // Checa um frame antes do impacto
            if (!this.damageDealt && dist(this.x, this.y, jogador.x, jogador.y) < this.size / 2) {
                // Verifica se o jogador está invencível (ex: durante o dash)
                if (!jogador.invencivel) {
                    jogador.receberDano(1); // 1 coração de dano
                    this.damageDealt = true;
                }
            }
        }

        if (this.state === 'warning') {
            this.warningTime--;
            if (this.warningTime <= 0) {
                this.state = 'impact';
                // Causa dano se o jogador estiver na área de impacto
                if (!this.damageDealt && dist(this.x, this.y, jogador.x, jogador.y) < this.size / 2) {
                    jogador.receberDano(1); // 1 coração de dano
                }
            }
        } else if (this.state === 'impact') {
            this.impactTime--;
            if (this.impactTime <= 0) {
                this.state = 'fading';
            }
        } else if (this.state === 'fading') {
            // O objeto será removido quando isDone() retornar true
        }
    }

    desenhar() {
        push();

        if (this.state === 'warning') {
            const warningProgress = 1 - (this.warningTime / 60);
            const alpha = 150 * (1 - warningProgress);
            const currentSize = this.size * warningProgress;
            // Círculo de aviso
            noFill();
            stroke(255, 0, 0, alpha);
            strokeWeight(3);
            ellipse(this.x, this.y, currentSize);
        } else if (this.state === 'impact') {
            // Efeito de impacto (explosão de gelo)
            noStroke();
            fill(180, 220, 255, 200);
            for (let i = 0; i < 5; i++) {
                const angle = random(TWO_PI);
                const r = random(this.size * 0.5);
                ellipse(this.x + cos(angle) * r, this.y + sin(angle) * r, this.size / 4);
            }
        }
        pop();
    }

    isDone() {
        return this.state === 'fading' || (this.state === 'impact' && this.impactTime <= 0);
    }
}

// Função auxiliar para calcular a distância de um ponto a um segmento de linha
function distToSegment(p, v, w) {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return dist(p.x, p.y, v.x, v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = v.x + t * (w.x - v.x);
    const projY = v.y + t * (w.y - v.y);
    return dist(p.x, p.y, projX, projY);
}