// ===========================================
// SISTEMA DE LOJA E UPGRADES
// ===========================================

class SistemaLojaUpgrades {
  static loadUpgrades() {
    const upgradesSalvos = localStorage.getItem('upgradesJogador');
    const moedasSalvas = localStorage.getItem('moedasJogador');
    
    if (upgradesSalvos) {
      upgrades = JSON.parse(upgradesSalvos);
    }
    
    if (moedasSalvas) {
      moedasJogador = parseInt(moedasSalvas);
    }
    
    let totalMoedasSalvas = localStorage.getItem('totalMoedasObtidas');
    if (totalMoedasSalvas) {
      totalMoedasObtidas = parseInt(totalMoedasSalvas);
    }
  }
  
  static saveUpgrades() {
    localStorage.setItem('upgradesJogador', JSON.stringify(upgrades));
    localStorage.setItem('moedasJogador', moedasJogador.toString());
  }
  
  static getUpgradePrice(tipoUpgrade) {
    let config = CONFIG.UPGRADES[tipoUpgrade];
    let nivelAtual = upgrades[tipoUpgrade];
    return Math.floor(config.PRECO_BASE * Math.pow(config.MULTIPLICADOR_PRECO, nivelAtual));
  }
  
  static canAffordUpgrade(tipoUpgrade) {
    return moedasJogador >= this.getUpgradePrice(tipoUpgrade) && 
           upgrades[tipoUpgrade] < CONFIG.UPGRADES[tipoUpgrade].NIVEL_MAXIMO;
  }
  
  static buyUpgrade(tipoUpgrade) {
    if (this.canAffordUpgrade(tipoUpgrade)) {
      let preco = this.getUpgradePrice(tipoUpgrade);
      moedasJogador -= preco;
      upgrades[tipoUpgrade]++;
      this.saveUpgrades();
      this.applyUpgrades();
      return true;
    }
    return false;
  }
  
  static applyUpgrades() {
    // Aplicar upgrades ao jogador
    if (typeof jogador !== 'undefined') {
      // Vida máxima
      let vidaMaxima = CONFIG.JOGADOR.VIDA_MAXIMA + upgrades.SAUDE;
      if (jogador.vida > vidaMaxima) jogador.vida = vidaMaxima;
      
      // Velocidade
      jogador.velocidadeBase = CONFIG.JOGADOR.VELOCIDADE + (upgrades.VELOCIDADE * 0.5);
      jogador.velocidade = jogador.velocidadeBase;
      
      // Cooldown de tiro
      let reducaoCadencia = upgrades.CADENCIA * 30; // 30ms por nível
      jogador.tempoRecargaTiro = Math.max(100, CONFIG.JOGADOR.COOLDOWN_TIRO - reducaoCadencia);
      
      // Cooldown do dash (aplicado diretamente no CONFIG)
      CONFIG.JOGADOR.DASH.COOLDOWN = Math.max(800, 2000 - (upgrades.COOLDOWN_DASH * 200));
    }
  }
  
  static addCoins(quantidade) {
    moedasJogador += quantidade;
    totalMoedasObtidas += quantidade;
    this.saveUpgrades();
  }
  
  static handleRegeneration() {
    if (upgrades.REGENERACAO > 0 && jogador && jogador.vida < this.getMaxHealth()) {
      let intervaloRegen = 10000 - (upgrades.REGENERACAO * 1000); // Mais rápido com upgrades
      if (millis() - ultimoTempoRegen > intervaloRegen) {
        jogador.vida = Math.min(jogador.vida + 1, this.getMaxHealth());
        ultimoTempoRegen = millis();
        
        if (SistemaLojaUpgrades.buyUpgrade(tipoUpgrade)) {
        // Efeito visual de regeneração
        for (let i = 0; i < 10; i++) {
          let particula = poolParticulas.obter();
          particula.x = x + CONFIG.LOJA.LARGURA_ITEM/2;
          particula.y = y + CONFIG.LOJA.ALTURA_ITEM/2;
          particula.vx = random(-3, 3);
          particula.vy = random(-3, 3);
          particula.life = 1000;
          particula.size = 5;
          particula.color = CONFIG.UPGRADES[tipoUpgrade].COR_ICONE || [255, 255, 255];
        }
      }
      }
    }
  }
  
  static getMaxHealth() {
    return CONFIG.JOGADOR.VIDA_MAXIMA + upgrades.SAUDE;
  }
  
  static getDamageMultiplier() {
    return 1 + (upgrades.DANO * 0.3); // 30% mais dano por nível
  }
}

// ===========================================
// INTERFACE DA LOJA
// ===========================================

function desenharLoja() {
  // Fundo da loja
  fill(...CONFIG.LOJA.COR_FUNDO);
  rect(0, 0, width, height);
  
  // Título
  fill(...CONFIG.LOJA.COR_TITULO);
  textAlign(CENTER, TOP);
  textSize(32);
  text("LOJA DE UPGRADES", width/2, 30);
  
  // Moedas disponíveis
  fill(...CONFIG.LOJA.COR_PRECO);
  textSize(20);
  text(`Moedas: ${moedasJogador}`, width/2, 70);
  
  // Instruções
  fill(...CONFIG.LOJA.COR_TEXTO);
  textSize(14);
  text("Clique nos upgrades para comprar | Pressione ESC para fechar", width/2, 100);
  
  // Desenhar upgrades
  let tiposUpgrade = Object.keys(CONFIG.UPGRADES);
  let startX = (width - (CONFIG.LOJA.ITENS_POR_LINHA * CONFIG.LOJA.LARGURA_ITEM + (CONFIG.LOJA.ITENS_POR_LINHA - 1) * CONFIG.LOJA.PADDING)) / 2;
  let startY = 140;
  
  for (let i = 0; i < tiposUpgrade.length; i++) {
    let tipoUpgrade = tiposUpgrade[i];
    let config = CONFIG.UPGRADES[tipoUpgrade];
    
    let col = i % CONFIG.LOJA.ITENS_POR_LINHA;
    let row = Math.floor(i / CONFIG.LOJA.ITENS_POR_LINHA);
    
    let x = startX + col * (CONFIG.LOJA.LARGURA_ITEM + CONFIG.LOJA.PADDING);
    let y = startY + row * (CONFIG.LOJA.ALTURA_ITEM + CONFIG.LOJA.PADDING);
    
    desenharItemUpgrade(x, y, tipoUpgrade, config);
  }
}

