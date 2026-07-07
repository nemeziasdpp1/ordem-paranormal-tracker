// A variável global permanece aqui para o controle da limpeza
// Certifique-se de que ela está definida no topo do seu arquivo JS
let periciasAutomaticasAtuais = []; 

import { aplicarBonusDeHabilidades } from './regras.js';

window.selecionarOrigem = async (nomeDaOrigem) => {
    // 1. Obtém o personagem
    const p = window.obterPersonagemAtual();
    if (!p) return;

    try {
        // 2. Carrega AMBOS os arquivos simultaneamente
        const [todasOrigens, respHabilidades] = await Promise.all([
            fetch('./data/origens.json').then(r => r.json()),
            fetch('./data/habilidades.json').then(r => r.json())
        ]);

        // 3. Busca os dados da origem clicada diretamente pela chave
        const origemData = todasOrigens[nomeDaOrigem];

        if (!origemData) {
            console.error("Origem não encontrada: " + nomeDaOrigem);
            return;
        }

        // Garante a estrutura necessária no personagem
        if (!p.pericias) p.pericias = {};
        if (!p.periciasOrigemAntiga) p.periciasOrigemAntiga = [];
        if (!p.habilidades) p.habilidades = [];

        // 4. REMOVER PERÍCIAS E HABILIDADES DA ORIGEM ANTERIOR
        p.periciasOrigemAntiga.forEach(periciaAntiga => {
            if (p.pericias[periciaAntiga]) {
                p.pericias[periciaAntiga].treino = 0;
            }
        });
        p.periciasOrigemAntiga = []; // Limpa a memória

        // Remove apenas habilidades que vieram de "Origens"
        p.habilidades = p.habilidades.filter(h => h.categoria !== "Origens");

        // 5. APLICAR NOVAS PERÍCIAS
        if (origemData.pericias && origemData.pericias.length === 0) {
            alert("Como Amnésico, lembre-se de ir até a aba de Perícias e escolher 2 perícias manualmente para treinar!");
        } else if (origemData.pericias) {
            origemData.pericias.forEach(novaPericia => {
                if (!p.pericias[novaPericia]) {
                    p.pericias[novaPericia] = { treino: 0, extra: 0 };
                }
                p.pericias[novaPericia].treino = 5;
                p.periciasOrigemAntiga.push(novaPericia); // Salva para poder remover se trocar de origem depois
            });
        }

        // 6. ADICIONAR A NOVA HABILIDADE DE ORIGEM
        if (origemData.habilidade && Array.isArray(origemData.habilidade)) {
            // Acessa a gaveta correta no habilidades.json
            const listaHabilidadesDisponiveis = respHabilidades.Origens["Todas as Origens"];
            
            origemData.habilidade.forEach(nomeHab => {
                const habCompleta = listaHabilidadesDisponiveis.find(h => h.nome === nomeHab);
                if (habCompleta) {
                    p.habilidades.push({
                        ...habCompleta,
                        categoria: "Origens" // Tag para identificarmos depois
                    });
                } else {
                    console.warn(`Habilidade "${nomeHab}" não encontrada no habilidades.json!`);
                }
            });
        }

        // 7. ATUALIZAR DADOS, TELA E SALVAR
        p.origem = nomeDaOrigem;
        const inputOrigem = document.getElementById('info-origem');
        if (inputOrigem) inputOrigem.value = nomeDaOrigem;

        if (typeof window.salvarNaSala === "function") await window.salvarNaSala();

        // Atualiza a interface
        if (typeof window.renderizarPericias === "function") window.renderizarPericias();
        if (typeof window.renderizarHabilidadesPersonagem === "function") window.renderizarHabilidadesPersonagem();
        
        window.abrirAbaChar('aba-info');
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

        // 1. Pega os atributos DIRETO DA MEMÓRIA DO PERSONAGEM (Mais seguro!)
        const vigor = p.vig ? parseInt(p.vig) : 0;
        const presenca = p.pre ? parseInt(p.pre) : 0;

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

        // 4.6. Aplica os Bônus de Habilidades (O Calejado, Cicatrizes Psicológicas, etc. vão somar no p.status)
        if (typeof aplicarBonusDeHabilidades === 'function') {
            aplicarBonusDeHabilidades(p);
        }

        // 5. Tratamento especial para o formato "Atual / Máximo"
        const atualizarBarraDisplay = (idInput, chaveStatus) => {
            const inputEl = document.getElementById(idInput);
            
            // Puxa o valor FINAL já com os bônus aplicados
            const maximoFinal = p.status[`${chaveStatus}Max`]; 
            let atual = maximoFinal; 

            // Tenta ler o valor atual da tela (se a tela já estiver carregada)
            if (inputEl && inputEl.value) {
                const partes = inputEl.value.split('/');
                if (partes.length === 2) {
                    const atualExistente = parseInt(partes[0].trim());
                    if (!isNaN(atualExistente) && atualExistente !== 0) {
                        atual = atualExistente;
                    }
                }
            // Fallback: se a tela não carregou ainda, lê do próprio banco de dados
            } else if (p[chaveStatus]) {
                const partes = String(p[chaveStatus]).split('/');
                if (partes.length === 2) {
                    const atualExistente = parseInt(partes[0].trim());
                    if (!isNaN(atualExistente) && atualExistente !== 0) {
                        atual = atualExistente;
                    }
                }
            }

            if (atual > maximoFinal) atual = maximoFinal;

            p.status[`${chaveStatus}Atual`] = atual;

            const textoFinal = `${atual} / ${maximoFinal}`;

            p[chaveStatus] = textoFinal; 

            if (inputEl) {
                inputEl.value = textoFinal;
            }
        };

        atualizarBarraDisplay('bar-display-pv', 'pv');
        atualizarBarraDisplay('bar-display-pe', 'pe');
        atualizarBarraDisplay('bar-display-san', 'san');

        if (typeof window.calcularDefesas === 'function') {
            window.calcularDefesas();
        }
        if (typeof window.calcularDeslocamento === 'function') {
            window.calcularDeslocamento();
        }
        // ----------------------------------------------------------------------------

        // 7. Salva tudo automaticamente no banco de dados da sala
        if (typeof window.salvarNaSala === 'function') {
            window.salvarNaSala(); 
        }

    } catch (err) {
        console.error("Erro ao calcular os status:", err);
    }
};
