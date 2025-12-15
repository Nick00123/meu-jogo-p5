class PuzzleBase {
  constructor() {
    this.resolvido = false;
    this.entidades = [];
    this.notificacoes = [];
    this.interativo = true;
    this.usaCamera = false; // Padrão: puzzles são de tela, não de mundo
  }

  iniciar() { /* a ser implementado por filhos */ }
  atualizar(player) {
    this.entidades.forEach(e => e.atualizar && e.atualizar(player));

    // Atualizar notificações
    for (let i = this.notificacoes.length - 1; i >= 0; i--) {
      let n = this.notificacoes[i];
      n.vida--;
      if (n.vida <= 0) {
        this.notificacoes.splice(i, 1);
      }
    }
  }

  desenhar() {
    this.entidades.forEach(e => e.desenhar && e.desenhar());

    // Desenhar notificações
    this.notificacoes.forEach(n => {
      push();
      fill(n.cor[0], n.cor[1], n.cor[2], n.vida);
      textSize(24);
      textAlign(CENTER, CENTER);
      text(n.texto, n.x, n.y);
      pop();
    });
  }

  aoClicar(mx, my) {
    if (!this.interativo) return;
    this.entidades.forEach(e => e.aoClicar && e.aoClicar(mx, my));
  }

  estaResolvido() {
    return this.resolvido;
  }

  adicionarNotificacao(texto, cor = [255, 255, 0]) {
    this.notificacoes.push({
      texto: texto,
      x: width / 2,
      y: height - 100,
      vida: 180, // 3 segundos
      cor: cor
    });
  }

  desativarInteracao() {
    this.interativo = false;
  }
}

class PlacaSimbolo {
  constructor(x, y, simbolo, valor) {
    this.x = x;
    this.y = y;
    this.simbolo = simbolo;
    this.valor = valor;
    this.r = 40;
    this.ativada = false;
  }

  desenhar() {
    push();
    translate(this.x, this.y);
    stroke(200);
    strokeWeight(4);
    fill(this.ativada ? '#4CAF50' : '#795548');
    rectMode(CENTER);
    rect(0, 0, this.r * 2, this.r * 2, 10);
    noStroke();
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(this.simbolo, 0, 0);
    pop();
  }

  aoClicar(mx, my) {
    if (dist(mx, my, this.x, this.y) < this.r) {
      this.ativada = true;
      return this.valor;
    }
    return null;
  }
}