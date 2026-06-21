import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

// --- Configuração OBR ---
const METADATA_KEY = "com.ordemparanormal.ficha";

// --- Lista de Perícias ---
const LISTA_PERICIAS_BASE = [
    { nome: "Acrobacia+", attr: "agi" }, { nome: "Adestramento*", attr: "pre" },
    { nome: "Artes*", attr: "pre" }, { nome: "Atletismo", attr: "for" },
    { nome: "Atualidades", attr: "int" }, { nome: "Ciências*", attr: "int" },
    { nome: "Crime*+", attr: "agi" }, { nome: "Diplomacia", attr: "pre" },
    { nome: "Enganação", attr: "pre" }, { nome: "Fortitude", attr: "vig" },
    { nome: "Furtividade+", attr: "agi" }, { nome: "Iniciativa", attr: "agi" },
    { nome: "Intimidação", attr: "pre" }, { nome: "Intuição", attr: "pre" },
    { nome: "Investigação", attr: "int" }, { nome: "Luta", attr: "for" },
    { nome: "Medicina", attr: "int" }, { nome: "Ocultismo*", attr: "int" },
    { nome: "Percepção", attr: "pre" }, { nome: "Pilotagem*", attr: "agi" },
    { nome: "Pontaria", attr: "agi" }, { nome: "Profissão*", attr: "int" },
    { nome: "Reflexos", attr: "agi" }, { nome: "Religião*", attr: "pre" },
    { nome: "Sobrevivência", attr: "int" }, { nome: "Tática*", attr: "int" },
    { nome: "Tecnologia*", attr: "int" }, { nome: "Vontade", attr: "pre" }
];

// --- Variáveis Globais ---
let personagens = [];
let idPersonagemSelecionado = null;
let origemIniciativa = "raiz";
let bibliotecaHabilidades = {};
let abaModalHabAtiva = "";
let subFiltroModalHabAtivo = "";
let idsHabilidadesExpandidas = new Set();

// --- NOVA LÓGICA DE DEFESA ---
window.calcularDefesas = () => {
    const p = obterPersonagemAtual();
    if (!p) return;

    // Pega inputs da tela (ou fallback para o objeto p)
    const elAgi = document.getElementById('at-agi');
    const elEquip = document.getElementById('def-equip');
    const elOutros = document.getElementById('def-outros');

    const agi = parseInt(elAgi?.value || p.agi || 0);
    const equip = parseInt(elEquip?.value || p.defEquip || 0);
    const outros = parseInt(elOutros?.value || p.defOutros || 0);

    const getPericiaTotal = (nome) => {
        if (!p.pericias || !p.pericias[nome]) return 0;
        return (parseInt(p.pericias[nome].treino) || 0) + (parseInt(p.pericias[nome].extra) || 0);
    };

    const reflexos = getPericiaTotal("Reflexos");
    const fortitude = getPericiaTotal("Fortitude");

    const defesaBase = 10 + agi + equip + outros;
    const esquivaTotal = defesaBase + reflexos;
    const bloqueioTotal = fortitude;

    const elDef = document.getElementById('defesa-total');
    const elBloq = document.getElementById('bloqueio-total');
    const elEsq = document.getElementById('esquiva-total');

    if (elDef) elDef.innerText = defesaBase;
    if (elBloq) elBloq.innerText = bloqueioTotal;
    if (elEsq) elEsq.innerText = esquivaTotal;
};

// --- Inicialização com OBR ---
OBR.onReady(async () => {
    OBR.action.setWidth(320);
    OBR.action.setHeight(530);

    const metadata = await OBR.room.getMetadata();
    if (metadata[METADATA_KEY]) {
        personagens = metadata[METADATA_KEY];
    } else {
        personagens = [{ 
            id: "yuki", nome: "Yuki", jogador: "Dionatan", origem: "Policial", classe: "Ocultista", 
            pv: "24 / 24", san: "47 / 47", pe: "20 / 28", ini: "0", emIniciativa: false,
            agi: "3", int: "4", vig: "2", pre: "3", forca: "1",
            nex: "35", peTurno: "7", deslocamentoMetro: 9, deslocamentoQuadrado: 6, pericias: {} 
        }];
        await salvarNaSala();
    }

    OBR.room.onMetadataChange((metadata) => {
        if (metadata[METADATA_KEY]) {
            personagens = metadata[METADATA_KEY];
            atualizarInterfaceSincronizada();
        }
    });

    if (personagens.length > 0) idPersonagemSelecionado = personagens[0].id;
    window.voltarParaRaiz();
});

