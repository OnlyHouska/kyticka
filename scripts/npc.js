// FULLY WORKING npc.js - FIXED inventory + all functions

// Track active NPCs by position
const activeNPCs = {
    1: null,
    2: null,
    3: null
};

function getPlantCounts() {
    const cookies = document.cookie.split('; ');
    const gardenCookie = cookies.find(row => row.startsWith('gardenGame='));
    
    if (gardenCookie) {
        try {
            const jsonData = decodeURIComponent(gardenCookie.split('=')[1]);
            const gameData = JSON.parse(jsonData);
            return gameData.plantCounts || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        } catch (error) {
            console.error('Error reading plant counts:', error);
        }
    }
    return {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
}


// 🎉 CONFetti funkce - pusť na NPC pozici
function playConfettiAnimation(npcElement) {
    if (!npcElement) return;
    
    const npcRect = npcElement.getBoundingClientRect();
    const confettiImg = document.createElement('img');
    confettiImg.src = '../assets/confetti.gif';
    confettiImg.style.cssText = `
        position: fixed;
        top: ${npcRect.top + npcRect.height/2}px;
        left: ${npcRect.left + npcRect.width/2}px;
        width: 200px;
        height: 200px;
        z-index: 9999;
        pointer-events: none;
        transform: translate(-50%, -50%);
        border-radius: 50%;
    `;
    
    document.body.appendChild(confettiImg);
    
    // Odstraň po 2s
    setTimeout(() => {
        if (confettiImg.parentNode) {
            confettiImg.parentNode.removeChild(confettiImg);
        }
    }, 2000);
}

function hasEnoughItems(plantNumber, count) {
    const plantCounts = getPlantCounts();
    return (plantCounts[plantNumber] || 0) >= count;
}

function getPlantName(num) {
    const names = {1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five'};
    return names[num] || 'One';
}

function removeItems(plantNumber, count) {
    const cookies = document.cookie.split('; ');
    const gardenCookie = cookies.find(row => row.startsWith('gardenGame='));
    
    if (!gardenCookie) return false;
    
    try {
        const jsonData = decodeURIComponent(gardenCookie.split('=')[1]);
        const gameData = JSON.parse(jsonData);
        const plantCounts = gameData.plantCounts || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        
        if ((plantCounts[plantNumber] || 0) >= count) {
            plantCounts[plantNumber] -= count;
            gameData.plantCounts = plantCounts;
            
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 365);
            document.cookie = `gardenGame=${encodeURIComponent(JSON.stringify(gameData))}; expires=${expiryDate.toUTCString()}; path=/`;
            
            // UPDATE DISPLAYS
            Object.keys(plantCounts).forEach(key => {
                const element = document.getElementById(`plant${getPlantName(key)}Count`);
                if (element) element.textContent = plantCounts[key];
            });
            
            return true;
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
    return false;
}

function generateNPCRequest(position) {
    const gameData = getGameCookieData();
    const unlockedPlants = getUnlockedPlants(gameData);
    
    // POSITION 1 = VŽDY SAFE (unlocked only)
    const isSafeNPC = position === 1;
    
    let availableTypes;
    if (isSafeNPC) {
        // ✅ POSITION 1 = POUZE UNLOCKED plants
        availableTypes = unlockedPlants.length > 0 ? unlockedPlants : [1];
    } else {
        // ✅ POSITIONS 2,3 = VŠE (1-5)
        availableTypes = [1, 2, 3, 4, 5];
    }
    
    // ZABRAN DUPLICITŮ - shuffle a vezmi unikátní
    const shuffled = availableTypes.sort(() => Math.random() - 0.5);
    const uniqueTypes = shuffled.slice(0, 2); // Max 2 různé typy
    
    const request = [];
    uniqueTypes.forEach(type => {
        let count = type === 5 ? 1 : 
                   (Math.random() < 0.2 ? 2 : (Math.random() < 0.6 ? 3 : 4));
        request.push({ type, count });
    });
    
    return request;
}


function calculateReward(request) {
    const plantCosts = {
        1: 2,
        2: 2,
        3: 3,
        4: 3,
        5: 5
    };
    
    let totalReward = 0;
    request.forEach(item => {
        totalReward += item.count * plantCosts[item.type];
    });
    
    return totalReward;
}


function createNPCBubble(npc, position) {
    const bubble = document.createElement('div');
    bubble.classList.add('npc__bubble');
    bubble.dataset.position = position;
    
    let bubbleHTML = '';
    npc.request.forEach(item => {
        const plantDiv = document.createElement('div');
        plantDiv.className = `plant plant-${item.type}`;
        plantDiv.dataset.count = item.count;
        plantDiv.title = `${item.count}x Rostlina ${item.type}`;
        bubbleHTML += `<div class="npc-request-item"><span class="count">${item.count}x</span>${plantDiv.outerHTML}</div>`;
    });
    
    bubble.innerHTML = bubbleHTML;
    npc.element.appendChild(bubble);
}

function getGameCookieData() {
    const cookies = document.cookie.split('; ');
    const gardenCookie = cookies.find(row => row.startsWith('gardenGame='));
    if (gardenCookie) {
        try {
            return JSON.parse(decodeURIComponent(gardenCookie.split('=')[1]));
        } catch (error) {
            console.error('Error reading game cookie:', error);
        }
    }
    return null;
}

function getUnlockedPlants(gameData) {
    const unlocked = [1, 2];
    if (gameData?.lockedSeeds) {
        if (!gameData.lockedSeeds[3] || gameData.lockedSeeds[3] === false) unlocked.push(3);
        if (!gameData.lockedSeeds[4] || gameData.lockedSeeds[4] === false) unlocked.push(4);
        if (!gameData.lockedSeeds[5] || gameData.lockedSeeds[5] === false) unlocked.push(5);
    }
    return unlocked;
}

function spawnNPC() {
    const npcContainer = document.querySelector('.npc__container');
    if (!npcContainer) return;
    
    const availablePositions = [];
    for (let pos = 1; pos <= 3; pos++) {
        if (!activeNPCs[pos]) availablePositions.push(pos);
    }
    
    if (availablePositions.length === 0) return;
    
    const posNum = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    const npcElement = document.createElement('div');
    npcElement.classList.add('npc');
    npcElement.dataset.position = posNum;
    
    const isArthur = Math.random() < 0.1;
    const skinNum = isArthur ? 'arthur' : Math.floor(Math.random() * 4) + 1;
    npcElement.classList.add(`npc--skin-${skinNum}`, `npc--pos-${posNum}`);
    
    const npcData = {
        element: npcElement,
        position: posNum,
        request: generateNPCRequest(posNum),
        isSafe: posNum === 1,
        despawnTimer: null 
    };

    npcContainer.appendChild(npcElement);
    activeNPCs[posNum] = npcData;
    
    npcData.despawnTimer = setTimeout(() => {
        removeNPC(posNum);
    }, 50000);

    setTimeout(() => createNPCBubble(npcData, posNum), 500);
}

function removeNPC(position) {
    if (activeNPCs[position]) {
        const npc = activeNPCs[position];
        
        if (npc.despawnTimer) {
            clearTimeout(npc.despawnTimer);
        }
        
        if (npc.element.parentNode) {
            npc.element.parentNode.removeChild(npc.element);
        }
        activeNPCs[position] = null;
    }
}

function fulfillNPCRequest(position) {
    const npc = activeNPCs[position];
    if (!npc) return false;
    
    const request = npc.request;
    let canFulfill = true;
    
    for (let item of request) {
        if (!hasEnoughItems(item.type, item.count)) {
            canFulfill = false;
            break;
        }
    }
    
    if (canFulfill) {
        if (npc.despawnTimer) {
            clearTimeout(npc.despawnTimer);
        }

        // 🎉 ARTHUR SPECIAL: 100 MONEY FLAT!
        const isArthur = npc.element.classList.contains('npc--skin-arthur');
        const reward = isArthur ? 100 : calculateReward(request);
        
        // PUSŤ CONFetti NA NPC!
        playConfettiAnimation(npc.element);

        for (let item of request) {
            removeItems(item.type, item.count);
        }
        
        if (typeof addMoney === 'function') addMoney(reward);
        
        removeNPC(position);
        console.log(`NPC ${position} ${isArthur ? 'ARTHUR' : 'fulfilled'}! Reward: ${reward} 🎉`);
        return true;
    }
    console.log(`Cannot fulfill NPC ${position}`);
    return false;
}

window.fulfillNPC = fulfillNPCRequest;

// NPC LINKS
let npcLinks = {};

function showNPCLink(position) {
    hideNPCLink(position);
    const button = document.querySelector(`.npc-btn--pos${position}`);
    const npc = activeNPCs[position];
    
    if (!button || !npc?.element) return;
    
    const link = document.createElement('div');
    link.className = `npc-link npc-link--pos${position} show`;
    document.body.appendChild(link);
    npcLinks[position] = link;
    
    requestAnimationFrame(() => updateNPCLink(position));
}

function hideNPCLink(position) {
    const link = npcLinks[position];
    if (link) {
        link.classList.remove('show');
        setTimeout(() => {
            if (link.parentNode) link.parentNode.removeChild(link);
        }, 400);
        delete npcLinks[position];
    }
}

function updateNPCLink(position) {
    const link = npcLinks[position];
    const button = document.querySelector(`.npc-btn--pos${position}`);
    const npc = activeNPCs[position];
    
    if (!link || !button || !npc?.element) return;
    
    const buttonRect = button.getBoundingClientRect();
    const npcRect = npc.element.getBoundingClientRect();
    
    const startX = buttonRect.right + window.scrollX;
    const startY = buttonRect.top + buttonRect.height / 2 + window.scrollY;
    const endX = npcRect.left + npcRect.width / 2 + window.scrollX;
    const endY = npcRect.top + npcRect.height / 2 + window.scrollY;
    
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    
    link.style.left = startX + 'px';
    link.style.top = startY + 'px';
    link.style.width = length + 'px';
    link.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
    link.style.transformOrigin = '0 50%';
}

document.addEventListener('mousemove', () => {
    Object.keys(npcLinks).forEach(pos => {
        if (activeNPCs[parseInt(pos)]) updateNPCLink(parseInt(pos));
    });
});

function startNPCSpawning() {
    function spawnNext() {
        spawnNPC();
        setTimeout(spawnNext, (Math.random() * 10 + 20) * 1000);
    }
    spawnNext();
}

function hasEnoughItems(plantNumber, count) {
    const plantCounts = getPlantCounts();
    return (plantCounts[plantNumber] || 0) >= count;
}

// Spawn ARTHUR na náhodné volné pozici!
function spawnArthur() {
    const npcContainer = document.querySelector('.npc__container');
    if (!npcContainer) return;
    
    // Najdi volné pozice
    const availablePositions = [];
    for (let pos = 1; pos <= 3; pos++) {
        if (!activeNPCs[pos]) availablePositions.push(pos);
    }
    
    if (availablePositions.length === 0) {
        console.log('No free positions for Arthur!');
        return;
    }
    
    // Náhodná volná pozice
    const posNum = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    const npcElement = document.createElement('div');
    npcElement.classList.add('npc', 'npc--skin-arthur', `npc--pos-${posNum}`);
    npcElement.dataset.position = posNum;
    
    // ARTHUR VŽDY má náhodný request (jako normální NPC)
    const npcData = {
        element: npcElement,
        position: posNum,
        request: generateNPCRequest(posNum), // Náhodný request!
        isSafe: posNum === 1,
        despawnTimer: null 
    };
    
    npcContainer.appendChild(npcElement);
    activeNPCs[posNum] = npcData;
    
    // Arthur zůstane déle (VIP!)
    npcData.despawnTimer = setTimeout(() => {
        removeNPC(posNum);
    }, 60000); // 60s místo 50s
    
    setTimeout(() => createNPCBubble(npcData, posNum), 500);
}

// Globální funkce pro manuální spawn
window.spawnArthur = spawnArthur;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startNPCSpawning, 10000);
});
