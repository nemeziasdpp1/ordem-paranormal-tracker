// js/regras.js

export const regrasHabilidades = {
    "Calejado": (p) => {
        // Garante que o NEX e o PV base sejam números. Se estiver vazio, usa 0.
        const nex = Number(p.nex) || 0;
        const bonusPV = Math.floor(nex / 5);
        
        // Adiciona o bônus na propriedade correta que você usa para vida máxima
        p.pvMax = (Number(p.pvMax) || 0) + bonusPV; 
        
        console.log(`Calejado ativado! NEX: ${nex}, Bônus de PV: +${bonusPV}`); // Isso vai te ajudar a ver se funcionou
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
