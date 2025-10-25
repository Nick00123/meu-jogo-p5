// ===========================================
// SISTEMA DE ARMAS
// ===========================================

class Arma {
  constructor(tipo) {
    this.tipo = tipo;
    this.config = CONFIG.ARMAS[tipo];
    this.ultimoTiro = 0;
  }
  
  podeAtirar() {
    return millis() - this.ultimoTiro > this.config.COOLDOWN;
  }
  
  atirar(x, y, alvoX, alvoY) {
    if (!this.podeAtirar()) return;
    
    this.ultimoTiro = millis();
    
    switch(this.tipo) {
      case 'RIFLE':
        this.atirarRifle(x, y, alvoX, alvoY);
        break;
      case 'SHOTGUN':
        this.atirarEscopeta(x, y, alvoX, alvoY);
        break;
      case 'MACHINE_GUN':
        this.atirarMetralhadora(x, y, alvoX, alvoY);
        break;
      case 'LASER':
        this.atirarLaser(x, y, alvoX, alvoY);
        break;
      // ============================
      // Joseph: Armas Principais
      // ============================
      case 'PICARETA_ENFERRUJADA':
        this.atirarPicaretaCorpo(x, y, alvoX, alvoY);
        break;
      case 'LANTERNA_MINERACAO':
        this.atirarLanternaMineracao(x, y, alvoX, alvoY);
        break;
      case 'PISTOLA_SINALIZACAO':
        this.atirarPistolaSinalizacao(x, y, alvoX, alvoY);
        break;
      case 'CARREGADOR_PLASMA':
        this.atirarCarregadorPlasma(x, y, alvoX, alvoY);
        break;
    }
  }
  
