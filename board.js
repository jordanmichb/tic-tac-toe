/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * Gameboard keeps track of the board state and controls all 
* * logic that manipulates the board
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export const Gameboard = (function() {
    let rows = 3;
    let columns = 3;
    let numToWin = 3;
    let board = [];
    clearBoard();

    function clearBoard() {
        board = []
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
    const setSize = (size, newWinNum) => {
        rows = size;
        columns = size;
        numToWin = newWinNum;
    }

    return {
        clearBoard,
        placeToken,
        printBoard,
        getBoard,
        getRows,
        getColumns,
        getNumToWin,
        setSize,
    }
})();