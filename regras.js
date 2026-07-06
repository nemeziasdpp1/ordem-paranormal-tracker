export const regrasHabilidades = {
    
    "Calejado": (p) => {
        const nex = Number(p.nex) || 0;
        const bonusPV = Math.floor(nex / 5);
        if (!p.status) p.status = {};
        p.status.pvMax = (Number(p.status.pvMax) || 0) + bonusPV; 
    },

    "Patrulha": (p) => {
        if (!p.status) p.status = {};
        p.status.bonusDefOutros = (Number(p.status.bonusDefOutros) || 0) + 2;
    },
    
    "Cicatrizes Psicológicas": (p) => {
        const nex = Number(p.nex) || 0;
        const bonusSAN = Math.floor(nex / 5);
        if (!p.status) p.status = {};
        p.status.sanMax = (Number(p.status.sanMax) || 0) + bonusSAN; 
    }
};

export function aplicarBonusDeHabilidades(p) {
    if (!p.habilidades || !Array.isArray(p.habilidades)) return;
    if (!p.status) p.status = {};
    p.status.pvMax = 0; // Ou o valor base do personagem
    p.status.sanMax = 0; // Ou o valor base do personagem
    p.status.bonusDefOutros = 0;
    p.habilidades.forEach(hab => {
        if (regrasHabilidades[hab.nome]) {
            regrasHabilidades[hab.nome](p);
        }
    });
}
