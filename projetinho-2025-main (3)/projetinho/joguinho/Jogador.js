class Jogador extends Entidade {
  constructor(x, y) {
    super(x, y);
    this.vida = 100;
    this.vidaMaxima = 100;
    this.velocidade = 5;
    this.velocidadeBase = this.velocidade;
    this.dano = 1;
    this.danoBase = this.dano;
    this.escudoAtivo = false;
    this.escudoVida = 0;
    this.tamanho = 30;
    this.invencivel = false;
    this.tempoInvencibilidade = 0;
    this.direcao = createVector(1, 0);
    
    // Propriedades do dash
    this.ultimoDash = 0;
    this.cooldownDash = 1000; // 1 segundo de cooldown
    this.estaDandoDash = false;
    this.duracaoDash = 200; // 200ms de duração
    this.velocidadeDash = 15;
    this.direcaoDash = createVector(0, 0);
  }

  podeDash() {
    return (millis() - this.ultimoDash) > this.cooldownDash;
  }

  dash() {
    if (this.podeDash() && !this.estaDandoDash) {
      // Calcular direção baseada nas teclas pressionadas
      let dirX = 0;
      let dirY = 0;
      
      if (keyIsDown(65)) dirX -= 1; // A
      if (keyIsDown(68)) dirX += 1; // D
      if (keyIsDown(87)) dirY -= 1; // W
      if (keyIsDown(83)) dirY += 1; // S
      
      // Se nenhuma tecla estiver pressionada, não faz dash
      if (dirX === 0 && dirY === 0) {
        return;
      }
      
      this.estaDandoDash = true;
      this.ultimoDash = millis();
      this.direcaoDash = createVector(dirX, dirY).normalize();
      // Tornar o jogador invencível durante o dash
      this.invencivel = true;
      this.tempoInvencibilidade = millis() + this.duracaoDash;
    }
  }

  atualizar() {
    // Lógica do dash
    if (this.estaDandoDash) {
      if (millis() - this.ultimoDash < this.duracaoDash) {
        // Movimento durante o dash
        this.x += this.direcaoDash.x * this.velocidadeDash;
        this.y += this.direcaoDash.y * this.velocidadeDash;
      } else {
        this.estaDandoDash = false;
        // Se o jogador ainda tiver invencibilidade do dash, não sobrescreve
        if (millis() > this.tempoInvencibilidade) {
          this.invencivel = false;
        }
      }
    } else {
      // Atualizar invencibilidade (apenas se não estiver em dash)
      if (this.invencivel && millis() > this.tempoInvencibilidade) {
        this.invencivel = false;
      }
      
      // Lógica de movimento normal
      let velocidadeAtual = this.velocidade;
      let moveu = false;
      
      if (keyIsDown(65)) { this.x -= velocidadeAtual; moveu = true; } // A - Esquerda
      if (keyIsDown(68)) { this.x += velocidadeAtual; moveu = true; } // D - Direita
      if (keyIsDown(87)) { this.y -= velocidadeAtual; moveu = true; } // W - Cima
      if (keyIsDown(83)) { this.y += velocidadeAtual; moveu = true; } // S - Baixo
      
      // Atualizar direção do movimento
      if (moveu) {
        this.direcao = createVector(
          (keyIsDown(68) ? 1 : 0) - (keyIsDown(65) ? 1 : 0),
          (keyIsDown(83) ? 1 : 0) - (keyIsDown(87) ? 1 : 0)
        ).normalize();
      }
    }
    
    // Limitar dentro dos limites do jogo (aplica a ambos os modos)
this.x = constrain(this.x, 0, CONFIG.MAPA.LARGURA - this.tamanho);
this.y = constrain(this.y, 0, CONFIG.MAPA.ALTURA - this.tamanho);
  }

  desenhar() {
    push();
    // Efeito de piscar quando invencível
    if (this.invencivel && Math.floor(millis() / 100) % 2 === 0) {
      fill(255, 0, 0, 150); // Vermelho semi-transparente
    } else {
      fill(0, 200, 255); // Cor normal do jogador
    }
    
    // Desenhar o jogador
    noStroke();
    rectMode(CENTER);
    rect(this.x, this.y, this.tamanho, this.tamanho);
    
    // Desenhar barra de vida
    this.desenharBarraVida();
    
    // Desenhar escudo se ativo
    if (this.escudoAtivo) {
      noFill();
      stroke(0, 100, 255, 150);
      strokeWeight(3);
      ellipse(this.x, this.y, this.tamanho * 1.5, this.tamanho * 1.5);
    }
    
    // Desenhar indicador de dash (cooldown)
    this.desenharCooldownDash();
    
    pop();
  }
  
  desenharCooldownDash() {
    if (!this.podeDash()) {
      const cooldownRestante = 1 - ((millis() - this.ultimoDash) / this.cooldownDash);
      const tamanho = this.tamanho * 0.8;
      
      // Fundo do cooldown
      noFill();
      stroke(100, 100, 100, 150);
      strokeWeight(2);
      arc(this.x, this.y, tamanho, tamanho, -HALF_PI, TWO_PI - HALF_PI);
      
      // Barra de cooldown
      stroke(0, 200, 255, 200);
      strokeWeight(3);
      arc(
        this.x, 
        this.y, 
        tamanho, 
        tamanho, 
        -HALF_PI, 
        -HALF_PI + (TWO_PI * cooldownRestante)
      );
    }
  }
  
  desenharBarraVida() {
    // Fundo da barra de vida
    fill(50, 50, 50);
    rect(this.x - this.tamanho/2, this.y - this.tamanho/2 - 10, this.tamanho, 5);
    
    // Vida atual
    const vidaPorcentagem = this.vida / this.vidaMaxima;
    fill(255, 0, 0);
    rect(this.x - this.tamanho/2, this.y - this.tamanho/2 - 10, this.tamanho * vidaPorcentagem, 5);
  }

  receberDano(dano) {
    if (this.invencivel || this.estaDandoDash) return;
    
    if (this.escudoAtivo) {
      this.escudoVida -= dano;
      if (this.escudoVida <= 0) {
        const danoRestante = -this.escudoVida;
        this.escudoAtivo = false;
        this.escudoVida = 0;
        
        if (danoRestante > 0) {
          this.aplicarDano(danoRestante);
        }
      }
    } else {
      this.aplicarDano(dano);
    }
    
    // Tornar o jogador invencível temporariamente
    this.invencivel = true;
    this.tempoInvencibilidade = millis() + 1000; // 1 segundo de invencibilidade
  }
  
  aplicarDano(dano) {
    this.vida -= dano;
    
    // Verificar se o jogador morreu
    if (this.vida <= 0) {
      this.vida = 0;
      if (typeof gameOver === 'function') {
        gameOver();
      }
    }
  }
}