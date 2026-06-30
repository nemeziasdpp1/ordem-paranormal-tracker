export const regrasHabilidades = {
    "Calejado": (p) => {
        const nex = Number(p.nex) || 0;
        const bonusPV = Math.floor(nex / 5);
        
        if (!p.status) p.status = {};

        p.status.pvMax = (Number(p.status.pvMax) || 0) + bonusPV; 
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
