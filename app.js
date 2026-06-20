import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

// Lista imutável de perícias oficiais e seus respectivos atributos base
const LISTA_PERICIAS_BASE = [
    { nome: "Acrobacia", attr: "agi" },
    { nome: "Adestramento", attr: "pre" },
    { nome: "Atletismo", attr: "forca" },
    { nome: "Atualidades", attr: "int" },
    { nome: "Ciência", attr: "int" },
    { nome: "Crime", attr: "agi" },
    { nome: "Diplomacia", attr: "pre" },
    { nome: "Enganação", attr: "pre" },
    { nome: "Fortitude", attr: "vig" },
    { nome: "Furtividade", attr: "agi" },
    { nome: "Iniciativa", attr: "agi" },
    { nome: "Intuição", attr: "pre" },
    { nome: "Investigação", attr: "int" },
    { nome: "Luta", attr: "forca" },
    { nome: "Medicina", attr: "int" },
    { nome: "Ocultismo", attr: "int" },
    { nome: "Percepção", attr: "pre" },
    { nome: "Pilotagem", attr: "agi" },
    { nome: "Pontaria", attr: "agi" },
    { nome: "Profissão", attr: "int" },
    { nome: "Reflexos", attr: "agi" },
    { nome: "Religião", attr: "int" },
    { nome: "Sobrevivência", attr: "int" },
    { nome: "Tática", attr: "int" },
    { nome: "Tecnologia", attr: "int" },
    { nome: "Vontade", attr: "pre" }
];

let personagens = [
    { 
        id: "yuki", nome: "Yuki", jogador: "Dionatan", origem: "Policial", classe: "Ocultista", 
        pv: "24 / 24", san: "47 / 47", pe: "20 / 28", ini: "0", emIniciativa: false,
        agi: "3", int: "4", vig: "2", pre: "3", forca: "1",
        nex: "35", peTurno: "7", deslocamento: "12 m / 8 q",
        pericias: {} // Estrutura para salvar treinamentos customizados
    }
];

let idPersonagemSelecionado = "yuki"; 
let origemIniciativa = "raiz"; 

// --- Navegação ---
window.mostrarListaPersonagens = () => { ocultarTodasTelas(); document.getElementById('tela-lista-personagens').style.display = 'block'; renderizarListaPersonagens(); };
window.voltarParaRaiz = () => { ocultarTodasTelas(); document.getElementById('tela-raiz').style.display = 'grid'; };
window.voltarParaLista = () => window.mostrarListaPersonagens();
window.voltarParaMenuChar = () => { ocultarTodasTelas(); document.getElementById('menu-personagem').style.display = 'block'; };

window.abrirIniciativa = (vindoDe) => {
    origemIniciativa = vindoDe; 
    ocultarTodasTelas();
    document.getElementById('aba-iniciativa').style.display = 'block';
    renderizarCardsIniciativa();
};

window.voltarDeIniciativa = () => {
    ocultarTodasTelas();
    if (origemIniciativa === 'raiz') document.getElementById('tela-raiz').style.display = 'grid';
    else document.getElementById('menu-personagem').style.display = 'block';
};

// --- Atributos ---
window.salvarAtributos = () => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (p) {
        p.agi = document.getElementById('at-agi').value;
        p.int = document.getElementById('at-int').value;
        p.vig = document.getElementById('at-vig').value;
        p.pre = document.getElementById('at-pre').value;
        p.forca = document.getElementById('at-for').value;
    }
};

window.salvarExtras = () => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (p) {
        p.nex = document.getElementById('ext-nex').value.replace('%', '');
        p.peTurno = document.getElementById('ext-pe-turno').value;
        p.deslocamento = document.getElementById('ext-deslocamento').value;
    }
};

window.salvarExtrasDireto = (campo, valor) => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (p) {
        p[campo] = valor;
        atualizarBarraVisual(campo);
    }
};

function atualizarBarraVisual(campo) {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;

    let valor = p[campo] || "0 / 0";
    let partes = valor.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;

    let pct = max > 0 ? Math.min(100, Math.max(0, (atual / max) * 100)) : 0;
    pct = Math.round(pct); 

    let cor = "#991b1b"; 
    let idElemento = "bar-vida";
    
    if (campo === 'san') { cor = "#6b21a8"; idElemento = "bar-sanidade"; }
    if (campo === 'pe') { cor = "#c2410c"; idElemento = "bar-esforco"; }

    const el = document.getElementById(idElemento);
    if (el) {
        el.style.backgroundImage = `linear-gradient(to right, ${cor} ${pct}%, transparent ${pct}%)`;
    }
}

window.ajustarStatus = (campo, delta) => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;

    let valorAtual = p[campo] || "0 / 0";
    let partes = valorAtual.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;

    atual = atual + delta;
    if (atual < 0) atual = 0;

    p[campo] = partes[1] ? `${atual} / ${max}` : `${atual}`;
    
    let inputId = campo === 'pv' ? 'bar-display-pv' : campo === 'san' ? 'bar-display-san' : 'bar-display-pe';
    document.getElementById(inputId).value = p[campo];

    atualizarBarraVisual(campo);
};

// --- Lógica de Perícias ---
window.alterarTreinoPericia = (nomePericia, valorTreino) => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;
    if (!p.pericias) p.pericias = {};
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    
    p.pericias[nomePericia].treino = parseInt(valorTreino) || 0;
    renderizarPericias(); // Recarrega para computar totais e cores visuais
};

