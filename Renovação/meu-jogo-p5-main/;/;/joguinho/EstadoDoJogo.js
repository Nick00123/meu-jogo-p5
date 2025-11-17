// ===========================================
// GERENCIADOR DE ESTADO DE JOGO
// ===========================================

class GerenciadorEstadoJogo {
  constructor() {
    // Preferência do usuário: mostrar intro ao iniciar (padrão: true)
    const pref = localStorage.getItem('settings.showIntro');
    const showIntro = (pref === null) ? true : (pref === 'true');
    // Iniciar conforme preferência salva
    this.currentState = showIntro ? 'INTRO' : 'MENU';
    this.previousState = null;
    this.states = {
      INTRO: new IntroState(),
      MENU: new MenuState(),
      SETTINGS: new SettingsState(),
      HIGH_SCORES: new HighScoresState(),
      LOBBY: new LobbyState(),
      PLAYING: new PlayingState(),
      PAUSED: new PausedState(),
      GAME_OVER: new GameOverState()
    };
    // Garantir inicialização do estado atual (importante para timers da INTRO)
    if (this.states[this.currentState] && typeof this.states[this.currentState].entrar === 'function') {
      this.states[this.currentState].entrar();
    }
  }

  mudarEstado(newState) {
    if (this.states[newState]) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.states[newState].entrar();
    }
  }

  atualizar() {
    this.states[this.currentState].atualizar();
  }

  desenhar() {
    this.states[this.currentState].desenhar();
  }

  aoPressionarTecla() {
    this.states[this.currentState].aoPressionarTecla();
  }

  getCurrentState() {
    return this.currentState;
  }

  getPreviousState() {
    return this.previousState;
  }
}

// ===========================================
// BASE STATE CLASS
// ===========================================

class EstadoBase {
  constructor() {}

  entrar() {
    // Override in subclasses
  }

  sair() {
    // Override in subclasses
  }

  atualizar() {
    // Override in subclasses
  }

  desenhar() {
    // Override in subclasses
  }

  aoPressionarTecla() {
    // Override in subclasses
  }
}

// ===========================================
// INTRO STATE (Cena de abertura estilo suspense)
// ===========================================

class IntroState extends EstadoBase {
  constructor() {
    super();
    this.startTime = 0;
    this.scene = 0; // índice da cena/linha
    this.typeCharCount = 0; // contagem de caracteres para efeito de digitação
    this.lines = [
      'Há muito tempo, antes da primeira picareta tocar o solo daquela região, um poder esquecido dormia sob as rochas.',
      'Era uma mina, mas não comum: construída por mãos que não eram humanas.',
      'Uma fortaleza viva, automatizada, repleta de criaturas moldadas em metal, pedra e carne — guardiãs de algo enterrado nas profundezas.',
      'Joseph, um simples minerador, acreditava ter encontrado apenas mais uma veia de minério raro.',
      'Porém, ao atravessar o primeiro túnel, percebeu que cada parede pulsava como se fosse parte de um organismo.',
      'As máquinas alienígenas despertaram. As criaturas começaram a caçar.',
      'Não há explicações claras: apenas símbolos desconhecidos gravados nas paredes, ecos de civilizações distantes e uma energia que parece corromper tudo que toca.',
      'Agora, Joseph não cava por riquezas. Ele luta para sobreviver.',
      'Cada sala da mina o empurra para mais fundo, cada onda de inimigos revela segredos mais perturbadores.',
      'E, no final, algo o espera: o coração da escavação, a fonte dessa energia esquecida.',
      'O que Joseph encontrará? Uma arma proibida? Um ser ancestral?',
      'Ou apenas a verdade sobre por que essa mina jamais deveria ter sido aberta?'
    ];
    this.lineDur = 7600; // ms por linha (exibida) — +1s extra
    this.fadeDur = 800;  // ms de fade entre linhas
    this.nextSwitchAt = 0;
    this.stars = [];
    // Fade final
    this.isFinalFade = false;
    this.finalFadeStart = 0;
    this.finalFadeDur = 3000; // ms para escurecer lentamente
    // Bônus para a primeira linha ficar mais tempo
    this.firstLineBonus = 1200; // ms extra só na primeira frase
    // Velocidade de digitação e tempo mínimo após digitar
    this.typeSpeedMs = 22; // ms por caractere
    this.postTypeHold = 1200; // ms de permanência após terminar de digitar

    // UI: dica de pulo
    this.showSkipHintDelay = 1500; // ms antes de mostrar a dica

    // Áudio ambiente (p5.sound)
    this._amb = {
      started: false,
      targetGain: 0.12,
      currentGain: 0,
      osc: null,
      noise: null,
      filter: null,
      reverb: null,
      enabledBySettings: true,
      needUnlock: false
    };

    // Vinheta e granulação
    this.enableVignette = true;
    this.vignetteStrength = 80;  // 0-255 (reduzido para não escurecer demais o centro)
    this.enableGrain = true;
    this.grainDensity = 0.0004;  // menos grãos para não poluir o texto
  }

  computeNextSwitchAt() {
    const currentText = this.lines[this.scene] || '';
    const expectedTypingMs = currentText.length * this.typeSpeedMs;
    const baseDur = this.getCurrentLineDuration();
    // Garante pelo menos (tempo para digitar + postTypeHold)
    const dur = Math.max(baseDur, expectedTypingMs + this.postTypeHold);
    return this.startTime + dur;
  }

