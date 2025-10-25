// Exemplo para Inimigo
class Inimigo {
  constructor(x, y, tipo = 'NORMAL') {
    this.x = x;
    this.y = y;
    this.tipo = tipo;
    // Fallback para tipos não presentes em CONFIG (ex.: Inimigos especiais)
    this.config = CONFIG.INIMIGO[tipo] || CONFIG.INIMIGO.NORMAL;
    this.tamanho = (this.config && this.config.TAMANHO) ? this.config.TAMANHO : 30;
    this.vida = (this.config && this.config.VIDA) ? this.config.VIDA : 3;
    this.vidaMaxima = this.vida;
    this.velocidade = (this.config && this.config.VELOCIDADE) ? this.config.VELOCIDADE : 2;
    this.ultimoTiro = 0;
    this.ultimoTeleporte = 0;
    this.particulasTeleporte = [];
    // Debuffs/Efeitos
    this.cegueiraAte = 0; // setado pela lanterna
    this.queimadura = null; // { ate, dps, ultimoTick }
  }

  atualizar(jogador) {
    // Segurança - garantir que jogador existe
    if (!jogador) return;

    // Processar dano por queimadura
    const agora = millis();
    if (this.queimadura) {
      if (agora < this.queimadura.ate) {
        if (!this.queimadura.ultimoTick || agora - this.queimadura.ultimoTick >= 200) {
          // 5 ticks por segundo -> dps * 0.2 por tick
          const danoTick = (this.queimadura.dps || 1) * 0.2;
          const morreuQueimado = this.receberDano(danoTick);
          this.queimadura.ultimoTick = agora;
          if (morreuQueimado) {
            // Morte será tratada pelo sistema externo
          }
        }
      } else {
        this.queimadura = null;
      }
    }

    // Cegueira ativa?
    const cego = agora < (this.cegueiraAte || 0);

    // Comportamento específico por tipo
    switch (this.tipo) {
      case 'SNIPER':
        this.atualizarSniper(jogador, cego);
        break;
      case 'TANK':
        this.atualizarTanque(jogador, cego);
        break;
      case 'SWARM':
        this.atualizarEnxame(jogador, cego);
        break;
      case 'TELEPORTER':
        this.atualizarTeleporter(jogador, cego);
        break;
      default:
        this.atualizarNormal(jogador, cego);
    }

    // Atualizar partículas de teletransporte
    if (this.tipo === 'TELEPORTER') {
      this.atualizarParticulasTeleporte();
    }
  }

