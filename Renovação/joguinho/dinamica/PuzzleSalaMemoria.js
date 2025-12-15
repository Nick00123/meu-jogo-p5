class PlacaMemoria extends PlacaSimbolo {
  constructor(x, y, simbolo, id) {
    super(x, y, simbolo, id); // Reutiliza o construtor da PlacaSimbolo
    this.id = id;
    this.r = 50; // Raio maior para facilitar o clique
    this.brilhando = false;
    this.tempoBrilhoFim = 0;
  }

  desenhar() {
    if (this.brilhando && millis() > this.tempoBrilhoFim) {
      this.brilhando = false;
    }

    push();
    translate(this.x, this.y);
    stroke(this.brilhando ? '#FFFF00' : '#A0A0FF');
    strokeWeight(4);
    fill(this.brilhando ? '#404020' : '#202040');
    rectMode(CENTER);
    rect(0, 0, this.r * 2, this.r * 2, 10);
    noStroke();
    fill(this.brilhando ? '#FFFFFF' : '#E0E0FF');
    textSize(32);
    textAlign(CENTER, CENTER);
    text(this.simbolo, 0, 0);
    pop();
  }

  brilhar(duracao = 500) {
    this.brilhando = true;
    this.tempoBrilhoFim = millis() + duracao;
  }

  aoClicar(mx, my) {
    if (dist(mx, my, this.x, this.y) < this.r) {
      this.brilhar(300);
      return this.id;
    }
    return null;
  }
}

class PuzzleSalaMemoria extends PuzzleBase {
  iniciar() {
    this.usaCamera = true; // Agora o puzzle usa a câmera e existe no mundo do jogo
    this.estado = 'ESPERANDO_INICIO'; // NOVO ESTADO: ESPERANDO_INICIO, MOSTRANDO, AGUARDANDO
    this.nivelSequencia = 3; // Dificuldade aumentada: começa com 3
    this.sequenciaCorreta = [];
    this.sequenciaJogador = [];
    this.indiceAtualMostrando = 0;
    this.ultimoTempoMostrado = 0;
    this.tempoEntreBrilhos = 800; // ms

    const simbolos = [
      { simbolo: '🧠', id: 'MIND' }, { simbolo: '👁️', id: 'EYE' }, { simbolo: '👂', id: 'EAR' }, { simbolo: '👃', id: 'NOSE' },
      { simbolo: '🖐️', id: 'HAND' }, { simbolo: '❤️', id: 'HEART' }, { simbolo: '⭐', id: 'STAR' }, { simbolo: '🌙', id: 'MOON' },
      { simbolo: '🔥', id: 'FIRE' }, { simbolo: '💧', id: 'WATER' }, { simbolo: '🌿', id: 'PLANT' }, { simbolo: '⚡', id: 'BOLT' }
    ];

    // Define o centro do puzzle no mapa do jogo
    const centroX = CONFIG.MAPA.LARGURA / 2;
    const centroY = CONFIG.MAPA.ALTURA / 2;

    const posicoes = [
      // Grade 4x3 para 12 símbolos, agora em coordenadas do mundo
      { x: centroX - 225, y: centroY - 120 }, { x: centroX - 75, y: centroY - 120 }, { x: centroX + 75, y: centroY - 120 }, { x: centroX + 225, y: centroY - 120 },
      { x: centroX - 225, y: centroY },       { x: centroX - 75, y: centroY },       { x: centroX + 75, y: centroY },       { x: centroX + 225, y: centroY },
      { x: centroX - 225, y: centroY + 120 }, { x: centroX - 75, y: centroY + 120 }, { x: centroX + 75, y: centroY + 120 }, { x: centroX + 225, y: centroY + 120 },
    ];

    for (let i = 0; i < simbolos.length; i++) {
      this.entidades.push(new PlacaMemoria(posicoes[i].x, posicoes[i].y, simbolos[i].simbolo, simbolos[i].id));
    }

    // Pedra de ativação central, em coordenadas do mundo
    this.pedraAtivacao = { x: centroX, y: centroY + 250, r: 50, texto: "Iniciar" };

    // Posiciona o jogador no início do puzzle
    if (jogador) {
      jogador.x = centroX;
      jogador.y = centroY + 350;
    }
  }