// --- Lógica de NEX e PE ---
window.gerarOpcoesNex = (valorAtual) => {
    let html = '';
    for (let i = 0; i <= 95; i += 5) {
        html += `<option value="${i}" ${valorAtual == i ? 'selected' : ''}>${i}%</option>`;
    }
    html += `<option value="99" ${valorAtual == 99 ? 'selected' : ''}>99%</option>`;
    return html;
};

window.atualizarNex = async (novoNex) => {
    const p = obterPersonagemAtual();
    if (!p) return;
    p.nex = novoNex;
    p.peTurno = Math.floor(parseInt(novoNex) / 5);
    const inputPe = document.getElementById('ext-pe-turno');
    if (inputPe) inputPe.value = p.peTurno;
    await salvarNaSala();
};

// --- Lógica de Deslocamento ---
window.atualizarDeslocamentoMetro = async (valorMetro) => {
    const p = obterPersonagemAtual();
    if (!p) return;
    const metros = parseFloat(valorMetro) || 0;
    p.deslocamentoMetro = metros;
    p.deslocamentoQuadrado = Math.floor(metros / 1.5);
    const inputQ = document.getElementById('ext-deslocamento-q');
    if (inputQ) inputQ.value = p.deslocamentoQuadrado;
    await salvarNaSala();
};

window.atualizarDeslocamentoQuadrado = async (valorQuadrado) => {
    const p = obterPersonagemAtual();
    if (!p) return;
    const quadrados = parseInt(valorQuadrado) || 0;
    p.deslocamentoQuadrado = quadrados;
    p.deslocamentoMetro = quadrados * 1.5;
    const inputM = document.getElementById('ext-deslocamento-m');
    if (inputM) inputM.value = p.deslocamentoMetro;
    await salvarNaSala();
};

// --- Função de Salvar na Nuvem ---
async function salvarNaSala() {
    await OBR.room.setMetadata({ [METADATA_KEY]: personagens });
}

// --- Atualizador de UI ---
function atualizarInterfaceSincronizada() {
    if (document.getElementById('aba-iniciativa')?.style.display === 'block') renderizarCardsIniciativa();
    if (document.getElementById('aba-pericias')?.style.display === 'block') renderizarPericias();
    if (document.getElementById('tela-lista-personagens')?.style.display === 'block') renderizarListaPersonagens();
    window.calcularDefesas(); 
}

// --- Modal de Perícias ---
window.abrirModalPericia = async (nomePericia) => {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo');
    const texto = document.getElementById('modal-texto');
    const chaveLimpa = nomePericia.replace(/[*+]/g, '');

    try {
        const response = await fetch('./data/pericias.json');
        if (!response.ok) throw new Error("Erro ao carregar perícias.");
        const todasPericias = await response.json();
        const info = todasPericias[chaveLimpa];
        if (info) {
            titulo.innerText = nomePericia;
            texto.innerHTML = `<p>${info.descricao}</p><div class="regras-container">${info.regras}</div>`;
            modal.style.display = 'flex';
        }
    } catch (err) { console.error("Erro ao carregar perícia:", err); }
};

window.fecharModal = () => document.getElementById('modal-pericia').style.display = 'none';

// --- Utilitários de Dados ---
function obterPersonagemAtual() {
    let p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p && personagens.length > 0) { idPersonagemSelecionado = personagens[0].id; p = personagens[0]; }
    return p;
}

// --- Navegação e UI ---
window.selecionarPersonagem = (id) => {
    idPersonagemSelecionado = id;
    ocultarTodasTelas();
    const p = obterPersonagemAtual();
    if (p) {
        document.getElementById('nome-titulo-personagem').innerText = p.nome;
        document.getElementById('menu-personagem').style.display = 'block';
    } else { window.voltarParaRaiz(); }
};

window.mostrarListaPersonagens = () => { ocultarTodasTelas(); document.getElementById('tela-lista-personagens').style.display = 'block'; renderizarListaPersonagens(); };
window.voltarParaRaiz = () => { ocultarTodasTelas(); document.getElementById('tela-raiz').style.display = 'grid'; };
window.voltarParaLista = () => window.mostrarListaPersonagens();
window.voltarParaMenuChar = () => { ocultarTodasTelas(); document.getElementById('menu-personagem').style.display = 'block'; };