  atirarRifle(x, y, alvoX, alvoY) {
    let dx = alvoX - x;
    let dy = alvoY - y;
    let mag = sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      let vx = (dx / mag) * this.config.VELOCIDADE_PROJETIL;
      let vy = (dy / mag) * this.config.VELOCIDADE_PROJETIL;
      
      let projetil = poolProjeteis.obter();
      projetil.x = x;
      projetil.y = y;
      projetil.vx = vx;
      projetil.vy = vy;
      projetil.ehProjetilInimigo = false;
      projetil.tamanho = this.config.TAMANHO_PROJETIL;
      projetil.cor = this.config.COR;
      projetil.dano = this.config.DANO * UpgradeSystem.getMultiplicadorDeDano();
      projetil.remover = false;
      
      // Flash de disparo respeitando densidade de partículas
      if (typeof emitirParticulas === 'function') {
        emitirParticulas(x, y, { quantidade: 4, cor: this.config.COR, velocidade: [1, 3], vida: 30 });
      }
    }
  }
  
  atirarEscopeta(x, y, alvoX, alvoY) {
    let anguloBase = atan2(alvoY - y, alvoX - x);
    let dispersaoRad = radians(this.config.ANGULO_DISPERSAO);
    
    for (let i = 0; i < this.config.QUANTIDADE_PROJETIL; i++) {
      let deslocamentoAngulo = map(i, 0, this.config.QUANTIDADE_PROJETIL - 1, -dispersaoRad/2, dispersaoRad/2);
      let angulo = anguloBase + deslocamentoAngulo;
      
      let vx = cos(angulo) * this.config.VELOCIDADE_PROJETIL;
      let vy = sin(angulo) * this.config.VELOCIDADE_PROJETIL;
      
      let projetil = poolProjeteis.obter();
      projetil.x = x;
      projetil.y = y;
      projetil.vx = vx;
      projetil.vy = vy;
      projetil.ehProjetilInimigo = false;
      projetil.tamanho = this.config.TAMANHO_PROJETIL;
      projetil.cor = this.config.COR;
      projetil.dano = this.config.DANO * UpgradeSystem.getMultiplicadorDeDano();
      projetil.remover = false;
    }
    
    // Flash de disparo compacto pós-rajada
    if (typeof emitirParticulas === 'function') {
      emitirParticulas(x, y, { quantidade: 6, cor: this.config.COR, velocidade: [1, 3], vida: 28 });
    }
  }
  
  atirarMetralhadora(x, y, alvoX, alvoY) {
    let dx = alvoX - x;
    let dy = alvoY - y;
    let mag = sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      // Adicionar pequeno spread aleatório
      let anguloBase = atan2(dy, dx);
      let dispersaoRad = radians(this.config.ANGULO_DISPERSAO);
      let angulo = anguloBase + random(-dispersaoRad/2, dispersaoRad/2);
      
      let vx = cos(angulo) * this.config.VELOCIDADE_PROJETIL;
      let vy = sin(angulo) * this.config.VELOCIDADE_PROJETIL;
      
      let projetil = poolProjeteis.obter();
      projetil.x = x;
      projetil.y = y;
      projetil.vx = vx;
      projetil.vy = vy;
      projetil.ehProjetilInimigo = false;
      projetil.tamanho = this.config.TAMANHO_PROJETIL;
      projetil.cor = this.config.COR;
      projetil.dano = this.config.DANO * UpgradeSystem.getMultiplicadorDeDano();
      projetil.remover = false;
      
      // Flash curto em cada tiro
      if (typeof emitirParticulas === 'function') {
        emitirParticulas(x, y, { quantidade: 3, cor: this.config.COR, velocidade: [1, 3], vida: 24 });
      }
    }
  }
  
  atirarLaser(x, y, alvoX, alvoY) {
    let dx = alvoX - x;
    let dy = alvoY - y;
    let mag = sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      let vx = (dx / mag) * (this.config.VELOCIDADE_PROJETIL || 12);
      let vy = (dy / mag) * (this.config.VELOCIDADE_PROJETIL || 12);
      
      let projetil = poolProjeteis.obter();
      projetil.x = x;
      projetil.y = y;
      projetil.vx = vx;
      projetil.vy = vy;
      projetil.ehProjetilInimigo = false;
      projetil.tamanho = this.config.LARGURA_FEIXE;
      projetil.cor = this.config.COR;
      projetil.dano = this.config.DANO * UpgradeSystem.getMultiplicadorDeDano();
      projetil.remover = false;
      projetil.ehLaser = true;
      
      // Efeito de brilho inicial do feixe
      if (typeof emitirParticulas === 'function') {
        emitirParticulas(x, y, { quantidade: 8, cor: this.config.COR, velocidade: [0.5, 1.2], vida: 26 });
      }
    }
  }
  
  // ============================
  // Joseph: Implementações
  // ============================
  atirarPicaretaCorpo(x, y, alvoX, alvoY) {
    const cfg = this.config; // CONFIG.ARMAS.PICARETA_ENFERRUJADA
    const danoBase = cfg.DANO * UpgradeSystem.getMultiplicadorDeDano();
    const alcance = cfg.ALCANCE_CORPO || 55;
    const arcoGraus = cfg.ARCO_CORPO_GRAUS || 70;
    const knock = cfg.KNOCKBACK || 8;
    const anguloMira = atan2(alvoY - y, alvoX - x);
    let acertos = 0;
    
    for (let i = inimigos.length - 1; i >= 0; i--) {
      const e = inimigos[i];
      if (!e) continue;
      const d = dist(x, y, e.x, e.y);
      if (d > alcance + (e.tamanho || 0) * 0.5) continue;
      const ang = atan2(e.y - y, e.x - x);
      let delta = ang - anguloMira;
      delta = atan2(sin(delta), cos(delta));
      if (abs(degrees(delta)) <= arcoGraus * 0.5) {
        const morreu = e.receberDano(danoBase);
        acertos++;
        e.x += cos(anguloMira) * knock;
        e.y += sin(anguloMira) * knock;
        if (morreu) {
          inimigos.splice(i, 1);
        }
        if (typeof emitirParticulas === 'function') {
          emitirParticulas(e.x, e.y, { quantidade: 6, cor: cfg.COR, velocidade: [1, 3], vida: 24 });
        }
      }
    }
    if (typeof emitirParticulas === 'function') {
      emitirParticulas(x, y, { quantidade: 4, cor: cfg.COR, velocidade: [0.5, 1.5], vida: 18 });
    }
  }

  atirarLanternaMineracao(x, y, alvoX, alvoY) {
    const cfg = this.config; // CONFIG.ARMAS.LANTERNA_MINERACAO
    const anguloCone = radians(cfg.ANGULO_FEIXE_GRAUS || 35);
    const alcance = cfg.ALCANCE_FEIXE || 220;
    const tempoCegueira = cfg.TEMPO_CEGUEIRA_MS || 2500;
    const anguloMira = atan2(alvoY - y, alvoX - x);
    let afetados = 0;
    
    for (let i = 0; i < inimigos.length; i++) {
      const e = inimigos[i];
      if (!e) continue;
      const d = dist(x, y, e.x, e.y);
      if (d > alcance) continue;
      const ang = atan2(e.y - y, e.x - x);
      let delta = ang - anguloMira;
      delta = atan2(sin(delta), cos(delta));
      if (abs(delta) <= anguloCone * 0.5) {
        e.cegueiraAte = (e.cegueiraAte && e.cegueiraAte > millis()) ? (e.cegueiraAte + tempoCegueira) : (millis() + tempoCegueira);
        afetados++;
      }
    }
    if (typeof emitirParticulas === 'function') {
      emitirParticulas(x, y, { quantidade: 10, cor: cfg.COR, velocidade: [0.3, 1.0], vida: 22 });
    }
  }

  atirarPistolaSinalizacao(x, y, alvoX, alvoY) {
    const cfg = this.config; // CONFIG.ARMAS.PISTOLA_SINALIZACAO
    let dx = alvoX - x;
    let dy = alvoY - y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      const spd = cfg.VELOCIDADE_PROJETIL || 8;
      let vx = (dx / mag) * spd;
      let vy = (dy / mag) * spd;
      let p = poolProjeteis.obter();
      p.x = x; p.y = y; p.vx = vx; p.vy = vy;
      p.ehProjetilInimigo = false;
      p.tamanho = cfg.TAMANHO_PROJETIL || 9;
      p.cor = cfg.COR;
      p.dano = (cfg.DANO || 9) * UpgradeSystem.getMultiplicadorDeDano();
      p.remover = false;
      // Flags de flare/burn (aplicação do DOT será feita depois em colisão/atualização de inimigo)
      p.ehSinalizador = true;
      p.chanceQueimar = cfg.CHANCE_QUEIMAR || 0.35;
      p.dpsQueimadura = cfg.DPS_QUEIMADURA || 2;
      p.tempoQueimaduraMs = cfg.TEMPO_QUEIMADURA_MS || 3000;
      p.vida = 180; // ~3s a 60fps
      
      if (typeof emitirParticulas === 'function') {
        emitirParticulas(x, y, { quantidade: 6, cor: cfg.COR, velocidade: [0.8, 1.8], vida: 20 });
      }
    }
  }

  atirarCarregadorPlasma(x, y, alvoX, alvoY) {
    const cfg = this.config; // CONFIG.ARMAS.CARREGADOR_PLASMA
    let dx = alvoX - x;
    let dy = alvoY - y;
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      const spd = cfg.VELOCIDADE_PROJETIL || 6;
      let vx = (dx / mag) * spd;
      let vy = (dy / mag) * spd;
      let p = poolProjeteis.obter();
      p.x = x; p.y = y; p.vx = vx; p.vy = vy;
      p.ehProjetilInimigo = false;
      p.tamanho = cfg.TAMANHO_PROJETIL || 10;
      p.cor = cfg.COR;
      p.dano = (cfg.DANO || 14) * UpgradeSystem.getMultiplicadorDeDano();
      p.remover = false;
      // Homing básico
      p.forcaTeleguiado = cfg.FORCA_TELEGUIADO || 0.08;
      p.velocidadeBase = spd;
      p.vida = 240; // ~4s
      
      if (typeof emitirParticulas === 'function') {
        emitirParticulas(x, y, { quantidade: 5, cor: cfg.COR, velocidade: [0.5, 1.2], vida: 24 });
      }
    }
  }
}

