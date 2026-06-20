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

// --- Variáveis Globais de Estado ---
let personagens = [];
let idPersonagemSelecionado = null;
let origemIniciativa = "raiz";

// --- Inicialização Segura ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carregar dados do localStorage
    try {
        const dadosSalvos = localStorage.getItem("ordem_paranormal_personagens");
        if (dadosSalvos) {
            personagens = JSON.parse(dadosSalvos);
        }
    } catch (e) {
        console.error("Erro ao ler localStorage:", e);
    }

    // 2. Garantir dados mínimos (Yuki)
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
        salvarNoLocalStorage();
    }
    
    // 3. Define o primeiro personagem como padrão se não houver
    if (personagens.length > 0) idPersonagemSelecionado = personagens[0].id;
    
    // Inicia na tela raiz
    window.voltarParaRaiz();
});

// --- Modal de Perícias ---
window.abrirModalPericia = async (nomePericia) => {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo');
    const texto = document.getElementById('modal-texto');

    try {
        const response = await fetch('./data/pericias.json');
        if (!response.ok) throw new Error("Erro ao carregar arquivo de perícias.");
        
        const todasPericias = await response.json();
        const info = todasPericias[nomePericia];

        if (info) {
            titulo.innerText = nomePericia;
            texto.innerHTML = `
                <p>${info.descricao}</p>
                <div class="regras-container">${info.regras}</div>
            `;
            modal.style.display = 'flex';
        }
    } catch (err) {
        console.error("Erro ao carregar perícia:", err);
        alert("Não foi possível carregar os detalhes desta perícia.");
    }
};

window.fecharModal = () => {
    document.getElementById('modal-pericia').style.display = 'none';
};

// --- Funções de Persistência ---
function salvarNoLocalStorage() {
    try {
        localStorage.setItem("ordem_paranormal_personagens", JSON.stringify(personagens));
    } catch (e) {
        console.error("Falha ao salvar no localStorage:", e);
    }
}

function obterPersonagemAtual() {
    let p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p && personagens.length > 0) {
        idPersonagemSelecionado = personagens[0].id;
        p = personagens[0];
    }
    return p;
}

// --- Navegação e UI ---
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

window.mostrarListaPersonagens = () => { 
    ocultarTodasTelas(); 
    const el = document.getElementById('tela-lista-personagens'); 
    if (el) el.style.display = 'block'; 
    renderizarListaPersonagens(); 
};

window.voltarParaRaiz = () => { ocultarTodasTelas(); const el = document.getElementById('tela-raiz'); if (el) el.style.display = 'grid'; };
window.voltarParaLista = () => window.mostrarListaPersonagens();
window.voltarParaMenuChar = () => { ocultarTodasTelas(); const el = document.getElementById('menu-personagem'); if (el) el.style.display = 'block'; };

function ocultarTodasTelas() {
    ['tela-raiz', 'tela-lista-personagens', 'menu-personagem', 'aba-iniciativa', 'aba-info', 'aba-atrib', 'aba-pericias', 'aba-combate', 'aba-inv', 'aba-hab', 'aba-rituais'].forEach(id => {
        const el = document.getElementById(id); if (el) el.style.display = 'none';
    });
}

// --- Iniciativa ---
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
        document.getElementById('tela-raiz').style.display = 'grid';
    } else {
        document.getElementById('menu-personagem').style.display = 'block';
    }
};

