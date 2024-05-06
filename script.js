/*
** The gameboard keeps track of the board state
** Only one instance is needed so it wrapped in an IIFE
*/
const Gameboard = (function() {
    const rows = 3;
    const columns = 3;
    const board = [];
    // Create a 2D array to represent the board
    for (let i = 0; i < rows; i++) {
        board[i] = []
        for (let j = 0; j < columns; j++) {
            board[i].push(BoardCell());
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

    return {
        placeToken,
        printBoard
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
        Gameboard.placeToken(row, column, getCurrentPlayer().token);
        switchPlayerTurn();
        printNextRound();
    }

    printNextRound();

    return {
        playRound
    }
})();