  atualizarNormal(jogador, cego = false) {
    // Movimento simples em direção ao jogador
    let dx = jogador.x - this.x;
    let dy = jogador.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      const multVel = cego ? 0.35 : 1.0;
      this.x += (dx / mag) * this.velocidade * multVel;
      this.y += (dy / mag) * this.velocidade * multVel;
    }
  }

  atualizarSniper(jogador, cego = false) {
    let dx = jogador.x - this.x;
    let dy = jogador.y - this.y;
    let distancia = sqrt(dx * dx + dy * dy);

    // Manter distância do jogador
    if (distancia < this.config.ALCANCE_TIRO) {
      // Se muito perto, recuar
      if (distancia < this.config.ALCANCE_TIRO * 0.7) {
        let mag = sqrt(dx * dx + dy * dy);
        if (mag > 0) {
          const multVel = cego ? 0.35 : 1.0;
          this.x -= (dx / mag) * this.velocidade * multVel;
          this.y -= (dy / mag) * this.velocidade * multVel;
        }
      }
      // Atirar se no alcance
      if (!cego) this.atirar(jogador);
    } else {
      // Se muito longe, aproximar lentamente
      let mag = sqrt(dx * dx + dy * dy);
      if (mag > 0) {
        const multVel = cego ? 0.35 : 1.0;
        this.x += (dx / mag) * this.velocidade * 0.5 * multVel;
        this.y += (dy / mag) * this.velocidade * 0.5 * multVel;
      }
    }
  }

  atualizarTanque(jogador, cego = false) {
    // Movimento lento mas direto
    let dx = jogador.x - this.x;
    let dy = jogador.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      const multVel = cego ? 0.35 : 1.0;
      this.x += (dx / mag) * this.velocidade * multVel;
      this.y += (dy / mag) * this.velocidade * multVel;
    }
  }

  atualizarEnxame(jogador, cego = false) {
    // Movimento rápido e errático
    let dx = jogador.x - this.x;
    let dy = jogador.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      // Adicionar movimento errático
      let aleatorioX = random(-0.5, 0.5);
      let aleatorioY = random(-0.5, 0.5);
      const multVel = cego ? 0.35 : 1.0;
      this.x += (dx / mag) * this.velocidade * multVel + aleatorioX;
      this.y += (dy / mag) * this.velocidade * multVel + aleatorioY;
    }
  }

  atualizarTeleporter(jogador, cego = false) {
    let agora = millis();

    // Verificar se deve teletransportar
    if (agora - this.ultimoTeleporte > this.config.COOLDOWN_TELEPORTE) {
      let dx = jogador.x - this.x;
      let dy = jogador.y - this.y;
      let distancia = sqrt(dx * dx + dy * dy);

      // Teletransportar se muito perto do jogador
      if (distancia < 100 || random() < 0.3) {
        this.teleportar();
        this.ultimoTeleporte = agora;
      }
    }

    // Movimento normal quando não teletransportando
    let dx = jogador.x - this.x;
    let dy = jogador.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      const multVel = cego ? 0.35 : 1.0;
      this.x += (dx / mag) * this.velocidade * multVel;
      this.y += (dy / mag) * this.velocidade * multVel;
    }
  }

  teleportar() {
    // Criar partículas no local atual
    for (let i = 0; i < 10; i++) {
      this.particulasTeleporte.push({
        x: this.x + random(-this.tamanho / 2, this.tamanho / 2),
        y: this.y + random(-this.tamanho / 2, this.tamanho / 2),
        vx: random(-3, 3),
        vy: random(-3, 3),
        vida: 30,
        vidaMaxima: 30
      });
    }

    // Teletransportar para nova posição
    let angulo = random(0, TWO_PI);
    let distancia = random(100, this.config.ALCANCE_TELEPORTE);
    this.x += cos(angulo) * distancia;
    this.y += sin(angulo) * distancia;

    // Manter dentro dos limites do mapa
    this.x = constrain(this.x, 50, CONFIG.MAPA.LARGURA - 50);
    this.y = constrain(this.y, 50, CONFIG.MAPA.ALTURA - 50);

    // Criar partículas no novo local
    for (let i = 0; i < 10; i++) {
      this.particulasTeleporte.push({
        x: this.x + random(-this.tamanho / 2, this.tamanho / 2),
        y: this.y + random(-this.tamanho / 2, this.tamanho / 2),
        vx: random(-3, 3),
        vy: random(-3, 3),
        vida: 30,
        vidaMaxima: 30
      });
    }
  }

  atualizarParticulasTeleporte() {
    for (let i = this.particulasTeleporte.length - 1; i >= 0; i--) {
      let p = this.particulasTeleporte[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vida--;

      if (p.vida <= 0) {
        this.particulasTeleporte.splice(i, 1);
      }
    }
  }

  atirar(jogador) {
    if (!jogador) return;

    let agora = millis();
    let cooldown = this.config.COOLDOWN_TIRO || 1000;

    if (agora - this.ultimoTiro > cooldown) {
      this.ultimoTiro = agora;

      let dx = jogador.x - this.x;
      let dy = jogador.y - this.y;
      let mag = sqrt(dx * dx + dy * dy);

      if (mag > 0) {
        let velocidadeProj = this.config.VELOCIDADE_PROJETIL || CONFIG.PROJETIL.INIMIGO.VELOCIDADE;
        let precisao = this.config.PRECISAO || 0.8;

        // Adicionar imprecisão baseada na precisão
        let dispersao = (1 - precisao) * 0.5;
        let vx = (dx / mag) * velocidadeProj + random(-dispersao, dispersao);
        let vy = (dy / mag) * velocidadeProj + random(-dispersao, dispersao);

        // Criar projétil inimigo
        let projetil = poolProjeteis.obter();
        projetil.x = this.x;
        projetil.y = this.y;
        projetil.vx = vx;
        projetil.vy = vy;
        projetil.ehProjetilInimigo = true;
        projetil.tamanho = CONFIG.PROJETIL.INIMIGO.TAMANHO;
        projetil.cor = CONFIG.PROJETIL.INIMIGO.COR;
        projetil.dano = 1;
        projetil.remover = false;
      }
    }
  }

  receberDano(dano) {
    // Qualquer inimigo com ARMADURA reduz dano (Tanque, Chefe, etc.)
    if (this.config && typeof this.config.ARMADURA === 'number') {
      dano *= (1 - this.config.ARMADURA);
    }

    this.vida -= dano;
    return this.vida <= 0;
  }

  desenhar() {
    // Desenhar partículas de teletransporte primeiro
    if (this.tipo === 'TELEPORTER') {
      this.desenharParticulasTeleporte();
    }

    // Desenhar inimigo (robusto caso this.config não exista)
    const corArr = (this.config && this.config.COR) ? this.config.COR : (this.cor || [255, 0, 0]);
    const tamanhoVal = (this.tamanho) ? this.tamanho : ((this.config && this.config.TAMANHO) ? this.config.TAMANHO : 30);
    fill(...corArr);

    // Efeito especial para Teleporter
    if (this.tipo === 'TELEPORTER') {
      // Adicionar brilho
      drawingContext.shadowColor = `rgba(${corArr[0]}, ${corArr[1]}, ${corArr[2]}, 0.8)`;
      drawingContext.shadowBlur = 15;
    }

    ellipse(this.x, this.y, tamanhoVal);

    // Resetar sombra
    if (this.tipo === 'TELEPORTER') {
      drawingContext.shadowBlur = 0;
    }

    // Barra de vida
    this.desenharBarraVida();
  }

  desenharBarraVida() {
    const tamanhoLocal = (this.tamanho) ? this.tamanho : ((this.config && this.config.TAMANHO) ? this.config.TAMANHO : 30);
    const larguraBarra = tamanhoLocal;
    const alturaBarra = CONFIG.INIMIGO.BARRA_VIDA.ALTURA;
    const barraY = this.y - tamanhoLocal / 2 - CONFIG.INIMIGO.BARRA_VIDA.OFFSET_Y;

    // Fundo da barra
    noStroke();
    fill(100, 100, 100);
    rect(this.x - larguraBarra / 2, barraY, larguraBarra, alturaBarra, 2);

    // Barra de vida
    const percVida = constrain(this.vida / this.vidaMaxima, 0, 1);
    const corVida = percVida > 0.6 ? [0, 200, 0] :
      percVida > 0.3 ? [255, 255, 0] : [255, 0, 0];

    fill(...corVida);
    rect(this.x - larguraBarra / 2, barraY, larguraBarra * percVida, alturaBarra, 2);

    // Borda para visibilidade
    noFill();
    stroke(0);
    rect(this.x - larguraBarra / 2, barraY, larguraBarra, alturaBarra, 2);
    noStroke();
  }

  desenharParticulasTeleporte() {
    for (let p of this.particulasTeleporte) {
      const corParticula = (this.config && this.config.COR_PARTICULA) ? this.config.COR_PARTICULA : [200, 100, 255];
      let alpha = map(p.vida, 0, p.vidaMaxima, 0, 255);
      fill(corParticula[0], corParticula[1], corParticula[2], alpha);
      ellipse(p.x, p.y, 4);
    }
  }
}

// InimigoRápido
class InimigoRapido extends Inimigo {
  constructor(x, y) {
    super(x, y);
    this.velocidade = CONFIG.INIMIGO.RAPIDO.VELOCIDADE;
    this.tamanho = CONFIG.INIMIGO.RAPIDO.TAMANHO;
    this.vida = CONFIG.INIMIGO.RAPIDO.VIDA;
    this.vidaMaxima = CONFIG.INIMIGO.RAPIDO.VIDA;
  }
}