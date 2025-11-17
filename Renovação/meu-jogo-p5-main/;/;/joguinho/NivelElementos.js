// ===========================================
// CONFIGURAÇÃO DE ELEMENTOS AMBIENTAIS POR NÍVEL
// ===========================================

// Fallbacks para evitar erros se classes não estiverem carregadas
if (typeof window !== 'undefined') {
  if (typeof window.ObstaculoDestrutivel === 'undefined') {
    window.ObstaculoDestrutivel = class ObstaculoDestrutivel {
      constructor(x, y, tipo = 'caixa') { this.x = x; this.y = y; this.tipo = tipo; }
    };
  }
  if (typeof window.ZonaPerigo === 'undefined') {
    window.ZonaPerigo = class ZonaPerigo {
      constructor(x, y, tipo = 'espinhos') { this.x = x; this.y = y; this.tipo = tipo; }
    };
  }
  if (typeof window.Teletransportador === 'undefined') {
    window.Teletransportador = class Teletransportador {
      constructor(x1, y1, x2, y2) { this.x = x1; this.y = y1; this.tx = x2; this.ty = y2; }
    };
  }
  window.gerenciadorAmbiental = window.gerenciadorAmbiental || {
    elementos: [],
    adicionarElemento(e) { this.elementos.push(e); }
  };
}

class ConfiguracaoAmbiental {
  constructor() {
    this.elementos = [];
    this.elementosPorNivel = new Map();
    this.configurarElementosPorNivel();
  }
  
  configurarElementosPorNivel() {
    // Configuração por faixas de nível
    this.elementosPorNivel.set(1, this.criarElementosNivel1());
    this.elementosPorNivel.set(2, this.criarElementosNivel2());
    this.elementosPorNivel.set(3, this.criarElementosNivel3());
    // ... continua para mais níveis
  }
  
  criarElementosNivel1() {
    return [
      new ObstaculoDestrutivel(200, 300, 'caixa'),
      new ObstaculoDestrutivel(400, 200, 'caixa'),
      new ObstaculoDestrutivel(600, 400, 'caixa')
    ];
  }
  
  criarElementosNivel2() {
    return [
      new ObstaculoDestrutivel(300, 250, 'barril'),
      new ZonaPerigo(500, 350, 'lava'),
      new ObstaculoDestrutivel(700, 450, 'barril_explosivo')
    ];
  }
  
  criarElementosNivel3() {
    return [
      new Teletransportador(400, 300, 800, 600),
      new ZonaPerigo(600, 400, 'espinhos'),
      new ObstaculoDestrutivel(250, 500, 'barril')
    ];
  }
  
  obterElementosParaNivel(nivel) {
    const grupoNivel = Math.ceil(nivel / 10);
    return this.elementosPorNivel.get(grupoNivel) || [];
  }
  
  inicializarNivel(nivel) {
    // Limpar elementos anteriores
    gerenciadorAmbiental.elementos = [];
    
    // Adicionar elementos do nível atual
    const elementos = this.obterElementosParaNivel(nivel);
    elementos.forEach(elemento => {
      gerenciadorAmbiental.adicionarElemento(elemento);
    });
  }
}

// Instância global
let configuracaoAmbiental = new ConfiguracaoAmbiental();