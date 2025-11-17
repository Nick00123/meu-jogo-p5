// ===========================================
// LÓGICA PRINCIPAL DO JOGO (LOOP)
// ===========================================

function desenharJogo() {
  sistemaCamera.aplicar();
  mapaJogo.desenhar();

  if (npcVendedor.ativo) {
    push();
    noStroke();
    fill(120, 255, 120);
    ellipse(npcVendedor.x, npcVendedor.y, npcVendedor.r * 2);
    fill(30, 80, 30);
    ellipse(npcVendedor.x - 8, npcVendedor.y - 5, 6);
    ellipse(npcVendedor.x + 8, npcVendedor.y - 5, 6);
    fill(255);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    text('Vendedor', npcVendedor.x, npcVendedor.y - npcVendedor.r - 6);
    const perto = dist(jogador.x, jogador.y, npcVendedor.x, npcVendedor.y) < npcVendedor.r + 40;
    if (perto) {
      fill(255, 255, 0);
      textAlign(CENTER, TOP);
      text('E: Abrir Loja', npcVendedor.x, npcVendedor.y + npcVendedor.r + 4);
    }
    pop();
  }

  if (podeEntrarNoPortal && inimigos.length === 0) {
    push();
    fill(255, 255, 0, 150 + sin(millis() * 0.01) * 50);
    noStroke();
    ellipse(portal.x, portal.y, portal.tamanho);
    fill(255, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(12);
    text('PORTAL', portal.x, portal.y);
    pop();
  }

  jogador.desenhar();
  
  for (let inimigo of inimigos) {
    if (inimigo.display) { // Se o inimigo tiver o método display (chefes)
      inimigo.display();
    } else { // Caso contrário, usa o método padrão (inimigos normais)
      inimigo.desenhar();
    }
  }
  
  poolProjeteis.desenhar();
  poolParticulas.desenhar();
  
  for (let powerUp of powerUps) {
    powerUp.desenhar();
  }
  
  for (let moeda of moedas) {
    moeda.desenhar();
  }

  sistemaCamera.resetar();

  desenharHUD();
  const mostrarMini = obterConfiguracao('configuracoes.mostrarMinimapa', true);
  if (mostrarMini) desenharMinimapa();
  desenharNotificacoesBoss();
  desenharBossHUD();
  desenharNotificacoesChefe();

  for (const moeda of moedas) {
    moeda.desenhar();
  }
}

function atualizarJogo() {
  sistemaCamera.atualizar();
  jogador.atualizar();
  
  if (gerenciadorPowerUps) gerenciadorPowerUps.atualizar(jogador);

  UpgradeSystem.handleRegeneracao();
  
  if (keyIsDown(49)) trocarArma(0); // '1'
  if (keyIsDown(50)) trocarArma(1); // '2'
  if (keyIsDown(51)) trocarArma(2); // '3'
  if (keyIsDown(52)) trocarArma(3); // '4'
  
  if (keyIsDown(79)) { // 'O'
    let maisProximo = encontrarInimigoMaisProximo();
    if (maisProximo) {
      armaJogador.atirar(jogador.x, jogador.y, maisProximo.x, maisProximo.y);
    }
  }
  
  for (let i = inimigos.length - 1; i >= 0; i--) {
    const inimigo = inimigos[i];

    // Lógica de atualização condicional para lidar com nomes de métodos diferentes
    if (inimigo.update) { // Se for um Chefe (que usa o método 'update')
      inimigo.update(jogador);
    } else { // Se for um inimigo normal (que usa o método 'atualizar')
      inimigo.atualizar(jogador);
      if (inimigo.atirar) inimigo.atirar();
    }

    // Bloco ÚNICO para verificar se o inimigo/chefe foi derrotado
    const vidaInimigo = inimigo.vida ?? inimigo.health; // Pega 'vida' ou 'health'
    if (vidaInimigo <= 0) {
      if (inimigo instanceof Boss) {
        pontuacao += 500; // Bônus por chefe
      }
      droparRecompensas(inimigo.x, inimigo.y);
      inimigos.splice(i, 1);
      continue; // Pula para a próxima iteração, pois o inimigo foi removido
    }
  }
  
  poolProjeteis.atualizar();
  poolParticulas.atualizar();

  checarColisoes();
  
  powerUps = powerUps.filter(p => !p.remover);
  moedas = moedas.filter(m => !m.remover);
  
  if (nivel % 5 === 0 && npcVendedor.ativo) {
    npcVendedor.ativo = false;
  }
  
  if (jogador.vida <= 0) {
    gerenciadorEstadoJogo.mudarEstado('GAME_OVER');
    return;
  }
  
  if (inimigos.length === 0 && !podeEntrarNoPortal) {
    podeEntrarNoPortal = true;
    portalAtivadoEm = millis();
    // Atualiza a posição do portal para um local aleatório
    portal.x = random(100, CONFIG.MAPA.LARGURA - 100);
    portal.y = random(100, CONFIG.MAPA.ALTURA - 100);
    // Garante que não apareça muito perto do jogador
    while (dist(jogador.x, jogador.y, portal.x, portal.y) < 200) {
      portal.x = random(100, CONFIG.MAPA.LARGURA - 100);
      portal.y = random(100, CONFIG.MAPA.ALTURA - 100);
    }
  }
  
  const delayAtivacao = (CONFIG && CONFIG.PORTAL && CONFIG.PORTAL.DELAY_ATIVACAO) ? CONFIG.PORTAL.DELAY_ATIVACAO : 300;
  if (
    podeEntrarNoPortal &&
    (millis() - portalAtivadoEm) >= delayAtivacao &&
    (millis() - ultimaMudancaDeNivel) >= 300 &&
    dist(jogador.x, jogador.y, portal.x, portal.y) < portal.tamanho / 2
  ) {
    proximoNivel();
  }
}

function proximoNivel() {
  nivel++;
  podeEntrarNoPortal = false;
  ultimaMudancaDeNivel = millis();

  if (CONFIG && CONFIG.LORE && CONFIG.LORE.PROGRESSAO) {
    const prog = CONFIG.LORE.PROGRESSAO;
    const idx = Math.min(Math.floor((nivel - 1) / CONFIG.GAMEPLAY.INTERVALO_NIVEL_CHEFE), prog.length - 1);
    window.chaveBiomaAtual = prog[idx];
  }
  
  const intervaloBoss = (CONFIG && CONFIG.GAMEPLAY && CONFIG.GAMEPLAY.INTERVALO_NIVEL_CHEFE) ? CONFIG.GAMEPLAY.INTERVALO_NIVEL_CHEFE : 5;
  const bossDerrotado = ((nivel - 1) % intervaloBoss) === 0;
  progressaoArmas.verificarDesbloqueioArmas(nivel, bossDerrotado);
  armasDisponiveis = progressaoArmas.armasDesbloqueadas;
  
  jogador.x = CONFIG.MAPA.LARGURA / 2;
  jogador.y = CONFIG.MAPA.ALTURA / 2;
  
  // Verifica se o nível ANTERIOR era um nível de chefe para ativar o vendedor
  if (nivel > 1 && (nivel - 1) % intervaloBoss === 0 && !bossDerrotado) {
    npcVendedor.ativo = true;
    const angulo = random(TWO_PI);
    const raio = 180;
    npcVendedor.x = constrain(jogador.x + cos(angulo) * raio, 80, CONFIG.MAPA.LARGURA - 80);
    npcVendedor.y = constrain(jogador.y + sin(angulo) * raio, 80, CONFIG.MAPA.ALTURA - 80);
    inimigos = [];
  } else {
    // Para todos os outros casos (níveis normais e níveis de chefe), spawnamos os inimigos/boss
    npcVendedor.ativo = false;
    spawnarInimigos();
  }
  
  if (pontuacao > recorde) {
    recorde = pontuacao;
    localStorage.setItem('recorde', recorde);
  }
}