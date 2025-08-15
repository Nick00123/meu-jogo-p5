// Weapon Progression System
class WeaponProgression {
  constructor() {
    this.unlockedWeapons = ['RIFLE']; // Start with 1 basic weapon
    // Ordem de desbloqueio (1 por chefão)
    this.unlockOrder = ['SHOTGUN', 'MACHINE_GUN', 'LASER'];

    // Mantemos a estrutura caso seja útil futuramente, mas não é usada no novo fluxo
    this.weaponUnlocks = {
      'SHOTGUN': { level: 2, bossDefeated: true },
      'MACHINE_GUN': { level: 3, bossDefeated: true },
      'LASER': { level: 4, bossDefeated: true }
    };
    
    this.weaponUpgrades = {
      'RIFLE': { damage: 0, fireRate: 0, ammoCapacity: 0, piercing: 0 },
      'SHOTGUN': { damage: 0, spread: 0, pellets: 0, reloadSpeed: 0 },
      'MACHINE_GUN': { damage: 0, accuracy: 0, overheat: 0, stability: 0 },
      'LASER': { damage: 0, beamWidth: 0, duration: 0, recharge: 0 }
    };
    
    this.upgradeCosts = {
      damage: 50,
      fireRate: 75,
      ammoCapacity: 40,
      piercing: 100,
      spread: 60,
      pellets: 80,
      reloadSpeed: 90,
      accuracy: 65,
      overheat: 85,
      stability: 70,
      beamWidth: 120,
      duration: 95,
      recharge: 110
    };
  }
  
  // Agora: desbloqueia 1 arma por chefão derrotado a cada intervalo de chefão
  checkWeaponUnlocks(currentLevel, bossDefeated = false) {
    if (!bossDefeated) return; // só desbloqueia ao derrotar chefão

    const interval = (CONFIG && CONFIG.GAMEPLAY && CONFIG.GAMEPLAY.BOSS_LEVEL_INTERVAL) ? CONFIG.GAMEPLAY.BOSS_LEVEL_INTERVAL : 5;
    // currentLevel acabou de ser incrementado em nextLevel(); o chefão foi no nível anterior
    const justClearedBossLevel = ((currentLevel - 1) % interval) === 0;
    if (!justClearedBossLevel) return;

    // Procura a próxima arma ainda bloqueada na ordem
    for (let weapon of this.unlockOrder) {
      if (!this.unlockedWeapons.includes(weapon)) {
        this.unlockedWeapons.push(weapon);
        this.showUnlockNotification(weapon);
        break;
      }
    }
  }
  
  showUnlockNotification(weapon) {
    window.bossNotifications.push({
      text: `Nova arma desbloqueada: ${weapon}`,
      x: width/2,
      y: height/2,
      life: 180,
      color: [0, 255, 255]
    });
  }
  
  upgradeWeapon(weapon, stat) {
    if (this.upgradeCosts[stat] <= totalCoinsEarned) {
      this.weaponUpgrades[weapon][stat]++;
      totalCoinsEarned -= this.upgradeCosts[stat];
      this.upgradeCosts[stat] = Math.floor(this.upgradeCosts[stat] * 1.5);
      return true;
    }
    return false;
  }
  
  getWeaponStats(weapon) {
    const baseStats = CONFIG.WEAPONS[weapon];
    const upgrades = this.weaponUpgrades[weapon];
    
    return {
      damage: baseStats.DAMAGE + (upgrades.damage * 5),
      fireRate: baseStats.FIRE_RATE * (1 + upgrades.fireRate * 0.1),
      ammoCapacity: baseStats.AMMO_CAPACITY + (upgrades.ammoCapacity * 10),
      piercing: upgrades.piercing,
      spread: upgrades.spread * 5,
      pellets: baseStats.PELLETS + upgrades.pellets,
      reloadSpeed: baseStats.RELOAD_TIME * (1 - upgrades.reloadSpeed * 0.1),
      accuracy: 1 - (upgrades.accuracy * 0.05),
      overheat: baseStats.OVERHEAT_THRESHOLD + (upgrades.overheat * 20),
      stability: 1 - (upgrades.stability * 0.03),
      beamWidth: 5 + (upgrades.beamWidth * 2),
      duration: baseStats.BEAM_DURATION + (upgrades.duration * 0.5),
      recharge: baseStats.RECHARGE_TIME * (1 - upgrades.recharge * 0.1)
    };
  }
}

// Initialize weapon progression
let weaponProgression = new WeaponProgression();
