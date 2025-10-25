class EstadoPausado extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);
    this.selectedOption = 0;
    this.pauseOptions = ['CONTINUAR', 'MENU PRINCIPAL'];
  }

  entrar() {
    this.selectedOption = 0;
  }

  atualizar() {
    // Pausa não precisa de update
  }

  desenhar() {
    // Desenhar o jogo em background (escurecido)
    this.gerenciador.estados['JOGANDO'].desenhar();
    
    // Overlay escuro
    push();
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    // Menu de pausa
    textAlign(CENTER, CENTER);
    textSize(36);
    fill(255, 255, 0);
    text('PAUSADO', width / 2, height / 3);
    
    // Opções
    textSize(24);
    for (let i = 0; i < this.pauseOptions.length; i++) {
      if (i === this.selectedOption) {
        fill(255, 255, 0);
        text('> ' + this.pauseOptions[i] + ' <', width / 2, height / 2 + i * 40);
      } else {
        fill(200);
        text(this.pauseOptions[i], width / 2, height / 2 + i * 40);
      }
    }
    
    textSize(16);
    fill(150);
    text('SETAS para navegar, ENTER para selecionar, P para continuar', width / 2, height - 80);
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === UP_ARROW && this.selectedOption > 0) {
      this.selectedOption--;
    } else if (keyCode === DOWN_ARROW && this.selectedOption < this.pauseOptions.length - 1) {
      this.selectedOption++;
    } else if (keyCode === ENTER) {
      this.selecionarOpcao();
    } else if (key === 'p' || key === 'P') {
      this.gerenciador.mudarEstado('JOGANDO');
    }
  }

  selecionarOpcao() {
    switch (this.selectedOption) {
      case 0: // CONTINUAR
        this.gerenciador.mudarEstado('JOGANDO');
        break;
      case 1: // MENU PRINCIPAL
        this.gerenciador.mudarEstado('MENU');
        break;
    }
  }
}