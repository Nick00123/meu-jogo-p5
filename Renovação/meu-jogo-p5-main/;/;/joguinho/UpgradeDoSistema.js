// Sistema de Upgrades e Progressão
window.UpgradeSystem = {
  upgrades: {
    SAUDE: 0,
    VELOCIDADE: 0,
    DANO: 0,
    CADENCIA: 0,
    TEMPO_RECARGA: 0,
    REGENERACAO: 0
  },
  
  getVidaMaxima() {
    return CONFIG.JOGADOR.VIDA_MAXIMA + (this.upgrades.SAUDE * 20);
  },
  
  getVelocidadeJogador() {
    return CONFIG.JOGADOR.VELOCIDADE + (this.upgrades.VELOCIDADE * 0.5);
  },
  
  getMultiplicadorDeDano() {
    return 1 + (this.upgrades.DANO * 0.2);
  },
  
  getMultiplicadorDeCadencia() {
    return 1 + (this.upgrades.CADENCIA * 0.15);
  },
  
  getReducaoDeTempoDeRecarga() {
    return this.upgrades.TEMPO_RECARGA * 200;
  },
  
  getTaxaDeRegeneracao() {
    return this.upgrades.REGENERACAO * 0.5;
  },
  
  aplicarUpgrades() {
    if (jogador) {
      jogador.vidaMaxima = this.getVidaMaxima();
      jogador.velocidade = this.getVelocidadeJogador();
    }
  },
  
  handleRegeneracao() {
    if (jogador && this.upgrades.REGENERACAO > 0 && millis() - ultimoTempoRegen > 1000) {
      jogador.vida = min(jogador.vida + this.getTaxaDeRegeneracao(), jogador.vidaMaxima);
      ultimoTempoRegen = millis();
    }
  },
  
  carregarUpgrades() {
    const saved = localStorage.getItem('upgrades');
    if (saved) {
      this.upgrades = JSON.parse(saved);
    }
  },
  
  salvarUpgrades() {
    localStorage.setItem('upgrades', JSON.stringify(this.upgrades));
  },
  
  resetUpgrades() {
    this.upgrades = {
      SAUDE: 0,
      VELOCIDADE: 0,
      DANO: 0,
      CADENCIA: 0,
      TEMPO_RECARGA: 0,
      REGENERACAO: 0
    };
    this.aplicarUpgrades();
    this.salvarUpgrades();
  }
};