class LobbyState extends EstadoBase {
  constructor() {
    super();
    this.portal = { x: null, y: null, r: 40 };
    this.prompt = '';

    // Estações do lobby (estilo Soul Knight: estátuas/terminais)
    this.stations = {
      character: { x: null, y: null, r: 35, label: 'Personagem' },
      weapon: { x: null, y: null, r: 35, label: 'Arma' },
      biome: { x: null, y: null, r: 35, label: 'Bioma' },
      vendor: { x: null, y: null, r: 38, label: 'Loja' },
      sigils: { x: null, y: null, r: 34, label: 'Sigils' },
      lore: { x: null, y: null, r: 30, label: 'Arquivo' },
      trial: { x: null, y: null, r: 36, label: 'Trial' },
      dummy: { x: null, y: null, r: 28, label: 'Treino' }
    };

    // UI State
    this.activePanel = null; // 'CHAR' | 'WEAPON' | 'BIOME' | 'SIGILS' | 'LORE' | 'TRIAL' | null
    this.charIndex = 0;
    this.weaponIndex = 0;
    this.biomeIndex = 0;
    this.trialIndex = 0; // seleção de trial

    // Usa os dados de personagens carregados do JSON
    this.characterIds = Object.keys(dadosPersonagens);
    // Biomas disponíveis do runConfig (caso não carregado, fallback)
    this.biomeKeys = (window.runConfig && runConfig.BIOMES) ? Object.keys(runConfig.BIOMES) : ['FOREST'];

    // Mutators (Sigils) simples
    this.mutators = [
      { key: 'GLASS_CANNON', name: 'Glass Cannon', desc: '+DANO, -VIDA', enabled: false },
      { key: 'HEAVY_GRAV', name: 'Gravidade Pesada', desc: 'Menos mobilidade', enabled: false },
      { key: 'RICHER_LOOT', name: 'Tesouros', desc: 'Mais moedas/itens', enabled: false }
    ];

    // Trials disponíveis
    this.trials = [
      { key: 'NO_DASH', name: 'Sem Dash' },
      { key: 'TIMED', name: 'Contra o Tempo' },
      { key: 'RICOCHET_ONLY', name: 'Tiros Ricochete' }
    ];

    // [REMOVIDO] Jogo será solo; P2 desativado
    this.coopJoined = false;
    this.player2 = null;

    // Base de ambientação (sem sprites)
    this._roomPad = 36; // margem das paredes
    this._torches = []; // posições das tochas
    this.pets = [];     // pequenos mascotes circulando
    this.npcs = [];     // NPCs estáticos
  }

  entrar() {
    inimigos = [];
    projeteisInimigos = [];
    powerUps = [];
    moedas = [];
    podeEntrarNoPortal = false;

    // Carregar escolhas persistidas
    const savedChar = localStorage.getItem('profile.character');
    const savedWeapon = localStorage.getItem('profile.weapon');
    const savedBiome = localStorage.getItem('profile.biome');
    if (savedChar && this.characterIds.includes(savedChar)) {
      const idx = this.characterIds.indexOf(savedChar);
      if (idx >= 0) this.charIndex = idx;
    }
    if (savedWeapon && progressaoArmas && progressaoArmas.armasDesbloqueadas) {
      const uw = progressaoArmas.armasDesbloqueadas;
      const widx = uw.indexOf(savedWeapon);
      this.weaponIndex = widx >= 0 ? widx : 0;
    }
    if (savedBiome && this.biomeKeys.length) {
      const bidx = this.biomeKeys.indexOf(savedBiome);
      this.biomeIndex = bidx >= 0 ? bidx : 0;
    }

    // Carregar mutators persistidos
    try {
      const savedMut = JSON.parse(localStorage.getItem('profile.mutators') || '[]');
      this.mutators.forEach(m => { m.enabled = savedMut.includes(m.key); });
    } catch(_) {}

    // Player no centro do canvas
    if (jogador) {
      jogador.x = CONFIG.CANVAS.LARGURA / 2;
      jogador.y = CONFIG.CANVAS.ALTURA / 2;
      jogador.vx = 0;
      jogador.vy = 0;
    }

    // Layout organizado do lobby
    this.layoutLobbyPositions();

    // Inicializar ambientação e atores básicos
    this.initAmbientActors();
  }

