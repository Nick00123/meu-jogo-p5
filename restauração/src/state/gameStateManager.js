// ===========================================
// GAME STATE MANAGER
// ===========================================

class GameStateManager {
  constructor() {
    this.currentState = 'MENU';
    this.previousState = null;
    this.states = {
      MENU: new MenuState(),
      PLAYING: new PlayingState(),
      PAUSED: new PausedState(),
      GAME_OVER: new GameOverState()
    };
  }

  changeState(newState) {
    if (this.states[newState]) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.states[newState].enter();
    }
  }

  update() {
    this.states[this.currentState].update();
  }

  draw() {
    this.states[this.currentState].draw();
  }

  handleKeyPressed() {
    this.states[this.currentState].handleKeyPressed();
  }

  getCurrentState() {
    return this.currentState;
  }

  getPreviousState() {
    return this.previousState;
  }
}

// ===========================================
// BASE STATE CLASS
// ===========================================

class GameState {
  constructor() {}

  enter() {
    // Override in subclasses
  }

  exit() {
    // Override in subclasses
  }

  update() {
    // Override in subclasses
  }

  draw() {
    // Override in subclasses
  }

  handleKeyPressed() {
    // Override in subclasses
  }
}

// ===========================================
// MENU STATE
// ===========================================

class MenuState extends GameState {
  constructor() {
    super();
    this.selectedOption = 0;
    this.menuOptions = ['JOGAR', 'CONFIGURAÇÕES', 'HIGH SCORES'];
    this.title = 'SPACE SHOOTER';
  }

  enter() {
    this.selectedOption = 0;
  }

  update() {
    // Menu não precisa de update constante
  }

  draw() {
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
      if (i === this.selectedOption) {
        fill(255, 255, 0); // Amarelo para selecionado
        text('> ' + this.menuOptions[i] + ' <', width / 2, height / 2 + i * 50);
      } else {
        fill(200); // Cinza para não selecionado
        text(this.menuOptions[i], width / 2, height / 2 + i * 50);
      }
    }
    
    // Instruções
    textSize(16);
    fill(150);
    text('Use SETAS para navegar, ENTER para selecionar', width / 2, height - 50);
    pop();
  }

  handleKeyPressed() {
    if (keyCode === UP_ARROW && this.selectedOption > 0) {
      this.selectedOption--;
    } else if (keyCode === DOWN_ARROW && this.selectedOption < this.menuOptions.length - 1) {
      this.selectedOption++;
    } else if (keyCode === ENTER) {
      this.selectOption();
    }
  }

  selectOption() {
    switch (this.selectedOption) {
      case 0: // JOGAR
        gameStateManager.changeState('PLAYING');
        break;
      case 1: // CONFIGURAÇÕES
        // TODO: Implementar tela de configurações
        break;
      case 2: // HIGH SCORES
        // TODO: Implementar tela de high scores
        break;
    }
  }
}

// ===========================================
// PLAYING STATE
// ===========================================

class PlayingState extends GameState {
  constructor() {
    super();
  }

  enter() {
    // Inicializar jogo se necessário
    if (!player) {
      initializeGame();
    }
  }

  update() {
    // Update do jogo principal - remover verificações desnecessárias
    updateGame();
  }

  draw() {
    // Draw do jogo principal (código existente)
    drawGame();
  }

  handleKeyPressed() {
    if (key === 'p' || key === 'P') {
      gameStateManager.changeState('PAUSED');
    }
  }
}

// ===========================================
// PAUSED STATE
// ===========================================

class PausedState extends GameState {
  constructor() {
    super();
    this.selectedOption = 0;
    this.pauseOptions = ['CONTINUAR', 'MENU PRINCIPAL'];
  }

  enter() {
    this.selectedOption = 0;
  }

  update() {
    // Pausa não precisa de update
  }

  draw() {
    // Desenhar o jogo em background (escurecido)
    gameStateManager.states.PLAYING.draw();
    
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

  handleKeyPressed() {
    if (keyCode === UP_ARROW && this.selectedOption > 0) {
      this.selectedOption--;
    } else if (keyCode === DOWN_ARROW && this.selectedOption < this.pauseOptions.length - 1) {
      this.selectedOption++;
    } else if (keyCode === ENTER) {
      this.selectOption();
    } else if (key === 'p' || key === 'P') {
      gameStateManager.changeState('PLAYING');
    }
  }

  selectOption() {
    switch (this.selectedOption) {
      case 0: // CONTINUAR
        gameStateManager.changeState('PLAYING');
        break;
      case 1: // MENU PRINCIPAL
        gameStateManager.changeState('MENU');
        break;
    }
  }
}

// ===========================================
// GAME OVER STATE
// ===========================================

class GameOverState extends GameState {
  constructor() {
    super();
    this.selectedOption = 0;
    this.gameOverOptions = ['JOGAR NOVAMENTE', 'MENU PRINCIPAL'];
    this.finalScore = 0;
    this.finalLevel = 0;
    this.isNewHighScore = false;
  }

  enter() {
    this.selectedOption = 0;
    this.finalScore = score;
    this.finalLevel = level;
    this.isNewHighScore = score > highScore; 
    if (this.isNewHighScore) {
      highScore = score; 
      localStorage.setItem('highScore', highScore);
    }
  }

  update() {
    // Game over não precisa de update
  }

  draw() {
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
    text('Score Final: ' + this.finalScore, width / 2, height / 2 - 60);
    
    fill(100, 255, 100);
    text('Nível Alcançado: ' + this.finalLevel, width / 2, height / 2 - 40);
    
    if (this.isNewHighScore) {
      fill(255, 215, 0);
      textSize(18);
      text('🏆 NOVO RECORDE! 🏆', width / 2, height / 2 - 15);
    }
    
    fill(200, 200, 200);
    textSize(14);
    text('High Score Anterior: ' + highScore, width / 2, height / 2 + 5);
    
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
        text('▶ ' + this.gameOverOptions[i] + ' ◀', width / 2, yPos);
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

  handleKeyPressed() {
    if (keyCode === UP_ARROW && this.selectedOption > 0) {
      this.selectedOption--;
    } else if (keyCode === DOWN_ARROW && this.selectedOption < this.gameOverOptions.length - 1) {
      this.selectedOption++;
    } else if (keyCode === ENTER) {
      this.selectOption();
    }
  }

  selectOption() {
    switch (this.selectedOption) {
      case 0: // JOGAR NOVAMENTE
        resetGame();
        gameStateManager.changeState('PLAYING');
        break;
      case 1: // MENU PRINCIPAL
        gameStateManager.changeState('MENU');
        break;
    }
  }
}

// Removido: keyPressed() duplicado. A versão em sketch.js delega para o estado atual.
