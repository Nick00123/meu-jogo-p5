// Sistema de Upgrades e Progressão
const UpgradeSystem = {
  upgrades: {
    HEALTH: 0,
    SPEED: 0,
    DAMAGE: 0,
    FIRE_RATE: 0,
    DASH_COOLDOWN: 0,
    REGENERATION: 0
  },
  
  getMaxHealth() {
    return CONFIG.PLAYER.HEALTH + (this.upgrades.HEALTH * 20);
  },
  
  getPlayerSpeed() {
    return CONFIG.PLAYER.SPEED + (this.upgrades.SPEED * 0.5);
  },
  
  getDamageMultiplier() {
    return 1 + (this.upgrades.DAMAGE * 0.2);
  },
  
  getFireRateMultiplier() {
    return 1 + (this.upgrades.FIRE_RATE * 0.15);
  },
  
  getDashCooldownReduction() {
    return this.upgrades.DASH_COOLDOWN * 200;
  },
  
  getRegenerationRate() {
    return this.upgrades.REGENERATION * 0.5;
  },
  
  applyUpgrades() {
    if (player) {
      player.maxHealth = this.getMaxHealth();
      player.speed = this.getPlayerSpeed();
    }
  },
  
  handleRegeneration() {
    if (player && this.upgrades.REGENERATION > 0 && millis() - lastRegenTime > 1000) {
      player.health = min(player.health + this.getRegenerationRate(), player.maxHealth);
      lastRegenTime = millis();
    }
  },
  
  loadUpgrades() {
    const saved = localStorage.getItem('upgrades');
    if (saved) {
      this.upgrades = JSON.parse(saved);
    }
  },
  
  saveUpgrades() {
    localStorage.setItem('upgrades', JSON.stringify(this.upgrades));
  }
};
