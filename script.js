/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * Gameboard keeps track of the board state and controls all 
* * logic that manipulates the board
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
const Gameboard = (function() {
    const rows = 3;
    const columns = 3;
    const numToWin = 3;
    const board = [];
    clearBoard();

    function clearBoard() {
        // Create a 2D array to represent an empty board
        for (let i = 0; i < rows; i++) {
            board[i] = []
            for (let j = 0; j < columns; j++) {
                board[i].push(BoardCell());
            }
        }
    }

    // Place a token on the board by changing the cell's value
    const placeToken = (row, column, playerToken) => {
        // If that cell is already populated, the move is invalid
        if (board[row][column].getValue()) return false;
        // Otherwise, place the token
        board[row][column].addToken(playerToken);
        return true;
    }

    // Print the gameboard to the console
    const printBoard = () => {
        // For each cell of each row, get the value and return a populated row
        // Add the populated rows to the board
        const currentBoard = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(currentBoard);
    }

    const getBoard = () => board;
    const getRows = () => rows;
    const getColumns = () => columns;
    const getNumToWin = () => numToWin;

    return {
        clearBoard,
        placeToken,
        printBoard,
        getBoard,
        getRows,
        getColumns,
        getNumToWin
    }
})();


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * BoardCell represent one square on the board. It consists 
* * of a value that represents an empty spot, player 1's token, 
* * or player 2's token
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function BoardCell() {
    let value = 0;
    // Change cell's value
    const addToken = (playerToken) => {
        value = playerToken;
    }
    // Retrieve cell's current value
    const getValue = () => value;

    return {
        addToken,
        getValue
    }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
* * GameController controls each turn of the game and
* * determines when there is a winner
* * * * * * * * * * * * * * * * * * * * * * * * * * * */
const GameController = (function(
    player1 = "Player One", // Default parameters that can be changed
    player1Token = "X",
    player2 = "Player Two",
    player2Token = "O"
) {
    const players = [
        {
            name: player1,
            token: player1Token
        },
        {
            name: player2,
            token: player2Token
        }
    ]
    
    let currentPlayer = players[0];
    let won = false;
    let tied = false;

    const switchPlayerTurn = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const getCurrentPlayer = () => currentPlayer;
    const gameWon = () => won;
    const gameTied = () => tied;

    // Print the current board state and announce whose turn it is
    const printNextRound = () => {
        Gameboard.printBoard();
        console.log(`${getCurrentPlayer().name}'s turn`);
    }

    const playRound = (row, column) => {
        const token = getCurrentPlayer().token
        if (!Gameboard.placeToken(row, column, token)) return; // Return if occupied space is clicked
        if (!setWon(row, column, token) && !setTied(row, column, token)) { // Only continue if game is not won/tied
            switchPlayerTurn();
            printNextRound();
        }
    }

    // For each row, create a new array of the cell's values and filter the rows that contain emtpy space
    // If there are no empty spaces, the game is a tie
    const setTied = () => {
        if(!Gameboard.getBoard().filter(row => (row.map(cell => cell.getValue()).includes(0))).length) {
            tied = true;
            return true;
        }
        return false;
    }

    // Check if the game has been won by taking the selected cell and checking all neighbors
    // If a neighbor matches, follow that line forwards and backwards to check for
    // consecutive tokens
    const setWon = (row, column, playerToken) => {
        const board = Gameboard.getBoard();

        // Filter out invalid neighbors for cells on the edge of the board
        const isValidNeighbor = (row, column) => {
            if (row < 0 // Before first row
                        || column < 0 // Before first column
                        || row === Gameboard.getRows() // After last row
                        || column === Gameboard.getColumns()) { // After last column
                    
                return false;
            }
            else return true;
        }

        // Check the line of cells in a given direction and its opposite direction, 
        // starting at the placed token's location, to see if there are enough consecutive tokens to win
        const isWinningLine = (direction) => {
            let consecutiveTokens = 1;
            // Function to get the next cell in a given direction, defined later depending on direction
            let getNextCell;
            // Loop twice because direction has to be checked both ways
            // First check the given direction, then its opposite.
            for(let directionsChecked = 0; directionsChecked < 2; directionsChecked++) {
                let distance = 1;
                switch(direction) {
                    case "N":
                        getNextCell = function() { return [row - distance, column] }
                        direction = "S";
                        break;
                    case "NE":
                        getNextCell = function() { return [row - distance, column + distance] }
                        direction = "SW";
                        break;
                    case "E":
                        getNextCell = function() { return [row, column + distance] }
                        direction = "W";
                        break;
                    case "SE":
                        getNextCell = function() { return [row + distance, column + distance] }
                        direction = "NW";
                        break;
                    case "S":
                        getNextCell = function() { return [row + distance, column] }
                        direction = "N";
                        break;
                    case "SW":
                        getNextCell = function() { return [row + distance, column - distance] }
                        direction = "NE";
                        break;
                    case "W":
                        getNextCell = function() { return [row, column - distance] }
                        direction = "E";
                        break;
                    case "NW":
                        getNextCell = function() { return [row - distance, column - distance] }
                        direction = "SE";
                        break;
                }
                // Traverse the cells in a diven direction
                // While neighbor in this direction is a valid cell
                for (distance; isValidNeighbor(getNextCell()[0], getNextCell()[1]); distance++) {
                    // If this cell is a match, increment tally
                    if (board[getNextCell()[0]][getNextCell()[1]].getValue() === playerToken) {
                        consecutiveTokens++;
                    } 
                    // If cell is not a match, no point in checking the rest
                    else break;
                    // If enough consecutive tokens are found, this player has won
                    if (consecutiveTokens === Gameboard.getNumToWin()) return true;
                }
            }
            return false;
        }

        // Opposite directions are also checked, so only four calls need to be made
        if (isWinningLine("N") || isWinningLine("NE") || isWinningLine("E") || isWinningLine("SE")) {
            won = true;
            return true;
        }
        return false;
    }

    const resetGame = () => {
        currentPlayer = players[0];
        won = false;
        tied = false;
    }

    printNextRound();

    return {
        playRound,
        gameTied,
        gameWon,
        getCurrentPlayer,
        clearBoard: Gameboard.clearBoard,
        resetGame
    }
})();

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * ScreenController handles the logic for displaying to the DOM
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
const screenController = (function() {
    const playerDiv = document.querySelector(".player-turn");
    const boardDiv = document.querySelector(".board");
    const modal = document.querySelector(".modal");
    const modalReset = document.querySelector(".modal-reset");

    const game = GameController;

    /* * * * * * * * *
    * * Board Controls
    * * * * * * * * * */
    // Get current state of the board and populate the cells
    const displayScreen = () => {
        // Clear previous state
        boardDiv.textContent = "";

        const board = Gameboard.getBoard();
        // Display current player's turn
        playerDiv.textContent = `${game.getCurrentPlayer().name}'s turn`;

        // For each cell, create a button and place it onto the board
        board.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                const cellBtn = document.createElement("button");
                cellBtn.classList.add("grid-cell");
                cellBtn.textContent = cell.getValue();
                // Add data attribute to the identify row/column the cell occupies
                cellBtn.dataset.row = rowIdx;
                cellBtn.dataset.column = colIdx;

                boardDiv.appendChild(cellBtn);
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

    /* * * * * * * * *
    * * Modal Controls
    * * * * * * * * * */
    function showModal() {
        const resultDiv = document.querySelector(".result");
        modal.showModal();
        game.gameWon() ? resultDiv.textContent = `${game.getCurrentPlayer().name} won the game!`
                       : resultDiv.textContent = `Tie Game`;
    };
    // Close modal and reset the board
    const closeModal = () => {
        modal.close();
        game.clearBoard();
        game.resetGame();
        displayScreen();
    };
    
    modalReset.addEventListener('click', closeModal)

    // First screen render
    displayScreen();
})();

