import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

// Lista com os nomes e marcadores corretos conforme o livro oficial de Ordem Paranormal
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

// Inicialização segura do banco de dados local
let personagens = [];
try {
    const dadosSalvos = localStorage.getItem("ordem_paranormal_personagens");
    if (dadosSalvos) {
        personagens = JSON.parse(dadosSalvos);
    }
} catch (e) {
    console.error("Erro ao ler localStorage, reiniciando dados...", e);
}

// Se o banco estiver vazio ou corrompido, reconstrói o padrão com a Yuki de forma limpa
if (!Array.isArray(personagens) || personagens.length === 0) {
    personagens = [
        { 
            id: "yuki", nome: "Yuki", jogador: "Dionatan", origem: "Policial", classe: "Ocultista", 
            pv: "24 / 24", san: "47 / 47", pe: "20 / 28", ini: "0", emIniciativa: false,
            agi: "3", int: "4", vig: "2", pre: "3", forca: "1",
            nex: "35", peTurno: "7", deslocamento: "12 m / 8 q",
            pericias: {} 
        }
    ];
    localStorage.setItem("ordem_paranormal_personagens", JSON.stringify(personagens));
}

let idPersonagemSelecionado = personagens[0].id; 
let origemIniciativa = "raiz"; 

// Função centralizada para salvar dados de forma segura
function salvarNoLocalStorage() {
    try {
        localStorage.setItem("ordem_paranormal_personagens", JSON.stringify(personagens));
    } catch (e) {
        console.error("Falha ao salvar no localStorage:", e);
    }
}

// Garante um ponteiro e dados válidos para evitar telas pretas/vazias
function obterPersonagemAtual() {
    if (!Array.isArray(personagens) || personagens.length === 0) {
        personagens = [{ id: "yuki", nome: "Yuki", jogador: "Dionatan", origem: "Policial", classe: "Ocultista", pv: "24 / 24", san: "47 / 47", pe: "20 / 28", ini: "0", emIniciativa: false, agi: "3", int: "4", vig: "2", pre: "3", forca: "1", nex: "35", peTurno: "7", deslocamento: "12 m / 8 q", pericias: {} }];
        idPersonagemSelecionado = "yuki";
        salvarNoLocalStorage();
    }
    let p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) {
        idPersonagemSelecionado = personagens[0].id;
        p = personagens[0];
    }
    return p;
}

// --- CLIQUE NO PERSONAGEM ---
window.selecionarPersonagem = (id) => {
    idPersonagemSelecionado = id;
    ocultarTodasTelas();
    const p = obterPersonagemAtual();
    if (p) {
        const titulo = document.getElementById('nome-titulo-personagem');
        if (titulo) titulo.innerText = p.nome;
        const menu = document.getElementById('menu-personagem');
        if (menu) menu.style.display = 'block';
    } else {
        window.voltarParaRaiz();
    }
};

// --- Renderização de Cards de Iniciativa ---
function renderizarCardsIniciativa() {
    const container = document.getElementById('lista-iniciativa-cards');
    if (!container) return; 
    container.innerHTML = '';
    
    const ativos = personagens
        .filter(p => p.emIniciativa)
        .sort((a, b) => (parseInt(b.ini) || 0) - (parseInt(a.ini) || 0));
    
    if (ativos.length === 0) { 
        container.innerHTML = '<p style="text-align:center; font-size:12px; color:#666;">Iniciativa vazia.</p>'; 
        return; 
    }

    ativos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        card.innerHTML = `
            <div class="info-section" style="flex-grow:1; display:flex; flex-direction:column; gap:4px;">
                <input type="text" style="color:white; font-weight:bold; background:transparent; border:none; outline:none; font-size:13px; padding:0; margin:0; width:100%;" value="${p.nome}" oninput="atualizarDado('${p.id}','nome',this.value)">
                <div class="stats-row" style="display:flex; gap:8px; font-size:11px;">
                    <input type="text" class="stat-pv" value="${p.pv}" style="background:transparent; border:none; color:#ff5555; width:40px; text-align:center; outline:none; font-weight:bold; padding:0;" oninput="atualizarDado('${p.id}','pv',this.value)">
                    <input type="text" class="stat-san" value="${p.san}" style="background:transparent; border:none; color:#aa55ff; width:40px; text-align:center; outline:none; font-weight:bold; padding:0;" oninput="atualizarDado('${p.id}','san',this.value)">
                    <input type="text" class="stat-pe" value="${p.pe}" style="background:transparent; border:none; color:#ffff55; width:40px; text-align:center; outline:none; font-weight:bold; padding:0;" oninput="atualizarDado('${p.id}','pe',this.value)">
                </div>
            </div>
            <input type="text" class="stat-ini" value="${p.ini}" style="background:transparent; border:none; border-bottom:1px solid white; color:white; font-size:20px; width:30px; text-align:center; font-weight:bold; outline:none; padding:0 0 2px 0;" oninput="atualizarDado('${p.id}','ini',this.value)">
        `;
        container.appendChild(card);
    });
}

