// Gestion des syllabes
function countSyllables(word) {
    if (!word) return 0;
    
    word = word.toLowerCase();
    
    if (word.endsWith('ent')) {
        word = word.slice(0, -3) + 'e';
    }
    
    let count = 0;
    let isLastCharVowel = false;
    
    for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i]);
        if (isVowel && !isLastCharVowel) {
            count++;
        }
        isLastCharVowel = isVowel;
    }
    
    if (word.endsWith('e') && count > 1) {
        count--;
    }
    
    return count;
} 