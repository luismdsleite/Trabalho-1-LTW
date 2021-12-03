// Used for Board class
const PitsGridClass = "smallHolesGrid";
const topPitsGridClass = "smallHolesTop";
const botPitsGridClass = "smallHolesBottom";
const smallPitsClass = "hole smallHole";
const enemyStoreClass = "hole bigHole bigHoleRight";
const myStoreClass = "hole bigHole bigHoleLeft";
const seedClass = "seed"
// seed width and height in viewport units
const seedWidth = 2;
const seedHeight = 3;

let board;

/* Here we will assume the capture pit in the 0th position is the enemy store
and the capture pit in the pitsNum position is my store this way we can use % (mod) operator to
distribute the seeds*/
class Board {
    pitsNum; // Number of pits per row (Stores are not counted here)
    pits; // Number of seeds each pit has (including both stores)
    pitsElem; // all pits and stores divs
    boardID; // ID where board will be constructed
    boolMyTurn; // Bool indicating whose turn it is

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
        this.pitsElem = [];
    }

    initBoard() {
        this.initHoles();
        this.initSeeds();
        console.log("pits = " + this.pitsNum);
        for (let i = 1; i < this.pitsNum+1; i++) {
            console.log(this.pitsElem[i]);
            this.pitsElem[i].addEventListener("click", this.clickPit, false);
        }
    }

    // Generates all stores and pits
    initHoles() {
        this.pitsElem = Array(1 + this.pitsNum + 1);

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
            this.pitsElem[1 + i] = div;
        }

        // Creating enemy capture pits
        for (let i = 0; i < board.pitsNum; i++) {
            let div = document.createElement("div");
            div.classList = smallPitsClass;
            smallTopGrid.appendChild(div);
            this.pitsElem[1 + this.pitsNum + i] = div;
        }

        this.pitsElem[0] = enemyStore;
        this.pitsElem.push(myStore);

        // Changing grid columns to fit selected number of pits
        smallBotGrid.style.setProperty('grid-template-columns', 'repeat(' + this.pitsNum + ', 1fr)');
        smallTopGrid.style.setProperty('grid-template-columns', 'repeat(' + this.pitsNum + ', 1fr)');
    }

    initSeeds() {
        if (this.pitsElem === undefined) {
            console.error("Pits were not created");
            return;
        }

        let startingSeeds = this.pits[1];
        for (let i = 1; i < this.pitsNum + 1; i++) {
            for (let j = 0; j < startingSeeds; j++) {
                Board.createSeed(this.pitsElem[i]);
            }
        }

        for (let i = 1 + this.pitsNum; i < 1 + this.pitsNum * 2; i++) {
            for (let j = 0; j < startingSeeds; j++) {
                Board.createSeed(this.pitsElem[i]);
            }
        }
    }

    clickPit(event) {
        let pit_i = event.target;
        console.log(pit_i)
        if (pit_i.className == seedClass) pit_i = pit_i.parentNode;
        
        let i = 1;
        console.log("_"+pitsNum);
        for (; i < this.pitsNum + 1; i++) {
            if (pit_i !== this.pitsElem[i]) {
                console.log("continued");
                continue;
            }
            else {
                console.log("was equal");
                break;
            }
        }
        if (i == 0 || i == this.pitsNum + 1) return -1; // Stores are not clickable!
        let seeds_num = pit_i.children;
        i++;
        for (let j = seeds_num; seeds_num > 0; seeds_num--) {
            moveSeedTo(pit_i.firstChild, this.pitsElem[i]);
            i = (i + 1) % (this.pitsNum * 2 + 2);
        }


    }


    // Creates a seed div randomly positions it and returns the div element
    // REMINDER: add rotation
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