  atualizar() {
    if (jogador && typeof jogador.atualizar === 'function') {
      jogador.atualizar();
      // Limitar ao canvas do lobby
      jogador.x = constrain(jogador.x, jogador.tamanho / 2, width - jogador.tamanho / 2);
      jogador.y = constrain(jogador.y, jogador.tamanho / 2, height - jogador.tamanho / 2);
    }

    this.updateAmbientActors();

    // Painéis modais não mudam prompt principal
    if (this.activePanel) return;

    // Calcular prompts por proximidade (ordenado por distância)
    let prompts = [];
    if (jogador) {
      const addIfNear = (ax, ay, r, text) => {
        const d = dist(jogador.x, jogador.y, ax, ay);
        if (d < r + 22) prompts.push({ d, text });
      };
      addIfNear(this.portal.x, this.portal.y, this.portal.r, 'ENTER: Iniciar Run');
      addIfNear(this.stations.trial.x, this.stations.trial.y, this.stations.trial.r, 'ENTER: Trial');
      addIfNear(this.stations.character.x, this.stations.character.y, this.stations.character.r, 'E: Selecionar Personagem');
      addIfNear(this.stations.weapon.x, this.stations.weapon.y, this.stations.weapon.r, 'E: Selecionar Arma');
      addIfNear(this.stations.biome.x, this.stations.biome.y, this.stations.biome.r, 'E: Selecionar Bioma');
      addIfNear(this.stations.vendor.x, this.stations.vendor.y, this.stations.vendor.r, 'E: Loja (Meta)');
      addIfNear(this.stations.sigils.x, this.stations.sigils.y, this.stations.sigils.r, 'E: Sigils (Mutators)');
      addIfNear(this.stations.lore.x, this.stations.lore.y, this.stations.lore.r, 'E: Arquivo (Lore)');
      addIfNear(this.stations.dummy.x, this.stations.dummy.y, this.stations.dummy.r, 'Treino: (WASD para mover)');
    }
    prompts.sort((a, b) => a.d - b.d);
    this.prompt = prompts.slice(0, 2).map(p => p.text).join('   |   ');
  }

  desenhar() {
    // Ambiente base (paredes, piso, tochas)
    this.drawAmbient();

    // Atores do ambiente (pets e NPCs simples)
    this.drawAmbientActors();

    // Estações (render unificado)
    this.drawStation(this.stations.character, [100, 200, 255], 'Personagem');
    this.drawStation(this.stations.weapon,    [255, 180, 100], 'Arma');
    this.drawStation(this.stations.biome,     [160, 220, 160], 'Bioma');
    this.drawStation(this.stations.vendor,    [120, 255, 120], 'Vendedor');
    this.drawStation(this.stations.sigils,    [200, 120, 255], 'Sigils');
    this.drawStation(this.stations.lore,      [100, 200, 180], 'Arquivo');
    this.drawStation(this.stations.dummy,     [200, 90, 90],   'Treino');

    // Portal principal
    push();
    noStroke();
    const t2 = millis() * 0.005;
    const pulse = 0.6 + 0.4 * sin(t2);
    fill(255, 215, 0, 170 + pulse * 60);
    ellipse(this.portal.x, this.portal.y, this.portal.r * (1.6 + 0.2 * sin(t2)));
    fill(255, 235, 120, 60);
    ellipse(this.portal.x, this.portal.y, this.portal.r * 2.6);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text('Portal', this.portal.x, this.portal.y - this.portal.r - 12);
    pop();

    // Portal de Trial
    push();
    const tr = this.stations.trial;
    noStroke();
    fill(120, 200, 255, 180);
    ellipse(tr.x, tr.y, tr.r * 2.2);
    fill(230);
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Trial', tr.x, tr.y - tr.r - 10);
    pop();

    // Player 1
    if (jogador && typeof jogador.desenhar === 'function') jogador.desenhar();

    // Seleções atuais (HUD do lobby)
    this.drawSelectionsHUD();

    // Prompt
    if (!this.activePanel && this.prompt) {
      push();
      fill(255, 255, 0);
      textAlign(CENTER, CENTER);
      textSize(16);
      text(this.prompt, width / 2, height - 40);
      pop();
    }

    // Título
    push();
    textAlign(CENTER, TOP);
    textSize(24);
    fill(200);
    text('Lobby', width / 2, 16);
    pop();

    // Painéis
    if (this.activePanel) LobbyUI.desenharPainelAtivo(this);
  }

