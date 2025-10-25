// Sistema Aprimorado de Inimigos com novos tipos de inimigos
class InimigoAprimorado extends Inimigo {
  constructor(x, y, tipo) {
    super(x, y, tipo);
    this.inicializarPropriedadesAprimoradas();
    this.vidaMaxima = this.vida;
    this.ativo = true;
    // Rastreia linhagem de multiplicação e filhos produzidos
    this.geracao = this.geracao || 0; // 0 = original
    this.filhosGerados = this.filhosGerados || 0;
  }

  inicializarPropriedadesAprimoradas() {
    this.comportamento = this.obterPadraoComportamento();
    this.padraoAtaque = this.obterPadraoAtaque();
    this.habilidadeEspecial = this.obterHabilidadeEspecial();
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

    switch(this.tipo) {
      case 'NORMAL':
        this.vida = 50;
        this.tamanho = 30;
        this.velocidade = 2;
        this.dano = 15;
        this.cor = [255, 0, 0];
        this.comportamento = 'PERSEGUIR';
        break;

      case 'FAST':
        this.vida = 30;
        this.tamanho = 20;
        this.velocidade = 4;
        this.dano = 12;
        this.cor = [255, 255, 0];
        this.comportamento = 'PERSEGUIR';
        break;

      case 'TANK':
        this.vida = 120;
        this.tamanho = 50;
        this.velocidade = 1;
        this.dano = 25;
        this.cor = [100, 100, 100];
        this.comportamento = 'PERSEGUIR';
        this.reducaoDano = 0.5; // 50% de redução de dano
        break;

      case 'SNIPER':
        this.vida = 40;
        this.tamanho = 35;
        this.velocidade = 1.5;
        this.dano = 30;
        this.alcanceAtaque = 300;
        this.tempoRecargaTiro = 90;
        this.cor = [0, 255, 0];
        this.comportamento = 'SNIPER';
        break;

      case 'SWARM':
        this.vida = 20;
        this.tamanho = 15;
        this.velocidade = 3.5;
        this.dano = 8;
        this.cor = [255, 0, 255];
        this.comportamento = 'ENXAME';
        break;

      case 'RANGED':
        this.vida = 60;
        this.tamanho = 28;
        this.velocidade = 1.5;
        this.dano = 15;
        this.alcanceAtaque = 200;
        this.tempoRecargaTiro = 60;
        this.cor = [100, 100, 255];
        this.comportamento = 'ATIRADOR_COBERTURA';
        break;

      case 'EXPLOSIVE':
        this.vida = 40;
        this.tamanho = 30;
        this.velocidade = 1.0; // ainda mais baixo para não grudar
        this.dano = 30;
        this.raioExplosao = 65; // raio um pouco menor
        // Dano em 'corações' para o jogador (evita hit-kill)
        this.danoExplosao = 2;
        this.framesPreparacaoExplosao = 45; // ~0.75s a 60fps
        this.explodindo = false;
        this.explodirNoFrame = 0;
        this.modoLentoAte = 0; // até quando fica em modo lento (ms)
        this.cor = [255, 100, 0];
        this.comportamento = 'INVESTIDA_SUICIDA';
        break;

      case 'SHIELDED':
        this.vida = 80;
        this.tamanho = 40;
        this.vidaEscudo = 40;
        this.escudoMaximo = 40;
        this.velocidade = 1;
        this.dano = 20;
        this.cor = [150, 150, 150];
        this.comportamento = 'PAREDE_ESCUDO';
        break;

      case 'MULTIPLYING':
        this.vida = 30;
        this.tamanho = 25;
        this.velocidade = 2.5;
        this.dano = 10;
        this.podeMultiplicar = true;
        // Usa limites do CONFIG se fornecido
        const cfgm = (CONFIG && CONFIG.INIMIGO && CONFIG.INIMIGO.MULTIPLICADOR) ? CONFIG.INIMIGO.MULTIPLICADOR : {};
        this.tempoRecargaMultiplicar = (typeof cfgm.RECARGA === 'number') ? cfgm.RECARGA : 300;
        this.cor = [200, 0, 200];
        this.comportamento = 'GERADOR';
        break;

      case 'TELEPORTER':
        this.vida = 50;
        this.tamanho = 25;
        this.velocidade = 2.5;
        this.dano = 12;
        this.tempoRecargaTeleporte = 180;
        this.cor = [0, 200, 200];
        this.comportamento = 'GOLPE_PISCAR';
        break;

      default:
        // Valores padrão para tipos desconhecidos
        this.vida = 50;
        this.tamanho = 30;
        this.velocidade = 2;
        this.dano = 15;
        this.cor = [255, 0, 0];
        this.comportamento = 'PERSEGUIR';
        break;
    }
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
    this.executarComportamento(jogador);
    this.lidarHabilidadesEspeciais(jogador);
    this.verificarStatusAlerta(jogador);

    // Se estiver na preparação da explosão, checar o momento de detonar
    if (this.explodindo && frameCount >= this.explodirNoFrame) {
      this.explodindo = false;
      this.explodir();
      this.vida = 0; // remover após explodir
    }

    // Reduzir cooldown de reengajamento
    if (this.tempoRecargaReengajar > 0) this.tempoRecargaReengajar--;

    if (this.podeMultiplicar && this.tempoRecargaMultiplicar <= 0) {
      this.tentarMultiplicar();
    }

    if (this.tempoRecargaMultiplicar > 0) {
      this.tempoRecargaMultiplicar--;
    }

    if (this.ultimoTeleporte > 0) {
      this.ultimoTeleporte--;
    }
  }

