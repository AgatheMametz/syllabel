function countSyllables(word) {
    if (!word) return 0;
    
    // Convertir le mot en minuscules
    word = word.toLowerCase();
    
    // Ignorer les terminaisons verbales en "ent"
    if (word.endsWith('ent')) {
        word = word.slice(0, -3) + 'e';  // On remplace par 'e' pour garder la sonorité
    }
    
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

function getRhyme(word) {
    if (!word) return '';
    
    // Nettoyer la ponctuation
    word = word.toLowerCase().replace(/[.,!?;:]/g, '');
    
    // Ignorer les terminaisons verbales en "ent"
    if (word.endsWith('ent')) {
        word = word.slice(0, -3) + 'e';
    }
    
    const vowels = 'aeiouyéèêëàâïîôûù';
    const chars = word.split('');
    let lastVowelIndex = -1;
    
    // Trouver la dernière voyelle
    for (let i = chars.length - 1; i >= 0; i--) {
        if (vowels.includes(chars[i])) {
            lastVowelIndex = i;
            break;
        }
    }
    
    if (lastVowelIndex === -1) return word.slice(-3);
    
    // Trouver la voyelle précédente (pour avoir le groupe complet)
    let previousVowelIndex = -1;
    for (let i = lastVowelIndex - 1; i >= 0; i--) {
        if (vowels.includes(chars[i])) {
            previousVowelIndex = i;
            break;
        }
    }
    
    // Si le mot est court, on prend tout le mot
    if (word.length <= 4) {
        return word;
    }
    
    // Prendre les 4 derniers caractères maximum
    return word.slice(-4);
}

// Interface utilisateur simple
function createSyllableCounter() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="editor-container">
            <div class="button-group">
                <button id="pasteButton" class="action-button paste-button">
                    <span class="paste-icon">📥</span>
                    Coller du texte
                </button>
                <button id="copyButton" class="action-button copy-button">
                    <span class="copy-icon">📋</span>
                    Copier le texte
                </button>
            </div>
            <div class="editor-wrapper">
                <div class="line-numbers"></div>
                <div class="text-editor" contenteditable="true" spellcheck="false"></div>
                <div class="analysis-column">
                    <div class="syllable-counts"></div>
                    <div class="rhyme-list"></div>
                </div>
            </div>
        </div>
    `;

    const editor = container.querySelector('.text-editor');
    const lineNumbers = container.querySelector('.line-numbers');
    const syllableCounts = container.querySelector('.syllable-counts');
    const rhymeList = container.querySelector('.rhyme-list');
    const copyButton = container.querySelector('#copyButton');
    const pasteButton = container.querySelector('#pasteButton');

    function updateAnalysis() {
        const lines = editor.innerText.split('\n');
        
        // Mise à jour des numéros de ligne
        lineNumbers.innerHTML = lines.map((_, i) => 
            `<div class="line-number">${i + 1}</div>`
        ).join('');

        // Mise à jour des analyses
        const syllableResults = lines.map(line => {
            // Ajouter une div vide avec la même hauteur pour les lignes vides
            if (!line.trim()) {
                return '<div class="syllable-count empty-line">&nbsp;</div>';
            }
            const words = line.trim().split(/\s+/);
            const count = words.reduce((total, word) => 
                total + (word ? countSyllables(word) : 0), 0);
            return `<div class="syllable-count" data-count="${count}">${count || ''}</div>`;
        }).join('');

        const rhymeResults = lines.map(line => {
            // Ajouter une div vide avec la même hauteur pour les lignes vides
            if (!line.trim()) {
                return '<div class="rhyme empty-line">&nbsp;</div>';
            }
            const words = line.trim().split(/\s+/);
            const lastWord = words[words.length - 1];
            const rhyme = lastWord ? getRhyme(lastWord) : '';
            return `<div class="rhyme" data-rhyme="${rhyme}">${rhyme}</div>`;
        }).join('');

        syllableCounts.innerHTML = syllableResults;
        rhymeList.innerHTML = rhymeResults;

        colorizeElements();
    }

    editor.addEventListener('input', updateAnalysis);
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertLineBreak');
            updateAnalysis();
        }
    });

    // Fonction pour coller du texte
    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            const lines = text.split('\n').filter(line => line.trim());
            
            // Supprimer toutes les lignes existantes
            editor.innerText = '';
            
            // Créer une nouvelle ligne pour chaque ligne du texte
            lines.forEach(line => {
                editor.innerText += line.trim() + '\n';
            });
            
            // Feedback visuel
            pasteButton.classList.add('pasted');
            pasteButton.textContent = '✓ Collé !';
            setTimeout(() => {
                pasteButton.classList.remove('pasted');
                pasteButton.innerHTML = '<span class="paste-icon">📥</span> Coller du texte';
            }, 2000);
            
        } catch (err) {
            console.error('Erreur lors du collage:', err);
        }
    });

    // Ajouter la fonction de copie
    copyButton.addEventListener('click', () => {
        const lines = Array.from(editor.children)
            .map(line => line.textContent.trim())
            .filter(text => text.length > 0)
            .join('\n');

        navigator.clipboard.writeText(lines).then(() => {
            copyButton.classList.add('copied');
            copyButton.textContent = '✓ Copié !';
            
            setTimeout(() => {
                copyButton.classList.remove('copied');
                copyButton.innerHTML = '<span class="copy-icon">📋</span> Copier le texte';
            }, 2000);
        });
    });

    function colorizeElements() {
        const colors = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#009688', '#673AB7'];
        
        // Coloriser les syllabes
        const syllableCounts = document.querySelectorAll('.syllable-count[data-count]');
        const syllableGroups = {};
        
        syllableCounts.forEach(el => {
            const count = el.dataset.count;
            if (count) {
                if (!syllableGroups[count]) {
                    syllableGroups[count] = [];
                }
                syllableGroups[count].push(el);
            }
        });

        Object.values(syllableGroups).forEach((group, i) => {
            if (group.length > 1) {
                const color = colors[i % colors.length];
                group.forEach(el => el.style.color = color);
            }
        });

        // Coloriser les rimes
        const rhymes = document.querySelectorAll('.rhyme[data-rhyme]');
        const rhymeGroups = {};
        
        rhymes.forEach(el => {
            const rhyme = el.dataset.rhyme;
            if (rhyme) {
                if (!rhymeGroups[rhyme]) {
                    rhymeGroups[rhyme] = [];
                }
                rhymeGroups[rhyme].push(el);
            }
        });

        Object.values(rhymeGroups).forEach((group, i) => {
            if (group.length > 1) {
                const color = colors[i % colors.length];
                group.forEach(el => el.style.color = color);
            } else {
                group.forEach(el => el.style.color = ''); // Réinitialiser la couleur pour les rimes uniques
            }
        });
    }

    document.body.appendChild(container);
}

// Initialiser le compteur
createSyllableCounter(); 