function desenharItemUpgrade(x, y, tipoUpgrade, config) {
  let nivelAtual = upgrades[tipoUpgrade];
  let nivelMaximo = config.NIVEL_MAXIMO;
  let preco = SistemaLojaUpgrades.getUpgradePrice(tipoUpgrade);
  let podeComprar = SistemaLojaUpgrades.canAffordUpgrade(tipoUpgrade);
  let estaNoMaximo = nivelAtual >= nivelMaximo;
  
  // Fundo do item
  if (estaNoMaximo) {
    fill(60, 60, 60);
  } else if (podeComprar) {
    fill(40, 80, 40);
  } else {
    fill(80, 40, 40);
  }
  
  // Destaque se mouse estiver sobre
  if (mouseX >= x && mouseX <= x + CONFIG.LOJA.LARGURA_ITEM &&
      mouseY >= y && mouseY <= y + CONFIG.LOJA.ALTURA_ITEM) {
    fill(red(color(...CONFIG.LOJA.COR_FUNDO)) + 40,
         green(color(...CONFIG.LOJA.COR_FUNDO)) + 40,
         blue(color(...CONFIG.LOJA.COR_FUNDO)) + 40);
  }
  
  rect(x, y, CONFIG.LOJA.LARGURA_ITEM, CONFIG.LOJA.ALTURA_ITEM);
  
  // Ícone do upgrade
  fill(...config.COR_ICONE);
  ellipse(x + CONFIG.LOJA.LARGURA_ITEM/2, y + 25, 30);
  
  // Nome do upgrade
  fill(...CONFIG.LOJA.COR_TEXTO);
  textAlign(CENTER, TOP);
  textSize(14);
  text(config.NOME, x + CONFIG.LOJA.LARGURA_ITEM/2, y + 45);
  
  // Nível atual
  textSize(12);
  text(`Nível: ${nivelAtual}/${nivelMaximo}`, x + CONFIG.LOJA.LARGURA_ITEM/2, y + 65);
  
  // Preço
  if (estaNoMaximo) {
    fill(...CONFIG.LOJA.COR_POSSE);
    text("MÁXIMO", x + CONFIG.LOJA.LARGURA_ITEM/2, y + 85);
  } else {
    fill(podeComprar ? [...CONFIG.LOJA.COR_PRECO] : [...CONFIG.LOJA.COR_SEM_DINHEIRO]);
    text(`${preco} moedas`, x + CONFIG.LOJA.LARGURA_ITEM/2, y + 85);
  }
  
  // Descrição
  fill(...CONFIG.LOJA.COR_TEXTO);
  textSize(10);
  text(config.DESCRICAO, x + CONFIG.LOJA.LARGURA_ITEM/2, y + 100);
}

function handleShopClick() {
  if (!mostrarLoja) return;
  
  let tiposUpgrade = Object.keys(CONFIG.UPGRADES);
  let startX = (width - (CONFIG.LOJA.ITENS_POR_LINHA * CONFIG.LOJA.LARGURA_ITEM + (CONFIG.LOJA.ITENS_POR_LINHA - 1) * CONFIG.LOJA.PADDING)) / 2;
  let startY = 140;
  
  for (let i = 0; i < tiposUpgrade.length; i++) {
    let tipoUpgrade = tiposUpgrade[i];
    
    let col = i % CONFIG.LOJA.ITENS_POR_LINHA;
    let row = Math.floor(i / CONFIG.LOJA.ITENS_POR_LINHA);
    
    let x = startX + col * (CONFIG.LOJA.LARGURA_ITEM + CONFIG.LOJA.PADDING);
    let y = startY + row * (CONFIG.LOJA.ALTURA_ITEM + CONFIG.LOJA.PADDING);
    
    if (mouseX >= x && mouseX <= x + CONFIG.LOJA.LARGURA_ITEM &&
        mouseY >= y && mouseY <= y + CONFIG.LOJA.ALTURA_ITEM) {
      
      if (SistemaLojaUpgrades.buyUpgrade(tipoUpgrade)) {
        // Efeito visual de compra - Usar a função global emitirParticulas
        emitirParticulas(x + CONFIG.LOJA.LARGURA_ITEM / 2, y + CONFIG.LOJA.ALTURA_ITEM / 2, {
          quantidade: 10,
          cor: CONFIG.UPGRADES[tipoUpgrade].COR_ICONE,
          velocidade: [1, 3],
          vida: 30
        });
      }
      break;
    }
  }
}

// Verifique se CONFIG e CONFIG.PLAYER existem antes de acessar
if (CONFIG && CONFIG.PLAYER && CONFIG.PLAYER.VIDA_MAXIMA) {
  jogador.maxHealth = CONFIG.PLAYER.VIDA_MAXIMA;
}