  executarComportamento(jogador) {
    switch(this.comportamento) {
      case 'ATIRADOR_COBERTURA':
        this.comportamentoAtiradorCobertura(jogador);
        break;
      case 'INVESTIDA_SUICIDA':
        this.comportamentoInvestidaSuicida(jogador);
        break;
      case 'PAREDE_ESCUDO':
        this.comportamentoParedeEscudo(jogador);
        break;
      case 'GERADOR':
        this.comportamentoGerador(jogador);
        break;
      case 'GOLPE_PISCAR':
        this.comportamentoGolpePiscar(jogador);
        break;
      case 'SNIPER':
        this.comportamentoSniper(jogador);
        break;
      case 'ENXAME':
        this.comportamentoEnxame(jogador);
        break;
    }
  }

  comportamentoAtiradorCobertura(jogador) {
    let distancia = dist(this.x, this.y, jogador.x, jogador.y);

    // Procurar cobertura se muito perto
    if (distancia < 100 && this.ultimoCheckCobertura <= 0) {
      this.procurarCobertura(jogador);
      this.ultimoCheckCobertura = 30;
    }

    if (this.posicaoCobertura) {
      // Ir para cobertura
      this.moverPara(this.posicaoCobertura.x, this.posicaoCobertura.y, this.velocidade);

      // Atirar da cobertura
      if (distancia < this.alcanceAtaque && this.tempoRecargaTiro <= 0) {
        this.atirarNoJogador(jogador);
      }
    } else {
      // Manter distância ideal
      if (distancia < 150) {
        let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
        this.x += cos(angulo) * this.velocidade * 0.5;
        this.y += sin(angulo) * this.velocidade * 0.5;
      } else if (distancia > 200) {
        this.moverPara(jogador.x, jogador.y, this.velocidade * 0.3);
      }

      if (this.tempoRecargaTiro <= 0) {
        this.atirarNoJogador(jogador);
      }
    }

    if (this.ultimoCheckCobertura > 0) this.ultimoCheckCobertura--;
  }

