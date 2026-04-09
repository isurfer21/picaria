/**
 * =============================================================================
 * PICARIA TICTACTOE - Class-Based Architecture
 * =============================================================================
 * 
 * Architecture Overview:
 * -----------------------------------------------------------------------------
 * 1. UI Layer (Frontend.Client):
 *    - UIElement: Base class for UI components
 *    - BoardCell: Cell component for the grid
 *    - GameBoard: Grid container component
 *    - StatusDisplay: Status/message display component
 *    - ButtonElement: Button component (reset/restart)
 *    - Modal: Modal component (if applicable)
 *
 * 2. Game Logic Layer:
 *    - CellState: Represents a board cell state
 *    - Board: 2D/flat array representation + validation
 *    - RulesEngine: Win/draw checking, valid move validation
 *    - GameStateManager: Manages game state transitions
 *    - TurnManager: Handles X/O player turn alternation
 *    - AIPlayer: Simple AI for autonomous moves
 *    - HumanPlayer: Player controller
 *    - PlayerManager: Coordinates all players
 *
 * 3. Backend/Networking (Optional):
 *    - NetworkService: Handles WebSocket/REST API calls
 *    - ServerStateStore: Authoritative board state
 *    - PersistenceService: Database operations
 *
 * 4. Game Loop:
 *    - GameLoopController: Simplified trigger-based loop
 *    - EventDispatcher: Handles click events and propagates
 *
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// UTILITY MODULES
// -----------------------------------------------------------------------------

/**
 * @module utils
 * @description Utility functions and constants
 */

const Utils = {
    WINNING_CONDITIONS: [
        [0, 1, 2], // Row 1
        [3, 4, 5], // Row 2
        [6, 7, 8], // Row 3
        [0, 3, 6], // Column 1
        [1, 4, 7], // Column 2
        [2, 5, 8], // Column 3
        [0, 4, 8], // Diagonal 1
        [2, 4, 6]  // Diagonal 2
    ],

    EMPTY: '',
    PLAYER_X: 'X',
    PLAYER_O: 'O',

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    },

    debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }
};

// -----------------------------------------------------------------------------
// UI LAYER - COMPONENTS
// -----------------------------------------------------------------------------

/**
 * @class UIElement
 * @extends HTMLElement
 * @description Base UI element for component-based UI architecture
 */
class UIElement extends HTMLElement {
    constructor(container) {
        super();
        this.container = container;
        this.isVisible = true;
    }

    render() {
        // Override in subclasses
    }

    hide() {
        this.isVisible = false;
        this.style.display = 'none';
    }

    show() {
        this.isVisible = true;
        this.style.display = 'flex';
    }
}

/**
 * @class StatusDisplay
 * @description Display component for game status messages
 */
class StatusDisplay extends UIElement {
    constructor(container) {
        super(container);
        this.init();
    }

    init() {
        this.render.call(this);
    }

    render() {
        const element = document.createElement('div');
        element.id = 'status-display';
        element.className = 'status-display';
        this.render(element);
    }

    /**
     * @override
     * @param {string} message - Status message to display
     */
    render(element) {
        element.textContent = `Player ${Utils.PLAYER_X}'s turn`;
        this.container.appendChild(element);
    }

    update(message) {
        this.childNodes[0].textContent = message;
    }

    clear() {
        this.childNodes && (this.childNodes[0].textContent = '');
    }
}

/**
 * @class ButtonElement
 * @description Button component with click handlers
 */
class ButtonElement extends UIElement {
    constructor(container, label, onClick, onRender) {
        super(container);
        this.label = label;
        this.onClick = onClick;
        this.onRender = onRender || ((btn) => {
            btn.textContent = label;
            btn.className = 'button';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            });
        });
        this.init();
    }

    init() {
        this.render.call(this);
    }

    /**
     * @override
     * @param {HTMLElement} element
     */
    render(element) {
        element.id = this.label.toLowerCase().replace(/\s+/g, '-');
        element.addEventListener('click', this.onClick);
        this.container.appendChild(element);
    }

    onClickHandler() {
        this.onClick();
    }
}

