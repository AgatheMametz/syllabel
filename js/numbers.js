// Conversion des nombres en texte
const NUMBERS = {
    0: 'zéro',
    1: 'un',
    2: 'deux',
    3: 'trois',
    4: 'quatre',
    5: 'cinq',
    6: 'six',
    7: 'sept',
    8: 'huit',
    9: 'neuf',
    10: 'dix',
    11: 'onze',
    12: 'douze',
    13: 'treize',
    14: 'quatorze',
    15: 'quinze',
    16: 'seize',
    20: 'vingt',
    30: 'trente',
    40: 'quarante',
    50: 'cinquante',
    60: 'soixante',
    70: 'soixante-dix',
    80: 'quatre-vingts',
    90: 'quatre-vingt-dix'
};

function convertNumberToText(number) {
    if (typeof number !== 'string') number = number.toString();
    
    // Gérer les cas comme "A4", "B2", etc.
    const letterNumberMatch = number.match(/^([A-Za-z])(\d+)$/);
    if (letterNumberMatch) {
        const [_, letter, num] = letterNumberMatch;
        return letter.toUpperCase() + ' ' + convertNumberToText(num);
    }
    
    // Si c'est un nombre simple
    if (NUMBERS[number]) return NUMBERS[number];
    
    const n = parseInt(number);
    if (isNaN(n)) return number;  // Si ce n'est pas un nombre

    // Gestion des nombres composés
    if (n > 16 && n < 20) return 'dix-' + NUMBERS[n - 10];
    if (n > 20 && n < 30) return 'vingt-' + NUMBERS[n - 20];
    if (n > 30 && n < 40) return 'trente-' + NUMBERS[n - 30];
    if (n > 40 && n < 50) return 'quarante-' + NUMBERS[n - 40];
    if (n > 50 && n < 60) return 'cinquante-' + NUMBERS[n - 50];
    if (n > 60 && n < 70) return 'soixante-' + NUMBERS[n - 60];
    if (n > 70 && n < 80) return 'soixante-' + NUMBERS[n - 60];
    if (n > 80 && n < 90) return 'quatre-vingt-' + NUMBERS[n - 80];
    if (n > 90 && n < 100) return 'quatre-vingt-' + NUMBERS[n - 90];

    return number;  // Pour les autres cas
} 