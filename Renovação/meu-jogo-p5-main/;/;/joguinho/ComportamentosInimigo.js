// ===========================================
// COMPORTAMENTOS DE INIMIGOS
// ===========================================

function comportamentoAtiradorCobertura(inimigo, jogador) {
  let distancia = dist(inimigo.x, inimigo.y, jogador.x, jogador.y);

  if (distancia < 100 && inimigo.ultimoCheckCobertura <= 0) {
    inimigo.procurarCobertura(jogador);
    inimigo.ultimoCheckCobertura = 30;
  }

  if (inimigo.posicaoCobertura) {
    inimigo.moverPara(inimigo.posicaoCobertura.x, inimigo.posicaoCobertura.y, inimigo.velocidade);
    if (distancia < inimigo.alcanceAtaque && inimigo.tempoRecargaTiro <= 0) {
      inimigo.atirarNoJogador(jogador);
    }
  } else {
    if (distancia < 150) {
      let angulo = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
      inimigo.x += cos(angulo) * inimigo.velocidade * 0.5;
      inimigo.y += sin(angulo) * inimigo.velocidade * 0.5;
    } else if (distancia > 200) {
      inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade * 0.3);
    }
    if (inimigo.tempoRecargaTiro <= 0) {
      inimigo.atirarNoJogador(jogador);
    }
  }

  if (inimigo.ultimoCheckCobertura > 0) inimigo.ultimoCheckCobertura--;
}

function comportamentoInvestidaSuicida(inimigo, jogador) {
  let distancia = dist(inimigo.x, inimigo.y, jogador.x, jogador.y);
  const raioInterno = inimigo.raioExplosao * 0.9;
  const separacaoMinima = (inimigo.tamanho + jogador.tamanho) * 0.5 + 6;
  const agora = millis();
  const idealMin = inimigo.raioExplosao * 1.05;
  const idealMax = inimigo.raioExplosao * 1.6;
  const muitoPerto = inimigo.raioExplosao * 0.85;

  if (distancia < separacaoMinima) {
    const ang = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
    const empurrar = (separacaoMinima - distancia) + 1;
    inimigo.x += cos(ang) * empurrar * 0.6;
    inimigo.y += sin(ang) * empurrar * 0.6;
    distancia = dist(inimigo.x, inimigo.y, jogador.x, jogador.y);
  }

  if (distancia < raioInterno && agora >= inimigo.modoLentoAte) {
    inimigo.modoLentoAte = agora + 2000;
    inimigo.explodindo = false;
  }

  if (distancia < inimigo.raioExplosao) {
    if (agora < inimigo.modoLentoAte) {
      if (distancia < raioInterno) {
        const ang = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
        inimigo.x += cos(ang) * inimigo.velocidade * 0.6;
        inimigo.y += sin(ang) * inimigo.velocidade * 0.6;
      } else {
        inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade * 0.1);
      }
      return;
    }

    if (!inimigo.explodindo) {
      inimigo.explodindo = true;
      inimigo.explodirNoFrame = frameCount + (inimigo.framesPreparacaoExplosao || 30);
      emitirParticulas(inimigo.x, inimigo.y, { quantidade: 10, cor: [255, 180, 0], velocidade: [1, 3], vida: 15 });
    }

    if (distancia < raioInterno) {
      const ang = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
      inimigo.x += cos(ang) * inimigo.velocidade * 1.0;
      inimigo.y += sin(ang) * inimigo.velocidade * 1.0;
    } else {
      inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade * 0.2);
    }
  } else {
    if (inimigo.explodindo && distancia > inimigo.raioExplosao * 1.2) {
      inimigo.explodindo = false;
      inimigo.tempoRecargaReengajar = 45;
    }
    if (inimigo.tempoRecargaReengajar > 0) {
      if (distancia < idealMin) {
        let angulo = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
        inimigo.x += cos(angulo) * inimigo.velocidade * 0.9;
        inimigo.y += sin(angulo) * inimigo.velocidade * 0.9;
      } else if (distancia > idealMax) {
        inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade * 0.4);
      }
      inimigo.tempoRecargaReengajar--;
      return;
    }

    if (distancia < muitoPerto) {
      let angulo = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
      inimigo.x += cos(angulo) * inimigo.velocidade * 1.1;
      inimigo.y += sin(angulo) * inimigo.velocidade * 1.1;
    } else if (distancia > idealMax) {
      inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade);
    }
  }
}

