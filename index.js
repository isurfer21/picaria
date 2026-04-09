import { UIManager } from "./ui_manager.js";
import { Game } from "./game.js";

// Callback invoked when a move is made
function onMoveCallback(cellNum) {
    console.log(`onMoveCallback: Player made a move at ${cellNum}`);
}

// Initialize the UI Manager first. We pass a placeholder function for now, 
// as the Game class will set up the functional callback later in its initialization.
const uIManagerInstance = new UIManager(null, onMoveCallback);

// Initialize the Game Controller, passing the established UI Manager instance.
const gameManagerInstance = new Game(uIManagerInstance);

// Expose the game's public interface, ensuring the correct startup sequence.
window.startGame = () => {
    // The Game class's initGame method is responsible for setting up listeners
    // and triggering the full UI setup cycle.
    gameManagerInstance.initGame(onMoveCallback);
};

// On DOM content loaded, call the initial game startup function.
document.addEventListener("DOMContentLoaded", () => {
    startGame();
});
