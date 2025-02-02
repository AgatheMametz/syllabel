// Point d'entrée principal
function init() {
    const elements = createEditor();
    setupEventListeners(elements);
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', init); 