function renderizarCardsIniciativa() {
    const container = document.getElementById('lista-iniciativa-cards');
    if (!container) return; 
    container.innerHTML = '';
    
    const ativos = personagens
        .filter(p => p.emIniciativa)
        .sort((a, b) => (parseInt(b.ini) || 0) - (parseInt(a.ini) || 0));
    
    if (ativos.length === 0) { 
        container.innerHTML = '<p style="text-align:center; font-size:12px; color:#666;">Nenhum personagem em iniciativa.</p>'; 
        return; 
    }

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

// --- Perícias Otimizadas ---
window.alterarExtraPericia = (nomePericia, valorExtra) => {
    const p = obterPersonagemAtual();
    if (!p || !p.pericias) return;
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    
    p.pericias[nomePericia].extra = parseInt(valorExtra) || 0;
    const total = (p.pericias[nomePericia].treino || 0) + p.pericias[nomePericia].extra;
    
    // Atualiza apenas o texto, sem reconstruir todo o HTML (evita perder foco do input)
    const totalElemento = document.getElementById(`total-${nomePericia}`);
    if (totalElemento) totalElemento.innerText = `( ${total} )`;
    
    salvarNoLocalStorage();
};

window.alterarTreinoPericia = (nomePericia, valorTreino) => {
    const p = obterPersonagemAtual();
    if (!p) return;
    if (!p.pericias) p.pericias = {};
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    
    p.pericias[nomePericia].treino = parseInt(valorTreino) || 0;
    renderizarPericias(); // Re-render é aceitável aqui pois é um dropdown
    salvarNoLocalStorage();
};

function renderizarPericias() {
    const container = document.getElementById('lista-pericias-container');
    if (!container) return; 
    container.innerHTML = '';
    const p = obterPersonagemAtual(); 
    if (!p) return;
    if (!p.pericias) p.pericias = {};
    
    LISTA_PERICIAS_BASE.forEach(peri => {
        const dadosSalvos = p.pericias[peri.nome] || { treino: 0, extra: 0 };
        const treino = dadosSalvos.treino || 0; 
        const extra = dadosSalvos.extra || 0; 
        const total = treino + extra;
        
        const itemRow = document.createElement('div'); 
        itemRow.className = `pericia-item-row p-treino-${treino}`;
        itemRow.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" onclick="abrirModalPericia('${peri.nome}')" style="cursor:pointer;">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 7v10l10 5V12L2 7zm20 0v10l-10 5V12l10-5z"/>
            </svg>
            <span class="p-nome">${peri.nome}</span>
            <span class="p-attr">( ${peri.attr.toUpperCase()} )</span>
            <span id="total-${peri.nome}">( ${total} )</span>
            <select class="pericia-select-ficha" onchange="alterarTreinoPericia('${peri.nome}', this.value)">
                <option value="0" ${treino === 0 ? 'selected' : ''}>0</option>
                <option value="5" ${treino === 5 ? 'selected' : ''}>5</option>
                <option value="10" ${treino === 10 ? 'selected' : ''}>10</option>
                <option value="15" ${treino === 15 ? 'selected' : ''}>15</option>
            </select>
            <input type="text" class="pericia-input-ficha" value="${extra}" oninput="alterarExtraPericia('${peri.nome}', this.value)" placeholder="0">
        `;
        container.appendChild(itemRow);
    });
}

// --- Outros ---
window.toggleModoEdicao = () => {
    const btn = document.getElementById('btn-toggle-atrib');
    const inputs = document.querySelectorAll('.input-editavel');
    if (!btn) return;
    
    if (btn.innerHTML.includes('Editar')) {
        btn.innerHTML = 'Salvar';
        btn.style.borderColor = '#22c55e';
        btn.style.color = '#22c55e';
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.classList.remove('input-travado');
        });
    } else {
        btn.innerHTML = 'Editar';
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
};

window.salvarAtributos = () => {
    const p = obterPersonagemAtual();
    if (!p) return;
    const agi = document.getElementById('at-agi'); if (agi) p.agi = agi.value;
    const intel = document.getElementById('at-int'); if (intel) p.int = intel.value;
    const vig = document.getElementById('at-vig'); if (vig) p.vig = vig.value;
    const pre = document.getElementById('at-pre'); if (pre) p.pre = pre.value;
    const forc = document.getElementById('at-for'); if (forc) p.forca = forc.value;
};

window.salvarExtras = () => {
    const p = obterPersonagemAtual();
    if (!p) return;
    const nex = document.getElementById('ext-nex'); if (nex) p.nex = nex.value.replace('%', '');
    const peTurno = document.getElementById('ext-pe-turno'); if (peTurno) p.peTurno = peTurno.value;
    const desloc = document.getElementById('ext-deslocamento'); if (desloc) p.deslocamento = desloc.value;
};

window.salvarExtrasDireto = (campo, valor) => {
    const p = obterPersonagemAtual();
    if (!p) return;
    p[campo] = valor;
    atualizarBarraVisual(campo);
    salvarNoLocalStorage();
};

function atualizarBarraVisual(campo) {
    const p = obterPersonagemAtual(); if (!p) return;
    let valor = String(p[campo] || "0 / 0");
    let partes = valor.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;
    let pct = max > 0 ? Math.min(100, Math.max(0, (atual / max) * 100)) : 0;
    
    let cor = "#991b1b"; let idElemento = "bar-vida";
    if (campo === 'san') { cor = "#6b21a8"; idElemento = "bar-sanidade"; }
    if (campo === 'pe') { cor = "#c2410c"; idElemento = "bar-esforco"; }
    
    const el = document.getElementById(idElemento);
    if (el) el.style.backgroundImage = `linear-gradient(to right, ${cor} ${Math.round(pct)}%, transparent ${Math.round(pct)}%)`;
}

window.ajustarStatus = (campo, delta) => {
    const p = obterPersonagemAtual(); if (!p) return;
    let valorAtual = String(p[campo] || "0 / 0");
    let partes = valorAtual.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;
    atual = Math.max(0, atual + delta);
    
    p[campo] = partes[1] ? `${atual} / ${max}` : `${atual}`;
    const inputId = campo === 'pv' ? 'bar-display-pv' : campo === 'san' ? 'bar-display-san' : 'bar-display-pe';
    const inputEl = document.getElementById(inputId);
    if (inputEl) inputEl.value = p[campo];
    atualizarBarraVisual(campo);
    salvarNoLocalStorage();
};

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
        document.getElementById('at-agi').value = p.agi || "0";
        document.getElementById('at-int').value = p.int || "0";
        document.getElementById('at-vig').value = p.vig || "0";
        document.getElementById('at-pre').value = p.pre || "0";
        document.getElementById('at-for').value = p.forca || "0";
        document.getElementById('ext-nex').value = String(p.nex || "0");
        document.getElementById('ext-pe-turno').value = p.peTurno || "0";
        document.getElementById('ext-deslocamento').value = p.deslocamento || "0m";
        document.getElementById('bar-display-pv').value = p.pv || "0 / 0";
        document.getElementById('bar-display-san').value = p.san || "0 / 0";
        document.getElementById('bar-display-pe').value = p.pe || "0 / 0";
        atualizarBarraVisual('pv'); atualizarBarraVisual('san'); atualizarBarraVisual('pe');
    } else if (idAba === 'aba-pericias') { renderizarPericias(); }
};

window.salvarDadosForm = () => {
    const p = obterPersonagemAtual(); if (!p) return;
    p.nome = document.getElementById('info-nome').value;
    p.jogador = document.getElementById('info-jogador').value;
    p.origem = document.getElementById('info-origem').value;
    p.classe = document.getElementById('info-classe').value;
    document.getElementById('nome-titulo-personagem').innerText = p.nome;
    salvarNoLocalStorage(); 
};

window.excluirPersonagemAtual = () => {
    const p = obterPersonagemAtual();
    if (!p || !confirm(`Excluir ${p.nome}?`)) return;
    personagens = personagens.filter(char => char.id !== p.id);
    salvarNoLocalStorage();
    window.mostrarListaPersonagens();
};

window.alternarIniciativa = (checked) => { 
    const p = obterPersonagemAtual(); 
    if (p) { p.emIniciativa = checked; salvarNoLocalStorage(); } 
};

window.atualizarDado = (id, campo, valor) => { 
    const p = personagens.find(c => c.id === id); 
    if (p) { p[campo] = valor; salvarNoLocalStorage(); } 
};

function renderizarListaPersonagens() {
    const container = document.getElementById('lista-botoes-personagens'); if (!container) return;
    container.innerHTML = '';
    personagens.forEach(p => {
        const btn = document.createElement('button'); btn.className = 'menu-btn'; btn.innerText = p.nome;
        btn.onclick = () => window.selecionarPersonagem(p.id); container.appendChild(btn);
    });
    const bNovo = document.createElement('button'); bNovo.className = 'menu-btn'; bNovo.innerText = '+ Novo';
    bNovo.onclick = () => { 
        personagens.push({ id: 'char_'+Date.now(), nome: 'Novo', agi:"0", int:"0", vig:"0", pre:"0", forca:"0", emIniciativa: false, nex: "0", peTurno: "0", deslocamento: "9m", pv: "20 / 20", san: "20 / 20", pe: "10 / 10", pericias: {} }); 
        salvarNoLocalStorage(); renderizarListaPersonagens(); 
    };
    container.appendChild(bNovo);
}

OBR.onReady(() => { OBR.action.setWidth(320); OBR.action.setHeight(530); });
