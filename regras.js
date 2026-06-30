// js/regras.js

export const regrasHabilidades = {
    "Calejado": (p) => {
        const bonusPV = Math.floor(p.nex / 5);
        p.pvMax += bonusPV;
    }
};

export function aplicarBonusDeHabilidades(p) {
    if (!p.habilidades || !Array.isArray(p.habilidades)) return;

    p.habilidades.forEach(hab => {
        if (regrasHabilidades[hab.nome]) {
            regrasHabilidades[hab.nome](p);
        }
    });
}
