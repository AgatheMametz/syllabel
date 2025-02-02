// Utilitaires généraux
const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'é', 'è', 'ê', 'ë', 'à', 'â', 'ï', 'î', 'ô', 'û', 'ù'];
const colors = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#009688', '#673AB7'];

// Liste des mots qui se terminent par "ent" mais qui ne sont pas des verbes
const ENT_EXCEPTIONS = new Set([
    'ambivalent', 'antécédent', 'ardent', 'clément', 'cohérent', 'compétent',
    'décadent', 'fréquent', 'indulgent', 'lent', 'parent', 'polyvalent',
    'récent', 'succulent', 'transparent', 'virulent', 'absent', 'acquittement',
    'équivalent', 'excédent', 'monument', 'précédent', 'présent', 'président',
    'patient', 'surpassement', 'transparent', 'accent', 'adolescent', 'argent',
    'client', 'jument', 'moment'
]); 