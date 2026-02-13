// Garden data for multiple plots
const gardens = {
    1: {
        seed: 0,
        seedStage: 0,
        planted: false,
        growthTimer: 0,
        growthDuration: 0,
        timerInterval: null,
        shovelHoverTimer: 0,
        shovelInterval: null,
        isShovelingMode: false,
        locked: false,
        plotCost: 0,
    },
    2: {
        seed: 0,
        seedStage: 0,
        planted: false,
        growthTimer: 0,
        growthDuration: 0,
        timerInterval: null,
        shovelHoverTimer: 0,
        shovelInterval: null,
        isShovelingMode: false,
        locked: true,
        plotCost: 10,
    },
    3: {
        seed: 0,
        seedStage: 0,
        planted: false,
        growthTimer: 0,
        growthDuration: 0,
        timerInterval: null,
        shovelHoverTimer: 0,
        shovelInterval: null,
        isShovelingMode: false,
        locked: true,
        plotCost: 25,
    },
    4: {
        seed: 0,
        seedStage: 0,
        planted: false,
        growthTimer: 0,
        growthDuration: 0,
        timerInterval: null,
        shovelHoverTimer: 0,
        shovelInterval: null,
        isShovelingMode: false,
        locked: true,
        plotCost: 50,
    }
};

const seedUnlockCosts = {
    1: 0,  // Free
    2: 0,  // Free  
    3: 15,
    4: 15,
    5: 25
};

const seedUnlocked = {
    1: true,
    2: true,
    3: false,
    4: false,
    5: false
};

let currentGardenId = null;

let tools = document.getElementsByClassName('movable');
tools = Array.from(tools);

let draggedElement = null;
let initialPosition = { x: 0, y: 0 };
let offset = { x: 0, y: 0 };

const gardenPlots = document.querySelectorAll('.garden-plot');

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

// Plant counters
const plantCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
};

let plantCountElements = {}; // Prázdný objekt

function initPlantElements() {
    plantCountElements = {
        1: document.getElementById('plantOneCount'),
        2: document.getElementById('plantTwoCount'),
        3: document.getElementById('plantThreeCount'),
        4: document.getElementById('plantFourCount'),
        5: document.getElementById('plantFiveCount')
    };
    console.log('Plant elements initialized:', plantCountElements);
}

// Money counter
let money = 0;
const moneyElement = document.getElementById('moneyCount');

function updatePlantDisplays(plantCounts) {
    Object.keys(plantCounts).forEach(key => {
        const element = document.getElementById(`plant${key === '1' ? 'One' : key === '2' ? 'Two' : key === '3' ? 'Three' : key === '4' ? 'Four' : 'Five'}Count`);
        if (element) element.textContent = plantCounts[key];
    });
}

