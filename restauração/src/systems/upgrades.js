// ===========================================
// SISTEMA DE LOJA E UPGRADES
// ===========================================

class UpgradeSystem {
  static loadUpgrades() {
    const savedUpgrades = localStorage.getItem('playerUpgrades');
    const savedCoins = localStorage.getItem('playerCoins');
    
    if (savedUpgrades) {
      upgrades = JSON.parse(savedUpgrades);
    }
    
    if (savedCoins) {
      playerCoins = parseInt(savedCoins);
    }
    
    let savedTotalCoins = localStorage.getItem('totalCoinsEarned');
    if (savedTotalCoins) {
      totalCoinsEarned = parseInt(savedTotalCoins);
    }
  }
  
  static saveUpgrades() {
    localStorage.setItem('playerUpgrades', JSON.stringify(upgrades));
    localStorage.setItem('playerCoins', playerCoins.toString());
  }
  
  static getUpgradePrice(upgradeType) {
    let config = CONFIG.UPGRADES[upgradeType];
    let currentLevel = upgrades[upgradeType];
    return Math.floor(config.BASE_PRICE * Math.pow(config.PRICE_MULTIPLIER, currentLevel));
  }
  
  static canAffordUpgrade(upgradeType) {
    return playerCoins >= this.getUpgradePrice(upgradeType) && 
           upgrades[upgradeType] < CONFIG.UPGRADES[upgradeType].MAX_LEVEL;
  }
  
  static buyUpgrade(upgradeType) {
    if (this.canAffordUpgrade(upgradeType)) {
      let price = this.getUpgradePrice(upgradeType);
      playerCoins -= price;
      upgrades[upgradeType]++;
      this.saveUpgrades();
      this.applyUpgrades();
      return true;
    }
    return false;
  }
  
  static applyUpgrades() {
    // Aplicar upgrades ao player
    if (player) {
      // Vida máxima
      let maxHealth = CONFIG.PLAYER.MAX_HEALTH + upgrades.HEALTH;
      if (player.health > maxHealth) player.health = maxHealth;
      
      // Velocidade
      player.baseSpeed = CONFIG.PLAYER.SPEED + (upgrades.SPEED * 0.5);
      player.speed = player.baseSpeed;
      
      // Cooldown de tiro
      let fireRateReduction = upgrades.FIRE_RATE * 30; // 30ms por nível
      player.shootCooldown = Math.max(100, CONFIG.PLAYER.SHOOT_COOLDOWN - fireRateReduction);
      
      // Cooldown do dash (aplicado diretamente no CONFIG)
      CONFIG.PLAYER.DASH.COOLDOWN = Math.max(800, 2000 - (upgrades.DASH_COOLDOWN * 200));
    }
  }
  
  static addCoins(amount) {
    playerCoins += amount;
    totalCoinsEarned += amount;
    this.saveUpgrades();
  }
  
  static handleRegeneration() {
    if (upgrades.REGENERATION > 0 && player && player.health < this.getMaxHealth()) {
      let regenInterval = 10000 - (upgrades.REGENERATION * 1000); // Mais rápido com upgrades
      if (millis() - lastRegenTime > regenInterval) {
        player.health = Math.min(player.health + 1, this.getMaxHealth());
        lastRegenTime = millis();
        
        // Efeito visual de regeneração
        for (let i = 0; i < 8; i++) {
          let particle = particlePool.get();
          particle.x = player.x + random(-20, 20);
          particle.y = player.y + random(-20, 20);
          particle.vx = random(-1, 1);
          particle.vy = random(-3, -1);
          particle.life = CONFIG.PARTICLE.LIFETIME;
          particle.size = CONFIG.PARTICLE.MIN_SIZE;
          particle.color = [100, 255, 100];
        }
      }
    }
  }
  
  static getMaxHealth() {
    return CONFIG.PLAYER.MAX_HEALTH + upgrades.HEALTH;
  }
  
  static getDamageMultiplier() {
    return 1 + (upgrades.DAMAGE * 0.3); // 30% mais dano por nível
  }
}

// ===========================================
// INTERFACE DA LOJA
// ===========================================

function drawShop() {
  // Background da loja
  fill(...CONFIG.SHOP.BACKGROUND_COLOR);
  rect(0, 0, width, height);
  
  // Título
  fill(...CONFIG.SHOP.TITLE_COLOR);
  textAlign(CENTER, TOP);
  textSize(32);
  text("LOJA DE UPGRADES", width/2, 30);
  
  // Moedas disponíveis
  fill(...CONFIG.SHOP.PRICE_COLOR);
  textSize(20);
  text(`Moedas: ${playerCoins}`, width/2, 70);
  
  // Instruções
  fill(...CONFIG.SHOP.TEXT_COLOR);
  textSize(14);
  text("Clique nos upgrades para comprar | Pressione ESC para fechar", width/2, 100);
  
  // Desenhar upgrades
  let upgradeTypes = Object.keys(CONFIG.UPGRADES);
  let startX = (width - (CONFIG.SHOP.ITEMS_PER_ROW * CONFIG.SHOP.ITEM_WIDTH + (CONFIG.SHOP.ITEMS_PER_ROW - 1) * CONFIG.SHOP.PADDING)) / 2;
  let startY = 140;
  
  for (let i = 0; i < upgradeTypes.length; i++) {
    let upgradeType = upgradeTypes[i];
    let config = CONFIG.UPGRADES[upgradeType];
    
    let col = i % CONFIG.SHOP.ITEMS_PER_ROW;
    let row = Math.floor(i / CONFIG.SHOP.ITEMS_PER_ROW);
    
    let x = startX + col * (CONFIG.SHOP.ITEM_WIDTH + CONFIG.SHOP.PADDING);
    let y = startY + row * (CONFIG.SHOP.ITEM_HEIGHT + CONFIG.SHOP.PADDING);
    
    drawUpgradeItem(x, y, upgradeType, config);
  }
}

