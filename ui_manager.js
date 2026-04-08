export class UIManager {
    /**
     * @param {function(number): void} moveHandler - Callback function to execute when a cell is clicked, passing the cell index.
     */
    constructor(moveHandler) {
        this.onMoveCallback = moveHandler;
        this.initialize();
    }

    initialize() {
        console.log("UI Manager initialized.");
        const gameBoardContainer = document.getElementById('game-container');
        if (!gameBoardContainer) {
            console.error("Could not find #game-container. Ensure the HTML is loaded.");
            return;
        }
        
        // Securely rebuilding the board structure with updated event handling wiring
        gameBoardContainer.innerHTML = `
            <div id="board" class="game-board">
                <div id="cell-0" class="cell"></div>
                <div id="cell-1" class="cell"></div>
                <div id="cell-2" class="cell"></div>
                <div id="cell-3" class="cell"></div>
                <div id="cell-4" class="cell"></div>
                <div id="cell-5" class="cell"></div>
                <div id="cell-6" class="cell"></div>
                <div id="cell-7" class="cell"></div>
                <div id="cell-8" class="cell"></div>
            </div>
            <div class="game-control">
                <div id="status-message">Current Player: X</div>
                <button id="reset-button">Reset Game</button>
            </div>
        `;
        
        // Attach the event listener using the provided callback
        const boardElement = document.getElementById('board');
        if (boardElement) {
            Array.from(boardElement.children).forEach((cell, index) => {
                cell.addEventListener('click', () => {
                    this.onMoveCallback(index);
                });
            });
        }
        
        // Reattach reset button listener
        document.getElementById('reset-button').addEventListener('click', () => {
            window.resetGameDisplay([]);
        });
    }

    /**
     * Renders the board state by updating text content and class names.
     * @param {string[]} boardState - An array of 9 elements ('X', 'O', null).
     */
    renderBoard(boardState) {
        const cellElements = document.getElementById('board').children;
        if (!cellElements) return;
        
        for (let i = 0; i < 9; i++) {
            const cellElement = cellElements[i];
            if (cellElement) {
                cellElement.textContent = boardState[i] || '';
                // Re-apply and manage classes for consistent styling
                cellElement.className = `cell ${boardState[i] ? 'filled' : ''}`;
            }
        }
    }

    /**
     * Updates the status message display.
     * @param {string} message - The message to display.
     * @param {("X"|"O"|null)} currentPlayer - 'X', 'O', or null if no player context.
     */
    updateStatus(message, currentPlayer) {
        const statusElement = document.getElementById('status-message');
        if (!statusElement) return;
        
        let playerColor = '';
        let playerSymbol = currentPlayer;
        
        if (currentPlayer) {
            playerSymbol = currentPlayer;
            playerColor = currentPlayer === 'X' ? '#e74c3c' : '#3498db';
        } else {
            playerSymbol = null;
        }
        
        statusElement.innerHTML = `
            ${playerSymbol ? `<span style="color: ${playerColor};">Current Player: ${playerSymbol}</span><br>` : ''}
            ${message}
        `;
    }

    /**
     * Resets the display elements to a default start state.
     * @param {string[]} initialBoardState 
     */
    resetGameDisplay(initialBoardState) {
        this.renderBoard(initialBoardState);
        this.updateStatus("Make your move!", 'X');
    }

    /**
     * Binds the specific click handler for the game board to use the provided move callback.
     * @returns {Function} The function that should be used by the controller layer.
     */
    setupBoardListeners() {
        const boardElement = document.getElementById('board');
        if (!boardElement) {
            console.error("Game board element not found to attach listeners.");
            return (index) => {}; 
        }
        
        // Manually attach click listeners to the 9 direct children cells
        const cells = Array.from(boardElement.children);
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => {
                this.onMoveCallback(index);
            });
        });
        
        return (index) => { this.onMoveCallback(index); };
    }
}