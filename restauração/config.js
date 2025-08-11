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
    COLOR: [0, 200, 255]
  },

  // Configurações dos Inimigos
  ENEMY: {
    NORMAL: {
      SIZE: 30,
      SPEED: 2,
      HEALTH: 3,
      COLOR: [255, 0, 0]
    },
    FAST: {
      SIZE: 20,
      SPEED: 4,
      HEALTH: 2,
      COLOR: [255, 100, 0]
    },
    BOSS: {
      SIZE: 60,
      SPEED: 1,
      HEALTH: 15,
      COLOR: [150, 0, 150],
      SHOOT_COOLDOWN: 1000 // ms
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
      DAMAGE: 1
    },
    SHOTGUN: {
      NAME: 'SHOTGUN',
      COOLDOWN: 600,
      PROJECTILE_COUNT: 5,
      SPREAD_ANGLE: 30, // graus
      PROJECTILE_SPEED: 7,
      PROJECTILE_SIZE: 8,
      COLOR: [255, 150, 0],
      DAMAGE: 1
    },
    MACHINE_GUN: {
      NAME: 'MACHINE GUN',
      COOLDOWN: 100,
      PROJECTILE_COUNT: 1,
      SPREAD_ANGLE: 5, // pequeno spread para realismo
      PROJECTILE_SPEED: 9,
      PROJECTILE_SIZE: 6,
      COLOR: [255, 0, 0],
      DAMAGE: 1
    },
    LASER: {
      NAME: 'LASER',
      COOLDOWN: 50,
      BEAM_LENGTH: 300,
      BEAM_WIDTH: 4,
      COLOR: [0, 255, 255],
      DAMAGE: 2
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
