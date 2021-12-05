
function clickPit(event) {
    let pit_i = event.target;
    if (pit_i.className == seedClass) pit_i = pit_i.parentNode;

    let i = 1;
    for (; i < board.pitsElem.length; i++) {
        if (pit_i !== board.pitsElem[i]) continue;
        else break;
    }

    if (i == board.myStorePos || i == board.enemyStorePos) {
        // Stores are not clickable!
        console.error("A store was selected for click event");
        return -1;
    }
    let seeds_num = pit_i.children.length;
    i = (i + 1) % (board.pitsNum * 2 + 2);
    while (seeds_num > 0) {
        // If i reach a enemy store and its my turn or vice-versa dont place a seed in it
        if (!((i == board.enemyStorePos && board.turn) || (i == board.myStorePos && !board.turn))) {
            Board.moveSeedTo(pit_i.firstChild, board.pitsElem[i]);
            seeds_num--;
        }
        i = (i + 1) % (board.pitsNum * 2 + 2);
    }
}