// ===========================================
// SISTEMA DE ELEMENTOS AMBIENTAIS DINÂMICOS
// ===========================================

class IntegracaoAmbiental {
  constructor() {
    this.gruposNivel = {
      1: { nome: "Entrada", elementos: [] },
      2: { nome: "Corredor", elementos: [] },
      3: { nome: "Câmara", elementos: [] },
      4: { nome: "Fortaleza", elementos: [] },
      5: { nome: "Torre", elementos: [] }
    };
  }
  
  inicializarElementosAmbientais(nivel) {
    // Limpar elementos anteriores
    gerenciadorAmbiental.elementos = [];
    gerenciadorAmbiental.obstaculos = [];
    gerenciadorAmbiental.zonasPerigo = [];
    gerenciadorAmbiental.teletransportadores = [];
    
    // lógica de seleção de grupo por nível
    const grupoNivel = Math.ceil(nivel / 10);
    switch(grupoNivel) {
      case 1: this.criarNivelEntrada(nivel); break;
      case 2: this.criarNivelCorredor(nivel); break;
      case 3: this.criarNivelCamara(nivel); break;
      case 4: this.criarNivelFortaleza(nivel); break;
      case 5: this.criarNivelTorre(nivel); break;
      default: this.criarNivelMisto(nivel); break;
    }
  }
  