// -----------------------------------------------------------------------------
// GAME LOGIC LAYER - CORE CLASSES
// -----------------------------------------------------------------------------

/**
 * @class CellState
 * @description Immutable-like representation of a board cell
 */
class CellState {
    constructor() {
        this.value = Utils.EMPTY;
    }

    set(player) {
        this.value = player;
    }

    reset() {
        this.value = Utils.EMPTY;
    }

    isOccupied() {
        return this.value !== Utils.EMPTY;
    }

    isEmpty() {
        return this.value === Utils.EMPTY;
    }

    get() {
        return this.value;
    }
}

/**
 * @class Board
 * @description 2D/flat array representation of the Tic-Tac-Toe board
 */
class Board {
    constructor(size = 9) {
        this.size = size;
        this.reset();
    }

    reset() {
        this.cells = Array.from({ length: this.size }, () => new CellState());
    }

    /**
     * @param {number} index - Index of cell to set
     * @param {('X'|'O')} player - Player to place
     * @returns {boolean} - Whether move was valid
     */
    set(index, player) {
        if (index >= 0 && index < this.size && this.cells[index].isEmpty()) {
            this.cells[index].set(player);
            return true;
        }
        return false;
    }

    get(index) {
        return this.cells[index].get();
    }

    getAll() {
        return this.cells.map(cell => cell.get());
    }

    /**
     * @param {number} index - Index of cell to reset
     * @returns {boolean} - Whether reset was successful
     */
    reset(index) {
        if (index >= 0 && index < this.size) {
            this.cells[index].reset();
            return true;
        }
        return false;
    }

    resetAll() {
        this.cells.forEach(cell => cell.reset());
    }

    /**
     * @param {number} index - Index of last move
     * @param {boolean} checkWin - Whether to check winning conditions
     * @returns {string|null} - Player who won, or null
     */
    checkWin(index, checkWin = true) {
        const currentPlayer = this.cells[index].get();
        
        // Check if current player won with this move
        for (const condition of Utils.WINNING_CONDITIONS) {
            const [a, b, c] = condition;
            if (
                this.cells[a].get() &&
                this.cells[a].get() === this.cells[b].get() &&
                this.cells[a].get() === this.cells[c].get()
            ) {
                return currentPlayer;
            }
        }
        
        // Check for draw
        if (!this.getAll().includes(Utils.EMPTY)) {
            return 'DRAW';
        }
        
        return null;
    }

    /**
     * @returns {number[]} - Array of empty cell indices
     */
    getEmptyCells() {
        return this.cells
            .map((cell, index) => (cell.isEmpty() ? index : null))
            .filter(cell => cell !== null);
    }

    isFull() {
        return !this.getAll().includes(Utils.EMPTY);
    }

    toJSON() {
        return this.getAll();
    }

    static fromArray(array) {
        const board = new Board();
        board.cells = array.map(val => ({
            ...new CellState(),
            set() {
                if (val === Utils.EMPTY) this.value = Utils.EMPTY;
                else this.value = val;
            }.bind(this))
        }));
        return board;
    }
}

/**
 * @class RulesEngine
 * @description Validates rules and checks win/draw conditions
 */
class RulesEngine {
    constructor(board) {
        this.board = board;
    }

    /**
     * @param {number} index - Index of last move
     * @returns {object} - Rule check results
     */
    check(index) {
        const currentPlayer = this.board.get(index);
        const result = {
            isValid: true,
            winner: null,
            draw: false
        };

        // Validate move was to empty cell (board handles this)
        if (this.board.getEmptyCells().length === 0) {
            result.isValid = false;
        }

        result.winner = this.board.checkWin(index);
        if (result.winner !== null) {
            result.isValid = false;
            result.reason = result.winner === 'DRAW' ? 'draw' : 'win';
        }

        result.draw = result.winner === 'DRAW';
        result.nextPlayer = result.winner ? null : this.getNextPlayer();
        
        return result;
    }

