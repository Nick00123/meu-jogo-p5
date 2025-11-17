class GerenciadorEstadoJogo {
  constructor() {
    const pref = localStorage.getItem('configuracoes.mostrarIntro');
    const mostrarIntro = (pref === null) ? true : (pref === 'true');
    this.currentState = mostrarIntro ? 'INTRO' : 'MENU';
    this.estadoAnterior = null;
    this.estados = {
      INTRO: new IntroState(this),
      MENU: new MenuState(this),
      SETTINGS: new SettingsState(this),
      HIGH_SCORES: new HighScoresState(this),
      LOBBY: new LobbyState(this),
      PLAYING: new PlayingState(this),
      PAUSED: new PausedState(this),
      GAME_OVER: new GameOverState(this)
    };
    if (this.estados[this.currentState] && typeof this.estados[this.currentState].entrar === 'function') {
      this.estados[this.currentState].entrar();
    }
  }

  mudarEstado(newState) {
    if (this.estados[newState]) {
      this.estadoAnterior = this.currentState;
      this.currentState = newState;
      this.estados[newState].entrar();
    }
  }

  atualizar() { this.estados[this.currentState].atualizar(); }
  desenhar() { this.estados[this.currentState].desenhar(); }
  aoPressionarTecla() { this.estados[this.currentState].aoPressionarTecla(); }
  obterEstadoAtual() { return this.currentState; }
  obterEstadoAnterior() { return this.estadoAnterior; }
}