  comportamentoInvestidaSuicida(jogador) {
    let distancia = dist(this.x, this.y, jogador.x, jogador.y);
    const raioInterno = this.raioExplosao * 0.9; // manter distância maior
    const separacaoMinima = (this.tamanho + jogador.tamanho) * 0.5 + 6; // nunca encostar
    const agora = millis();
    // Faixas de distância alvo para perseguir sem "colar" no jogador
    const idealMin = this.raioExplosao * 1.05; // limiar inferior do anel ideal
    const idealMax = this.raioExplosao * 1.6;  // limiar superior do anel ideal
    const muitoPerto = this.raioExplosao * 0.85; // muito perto, deve recuar

    // Separação dura: se colar, empurra para fora
    if (distancia < separacaoMinima) {
      const ang = atan2(this.y - jogador.y, this.x - jogador.x);
      const empurrar = (separacaoMinima - distancia) + 1;
      this.x += cos(ang) * empurrar * 0.6;
      this.y += sin(ang) * empurrar * 0.6;
      distancia = dist(this.x, this.y, jogador.x, jogador.y);
    }

    // Se muito perto e não em modo lento, entrar em modo lento por ~2s
    if (distancia < raioInterno && agora >= this.modoLentoAte) {
      this.modoLentoAte = agora + 2000; // 2 segundos
      this.explodindo = false; // bloquear qualquer preparação atual
    }

    if (distancia < this.raioExplosao) {
      // Durante modo lento: mover muito lentamente e não iniciar preparação
      if (agora < this.modoLentoAte) {
        // manter distância e mover devagar
        if (distancia < raioInterno) {
          const ang = atan2(this.y - jogador.y, this.x - jogador.x);
          this.x += cos(ang) * this.velocidade * 0.6;
          this.y += sin(ang) * this.velocidade * 0.6;
        } else {
          this.moverPara(jogador.x, jogador.y, this.velocidade * 0.1);
        }
        return;
      }

      // Iniciar preparação da explosão (se ainda não iniciou)
      if (!this.explodindo) {
        this.explodindo = true;
        this.explodirNoFrame = frameCount + (this.framesPreparacaoExplosao || 30);
        // Efeito visual de aviso (pulsos de partículas rápidas)
        emitirParticulas(this.x, this.y, { quantidade: 10, cor: [255, 180, 0], velocidade: [1, 3], vida: 15 });
      }
      // Durante a preparação, reduzir avanço para dar chance de escapar
      // (mantém uma leve aproximação para pressão)
      if (distancia < raioInterno) {
        // Muito perto: recuar um pouco para não grudar
        const ang = atan2(this.y - jogador.y, this.x - jogador.x);
        this.x += cos(ang) * this.velocidade * 1.0;
        this.y += sin(ang) * this.velocidade * 1.0;
      } else {
        this.moverPara(jogador.x, jogador.y, this.velocidade * 0.2);
      }
    } else {
      // Cancelar preparação se o jogador se afastar bastante
      if (this.explodindo && distancia > this.raioExplosao * 1.2) {
        this.explodindo = false;
        this.tempoRecargaReengajar = 45; // ~0.75s sem perseguir forte
      }
      // Avançar para o jogador
      if (this.tempoRecargaReengajar > 0) {
        // Durante cooldown, não perseguir agressivamente e manter distância
        if (distancia < idealMin) {
          let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
          this.x += cos(angulo) * this.velocidade * 0.9;
          this.y += sin(angulo) * this.velocidade * 0.9;
        } else if (distancia > idealMax) {
          this.moverPara(jogador.x, jogador.y, this.velocidade * 0.4);
        }
        this.tempoRecargaReengajar--;
        return;
      }

      // Fora do cooldown: recuar se muito perto, aproximar se muito longe
      if (distancia < muitoPerto) {
        let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
        this.x += cos(angulo) * this.velocidade * 1.1;
        this.y += sin(angulo) * this.velocidade * 1.1;
      } else if (distancia > idealMax) {
        this.moverPara(jogador.x, jogador.y, this.velocidade);
      } // se dentro do anel ideal, não fazer nada agressivo (mantém posição)
    }
  }

  comportamentoParedeEscudo(jogador) {
    let distancia = dist(this.x, this.y, jogador.x, jogador.y);

    if (this.vidaEscudo > 0) {
      // Posição defensiva
      if (distancia < 100) {
        // Recuar enquanto escudo está ativo
        let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
        this.x += cos(angulo) * this.velocidade * 0.3;
        this.y += sin(angulo) * this.velocidade * 0.3;
      } else if (distancia > 150) {
        // Aproximar
        this.moverPara(jogador.x, jogador.y, this.velocidade * 0.5);
      }
    } else {
      // Mais agressivo quando escudo está zerado
      this.moverPara(jogador.x, jogador.y, this.velocidade);
    }

    // Regeneração do escudo
    if (this.vidaEscudo < this.escudoMaximo && frameCount % 60 === 0) {
      this.vidaEscudo = min(this.vidaEscudo + 1, this.escudoMaximo);
    }
  }

  comportamentoGerador(jogador) {
    let distancia = dist(this.x, this.y, jogador.x, jogador.y);

    // Manter distância e gerar
    if (distancia < 100) {
      let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
      this.x += cos(angulo) * this.velocidade;
      this.y += sin(angulo) * this.velocidade;
    } else if (distancia > 200) {
      this.moverPara(jogador.x, jogador.y, this.velocidade * 0.5);
    }
  }

  comportamentoGolpePiscar(jogador) {
    let distancia = dist(this.x, this.y, jogador.x, jogador.y);

    // Teleportar apenas se estiver realmente longe
    if (distancia > 180 && this.ultimoTeleporte <= 0) {
      // Teleportar mais perto (mas não em cima do jogador)
      let angulo = random(TWO_PI);
      let distanciaTeleporte = random(140, 180);
      this.x = jogador.x + cos(angulo + PI) * distanciaTeleporte;
      this.y = jogador.y + sin(angulo + PI) * distanciaTeleporte;
      this.ultimoTeleporte = this.tempoRecargaTeleporte;
      this.criarEfeitoTeleporte();
      // Após teleporte, segurar avanço por um curto período
      this.tempoRecargaReengajar = 45; // ~0.75s
      return;
    }

    // Manter distância ideal (anel 110–160)
    const muitoPerto = 90;
    const idealMin = 110;
    const idealMax = 160;

    if (this.tempoRecargaReengajar > 0) {
      // Durante cooldown, priorizar não colar
      if (distancia < idealMin) {
        let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
        this.x += cos(angulo) * this.velocidade * 0.9;
        this.y += sin(angulo) * this.velocidade * 0.9;
      } else if (distancia > idealMax) {
        this.moverPara(jogador.x, jogador.y, this.velocidade * 0.4);
      }
      this.tempoRecargaReengajar--;
      return;
    }

    // Fora do cooldown: recuar se muito perto, aproximar se muito longe
    if (distancia < muitoPerto) {
      let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
      this.x += cos(angulo) * this.velocidade * 1.1;
      this.y += sin(angulo) * this.velocidade * 1.1;
    } else if (distancia > idealMax) {
      this.moverPara(jogador.x, jogador.y, this.velocidade);
    } // se dentro do anel ideal, não fazer nada agressivo (mantém posição)
  }

