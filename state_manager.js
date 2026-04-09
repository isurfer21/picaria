/**
 * @module state_manager
 * @description Manages the single source of truth for the game state. 
 * All mutations MUST go through its methods.
 */
import { checkWin, checkDraw, makeMove } from './game_logic.js';
/**
 * Represents the current state of the game.
 */
class GameState {
    constructor() {
        this.board = new Array(9).fill(null);
        this.currentPlayer = 'X';
    }
    /**
     * Attempts to make a move. Returns the new state structure if successful.
     * @param {number} index The index (0-8) to move to.
     * @returns {object|null} A structure containing the new board state if valid, otherwise null.
     */
    transition(index) {
        // 1. Attempt to calculate the next board state immutably
        
        // 3. Render the move to the UI
        const newBoard = makeMove(this.board, index, this.currentPlayer);
        if (!newBoard) {
            return { status: 'INVALID_MOVE' }; // Invalid move
        }
        
        const winner = checkWin(newBoard, this.currentPlayer);
        if (winner) {
            this.renderWin(newBoard, winner);
            return {
                status: 'GAME_OVER',
                board: newBoard,
                winner: winner,
                nextPlayer: null
            };
        }

        if (checkDraw(newBoard)) {
             this.renderDraw(newBoard);
             return {
                status: 'GAME_OVER',
                board: newBoard,
                winner: null,
                nextPlayer: null,
                result: 'DRAW'
            };
        }

        // 4. Transition and prepare for next move
        this.board = newBoard;
        this.currentPlayer = nextPlayer;
        return this.getState();
    }
    
    /**
     * Gets the current game state as a returnable object.
     * @returns {object} Current state with board and next player.
     */
    getState() {
        const nextPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return {
            status: 'SUCCESS',
            board: this.board,
            nextPlayer: nextPlayer
        };
    }
    
    /**
     * Renders the board with the new player's name.
     * @param {number} index - The cell index to update.
     * @param {string} player - The player ('X' or 'O').
     */
    updateCell(index, player) {
        const cellElement = document.getElementById(`cell-${index}`);
        if (cellElement) {
            cellElement.textContent = player;
            cellElement.className = `cell ${player ? 'filled' : ''}`;
        }
    }
    
    /**
     * Renders a win message.
     * @param {number[]} newBoard - The board after win.
     * @param {string} winner - The winning player.
     */
    renderWin(board, winner) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.innerHTML = `
                <span style="color: ${winner === 'X' ? '#e74c3c' : '#3498db'};">Player ${winner} WINS!</span>
            `;
        }
    }
    
    /**
     * Renders a draw message.
     */
    renderDraw(board) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = "It's a DRAW!";
        }
    }
    
    /**
     * Resets the game by clearing the board.
     */
    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        
        // Clear UI
        const boardElement = document.getElementById('board');
        if (boardElement) {
            const cells = Array.from(boardElement.children);
            cells.forEach(cell => {
                cell.textContent = '';
                cell.className = 'cell';
            });
        }
        
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = "Make your move!";
        }
    }
}
export { GameState };