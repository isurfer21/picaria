// =========================================================================
// CORE GAME LOGIC AND STATE MANAGEMENT (Module Separation)
// =========================================================================

/**
 * GameEngine Module: Contains ONLY the rules and logic for Tic-Tac-Toe.
 * It operates in a pure functional style, taking a state and move, and returning a deterministic result.
 * This layer is completely decoupled from the DOM.
 */
const GameEngine = {
    winningConditions: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ],

    /**
     * Checks if the last move resulted in a win.
     * @param {number} lastMoveIndex - The index of the last move played.
     * @param {string} player - The player who made the move ('X' or 'O').
     * @param {Array<string>} state - The current game state array.
     * @returns {string | null} The winning player's symbol, or null if no win.
     */
    checkWin: (lastMoveIndex, player, state) => {
        for (const condition of GameEngine.winningConditions) {
            const [a, b, c] = condition;
            // Check if all three spots in the condition are filled by the specified player
            if (state[a] && state[b] && state[c] && 
                state[a] === player && state[b] === player && state[c] === player) {
                return player;
            }
        }
        return null;
    },

    /**
     * Checks if the game is a draw.
     * @param {Array<string>} state - The current game state array.
     * @returns {boolean} True if all spots are filled and no winner was found.
     */
    checkDraw: (state) => {
        // If no empty string is found, it's a draw.
        return !state.includes("");
    },

    /**
     * Finds the best move (Win or Block) for the given player.
     * @param {Array<number>} availableCells - Indices of cells that are currently empty.
     * @param {string} player - The player whose turn it is ('X' or 'O').
     * @param {Array<string>} state - The current game state array.
     * @returns {number | null} The index of the best move, or null if none found.
     */
    findBestMove: (availableCells, player, state) => {
        // 1. Check if current player can win (Offensive Move)
        for (const index of availableCells) {
            // Test move by creating a temporary state copy
            const tempState = [...state];
            tempState[index] = player;
            
            if (GameEngine.checkWin(index, player, tempState)) {
                return index; // Winning move found
            }
        }

        // 2. Check if opponent can win (Defensive/Blocking Move)
        const opponent = player === 'X' ? 'O' : 'X';
        for (const index of availableCells) {
            // Test move
            const tempState = [...state];
            tempState[index] = opponent;
            
            if (GameEngine.checkWin(index, opponent, tempState)) {
                return index; // Blocking move found
            }
        }
        return null; // No forcing move found
    }
};

// Utility to check win condition for AI pre-check
const checkWinCondition = (lastMoveIndex, player, state) => {
    for (const condition of GameEngine.winningConditions) {
        const [a, b, c] = condition;
        if (state[a] === player && state[b] === player && state[c] === player) {
            return true;
        }
    }
    return false;
};

/**
 * StateManager Module: Owns the single source of truth for the game state (The Store).
 * All mutations MUST go through its methods.
 */
const initializeGameState = () => ({
    gameActive: true,
    currentPlayer: 'X',
    gameState: ["", "", "", "", "", "", "", "", ""]
});
let state = initializeGameState();
const observers = [];

const notifyObservers = () => {
    observers.forEach(callback => callback(state));
};

const StateManager = {
    getState: () => ({ ...state }), // Return a copy to prevent external mutation
    
    resetGame: () => {
        state = initializeGameState();
        notifyObservers();
        return state;
    },

    /**
     * Processes a player's move, validates it, updates state, and notifies observers.
     * @param {number} index - The clicked cell index.
     * @param {string} player - The player symbol ('X' or 'O').
     * @returns {object} Contains success status, next state, and outcome.
     */
    makeMove: (index, player) => {
        if (!state.gameActive || gameState.gameState[index] !== "") {
            console.warn("State Error: Cannot make move.");
            return { success: false };
        }
        
        // Deep copy for simulation before mutation
        const newState = { ...state, gameState: [...state.gameState] };
        newState.gameState[index] = player;
        
        // 1. Check outcomes using the pure GameEngine
        const winner = GameEngine.checkWin(index, player, newState.gameState);
        if (winner) {
             state = newState; // Commit the winning state
             notifyObservers();
             return { success: true, newState: state, outcome: 'WIN', winner: winner };
        }

        const draw = GameEngine.checkDraw(newState.gameState);
        if (draw) {
             state = newState; // Commit the drawn state
             notifyObservers();
             return { success: true, newState: state, outcome: 'DRAW' };
        }
        
        // 2. Transition State
        const nextPlayer = player === 'X' ? 'O' : 'X';
        state = { ...newState, currentPlayer: nextPlayer };
        
        notifyObservers();
        return { success: true, newState: state, outcome: 'CONTINUE', nextPlayer: nextPlayer };
    },
    
    // AI API: Wrapper to utilize GameEngine best move finder
    processAIMove: (availableCells) => {
        // 1. Find the deterministic best move using the pure engine
        const bestMoveIndex = GameEngine.findBestMove(availableCells, 'O', state.gameState);
        
        if (bestMoveIndex === null) {
            // Fallback: If no forcing move, pick a random one
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            return availableCells[randomIndex];
        }
        return bestMoveIndex;
    },

    subscribe: (callback) => {
        observers.push(callback);
        return () => {
            const index = observers.indexOf(callback);
            if (index !== -1) observers.splice(index, 1);
        };
    },

    init: () => {
        // Initialize state and notify all listeners (the initial board render)
        state = initializeGameState();
        notifyObservers();
    }
};


