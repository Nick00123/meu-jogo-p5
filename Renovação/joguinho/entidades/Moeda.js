// Moeda.js
class Moeda extends Entidade {
    constructor(x, y) {
      super(x, y);
      this.tamanho = 20;
      this.valor = 1;
      this.velocidadeRotacao = 0.1;
      this.angulo = 0;
      this.tempoVida = 10000; // 10 segundos
      this.tempoNascimento = millis();
      this.coletada = false;
    }
  
    atualizar() {
      this.angulo += this.velocidadeRotacao;
      
      // Verificar se a moeda expirou
      if (millis() - this.tempoNascimento > this.tempoVida) {
        this.coletada = true;
      }
    }
  
    desenhar() {
      push();
      translate(this.x, this.y);
      rotate(this.angulo);
      
      // Desenhar moeda
      noStroke();
      fill(255, 215, 0); // Cor dourada
      ellipse(0, 0, this.tamanho, this.tamanho);
      
      // Detalhes da moeda
      fill(255, 255, 0);
      ellipse(0, 0, this.tamanho * 0.8, this.tamanho * 0.8);
      
      // Efeito de brilho
      if (frameCount % 60 < 30) {
        fill(255, 255, 200, 100);
        ellipse(0, 0, this.tamanho * 1.5, this.tamanho * 1.5);
      }
      
      pop();
    }
  
    // Verificar colisão com o jogador
    verificarColisao(jogador) {
      const distancia = dist(this.x, this.y, jogador.x, jogador.y);
      if (distancia < (this.tamanho/2 + jogador.tamanho/2)) {
        this.coletada = true;
        return true;
      }
      return false;
    }
  }