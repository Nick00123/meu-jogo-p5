// Game Integration System
class GameIntegration {
  constructor() {
    this.systems = {
      weaponProgression: weaponProgression,
      enhancedEnemies: null,
      adaptiveDifficulty: adaptiveDifficulty
    };
    this.initialized = false;
  }

  initialize() {
    // Initialize all systems
    this.systems.enhancedEnemies = new EnhancedEnemyManager();
    this.systems.adaptiveDifficulty = new AdaptiveDifficulty();
    this.initialized = true;
  }

  update(gameState) {
    if (!this.initialized) return;

    // Update all systems
    this.systems.weaponProgression.update(gameState.level, gameState.bossDefeated);
    this.systems.enhancedEnemies.update(gameState.player, gameState.enemies);
    this.systems.adaptiveDifficulty.updatePlayerPerformance(
      gameState.score,
      gameState.deaths,
      gameState.timeAlive,
      gameState.weaponsUnlocked,
      gameState.upgradesPurchased
    );
  }

  getDifficultyMultiplier() {
    return {
      enemySpawnRate: this.systems.adaptiveDifficulty.enemySpawnRate,
      enemyStrength: this.systems.adaptiveDifficulty.enemyStrength,
      bossDifficulty: this.systems.adaptiveDifficulty.bossDifficulty,
      environmentalHazardRate: this.systems.adaptiveDifficulty.environmentalHazardRate
    };
  }
}

// Initialize integration
let gameIntegration = new GameIntegration();
