class PowerUp {
    constructor(x, y, tipo) {
      this.x = x;
      this.y = y;
      this.tipo = tipo;
      this.tamanho = 20;
      this.duracao = 10000; // 10 segundos
      this.tempoAtivo = 0;
      this.ativo = false;
      this.coletado = false;
      this.velocidadeFlutuacao = 0.05;
      this.offsetY = 0;
      this.amplitude = 5;
      this.tempoInicial = 0;
      
      this.cores = {
        'vida': [255, 0, 0],        // Vermelho
        'velocidade': [0, 255, 0],  // Verde
        'dano': [255, 165, 0],      // Laranja
        'escudo': [0, 0, 255]       // Azul
      };
    }
  
    atualizar() {
      if (!this.coletado) {
        // Animação de flutuação
        this.offsetY = Math.sin(millis() * this.velocidadeFlutuacao) * this.amplitude;
      } else if (this.ativo) {
        // Atualizar tempo restante
        this.tempoAtivo = this.duracao - (millis() - this.tempoInicial);
        
        // Desativar quando o tempo acabar
        if (this.tempoAtivo <= 0) {
          this.ativo = false;
          this.remover = true; // Marcar para remoção
          // A desativação será gerenciada pelo GerenciadorPowerUps
        }
      }
    }
  
    desenhar() {
      if (this.coletado && !this.ativo) return;
  
      push();
      translate(0, this.offsetY);
      
      if (!this.coletado) {
        // Desenhar power-up não coletado
        const cor = this.cores[this.tipo] || [128, 128, 128];
        fill(...cor);
        ellipse(this.x, this.y, this.tamanho, this.tamanho);
        
        // Desenhar símbolo
        fill(255);
        textSize(12);
        textAlign(CENTER, CENTER);
        text(this.getSimbolo(), this.x, this.y);
      } 
      else if (this.ativo) {
        // Desenhar barra de tempo do power-up ativo
        const larguraBarra = 60;
        const alturaBarra = 5;
        const progresso = this.tempoAtivo / this.duracao;
        
        // Fundo da barra
        fill(100, 100);
        rect(this.x - larguraBarra/2, this.y - 30, larguraBarra, alturaBarra);
        
        // Preenchimento
        fill(...this.cores[this.tipo]);
        rect(this.x - larguraBarra/2, this.y - 30, larguraBarra * progresso, alturaBarra);
        
        // Texto do tipo
        textSize(10);
        textAlign(CENTER, CENTER);
        fill(255);
        text(this.tipo.toUpperCase(), this.x, this.y - 45);
      }
      
      pop();
    }
  
    coletar(jogador) {
      if (this.coletado) return false;
      
      this.coletado = true;
      this.ativo = true;
      this.tempoInicial = millis();
      
      this.aplicarEfeito(jogador);
      
      return true;
    }
  
    aplicarEfeito(jogador) {
      switch(this.tipo) {
        case 'vida':
          jogador.vida = min(jogador.vidaMaxima, jogador.vida + 20);
          break;
        case 'velocidade':
          jogador.velocidadeBase = jogador.velocidade;
          jogador.velocidade *= 1.5;
          break;
        case 'dano':
          jogador.danoBase = jogador.dano || 1;
          jogador.dano = (jogador.dano || 1) * 1.5;
          break;
        case 'escudo':
          jogador.escudoAtivo = true;
          jogador.escudoVida = 50;
          break;
      }
    }
  
    desativarEfeito(jogador) {
      if (jogador) {
        switch(this.tipo) {
          case 'velocidade':
            jogador.velocidade = jogador.velocidadeBase;
            break;
          case 'dano':
            jogador.dano = jogador.danoBase;
            break;
          case 'escudo':
            jogador.escudoAtivo = false;
            break;
        }
      }
    }
  
    getSimbolo() {
      const simbolos = {
        'vida': '❤️',
        'velocidade': '⚡',
        'dano': '⚔️',
        'escudo': '🛡️'
      };
      return simbolos[this.tipo] || '?';
    }
  
    verificarColisao(jogador) {
      if (this.coletado || !jogador) return false;
      
      const distancia = dist(
        this.x, this.y,
        jogador.x, jogador.y
      );
      
      return distancia < (this.tamanho/2 + (jogador.tamanho || 15)/2);
    }
  }
  
  class GerenciadorPowerUps {
    constructor() {
      this.powerUps = [];
      this.proximoSpawn = 0;
      this.intervaloSpawn = 10000; // 10 segundos entre spawns
      this.tipos = ['vida', 'velocidade', 'dano', 'escudo'];
      this.pesos = [3, 2, 2, 3]; // Pesos para cada tipo
    }
  
    atualizar(jogador) {
      if (!jogador) return;
      const agora = millis();
      
      // Verificar se é hora de spawnar um novo power-up
      if (agora > this.proximoSpawn && this.powerUps.length < 3) {
        this.spawnarPowerUp();
        this.proximoSpawn = agora + this.intervaloSpawn;
      }
      
      // Atualizar power-ups existentes
      for (let i = this.powerUps.length - 1; i >= 0; i--) {
        const powerUp = this.powerUps[i];
        
        // Remover power-ups que já foram coletados e expiraram
        if (powerUp.coletado && !powerUp.ativo) {
          powerUp.desativarEfeito(jogador);
          this.powerUps.splice(i, 1);
          continue;
        }
        
        powerUp.atualizar();
      }
    }
  
    desenhar() {
      this.powerUps.forEach(powerUp => powerUp.desenhar());
    }
  
    spawnarPowerUp() {
      // Escolher tipo de power-up baseado nos pesos
      const totalPesos = this.pesos.reduce((a, b) => a + b, 0);
      let sorteio = random(totalPesos);
      let tipoSelecionado = 0;
      
      for (let i = 0; i < this.pesos.length; i++) {
        if (sorteio < this.pesos[i]) {
          tipoSelecionado = i;
          break;
        }
        sorteio -= this.pesos[i];
      }
      
      // Gerar posição aleatória longe das bordas
      const margem = 100;
      const x = random(margem, width - margem);
      const y = random(margem, height - margem);
      
      // Criar e adicionar novo power-up
      const novoPowerUp = new PowerUp(x, y, this.tipos[tipoSelecionado]);
      this.powerUps.push(novoPowerUp);
      
      return novoPowerUp;
    }
  
    limpar() {
      // Desativar todos os efeitos ativos antes de limpar
      // O jogador deve ser resetado externamente ao reiniciar o jogo.
      // O GerenciadorPowerUps não deve ser responsável por reverter os status do jogador.
      this.powerUps = [];
    }
  }
  
