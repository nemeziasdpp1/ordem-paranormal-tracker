// A variável global permanece aqui para o controle da limpeza
// Certifique-se de que ela está definida no topo do seu arquivo JS
let periciasAutomaticasAtuais = []; 

window.selecionarOrigem = async (nomeDaOrigem) => {
    // 1. Obtém o personagem e os dados necessários internamente
    const personagemAtual = obterPersonagemAtual();
    if (!personagemAtual) return;

    try {
        const response = await fetch('./data/origens.json');
        const origensJson = await response.json();

        // 2. Validações
        const listaOrigens = origensJson.Origens["Todas as Origens"];
        const origemData = listaOrigens.find(o => o.nome === nomeDaOrigem);

        if (!origemData) {
            console.error("Origem não encontrada: " + nomeDaOrigem);
            return;
        }

        // 3. REMOVER PERÍCIAS E HABILIDADES DA ORIGEM ANTERIOR
        periciasAutomaticasAtuais.forEach(nomePericia => {
            if (personagemAtual.pericias[nomePericia]) {
                personagemAtual.pericias[nomePericia].treino = 0; 
                personagemAtual.pericias[nomePericia].bonus = 0; 
            }
        });
        periciasAutomaticasAtuais = [];

        // Remove a habilidade da origem anterior
        if (personagemAtual.habilidades) {
            personagemAtual.habilidades = personagemAtual.habilidades.filter(h => h.categoria !== "Origens");
        }

        // 4. APLICAR NOVAS PERÍCIAS
        if (origemData.pericias && origemData.pericias.length > 0) {
            origemData.pericias.forEach(nomePericia => {
                if (personagemAtual.pericias[nomePericia]) {
                    personagemAtual.pericias[nomePericia].treino = 5; 
                    personagemAtual.pericias[nomePericia].bonus = 5; 
                    periciasAutomaticasAtuais.push(nomePericia);
                }
            });
        }

        // 5. ADICIONAR A NOVA HABILIDADE DE ORIGEM
        if (!personagemAtual.habilidades) personagemAtual.habilidades = [];
        personagemAtual.habilidades.push({
            nome: origemData.nome,
            categoria: "Origens",
            descricao: origemData.descricao
        });

        // 6. ATUALIZAR DADOS E TELA
        personagemAtual.origem = nomeDaOrigem;
        
        // Salva a alteração (assumindo que a função salvarNaSala existe globalmente)
        if (typeof salvarNaSala === "function") await salvarNaSala();

        // Atualiza as interfaces (chamando as funções globais diretamente)
        if (typeof renderizarPericias === "function") renderizarPericias();
        if (typeof renderizarHabilidades === "function") renderizarHabilidades();

        console.log(`Origem ${nomeDaOrigem} aplicada com sucesso!`);
        
    } catch (err) {
        console.error("Erro ao aplicar origem:", err);
    }
};
