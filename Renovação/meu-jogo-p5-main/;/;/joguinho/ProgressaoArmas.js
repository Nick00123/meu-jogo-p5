// Sistema de Progressão de Armas
class ProgressaoArmas {
  constructor() {
    this.armasDesbloqueadas = ['LASER']; // Joseph: arma inicial
    // Ordem de desbloqueio (1 por chefão)
    this.ordemDesbloqueio = ['LANTERNA_MINERACAO', 'PISTOLA_SINALIZACAO', 'CARREGADOR_PLASMA'];

    // Mantido para uso futuro, não utilizado no fluxo atual
    this.desbloqueiosArmas = {
      'LANTERNA_MINERACAO': { nivel: 2, chefeDerrotado: true },
      'PISTOLA_SINALIZACAO': { nivel: 3, chefeDerrotado: true },
      'CARREGADOR_PLASMA': { nivel: 4, chefeDerrotado: true }
    };
    
    this.melhoriasArmas = {
      'PICARETA_ENFERRUJADA': { dano: 0, cadencia: 0, capacidadeMunicao: 0, perfurante: 0 },
      'LANTERNA_MINERACAO': { dano: 0, dispersao: 0, projeteis: 0, recargaRapida: 0 },
      'PISTOLA_SINALIZACAO': { dano: 0, precisao: 0, superaquecimento: 0, estabilidade: 0 },
      'CARREGADOR_PLASMA': { dano: 0, larguraRaio: 0, duracao: 0, recarga: 0 },
      'LASER': { dano: 0, precisao: 0, duracao: 0, recarga: 0 }
    };
    
    this.custosMelhoria = {
      dano: 50,
      cadencia: 75,
      capacidadeMunicao: 40,
      perfurante: 100,
      dispersao: 60,
      projeteis: 80,
      recargaRapida: 90,
      precisao: 65,
      superaquecimento: 85,
      estabilidade: 70,
      larguraRaio: 120,
      duracao: 95,
      recarga: 110
    };
  }
  
  // Desbloqueia 1 arma por chefão derrotado a cada intervalo de chefão
  verificarDesbloqueioArmas(nivelAtual, chefeDerrotado = false) {
    if (!chefeDerrotado) return; // só desbloqueia ao derrotar chefão

    const intervalo = (CONFIG && CONFIG.GAMEPLAY && CONFIG.GAMEPLAY.INTERVALO_CHEFE) ? CONFIG.GAMEPLAY.INTERVALO_CHEFE : 5;
    // nivelAtual acabou de ser incrementado em proximoNivel(); o chefe foi no nível anterior
    const acabouDeDerrotarChefe = ((nivelAtual - 1) % intervalo) === 0;
    if (!acabouDeDerrotarChefe) return;

    // Procura a próxima arma ainda bloqueada na ordem
    for (let arma of this.ordemDesbloqueio) {
      if (!this.armasDesbloqueadas.includes(arma)) {
        this.armasDesbloqueadas.push(arma);
        this.mostrarNotificacaoDesbloqueio(arma);
        break;
      }
    }
  }
  
  mostrarNotificacaoDesbloqueio(arma) {
    window.notificacoesChefe.push({
      texto: `Nova arma desbloqueada: ${arma}`,
      x: width/2,
      y: height/2,
      vida: 180,
      cor: [0, 255, 255]
    });
  }
  
  melhorarArma(arma, atributo) {
    if (this.custosMelhoria[atributo] <= totalMoedasObtidas) {
      this.melhoriasArmas[arma][atributo]++;
      totalMoedasObtidas -= this.custosMelhoria[atributo];
      this.custosMelhoria[atributo] = Math.floor(this.custosMelhoria[atributo] * 1.5);
      return true;
    }
    return false;
  }
  
  obterAtributosArma(arma) {
    const atributosBase = CONFIG.ARMAS[arma];
    const melhorias = this.melhoriasArmas[arma];
    
    if (arma === 'LASER') {
      return {
        dano: atributosBase.DANO + (melhorias.dano * 5),
        cooldown: atributosBase.COOLDOWN * (1 - melhorias.recarga * 0.1),
        larguraFeixe: atributosBase.LARGURA_FEIXE + (melhorias.duracao * 0.5),
        comprimentoFeixe: atributosBase.COMPRIMENTO_FEIXE + (melhorias.precisao * 10)
      };
    } else {
      return {
        dano: atributosBase.DANO + (melhorias.dano * 5),
        cadencia: atributosBase.CADENCIA * (1 + melhorias.cadencia * 0.1),
        capacidadeMunicao: atributosBase.CAPACIDADE_MUNICAO + (melhorias.capacidadeMunicao * 10),
        perfurante: melhorias.perfurante,
        dispersao: melhorias.dispersao * 5,
        projeteis: atributosBase.PROJETEIS + melhorias.projeteis,
        recargaRapida: atributosBase.TEMPO_RECARGA * (1 - melhorias.recargaRapida * 0.1),
        precisao: 1 - (melhorias.precisao * 0.05),
        superaquecimento: atributosBase.LIMITE_SUPERAQUECIMENTO + (melhorias.superaquecimento * 20),
        estabilidade: 1 - (melhorias.estabilidade * 0.03),
        larguraRaio: 5 + (melhorias.larguraRaio * 2),
        duracao: atributosBase.DURACAO_RAIO + (melhorias.duracao * 0.5),
        recarga: atributosBase.TEMPO_RECARGA_RAIO * (1 - melhorias.recarga * 0.1)
      };
    }
  }
}

// Inicializa progressão de armas
let progressaoArmas = new ProgressaoArmas();