const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const cellSize = 30;  // Adjusted size for better visibility
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

const grid = [];
const start = { x: 0, y: 0 };
const goal = { x: gridSize - 1, y: gridSize - 1 };
let cellNumber = 1; 

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
    if (x > 0) neighbors.push({ x: x - 1, y }); // Left
    if (x < gridSize - 1) neighbors.push({ x: x + 1, y }); // Right
    if (y > 0) neighbors.push({ x, y: y - 1 }); // Up
    if (y < gridSize - 1) neighbors.push({ x, y: y + 1 }); // Down
    return shuffleArray(neighbors);
};

// Heuristic function for A* and Best-First Search algorithms
const heuristic = (node) => Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);

// Draw the grid
const drawGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            ctx.fillStyle = cell.isPath ? 'blue' : cell.visited ? 'lightgrey' : 'white';
            ctx.strokeStyle = 'black';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
          
        }
    }
    ctx.fillStyle = 'green';
    ctx.fillRect(start.x * cellSize, start.y * cellSize, cellSize, cellSize);
    ctx.fillStyle = 'red';
    ctx.fillRect(goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);
};

// A* algorithm
const aStar = async () => {
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
            // Reconstruct path
            let path = [];
            let node = current;
            while (node) {
                path.push(node);
                node = cameFrom[`${node.x},${node.y}`];
            }
            path.reverse();
            path.forEach(node => grid[node.y][node.x].isPath = true);
            drawGrid();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
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
        await new Promise(resolve => setTimeout(resolve, 30)); // Slow down visualization
        drawGrid();
    }
};

// BFS algorithm
const bfs = async () => {
    const queue = [start];
    const cameFrom = {};
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.x === goal.x && current.y === goal.y) {
            // Reconstruct path
            let path = [];
            let node = current;
            while (node) {
                path.push(node);
                node = cameFrom[`${node.x},${node.y}`];
            }
            path.reverse();
            path.forEach(node => grid[node.y][node.x].isPath = true);
            drawGrid();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            if (!visited[neighbor.y][neighbor.x]) {
                visited[neighbor.y][neighbor.x] = true;
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                queue.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30)); // Slow down visualization
        drawGrid();
    }
};

// DFS algorithm
const dfs = async () => {
    const stack = [start];
    const cameFrom = {};
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    visited[start.y][start.x] = true;

    while (stack.length > 0) {
        const current = stack.pop();

        if (current.x === goal.x && current.y === goal.y) {
            // Reconstruct path
            let path = [];
            let node = current;
            while (node) {
                path.push(node);
                node = cameFrom[`${node.x},${node.y}`];
            }
            path.reverse();
            path.forEach(node => grid[node.y][node.x].isPath = true);
            drawGrid();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            if (!visited[neighbor.y][neighbor.x]) {
                visited[neighbor.y][neighbor.x] = true;
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                stack.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30)); // Slow down visualization
        drawGrid();
    }
};

// Dijkstra's Algorithm
const dijkstra = async () => {
    const openSet = [start];
    const cameFrom = {};
    const gScore = Array.from({ length: gridSize }, () => Array(gridSize).fill(Infinity));
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    gScore[start.y][start.x] = 0;

    while (openSet.length > 0) {
        openSet.sort((a, b) => gScore[a.y][a.x] - gScore[b.y][b.x]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            // Reconstruct path
            let path = [];
            let node = current;
            while (node) {
                path.push(node);
                node = cameFrom[`${node.x},${node.y}`];
            }
            path.reverse();
            path.forEach(node => grid[node.y][node.x].isPath = true);
            drawGrid();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            const tentativeGScore = gScore[current.y][current.x] + 1;
            if (tentativeGScore < gScore[neighbor.y][neighbor.x]) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                gScore[neighbor.y][neighbor.x] = tentativeGScore;
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
            visited[neighbor.y][neighbor.x] = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30)); // Slow down visualization
        drawGrid();
    }
};

