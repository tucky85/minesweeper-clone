const ROWS = 8;
const COLS = 8;
const MINES = 10;

let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let gameWon = false;
let minesRemaining = MINES;
let startTime = null;
let timerInterval = null;

// Initialize the game
function initGame() {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    revealed = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
    flagged = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
    gameOver = false;
    gameWon = false;
    minesRemaining = MINES;
    startTime = null;
    clearInterval(timerInterval);
    document.getElementById('timer').textContent = '0';
    document.getElementById('gameStatus').textContent = '';
    document.getElementById('gameStatus').className = '';
    document.getElementById('mineCount').textContent = MINES;

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);
        if (board[row][col] !== 'M') {
            board[row][col] = 'M';
            minesPlaced++;
        }
    }

    // Calculate numbers
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 'M') {
                board[r][c] = countAdjacentMines(r, c);
            }
        }
    }

    renderBoard();
}

// Count adjacent mines for a tile
function countAdjacentMines(row, col) {
    let count = 0;
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === 'M') {
                count++;
            }
        }
    }
    return count;
}

// Render the game board
function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = r;
            tile.dataset.col = c;

            if (revealed[r][c]) {
                tile.classList.add('revealed');
                if (board[r][c] === 'M') {
                    tile.classList.add('mine');
                } else {
                    tile.classList.add('safe');
                    if (board[r][c] > 0) {
                        tile.textContent = board[r][c];
                        tile.classList.add(`mine-${board[r][c]}`);
                    }
                }
            } else if (flagged[r][c]) {
                tile.classList.add('flagged');
            }

            tile.addEventListener('click', () => revealTile(r, c));
            tile.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagTile(r, c);
            });

            gameBoard.appendChild(tile);
        }
    }
}

// Start timer on first click
function startTimer() {
    if (startTime === null) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById('timer').textContent = elapsed;
        }, 100);
    }
}

// Reveal a tile
function revealTile(row, col) {
    if (gameOver || gameWon || revealed[row][col] || flagged[row][col]) {
        return;
    }

    startTimer();

    revealed[row][col] = true;

    if (board[row][col] === 'M') {
        // Hit a mine - game over
        gameOver = true;
        revealAllMines();
        document.getElementById('gameStatus').textContent = '💥 Game Over! You hit a mine.';
        document.getElementById('gameStatus').className = 'lose';
        clearInterval(timerInterval);
        return;
    }

    // If it's a safe tile with no adjacent mines, reveal neighbors
    if (board[row][col] === 0) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !revealed[r][c]) {
                    revealTile(r, c);
                }
            }
        }
    }

    checkWin();
    renderBoard();
}

// Flag/unflag a tile
function flagTile(row, col) {
    if (gameOver || gameWon || revealed[row][col]) {
        return;
    }

    flagged[row][col] = !flagged[row][col];
    minesRemaining = MINES - flagged.flat().filter(f => f).length;
    document.getElementById('mineCount').textContent = minesRemaining;

    renderBoard();
}

// Reveal all mines when game is lost
function revealAllMines() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === 'M') {
                revealed[r][c] = true;
            }
        }
    }
}

// Check if player won
function checkWin() {
    let allSafeRevealed = true;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 'M' && !revealed[r][c]) {
                allSafeRevealed = false;
                break;
            }
        }
        if (!allSafeRevealed) break;
    }

    if (allSafeRevealed) {
        gameWon = true;
        document.getElementById('gameStatus').textContent = '🎉 You Won!';
        document.getElementById('gameStatus').className = 'win';
        clearInterval(timerInterval);
    }
}

// Reset button
document.getElementById('resetBtn').addEventListener('click', initGame);

// Start the game
initGame();