function drawUpgradeItem(x, y, upgradeType, config) {
  let currentLevel = upgrades[upgradeType];
  let maxLevel = config.MAX_LEVEL;
  let price = UpgradeSystem.getUpgradePrice(upgradeType);
  let canAfford = UpgradeSystem.canAffordUpgrade(upgradeType);
  let isMaxLevel = currentLevel >= maxLevel;
  
  // Background do item
  if (isMaxLevel) {
    fill(60, 60, 60);
  } else if (canAfford) {
    fill(40, 80, 40);
  } else {
    fill(80, 40, 40);
  }
  
  // Highlight se mouse over
  if (mouseX >= x && mouseX <= x + CONFIG.SHOP.ITEM_WIDTH &&
      mouseY >= y && mouseY <= y + CONFIG.SHOP.ITEM_HEIGHT) {
    fill(red(color(...CONFIG.SHOP.BACKGROUND_COLOR)) + 40,
         green(color(...CONFIG.SHOP.BACKGROUND_COLOR)) + 40,
         blue(color(...CONFIG.SHOP.BACKGROUND_COLOR)) + 40);
  }
  
  rect(x, y, CONFIG.SHOP.ITEM_WIDTH, CONFIG.SHOP.ITEM_HEIGHT);
  
  // Ícone do upgrade
  fill(...config.ICON_COLOR);
  ellipse(x + CONFIG.SHOP.ITEM_WIDTH/2, y + 25, 30);
  
  // Nome do upgrade
  fill(...CONFIG.SHOP.TEXT_COLOR);
  textAlign(CENTER, TOP);
  textSize(14);
  text(config.NAME, x + CONFIG.SHOP.ITEM_WIDTH/2, y + 45);
  
  // Nível atual
  textSize(12);
  text(`Nível: ${currentLevel}/${maxLevel}`, x + CONFIG.SHOP.ITEM_WIDTH/2, y + 65);
  
  // Preço
  if (isMaxLevel) {
    fill(...CONFIG.SHOP.OWNED_COLOR);
    text("MÁXIMO", x + CONFIG.SHOP.ITEM_WIDTH/2, y + 85);
  } else {
    fill(canAfford ? [...CONFIG.SHOP.PRICE_COLOR] : [...CONFIG.SHOP.CANT_AFFORD_COLOR]);
    text(`${price} moedas`, x + CONFIG.SHOP.ITEM_WIDTH/2, y + 85);
  }
  
  // Descrição
  fill(...CONFIG.SHOP.TEXT_COLOR);
  textSize(10);
  text(config.DESCRIPTION, x + CONFIG.SHOP.ITEM_WIDTH/2, y + 100);
}

function handleShopClick() {
  if (!showShop) return;
  
  let upgradeTypes = Object.keys(CONFIG.UPGRADES);
  let startX = (width - (CONFIG.SHOP.ITEMS_PER_ROW * CONFIG.SHOP.ITEM_WIDTH + (CONFIG.SHOP.ITEMS_PER_ROW - 1) * CONFIG.SHOP.PADDING)) / 2;
  let startY = 140;
  
  for (let i = 0; i < upgradeTypes.length; i++) {
    let upgradeType = upgradeTypes[i];
    
    let col = i % CONFIG.SHOP.ITEMS_PER_ROW;
    let row = Math.floor(i / CONFIG.SHOP.ITEMS_PER_ROW);
    
    let x = startX + col * (CONFIG.SHOP.ITEM_WIDTH + CONFIG.SHOP.PADDING);
    let y = startY + row * (CONFIG.SHOP.ITEM_HEIGHT + CONFIG.SHOP.PADDING);
    
    if (mouseX >= x && mouseX <= x + CONFIG.SHOP.ITEM_WIDTH &&
        mouseY >= y && mouseY <= y + CONFIG.SHOP.ITEM_HEIGHT) {
      
      if (UpgradeSystem.buyUpgrade(upgradeType)) {
        // Efeito visual de compra
        for (let j = 0; j < 10; j++) {
          let particle = particlePool.get();
          particle.x = x + CONFIG.SHOP.ITEM_WIDTH/2;
          particle.y = y + CONFIG.SHOP.ITEM_HEIGHT/2;
          particle.vx = random(-3, 3);
          particle.vy = random(-3, 3);
          particle.life = CONFIG.PARTICLE.LIFETIME;
          particle.size = CONFIG.PARTICLE.MIN_SIZE;
          particle.color = CONFIG.UPGRADES[upgradeType].ICON_COLOR;
        }
      }
      break;
    }
  }
}
