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
    
    // Sistema de sprites
    this.spriteAtual = 'direita';
    this.frameAtual = 0;
    this.tempoUltimoFrame = 0;
    this.intervaloFrames = 100; // ms entre frames
    
    // Sistema de sprites de dash
    this.spriteDashAtual = 'direita';
    this.frameDashAtual = 0;
    this.tempoUltimoFrameDash = 0;
    this.intervaloFramesDash = 50; // ms entre frames (mais rápido no dash)
    
    // Propriedades do dash
    this.ultimoDash = -Infinity;
    this.cooldownDash = 1000; // 1 segundo
    this.estaDandoDash = false;
    this.duracaoDash = 150; // 150ms
    this.velocidadeDash = 25;
    this.direcaoDash = createVector(0, 0);
  }

  podeDash() {
    return (millis() - this.ultimoDash) > this.cooldownDash;
  }

  dash() {
    if (this.podeDash()) {
      // Calcular direção baseada nas teclas pressionadas
      let dirX = 0;
      let dirY = 0;
      
      if (keyIsDown(65)) dirX -= 1; // A
      if (keyIsDown(68)) dirX += 1; // D
      if (keyIsDown(87)) dirY -= 1; // W
      if (keyIsDown(83)) dirY += 1; // S
      
      // Se nenhuma tecla estiver pressionada, não faz dash
      if (dirX === 0 && dirY === 0) return;
      
      this.estaDandoDash = true;
      this.ultimoDash = millis();
      this.direcaoDash = createVector(dirX, dirY).normalize();
      // Tornar o jogador invencível durante o dash
      this.invencivel = true;
      // A invencibilidade dura um pouco mais que o dash para segurança
      this.tempoInvencibilidade = millis() + this.duracaoDash + 50;
    }
  }

  atualizar() {
    // Lógica do dash
    if (this.estaDandoDash) {
      if (millis() - this.ultimoDash < this.duracaoDash) {
        // Movimento durante o dash
        this.x += this.direcaoDash.x * this.velocidadeDash;
        this.y += this.direcaoDash.y * this.velocidadeDash;
        // Atualizar sprite do dash
        this.atualizarSpriteDash();
      } else {
        this.estaDandoDash = false;
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
      
      // Atualizar direção do movimento e sprite
      if (moveu) {
        this.direcao = createVector(
          (keyIsDown(68) ? 1 : 0) - (keyIsDown(65) ? 1 : 0),
          (keyIsDown(83) ? 1 : 0) - (keyIsDown(87) ? 1 : 0)
        ).normalize();
        
        // Atualizar sprite baseado na direção (movendo)
        this.atualizarSprite(true);
      } else {
        // Se não está se movendo, resetar para frame 0 (parado)
        this.frameAtual = 0;
      }
    }
    
    // Limitar dentro dos limites do jogo (aplica a ambos os modos)
    this.x = constrain(this.x, 0, CONFIG.MAPA.LARGURA - this.tamanho);
    this.y = constrain(this.y, 0, CONFIG.MAPA.ALTURA - this.tamanho);
  }

  atualizarSprite() {
    // Determinar sprite baseado na direção do movimento
    if (Math.abs(this.direcao.x) > Math.abs(this.direcao.y)) {
      // Movimento horizontal predominante
      this.spriteAtual = this.direcao.x > 0 ? 'direita' : 'esquerda';
    } else {
      // Movimento vertical predominante
      this.spriteAtual = this.direcao.y > 0 ? 'baixo' : 'cima';
    }
    
    // Atualizar animação (frames)
    if (millis() - this.tempoUltimoFrame > this.intervaloFrames) {
      this.frameAtual = (this.frameAtual + 1) % 9; // 9 frames por direção
      this.tempoUltimoFrame = millis();
    }
  }
  
  atualizarSpriteDash() {
    // Determinar sprite do dash baseado na direção do dash
    if (Math.abs(this.direcaoDash.x) > Math.abs(this.direcaoDash.y)) {
      // Movimento horizontal predominante
      this.spriteDashAtual = this.direcaoDash.x > 0 ? 'direita' : 'esquerda';
    } else {
      // Movimento vertical predominante
      this.spriteDashAtual = this.direcaoDash.y > 0 ? 'baixo' : 'cima';
    }
    
    // Atualizar animação do dash (frames)
    if (millis() - this.tempoUltimoFrameDash > this.intervaloFramesDash) {
      this.frameDashAtual = (this.frameDashAtual + 1) % 9; // 9 frames por direção
      this.tempoUltimoFrameDash = millis();
    }
  }

  desenhar() {
    push();
    // Efeito de piscar quando invencível
    if (this.invencivel && Math.floor(millis() / 100) % 2 === 0) {
      fill(255, 0, 0, 150); // Vermelho semi-transparente
    } else {
      fill(0, 200, 255); // Cor normal do jogador
    }
    
    // Desenhar o jogador com sprite
    let spriteParaDesenhar = null;
    let frameX, frameY;
    const frameSize = 64; // Tamanho de cada frame (assumindo 64x64)
    
    if (this.estaDandoDash && spritesJogadorDash && spritesJogadorDash[this.spriteDashAtual]) {
      // Usar sprites de dash
      spriteParaDesenhar = spritesJogadorDash[this.spriteDashAtual];
      frameX = this.frameDashAtual * frameSize;
      
      // Determinar qual linha usar baseado na direção do dash
      switch(this.spriteDashAtual) {
        case 'cima': frameY = 0; break;
        case 'esquerda': frameY = frameSize; break;
        case 'baixo': frameY = frameSize * 2; break;
        case 'direita': frameY = frameSize * 3; break;
      }
    } else if (spritesJogador && spritesJogador[this.spriteAtual]) {
      // Usar sprites normais
      spriteParaDesenhar = spritesJogador[this.spriteAtual];
      frameX = this.frameAtual * frameSize;
      
      // Determinar qual linha usar baseado na direção
      switch(this.spriteAtual) {
        case 'cima': frameY = 0; break;
        case 'esquerda': frameY = frameSize; break;
        case 'baixo': frameY = frameSize * 2; break;
        case 'direita': frameY = frameSize * 3; break;
      }
    }
    
    if (spriteParaDesenhar) {
      push();
      imageMode(CENTER);
      // Desenhar apenas o frame atual da sprite sheet
      const tamanhoSprite = this.tamanho * 3.0; // Dobro do tamanho original
      image(spriteParaDesenhar, this.x, this.y, tamanhoSprite, tamanhoSprite,
            frameX, frameY, frameSize, frameSize);
      pop();
    } else {
      // Fallback para retângulo se sprite não estiver disponível
      noStroke();
      rectMode(CENTER);
      rect(this.x, this.y, this.tamanho, this.tamanho);
    }
    
    // Desenhar escudo se ativo
    if (this.escudoAtivo) {
      noFill();
      stroke(0, 100, 255, 150);
      strokeWeight(3);
      ellipse(this.x, this.y, this.tamanho * 1.5, this.tamanho * 1.5);
    }
    
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
    if (this.invencivel) return;
    
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
      if (gerenciadorEstadoJogo) {
        gerenciadorEstadoJogo.mudarEstado('GAME_OVER');
      }
    }
  }
}