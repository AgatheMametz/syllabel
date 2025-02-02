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
    word = word.toLowerCase();
    
    // Ignorer les terminaisons verbales en "ent"
    if (word.endsWith('ent')) {
        word = word.slice(0, -3) + 'e';  // On remplace par 'e' pour garder la sonorité
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
            <div id="analysis"></div>
        </div>
    `;

    const analysis = container.querySelector('#analysis');
    const copyButton = container.querySelector('#copyButton');
    const pasteButton = container.querySelector('#pasteButton');

    // Fonction pour coller du texte
    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            const lines = text.split('\n').filter(line => line.trim());
            
            // Supprimer toutes les lignes existantes
            analysis.innerHTML = '';
            
            // Créer une nouvelle ligne pour chaque ligne du texte
            lines.forEach(line => {
                createNewLine(line.trim());
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
        const lines = Array.from(analysis.querySelectorAll('.line-text'))
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

    function updateColors() {
        const lines = Array.from(analysis.children);
        const rhymeGroups = {};
        const syllableGroups = {};

        // Grouper par rimes et syllabes
        lines.forEach(line => {
            const rhyme = line.querySelector('.rhyme').textContent;
            const syllables = line.querySelector('.syllable-count').textContent;
            if (rhyme) {
                rhymeGroups[rhyme] = (rhymeGroups[rhyme] || []);
                rhymeGroups[rhyme].push(line.querySelector('.rhyme'));
            }
            syllableGroups[syllables] = (syllableGroups[syllables] || []);
            syllableGroups[syllables].push(line.querySelector('.syllable-count'));
        });

        // Assigner les couleurs
        const colors = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0'];
        Object.values(rhymeGroups).forEach((group, i) => {
            if (group.length > 1) {
                const color = colors[i % colors.length];
                group.forEach(el => el.style.color = color);
            }
        });

        Object.values(syllableGroups).forEach((group, i) => {
            if (group.length > 1) {
                const color = colors[i % colors.length];
                group.forEach(el => el.style.color = color);
            }
        });
    }

    function createNewLine(initialText = '', insertAfter = null) {
        const div = document.createElement('div');
        div.className = 'line-analysis';
        div.innerHTML = `
            <span class="line-number"></span>
            <span class="line-text" contenteditable="true" placeholder="Écrivez ici...">${initialText}</span>
            <span class="syllable-count"></span>
            <span class="rhyme"></span>
        `;
        
        const lineText = div.querySelector('.line-text');
        const syllableCount = div.querySelector('.syllable-count');
        const rhymeSpan = div.querySelector('.rhyme');
        const lineNumber = div.querySelector('.line-number');

        function updateLineNumbers() {
            let currentNumber = 1;
            Array.from(analysis.children).forEach(line => {
                const text = line.querySelector('.line-text').textContent.trim();
                const numberSpan = line.querySelector('.line-number');
                if (text) {
                    numberSpan.textContent = currentNumber++;
                } else {
                    numberSpan.textContent = '';
                }
            });
        }

        lineText.addEventListener('input', () => {
            const text = lineText.textContent.trim();
            const words = text.split(/\s+/);
            
            if (!text) {
                syllableCount.textContent = '';
                rhymeSpan.textContent = '';
                div.classList.remove('has-content');
            } else {
                const syllables = words.reduce((total, word) => {
                    return total + (word ? countSyllables(word) : 0);
                }, 0);
                
                const lastWord = words[words.length - 1];
                const rhyme = lastWord ? getRhyme(lastWord) : '';
                
                syllableCount.textContent = syllables;
                rhymeSpan.textContent = rhyme;
                div.classList.add('has-content');
            }
            
            updateLineNumbers();
            updateColors();
            checkGrouping();
        });

        lineText.addEventListener('keydown', (e) => {
            const currentLine = div;
            if (e.key === 'Enter') {
                e.preventDefault();
                // Insérer la nouvelle ligne après la ligne courante
                const nextLine = currentLine.nextElementSibling;
                const newLine = createNewLine('', currentLine);
                if (nextLine) {
                    analysis.insertBefore(newLine, nextLine);
                } else {
                    analysis.appendChild(newLine);
                }
                // Focus sur la nouvelle ligne
                newLine.querySelector('.line-text').focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = currentLine.previousElementSibling;
                if (prev) {
                    prev.querySelector('.line-text').focus();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = currentLine.nextElementSibling;
                if (next) {
                    next.querySelector('.line-text').focus();
                } else {
                    createNewLine();
                }
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!lineText.textContent.trim()) {
                    e.preventDefault();
                    const next = currentLine.nextElementSibling;
                    const prev = currentLine.previousElementSibling;
                    currentLine.remove();
                    if (next) {
                        next.querySelector('.line-text').focus();
                    } else if (prev) {
                        prev.querySelector('.line-text').focus();
                    }
                    updateLineNumbers();
                    checkGrouping();
                }
            }
        });

        // Si insertAfter est spécifié, insérer après cet élément
        if (insertAfter) {
            const nextLine = insertAfter.nextElementSibling;
            if (nextLine) {
                analysis.insertBefore(div, nextLine);
            } else {
                analysis.appendChild(div);
            }
        } else {
            analysis.appendChild(div);
        }

        lineText.focus();

        if (initialText) {
            lineText.dispatchEvent(new Event('input'));
        }

        return div;
    }

    function checkGrouping() {
        const lines = Array.from(analysis.children);
        lines.forEach((line, index) => {
            const text = line.querySelector('.line-text').textContent.trim();
            const nextLine = lines[index + 1];
            
            if (nextLine) {
                const nextText = nextLine.querySelector('.line-text').textContent.trim();
                if (text && nextText) {
                    line.classList.add('group-with-next');
                } else {
                    line.classList.remove('group-with-next');
                }
            } else {
                line.classList.remove('group-with-next');
            }
        });
    }

    // Créer la première ligne
    createNewLine();
    
    document.body.appendChild(container);
}

// Initialiser le compteur
createSyllableCounter(); 