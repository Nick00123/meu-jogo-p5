class InimigoAprimorado extends Inimigo {
  constructor(x, y, tipo) {
    super(x, y, { tipo: tipo }); // Passa o objeto de configuração para o construtor pai
    this.raioAlerta = 150;
    this.alertado = false;
    this.pontosPatrulha = [];
    this.indicePatrulhaAtual = 0;
    this.vidaEscudo = 0;
    this.podeMultiplicar = false;
    this.tempoRecargaMultiplicar = 0;
    this.raioExplosao = 0;
    this.danoExplosao = 0;
    this.ultimoTeleporte = 0;
    this.tempoRecargaTeleporte = 120;
    this.posicaoCobertura = null;
    this.ultimoCheckCobertura = 0;
    this.framesPreparacaoExplosao = 30; // ~0.5s a 60fps
    this.explodindo = false;
    this.explodirNoFrame = 0;
    this.tempoRecargaReengajar = 0; // cooldown curto após cancelar preparação
    this.inicializarPropriedadesComJSON(tipo);
    this.ativo = true;
    this.geracao = this.geracao || 0;
    this.filhosGerados = this.filhosGerados || 0;
    this.vidaMaxima = this.vida;

    // Mapear cor para sprite correspondente após definir propriedades
    if (typeof this.mapearCorParaSprite === 'function') {
      this.corSprite = this.mapearCorParaSprite(this.cor);
    } else {
      // Tentar usar método da classe pai
      if (typeof Inimigo.prototype.mapearCorParaSprite === 'function') {
        this.corSprite = Inimigo.prototype.mapearCorParaSprite.call(this, this.cor);
      }
    }
  }

  inicializarPropriedadesComJSON(tipo) {
    const defaults = dadosInimigos['NORMAL'];
    const config = dadosInimigos[tipo] || defaults;

    // Atribui todas as propriedades do JSON ao inimigo
    for (const key in config) {
      if (Object.hasOwnProperty.call(config, key)) {
        this[key] = config[key];
      }
    }

    // Garante que propriedades essenciais tenham um fallback
    this.comportamento = config.comportamento ?? defaults.comportamento;
    this.vida = config.vida ?? defaults.vida;
    this.padraoAtaque = this.obterPadraoAtaque();
    this.habilidadeEspecial = this.obterHabilidadeEspecial();
    
    // Mapear cor para sprite correspondente após definir propriedades
    if (this.mapearCorParaSprite) {
      this.corSprite = this.mapearCorParaSprite(this.cor);
    }
  }

  obterPadraoComportamento() {
    return (dadosInimigos[this.tipo] || dadosInimigos['NORMAL']).comportamento || 'PERSEGUIR';
  }

  obterPadraoAtaque() {
    const padroes = {
      'RANGED': 'PROJETIL_MIRA',
      'EXPLOSIVE': 'INVESTIDA_CORPO',
      'SHIELDED': 'ATAQUE_ESCUDO',
      'MULTIPLYING': 'GERAR_MINIONS',
      'TELEPORTER': 'GOLPE_TELEPORTE',
      'SNIPER': 'TIRO_PRECISO',
      'SWARM': 'ATAQUE_ERRATICO',
      'TANK': 'DIRETO',
      'NORMAL': 'DIRETO',
      'FAST': 'DIRETO'
    };
    return padroes[this.tipo] || 'DIRETO';
  }

  obterHabilidadeEspecial() {
    const habilidades = {
      'RANGED': 'FOGO_COBERTURA',
      'EXPLOSIVE': 'AUTO_DESTRUIR',
      'SHIELDED': 'REGEN_ESCUDO',
      'MULTIPLYING': 'CLONAR',
      'TELEPORTER': 'PISCAR',
      'SNIPER': 'TIRO_PRECISO',
      'SWARM': 'MOVIMENTO_ERRATICO',
      'TANK': 'REDUCAO_DANO',
      'NORMAL': 'NENHUMA',
      'FAST': 'NENHUMA'
    };
    return habilidades[this.tipo] || 'NENHUMA';
  }

  atualizar(jogador) {
    super.atualizar(jogador);

    // Comportamentos aprimorados
    this.executarComportamento(jogador, inimigos);
    this.lidarHabilidadesEspeciais(jogador, inimigos);
    this.verificarStatusAlerta(jogador);

    // Se estiver na preparação da explosão, checar o momento de detonar
    if (this.explodindo && frameCount >= this.explodirNoFrame) {
      this.explodindo = false;
      this.explodir(jogador, inimigos);
      this.vida = 0; // remover após explodir
    }

    // Reduzir cooldown de reengajamento
    if (this.tempoRecargaReengajar > 0) this.tempoRecargaReengajar--;

    if (this.podeMultiplicar && this.tempoRecargaMultiplicar <= 0) {
      this.tentarMultiplicar(inimigos);
    }

    if (this.tempoRecargaMultiplicar > 0) {
      this.tempoRecargaMultiplicar--;
    }

    if (this.ultimoTeleporte > 0) {
      this.ultimoTeleporte--;
    }
  }

  executarComportamento(jogador, inimigos) {
    switch(this.comportamento) {
      case 'ATIRADOR_COBERTURA': 
        // comportamentoAtiradorCobertura(this, jogador);
        break;
      case 'INVESTIDA_SUICIDA':
        // comportamentoInvestidaSuicida(this, jogador);
        break;
      case 'PAREDE_ESCUDO':
        // comportamentoParedeEscudo(this, jogador);
        break;
      case 'GERADOR':
        // comportamentoGerador(this, jogador);
        break;
      case 'GOLPE_PISCAR':
        // comportamentoGolpePiscar(this, jogador);
        break;
      case 'SNIPER':
        // comportamentoSniper(this, jogador);
        break;
      case 'ENXAME':
        // comportamentoEnxame(this, jogador);
        break;
    }
  }

  lidarHabilidadesEspeciais(jogador, inimigos) {
    // Lida com cooldowns
    if (this.ultimoTeleporte > 0) {
      this.ultimoTeleporte--;
    }

    // Habilidades especiais por tipo
    switch(this.tipo) {
      case 'TELEPORTER':
        if (this.ultimoTeleporte <= 0 && dist(this.x, this.y, jogador.x, jogador.y) > 100) {
          this.teleportarParaJogador(jogador);
        }
        break;

      case 'EXPLOSIVO':
        if (dist(this.x, this.y, jogador.x, jogador.y) < 30) {
          this.explodir(jogador, inimigos);
          this.vida = 0; // Auto-destruição
        }
        break;

      case 'ESCUDADO':
        // Regeneração do escudo tratada no comportamento
        break;

      case 'MULTIPLICADOR':
        if (this.podeMultiplicar && this.tempoRecargaMultiplicar <= 0 && random() < 0.01) {
          this.tentarMultiplicar(inimigos);
        }
        break;

      case 'ATIRADOR':
        // Tiro tratado no comportamento
        break;

      case 'SNIPER':
        // Tiro preciso e recuo
        if (dist(this.x, this.y, jogador.x, jogador.y) < 80) {
          // Recuar quando jogador se aproxima
          let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
          this.x += cos(angulo) * this.velocidade * 1.5;
          this.y += sin(angulo) * this.velocidade * 1.5;
        }
        break;

      case 'TANQUE':
        // Redução de dano é passiva
        break;

      case 'SWARM':
        // Movimento errático
        if (frameCount % 30 === 0) {
          this.x += random(-20, 20);
          this.y += random(-20, 20);
        }
        break;
    }
  }

  verificarStatusAlerta(jogador) {
    // Verifica se jogador está dentro do raio de alerta
    if (dist(this.x, this.y, jogador.x, jogador.y) < this.raioAlerta) {
      this.alertado = true;
    } else {
      this.alertado = false;
    }
  }

  explodir(jogador, inimigos) {
    // Cria efeito de explosão
    if (typeof emitirParticulas === 'function') {
        emitirParticulas(this.x, this.y, { quantidade: 20, cor: [255, 100, 0], velocidade: [2, 8], vida: 30 });
    }

    // Dano em entidades próximas
    for (let inimigo of inimigos) {
      if (inimigo !== this && dist(this.x, this.y, inimigo.x, inimigo.y) < this.raioExplosao) {
        inimigo.receberDano(this.danoExplosao);
      }
    }

    // Dano ao jogador se perto
    if (dist(this.x, this.y, jogador.x, jogador.y) < this.raioExplosao) {
      jogador.receberDano(this.danoExplosao);
    }
  }

  teleportarParaJogador(jogador) {
    // Lógica de teleporte
  }

  tentarMultiplicar(inimigos) {
    // Lógica para criar clones/filhos
  }

  // ... (outros métodos de InimigoAprimorado)
}

