/*
** The gameboard keeps track of the board state
** Only one instance is needed so it wrapped in an IIFE
*/
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
        if (board[row][column].getValue()) return;
        // Otherwise, place the token
        board[row][column].addToken(playerToken);
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

/*
** A cell is one square on the board and consists of a value that
** represents an empty spot, player 1's token, or player 2's token
*/
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

/*
** GameController controls each turn of the game and
** determines when there is a winner
*/
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

    const switchPlayerTurn = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const getCurrentPlayer = () => currentPlayer;

    // Print the current board state and announce whose turn it is
    const printNextRound = () => {
        Gameboard.printBoard();
        console.log(`${getCurrentPlayer().name}'s turn`);
    }

    const playRound = (row, column) => {
        const token = getCurrentPlayer().token
        Gameboard.placeToken(row, column, token);
        if (gameWon(row, column, token)) {
            Gameboard.clearBoard();
            console.log(`${getCurrentPlayer().name} has won!`);
            return;
        }
        else if (gameTied(row, column, token)) {
            Gameboard.clearBoard();
            console.log(`Tie Game`);
            return;
        }
        switchPlayerTurn();
        printNextRound();
    }

    const gameTied = () => {
        // For each row, create a new array of the cell's values and filter the rows that contain emtpy space
        // If there are no empty spaces, the game is a tie
        if(!Gameboard.getBoard().filter(row => (row.map(cell => cell.getValue()).includes(0))).length)  
            return true;
        return false;
    }
    // 
    const gameWon = (row, column, playerToken) => {
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

        // Check the line of cells in a given direction, starting at the placed token's location,
        // and its opposite direction to see if there are enough consecutive tokens to win
        const winningLine = (direction) => {
            let consecutiveTokens = 1;
            // Function to get the next cell in a given direction, defined later depending on direction
            let getNextCell;
            // Loop twice because direction has to be checked both ways
            // First check the given direction, then its opposite.
            for(let j = 0; j < 2; j++) {
                let i = 1;
                switch(direction) {
                    case "N":
                        getNextCell = function() { return [row - i, column] }
                        direction = "S";
                        break;
                    case "NE":
                        getNextCell = function() { return [row - i, column + i] }
                        direction = "SW";
                        break;
                    case "E":
                        getNextCell = function() { return [row, column + i] }
                        direction = "W";
                        break;
                    case "SE":
                        getNextCell = function() { return [row + i, column + i] }
                        direction = "NW";
                        break;
                    case "S":
                        getNextCell = function() { return [row + i, column] }
                        direction = "N";
                        break;
                    case "SW":
                        getNextCell = function() { return [row + i, column - i] }
                        direction = "NE";
                        break;
                    case "W":
                        getNextCell = function() { return [row, column - i] }
                        direction = "E";
                        break;
                    case "NW":
                        getNextCell = function() { return [row - i, column - i] }
                        direction = "SE";
                        break;
                }
                // Traverse the cells in a diven direction
                // While neighbor in this direction is a valid cell
                for (i; isValidNeighbor(getNextCell()[0], getNextCell()[1]); i++) {
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
        if (winningLine("N")) return true;
        else if (winningLine("NE")) return true;
        else if (winningLine("E")) return true;
        else if (winningLine("SE")) return true;

        return false;
    }

    printNextRound();

    return {
        playRound,
        getCurrentPlayer
    }
})();

const screenController = (function() {
    const playerDiv = document.querySelector(".player-turn");
    const boardDiv = document.querySelector(".board");

    const displayScreen = () => {
        boardDiv.textContent = "";

        const board = Gameboard.getBoard();

        playerDiv.textContent = `${GameController.getCurrentPlayer().name}'s turn`;

        board.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                const cellBtn = document.createElement("button");
                cellBtn.classList.add("grid-cell");
                cellBtn.textContent = cell.getValue();
                cellBtn.dataset.row = rowIdx;
                cellBtn.dataset.column = colIdx;

                boardDiv.appendChild(cellBtn);
            })
        })
    }

    function clickHandler(e) {
        const selectedRow = Number(e.target.dataset.row);
        const selectedColumn = Number(e.target.dataset.column);
        console.log(`${selectedRow}, ${selectedColumn}`);
        // Make sure actual button was pushed
        if (isNaN(selectedRow) || isNaN(selectedColumn)) return;
        
        GameController.playRound(selectedRow, selectedColumn);
        
        displayScreen();
    }

    boardDiv.addEventListener('click', clickHandler);

    displayScreen();
})();

