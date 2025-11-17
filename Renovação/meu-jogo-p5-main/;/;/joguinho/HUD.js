// ===========================================
// INTERFACE DO USUÁRIO (HUD)
// ===========================================

function desenharHUD() {
  // Opacidade configurável (default: 'med' ~ 150)
  let bgAlpha = 150;
  const op = obterConfiguracao('configuracoes.opacidadeHUD', 'med');
  if (op === 'low') bgAlpha = 100;
  else if (op === 'high') bgAlpha = 220;
  // Background for HUD
  fill(0, 0, 0, bgAlpha);
  stroke(255);
  rect(0, 0, width, 80);
  
  // Health
  fill(255, 0, 0);
  textAlign(LEFT, TOP);
  textSize(16);
  text(`Vida: ${jogador.vida}/${UpgradeSystem.getVidaMaxima()}`, 10, 10);
  
  // Score and coins
  fill(255, 255, 0);
  text(`Pontuação: ${pontuacao}`, 10, 30);
  fill(100, 255, 100);
  text(`Moedas: ${totalMoedasObtidas}`, 10, 50);
  
  // Level info
  fill(255, 255, 255);
  text(`Nível: ${nivel}`, 200, 10);
  text(`Inimigos: ${inimigos.length}`, 200, 30);
  
  // Dash cooldown indicator
  let dashCooldownRestante = max(0, CONFIG.JOGADOR.DASH.COOLDOWN - (millis() - jogador.ultimoDash));
  let dashProgresso = 1 - (dashCooldownRestante / CONFIG.JOGADOR.DASH.COOLDOWN);
  
  // Dash bar
  fill(50, 50, 50);
  rect(200, 50, 100, 8);
  fill(jogador.dashAtivo ? [0, 255, 100] : [255, 100, 0]);
  rect(200, 50, 100 * dashProgresso, 8);
  
  fill(255, 255, 255);
  textSize(12);
  text("DASH", 200, 62);
  
  // Current weapon and dash status
  fill(255, 255, 255);
  textSize(14);
  text(`Arma: ${armaJogador.tipo}`, 350, 10);
  
  if (jogador.dashAtivo) {
    fill(255, 255, 0);
    text("DASHANDO!", 350, 30);
  } else if (jogador.podeDash()) {
    fill(0, 255, 100);
    text("DASH PRONTO", 350, 30);
  } else {
    fill(255, 100, 0);
    text(`DASH: ${(dashCooldownRestante/1000).toFixed(1)}s`, 350, 30);
  }
  
  // Sistema visual de slots de armas
  let slotWidth = 40;
  let slotHeight = 25;
  let slotSpacing = 45;
  let totalWidth = (armasDisponiveis.length * slotWidth) + ((armasDisponiveis.length - 1) * slotSpacing);
  let slotX = (width - totalWidth) / 2;
  let slotY = height - 40;
  
  for (let i = 0; i < armasDisponiveis.length; i++) {
    const x = slotX + (i * slotSpacing);
    
    // Destacar o slot ativo
    if (i === indiceArmaAtual) {
      fill(255, 255, 0);
      rect(x - 2, slotY - 2, slotWidth + 4, slotHeight + 4);
    }
    
    // Fundo do slot
    fill(50, 50, 50);
    rect(x, slotY, slotWidth, slotHeight);
    
    // Número do slot
    fill(255, 255, 255);
    textSize(12);
    text(i + 1, x + 8, slotY + 16);
    
    // Indicador de arma disponível
    if (i < armasDisponiveis.length) {
      fill(0, 255, 0);
      circle(x + slotWidth - 10, slotY + 10, 8);
    }
  }
  
  // Shop hint
  fill(150, 150, 150);
  textSize(10);
  text("Aproxime-se do Vendedor (E) para abrir a loja", 350, 50);

  // Legenda opcional de facções (direita da HUD)
  const mostrarLegenda = obterConfiguracao('configuracoes.mostrarLegendaFaccoes', false);
  if (mostrarLegenda && CONFIG && CONFIG.LORE && CONFIG.LORE.BIOMAS && CONFIG.LORE.FACCOES && window.chaveBiomaAtual) {
    const bioma = CONFIG.LORE.BIOMAS[window.chaveBiomaAtual];
    const chavesFaccoes = (bioma && Array.isArray(bioma.faccoes)) ? bioma.faccoes : null;
    if (chavesFaccoes && chavesFaccoes.length) {
      const x0 = width - 260;
      const y0 = 6;
      const lineH = 16;
      const pad = 6;
      const boxW = 250;
      const boxH = pad*2 + lineH * (chavesFaccoes.length + 1);
      // fundo
      noStroke();
      fill(0, 0, 0, 140);
      rect(x0, y0, boxW, boxH, 4);
      // título
      fill(255);
      textAlign(LEFT, TOP);
      textSize(12);
      text(`Facções (${bioma.nome || window.chaveBiomaAtual})`, x0 + pad, y0 + pad);
      // linhas
      let y = y0 + pad + lineH;
      textSize(11);
      for (const fk of chavesFaccoes) {
        const fdef = CONFIG.LORE.FACCOES[fk];
        if (!fdef) continue;
        const c = fdef.cor || [200,200,200];
        // swatch
        noStroke();
        fill(c[0], c[1], c[2]);
        rect(x0 + pad, y + 3, 12, 12, 2);
        // nome
        fill(230);
        text(fdef.nome || fk, x0 + pad + 18, y);
        y += lineH;
      }
    }
  }
}

