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

  desenharPainelArma(estado) {
    const uw = (weaponProgression && weaponProgression.unlockedWeapons) ? weaponProgression.unlockedWeapons : ['RIFLE'];
    const w = uw[Math.max(0, Math.min(estado.weaponIndex, uw.length - 1))] || 'RIFLE';
    push();
    this.desenharFundoPainel();

    textAlign(CENTER, TOP);
    textSize(18);
    fill(255, 210, 160);
    text('Seleção de Arma  (Q/E troca painel)', width / 2, height / 2 - 130);

    textAlign(CENTER, CENTER);
    textSize(16);
    fill(230);
    text(`${w}`, width / 2, height / 2 - 20);

    this.desenharInstrucoesPainel();
    pop();
  },

  desenharPainelBioma(estado) {
    const key = estado.biomeKeys[Math.max(0, Math.min(estado.biomeIndex, estado.biomeKeys.length - 1))] || 'FOREST';
    const b = (window.runConfig && runConfig.BIOMES && runConfig.BIOMES[key]) ? runConfig.BIOMES[key] : { name: 'Floresta', mapBackground: [30, 120, 30] };

    push();
    this.desenharFundoPainel();

    textAlign(CENTER, TOP);
    textSize(18);
    fill(160, 255, 160);
    text('Seleção de Bioma  (Q/E troca painel)', width / 2, height / 2 - 130);

    textAlign(CENTER, CENTER);
    fill(b.mapBackground[0], b.mapBackground[1], b.mapBackground[2], 200);
    rect(width / 2 - 100, height / 2 - 70, 200, 100, 8);
    fill(255);
    textSize(16);
    text(`${b.name}`, width / 2, height / 2 - 20);

    textSize(12);
    fill(180);
    text('← → para trocar, ENTER para confirmar, ESC para fechar', width / 2, height / 2 + 90);
    pop();
  },

  desenharPainelSigils(estado) {
    push();
    fill(20, 20, 40, 220);
    noStroke();
    rect(width / 2 - 240, height / 2 - 150, 480, 280, 10);

    textAlign(CENTER, TOP);
    textSize(18);
    fill(200, 160, 255);
    text('Sigils (Mutators)', width / 2, height / 2 - 140);

    textAlign(LEFT, TOP);
    textSize(14);
    for (let i = 0; i < estado.mutators.length; i++) {
      const m = estado.mutators[i];
      const y = height / 2 - 100 + i * 40;
      const isSelected = (i === estado.selectedOption); // Supondo que você adicione selectedOption para navegação
      fill(m.enabled ? [255, 220, 120] : [200, 200, 200]);
      text(`${m.enabled ? '[ATIVO] ' : '[ ] '} ${m.name} — ${m.desc}`, width / 2 - 200, y);
    }

    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('Use 1/2/3 para alternar, ENTER para salvar, ESC para fechar', width / 2, height / 2 + 120);
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

  desenharPainelTrial(estado) {
    const trial = estado.trials[estado.trialIndex];
    push();
    this.desenharFundoPainel();

    textAlign(CENTER, TOP);
    textSize(18);
    fill(160, 210, 255);
    text('Selecionar Trial', width / 2, height / 2 - 130);

    textAlign(CENTER, CENTER);
    textSize(16);
    fill(230);
    text(`${trial.name}`, width / 2, height / 2 - 20);

    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('← → trocar, ENTER iniciar trial, ESC fechar', width / 2, height / 2 + 90);
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

  desenharPainelAtivo(estado) {
    switch (estado.activePanel) {
      case 'CHAR':
        this.desenharPainelPersonagem(estado);
        break;
      case 'WEAPON':
        this.desenharPainelArma(estado);
        break;
      case 'BIOME':
        this.desenharPainelBioma(estado);
        break;
      case 'SIGILS':
        this.desenharPainelSigils(estado);
        break;
      case 'LORE':
        this.desenharPainelLore();
        break;
      case 'TRIAL':
        this.desenharPainelTrial(estado);
        break;
    }
  }
};