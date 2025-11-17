// ===========================================
// SISTEMA DE SPAWN DE INIMIGOS
// ===========================================
function spawnarInimigos() {
  // Verificar se é nível de boss
  if (nivel % 5 === 0 && nivel >= 5) {
    spawnarBoss();
    return;
  }
  
  // Get difficulty multiplier
  const dificuldade = dificuldadeAdaptativa.obterMultiplicadorDificuldade();
  let inimigosBase = 3 * dificuldade.taxaSpawnInimigo;
  let inimigosPorNivel = 2 * dificuldade.taxaSpawnInimigo;
  let quantidadeInimigos = Math.floor(inimigosBase + (nivel - 1) * inimigosPorNivel);
  quantidadeInimigos = max(1, quantidadeInimigos); // nunca zero em níveis normais
  
  // Escolher facções plausíveis a partir do bioma atual
  const biomaDef = (CONFIG && CONFIG.LORE && CONFIG.LORE.BIOMAS && window.chaveBiomaAtual) ? CONFIG.LORE.BIOMAS[window.chaveBiomaAtual] : null;
  const faccoesBioma = (biomaDef && biomaDef.faccoes) ? biomaDef.faccoes : ['AUTOMATONS', 'CORRUPTED_FLESH', 'LOST_EXCAVATORS'];
  
  for (let i = 0; i < quantidadeInimigos; i++) {
    let x, y;
    do {
      x = random(50, CONFIG.MAPA.LARGURA - 50);
      y = random(50, CONFIG.MAPA.ALTURA - 50);
    } while (dist(x, y, jogador.x, jogador.y) < 200);
    
    // Determinar tipo de inimigo baseado no nível
    let tipoInimigo = random();
    let inimigoSpawnado = null;
    
    // Enhanced enemy types
    if (nivel >= 5 && tipoInimigo < 0.1) { // 10% de chance
      inimigoSpawnado = new InimigoAprimorado(x, y, 'SNIPER');
    } else if (nivel >= 4 && tipoInimigo < 0.15) { // 5% de chance
      inimigoSpawnado = new InimigoAprimorado(x, y, 'EXPLOSIVE');
    } else if (nivel >= 4 && tipoInimigo < 0.2) { // 5% de chance
      inimigoSpawnado = new InimigoAprimorado(x, y, 'SHIELDED');
    } else if (nivel >= 3 && tipoInimigo < 0.25) { // 5% de chance
      inimigoSpawnado = new InimigoAprimorado(x, y, 'MULTIPLYING');
    } else if (nivel >= 3 && tipoInimigo < 0.3) { // 5% de chance
      inimigoSpawnado = new InimigoAprimorado(x, y, 'TELEPORTER');
    } else if (nivel >= 2 && tipoInimigo < 0.4) { // 10% de chance
      inimigoSpawnado = new InimigoAprimorado(x, y, 'TANK');
    } else {
      inimigoSpawnado = new InimigoAprimorado(x, y, 'NORMAL');
    }
    
    if (inimigoSpawnado) {
      const f = faccoesBioma[Math.floor(random(faccoesBioma.length))];
      inimigoSpawnado.faccao = f;
      aplicarPerksFaccoes(inimigoSpawnado, f);
      inimigos.push(inimigoSpawnado);
    }
  }
}

function aplicarPerksFaccoes(inimigo, faccao) {
  if (!CONFIG || !CONFIG.PERKS || !CONFIG.PERKS[faccao]) {
    return;
  }

  const perks = CONFIG.PERKS[faccao];

  if (perks.vidaEscudo) {
    inimigo.vidaEscudo = perks.vidaEscudo;
    inimigo.escudoMaximo = perks.vidaEscudo;
  }
  if (perks.multiplicadorDano) inimigo.dano *= perks.multiplicadorDano;
  if (perks.multiplicadorCooldownTiro) inimigo.tempoRecargaTiro *= perks.multiplicadorCooldownTiro;
  // Outros perks podem ser adicionados aqui
}

function spawnarBoss() {
  inimigos = [];
  
  const minDist = (CONFIG && CONFIG.INIMIGO && CONFIG.INIMIGO.CHEFE && CONFIG.INIMIGO.CHEFE.DISTANCIA_MINIMA_SPAWN) ? CONFIG.INIMIGO.CHEFE.DISTANCIA_MINIMA_SPAWN : 400;
  let spawnX = CONFIG.MAPA.LARGURA / 2;
  let spawnY = CONFIG.MAPA.ALTURA / 2;

  if (dist(jogador.x, jogador.y, spawnX, spawnY) < minDist) {
    const angulo = random(TWO_PI);
    const raio = minDist + 100;
    spawnX = constrain(jogador.x + cos(angulo) * raio, 50, CONFIG.MAPA.LARGURA - 50);
    spawnY = constrain(jogador.y + sin(angulo) * raio, 50, CONFIG.MAPA.ALTURA - 50);
  }

  let novoBoss;
  if (nivel === 5) {
    // Chefe do nível 5: Gold Mask Ape
    novoBoss = new Boss(spawnX, spawnY, 80, 500, 1);
  } else if (nivel === 10) {
    // Chefe do nível 10: Crystal Guardian
    novoBoss = new Boss2(spawnX, spawnY, 90, 750, 1.2);
  } else if (nivel === 15) {
    // Chefe do nível 15: Demogorgon
    novoBoss = new Boss3(spawnX, spawnY);
  }

  if (novoBoss) inimigos.push(novoBoss);
  
  if (window.notificacoesBoss) {
    window.notificacoesBoss.push({ texto: "CHEFE APARECEU!", cor: [255, 200, 0], vida: 120, x: width/2, y: height/2 });
  }
}