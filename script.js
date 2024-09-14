const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');
const gridSize = 15;
const cellSize = 30;
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

const grid = [];
const start = { x: 0, y: 0 };
let goal = { x: gridSize - 1, y: gridSize - 1 };
let cellNumber = 1;
let searchRunning = false;
let startTime = 0;
let endTime = 0;
let cellsTraversed = 0;

// Initialize grid and assign numbers
for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
        grid[y][x] = { x, y, isPath: false, visited: false, number: cellNumber++ };
    }
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Get neighbors with shuffled order
const getNeighbors = (x, y) => {
    const neighbors = [];
    if (x > 0) neighbors.push({ x: x - 1, y });
    if (x < gridSize - 1) neighbors.push({ x: x + 1, y });
    if (y > 0) neighbors.push({ x, y: y - 1 });
    if (y < gridSize - 1) neighbors.push({ x, y: y + 1 });
    return neighbors;
};

// Heuristic function for A* and Best-First Search algorithms
const heuristic = (node) => Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);

// Draw the grid
const drawGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas to redraw the grid
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            
            if (cell.isBlock) {
                // Blocked cells highlighted in black
                ctx.fillStyle = 'black';
            } else if (cell.isPath) {
                // Path cells in light blue
                ctx.fillStyle = cell.pathColor || 'lightblue';
            } else if (cell.visited) {
                // Visited cells in light grey
                ctx.fillStyle = 'lightgrey';
            } else {
                // Default cells in white
                ctx.fillStyle = 'white';
            }

            // Draw each cell
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = 'black'; // Border for visibility
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Mark start and goal cells
    ctx.fillStyle = 'green'; // Start cell in green
    ctx.fillRect(start.x * cellSize, start.y * cellSize, cellSize, cellSize);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(start.x * cellSize, start.y * cellSize, cellSize, cellSize);

    ctx.fillStyle = 'red'; // Goal cell in red
    ctx.fillRect(goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);
};


// Disable all buttons
const disableButtons = () => {
    document.querySelectorAll('button').forEach(button => button.disabled = true);
};

// Enable all buttons
const enableButtons = () => {
    document.querySelectorAll('button').forEach(button => button.disabled = false);
};

// Clear grid content
const clearGrid = () => {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            grid[y][x].isPath = false;
            grid[y][x].visited = false;
            grid[y][x].isBlock = false; // Reset blocks
            grid[y][x].pathColor = '';
        }
    }
    drawGrid();
};

// Function to reconstruct and draw the shortest path
const drawPath = (cameFrom, end, pathColor) => {
    let node = end;
    cellsTraversed = 0;
    while (node) {
        grid[node.y][node.x].isPath = true;
        grid[node.y][node.x].pathColor = pathColor;
        node = cameFrom[`${node.x},${node.y}`];
        cellsTraversed++;
    }
    drawGrid();
};

// Function to show the result modal with a delay
const showResults = (timeTaken) => {
    const delay = 500; // Delay in milliseconds (e.g., 500 ms = 0.5 seconds)
    setTimeout(() => {
        const modal = document.getElementById('resultModal');
        const resultText = document.getElementById('resultText');
        resultText.innerHTML = `Time taken: ${timeTaken} ms<br>Cells traversed: ${cellsTraversed}`;
        modal.style.display = 'block';
    }, delay);
};

// Hide the result modal
const hideResults = () => {
    const modal = document.getElementById('resultModal');
    modal.style.display = 'none';
};

