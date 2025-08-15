// ===========================================
// CONFIGURAÇÃO DE ELEMENTOS AMBIENTAIS POR NÍVEL
// ===========================================

class EnvironmentalSetup {
  constructor() {
    this.elements = [];
    this.levelElements = new Map();
    this.setupLevelElements();
  }
  
  setupLevelElements() {
    // Configuração por faixas de nível
    this.levelElements.set(1, this.createLevel1Elements());
    this.levelElements.set(2, this.createLevel2Elements());
    this.levelElements.set(3, this.createLevel3Elements());
    // ... continua para mais níveis
  }
  
  createLevel1Elements() {
    return [
      new DestructibleObstacle(200, 300, 'box'),
      new DestructibleObstacle(400, 200, 'box'),
      new DestructibleObstacle(600, 400, 'box')
    ];
  }
  
  createLevel2Elements() {
    return [
      new DestructibleObstacle(300, 250, 'barrel'),
      new DangerZone(500, 350, 'lava'),
      new DestructibleObstacle(700, 450, 'barrel_explosive')
    ];
  }
  
  createLevel3Elements() {
    return [
      new Teleporter(400, 300, 800, 600),
      new DangerZone(600, 400, 'spikes'),
      new DestructibleObstacle(250, 500, 'barrel')
    ];
  }
  
  getElementsForLevel(level) {
    const levelGroup = Math.ceil(level / 10);
    return this.levelElements.get(levelGroup) || [];
  }
  
  initializeLevel(level) {
    // Limpar elementos anteriores
    environmentalManager.elements = [];
    
    // Adicionar elementos do nível atual
    const elements = this.getElementsForLevel(level);
    elements.forEach(element => {
      environmentalManager.addElement(element);
    });
  }
}

// Instância global
let environmentalSetup = new EnvironmentalSetup();