  drawStation(st, color, label) {
    push();
    noStroke();
    fill(color[0], color[1], color[2], 160);
    ellipse(st.x, st.y, st.r * 2);
    // Placa unificada
    const w = max(textWidth(label) + 14, 52);
    fill(30, 32, 40, 200);
    rectMode(CENTER);
    rect(st.x, st.y + st.r + 10, w, 18, 4);
    fill(220);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(label, st.x, st.y + st.r + 10);
    pop();
  }

  drawSelectionsHUD() {
    const charId = this.characterIds[this.charIndex];
    const currentChar = dadosPersonagens[charId] || { nome: 'Desconhecido' };
    const uw = (progressaoArmas && progressaoArmas.armasDesbloqueadas) ? progressaoArmas.armasDesbloqueadas : ['RIFLE'];
    const currentWeapon = uw[Math.max(0, Math.min(this.weaponIndex, uw.length - 1))] || 'RIFLE';
    const currentBiome = this.biomeKeys[Math.max(0, Math.min(this.biomeIndex, this.biomeKeys.length - 1))] || 'FOREST';

    // Mutators ativos (compacto)
    const mut = this.mutators.filter(m => m.enabled).map(m => m.name).join(', ') || 'Nenhum';

    push();
    textAlign(LEFT, TOP);
    textSize(14);
    fill(200);
    text(`Personagem: ${currentChar.name}  |  Arma: ${currentWeapon}  |  Bioma: ${currentBiome}  |  Sigils: ${mut}`, 20, 20);
    pop();
  }