// A* algorithm
const aStar = async () => {
    if (searchRunning) return;
    searchRunning = true;
    disableButtons();
    clearGrid();
    startTime = performance.now();

    const openSet = [start];
    const cameFrom = {};
    const gScore = Array.from({ length: gridSize }, () => Array(gridSize).fill(Infinity));
    const fScore = Array.from({ length: gridSize }, () => Array(gridSize).fill(Infinity));

    gScore[start.y][start.x] = 0;
    fScore[start.y][start.x] = heuristic(start);

    while (openSet.length > 0) {
        openSet.sort((a, b) => fScore[a.y][a.x] - fScore[b.y][b.x]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            endTime = performance.now();
            drawPath(cameFrom, current, 'blue');
            showResults(endTime - startTime);
            searchRunning = false;
            enableButtons();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            if (grid[neighbor.y][neighbor.x].isBlock) continue; // Skip blocked cells
            const tentativeGScore = gScore[current.y][current.x] + 1;
            if (tentativeGScore < gScore[neighbor.y][neighbor.x]) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                gScore[neighbor.y][neighbor.x] = tentativeGScore;
                fScore[neighbor.y][neighbor.x] = gScore[neighbor.y][neighbor.x] + heuristic(neighbor);
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30));
        drawGrid();
    }
    searchRunning = false;
    enableButtons();
};

// BFS algorithm
const bfs = async () => {
    if (searchRunning) return;
    searchRunning = true;
    disableButtons();
    clearGrid();
    startTime = performance.now();

    const queue = [start];
    const cameFrom = {};
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.x === goal.x && current.y === goal.y) {
            endTime = performance.now();
            drawPath(cameFrom, current, 'green');
            showResults(endTime - startTime);
            searchRunning = false;
            enableButtons();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            if (!visited[neighbor.y][neighbor.x] && !grid[neighbor.y][neighbor.x].isBlock) {
                visited[neighbor.y][neighbor.x] = true;
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                queue.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30));
        drawGrid();
    }
    searchRunning = false;
    enableButtons();
};

// DFS algorithm
const dfs = async () => {
    if (searchRunning) return;
    searchRunning = true;
    disableButtons();
    clearGrid();
    startTime = performance.now();

    const stack = [start];
    const cameFrom = {};
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    while (stack.length > 0) {
        const current = stack.pop();
        visited[current.y][current.x] = true;

        if (current.x === goal.x && current.y === goal.y) {
            endTime = performance.now();
            drawPath(cameFrom, current, 'orange');
            showResults(endTime - startTime);
            searchRunning = false;
            enableButtons();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            if (!visited[neighbor.y][neighbor.x] && !grid[neighbor.y][neighbor.x].isBlock) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                stack.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30));
        drawGrid();
    }
    searchRunning = false;
    enableButtons();
};

// Dijkstra's algorithm
const dijkstra = async () => {
    if (searchRunning) return;
    searchRunning = true;
    disableButtons();
    clearGrid();
    startTime = performance.now();

    const openSet = [start];
    const cameFrom = {};
    const gScore = Array.from({ length: gridSize }, () => Array(gridSize).fill(Infinity));
    gScore[start.y][start.x] = 0;

    while (openSet.length > 0) {
        openSet.sort((a, b) => gScore[a.y][a.x] - gScore[b.y][b.x]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            endTime = performance.now();
            drawPath(cameFrom, current, 'purple');
            showResults(endTime - startTime);
            searchRunning = false;
            enableButtons();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            if (grid[neighbor.y][neighbor.x].isBlock) continue; // Skip blocked cells
            const tentativeGScore = gScore[current.y][current.x] + 1;
            if (tentativeGScore < gScore[neighbor.y][neighbor.x]) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                gScore[neighbor.y][neighbor.x] = tentativeGScore;
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30));
        drawGrid();
    }
    searchRunning = false;
    enableButtons();
};

// Best-First Search algorithm
const bestFirstSearch = async () => {
    if (searchRunning) return;
    searchRunning = true;
    disableButtons();
    clearGrid();
    startTime = performance.now();

    const openSet = [start];
    const cameFrom = {};
    const fScore = Array.from({ length: gridSize }, () => Array(gridSize).fill(Infinity));

    fScore[start.y][start.x] = heuristic(start);

    while (openSet.length > 0) {
        openSet.sort((a, b) => fScore[a.y][a.x] - fScore[b.y][b.x]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            endTime = performance.now();
            drawPath(cameFrom, current, 'cyan');
            showResults(endTime - startTime);
            searchRunning = false;
            enableButtons();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            if (grid[neighbor.y][neighbor.x].isBlock) continue; // Skip blocked cells
            const newFScore = heuristic(neighbor);
            if (newFScore < fScore[neighbor.y][neighbor.x]) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                fScore[neighbor.y][neighbor.x] = newFScore;
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30));
        drawGrid();
    }
    searchRunning = false;
    enableButtons();
};