    checkWin(index) {
        const win = this.board.checkWin(index);
        return win && win !== 'DRAW';
    }

    checkDraw() {
        const result = this.check(0); // Dummy index
        return result.draw;
    }

    checkMoveValid(index) {
        const emptyCells = this.board.getEmptyCells();
        const isValid = emptyCells.includes(index);
        return {
            isValid,
            reason: !isValid ? 'cellOccupied' : null
        };
    }

    getNextPlayer(currentPlayer) {
        return currentPlayer === Utils.PLAYER_X ? Utils.PLAYER_O : Utils.PLAYER_X;
    }

    getCurrentPlayer() {
        // In single player mode, default to X
        return Utils.PLAYER_X;
    }
}

/**
 * @class TurnManager
 * @description Manages turn alternation between players
 */
class TurnManager {
    constructor(rulesEngine) {
        this.rulesEngine = rulesEngine;
        this.currentPlayer = Utils.PLAYER_X;
        this.turnCount = 0;
    }

    updateTurn() {
        this.turnCount++;
        this.currentPlayer = this.rulesEngine.getNextPlayer(this.currentPlayer);
        return {
            currentPlayer: this.currentPlayer,
            turnCount: this.turnCount
        };
    }

    reset() {
        this.turnCount = 0;
        this.currentPlayer = Utils.PLAYER_X;
        return this.getCurrentState();
    }

    getCurrentState() {
        return {
            currentPlayer: this.currentPlayer,
            turnCount: this.turnCount,
            isPlayerTurn: this.currentPlayer === Utils.PLAYER_X
        };
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    getNextPlayer() {
        return this.rulesEngine.getNextPlayer(this.currentPlayer);
    }

    getTurnHistory() {
        return this.turnCount;
    }
}

// -----------------------------------------------------------------------------
// AI & PLAYER LAYERS
// -----------------------------------------------------------------------------

/**
 * @class AIPlayer
 * @description Simple AI with priority moves: win -> block -> center -> random
 */
class AIPlayer {
    constructor(rulesEngine) {
        this.rulesEngine = rulesEngine;
    }

    /**
     * Find best move for AI
     * Priority: 1. Win 2. Block 3. Center 4. Random
     */
    findBestMove() {
        const availableCells = this.rulesEngine.board.getEmptyCells();
        const aiPlayer = Utils.PLAYER_O;
        const humanPlayer = Utils.PLAYER_X;
        
        if (availableCells.length === 0) return null;

        // Priority 1: AI can win
        for (const index of availableCells) {
            this.rulesEngine.board.set(index, aiPlayer);
            if (this.rulesEngine.checkWin(index)) {
                this.rulesEngine.board.reset(index);
                return index;
            }
            this.rulesEngine.board.reset(index);
        }

        // Priority 2: Block human from winning
        for (const index of availableCells) {
            this.rulesEngine.board.set(index, humanPlayer);
            if (this.rulesEngine.checkWin(index)) {
                this.rulesEngine.board.reset(index);
                return index;
            }
            this.rulesEngine.board.reset(index);
        }

        // Priority 3: Take center if available
        if (this.rulesEngine.board.cells[4].isEmpty()) {
            return 4;
        }

        // Priority 4: Random move
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    /**
     * Make AI move after delay (optional)
     */
    async makeMove(delay = 0) {
        if (!this.rulesEngine.board.isFull()) {
            await new Promise(resolve => setTimeout(resolve, delay));
            const move = this.findBestMove();
            if (move !== null) {
                this.rulesEngine.board.set(move, Utils.PLAYER_O);
                return { index: move, player: Utils.PLAYER_O };
            }
        }
        return null;
    }
}

/**
 * @class HumanPlayer
 * @description Handles human player input
 */
class HumanPlayer {
    constructor(onMove) {
        this.onMove = onMove;
    }