// ===========================================
// FUNÇÕES AUXILIARES DE ARMAS
// ===========================================

function trocarArma(indiceArma) {
  if (!armasDisponiveis || !armaJogador) {
    console.log("Sistema de armas não inicializado ainda");
    return;
  }
  
  if (indiceArma >= 0 && indiceArma < armasDisponiveis.length && indiceArma !== indiceArmaAtual) {
    let armaAntiga = armasDisponiveis[indiceArmaAtual];
    indiceArmaAtual = indiceArma;
    armaJogador = new Arma(armasDisponiveis[indiceArmaAtual]);
    
    console.log(`Arma trocada de ${armaAntiga} para ${armasDisponiveis[indiceArmaAtual]}`);
    
    // Feedback visual respeitando densidade de partículas
    if (typeof emitirParticulas === 'function') {
      emitirParticulas(jogador.x, jogador.y, {
        quantidade: 6,
        cor: CONFIG.ARMAS[armasDisponiveis[indiceArmaAtual]].COR,
        velocidade: [0.5, 1.2],
        vida: 30
      });
    }
  }
}

function encontrarInimigoMaisProximo() {
  if (!inimigos || inimigos.length === 0) return null;
  
  let maisProximo = null;
  let menorDist = Infinity;
  
  for (let inimigo of inimigos) {
    if (!inimigo || typeof inimigo.x !== 'number' || typeof inimigo.y !== 'number') continue;
    
    let d = dist(jogador.x, jogador.y, inimigo.x, inimigo.y);
    if (d < menorDist) {
      menorDist = d;
      maisProximo = inimigo;
    }
  }
  
  return maisProximo;
}