  aoPressionarTecla() {
    // Painéis ativos têm prioridade
    if (this.activePanel === 'CHAR') {
      if (keyCode === LEFT_ARROW) this.charIndex = (this.charIndex - 1 + this.characterIds.length) % this.characterIds.length;
      else if (keyCode === RIGHT_ARROW) this.charIndex = (this.charIndex + 1) % this.characterIds.length;
      else if (keyCode === ENTER) {
        const chosenId = this.characterIds[this.charIndex];
        localStorage.setItem('profile.character', chosenId);
        this.activePanel = null;
      } else if (keyCode === ESCAPE) {
        this.activePanel = null;
      } else if (key === 'q' || key === 'Q') {
        this.activePanel = 'BIOME';
      } else if (key === 'e' || key === 'E') {
        this.activePanel = 'WEAPON';
      }
      return;
    }

    if (this.activePanel === 'WEAPON') {
      const uw = (progressaoArmas && progressaoArmas.armasDesbloqueadas) ? progressaoArmas.armasDesbloqueadas : ['RIFLE'];
      if (keyCode === LEFT_ARROW) this.weaponIndex = (this.weaponIndex - 1 + uw.length) % uw.length;
      else if (keyCode === RIGHT_ARROW) this.weaponIndex = (this.weaponIndex + 1) % uw.length;
      else if (keyCode === ENTER) {
        const chosenW = uw[Math.max(0, Math.min(this.weaponIndex, uw.length - 1))] || 'RIFLE';
        localStorage.setItem('profile.weapon', chosenW);
        this.activePanel = null;
      } else if (keyCode === ESCAPE) {
        this.activePanel = null;
      } else if (key === 'q' || key === 'Q') {
        this.activePanel = 'CHAR';
      } else if (key === 'e' || key === 'E') {
        this.activePanel = 'BIOME';
      }
      return;
    }

    if (this.activePanel === 'BIOME') {
      if (this.biomeKeys.length === 0) { this.activePanel = null; return; }
      if (keyCode === LEFT_ARROW) this.biomeIndex = (this.biomeIndex - 1 + this.biomeKeys.length) % this.biomeKeys.length;
      else if (keyCode === RIGHT_ARROW) this.biomeIndex = (this.biomeIndex + 1) % this.biomeKeys.length;
      else if (keyCode === ENTER) {
        const chosenB = this.biomeKeys[Math.max(0, Math.min(this.biomeIndex, this.biomeKeys.length - 1))];
        localStorage.setItem('profile.biome', chosenB);
        this.activePanel = null;
      } else if (keyCode === ESCAPE) {
        this.activePanel = null;
      } else if (key === 'q' || key === 'Q') {
        this.activePanel = 'WEAPON';
      } else if (key === 'e' || key === 'E') {
        this.activePanel = 'CHAR';
      }
      return;
    }

    if (this.activePanel === 'SIGILS') {
      // Toggle simples por 1/2/3
      if (key === '1') this.mutators[0] && (this.mutators[0].enabled = !this.mutators[0].enabled);
      if (key === '2') this.mutators[1] && (this.mutators[1].enabled = !this.mutators[1].enabled);
      if (key === '3') this.mutators[2] && (this.mutators[2].enabled = !this.mutators[2].enabled);
      if (keyCode === ENTER) {
        const enabled = this.mutators.filter(m => m.enabled).map(m => m.key);
        localStorage.setItem('profile.mutators', JSON.stringify(enabled));
        this.activePanel = null;
      } else if (keyCode === ESCAPE) {
        this.activePanel = null;
      }
      return;
    }

    if (this.activePanel === 'LORE') {
      if (keyCode === ESCAPE || keyCode === ENTER) {
        this.activePanel = null;
      }
      return;
    }

    if (this.activePanel === 'TRIAL') {
      if (keyCode === LEFT_ARROW) this.trialIndex = (this.trialIndex - 1 + this.trials.length) % this.trials.length;
      else if (keyCode === RIGHT_ARROW) this.trialIndex = (this.trialIndex + 1) % this.trials.length;
      else if (keyCode === ENTER) {
        const chosen = this.trials[this.trialIndex];
        localStorage.setItem('profile.trial', chosen.key);
        // iniciar imediatamente
        resetGame();
        window.currentRunConfig = window.currentRunConfig || {};
        window.currentRunConfig.MODE = 'TRIAL';
        window.currentRunConfig.TRIAL = chosen.key;
        gerenciadorEstadoJogo.mudarEstado('PLAYING');
      } else if (keyCode === ESCAPE) {
        this.activePanel = null;
      }
      return;
    }

    // Interações gerais do lobby
    if (keyCode === ENTER && jogador) {
      const dPortal = dist(jogador.x, jogador.y, this.portal.x, this.portal.y);
      if (dPortal < this.portal.r + 20) {
        // Solo: nenhuma flag de co-op
        resetGame();
        // aplicar mutators/trial básicos na run atual
        try {
          const enabled = JSON.parse(localStorage.getItem('profile.mutators') || '[]');
          window.currentRunConfig = window.currentRunConfig || {};
          window.currentRunConfig.MODIFIERS = enabled;
          window.currentRunConfig.MODE = 'NORMAL';
        } catch(_) {}
        gerenciadorEstadoJogo.mudarEstado('PLAYING');
        return;
      }
      // Portal de Trial
      const dTrial = dist(jogador.x, jogador.y, this.stations.trial.x, this.stations.trial.y);
      if (dTrial < this.stations.trial.r + 20) {
        this.activePanel = 'TRIAL';
        return;
      }
    }

    if ((key === 'e' || key === 'E') && jogador) {
      const dc = dist(jogador.x, jogador.y, this.stations.character.x, this.stations.character.y);
      if (dc < this.stations.character.r + 20) {
        this.activePanel = 'CHAR';
        return;
      }
      const dw = dist(jogador.x, jogador.y, this.stations.weapon.x, this.stations.weapon.y);
      if (dw < this.stations.weapon.r + 20) {
        this.activePanel = 'WEAPON';
        // alinhar o índice com armas desbloqueadas atuais
        const uw = (progressaoArmas && progressaoArmas.armasDesbloqueadas) ? progressaoArmas.armasDesbloqueadas : ['RIFLE'];
        const savedWeapon = localStorage.getItem('profile.weapon');
        const widx = savedWeapon ? uw.indexOf(savedWeapon) : -1;
        this.weaponIndex = widx >= 0 ? widx : Math.min(this.weaponIndex, uw.length - 1);
        return;
      }
      const db = dist(jogador.x, jogador.y, this.stations.biome.x, this.stations.biome.y);
      if (db < this.stations.biome.r + 20) {
        this.activePanel = 'BIOME';
        const savedBiome = localStorage.getItem('profile.biome');
        const bidx = savedBiome ? this.biomeKeys.indexOf(savedBiome) : -1;
        this.biomeIndex = bidx >= 0 ? bidx : Math.min(this.biomeIndex, this.biomeKeys.length - 1);
        return;
      }
      const dv = dist(jogador.x, jogador.y, this.stations.vendor.x, this.stations.vendor.y);
      if (dv < this.stations.vendor.r + 20) {
        // Abrir loja no lobby
        window.__shopFromLobby = true;
        mostrarLoja = true;
        return;
      }
      const ds = dist(jogador.x, jogador.y, this.stations.sigils.x, this.stations.sigils.y);
      if (ds < this.stations.sigils.r + 20) {
        this.activePanel = 'SIGILS';
        return;
      }
      const dl = dist(jogador.x, jogador.y, this.stations.lore.x, this.stations.lore.y);
      if (dl < this.stations.lore.r + 20) {
        this.activePanel = 'LORE';
        return;
      }
    }
  }

