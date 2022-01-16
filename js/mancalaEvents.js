// Js that will hold all of the mancala events, must be called after mancala.js

// Check if a valid pit was selected and executes that play
function clickPit(event) {
    let pit_i = event.target;
    if (pit_i.className == seedClass) pit_i = pit_i.parentNode;
    // Finding out which pit was clicked and storing value in i
    let i = pit_i.i;
    let mancala = pit_i.mancala;
    if (i == mancala.myStorePos || i == mancala.enemyStorePos) {
        // Stores are not clickable!
        console.error("A store was selected for click event");
        return -1;
    }
    // Invalid move, clicked the pit of the opponent
    else if ((i > 0 && i < mancala.pitsNum + 1 && !mancala.turn)
        || (i > mancala.pitsNum + 1 && i < mancala.pitsNum * 2 + 2 && mancala.turn))
        return -2;
    // Clicked a empty pit
    else if (mancala.pits[i] == 0)
        return -3;

    mancala.movePit(i);
    return 0;
}


function multiplayerClickPit(event) {
    let pit_i = event.target;
    if (pit_i.className == seedClass) pit_i = pit_i.parentNode;
    // Finding out which pit was clicked and storing value in i
    let i = pit_i.i;
    let mancala = pit_i.mancala;
    if (i == mancala.myStorePos || i == mancala.enemyStorePos) {
        // Stores are not clickable!
        console.error("A store was selected for click event");
        return -1;
    }
    // Invalid move, clicked the pit of the opponent
    else if ((i > 0 && i < mancala.pitsNum + 1 && !mancala.turn)
        || (i > mancala.pitsNum + 1 && i < mancala.pitsNum * 2 + 2 && mancala.turn))
        return -2;
    // Clicked a empty pit
    else if (mancala.pits[i] == 0)
        return -3;
    // Our local mancala pits range from [1:this.myStorePos] but server pits range from [0:this.myStorePos-1]
    notifyServer(i - 1);
    return 0;
}

