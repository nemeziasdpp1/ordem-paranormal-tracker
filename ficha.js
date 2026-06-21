// Variável global para guardar quais perícias foram dadas pela última origem selecionada
// Isso serve para podermos desmarcá-las caso o usuário mude de origem
let periciasAutomaticasAtuais = [];

/**
 * Função principal para selecionar a origem e treinar as perícias automaticamente.
 * @param {string} nomeDaOrigem - O nome exato da origem selecionada (ex: "Acadêmico")
 * @param {object} personagemAtual - O objeto do personagem que está ativo no momento
 * @param {object} origensJson - O seu objeto contendo os dados de todas as origens
 * @param {function} atualizarTelaPericias - A sua função do app.js que redesenha a aba de perícias
 */
export function selecionarOrigem(nomeDaOrigem, personagemAtual, origensJson, atualizarTelaPericias) {
    // 1. Validações Iniciais
    if (!origensJson || !nomeDaOrigem) return;
    
    const origemData = origensJson[nomeDaOrigem];
    if (!origemData) {
        console.error("Origem não encontrada no JSON: " + nomeDaOrigem);
        return;
    }

    // Garante que o objeto do personagem e sua lista de perícias existam
    if (!personagemAtual || !personagemAtual.pericias) {
        console.warn("Nenhum personagem ativo encontrado para aplicar as perícias.");
        return;
    }

    // 2. DESMARCAR AS PERÍCIAS DA ORIGEM ANTERIOR
    // Voltamos o bônus/treino das perícias antigas para 0 antes de aplicar a nova
    periciasAutomaticasAtuais.forEach(nomePericia => {
        if (personagemAtual.pericias[nomePericia]) {
            // Se o seu sistema usa "treino" ou "bonus" como número, ajustamos aqui.
            // Exemplo: voltando para 0 (Não treinado)
            personagemAtual.pericias[nomePericia].treino = 0; 
            personagemAtual.pericias[nomePericia].bonus = 0; 
        }
    });
    
    // Limpa a nossa lista de controle interno
    periciasAutomaticasAtuais = [];

    // 3. TRATAR O AMNÉSICO (Array de perícias vazio no JSON)
    if (origemData.pericias.length === 0) {
        alert("Como Amnésico, você deve escolher e marcar manualmente 2 perícias de sua preferência na aba de Perícias!");
        
        // Atualiza apenas o nome da origem e atualiza a tela
        personagemAtual.origem = nomeDaOrigem;
        if (typeof atualizarTelaPericias === "function") atualizarTelaPericias();
        return;
    }

    // 4. MARCAR AS NOVAS PERÍCIAS (+5) DIRETO NOS DADOS DO PERSONAGEM
    origemData.pericias.forEach(nomePericia => {
        // Verifica se a perícia existe na ficha do seu personagem
        if (personagemAtual.pericias[nomePericia]) {
            
            // Define o nível de treinamento para 5 (Bônus de treinado em Ordem)
            personagemAtual.pericias[nomePericia].treino = 5; 
            personagemAtual.pericias[nomePericia].bonus = 5; 

            // Salva no nosso array de controle para sabermos o que remover depois se ele trocar de origem
            periciasAutomaticasAtuais.push(nomePericia);
        } else {
            console.warn(`A perícia "${nomePericia}" não foi encontrada na estrutura do personagem ativo.`);
        }
    });

    // 5. ATUALIZAR NOME DA ORIGEM E RE-RENDERIZAR A TELA
    personagemAtual.origem = nomeDaOrigem;

    // Executa a função que reconstrói o HTML da aba de perícias para mostrar os novos bônus na tela
    if (typeof atualizarTelaPericias === "function") {
        atualizarTelaPericias();
    } else {
        console.warn("Função de atualizar a tela de perícias não foi injetada corretamente.");
    }
}