  // ---------- Ambientação básica (sem sprites) ----------
  initAmbientActors() {
    // Tochas em paredes (quatro cantos e meio das laterais)
    const p = this._roomPad;
    this._torches = [
      { x: p + 40, y: p + 30 },
      { x: width - p - 40, y: p + 30 },
      { x: p + 40, y: height - p - 30 },
      { x: width - p - 40, y: height - p - 30 },
      { x: width / 2, y: p + 28 },
      { x: width / 2, y: height - p - 28 }
    ];

    // Pets simples (2)
    if (!this.pets.length) {
      for (let i = 0; i < 2; i++) {
        this.pets.push({
          x: width / 2 + random(-120, 120),
          y: height / 2 + random(-80, 80),
          r: 10,
          color: i === 0 ? [230, 200, 160] : [180, 200, 240],
          vx: random(-0.8, 0.8),
          vy: random(-0.8, 0.8),
          changeIn: random(600, 1600)
        });
      }
    }

    // Um NPC estático de exemplo (assistente)
    if (!this.npcs.length) {
      this.npcs.push({ x: this._roomPad + 70, y: height - this._roomPad - 70, r: 14, label: 'Assistente' });
    }
  }

  updateAmbientActors() {
    // Wander simples dos pets
    const p = this._roomPad;
    const minX = p + 20, maxX = width - p - 20;
    const minY = p + 20, maxY = height - p - 20;
    const now = millis();
    for (let pet of this.pets) {
      pet.changeIn -= deltaTime;
      if (pet.changeIn <= 0) {
        pet.vx = constrain(pet.vx + random(-0.6, 0.6), -1.2, 1.2);
        pet.vy = constrain(pet.vy + random(-0.6, 0.6), -1.2, 1.2);
        pet.changeIn = random(500, 1500);
      }
      pet.x += pet.vx;
      pet.y += pet.vy;
      // manter dentro da sala
      if (pet.x < minX || pet.x > maxX) pet.vx *= -1, pet.x = constrain(pet.x, minX, maxX);
      if (pet.y < minY || pet.y > maxY) pet.vy *= -1, pet.y = constrain(pet.y, minY, maxY);
      // evitar ficar muito perto do portal
      const dd = dist(pet.x, pet.y, this.portal.x, this.portal.y);
      if (dd < this.portal.r + 30) {
        const ang = atan2(pet.y - this.portal.y, pet.x - this.portal.x);
        pet.vx += 0.3 * cos(ang);
        pet.vy += 0.3 * sin(ang);
      }
    }
  }

