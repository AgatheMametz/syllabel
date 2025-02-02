// Gestion des rimes
function normalizeEnding(word) {
    // Vérifier si le mot est une exception pour "ent"
    const isEntException = ENT_EXCEPTIONS.has(word) || 
                          ENT_EXCEPTIONS.has(word.replace(/s$/, ''));

    // Normaliser d'abord les terminaisons importantes
    const primaryEndings = [
        // Cas spéciaux de prononciation
        { pattern: /pays?$/, replacement: 'péi' },     // pays -> péi
        
        // Sons complexes (traités en premier et dans l'ordre)
        { pattern: /eill?e?s?$/, replacement: 'eil' }, // sommeil, réveil -> eil
        { pattern: /[eè]ils?$/, replacement: 'eil' },  // soleil -> eil
        
        { pattern: /iens?$/, replacement: 'ien' },     // tien, rien -> ien
        { pattern: /[iy]ens?$/, replacement: 'ien' },  // mien, citoyen -> ien
        
        { pattern: /[oe]urs?$/, replacement: 'eur' },  // coeur, répondeur -> eur
        { pattern: /eurs?$/, replacement: 'eur' },     // danseur -> eur
        
        // Autres sons
        { pattern: /gie?s?$/, replacement: 'ji' },     // nostalgie -> ji
        { pattern: /chi[st]?$/, replacement: 'chi' },  // franchis -> chi
        { pattern: /ice?s?$/, replacement: 'is' },     // malice, maléfices -> is
        { pattern: /ix?$/, replacement: 'i' },         // dix, prix -> i
        { pattern: /is?$/, replacement: 'i' },         // gris, vie -> i
        { pattern: /id$/, replacement: 'i' },          // nid -> i
        { pattern: /it$/, replacement: 'i' },          // petit -> i
        
        // Sons en "one/onne"
        { pattern: /phones?$/, replacement: 'fone' },  // téléphone -> fone
        { pattern: /onnes?$/, replacement: 'one' },    // pardonne -> one
        
        // Sons en "è/ê"
        { pattern: /êts?$/, replacement: 'è' },        // forêt -> è
        { pattern: /ets?$/, replacement: 'è' },        // muet -> è
        { pattern: /ais$/, replacement: 'è' },         // mais -> è
        { pattern: /est$/, replacement: 'è' },         // est -> è
        { pattern: /aie?s?$/, replacement: 'è' },      // vraie -> è
        
        // Sons nasaux
        { pattern: /[aâeê]nts?$/, replacement: 'en' }, // temps, enfants
        { pattern: /[aâeê]nds?$/, replacement: 'en' }, // grand, prend
        { pattern: /[aâeê]mps?$/, replacement: 'en' }, // temps, champs
        { pattern: /[aâeê]ns?$/, replacement: 'en' },  // an, en
        
        // Sons en "er/é"
        { pattern: /er$/, replacement: 'é' },          // déposer -> é
        { pattern: /ez$/, replacement: 'é' },          // assez -> é
        { pattern: /é[es]?$/, replacement: 'é' },      // été -> é
        
        // Sons en "ère"
        { pattern: /fer$/, replacement: 'ère' },       // fer -> ère
        { pattern: /fère?s?$/, replacement: 'ère' },   // fère(s) -> ère
        { pattern: /ère?s?$/, replacement: 'ère' },    // ère(s) -> ère
        
        // Sons en "ou"
        { pattern: /oute?s?$/, replacement: 'out' },   // route -> out
        { pattern: /outte?s?$/, replacement: 'out' }   // goutte -> out
    ];

    for (const {pattern, replacement} of primaryEndings) {
        if (word.match(pattern)) {
            return word.replace(pattern, replacement);
        }
    }

    if (!isEntException) {
        // Traiter les terminaisons verbales
        const verbEndings = [
            { pattern: /issent$/, replacement: 'isse' },
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

    // Normaliser les autres terminaisons
    const endingNormalizations = [
        // Autres terminaisons en é
        { pattern: /ées?$/, replacement: 'é' },
        { pattern: /ez$/, replacement: 'é' },
        { pattern: /é[es]?$/, replacement: 'é' },
        
        // Sons en "isse"
        { pattern: /isses?$/, replacement: 'isse' },
        
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
    
    // Nettoyer le mot de la ponctuation, y compris "?"
    word = word.toLowerCase()
        .replace(/[.,!?;:…\s]+$/, '')  // Ponctuation à la fin
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
    
    // Liste des sons qui peuvent former une rime même seuls
    const validSingleSounds = new Set(['i', 'é', 'è', 'a', 'o', 'u', 'r', 'l', 'm', 'n']);
    
    // Liste des sons complexes qui doivent être considérés comme une unité
    const validComplexSounds = new Set([
        'eil',  // Mettre les plus longs en premier
        'ien',
        'eur',
        'out',
        'one',
        'ère',
        'en'
    ]);
    
    for (let i = 0; i < words.length; i++) {
        if (usedWords.has(words[i])) continue;
        
        const currentGroup = [words[i]];
        let maxCommonLength = 0;  // On cherche maintenant la plus grande longueur commune
        
        for (let j = i + 1; j < words.length; j++) {
            if (usedWords.has(words[j])) continue;
            
            const length = getLongestCommonSuffixLength(words[i], words[j]);
            const commonEnd = words[i].slice(-length);
            
            // Accepter si :
            // - Les mots sont identiques
            // - La terminaison commune est un son complexe valide
            // - La terminaison commune fait au moins 2 caractères
            // - OU c'est un son simple valide
            if (words[i] === words[j] || 
                validComplexSounds.has(commonEnd) ||
                length >= 2 || 
                (length === 1 && validSingleSounds.has(commonEnd))) {
                currentGroup.push(words[j]);
                maxCommonLength = Math.max(maxCommonLength, length);  // On prend la plus grande longueur
            }
        }
        
        if (currentGroup.length > 1) {
            groups.push({
                words: currentGroup,
                commonLength: maxCommonLength  // On utilise la plus grande longueur
            });
            currentGroup.forEach(w => usedWords.add(w));
        }
    }
    
    return groups.map(group => ({
        words: group.words,
        common: group.words[0].slice(-group.commonLength)
    }));
} 