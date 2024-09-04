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

// Level configurations
const levels = [
    {
        matrix: [
            ['C', 1, 0, 'A'],
            [0, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 0, 0, 'B']
        ],
        initialCircles: [
            { x: 3, y: 0, color: 'red' },
            { x: 1, y: 0, color: 'yellow' },
            { x: 1, y: 2, color: 'green' }
        ]
    },
    {
        matrix: [
            [0, 'C', 1, 0, 'A'],
            [0, 0, 0, 1, 0],
            ['B', 0, 1, 0, 0],
            [0, 0, 'D', 0, 1],
            [1, 0, 0, 0, 0]
        ],
        initialCircles: [
            { x: 1, y: 2, color: 'red' },
            { x: 2, y: 4, color: 'yellow' },
            { x: 3, y: 1, color: 'green' },
            { x: 4, y: 4, color: 'orange' }
        ]
    },
    {
        matrix: [
            [0, 'D', 1, 0, 0, 'A'],
            [0, 1, 0, 0, 1, 0],
            [0, 0, 0, 1, 0, "C"],
            [1, 0, 1, 0, 0, 1],
            [0, 'B', 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0]
        ],
        initialCircles: [
            { x: 2, y: 1, color: 'red' },
            { x: 2, y: 4, color: 'yellow' },
            { x: 5, y: 5, color: 'green' },
            { x: 3, y: 4, color: 'orange' },
        ]
    },
    {
        matrix: [
            [0, 'C', 1, 0, 'D', 0, 0, 0],
            [0, 1, 0, 0, 1, 0, 1, 1],
            [0, 'B', 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 0, 1, 1, 0],
            [0, 0, 0, 0, 1, 0, 1, 1],
            [0, 1, 0, 0, 0, 'E', 1, 0],
            [1, 0, 0, 0, 1, 0, 0, 0],
            [0, 'A', 0, 1, 0, 0, 0, 'F']
        ],
        initialCircles: [
            { x: 2, y: 1, color: 'red' },
            { x: 6, y: 2, color: 'yellow' },
            { x: 5, y: 5, color: 'green' },
            { x: 3, y: 4, color: 'orange' },
            { x: 0, y: 7, color: 'purple' },
            { x: 3, y: 7, color: 'blue' },
        ]
    }
];

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
}

function renderMatrix() {
    const matrixSize = currentLevel.matrix.length;
    elements.matrixContainer.style.gridTemplateColumns = `repeat(${matrixSize}, 50px)`;
    elements.matrixContainer.style.gridTemplateRows = `repeat(${matrixSize}, 50px)`;
    elements.matrixContainer.innerHTML = currentLevel.matrix.flat().map(cellValue => `
        <div class="cell ${getCellClass(cellValue)}"></div>
    `).join('');
}

function getCellClass(cellValue) {
    const classMap = {
        [CELL_TYPES.EMPTY]: 'white',
        [CELL_TYPES.WALL]: 'black',
        [CELL_TYPES.RED]: 'red',
        [CELL_TYPES.YELLOW]: 'yellow',
        [CELL_TYPES.GREEN]: 'green',  // Thêm dòng này để ánh xạ lớp 'green'
        [CELL_TYPES.ORANGE]: 'orange',
        [CELL_TYPES.PURPLE]: 'purple',
        [CELL_TYPES.BLUE]: 'blue',
    };
    return classMap[cellValue] || '';
}


function renderCircles() {
    document.querySelectorAll('.circle').forEach(circle => circle.remove());
    const matrixSize = currentLevel.matrix.length;
    circles.forEach(circle => {
        const cell = elements.matrixContainer.children[circle.x * matrixSize + circle.y];
        const circleElement = document.createElement('div');
        circleElement.className = `circle ${circle.color}`;
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
    const level = parseInt(urlParams.get('level')) - 1; // Trừ 1 vì mảng bắt đầu từ 0
    if (level >= 0 && level < levels.length) {
        initializeLevel(level, true);
    } else {
        // Nếu không có level hợp lệ, bắt đầu với level 1
        initializeLevel(0, true);
    }
}

// Initialize the first level
initializeGame();