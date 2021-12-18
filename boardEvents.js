// Js that will hold all of the board events, must be called after board.js

function clickPit(event) {
    let pit_i = event.target;

    if (pit_i.className == seedClass) pit_i = pit_i.parentNode;
    // Finding out which pit was clicked
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
    else if(board.pits[i] == 0)
        return -3;

    // Settings seed counter to 0
    pit_i.parentNode.childNodes[0].nodeValue = 0;
    board.pits[i] = 0;

    let seeds_num = pit_i.children.length;
    while (seeds_num > 0) {
        i = (i + 1) % (board.pitsNum * 2 + 2);
        // If i reach a enemy store and its my turn or vice-versa dont place a seed in it
        if (!((i == board.enemyStorePos && board.turn) || (i == board.myStorePos && !board.turn))) {
            Board.moveSeedTo(pit_i.firstChild, board.pitsElem[i].children[0]);
            
            board.pits[i] += 1;
            // updating pit value text
            board.pitsElem[i].childNodes[0].nodeValue = board.pits[i];
            seeds_num--;
            
        }
    }

    // Following rules based on the place of the last seed
    board.endTurn(i);
}