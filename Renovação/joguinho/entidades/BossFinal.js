class BossFinal extends Boss {
  constructor(x, y) {
    // super(x, y, size, health, speed);
    super(x, y, 100, 4000, 3.5);

    this.name = "NÚCLEO ABISSAL";
    this.vidaMaxima = this.vida;
    this.r = 50;

    // --- Máquina de Estados ---
    this.estado = 'observando'; // 'observando', 'atacando', 'vulneravel'
    this.subEstado = null; // 'espiral', 'dash_carga', 'dash_execucao'
    this.tempoEstado = 0;
    this.invencivel = false;

    // --- Ataque 1: Espiral de Projéteis ---
    this.espiral = {
      anguloBase: 0,
      velocidadeRotacao: 0.04,
      sentido: 1,
      projeteisPorDisparo: 2,
      cooldownDisparo: 80,
      ultimoDisparo: 0,
      duracao: 5000,
    };

    // --- Ataque 2: Dash e Rajada ---
    this.dash = {
      tempoCarga: 800,
      inicioCarga: 0,
      velocidade: 45,
      alvo: null,
      origem: null,
      distanciaMax: 900,
      rajadaPendente: false,
    };

    // --- Ataque 3: Invocação de Minions ---
    this.minions = [];
    this.maxMinions = 4;
    this.cooldownInvocacao = 15000;
    this.ultimaInvocacao = 0;

    // --- Fase Final: Caos Controlado ---
    this.faseCaos = {
      ativa: false,
      duracao: 8000, // 8 segundos de caos
      cooldown: 12000, // 12 segundos de descanso/vulnerabilidade
      inicio: 0,
    };
  }

  atualizar(player = window.jogador) {
    this.atualizarFase();
    this.gerenciarEstado(player);

    // Atualizar minions
    for (let i = this.minions.length - 1; i >= 0; i--) {
      const minion = this.minions[i];
      minion.atualizar(player);
      if (minion.vida <= 0) {
        this.minions.splice(i, 1);
      }
    }
  }

  gerenciarEstado(player) {
    const agora = millis();

    // Lógica da Fase Final (Caos Controlado)
    if (this.faseDeAtaque === 4 && !this.faseCaos.ativa && agora > this.faseCaos.inicio + this.faseCaos.cooldown) {
      this.faseCaos.ativa = true;
      this.faseCaos.inicio = agora;
      this.estado = 'atacando';
      this.invencivel = true;
    }

    if (this.faseCaos.ativa) {
      if (agora < this.faseCaos.inicio + this.faseCaos.duracao) {
        // Durante o caos, ataca sem parar
        this.ataqueEspiral(player); // Espiral contínua
        if (agora % 2000 < 20) this.iniciarDash(player); // Dash a cada 2s
      } else {
        // Período de vulnerabilidade
        this.faseCaos.ativa = false;
        this.faseCaos.inicio = agora; // Reinicia o timer para o cooldown
        this.estado = 'vulneravel';
        this.invencivel = false;
        this.tempoEstado = agora + 4000; // 4 segundos vulnerável
      }
    }

    // Máquina de estados principal
    switch (this.estado) {
      case 'observando':
        this.mover(player);
        if (agora > this.tempoEstado) {
          this.decidirProximoAtaque(player);
        }
        break;

      case 'atacando':
        this.executarAtaque(player);
        break;

      case 'vulneravel':
        if (agora > this.tempoEstado) {
          this.estado = 'observando';
          this.tempoEstado = agora + 1500; // Observa por 1.5s
        }
        break;
    }
  }

  decidirProximoAtaque(player) {
    this.estado = 'atacando';
    const chance = random();

    // Fase 2+ pode invocar minions
    if (this.faseDeAtaque >= 2 && this.minions.length < this.maxMinions && millis() > this.ultimaInvocacao + this.cooldownInvocacao) {
      this.invocarMinions();
      this.ultimaInvocacao = millis();
    }

    if (chance < 0.5) {
      this.subEstado = 'espiral';
      this.espiral.sentido *= -1; // Alterna o sentido
    } else {
      this.subEstado = 'dash_carga';
      this.iniciarDash(player);
    }
    this.tempoEstado = millis() + 5000; // Duração máxima do estado de ataque
  }

  executarAtaque(player) {
    switch (this.subEstado) {
      case 'espiral':
        this.ataqueEspiral(player);
        break;
      case 'dash_carga':
        if (millis() > this.dash.inicioCarga + this.dash.tempoCarga) {
          this.subEstado = 'dash_execucao';
        }
        break;
      case 'dash_execucao':
        this.executarDash(player);
        break;
    }

    // Volta a observar se o tempo do ataque acabou
    if (millis() > this.tempoEstado) {
      this.estado = 'observando';
      this.tempoEstado = millis() + 2000; // Observa por 2s
    }
  }

  // --- Implementação dos Ataques ---

  ataqueEspiral(player) {
    if (millis() > this.espiral.ultimoDisparo + this.espiral.cooldownDisparo) {
      this.espiral.anguloBase += this.espiral.velocidadeRotacao * this.espiral.sentido;

      for (let i = 0; i < this.espiral.projeteisPorDisparo; i++) {
        const angulo = this.espiral.anguloBase + (i * TWO_PI) / this.espiral.projeteisPorDisparo;
        const p = poolProjeteis.obter();
        if (p) {
          p.x = this.x;
          p.y = this.y;
          p.vx = cos(angulo) * 8;
          p.vy = sin(angulo) * 8;
          p.dano = 1;
          p.tamanho = 12;
          p.cor = [255, 100, 255];
          p.ehProjetilInimigo = true;
          if (poolProjeteis.ativar) poolProjeteis.ativar(p);
        }
      }
      this.espiral.ultimoDisparo = millis();
    }
  }

  iniciarDash(player) {
    this.subEstado = 'dash_carga';
    this.dash.inicioCarga = millis();
    this.dash.origem = createVector(this.x, this.y);
    const angulo = atan2(player.y - this.y, player.x - this.x);
    this.dash.alvo = createVector(this.x + cos(angulo) * this.dash.distanciaMax, this.y + sin(angulo) * this.dash.distanciaMax);
    this.dash.rajadaPendente = true;
  }

  executarDash(player) {
    const direcao = p5.Vector.sub(this.dash.alvo, this.dash.origem).normalize();
    this.x += direcao.x * this.dash.velocidade;
    this.y += direcao.y * this.dash.velocidade;

    const distPercorrida = dist(this.x, this.y, this.dash.origem.x, this.dash.origem.y);
    if (distPercorrida > this.dash.distanciaMax || this.x < 0 || this.x > CONFIG.MAPA.LARGURA || this.y < 0 || this.y > CONFIG.MAPA.ALTURA) {
      this.pararDash(player);
    }
  }

  pararDash(player) {
    if (this.dash.rajadaPendente) {
      this.dispararRajada(player);
      this.dash.rajadaPendente = false;
    }
    this.estado = 'observando';
    this.tempoEstado = millis() + 1000;
  }

  dispararRajada(player) {
    const angulo = atan2(player.y - this.y, player.x - this.x);
    for (let i = 0; i < 5; i++) {
      const anguloTiro = angulo + random(-0.2, 0.2);
      const p = poolProjeteis.obter();
      if (p) {
        p.x = this.x;
        p.y = this.y;
        p.vx = cos(anguloTiro) * 12;
        p.vy = sin(anguloTiro) * 12;
        p.dano = 1.5;
        p.tamanho = 10;
        p.cor = [200, 200, 255];
        p.ehProjetilInimigo = true;
        if (poolProjeteis.ativar) poolProjeteis.ativar(p);
      }
    }
  }

  invocarMinions() {
    for (let i = 0; i < 2; i++) {
      if (this.minions.length < this.maxMinions) {
        const angulo = random(TWO_PI);
        const x = this.x + cos(angulo) * 100;
        const y = this.y + sin(angulo) * 100;
        this.minions.push(new FragmentoAbissal(x, y, this));
      }
    }
  }

  desenhar() {
    // Corpo principal
    push();
    translate(this.x, this.y);
    noStroke();
    const pulsacao = 1 + sin(millis() * 0.005) * 0.1;
    fill(this.invencivel ? 100 : 40, 0, 80);
    ellipse(0, 0, this.r * 2 * pulsacao);
    fill(255, 100, 255);
    ellipse(0, 0, this.r * 0.5);
    pop();

    // Indicador de carga do Dash
    if (this.subEstado === 'dash_carga') {
      push();
      stroke(255, 255, 0, 150);
      strokeWeight(4);
      line(this.x, this.y, this.dash.alvo.x, this.dash.alvo.y);
      pop();
    }

    // Desenhar minions
    for (const minion of this.minions) {
      minion.desenhar();
    }
  }

  receberDano(quantia) {
    if (this.invencivel) return false;
    return super.receberDano(quantia);
  }
}

