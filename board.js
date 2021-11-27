// Used for configs
const configForm = document.getElementById("config-form");
const configPop = document.getElementById("pop3");
const minSeeds = 2;
const maxSeeds = 14;
const minPits = 2;
const maxPits = 14;

// Used for Board class
const PitsGridClass = "smallHolesGrid"
const topPitsGridClass = "smallHolesTop";
const botPitsGridClass = "smallHolesBottom";
const smallPitsClass = "hole smallHole";
const enemyStoreClass = "hole bigHole bigHoleRight";
const myStoreClass = "hole bigHole bigHoleLeft";

let board = undefined;

// Submit button on configurations
configForm.children.configFormButton.addEventListener('click', parseConfigs, false);


function parseConfigs() {
    let pitsNum = parseInt(configForm.children.holesNum.value);
    let seedsNum = parseInt(configForm.children.seedsNum.value);
    // If not all values were filled
    if (seedsNum == undefined || pitsNum == undefined) {
        return;
    }
    // If within expected range
    else if (seedsNum >= minSeeds && seedsNum <= maxSeeds && pitsNum >= minPits && pitsNum <= maxPits) {
        // If no board was previously created
        if (board === undefined) {
            board = new Board(pitsNum, seedsNum, document.getElementById("board"));
            board.initHoles();
        }
    }
    closePop(configPop);
}




/* Here we will assume the capture pit in the 0th position is the enemy store
and the capture pit in the pitsNum position is my store this way we can use % (mod) operator to
distribute the seeds*/
class Board {
    constructor(pitsNum, seedsNum, boardID) {
        this.pitsNum = pitsNum;
        // Enemy Store | small pits (pitsNum*2) | My Store
        this.pits = new Array(1 + pitsNum * 2 + 1);
        for (let i = 1; i < pitsNum * 2; i++) {
            this.pits[i] = seedsNum;
        }
        // Filling Big pits
        this.pits[0] = 0;
        this.pits[pitsNum] = 0;
        this.boardID = boardID;
    }

    initBoard() {

    }

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
}