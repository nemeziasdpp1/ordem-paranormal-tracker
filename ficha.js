// Variável global para controle (certifique-se que ela esteja no escopo correto)
let periciasAutomaticasAtuais = [];

/**
 * Função atualizada para selecionar origem, aplicar perícias e adicionar habilidade.
 */
export function selecionarOrigem(nomeDaOrigem, personagemAtual, origensJson, atualizarTelaPericias, atualizarListaHabilidades) {
    
    // 1. Validações
    if (!origensJson || !nomeDaOrigem) return;
    
    // Supondo que origensJson seja o objeto com todas as origens
    // Ajuste o acesso conforme a estrutura do seu JSON (se for 'Todas as Origens' ou direto)
    const listaOrigens = origensJson.Origens["Todas as Origens"];
    const origemData = listaOrigens.find(o => o.nome === nomeDaOrigem);

    if (!origemData) {
        console.error("Origem não encontrada: " + nomeDaOrigem);
        return;
    }

    // 2. REMOVER PERÍCIAS E HABILIDADES DA ORIGEM ANTERIOR
    // Removemos perícias anteriores
    periciasAutomaticasAtuais.forEach(nomePericia => {
        if (personagemAtual.pericias[nomePericia]) {
            personagemAtual.pericias[nomePericia].treino = 0; 
            personagemAtual.pericias[nomePericia].bonus = 0; 
        }
    });
    periciasAutomaticasAtuais = [];

    // Removemos a habilidade da origem anterior (filtrando pelo campo 'categoria' ou 'nome')
    personagemAtual.habilidades = personagemAtual.habilidades.filter(h => h.categoria !== "Origens");

    // 3. APLICAR NOVAS PERÍCIAS (Se a origem tiver perícias no JSON)
    if (origemData.pericias && origemData.pericias.length > 0) {
        origemData.pericias.forEach(nomePericia => {
            if (personagemAtual.pericias[nomePericia]) {
                personagemAtual.pericias[nomePericia].treino = 5; 
                personagemAtual.pericias[nomePericia].bonus = 5; 
                periciasAutomaticasAtuais.push(nomePericia);
            }
        });
    }

    // 4. ADICIONAR A NOVA HABILIDADE DE ORIGEM
    // Adicionamos o objeto completo da origem na lista de habilidades do personagem
    personagemAtual.habilidades.push({
        nome: origemData.nome,
        categoria: "Origens",
        descricao: origemData.descricao
    });

    // 5. ATUALIZAR DADOS E TELA
    personagemAtual.origem = nomeDaOrigem;

    // Atualiza a tela de perícias
    if (typeof atualizarTelaPericias === "function") atualizarTelaPericias();
    
    // Atualiza a lista de habilidades (função que você deve ter no seu app.js)
    if (typeof atualizarListaHabilidades === "function") atualizarListaHabilidades();

    console.log(`Origem ${nomeDaOrigem} aplicada com sucesso!`);
}
