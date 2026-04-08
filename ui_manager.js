/**
 * UI Manager Module (Singleton)
 * Handles all rendering and user interaction binding.
 */
const UIManager = (() => {
    const initialize = () => {
        console.log("UI Manager initialized.");
        // Bind event listeners here if needed.
        document.getElementById('game-container').innerHTML = `
            <h2>Game Board</h2>
            <div id="board" style="display: grid; grid-template-columns: repeat(3, 100px); gap: 5px; margin-bottom: 20px;">
                <div id="cell-0"></div>
                <div id="cell-1"></div>
                <div id="cell-2"></div>
                <div id="cell-3"></div>
                <div id="cell-4"></div>
                <div id="cell-5"></div>
                <div id="cell-6"></div>
                <div id="cell-7"></div>
                <div id="cell-8"></div>
            </div>
            <div id="status-message" style="padding: 10px; border: 1px solid #ccc;">
                Current Player: X
            </div>
            <button id="reset-button">Reset Game</button>
        `;
        document.getElementById('reset-button').addEventListener('click', () => {
             // This function will be called by the main game loop
             window.resetGameDisplay([]);
        });
    };
    /**
     * Renders the board state.
     * @param {string[]} boardState - An array of 9 elements ('X', 'O', null).
     */
    const renderBoard = (boardState) => {
        const cells = document.getElementById('board');
        
        boardState.forEach((value, index) => {
            const cellElement = document.getElementById(`cell-${index}`);
            if (cellElement) {
                cellElement.textContent = value || '';
                cellElement.className = `cell ${value ? 'filled' : ''}`;
            }
        });
    };
    /**
     * Updates the status message display.
     * @param {string} message - The message to display.
     * @param {string} currentPlayer - 'X' or 'O'.
     */
    const updateStatus = (message, currentPlayer) => {
        const statusElement = document.getElementById('status-message');
        statusElement.innerHTML = `
            <span style="color: ${currentPlayer === 'X' ? 'red' : 'blue'};">Current Player: ${currentPlayer}</span><br>
            ${message}
        `;
    };
    /**
     * Resets the display elements.
     * @param {string[]} initialBoardState 
     */
    const resetGameDisplay = (initialBoardState) => {
        renderBoard(initialBoardState);
        updateStatus("Make your move!", 'X');
    };
    /**
     * Select cell by index and handle the click event.
     * @param {number} index - The index (0-8)
     */
    const handleCellClick = (index) => {
        // This function will be bound to the click handler from the main game script.
        const cellElement = document.getElementById(`cell-${index}`);
        if (cellElement) {
            cellElement.addEventListener('click', () => {
                window.handleMove(index);
            });
        }
    };
    /**
     * Exposes the public API.
     * @returns {object}
     */
    return {
        initialize,
        renderBoard,
        updateStatus,
        resetGameDisplay,
        handleCellClick,
    };
})();
// Expose the module globally for use in other scripts
window.UIManager = UIManager;