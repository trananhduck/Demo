// Constants
const CELL_TYPES = {
    EMPTY: 0,
    WALL: 1,
    RED: 'A',
    YELLOW: 'B',
    GREEN: 'C',
    ORANGE: 'D',
    PURPLE: 'E',
    BLUE: 'F',
    PINK: 'G'
};

// Game state
let currentLevel, circles, moveCount, startTime, elapsedTime = 0, interval, isPaused = false;

// DOM elements
const elements = {
    matrixContainer: document.getElementById('matrix'),
    timeDisplay: document.getElementById('time'),
    movesDisplay: document.getElementById('moves'),
    resetButton: document.getElementById('reset'),
    resumeButton: document.getElementById('resume'),
    backButton: document.getElementById('back'),
    victoryModal: document.getElementById('victory-modal'),
    resumeModal: document.getElementById('resume-modal'),
    continueButton: document.getElementById('continue'),
    levelSelectionButton: document.getElementById('level-selection'),
    backToLevelButton: document.getElementById('back-to-level'),
    levelDisplay: document.getElementById('level-display')
};

fetch('levels.json')
    .then(response => response.json())
    .then(data => {
        // Set the levels data
        levels = data;

        // Initialize the game or perform other operations
        initializeGame();
    })
    .catch(error => console.error('Error loading levels:', error));


function initializeLevel(levelIndex, resetTime = false) {
    currentLevel = levels[levelIndex];
    circles = JSON.parse(JSON.stringify(currentLevel.initialCircles)); // Deep copy
    moveCount = 0;
    updateMoveDisplay();
    if (resetTime) {
        resetTimer();
    } else {
        startTimer();
    }
    renderMatrix();
    renderCircles();
    updateLevelDisplay(levelIndex);
    adjustCellAndCircleSize(levelIndex);
}

function renderMatrix() {
    const matrixSize = currentLevel.matrix.length;
    const cellSize = getCellSize(levels.indexOf(currentLevel));
    elements.matrixContainer.style.gridTemplateColumns = `repeat(${matrixSize}, ${cellSize}px)`;
    elements.matrixContainer.style.gridTemplateRows = `repeat(${matrixSize}, ${cellSize}px)`;
    elements.matrixContainer.innerHTML = currentLevel.matrix.flat().map(cellValue => `
        <div class="cell ${getCellClass(cellValue)}"></div>
    `).join('');
}
function getCellSize(levelIndex) {
    return levelIndex <= 2 ? 50 : 30;
}

function getCircleSize(levelIndex) {
    return levelIndex <= 2 ? 40 : 20;
}
function adjustCellAndCircleSize(levelIndex) {
    const cellSize = getCellSize(levelIndex);
    const circleSize = getCircleSize(levelIndex);

    // Update CSS variables
    document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
    document.documentElement.style.setProperty('--circle-size', `${circleSize}px`);
}
function getCellClass(cellValue) {
    const classMap = {
        [CELL_TYPES.EMPTY]: 'white',
        [CELL_TYPES.WALL]: 'black',
        [CELL_TYPES.RED]: 'red',
        [CELL_TYPES.YELLOW]: 'yellow',
        [CELL_TYPES.GREEN]: 'green',
        [CELL_TYPES.ORANGE]: 'orange',
        [CELL_TYPES.PURPLE]: 'purple',
        [CELL_TYPES.BLUE]: 'blue',
        [CELL_TYPES.PINK]: 'pink',
    };
    return classMap[cellValue] || '';
}


function renderCircles() {
    document.querySelectorAll('.circle').forEach(circle => circle.remove());
    const matrixSize = currentLevel.matrix.length;
    const circleSize = getCircleSize(levels.indexOf(currentLevel));
    circles.forEach(circle => {
        const cell = elements.matrixContainer.children[circle.x * matrixSize + circle.y];
        const circleElement = document.createElement('div');
        circleElement.className = `circle ${circle.color}`;
        circleElement.style.width = `${circleSize}px`;
        circleElement.style.height = `${circleSize}px`;
        cell.appendChild(circleElement);
    });
    checkVictory();
}

