class EstadoMenu extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);
    this.opcao = 0;
    this.opcoesMenu = ['JOGAR', 'CONFIGURAÇÕES', 'RECORDES'];
    this.titulo = 'SPACE SHOOTER';
  }

  entrar() {
    this.opcao = 0;
  }

  atualizar() {
    // Menu não precisa de update constante
  }

  desenhar() {
    // Fundo escuro
    background(20, 20, 40);
    
    push();
    // Título
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255, 255, 0);
    text(this.titulo, width / 2, height / 4);
    
    // Opções do menu
    textSize(24);
    for (let i = 0; i < this.opcoesMenu.length; i++) {
      if (i === this.opcao) {
        fill(255, 255, 0); // Amarelo para selecionado
        text('> ' + this.opcoesMenu[i] + ' <', width / 2, height / 2 + i * 50);
      } else {
        fill(200); // Cinza para não selecionado
        text(this.opcoesMenu[i], width / 2, height / 2 + i * 50);
      }
    }
    
    // Instruções
    textSize(16);
    fill(150);
    text('Use SETAS para navegar, ENTER para selecionar', width / 2, height - 50);
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === UP_ARROW) {
      this.opcao = (this.opcao - 1 + this.opcoesMenu.length) % this.opcoesMenu.length;
    } else if (keyCode === DOWN_ARROW) {
      this.opcao = (this.opcao + 1) % this.opcoesMenu.length;
    } else if (keyCode === ENTER) {
      this.selecionarOpcao();
    }
  }

  selecionarOpcao() {
    switch (this.opcao) {
      case 0: // JOGAR
        this.gerenciador.mudarEstado('LOBBY');
        break;
      case 1: // CONFIGURAÇÕES
        this.gerenciador.mudarEstado('CONFIGURACOES');
        break;
      case 2: // RECORDES
        this.gerenciador.mudarEstado('RECORDES');
        break;
    }
  }
}