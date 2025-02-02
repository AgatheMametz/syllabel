function countSyllables(word) {
    // Convertir le mot en minuscules
    word = word.toLowerCase();
    
    // Définir les voyelles en français
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'é', 'è', 'ê', 'ë', 'à', 'â', 'ï', 'î', 'ô', 'û', 'ù'];
    
    // Compter les groupes de voyelles
    let count = 0;
    let isLastCharVowel = false;
    
    for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i]);
        
        if (isVowel && !isLastCharVowel) {
            count++;
        }
        
        isLastCharVowel = isVowel;
    }
    
    // Gérer le 'e' muet à la fin
    if (word.endsWith('e') && count > 1) {
        count--;
    }
    
    return count;
}

// Interface utilisateur simple
function createSyllableCounter() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div style="padding: 20px;">
            <input type="text" id="wordInput" placeholder="Entrez un mot" style="padding: 5px;">
            <div id="result" style="margin-top: 10px;">Nombre de syllabes : 0</div>
        </div>
    `;

    const input = container.querySelector('#wordInput');
    const result = container.querySelector('#result');

    input.addEventListener('input', (e) => {
        const word = e.target.value;
        const syllables = countSyllables(word);
        result.textContent = `Nombre de syllabes : ${syllables}`;
    });

    document.body.appendChild(container);
}

// Initialiser le compteur
createSyllableCounter(); 