  comportamentoSniper(jogador) {
    let distancia = dist(this.x, this.y, jogador.x, jogador.y);

    if (distancia < 80) {
      // Recuar quando jogador se aproxima
      let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
      this.x += cos(angulo) * this.velocidade * 1.5;
      this.y += sin(angulo) * this.velocidade * 1.5;
    } else {
      // Tiro preciso
      if (distancia < this.alcanceAtaque && this.tempoRecargaTiro <= 0) {
        this.atirarNoJogador(jogador);
      }
    }
  }

  comportamentoEnxame(jogador) {
    let distancia = dist(this.x, this.y, jogador.x, jogador.y);

    if (frameCount % 30 === 0) {
      this.x += random(-20, 20);
      this.y += random(-20, 20);
    }

    // Perseguir jogador
    this.moverPara(jogador.x, jogador.y, this.velocidade);
  }

  procurarCobertura(jogador) {
    // Busca simples de cobertura - afasta do jogador
    let angulo = atan2(this.y - jogador.y, this.x - jogador.x);
    this.posicaoCobertura = {
      x: this.x + cos(angulo) * 100,
      y: this.y + sin(angulo) * 100
    };
  }

  tentarMultiplicar() {
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

  explodir() {
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

  lidarHabilidadesEspeciais(jogador) {
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
          this.explodir();
          this.vida = 0; // Auto-destruição
        }
        break;

      case 'SHIELDED':
        // Regeneração do escudo tratada no comportamento
        break;

      case 'MULTIPLYING':
        if (this.podeMultiplicar && this.tempoRecargaMultiplicar <= 0 && random() < 0.01) {
          this.tentarMultiplicar();
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

// Sistema de Grupo de Patrulha
class GrupoPatrulha {
  constructor(centroX, centroY, quantidadeMembros) {
    this.membros = [];
    this.centroX = centroX;
    this.centroY = centroY;
    this.raioPatrulha = 100;
    this.velocidadePatrulha = 0.5;
    this.nivelAlerta = 0;
    this.decaimentoAlerta = 0.5;

    // Cria formação de patrulha
    for (let i = 0; i < quantidadeMembros; i++) {
      let angulo = (TWO_PI / quantidadeMembros) * i;
      let x = centroX + cos(angulo) * this.raioPatrulha;
      let y = centroY + sin(angulo) * this.raioPatrulha;

      let inimigo = new InimigoAprimorado(x, y, 'NORMAL');
      inimigo.grupoPatrulha = this;
      inimigo.indicePatrulha = i;
      this.membros.push(inimigo);
    }
  }

  atualizar(jogador) {
    // Atualiza movimento de patrulha
    this.centroX += cos(frameCount * 0.01) * this.velocidadePatrulha;
    this.centroY += sin(frameCount * 0.01) * this.velocidadePatrulha;

    // Verifica detecção do jogador
    let jogadorDetectado = false;
    for (let membro of this.membros) {
      if (dist(membro.x, membro.y, jogador.x, jogador.y) < membro.raioAlerta) {
        jogadorDetectado = true;
        break;
      }
    }

    if (jogadorDetectado) {
      this.nivelAlerta = min(this.nivelAlerta + 2, 100);

      // Alerta todos os membros
      for (let membro of this.membros) {
        membro.alertado = true;
      }
    } else {
      this.nivelAlerta = max(this.nivelAlerta - this.decaimentoAlerta, 0);

      if (this.nivelAlerta <= 0) {
        for (let membro of this.membros) {
          membro.alertado = false;
        }
      }
    }

    // Atualiza posições dos membros
    for (let i = 0; i < this.membros.length; i++) {
      let membro = this.membros[i];
      let angulo = (TWO_PI / this.membros.length) * i + frameCount * 0.01;

      if (!membro.alertado) {
        // Formação de patrulha
        let destinoX = this.centroX + cos(angulo) * this.raioPatrulha;
        let destinoY = this.centroY + sin(angulo) * this.raioPatrulha;
        membro.moverPara(destinoX, destinoY, membro.velocidade * 0.5);
      }
    }
  }
}