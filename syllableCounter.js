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

// Liste des mots qui se terminent par "ent" mais qui ne sont pas des verbes
const ENT_EXCEPTIONS = new Set([
    'ambivalent', 'antécédent', 'ardent', 'clément', 'cohérent', 'compétent',
    'décadent', 'fréquent', 'indulgent', 'lent', 'parent', 'polyvalent',
    'récent', 'succulent', 'transparent', 'virulent', 'absent', 'acquittement',
    'équivalent', 'excédent', 'monument', 'précédent', 'présent', 'président',
    'patient', 'surpassement', 'transparent', 'accent', 'adolescent', 'argent',
    'client', 'jument', 'moment'
]);

function findCommonEndings(words) {
    if (words.length < 2) return [];
    
    function getLongestCommonSuffixLength(str1, str2) {
        let i = str1.length - 1;
        let j = str2.length - 1;
        let length = 0;
        
        while (i >= 0 && j >= 0 && str1[i] === str2[j]) {
            length++;
            i--;
            j--;
        }
        
        return length;
    }
    
    // Trouver les groupes de rimes adjacentes
    const groups = [];
    let currentGroup = [words[0]];
    let currentLength = 0;
    
    for (let i = 1; i < words.length; i++) {
        const length = getLongestCommonSuffixLength(words[i-1], words[i]);
        
        // Si on a une rime riche (2+ caractères) ou une rime pauvre (1 caractère)
        if (length >= 2 || (length === 1 && words[i-1].slice(-1).match(/[éèêëàâïîôûù]/))) {
            if (length > currentLength) {
                // Si on trouve une meilleure rime, on recommence le groupe
                if (currentGroup.length > 1) {
                    groups.push({
                        words: currentGroup,
                        commonLength: currentLength
                    });
                }
                currentGroup = [words[i-1], words[i]];
                currentLength = length;
            } else {
                currentGroup.push(words[i]);
            }
        } else {
            if (currentGroup.length > 1) {
                groups.push({
                    words: currentGroup,
                    commonLength: currentLength
                });
            }
            currentGroup = [words[i]];
            currentLength = 0;
        }
    }
    
    if (currentGroup.length > 1) {
        groups.push({
            words: currentGroup,
            commonLength: currentLength
        });
    }
    
    // Convertir les groupes en résultat final
    return groups.map(group => ({
        words: group.words,
        common: group.words[0].slice(-group.commonLength)
    }));
}

function normalizeEnding(word) {
    // Normaliser les terminaisons en é/er/et/ées/ée et autres cas similaires
    const normalizations = [
        // Terminaisons en é
        { pattern: /ées?$/, replacement: 'é' },
        { pattern: /er$/, replacement: 'é' },
        { pattern: /et$/, replacement: 'é' },
        
        // Terminaisons avec e muet final
        { pattern: /([^aeiouyéèêëàâïîôûù])e$/, replacement: '$1' },  // e muet après consonne
        { pattern: /([^aeiouyéèêëàâïîôûù])es$/, replacement: '$1' }, // es muet après consonne
        
        // Cas spéciaux de consonnes finales
        { pattern: /re$/, replacement: 'r' },
        { pattern: /me$/, replacement: 'm' },
        { pattern: /le$/, replacement: 'l' },
        { pattern: /te$/, replacement: 't' },
        { pattern: /ne$/, replacement: 'n' },
        
        // Pluriels de ces cas
        { pattern: /res$/, replacement: 'r' },
        { pattern: /mes$/, replacement: 'm' },
        { pattern: /les$/, replacement: 'l' },
        { pattern: /tes$/, replacement: 't' },
        { pattern: /nes$/, replacement: 'n' }
    ];

    // Appliquer les normalisations dans l'ordre
    for (const {pattern, replacement} of normalizations) {
        if (word.match(pattern)) {
            return word.replace(pattern, replacement);
        }
    }
    
    return word;
}

function getRhyme(word) {
    if (!word) return '';
    
    // Nettoyer la ponctuation et mettre en minuscules
    word = word.toLowerCase().replace(/[.,!?;:\s]/g, '');
    
    // Retirer le 's' final (pluriel)
    word = word.replace(/s$/, '');

    // Vérifier si le mot est une exception pour "ent"
    const isEntException = ENT_EXCEPTIONS.has(word) || 
                          ENT_EXCEPTIONS.has(word.replace(/s$/, ''));

    // Gérer les terminaisons verbales en "ent" seulement si ce n'est pas une exception
    if (word.endsWith('ent') && !isEntException) {
        word = word.slice(0, -3) + 'e';
    }

    // Normaliser les terminaisons
    word = normalizeEnding(word);
    
    return { 
        word: word,
        rich: '',  // Sera déterminé plus tard
        common: '' // Sera déterminé plus tard
    };
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
                .replace(/\s+!/g, '!')
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
                .replace(/\s+!/g, '!')
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
            } else {
                group.forEach(el => el.style.color = '#2196F3'); // Couleur par défaut pour les syllabes uniques
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
            if (richPart) richPart.style.color = '#666';  // Couleur par défaut
            if (commonPart) commonPart.style.color = '#666';  // Couleur par défaut
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

    document.body.appendChild(container);
}

// Initialiser le compteur
createSyllableCounter(); 