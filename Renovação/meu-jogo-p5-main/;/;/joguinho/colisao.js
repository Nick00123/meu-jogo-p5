// ===========================================
// SISTEMA DE COLISÕES OTIMIZADO
// ===========================================

function verificarColisoes() {
  if (!window.gerenciadorQuadTree) return;
  
  // Atualizar QuadTree com todos os objetos que podem colidir
  // Adicionar o jogador à QuadTree para colisões com projéteis inimigos
  const objetosColidiveis = [...inimigos, jogador, ...powerUps];
  gerenciadorQuadTree.atualizar(objetosColidiveis);
  
  // Verificar colisões para todos os projéteis ativos
  for (let i = poolProjeteis.objetosAtivos.length - 1; i >= 0; i--) {
    const projetil = poolProjeteis.objetosAtivos[i];
    
    // Usar a QuadTree para encontrar objetos próximos
    const areaBusca = new Retangulo(
      projetil.x, 
      projetil.y, 
      projetil.tamanho * 2, 
      projetil.tamanho * 2
    );
    
    if (projetil.ehProjetilInimigo) {
      // Projétil inimigo vs. jogador
      const objetosProximos = gerenciadorQuadTree.consultar(areaBusca, obj => obj === jogador);
      if (objetosProximos.length > 0) {
        const distancia = dist(projetil.x, projetil.y, jogador.x, jogador.y);
        if (distancia < (jogador.tamanho + projetil.tamanho) / 2) {
          jogador.receberDano(projetil.dano);
          poolProjeteis.liberar(projetil);
          emitirParticulas(projetil.x, projetil.y, { cor: [255, 0, 0] });
        }
      }
    } else {
      // Projétil do jogador vs. inimigos
      const objetosProximos = gerenciadorQuadTree.consultar(areaBusca, obj => obj.receberDano && obj !== jogador);
      for (const inimigo of objetosProximos.map(p => p.objeto)) { // Extrai o objeto do resultado da quadtree
        const distancia = dist(projetil.x, projetil.y, inimigo.x, inimigo.y);
        const raioColisao = (projetil.tamanho + (inimigo.tamanho || 10)) / 2;
        
        if (distancia < raioColisao) {
          let inimigoDestruido = inimigo.receberDano(projetil.dano);
          
          if (projetil.sinalizador) {
            const chance = projetil.chanceQueimar || 0.35;
            if (random() < chance) {
              const agora = millis();
              const dps = projetil.danoPorSegundo || 2;
              const duracao = projetil.tempoQueimaMs || 3000;
              inimigo.queimando = { 
                ate: agora + duracao, 
                dps: dps, 
                ultimoTick: 0 
              };
            }
          }
          
          poolProjeteis.liberar(projetil);
          emitirParticulas(inimigo.x, inimigo.y, { cor: inimigo.config?.COR || [255, 0, 0] });
          
          if (inimigoDestruido) {
            if (inimigo.tipo === 'EXPLOSIVE' && typeof inimigo.explodir === 'function' && inimigo.vida <= 0) { // Garante que só explode se realmente morrer
              inimigo.explodir();
            }
            efeitoFaccaoAoMorrer(inimigo);
            pontuacao += obterPontuacaoInimigo(inimigo.tipo);
            const index = inimigos.indexOf(inimigo);
            if (index > -1) inimigos.splice(index, 1);
            droparRecompensas(inimigo.x, inimigo.y);
          }
          break; // Projétil já colidiu, não precisa checar outros inimigos
        }
      }
    }
  }

  // Verificar colisões do jogador com power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    if (powerUp.verificarColisao(jogador)) {
      powerUp.coletar(jogador);
      powerUps.splice(i, 1);
    }
  }

  // Colisão de contato direto (corpo a corpo) entre jogador e inimigos
  for (let i = inimigos.length - 1; i >= 0; i--) {
    const inimigo = inimigos[i];
    if (!inimigo) continue;

    const distancia = dist(jogador.x, jogador.y, inimigo.x, inimigo.y);
    const raioColisao = (jogador.tamanho / 2) + (inimigo.tamanho / 2);

    if (distancia < raioColisao) {
      // Chefe causa mais dano de contato
      const danoContato = (inimigo instanceof Boss) ? 5 : 1;
      jogador.receberDano(danoContato);
      // A função receberDano do jogador já lida com a invencibilidade
    }
  }
}