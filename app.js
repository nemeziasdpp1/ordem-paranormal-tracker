// Importamos o SDK do Owlbear Rodeo direto da internet
import OBR from "https://esm.sh/@owlbear-rodeo/sdk";

// OBR.onReady garante que o código só rode quando a mesa terminar de carregar
OBR.onReady(() => {
    console.log("Extensão de Status carregada com sucesso!");
    
    // Configura o tamanho ideal da janela no Owlbear Rodeo
    OBR.action.setWidth(300);
    OBR.action.setHeight(450);
});
