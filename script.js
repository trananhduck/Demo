const matrixData = [
    ['C', 1, 0, 'A'],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 'B']
];

const matrixContainer = document.getElementById('matrix');

// Set the grid template based on the matrix size
matrixContainer.style.gridTemplateColumns = `repeat(${matrixData[0].length}, 50px)`; // Ensure cell size matches CSS
matrixContainer.style.gridTemplateRows = `repeat(${matrixData.length}, 50px)`; // Ensure cell size matches CSS

// Initial positions of the circles
let circles = [
    { x: 3, y: 0, color: 'red' },
    { x: 1, y: 0, color: 'yellow' },
    { x: 1, y: 2, color: 'green' }
];

// Create the cells for the matrix
matrixData.forEach((row, rowIndex) => {
    row.forEach((cellValue, colIndex) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        // Apply color based on the value of the cell
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

// Function to render circles at their current positions
function renderCircles() {
    // Clear existing circles
    document.querySelectorAll('.circle').forEach(circle => circle.remove());

    circles.forEach(circle => {
        const cellIndex = circle.x * matrixData[0].length + circle.y;
        const cell = matrixContainer.children[cellIndex];

        const circleElement = document.createElement('div');
        circleElement.classList.add('circle', circle.color);
        cell.appendChild(circleElement);
    });
}

// Check if a cell is available for moving into
function isCellAvailable(x, y) {
    // Check matrix bounds
    if (x < 0 || x >= matrixData.length || y < 0 || y >= matrixData[0].length) {
        return false;
    }

    // Check if the cell is not a black obstacle
    if (matrixData[x][y] === 1) {
        return false;
    }

    // Check if another circle is already in the cell
    for (let i = 0; i < circles.length; i++) {
        if (circles[i].x === x && circles[i].y === y) {
            return false;
        }
    }

    return true;
}

// Handle arrow key movements
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
                return; // Ignore other keys
        }

        // Check if the new position is available
        if (isCellAvailable(newX, newY)) {
            circle.x = newX;
            circle.y = newY;
        }
    });

    // Re-render circles after updating positions
    renderCircles();
});

// Initial render of circles
renderCircles();
