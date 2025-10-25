class EstadoIntro extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);
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

  entrar() {
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

    // Se estiver no fade final, checar fim para trocar de estado
    if (this.isFinalFade) {
      const t = constrain((millis() - this.finalFadeStart) / this.finalFadeDur, 0, 1);
      if (t >= 1) {
        this.gerenciador.mudarEstado('MENU');
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
    // Caso contrário, pular para o MENU
    if (!this.isFinalFade) {
      this.gerenciador.mudarEstado('MENU');
    }
  }
}