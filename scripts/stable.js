// horse unlock data
const horses = {
    1: {
        unlocked: false,
        name: ''
    },
    2: {
        unlocked: false,
        name: ''
    },
    3: {
        unlocked: false,
        name: ''
    }
}

// save horses to cookie
function saveHorsesToCookie() {
    const gameData = getGameCookie() || { money: 0, plantCounts: {}, lockedGardens: {}, version: 1 };
    gameData.horses = horses;
    saveGameCookie(gameData);
}

// load horses from cookie
function loadHorsesFromCookie() {
    const gameData = getGameCookie();
    if (gameData?.horses) {
        Object.keys(gameData.horses).forEach(key => {
            horses[key] = gameData.horses[key];
            if (horses[key].unlocked) {
                const lockElement = document.querySelector(`.horse__lock--${key}`);
                if (lockElement) lockElement.style.display = 'none';
                const horseElement = document.querySelector(`.horse--${key}`);
                if (horseElement) {
                    horseElement.style.filter = 'grayscale(0%) brightness(100%)';
                    horseElement.style.pointerEvents = 'auto';
                }
                const buyButton = document.getElementById(`buyHorse${key}`);
                if (buyButton) buyButton.style.display = 'none';

                const nameTag = document.getElementById(`nametag${key}`);
                nameTag.style.display = 'block';
                
                const horseNameElement = document.getElementById(`horseName${key}`);
                horseNameElement.style.display = 'block';
                horseNameElement.textContent = horses[key].name;
            }
        });
    }
}

//load money to #moneyCount
const moneyElement = document.getElementById('moneyCount');
const gameData = getGameCookie();
if (gameData.money !== undefined) {
    money = gameData.money;
    if (moneyElement) moneyElement.textContent = money;
}

function buyHorse(horseId, cost) {
    if (gameData.money >= cost) {
        removeGameMoney(cost);
        const lockElement = document.querySelector(`.horse__lock--${horseId}`);
        if (lockElement) lockElement.style.display = 'none';
        const horseElement = document.querySelector(`.horse--${horseId}`);
        if (horseElement) {
            horseElement.style.filter = 'grayscale(0%) brightness(100%)';
            horseElement.style.pointerEvents = 'auto';
        }
        const buyButton = document.getElementById(`buyHorse${horseId}`);
        if (buyButton) buyButton.style.display = 'none';

        const nameTag = document.getElementById(`nametag${horseId}`);
        nameTag.style.display = 'block';

        const horseNameElement = document.getElementById(`horseName${horseId}`);
        horseNameElement.style.display = 'block';
        
        const name = prompt('Jmeno si vyber taky zeo')
        if (name) {
            horseNameElement.textContent = name;
        }

        horses[horseId].name = name;
        horses[horseId].unlocked = true;

        saveHorsesToCookie();
    } else {
        alert(`Nemas penizky L. Potrebujes ${cost} penez. Precti si to nigga`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadHorsesFromCookie();
});