// cookies.js - Robustní cookie systém pro garden game

const GAME_COOKIE_NAME = 'gardenGame';

function getGameCookie() {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(`${GAME_COOKIE_NAME}=`));
    if (!cookie) return null;
    
    try {
        const jsonData = decodeURIComponent(cookie.split('=')[1]);
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Failed to parse game cookie:', error);
        return null;
    }
}

function saveGameCookie(gameData) {
    const jsonData = JSON.stringify(gameData);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365);
    
    document.cookie = `${GAME_COOKIE_NAME}=${encodeURIComponent(jsonData)}; expires=${expiryDate.toUTCString()}; path=/`;
    console.log('Game cookie saved:', gameData.plantCounts);
}

function updatePlantCount(plantId, delta) {
    const gameData = getGameCookie() || {
        plantCounts: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        money: 0,
        lockedGardens: {1: false, 2: true, 3: true, 4: true},
        version: 1
    };
    
    gameData.plantCounts[plantId] = Math.max(0, (gameData.plantCounts[plantId] || 0) + delta);
    
    saveGameCookie(gameData);
    updatePlantDisplays(gameData.plantCounts);
    return gameData.plantCounts[plantId];
}

function hasPlantCount(plantId, requiredCount) {
    const gameData = getGameCookie();
    const count = gameData?.plantCounts?.[plantId] || 0;
    return count >= requiredCount;
}

function updatePlantDisplays(plantCounts) {
    Object.keys(plantCounts).forEach(key => {
        const element = document.getElementById(`plant${key === '1' ? 'One' : key === '2' ? 'Two' : key === '3' ? 'Three' : key === '4' ? 'Four' : 'Five'}Count`);
        if (element) element.textContent = plantCounts[key];
    });
}

function getCurrentPlantCounts() {
    const gameData = getGameCookie();
    return gameData?.plantCounts || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
}

function addGameMoney(amount) {
    const gameData = getGameCookie() || { money: 0, plantCounts: {}, lockedGardens: {}, version: 1 };
    gameData.money = (gameData.money || 0) + amount;
    saveGameCookie(gameData);
    const moneyElement = document.getElementById('moneyCount');
    if (moneyElement) moneyElement.textContent = gameData.money;
}
