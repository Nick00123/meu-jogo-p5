// ===========================================
// GERENCIADOR DE QUADTREE PARA O JOGO
// ===========================================

class GerenciadorQuadTree {
  constructor(largura = 800, altura = 600) {
    this.quadTree = null;
    this.depuracao = false;
    this.largura = largura;
    this.altura = altura;
    this.inicializar();
  }

  inicializar() {
    const limite = new Retangulo(
      this.largura / 2,
      this.altura / 2,
      this.largura,
      this.altura
    );
    this.quadTree = new QuadTree(limite, 4);
  }

  atualizar(objetos) {
    // Limpa a QuadTree
    this.quadTree.limpar();
    
    // Insere objetos na QuadTree
    objetos.forEach(objeto => {
      if (objeto && objeto.x !== undefined && objeto.y !== undefined) {
        this.quadTree.inserir({
          x: objeto.x,
          y: objeto.y,
          objeto: objeto,
          tamanho: objeto.tamanho || 10
        });
      }
    });
  }

  consultar(intervalo, filtro = null) {
    const encontrados = [];
    this.quadTree.consultar(intervalo, encontrados);
    
    if (filtro) {
      return encontrados.filter(item => filtro(item.objeto));
    }
    
    return encontrados.map(item => item.objeto);
  }

  alternarDepuracao() {
    this.depuracao = !this.depuracao;
  }

  desenhar() {
    if (this.depuracao && this.quadTree) {
      this.quadTree.desenhar();
    }
  }
}

// Criar instância global com valores padrão (serão atualizados no setup do jogo)
window.gerenciadorQuadTree = new GerenciadorQuadTree();