    /**
     * @param {number} index - Cell index clicked
     * @returns {object} - Move result
     */
    makeMove(index) {
        const result = this.onMove(index);
        return result;
    }
}

/**
 * @class PlayerManager
 * @description Coordinates all players and game logic
 */
class PlayerManager {
    constructor(rulesEngine, turnManager) {
        this.rulesEngine = rulesEngine;
        this.turnManager = turnManager;
        this.isGameActive = true;
        this.ai = new AIPlayer(rulesEngine);
        
        this.humanPlayer = new HumanPlayer((index) => {
            if (!this.isGameActive) return null;
            return this.rulesEngine.board.set(index, Utils.PLAYER_X);
        });
    }

    /**
     * Handle player move
     */
    handlePlayerMove(index) {
        const result = this.humanPlayer.makeMove(index);
        if (result) {
            this.turnManager.updateTurn();
            this.checkGameResult();
            if (this.isGameActive) {
                this.scheduleAIMove();
            }
        }
        return result;
    }

    /**
     * Schedule AI move with optional delay
     */
    scheduleAIMove() {
        return this.ai.makeMove(0).then(() => {
            if (this.isGameActive) {
                this.checkGameResult();
                this.turnManager.updateTurn();
            }
        });
    }

    checkGameResult() {
        const check = this.rulesEngine.check(this.rulesEngine.getCurrentPlayer());
        this.isGameActive = !check.draw && !check.winner;
        return this.isGameActive;
    }

    getGameState() {
        return {
            isGameActive: this.isGameActive,
            currentPlayer: this.turnManager.getCurrentPlayer(),
            isPlayerTurn: this.turnManager.getCurrentState().isPlayerTurn
        };
    }

    reset() {
        this.isGameActive = true;
        this.turnManager.reset();
        this.rulesEngine.board.reset();
        return this.getGameState();
    }
}

// -----------------------------------------------------------------------------
// BACKEND / NETWORK LAYER (Optional)
// -----------------------------------------------------------------------------

/**
 * @class ServerStateStore
 * @description Authoritative board state for multiplayer
 */
class ServerStateStore {
    constructor() {
        this.board = new Board();
        this.lastUpdate = null;
    }

    update(boardState) {
        this.board = Board.fromArray(boardState);
        this.lastUpdate = Date.now();
    }

    get() {
        return this.board.toJSON().slice();
    }

    reset() {
        this.board.reset();
        return new Array(9).fill(null);
    }
}

/**
 * @class NetworkService
 * @description Handles WebSocket/REST API for multiplayer
 */
class NetworkService {
    constructor(endpoint) {
        this.endpoint = endpoint;
        this.socket = null;
        this.callbacks = {
            onMove: null,
            onDisconnect: null
        };
    }

    connect() {
        // WebSocket initialization
        this.socket = new WebSocket(this.endpoint);
        
        this.socket.onopen = () => {
            console.log('Connected to server');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            console.log('Disconnected from server');
            if (this.callbacks.onDisconnect) {
                this.callbacks.onDisconnect();
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    /**
     * Send move to server
     */
    sendMove(index, player) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'MOVE',
                index: index,
                player: player
            }));
        }
    }

    /**
     * Handle received message
     */
    handleMessage(data) {
        console.log('Received from server:', data);
        if (this.callbacks.onMove) {
            this.callbacks.onMove(data);
        }
    }

    subscribe(callback) {
        this.callbacks.onMove = callback;
    }

    unsubscribe() {
        this.callbacks.onMove = null;
    }
}

// -----------------------------------------------------------------------------
// GAME LOOP & CONTROLLER
// -----------------------------------------------------------------------------

/**
 * @class EventDispatcher
 * @description Handles click events and propagation
 */
class EventDispatcher {
    constructor(targetElement, handler) {
        this.targetElement = targetElement;
        this.handler = handler;
    }

    on(event, callback) {
        if (!this.targetElement) return;
        this.targetElement.addEventListener(event, callback);
        return () => this.targetElement.removeEventListener(event, callback);
    }
}

/**
 * @class GameLoopController
 * @description Simplified trigger-based game loop
 * Not continuous like real-time games.
 * Triggered only on user actions (click → update state → render → check).
 */