  gerarNovaSequencia() {
    this.sequenciaCorreta = [];
    const placasDisponiveis = [...this.entidades];
    for (let i = 0; i < this.nivelSequencia; i++) {
      const indiceAleatorio = floor(random(placasDisponiveis.length));
      this.sequenciaCorreta.push(placasDisponiveis.splice(indiceAleatorio, 1)[0]);
    }
    this.sequenciaJogador = [];
    this.estado = 'MOSTRANDO';
    this.indiceAtualMostrando = 0;
    this.ultimoTempoMostrado = millis() + 1000; // Pausa antes de começar
  }

  atualizar(player) {
    super.atualizar(player);
    if (this.estado === 'MOSTRANDO' && millis() > this.ultimoTempoMostrado && this.indiceAtualMostrando < this.sequenciaCorreta.length) {
      if (this.indiceAtualMostrando < this.sequenciaCorreta.length) {
        this.sequenciaCorreta[this.indiceAtualMostrando].brilhar();
        this.ultimoTempoMostrado = millis() + this.tempoEntreBrilhos;
        this.indiceAtualMostrando++;
      } else {
        this.estado = 'AGUARDANDO';
      }
    }
  }

  desenhar() {
    background(20, 20, 40);
    super.desenhar(); // Desenha as placas
    if (jogador) jogador.desenhar(); // Desenha o jogador

    push();

    // Desenha a pedra de ativação se o jogo não começou
    if (this.estado === 'ESPERANDO_INICIO') {
      const worldMouseX = mouseX - (width / 2 - sistemaCamera.x);
      const worldMouseY = mouseY - (height / 2 - sistemaCamera.y);
      const p = this.pedraAtivacao;
      const mouseSobre = dist(worldMouseX, worldMouseY, p.x, p.y) < p.r;
      push();
      translate(p.x, p.y);
      stroke(mouseSobre ? '#FFFF00' : '#A0A0FF');
      strokeWeight(3);
      fill(mouseSobre ? '#303050' : '#202040');
      ellipse(0, 0, p.r * 2); // Dessenha a pedra nas coordenadas do mundo
      noStroke();
      fill(255);
      textSize(20);
      textAlign(CENTER, CENTER);
      text(p.texto, 0, 0);  // Desenha o texto nas coordenadas do mundo
      pop();
    }
    pop();
  }

  desenharUI() {
    // Desenha textos de UI por cima de tudo, em coordenadas de tela
    push();
    fill(220); textSize(24); textAlign(CENTER, TOP);
    if (this.estado === 'ESPERANDO_INICIO') {
      text("Toque na pedra para despertar a memória.", width / 2, 60);
    } else {
      text("O conhecimento não se impõe.\nEle é lembrado.", width / 2, 60);
    }
    pop();
  }

  aoClicar(mx, my) {
    // Converte as coordenadas do mouse da tela para o mundo do jogo
    const worldX = mx - (width / 2 - sistemaCamera.x);
    const worldY = my - (height / 2 - sistemaCamera.y);

    if (this.estado === 'ESPERANDO_INICIO') {
      if (dist(worldX, worldY, this.pedraAtivacao.x, this.pedraAtivacao.y) < this.pedraAtivacao.r) {
        this.gerarNovaSequencia(); // Inicia o jogo
      }
      return;
    }

    if (this.estado !== 'AGUARDANDO') return;

    for (const placa of this.entidades) {
      // Passa as coordenadas do mundo para a verificação de clique
      const id = placa.aoClicar(worldX, worldY);
      if (id) {
        this.sequenciaJogador.push(placa);
        const idx = this.sequenciaJogador.length - 1;

        // Verifica se o clique atual está correto
        if (this.sequenciaJogador[idx] !== this.sequenciaCorreta[idx]) {
          this.adicionarNotificacao("Memória falhou. Tente novamente.", [255, 100, 100]);
          this.nivelSequencia = max(2, this.nivelSequencia - 1); // Volta uma etapa
          this.gerarNovaSequencia();
          return;
        }

        // Verifica se completou a sequência
        if (this.sequenciaJogador.length === this.sequenciaCorreta.length) {
          this.nivelSequencia++;
          if (this.nivelSequencia > 6) { // Dificuldade aumentada: precisa de 6 acertos
            this.adicionarNotificacao("Memória Restaurada!", [100, 255, 100]);
            this.resolvido = true;
          } else {
            this.adicionarNotificacao("Correto! Próxima sequência...", [220, 220, 100]);
            this.gerarNovaSequencia();
          }
        }
        break;
      }
    }
  }
}