function updatePlantCount(plantId, delta) {
    const gameData = getGameCookie() || {
        plantCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        money: 0,
        lockedGardens: { 1: false, 2: true, 3: true, 4: true },
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

function getCurrentPlantCounts() {
    const gameData = getGameCookie();
    return gameData?.plantCounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

function addGameMoney(amount) {
    const gameData = getGameCookie() || { money: 0, plantCounts: {}, lockedGardens: {}, version: 1 };
    gameData.money = (gameData.money || 0) + amount;
    saveGameCookie(gameData);
    const moneyElement = document.getElementById('moneyCount');
    if (moneyElement) moneyElement.textContent = gameData.money;
}

function loadGameData() {
    const gameData = getGameCookie();
    if (gameData) {
        // Load plant counts
        if (gameData.plantCounts) {
            updatePlantDisplays(gameData.plantCounts);
            Object.assign(plantCounts, gameData.plantCounts);
        }

        // Load money
        if (gameData.money !== undefined) {
            money = gameData.money;
            if (moneyElement) moneyElement.textContent = money;
        }

        // Load locked gardens
        if (gameData.lockedGardens) {
            Object.keys(gameData.lockedGardens).forEach(gardenId => {
                if (gardens[gardenId]) {
                    gardens[gardenId].locked = gameData.lockedGardens[gardenId];
                }
            });
        }
        loadSeedUnlocks();
        updateSeedVisuals();
        return true;
    }
    updateSeedVisuals();
    console.log('No saved game data found');
    return false;
}

function saveGameData() {
    const lockedSeeds = {};
    const lockedGardens = {};  // ✅ PŘIDÁNO - chybělo!
    
    Object.keys(seedUnlocked).forEach(seedType => {
        lockedSeeds[seedType] = !seedUnlocked[seedType];
    });
    
    Object.keys(gardens).forEach(gardenId => {
        lockedGardens[gardenId] = gardens[gardenId].locked;
    });

    const gameData = {
        plantCounts: plantCounts,
        money: money,
        lockedGardens: lockedGardens,
        lockedSeeds: lockedSeeds,
        version: 1,
    };

    saveGameCookie(gameData);
}

function clearGameData() {
    document.cookie = `${GAME_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // Reset plant counts
    Object.keys(plantCounts).forEach(key => {
        plantCounts[key] = 0;
        plantCountElements[key].textContent = 0;
    });

    // Reset money
    money = 0;
    if (moneyElement) moneyElement.textContent = 0;

    // Reset gardens
    gardens[1].locked = false;
    gardens[2].locked = true;
    gardens[3].locked = true;
    gardens[4].locked = true;

    updateGardenVisuals();
    console.log('Game data cleared');
}

function addMoney(amount) {
    addGameMoney(amount);
}

function incrementPlantCount(plantType) {
    const newCount = updatePlantCount(plantType, 1);
}

function buyPlot(gardenId) {
    const garden = gardens[gardenId];

    if (!garden.locked) {
        console.log('Plot already unlocked');
        return;
    }

    const gameData = getGameCookie();
    const currentMoney = gameData?.money || 0;

    if (currentMoney >= garden.plotCost) {
        const newGameData = gameData || { money: 0, plantCounts: {}, lockedGardens: {}, version: 1 };
        newGameData.money = currentMoney - garden.plotCost;
        newGameData.lockedGardens[gardenId] = false;

        saveGameCookie(newGameData);
        money = newGameData.money;
        garden.locked = false;

        const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
        const buyButton = plot.querySelector('.garden-plot__button');
        const dirt = plot.querySelector('.dirt');

        buyButton.classList.add('hidden');
        dirt.style.filter = 'none';

        if (moneyElement) moneyElement.textContent = money;
        console.log(`Plot ${gardenId} unlocked!`);
    } else {
        alert(`Nemas penizky L. Potrebujes ${garden.plotCost} penez. Precti si to nigga`);
    }
}

function updateGardenVisuals() {
    Object.keys(gardens).forEach(gardenId => {
        const garden = gardens[gardenId];
        const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
        const buyButton = plot.querySelector('.garden-plot__button');
        const dirt = plot.querySelector('.dirt');

        if (garden.locked) {
            buyButton.classList.remove('hidden');
            buyButton.textContent = `Koupit (${garden.plotCost})`;
            dirt.style.filter = 'brightness(0.3)';
        } else {
            buyButton.classList.add('hidden');
            dirt.style.filter = 'none';
        }
    });
}

function initializeBuyButtons() {
    gardenPlots.forEach(plot => {
        const gardenId = plot.dataset.garden;
        const buyButton = plot.querySelector('.garden-plot__button');

        buyButton.addEventListener('click', () => {
            buyPlot(gardenId);
        });
    });
}

tools.forEach(element => {
    // Drag handler
    element.addEventListener('mousedown', (e) => {
        if (element.classList.contains('seed-locked')) {
            e.preventDefault(); // Blokuj drag
            return;
        }
        startDrag(e, element);
    });

    // Click handler pro unlock locked seeds - NOVÉ!
    if (element.classList.contains('seed')) {
        element.addEventListener('click', (e) => {
            if (element.classList.contains('seed-locked')) {
                e.preventDefault();
                e.stopPropagation();
                const seedMatch = element.className.match(/seed-(\d+)/);
                if (seedMatch) {
                    unlockSeed(parseInt(seedMatch[1]));
                }
            }
        });
    }
});

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);

function startDrag(e, element) {
    // BLOCK DRAG pro locked seeds - NOVÉ!
    if (element.classList.contains('seed')) {
        const seedMatch = element.className.match(/seed-(\d+)/);
        if (seedMatch && !isSeedUnlocked(parseInt(seedMatch[1]))) {
            e.preventDefault();
            return; // NELZE táhnout locked seed
        }
    }

    draggedElement = element;

    const rect = element.getBoundingClientRect();
    initialPosition = {
        x: rect.left,
        y: rect.top
    };

    offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    element.classList.add('dragging');
    element.style.position = 'fixed';
    element.style.left = rect.left + 'px';
    element.style.top = rect.top + 'px';

    if (element.classList.contains('watering-can')) {
        element.classList.add("watering-can--rotate");
    }
}

function drag(e) {
    if (!draggedElement) return;

    draggedElement.style.left = (e.clientX - offset.x) + 'px';
    draggedElement.style.top = (e.clientY - offset.y) + 'px';

    if (draggedElement.classList.contains('basket')) {
        checkPlantCollision();
    }

    if (draggedElement.classList.contains('shovel')) {
        handleShovelDrag();
    }
}

function handleShovelDrag() {
    let hoveringOverGarden = null;

    gardenPlots.forEach(plot => {
        const gardenId = plot.dataset.garden;
        const dirt = plot.querySelector('.dirt');

        if (checkCollision(draggedElement, dirt) && gardens[gardenId].planted) {
            hoveringOverGarden = gardenId;
        }
    });

    if (hoveringOverGarden) {
        const gardenId = hoveringOverGarden;
        const garden = gardens[gardenId];
        const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
        const timerBar = plot.querySelector('.timer');
        const timerFill = plot.querySelector('.timer-fill');

        if (!garden.shovelInterval) {
            garden.isShovelingMode = true;
            garden.shovelHoverTimer = 0;
            timerBar.style.display = 'block';
            timerFill.style.backgroundColor = '#FF5722';

            garden.shovelInterval = setInterval(() => {
                garden.shovelHoverTimer += 100;
                const percentage = Math.min((garden.shovelHoverTimer / 5000) * 100, 100);
                timerFill.style.width = percentage + '%';

                if (garden.shovelHoverTimer >= 5000) {
                    clearInterval(garden.shovelInterval);
                    garden.shovelInterval = null;
                    garden.shovelHoverTimer = 0;
                    garden.isShovelingMode = false;
                    timerFill.style.backgroundColor = '#4CAF50';
                    resetGarden(gardenId);
                }
            }, 100);
        }
    } else {
        Object.keys(gardens).forEach(gardenId => {
            const garden = gardens[gardenId];
            if (garden.shovelInterval) {
                clearInterval(garden.shovelInterval);
                garden.shovelInterval = null;
                garden.shovelHoverTimer = 0;
                garden.isShovelingMode = false;

                const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
                const timerBar = plot.querySelector('.timer');
                const timerFill = plot.querySelector('.timer-fill');
                timerFill.style.backgroundColor = '#4CAF50';

                if (garden.planted && garden.seedStage <= 4) {
                    updateTimerBar(gardenId);
                } else {
                    timerBar.style.display = 'none';
                }
            }
        });
    }
}

function endDrag() {
    if (!draggedElement) return;

    Object.keys(gardens).forEach(gardenId => {
        const garden = gardens[gardenId];
        if (garden.shovelInterval) {
            clearInterval(garden.shovelInterval);
            garden.shovelInterval = null;
            garden.shovelHoverTimer = 0;
            garden.isShovelingMode = false;

            const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
            const timerFill = plot.querySelector('.timer-fill');
            const timerBar = plot.querySelector('.timer');
            timerFill.style.backgroundColor = '#4CAF50';

            if (garden.planted && garden.seedStage <= 4) {
                updateTimerBar(gardenId);
            } else {
                timerBar.style.display = 'none';
            }
        }
    });

    gardenPlots.forEach(plot => {
        const gardenId = plot.dataset.garden;
        const dirt = plot.querySelector('.dirt');

        if (checkCollision(draggedElement, dirt)) {
            handleCollision(draggedElement, gardenId);
        }
    });

    draggedElement.style.left = initialPosition.x + 'px';
    draggedElement.style.top = initialPosition.y + 'px';

    if (draggedElement.classList.contains('watering-can')) {
        draggedElement.classList.remove("watering-can--rotate");
    }

    draggedElement.style.transition = 'all 0.3s ease';

    setTimeout(() => {
        draggedElement.style.position = '';
        draggedElement.style.left = '';
        draggedElement.style.top = '';
        draggedElement.style.transition = '';
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }, 300);
}

function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

function checkPlantCollision() {
    const plantPlaceholders = document.querySelectorAll('.plant-placeholder');

    plantPlaceholders.forEach(plant => {
        if (plant.style.display === 'none') return;

        if (checkCollision(draggedElement, plant)) {
            let plantType = null;
            plant.classList.forEach(cls => {
                if (cls.startsWith('plant-') && cls !== 'plant-placeholder' && !cls.startsWith('plant-pos')) {
                    plantType = cls.split('-')[1];
                }
            });

            if (plantType) {
                plant.style.display = 'none';
                incrementPlantCount(plantType);
            }
        }
    });
}

function resetGarden(gardenId) {
    const garden = gardens[gardenId];
    const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);

    garden.seed = 0;
    garden.seedStage = 0;
    garden.planted = false;
    garden.growthTimer = 0;
    garden.growthDuration = 0;

    if (garden.timerInterval) {
        clearInterval(garden.timerInterval);
        garden.timerInterval = null;
    }

    const timerBar = plot.querySelector('.timer');
    const timerFill = plot.querySelector('.timer-fill');
    timerBar.style.display = 'none';
    timerFill.style.width = '0%';

    const seedStages = plot.querySelectorAll('.seed-stage');
    seedStages.forEach(stage => {
        stage.style.display = 'none';
        stage.id = '';
    });

    const plantPlaceholders = plot.querySelectorAll('.plant-placeholder');
    plantPlaceholders.forEach(plant => {
        plant.style.display = 'none';
        const classesToRemove = [];
        plant.classList.forEach(cls => {
            if (cls.startsWith('plant-') && cls !== 'plant-placeholder' && !cls.startsWith('plant-pos')) {
                classesToRemove.push(cls);
            }
        });
        classesToRemove.forEach(cls => plant.classList.remove(cls));
    });
}

function handleCollision(element, gardenId) {
    const garden = gardens[gardenId];

    // Check if plot is locked
    if (garden.locked) {
        console.log('This plot is locked! Buy it first.');
        return;
    }

    if (element.classList.contains('seed')) {
        garden.seed = element.classList[1].split('-')[1];
    } else {
        garden.seed = 0;
    }

    if (garden.seed != 0 && !garden.planted) {
        garden.planted = true;
        const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
        const timerBar = plot.querySelector('.timer');
        timerBar.style.display = 'block';
        startGrowthTimer(gardenId);
    } else if (element.classList.contains('watering-can') && garden.planted) {
        garden.growthTimer += 2500;
        updateTimerBar(gardenId);
    }
}

function startGrowthTimer(gardenId) {
    const garden = gardens[gardenId];
    // garden.growthDuration = Math.floor(Math.random() * (10000 - 5000)) + 5000;
    garden.growthDuration = Math.floor(Math.random() * (300 - 100)) + 100;
    garden.growthTimer = 0;

    if (garden.timerInterval) {
        clearInterval(garden.timerInterval);
    }

    garden.timerInterval = setInterval(() => {
        garden.growthTimer += 500;

        if (!garden.isShovelingMode) {
            updateTimerBar(gardenId);
        }

        if (garden.growthTimer >= garden.growthDuration) {
            clearInterval(garden.timerInterval);
            growNextStage(gardenId);
        }
    }, 500);
}

function updateTimerBar(gardenId) {
    const garden = gardens[gardenId];
    const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
    const timerFill = plot.querySelector('.timer-fill');

    const percentage = Math.min((garden.growthTimer / garden.growthDuration) * 100, 100);
    timerFill.style.width = percentage + '%';
}

function growNextStage(gardenId) {
    const garden = gardens[gardenId];
    const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
    const seedStages = plot.querySelectorAll('.seed-stage');

    if (garden.seedStage <= 3) {
        seedStages[garden.seedStage].style.display = 'block';
        seedStages[garden.seedStage].id = 'seed-' + garden.seed;

        if (garden.seedStage > 0) {
            seedStages[garden.seedStage - 1].style.display = 'none';
        }
    }

    garden.seedStage++;

    if (garden.seedStage > 4) {
        grow(gardenId);
        const timerBar = plot.querySelector('.timer');
        timerBar.style.display = 'none';
        return;
    }

    startGrowthTimer(gardenId);
}

function grow(gardenId) {
    const garden = gardens[gardenId];
    const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
    const plantPlaceholders = plot.querySelectorAll('.plant-placeholder');
    const seedStages = plot.querySelectorAll('.seed-stage');

    if (garden.seed == 5) {
        plantPlaceholders[0].classList.add('plant-' + garden.seed);
        plantPlaceholders[0].style.display = 'block';
        seedStages[3].style.display = 'none';
    } else {
        plantPlaceholders.forEach(plant => {
            plant.classList.add('plant-' + garden.seed);
            plant.style.display = 'block';
        });
    }
}

// Check if seed is unlocked
function isSeedUnlocked(seedType) {
    return seedUnlocked[seedType];
}

// Unlock seed
function unlockSeed(seedType) {
    const gameData = getGameCookie() || { money: 0, plantCounts: {}, lockedSeeds: {}, lockedGardens: {}, version: 1 };
    const cost = seedUnlockCosts[seedType];
    const currentMoney = gameData.money || 0;

    if (currentMoney >= cost) {
        // Zajisti že lockedSeeds existuje
        if (!gameData.lockedSeeds) {
            gameData.lockedSeeds = {};
        }
        
        gameData.money = currentMoney - cost;
        gameData.lockedSeeds[seedType] = false;  // false = unlocked
        seedUnlocked[seedType] = true;

        saveGameCookie(gameData);
        
        // ✅ OPRAV - Použij existující moneyElement
        if (moneyElement) moneyElement.textContent = gameData.money;
        
        updateSeedVisuals();
        console.log(`Seed ${seedType} unlocked for ${cost} coins!`);
    } else {
        alert(`Nemas penizky L. Potrebujes ${cost} penez. Precti si to nigga`);
    }
}

// Update seed visuals in toolbar
function updateSeedVisuals() {
    const seeds = document.querySelectorAll('.seed');
    seeds.forEach(seed => {
        const seedMatch = seed.className.match(/seed-(\d+)/);
        if (seedMatch) {
            const seedType = parseInt(seedMatch[1]);
            if (!isSeedUnlocked(seedType)) {
                seed.classList.add('seed-locked');
                seed.dataset.lockCost = seedUnlockCosts[seedType] + '💰';
            } else {
                seed.classList.remove('seed-locked');
                delete seed.dataset.lockCost;
            }
        }
    });
}

// Load seed unlock status from cookies
function loadSeedUnlocks() {
    const gameData = getGameCookie();
    if (gameData?.lockedSeeds) {  // Optional chaining
        Object.keys(gameData.lockedSeeds).forEach(seedType => {
            seedUnlocked[seedType] = !gameData.lockedSeeds[seedType];
        });
    }
    // Pokud lockedSeeds neexistuje, použij default hodnoty (1,2 unlocked)
}


// Initialize game on page load
window.addEventListener('DOMContentLoaded', () => {
    initPlantElements();  // ✅ PRVNI!
    loadGameData();
    updateGardenVisuals();
    initializeBuyButtons();
    updateSeedVisuals();
    tools = Array.from(document.getElementsByClassName('movable')); // Refresh tools
});


// Optional: Auto-save every 30 seconds
setInterval(() => {
    saveGameData();
}, 30000);
