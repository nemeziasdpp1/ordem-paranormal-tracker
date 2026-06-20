import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

// Torna a função de abrir abas visível para os botões do HTML
window.abrirAba = function(idAba) {
    // Esconde a grade do menu principal
    document.getElementById('menu-principal').style.display = 'none';
    
    // Exibe a aba de conteúdo que foi selecionada
    document.getElementById(idAba).style.display = 'block';
};

// Torna a função de voltar ao menu visível para os botões do HTML
window.voltarParaMenu = function() {
    // Localiza todas as abas de conteúdo abertas e esconde-as
    const abas = document.getElementsByClassName('aba-conteudo');
    for (let aba of abas) {
        aba.style.display = 'none';
    }
    
    // Reexibe a grade do menu principal
    document.getElementById('menu-principal').style.display = 'grid';
};

OBR.onReady(() => {
    // Define dimensões ideais para a janela acomodar o menu com folga
    OBR.action.setWidth(320);
    OBR.action.setHeight(220);
});
