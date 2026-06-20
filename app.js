import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

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

let personagens = [
    { 
        id: "yuki", nome: "Yuki", jogador: "Dionatan", origem: "Policial", classe: "Ocultista", 
        pv: "24 / 24", san: "47 / 47", pe: "20 / 28", ini: "0", emIniciativa: false,
        agi: "3", int: "4", vig: "2", pre: "3", forca: "1",
        nex: "35", peTurno: "7", deslocamento: "12 m / 8 q",
        pericias: {} 
    }
];

let idPersonagemSelecionado = "yuki"; 
let origemIniciativa = "raiz"; 

function obterPersonagemAtual() {
    let p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p && personagens.length > 0) {
        idPersonagemSelecionado = personagens[0].id;
        p = personagens[0];
    }
    return p;
}

// --- CLIQUE DETECTADO (DIAGNÓSTICO CRÍTICO) ---
window.selecionarPersonagem = (id) => {
    console.log("=> Botão clicado para o ID:", id);
    idPersonagemSelecionado = id;
    
    ocultarTodasTelas();
    
    const p = obterPersonagemAtual();
    if (!p) {
        alert("Erro: Dados do personagem não encontrados para o ID " + id);
        return;
    }
    
    const titulo = document.getElementById('nome-titulo-personagem');
    if (!titulo) {
        console.warn("Aviso: ID 'nome-titulo-personagem' não foi achado no seu HTML.");
    } else {
        titulo.innerText = p.nome;
    }
    
    const menu = document.getElementById('menu-personagem');
    if (menu) {
        console.log("Sucesso: Exibindo 'menu-personagem'");
        menu.style.display = 'block';
    } else {
        // Se cair aqui, achamos o erro! O HTML não tem essa seção com esse ID exato.
        alert("ERRO DE CONEXÃO HTML:\nO JavaScript tentou abrir a tela da Yuki, mas o elemento <div id='menu-personagem'> não existe no seu arquivo HTML (ou está com outro nome).");
    }
};

// --- Resto das Funções Protegidas ---
window.mostrarListaPersonagens = () => { 
    ocultarTodasTelas(); 
    const el = document.getElementById('tela-lista-personagens');
    if (el) el.style.display = 'block'; 
    renderizarListaPersonagens(); 
};
window.voltarParaRaiz = () => { 
    ocultarTodasTelas(); 
    const el = document.getElementById('tela-raiz');
    if (el) el.style.display = 'grid'; 
};
window.voltarParaLista = () => window.mostrarListaPersonagens();
window.voltarParaMenuChar = () => { 
    ocultarTodasTelas(); 
    const el = document.getElementById('menu-personagem');
    if (el) el.style.display = 'block'; 
};

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

window.salvarAtributos = () => {
    const p = obterPersonagemAtual();
    if (p) {
        const agi = document.getElementById('at-agi'); if (agi) p.agi = agi.value;
        const intel = document.getElementById('at-int'); if (intel) p.int = intel.value;
        const vig = document.getElementById('at-vig'); if (vig) p.vig = vig.value;
        const pre = document.getElementById('at-pre'); if (pre) p.pre = pre.value;
        const forc = document.getElementById('at-for'); if (forc) p.forca = forc.value;
    }
};

window.salvarExtras = () => {
    const p = obterPersonagemAtual();
    if (p) {
        const nex = document.getElementById('ext-nex'); if (nex) p.nex = nex.value.replace('%', '');
        const peTurno = document.getElementById('ext-pe-turno'); if (peTurno) p.peTurno = peTurno.value;
        const desloc = document.getElementById('ext-deslocamento'); if (desloc) p.deslocamento = desloc.value;
    }
};

window.salvarExtrasDireto = (campo, valor) => {
    const p = obterPersonagemAtual();
    if (p) {
        p[campo] = valor;
        atualizarBarraVisual(campo);
    }
};

