
import { Gameboard } from "./gameboard.js";
import { Cell } from "./cell.js";
import { GameController } from "./gameController.js"

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * ScreenController handles the logic for displaying to the DOM
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export const ScreenController = (function() {
    //const playerDiv = document.querySelector(".player-turn");
    const boardDiv = document.querySelector(".board");
    const player1 = document.querySelector(".info.p1");
    const player2 = document.querySelector(".info.p2");
    const score1 = document.querySelector(".score.p1 span");
    const score2 = document.querySelector(".score.p2 span");
    const sizeBtns = document.querySelectorAll(".size");
    const winningNumSpan = document.querySelector(".winning-number span");
    const modal = document.querySelector(".game-modal");

    const game = GameController;

    /* * * * * * * * *
    * * Board Controls
    * * * * * * * * * */
    // Initial screen render
    const startGame = () => { 
        GameController.startGameController();
        displayScreen() 
    };



    // Get current state of the board and populate the cells
    const displayScreen = () => {
        // Clear previous state
        boardDiv.textContent = "";
        player1.classList.remove("highlight");
        player2.classList.remove("highlight");
        // Get current state of the board
        const board = Gameboard.getBoard();

        // Highlight current player's turn
        game.getCurrentPlayer().name === "Player 1" ? player1.classList.add("highlight")
                                                    : player2.classList.add("highlight");
        // Display current player scores
        score1.textContent = `${game.getPlayerScores()[0]}`;
        score2.textContent = `${game.getPlayerScores()[1]}`;

        // For each cell, create a button and place it onto the board
        board.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                // Create span button container so container units can be used for font size
                const cellSpan = document.createElement("span");
                const cellBtn = document.createElement("button");

                cell.getValue() === 'X' ? cellBtn.classList.add("color-x")
                                        : cellBtn.classList.add("color-o");

                cellBtn.textContent = cell.getValue();
                cellBtn.classList.add("grid-cell");
                
                // Add data attribute to the identify row/column the cell occupies
                cellBtn.dataset.row = rowIdx;
                cellBtn.dataset.column = colIdx;

                cellSpan.appendChild(cellBtn);
                boardDiv.appendChild(cellSpan);
            })
        })
    }



    // Board event listener for playing the game
    function clickHandler(e) {
        const selectedRow = Number(e.target.dataset.row);
        const selectedColumn = Number(e.target.dataset.column);

        // Make sure actual button was pushed
        if (isNaN(selectedRow) || isNaN(selectedColumn)) return;
        
        // Play the round and check for win/tie status
        game.playRound(selectedRow, selectedColumn);
        if (game.gameWon() || game.gameTied()) {
            showModal();
        }

        displayScreen();
    }

    boardDiv.addEventListener('click', clickHandler);


    
    // Reset the screen
    const resetScreen = (e) => {
        let resetType;
        if (e.target.id === "hard-reset") resetType = "hard";
        Gameboard.clearBoard();
        game.resetGame(resetType);
        displayScreen();
    }
    // Hard reset resets scores
    document.querySelector(".board-reset").addEventListener('click', (e) => resetScreen(e));



    /* * * * * * * * * * *
    * * Grid Size Controls
    * * * * * * * * * * * */
    const setGridSize = (e) => {
        const size = Number(e.target.id);
        game.setGrid(size);
        boardDiv.style.gridTemplate = `repeat(${size}, 1fr) / repeat(${size}, 1fr)`;
        winningNumSpan.textContent = game.getNumToWin(size);
        resetScreen(e);
    }
    sizeBtns.forEach(button => button.addEventListener('click', (e) => setGridSize(e)));



    /* * * * * * * * *
    * * Modal Controls
    * * * * * * * * * */
    function showModal() {
        const resultDiv = document.querySelector(".result");
        modal.showModal();
        game.gameWon() ? resultDiv.textContent = `${game.getCurrentPlayer().name} wins!`
                       : resultDiv.textContent = `Tie Game`;
    };


    // Close modal and reset the board
    const closeModal = (e) => {
        modal.close();
        resetScreen(e); // Soft reset to keep scores and alternate who goes first each round
    };
    
    document.querySelector(".modal-reset").addEventListener('click', (e) => closeModal(e));



    return {
        startGame
    }
})();

