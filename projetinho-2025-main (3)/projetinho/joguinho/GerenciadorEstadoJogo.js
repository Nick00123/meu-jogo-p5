class GerenciadorEstadoJogo {
  constructor() {
    const pref = localStorage.getItem('configuracoes.mostrarIntro');
    const mostrarIntro = (pref === null) ? true : (pref === 'true');
    this.estadoAtual = mostrarIntro ? 'INTRO' : 'MENU';
    this.estadoAnterior = null;
    this.estados = {
      INTRO: new EstadoIntro(this),             // de EstadoIntro.js
      MENU: new EstadoMenu(this),               // de EstadoMenu.js
      CONFIGURACOES: new EstadoConfiguracoes(this), // de EstadoConfiguracoes.js
      RECORDES: new EstadoRecordes(this),         // de EstadoRecordes.js
      LOBBY: new LobbyState(this),             // de EstadoLobby.js
      JOGANDO: new EstadoJogando(this),           // de EstadoJogando.js
      PAUSADO: new EstadoPausado(this),           // de EstadoPausado.js
      GAME_OVER: new EstadoGameOver(this)       // de EstadoGameOver.js
    };
    this.estados[this.estadoAtual].entrar();
  }

  mudarEstado(novoEstado) {
    if (this.estados[novoEstado]) {
      this.estadoAnterior = this.estadoAtual;
      this.estadoAtual = novoEstado;
      this.estados[novoEstado].entrar();
    }
  }

  atualizar() { this.estados[this.estadoAtual].atualizar(); }
  desenhar() { this.estados[this.estadoAtual].desenhar(); }
  aoPressionarTecla() { this.estados[this.estadoAtual].aoPressionarTecla(); }
  obterEstadoAtual() { return this.estadoAtual; }
  obterEstadoAnterior() { return this.estadoAnterior; }
}

GerenciadorEstadoJogo.prototype.handleKeyPressed = function() {
  if (this.estadoAtual && typeof this.estadoAtual.aoPressionarTecla === 'function') {
    this.estadoAtual.aoPressionarTecla();
  }
};