  criarNivelEntrada(nivel) {
    // Entrada com caixas e barris básicos
    const qtdCaixas = 3 + Math.floor(nivel / 3);
    const qtdBarris = 2 + Math.floor(nivel / 4);
    
    // Caixas espalhadas
    for (let i = 0; i < qtdCaixas; i++) {
      const x = 100 + Math.random() * (CONFIG.MAPA.LARGURA - 200);
      const y = 100 + Math.random() * (CONFIG.MAPA.ALTURA - 200);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'caixa'));
    }
    
    // Barris normais
    for (let i = 0; i < qtdBarris; i++) {
      const x = 150 + Math.random() * (CONFIG.MAPA.LARGURA - 300);
      const y = 150 + Math.random() * (CONFIG.MAPA.ALTURA - 300);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril'));
    }
    
    // Adicionar algumas zonas de perigo básicas
    if (nivel >= 5 && gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento) {
      gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(400, 400, 'lava'));
    }
  }
  
  criarNivelCorredor(nivel) {
    // Corredor com mais obstáculos e perigos
    const qtdBarris = 4 + Math.floor(nivel / 2);
    const qtdExplosivos = 1 + Math.floor(nivel / 5);
    
    // Barris explosivos
    for (let i = 0; i < qtdExplosivos; i++) {
      const x = 200 + Math.random() * (CONFIG.MAPA.LARGURA - 400);
      const y = 200 + Math.random() * (CONFIG.MAPA.ALTURA - 400);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril_explosivo'));
    }
    
    // Barris normais
    for (let i = 0; i < qtdBarris; i++) {
      const x = 150 + Math.random() * (CONFIG.MAPA.LARGURA - 300);
      const y = 150 + Math.random() * (CONFIG.MAPA.ALTURA - 300);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril'));
    }
    
    // Zonas de perigo
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(300, 300, 'lava'));
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(700, 500, 'espinhos'));
  }
  
  criarNivelCamara(nivel) {
    // Câmara com teletransportadores e perigos avançados
    const qtdCaixas = 2 + Math.floor(nivel / 3);
    const qtdBarris = 3 + Math.floor(nivel / 4);
    
    // Caixas
    for (let i = 0; i < qtdCaixas; i++) {
      const x = 100 + Math.random() * (CONFIG.MAPA.LARGURA - 200);
      const y = 100 + Math.random() * (CONFIG.MAPA.ALTURA - 200);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'caixa'));
    }
    
    // Barris
    for (let i = 0; i < qtdBarris; i++) {
      const x = 150 + Math.random() * (CONFIG.MAPA.LARGURA - 300);
      const y = 150 + Math.random() * (CONFIG.MAPA.ALTURA - 300);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril'));
    }
    
    // Teletransportadores
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new Teletransportador(200, 200, 800, 600));
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new Teletransportador(800, 200, 200, 600));
    
    // Zonas de perigo avançadas
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(400, 400, 'lava'));
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(600, 300, 'espinhos'));
  }
  
  criarNivelFortaleza(nivel) {
    // Fortaleza com muitos obstáculos e perigos
    const qtdCaixas = 4 + Math.floor(nivel / 2);
    const qtdExplosivos = 2 + Math.floor(nivel / 3);
    
    // Caixas
    for (let i = 0; i < qtdCaixas; i++) {
      const x = 100 + Math.random() * (CONFIG.MAPA.LARGURA - 200);
      const y = 100 + Math.random() * (CONFIG.MAPA.ALTURA - 200);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'caixa'));
    }
    
    // Barris explosivos
    for (let i = 0; i < qtdExplosivos; i++) {
      const x = 200 + Math.random() * (CONFIG.MAPA.LARGURA - 400);
      const y = 200 + Math.random() * (CONFIG.MAPA.ALTURA - 400);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril_explosivo'));
    }
    
    // Zonas de perigo
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(300, 300, 'lava'));
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(500, 400, 'espinhos'));
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(700, 500, 'lava'));
  }
  
  criarNivelTorre(nivel) {
    // Torre com elementos máximos
    const qtdCaixas = 5 + Math.floor(nivel / 2);
    const qtdBarris = 3 + Math.floor(nivel / 3);
    const qtdExplosivos = 2 + Math.floor(nivel / 4);
    
    // Caixas
    for (let i = 0; i < qtdCaixas; i++) {
      const x = 100 + Math.random() * (CONFIG.MAPA.LARGURA - 200);
      const y = 100 + Math.random() * (CONFIG.MAPA.ALTURA - 200);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'caixa'));
    }
    
    // Barris
    for (let i = 0; i < qtdBarris; i++) {
      const x = 150 + Math.random() * (CONFIG.MAPA.LARGURA - 300);
      const y = 150 + Math.random() * (CONFIG.MAPA.ALTURA - 300);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril'));
    }
    
    // Barris explosivos
    for (let i = 0; i < qtdExplosivos; i++) {
      const x = 200 + Math.random() * (CONFIG.MAPA.LARGURA - 400);
      const y = 200 + Math.random() * (CONFIG.MAPA.ALTURA - 400);
      gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril_explosivo'));
    }
    
    // Teletransportadores
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new Teletransportador(300, 300, 700, 500));
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new Teletransportador(700, 300, 300, 500));
    
    // Zonas de perigo
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(400, 400, 'lava'));
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(600, 300, 'espinhos'));
    gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(800, 400, 'lava'));
  }
  
  criarNivelMisto(nivel) {
    // Mistura aleatória de todos os elementos
    const totalElementos = 8 + Math.floor(nivel / 5);
    
    for (let i = 0; i < totalElementos; i++) {
      const x = 100 + Math.random() * (CONFIG.MAPA.LARGURA - 200);
      const y = 100 + Math.random() * (CONFIG.MAPA.ALTURA - 200);
      
      const tipo = Math.floor(Math.random() * 4);
      switch(tipo) {
        case 0:
          gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'caixa'));
          break;
        case 1:
          gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril'));
          break;
        case 2:
          gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ObstaculoDestrutivel(x, y, 'barril_explosivo'));
          break;
        case 3:
          const tiposPerigo = ['lava', 'espinhos'];
          const tipoPerigo = tiposPerigo[Math.floor(Math.random() * tiposPerigo.length)];
          gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento && gerenciadorAmbiental.adicionarElemento(new ZonaPerigo(x, y, tipoPerigo));
          break;
      }
    }
    
    // Adicionar teletransportadores em níveis altos
    if (nivel > 30 && gerenciadorAmbiental && gerenciadorAmbiental.adicionarElemento) {
      gerenciadorAmbiental.adicionarElemento(new Teletransportador(200, 200, 800, 600));
      gerenciadorAmbiental.adicionarElemento(new Teletransportador(800, 200, 200, 600));
    }
  }
}

// Instância global (compatível com código antigo que espera integracaoAmbiental)
window.integracaoAmbiental = window.integracaoAmbiental || new IntegracaoAmbiental();
