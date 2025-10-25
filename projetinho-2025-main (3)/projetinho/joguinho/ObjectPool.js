// ===========================================
// SISTEMA DE OBJECT POOL - OTIMIZAÇÃO DE PERFORMANCE
// ===========================================
// Sugestão: Renomear para ObjectPool para padronizar o idioma.
class PoolDeObjetos { // Sugestão: class ObjectPool
  constructor(funcaoCriar, funcaoResetar, tamanhoInicial = 50) { // Sugestão: createFn, resetFn
    this.funcaoCriar = funcaoCriar; // createFn
    this.funcaoResetar = funcaoResetar; // resetFn
    this.pool = []; // available
    this.ativos = new Set(); // active (usando Set para performance)
    
    // Pré-popular pool
    for (let i = 0; i < tamanhoInicial; i++) {
      this.pool.push(this.funcaoCriar());
    }
  }

  // Sugestão: getActive() para encapsulamento
  get objetosAtivos() {
    return Array.from(this.ativos);
  }
  
  obter() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      // A pool pode crescer dinamicamente se necessário
      obj = this.funcaoCriar();
    }
    this.ativos.add(obj);
    return obj;
  }
  
  liberar(obj) {
    if (this.ativos.has(obj)) {
      this.ativos.delete(obj);
      this.funcaoResetar(obj);
      this.pool.push(obj);
    }
  }
  
  liberarTodos() {
    // Usar for...of com uma cópia do Set para evitar problemas de modificação durante a iteração
    for (const obj of [...this.ativos]) {
      this.liberar(obj);
    }
  }
  
  atualizar() {
    // Atualiza todos os objetos ativos e libera os marcados para remoção
    // Iterar sobre um Set é seguro mesmo com remoções
    for (const obj of this.ativos) {
      obj.atualizar();
      
      if (obj.remover || (obj.vida !== undefined && obj.vida <= 0)) {
        this.liberar(obj);
      }
    }
  }
  
  desenhar() {
    for (const obj of this.ativos) {
      obj.desenhar();
    }
  }
}

// ===========================================
// FUNÇÕES DE CRIAÇÃO E RESET DOS POOLS
// ===========================================

function criarProjetil() {
  return new Projetil(0, 0, 0, 0, false);
}

function resetarProjetil(projetil) {
  projetil.x = 0;
  projetil.y = 0;
  projetil.vx = 0;
  projetil.vy = 0;
  projetil.remover = false;
  projetil.ehProjetilInimigo = false;
  projetil.tamanho = CONFIG.PROJETIL.JOGADOR.TAMANHO;
  projetil.cor = CONFIG.PROJETIL.JOGADOR.COR;
  projetil.dano = 1;
  projetil.ehLaser = false;
}

function criarParticula() {
  return new Particula(0, 0, [255, 255, 255]);
}

function resetarParticula(particula) {
  particula.x = 0;
  particula.y = 0;
  particula.vx = 0;
  particula.vy = 0;
  particula.vida = CONFIG.PARTICULA.TEMPO_VIDA;
  particula.tamanho = CONFIG.PARTICULA.TAMANHO_MINIMO;
  particula.cor = [255, 255, 255];
  particula.remover = false;
}