  getCurrentLineDuration() {
    return this.lineDur + (this.scene === 0 ? this.firstLineBonus : 0);
  }

  setupAmbient() {
    try {
      // Respeitar configuração
      const pref = localStorage.getItem('settings.introSound');
      this._amb.enabledBySettings = (pref === null) ? true : (pref === 'true');
      if (!this._amb.enabledBySettings) return; // som desativado nas configurações

      // Tentar iniciar contexto (alguns browsers exigem gesto do usuário)
      if (typeof getAudioContext === 'function') {
        const ctx = getAudioContext();
        if (ctx && ctx.state !== 'running') {
          this._amb.needUnlock = true;
          return; // aguardar gesto do usuário
        }
      }
      // Criar componentes se ainda não existem
      if (!this._amb.osc) {
        this._amb.osc = new p5.Oscillator('sine');
        this._amb.osc.freq(48);
        this._amb.osc.amp(0);
      }
      if (!this._amb.noise) {
        this._amb.noise = new p5.Noise('brown');
        this._amb.noise.amp(0);
      }
      if (!this._amb.filter) {
        this._amb.filter = new p5.LowPass();
        this._amb.filter.freq(420);
        this._amb.filter.res(6);
      }
      if (!this._amb.reverb) {
        this._amb.reverb = new p5.Reverb();
        this._amb.reverb.set(3, 2);
      }
      this._amb.osc.disconnect();
      this._amb.noise.disconnect();
      this._amb.osc.connect(this._amb.filter);
      this._amb.noise.connect(this._amb.filter);
      this._amb.reverb.process(this._amb.filter, 3, 2);

      if (!this._amb.started) {
        this._amb.osc.start();
        this._amb.noise.start();
        this._amb.started = true;
      }
      this._amb.currentGain = 0;
    } catch (e) {}
  }

  stopAmbient(immediate = false) {
    if (!this._amb.started) return;
    const endNow = immediate;
    try {
      if (endNow) {
        this._amb.osc.amp(0);
        this._amb.noise.amp(0);
      } else {
        // fade-out curto
        this._amb.osc.amp(0, 0.8);
        this._amb.noise.amp(0, 0.8);
      }
    } catch (_) {}
  }