function atualizarBarraVisual(campo) {
    const p = obterPersonagemAtual();
    if (!p) return;
    let valor = p[campo] || "0 / 0";
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
    const p = obterPersonagemAtual();
    if (!p) return;
    let valorAtual = p[campo] || "0 / 0";
    let partes = valorAtual.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;
    atual = atual + delta; if (atual < 0) atual = 0;
    p[campo] = partes[1] ? `${atual} / ${max}` : `${atual}`;
    let inputId = campo === 'pv' ? 'bar-display-pv' : campo === 'san' ? 'bar-display-san' : 'bar-display-pe';
    const inputEl = document.getElementById(inputId);
    if (inputEl) inputEl.value = p[campo];
    atualizarBarraVisual(campo);
};

window.alterarTreinoPericia = (nomePericia, valorTreino) => {
    const p = obterPersonagemAtual(); if (!p) return;
    if (!p.pericias) p.pericias = {};
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    p.pericias[nomePericia].treino = parseInt(valorTreino) || 0;
    renderizarPericias(); 
};

window.alterarExtraPericia = (nomePericia, valorExtra) => {
    const p = obterPersonagemAtual(); if (!p) return;
    if (!p.pericias) p.pericias = {};
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    p.pericias[nomePericia].extra = parseInt(valorExtra) || 0;
    const treino = p.pericias[nomePericia].treino || 0;
    const total = treino + (parseInt(valorExtra) || 0);
    const totalElemento = document.getElementById(`total-${nomePericia}`);
    if (totalElemento) totalElemento.innerText = `( ${total} )`;
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
    if (idAba === 'aba-info') {
        const nome = document.getElementById('info-nome'); if (nome) nome.value = p.nome || "";
        const jogador = document.getElementById('info-jogador'); if (jogador) jogador.value = p.jogador || "";
        const origem = document.getElementById('info-origem'); if (origem) origem.value = p.origem || "";
        const classe = document.getElementById('info-classe'); if (classe) classe.value = p.classe || "";
        const emIni = document.getElementById('info-em-iniciativa'); if (emIni) emIni.checked = !!p.emIniciativa;
    } else if (idAba === 'aba-atrib') {
        const agi = document.getElementById('at-agi'); if (agi) agi.value = p.agi || "0";
        const intel = document.getElementById('at-int'); if (intel) intel.value = p.int || "0";
        const vig = document.getElementById('at-vig'); if (vig) vig.value = p.vig || "0";
        const pre = document.getElementById('at-pre'); if (pre) pre.value = p.pre || "0";
        const forc = document.getElementById('at-for'); if (forc) forc.value = p.forca || "0";
        const nex = document.getElementById('ext-nex'); if (nex) nex.value = (p.nex || "0").replace('%', '');
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
};

window.alternarIniciativa = (checked) => { const p = obterPersonagemAtual(); if (p) p.emIniciativa = checked; };

function renderizarCardsIniciativa() {
    const container = document.getElementById('lista-iniciativa-cards'); if (!container) return;
    container.innerHTML = '';
    const ativos = personagens.filter(p => p.emIniciativa).sort((a, b) => (parseInt(b.ini) || 0) - (parseInt(a.ini) || 0));
    if (ativos.length === 0) { container.innerHTML = '<p style="text-align:center; font-size:12px; color:#666;">Vazio.</p>'; return; }
    ativos.forEach(p => {
        const card = document.createElement('div'); card.className = 'character-card';
        card.innerHTML = `<div class="info-section"><input type="text" style="color:white; font-weight:bold;" value="${p.nome}" oninput="atualizarDado('${p.id}','nome',this.value)"><div class="stats-row"><input type="text" class="stat-pv" value="${p.pv}" oninput="atualizarDado('${p.id}','pv',this.value)"><input type="text" class="stat-san" value="${p.san}" oninput="atualizarDado('${p.id}','san',this.value)"><input type="text" class="stat-pe" value="${p.pe}" oninput="atualizarDado('${p.id}','pe',this.value)"></div></div><input type="text" class="stat-ini" value="${p.ini}" oninput="atualizarDado('${p.id}','ini',this.value)">`;
        container.appendChild(card);
    });
}

window.atualizarDado = (id, campo, valor) => { const p = personagens.find(c => c.id === id); if (p) p[campo] = valor; };

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
        renderizarListaPersonagens(); 
    };
    container.appendChild(bNovo);
}

OBR.onReady(() => { OBR.action.setWidth(320); OBR.action.setHeight(530); });