function updateTime() {
    if (!isPaused) {
        const currentTime = Date.now();
        elapsedTime += currentTime - startTime;
        startTime = currentTime;

        const seconds = Math.floor(elapsedTime / 1000) % 60;
        const minutes = Math.floor(elapsedTime / 1000 / 60) % 60;
        const hours = Math.floor(elapsedTime / 1000 / 60 / 60);

        const formattedTime =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        elements.timeDisplay.textContent = `Time: ${formattedTime}`;
    }
}

function resetTimer() {
    clearInterval(interval);
    startTime = Date.now();
    elapsedTime = 0;
    interval = setInterval(updateTime, 1000);
    isPaused = false;
    updateTime();
}

function startTimer() {
    clearInterval(interval);
    startTime = Date.now();
    interval = setInterval(updateTime, 1000);
    isPaused = false;
}


function pauseTimer() {
    isPaused = true;
}

function resumeTimer() {
    if (isPaused) {
        startTime = Date.now();
        isPaused = false;
    }
}

function updateMoveDisplay() {
    elements.movesDisplay.textContent = `Moves: ${moveCount}`;
}

function updateLevelDisplay(levelIndex) {
    elements.levelDisplay.textContent = `Level: ${levelIndex + 1}`;
}

function isCellAvailable(x, y) {
    const matrixSize = currentLevel.matrix.length;
    return x >= 0 && x < matrixSize && y >= 0 && y < matrixSize &&
        currentLevel.matrix[x][y] !== CELL_TYPES.WALL &&
        !circles.some(circle => circle.x === x && circle.y === y);
}

function checkVictory() {
    const matrixSize = currentLevel.matrix.length;
    const won = circles.every(circle => {
        const cell = elements.matrixContainer.children[circle.x * matrixSize + circle.y];
        return cell.classList.contains(circle.color);
    });

    if (won) {
        clearInterval(interval);
        elements.victoryModal.style.display = 'flex';
    }
}

function moveCircle(direction) {
    if (isPaused) return;

    let moved = false;
    circles.forEach(circle => {
        const [dx, dy] = direction;
        const newX = circle.x + dx;
        const newY = circle.y + dy;

        if (isCellAvailable(newX, newY)) {
            circle.x = newX;
            circle.y = newY;
            moved = true;
        }
    });

    if (moved) {
        moveCount++;
        updateMoveDisplay();
        renderCircles();
    }
}

// Event Listeners
document.addEventListener('keydown', (event) => {
    if (event.key === 'F5') {
        event.preventDefault();
        return;
    }

    const directions = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1]
    };
    const direction = directions[event.key];
    if (direction) moveCircle(direction);
});
// Prevent F5 refresh
window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
});

elements.resetButton.addEventListener('click', () => initializeLevel(levels.indexOf(currentLevel), false));
elements.resumeButton.addEventListener('click', () => {
    elements.resumeModal.style.display = 'flex';
    pauseTimer();
});
elements.continueButton.addEventListener('click', () => {
    elements.resumeModal.style.display = 'none';
    resumeTimer();
});
elements.levelSelectionButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

elements.backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

elements.backToLevelButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

window.addEventListener('click', (event) => {
    if (event.target === elements.resumeModal || event.target === elements.victoryModal) {
        event.target.style.display = 'none';
        if (event.target === elements.resumeModal) {
            resumeTimer();
        }
    }
});


// Initialize the game based on the level parameter
function initializeGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = parseInt(urlParams.get('level')) - 1;
    if (level >= 0 && level < levels.length) {
        initializeLevel(level, true);
    } else {
        initializeLevel(0, true);
    }
}
// Swipe detection variables
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

document.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) {
            moveCircle([0, 1]);  // Swipe right
        } else {
            moveCircle([0, -1]); // Swipe left
        }
    } else {
        // Vertical swipe
        if (dy > 0) {
            moveCircle([1, 0]);  // Swipe down
        } else {
            moveCircle([-1, 0]); // Swipe up
        }
    }
});
// Initialize the first level
initializeGame();

// Disable viewport shifting on swipe
document.addEventListener('touchmove', (event) => {
    event.preventDefault(); // Prevent scrolling on touch swipe
}, { passive: false });