function ocultarTodasTelas() {
    // ABA-ORIGENS ADICIONADA AQUI ↓
    ['tela-raiz', 'tela-lista-personagens', 'menu-personagem', 'aba-iniciativa', 'aba-info', 'aba-atrib', 'aba-pericias', 'aba-combate', 'aba-inv', 'aba-hab', 'aba-rituais', 'aba-origens'].forEach(id => {
        const el = document.getElementById(id); if (el) el.style.display = 'none';
    });
}

// --- Iniciativa ---
window.abrirIniciativa = (vindoDe) => {
    origemIniciativa = vindoDe; ocultarTodasTelas();
    document.getElementById('aba-iniciativa').style.display = 'block';
    renderizarCardsIniciativa();
};

window.voltarDeIniciativa = () => {
    ocultarTodasTelas();
    if (origemIniciativa === 'raiz') document.getElementById('tela-raiz').style.display = 'grid';
    else document.getElementById('menu-personagem').style.display = 'block';
};

function renderizarCardsIniciativa() {
    const container = document.getElementById('lista-iniciativa-cards');
    if (!container) return; container.innerHTML = '';
    const ativos = personagens.filter(p => p.emIniciativa).sort((a, b) => (parseInt(b.ini) || 0) - (parseInt(a.ini) || 0));
    
    if (ativos.length === 0) { container.innerHTML = '<p style="text-align:center; font-size:12px; color:#666;">Nenhum personagem em iniciativa.</p>'; return; }

    ativos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="info-section" style="flex-grow:1; display:flex; flex-direction:column; gap:4px;">
                <input type="text" style="color:white; font-weight:bold; background:transparent; border:none; outline:none; font-size:13px; padding:0; width:100%;" value="${p.nome}" oninput="atualizarDado('${p.id}','nome',this.value)">
                <div class="stats-row" style="display:flex; gap:8px; font-size:11px;">
                    <input type="text" value="${p.pv}" style="background:transparent; border:none; color:#ff5555; width:40px; text-align:center; outline:none; font-weight:bold;" oninput="atualizarDado('${p.id}','pv',this.value)">
                    <input type="text" value="${p.san}" style="background:transparent; border:none; color:#aa55ff; width:40px; text-align:center; outline:none; font-weight:bold;" oninput="atualizarDado('${p.id}','san',this.value)">
                    <input type="text" value="${p.pe}" style="background:transparent; border:none; color:#ffff55; width:40px; text-align:center; outline:none; font-weight:bold;" oninput="atualizarDado('${p.id}','pe',this.value)">
                </div>
            </div>
            <input type="text" value="${p.ini}" style="background:transparent; border:none; border-bottom:1px solid white; color:white; font-size:20px; width:30px; text-align:center; font-weight:bold; outline:none;" oninput="atualizarDado('${p.id}','ini',this.value)">
        `;
        container.appendChild(card);
    });
}

// --- Perícias ---
window.alterarExtraPericia = async (nomePericia, valorExtra) => {
    const p = obterPersonagemAtual();
    if (!p) return;
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    p.pericias[nomePericia].extra = parseInt(valorExtra) || 0;
    await salvarNaSala();
    window.calcularDefesas();
};

window.alterarTreinoPericia = async (nomePericia, valorTreino) => {
    const p = obterPersonagemAtual();
    if (!p) return;
    if (!p.pericias) p.pericias = {};
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    p.pericias[nomePericia].treino = parseInt(valorTreino) || 0;
    await salvarNaSala();
    window.calcularDefesas();
};

function renderizarPericias() {
    const container = document.getElementById('lista-pericias-container');
    if (!container) return; container.innerHTML = '';
    const p = obterPersonagemAtual(); if (!p) return;
    if (!p.pericias) p.pericias = {};
    
    LISTA_PERICIAS_BASE.forEach(peri => {
        const dados = p.pericias[peri.nome] || { treino: 0, extra: 0 };
        const total = dados.treino + dados.extra;
        const itemRow = document.createElement('div');
        itemRow.className = `pericia-item-row p-treino-${dados.treino}`;
        itemRow.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" onclick="abrirModalPericia('${peri.nome}')" style="cursor:pointer;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 7v10l10 5V12L2 7zm20 0v10l-10 5V12l10-5z"/></svg>
            <span class="p-nome" onclick="abrirModalPericia('${peri.nome}')" style="cursor: pointer;">${peri.nome}</span>
            <span class="p-attr">( ${peri.attr.toUpperCase()} )</span>
            <span id="total-${peri.nome}">( ${total} )</span>
            <select class="pericia-select-ficha" onchange="alterarTreinoPericia('${peri.nome}', this.value)">
                <option value="0" ${dados.treino === 0 ? 'selected' : ''}>0</option>
                <option value="5" ${dados.treino === 5 ? 'selected' : ''}>5</option>
                <option value="10" ${dados.treino === 10 ? 'selected' : ''}>10</option>
                <option value="15" ${dados.treino === 15 ? 'selected' : ''}>15</option>
            </select>
            <input type="text" class="pericia-input-ficha" value="${dados.extra}" oninput="alterarExtraPericia('${peri.nome}', this.value)" placeholder="0">
        `;
        container.appendChild(itemRow);
    });
}


