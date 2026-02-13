// Updated npc.js with inventory system integration

// Track active NPCs by position
const activeNPCs = {
    1: null,
    2: null,
    3: null
};

// Inventory data structure (loaded from localStorage)
let inventory = {};

// Plant types mapping (1-5 matching your garden system)
const plantNames = {
    1: 'plantOne',
    2: 'plantTwo', 
    3: 'plantThree',
    4: 'plantFour',
    5: 'plantFive'
};

function loadInventory() {
    const saved = localStorage.getItem('gardenInventory');
    if (saved) {
        try {
            inventory = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading inventory:', e);
            inventory = {};
        }
    } else {
        inventory = {};
    }
    console.log('Inventory loaded:', inventory);
}

function saveInventory() {
    localStorage.setItem('gardenInventory', JSON.stringify(inventory));
}

function hasEnoughItems(itemType, count) {
    return inventory[itemType] >= count;
}

function removeItems(itemType, count) {
    if (hasEnoughItems(itemType, count)) {
        inventory[itemType] -= count;
        if (inventory[itemType] === 0) {
            delete inventory[itemType];
        }
        saveInventory();
        return true;
    }
    return false;
}

function generateNPCRequest() {
    // 1-3 items (2 most common)
    const numItems = Math.random() < 0.1 ? 1 : (Math.random() < 0.7 ? 2 : 3);
    
    const request = [];
    for (let i = 0; i < numItems; i++) {
        // 1-5 count (3 most common)
        const count = Math.random() < 0.15 ? 1 : 
                     (Math.random() < 0.7 ? 3 : 
                     (Math.random() < 0.7 ? 4 : 5));
        
        const itemType = Math.floor(Math.random() * 5) + 1; // 1-5
        request.push({ type: itemType, count });
    }
    
    return request;
}

function calculateReward(request) {
    let totalItems = 0;
    let specificBonus = 0;
    
    request.forEach(item => {
        totalItems += item.count;
        // Bonus for specific item (let's say type 5 is special)
        if (item.type === 5) {
            specificBonus += item.count;
        }
    });
    
    return (totalItems * 2) + (specificBonus * 2); // 2 per item + 4 for special (type 5)
}

function fulfillNPCRequest(npc, position) {
    const request = npc.request;
    let canFulfill = true;
    
    // Check if we have all required items
    for (let item of request) {
        if (!hasEnoughItems(plantNames[item.type], item.count)) {
            canFulfill = false;
            break;
        }
    }
    
    if (canFulfill) {
        // Remove items from inventory
        for (let item of request) {
            removeItems(plantNames[item.type], item.count);
        }
        
        // Add money
        const reward = calculateReward(request);
        addMoney(reward);
        
        // Remove NPC
        removeNPC(position);
        
        console.log(`NPC fulfilled! Reward: ${reward} money, inventory updated`);
        return true;
    }
    
    return false;
}

function createNPCBubble(npc, position) {
    const bubble = document.createElement('div');
    bubble.classList.add('npc__bubble');
    bubble.dataset.position = position;
    
    // Display request in bubble
    let bubbleText = 'Chci:<br>';
    npc.request.forEach(item => {
        bubbleText += `${item.count}x Rostlina ${item.type}<br>`;
    });
    
    bubble.innerHTML = bubbleText;
    npc.element.appendChild(bubble);
    
    // Click to fulfill
    bubble.addEventListener('click', () => {
        fulfillNPCRequest(npc, position);
    });
}

function spawnNPC() {
    const npcContainer = document.querySelector('.npc__container');
    if (!npcContainer) return;
    
    // Choose a random position that doesn't have an NPC yet
    const availablePositions = [];
    for (let pos = 1; pos <= 3; pos++) {
        if (!activeNPCs[pos]) {
            availablePositions.push(pos);
        }
    }
    
    if (availablePositions.length === 0) {
        console.log('All positions occupied');
        return;
    }
    
    const posNum = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    const npcElement = document.createElement('div');
    npcElement.classList.add('npc');
    npcElement.dataset.position = posNum;
    
    const isArthur = Math.random() < 0.1;
    const skinNum = isArthur ? 'arthur' : Math.floor(Math.random() * 4) + 1;
    npcElement.classList.add(`npc--skin-${skinNum}`);
    npcElement.classList.add(`npc--pos-${posNum}`);
    
    // Create NPC data object
    const npcData = {
        element: npcElement,
        position: posNum,
        request: generateNPCRequest()
    };
    
    npcContainer.appendChild(npcElement);
    activeNPCs[posNum] = npcData;
    
    // Add interaction bubble after short delay
    setTimeout(() => {
        createNPCBubble(npcData, posNum);
    }, 500);
    
    console.log(`NPC spawned: skin-${skinNum}, pos-${posNum}, request:`, npcData.request);
}

function removeNPC(position) {
    if (activeNPCs[position]) {
        const npc = activeNPCs[position];
        if (npc.element.parentNode) {
            npc.element.parentNode.removeChild(npc.element);
        }
        activeNPCs[position] = null;
        console.log(`NPC removed from position ${position}`);
    }
}

function startNPCSpawning() {
    function spawnNext() {
        spawnNPC();
        
        const nextInterval = (Math.random() * 10 + 20) * 1000;
        setTimeout(spawnNext, nextInterval);
    }
    
    spawnNext();
}

// Initialize inventory system and NPC spawning
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    setTimeout(() => {
        startNPCSpawning();
    }, 1000);
});
