import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

// Banco de dados simulado em memória contendo a ficha da Yuki e permitindo novos cadastros
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
        ini: "18", 
        emIniciativa: false 
    }
];

let idPersonagemSelecionado = null;

// Funções de Navegação e Fluxo Global
window.mostrarListaPersonagens = function() {
    ocultarTodasTelas();
    document.getElementById('tela-lista-personagens').style.display = 'block';
    renderizarListaPersonagens();
};

window.mostrarIniciativaGeral = function() {
    ocultarTodasTelas();
    document.getElementById('tela-iniciativa-geral').style.display = 'block';
    renderizarIniciativaGeral();
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

// Seleção de um personagem específico
window.selecionarPersonagem = function(id) {
    idPersonagemSelecionado = id;
    ocultarTodasTelas();
    const p = personagens.find(char => char.id === id);
    document.getElementById('nome-titulo-personagem').innerText = p.nome;
    document.getElementById('menu-personagem').style.display = 'block';
};

// Carrega os dados correspondentes ao abrir as abas de Informações ou Iniciativa Individual
window.abrirAbaChar = function(idAba) {
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
    } else if (idAba === 'aba-ini-individual') {
        document.getElementById('card-nome-display').innerText = p.nome;
        document.getElementById('char-pv').value = p.pv;
        document.getElementById('char-san').value = p.san;
        document.getElementById('char-pe').value = p.pe;
        document.getElementById('char-ini').value = p.ini;
    }
};

// Salva as alterações feitas nos inputs direto no banco de dados do personagem
window.salvarDados = function() {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (!p) return;

    if (document.getElementById('aba-info').style.display === 'block') {
        p.nome = document.getElementById('info-nome').value;
        p.jogador = document.getElementById('info-jogador').value;
        p.origem = document.getElementById('info-origem').value;
        p.classe = document.getElementById('info-classe').value;
        document.getElementById('nome-titulo-personagem').innerText = p.nome;
    }
    if (document.getElementById('aba-ini-individual').style.display === 'block') {
        p.pv = document.getElementById('char-pv').value;
        p.san = document.getElementById('char-san').value;
        p.pe = document.getElementById('char-pe').value;
        p.ini = document.getElementById('char-ini').value;
    }
};

// Controla a entrada e saída do personagem do combate global
window.alternarIniciativa = function(checked) {
    const p = personagens.find(char => char.id === idPersonagemSelecionado);
    if (p) p.emIniciativa = checked;
};

// Limpa a tela ocultando todas as camadas visuais
function ocultarTodasTelas() {
    const telas = [
        'tela-raiz', 'tela-lista-personagens', 'menu-personagem', 'tela-iniciativa-geral',
        'aba-info', 'aba-ini-individual', 'aba-atrib', 'aba-pericias', 'aba-combate', 'aba-inv', 'aba-hab', 'aba-rituais'
    ];
    telas.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// Renderiza os botões dinâmicos dos personagens existentes
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
    
    // Botão auxiliar para injetar novos personagens à sua campanha
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

// Renderiza a lista do Combate Geral filtrando os marcados e organizando pelo valor numérico da iniciativa
function renderizarIniciativaGeral() {
    const container = document.getElementById('lista-iniciativa-geral');
    container.innerHTML = '';
    
    const ativos = personagens
        .filter(p => p.emIniciativa)
        .sort((a, b) => (parseInt(b.ini) || 0) - (parseInt(a.ini) || 0));

    if (ativos.length === 0) {
        container.innerHTML = '<p style="font-size:12px; color:#666; text-align:center; padding-top:15px;">Nenhum personagem na iniciativa no momento.</p>';
        return;
    }

    ativos.forEach(p => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.backgroundColor = '#111';
        row.style.padding = '8px 12px';
        row.style.borderRadius = '6px';
        row.style.borderLeft = '4px solid #a855f7';

        row.innerHTML = `
            <div>
                <span style="font-weight:bold; font-size:13px; color:white;">${p.nome}</span>
                <div style="font-size:10px; color:#aaa; margin-top:2px;">PV: ${p.pv} | SAN: ${p.san} | PE: ${p.pe}</div>
            </div>
            <div style="font-size:20px; font-weight:bold; color:white; border-bottom:1px solid white; width:30px; text-align:center;">${p.ini}</div>
        `;
        container.appendChild(row);
    });
}

OBR.onReady(() => {
    // Redimensionado ligeiramente para comportar os novos formulários e listas com folga
    OBR.action.setWidth(320);
    OBR.action.setHeight(250);
});
