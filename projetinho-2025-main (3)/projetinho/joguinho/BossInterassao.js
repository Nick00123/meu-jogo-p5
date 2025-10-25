// ===========================================
// INTEGRAÇÃO DO SISTEMA DE BATALHAS DE CHEFES
// ===========================================

// Integração do sistema de batalhas de chefes ao jogo existente

// Configuração dos chefes no jogo
const CONFIG_CHEFES = {
  // Níveis de chefes e spawn
  NIVEIS_CHEFE: {
    1: {
      tipo: 'BOSS',
      vida: CONFIG.INIMIGO.NORMAL.VIDA * 1.5,
      padroesAtaque: ['Círculo de Projéteis', 'Rajada Direta'],
      nivelSpawn: 5
    },
    2: {
      tipo: 'BOSS',
      vida: CONFIG.INIMIGO.NORMAL.VIDA * 2,
      padroesAtaque: ['Onda de Choque', 'Chuva de Projéteis'],
      nivelSpawn: 10
    },
    3: {
      tipo: 'BOSS',
      vida: CONFIG.INIMIGO.NORMAL.VIDA * 3,
      padroesAtaque: ['Laser Giratório', 'Meteoro'],
      nivelSpawn: 15
    }
  },
  
  // Configuração de spawn de chefes
  SPAWN_CHEFE: {
    INTERVALO_NIVEL: 5,
    NIVEL_MINIMO: 5,
    NIVEL_MAXIMO: 20,
    CHANCE_SPAWN: 1.0
  }
};

// Função para spawnar chefe
function spawnChefe(nivel) {
  let configChefe = CONFIG_CHEFES.NIVEIS_CHEFE[nivel];
  if (!configChefe) return null;
  
  let chefe = new ChefeInimigo(
    CONFIG.MAPA.LARGURA / 2,
    CONFIG.MAPA.ALTURA / 2,
    nivel
  );
  
  return chefe;
}

// Função para integrar o sistema de batalhas de chefes ao jogo
function integrarSistemaChefes() {
  // Adicionar chefes ao sistema de spawn
  gameStateManager.addEventListener('nivelCompleto', () => {
    let nivel = gameStateManager.getLevel();
    if (nivel % CONFIG_CHEFES.SPAWN_CHEFE.INTERVALO_NIVEL === 0) {
      spawnChefe(nivel);
    }
  });
  
  // Adicionar chefes ao sistema de inimigos
  inimigos.push(spawnChefe(5));
}

// Inicializar sistema de batalhas de chefes
function inicializarSistemaChefes() {
  // Configurar spawn de chefes
  gameStateManager.on('nivelCompleto', (nivel) => {
    if (nivel % CONFIG_CHEFES.SPAWN_CHEFE.INTERVALO_NIVEL === 0) {
      spawnChefe(nivel);
    }
  });
  
  // Adicionar chefes ao sistema de inimigos
  inimigos.push(spawnChefe(5));
}

// (Removido export para ambiente não-modular)