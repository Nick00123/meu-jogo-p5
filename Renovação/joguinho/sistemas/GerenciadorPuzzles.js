class GerenciadorPuzzles {
  constructor() {
    this.puzzleAtivo = null;
    this.puzzleConcluido = false;
    this.portal = null; // Portal para o chefe (dentro do puzzle)
    this.altarAtivo = null; // Altar que aparece no mapa do jogo
  }

  iniciarPuzzleParaNivel(nivel) {
    this.puzzleConcluido = false;
    switch (nivel) {
      case 5:
        this.puzzleAtivo = new PuzzleSalaSimbolos();
        break;
      case 10:
        this.puzzleAtivo = new PuzzleLabirintoEscuro();
        break;
      case 15:
        this.puzzleAtivo = new PuzzleSalaMemoria();
        break;
      // case 20:
      //   this.puzzleAtivo = new PuzzleNucleoConhecimento();
      //   break;
      default:
        this.puzzleAtivo = null;
        this.puzzleConcluido = true; // Se não há puzzle, considera concluído
        return;
    }

    if (this.puzzleAtivo) {
      this.puzzleAtivo.iniciar();
      this.portal = null; // Garante que não há portal no início
      // Se o puzzle usa câmera, força a câmera a centralizar no jogador imediatamente
      if (this.puzzleAtivo.usaCamera && jogador && sistemaCamera) {
        sistemaCamera.seguir(jogador);
      }
      // A mudança de estado agora é feita pelo GerenciadorEstados
    }
  }

  atualizar() {
    // Se o portal estiver aberto, verifica a colisão com o jogador
    if (this.portal) {
      // Lógica de portal foi movida para EstadoJogando
      // Esta seção pode ser removida ou adaptada se houver portais dentro dos puzzles.
      // Por enquanto, vamos apenas retornar.
      return; // Não faz mais nada se o portal está ativo
    }

    // Se o puzzle estiver ativo e não resolvido
    if (this.puzzleAtivo) {
      this.puzzleAtivo.atualizar(jogador);
      if (this.puzzleAtivo.estaResolvido()) {
        // Puzzle resolvido!
        this.puzzleConcluido = true;
        
        // Pega a posição para o portal ANTES de limpar o puzzle
        let posPortal = { x: width / 2, y: height / 2 };
        if (typeof this.puzzleAtivo.obterPosicaoPortal === 'function') {
          posPortal = this.puzzleAtivo.obterPosicaoPortal();
        } else if (this.altarAtivo) {
          posPortal = { x: this.altarAtivo.x, y: this.altarAtivo.y + 100 };
        }

        this.puzzleAtivo = null;
        this.altarAtivo = null; // Remove o altar

        gerenciadorEstados.mudarEstado('JOGANDO'); // Volta ao estado normal
        portalAberto = true;
        portal.x = posPortal.x;
        portal.y = posPortal.y;
        portal.tipo = 'boss'; // Identifica que é um portal para o chefe
      }
    }
  }

  desenhar() {
    if (this.puzzleAtivo) {
      this.puzzleAtivo.desenhar();
    }

    // Desenha o portal se ele existir
    if (this.portal) {
      push();
      fill(255, 0, 255, 100 + 155 * sin(millis() * 0.005));
      stroke(255);
      strokeWeight(2);
      ellipse(this.portal.x, this.portal.y, this.portal.tamanho, this.portal.tamanho);
      pop();
    }
  }

  aoClicar(mx, my) {
    if (this.puzzleAtivo) {
      this.puzzleAtivo.aoClicar(mx, my);
    }
  }
}

const gerenciadorPuzzles = new GerenciadorPuzzles();