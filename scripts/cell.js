/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * BoardCell represent one square on the board. It consists 
* * of a value that represents an empty spot, player 1's token, 
* * or player 2's token
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export function Cell() {
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