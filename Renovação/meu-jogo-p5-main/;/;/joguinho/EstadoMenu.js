class MenuState extends EstadoBase {
  constructor() {
    super();
    this.selectedOption = 0;
    this.menuOptions = ['JOGAR', 'CONFIGURAÇÕES', 'HIGH SCORES'];
    this.title = 'SPACE SHOOTER';
  }

  entrar() {
    this.selectedOption = 0;
  }

  atualizar() {
    // Menu não precisa de update constante
  }

  desenhar() {
    // Fundo escuro
    background(20, 20, 40);
    
    // Título
    push();
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255, 255, 0);
    text(this.title, width / 2, height / 4);
    
    // Opções do menu
    textSize(24);
    for (let i = 0; i < this.menuOptions.length; i++) {
      const isSelected = (i === this.selectedOption);
      fill(isSelected ? [255, 255, 0] : [200]);
      text(isSelected ? `> ${this.menuOptions[i]} <` : this.menuOptions[i], width / 2, height / 2 + i * 50);
    }
    
    // Instruções
    textSize(16);
    fill(150);
    text('Use SETAS para navegar, ENTER para selecionar', width / 2, height - 50);
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === UP_ARROW) {
      this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
    } else if (keyCode === DOWN_ARROW) {
      this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
    } else if (keyCode === ENTER) {
      switch (this.selectedOption) {
        case 0: gerenciadorEstadoJogo.mudarEstado('LOBBY'); break;
        case 1: gerenciadorEstadoJogo.mudarEstado('SETTINGS'); break;
        case 2: gerenciadorEstadoJogo.mudarEstado('HIGH_SCORES'); break;
      }
    }
  }
}