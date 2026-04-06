document.addEventListener('DOMContentLoaded', () => {
    const statusDisplay = document.getElementById('status-message');
    const resetButton = document.getElementById('reset-button');

    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = ["", "", "", "", "", "", "", "", ""];

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const handleCellClick = (clickedCellEvent) => {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // Check if the game is active or if the cell has already been marked
        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        // Update state and UI
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = currentPlayer;
        clickedCell.classList.add(currentPlayer);

        // Check for win or draw
        const winner = checkWin(clickedCellIndex);
        if (winner) {
            statusDisplay.innerHTML = `Winner: ${winner}!`;
            gameActive = false;
            return;
        }

        if (!checkDraw()) {
            // If it's computer's turn (player O), trigger computer move immediately
            if (currentPlayer === 'O') {
                computerMove();
            } else {
                // Player X just moved, switch to computer's turn
                currentPlayer = 'O';
                statusDisplay.innerHTML = `Computer's turn`;
                // Trigger computer move immediately
                computerMove();
            }
        } else {
            statusDisplay.innerHTML = `It's a Draw!`;
            gameActive = false;
        }
    };

    const checkWin = (lastMoveIndex) => {
        for (const condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                const cells = document.querySelectorAll('.cell');
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                return gameState[a];
            }
        }
        return null;
    };

    const checkDraw = () => {
        // Check if all spots are filled and no winner was found
        if (!gameState.includes("")) {
            return true;
        }
        return false;
    };

    const handleResetGame = () => {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.innerHTML = `X's turn`;

        // Remove winning cell highlights
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('winner');
        });

        cells.forEach((cell, index) => {
            cell.innerHTML = "";
            cell.className = 'cell'; // Reset classes
        });
    };

    // Create game board grid
    const gameBoard = document.getElementById('game-board');
    const cells = [];

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        gameBoard.appendChild(cell);
        cells.push(cell);
    }

    // Event listeners
    cells.forEach((cell) => {
        cell.addEventListener('click', handleCellClick);
    });

    resetButton.addEventListener('click', handleResetGame);

    // Computer move logic (Player O - Computer)
    const computerMove = () => {
        if (!gameActive) return;

        // Get all available empty cells
        const availableCells = gameState
            .map((cell, index) => (cell === "" ? index : null))
            .filter((index) => index !== null);

        if (availableCells.length === 0) return;

        // Simple AI: 1. Try to win, 2. Block player, 3. Take center, 4. Random
        let moveIndex = findBestMove(availableCells);

        // If no winning/blocking move, take center if available
        if (moveIndex === null && gameState[4] === "") {
            moveIndex = 4;
        }

        // If still no move, pick random available cell
        if (moveIndex === null) {
            moveIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
        }

        // Execute the move
        gameState[moveIndex] = currentPlayer;
        cells[moveIndex].innerHTML = currentPlayer;
        cells[moveIndex].classList.add(currentPlayer);

        // Check for win or draw
        const winner = checkWin(moveIndex);
        if (winner) {
            statusDisplay.innerHTML = `Winner: ${winner}!`;
            gameActive = false;
            return;
        }

        if (!checkDraw()) {
            // Switch back to player X's turn
            currentPlayer = 'X';
            statusDisplay.innerHTML = `Player X's turn`;
        } else {
            statusDisplay.innerHTML = `It's a Draw!`;
            gameActive = false;
        }
    };

    // Helper function to find best move (win or block)
    const findBestMove = (availableCells) => {
        // Check if computer can win
        for (const index of availableCells) {
            gameState[index] = 'O';
            if (checkWinForCondition(index, 'O')) {
                gameState[index] = ""; // Reset
                return index;
            }
            gameState[index] = ""; // Reset
        }

        // Check if player can win (need to block)
        for (const index of availableCells) {
            gameState[index] = 'X';
            if (checkWinForCondition(index, 'X')) {
                gameState[index] = ""; // Reset
                return index;
            }
            gameState[index] = ""; // Reset
        }

        return null;
    };

    // Helper to check winning condition for a specific player
    const checkWinForCondition = (lastMoveIndex, player) => {
        for (const condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
                return true;
            }
        }
        return false;
    };

    // Initialize status message
    statusDisplay.innerHTML = `X's turn`;
});