  enter() {
    this.startTime = millis();
    this.scene = 0;
    this.typeCharCount = 0;
    this.nextSwitchAt = this.computeNextSwitchAt();
    // Gerar campo de estrelas simples
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        z: random(0.2, 1.2),
        s: random(0.5, 2.0)
      });
    }
    this.isFinalFade = false;

    // Iniciar áudio ambiente (se permitido)
    this.setupAmbient();
  }

  atualizar() {
    // Avança digitação
    const currentText = this.lines[this.scene] || '';
    if (this.typeCharCount < currentText.length) {
      // velocidade de digitação
      const speed = this.typeSpeedMs; // ms por caractere (controlado pelo estado)
      const elapsed = millis() - this.startTime;
      this.typeCharCount = min(currentText.length, Math.floor(elapsed / speed));
    } else {
      // Troca de linha por tempo
      if (millis() >= this.nextSwitchAt) {
        this.scene++;
        if (this.scene >= this.lines.length) {
          // Iniciar fade final em vez de trocar de estado imediatamente
          if (!this.isFinalFade) {
            this.isFinalFade = true;
            this.finalFadeStart = millis();
          }
        } else {
          this.startTime = millis();
          this.typeCharCount = 0;
          this.nextSwitchAt = this.computeNextSwitchAt();
        }
      }
    }

    // Atualizar áudio ambiente (fade-in/out, modulações leves)
    if (this._amb.started) {
      const now = millis();
      // Ganho alvo reduzido durante o fade final
      let tgt = this._amb.targetGain;
      if (this.isFinalFade) {
        const t = constrain((now - this.finalFadeStart) / this.finalFadeDur, 0, 1);
        tgt = lerp(this._amb.targetGain, 0, t);
      }
      // aproximar ganho atual do alvo
      this._amb.currentGain = lerp(this._amb.currentGain, tgt, 0.05);
      try {
        this._amb.osc.amp(this._amb.currentGain);
        this._amb.noise.amp(this._amb.currentGain * 0.45);
        // pequenas modulações para dar vida
        const wobble = 48 + 2 * sin(now * 0.0013);
        this._amb.osc.freq(wobble);
        const cutoff = 380 + 80 * (0.5 + 0.5 * sin(now * 0.0009));
        this._amb.filter.freq(cutoff);
      } catch (_) {}
    }

    // Se estiver no fade final, checar fim para trocar de estado
    if (this.isFinalFade) {
      const t = constrain((millis() - this.finalFadeStart) / this.finalFadeDur, 0, 1);
      if (t >= 1) {
        this.stopAmbient(true);
        gerenciadorEstadoJogo.mudarEstado('MENU');
        return;
      }
    }
  }

  desenhar() {
    const now = millis();
    // Fundo espacial
    background(6, 8, 16);
    noStroke();

    // Vibração no fade final (shake + scale leve)
    let applyShake = false;
    let shakeTx = 0, shakeTy = 0, shakeScale = 1;
    if (this.isFinalFade) {
      const t = constrain((now - this.finalFadeStart) / this.finalFadeDur, 0, 1);
      const amt = max(0, (t - 0.5) / 0.5); // começa após 50% do fade
      const shake = 3 * amt; // até 3px
      shakeTx = sin(now * 0.05) * shake;
      shakeTy = cos(now * 0.07) * shake;
      shakeScale = 1 + 0.01 * amt; // até +1%
      applyShake = true;
    }

    push();
    if (applyShake) {
      translate(width / 2, height / 2);
      scale(shakeScale);
      translate(-width / 2 + shakeTx, -height / 2 + shakeTy);
    }

    // Estrelas parallax
    const starSpeedMul = this.isFinalFade ? 0.3 : 1.0;
    fill(255);
    for (let s of this.stars) {
      s.x -= 0.2 * s.z * starSpeedMul;
      if (s.x < 0) s.x = width;
      const alpha = 140 + 100 * s.z;
      fill(200, 220, 255, alpha);
      ellipse(s.x, s.y, s.s, s.s);
    }

    // Vinheta (AGORA atrás da UI/texto)
    if (this.enableVignette) {
      push();
      noStroke();
      const cx = width / 2, cy = height / 2;
      const maxR = max(width, height) * 1.2;
      for (let i = 0; i < 8; i++) {
        const r = map(i, 0, 7, maxR * 0.7, maxR);
        const a = (this.vignetteStrength / 8) * (i + 1);
        fill(0, a);
        ellipse(cx, cy, r, r);
      }
      pop();
    }

    // Granulação leve (TAMBÉM atrás da UI/texto)
    if (this.enableGrain) {
      push();
      stroke(255, 255, 255, 6); // alpha menor para não lavar o texto
      const count = min(1200, floor(width * height * this.grainDensity));
      for (let i = 0; i < count; i++) {
        const x = random(width);
        const y = random(height);
        point(x, y);
      }
      pop();
    }

    // Caixa de texto
    const pad = 22;
    const boxW = min(width * 0.82, 940);
    const boxX = (width - boxW) / 2;
    const boxY = height * 0.58 - 90;
    fill(12, 16, 26, 220); // mais opaca para melhor contraste
    rect(boxX, boxY, boxW, 180, 10);

    // Texto com efeito de digitação
    // sombra leve para legibilidade
    fill(0, 150);
    textAlign(LEFT, TOP);
    textSize(18);
    const visibleText = (this.lines[this.scene] || '').substring(0, this.typeCharCount);
    text(visibleText, boxX + pad + 1, boxY + pad + 1, boxW - pad * 2, 180 - pad * 2);
    // texto principal mais claro
    fill(252);
    textAlign(LEFT, TOP);
    textSize(18);
    text(visibleText, boxX + pad, boxY + pad, boxW - pad * 2, 180 - pad * 2);

    pop();

    // Fade in/out entre cenas
    const sinceStart = now - this.startTime;
    let fadeAlpha = 0;
    // fade-in nos primeiros fadeDur ms
    if (sinceStart < this.fadeDur) {
      fadeAlpha = map(sinceStart, 0, this.fadeDur, 255, 0);
    }
    // fade-out nos últimos fadeDur ms
    else if (this.nextSwitchAt - now < this.fadeDur && this.scene < this.lines.length) {
      fadeAlpha = map(this.nextSwitchAt - now, 0, this.fadeDur, 255, 0);
    }
    if (fadeAlpha > 0) {
      fill(8, 10, 18, fadeAlpha);
      rect(0, 0, width, height);
    }

    // Dica: Pressione qualquer tecla para pular (pulsante)
    if (sinceStart > this.showSkipHintDelay && !this.isFinalFade) {
      const pulse = 0.5 + 0.5 * sin(now * 0.005);
      const a = 120 + 100 * pulse;
      textAlign(CENTER, BOTTOM);
      textSize(14);
      fill(220, 220, 240, a);
      text('Pressione qualquer tecla para pular', width / 2, height - 20);
    }

    // Fade final (preto crescente)
    if (this.isFinalFade) {
      const t = constrain((millis() - this.finalFadeStart) / this.finalFadeDur, 0, 1);
      const a = map(t, 0, 1, 0, 255);
      fill(0, a);
      rect(0, 0, width, height);
    }
  }

  aoPressionarTecla() {
    // Primeiro, se áudio estiver bloqueado, usar esta tecla para desbloquear o áudio sem pular
    if (!this.isFinalFade && this._amb.needUnlock && this._amb.enabledBySettings) {
      try {
        if (typeof userStartAudio === 'function') userStartAudio();
      } catch (_) {}
      this._amb.needUnlock = false;
      // Tentar iniciar o ambient novamente
      this.setupAmbient();
      return; // não pular nesta tecla
    }
    // Caso contrário, pular para o MENU
    if (!this.isFinalFade) {
      this.stopAmbient(false);
      gerenciadorEstadoJogo.mudarEstado('MENU');
    }
  }
}

// ===========================================
// MENU STATE
// ===========================================

class MenuState extends EstadoBase {
  constructor() {
    super();
    this.selectedOption = 0;
    this.menuOptions = ['JOGAR', 'CONFIGURAÇÕES', 'HIGH SCORES'];
    this.title = 'SPACE SHOOTER';
  }

