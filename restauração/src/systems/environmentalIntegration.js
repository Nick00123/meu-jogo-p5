// ===========================================
// SISTEMA DE ELEMENTOS AMBIENTAIS DINÂMICO
// ===========================================

class EnvironmentalIntegration {
  constructor() {
    this.levelGroups = {
      1: { name: "Entrada", elements: [] },
      2: { name: "Corredor", elements: [] },
      3: { name: "Câmara", elements: [] },
      4: { name: "Fortaleza", elements: [] },
      5: { name: "Torre", elements: [] }
    };
  }
  
  initializeEnvironmentalElements(level) {
    // Limpar elementos anteriores
    environmentalManager.elements = [];
    environmentalManager.obstacles = [];
    environmentalManager.dangerZones = [];
    environmentalManager.teleporters = [];
    
    const levelGroup = Math.ceil(level / 10);
    
    switch(levelGroup) {
      case 1: // Níveis 1-10 - Entrada
        this.createEntranceLevel(level);
        break;
      case 2: // Níveis 11-20 - Corredor
        this.createCorridorLevel(level);
        break;
      case 3: // Níveis 21-30 - Câmara
        this.createChamberLevel(level);
        break;
      case 4: // Níveis 31-40 - Fortaleza
        this.createFortressLevel(level);
        break;
      case 5: // Níveis 41-50 - Torre
        this.createTowerLevel(level);
        break;
      default: // Níveis acima de 50 - Mistura
        this.createMixedLevel(level);
        break;
    }
  }
  
