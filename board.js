// Used for Board class
const PitsGridClass = "smallHolesGrid";
const topPitsGridClass = "smallHolesTop";
const botPitsGridClass = "smallHolesBottom";
const smallPitsClass = "hole smallHole";
const enemyStoreClass = "hole bigHole bigHoleRight";
const myStoreClass = "hole bigHole bigHoleLeft";
const seedClass = "seed"

let board;

/* Here we will assume the capture pit in the 0th position is the enemy store
and the capture pit in the pitsNum position is my store this way we can use % (mod) operator to
distribute the seeds*/
class Board {
    pitsNum;
    pits;
    boardID;
    constructor(pitsNum, seedsNum, boardID) {
        this.pitsNum = pitsNum;
        // Array will hold Enemy Store | capture pits | My Store
        this.pits = new Array(1 + pitsNum * 2 + 1);
        for (let i = 1; i < pitsNum * 2; i++) {
            this.pits[i] = seedsNum;
        }
        // Settings stores to both have 0 seeds
        this.pits[0] = 0;
        this.pits[pitsNum] = 0;
        this.boardID = boardID;
    }

    initBoard() {

    }

    // Generates all stores and pits
    initHoles() {
        // Creating my store
        let myStore = document.createElement("div");
        myStore.classList = myStoreClass;
        this.boardID.appendChild(myStore);

        // Creating a grid between my store and enemy store
        let smallPitsGrid = document.createElement("div");
        smallPitsGrid.classList = PitsGridClass;
        this.boardID.appendChild(smallPitsGrid);

        // Creating Enemy store
        let enemyStore = document.createElement("div");
        enemyStore.classList = enemyStoreClass;
        this.boardID.appendChild(enemyStore);

        // Top grid that will hold enemy capture pits
        let smallTopGrid = document.createElement("div");
        smallTopGrid.classList = topPitsGridClass;
        smallPitsGrid.appendChild(smallTopGrid);

        // Bot grid that will hold my capture pits
        let smallBotGrid = document.createElement("div");
        smallBotGrid.classList = botPitsGridClass;
        smallPitsGrid.appendChild(smallBotGrid);

        // Creating my capture pits
        for (let i = 0; i < board.pitsNum; i++) {
            let div = document.createElement("div");
            div.classList = smallPitsClass;
            smallBotGrid.appendChild(div);
        }

        // Creating enemy capture pits
        for (let i = 0; i < board.pitsNum; i++) {
            let div = document.createElement("div");
            div.classList = smallPitsClass;
            smallTopGrid.appendChild(div);
        }



        // Changing grid columns to fit selected number of pits
        smallBotGrid.style.setProperty('grid-template-columns', 'repeat(' + this.pitsNum + ', 1fr)');
        smallTopGrid.style.setProperty('grid-template-columns', 'repeat(' + this.pitsNum + ', 1fr)');
    }

    /*
    Method 1: Use seeds as divs whose parent are the respective pits (or store).
    Method 2: Use seeds as divs whose parent is the board and simply stick it in place with
    position = absolute; and find out cords (Probably this one).
    */
    initSeeds() {

    }


}