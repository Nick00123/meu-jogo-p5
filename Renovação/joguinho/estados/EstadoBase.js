// ===========================================
// CLASSE BASE PARA TODOS OS ESTADOS
// ===========================================

class EstadoBase {
  constructor(gerenciador = null) {
    this.gerenciador = gerenciador;
  }

  entrar() {
    // Override em subclasses
  }

  sair() {
    // Override em subclasses
  }

  atualizar() {
    // Override em subclasses
  }

  desenhar() {
    // Override em subclasses
  }

  aoPressionarTecla() {
    // Override em subclasses
  }
}