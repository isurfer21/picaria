/**
 * @module game_logic
 * @description Contains all pure, deterministic game rules for Tic-Tac-Toe.
 * This module is completely decoupled from any UI or state management concerns.
 */
/**
 * Defines the winning combinations (indices 0-8 in a 1D array).
 */
const winningConditions = [
    // Rows
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    // Columns
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    // Diagonals
    [0, 4, 8], [2, 4, 6]
];
/**
 * Checks if the current state results in a win for the given player.
 * @param {string[]} state - The current 1D game state array.
 * @param {string} player - The player symbol ('X' or 'O').
 * @returns {boolean} True if the player has won.
 */
export function checkWin(state, player) {
    for (const condition of winningConditions) {
        const [a, b, c] = condition;
        if (state[a] === player && state[b] === player && state[c] === player) {
            return true;
        }
    }
    return false;
}
/**
 * Checks if the game board is full.
 * @param {string[]} state The current game state array.
 * @returns {boolean} True if the board is full (a draw).
 */
export function checkDraw(state) {
    return state.every(cell => cell !== '');
}
/**
 * Attempts to make a move and returns the new state array if successful.
 * Always returns the new, immutable state.
 * 
 * @param {string[]} currentState - The current 1D state array.
 * @param {number} index - The board index (0-8).
 * @param {string} player - The player symbol ('X' or 'O').
 * @returns {string[] | null} - The new board state array, or null if the move was invalid.
 */
export function makeMove(currentState, index, player) {
    if (index < 0 || index > 8 || currentState[index] !== '') {
        return null; // Invalid move
    }
    // Create a deep copy to maintain immutability in functional design
    const newBoard = [...currentState];
    newBoard[index] = player;
    
    return newBoard;
}