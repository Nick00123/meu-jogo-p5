class InimigoAprimorado extends Inimigo {
  constructor(x, y, tipo) {
    super(x, y, { tipo: tipo });
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
    console.log('DEBUG - Verificando método mapearCorParaSprite:');
    console.log('- this.mapearCorParaSprite existe:', typeof this.mapearCorParaSprite);
    console.log('- this.cor:', this.cor);
    
    if (typeof this.mapearCorParaSprite === 'function') {
      this.corSprite = this.mapearCorParaSprite(this.cor);
      console.log('- corSprite mapeado:', this.corSprite);
    } else {
      // Tentar usar método da classe pai
      if (typeof Inimigo.prototype.mapearCorParaSprite === 'function') {
        this.corSprite = Inimigo.prototype.mapearCorParaSprite.call(this, this.cor);
        console.log('- corSprite mapeado (via prototype):', this.corSprite);
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
    
    // Debug para verificar a cor
    console.log('INIMIGOAPRIMORADO DEBUG:');
    console.log('- tipo:', tipo);
    console.log('- cor:', this.cor);
    console.log('- config completo:', config);
    
    // Mapear cor para sprite correspondente após definir propriedades
    if (this.mapearCorParaSprite) {
      this.corSprite = this.mapearCorParaSprite(this.cor);
      console.log('- corSprite mapeado:', this.corSprite);
    }
  }

  obterPadraoComportamento() {
    return (dadosInimigos[this.tipo] || dadosInimigos['NORMAL']).comportamento || 'PERSEGUIR';
  }

  obterPadraoComportamento() {
    const comportamentos = {
      'RANGED': 'ATIRADOR_COBERTURA',
      'EXPLOSIVE': 'INVESTIDA_SUICIDA',
      'SHIELDED': 'PAREDE_ESCUDO',
      'MULTIPLYING': 'GERADOR',
      'TELEPORTER': 'GOLPE_PISCAR',
      'SNIPER': 'SNIPER',
      'SWARM': 'ENXAME',
      'TANK': 'PERSEGUIR',
      'NORMAL': 'PERSEGUIR',
      'FAST': 'PERSEGUIR'
    };
    return comportamentos[this.tipo] || 'PERSEGUIR';
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
        comportamentoAtiradorCobertura(this, jogador);
        break;
      case 'INVESTIDA_SUICIDA':
        comportamentoInvestidaSuicida(this, jogador);
        break;
      case 'PAREDE_ESCUDO':
        comportamentoParedeEscudo(this, jogador);
        break;
      case 'GERADOR':
        comportamentoGerador(this, jogador);
        break;
      case 'GOLPE_PISCAR':
        comportamentoGolpePiscar(this, jogador);
        break;
      case 'SNIPER':
        comportamentoSniper(this, jogador);
        break;
      case 'ENXAME':
        comportamentoEnxame(this, jogador);
        break;
    }
  }

  procurarCobertura(jogador) {
    // Busca simples de cobertura - afasta do jogador
    let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
    this.posicaoCobertura = {
      x: this.x + cos(angulo) * 100,
      y: this.y + sin(angulo) * 100
    };
  }

  tentarMultiplicar(inimigos) {
    // Lê config com valores seguros
    const cfgm = (CONFIG && CONFIG.INIMIGO && CONFIG.INIMIGO.MULTIPLICADOR) ? CONFIG.INIMIGO.MULTIPLICADOR : {};
    const MAX_FILHOS_POR_INIMIGO = (typeof cfgm.MAX_FILHOS_POR_INIMIGO === 'number') ? cfgm.MAX_FILHOS_POR_INIMIGO : 2;
    const MAX_GERACAO = (typeof cfgm.MAX_GERACAO === 'number') ? cfgm.MAX_GERACAO : 2;
    const LIMITE_GLOBAL = (typeof cfgm.LIMITE_GLOBAL === 'number') ? cfgm.LIMITE_GLOBAL : 20;
    const CHANCE = (typeof cfgm.CHANCE === 'number') ? cfgm.CHANCE : 0.3;
    const RECARGA = (typeof cfgm.RECARGA === 'number') ? cfgm.RECARGA : 300;

    // Limite global de inimigos MULTIPLICADOR existentes
    const globalAtual = (typeof inimigos !== 'undefined' && inimigos.length)
      ? inimigos.reduce((acc, i) => acc + ((i && i.tipo === 'MULTIPLYING') ? 1 : 0), 0)
      : 0;

    // Checa todas as restrições
    if (this.filhosGerados >= MAX_FILHOS_POR_INIMIGO) return;
    if (this.geracao >= MAX_GERACAO) return;
    if (globalAtual >= LIMITE_GLOBAL) return;
    if (random() >= CHANCE) return;

    // Realiza geração
    let angulo = random(TWO_PI);
    let distancia = 30;
    let novoX = this.x + cos(angulo) * distancia;
    let novoY = this.y + sin(angulo) * distancia;

    // Garante dentro dos limites
    novoX = constrain(novoX, 50, CONFIG.MAPA.LARGURA - 50);
    novoY = constrain(novoY, 50, CONFIG.MAPA.ALTURA - 50);

    const filho = new InimigoAprimorado(novoX, novoY, 'MULTIPLYING');
    filho.geracao = (this.geracao || 0) + 1;
    filho.filhosGerados = 0;
    inimigos.push(filho);

    this.filhosGerados++;
    this.tempoRecargaMultiplicar = RECARGA;
  }

  explodir(jogador, inimigos) {
    // Cria efeito de explosão
    emitirParticulas(this.x, this.y, { quantidade: 20, cor: [255, 100, 0], velocidade: [2, 8], vida: 30 });

    // Dano em entidades próximas
    for (let inimigo of inimigos) {
      if (inimigo !== this && dist(this.x, this.y, inimigo.x, inimigo.y) < this.raioExplosao) {
        inimigo.vida -= this.danoExplosao;
      }
    }

    // Dano ao jogador se perto
    if (dist(this.x, this.y, jogador.x, jogador.y) < this.raioExplosao) {
      // Respeita invulnerabilidade e i-frames do dash
      if (!jogador.invulneravel && !jogador.isInvincible()) {
        // Esquiva perfeita: se o jogador deu dash até 200ms antes, não toma dano
        if (typeof jogador.ultimoDash === 'number' && (millis() - jogador.ultimoDash) < 200) {
          return; // Sem dano: esquiva perfeita
        }
        // Aplica knockback leve
        const ang = atan2(jogador.y - this.y, jogador.x - this.x);
        jogador.x += cos(ang) * 15;
        jogador.y += sin(ang) * 15;

        // Dano limitado em corações (evita hit-kill)
        const dano = Math.max(1, Math.min(2, this.danoExplosao));
        jogador.vida = Math.max(0, jogador.vida - dano);

        // Ativa i-frames padrão do jogador
        jogador.invulneravel = true;
        setTimeout(() => {
          if (jogador) jogador.invulneravel = false;
        }, CONFIG.JOGADOR.TEMPO_INVENCIVEL);
      }
    }
  }

  criarEfeitoTeleporte() {
    emitirParticulas(this.x, this.y, { quantidade: 10, cor: [0, 200, 200], velocidade: [1, 4], vida: 20 });
  }

  moverPara(destinoX, destinoY, velocidade) {
    let angulo = atan2(destinoY - this.y, destinoX - this.x);
    this.x += cos(angulo) * velocidade;
    this.y += sin(angulo) * velocidade;

    // Limita aos limites do mapa
    this.x = constrain(this.x, this.tamanho / 2, CONFIG.MAPA.LARGURA - this.tamanho / 2);
    this.y = constrain(this.y, this.tamanho / 2, CONFIG.MAPA.ALTURA - this.tamanho / 2);
  }

  atirarNoJogador(jogador) {
    if (this.tempoRecargaTiro > 0) {
      this.tempoRecargaTiro--;
      return;
    }

    // Cria projétil em direção ao jogador
    let angulo = atan2(jogador.y - this.y, jogador.x - this.x);
    let velocidadeProjetil = 4;

    // Usa pool de objetos se disponível, senão cria novo projétil
    if (typeof poolProjeteis !== 'undefined' && poolProjeteis) {
      let projetil = poolProjeteis.obter();
      if (projetil) {
        projetil.x = this.x;
        projetil.y = this.y;
        projetil.vx = cos(angulo) * velocidadeProjetil;
        projetil.vy = sin(angulo) * velocidadeProjetil;
        projetil.dano = this.dano;
        projetil.dono = 'inimigo';
        projetil.remover = false;
        projetil.vida = 120; // 2 segundos a 60fps
      }
    } else {
      // Adiciona ao array de projéteis de inimigos
      if (typeof projeteisInimigos !== 'undefined') {
        projeteisInimigos.push({
          x: this.x,
          y: this.y,
          vx: cos(angulo) * velocidadeProjetil,
          vy: sin(angulo) * velocidadeProjetil,
          dano: this.dano,
          tamanho: 4,
          cor: [255, 255, 0],
          vida: 120,
          remover: false,
          atualizar: function() {
            this.x += this.vx;
            this.y += this.vy;
            this.vida--;
            if (this.vida <= 0 || this.x < 0 || this.x > CONFIG.MAPA.LARGURA ||
                this.y < 0 || this.y > CONFIG.MAPA.ALTURA) {
              this.remover = true;
            }
          },
          desenhar: function() {
            fill(...this.cor);
            noStroke();
            ellipse(this.x, this.y, this.tamanho);
          }
        });
      }
    }

    // Reseta cooldown
    this.tempoRecargaTiro = this.tipo === 'SNIPER' ? 90 : 60;
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

      case 'EXPLOSIVE':
        if (dist(this.x, this.y, jogador.x, jogador.y) < 30) {
          this.explodir(jogador, inimigos);
          this.vida = 0; // Auto-destruição
        }
        break;

      case 'SHIELDED':
        // Regeneração do escudo tratada no comportamento
        break;

      case 'MULTIPLYING':
        if (this.podeMultiplicar && this.tempoRecargaMultiplicar <= 0 && random() < 0.01) {
          this.tentarMultiplicar(inimigos);
        }
        break;

      case 'RANGED':
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

      case 'TANK':
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

  teleportarParaJogador(jogador) {
    // Cria efeito de teleporte na posição atual
    this.criarEfeitoTeleporte();

    // Teleporta para um anel mais distante do jogador
    let angulo = random(TWO_PI);
    let distancia = random(120, 180);
    this.x = jogador.x + cos(angulo) * distancia;
    this.y = jogador.y + sin(angulo) * distancia;

    // Limita aos limites do mapa
    this.x = constrain(this.x, this.tamanho, CONFIG.MAPA.LARGURA - this.tamanho);
    this.y = constrain(this.y, this.tamanho, CONFIG.MAPA.ALTURA - this.tamanho);

    // Cria efeito de teleporte na nova posição
    this.criarEfeitoTeleporte();

    // Define cooldowns
    this.ultimoTeleporte = this.tempoRecargaTeleporte;
    this.tempoRecargaReengajar = 45; // curto tempo sem avançar
  }

  verificarStatusAlerta(jogador) {
    // Verifica se jogador está dentro do raio de alerta
    if (dist(this.x, this.y, jogador.x, jogador.y) < this.raioAlerta) {
      this.alertado = true;
    } else {
      this.alertado = false;
    }
  }

  desenhar() {
    push();

    // Desenhar brilho/aura leve por facção (sem afetar corpo)
    const brilhoAtivo = (typeof obterConfiguracao === 'function') ? obterConfiguracao('configuracoes.brilhoFaccao', true) : true;
    if (brilhoAtivo && this.faccao && CONFIG && CONFIG.HISTORIA && CONFIG.HISTORIA.FACCOES && CONFIG.HISTORIA.FACCOES[this.faccao]) {
      const corFac = CONFIG.HISTORIA.FACCOES[this.faccao].cor || this.cor;
      noStroke();
      fill(corFac[0], corFac[1], corFac[2], 40);
      const tamanhoAura = this.tamanho + 14 + sin(frameCount * 0.1) * 2;
      ellipse(this.x, this.y, tamanhoAura);
    }

    // Desenhar escudo se ativo
    if (this.vidaEscudo > 0) {
      stroke(100, 100, 255);
      strokeWeight(2);
      noFill();
      ellipse(this.x, this.y, this.tamanho + 10);

      // Indicador de vida do escudo
      let proporcaoEscudo = this.vidaEscudo / this.escudoMaximo;
      stroke(100, 100, 255, 150);
      arc(this.x, this.y, this.tamanho + 10, this.tamanho + 10, 0, TWO_PI * proporcaoEscudo);
    }

    // Corpo do inimigo com cor base (não sobrescrever ao alertar)
    noStroke();
    fill(...this.cor);
    ellipse(this.x, this.y, this.tamanho);

    // Overlay de alerta: anel pulsante/overlay sem trocar a cor base
    if (this.alertado) {
      noFill();
      stroke(255, 80, 80, 180);
      strokeWeight(2);
      const pulsar = 3 + sin(frameCount * 0.3) * 2;
      ellipse(this.x, this.y, this.tamanho + pulsar);
      // leve brilho interno
      noStroke();
      fill(255, 60, 60, 50);
      ellipse(this.x, this.y, this.tamanho * 0.9);
    }

    // Barra de vida
    this.desenharBarraVida();

    // Indicador do tipo
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(8);
    text(this.tipo.charAt(0), this.x, this.y);

    pop();
  }

  desenharBarraVida() {
    // Desenha barra de vida
    let proporcaoVida = this.vida / this.vidaMaxima;
    let larguraBarra = 20;
    let alturaBarra = 5;
    let barraX = this.x - larguraBarra / 2;
    let barraY = this.y + this.tamanho / 2 + 5;

    // Fundo
    fill(100);
    noStroke();
    rect(barraX, barraY, larguraBarra, alturaBarra);

    // Vida
    fill(255, 0, 0);
    rect(barraX, barraY, larguraBarra * proporcaoVida, alturaBarra);
  }

}

// Sobrescreve dano em InimigoAprimorado considerando escudo e redução
InimigoAprimorado.prototype.receberDano = function(dano) {
  // Escudo absorve primeiro
  if (this.vidaEscudo && this.vidaEscudo > 0) {
    const absorvido = Math.min(this.vidaEscudo, dano);
    this.vidaEscudo -= absorvido;
    dano -= absorvido;
    if (dano <= 0) return false; // todo dano absorvido
  }
  // Redução percentual (ex.: perks/facções ou tipos específicos)
  if (typeof this.reducaoDano === 'number' && this.reducaoDano > 0) {
    dano *= Math.max(0, 1 - this.reducaoDano);
  }
  this.vida -= dano;
  return this.vida <= 0;
};