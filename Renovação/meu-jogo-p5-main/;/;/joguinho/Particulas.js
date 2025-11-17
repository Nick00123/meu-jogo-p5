class Particula {
  constructor(x, y, cor = [255, 150, 0]) {
    const { TAMANHO_MINIMO, TAMANHO_MAXIMO, VELOCIDADE_MINIMA, VELOCIDADE_MAXIMA, TEMPO_VIDA } = CONFIG.PARTICULA;

    this.x = x;
    this.y = y;
    this.tamanho = random(TAMANHO_MINIMO, TAMANHO_MAXIMO);
    this.vx = random(VELOCIDADE_MINIMA, VELOCIDADE_MAXIMA);
    this.vy = random(VELOCIDADE_MINIMA, VELOCIDADE_MAXIMA);
    this.vida = TEMPO_VIDA;
    this.cor = cor;
    this.remover = false;
  }

  atualizar() {
    this.x += this.vx;
    this.y += this.vy;
    this.vida--;

    this.remover = this.vida <= 0;
  }

  desenhar() {
    noStroke();
    let alpha = map(this.vida, 0, CONFIG.PARTICULA.TEMPO_VIDA, 0, 255);
    fill(...this.cor, alpha);
    ellipse(this.x, this.y, this.tamanho);
  }
}