window.regrasHabilidades = {
    "Calejado": (p) => {
        const bonusPV = Math.floor(p.nex / 5);
        p.pvMax += bonusPV;
    }
};

window.aplicarBonusDeHabilidades = (p) => {
    if (!p.habilidades || !Array.isArray(p.habilidades)) return;

    p.habilidades.forEach(hab => {
        // Se existir uma regra para a habilidade, executa ela
        if (window.regrasHabilidades[hab.nome]) {
            window.regrasHabilidades[hab.nome](p);
        }
    });
};
