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

let currentGardenId = null;

let tools = document.getElementsByClassName('movable');
tools = Array.from(tools);

let draggedElement = null;
let initialPosition = { x: 0, y: 0 };
let offset = { x: 0, y: 0 };

const gardenPlots = document.querySelectorAll('.garden-plot');

// Plant counters
const plantCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
};

const plantCountElements = {
    1: document.getElementById('plantOneCount'),
    2: document.getElementById('plantTwoCount'),
    3: document.getElementById('plantThreeCount'),
    4: document.getElementById('plantFourCount'),
    5: document.getElementById('plantFiveCount')
};

// Money counter
let money = 0;
const moneyElement = document.getElementById('moneyCount');

// Cookie management functions
function saveGameData() {
    const lockedGardens = {};
    Object.keys(gardens).forEach(gardenId => {
        lockedGardens[gardenId] = gardens[gardenId].locked;
    });
    
    const gameData = {
        plantCounts: plantCounts,
        money: money,
        lockedGardens: lockedGardens,
        version: 1,
    };
    
    const jsonData = JSON.stringify(gameData);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365);
    
    document.cookie = `gardenGame=${encodeURIComponent(jsonData)}; expires=${expiryDate.toUTCString()}; path=/`;
}

function loadGameData() {
    const cookies = document.cookie.split('; ');
    const gardenCookie = cookies.find(row => row.startsWith('gardenGame='));
    
    if (gardenCookie) {
        try {
            const jsonData = decodeURIComponent(gardenCookie.split('=')[1]);
            const gameData = JSON.parse(jsonData);
            
            // Load plant counts
            if (gameData.plantCounts) {
                Object.keys(gameData.plantCounts).forEach(key => {
                    plantCounts[key] = gameData.plantCounts[key];
                    plantCountElements[key].textContent = plantCounts[key];
                });
            }
            
            // Load money
            if (gameData.money !== undefined) {
                money = gameData.money;
                moneyElement.textContent = money;
            }
            
            // Load locked gardens
            if (gameData.lockedGardens) {
                Object.keys(gameData.lockedGardens).forEach(gardenId => {
                    gardens[gardenId].locked = gameData.lockedGardens[gardenId];
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error loading game data:', error);
            return false;
        }
    }
    
    console.log('No saved game data found');
    return false;
}

function clearGameData() {
    document.cookie = 'gardenGame=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Reset plant counts
    Object.keys(plantCounts).forEach(key => {
        plantCounts[key] = 0;
        plantCountElements[key].textContent = 0;
    });
    
    // Reset money
    money = 0;
    moneyElement.textContent = 0;
    
    // Reset gardens
    gardens[1].locked = false;
    gardens[2].locked = true;
    gardens[3].locked = true;
    gardens[4].locked = true;
    
    updateGardenVisuals();
    
    console.log('Game data cleared');
}

function addMoney(amount) {
    money += amount;
    moneyElement.textContent = money;
    saveGameData();
}

function incrementPlantCount(plantType) {
    plantCounts[plantType]++;
    plantCountElements[plantType].textContent = plantCounts[plantType];
    
    // // Give money based on plant type
    // const plantValues = {
    //     1: 1,
    //     2: 2,
    //     3: 3,
    //     4: 5,
    //     5: 8
    // };
    
    // addMoney(plantValues[plantType] || 1);
    saveGameData();
}

function buyPlot(gardenId) {
    const garden = gardens[gardenId];
    
    if (!garden.locked) {
        console.log('Plot already unlocked');
        return;
    }
    
    if (money >= garden.plotCost) {
        money -= garden.plotCost;
        moneyElement.textContent = money;
        garden.locked = false;
        
        const plot = document.querySelector(`.garden-plot[data-garden="${gardenId}"]`);
        const buyButton = plot.querySelector('.garden-plot__button');
        const dirt = plot.querySelector('.dirt');
        
        buyButton.classList.add('hidden');
        dirt.style.filter = 'none';
        
        saveGameData();
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
    element.addEventListener('mousedown', (e) => startDrag(e, element));
});

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);

function startDrag(e, element) {
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

// Initialize game on page load
window.addEventListener('DOMContentLoaded', () => {
    loadGameData();
    updateGardenVisuals();
    initializeBuyButtons();
});

// Optional: Auto-save every 30 seconds
setInterval(() => {
    saveGameData();
}, 30000);