  drawAmbient() {
    // Fundo
    background(22, 20, 26);

    // Piso de "madeira" em listras
    noStroke();
    for (let y = this._roomPad; y < height - this._roomPad; y += 20) {
      const shade = 70 + (y % 40 === 0 ? 12 : 0);
      fill(90, 70, shade);
      rect(this._roomPad, y, width - this._roomPad * 2, 18);
    }

    // Paredes de pedra (moldura)
    push();
    noFill();
    stroke(60, 60, 80);
    strokeWeight(8);
    rect(this._roomPad, this._roomPad, width - this._roomPad * 2, height - this._roomPad * 2, 10);
    stroke(30, 30, 46);
    strokeWeight(2);
    rect(this._roomPad + 8, this._roomPad + 8, width - (this._roomPad + 8) * 2, height - (this._roomPad + 8) * 2, 8);
    pop();

    // Tochas com glow (flicker leve)
    const t = millis() * 0.003;
    for (let tc of this._torches) {
      const flick = 40 + 20 * sin(t + tc.x * 0.02 + tc.y * 0.03);
      noStroke();
      fill(255, 150, 60, 40 + flick * 0.6);
      ellipse(tc.x, tc.y, 140, 140);
      fill(255, 200, 100, 80 + flick);
      ellipse(tc.x, tc.y, 70, 70);
      // base da tocha
      fill(80, 60, 40);
      rect(tc.x - 3, tc.y + 10, 6, 16, 2);
      fill(255, 180, 80);
      triangle(tc.x, tc.y - 8, tc.x - 6, tc.y + 4, tc.x + 6, tc.y + 4);
    }
  }

  drawAmbientActors() {
    // NPCs estáticos
    for (let n of this.npcs) {
      push();
      noStroke();
      fill(140, 180, 220);
      ellipse(n.x, n.y, n.r * 2);
      fill(255);
      textAlign(CENTER, BOTTOM);
      textSize(12);
      text(n.label || 'NPC', n.x, n.y - n.r - 6);
      pop();
    }

    // Pets simples
    for (let pet of this.pets) {
      push();
      noStroke();
      fill(pet.color[0], pet.color[1], pet.color[2]);
      ellipse(pet.x, pet.y, pet.r * 2, pet.r * 1.6);
      // orelhas/cauda simples
      fill(pet.color[0] * 0.8, pet.color[1] * 0.8, pet.color[2] * 0.8);
      ellipse(pet.x - pet.r * 0.6, pet.y - pet.r * 0.6, 5, 7);
      ellipse(pet.x + pet.r * 0.6, pet.y - pet.r * 0.6, 5, 7);
      pop();
    }
  }

  layoutLobbyPositions() {
    // Grade simples: 3 colunas x 2 linhas ao redor do portal
    const cx = CONFIG.CANVAS.LARGURA / 2;
    const cy = CONFIG.CANVAS.ALTURA / 2;
    this.portal.x = cx;
    this.portal.y = cy + 150;

    const dx = 220, dy = 110;
    // Linha superior: Bioma ao centro, Lore à esquerda, Trial à direita
    this.stations.lore.x   = cx - dx;
    this.stations.lore.y   = cy - dy;
    this.stations.biome.x  = cx;
    this.stations.biome.y  = cy - dy;
    this.stations.trial.x  = cx + dx;
    this.stations.trial.y  = cy - dy;

    // Linha do meio: Personagem à esquerda, Sigils à direita
    this.stations.character.x = cx - dx;
    this.stations.character.y = cy;
    this.stations.sigils.x    = cx + dx;
    this.stations.sigils.y    = cy;

    // Linha inferior: Vendedor à esquerda, Arma à direita, Dummy próximo do portal
    this.stations.vendor.x = cx - dx;
    this.stations.vendor.y = cy + dy;
    this.stations.weapon.x = cx + dx;
    this.stations.weapon.y = cy + dy;
    this.stations.dummy.x  = cx + 140;
    this.stations.dummy.y  = this.portal.y - 10;
  }
}