function spawnarBoss() {
  inimigos = [];
  
  const minDist = (CONFIG && CONFIG.INIMIGO && CONFIG.INIMIGO.CHEFE && CONFIG.INIMIGO.CHEFE.DISTANCIA_MINIMA_SPAWN) ? CONFIG.INIMIGO.CHEFE.DISTANCIA_MINIMA_SPAWN : 400;
  let spawnX = CONFIG.MAPA.LARGURA / 2;
  let spawnY = CONFIG.MAPA.ALTURA / 2;

  if (dist(jogador.x, jogador.y, spawnX, spawnY) < minDist) {
    const angulo = random(TWO_PI);
    const raio = minDist + 100;
    spawnX = constrain(jogador.x + cos(angulo) * raio, 50, CONFIG.MAPA.LARGURA - 50);
    spawnY = constrain(jogador.y + sin(angulo) * raio, 50, CONFIG.MAPA.ALTURA - 50);
  }

  let novoBoss;
  if (nivel === 5) {
    // Chefe do nível 5: Gold Mask Ape
    novoBoss = new Boss(spawnX, spawnY, 80, 500, 1);
  } else if (nivel === 10) {
    // Chefe do nível 10: Crystal Guardian
    novoBoss = new Boss2(spawnX, spawnY, 90, 750, 1.2);
  } else if (nivel === 15) {
    // Chefe do nível 15: Demogorgon
    novoBoss = new Boss3(spawnX, spawnY, 90, 1200, 1.5);
  } else if (nivel === 20) {
    // Chefe Final: NÚCLEO ABISSAL
    novoBoss = new BossFinal(spawnX, spawnY);
  }

  if (novoBoss) inimigos.push(novoBoss);
  
  if (window.notificacoesBoss) {
    window.notificacoesBoss.push({ texto: "CHEFE APARECEU!", cor: [255, 200, 0], vida: 120, x: width/2, y: height/2 });
  }
}

