class EstadoPuzzle extends EstadoBase {
  constructor() {
    super();
    this.nome = "EstadoPuzzle";
  }

  entrar() {
    console.log("Entrando no Estado Puzzle");
    // A lógica de iniciar o puzzle para o nível já foi chamada
    // pelo GerenciadorSpawn antes de mudar para este estado.
    const puzzleAtual = gerenciadorPuzzles.puzzleAtivo;
    if (puzzleAtual && puzzleAtual.usaCamera) {
      sistemaCamera.zoom = 2.5; // Aumenta o zoom para deixar a câmera mais próxima do jogador
    }
  }

  sair() {
    console.log("Saindo do Estado Puzzle");
    sistemaCamera.zoom = 1.0; // Reseta o zoom para o padrão
  }

  atualizar() {
    if (jogador) jogador.atualizar(); // Permite que o jogador se mova, se necessário
    if (sistemaCamera) sistemaCamera.atualizar(); // Garante que a câmera siga o jogador
    gerenciadorPuzzles.atualizar();
  }

  desenhar() {
    background(0); // Fundo escuro para o puzzle

    const puzzleAtual = gerenciadorPuzzles.puzzleAtivo;
    const deveUsarCamera = puzzleAtual && puzzleAtual.usaCamera;

    if (deveUsarCamera) {
      push();
      if (sistemaCamera) sistemaCamera.aplicar();
    }

    // O desenho do jogador e do mapa agora é controlado pela classe do puzzle
    gerenciadorPuzzles.desenhar();

    if (deveUsarCamera) pop(); // Fim da câmera

    // Desenha elementos de UI do puzzle (como caixas de texto) por cima de tudo
    if (puzzleAtual && typeof puzzleAtual.desenharUI === 'function') {
      puzzleAtual.desenharUI();
    }

    desenharHUD();
  }

  aoPressionarTecla(keyCode) {
    // Pode adicionar lógicas de tecla específicas para o puzzle aqui
  }

  aoClicarMouse() { // Nome do método corrigido para corresponder ao GerenciadorEstados
    gerenciadorPuzzles.aoClicar(mouseX, mouseY);
  }
}