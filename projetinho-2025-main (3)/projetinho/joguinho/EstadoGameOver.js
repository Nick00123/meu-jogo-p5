class EstadoGameOver extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);
    this.selectedOption = 0;
    this.gameOverOptions = ['JOGAR NOVAMENTE', 'MENU PRINCIPAL'];
    this.pontuacaoFinal = 0;
    this.nivelFinal = 0;
    this.isNovoRecorde = false;
  }

  entrar() {
    this.selectedOption = 0;
    this.pontuacaoFinal = pontuacao;
    this.nivelFinal = nivel;
    this.isNovoRecorde = pontuacao > recorde; 
    if (this.isNovoRecorde) {
      recorde = pontuacao; 
      localStorage.setItem('recorde', recorde);
    }
  }

  atualizar() {
    // Game over não precisa de update
  }

  desenhar() {
    background(20, 20, 40);
    
    // Overlay escuro para melhor legibilidade
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    push();
    textAlign(CENTER, CENTER);
    
    // Título Game Over com efeito
    textSize(48);
    fill(255, 50, 50);
    text('GAME OVER', width / 2 + 2, height / 4 + 2); 
    fill(255, 100, 100);
    text('GAME OVER', width / 2, height / 4);
    
    // Caixa de informações
    fill(40, 40, 60, 200);
    stroke(100, 100, 150);
    strokeWeight(2);
    rect(width / 2 - 200, height / 2 - 120, 400, 200, 10);
    noStroke();
    
    // Estatísticas detalhadas
    textSize(20);
    fill(255, 255, 255);
    text('ESTATÍSTICAS FINAIS', width / 2, height / 2 - 90);
    
    textSize(16);
    fill(255, 255, 0);
    text('Score Final: ' + this.pontuacaoFinal, width / 2, height / 2 - 60);
    
    fill(100, 255, 100);
    text('Nível Alcançado: ' + this.nivelFinal, width / 2, height / 2 - 40);
    
    if (this.isNovoRecorde) {
      fill(255, 215, 0);
      textSize(18);
      text(' NOVO RECORDE! ', width / 2, height / 2 - 15);
    }
    
    fill(200, 200, 200);
    textSize(14);
    text('High Score Anterior: ' + recorde, width / 2, height / 2 + 5);
    
    // Linha separadora
    stroke(100, 100, 150);
    strokeWeight(1);
    line(width / 2 - 150, height / 2 + 25, width / 2 + 150, height / 2 + 25);
    noStroke();
    
    // Opções com melhor visual
    textSize(18);
    for (let i = 0; i < this.gameOverOptions.length; i++) {
      let yPos = height / 2 + 50 + i * 30;
      
      if (i === this.selectedOption) {
        // Destaque para opção selecionada
        fill(255, 255, 0, 100);
        rect(width / 2 - 120, yPos - 12, 240, 24, 5);
        
        fill(255, 255, 0);
        text(' ' + this.gameOverOptions[i] + ' ', width / 2, yPos);
      } else {
        fill(180, 180, 180);
        text(this.gameOverOptions[i], width / 2, yPos);
      }
    }
    
    // Instruções
    textSize(12);
    fill(150, 150, 150);
    text('Use ↑↓ para navegar, ENTER para selecionar', width / 2, height - 30);
    
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === UP_ARROW && this.selectedOption > 0) {
      this.selectedOption--;
    } else if (keyCode === DOWN_ARROW && this.selectedOption < this.gameOverOptions.length - 1) {
      this.selectedOption++;
    } else if (keyCode === ENTER) {
      this.selecionarOpcao();
    }
  }

  selecionarOpcao() {
    switch (this.selectedOption) {
      case 0: // JOGAR NOVAMENTE
        reiniciarJogo();
        this.gerenciador.mudarEstado('JOGANDO');
        break;
      case 1: // MENU PRINCIPAL
        this.gerenciador.mudarEstado('MENU');
        break;
    }
  }
}