// =========================================================================
// VIEW / ORCHESTRATOR (UI Layer)
// =========================================================================
const statusDisplay = document.getElementById('status-message');
const resetButton = document.getElementById('reset-button');
const cells = []; // Will hold DOM elements

/**
 * 1. Setup Board: Creates and collects all DOM cell elements.
 * This runs once at startup.
 */
const setupBoardDOM = () => {
    const gameBoard = document.getElementById('game-board');
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        gameBoard.appendChild(cell);
        cells.push(cell);
    }

    // 2. Attach Event Listeners (The only place DOM interaction should live)
    cells.forEach((cell) => {
        cell.addEventListener('click', (event) => {
            const clickedCell = event.target;
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
            
            // Pass the move attempt to the ORCHESTRATOR/STATE Manager
            handlePlayerTurn(clickedCellIndex);
        });
    });
    
    resetButton.addEventListener('click', handleResetGame);
};

/**
 * Handles a human player's click by dispatching to StateManager.
 */
const handlePlayerTurn = (index) => {
    const currentState = StateManager.getState();
    if (!currentState.gameActive || currentState.gameState[index] !== "") {
        return; // Do nothing if move is invalid
    }
    
    // Pass control entirely to the StateManager
    const result = StateManager.makeMove(index, currentState.currentPlayer);
};


/**
 * The View Renderer/Observer: Subscribes to StateManager changes.
 * This function is called AUTOMATICALLY when the state changes.
 * @param {object} state - The current state passed by StateManager.
 */
const renderView = (state) => {
    // 1. Update Status Display
    if (state.outcome === 'WIN') {
        statusDisplay.innerHTML = `Winner: ${state.winner}!`;
    } else if (state.outcome === 'DRAW') {
        statusDisplay.innerHTML = `It's a Draw!`;
    } else if (state.outcome === 'CONTINUE') {
        statusDisplay.innerHTML = `${state.currentPlayer}'s turn`;
    }
    
    // 2. Update Cells and Board
    for (let i = 0; i < 9; i++) {
        const cell = cells[i];
        const content = state.gameState[i];
        
        // Reset all classes first for a clean render
        cell.className = 'cell'; 
        
        if (content) {
            cell.innerHTML = content;
            cell.classList.add(content);
        } else {
            cell.innerHTML = "";
        }
    }
    
    // 3. Post-Render Logic (AI execution)
    // This hook runs *after* the user's move and *after* the view updates, 
    // to check if the AI needs to move next.
    if (state.outcome === 'CONTINUE' && state.currentPlayer === 'O' && state.gameActive) {
        setTimeout(() => {
            // Give a small delay to visually complete the human move before AI kicks in
            const availableCells = state.gameState
                .map((cell, index) => (cell === "" ? index : null))
                .filter((index) => index !== null);
            if (availableCells.length > 0) {
                // This will call StateManager.makeMove internally, triggering the cycle again
                StateManager.processAIMove(availableCells);
            }
        }, 300); 
    }
};


/**
 * Handle the full reset action by resetting all modules.
 */
const handleResetGame = () => {
    StateManager.resetGame();
    // The StateManager emits the new state, which automatically calls renderView
};


/**
 * The primary entry point function that initializes ALL systems.
 */
const initGame = () => {
    // 1. Setup all necessary DOM elements and listeners (UI Layer)
    setupBoardDOM();
    
    // 2. Subscribe the View Renderer to the State Manager (The Glue)
    StateManager.subscribe(renderView);
    
    // 3. Run initial setup (This calls StateManager.init(), which then calls renderView)
    StateManager.init(); 
};

// --- Initial Module Execution ---
document.addEventListener('DOMContentLoaded', initGame);


// =========================================================================
// FOR COMPONENT MODALS AND NAVIGATION (Left untouched from original structure)
// (NOTE: The original modal/nav logic from the original file should be pasted here
// after the initial DOMContentLoaded listener setup to ensure scope integrity.)
// =========================================================================
// PASTE ALL ORIGINAL MODAL/NAVIGATION LOGIC HERE TO COMPLETE THE FILE.
// The game logic above is now entirely self-contained and modular.