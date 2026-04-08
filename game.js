/**
 * Game Manager Module (Controller)
 * Orchestrates the flow: UI Input -> StateManager -> GameLogic -> UI Update.
 */
const Game = (() => {
    let currentState = {
        board: Array(9).fill(null),
        currentPlayer: 'X'
    };

    /**
     * Handles the core game turn logic received from the UI layer.
     * This is the central point where user input is processed.
     * @param {number} index - The index (0-8) of the clicked cell.
     */
    const handleMove = (index) => {
        // 1. Delegate state transition to StateManager
        const nextState = StateManager.transition(index);
        
        if (!nextState) {
            // nextState is null or undefined, meaning the move failed validation checks in StateManager
            UIManager.updateStatus("Invalid move. Cell is already filled or index is out of bounds.", null);
            return;
        }

        // 2. Process the resulting state object
        if (nextState.status === 'SUCCESS') {
            // Success: Update internal state and trigger UI refresh
            currentState = {
                board: nextState.board,
                currentPlayer: nextState.nextPlayer
            };
            
            UIManager.renderBoard(currentState.board);
            UIManager.updateStatus("Play next!", currentState.currentPlayer);

        } else if (nextState.status === 'GAME_OVER') {
            // Game Ended
            if (nextState.winner) {
                UIManager.updateStatus(`Player ${nextState.winner} WINS!`, nextState.winner);
            } else if (nextState.result === 'DRAW') {
                UIManager.updateStatus("It's a DRAW!", null);
            }
            // Disable interaction
            document.querySelectorAll('.cell').forEach(cell => {
                cell.onclick = null;
            });
        } else if (nextState.status === 'INVALID_MOVE') {
             // Explicitly handle move invalidation signal
             UIManager.updateStatus("Invalid move. Cell is already filled or index is out of bounds.", null);
        }
    };
    
    /**
     * Initializes the game state and hooks up event listeners in the UI.
     */
    const initGame = () => {
        // Reset internal state
        currentState = {
            board: Array(9).fill(null),
            currentPlayer: 'X'
        };
        
        // Initialize UI and bind the action callback, connecting UI interaction -> Controller
        UIManager.resetGameDisplay(currentState.board);
        UIManager.handleCellClick(0, (index) => handleMove(index));
    };
    
    window.resetGame = () => {
        initGame();
    };
    
    return {
        initGame
    };
})();

// Initialize the game when the script loads
document.addEventListener('DOMContentLoaded', () => {
    Game.initGame();
});