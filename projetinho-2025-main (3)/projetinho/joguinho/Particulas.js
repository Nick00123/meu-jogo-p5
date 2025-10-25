class Particula {
  constructor(x, y, cor = [255, 150, 0]) {
    this.x = x;
    this.y = y;
    this.tamanho = random(CONFIG.PARTICULA.TAMANHO_MINIMO, CONFIG.PARTICULA.TAMANHO_MAXIMO);
    this.vx = random(CONFIG.PARTICULA.VELOCIDADE_MINIMA, CONFIG.PARTICULA.VELOCIDADE_MAXIMA);
    this.vy = random(CONFIG.PARTICULA.VELOCIDADE_MINIMA, CONFIG.PARTICULA.VELOCIDADE_MAXIMA);
    this.vida = CONFIG.PARTICULA.TEMPO_VIDA;
    this.cor = cor;
    this.remover = false;
  }

  atualizar() {
    this.x += this.vx;
    this.y += this.vy;
    this.vida--;
    
    // Marcar para remoção quando a vida acabar
    if (this.vida <= 0) {
      this.remover = true;
    }
  }

  desenhar() {
    noStroke();
    let alpha = map(this.vida, 0, CONFIG.PARTICULA.TEMPO_VIDA, 0, 255);
    fill(this.cor[0], this.cor[1], this.cor[2], alpha);
    ellipse(this.x, this.y, this.tamanho);
  }
}