// --- Alternar Modo Edição (Atributos) ---
window.toggleModoEdicao = () => {
    const btn = document.getElementById('btn-toggle-atrib');
    const inputs = document.querySelectorAll('.input-editavel');
    if (!btn || inputs.length === 0) return;
    
    if (btn.innerHTML.includes('Destravar')) {
        btn.innerHTML = 'Travar'; 
        btn.style.borderColor = '#22c55e'; 
        btn.style.color = '#22c55e';
        
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.classList.remove('input-travado');
        });
    } else {
        btn.innerHTML = 'Destravar'; 
        btn.style.borderColor = '#444'; 
        btn.style.color = '#aaa';
        
        inputs.forEach(input => {
            input.setAttribute('readonly', 'true');
            input.classList.add('input-travado');
        });
        
        salvarAtributos();
        salvarExtras();
        salvarNoLocalStorage();
    }
}

// --- Funções de Navegação ---
window.mostrarListaPersonagens = () => { ocultarTodasTelas(); const el = document.getElementById('tela-lista-personagens'); if (el) el.style.display = 'block'; renderizarListaPersonagens(); };
window.voltarParaRaiz = () => { ocultarTodasTelas(); const el = document.getElementById('tela-raiz'); if (el) el.style.display = 'grid'; };
window.voltarParaLista = () => window.mostrarListaPersonagens();
window.voltarParaMenuChar = () => { ocultarTodasTelas(); const el = document.getElementById('menu-personagem'); if (el) el.style.display = 'block'; };

window.abrirIniciativa = (vindoDe) => {
    origemIniciativa = vindoDe; 
    ocultarTodasTelas();
    const el = document.getElementById('aba-iniciativa');
    if (el) el.style.display = 'block';
    renderizarCardsIniciativa();
};

window.voltarDeIniciativa = () => {
    ocultarTodasTelas();
    if (origemIniciativa === 'raiz') {
        const el = document.getElementById('tela-raiz');
        if (el) el.style.display = 'grid';
    } else {
        const el = document.getElementById('menu-personagem');
        if (el) el.style.display = 'block';
    }
};

function salvarAtributos() {
    const p = obterPersonagemAtual();
    if (p) {
        const agi = document.getElementById('at-agi'); if (agi) p.agi = agi.value;
        const intel = document.getElementById('at-int'); if (intel) p.int = intel.value;
        const vig = document.getElementById('at-vig'); if (vig) p.vig = vig.value;
        const pre = document.getElementById('at-pre'); if (pre) p.pre = pre.value;
        const forc = document.getElementById('at-for'); if (forc) p.forca = forc.value;
    }
}

function salvarExtras() {
    const p = obterPersonagemAtual();
    if (p) {
        const nex = document.getElementById('ext-nex'); if (nex) p.nex = nex.value.replace('%', '');
        const peTurno = document.getElementById('ext-pe-turno'); if (peTurno) p.peTurno = peTurno.value;
        const desloc = document.getElementById('ext-deslocamento'); if (desloc) p.deslocamento = desloc.value;
    }
}

window.salvarExtrasDireto = (campo, valor) => {
    const p = obterPersonagemAtual();
    if (p) { 
        p[campo] = valor; 
        atualizarBarraVisual(campo); 
        salvarNoLocalStorage();
    }
};

function atualizarBarraVisual(campo) {
    const p = obterPersonagemAtual(); if (!p) return;
    let valor = String(p[campo] || "0 / 0"); // Força conversão para String prevenindo crash de tipo
    let partes = valor.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;
    let pct = max > 0 ? Math.min(100, Math.max(0, (atual / max) * 100)) : 0;
    pct = Math.round(pct); 
    
    let cor = "#991b1b"; let idElemento = "bar-vida";
    if (campo === 'san') { cor = "#6b21a8"; idElemento = "bar-sanidade"; }
    if (campo === 'pe') { cor = "#c2410c"; idElemento = "bar-esforco"; }
    
    const el = document.getElementById(idElemento);
    if (el) el.style.backgroundImage = `linear-gradient(to right, ${cor} ${pct}%, transparent ${pct}%)`;
}

