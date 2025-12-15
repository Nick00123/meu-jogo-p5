class SistemaColisao {
  constructor() {
    this.gridSize = 100; // Tamanho da célula do grid
    this.grid = new Map();
  }

  // Converte coordenadas para chave do grid
  getCellKey(x, y) {
    return `${Math.floor(x/this.gridSize)},${Math.floor(y/this.gridSize)}`;
  }

  // Atualiza a posição dos objetos no grid
  atualizarObjetos(objetos) {
    this.grid.clear();
    
    for (const obj of objetos) {
      if (!obj.ativo) continue;
      
      const key = this.getCellKey(obj.x, obj.y);
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key).push(obj);
    }
  }

  // Verifica colisões apenas com objetos próximos
  verificarColisoes(objeto, callback) {
    const cellX = Math.floor(objeto.x / this.gridSize);
    const cellY = Math.floor(objeto.y / this.gridSize);
    
    // Verifica a célula atual e as vizinhas
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const key = `${cellX + x},${cellY + y}`;
        const objetosNaCelula = this.grid.get(key) || [];
        
        for (const outro of objetosNaCelula) {
          if (objeto === outro) continue;
          
          const dx = objeto.x - outro.x;
          const dy = objeto.y - outro.y;
          const distancia = dx * dx + dy * dy;
          const raioSoma = (objeto.raio || objeto.tamanho/2) + (outro.raio || outro.tamanho/2);
          
          if (distancia < raioSoma * raioSoma) {
            if (callback(objeto, outro)) return true;
          }
        }
      }
    }
    return false;
  }
}