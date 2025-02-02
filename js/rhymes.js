// Gestion des rimes
function normalizeEnding(word) {
    // Vérifier si le mot est une exception pour "ent"
    const isEntException = ENT_EXCEPTIONS.has(word) || 
                          ENT_EXCEPTIONS.has(word.replace(/s$/, ''));

    if (!isEntException) {
        // Traiter d'abord les terminaisons verbales
        const verbEndings = [
            { pattern: /issent$/, replacement: 'is' },
            { pattern: /oncent$/, replacement: 'once' },
            { pattern: /ent$/, replacement: 'e' }
        ];

        for (const {pattern, replacement} of verbEndings) {
            if (word.match(pattern)) {
                word = word.replace(pattern, replacement);
                break;
            }
        }
    }

    // Normaliser les sons similaires
    const soundNormalizations = [
        // Sons en "s"
        { pattern: /ss/g, replacement: 'c' },
        { pattern: /[çc]e/g, replacement: 'se' },
        { pattern: /[çc]é/g, replacement: 'sé' },
        { pattern: /[çc]i/g, replacement: 'si' },
        
        // Autres équivalences phonétiques
        { pattern: /ph/g, replacement: 'f' },
        { pattern: /gh/g, replacement: 'g' },
        { pattern: /qu/g, replacement: 'k' },
        { pattern: /gu(?=[ei])/g, replacement: 'g' }
    ];

    for (const {pattern, replacement} of soundNormalizations) {
        word = word.replace(pattern, replacement);
    }

    // Normaliser les terminaisons
    const endingNormalizations = [
        // Terminaisons en é
        { pattern: /ées?$/, replacement: 'é' },
        { pattern: /er$/, replacement: 'é' },
        { pattern: /et$/, replacement: 'é' },
        
        // Cas spéciaux de consonnes finales
        { pattern: /re$/, replacement: 'r' },
        { pattern: /me$/, replacement: 'm' },
        { pattern: /le$/, replacement: 'l' },
        { pattern: /te$/, replacement: 't' },
        { pattern: /ne$/, replacement: 'n' }
    ];

    for (const {pattern, replacement} of endingNormalizations) {
        if (word.match(pattern)) {
            return word.replace(pattern, replacement);
        }
    }
    
    return word;
}

function getRhyme(word) {
    if (!word) return '';
    
    // Convertir les nombres en texte
    if (/^\d+$/.test(word) || /^[A-Za-z]\d+$/.test(word)) {
        word = convertNumberToText(word);
    }
    
    word = word.toLowerCase()
        .replace(/[.,!?;:…\s]/g, '')
        .replace(/[«»""''\-]/g, '');
    
    word = word.replace(/s$/, '');
    word = normalizeEnding(word);
    
    return { word, rich: '', common: '' };
}

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
    
    const groups = [];
    const usedWords = new Set();
    
    for (let i = 0; i < words.length; i++) {
        if (usedWords.has(words[i])) continue;
        
        const currentGroup = [words[i]];
        let minCommonLength = words[i].length;
        
        for (let j = i + 1; j < words.length; j++) {
            if (usedWords.has(words[j])) continue;
            
            const length = getLongestCommonSuffixLength(words[i], words[j]);
            if (words[i] === words[j] || length >= 2 || 
                (length === 1 && words[i].slice(-1).match(/[éèêëàâïîôûù]/))) {
                currentGroup.push(words[j]);
                minCommonLength = Math.min(minCommonLength, length);
            }
        }
        
        if (currentGroup.length > 1) {
            groups.push({
                words: currentGroup,
                commonLength: minCommonLength
            });
            currentGroup.forEach(w => usedWords.add(w));
        }
    }
    
    return groups.map(group => ({
        words: group.words,
        common: group.words[0].slice(-group.commonLength)
    }));
} 