  entrar() {
    this.selectedOption = 0;
  }

  atualizar() {
    // Menu não precisa de update constante
  }

  desenhar() {
    // Fundo escuro
    background(20, 20, 40);
    
    // Título
    push();
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255, 255, 0);
    text(this.title, width / 2, height / 4);
    
    // Opções do menu
    textSize(24);
    for (let i = 0; i < this.menuOptions.length; i++) {
      if (i === this.selectedOption) {
        fill(255, 255, 0); // Amarelo para selecionado
        text('> ' + this.menuOptions[i] + ' <', width / 2, height / 2 + i * 50);
      } else {
        fill(200); // Cinza para não selecionado
        text(this.menuOptions[i], width / 2, height / 2 + i * 50);
      }
    }
    
    // Instruções
    textSize(16);
    fill(150);
    text('Use SETAS para navegar, ENTER para selecionar', width / 2, height - 50);
    pop();
  }

  aoPressionarTecla() {
    // Navegação do menu padrão
    if (keyCode === UP_ARROW) {
      this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
    } else if (keyCode === DOWN_ARROW) {
      this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
    } else if (keyCode === ENTER) {
      this.selectOption();
    }
  }

  selectOption() {
    switch (this.selectedOption) {
      case 0: // JOGAR
        gerenciadorEstadoJogo.mudarEstado('LOBBY');
        break;
      case 1: // CONFIGURAÇÕES
        gerenciadorEstadoJogo.mudarEstado('SETTINGS');
        break;
      case 2: // HIGH SCORES
        gerenciadorEstadoJogo.mudarEstado('HIGH_SCORES');
        break;
    }
  }
}

