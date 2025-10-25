class EstadoJogando extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);
  }

  entrar() {
    // Inicializar jogo se necessário
    if (!jogador) {
      inicializarJogo();
    }
  }

  atualizar() {
    // Update do jogo principal - remover verificações desnecessárias
    atualizarJogo();
  }

  desenhar() {
    // Draw do jogo principal (código existente)
    desenharJogo();
  }

  aoPressionarTecla() {
    if (key === 'p' || key === 'P') {
      this.gerenciador.mudarEstado('PAUSADO');
    }
    
    // Sistema de troca de armas com teclas 1, 2, 3, 4
    if (gerenciadorEstadoJogo.obterEstadoAtual() === 'JOGANDO') {
      if (key === '1') {
        trocarArma(0);
      } else if (key === '2') {
        trocarArma(1);
      } else if (key === '3') {
        trocarArma(2);
      } else if (key === '4') {
        trocarArma(3);
      }
    }

    // Interação com o vendedor
    if ((key === 'e' || key === 'E')) {
      if (npcVendedor && npcVendedor.ativo) {
        const d = dist(jogador.x, jogador.y, npcVendedor.x, npcVendedor.y);
        if (d < npcVendedor.r + 40) {
          mostrarLoja = true;
        }
      }
    }
  }
}