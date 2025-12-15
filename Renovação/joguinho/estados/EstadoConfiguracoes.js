// Classe SettingsState que estende EstadoBase
class EstadoConfiguracoes extends EstadoBase {
  // Construtor da classe SettingsState
  constructor(gerenciador) {
    // Chamada do construtor da classe pai
    super(gerenciador);
    // Inicialização da opção selecionada
    this.opcaoSelecionada = 0;
    // Definição das opções de configuração
    this.opcoesConfig = [
      { nome: 'MOSTRAR INTRODUÇÃO', chave: 'mostrarIntro', valor: true },
      { nome: 'DIFICULDADE', chave: 'dificuldade', valor: 'normal', opcoes: ['facil', 'normal', 'dificil'] },
      { nome: 'VOLUME', chave: 'volume', valor: 50, min: 0, max: 100 },
      { nome: 'OPACIDADE DA HUD', chave: 'opacidadeHUD', valor: 'med', opcoes: ['baixa', 'med', 'alta'] }
    ];
  }

  // Método para entrar no estado de configurações
  entrar() {
    // Reinicialização da opção selecionada
    this.opcaoSelecionada = 0;
    // Carregamento das configurações salvas
    this.carregarConfiguracoes();
  }

  // Método para carregar as configurações salvas
  carregarConfiguracoes() {
    // Iteração sobre as opções de configuração
    for (let config of this.opcoesConfig) {
      // Recuperação do valor salvo para a configuração
      const salvo = localStorage.getItem(`configuracoes.${config.chave}`);
      // Verificação se o valor salvo é válido
      if (salvo !== null) {
        // Atualização do valor da configuração
        config.valor = config.opcoes ? 
          (config.opcoes.includes(salvo) ? salvo : config.valor) : 
          (config.min !== undefined ? Number(salvo) : salvo === 'true');
      }
    }
  }

  // Método para salvar as configurações
  salvarConfiguracoes() {
    // Iteração sobre as opções de configuração
    for (let config of this.opcoesConfig) {
      // Salvar o valor da configuração
      localStorage.setItem(`configuracoes.${config.chave}`, config.valor);
    }
  }

  // Método para atualizar o estado de configurações
  atualizar() {
    // Configurações não precisam de atualização constante
  }

  // Método para desenhar o estado de configurações
  desenhar() {
    // Definição da cor de fundo
    background(20, 20, 40);

    // Desenho do título
    push();
    textAlign(CENTER, TOP);
    textSize(32);
    fill(255, 255, 0);
    text('CONFIGURAÇÕES', width / 2, 30);
    pop();

    // Desenho das opções de configuração
    push();
    textAlign(LEFT, CENTER);
    textSize(20);

    // Iteração sobre as opções de configuração
    for (let i = 0; i < this.opcoesConfig.length; i++) {
      const config = this.opcoesConfig[i];
      const yPos = height / 3 + i * 60;

      // Destaque para opção selecionada
      if (i === this.opcaoSelecionada) {
        fill(255, 255, 0, 50);
        rect(width / 2 - 250, yPos - 25, 500, 50, 5);
      }

      // Nome da configuração
      fill(i === this.opcaoSelecionada ? [255, 255, 0] : [255]);
      text(config.nome, width / 2 - 240, yPos);

      // Valor da configuração
      fill(i === this.opcaoSelecionada ? [100, 255, 100] : [150]);
      if (config.opcoes) {
        // Mostrar opções disponíveis
        const textoOpcoes = config.opcoes.map((op, idx) => 
          idx === config.opcoes.indexOf(config.valor) ? `[${op.toUpperCase()}]` : op
        ).join(' | ');
        text(textoOpcoes, width / 2 + 50, yPos);
      } else if (config.min !== undefined) {
        // Mostrar barra de volume
        const barraLargura = 150;
        const barraX = width / 2 + 50;
        fill(100);
        rect(barraX, yPos - 10, barraLargura, 20);
        fill(100, 255, 100);
        rect(barraX, yPos - 10, (config.valor / config.max) * barraLargura, 20);
        fill(255);
        text(`${config.valor}%`, barraX + barraLargura + 20, yPos);
      } else {
        // Mostrar ON/OFF
        text(config.valor ? 'LIGADO' : 'DESLIGADO', width / 2 + 50, yPos);
      }
    }
    pop();

    // Instruções
    push();
    textAlign(CENTER, BOTTOM);
    textSize(16);
    fill(160);
    text('SETAS para navegar, ENTER/ESPAÇO para alterar, ESC para voltar', width / 2, height - 30);
    pop();
  }

  // Método para lidar com a pressão de teclas
  aoPressionarTecla() {
    const configAtual = this.opcoesConfig[this.opcaoSelecionada];

    // Navegação entre opções
    if (keyCode === UP_ARROW && this.opcaoSelecionada > 0) {
      this.opcaoSelecionada--;
    } else if (keyCode === DOWN_ARROW && this.opcaoSelecionada < this.opcoesConfig.length - 1) {
      this.opcaoSelecionada++;
    } else if (keyCode === ENTER || key === ' ') {
      // Alteração da configuração
      this.alterarConfiguracao(configAtual);
    } else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
      // Navegação entre opções
      if (configAtual.opcoes) {
        this.navegarOpcoes(configAtual, keyCode === LEFT_ARROW ? -1 : 1);
      } else if (configAtual.min !== undefined) {
        // Ajuste do valor
        this.ajustarValor(configAtual, keyCode === LEFT_ARROW ? -5 : 5);
      }
    } else if (keyCode === ESCAPE) {
      // Salvar configurações e voltar ao menu
      this.salvarConfiguracoes();
      this.gerenciador.mudarEstado('MENU');
    }
  }

  // Método para alterar a configuração
  alterarConfiguracao(config) {
    // Alternar booleano
    if (config.opcoes === undefined && config.min === undefined) {
      config.valor = !config.valor;
    }
  }

  // Método para navegar entre opções
  navegarOpcoes(config, direcao) {
    const indiceAtual = config.opcoes.indexOf(config.valor);
    const novoIndice = (indiceAtual + direcao + config.opcoes.length) % config.opcoes.length;
    config.valor = config.opcoes[novoIndice];
  }

  // Método para ajustar o valor
  ajustarValor(config, delta) {
    config.valor = constrain(config.valor + delta, config.min, config.max);
  }
}