// ===========================================
// CONFIGURAÇÕES CENTRALIZADAS DO JOGO
// ===========================================

const CONFIG = {
  // Configurações do Canvas
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600
  },

  // Configurações do Mapa
  MAP: {
    WIDTH: 2000,
    HEIGHT: 2000,
    GRID_SIZE: 50,
    BACKGROUND_COLOR: [30, 120, 30],
    GRID_COLOR: [50]
  },

  // Configurações do Player
  PLAYER: {
    SIZE: 30,
    SPEED: 3,
    MAX_HEALTH: 5,
    SHOOT_COOLDOWN: 300, // ms
    INVINCIBILITY_TIME: 1000, // ms
    COLOR: [0, 200, 255],
    // Sistema de Dash
    DASH: {
      DISTANCE: 120,        // Distância do dash
      COOLDOWN: 2000,       // 2 segundos de cooldown
      DURATION: 200,        // Duração do dash em ms
      INVINCIBILITY: 300,   // I-frames durante o dash
      TRAIL_PARTICLES: 8,   // Número de partículas no rastro
      SPEED_MULTIPLIER: 4   // Multiplicador de velocidade durante dash
    }
  },

  // Configurações dos Inimigos
  ENEMY: {
    NORMAL: {
      SIZE: 30,
      SPEED: 2,
      HEALTH: 1,
      COLOR: [255, 0, 0]
    },
    FAST: {
      SIZE: 20,
      SPEED: 3,
      HEALTH: 1,
      COLOR: [255, 100, 0]
    },
    BOSS: {
      SIZE: 60,
      SPEED: 1,
      HEALTH: 30,
      COLOR: [150, 0, 150],
      SHOOT_COOLDOWN: 1000, // ms
      ARMOR: 0.5, // reduz 50% do dano recebido
      MIN_SPAWN_DISTANCE: 400 // distância mínima do player ao spawnar
    },
    SNIPER: {
      SIZE: 35,
      SPEED: 1,
      HEALTH: 1,
      COLOR: [150, 0, 0],
      SHOOT_RANGE: 400,
      SHOOT_COOLDOWN: 2000,
      PROJECTILE_SPEED: 12,
      ACCURACY: 0.95
    },
    TANK: {
      SIZE: 50,
      SPEED: 0.8,
      HEALTH: 6,
      COLOR: [100, 100, 100],
      ARMOR: 0.25 // Reduz dano recebido
    },
    SWARM: {
      SIZE: 15,
      SPEED: 3.5,
      HEALTH: 1,
      COLOR: [255, 255, 0],
      SPAWN_COUNT: 4 // Quantos spawnam juntos
    },
    TELEPORTER: {
      SIZE: 25,
      SPEED: 2.5,
      HEALTH: 1,
      COLOR: [128, 0, 255],
      TELEPORT_COOLDOWN: 3000,
      TELEPORT_RANGE: 200,
      PARTICLE_COLOR: [200, 100, 255]
    },
    HEALTH_BAR: {
      WIDTH_OFFSET: 10,
      HEIGHT: 5,
      Y_OFFSET: 10,
      COLOR: [0, 200, 0]
    }
  },

  // Configurações dos Projéteis
  PROJECTILE: {
    PLAYER: {
      SIZE: 10,
      SPEED: 8,
      COLOR: [255, 255, 0]
    },
    ENEMY: {
      SIZE: 8,
      SPEED: 5,
      COLOR: [255, 0, 255]
    }
  },

  // Configurações do Sistema de Armas
  WEAPONS: {
    RIFLE: {
      NAME: 'RIFLE',
      COOLDOWN: 300,
      PROJECTILE_COUNT: 1,
      SPREAD_ANGLE: 0,
      PROJECTILE_SPEED: 8,
      PROJECTILE_SIZE: 10,
      COLOR: [255, 255, 0],
      DAMAGE: 18
    },
    SHOTGUN: {
      NAME: 'SHOTGUN',
      COOLDOWN: 600,
      PROJECTILE_COUNT: 5,
      SPREAD_ANGLE: 30, // graus
      PROJECTILE_SPEED: 7,
      PROJECTILE_SIZE: 8,
      COLOR: [255, 150, 0],
      DAMAGE: 8
    },
    MACHINE_GUN: {
      NAME: 'MACHINE GUN',
      COOLDOWN: 100,
      PROJECTILE_COUNT: 1,
      SPREAD_ANGLE: 5, // pequeno spread para realismo
      PROJECTILE_SPEED: 9,
      PROJECTILE_SIZE: 6,
      COLOR: [255, 0, 0],
      DAMAGE: 5.5
    },
    LASER: {
      NAME: 'LASER',
      COOLDOWN: 50,
      BEAM_LENGTH: 300,
      BEAM_WIDTH: 4,
      COLOR: [0, 255, 255],
      DAMAGE: 10
    }
  },

  // Configurações das Partículas
  PARTICLE: {
    MIN_SIZE: 2,
    MAX_SIZE: 5,
    MIN_VELOCITY: -2,
    MAX_VELOCITY: 2,
    LIFETIME: 60,
    COLOR: [255, 150, 0],
    COUNT_PER_EXPLOSION: 8
  },

  // Configurações dos Power-ups
  POWERUP: {
    SIZE: 20,
    LIFE: {
      COLOR: [0, 255, 0],
      HEAL_AMOUNT: 2
    },
    SPEED: {
      COLOR: [255, 255, 0],
      BOOST_AMOUNT: 1
    }
  },

  // Configurações das Moedas
  COIN: {
    SIZE: 15,
    COLOR: [255, 215, 0],
    VALUE: 5
  },

  // Configurações do Portal
  PORTAL: {
    SIZE: 40,
    MIN_DISTANCE_FROM_PLAYER: 200,
    OUTER_COLOR: [120, 0, 255, 220],
    INNER_COLOR: [200, 200, 255, 180],
    BORDER_COLOR: [255, 255, 0],
    BORDER_WEIGHT: 4,
    ACTIVATION_DELAY: 1000 // ms
  },

  // Configurações da Câmera
  CAMERA: {
    SMOOTHNESS: 0.1
  },

  // Configurações do HUD
  HUD: {
    HEALTH_BAR: {
      WIDTH: 150,
      HEIGHT: 20,
      X: 10,
      Y: 10,
      BACKGROUND_COLOR: [100],
      FOREGROUND_COLOR: [0, 200, 0],
      BORDER_RADIUS: 5
    },
    TEXT: {
      SIZE: 16,
      COLOR: [255],
      LINE_HEIGHT: 20,
      X: 10,
      START_Y: 35
    }
  },

  // Configurações do Minimapa
  MINIMAP: {
    SCALE: 0.08,
    MARGIN: 20,
    BACKGROUND_COLOR: [50, 100],
    BORDER_RADIUS: 5,
    PLAYER_COLOR: [0, 200, 255],
    ENEMY_COLOR: [255, 0, 0],
    PORTAL_COLOR: [120, 0, 255],
    POWERUP_COLOR: [0, 255, 0],
    COIN_COLOR: [255, 215, 0]
  },

  // Configurações de Gameplay
  GAMEPLAY: {
    SCORE_PER_ENEMY: 10,
    PORTAL_TRANSITION_DELAY: 300, // ms
    BOSS_LEVEL_INTERVAL: 5, // A cada 5 níveis
    MIN_SPAWN_DISTANCE: 120,
    POWERUP_SPAWN_CHANCE: 0.5,
    COINS_PER_LEVEL: 3
  },

  // Configurações de Game Over
  GAME_OVER: {
    BACKGROUND_ALPHA: 150,
    TITLE: {
      TEXT: "GAME OVER",
      SIZE: 48,
      COLOR: [255, 0, 0]
    },
    INFO: {
      SIZE: 24,
      COLOR: [255],
      LINE_SPACING: 40
    },
    RESTART_TEXT: "Pressione R para reiniciar"
  },

  // Sistema de Upgrades e Loja
  UPGRADES: {
    // Upgrade de Vida
    HEALTH: {
      NAME: "Vida Extra",
      DESCRIPTION: "Aumenta vida máxima em +1",
      BASE_PRICE: 50,
      PRICE_MULTIPLIER: 1.5,
      MAX_LEVEL: 10,
      ICON_COLOR: [255, 100, 100]
    },
    
    // Upgrade de Velocidade
    SPEED: {
      NAME: "Velocidade",
      DESCRIPTION: "Aumenta velocidade em +0.5",
      BASE_PRICE: 30,
      PRICE_MULTIPLIER: 1.4,
      MAX_LEVEL: 8,
      ICON_COLOR: [100, 255, 100]
    },
    
    // Upgrade de Dano
    DAMAGE: {
      NAME: "Dano",
      DESCRIPTION: "Aumenta dano dos projéteis",
      BASE_PRICE: 40,
      PRICE_MULTIPLIER: 1.6,
      MAX_LEVEL: 15,
      ICON_COLOR: [255, 255, 100]
    },
    
    // Upgrade de Cadência
    FIRE_RATE: {
      NAME: "Cadência",
      DESCRIPTION: "Reduz cooldown de tiro",
      BASE_PRICE: 35,
      PRICE_MULTIPLIER: 1.5,
      MAX_LEVEL: 12,
      ICON_COLOR: [255, 150, 0]
    },
    
    // Upgrade de Dash
    DASH_COOLDOWN: {
      NAME: "Dash Rápido",
      DESCRIPTION: "Reduz cooldown do dash",
      BASE_PRICE: 60,
      PRICE_MULTIPLIER: 1.8,
      MAX_LEVEL: 5,
      ICON_COLOR: [100, 200, 255]
    },
    
    // Upgrade de Regeneração
    REGENERATION: {
      NAME: "Regeneração",
      DESCRIPTION: "Regenera 1 vida a cada 10s",
      BASE_PRICE: 100,
      PRICE_MULTIPLIER: 2.0,
      MAX_LEVEL: 3,
      ICON_COLOR: [255, 100, 255]
    }
  },

  // Configurações da Loja
  SHOP: {
    BACKGROUND_COLOR: [20, 20, 40, 200],
    ITEM_WIDTH: 180,
    ITEM_HEIGHT: 120,
    ITEMS_PER_ROW: 3,
    PADDING: 20,
    TITLE_COLOR: [255, 255, 100],
    TEXT_COLOR: [255, 255, 255],
    PRICE_COLOR: [100, 255, 100],
    CANT_AFFORD_COLOR: [255, 100, 100],
    OWNED_COLOR: [150, 150, 150]
  }
};

// Função helper para acessar cores com facilidade
CONFIG.getColor = function(colorArray, alpha = 255) {
  if (colorArray.length === 3) {
    return [...colorArray, alpha];
  }
  return colorArray;
};

// Função helper para calcular posições do HUD
CONFIG.getHUDPosition = function(lineIndex) {
  return {
    x: CONFIG.HUD.TEXT.X,
    y: CONFIG.HUD.TEXT.START_Y + (lineIndex * CONFIG.HUD.TEXT.LINE_HEIGHT)
  };
};
