// Sistema de Dificuldade Adaptativa
class DificuldadeAdaptativa {
  constructor() {
    this.nivelDificuldade = 1;
    this.desempenhoJogador = {
      pontuacao: 0,
      mortes: 0,
      tempoVivo: 0,
      armasDesbloqueadas: 0,
      upgradesComprados: 0
    };
    this.limitesDificuldade = {
      facil: 0.3,
      medio: 0.6,
      dificil: 0.8,
      extremo: 1.0
    };
    this.taxaSpawnInimigo = 1.0;
    this.forcaInimigo = 1.0;
    this.dificuldadeChefe = 1.0;
    this.taxaPerigoAmbiental = 1.0;
  }

  atualizarDesempenhoJogador(pontuacao, mortes, tempoVivo, armasDesbloqueadas, upgradesComprados) {
    this.desempenhoJogador = {
      pontuacao,
      mortes,
      tempoVivo,
      armasDesbloqueadas,
      upgradesComprados
    };
    this.calcularDificuldade();
  }

  calcularDificuldade() {
    const pontuacaoDesempenho = this.calcularPontuacaoDesempenho();
    this.nivelDificuldade = Math.max(1, Math.min(10, Math.floor(pontuacaoDesempenho / 10) + 1));
    // Ajusta parâmetros do jogo conforme dificuldade
    this.taxaSpawnInimigo = 0.5 + (this.nivelDificuldade * 0.1);
    this.forcaInimigo = 0.8 + (this.nivelDificuldade * 0.15);
    this.dificuldadeChefe = 0.7 + (this.nivelDificuldade * 0.2);
    this.taxaPerigoAmbiental = 0.6 + (this.nivelDificuldade * 0.12);
  }

  calcularPontuacaoDesempenho() {
    const pontuacao = this.desempenhoJogador.pontuacao;
    const mortes = this.desempenhoJogador.mortes;
    const tempoVivo = this.desempenhoJogador.tempoVivo;
    const armasDesbloqueadas = this.desempenhoJogador.armasDesbloqueadas;
    const upgradesComprados = this.desempenhoJogador.upgradesComprados;
    return (pontuacao * 0.4) + (tempoVivo * 0.3) + (armasDesbloqueadas * 0.2) + (upgradesComprados * 0.1) - (mortes * 10);
  }

  obterMultiplicadoresDificuldade() {
    return {
      taxaSpawnInimigo: this.taxaSpawnInimigo,
      forcaInimigo: this.forcaInimigo,
      dificuldadeChefe: this.dificuldadeChefe,
      taxaPerigoAmbiental: this.taxaPerigoAmbiental
    };
  }
}

// Inicializa o sistema de dificuldade adaptativa
const dificuldadeAdaptativa = new DificuldadeAdaptativa();
dificuldadeAdaptativa.obterMultiplicadorDificuldade = function() {
  return { taxaSpawnInimigo: 1 }; // exemplo
};
window.dificuldadeAdaptativa = dificuldadeAdaptativa; // se for global