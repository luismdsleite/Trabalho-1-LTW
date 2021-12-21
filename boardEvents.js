// Js that will hold all of the board events, must be called after board.js

// Check if a valid pit was selected and executes that play
function clickPit(event) {
    let pit_i = event.target;

    if (pit_i.className == seedClass) pit_i = pit_i.parentNode;
    // Finding out which pit was clicked and storing value in i
    let i = 1;
    for (; i < board.pitsElem.length; i++) {
        if (pit_i !== board.pitsElem[i].children[0]) continue;
        else break;
    }

    if (i == board.myStorePos || i == board.enemyStorePos) {
        // Stores are not clickable!
        console.error("A store was selected for click event");
        return -1;
    }
    // Invalid move, clicked the pit of the opponent
    else if ((i > 0 && i < board.pitsNum + 1 && !board.turn)
        || (i > board.pitsNum + 1 && i < board.pitsNum * 2 + 2 && board.turn))
        return -2;
    // Clicked a empty pit
    else if (board.pits[i] == 0)
        return -3;

    board.movePit(i);
    return 0;
}