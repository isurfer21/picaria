export class UIManager {
    constructor(moveHandler, onMoveCallback) {
        this.onMoveCallback = onMoveCallback;
        this.moveHandler = moveHandler;
        // Leave board empty and status message until renderBoard is called
    }

    resetGameDisplay(initialBoardState) {
        this.renderBoard(initialBoardState);
        this.updateStatus("Make your move!", 'X');
    }

    initGame(onMoveCallback) {
        this.onMoveCallbackSetter = onMoveCallback;
        const boardElement = document.getElementById('board');
        if (boardElement) {
            const cells = Array.from(boardElement.children);
            cells.forEach((cell, index) => {
                // Remove any existing listeners
                const newCell = document.createElement('div');
                newCell.id = `cell-${index}`;
                newCell.classList = 'cell';
                cell.replaceWith(newCell);
                
                // Store the handler for this cell later
                newCell.setAttribute('data-index', index);
            });
        }
    }

    /**
     * Sets the board cells and attaches listeners to call handleMove properly.
     * @param {object} handler - Object containing handleMove method
     * @param {Function} onMoveCallback - The callback to invoke after a move
     */
    setupBoardListeners(handler, onMoveCallback) {
        const boardElement = document.getElementById('board');
        if (boardElement && onMoveCallback && handler.handleMove) {
            const cells = boardElement.querySelectorAll('.cell');
            const cellsArray = Array.from(cells);
            cellsArray.forEach((cell) => {
                const index = cell.getAttribute('data-index');
                
                // Remove existing listener if any
                const existingListeners = getEventListeners(cell);
                if (existingListeners.click) {
                    // Replace listener
                    cell.removeEventListener('click', existingListeners.click[0]);
                }
                
                // Add new listener
                cell.addEventListener('click', () => {
                    if (typeof index === 'string') index = parseInt(index);
                    // Proper flow: call handleMove with callback and index
                    handler.handleMove(index, onMoveCallback);
                });
            });
        }
    }

    /**
     * Helper to get event listeners (for removing them)
     * Note: This requires a polyfill or we keep it simple without removal
     */

    renderBoard(boardState) {
        const cellElements = document.getElementById('board').children;
        if (!cellElements) return;
        
        for (let i = 0; i < 9; i++) {
            const cellElement = cellElements[i];
            if (cellElement) {
                cellElement.textContent = boardState[i] || '';
                cellElement.className = `cell ${boardState[i] ? 'filled' : ''}`;
            }
        }
    }

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
}