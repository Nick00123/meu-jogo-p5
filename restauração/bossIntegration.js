// ===========================================
// INTEGRAÇÃO DO SISTEMA DE BOSS BATTLES
// ===========================================

// Integração do sistema de boss battles ao jogo existente

// Configuração dos bosses no jogo
const BOSS_CONFIG = {
  // Boss levels e spawn
  BOSS_LEVELS: {
    1: {
      type: 'BOSS',
      health: CONFIG.ENEMY.BOSS.HEALTH * 1.5,
      attackPatterns: ['Círculo de Projéteis', 'Rajada Direta'],
      spawnLevel: 5
    },
    2: {
      type: 'BOSS',
      health: CONFIG.ENEMY.BOSS.HEALTH * 2,
      attackPatterns: ['Onda de Choque', 'Chuva de Projéteis'],
      spawnLevel: 10
    },
    3: {
      type: 'BOSS',
      health: CONFIG.ENEMY.BOSS.HEALTH * 3,
      attackPatterns: ['Laser Giratório', 'Meteoro'],
      spawnLevel: 15
    }
  },
  
  // Configuração de spawn de bosses
  BOSS_SPAWN: {
    LEVEL_INTERVAL: 5,
    MIN_LEVEL: 5,
    MAX_LEVEL: 20,
    SPAWN_CHANCE: 1.0
  }
};

// Função para spawnar boss
function spawnBoss(level) {
  let bossConfig = BOSS_CONFIG.BOSS_LEVELS[level];
  if (!bossConfig) return null;
  
  let boss = new BossEnemy(
    CONFIG.MAP.WIDTH / 2,
    CONFIG.MAP.HEIGHT / 2,
    level
  );
  
  return boss;
}

// Função para integrar o sistema de boss battles ao jogo
function integrateBossSystem() {
  // Adicionar bosses ao sistema de spawn
  gameStateManager.addEventListener('levelComplete', () => {
    let level = gameStateManager.getLevel();
    if (level % BOSS_CONFIG.BOSS_SPAWN.LEVEL_INTERVAL === 0) {
      spawnBoss(level);
    }
  });
  
  // Adicionar bosses ao sistema de inimigos
  enemies.push(spawnBoss(5));
}

// Inicializar sistema de boss battles
function initializeBossSystem() {
  // Configurar spawn de bosses
  gameStateManager.on('levelComplete', (level) => {
    if (level % BOSS_CONFIG.BOSS_SPAWN.LEVEL_INTERVAL === 0) {
      spawnBoss(level);
    }
  });
  
  // Adicionar bosses ao sistema de inimigos
  enemies.push(spawnBoss(5));
}

// Exportar funções
export { spawnBoss, integrateBossSystem, initializeBossSystem };
