export class Game {
    /**
     * @param {UIManager} uiManager - An instance of the UIManager class.
     */
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.currentState = {
            board: Array(9).fill(null),
            currentPlayer: 'X'
        };
    }

    /**
     * Handles the core game turn logic received from the UI layer.
     * This is the central point where user input is processed.
     * @param {number} index - The index (0-8) of the clicked cell.
     */
    handleMove(index) {
        // 1. Delegate state transition to StateManager
        const nextState = StateManager.transition(index);
        
        if (!nextState) {
            // nextState is null or undefined, meaning the move failed validation checks in StateManager
            this.uiManager.updateStatus("Invalid move. Cell is already filled or index is out of bounds.", null);
            return;
        }
        
        // 2. Process the resulting state object
        if (nextState.status === 'SUCCESS') {
            // Success: Update internal state and trigger UI refresh
            this.currentState = {
                board: nextState.board,
                currentPlayer: nextState.nextPlayer
            };
            
            this.uiManager.renderBoard(this.currentState.board);
            this.uiManager.updateStatus("Play next!", this.currentState.currentPlayer);
        } else if (nextState.status === 'GAME_OVER') {
            // Game Ended
            if (nextState.winner) {
                this.uiManager.updateStatus(`Player ${nextState.winner} WINS!`, nextState.winner);
            } else if (nextState.result === 'DRAW') {
                this.uiManager.updateStatus("It's a DRAW!", null);
            }
            // Disable interaction by removing event listeners from UI Manager's setup, 
            // assuming UIManager handles this or we need a dedicated method.
            // For now, we'll rely on the UI layer to handle disabling clicks if possible, 
            // or trust the original structure's limitation.
        } else if (nextState.status === 'INVALID_MOVE') {
             // Explicitly handle move invalidation signal
             this.uiManager.updateStatus("Invalid move. Cell is already filled or index is out of bounds.", null);
        }
    }
    
    /**
     * Initializes the game state and hooks up event listeners in the UI.
     */
    initGame() {
        // Reset internal state
        this.currentState = {
            board: Array(9).fill(null),
            currentPlayer: 'X'
        };
        
        // Initialize UI and bind the action callback, connecting UI interaction -> Controller
        this.uiManager.resetGameDisplay(this.currentState.board);
        
        // Setup listeners. The handler passed here connects the click to handleMove
        this.uiManager.setupBoardListeners();
    }
}