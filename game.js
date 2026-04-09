import { GameState } from "./state_manager.js";

/**
 * @param {UIManager} uiManager - An instance of the UIManager class.
 */
export class Game {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.gameManager = new GameState(); // Single source of truth
        this.currentPlayer = 'X'; // Track current player
        this.handleMove = this.handleMove.bind(this); // Bind to this instance
    }

    initGame(onMoveCallback) {
        // Initialize GameState
        this.gameManager.board = Array(9).fill(null);
        this.gameManager.currentPlayer = 'X';
        
        // Create board cells
        const boardEl = document.getElementById('board');
        if (boardEl) {
            boardEl.innerHTML = `
                <div id="cell-0" class="cell" data-index="0"></div>
                <div id="cell-1" class="cell" data-index="1"></div>
                <div id="cell-2" class="cell" data-index="2"></div>
                <div id="cell-3" class="cell" data-index="3"></div>
                <div id="cell-4" class="cell" data-index="4"></div>
                <div id="cell-5" class="cell" data-index="5"></div>
                <div id="cell-6" class="cell" data-index="6"></div>
                <div id="cell-7" class="cell" data-index="7"></div>
                <div id="cell-8" class="cell" data-index="8"></div>
            `;
        }
        
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = "Make your move!";
        }
        
        // Tell UIManager which handler to use
        this.uiManager.onMoveCallbackSetter = onMoveCallback;
        this.uiManager.setupBoardListeners({
            handleMove: this.handleMove,
            onMoveCallback: onMoveCallback
        }, onMoveCallback);
    }

    handleMove(index, onMoveCallback) {
        // Proper flow: transition state first
        const nextState = this.gameManager.transition(index);
        
        if (!nextState) {
            return; // Invalid move
        }
        
        if (nextState.status === 'GAME_OVER') {
            // GameState already rendered win/draw messages internally
            return;
        }
        
        // Move was successful
        this.currentPlayer = nextState.nextPlayer;
        
        // Tell the callback which player just moved
        if (typeof onMoveCallback === 'function') {
            onMoveCallback(this.currentPlayer);
        }
    }

    initGame(onMoveCallback) {
        // Initialize board and status
        this.gameManager.board = Array(9).fill(null);
        this.gameManager.currentPlayer = 'X';
        
        const boardEl = document.getElementById('board');
        if (boardEl) {
            // Clear all existing cells
            boardEl.innerHTML = `
                <div id="cell-0" class="cell"></div>
                <div id="cell-1" class="cell"></div>
                <div id="cell-2" class="cell"></div>
                <div id="cell-3" class="cell"></div>
                <div id="cell-4" class="cell"></div>
                <div id="cell-5" class="cell"></div>
                <div id="cell-6" class="cell"></div>
                <div id="cell-7" class="cell"></div>
                <div id="cell-8" class="cell"></div>
            `;
        }
        
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = "Make your move!";
        }
        
        // Setup listeners with the original onMoveCallback
        this.uiManager.initGame(onMoveCallback);
    }

    handleMove(index) {
        const nextState = this.gameManager.transition(index);
        
        if (!nextState) {
            return; // Invalid move
        }
        
        if (nextState.status === 'GAME_OVER') {
            // GameState already rendered win/draw messages internally
            return;
        }
        
        // Move was successful
        this.currentPlayer = nextState.nextPlayer;
        
        // Tell the callback which player just moved
        if (typeof this.onMoveCallback === 'function') {
            this.onMoveCallback(this.currentPlayer);
        }
    }

    onMoveCallback = (player) => {
        console.log(`onMoveCallback: Player ${player} made a move`);
    }
}