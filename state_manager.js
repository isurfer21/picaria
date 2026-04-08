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
        const newBoard = makeMove(this.board, index, this.currentPlayer);
        if (!newBoard) {
            return { status: 'INVALID_MOVE' }; // Invalid move
        }
        
        const winner = checkWin(newBoard, this.currentPlayer);
        if (winner) {
            return {
                status: 'GAME_OVER',
                board: newBoard,
                winner: winner,
                nextPlayer: null
            };
        }

        if (checkDraw(newBoard)) {
             return {
                status: 'GAME_OVER',
                board: newBoard,
                winner: null,
                nextPlayer: null,
                result: 'DRAW'
            };
        }

        // 2. Transition State
        const nextPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return {
            status: 'SUCCESS',
            board: newBoard,
            nextPlayer: nextPlayer
        };
    }
}
export { GameState };