import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

// Banco de dados simulado em memória
let personagens = [
    { 
        id: "yuki", 
        nome: "Yuki", 
        jogador: "Dionatan", 
        origem: "Policial", 
        classe: "Ocultista", 
        pv: "31 / 31", 
        san: "47 / 47", 
        pe: "41 / 49", 
        ini: "15", 
        emIniciativa: false 
    }
];

let idPersonagemSelecionado = "yuki"; 
let origemIniciativa = "raiz"; 

// --- Funções de Navegação de Telas ---
window.mostrarListaPersonagens = function() {
    ocultarTodasTelas();
    document.getElementById('tela-lista-personagens').style.display = 'block';
    renderizarListaPersonagens();
};

window.voltarParaRaiz = function() {
    ocultarTodasTelas();
    document.getElementById('tela-raiz').style.display = 'grid';
};

window.voltarParaLista = function() {
    window.mostrarListaPersonagens();
};

window.voltarParaMenuChar = function() {
    ocultarTodasTelas();
    document.getElementById('menu-personagem').style.display = 'block';
};

// --- Tela de Iniciativa Unificada (Gera a lista de cards originais) ---
window.abrirIniciativa = function(vindoDe) {
    origemIniciativa = vindoDe; 
    ocultarTodasTelas();
    document.getElementById('aba-iniciativa').style.display = 'block';
    renderizarCardsIniciativa();
};

window.voltarDeIniciativa = function() {
    ocultarTodasTelas();
    if (origemIniciativa === 'raiz') {
        document.getElementById('tela-raiz').style.display = 'grid';
    } else {
        document.getElementById('menu-personagem').style.display = 'block';
    }
};

// --- Renderiza os Cards Reais com Cores na Iniciativa ---
function renderizarCardsIniciativa() {
    const container = document.getElementById('lista-iniciativa-cards');
    container.innerHTML = '';

    // Filtra apenas quem está marcado com o checkbox e ordena por iniciativa (Maior para Menor)
    const ativos = personagens
        .filter(p => p.emIniciativa)
        .sort((a, b) => (parseInt(b.ini) || 0) - (parseInt(a.ini) || 0));

    if (ativos.length === 0) {
        container.innerHTML = '<p style="font-size:12px; color:#666; text-align:center; padding-top:15px;">Nenhum personagem na iniciativa.</p>';
        return;
    }

    ativos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        // Injeta a estrutura visual exata com os inputs funcionais e cores corretas
        card.innerHTML = `
            <div class="info-section">
                <input type="text" class="char-name" value="${p.nome}" oninput="atualizarDadoCombate('${p.id}', 'nome', this.value)">
                <div class="stats-row">
                    <input type="text" class="stat-pv" value="${p.pv}" oninput="atualizarDadoCombate('${p.id}', 'pv', this.value)">
                    <input type="text" class="stat-san" value="${p.san}" oninput="atualizarDadoCombate('${p.id}', 'san', this.value)">
                    <input type="text" class="stat-pe" value="${p.pe}" oninput="atualizarDadoCombate('${p.id}', 'pe', this.value)">
                </div>
            </div>
            <div>
                <input type="text" class="stat-ini" value="${p.ini}" oninput="atualizarDadoCombate('${p.id}', 'ini', this.value)" onblur="renderizarCardsIniciativa()">
            </div>
        `;
        container.appendChild(card);
    });
}

// Salva alterações feitas direto nos cards de iniciativa
window.atualizarDadoCombate = function(id, campo, valor) {
    const p = personagens.find(char => char.id === id);
    if (p) p[campo] = valor;
};

// --- Seleção de Personagem e Formulário ---
window.selecionarPersonagem = function(id) {
    idPersonagemSelecionado = id;
    ocultarTodasTelas();
    const p = personagens.find(char => char.id === id);
    document.getElementById('nome-titulo-personagem').innerText = p.nome;
    document.getElementById('menu-personagem').style.display = 'block';
};

window.abrirAbaChar = function(idAba) {
    ocultarTodasTelas();
    document.getElementById(idAba).style.display = 'block';
    
    if (idAba === 'aba-info') {
        const p = personagens.find(char => char.id === idPersonagemSelecionado);
        if (p) {
            document.getElementById('info-nome').value = p.nome;
            document.getElementById('info-jogador').value = p.jogador;
            document.getElementById('info-origem').value = p.origem;
            document.getElementById('info-classe').value = p.classe;
            document.getElementById('info-em-iniciativa').checked = p.emIniciativa;
        }
    }
};

window.salvarDadosForm = function() {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;
    p.nome = document.getElementById('info-nome').value;
    p.jogador = document.getElementById('info-jogador').value;
    p.origem = document.getElementById('info-origem').value;
    p.classe = document.getElementById('info-classe').value;
    document.getElementById('nome-titulo-personagem').innerText = p.nome;
};

window.alternarIniciativa = function(checked) {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (p) p.emIniciativa = checked;
};

// --- Auxiliares de Interface ---
function ocultarTodasTelas() {
    const telas = [
        'tela-raiz', 'tela-lista-personagens', 'menu-personagem', 'aba-iniciativa',
        'aba-info', 'aba-atrib', 'aba-pericias', 'aba-combate', 'aba-inv', 'aba-hab', 'aba-rituais'
    ];
    telas.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function renderizarListaPersonagens() {
    const container = document.getElementById('lista-botoes-personagens');
    container.innerHTML = '';
    
    personagens.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.innerText = p.nome;
        btn.onclick = () => window.selecionarPersonagem(p.id);
        container.appendChild(btn);
    });
    
    const btnNovo = document.createElement('button');
    btnNovo.className = 'menu-btn';
    btnNovo.style.borderColor = '#444';
    btnNovo.style.color = '#888';
    btnNovo.innerText = '+ Novo Personagem';
    btnNovo.onclick = () => {
        const novoId = 'char_' + Date.now();
        personagens.push({ 
            id: novoId, nome: 'Desconhecido', jogador: 'Jogador', origem: 'Mundano', classe: 'Nenhuma', 
            pv: "20 / 20", san: "20 / 20", pe: "5 / 5", ini: "10", emIniciativa: false 
        });
        renderizarListaPersonagens();
    };
    container.appendChild(btnNovo);
}

OBR.onReady(() => {
    OBR.action.setWidth(320);
    OBR.action.setHeight(250);
});
