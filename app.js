import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

let personagens = [
    { 
        id: "yuki", nome: "Yuki", jogador: "Dionatan", origem: "Policial", classe: "Ocultista", 
        pv: "24 / 24", san: "47 / 47", pe: "20 / 28", ini: "0", emIniciativa: false,
        agi: "3", int: "4", vig: "2", pre: "3", forca: "1",
        nex: "35%", peTurno: "7", deslocamento: "12 m / 8 q"
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

// --- Salvamento dos Novos Campos Extras ---
window.salvarExtras = () => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (p) {
        p.nex = document.getElementById('ext-nex').value;
        p.peTurno = document.getElementById('ext-pe-turno').value;
        p.deslocamento = document.getElementById('ext-deslocamento').value;
    }
};

window.salvarExtrasDireto = (campo, valor) => {
    const p = personnages.find(char => char.id === idPersonagemSelecionado);
    if (p) {
        p[campo] = valor;
    }
};

// --- Lógica Interativa dos botões << < > >> das barras ---
window.ajustarStatus = (campo, delta) => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;

    let valorAtual = p[campo] || "0 / 0";
    let partes = valorAtual.split('/');
    let atual = parseInt(partes[0]) || 0;
    let max = partes[1] ? (parseInt(partes[1]) || 0) : atual;

    if (delta === 'min') {
        atual = 0;
    } else if (delta === 'max') {
        atual = max;
    } else {
        atual = atual + delta;
    }

    if (atual < 0) atual = 0;

    // Salva de volta no formato "X / Y" ou só "X" se não tiver barra
    p[campo] = partes[1] ? `${atual} / ${max}` : `${atual}`;
    
    // Atualiza o input visual na hora
    let inputId = campo === 'pv' ? 'bar-display-pv' : campo === 'san' ? 'bar-display-san' : 'bar-display-pe';
    document.getElementById(inputId).value = p[campo];
};

window.abrirAbaChar = (idAba) => {
    ocultarTodasTelas();
    document.getElementById(idAba).style.display = 'block';
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;

    if (idAba === 'aba-info') {
        document.getElementById('info-nome').value = p.nome;
        document.getElementById('info-jogador').value = p.jogador;
        document.getElementById('info-origem').value = p.origem;
        document.getElementById('info-classe').value = p.classe;
        document.getElementById('info-em-iniciativa').checked = p.emIniciativa;
    } else if (idAba === 'aba-atrib') {
        // Carrega atributos
        document.getElementById('at-agi').value = p.agi;
        document.getElementById('at-int').value = p.int;
        document.getElementById('at-vig').value = p.vig;
        document.getElementById('at-pre').value = p.pre;
        document.getElementById('at-for').value = p.forca;
        
        // Carrega novos campos extras
        document.getElementById('ext-nex').value = p.nex || "0%";
        document.getElementById('ext-pe-turno').value = p.peTurno || "0";
        document.getElementById('ext-deslocamento').value = p.deslocamento || "0m";
        document.getElementById('bar-display-pv').value = p.pv || "0 / 0";
        document.getElementById('bar-display-san').value = p.san || "0 / 0";
        document.getElementById('bar-display-pe').value = p.pe || "0 / 0";
    }
};

// --- Formulários e Cards ---
window.salvarDadosForm = () => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;
    p.nome = document.getElementById('info-nome').value;
    p.jogador = document.getElementById('info-jogador').value;
    p.origem = document.getElementById('info-origem').value;
    p.classe = document.getElementById('info-classe').value;
    document.getElementById('nome-titulo-personagem').innerText = p.nome;
};

window.alternarIniciativa = (checked) => {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
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
            nex: "0%", peTurno: "0", deslocamento: "9m", pv: "20 / 20", san: "20 / 20", pe: "10 / 10"
        }); 
        renderizarListaPersonagens(); 
    };
    container.appendChild(bNovo);
}

// Configuração do tamanho da janela ajustado para os novos elementos
OBR.onReady(() => { 
    OBR.action.setWidth(320); 
    OBR.action.setHeight(530); /* Expandido para caber a imagem + novos campos extras */
});