window.alterarExtraPericia = (nomePericia, valorExtra) => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;
    if (!p.pericias) p.pericias = {};
    if (!p.pericias[nomePericia]) p.pericias[nomePericia] = { treino: 0, extra: 0 };
    
    p.pericias[nomePericia].extra = parseInt(valorExtra) || 0;
    
    // Atualiza o total diretamente na tela sem remontar o HTML inteiro (melhor performance ao digitar)
    const treino = p.pericias[nomePericia].treino || 0;
    const totalElemento = document.getElementById(`total-${nomePericia}`);
    if (totalElemento) {
        const soma = treino + (parseInt(valorExtra) || 0);
        totalElemento.innerText = soma >= 0 ? `+${soma}` : soma;
    }
};

function renderizarPericias() {
    const container = document.getElementById('lista-pericias-container');
    if (!container) return;
    container.innerHTML = '';

    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;
    if (!p.pericias) p.pericias = {};

    LISTA_PERICIAS_BASE.forEach(peri => {
        // Pega o dado bruto baseado no atributo vinculado
        const numDados = p[peri.attr] || "0";
        
        // Recupera valores salvos do personagem ou define o padrão
        const dadosSalvos = p.pericias[peri.nome] || { treino: 0, extra: 0 };
        const treino = dadosSalvos.treino || 0;
        const extra = dadosSalvos.extra || 0;
        const total = treino + extra;

        const isTreinada = treino > 0;
        const rowClass = isTreinada ? 'pericia-row treinada' : 'pericia-row';

        const row = document.createElement('div');
        row.className = rowClass;
        row.innerHTML = `
            <div class="pericia-info">
                <span class="pericia-nome">${peri.nome}</span>
                <span class="pericia-dados">${numDados}d20 (${peri.attr.toUpperCase()})</span>
            </div>
            <select class="pericia-select" onchange="alterarTreinoPericia('${peri.nome}', this.value)">
                <option value="0" ${treino === 0 ? 'selected' : ''}>-</option>
                <option value="5" ${treino === 5 ? 'selected' : ''}>+5 T</option>
                <option value="10" ${treino === 10 ? 'selected' : ''}>+10 V</option>
                <option value="15" ${treino === 15 ? 'selected' : ''}>+15 E</option>
            </select>
            <input type="text" class="pericia-bonus-extra" value="${extra}" oninput="alterarExtraPericia('${peri.nome}', this.value)" placeholder="0">
            <span class="pericia-total" id="total-${peri.nome}">${total >= 0 ? '+' : ''}${total}</span>
        `;
        container.appendChild(row);
    });
}

window.abrirAbaChar = (idAba) => {
    ocultarTodasTelas();
    document.getElementById(idAba).style.display = 'block';
    const p = personajes.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;

    if (idAba === 'aba-info') {
        document.getElementById('info-nome').value = p.nome;
        document.getElementById('info-jogador').value = p.jogador;
        document.getElementById('info-origem').value = p.origem;
        document.getElementById('info-classe').value = p.classe;
        document.getElementById('info-em-iniciativa').checked = p.emIniciativa;
    } else if (idAba === 'aba-atrib') {
        document.getElementById('at-agi').value = p.agi;
        document.getElementById('at-int').value = p.int;
        document.getElementById('at-vig').value = p.vig;
        document.getElementById('at-pre').value = p.pre;
        document.getElementById('at-for').value = p.forca;
        
        document.getElementById('ext-nex').value = (p.nex || "0").replace('%', '');
        document.getElementById('ext-pe-turno').value = p.peTurno || "0";
        document.getElementById('ext-deslocamento').value = p.deslocamento || "0m";
        document.getElementById('bar-display-pv').value = p.pv || "0 / 0";
        document.getElementById('bar-display-san').value = p.san || "0 / 0";
        document.getElementById('bar-display-pe').value = p.pe || "0 / 0";

        atualizarBarraVisual('pv');
        atualizarBarraVisual('san');
        atualizarBarraVisual('pe');
    } else if (idAba === 'aba-pericias') {
        renderizarPericias();
    }
};

// --- Formulários e Cards (Mantidos) ---
window.salvarDadosForm = () => {
    const p = personajes.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;
    p.nome = document.getElementById('info-nome').value;
    p.jogador = document.getElementById('info-jogador').value;
    p.origem = document.getElementById('info-origem').value;
    p.classe = document.getElementById('info-classe').value;
    document.getElementById('nome-titulo-personagem').innerText = p.nome;
};

window.alternarIniciativa = (checked) => {
    const p = personajes.find(char => char.id === idPersonagemSelecionado);
    if (p) p.emIniciativa = checked;
};

window.selecionarPersonagem = (id) => {
    idPersonagemSelecionado = id;
    ocultarTodasTelas();
    const p = personagens.find(char => char.id === id);
    document.getElementById('nome-titulo-personagem').innerText = p.nome;
    document.getElementById('menu-personagem').style.display = 'block';
};

function renderizarCardsIniciativa() {
    const container = document.getElementById('lista-iniciativa-cards');
    container.innerHTML = '';
    const ativos = personagens.filter(p => p.emIniciativa).sort((a, b) => (parseInt(b.ini) || 0) - (parseInt(a.ini) || 0));
    if (ativos.length === 0) { container.innerHTML = '<p style="text-align:center; font-size:12px; color:#666;">Vazio.</p>'; return; }
    ativos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'character-card';
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
    const container = document.getElementById('lista-botoes-personagens');
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

OBR.onReady(() => { 
    OBR.action.setWidth(320); 
    OBR.action.setHeight(530); 
});