class GameLoopController {
    constructor(gameElement) {
        this.gameElement = gameElement;
        this.eventHandlers = new Map();
        this.isRunning = false;
    }

    /**
     * Register event handlers
     */
    on(type, handler) {
        this.eventHandlers.set(type, handler);
        return (remove) => {
            if (remove) {
                this.eventHandlers.delete(type);
            }
        };
    }

    /**
     * Handle click event
     */
    onTargetClick(handler) {
        const remove = this.on('click', handler);
        return remove;
    }

    /**
     * Check and trigger next game action if conditions met
     */
    next() {
        // Trigger next action if needed
        // This simulates the simplified game loop
        return true;
    }

    /**
     * Update game loop tick
     */
    tick() {
        // Triggered after each action
        this.next();
    }

    /**
     * Start game loop
     */
    start() {
        this.isRunning = true;
        return this.tick();
    }

    /**
     * Stop game loop
     */
    stop() {
        this.isRunning = false;
    }
}

// -----------------------------------------------------------------------------
// MAIN CONTROLLER (Ties everything together)
// -----------------------------------------------------------------------------

/**
 * @class GameController
 * @description Main controller for the Tic-Tac-Toe game
 */
class GameController {
    board; // Board instance
    rulesEngine; // RulesEngine instance
    turnManager; // TurnManager instance
    playerManager; // PlayerManager instance
    gameLoop; // GameLoopController instance
    statusDisplay; // StatusDisplay instance
    cells = []; // Array of BoardCell

    constructor(gameElement) {
        this.gameElement = gameElement;
        this.board = new Board(9);
        this.rulesEngine = new RulesEngine(this.board);
        this.turnManager = new TurnManager(this.rulesEngine);
        this.playerManager = new PlayerManager(this.rulesEngine, this.turnManager);
        this.gameLoop = new GameLoopController(gameElement);
        this.statusDisplay = new StatusDisplay(gameElement);
        this.init();
    }

    /**
     * Initialize game components
     */
    init() {
        // Create game board grid
        this.gameBoard = document.getElementById('game-board');
        
        // Create cells
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.id = `cell-${i}`;
            cell.className = 'cell';
            cell.setAttribute('data-index', i);
            gameBoard.appendChild(cell);
            
            // Create board cell component
            this.cells.push(new BoardCell(this, cell));
        }

        // Create header/button
        this.header = document.getElementById('header');
        const resetButtonElement = document.createElement('button');
        resetButtonElement.id = 'reset-button';
        resetButtonElement.textContent = 'Restart';
        this.header.appendChild(resetButtonElement);

        // Create reset button component
        this.resetButton = new ButtonElement(this.header, 'reset-button', () => {
            this.playerManager.reset();
            this.renderBoard();
            this.updateStatus(`Player ${this.turnManager.getCurrentPlayer()}'s turn`);
        });

        // Attach click handlers to cells
        this.cells.forEach(cell => {
            cell.onTargetClick((cell) => {
                const index = parseInt(cell.element.getAttribute('data-index'));
                this.handleCellClick(index);
            });
        });

        // Attach reset button handler
        this.resetButton.onClick(() => {
            this.playerManager.reset();
            this.renderBoard();
            this.updateStatus(`Player ${this.turnManager.getCurrentPlayer()}'s turn`);
        });