// --- Origens ---
window.abrirOrigens = () => {
    ocultarTodasTelas();
    document.getElementById('aba-origens').style.display = 'block';
    renderizarOrigens();
};

async function renderizarOrigens() {
    const container = document.getElementById('lista-origens-container');
    if (!container) return;
    
    try {
        const response = await fetch('./data/origens.json');
        const todasOrigens = await response.json();
        
        container.innerHTML = ''; 
        
        Object.keys(todasOrigens).forEach(nome => {
            const item = document.createElement('div');
            item.className = 'pericia-item-row';
            item.style.padding = "10px";
            item.style.background = "#222";
            item.style.borderRadius = "4px";
            item.style.display = "flex";
            item.style.justifyContent = "space-between";
            item.style.marginBottom = "5px";
            
            item.innerHTML = `
                <span onclick="abrirModalOrigem('${nome}')" style="cursor:pointer; color:white; font-weight:bold;">${nome}</span>
                <button class="menu-btn" onclick="selecionarOrigem('${nome}')" style="font-size:10px; padding:2px 8px;">Escolher</button>
            `;
            container.appendChild(item);
        });
    } catch (err) {
        container.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar origens.</p>`;
        console.error("Erro ao carregar origens:", err);
    }
}

window.abrirModalOrigem = async (nomeOrigem) => {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo');
    const texto = document.getElementById('modal-texto');
    
    try {
        const response = await fetch('./data/origens.json');
        const todasOrigens = await response.json();
        const info = todasOrigens[nomeOrigem];
        
        if (info) {
            titulo.innerText = nomeOrigem;
            texto.innerHTML = `<p>${info.descricao}</p><div class="regras-container">${info.regras}</div>`;
            modal.style.display = 'flex';
        }
    } catch (err) {
        console.error("Erro ao carregar modal de origem:", err);
    }
};

window.selecionarOrigem = async (nome) => {
    const p = obterPersonagemAtual();
    if (!p) return;

    try {
        // 1. Carrega o JSON para saber quais perícias essa origem concede
        const response = await fetch('./data/origens.json');
        const todasOrigens = await response.json();
        const origemData = todasOrigens[nome];

        if (origemData) {
            // Garante que a lista de perícias e o histórico existam (Segurança para personagens novos)
            if (!p.pericias) p.pericias = {};
            if (!p.periciasOrigemAntiga) p.periciasOrigemAntiga = [];

            // 2. LIMPA AS PERÍCIAS DA ORIGEM ANTERIOR
            p.periciasOrigemAntiga.forEach(periciaAntiga => {
                if (p.pericias[periciaAntiga]) {
                    p.pericias[periciaAntiga].treino = 0;
                }
            });
            p.periciasOrigemAntiga = []; // Reseta a lista de controle

            // 3. SE FOR AMNÉSICO: Avisa o jogador e para por aqui
            if (origemData.pericias.length === 0) {
                alert("Como Amnésico, lembre-se de ir até a aba de Perícias e escolher 2 perícias manualmente para treinar!");
            } else {
                // 4. APLICA AS NOVAS PERÍCIAS (+5 no treino)
                origemData.pericias.forEach(novaPericia => {
                    // Se a perícia ainda não existir, cria com treino 0 e extra 0
                    if (!p.pericias[novaPericia]) {
                        p.pericias[novaPericia] = { treino: 0, extra: 0 };
                    }
                    
                    // Define o treino como 5
                    p.pericias[novaPericia].treino = 5;
                    
                    // Salva nesta lista para sabermos o que limpar se ele trocar de origem depois
                    p.periciasOrigemAntiga.push(novaPericia);
                });
            }
        }
    } catch (err) {
        console.error("Erro ao processar perícias da origem:", err);
    }

    // Atualiza o nome da origem no personagem
    p.origem = nome;
    
    // Atualiza o input visual se ele existir na aba info
    const inputOrigem = document.getElementById('info-origem');
    if (inputOrigem) inputOrigem.value = nome;
    
    // Salva as alterações na sala/banco de dados
    await salvarNaSala();
    
    // Recarrega a listagem visual das perícias para que o valor '5' apareça no dropdown
    if (typeof renderizarPericias === "function") {
        renderizarPericias();
    } else if (typeof atualizarInterface === "function") {
        atualizarInterface(); 
    }

    window.abrirAbaChar('aba-info'); // Retorna automaticamente para a aba de info
};


// Garantir que a variável global do Set existe desde o início
window.idsHabilidadesExpandidas = window.idsHabilidadesExpandidas || new Set();

// --- Gerenciamento da Aba de Habilidades na Ficha ---
window.abrirAbaHabilidadesFicha = () => {
    ocultarTodasTelas();
    document.getElementById('aba-hab').style.display = 'block';
    window.renderizarHabilidadesPersonagem();
};

window.renderizarHabilidadesPersonagem = () => {
    const container = document.getElementById('lista-habilidades-personagem');
    if (!container) return;
    container.innerHTML = '';

    const p = obterPersonagemAtual();
    if (!p) return;
    if (!p.habilidades) p.habilidades = [];

    if (p.habilidades.length === 0) {
        container.innerHTML = '<p style="text-align:center; font-size:12px; color:#666;">Nenhuma habilidade adicionada.</p>';
        return;
    }

    p.habilidades.forEach((hab, index) => {
        // Usa o index como ID único na ficha
        const idUnico = `pers_${index}`;
        const expandida = window.idsHabilidadesExpandidas.has(idUnico);
        
        const card = document.createElement('div');
        card.className = 'card-hab';
        
        card.innerHTML = `
            <div class="card-hab-header" style="cursor:pointer;" onclick="window.toggleExpandirHabilidade('${idUnico}')">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:10px; color:#a855f7;">${expandida ? '▲' : '▼'}</span>
                    <span style="font-weight:bold; font-size:13px;">${hab.nome}</span>
                </div>
            </div>
            ${expandida ? `
                <div class="card-hab-corpo">
                    <p style="margin: 0 0 10px 0;">${hab.descricao}</p>
                    <div style="display:flex; justify-content:space-between; font-size:11px;">
                        <span onclick="event.stopPropagation(); window.removerHabilidadePersonagem(${index})" style="color:#ef4444; cursor:pointer;">Remover</span>
                        <span style="color:#22c55e; cursor:pointer;">Editar</span>
                    </div>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
};

window.toggleExpandirHabilidade = (idUnico) => {
    if (!window.idsHabilidadesExpandidas) window.idsHabilidadesExpandidas = new Set();
    
    if (window.idsHabilidadesExpandidas.has(idUnico)) {
        window.idsHabilidadesExpandidas.delete(idUnico);
    } else {
        window.idsHabilidadesExpandidas.add(idUnico);
    }
    window.renderizarHabilidadesPersonagem();
    window.renderizarListaBiblioteca(); // Mantém ambos atualizados se necessário
};

window.removerHabilidadePersonagem = async (index) => {
    const p = obterPersonagemAtual();
    if (!p || !p.habilidades) return;
    p.habilidades.splice(index, 1);
    await salvarNaSala();
    window.renderizarHabilidadesPersonagem();
};

// --- Gerenciamento do Modal de Busca e Seleção ---
window.abrirModalAdicionarHabilidades = async () => {
    try {
        const response = await fetch('./data/habilidades.json');
        bibliotecaHabilidades = await response.json();
        
        // Define as abas padrão iniciais baseadas no JSON carregado
        const classes = Object.keys(bibliotecaHabilidades);
        abaModalHabAtiva = classes[0] || "Combatente";
        
        const subCategorias = Object.keys(bibliotecaHabilidades[abaModalHabAtiva] || {});
        subFiltroModalHabAtivo = subCategorias[0] || "";

        document.getElementById('busca-habilidade-input').value = '';
        document.getElementById('modal-selecao-habilidades').style.display = 'flex';
        
        window.renderizarAbasPrincipaisModal();
        window.renderizarSubFiltrosModal();
        window.renderizarListaBiblioteca();
    } catch (err) {
        console.error("Erro ao carregar biblioteca de habilidades:", err);
    }
};

window.fecharModalHabilidades = () => {
    document.getElementById('modal-selecao-habilidades').style.display = 'none';
};

window.renderizarAbasPrincipaisModal = () => {
    const container = document.getElementById('modal-hab-abas-principais');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(bibliotecaHabilidades).forEach(classe => {
        const tab = document.createElement('div');
        tab.className = `tab-principal-item ${classe === abaModalHabAtiva ? 'active' : ''}`;
        tab.innerText = classe;
        tab.onclick = () => {
            abaModalHabAtiva = classe;
            const subS = Object.keys(bibliotecaHabilidades[classe] || {});
            subFiltroModalHabAtivo = subS[0] || "";
            window.renderizarAbasPrincipaisModal();
            window.renderizarSubFiltrosModal();
            window.renderizarListaBiblioteca();
        };
        container.appendChild(tab);
    });
};

window.renderizarSubFiltrosModal = () => {
    const container = document.getElementById('modal-hab-subfiltros');
    if (!container) return;
    container.innerHTML = '';

    const subs = Object.keys(bibliotecaHabilidades[abaModalHabAtiva] || {});
    // Se a aba não possuir sub-filtros, esconde a fileira
    if (subs.length <= 1 && subs[0] === undefined) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';

    subs.forEach(sub => {
        const pill = document.createElement('div');
        pill.className = `pill-filtro-item ${sub === subFiltroModalHabAtivo ? 'active' : ''}`;
        pill.innerText = sub;
        pill.onclick = () => {
            subFiltroModalHabAtivo = sub;
            window.renderizarSubFiltrosModal();
            window.renderizarListaBiblioteca();
        };
        container.appendChild(pill);
    });
};

window.renderizarListaBiblioteca = () => {
    const container = document.getElementById('lista-biblioteca-habilidades');
    if (!container) return;
    container.innerHTML = '';

    const listaOriginal = (bibliotecaHabilidades[abaModalHabAtiva] && bibliotecaHabilidades[abaModalHabAtiva][subFiltroModalHabAtivo]) || [];
    const termoBusca = document.getElementById('busca-habilidade-input').value.toLowerCase();

    const listaFiltrada = listaOriginal.filter(h => 
        h.nome.toLowerCase().includes(termoBusca) || h.descricao.toLowerCase().includes(termoBusca)
    );

    if (listaFiltrada.length === 0) {
        container.innerHTML = '<p style="text-align:center; font-size:12px; color:#666;">Nenhuma habilidade encontrada.</p>';
        return;
    }

    listaFiltrada.forEach(hab => {
        // CORREÇÃO 1: Garante um identificador único usando o ID (se existir) ou o NOME da habilidade
        const identHab = hab.id || hab.nome;
        const idUnico = `bib_${identHab}`;
        const expandida = window.idsHabilidadesExpandidas.has(idUnico);
        
        const card = document.createElement('div');
        card.className = 'card-hab';

        // CORREÇÃO 2: Adicionado 'event.stopPropagation()' no botão '+'
        card.innerHTML = `
            <div class="card-hab-header" onclick="window.toggleExpandirHabilidade('${idUnico}')">
                <div style="display:flex; align-items:center; gap:8px; cursor:pointer; flex-grow:1;">
                    <span style="font-size:10px; color:#a855f7;">${expandida ? '▲' : '▼'}</span>
                    <span style="font-weight:bold; font-size:13px;">${hab.nome}</span>
                </div>
                <button class="btn-add-box" onclick="event.stopPropagation(); window.adicionarHabilidadeAoPersonagem('${identHab}')">+</button>
            </div>
            ${expandida ? `<div class="card-hab-corpo">${hab.descricao}</div>` : ''}
        `;
        container.appendChild(card);
    });
};

window.filtrarHabilidadesModal = () => {
    window.renderizarListaBiblioteca();
};

window.adicionarHabilidadeAoPersonagem = async (idHab) => {
    const p = obterPersonagemAtual();
    if (!p) return;
    if (!p.habilidades) p.habilidades = [];

    const listaOriginal = (bibliotecaHabilidades[abaModalHabAtiva] && bibliotecaHabilidades[abaModalHabAtiva][subFiltroModalHabAtivo]) || [];
    
    // Procura pela habilidade combinando a trava de segurança (id ou nome)
    const habEncontrada = listaOriginal.find(h => (h.id || h.nome) === idHab);

    if (habEncontrada) {
        // Evita duplicados verificando também com a mesma trava
        if (p.habilidades.some(h => (h.id || h.nome) === idHab)) {
            alert("O personagem já possui esta habilidade.");
            return;
        }

        p.habilidades.push({ ...habEncontrada });
        await salvarNaSala();
        window.renderizarHabilidadesPersonagem();
        window.fecharModalHabilidades();
    }
};

// --- Funções de Edição e Salvar ---
window.toggleModoEdicao = async () => {
    const btn = document.getElementById('btn-toggle-atrib');
    const inputs = document.querySelectorAll('.input-editavel');
    const selectNex = document.getElementById('ext-nex');

    if (btn.innerHTML.includes('Editar')) {
        btn.innerHTML = 'Salvar'; 
        btn.style.borderColor = '#22c55e'; 
        btn.style.color = '#22c55e';
        inputs.forEach(i => { i.removeAttribute('readonly'); i.classList.remove('input-travado'); });
        if(selectNex) selectNex.removeAttribute('disabled');
    } else {
        btn.innerHTML = 'Editar'; 
        btn.style.borderColor = '#444'; 
        btn.style.color = '#aaa';
        inputs.forEach(i => { i.setAttribute('readonly', 'true'); i.classList.add('input-travado'); });
        if(selectNex) selectNex.setAttribute('disabled', 'true');
        await salvarAtributos(); 
        await salvarExtras();
    }
};

window.salvarAtributos = async () => {
    const p = obterPersonagemAtual(); if (!p) return;
    p.agi = document.getElementById('at-agi').value;
    p.int = document.getElementById('at-int').value;
    p.vig = document.getElementById('at-vig').value;
    p.pre = document.getElementById('at-pre').value;
    p.for = document.getElementById('at-for').value;
    p.defEquip = document.getElementById('def-equip').value;
    p.defOutros = document.getElementById('def-outros').value;
    p.defProtecao = document.getElementById('def-protecao').value;
    p.defResistencias = document.getElementById('def-resistencias').value;
    p.defProficiencias = document.getElementById('def-proficiencias').value;
    await salvarNaSala();
    window.calcularDefesas();
};

window.salvarExtras = async () => {
    const p = obterPersonagemAtual(); if (!p) return;
    p.nex = document.getElementById('ext-nex').value; 
    p.peTurno = document.getElementById('ext-pe-turno').value;
    p.deslocamentoMetro = parseFloat(document.getElementById('ext-deslocamento-m').value) || 0;
    p.deslocamentoQuadrado = parseInt(document.getElementById('ext-deslocamento-q').value) || 0;
    await salvarNaSala();
};

window.salvarExtrasDireto = async (campo, valor) => {
    const p = obterPersonagemAtual(); if (!p) return;
    p[campo] = valor;
    atualizarBarraVisual(campo);
    await salvarNaSala();
};

function atualizarBarraVisual(campo) {
    const p = obterPersonagemAtual(); if (!p) return;
    let valor = String(p[campo] || "0 / 0");
    let partes = valor.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;
    let pct = max > 0 ? Math.min(100, Math.max(0, (atual / max) * 100)) : 0;
    
    let cor = campo === 'san' ? "#6b21a8" : campo === 'pe' ? "#c2410c" : "#991b1b";
    let idElemento = campo === 'san' ? "bar-sanidade" : campo === 'pe' ? "bar-esforco" : "bar-vida";
    
    const el = document.getElementById(idElemento);
    if (el) el.style.backgroundImage = `linear-gradient(to right, ${cor} ${Math.round(pct)}%, transparent ${Math.round(pct)}%)`;
}

window.ajustarStatus = async (campo, delta) => {
    const p = obterPersonagemAtual(); if (!p) return;
    let partes = String(p[campo] || "0 / 0").split('/');
    let atual = Math.max(0, (parseInt(partes[0]) || 0) + delta);
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;
    p[campo] = partes[1] ? `${atual} / ${max}` : `${atual}`;
    
    const inputId = campo === 'pv' ? 'bar-display-pv' : campo === 'san' ? 'bar-display-san' : 'bar-display-pe';
    const inputEl = document.getElementById(inputId);
    if (inputEl) inputEl.value = p[campo];
    atualizarBarraVisual(campo);
    await salvarNaSala();
};

window.abrirAbaChar = (idAba) => {
    ocultarTodasTelas();
    document.getElementById(idAba).style.display = 'block';
    const p = obterPersonagemAtual(); if (!p) return;
    
    if (idAba === 'aba-info') {
        document.getElementById('info-nome').value = p.nome || "";
        document.getElementById('info-jogador').value = p.jogador || "";
        document.getElementById('info-origem').value = p.origem || "";
        document.getElementById('info-classe').value = p.classe || "";
        document.getElementById('info-em-iniciativa').checked = !!p.emIniciativa;
    } else if (idAba === 'aba-atrib') {
        document.getElementById('at-agi').value = p.agi || "0";
        document.getElementById('at-int').value = p.int || "0";
        document.getElementById('at-vig').value = p.vig || "0";
        document.getElementById('at-pre').value = p.pre || "0";
        document.getElementById('at-for').value = p.forca || "0";
        document.getElementById('def-equip').value = p.defEquip || "0";
        document.getElementById('def-outros').value = p.defOutros || "0";
        document.getElementById('def-protecao').value = p.defProtecao || "";
        document.getElementById('def-resistencias').value = p.defResistencias || "";
        document.getElementById('def-proficiencias').value = p.defProficiencias || "";
        const selectNex = document.getElementById('ext-nex');
        if (selectNex) selectNex.innerHTML = gerarOpcoesNex(p.nex || 0);
        document.getElementById('ext-pe-turno').value = p.peTurno || "0";
        document.getElementById('ext-deslocamento-m').value = p.deslocamentoMetro || "9";
        document.getElementById('ext-deslocamento-q').value = p.deslocamentoQuadrado || "6";
        document.getElementById('bar-display-pv').value = p.pv || "0 / 0";
        document.getElementById('bar-display-san').value = p.san || "0 / 0";
        document.getElementById('bar-display-pe').value = p.pe || "0 / 0";
        atualizarBarraVisual('pv'); atualizarBarraVisual('san'); atualizarBarraVisual('pe');
        
        window.calcularDefesas(); // Executa o cálculo ao abrir a aba
    } else if (idAba === 'aba-pericias') { renderizarPericias(); }
};

window.salvarDadosForm = async () => {
    const p = obterPersonagemAtual(); if (!p) return;
    p.nome = document.getElementById('info-nome').value;
    p.jogador = document.getElementById('info-jogador').value;
    p.origem = document.getElementById('info-origem').value;
    p.classe = document.getElementById('info-classe').value;
    document.getElementById('nome-titulo-personagem').innerText = p.nome;
    await salvarNaSala(); 
};

window.excluirPersonagemAtual = async () => {
    const p = obterPersonagemAtual();
    if (!p || !confirm(`Excluir ${p.nome}?`)) return;
    personagens = personagens.filter(char => char.id !== p.id);
    await salvarNaSala();
    window.mostrarListaPersonagens();
};

window.alternarIniciativa = async (checked) => { 
    const p = obterPersonagemAtual(); 
    if (p) { p.emIniciativa = checked; await salvarNaSala(); } 
};

window.atualizarDado = async (id, campo, valor) => { 
    const p = personagens.find(c => c.id === id); 
    if (p) { p[campo] = valor; await salvarNaSala(); } 
};

window.renderizarListaPersonagens = () => {
    const container = document.getElementById('lista-botoes-personagens'); if (!container) return;
    container.innerHTML = '';
    personagens.forEach(p => {
        const btn = document.createElement('button'); btn.className = 'menu-btn'; btn.innerText = p.nome;
        btn.onclick = () => window.selecionarPersonagem(p.id); container.appendChild(btn);
    });
    const bNovo = document.createElement('button'); bNovo.className = 'menu-btn'; bNovo.innerText = '+ Novo';
    bNovo.onclick = async () => { 
        personagens.push({ id: 'char_'+Date.now(), nome: 'Novo', agi:"0", int:"0", vig:"0", pre:"0", forca:"0", emIniciativa: false, nex: "0", peTurno: "0", deslocamentoMetro: 9, deslocamentoQuadrado: 6, pv: "20 / 20", san: "20 / 20", pe: "10 / 10", pericias: {} }); 
        await salvarNaSala(); renderizarListaPersonagens(); 
    };
    container.appendChild(bNovo);
};
