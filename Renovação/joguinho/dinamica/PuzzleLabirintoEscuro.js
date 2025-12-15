class PuzzleLabirintoEscuro extends PuzzleBase {
  iniciar() {
    this.usaCamera = true; // Este puzzle usa a câmera para explorar o mapa
    this.tileSize = 80; // Tamanho de cada célula do labirinto
    this.grid = this.gerarGridLabirinto();

    this.posicaoInicial = { x: this.tileSize * 1.5, y: this.tileSize * 1.5 };
    this.posicaoFinal = { x: CONFIG.MAPA.LARGURA - this.tileSize * 1.5, y: CONFIG.MAPA.ALTURA - this.tileSize * 1.5 };
    this.cristal = { x: this.posicaoInicial.x + 60, y: this.posicaoInicial.y, r: 15, pego: false, raioLuz: 220 };
    this.placa = { x: this.posicaoInicial.x, y: this.posicaoInicial.y + 60, w: 40, h: 60 };
    this.textoPlaca = 
`Na escuridão, a luz é guia,
Um cristal que pulsa e te espia.
Siga o instinto, a trilha incerta,
Até que o destino a porta entreabra.

Mas não se apresse em cruzar o portal,
Pois a verdadeira sabedoria, afinal,
Reside no caminho já percorrido,
No retorno ao ponto de onde has partido.`;
    this.portalVisivel = false;
    this.chegouAoFinal = false;
    this.easterEggAtivado = false;
    this.mostrarPromptCristal = false;
    this.mostrarTextoPlaca = false;

    // Cria um buffer gráfico para a máscara de luz, garantindo que ele exista.
    this.lightMask = null; // Otimização: Não usaremos mais o lightMask.

    // Posiciona o jogador no início
    if (jogador) {
      jogador.x = this.posicaoInicial.x;
      jogador.y = this.posicaoInicial.y;
    }
  }

  gerarGridLabirinto() {
    const cols = Math.floor(CONFIG.MAPA.LARGURA / this.tileSize);
    const rows = Math.floor(CONFIG.MAPA.ALTURA / this.tileSize);
    
    // 1. Inicia a grade com todas as células sendo paredes (1)
    let grid = Array(rows).fill(null).map(() => Array(cols).fill(1));

    // 2. Algoritmo "Hunt-and-Kill" modificado para garantir um caminho solucionável
    let currentR = 1;
    let currentC = 1;
    grid[currentR][currentC] = 0; // Marca o início como caminho

    while (currentR !== -1 && currentC !== -1) {
      // "Walk" - Caminha aleatoriamente a partir da posição atual
      while (true) {
        const vizinhosNaoVisitados = [];
        const direcoes = [{ r: 0, c: 2 }, { r: 0, c: -2 }, { r: 2, c: 0 }, { r: -2, c: 0 }]; // Leste, Oeste, Sul, Norte

        for (const dir of direcoes) {
          const nextR = currentR + dir.r;
          const nextC = currentC + dir.c;
          if (nextR > 0 && nextR < rows - 1 && nextC > 0 && nextC < cols - 1 && grid[nextR][nextC] === 1) {
            vizinhosNaoVisitados.push(dir);
          }
        }

        if (vizinhosNaoVisitados.length === 0) {
          break; // Chegou a um beco sem saída, para o "walk"
        }

        // Escolhe uma direção aleatória para continuar cavando
        const dir = random(vizinhosNaoVisitados);
        const wallR = currentR + dir.r / 2;
        const wallC = currentC + dir.c / 2;
        grid[wallR][wallC] = 0; // Cava a parede

        currentR += dir.r;
        currentC += dir.c;
        grid[currentR][currentC] = 0; // Cava a nova célula
      }

      // "Hunt" - Procura por uma célula não visitada adjacente a uma visitada
      let found = false;
      for (let r = 1; r < rows - 1; r += 2) {
        for (let c = 1; c < cols - 1; c += 2) {
          if (grid[r][c] === 1) { // Se a célula é uma parede (não visitada)
            const vizinhosVisitados = [];
            const direcoes = [{ r: 0, c: 2 }, { r: 0, c: -2 }, { r: 2, c: 0 }, { r: -2, c: 0 }];
            for (const dir of direcoes) {
              const visitedR = r - dir.r;
              const visitedC = c - dir.c;
              if (visitedR > 0 && visitedR < rows - 1 && visitedC > 0 && visitedC < cols - 1 && grid[visitedR][visitedC] === 0) {
                vizinhosVisitados.push({ wallR: r - dir.r / 2, wallC: c - dir.c / 2 });
              }
            }

            if (vizinhosVisitados.length > 0) {
              const { wallR, wallC } = random(vizinhosVisitados);
              grid[wallR][wallC] = 0; // Conecta a uma parte existente do labirinto
              grid[r][c] = 0; // Marca a nova célula como caminho
              currentR = r;
              currentC = c;
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }

      // Se não encontrou nenhuma célula nova para continuar, encerra o loop principal.
      if (!found) {
        currentR = -1; // Condição de parada
      }
    }

    return grid;
  }

  atualizar(player) {
    super.atualizar(player);

    // Interação com a placa
    const distPlaca = dist(player.x, player.y, this.placa.x, this.placa.y);
    this.mostrarTextoPlaca = distPlaca < 80;

    // Interação com o cristal
    if (!this.cristal.pego) {
      const distCristal = dist(player.x, player.y, this.cristal.x, this.cristal.y);
      if (distCristal < 50 && keyIsDown(69)) {
        this.cristal.pego = true;
      }
      this.mostrarPromptCristal = distCristal < 50;
    } else {
      // Cristal segue o jogador
      this.cristal.x = player.x;
      this.cristal.y = player.y;
    }

    // Colisão com o labirinto
    this.verificarColisaoLabirinto(player);

    // Verifica se chegou ao final
    if (!this.chegouAoFinal && dist(player.x, player.y, this.posicaoFinal.x, this.posicaoFinal.y) < this.tileSize) {
      this.chegouAoFinal = true;
      this.portalVisivel = true;
    }

    // Verifica se o jogador entrou no portal (depois de resolvido)
    if (this.portalVisivel && dist(player.x, player.y, this.posicaoFinal.x, this.posicaoFinal.y) < this.tileSize / 2) {
      this.resolvido = true;
    }

    // Verifica o Easter Egg: chegou ao final e depois voltou ao início
    if (this.chegouAoFinal && !this.easterEggAtivado) {
      if (dist(player.x, player.y, this.placa.x, this.placa.y) < 80) {
        this.adicionarNotificacao("O verdadeiro tesouro é a jornada, não o destino.", [255, 215, 0]);
        this.easterEggAtivado = true;
      }
    }
  }

  verificarColisaoLabirinto(player) {
    const playerRaio = player.tamanho / 2;
    const col = Math.floor(player.x / this.tileSize);
    const row = Math.floor(player.y / this.tileSize);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const vizinhoRow = row + i;
        const vizinhoCol = col + j;

        if (this.grid[vizinhoRow] && this.grid[vizinhoRow][vizinhoCol] === 1) {
          const paredeX = vizinhoCol * this.tileSize;
          const paredeY = vizinhoRow * this.tileSize;

          // Verifica colisão círculo-retângulo
          const ptoMaisProximoX = constrain(player.x, paredeX, paredeX + this.tileSize);
          const ptoMaisProximoY = constrain(player.y, paredeY, paredeY + this.tileSize);

          if (dist(player.x, player.y, ptoMaisProximoX, ptoMaisProximoY) < playerRaio) {
            // Repelir o jogador para fora da parede
            const anguloRepel = atan2(player.y - ptoMaisProximoY, player.x - ptoMaisProximoX);
            player.x = ptoMaisProximoX + cos(anguloRepel) * playerRaio;
            player.y = ptoMaisProximoY + sin(anguloRepel) * playerRaio;
          }
        }
      }
    }
  }

  desenhar() {
    background(0); // Fundo preto para o efeito de escuridão
    super.desenhar();

    // 1. Desenha o mundo do jogo (paredes, itens, jogador)
    push();
    fill(4, 4, 4); // Paredes totalmente pretas, invisíveis sem luz.
    noStroke();
    rectMode(CORNER);
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j] === 1) rect(j * this.tileSize, i * this.tileSize, this.tileSize, this.tileSize);
      }
    }
    fill(110, 90, 80);
    rectMode(CENTER);
    rect(this.placa.x, this.placa.y, this.placa.w, this.placa.h, 5);
    if (!this.cristal.pego) {
      const pulsacao = 1 + 0.2 * sin(millis() * 0.005);
      fill(180, 220, 255);
      ellipse(this.cristal.x, this.cristal.y, this.cristal.r * pulsacao * 2);
      if (this.mostrarPromptCristal) {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("E", this.cristal.x, this.cristal.y - 30);
      }
    }
    if (jogador) jogador.desenhar();
    pop();

    // Desenha o portal se estiver visível
    if (this.portalVisivel) {
      push();
      const pulsacao = 1 + 0.1 * sin(millis() * 0.005);
      fill(255, 0, 255, 100 + 155 * pulsacao);
      stroke(255);
      strokeWeight(2);
      ellipse(this.posicaoFinal.x, this.posicaoFinal.y, 80 * pulsacao, 80 * pulsacao);
      pop();
    }

    // Otimização: Removemos o sistema de máscara de luz e blendMode.
    // Agora, desenhamos as fontes de luz diretamente na tela.
    push();
    noStroke();
    // Adiciona uma luz sutil no ponto inicial e final como referência.
    fill(255, 255, 200, 15); // Luz amarelada sutil no início
    ellipse(this.posicaoInicial.x, this.posicaoInicial.y, 300);
    fill(150, 200, 255, 15); // Luz azulada sutil no final
    ellipse(this.posicaoFinal.x, this.posicaoFinal.y, 300);

    if (this.cristal.pego) {
      fill(200, 240, 255, 25); // Aumenta um pouco a intensidade da luz do cristal para ser útil
      ellipse(this.cristal.x, this.cristal.y, this.cristal.raioLuz * 2);
    }
    pop();

    // O texto da placa agora é desenhado no método desenharUI para ficar fixo na tela.
  }

  desenharUI() {
    if (this.mostrarTextoPlaca) {
      push();
      // O texto da placa é desenhado em coordenadas de tela, não de mundo
      const screenX = width / 2;
      const screenY = height / 2;
      
      fill(0, 0, 0, 220);
      rectMode(CENTER);
      rect(screenX, screenY, 500, 200, 10); // Aumentei a altura da caixa
      fill(230);
      noStroke();
      textSize(16);
      textAlign(CENTER, CENTER);
      text(this.textoPlaca, screenX, screenY, 480, 180); // Aumentei a área do texto
      pop();
    }
  }

  obterPosicaoPortal() {
    return this.posicaoFinal;
  }
}