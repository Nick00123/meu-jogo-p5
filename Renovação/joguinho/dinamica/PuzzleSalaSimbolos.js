class PuzzleSalaSimbolos extends PuzzleBase {
  iniciar() {
    this.usaCamera = false; // Este puzzle é estático na tela
    this.sequenciaJogador = [];
    this.sequenciaCorreta = ['DADOS', 'PROC', 'CODE'];
    this.sequenciaEasterEgg = ['I', 'F', 'P', 'B'];
    this.easterEggAtivado = false;
    this.posicaoPortal = { x: 0, y: 0 };

    // 1. Define todos os símbolos que aparecerão no puzzle
    const todosOsSimbolos = [
      { simbolo: '💾', valor: 'DADOS' }, { simbolo: '⚙️', valor: 'PROC' }, { simbolo: '</>', valor: 'CODE' },
      { simbolo: '()', valor: 'DECOY1' }, { simbolo: '{}', valor: 'DECOY2' }, { simbolo: '=>', valor: 'DECOY3' }, { simbolo: '[]', valor: 'DECOY4' },
      { simbolo: '//', valor: 'DECOY5' }, { simbolo: 'if', valor: 'DECOY6' }, { simbolo: ';', valor: 'DECOY7' }, { simbolo: 'var', valor: 'DECOY8' },
      { simbolo: '""', valor: 'DECOY9' }, { simbolo: 'I', valor: 'I' }, { simbolo: 'F', valor: 'F' }, { simbolo: 'P', valor: 'P' },
      { simbolo: 'B', valor: 'B' }
    ];

    // 2. Define todas as posições disponíveis na tela
    const posicoes = [];
    const gridX = width / 2;
    const gridY = height / 2 - 50;
    const espacamentoX = 120;
    const espacamentoY = 120;

    // Cria uma grade de posições 4x4 para acomodar os 16 símbolos
    for (let i = 0; i < 4; i++) { // 4 colunas
      for (let j = 0; j < 4; j++) { // 4 linhas
        if (posicoes.length < 16) {
          const x = gridX - (espacamentoX * 1.5) + (i * espacamentoX);
          const y = gridY - (espacamentoY * 1) + (j * espacamentoY);
          posicoes.push({ x, y });
        }
      }
    }

    // 3. Embaralha os símbolos e as posições
    shuffle(todosOsSimbolos, true); // Embaralha a lista de símbolos

    // 4. Cria as entidades (placas) com as posições e símbolos embaralhados
    for (let i = 0; i < todosOsSimbolos.length; i++) {
      const simbolo = todosOsSimbolos[i];
      const pos = posicoes[i];
      this.entidades.push(new PlacaSimbolo(pos.x, pos.y, simbolo.simbolo, simbolo.valor));
    }

    // Define a posição do portal no centro dos símbolos do easter egg
    this.posicaoPortal = { x: width / 2, y: height - 120 }; // Posição fixa para o portal
  }

  desenhar() {
    super.desenhar();
    // O texto da dica foi movido para a placa no EstadoJogando.
  }

  aoClicar(mx, my) {
    if (!this.interativo) return;

    for (const entidade of this.entidades) {
      const valor = entidade.aoClicar(mx, my);
      if (valor) {
        this.sequenciaJogador.push(valor);
        this.verificarSequencias();
        // Desativa visualmente após um tempo para poder clicar de novo
        setTimeout(() => entidade.ativada = false, 300);
        break;
      }
    }
  }

  verificarSequencias() {
    const jogadorStr = this.sequenciaJogador.join(',');
    const corretaStr = this.sequenciaCorreta.join(',');
    const easterEggStr = this.sequenciaEasterEgg.join(',');

    // 1. Verifica se a sequência correta foi completada
    if (jogadorStr === corretaStr) {
      this.resolvido = true;
      return;
    }

    // 2. Verifica se a sequência do Easter Egg foi completada
    if (jogadorStr.endsWith(easterEggStr) && !this.easterEggAtivado) {
      this.easterEggAtivado = true;
      this.adicionarNotificacao("“Campus Esperança observa você.”", [0, 255, 0]);
      this.sequenciaJogador = []; // Reseta para não interferir no puzzle principal
      return;
    }

    // 3. Se o jogador já clicou em 3 símbolos e a sequência não é a correta, reseta.
    // Isso permite que o jogador tente a sequência do easter egg sem ser interrompido.
    if (this.sequenciaJogador.length >= 4 && jogadorStr !== corretaStr) {
      this.adicionarNotificacao("Sequência incorreta. Resetando...", [255, 0, 0]);
      this.sequenciaJogador = [];
    }
  }

  obterPosicaoPortal() {
    return this.posicaoPortal;
  }
}