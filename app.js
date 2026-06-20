import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

// Lista de fichas da mesa (Começa com a Yuki selecionada por padrão)
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
        ini: "0", 
        emIniciativa: false 
    }
];

let idPersonagemSelecionado = "yuki"; // Yuki é o padrão ao abrir a extensão
let origemIniciativa = "raiz"; // Controla o destino do botão voltar ('raiz' ou 'menu-char')

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

// --- Atalho Único de Iniciativa ---
window.abrirIniciativa = function(vindoDe) {
    origemIniciativa = vindoDe; // Memoriza de qual tela o usuário clicou
    ocultarTodasTelas();
    document.getElementById('aba-iniciativa').style.display = 'block';
    
    // Carrega o card do personagem ativo na tela de iniciativa
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (p) {
        document.getElementById('char-name-display').value = p.nome;
        document.getElementById('char-pv').value = p.pv;
        document.getElementById('char-san').value = p.san;
        document.getElementById('char-pe').value = p.pe;
        document.getElementById('char-ini').value = p.ini;
    }
};

window.voltarDeIniciativa = function() {
    ocultarTodasTelas();
    if (origemIniciativa === 'raiz') {
        document.getElementById('tela-raiz').style.display = 'grid';
    } else {
        document.getElementById('menu-personagem').style.display = 'block';
    }
};

// --- Navegação Interna da Ficha ---
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

// --- Sincronização e Salvamento Automático de Inputs ---
window.salvarDadosIniciativa = function() {
    const p = personajes.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;
    p.nome = document.getElementById('char-name-display').value;
    p.pv = document.getElementById('char-pv').value;
    p.san = document.getElementById('char-san').value;
    p.pe = document.getElementById('char-pe').value;
    p.ini = document.getElementById('char-ini').value;
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

// --- Funções Auxiliares ---
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
            pv: "20 / 20", san: "20 / 20", pe: "5 / 5", ini: "0", emIniciativa: false 
        });
        renderizarListaPersonagens();
    };
    container.appendChild(btnNovo);
}

OBR.onReady(() => {
    OBR.action.setWidth(320);
    OBR.action.setHeight(250);
});
