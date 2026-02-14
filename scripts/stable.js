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


        const music = new Audio("../assets/npc-sold.mp3");
        music.volume = 0.9;
        music.play();

        saveHorsesToCookie();
    } else {
        alert(`Nemas penizky L. Potrebujes ${cost} penez. Precti si to nigga`);
    }
}

// Horse spin - ANTI-SPAM + animation lock!
const horseStates = {
    1: false,  // busy = spinning
    2: false,
    3: false
};
const horseCooldowns = {
    1: 0,
    2: 0,
    3: 0
};

function spinHorse(horseNumber) {
    const now = Date.now();
    const horse = document.querySelector(`.horse--${horseNumber}`);
    if (!horse) return;

    // 1. SPINNING LOCK (čekej na animaci)
    if (horseStates[horseNumber]) {
        return;
    }

    // 2. SPAM COOLDOWN (< 2s = spam)
    if (now - horseCooldowns[horseNumber] < 4000) {
        alert(`kamo je mi blbe nech me bejt`);
        return;
    }

    // ✅ OK - spust spin!
    horseStates[horseNumber] = true;  // LOCK
    horseCooldowns[horseNumber] = now; // COOLDOWN

    horse.style.animation = 'none';
    horse.offsetHeight;
    horse.classList.add('spinning');

    // UNLOCK po 3s
    setTimeout(() => {
        horse.classList.remove('spinning');
        horseStates[horseNumber] = false;  // SPIN UNLOCK
    }, 3000);
}

window.spinHorse = spinHorse;

// Event listenery s anti-spam
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.horse').forEach((horse, index) => {
        horse.addEventListener('click', () => {
            spinHorse(index + 1);
        });
    });
    loadHorsesFromCookie();
});

window.spinHorse = spinHorse;