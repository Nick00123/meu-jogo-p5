// ===========================================
// GERENCIADOR CENTRAL DE ESTADOS
// ===========================================

class GerenciadorEstados {
  constructor() {
    const pref = localStorage.getItem('config.mostrarIntro');
    const mostrarIntro = (pref === null) ? true : (pref === 'true');
    
    this.estadoAtual = mostrarIntro ? 'INTRO' : 'MENU';
    this.estadoAnterior = null;
    
    // Carregar estados existentes (com validação)
    this.estados = {};
    
    if (typeof EstadoIntro !== 'undefined') this.estados.INTRO = new EstadoIntro(this);
    if (typeof EstadoMenu !== 'undefined') this.estados.MENU = new EstadoMenu();
    if (typeof EstadoConfiguracoes !== 'undefined') this.estados.CONFIGURACOES = new EstadoConfiguracoes(this);
    if (typeof EstadoSelecaoPersonagem !== 'undefined') this.estados.SELECAO_PERSONAGEM = new EstadoSelecaoPersonagem(this);
    if (typeof EstadoRecordes !== 'undefined') this.estados.RECORDES = new EstadoRecordes(this);
    if (typeof EstadoLobby !== 'undefined') this.estados.LOBBY = new EstadoLobby(this);
    if (typeof EstadoJogando !== 'undefined') this.estados.JOGANDO = new EstadoJogando(this);
    if (typeof EstadoPuzzle !== 'undefined') this.estados.PUZZLE = new EstadoPuzzle(this);
    if (typeof EstadoPausado !== 'undefined') this.estados.PAUSADO = new EstadoPausado(this);
    if (typeof EstadoFimDeJogo !== 'undefined') this.estados.FIM_DE_JOGO = new EstadoFimDeJogo(this);
    
    // Inicializar estado atual
    if (this.estados[this.estadoAtual]?.entrar) {
      this.estados[this.estadoAtual].entrar();
    }
  }

  mudarEstado(novoEstado) {
    if (this.estados[novoEstado]) {
      this.estadoAnterior = this.estadoAtual;
      this.estadoAtual = novoEstado;
      if (this.estados[novoEstado]?.entrar) {
        this.estados[novoEstado].entrar();
      }
    } else {
      console.warn(`Estado "${novoEstado}" não encontrado.`);
    }
  }

  atualizar() {
    this.estados[this.estadoAtual]?.atualizar?.();
  }

  desenhar() {
    this.estados[this.estadoAtual]?.desenhar?.();
  }

  aoPressionarTecla() {
    this.estados[this.estadoAtual]?.aoPressionarTecla?.();
  }

  aoClicarMouse() {
    this.estados[this.estadoAtual]?.aoClicarMouse?.();
  }

  obterEstadoAtual() {
    return this.estadoAtual;
  }

  obterEstadoAnterior() {
    return this.estadoAnterior;
  }
}

// Alias para compatibilidade
window.GerenciadorEstadoJogo = GerenciadorEstados;