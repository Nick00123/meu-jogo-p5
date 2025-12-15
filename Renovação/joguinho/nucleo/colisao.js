// ===========================================
// SISTEMA DE COLISÃO
// ===========================================

function verificarColisoes() {
  if (!jogador || !inimigos || !poolProjeteis) return;

  // 1. Colisão de projéteis (do pool) com entidades
  for (let i = poolProjeteis.emUso.length - 1; i >= 0; i--) {
    const p = poolProjeteis.emUso[i];

    if (p.ehProjetilInimigo) {
      // Projétil inimigo vs. Jogador
      if (dist(p.x, p.y, jogador.x, jogador.y) < (p.tamanho + jogador.tamanho) / 2) {
        jogador.receberDano(p.dano);
        poolProjeteis.liberar(p);
        continue;
      }
    } else {
      // Projétil do jogador vs. Inimigos
      for (let j = inimigos.length - 1; j >= 0; j--) {
        const inimigo = inimigos[j];
        if (dist(p.x, p.y, inimigo.x, inimigo.y) < (p.tamanho + inimigo.tamanho) / 2) {
          const morreu = inimigo.receberDano(p.dano);
          if (morreu) {
            pontuacao += 10;
            inimigos.splice(j, 1);
          }
          
          if (!p.perfurante) {
            poolProjeteis.liberar(p);
            break; // Projétil já foi liberado, sai do loop de inimigos
          }
        }
      }
    }
  }

  // 2. Colisão do jogador com inimigos
  if (!jogador.invulneravel && !jogador.dashAtivo) {
    for (let i = inimigos.length - 1; i >= 0; i--) {
      const inimigo = inimigos[i];
      if (dist(jogador.x, jogador.y, inimigo.x, inimigo.y) < (jogador.tamanho + inimigo.tamanho) / 2) {
        jogador.receberDano(inimigo.dano || 1);
        
        // Empurra o jogador e o inimigo para direções opostas
        const angulo = atan2(jogador.y - inimigo.y, jogador.x - inimigo.x);
        jogador.x += cos(angulo) * 5;
        jogador.y += sin(angulo) * 5;
        inimigo.x -= cos(angulo) * 5;
        inimigo.y -= sin(angulo) * 5;

        if (jogador.vida <= 0) {
          gerenciadorEstadoJogo.mudarEstado('FIM_DE_JOGO');
          break; // Sai do loop se o jogador morrer
        }
      }
    }
  }

  // 3. Colisão do jogador com moedas
  for (let i = moedas.length - 1; i >= 0; i--) {
    const moeda = moedas[i];
    if (dist(jogador.x, jogador.y, moeda.x, moeda.y) < (jogador.tamanho / 2 + moeda.tamanho / 2)) {
      moedasJogador += moeda.valor;
      moedas.splice(i, 1);
    }
  }
}