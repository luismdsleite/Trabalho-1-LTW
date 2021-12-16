// Used for Board class
const PitsGridClass = "smallHolesGrid";
const topPitsGridClass = "smallHolesTop";
const botPitsGridClass = "smallHolesBottom";
const pitTopClass = "hole smallHoleTop";
const pitBottomClass = "hole smallHoleBottom";
const enemyStoreClass = "hole bigHole bigHoleLeft";
const myStoreClass = "hole bigHole bigHoleRight";
const storeLeftParent = "bigHoleLeftParent";
const storeRightParent = "bigHoleRightParent";
const pitTopParent = "smallHoleTopParent";
const pitBottomParent = "smallHoleBottomParent";
const seedClass = "seed";
// seed width and height in viewport units
const seedWidth = 2;
const seedHeight = 3;

let board;

/* Here we will assume the capture pit in the 0th position is the enemy store
and the capture pit in the pitsNum position is my store this way we can use % (mod) operator to
distribute the seeds*/
class Board {

    constructor(pitsNum, seedsNum, boardID) {
        this.pitsNum = pitsNum; // Number of pits per row (Stores are not counted here)
        this.pits = Array(this.pitsNum*2 + 2); // Number of seeds each pit has (including both stores)
        this.boardID = boardID; // ID where board will be constructed
        this.pitsElem = Array(this.pitsNum*2 + 2); // Array that will hold the div that contains the pit and the value
        this.turn = true; // Bool indicating whose turn it is
        this.myStorePos = pitsNum + 1;
        this.enemyStorePos = 0;

        // Settings stores to both have 0 seeds
        this.pits[this.myStorePos] = 0;
        this.pits[this.enemyStorePos] = 0;

        for (let i = 1; i < this.pits.length; i++) {
            if (i == this.myStorePos || i == this.enemyStorePos)
                this.pits[i] = 0;
            else
                this.pits[i] = seedsNum;
        }

    }

    initBoard(clickEvent) {
        this.initHoles();
        this.initSeeds();
        for (let i = 1; i < this.pitsNum * 2 + 2; i++) {
            if (i == board.myStorePos || i == board.enemyStorePos) continue;
            this.pitsElem[i].children[0].addEventListener("click", clickEvent, false);
        }
    }

    // Generates all stores and pits
    initHoles() {
        // Creating enemy store
        let enemyStoreParent = document.createElement("div");
        enemyStoreParent.classList = storeLeftParent;
        let enemyStore = document.createElement("div");
        enemyStore.classList = enemyStoreClass;
        enemyStoreParent.textContent ="0";
        enemyStoreParent.appendChild(enemyStore);
        this.boardID.appendChild(enemyStoreParent);

        // Creating a grid between enemy store and my store
        let smallPitsGrid = document.createElement("div");
        smallPitsGrid.classList = PitsGridClass;
        this.boardID.appendChild(smallPitsGrid);

        // Creating my store
        let myStoreParent = document.createElement("div");
        myStoreParent.classList = storeRightParent;
        let myStore = document.createElement("div");
        myStore.classList = myStoreClass;
        myStoreParent.textContent ="0";
        myStoreParent.appendChild(myStore);
        this.boardID.appendChild(myStoreParent);


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
            let divParent = document.createElement("div");
            divParent.className = pitBottomParent;
            let div = document.createElement("div");
            div.classList = pitTopClass;
            divParent.textContent =this.pits[1+i];
            smallBotGrid.appendChild(divParent);
            divParent.appendChild(div);
            this.pitsElem[1 + i] = divParent;
        }
        // Creating enemy capture pits
        for (let i = 0; i < board.pitsNum; i++) {
            let divParent = document.createElement("div");
            divParent.className = pitTopParent;
            let div = document.createElement("div");
            div.classList = pitBottomClass;
            divParent.textContent =this.pits[2+this.pitsNum+i];
            smallTopGrid.prepend(divParent);
            divParent.appendChild(div);
            this.pitsElem[2 + this.pitsNum + i] = divParent;
        }
        this.pitsElem[this.myStorePos] = myStoreParent;
        this.pitsElem[this.enemyStorePos] = enemyStoreParent;
        // Changing grid columns to fit selected number of pits
        smallBotGrid.style.setProperty('grid-template-columns', 'repeat(' + this.pitsNum + ', 1fr)');
        smallTopGrid.style.setProperty('grid-template-columns', 'repeat(' + this.pitsNum + ', 1fr)');
    }

    initSeeds() {
        if (this.pitsElem === undefined) {
            console.error("Pits were not created");
            return;
        }

        for (let i = 0; i < this.pits.length; i++) {
            for (let j = 0; j < this.pits[i]; j++) {
                Board.createSeed(this.pitsElem[i].children[0]);
            }
        }
    }

    // Creates a seed div randomly positions it and returns the div element
    static createSeed(parent) {
        let seed = document.createElement("div");
        seed.className = seedClass;
        let style = seed.style;
        style.width = seedWidth + "vw";
        style.height = seedHeight + "vh";
        // Random Color
        style.backgroundColor = "rgb(" + Math.floor(Math.random() * 255) + " " + Math.floor(Math.random() * 255) + " " + Math.floor(Math.random() * 255) + ")";
        style.position = "absolute";
        Board.moveSeedTo(seed, parent);
        return seed;
    }

    // positions a seed in parent pit in a random position
    static moveSeedTo(seed, parent) {
        const offset = 25;
        // Generating 2 random offsets that range from -offset to offset
        let randomOffset1 = Math.floor(Math.random() * (offset - (-offset) + 1)) + (-offset);
        let randomOffset2 = Math.floor(Math.random() * (offset - (-offset) + 1)) + (-offset);

        let rectparent = parent.getBoundingClientRect();
        // Converting vh to px
        let width = window.innerWidth * seedWidth / 100;
        let height = window.innerHeight * seedHeight / 100;

        // converting px to % and centering seed in the middle of parent (with a random offset)
        seed.style.left = (50 - (width / rectparent.width) * 100 / 2) + randomOffset1 + "%";
        seed.style.top = (50 - (height / rectparent.height) * 100 / 2) + randomOffset2 + "%";
        parent.appendChild(seed);
    }



}