window.ajustarStatus = (campo, delta) => {
    const p = obterPersonagemAtual(); if (!p) return;
    let valorAtual = String(p[campo] || "0 / 0");
    let partes = valorAtual.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;
    atual = atual + delta; if (atual < 0) atual = 0;
    
    p[campo] = partes[1] ? `${atual} / ${max}` : `${atual}`;
    let inputId = campo === 'pv' ? 'bar-display-pv' : campo === 'san' ? 'bar-display-san' : 'bar-display-pe';
    const inputEl = document.getElementById(inputId);
    if (inputEl) inputEl.value = p[campo];
    
    atualizarBarraVisual(campo);
    salvarNoLocalStorage();
};

window.alterarTreinoPericia = (nomePericia, valorTreino) => {
    const p = obterPersonagemAtual(); if (!p) return;
    if (!p.pericias) p.pericias = {};
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    p.pericias[nomePericia].treino = parseInt(valorTreino) || 0;
    renderizarPericias(); 
    salvarNoLocalStorage();
};

window.alterarExtraPericia = (nomePericia, valorExtra) => {
    const p = obterPersonagemAtual(); if (!p) return;
    if (!p.pericias) p.pericias = {};
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    const valorNumerico = parseInt(valorExtra) || 0;
    p.pericias[nomePericia].extra = valorNumerico;
    const treino = p.pericias[nomePericia].treino || 0;
    const total = treino + valorNumerico;
    const totalElemento = document.getElementById(`total-${nomePericia}`);
    if (totalElemento) totalElemento.innerText = `( ${total} )`;
    salvarNoLocalStorage();
};

function renderizarPericias() {
    const container = document.getElementById('lista-pericias-container');
    if (!container) return; container.innerHTML = '';
    const p = obterPersonagemAtual(); if (!p) return;
    if (!p.pericias) p.pericias = {};
    LISTA_PERICIAS_BASE.forEach(peri => {
        const dadosSalvos = p.pericias[peri.nome] || { treino: 0, extra: 0 };
        const treino = dadosSalvos.treino || 0; const extra = dadosSalvos.extra || 0; const total = treino + extra;
        const itemRow = document.createElement('div'); itemRow.className = `pericia-item-row p-treino-${treino}`;
        itemRow.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 7v10l10 5V12L2 7zm20 0v10l-10 5V12l10-5z"/></svg><span class="p-nome">${peri.nome}</span><span class="p-attr">( ${peri.attr.toUpperCase()} )</span><span id="total-${peri.nome}">( ${total} )</span><select class="pericia-select-ficha" onchange="alterarTreinoPericia('${peri.nome}', this.value)"><option value="0" ${treino === 0 ? 'selected' : ''}>0</option><option value="5" ${treino === 5 ? 'selected' : ''}>5</option><option value="10" ${treino === 10 ? 'selected' : ''}>10</option><option value="15" ${treino === 15 ? 'selected' : ''}>15</option></select><input type="text" class="pericia-input-ficha" value="${extra}" oninput="alterarExtraPericia('${peri.nome}', this.value)" placeholder="0">`;
        container.appendChild(itemRow);
    });
}