// Bidirectional BFS algorithm
const bidirectionalBFS = async () => {
    if (searchRunning) return;
    searchRunning = true;
    disableButtons();
    clearGrid();
    startTime = performance.now();

    const startQueue = [start];
    const goalQueue = [goal];
    const startCameFrom = {};
    const goalCameFrom = {};
    const startVisited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    const goalVisited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    startVisited[start.y][start.x] = true;
    goalVisited[goal.y][goal.x] = true;

    let meetingNode = null;

    while (startQueue.length > 0 && goalQueue.length > 0) {
        const currentStart = startQueue.shift();
        const currentGoal = goalQueue.shift();

        if (goalVisited[currentStart.y][currentStart.x]) {
            meetingNode = currentStart;
            break;
        }
        if (startVisited[currentGoal.y][currentGoal.x]) {
            meetingNode = currentGoal;
            break;
        }

        for (const neighbor of getNeighbors(currentStart.x, currentStart.y)) {
            if (!startVisited[neighbor.y][neighbor.x] && !grid[neighbor.y][neighbor.x].isBlock) {
                startVisited[neighbor.y][neighbor.x] = true;
                startCameFrom[`${neighbor.x},${neighbor.y}`] = currentStart;
                startQueue.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }

        for (const neighbor of getNeighbors(currentGoal.x, currentGoal.y)) {
            if (!goalVisited[neighbor.y][neighbor.x] && !grid[neighbor.y][neighbor.x].isBlock) {
                goalVisited[neighbor.y][neighbor.x] = true;
                goalCameFrom[`${neighbor.x},${neighbor.y}`] = currentGoal;
                goalQueue.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }

        await new Promise(resolve => setTimeout(resolve, 30));
        drawGrid();
    }

    if (meetingNode) {
        const pathFromStart = [];
        let node = meetingNode;
        while (node) {
            pathFromStart.push(node);
            node = startCameFrom[`${node.x},${node.y}`];
        }

        const pathFromGoal = [];
        node = meetingNode;
        while (node) {
            pathFromGoal.push(node);
            node = goalCameFrom[`${node.x},${node.y}`];
        }

        pathFromStart.reverse().concat(pathFromGoal).forEach(node => {
            grid[node.y][node.x].isPath = true;
            grid[node.y][node.x].pathColor = 'magenta';
        });

        endTime = performance.now();
        showResults(endTime - startTime);
    } else {
        alert('No path found');
    }
    searchRunning = false;
    enableButtons();
};

// Handle canvas click to place blocks or set goal
// Handle canvas click to place blocks or set goal
let placingBlock = false;
document.getElementById('blockButton').addEventListener('click', () => {
    placingBlock = !placingBlock;
    document.getElementById('blockButton').innerText = placingBlock ? 'Done Placing Blocks' : 'Place Block';
});

canvas.addEventListener('click', (event) => {
    if (searchRunning) return;

    // Get the canvas bounding rectangle
    const rect = canvas.getBoundingClientRect();
    
    // Calculate the click position relative to the canvas
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    // Ensure the coordinates are within bounds
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        if (placingBlock) {
            grid[y][x].isBlock = true; // Mark cell as blocked
            drawGrid();
        } else {
            goal = { x, y };
            drawGrid();
        }
    }
});

// Set up button event listeners
document.getElementById('aStarButton').addEventListener('click', aStar);
document.getElementById('bfsButton').addEventListener('click', bfs);
document.getElementById('dfsButton').addEventListener('click', dfs);
document.getElementById('dijkstraButton').addEventListener('click', dijkstra);
document.getElementById('bestFirstButton').addEventListener('click', bestFirstSearch);
document.getElementById('bidirectionalBfsButton').addEventListener('click', bidirectionalBFS);

// Draw initial grid
drawGrid();