function desenharMinimapa() {
  const cfg = CONFIG.MINIMAPA;
  const mapaLargura = CONFIG.MAPA.LARGURA;
  const mapaAltura = CONFIG.MAPA.ALTURA;

  const larguraMinimapa = mapaLargura * cfg.ESCALA;
  const alturaMinimapa = mapaAltura * cfg.ESCALA;
  const xMinimapa = width - larguraMinimapa - cfg.MARGEM;
  const yMinimapa = cfg.MARGEM + 80;

  push();
  // Fundo do minimapa
  fill(...cfg.COR_FUNDO);
  noStroke();
  rect(xMinimapa, yMinimapa, larguraMinimapa, alturaMinimapa, cfg.BORDA_RAIO);

  // Função para mapear coordenadas do jogo para o minimapa
  const mapX = (x) => xMinimapa + (x / mapaLargura) * larguraMinimapa;
  const mapY = (y) => yMinimapa + (y / mapaAltura) * alturaMinimapa;

  // Desenhar jogador
  if (jogador) {
    fill(...cfg.COR_JOGADOR);
    ellipse(mapX(jogador.x), mapY(jogador.y), 5, 5);
  }

  // Desenhar inimigos
  if (inimigos && inimigos.length > 0) {
    fill(...cfg.COR_INIMIGO);
    for (const inimigo of inimigos) {
      if (inimigo) {
        ellipse(mapX(inimigo.x), mapY(inimigo.y), 3, 3);
      }
    }
  }

  // Desenhar portal
  if (podeEntrarNoPortal) {
    fill(...cfg.COR_PORTAL);
    ellipse(mapX(portal.x), mapY(portal.y), 5, 5);
  }

  // Borda do minimapa
  stroke(150);
  noFill();
  rect(xMinimapa, yMinimapa, larguraMinimapa, alturaMinimapa, cfg.BORDA_RAIO);
  pop();
}

function desenharNotificacoes() {
  // Esta função pode ser um wrapper se necessário, mas as funções específicas são chamadas diretamente.
}

function desenharNotificacoesBoss() {
  if (!window.notificacoesBoss || window.notificacoesBoss.length === 0) return;

  for (let i = window.notificacoesBoss.length - 1; i >= 0; i--) {
    const notificacao = window.notificacoesBoss[i];
    push();
    textAlign(CENTER, CENTER);
    textSize(32);
    const alpha = map(notificacao.vida, 120, 0, 255, 0);
    fill(notificacao.cor[0], notificacao.cor[1], notificacao.cor[2], alpha);
    text(notificacao.texto, notificacao.x, notificacao.y);
    notificacao.vida--;
    if (notificacao.vida <= 0) {
      window.notificacoesBoss.splice(i, 1);
    }
    pop();
  }
}

function desenharNotificacoesChefe() {
  // Esta função pode ser implementada de forma semelhante a desenharNotificacoesBoss
  // se houver notificações específicas para chefes em window.notificacoesChefe.
  // Por enquanto, deixarei como um placeholder.
  if (!window.notificacoesChefe || window.notificacoesChefe.length === 0) return;
  // Lógica para desenhar notificações de window.notificacoesChefe
}

function desenharBossHUD() {
  const chefe = inimigos.find(inimigo => inimigo instanceof Boss);
  if (!chefe) return;

  const hudWidth = width * 0.6;
  const hudHeight = 60;
  const hudX = (width - hudWidth) / 2;
  const hudY = 90; // Deslocado para baixo para não sobrepor a HUD do jogador

  push();
  // Fundo da HUD
  fill(20, 20, 30, 200);
  stroke(150, 0, 0);
  strokeWeight(2);
  rect(hudX, hudY, hudWidth, hudHeight, 8);

  // Nome do Chefe
  noStroke();
  fill(255, 100, 100);
  textAlign(CENTER, TOP);
  textSize(18);
  text(chefe.name || "BOSS", hudX + hudWidth / 2, hudY + 8);

  // Barra de Vida
  const vidaPercentual = chefe.health / chefe.maxHealth;
  const barraWidth = hudWidth - 20;
  const barraHeight = 15;
  const barraX = hudX + 10;
  const barraY = hudY + 35;

  // Fundo da barra de vida
  fill(50, 0, 0);
  rect(barraX, barraY, barraWidth, barraHeight, 5);

  // Vida atual
  fill(255, 0, 0);
  rect(barraX, barraY, barraWidth * vidaPercentual, barraHeight, 5);

  // Texto da vida
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(`${Math.ceil(chefe.health)} / ${chefe.maxHealth}`, barraX + barraWidth / 2, barraY + barraHeight / 2);
  pop();
}