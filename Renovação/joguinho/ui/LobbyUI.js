// ===========================================
// Funções de Desenho da UI do Lobby
// ===========================================

const LobbyUI = {
  desenharPainelPersonagem(estado) {
    const charId = estado.characterIds[estado.charIndex];
    const c = dadosPersonagens[charId] || dadosPersonagens['SOLDADO'];
    push();
    this.desenharFundoPainel();

    textAlign(CENTER, TOP);
    textSize(18);
    fill(160, 210, 255);
    text('Seleção de Personagem  (Q/E troca painel)', width / 2, height / 2 - 130);

    noStroke();
    fill(c.cor ? c.cor : [0, 200, 255]);
    ellipse(width / 2, height / 2 - 20, 50);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(`${c.nome}`, width / 2, height / 2 + 30);

    this.desenharInstrucoesPainel();
    pop();
  },

  desenharPainelAdmin(estado) {
    push();
    fill(20, 20, 40, 220);
    noStroke();
    rect(width / 2 - 240, height / 2 - 150, 480, 280, 10);

    textAlign(CENTER, TOP);
    textSize(18);
    fill(255, 215, 0);
    text('Painel de Poderes do Admin', width / 2, height / 2 - 140);

    textAlign(LEFT, TOP);
    textSize(14);
    for (let i = 0; i < estado.adminOptions.length; i++) {
      const opt = estado.adminOptions[i];
      const y = height / 2 - 100 + i * 40;
      fill(opt.enabled ? [255, 220, 120] : [200, 200, 200]);
      text(`${opt.enabled ? '[ATIVO] ' : '[ ] '} ${opt.name} — ${opt.desc}`, width / 2 - 200, y);
    }

    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('Use 1 para alternar, ENTER para salvar, ESC para fechar', width / 2, height / 2 + 120);
    pop();
  },

  desenharPainelTreino(estado) {
    const controles = [
      { keys: ['W', 'A', 'S', 'D'], desc: 'Movimentação do personagem' },
      { keys: ['ESPAÇO'], desc: 'Dash (esquiva rápida)' },
      { keys: ['O'], desc: 'Atirar na direção do inimigo mais próximo' },
      { keys: ['P'], desc: 'Pausar o jogo' },
      { keys: ['E'], desc: 'Interagir com estações' },
      { keys: ['ENTER'], desc: 'Confirmar seleção / Interagir' },
      { keys: ['ESC'], desc: 'Fechar painéis / Voltar' },
      { keys: ['←', '→', '↑', '↓'], desc: 'Navegar em menus e painéis' }
    ];

    push();
    // Desenha um fundo maior, específico para este painel
    fill(20, 20, 40, 220);
    noStroke();
    rectMode(CENTER);
    rect(width / 2, height / 2, 480, 380, 10);

    textAlign(CENTER, TOP);
    textSize(22);
    fill(200, 90, 90);
    text('Controles do Jogo', width / 2, height / 2 - 140);

    textAlign(LEFT, TOP);
    textSize(14);
    const startX = width / 2 - 200;
    let yPos = height / 2 - 90;

    for (const controle of controles) {
      // Desenha as teclas
      let xOffset = 0;
      for (const key of controle.keys) {
        const keyWidth = textWidth(key) + 12;
        fill(20, 20, 30);
        rectMode(CORNER); // Garante que o retângulo da tecla seja desenhado corretamente
        stroke(150);
        rect(startX + xOffset, yPos - 8, keyWidth, 24, 5);
        
        noStroke();
        fill(230);
        textAlign(CENTER, CENTER);
        text(key, startX + xOffset + keyWidth / 2, yPos + 4);
        xOffset += keyWidth + 8;
      }

      // Desenha a descrição
      textAlign(LEFT, CENTER);
      fill(200);
      text(`- ${controle.desc}`, startX + 140, yPos + 4);
      yPos += 35;
    }
    pop();
  },

  desenharPainelLore() {
    const entries = [
      { key: 'intro', name: 'Origens da Mina', unlocked: true },
      { key: 'boss1', name: 'Guardião da Entrada', unlocked: !!localStorage.getItem('codex.boss1') },
      { key: 'boss2', name: 'Arquitetos', unlocked: !!localStorage.getItem('codex.boss2') }
    ];

    push();
    fill(20, 20, 40, 220);
    noStroke();
    rect(width / 2 - 260, height / 2 - 160, 520, 300, 10);

    textAlign(CENTER, TOP);
    textSize(18);
    fill(120, 220, 200);
    text('Arquivo (Lore)', width / 2, height / 2 - 150);

    textAlign(LEFT, TOP);
    textSize(14);
    let y = height / 2 - 110;
    for (const e of entries) {
      fill(e.unlocked ? [230, 230, 230] : [140, 140, 140]);
      text(`${e.unlocked ? '•' : '×'} ${e.name}`, width / 2 - 220, y);
      y += 28;
    }

    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('ESC para fechar', width / 2, height / 2 + 130);
    pop();
  },

  // Funções auxiliares de desenho
  desenharFundoPainel() {
    fill(20, 20, 40, 220);
    noStroke();
    rect(width / 2 - 220, height / 2 - 140, 440, 260, 10);
  },

  desenharInstrucoesPainel() {
    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('← → para trocar, ENTER para confirmar, ESC para fechar', width / 2, height / 2 + 90);
  },

  desenharPainelAtivo(estadoLobby) {
    if (!estadoLobby || !estadoLobby.activePanel) return;
    switch (estadoLobby.activePanel) {
      case 'ADMIN':
        this.desenharPainelAdmin(estadoLobby);
        break;
      case 'LORE':
        this.desenharPainelLore(estadoLobby);
        break;
      case 'TRAINING':
        this.desenharPainelTreino(estadoLobby);
        break;
      // painéis extras podem ser adicionados conforme necessário
      default:
        // fallback: não desenha nada se o painel não for reconhecido
        break;
    }
  }
};