// ===========================================
// LOBBY STATE
// ===========================================

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

    // Catálogo simples (poderá ir para data/ depois)
    this.characters = [
      { id: 'SOLDIER', name: 'Soldado', color: [0, 200, 255], maxHealth: 5, speed: 3 },
      { id: 'SCOUT', name: 'Batedor', color: [0, 255, 180], maxHealth: 4, speed: 3.6 },
      { id: 'TANK', name: 'Tanque', color: [0, 120, 255], maxHealth: 7, speed: 2.6 }
    ];

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
    enemies = [];
    enemyProjectiles = [];
    powerUps = [];
    coins = [];
    canEnterPortal = false;

    // Carregar escolhas persistidas
    const savedChar = localStorage.getItem('profile.character');
    const savedWeapon = localStorage.getItem('profile.weapon');
    const savedBiome = localStorage.getItem('profile.biome');
    if (savedChar) {
      const idx = this.characters.findIndex(c => c.id === savedChar);
      if (idx >= 0) this.charIndex = idx;
    }
    if (savedWeapon && weaponProgression && weaponProgression.unlockedWeapons) {
      const uw = weaponProgression.unlockedWeapons;
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
    if (player) {
      player.x = CONFIG.CANVAS.WIDTH / 2;
      player.y = CONFIG.CANVAS.HEIGHT / 2;
      player.vx = 0;
      player.vy = 0;
    }

    // Layout organizado do lobby
    this.layoutLobbyPositions();

    // Inicializar ambientação e atores básicos
    this.initAmbientActors();
  }

  atualizar() {
    if (player && typeof player.update === 'function') {
      player.update();
      // Limitar ao canvas do lobby
      player.x = constrain(player.x, player.size / 2, width - player.size / 2);
      player.y = constrain(player.y, player.size / 2, height - player.size / 2);
    }

    this.updateAmbientActors();

    // Painéis modais não mudam prompt principal
    if (this.activePanel) return;

    // Calcular prompts por proximidade (ordenado por distância)
    let prompts = [];
    if (player) {
      const addIfNear = (ax, ay, r, text) => {
        const d = dist(player.x, player.y, ax, ay);
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
    if (player && typeof player.draw === 'function') player.draw();

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
    if (this.activePanel === 'CHAR') this.drawCharPanel();
    if (this.activePanel === 'WEAPON') this.drawWeaponPanel();
    if (this.activePanel === 'BIOME') this.drawBiomePanel();
    if (this.activePanel === 'SIGILS') this.drawSigilsPanel();
    if (this.activePanel === 'LORE') this.drawLorePanel();
    if (this.activePanel === 'TRIAL') this.drawTrialPanel();
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
    const currentChar = this.characters[this.charIndex];
    const uw = (weaponProgression && weaponProgression.unlockedWeapons) ? weaponProgression.unlockedWeapons : ['RIFLE'];
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

  drawCharPanel() {
    const c = this.characters[this.charIndex] || { name: 'Soldado', color: [0,200,255] };
    push();
    // fundo
    fill(20, 20, 40, 220);
    noStroke();
    rect(width/2 - 220, height/2 - 140, 440, 260, 10);

    // título (+ tabs dica)
    textAlign(CENTER, TOP);
    textSize(18);
    fill(160, 210, 255);
    text('Seleção de Personagem  (Q/E troca painel)', width/2, height/2 - 130);

    // preview
    noStroke();
    fill(c.color ? c.color : [0,200,255]);
    ellipse(width/2, height/2 - 20, 50);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(`${c.name}`, width/2, height/2 + 30);

    // instruções
    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('← → para trocar, ENTER para confirmar, ESC para fechar', width/2, height/2 + 90);
    pop();
  }

  drawWeaponPanel() {
    const uw = (weaponProgression && weaponProgression.unlockedWeapons) ? weaponProgression.unlockedWeapons : ['RIFLE'];
    const w = uw[Math.max(0, Math.min(this.weaponIndex, uw.length - 1))] || 'RIFLE';
    push();
    // fundo
    fill(20, 20, 40, 220);
    noStroke();
    rect(width/2 - 220, height/2 - 140, 440, 260, 10);

    // título (+ tabs dica)
    textAlign(CENTER, TOP);
    textSize(18);
    fill(255, 210, 160);
    text('Seleção de Arma  (Q/E troca painel)', width/2, height/2 - 130);

    // preview simples
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(230);
    text(`${w}`, width/2, height/2 - 20);

    // instruções
    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('← → para trocar, ENTER para confirmar, ESC para fechar', width/2, height/2 + 90);
    pop();
  }

  drawBiomePanel() {
    const key = this.biomeKeys[Math.max(0, Math.min(this.biomeIndex, this.biomeKeys.length - 1))] || 'FOREST';
    const b = (window.runConfig && runConfig.BIOMES && runConfig.BIOMES[key]) ? runConfig.BIOMES[key] : { name: 'Floresta', mapBackground: [30,120,30] };

    push();
    // fundo
    fill(20, 20, 40, 220);
    noStroke();
    rect(width/2 - 220, height/2 - 140, 440, 260, 10);

    // título (+ tabs dica)
    textAlign(CENTER, TOP);
    textSize(18);
    fill(160, 255, 160);
    text('Seleção de Bioma  (Q/E troca painel)', width/2, height/2 - 130);

    // preview
    textAlign(CENTER, CENTER);
    fill(b.mapBackground[0], b.mapBackground[1], b.mapBackground[2], 200);
    rect(width/2 - 100, height/2 - 70, 200, 100, 8);
    fill(255);
    textSize(16);
    text(`${b.name}`, width/2, height/2 - 20);

    // instruções
    textSize(12);
    fill(180);
    text('← → para trocar, ENTER para confirmar, ESC para fechar', width/2, height/2 + 90);
    pop();
  }

  drawSigilsPanel() {
    push();
    // fundo
    fill(20, 20, 40, 220);
    noStroke();
    rect(width/2 - 240, height/2 - 150, 480, 280, 10);

    // título
    textAlign(CENTER, TOP);
    textSize(18);
    fill(200, 160, 255);
    text('Sigils (Mutators)', width/2, height/2 - 140);

    // lista
    textAlign(LEFT, TOP);
    textSize(14);
    for (let i = 0; i < this.mutators.length; i++) {
      const m = this.mutators[i];
      const y = height/2 - 100 + i * 40;
      fill(m.enabled ? [255, 220, 120] : [200, 200, 200]);
      text(`${m.enabled ? '[ATIVO] ' : '[ ] '} ${m.name} — ${m.desc}`, width/2 - 200, y);
    }

    // instruções
    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('Use 1/2/3 para alternar mutators, ENTER para salvar, ESC para fechar', width/2, height/2 + 120);
    pop();
  }

  drawLorePanel() {
    // Entradas simples simuladas por enquanto (poderão ser destravadas por chefes)
    const entries = [
      { key: 'intro', name: 'Origens da Mina', unlocked: true },
      { key: 'boss1', name: 'Guardião da Entrada', unlocked: !!localStorage.getItem('codex.boss1') },
      { key: 'boss2', name: 'Arquitetos', unlocked: !!localStorage.getItem('codex.boss2') }
    ];

    push();
    fill(20, 20, 40, 220);
    noStroke();
    rect(width/2 - 260, height/2 - 160, 520, 300, 10);

    textAlign(CENTER, TOP);
    textSize(18);
    fill(120, 220, 200);
    text('Arquivo (Lore)', width/2, height/2 - 150);

    textAlign(LEFT, TOP);
    textSize(14);
    let y = height/2 - 110;
    for (const e of entries) {
      fill(e.unlocked ? [230, 230, 230] : [140, 140, 140]);
      text(`${e.unlocked ? '•' : '×'} ${e.name}`, width/2 - 220, y);
      y += 28;
    }

    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('ESC para fechar', width/2, height/2 + 130);
    pop();
  }

  drawTrialPanel() {
    const trial = this.trials[this.trialIndex];
    push();
    fill(20, 20, 40, 220);
    noStroke();
    rect(width/2 - 220, height/2 - 140, 440, 260, 10);

    textAlign(CENTER, TOP);
    textSize(18);
    fill(160, 210, 255);
    text('Selecionar Trial', width/2, height/2 - 130);

    textAlign(CENTER, CENTER);
    textSize(16);
    fill(230);
    text(`${trial.name}`, width/2, height/2 - 20);

    textAlign(CENTER, BOTTOM);
    textSize(12);
    fill(180);
    text('← → trocar, ENTER iniciar trial, ESC fechar', width/2, height/2 + 90);
    pop();
  }

  aoPressionarTecla() {
    // Painéis ativos têm prioridade
    if (this.activePanel === 'CHAR') {
      if (keyCode === LEFT_ARROW) this.charIndex = (this.charIndex - 1 + this.characters.length) % this.characters.length;
      else if (keyCode === RIGHT_ARROW) this.charIndex = (this.charIndex + 1) % this.characters.length;
      else if (keyCode === ENTER) {
        const chosen = this.characters[this.charIndex];
        localStorage.setItem('profile.character', chosen.id);
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
      const uw = (weaponProgression && weaponProgression.unlockedWeapons) ? weaponProgression.unlockedWeapons : ['RIFLE'];
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
    if (keyCode === ENTER && player) {
      const dPortal = dist(player.x, player.y, this.portal.x, this.portal.y);
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
      const dTrial = dist(player.x, player.y, this.stations.trial.x, this.stations.trial.y);
      if (dTrial < this.stations.trial.r + 20) {
        this.activePanel = 'TRIAL';
        return;
      }
    }

    if ((key === 'e' || key === 'E') && player) {
      const dc = dist(player.x, player.y, this.stations.character.x, this.stations.character.y);
      if (dc < this.stations.character.r + 20) {
        this.activePanel = 'CHAR';
        return;
      }
      const dw = dist(player.x, player.y, this.stations.weapon.x, this.stations.weapon.y);
      if (dw < this.stations.weapon.r + 20) {
        this.activePanel = 'WEAPON';
        // alinhar o índice com armas desbloqueadas atuais
        const uw = (weaponProgression && weaponProgression.unlockedWeapons) ? weaponProgression.unlockedWeapons : ['RIFLE'];
        const savedWeapon = localStorage.getItem('profile.weapon');
        const widx = savedWeapon ? uw.indexOf(savedWeapon) : -1;
        this.weaponIndex = widx >= 0 ? widx : Math.min(this.weaponIndex, uw.length - 1);
        return;
      }
      const db = dist(player.x, player.y, this.stations.biome.x, this.stations.biome.y);
      if (db < this.stations.biome.r + 20) {
        this.activePanel = 'BIOME';
        const savedBiome = localStorage.getItem('profile.biome');
        const bidx = savedBiome ? this.biomeKeys.indexOf(savedBiome) : -1;
        this.biomeIndex = bidx >= 0 ? bidx : Math.min(this.biomeIndex, this.biomeKeys.length - 1);
        return;
      }
      const dv = dist(player.x, player.y, this.stations.vendor.x, this.stations.vendor.y);
      if (dv < this.stations.vendor.r + 20) {
        // Abrir loja no lobby
        window.__shopFromLobby = true;
        showShop = true;
        return;
      }
      const ds = dist(player.x, player.y, this.stations.sigils.x, this.stations.sigils.y);
      if (ds < this.stations.sigils.r + 20) {
        this.activePanel = 'SIGILS';
        return;
      }
      const dl = dist(player.x, player.y, this.stations.lore.x, this.stations.lore.y);
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
    const cx = CONFIG.CANVAS.WIDTH / 2;
    const cy = CONFIG.CANVAS.HEIGHT / 2;
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

// ===========================================
// PLAYING STATE
// ===========================================

class PlayingState extends EstadoBase {
  constructor() {
    super();
  }

  entrar() {
    // Inicializar jogo se necessário
    if (!player) {
      initializeGame();
    }
  }

  atualizar() {
    // Update do jogo principal - remover verificações desnecessárias
    atualizarJogo();
  }

  desenhar() {
    // Draw do jogo principal (código existente)
    desenharJogo();
  }

  aoPressionarTecla() {
    if (key === 'p' || key === 'P') {
      gerenciadorEstadoJogo.mudarEstado('PAUSED');
    }
  }
}

// ===========================================
// PAUSED STATE
// ===========================================

class PausedState extends EstadoBase {
  constructor() {
    super();
    this.selectedOption = 0;
    this.pauseOptions = ['CONTINUAR', 'MENU PRINCIPAL'];
  }

  entrar() {
    this.selectedOption = 0;
  }

  atualizar() {
    // Pausa não precisa de update
  }

  desenhar() {
    // Desenhar o jogo em background (escurecido)
    gerenciadorEstadoJogo.states.PLAYING.draw();
    
    // Overlay escuro
    push();
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    // Menu de pausa
    textAlign(CENTER, CENTER);
    textSize(36);
    fill(255, 255, 0);
    text('PAUSADO', width / 2, height / 3);
    
    // Opções
    textSize(24);
    for (let i = 0; i < this.pauseOptions.length; i++) {
      if (i === this.selectedOption) {
        fill(255, 255, 0);
        text('> ' + this.pauseOptions[i] + ' <', width / 2, height / 2 + i * 40);
      } else {
        fill(200);
        text(this.pauseOptions[i], width / 2, height / 2 + i * 40);
      }
    }
    
    textSize(16);
    fill(150);
    text('SETAS para navegar, ENTER para selecionar, P para continuar', width / 2, height - 80);
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === UP_ARROW && this.selectedOption > 0) {
      this.selectedOption--;
    } else if (keyCode === DOWN_ARROW && this.selectedOption < this.pauseOptions.length - 1) {
      this.selectedOption++;
    } else if (keyCode === ENTER) {
      this.selectOption();
    } else if (key === 'p' || key === 'P') {
      gerenciadorEstadoJogo.mudarEstado('PLAYING');
    }
  }

  selectOption() {
    switch (this.selectedOption) {
      case 0: // CONTINUAR
        gerenciadorEstadoJogo.mudarEstado('PLAYING');
        break;
      case 1: // MENU PRINCIPAL
        gerenciadorEstadoJogo.mudarEstado('MENU');
        break;
    }
  }
}

// ===========================================
// GAME OVER STATE
// ===========================================

class GameOverState extends EstadoBase {
  constructor() {
    super();
    this.selectedOption = 0;
    this.gameOverOptions = ['JOGAR NOVAMENTE', 'MENU PRINCIPAL'];
    this.finalScore = 0;
    this.finalLevel = 0;
    this.isNewHighScore = false;
  }

  entrar() {
    this.selectedOption = 0;
    this.finalScore = score;
    this.finalLevel = level;
    this.isNewHighScore = score > highScore; 
    if (this.isNewHighScore) {
      highScore = score; 
      localStorage.setItem('highScore', highScore);
    }
  }

  atualizar() {
    // Game over não precisa de update
  }

  desenhar() {
    background(20, 20, 40);
    
    // Overlay escuro para melhor legibilidade
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    push();
    textAlign(CENTER, CENTER);
    
    // Título Game Over com efeito
    textSize(48);
    fill(255, 50, 50);
    text('GAME OVER', width / 2 + 2, height / 4 + 2); 
    fill(255, 100, 100);
    text('GAME OVER', width / 2, height / 4);
    
    // Caixa de informações
    fill(40, 40, 60, 200);
    stroke(100, 100, 150);
    strokeWeight(2);
    rect(width / 2 - 200, height / 2 - 120, 400, 200, 10);
    noStroke();
    
    // Estatísticas detalhadas
    textSize(20);
    fill(255, 255, 255);
    text('ESTATÍSTICAS FINAIS', width / 2, height / 2 - 90);
    
    textSize(16);
    fill(255, 255, 0);
    text('Score Final: ' + this.finalScore, width / 2, height / 2 - 60);
    
    fill(100, 255, 100);
    text('Nível Alcançado: ' + this.finalLevel, width / 2, height / 2 - 40);
    
    if (this.isNewHighScore) {
      fill(255, 215, 0);
      textSize(18);
      text('🏆 NOVO RECORDE! 🏆', width / 2, height / 2 - 15);
    }
    
    fill(200, 200, 200);
    textSize(14);
    text('High Score Anterior: ' + highScore, width / 2, height / 2 + 5);
    
    // Linha separadora
    stroke(100, 100, 150);
    strokeWeight(1);
    line(width / 2 - 150, height / 2 + 25, width / 2 + 150, height / 2 + 25);
    noStroke();
    
    // Opções com melhor visual
    textSize(18);
    for (let i = 0; i < this.gameOverOptions.length; i++) {
      let yPos = height / 2 + 50 + i * 30;
      
      if (i === this.selectedOption) {
        // Destaque para opção selecionada
        fill(255, 255, 0, 100);
        rect(width / 2 - 120, yPos - 12, 240, 24, 5);
        
        fill(255, 255, 0);
        text('▶ ' + this.gameOverOptions[i] + ' ◀', width / 2, yPos);
      } else {
        fill(180, 180, 180);
        text(this.gameOverOptions[i], width / 2, yPos);
      }
    }
    
    // Instruções
    textSize(12);
    fill(150, 150, 150);
    text('Use ↑↓ para navegar, ENTER para selecionar', width / 2, height - 30);
    
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === UP_ARROW && this.selectedOption > 0) {
      this.selectedOption--;
    } else if (keyCode === DOWN_ARROW && this.selectedOption < this.gameOverOptions.length - 1) {
      this.selectedOption++;
    } else if (keyCode === ENTER) {
      this.selectOption();
    }
  }

  selectOption() {
    switch (this.selectedOption) {
      case 0: // JOGAR NOVAMENTE
        resetGame();
        gerenciadorEstadoJogo.mudarEstado('PLAYING');
        break;
      case 1: // MENU PRINCIPAL
        gerenciadorEstadoJogo.mudarEstado('MENU');
        break;
    }
  }
}

// ===========================================
// SETTINGS STATE
// ===========================================

class SettingsState extends EstadoBase {
  constructor() {
    super();
    this.options = [
      { key: 'showIntro', label: 'Mostrar intro ao iniciar', type: 'boolean', storage: 'settings.showIntro' },
      { key: 'introSound', label: 'Som da intro', type: 'boolean', storage: 'settings.introSound' },
      { key: 'factionGlow', label: 'Brilho por facção (aura)', type: 'boolean', storage: 'settings.factionGlow' },
      { key: 'mapProps', label: 'Decoração do mapa', type: 'cycle', storage: 'settings.mapProps', values: ['Desligado', 'Baixa', 'Média', 'Alta'], internal: ['off','low','med','high'] },
      { key: 'hudFactionLegend', label: 'Legenda de facções na HUD', type: 'boolean', storage: 'settings.hudFactionLegend' },
      { key: 'hudMinimap', label: 'Mostrar minimapa', type: 'boolean', storage: 'settings.hudMinimap' },
      { key: 'hudOpacity', label: 'Opacidade da HUD', type: 'cycle', storage: 'settings.hudOpacity', values: ['Baixa','Média','Alta'], internal: ['low','med','high'] },
      { key: 'particleDensity', label: 'Densidade de partículas', type: 'cycle', storage: 'settings.particleDensity', values: ['Desligado','Baixa','Média','Alta'], internal: ['off','low','med','high'] },
      { key: 'resetDefaults', label: 'Restaurar padrões', type: 'action' },
      { key: 'back', label: 'Voltar ao Menu', type: 'action' }
    ];
    this.selected = 0;
  }

  entrar() {
    this.selected = 0;
  }

  atualizar() {}

  desenhar() {
    background(20, 20, 40);
    push();
    textAlign(CENTER, TOP);
    textSize(28);
    fill(255, 255, 0);
    text('CONFIGURAÇÕES', width / 2, 30);
    pop();

    // Lista de opções
    push();
    textAlign(LEFT, CENTER);
    textSize(18);
    let startY = 120;
    for (let i = 0; i < this.options.length; i++) {
      const opt = this.options[i];
      let display = opt.label;
      if (opt.type === 'boolean') {
        const v = localStorage.getItem(opt.storage);
        const on = (v === null) ? true : (v === 'true');
        display += `: ${on ? 'Sim' : 'Não'}`;
      } else if (opt.type === 'cycle') {
        const v = localStorage.getItem(opt.storage) || opt.internal[2]; // default 'med'
        const idx = Math.max(0, opt.internal.indexOf(v));
        const label = opt.values[idx] || opt.values[2];
        display += `: ${label}`;
      }
      if (i === this.selected) fill(255, 255, 0); else fill(200);
      text(display, width / 2 - 180, startY + i * 40);
    }
    pop();

    // Instruções
    push();
    textAlign(CENTER, BOTTOM);
    textSize(14);
    fill(160);
    text('Use ↑/↓ para navegar, ENTER para alterar/selecionar, ←/→ para ajustar opções múltiplas, ESC para voltar', width / 2, height - 24);
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === UP_ARROW) {
      this.selected = (this.selected - 1 + this.options.length) % this.options.length;
    } else if (keyCode === DOWN_ARROW) {
      this.selected = (this.selected + 1) % this.options.length;
    } else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
      const opt = this.options[this.selected];
      if (opt && opt.type === 'cycle') {
        const v = localStorage.getItem(opt.storage) || opt.internal[2];
        let idx = Math.max(0, opt.internal.indexOf(v));
        idx = (keyCode === RIGHT_ARROW) ? (idx + 1) % opt.internal.length : (idx - 1 + opt.internal.length) % opt.internal.length;
        localStorage.setItem(opt.storage, opt.internal[idx]);
      }
    } else if (keyCode === ENTER) {
      const opt = this.options[this.selected];
      if (opt.type === 'boolean') {
        const v = localStorage.getItem(opt.storage);
        const on = (v === null) ? true : (v === 'true');
        localStorage.setItem(opt.storage, (!on).toString());
      } else if (opt.type === 'cycle') {
        // ciclo entre valores
        const v = localStorage.getItem(opt.storage) || opt.internal[2];
        const idx = Math.max(0, opt.internal.indexOf(v));
        const next = opt.internal[(idx + 1) % opt.internal.length];
        localStorage.setItem(opt.storage, next);
      } else if (opt.type === 'action' && opt.key === 'resetDefaults') {
        // Limpar chaves conhecidas de settings para defaults
        const keys = ['settings.showIntro','settings.introSound','settings.factionGlow','settings.mapProps','settings.hudFactionLegend','settings.hudMinimap','settings.hudOpacity','settings.particleDensity'];
        for (const k of keys) localStorage.removeItem(k);
      } else if (opt.type === 'action' && opt.key === 'back') {
        gerenciadorEstadoJogo.mudarEstado('MENU');
      }
    } else if (keyCode === ESCAPE) {
      gerenciadorEstadoJogo.mudarEstado('MENU');
    }
  }
}

// ===========================================
// HIGH SCORES STATE
// ===========================================

class HighScoresState extends EstadoBase {
  constructor() {
    super();
    this.hs = 0;
  }

  entrar() {
    const saved = localStorage.getItem('highScore');
    this.hs = saved ? Number(saved) : (typeof highScore !== 'undefined' ? highScore : 0);
  }

  atualizar() {}

  desenhar() {
    background(20, 20, 40);

    push();
    textAlign(CENTER, TOP);
    textSize(28);
    fill(255, 255, 0);
    text('HIGH SCORES', width / 2, 30);
    pop();

    // Exibir melhor pontuação salva
    push();
    textAlign(CENTER, CENTER);
    textSize(22);
    fill(230);
    text(`Maior Pontuação: ${this.hs}`, width / 2, height / 2 - 10);
    pop();

    // Instruções
    push();
    textAlign(CENTER, BOTTOM);
    textSize(14);
    fill(160);
    text('ESC para voltar ao Menu', width / 2, height - 24);
    pop();
  }

  aoPressionarTecla() {
    if (keyCode === ESCAPE || keyCode === ENTER) {
      gerenciadorEstadoJogo.mudarEstado('MENU');
    }
  }
}