// Greedy Best-First Search
const bestFirst = async () => {
    const openSet = [start];
    const cameFrom = {};
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    // Initialize the starting cell as visited
    visited[start.y][start.x] = true;

    while (openSet.length > 0) {
        // Sort openSet based on heuristic values (distance to goal)
        openSet.sort((a, b) => heuristic(a) - heuristic(b));
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            // Reconstruct path
            let path = [];
            let node = current;
            while (node) {
                path.push(node);
                node = cameFrom[`${node.x},${node.y}`];
            }
            path.reverse();  // Reverse path to start from the beginning
            path.forEach(node => grid[node.y][node.x].isPath = true);
            drawGrid();
            return;
        }

        for (const neighbor of getNeighbors(current.x, current.y)) {
            if (!visited[neighbor.y][neighbor.x]) {
                visited[neighbor.y][neighbor.x] = true;
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                openSet.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30)); // Slow down visualization
        drawGrid();
    }
};

// Bidirectional BFS
const bidirectional = async () => {
    const startQueue = [start];
    const goalQueue = [goal];
    const startCameFrom = {};
    const goalCameFrom = {};
    const startVisited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    const goalVisited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    startVisited[start.y][start.x] = true;
    goalVisited[goal.y][goal.x] = true;

    while (startQueue.length > 0 && goalQueue.length > 0) {
        // Forward search
        const currentStart = startQueue.shift();
        if (goalVisited[currentStart.y][currentStart.x]) {
            // Reconstruct path
            let path = [];
            let node = currentStart;
            while (node) {
                path.push(node);
                node = startCameFrom[`${node.x},${node.y}`];
            }
            path.reverse();
            node = path[path.length - 1];
            while (node) {
                path.push(node);
                node = goalCameFrom[`${node.x},${node.y}`];
            }
            path.forEach(node => grid[node.y][node.x].isPath = true);
            drawGrid();
            return;
        }

        for (const neighbor of getNeighbors(currentStart.x, currentStart.y)) {
            if (!startVisited[neighbor.y][neighbor.x]) {
                startVisited[neighbor.y][neighbor.x] = true;
                startCameFrom[`${neighbor.x},${neighbor.y}`] = currentStart;
                startQueue.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }

        // Backward search
        const currentGoal = goalQueue.shift();
        if (startVisited[currentGoal.y][currentGoal.x]) {
            // Reconstruct path
            let path = [];
            let node = currentGoal;
            while (node) {
                path.push(node);
                node = goalCameFrom[`${node.x},${node.y}`];
            }
            path.reverse();
            node = path[path.length - 1];
            while (node) {
                path.push(node);
                node = startCameFrom[`${node.x},${node.y}`];
            }
            path.forEach(node => grid[node.y][node.x].isPath = true);
            drawGrid();
            return;
        }

        for (const neighbor of getNeighbors(currentGoal.x, currentGoal.y)) {
            if (!goalVisited[neighbor.y][neighbor.x]) {
                goalVisited[neighbor.y][neighbor.x] = true;
                goalCameFrom[`${neighbor.x},${neighbor.y}`] = currentGoal;
                goalQueue.push(neighbor);
            }
            grid[neighbor.y][neighbor.x].visited = true;
        }
        await new Promise(resolve => setTimeout(resolve, 30)); // Slow down visualization
        drawGrid();
    }
};

// Start the selected algorithm
const startAlgorithm = (algorithm) => {
    switch (algorithm) {
        case 'aStar':
            aStar();
            break;
        case 'bfs':
            bfs();
            break;
        case 'dfs':
            dfs();
            break;
        case 'dijkstra':
            dijkstra();
            break;
        case 'bestFirst':
            bestFirst();
            break;
        case 'bidirectional':
            bidirectional();
            break;
        default:
            console.log('Unknown algorithm');
    }
};

drawGrid();
