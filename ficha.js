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

window.calcularStatusClasse = async (p) => {
    if (!p || !p.classe) return; 

    try {
        // Puxa as regras da classe no JSON
        const response = await fetch('./data/classes.json');
        const classes = await response.json();
        const infoClasse = classes[p.classe];

        if (!infoClasse) return;

        // --- NOVA PARTE: PROFICIÊNCIAS ---
        const proficienciasDaClasse = infoClasse.caracteristicas.proficiencias;
        if (proficienciasDaClasse) {
            p.proficiencias = proficienciasDaClasse; // Salva na memória do personagem
            
            // Coloque o ID correto da sua caixa de texto aqui embaixo!
            const inputProficiencias = document.getElementById('def-proficiencias');
            if (inputProficiencias) {
                inputProficiencias.value = p.proficiencias;
            }
        }
        // ---------------------------------

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

        // 4. Cálculos Matemáticos de Progressão
        let pvMaximo = pvInicial + vigor;
        for (let i = 2; i <= nivel; i++) {
            let ganhoNivel = pvNivel + vigor;
            pvMaximo += ganhoNivel < 1 ? 1 : ganhoNivel;
        }

        let peMaximo = peInicial + presenca;
        for (let i = 2; i <= nivel; i++) {
            let ganhoNivel = peNivel + presenca;
            peMaximo += ganhoNivel < 1 ? 1 : ganhoNivel;
        }

        let sanMaximo = sanInicial + ((nivel - 1) * sanNivel);

        // 5. Tratamento especial para o formato "Atual / Máximo"
        if (!p.status) p.status = {};

        const atualizarBarraDisplay = (idInput, novoMaximo, chaveStatus) => {
            const inputEl = document.getElementById(idInput);
            let atual = novoMaximo; 

            if (inputEl && inputEl.value) {
                const partes = inputEl.value.split('/');
                if (partes.length === 2) {
                    const atualExistente = parseInt(partes[0].trim());
                    if (!isNaN(atualExistente) && atualExistente !== 0) {
                        atual = atualExistente;
                    }
                }
            }

            if (atual > novoMaximo) atual = novoMaximo;

            p.status[`${chaveStatus}Max`] = novoMaximo;
            p.status[`${chaveStatus}Atual`] = atual;

            if (inputEl) {
                inputEl.value = `${atual} / ${novoMaximo}`;
            }
        };

        atualizarBarraDisplay('bar-display-pv', pvMaximo, 'pv');
        atualizarBarraDisplay('bar-display-pe', peMaximo, 'pe');
        atualizarBarraDisplay('bar-display-san', sanMaximo, 'san');

        await salvarNaSala();

    } catch (err) {
        console.error("Erro ao calcular os status:", err);
    }
};
