// Adaptive Difficulty System
class AdaptiveDifficulty {
  constructor() {
    this.difficultyLevel = 1;
    this.playerPerformance = {
      score: 0,
      deaths: 0,
      timeAlive: 0,
      weaponsUnlocked: 0,
      upgradesPurchased: 0
    };
    this.difficultyThresholds = {
      easy: 0.3,
      medium: 0.6,
      hard: 0.8,
      extreme: 1.0
    };
    this.enemySpawnRate = 1.0;
    this.enemyStrength = 1.0;
    this.bossDifficulty = 1.0;
    this.environmentalHazardRate = 1.0;
  }

  updatePlayerPerformance(score, deaths, timeAlive, weaponsUnlocked, upgradesPurchased) {
    this.playerPerformance = {
      score,
      deaths,
      timeAlive,
      weaponsUnlocked,
      upgradesPurchased
    };
    
    this.calculateDifficulty();
  }

  calculateDifficulty() {
    const performanceScore = this.calculatePerformanceScore();
    this.difficultyLevel = Math.max(1, Math.min(10, Math.floor(performanceScore / 10) + 1));
    
    // Adjust game parameters based on difficulty
    this.enemySpawnRate = 0.5 + (this.difficultyLevel * 0.1);
    this.enemyStrength = 0.8 + (this.difficultyLevel * 0.15);
    this.bossDifficulty = 0.7 + (this.difficultyLevel * 0.2);
    this.environmentalHazardRate = 0.6 + (this.difficultyLevel * 0.12);
  }

  calculatePerformanceScore() {
    const score = this.playerPerformance.score;
    const deaths = this.playerPerformance.deaths;
    const timeAlive = this.playerPerformance.timeAlive;
    const weaponsUnlocked = this.playerPerformance.weaponsUnlocked;
    const upgradesPurchased = this.playerPerformance.upgradesPurchased;
    
    return (score * 0.4) + (timeAlive * 0.3) + (weaponsUnlocked * 0.2) + (upgradesPurchased * 0.1) - (deaths * 10);
  }

  getDifficultyMultiplier() {
    return {
      enemySpawnRate: this.enemySpawnRate,
      enemyStrength: this.enemyStrength,
      bossDifficulty: this.bossDifficulty,
      environmentalHazardRate: this.environmentalHazardRate
    };
  }
}

// Initialize adaptive difficulty
let adaptiveDifficulty = new AdaptiveDifficulty();
