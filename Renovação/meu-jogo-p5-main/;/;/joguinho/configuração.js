// ===========================================
// CONFIGURAÇÕES CENTRALIZADAS DO JOGO
// ===========================================

window.CONFIG = {
  // Configurações do Canvas
  CANVAS: {
    LARGURA: 1600,
    ALTURA: 900
  },

  // Configurações do Mapa
  MAPA: {
    LARGURA: 2000,
    ALTURA: 2000,
    TAMANHO_GRADE: 50,
    COR_FUNDO: [30, 120, 30],
    COR_GRADE: [50]
  },

  // Configurações do Jogador
  JOGADOR: {
    TAMANHO: 30,
    VELOCIDADE: 3,
    VIDA_MAXIMA: 5,
    COOLDOWN_TIRO: 300, // ms
    TEMPO_INVENCIVEL: 1000, // ms
    COR: [0, 200, 255],
    // Sistema de Dash
    DASH: {
      DISTANCIA: 120,        // Distância do dash
      COOLDOWN: 1400,        // 1.4 segundos de cooldown
      DURACAO: 200,          // Duração do dash em ms
      INVENCIBILIDADE: 300,  // I-frames durante o dash
      PARTICULAS_RASTRO: 8,  // Número de partículas no rastro
      MULTIPLICADOR_VELOCIDADE: 4 // Multiplicador de velocidade durante dash
    }
  },

  // Configurações dos Inimigos
  INIMIGO: {
    NORMAL: {
      TAMANHO: 30,
      VELOCIDADE: 2,
      VIDA: 1,
      COR: [255, 0, 0]
    },
    RAPIDO: {
      TAMANHO: 20,
      VELOCIDADE: 3,
      VIDA: 1,
      COR: [255, 100, 0]
    },
    CHEFE: {
      TAMANHO: 60,
      VELOCIDADE: 1,
      VIDA: 30,
      COR: [150, 0, 150],
      COOLDOWN_TIRO: 1000, // ms
      ARMADURA: 0.5, // reduz 50% do dano recebido
      DISTANCIA_MINIMA_SPAWN: 400 // distância mínima do jogador ao spawnar
    },
    ATIRADOR: {
      TAMANHO: 35,
      VELOCIDADE: 1,
      VIDA: 1,
      COR: [150, 0, 0],
      ALCANCE_TIRO: 400,
      COOLDOWN_TIRO: 2000,
      VELOCIDADE_PROJETIL: 12,
      PRECISAO: 0.95
    },
    TANQUE: {
      TAMANHO: 50,
      VELOCIDADE: 0.8,
      VIDA: 6,
      COR: [100, 100, 100],
      ARMADURA: 0.25 // Reduz dano recebido
    },
    ENXAME: {
      TAMANHO: 15,
      VELOCIDADE: 3.5,
      VIDA: 1,
      COR: [255, 255, 0],
      QUANTIDADE_SPAWN: 4 // Quantos spawnam juntos
    },
    TELETRANSPORTADOR: {
      TAMANHO: 25,
      VELOCIDADE: 2.5,
      VIDA: 1,
      COR: [128, 0, 255],
      COOLDOWN_TELETRANSPORTE: 3000,
      ALCANCE_TELETRANSPORTE: 200,
      COR_PARTICULA: [200, 100, 255]
    },
    BARRA_VIDA: {
      LARGURA_OFFSET: 10,
      ALTURA: 5,
      Y_OFFSET: 10,
      COR: [0, 200, 0]
    }
  },

  // Configurações dos Projéteis
  PROJETIL: {
    JOGADOR: {
      TAMANHO: 10,
      VELOCIDADE: 8,
      COR: [255, 255, 0]
    },
    INIMIGO: {
      TAMANHO: 8,
      VELOCIDADE: 5,
      COR: [255, 0, 255]
    }
  },

  // Configurações do Sistema de Armas
  ARMAS: {
    RIFLE: {
      NOME: 'RIFLE',
      COOLDOWN: 300,
      QUANTIDADE_PROJETIL: 1,
      ANGULO_DISPERSAO: 0,
      VELOCIDADE_PROJETIL: 8,
      TAMANHO_PROJETIL: 10,
      COR: [255, 255, 0],
      DANO: 18
    },
    ESPINGARDA: {
      NOME: 'ESPINGARDA',
      COOLDOWN: 600,
      QUANTIDADE_PROJETIL: 5,
      ANGULO_DISPERSAO: 30, // graus
      VELOCIDADE_PROJETIL: 7,
      TAMANHO_PROJETIL: 8,
      COR: [255, 150, 0],
      DANO: 8
    },
    METRALHADORA: {
      NOME: 'METRALHADORA',
      COOLDOWN: 100,
      QUANTIDADE_PROJETIL: 1,
      ANGULO_DISPERSAO: 5, // pequeno spread para realismo
      VELOCIDADE_PROJETIL: 9,
      TAMANHO_PROJETIL: 6,
      COR: [255, 0, 0],
      DANO: 5.5
    },
    LASER: {
      NOME: 'LASER',
      COOLDOWN: 50,
      COMPRIMENTO_FEIXE: 300,
      LARGURA_FEIXE: 4,
      COR: [0, 255, 255],
      DANO: 10
    },
    // ============================
    // Joseph: Armas Principais
    // ============================
    PICARETA_ENFERRUJADA: {
      NOME: 'PICARETA_ENFERRUJADA',
      COOLDOWN: 250,
      ALCANCE_CORPO: 55,
      ARCO_CORPO_GRAUS: 70,
      COR: [200, 180, 120],
      DANO: 12
    },
    LANTERNA_MINERACAO: {
      NOME: 'LANTERNA_MINERACAO',
      COOLDOWN: 700,
      ANGULO_FEIXE_GRAUS: 35,
      ALCANCE_FEIXE: 220,
      DURACAO_CEGUEIRA_MS: 2500,
      COR: [255, 255, 180],
      DANO: 0
    },
    PISTOLA_SINALIZACAO: {
      NOME: 'PISTOLA_SINALIZACAO',
      COOLDOWN: 400,
      VELOCIDADE_PROJETIL: 8,
      TAMANHO_PROJETIL: 9,
      COR: [255, 120, 60],
      DANO: 9,
      CHANCE_QUEIMAR: 0.35,
      DPS_QUEIMAR: 2,
      TEMPO_QUEIMAR_MS: 3000
    },
    CARREGADOR_PLASMA: {
      NOME: 'CARREGADOR_PLASMA',
      COOLDOWN: 500,
      VELOCIDADE_PROJETIL: 6,
      TAMANHO_PROJETIL: 10,
      COR: [120, 220, 255],
      DANO: 14,
      FORCA_PERSEGUIR: 0.08
    }
  },

  // Configurações das Partículas
  PARTICULA: {
    TAMANHO_MIN: 2,
    TAMANHO_MAX: 5,
    VELOCIDADE_MIN: -2,
    VELOCIDADE_MAX: 2,
    TEMPO_VIDA: 60,
    COR: [255, 150, 0],
    QUANTIDADE_EXPLOSAO: 8
  },

  // Configurações dos Power-ups
  POWERUP: {
    TAMANHO: 20,
    VIDA: {
      COR: [0, 255, 0],
      QUANTIDADE_CURA: 2
    },
    VELOCIDADE: {
      COR: [255, 255, 0],
      QUANTIDADE_BOOST: 1
    }
  },

  // Configurações das Moedas
  MOEDA: {
    TAMANHO: 15,
    COR: [255, 215, 0],
    VALOR: 5
  },

  // Configurações do Portal
  PORTAL: {
    TAMANHO: 40,
    DISTANCIA_MINIMA_JOGADOR: 200,
    COR_EXTERNA: [120, 0, 255, 220],
    COR_INTERNA: [200, 200, 255, 180],
    COR_BORDA: [255, 255, 0],
    ESPESSURA_BORDA: 4,
    DELAY_ATIVACAO: 1000 // ms
  },

  // Configurações da Câmera
  CAMERA: {
    SUAVIZACAO: 0.1
  },

  // Configurações do HUD
  HUD: {
    BARRA_VIDA: {
      LARGURA: 150,
      ALTURA: 20,
      X: 10,
      Y: 10,
      COR_FUNDO: [100],
      COR_FRONTAL: [0, 200, 0],
      BORDA_RAIO: 5
    },
    TEXTO: {
      TAMANHO: 16,
      COR: [255],
      ALTURA_LINHA: 20,
      X: 10,
      Y_INICIAL: 35
    }
  },

  // Configurações do Minimapa
  MINIMAPA: {
    ESCALA: 0.08,
    MARGEM: 20,
    COR_FUNDO: [50, 100],
    BORDA_RAIO: 5,
    COR_JOGADOR: [0, 200, 255],
    COR_INIMIGO: [255, 0, 0],
    COR_PORTAL: [120, 0, 255],
    COR_POWERUP: [0, 255, 0],
    COR_MOEDA: [255, 215, 0]
  },

  // Configurações de Gameplay
  GAMEPLAY: {
    PONTOS_POR_INIMIGO: 10,
    DELAY_TRANSICAO_PORTAL: 300, // ms
    INTERVALO_NIVEL_CHEFE: 5, // A cada 5 níveis
    DISTANCIA_MINIMA_SPAWN: 120,
    CHANCE_SPAWN_POWERUP: 0.5,
    MOEDAS_POR_NIVEL: 3
  },

  // Configurações de Game Over
  GAME_OVER: {
    ALPHA_FUNDO: 150,
    TITULO: {
      TEXTO: "GAME OVER",
      TAMANHO: 48,
      COR: [255, 0, 0]
    },
    INFO: {
      TAMANHO: 24,
      COR: [255],
      ESPACAMENTO_LINHA: 40
    },
    TEXTO_REINICIAR: "Pressione R para reiniciar"
  },

  // Sistema de Upgrades e Loja
  UPGRADES: {
    // Upgrade de Vida
    SAUDE: {
      NOME: "Vida Extra",
      DESCRICAO: "Aumenta vida máxima em +1",
      PRECO_BASE: 50,
      MULTIPLICADOR_PRECO: 1.5,
      NIVEL_MAXIMO: 10,
      COR_ICONE: [255, 100, 100]
    },
    
    // Upgrade de Velocidade
    VELOCIDADE: {
      NOME: "Velocidade",
      DESCRICAO: "Aumenta velocidade em +0.5",
      PRECO_BASE: 30,
      MULTIPLICADOR_PRECO: 1.4,
      NIVEL_MAXIMO: 8,
      COR_ICONE: [100, 255, 100]
    },
    
    // Upgrade de Dano
    DANO: {
      NOME: "Dano",
      DESCRICAO: "Aumenta dano dos projéteis",
      PRECO_BASE: 40,
      MULTIPLICADOR_PRECO: 1.6,
      NIVEL_MAXIMO: 15,
      COR_ICONE: [255, 255, 100]
    },
    
    // Upgrade de Cadência
    CADENCIA: {
      NOME: "Cadência",
      DESCRICAO: "Reduz cooldown de tiro",
      PRECO_BASE: 35,
      MULTIPLICADOR_PRECO: 1.5,
      NIVEL_MAXIMO: 12,
      COR_ICONE: [255, 150, 0]
    },
    
    // Upgrade de Dash
    TEMPO_RECARGA: {
      NOME: "Dash Rápido",
      DESCRICAO: "Reduz cooldown do dash",
      PRECO_BASE: 60,
      MULTIPLICADOR_PRECO: 1.8,
      NIVEL_MAXIMO: 5,
      COR_ICONE: [100, 200, 255]
    },
    
    // Upgrade de Regeneração
    REGENERACAO: {
      NOME: "Regeneração",
      DESCRICAO: "Regenera 1 vida a cada 10s",
      PRECO_BASE: 100,
      MULTIPLICADOR_PRECO: 2.0,
      NIVEL_MAXIMO: 3,
      COR_ICONE: [255, 100, 255]
    }
  },

  // Configurações da Loja
  LOJA: {
    COR_FUNDO: [20, 20, 40, 200],
    LARGURA_ITEM: 180,
    ALTURA_ITEM: 120,
    ITENS_POR_LINHA: 3,
    PADDING: 20,
    COR_TITULO: [255, 255, 100],
    COR_TEXTO: [255, 255, 255],
    COR_PRECO: [100, 255, 100],
    COR_SEM_DINHEIRO: [255, 100, 100],
    COR_POSSE: [150, 150, 150]
  },

  // Perks por Facção (parametrizados)
  PERKS: {
    AUTOMATONS: {
      vidaEscudo: 30,                 // escudo_cristalino
      multiplicadorCooldownTiro: 0.85,    // precision_tiro (menor é mais rápido)
      multiplicadorDano: 1.10,           // leve aumento
      explosaoMorte: { raio: 0, dano: 0 } // sem explosão
    },
    CORRUPTED_FLESH: {
      vidaEscudo: 0,
      multiplicadorCooldownTiro: 1.00,
      multiplicadorDano: 1.00,
      explosaoMorte: { raio: 90, dano: 2 } // explosão na morte
    },
    LOST_EXCAVATORS: {
      vidaEscudo: 20,
      multiplicadorCooldownTiro: 0.90,    // precisão melhor
      multiplicadorDano: 1.20,           // tiro perfurante/dano maior
      explosaoMorte: { raio: 0, dano: 0 }
    }
  },

  // Catálogos orientados por Lore (data-driven)
  LORE: {
    // Facções principais
    FACCOES: {
      AUTOMATONS: {
        chave: 'AUTOMATONS',
        nome: 'Autômatos do Núcleo',
        descricao: 'Máquinas deixadas pelos construtores originais; guardiões implacáveis do complexo.',
        cor: [120, 180, 255],
        corOlhos: { calmo: [80, 160, 255], alerta: [255, 80, 80] },
        estilo: ['disciplina', 'patrulha', 'ataques coordenados'],
        perks: ['resist_fogo', 'precision_tiro'],
        biomasFavoritos: ['MECHANICAL_CHAMBERS', 'MINE_HEART']
      },
      CORRUPTED_FLESH: {
        chave: 'CORRUPTED_FLESH',
        nome: 'A Carne Corrompida',
        descricao: 'Vida local e mineradores-animais tocados por energia alienígena.',
        cor: [220, 80, 100],
        brilho: [255, 60, 120],
        estilo: ['selvageria', 'ondas_desordenadas'],
        perks: ['explosao_na_morte', 'sangramento'],
        biomasFavoritos: ['ORGANIC_CAVERNS', 'MINE_HEART']
      },
      LOST_EXCAVATORS: {
        chave: 'LOST_EXCAVATORS',
        nome: 'Ordem dos Escavadores Perdidos',
        descricao: 'Mineradores dominados pela influência alienígena.',
        cor: [200, 200, 240],
        brilhoOlhos: [160, 220, 255],
        estilo: ['híbrido_tecno_alien', 'armas_mineracao'],
        perks: ['tiro_perfuração', 'escudo_cristalino'],
        biomasFavoritos: ['CRYSTAL_ABYSS', 'MINE_HEART']
      }
    },

    // Biomas / Temas por profundidade
    BIOMAS: {
      GALERIAS_SUPERFICIAIS: {
        chave: 'SURFACE_GALLERIES',
        nome: 'Galerias Superficiais',
        paleta: {
          chao: [70, 60, 50], parede: [40, 35, 32], destaque: [200, 160, 90], luz: [255, 180, 100]
        },
        props: ['vigas_madeira', 'tochas', 'equip_abandonado'],
        perigos: ['desmoronamento_leve'],
        faccoes: ['AUTOMATONS', 'CORRUPTED_FLESH'],
        notasEncontro: 'Início tenso; primeiros drones enferrujados, arbustos mutantes e topeiras.'
      },
      SALAS_MECANICAS: {
        chave: 'MECHANICAL_CHAMBERS',
        nome: 'Salas Mecânicas',
        paleta: {
          chao: [50, 60, 70], parede: [30, 35, 40], destaque: [200, 110, 40], luz: [255, 150, 60]
        },
        props: ['engrenagens', 'tubos', 'dutos_vapor'],
        perigos: ['chama_periodica', 'vapor_quente'],
        faccoes: ['AUTOMATONS'],
        notasEncontro: 'Fábrica viva; autômatos, torretas e golems de ferro.'
      },
      CAVERNAS_ORGANICAS: {
        chave: 'ORGANIC_CAVERNS',
        nome: 'Cavernas Orgânicas',
        paleta: {
          chao: [90, 40, 50], parede: [60, 25, 35], destaque: [200, 60, 80], luz: [255, 80, 120]
        },
        props: ['paredes_pulsantes', 'raízes_alien', 'cristais_vermelhos'],
        perigos: ['gases_tóxicos', 'limo_escorregadio'],
        faccoes: ['CORRUPTED_FLESH'],
        notasEncontro: 'Biológico grotesco; larvas explosivas, aberrações e tentáculos.'
      },
      ABISMO_CRISTALINO: {
        chave: 'CRYSTAL_ABYSS',
        nome: 'Abismo Cristalino',
        paleta: {
          chao: [30, 30, 60], parede: [20, 20, 40], destaque: [120, 160, 255], luz: [160, 140, 255]
        },
        props: ['cristais_azuis', 'cristais_púrpura', 'refrações_luz'],
        perigos: ['estilhaços_cristal', 'pulso_energia'],
        faccoes: ['LOST_EXCAVATORS'],
        notasEncontro: 'Belo e letal; espectros energéticos e criaturas de cristal.'
      },
      CORACAO_MINA: {
        chave: 'MINE_HEART',
        nome: 'Coração da Mina',
        paleta: {
          chao: [60, 30, 60], parede: [40, 20, 40], destaque: [150, 80, 200], luz: [255, 120, 160]
        },
        props: ['carne_mecânica', 'veias_cristalinas', 'núcleos_expostos'],
        perigos: ['corrupcao_empilhada', 'escudos_cristalinos'],
        faccoes: ['AUTOMATONS', 'CORRUPTED_FLESH', 'LOST_EXCAVATORS'],
        notasEncontro: 'Fusão total; elites híbridas protegem o Núcleo Vivo.'
      }
    },

    // Arquetipos de inimigos por papel; as facções geram variantes
    ARQUETIPOS_INIMIGO: {
      COMUM: [
        { chave: 'DRONE_RUST', nome: 'Drone Enferrujado', papel: 'distancia', atributosBase: { vida: 1, velocidade: 2.2 }, tags: ['metal'] },
        { chave: 'MOLE_MUTANT', nome: 'Topeira Mutante', papel: 'corpo', atributosBase: { vida: 2, velocidade: 3.3 }, tags: ['terrestre'] },
        { chave: 'THORN_BUSH', nome: 'Arbusto Espinhoso', papel: 'distancia', atributosBase: { vida: 1, velocidade: 1.8 }, tags: ['natureza'] }
      ],
      INTERMEDIARIO: [
        { chave: 'STONE_BEAST', nome: 'Monstro de Pedra', papel: 'bruto', atributosBase: { vida: 6, velocidade: 1.2 }, tags: ['rocha'] },
        { chave: 'CORR_MINER', nome: 'Minerador Corrompido', papel: 'escaramucador', atributosBase: { vida: 4, velocidade: 2.2 }, tags: ['humanoide'] },
        { chave: 'IRON_GOLEM', nome: 'Golem de Ferro', papel: 'artilharia', atributosBase: { vida: 8, velocidade: 0.9 }, tags: ['metal'] }
      ],
      ELITE: [
        { chave: 'FLESH_COLOSSUS', nome: 'Colosso Orgânico', papel: 'juggernaut', atributosBase: { vida: 16, velocidade: 0.8 }, tags: ['bio'] },
        { chave: 'AUTO_TITAN', nome: 'Autômato Gigante', papel: 'guardiao', atributosBase: { vida: 14, velocidade: 1.0 }, tags: ['metal'] },
        { chave: 'ENERGY_SPECTER', nome: 'Espectro de Energia', papel: 'assassino', atributosBase: { vida: 5, velocidade: 2.8 }, tags: ['etereo'] }
      ]
    },

    // Chefes por bioma (descrições resumidas)
    CHEFES: {
      GUARDIAO_FORJA: {
        chave: 'FORGE_WARDEN', bioma: 'SALAS_MECANICAS', nome: 'Guardião da Forja',
        estilo: ['rajadas_fogo', 'mísseis'],
        notas: 'Colosso mecânico, projéteis explosivos e chamas de zona.'
      },
      ENTIDADE_CAVERNA: {
        chave: 'CAVE_ENTITY', bioma: 'CAVERNAS_ORGANICAS', nome: 'Ser das Cavernas',
        estilo: ['tentáculos', 'gritos_atordoantes'],
        notas: 'Criatura massiva; controle de área e dano corpo-a-corpo.'
      },
      ESCAVADOR_PERDIDO: {
        chave: 'LOST_EXCAVATOR', bioma: 'ABISMO_CRISTALINO', nome: 'O Escavador Perdido',
        estilo: ['armas_mina', 'poder_alienígena'],
        notas: 'Humano totalmente corrompido; usa ferramentas e energia.'
      },
      NUCLEO_VIVO: {
        chave: 'LIVING_CORE', bioma: 'CORACAO_MINA', nome: 'O Núcleo Vivo',
        estilo: ['corrupcao_progresiva', 'escudos_cristalinos'],
        notas: 'Massa híbrida máquina+organismo; chefe final.'
      }
    },

    // Ordem sugerida de progressão por profundidade
    PROGRESSAO: [
      'GALERIAS_SUPERFICIAIS',
      'SALAS_MECANICAS',
      'CAVERNAS_ORGANICAS',
      'ABISMO_CRISTALINO',
      'CORACAO_MINA'
    ]
  }
};

// Função helper para acessar cores com facilidade
CONFIG.obterCor = function(arrayCor, alpha = 255) {
  if (arrayCor.length === 3) {
    return [...arrayCor, alpha];
  }
  return arrayCor;
};

// Função helper para calcular posições do HUD
CONFIG.obterPosicaoHUD = function(indiceLinha) {
  return {
    x: CONFIG.HUD.TEXTO.X,
    y: CONFIG.HUD.TEXTO.Y_INICIAL + (indiceLinha * CONFIG.HUD.TEXTO.ALTURA_LINHA)
  };
};