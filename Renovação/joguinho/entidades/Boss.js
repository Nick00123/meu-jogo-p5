class Boss {
    constructor(x, y, tamanho, vida, velocidade) {
        this.x = x;
        this.y = y;
        this.tamanho = tamanho; // 80
        this.vida = vida; // 500
        this.vidaMaxima = vida;
        this.velocidade = velocidade; // 1
        this.faseDeAtaque = 1; // 1: 100-75% HP, 2: 75-50%, 3: 50-25%, 4: <25%
        this.padraoDeAtaque = 0;
        this.ultimoAtaque = 0;
        this.atrasoAtaqueBase = 1800; // Tempo base entre ataques (mais lento que antes para dar espaço aos padrões)

        this.alvoX = jogador.x;
        this.alvoY = jogador.y;
    }

    desenhar() {
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

    atualizar() {
        this.atualizarFase();
        this.mover();
        this.gerenciarAtaques();
    }

    atualizarFase() {
        let percentualVida = (this.vida / this.vidaMaxima) * 100;
        if (percentualVida <= 25) {
            this.faseDeAtaque = 4; // FASE 4: Mais rápido, TNT + PKP + Splitter juntos
            this.velocidade = 2.5;
            this.atrasoAtaqueBase = 600;
        } else if (percentualVida <= 50) {
            this.faseDeAtaque = 3; // FASE 3: Introduz Splitter Cannon
            this.velocidade = 1.8;
            this.atrasoAtaqueBase = 1000;
        } else if (percentualVida <= 75) {
            this.faseDeAtaque = 2; // FASE 2: Introduz TNT (lento, explosivo)
            this.velocidade = 1.2;
            this.atrasoAtaqueBase = 1500;
        } else {
            this.faseDeAtaque = 1; // FASE 1: Apenas PKP (o tiro de espalhamento)
            this.velocidade = 0.8;
            this.atrasoAtaqueBase = 1800;
        }
        // A função updateBossHealthHUD não existe, mas podemos criar uma no HUD.js
        // Por enquanto, vamos comentar para evitar erros.
        // updateBossHealthHUD(this.vida, this.vidaMaxima);
    }

    mover() {
        // Boss se move lentamente em direção ao jogador
        let angulo = atan2(jogador.y - this.y, jogador.x - this.x);
        this.x += cos(angulo) * this.velocidade * 0.5;
        this.y += sin(angulo) * this.velocidade * 0.5;

        // Limita o boss
        this.x = constrain(this.x, this.tamanho / 2, CONFIG.MAPA.LARGURA - this.tamanho / 2);
        this.y = constrain(this.y, this.tamanho / 2, CONFIG.MAPA.ALTURA - this.tamanho / 2);
    }

    gerenciarAtaques() {
        if (millis() - this.ultimoAtaque > this.atrasoAtaqueBase) {
            this.padraoDeAtaque = (this.padraoDeAtaque + 1) % this.faseDeAtaque;

            switch (this.faseDeAtaque) {
                case 1: // Fase 1: PKP (espalhamento)
                    this.atirarPKP(12, 6);
                    break;
                case 2: // Fase 2: PKP e TNT
                    if (this.padraoDeAtaque === 0) {
                        this.atirarPKP(15, 7);
                    } else if (this.padraoDeAtaque === 1) {
                        this.lancarTNT(3);
                    }
                    break;
                case 3: // Fase 3: PKP, TNT, e Splitter Cannon (Tiros rápidos)
                    if (this.padraoDeAtaque === 0) {
                        this.atirarPKP(18, 8);
                    } else if (this.padraoDeAtaque === 1) {
                        this.lancarTNT(4);
                    } else if (this.padraoDeAtaque === 2) {
                        this.atirarCanhaoDivisor(3, 12);
                    }
                    break;
                case 4: // Fase 4: Combina ataques
                    if (this.padraoDeAtaque === 0) {
                        this.atirarPKP(25, 9); // Mais balas
                    } else if (this.padraoDeAtaque === 1) {
                        this.lancarTNT(5); // Mais TNT
                    } else if (this.padraoDeAtaque === 2) {
                        this.atirarCanhaoDivisor(5, 15); // Mais rápido e mais tiros
                    } else if (this.padraoDeAtaque === 3) {
                         // Combinação final: PKP e TNT ao mesmo tempo
                        this.atirarPKP(10, 8);
                        this.lancarTNT(2);
                    }
                    break;
            }
            this.ultimoAtaque = millis();
        }
    }

    // Ataque 1: PKP - Balas de alto espalhamento (como uma shotgun)
    atirarPKP(numBalas, velocidadeBala) {
        let anguloBase = atan2(jogador.y - this.y, jogador.x - this.x);
        let dispersao = PI / 3; // 60 graus de espalhamento
        for (let i = 0; i < numBalas; i++) {
            let deslocamentoAngulo = map(i, 0, numBalas - 1, -dispersao / 2, dispersao / 2);
            let angulo = anguloBase + deslocamentoAngulo;
            
            let p = poolProjeteis.obter();
            p.x = this.x;
            p.y = this.y;
            p.vx = cos(angulo) * velocidadeBala;
            p.vy = sin(angulo) * velocidadeBala;
            p.dano = 0.5;
            p.tamanho = 10;
            p.cor = [255, 100, 100];
            p.ehProjetilInimigo = true;
            if (poolProjeteis.ativar) poolProjeteis.ativar(p);
        }
    }

    // Ataque 2: TNT - Projéteis lentos que explodem
    lancarTNT(numTNTs) {
        for (let i = 0; i < numTNTs; i++) {
            let alvoX = jogador.x + random(-100, 100);
            let alvoY = jogador.y + random(-100, 100);
            let angulo = atan2(alvoY - this.y, alvoX - this.x);

            let p = poolProjeteis.obter();
            p.x = this.x;
            p.y = this.y;
            p.vx = cos(angulo) * 3;
            p.vy = sin(angulo) * 3;
            p.dano = 0.5; // Dano da explosão
            p.tamanho = 25;
            p.cor = [255, 165, 0];
            p.ehProjetilInimigo = true;
            // Adicionar lógica de TNT/explosão ao projétil base se necessário
            if (poolProjeteis.ativar) poolProjeteis.ativar(p);
        }
    }

    // Ataque 3: Splitter Cannon - Rajada de tiros rápidos
    atirarCanhaoDivisor(numTiros, velocidade) {
        let anguloBase = atan2(jogador.y - this.y, jogador.x - this.x);
        let dispersao = PI / 16; // Leve espalhamento
        for (let i = 0; i < numTiros; i++) {
            let deslocamentoAngulo = random(-dispersao / 2, dispersao / 2);
            let angulo = anguloBase + deslocamentoAngulo;

            let p = poolProjeteis.obter();
            p.x = this.x;
            p.y = this.y;
            p.vx = cos(angulo) * velocidade;
            p.vy = sin(angulo) * velocidade;
            p.dano = 0.5;
            p.tamanho = 8;
            p.cor = [100, 255, 100];
            p.ehProjetilInimigo = true;
            if (poolProjeteis.ativar) poolProjeteis.ativar(p);
        }
    }

    // Método para compatibilidade com o sistema de colisão
    receberDano(quantia) {
        this.vida -= quantia;
        if (this.vida <= 0) {
            this.vida = 0;
        }
        return this.vida <= 0; // Retorna true se o chefe foi derrotado
    }
}