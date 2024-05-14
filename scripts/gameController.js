import { Gameboard } from "./gameboard.js";
import { Cell } from "./cell.js";

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
* * GameController controls each turn of the game and
* * determines when there is a winner
* * * * * * * * * * * * * * * * * * * * * * * * * * * */
export const GameController = (function(
    player1 = "Player 1", // Default parameters that can be changed
    player1Token = "X",
    player2 = "Player 2",
    player2Token = "O"
) {
    // Number of consecutive tokens needed to win corresponds to grid size
    const gridWinNums = {3: 3, 6: 4, 10: 5};
    const players = [
        {
            name: player1,
            token: player1Token,
            score: 0
        },
        {
            name: player2,
            token: player2Token,
            score: 0
        }
    ]
    let currentPlayer = players[0];
    let won = false;
    let tied = false;

    const getCurrentPlayer = () => currentPlayer;
    const getPlayerScores = () => [players[0].score, players[1].score];
    const getNumToWin = (gridSize) => gridWinNums[gridSize];
    const gameWon = () => won;
    const gameTied = () => tied;
    const switchPlayerTurn = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const startGameController = () => { printNextRound() };



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
                    if (consecutiveTokens === getNumToWin(Gameboard.getRows())) return true;
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



    const setGrid = (size) => {
        Gameboard.setRowsCols(size);
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


    
    return {
        startGameController,
        getCurrentPlayer,
        getPlayerScores,
        getNumToWin,
        gameTied,
        gameWon,
        playRound,
        setGrid,
        resetGame
    }
})();