const CONFIG = {
  CANVAS: {
    LARGURA: 1600,
    ALTURA: 900,
  },
  MAPA: {
    LARGURA: 2000,
    ALTURA: 2000,
    BACKGROUND_COLOR: [20, 40, 60],
  },
  JOGADOR: {
    TAMANHO: 30,
    COR: [100, 150, 255],
    VELOCIDADE: 3,
    VIDA_MAXIMA: 5,
    TEMPO_INVENCIVEL: 1000, // ms
    DASH: {
      VELOCIDADE: 12,
      DURACAO: 150, // ms
      COOLDOWN: 1500, // ms
    },
  },
  ARMAS: {
    // Arma do Arlen
    CAJADO_CHAMA_ETERNA: {
      NOME: "Cajado da Chama Eterna",
      COOLDOWN: 450,
      QUANTIDADE_PROJETIL: 1,
      VELOCIDADE_PROJETIL: 7,
      DANO: 12,
      COR: [255, 100, 0],
      TAMANHO_PROJETIL: 10,
    },
    // Arma do Kael
    ESPADA_GUARDAO: {
      NOME: "Espada do Guardião",
      COOLDOWN: 300,
      QUANTIDADE_PROJETIL: 3,
      VELOCIDADE_PROJETIL: 8,
      ANGULO_DISPERSAO: 25, // Em graus
      DANO: 8, // Dano por projétil
      COR: [100, 255, 150],
      TAMANHO_PROJETIL: 7,
    },
    // Arma da Lyra
    ARCO_LUNAR: {
      NOME: "Arco Lunar",
      COOLDOWN: 600,
      QUANTIDADE_PROJETIL: 1,
      VELOCIDADE_PROJETIL: 12,
      DANO: 18,
      COR: [200, 180, 255],
      TAMANHO_PROJETIL: 12,
      PERFURANTE: true, // Propriedade especial
    },
    // Arma do Admin
    DECRETO_DIVINO: {
      NOME: "DECRETO DIVINO",
      COOLDOWN: 50, // Cooldown muito baixo para tiro rápido
      QUANTIDADE_PROJETIL: 25, // Muito mais projéteis
      VELOCIDADE_PROJETIL: 20, // Projéteis mais rápidos
      ANGULO_DISPERSAO: 50, // Aumentar a dispersão para cobrir mais área
      DANO: 50, // Dano aumentado
      COR: [255, 215, 0],
      TAMANHO_PROJETIL: 10,
      FORCA_PERSEGUIR: 0.15, // Perseguição um pouco mais forte
      PERFURANTE: true // Adicionar perfuração para o caos
    },
  },
  INIMIGO: {
    BARRA_VIDA: {
      ALTURA: 4,
      OFFSET_Y: 5,
    },
    // Definições básicas de inimigos
    NORMAL: {
      TAMANHO: 30,
      VELOCIDADE: 2,
      VIDA: 20,
      COR: [255, 0, 0],
      DANO: 1,
    },
    RAPIDO: {
      TAMANHO: 20,
      VELOCIDADE: 3.5,
      VIDA: 15,
      COR: [255, 165, 0],
      DANO: 1,
    },
    TANQUE: {
      TAMANHO: 45,
      VELOCIDADE: 1.2,
      VIDA: 50,
      COR: [128, 128, 128],
      DANO: 2,
    },
    ATIRADOR: {
      TAMANHO: 28,
      VELOCIDADE: 1,
      VIDA: 18,
      COR: [0, 0, 255],
      DANO: 1,
      ALCANCE_TIRO: 350,
      COOLDOWN_TIRO: 1500,
    },
    CHEFE: {
      TAMANHO: 60,
      VELOCIDADE: 1.5,
      VIDA: 200,
      COR: [128, 0, 128],
      DANO: 3,
    },
    // Configurações de tipos de inimigos podem ser adicionadas aqui
  },
  PROJETIL: {
    INIMIGO: {
      VELOCIDADE: 4,
      TAMANHO: 8,
      COR: [255, 0, 100],
    },
  },
  PARTICULA: {
    TEMPO_VIDA: 60, // frames
    TAMANHO_MIN: 2,
    TAMANHO_MAX: 5,
  },
  MINIMAPA: {
    ESCALA: 0.1,
    MARGEM: 10,
    BORDA_RAIO: 5,
    COR_FUNDO: [0, 0, 0, 150],
    COR_JOGADOR: [255, 255, 0],
    COR_INIMIGO: [255, 0, 0],
    COR_PORTAL: [0, 255, 255],
  },
  LORE: {
    PROGRESSAO: ["MINA_CRISTALINA", "ABISMO_SOMBRIL"],
    BIOMAS: {
      MINA_CRISTALINA: {
        nome: "Mina Cristalina",
        faccoes: ["DRONE_RUST", "MOLE_MUTANT"],
      },
      ABISMO_SOMBRIL: {
        nome: "Abismo Sombrio",
        faccoes: ["SHADOW_CREEP"],
      },
    },
    FACCOES: {
      DRONE_RUST: {
        nome: "Drones Enferrujados",
        cor: [180, 100, 60],
      },
      MOLE_MUTANT: {
        nome: "Toupeiras Mutantes",
        cor: [100, 150, 100],
      },
      SHADOW_CREEP: {
        nome: "Criaturas Sombrias",
        cor: [80, 40, 120],
      },
    },
  },
  UPGRADES: {
    VIDA_MAXIMA: {
      NOME: "Vitalidade Aumentada",
      DESCRICAO: "Aumenta a vida máxima em 1.",
      CUSTO_BASE: 100,
      FATOR_CUSTO: 1.5,
      MAX_NIVEL: 5,
      COR_ICONE: [255, 80, 80],
    },
    VELOCIDADE_MOVIMENTO: {
      NOME: "Pés Ligeiros",
      DESCRICAO: "Aumenta a velocidade de movimento.",
      CUSTO_BASE: 80,
      FATOR_CUSTO: 1.8,
      MAX_NIVEL: 3,
      COR_ICONE: [80, 255, 80],
    },
    DANO_ARMA: {
      NOME: "Lâminas Afiadas",
      DESCRICAO: "Aumenta o dano de todas as armas.",
      CUSTO_BASE: 150,
      FATOR_CUSTO: 2.0,
      MAX_NIVEL: 4,
      COR_ICONE: [255, 150, 50],
    },
    COLETA_MOEDAS: {
      NOME: "Imã de Tesouros",
      DESCRICAO: "Aumenta o raio de coleta de moedas.",
      CUSTO_BASE: 50,
      FATOR_CUSTO: 1.5,
      MAX_NIVEL: 5,
      COR_ICONE: [255, 215, 0],
    },
  },
};

// Garante que a variável CONFIG esteja disponível globalmente
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}