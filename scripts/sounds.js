let hoverCooldown = 0;  // Anti-spam timer

function playHoverSound() {
    const now = Date.now();
    
    // Anti-spam: min 500ms mezi zvuky
    if (now - hoverCooldown < 1) return;
    
    hoverCooldown = now;
    
    // Vytvoř a pusť sound
    const hoverSound = new Audio('../assets/button-hover.mp3');
    hoverSound.volume = 0.3;
    hoverSound.play().catch(e => console.log('Hover sound failed:', e));
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.npc-btn, .horse__unlock-button, .seed, .gate, .garden-plot__button, .shovel, .basket').forEach(el => {
        el.addEventListener('mouseenter', playHoverSound);
    });
});