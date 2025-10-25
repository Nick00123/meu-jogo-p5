// ===========================================
// CONFIGURAÇÃO DE EXECUÇÃO (SELEÇÕES PRÉ-JOGO)
// ===========================================

(function(){
  const PADROES = {
    bioma: 'FLORESTA'
  };

  const BIOMAS = {
    FLORESTA: {
      nome: 'Floresta',
      corFundoMapa: [30, 120, 30]
    },
    DESERTO: {
      nome: 'Deserto',
      corFundoMapa: [180, 160, 80]
    },
    GELIDO: {
      nome: 'Gélido',
      corFundoMapa: [180, 220, 255]
    }
  };

  function carregarConfigExecucao() {
    const bioma = localStorage.getItem('perfil.bioma') || PADROES.bioma;
    return { bioma };
  }

  function salvarConfigExecucao(cfg) {
    if (cfg && cfg.bioma) localStorage.setItem('perfil.bioma', cfg.bioma);
  }

  function aplicarConfigExecucao(cfg) {
    const b = BIOMAS[cfg.bioma] || BIOMAS[PADROES.bioma];
    // Aplicar cor de fundo do mapa
    CONFIG.MAPA.COR_FUNDO = b.corFundoMapa;
  }

  // Expor globalmente
  window.configExecucao = {
    BIOMAS,
    carregarConfigExecucao,
    salvarConfigExecucao,
    aplicarConfigExecucao
  };
})();