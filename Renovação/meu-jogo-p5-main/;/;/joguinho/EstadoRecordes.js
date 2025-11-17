class HighScoresState extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);
    this.recorde = 0;
  }

  entrar() {
    const salvo = localStorage.getItem('recorde');
    this.recorde = salvo ? Number(salvo) : 0;
  }

  atualizar() {
    // Recordes não precisam de atualização constante
  }

  desenhar() {
    background(20, 20, 40);

    push();
    textAlign(CENTER, TOP);
    textSize(28);
    fill(255, 255, 0);
    text('RECORDES', width / 2, 30);
    pop();

    // Exibir melhor pontuação salva
    push();
    textAlign(CENTER, CENTER);
    textSize(22);
    fill(230);
    text(`Maior Pontuação: ${this.recorde}`, width / 2, height / 2 - 10);
    pop();

    // Instruções
    push();
    textAlign(CENTER, BOTTOM);
    textSize(14);
    fill(160);
    text('ESC para voltar ao Menu', width / 2, height - 24);
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === ESCAPE || keyCode === ENTER) {
      this.gerenciador.mudarEstado('MENU');
    }
  }
}