  createEntranceLevel(level) {
    // Entrada com caixas e barris básicos
    const boxCount = 3 + Math.floor(level / 3);
    const barrelCount = 2 + Math.floor(level / 4);
    
    // Caixas espalhadas
    for (let i = 0; i < boxCount; i++) {
      const x = 100 + Math.random() * (CONFIG.MAP.WIDTH - 200);
      const y = 100 + Math.random() * (CONFIG.MAP.HEIGHT - 200);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'box'));
    }
    
    // Barris normais
    for (let i = 0; i < barrelCount; i++) {
      const x = 150 + Math.random() * (CONFIG.MAP.WIDTH - 300);
      const y = 150 + Math.random() * (CONFIG.MAP.HEIGHT - 300);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel'));
    }
    
    // Adicionar algumas zonas de perigo básicas
    if (level >= 5) {
      environmentalManager.addElement(new DangerZone(400, 400, 'lava'));
    }
  }
  
  createCorridorLevel(level) {
    // Corredor com mais obstáculos e perigos
    const barrelCount = 4 + Math.floor(level / 2);
    const explosiveCount = 1 + Math.floor(level / 5);
    
    // Barris explosivos
    for (let i = 0; i < explosiveCount; i++) {
      const x = 200 + Math.random() * (CONFIG.MAP.WIDTH - 400);
      const y = 200 + Math.random() * (CONFIG.MAP.HEIGHT - 400);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel_explosive'));
    }
    
    // Barris normais
    for (let i = 0; i < barrelCount; i++) {
      const x = 150 + Math.random() * (CONFIG.MAP.WIDTH - 300);
      const y = 150 + Math.random() * (CONFIG.MAP.HEIGHT - 300);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel'));
    }
    
    // Zonas de perigo
    environmentalManager.addElement(new DangerZone(300, 300, 'lava'));
    environmentalManager.addElement(new DangerZone(700, 500, 'spikes'));
  }
  
  createChamberLevel(level) {
    // Câmara com teletransportadores e perigos avançados
    const boxCount = 2 + Math.floor(level / 3);
    const barrelCount = 3 + Math.floor(level / 4);
    
    // Caixas
    for (let i = 0; i < boxCount; i++) {
      const x = 100 + Math.random() * (CONFIG.MAP.WIDTH - 200);
      const y = 100 + Math.random() * (CONFIG.MAP.HEIGHT - 200);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'box'));
    }
    
    // Barris
    for (let i = 0; i < barrelCount; i++) {
      const x = 150 + Math.random() * (CONFIG.MAP.WIDTH - 300);
      const y = 150 + Math.random() * (CONFIG.MAP.HEIGHT - 300);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel'));
    }
    
    // Teletransportadores
    environmentalManager.addElement(new Teleporter(200, 200, 800, 600));
    environmentalManager.addElement(new Teleporter(800, 200, 200, 600));
    
    // Zonas de perigo avançadas
    environmentalManager.addElement(new DangerZone(400, 400, 'lava'));
    environmentalManager.addElement(new DangerZone(600, 300, 'spikes'));
  }
  
  createFortressLevel(level) {
    // Fortaleza com muitos obstáculos e perigos
    const boxCount = 4 + Math.floor(level / 2);
    const explosiveCount = 2 + Math.floor(level / 3);
    
    // Caixas
    for (let i = 0; i < boxCount; i++) {
      const x = 100 + Math.random() * (CONFIG.MAP.WIDTH - 200);
      const y = 100 + Math.random() * (CONFIG.MAP.HEIGHT - 200);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'box'));
    }
    
    // Barris explosivos
    for (let i = 0; i < explosiveCount; i++) {
      const x = 200 + Math.random() * (CONFIG.MAP.WIDTH - 400);
      const y = 200 + Math.random() * (CONFIG.MAP.HEIGHT - 400);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel_explosive'));
    }
    
    // Zonas de perigo
    environmentalManager.addElement(new DangerZone(300, 300, 'lava'));
    environmentalManager.addElement(new DangerZone(500, 400, 'spikes'));
    environmentalManager.addElement(new DangerZone(700, 500, 'lava'));
  }
  
  createTowerLevel(level) {
    // Torre com elementos máximos
    const boxCount = 5 + Math.floor(level / 2);
    const barrelCount = 3 + Math.floor(level / 3);
    const explosiveCount = 2 + Math.floor(level / 4);
    
    // Caixas
    for (let i = 0; i < boxCount; i++) {
      const x = 100 + Math.random() * (CONFIG.MAP.WIDTH - 200);
      const y = 100 + Math.random() * (CONFIG.MAP.HEIGHT - 200);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'box'));
    }
    
    // Barris
    for (let i = 0; i < barrelCount; i++) {
      const x = 150 + Math.random() * (CONFIG.MAP.WIDTH - 300);
      const y = 150 + Math.random() * (CONFIG.MAP.HEIGHT - 300);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel'));
    }
    
    // Barris explosivos
    for (let i = 0; i < explosiveCount; i++) {
      const x = 200 + Math.random() * (CONFIG.MAP.WIDTH - 400);
      const y = 200 + Math.random() * (CONFIG.MAP.HEIGHT - 400);
      environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel_explosive'));
    }
    
    // Teletransportadores
    environmentalManager.addElement(new Teleporter(300, 300, 700, 500));
    environmentalManager.addElement(new Teleporter(700, 300, 300, 500));
    
    // Zonas de perigo
    environmentalManager.addElement(new DangerZone(400, 400, 'lava'));
    environmentalManager.addElement(new DangerZone(600, 300, 'spikes'));
    environmentalManager.addElement(new DangerZone(800, 400, 'lava'));
  }
  
  createMixedLevel(level) {
    // Mistura aleatória de todos os elementos
    const totalElements = 8 + Math.floor(level / 5);
    
    for (let i = 0; i < totalElements; i++) {
      const x = 100 + Math.random() * (CONFIG.MAP.WIDTH - 200);
      const y = 100 + Math.random() * (CONFIG.MAP.HEIGHT - 200);
      
      const type = Math.floor(Math.random() * 4);
      switch(type) {
        case 0:
          environmentalManager.addElement(new DestructibleObstacle(x, y, 'box'));
          break;
        case 1:
          environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel'));
          break;
        case 2:
          environmentalManager.addElement(new DestructibleObstacle(x, y, 'barrel_explosive'));
          break;
        case 3:
          const dangerTypes = ['lava', 'spikes'];
          const dangerType = dangerTypes[Math.floor(Math.random() * dangerTypes.length)];
          environmentalManager.addElement(new DangerZone(x, y, dangerType));
          break;
      }
    }
    
    // Adicionar teletransportadores em níveis altos
    if (level > 30) {
      environmentalManager.addElement(new Teleporter(200, 200, 800, 600));
      environmentalManager.addElement(new Teleporter(800, 200, 200, 600));
    }
  }
}

// Instância global
let environmentalIntegration = new EnvironmentalIntegration();
