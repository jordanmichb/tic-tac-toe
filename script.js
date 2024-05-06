/*
** The gameboard keeps track of the board state
** Only one instance is needed so it wrapped in an IIFE
*/

const GameBoard = (function() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = []
        for (let j = 0; j < columns; j++) {
            board[i].push(BoardCell());
        }
    }

    const placeToken = (row, column, player) => {

    }

    const printBoard = () => {
       const currentBoard = board.map((row) => row.map((square) => square.getValue()));
       console.log(currentBoard);
    }

    return {
        printBoard
    }

})();

function BoardCell() {
    let value = 0;

    const getValue = () => value;

    return {
        getValue
    }
}

GameBoard.printBoard();