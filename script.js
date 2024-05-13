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
    let value;
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
            token: player1Token,
            score: 0,
            number: 1
        },
        {
            name: player2,
            token: player2Token,
            score: 0,
            number: 2
        }
    ]
    
    let currentPlayer = players[0];
    let won = false;
    let tied = false;

    const switchPlayerTurn = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const getCurrentPlayer = () => currentPlayer;
    const getPlayerScores = () => [players[0].score, players[1].score];
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
        if(!Gameboard.getBoard().filter(row => (row.map(cell => cell.getValue()).includes(undefined))).length) {
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
            getCurrentPlayer().score = getCurrentPlayer().score + 1;
            won = true;
            return true;
        }
        return false;
    }

    const resetGame = (type) => {
        won = false;
        tied = false;
        currentPlayer = players[0];
        // Hard reset resets entire game
        if (type === "hard") {
            players[0].score = 0;
            players[1].score = 0;
        }
    }

    printNextRound();

    return {
        getPlayerScores,
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
    //const playerDiv = document.querySelector(".player-turn");
    const boardDiv = document.querySelector(".board");
    const player1 = document.querySelector(".info.p1");
    const player2 = document.querySelector(".info.p2");
    const score1 = document.querySelector(".score.p1 span");
    const score2 = document.querySelector(".score.p2 span");
    const modal = document.querySelector(".game-modal");

    const game = GameController;

    /* * * * * * * * *
    * * Board Controls
    * * * * * * * * * */
    // Get current state of the board and populate the cells
    const displayScreen = () => {
        // Clear previous state
        boardDiv.textContent = "";
        player1.classList.remove("highlight");
        player2.classList.remove("highlight");
        // Get current state of the board
        const board = Gameboard.getBoard();

        // Highlight current player's turn
        game.getCurrentPlayer().number === 1 ? player1.classList.add("highlight")
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
        let resetType = "soft";
        if (e.target.id === "hard-reset") resetType = "hard";
        game.clearBoard();
        game.resetGame(resetType);
        displayScreen();
    }
    // Hard reset resets scores
    document.querySelector(".board-reset").addEventListener('click', (e) => resetScreen(e));

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


    // Initial screen render
    displayScreen();
})();

