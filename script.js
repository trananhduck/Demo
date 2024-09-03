const matrixData = [
    ['C', 1, 0, 'A'],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 'B']
];

const matrixContainer = document.getElementById('matrix');
const timeDisplay = document.getElementById('time');
const movesDisplay = document.getElementById('moves');
const resetButton = document.getElementById('reset');
const resumeButton = document.getElementById('resume');
const backButton = document.getElementById('back');
const victoryModal = document.getElementById('victory-modal');
const resumeModal = document.getElementById('resume-modal');
const continueButton = document.getElementById('continue');
const levelSelectionButton = document.getElementById('level-selection');
const backToLevelButton = document.getElementById('back-to-level');

let circles = [
    { x: 3, y: 0, color: 'red' },
    { x: 1, y: 0, color: 'yellow' },
    { x: 1, y: 2, color: 'green' }
];

let moveCount = 0;
let startTime;
let interval;

function initialize() {
    matrixContainer.innerHTML = '';
    circles = [
        { x: 3, y: 0, color: 'red' },
        { x: 1, y: 0, color: 'yellow' },
        { x: 1, y: 2, color: 'green' }
    ];
    moveCount = 0;
    document.getElementById('moves').textContent = `Moves: ${moveCount}`;
    if (startTime) {
        clearInterval(interval);
        startTime = new Date();
        interval = setInterval(updateTime, 1000);
    } else {
        startTime = new Date();
        interval = setInterval(updateTime, 1000);
    }
    renderMatrix();
    renderCircles();
}

function renderMatrix() {
    matrixData.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            switch (cellValue) {
                case 0:
                    cell.classList.add('white');
                    break;
                case 1:
                    cell.classList.add('black');
                    break;
                case 'A':
                    cell.classList.add('red');
                    break;
                case 'B':
                    cell.classList.add('yellow');
                    break;
                case 'C':
                    cell.classList.add('green');
                    break;
                default:
                    break;
            }

            matrixContainer.appendChild(cell);
        });
    });
}

function renderCircles() {
    document.querySelectorAll('.circle').forEach(circle => circle.remove());

    circles.forEach(circle => {
        const cellIndex = circle.x * matrixData[0].length + circle.y;
        const cell = matrixContainer.children[cellIndex];

        const circleElement = document.createElement('div');
        circleElement.classList.add('circle', circle.color);
        cell.appendChild(circleElement);
    });

    checkVictory();
}

function updateTime() {
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    timeDisplay.textContent = `Time: ${elapsed}s`;
}

function isCellAvailable(x, y) {
    if (x < 0 || x >= matrixData.length || y < 0 || y >= matrixData[0].length) {
        return false;
    }

    if (matrixData[x][y] === 1) {
        return false;
    }

    if (circles.some(circle => circle.x === x && circle.y === y)) {
        return false;
    }

    return true;
}

let victoryCheckTimeout = null; // To store the timeout ID

function checkVictory() {
    // Clear any existing timeout
    if (victoryCheckTimeout) {
        clearTimeout(victoryCheckTimeout);
    }

    // Set a timeout to check victory after 1 second
    victoryCheckTimeout = setTimeout(() => {
        let won = true;
        circles.forEach(circle => {
            const cellIndex = circle.x * matrixData[0].length + circle.y;
            const cell = matrixContainer.children[cellIndex];
            if (!cell.classList.contains(circle.color)) {
                won = false;
            }
        });

        if (won) {
            clearInterval(interval);
            victoryModal.style.display = 'flex';
        }
    }, 1000); // Check after 1 second
}

document.addEventListener('keydown', (event) => {
    const keyName = event.key;

    circles.forEach(circle => {
        let newX = circle.x;
        let newY = circle.y;

        switch (keyName) {
            case 'ArrowUp':
                newX = circle.x - 1;
                break;
            case 'ArrowDown':
                newX = circle.x + 1;
                break;
            case 'ArrowLeft':
                newY = circle.y - 1;
                break;
            case 'ArrowRight':
                newY = circle.y + 1;
                break;
            default:
                return;
        }

        if (isCellAvailable(newX, newY)) {
            circle.x = newX;
            circle.y = newY;
            moveCount++;
            document.getElementById('moves').textContent = `Moves: ${moveCount}`;
            renderCircles();
        }
    });
});

resetButton.addEventListener('click', () => {
    initialize();
});

resumeButton.addEventListener('click', () => {
    resumeModal.style.display = 'flex';
});

continueButton.addEventListener('click', () => {
    resumeModal.style.display = 'none';
    if (!startTime) {
        startTime = new Date();
        interval = setInterval(updateTime, 1000);
    }
});

levelSelectionButton.addEventListener('click', () => {
    window.location.href = 'level-selection.html'; // Modify as needed for your level selection page
});

backButton.addEventListener('click', () => {
    window.location.href = 'level-selection.html'; // Modify as needed for your level selection page
});

backToLevelButton.addEventListener('click', () => {
    window.location.href = 'level-selection.html'; // Modify as needed for your level selection page
});

window.addEventListener('click', (event) => {
    if (event.target === resumeModal) {
        resumeModal.style.display = 'none';
    }
    if (event.target === victoryModal) {
        victoryModal.style.display = 'none';
    }
});

initialize();
