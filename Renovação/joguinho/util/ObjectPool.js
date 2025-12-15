// ===========================================
// POOL DE OBJETOS REUTILIZÁVEIS
// ===========================================

class ObjectPool {
  constructor(factory) {
    this.factory = factory;
    this.disponíveis = [];
    this.emUso = [];
  }

  obter() {
    return this.disponíveis.length > 0
      ? this.disponíveis.pop() 
      : this.factory();
  }

  ativar(obj) {
    // Adiciona o objeto à lista de objetos em uso para que seja atualizado e desenhado.
    this.emUso.push(obj);
  }

  liberar(obj) {
    this.emUso = this.emUso.filter(o => o !== obj);
    this.disponíveis.push(obj);
  }

  liberarTodos() {
    this.disponíveis.push(...this.emUso);
    this.emUso = [];
  }
}

// Alias para compatibilidade
class PoolDeObjetos extends ObjectPool {}

// Expor globalmente
window.PoolDeObjetos = window.PoolDeObjetos || PoolDeObjetos;
window.ObjectPool = window.ObjectPool || ObjectPool;

// Compatibilidade CommonJS se necessário
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PoolDeObjetos, ObjectPool };
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