function spawnarInimigos() {
  // Verificar se é nível de boss
  if (nivel % 5 === 0 && nivel >= 5) {    
    // Puzzles que começam imediatamente, sem altar (nível 10 e 15)
    if (nivel === 10 || nivel === 15) {
      inimigos = [];
      portalAberto = false;
      gerenciadorPuzzles.iniciarPuzzleParaNivel(nivel);
      if (gerenciadorPuzzles.puzzleAtivo) {
        gerenciadorEstados.mudarEstado('PUZZLE');
      }
    } else {
      // Outros puzzles (nível 5, 20) usam o altar.
      inimigos = [];
      portalAberto = false;
      gerenciadorPuzzles.altarAtivo = {
        x: CONFIG.MAPA.LARGURA / 2, y: CONFIG.MAPA.ALTURA / 2, tamanho: 60, nivel: nivel
      };
    }
    return;
  }
  
  // Usa um valor padrão seguro se o sistema de dificuldade não estiver pronto
  const dificuldade = (typeof dificuldadeAdaptativa !== 'undefined' && dificuldadeAdaptativa.obterMultiplicadorDificuldade) 
    ? dificuldadeAdaptativa.obterMultiplicadorDificuldade() 
    : { taxaSpawnInimigo: 1.0 };
    
  let inimigosBase = 3 * dificuldade.taxaSpawnInimigo;
  let inimigosPorNivel = 1.5 * dificuldade.taxaSpawnInimigo; // Reduzido para uma progressão mais suave
  let quantidadeInimigos = Math.floor(inimigosBase + (nivel - 1) * inimigosPorNivel);
  quantidadeInimigos = max(1, quantidadeInimigos);

  const tiposInimigosDisponiveis = Object.keys(dadosInimigos || { 'NORMAL': {} });

  for (let i = 0; i < quantidadeInimigos; i++) {
    let x, y;
    do {
      x = random(50, CONFIG.MAPA.LARGURA - 50);
      y = random(50, CONFIG.MAPA.ALTURA - 50);
    } while (dist(x, y, jogador.x, jogador.y) < 200);
    
    // Determinar tipo de inimigo baseado no nível
    let tipoInimigo;
    const chance = random();

    if (nivel >= 5 && chance < 0.15) {
      tipoInimigo = 'SNIPER';
    } else if (nivel >= 4 && chance < 0.30) {
      tipoInimigo = 'TANQUE';
    } else if (nivel >= 2 && chance < 0.50) {
      tipoInimigo = 'FAST';
    } else {
      tipoInimigo = 'NORMAL';
    }

    // Garante que o tipo de inimigo exista no JSON
    if (!dadosInimigos[tipoInimigo]) {
      tipoInimigo = 'NORMAL';
    }

    // Usa InimigoAprimorado para todos, que lê os dados do JSON
    const inimigoSpawnado = new InimigoAprimorado(x, y, tipoInimigo);
    
    if (inimigoSpawnado) {
      inimigos.push(inimigoSpawnado);
    }
  }
}

// Expor globalmente para ser acessível por outros scripts
window.spawnarInimigos = spawnarInimigos;
window.spawnarBoss = spawnarBoss;