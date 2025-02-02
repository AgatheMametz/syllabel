// Gestion de l'interface utilisateur
function createEditor() {
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

    document.body.appendChild(container);
    return { editor, lineNumbers, syllableCounts, rhymeList, copyButton, pasteButton };
}

function updateAnalysis(elements) {
    const { editor, lineNumbers, syllableCounts, rhymeList } = elements;
    const lines = editor.innerText.split('\n');
    
    // Mise à jour des numéros de ligne
    lineNumbers.innerHTML = lines.map((_, i) => 
        `<div class="line-number">${i + 1}</div>`
    ).join('');

    // Mise à jour des analyses
    const syllableResults = lines.map(line => {
        if (!line.trim()) {
            return '<div class="syllable-count empty-line">&nbsp;</div>';
        }
        const words = line.trim().split(/\s+/);
        const count = words.reduce((total, word) => 
            total + (word ? countSyllables(word) : 0), 0);
        return `<div class="syllable-count" data-count="${count}">${count || ''}</div>`;
    }).join('');

    // Extraire tous les derniers mots
    const lastWords = lines.map(line => {
        if (!line.trim()) return null;
        const lastWord = line.trim()
            .replace(/\s+[!?]/g, '')  // Gérer les espaces avant ! et ?
            .split(/\s+/)
            .pop();
        const cleanWord = lastWord ? lastWord.replace(/[.,!?;:\s]/g, '') : '';
        return cleanWord ? getRhyme(cleanWord).word : null;
    }).filter(w => w);

    // Trouver les groupes de rimes
    const rhymeGroups = findCommonEndings(lastWords);

    // Générer le HTML des rimes
    const rhymeResults = lines.map(line => {
        if (!line.trim()) {
            return '<div class="rhyme empty-line">&nbsp;</div>';
        }
        
        const lastWord = line.trim()
            .replace(/\s+[!?]/g, '')  // Gérer les espaces avant ! et ?
            .split(/\s+/)
            .pop();
        const cleanWord = lastWord ? lastWord.replace(/[.,!?;:\s]/g, '') : '';
        if (!cleanWord) return '<div class="rhyme empty-line">&nbsp;</div>';
        
        const processedWord = getRhyme(cleanWord).word;
        
        // Trouver le groupe de rime correspondant
        const group = rhymeGroups.find(g => g.words.includes(processedWord));
        
        if (group) {
            const rich = processedWord.slice(0, -group.common.length);
            return `<div class="rhyme" data-rhyme="${group.common}">
                <span class="rich-part">${rich}</span><span class="common-part">${group.common}</span>
            </div>`;
        } else {
            return `<div class="rhyme">
                <span class="rich-part">${processedWord}</span>
            </div>`;
        }
    }).join('');

    syllableCounts.innerHTML = syllableResults;
    rhymeList.innerHTML = rhymeResults;

    colorizeElements();
}

function colorizeElements() {
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
        } else {
            group.forEach(el => el.style.color = '#2196F3');
        }
    });

    // Coloriser les rimes communes
    const rhymes = document.querySelectorAll('.rhyme');
    const rhymeGroups = {};
    
    rhymes.forEach(el => {
        const rhyme = el.dataset.rhyme;
        if (rhyme && rhyme.trim()) {
            if (!rhymeGroups[rhyme]) {
                rhymeGroups[rhyme] = [];
            }
            rhymeGroups[rhyme].push(el);
        }
    });

    // Réinitialiser toutes les couleurs d'abord
    rhymes.forEach(el => {
        const richPart = el.querySelector('.rich-part');
        const commonPart = el.querySelector('.common-part');
        if (richPart) richPart.style.color = '#666';
        if (commonPart) commonPart.style.color = '#666';
    });

    // Appliquer les couleurs aux groupes
    Object.values(rhymeGroups).forEach((group, i) => {
        if (group.length > 1) {
            const color = colors[i % colors.length];
            group.forEach(el => {
                const commonPart = el.querySelector('.common-part');
                if (commonPart) {
                    commonPart.style.color = color;
                    commonPart.style.fontWeight = 'bold';
                }
            });
        }
    });
}

function setupEventListeners(elements) {
    const { editor, copyButton, pasteButton } = elements;

    editor.addEventListener('input', () => updateAnalysis(elements));
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertLineBreak');
            updateAnalysis(elements);
        }
    });

    // Permettre le collage direct mais nettoyer le texte
    editor.addEventListener('paste', (e) => {
        e.preventDefault();
        
        // Récupérer uniquement le texte brut du presse-papiers
        const text = e.clipboardData.getData('text/plain');
        
        // Nettoyer le texte en conservant les lignes vides
        const cleanText = text
            .split('\n')
            .map(line => {
                if (!line.trim()) return '';  // Conserver les lignes vides
                return line
                    .replace(/[^\w\s.,!?;:'"\-éèêëàâïîôûùç]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            })
            .join('\n');  // Joindre avec des sauts de ligne

        // Insérer le texte nettoyé à la position du curseur
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(cleanText));
        }
        
        updateAnalysis(elements);
    });

    // Modifier la fonction de collage du bouton aussi
    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            
            // Nettoyer le texte en conservant les lignes vides
            const cleanText = text
                .split('\n')
                .map(line => {
                    if (!line.trim()) return '';  // Conserver les lignes vides
                    return line
                        .replace(/[^\w\s.,!?;:'"\-éèêëàâïîôûùç]/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                })
                .join('\n');
            
            editor.textContent = cleanText;
            updateAnalysis(elements);
            
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

    copyButton.addEventListener('click', () => {
        const lines = editor.innerText.split('\n')
            .filter(line => line.trim())
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
} 