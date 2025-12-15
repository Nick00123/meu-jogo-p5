class EstadoLobby extends EstadoBase {
  constructor() {
    super();
    this.portal = { x: null, y: null, r: 40 };
    this.prompt = '';
    this.podeEntrarNoPortal = false

    // Estações do lobby (estilo Soul Knight: estátuas/terminais)
    this.stations = {
      vendor: { x: null, y: null, r: 38, label: 'Loja' },
      admin: { x: null, y: null, r: 34, label: 'PODER ADMIN' },
      lore: { x: null, y: null, r: 30, label: 'Arquivo' },
      dummy: { x: null, y: null, r: 28, label: 'Controles' }
    };

    // UI State
    this.activePanel = null; // 'ADMIN' | 'LORE' | 'TRAINING' | null
    this.charIndex = 0;

    // Opções do painel de Admin
    this.adminOptions = [
      { key: 'ARMA_ADMIN', name: 'Arma do Admin', desc: 'Equipa a arma "Decreto Divino"', enabled: false },
      { key: 'VIDA_DEUS', name: 'Vida de um Deus', desc: 'Começa o jogo com 999 de vida', enabled: false },
      { key: 'DASH_LUZ', name: 'Velocidade da Luz', desc: 'Cooldown do dash reduzido para 0.2s', enabled: false }
    ];

    // Usa os dados de personagens carregados do JSON
    this.characterIds = Object.keys(dadosPersonagens || {});

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
    powerUps = [];
    moedas = [];
    this.podeEntrarNoPortal = false;
    this.characterIds = Object.keys(dadosPersonagens || {});
    // Carregar escolhas persistidas
    const savedChar = localStorage.getItem('profile.character');
    const savedWeapon = localStorage.getItem('profile.weapon');
    if (savedChar && this.characterIds.includes(savedChar)) {
      const idx = this.characterIds.indexOf(savedChar);
      if (idx >= 0) this.charIndex = idx;
    }

    // Carregar opções de admin persistidas
    try {
      const useAdminWeapon = localStorage.getItem('admin.arma') === 'true';
      this.adminOptions.find(opt => opt.key === 'ARMA_ADMIN').enabled = useAdminWeapon;
      const useGodHealth = localStorage.getItem('admin.vida') === 'true';
      this.adminOptions.find(opt => opt.key === 'VIDA_DEUS').enabled = useGodHealth;
      const useLightDash = localStorage.getItem('admin.dash') === 'true';
      this.adminOptions.find(opt => opt.key === 'DASH_LUZ').enabled = useLightDash;
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
      addIfNear(this.stations.vendor.x, this.stations.vendor.y, this.stations.vendor.r, 'E: Loja (Meta)');
      addIfNear(this.stations.admin.x, this.stations.admin.y, this.stations.admin.r, 'E: Poder Admin');
      addIfNear(this.stations.lore.x, this.stations.lore.y, this.stations.lore.r, 'E: Arquivo (Lore)');
      addIfNear(this.stations.dummy.x, this.stations.dummy.y, this.stations.dummy.r, 'E: Ver Controles');
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
    this.drawStation(this.stations.vendor,    [120, 255, 120], 'Vendedor');
    this.drawStation(this.stations.admin,    [255, 215, 0], 'Poder Admin');
    this.drawStation(this.stations.lore,      [100, 200, 180], 'Arquivo');
    this.drawStation(this.stations.dummy,     [200, 90, 90],   'Controles');

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
    const currentChar = (dadosPersonagens && dadosPersonagens[charId]) ? dadosPersonagens[charId] : { nome: 'Desconhecido' };

    push();
    textAlign(LEFT, TOP);
    textSize(14);
    fill(200);
    text(`Personagem: ${currentChar.name}`, 20, 20);
    pop();
  }

  aoPressionarTecla() {
    // Painéis ativos têm prioridade
    if (this.activePanel === 'ADMIN') {
      // Toggle com as teclas numéricas
      if (key === '1') {
        const opt = this.adminOptions.find(opt => opt.key === 'ARMA_ADMIN');
        if (opt) opt.enabled = !opt.enabled;
      }
      if (key === '2') {
        const opt = this.adminOptions.find(opt => opt.key === 'VIDA_DEUS');
        if (opt) opt.enabled = !opt.enabled;
      }
      if (key === '3') {
        const opt = this.adminOptions.find(opt => opt.key === 'DASH_LUZ');
        if (opt) opt.enabled = !opt.enabled;
      }

      if (keyCode === ENTER) {
        const useAdminWeapon = this.adminOptions.find(opt => opt.key === 'ARMA_ADMIN').enabled;
        localStorage.setItem('admin.arma', useAdminWeapon);
        const useGodHealth = this.adminOptions.find(opt => opt.key === 'VIDA_DEUS').enabled;
        localStorage.setItem('admin.vida', useGodHealth);
        const useLightDash = this.adminOptions.find(opt => opt.key === 'DASH_LUZ').enabled;
        localStorage.setItem('admin.dash', useLightDash);
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

    if (this.activePanel === 'TRAINING') {
      if (keyCode === ESCAPE || keyCode === ENTER) {
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
        } catch (_) {}
        gerenciadorEstadoJogo.mudarEstado('JOGANDO');
        return;
      }
    }

    if ((key === 'e' || key === 'E') && jogador) {
      // Impede a abertura da loja se um painel já estiver ativo
      if (this.activePanel) return;

      const dv = dist(jogador.x, jogador.y, this.stations.vendor.x, this.stations.vendor.y);
      if (dv < this.stations.vendor.r + 20) {
        // Abrir loja no lobby
        window.__shopFromLobby = true;
        mostrarLoja = true;
        return;
      }
      const da = dist(jogador.x, jogador.y, this.stations.admin.x, this.stations.admin.y);
      if (da < this.stations.admin.r + 20) {
        this.activePanel = 'ADMIN';
        return;
      }
      const dl = dist(jogador.x, jogador.y, this.stations.lore.x, this.stations.lore.y);
      if (dl < this.stations.lore.r + 20) {
        this.activePanel = 'LORE';
        return;
      }
      const dd = dist(jogador.x, jogador.y, this.stations.dummy.x, this.stations.dummy.y);
      if (dd < this.stations.dummy.r + 20) {
        this.activePanel = 'TRAINING';
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
    // Linha superior: Lore à esquerda, Dummy à direita
    this.stations.lore.x   = cx - dx;
    this.stations.lore.y   = cy - dy;

    // Linha do meio: Vendedor à esquerda, Sigils à direita
    this.stations.vendor.x = cx - dx;
    this.stations.vendor.y = cy;
    this.stations.admin.x    = cx + dx;
    this.stations.admin.y    = cy;

    // Linha inferior: Dummy próximo do portal
    this.stations.dummy.x  = cx + 140;
    this.stations.dummy.y  = this.portal.y - 10;
  }
}