        // Initialize status display
        this.updateStatus(`Player ${Utils.PLAYER_X}'s turn`);
    }

    /**
     * Handle cell click event
     */
    handleCellClick(index) {
        // Validate index
        if (index < 0 || index >= 9) return { valid: false };

        // Check if cell is occupied
        const emptyCells = this.board.getEmptyCells();
        if (!emptyCells.includes(index)) {
            return { valid: false, reason: 'cellOccupied' };
        }

        // Place player's mark
        this.board.set(index, Utils.PLAYER_X);

        // Check game result
        const result = this.rulesEngine.check(index);

        // Update UI
        const cell = document.getElementById(`cell-${index}`);
        cell.textContent = result.winner === null ? Utils.PLAYER_X : '';
        cell.className = 'cell'; // Reset classes

        // Update status message
        const currentPlayer = this.turnManager.currentPlayer;
        this.updateStatus(result.winner 
            ? `Winner: ${result.winner}!` 
            : `It's ${result.draw ? "a Draw!" : `Player ${currentPlayer === Utils.PLAYER_X ? Utils.PLAYER_X : Utils.PLAYER_O}'s turn`}`
        );

        // Check for win/draw
        if (result.winner) {
            const players = document.querySelectorAll('.cell');
            result.winner.forEach((winner, i) => {
                if (winner) {
                    players[i].classList.add('winner');
                }
            });
            return { won: true, winner: result.winner };
        }

        if (result.draw) {
            return { draw: true };
        }

        // Update turn
        this.turnManager.updateTurn();

        // Trigger AI move
        this.aiPlayerMove();

        return { valid: true };
    }

    /**
     * AI makes a move
     */
    aiPlayerMove() {
        const ai = new AIPlayer(this.rulesEngine);
        
        setTimeout(() => {
            if (!this.playerManager.isGameActive) return;

            ai.makeMove(0).then((move) => {
                if (move) {
                    const index = move.index;
                    const cell = document.getElementById(`cell-${index}`);
                    cell.textContent = Utils.PLAYER_O;
                    cell.className = 'cell'; // Reset classes

                    const result = this.rulesEngine.check(index);
                    this.updateStatus(result.winner 
                        ? `Winner: ${result.winner}!` 
                        : `It's ${result.draw ? "a Draw!" : `Player ${this.turnManager.currentPlayer}'s turn`}`
                    );

                    // Highlight winning cells
                    if (result.winner) {
                        const players = document.querySelectorAll('.cell');
                        result.winner.forEach((w, i) => {
                            if (w) players[i].classList.add('winner');
                        });
                    }

                    if (result.draw) {
                        this.updateStatus("It's a Draw!");
                    } else {
                        this.turnManager.updateTurn();
                    }

                    this.playerManager.checkGameResult();
                }
            });
        }, 100); // Small delay for visual effect
    }

    /**
     * Render the entire board
     */
    renderBoard() {
        const allCells = document.querySelectorAll('.cell');
        allCells.forEach((cell, index) => {
            const value = this.board.get(index);
            cell.textContent = value || '';
            cell.className = 'cell';
        });
    }

    /**
     * Update status display
     */
    updateStatus(message) {
        this.statusDisplay.update(message);
    }

    /**
     * Reset the game
     */
    reset() {
        this.playerManager.reset();
        this.renderBoard();
        this.updateStatus(`Player ${Utils.PLAYER_X}'s turn`);
    }

    /**
     * Get current game state
     */
    getState() {
        return this.playerManager.getGameState();
    }

    /**
     * Export board state for persistence
     */
    exportState() {
        return {
            board: this.board.toJSON(),
            turn: this.turnManager.currentPlayer,
            isActive: this.playerManager.isGameActive
        };
    }

    /**
     * Import board state for restore
     */
    importState(state) {
        this.board = Board.fromArray(state.board);
        this.turnManager.currentPlayer = state.turn;
        this.playerManager.isGameActive = state.isActive;
        this.renderBoard();
        this.updateStatus(`Player ${this.turnManager.currentPlayer}'s turn`);
        return true;
    }
}

// -----------------------------------------------------------------------------
// INITIALIZE GAME
// -----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const gameElement = document.querySelector('body');
    const game = new GameController(gameElement);

    // Optional: Multiplayer networking
    // const networkService = new NetworkService('wss://your-server.com/api');
    // networkService.subscribe((data) => {
    //     const index = data.index;
    //     const cell = document.getElementById(`cell-${index}`);
    //     cell.textContent = data.player;
    //     cell.classList.add(data.player);
    //     game.updateStatus(`${data.player} won!`);
    // });
    // networkService.connect();
    // networkService.subscribe(game.handleMove);
});