function comportamentoParedeEscudo(inimigo, jogador) {
  let distancia = dist(inimigo.x, inimigo.y, jogador.x, jogador.y);

  if (inimigo.vidaEscudo > 0) {
    if (distancia < 100) {
      let angulo = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
      inimigo.x += cos(angulo) * inimigo.velocidade * 0.3;
      inimigo.y += sin(angulo) * inimigo.velocidade * 0.3;
    } else if (distancia > 150) {
      inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade * 0.5);
    }
  } else {
    inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade);
  }

  if (inimigo.vidaEscudo < inimigo.escudoMaximo && frameCount % 60 === 0) {
    inimigo.vidaEscudo = min(inimigo.vidaEscudo + 1, inimigo.escudoMaximo);
  }
}

function comportamentoGerador(inimigo, jogador) {
  let distancia = dist(inimigo.x, inimigo.y, jogador.x, jogador.y);

  if (distancia < 100) {
    let angulo = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
    inimigo.x += cos(angulo) * inimigo.velocidade;
    inimigo.y += sin(angulo) * inimigo.velocidade;
  } else if (distancia > 200) {
    inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade * 0.5);
  }
}

function comportamentoGolpePiscar(inimigo, jogador) {
  let distancia = dist(inimigo.x, inimigo.y, jogador.x, jogador.y);

  if (distancia > 180 && inimigo.ultimoTeleporte <= 0) {
    let angulo = random(TWO_PI);
    let distanciaTeleporte = random(140, 180);
    inimigo.x = jogador.x + cos(angulo + PI) * distanciaTeleporte;
    inimigo.y = jogador.y + sin(angulo + PI) * distanciaTeleporte;
    inimigo.ultimoTeleporte = inimigo.tempoRecargaTeleporte;
    inimigo.criarEfeitoTeleporte();
    inimigo.tempoRecargaReengajar = 45;
    return;
  }

  const muitoPerto = 90;
  const idealMin = 110;
  const idealMax = 160;

  if (inimigo.tempoRecargaReengajar > 0) {
    if (distancia < idealMin) {
      let angulo = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
      inimigo.x += cos(angulo) * inimigo.velocidade * 0.9;
      inimigo.y += sin(angulo) * inimigo.velocidade * 0.9;
    } else if (distancia > idealMax) {
      inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade * 0.4);
    }
    inimigo.tempoRecargaReengajar--;
    return;
  }

  if (distancia < muitoPerto) {
    let angulo = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
    inimigo.x += cos(angulo) * inimigo.velocidade * 1.1;
    inimigo.y += sin(angulo) * inimigo.velocidade * 1.1;
  } else if (distancia > idealMax) {
    inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade);
  }
}

function comportamentoSniper(inimigo, jogador) {
  let distancia = dist(inimigo.x, inimigo.y, jogador.x, jogador.y);

  if (distancia < 80) {
    let angulo = atan2(inimigo.y - jogador.y, inimigo.x - jogador.x);
    inimigo.x += cos(angulo) * inimigo.velocidade * 1.5;
    inimigo.y += sin(angulo) * inimigo.velocidade * 1.5;
  } else {
    if (distancia < inimigo.alcanceAtaque && inimigo.tempoRecargaTiro <= 0) {
      inimigo.atirarNoJogador(jogador);
    }
  }
}

function comportamentoEnxame(inimigo, jogador) {
  if (frameCount % 30 === 0) {
    inimigo.x += random(-20, 20);
    inimigo.y += random(-20, 20);
  }
  inimigo.moverPara(jogador.x, jogador.y, inimigo.velocidade);
}