(function () {
  // Mapa de aliases: chave = inglês, valor = português
  const MAP = {
    player: 'jogador',
    players: 'jogadores',
    enemies: 'inimigos',
    enemyProjectiles: ' projeteisInimigos', // OBS: espaço intencional evitado quando usado diretamente; ver sync abaixo
    enemyProjectiles: 'projeteisInimigos',
    coins: 'moedas',
    powerUps: 'powerUps',
    score: 'pontuacao',
    highScore: 'recorde',
    level: 'nivel',
    canEnterPortal: 'podeEntrarNoPortal',
    showShop: 'mostrarLoja',
    weaponProgression: 'progressaoArmas',
    runConfig: 'runConfig', // já compatível, mantido
    initializeGame: 'inicializarJogo',
    update: 'atualizar',
    draw: 'desenhar',
    spawnEnemies: 'spawnarInimigos',
    poolProjectiles: 'poolProjeteis'
  };

  // Sincroniza um par (ing -> pt) quando um dos lados existir
  function syncPair(ing, pt) {
    try {
      if (typeof window[pt] === 'undefined' && typeof window[ing] !== 'undefined') {
        window[pt] = window[ing];
      }
      if (typeof window[ing] === 'undefined' && typeof window[pt] !== 'undefined') {
        window[ing] = window[pt];
      }
      // Para funções, criar wrappers que chamam a original (mantém referência)
      if (typeof window[ing] === 'function' && typeof window[pt] !== 'function') {
        window[pt] = window[ing];
      }
      if (typeof window[pt] === 'function' && typeof window[ing] !== 'function') {
        window[ing] = window[pt];
      }
    } catch (e) {
      // silencioso
    }
  }

  function runSync() {
    // pares fixos
    const pares = [
      ['player', 'jogador'],
      ['enemies', 'inimigos'],
      ['enemyProjectiles', 'projeteisInimigos'],
      ['coins', 'moedas'],
      ['powerUps', 'powerUps'],
      ['score', 'pontuacao'],
      ['highScore', 'recorde'],
      ['level', 'nivel'],
      ['canEnterPortal', 'podeEntrarNoPortal'],
      ['showShop', 'mostrarLoja'],
      ['weaponProgression', 'progressaoArmas'],
      ['initializeGame', 'inicializarJogo'],
      ['spawnEnemies', 'spawnarInimigos'],
      ['poolProjectiles', 'poolProjeteis']
    ];

    for (const [ing, pt] of pares) syncPair(ing, pt);

    // especial: se existir jogador global e player/jogador forem objetos, criar getters/setters para mantê-los sincronizados
    try {
      if (!Object.getOwnPropertyDescriptor(window, '__syncedVars')) {
        Object.defineProperty(window, '__syncedVars', { value: true, configurable: false });
        const createSyncProp = (a, b) => {
          if (!Object.getOwnPropertyDescriptor(window, a) && typeof window[a] === 'undefined') return;
          // evitar recriar
          if (Object.getOwnPropertyDescriptor(window, a) && Object.getOwnPropertyDescriptor(window, a).get) return;
          let internal = window[a] || window[b];
          try {
            Object.defineProperty(window, a, {
              get() { return internal; },
              set(v) { internal = v; if (window[b] !== v) window[b] = v; },
              configurable: true
            });
            Object.defineProperty(window, b, {
              get() { return internal; },
              set(v) { internal = v; if (window[a] !== v) window[a] = v; },
              configurable: true
            });
          } catch (_) {}
        };
        createSyncProp('player', 'jogador');
        createSyncProp('enemies', 'inimigos');
        createSyncProp('coins', 'moedas');
        createSyncProp('enemyProjectiles', 'projeteisInimigos');
      }
    } catch (_) {}
  }

  // Tenta sincronizar já
  runSync();

  // Repetir por um período para pegar variáveis criadas depois (scripts carregados posteriormente)
  let checks = 0;
  const maxChecks = 60; // ~12s com 200ms
  const iv = setInterval(() => {
    runSync();
    checks++;
    if (checks >= maxChecks) clearInterval(iv);
  }, 200);

  // Expor utilitário para depuração/manual
  window.IdiomaCompat = { sync: runSync };

	// Função segura para criar propriedades sincronizadas (alias) na window
	function createSyncProp(en, pt) {
		try {
			// Não sobrescrever se propriedade já definida e não configurável
			const safeDefine = (name, getter, setter) => {
				const desc = Object.getOwnPropertyDescriptor(window, name);
				if (desc && !desc.configurable) return;
				Object.defineProperty(window, name, {
					get: getter,
					set: setter,
					configurable: true,
					enumerable: true
				});
			};

			// Getter/Setter que leem/escrevem a contra-parte
			safeDefine(en,
				() => window[pt],
				(v) => { window[pt] = v; }
			);
			safeDefine(pt,
				() => window[en],
				(v) => { window[en] = v; }
			);
		} catch (_) { /* não falhar */ }
	}

	try {
		if (!window.__syncedVars) {
			createSyncProp('player', 'jogador');
			createSyncProp('enemies', 'inimigos');
			createSyncProp('coins', 'moedas');
			createSyncProp('enemyProjectiles', 'projeteisInimigos');
			window.__syncedVars = true;
		}
	} catch (_) {}
})();
