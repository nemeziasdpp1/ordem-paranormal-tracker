// A variável global permanece aqui para o controle da limpeza
// Certifique-se de que ela está definida no topo do seu arquivo JS
let periciasAutomaticasAtuais = []; 

import { aplicarBonusDeHabilidades } from './regras.js';

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

window.calcularStatusClasse = async (p) => {
    if (!p || !p.classe) return; 

    try {
        // Puxa as regras da classe no JSON
        const response = await fetch('./data/classes.json');
        const classes = await response.json();
        const infoClasse = classes[p.classe];

        if (!infoClasse) return;

        // --- PROFICIÊNCIAS ATUALIZADO (VERSÃO ROBUSTA) ---
        const proficienciasDaClasse = infoClasse.caracteristicas.proficiencias;
        if (proficienciasDaClasse) {
            p.proficiencias = proficienciasDaClasse; // Salva na memória do personagem
            
            const inputProficiencias = document.getElementById('def-proficiencias');
            if (inputProficiencias) {
                // Verifica o tipo do elemento no HTML para injetar o texto do jeito certo
                if (inputProficiencias.tagName === 'INPUT' || inputProficiencias.tagName === 'TEXTAREA') {
                    inputProficiencias.value = p.proficiencias;
                } else {
                    inputProficiencias.textContent = p.proficiencias;
                }
            }
        }
        // -------------------------------------------------

        // 1. Pega os atributos DIRETO dos seus inputs do HTML
        const inputVig = document.getElementById('at-vig');
        const inputPre = document.getElementById('at-pre');
        
        const vigor = inputVig ? parseInt(inputVig.value) || 0 : 0;
        const presenca = inputPre ? parseInt(inputPre.value) || 0 : 0;

        // 2. Calcula o Nível a partir do NEX
        const nex = p.nex ? parseInt(p.nex) : 5;
        let nivel = Math.floor(nex / 5);
        if (nivel < 1) nivel = 1;

        // 3. Extrai os números base do JSON
        const pvInicial = parseInt(infoClasse.caracteristicas.pv_inicial);
        const pvNivel = parseInt(infoClasse.caracteristicas.pv_nivel);
        
        const peInicial = parseInt(infoClasse.caracteristicas.pe_inicial);
        const peNivel = parseInt(infoClasse.caracteristicas.pe_nivel);
        
        const sanInicial = parseInt(infoClasse.caracteristicas.san_inicial);
        const sanNivel = parseInt(infoClasse.caracteristicas.san_nivel);

        // 4. Cálculos Matemáticos de Progressão (Valores BASE)
        let pvBase = pvInicial + vigor;
        for (let i = 2; i <= nivel; i++) {
            let ganhoNivel = pvNivel + vigor;
            pvBase += ganhoNivel < 1 ? 1 : ganhoNivel;
        }

        let peBase = peInicial + presenca;
        for (let i = 2; i <= nivel; i++) {
            let ganhoNivel = peNivel + presenca;
            peBase += ganhoNivel < 1 ? 1 : ganhoNivel;
        }

        let sanBase = sanInicial + ((nivel - 1) * sanNivel);

        // 4.5. Prepara o objeto status e salva a BASE nele ANTES dos bônus
        if (!p.status) p.status = {};
        
        p.status.pvMax = pvBase;
        p.status.peMax = peBase;
        p.status.sanMax = sanBase;

        // 4.6. Aplica os Bônus de Habilidades (O Calejado vai somar em cima do p.status.pvMax)
        aplicarBonusDeHabilidades(p);

        // 5. Tratamento especial para o formato "Atual / Máximo"
        const atualizarBarraDisplay = (idInput, chaveStatus) => {
            const inputEl = document.getElementById(idInput);
            
            // Aqui é o segredo: ele puxa o valor FINAL já com os bônus aplicados
            const maximoFinal = p.status[`${chaveStatus}Max`]; 
            let atual = maximoFinal; 

            if (inputEl && inputEl.value) {
                const partes = inputEl.value.split('/');
                if (partes.length === 2) {
                    const atualExistente = parseInt(partes[0].trim());
                    if (!isNaN(atualExistente) && atualExistente !== 0) {
                        atual = atualExistente;
                    }
                }
            }

            if (atual > maximoFinal) atual = maximoFinal;

            // Salva o valor atual corrigido no objeto
            p.status[`${chaveStatus}Atual`] = atual;

            // Exibe na tela no formato Atual / Máximo
            if (inputEl) {
                inputEl.value = `${atual} / ${maximoFinal}`;
            }
        };

        // 6. Atualiza a tela (Note que não enviamos mais a variável, apenas o ID e a chave)
        atualizarBarraDisplay('bar-display-pv', 'pv');
        atualizarBarraDisplay('bar-display-pe', 'pe');
        atualizarBarraDisplay('bar-display-san', 'san');

        // REMOVIDO: await salvarNaSala(); (Deixamos o app.js cuidar disso)

    } catch (err) {
        console.error("Erro ao calcular os status:", err);
    }
};