class FragmentoAbissal extends Inimigo {
  constructor(x, y, boss) {
    super(x, y, 50, 0, 1, 20, [150, 50, 200]);
    this.boss = boss;
    this.orbita = {
      raio: 250 + random(-50, 50),
      angulo: atan2(y - boss.y, x - boss.x),
      velocidade: random(0.01, 0.02) * (random() > 0.5 ? 1 : -1),
    };
    this.ultimoTiro = 0;
    this.cooldownTiro = 3000;
  }

  atualizar(player) {
    // Movimento orbital
    this.orbita.angulo += this.orbita.velocidade;
    this.x = this.boss.x + cos(this.orbita.angulo) * this.orbita.raio;
    this.y = this.boss.y + sin(this.orbita.angulo) * this.orbita.raio;

    // Atirar no jogador
    if (millis() > this.ultimoTiro + this.cooldownTiro) {
      const angulo = atan2(player.y - this.y, player.x - this.x);
      const p = poolProjeteis.obter();
      if (p) {
        p.x = this.x;
        p.y = this.y;
        p.vx = cos(angulo) * 7;
        p.vy = sin(angulo) * 7;
        p.dano = 0.5;
        p.tamanho = 8;
        p.cor = [180, 100, 220];
        p.ehProjetilInimigo = true;
        if (poolProjeteis.ativar) poolProjeteis.ativar(p);
      }
      this.ultimoTiro = millis();
    }
  }
}