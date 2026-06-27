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

window.calcularStatusClasse = async () => {
    const p = obterPersonagemAtual();
    // Se o personagem não tiver classe, ou não tiver NEX, não fazemos nada.
    if (!p || !p.classe) return; 

    try {
        // Puxa as regras da classe no JSON
        const response = await fetch('./data/classes.json');
        const classes = await response.json();
        const infoClasse = classes[p.classe];

        if (!infoClasse) return;

        // Pegamos os atributos do personagem (se estiverem vazios, assumimos 0)
        // Certifique-se de que o caminho dos atributos no seu objeto 'p' seja este mesmo:
        const vigor = (p.atributos && p.atributos.vigor) ? parseInt(p.atributos.vigor) : 0;
        const presenca = (p.atributos && p.atributos.presenca) ? parseInt(p.atributos.presenca) : 0;

        // Calcula o Nível a partir do NEX (Ex: NEX 15 / 5 = Nível 3)
        const nex = p.nex ? parseInt(p.nex) : 5; // Se não tiver NEX preenchido, assumimos 5
        let nivel = Math.floor(nex / 5);
        if (nivel < 1) nivel = 1;

        // Extrai apenas os números base do JSON usando parseInt
        const pvInicial = parseInt(infoClasse.caracteristicas.pv_inicial);
        const pvNivel = parseInt(infoClasse.caracteristicas.pv_nivel);
        
        const peInicial = parseInt(infoClasse.caracteristicas.pe_inicial);
        const peNivel = parseInt(infoClasse.caracteristicas.pe_nivel);
        
        const sanInicial = parseInt(infoClasse.caracteristicas.san_inicial);
        const sanNivel = parseInt(infoClasse.caracteristicas.san_nivel);

        // --- CÁLCULOS MATEMÁTICOS ---
        
        // PV: Valor inicial + Vigor. 
        // Para os níveis seguintes, soma (Valor por nível + Vigor)
        let pvMaximo = pvInicial + vigor;
        for (let i = 2; i <= nivel; i++) {
            let ganhoNivel = pvNivel + vigor;
            pvMaximo += ganhoNivel < 1 ? 1 : ganhoNivel; // Em RPG, você sempre ganha no mínimo 1 de PV por nível
        }

        // PE: Segue a mesma lógica do PV, mas com Presença
        let peMaximo = peInicial + presenca;
        for (let i = 2; i <= nivel; i++) {
            let ganhoNivel = peNivel + presenca;
            peMaximo += ganhoNivel < 1 ? 1 : ganhoNivel;
        }

        // SAN: Valor inicial + (Valor por Nível x os níveis extras)
        let sanMaximo = sanInicial + ((nivel - 1) * sanNivel);

        // --- APLICANDO NO PERSONAGEM ---
        
        // Garantimos que a estrutura de status existe
        if (!p.status) p.status = {};

        // Salvamos os valores Máximos
        p.status.pvMax = pvMaximo;
        p.status.peMax = peMaximo;
        p.status.sanMax = sanMaximo;

        // Se o personagem não tiver valor "Atual" (estiver zerado), preenchemos os atuais para ficarem cheios
        if (p.status.pvAtual === undefined || p.status.pvAtual === null) p.status.pvAtual = pvMaximo;
        if (p.status.peAtual === undefined || p.status.peAtual === null) p.status.peAtual = peMaximo;
        if (p.status.sanAtual === undefined || p.status.sanAtual === null) p.status.sanAtual = sanMaximo;

        // Atualizamos os campos visuais no HTML (se eles existirem na sua ficha com esses IDs)
        const inputPvMax = document.getElementById('pv-max');
        if (inputPvMax) inputPvMax.value = pvMaximo;
        
        const inputPeMax = document.getElementById('pe-max');
        if (inputPeMax) inputPeMax.value = peMaximo;
        
        const inputSanMax = document.getElementById('san-max');
        if (inputSanMax) inputSanMax.value = sanMaximo;

        await salvarNaSala();

    } catch (err) {
        console.error("Erro ao calcular os status:", err);
    }
};

window.atualizarNEX = async (novoValor) => {
    const p = obterPersonagemAtual();
    if (!p) return;

    // Atualiza o NEX no objeto do personagem
    p.nex = novoValor; 

    // Se o personagem já tiver uma classe escolhida, recalcula os status com o novo NEX
    if (p.classe && typeof calcularStatusClasse === "function") {
        await calcularStatusClasse();
    }

    // Salva a alteração
    await salvarNaSala();
    
    // Atualiza a tela
    if (typeof atualizarInterface === "function") atualizarInterface();
};
