// Variável para guardar as perícias da última origem selecionada
let periciasAutomaticasAtuais = [];

// Função principal que será chamada pelo HTML
function selecionarOrigem(nomeDaOrigem) {
    // Aqui assumimos que o seu JSON já foi carregado em uma variável chamada origensJson.
    const origemData = origensJson[nomeDaOrigem]; 
    
    // Se a origem não for encontrada ou se o jogador escolheu a opção vazia ("Escolha sua origem...")
    if (!origemData) return; 

    // 1. DESMARCA AS PERÍCIAS ANTIGAS
    periciasAutomaticasAtuais.forEach(pericia => {
        let idCheckbox = formatarIdPericia(pericia); 
        let checkbox = document.getElementById(idCheckbox);
        if (checkbox) {
            checkbox.checked = false; 
        }
    });

    periciasAutomaticasAtuais = []; // Limpa a lista

    // 2. VERIFICA O AMNÉSICO (Que tem 0 perícias cadastradas)
    if (origemData.pericias.length === 0) {
        alert("Como Amnésico, você deve marcar manualmente 2 perícias à sua escolha na ficha!");
        return; 
    }

    // 3. MARCA AS NOVAS PERÍCIAS
    origemData.pericias.forEach(pericia => {
        let idCheckbox = formatarIdPericia(pericia); 
        let checkbox = document.getElementById(idCheckbox);
        
        if (checkbox) {
            checkbox.checked = true; 
            periciasAutomaticasAtuais.push(pericia); 
        } else {
            console.warn("Caixinha de perícia não encontrada: " + idCheckbox);
        }
    });
}

// Transformar "Ciências" em "pericia-ciencias"
function formatarIdPericia(nome) {
    let nomeFormatado = nome.toLowerCase()
                            .normalize("NFD") 
                            .replace(/[\u0300-\u036f]/g, ""); 
    
    return "pericia-" + nomeFormatado; 
}