window.abrirAbaChar = (idAba) => {
    ocultarTodasTelas();
    const elAba = document.getElementById(idAba);
    if (elAba) elAba.style.display = 'block';
    const p = obterPersonagemAtual(); if (!p) return;
    
    const btnTrava = document.getElementById('btn-toggle-atrib');
    if (btnTrava) {
        btnTrava.innerHTML = 'Destravar'; 
        btnTrava.style.borderColor = '#444';
        btnTrava.style.color = '#aaa';
    }
    
    const inputsAtrib = document.querySelectorAll('.input-editavel');
    inputsAtrib.forEach(input => {
        input.setAttribute('readonly', 'true');
        input.classList.add('input-travado');
    });

    if (idAba === 'aba-info') {
        const nome = document.getElementById('info-nome'); if (nome) nome.value = p.nome || "";
        const jogador = document.getElementById('info-jogador'); if (jogador) jogador.value = p.jogador || "";
        const origem = document.getElementById('info-origem'); if (origem) origem.value = p.origem || "";
        // CORREÇÃO DO CRASH E OVERWRITE: agora injeta o dado corretamente na tela
        const classe = document.getElementById('info-classe'); if (classe) classe.value = p.classe || ""; 
        const emIni = document.getElementById('info-em-iniciativa'); if (emIni) emIni.checked = !!p.emIniciativa;
    } else if (idAba === 'aba-atrib') {
        const agi = document.getElementById('at-agi'); if (agi) agi.value = p.agi || "0";
        const intel = document.getElementById('at-int'); if (intel) intel.value = p.int || "0";
        const vig = document.getElementById('at-vig'); if (vig) vig.value = p.vig || "0";
        const pre = document.getElementById('at-pre'); if (pre) pre.value = p.pre || "0";
        const forc = document.getElementById('at-for'); if (forc) forc.value = p.forca || "0";
        const nex = document.getElementById('ext-nex'); if (nex) nex.value = String(p.nex || "0").replace('%', '');
        const peTurno = document.getElementById('ext-pe-turno'); if (peTurno) peTurno.value = p.peTurno || "0";
        const desloc = document.getElementById('ext-deslocamento'); if (desloc) desloc.value = p.deslocamento || "0m";
        const pv = document.getElementById('bar-display-pv'); if (pv) pv.value = p.pv || "0 / 0";
        const san = document.getElementById('bar-display-san'); if (san) san.value = p.san || "0 / 0";
        const pe = document.getElementById('bar-display-pe'); if (pe) pe.value = p.pe || "0 / 0";
        atualizarBarraVisual('pv'); atualizarBarraVisual('san'); atualizarBarraVisual('pe');
    } else if (idAba === 'aba-pericias') { renderizarPericias(); }
};

window.salvarDadosForm = () => {
    const p = obterPersonagemAtual(); if (!p) return;
    const nome = document.getElementById('info-nome'); if (nome) p.nome = nome.value;
    const jogador = document.getElementById('info-jogador'); if (jogador) p.jogador = jogador.value;
    const origem = document.getElementById('info-origem'); if (origem) p.origem = origem.value;
    const classe = document.getElementById('info-classe'); if (classe) p.classe = classe.value;
    const titulo = document.getElementById('nome-titulo-personagem'); if (titulo) titulo.innerText = p.nome;
    salvarNoLocalStorage(); 
};

window.alternarIniciativa = (checked) => { 
    const p = obterPersonagemAtual(); 
    if (p) { 
        p.emIniciativa = checked; 
        salvarNoLocalStorage(); 
    } 
};

window.atualizarDado = (id, campo, valor) => { 
    const p = personagens.find(c => c.id === id); 
    if (p) { 
        p[campo] = valor; 
        salvarNoLocalStorage(); 
    } 
};

function ocultarTodasTelas() {
    ['tela-raiz', 'tela-lista-personagens', 'menu-personagem', 'aba-iniciativa', 'aba-info', 'aba-atrib', 'aba-pericias', 'aba-combate', 'aba-inv', 'aba-hab', 'aba-rituais'].forEach(id => {
        const el = document.getElementById(id); if (el) el.style.display = 'none';
    });
}

function renderizarListaPersonagens() {
    const container = document.getElementById('lista-botoes-personagens'); if (!container) return;
    container.innerHTML = '';
    personagens.forEach(p => {
        const btn = document.createElement('button'); btn.className = 'menu-btn'; btn.innerText = p.nome;
        btn.onclick = () => window.selecionarPersonagem(p.id); container.appendChild(btn);
    });
    const bNovo = document.createElement('button'); bNovo.className = 'menu-btn'; bNovo.innerText = '+ Novo';
    bNovo.onclick = () => { 
        personagens.push({ 
            id: 'char_'+Date.now(), nome: 'Novo', agi:"0", int:"0", vig:"0", pre:"0", forca:"0", emIniciativa: false,
            nex: "0", peTurno: "0", deslocamento: "9m", pv: "20 / 20", san: "20 / 20", pe: "10 / 10", pericias: {}
        }); 
        salvarNoLocalStorage(); 
        renderizarListaPersonagens(); 
    };
    container.appendChild(bNovo);
}

OBR.onReady(() => { OBR.action.setWidth(320); OBR.action.setHeight(530); });
