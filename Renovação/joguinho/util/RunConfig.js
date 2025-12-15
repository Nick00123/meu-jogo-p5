// ===========================================
// CONFIGURAÇÃO DE EXECUÇÃO (SELEÇÕES PRÉ-JOGO)
// ===========================================

(function(){
  // Expor globalmente (compatibilidade: configExecucao e runConfig)
  const execucaoAPI = {
    // Este objeto pode ser usado para futuras configurações de run,
    // como mutators, etc.
  };

  // Expor globalmente para outros módulos (compatibilidade)
  if (typeof window !== 'undefined') {
    window.runConfig = window.runConfig || execucaoAPI;
    window.configExecucao = window.configExecucao || execucaoAPI;
  }
})();