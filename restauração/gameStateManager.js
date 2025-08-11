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
    this.isNewHighScore = false;
  }

  enter() {
    this.selectedOption = 0;
    this.finalScore = score;
    this.isNewHighScore = score > highscore;
    if (this.isNewHighScore) {
      highscore = score;
      localStorage.setItem('highscore', highscore);
    }
  }

  update() {
    // Game over não precisa de update
  }

  draw() {
    background(20, 20, 40);
    
    push();
    textAlign(CENTER, CENTER);
    
    // Título Game Over
    textSize(48);
    fill(255, 0, 0);
    text('GAME OVER', width / 2, height / 4);
    
    // Score
    textSize(24);
    fill(255);
    text('Score: ' + this.finalScore, width / 2, height / 2 - 60);
    
    if (this.isNewHighScore) {
      fill(255, 255, 0);
      text('NOVO RECORDE!', width / 2, height / 2 - 30);
    }
    
    fill(200);
    text('High Score: ' + highscore, width / 2, height / 2);
    
    // Opções
    textSize(20);
    for (let i = 0; i < this.gameOverOptions.length; i++) {
      if (i === this.selectedOption) {
        fill(255, 255, 0);
        text('> ' + this.gameOverOptions[i] + ' <', width / 2, height / 2 + 60 + i * 35);
      } else {
        fill(200);
        text(this.gameOverOptions[i], width / 2, height / 2 + 60 + i * 35);
      }
    }
    
    textSize(16);
    fill(150);
    text('SETAS para navegar, ENTER para selecionar', width / 2, height - 50);
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

function keyPressed() {
  gameStateManager.handleKeyPressed();
}
