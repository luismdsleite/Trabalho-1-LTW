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

// Used to hightlight pits
const pitShadow = "inset 10px 10px 10px rgba(0, 0, 0, 0.5)";
const pitHighlightBlue = "0 0 2vh blue";
const pitHighlightRed = "0 0 2vh red";

let board;

/* Here we will assume the capture pit in the 0th position is the enemy store
and the capture pit in the pitsNum position is my store this way we can use % (mod) operator to
distribute the seeds*/
class Board {

    constructor(pitsNum, seedsNum, boardID, mode, ai_difficulty) {
        this.pitsNum = pitsNum; // Number of pits per row (Stores are not counted here)
        this.pits = Array(this.pitsNum * 2 + 2); // Number of seeds each pit has (including both stores)
        this.boardID = boardID; // ID where board will be constructed
        this.pitsElem = Array(this.pitsNum * 2 + 2); // Array that will hold the div that contains the pit and the value
        this.turn = true; // Bool indicating whose turn it is
        this.myStorePos = pitsNum + 1;
        this.enemyStorePos = 0;
        this.mode = mode; // Local, Multiplayer, vs AI
        this.ai = ai_difficulty; // Only used vs AI

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

        if (this.mode == 'local')
            for (let i = 1; i < this.pitsNum * 2 + 2; i++) {
                if (i == this.myStorePos || i == this.enemyStorePos) continue;
                this.pitsElem[i].children[0].addEventListener("click", clickEvent, false);
            }
        else if (this.mode == 'multiplayer' || this.mode == 'ai') {
            for (let i = 1; i < this.myStorePos; i++)
                this.pitsElem[i].children[0].addEventListener("click", clickEvent, false);
        }
        else {
            console.error("No valid mode selected, InitBoard()");
            return -1;
        }
        this.highlightPits();
        return 0;
    }

    // Generates all stores and pits
    initHoles() {
        // Creating enemy store
        let enemyStoreParent = document.createElement("div");
        enemyStoreParent.classList = storeLeftParent;
        let enemyStore = document.createElement("div");
        enemyStore.classList = enemyStoreClass;
        enemyStoreParent.textContent = "0";
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
        myStoreParent.textContent = "0";
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
        for (let i = 0; i < this.pitsNum; i++) {
            let divParent = document.createElement("div");
            divParent.className = pitBottomParent;
            let div = document.createElement("div");
            div.classList = pitTopClass;
            divParent.textContent = this.pits[1 + i];
            smallBotGrid.appendChild(divParent);
            divParent.appendChild(div);
            this.pitsElem[1 + i] = divParent;
        }
        // Creating enemy capture pits
        for (let i = 0; i < this.pitsNum; i++) {
            let divParent = document.createElement("div");
            divParent.className = pitTopParent;
            let div = document.createElement("div");
            div.classList = pitBottomClass;
            divParent.textContent = this.pits[2 + this.pitsNum + i];
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

    AImove() {
        if (this.ai == 0) {
            Board.randomPlay(this);
        }
    }

    // Executes the move chosen by the player 
    movePit(pit_i) {
        // Saving clicked pit since i var will be used
        let i = pit_i;
        let seeds_num = this.pits[pit_i];
        while (seeds_num > 0) {
            i = (i + 1) % (this.pitsNum * 2 + 2);
            // If i reach a enemy store and its my turn or vice-versa dont place a seed in it
            if (!((i == this.enemyStorePos && this.turn) || (i == this.myStorePos && !this.turn))) {
                this.moveNSeeds(pit_i, i, 1);
                seeds_num--;
            }
        }
        let state = this.endTurn(i);
        this.highlightPits();

        if (state != 0 && this.mode == 'ai' && !this.turn) {
            this.AImove();
        }
    }

    changeTurn() {
        this.turn = this.turn ? false : true;
        
    }

    // Receives last played seed position and enforces the rules based on the position
    endTurn(i) {
        if (this.checkIfEnded()) {
            this.endGame();
            return 0;
        }
        // Landed in my empty pit when it was my turn, then collect seeds from my and the opposing pit, and play again
        else if (this.pits[i] == 1 &&
            ((i > 0 && i < this.myStorePos && this.turn) || (i > this.myStorePos && i < this.pitsNum * 2 + 2 && !this.turn))
        ) {
            let storePos = this.turn ? this.myStorePos : this.enemyStorePos;
            this.moveNSeeds(i, storePos, 1);
            // Opposite pit position
            let opp_i = this.pitsNum * 2 + 2 - i;
            this.moveNSeeds(opp_i, storePos, this.pits[opp_i]);

            if (this.checkIfEnded()) {
                this.endGame();
                return 0;
            }

            this.changeTurn();
            return 2;
        }
        if (i == this.myStorePos || i == this.enemyStorePos)
            return 3;
        this.changeTurn();
        return 1;
    }

    checkIfEnded() {
        let add = (a, b) => a + b;
        let sumMyPits = this.pits.slice(1, this.myStorePos).reduce(add, 0);
        let sumEnemyPits = this.pits.slice(this.myStorePos + 1, this.pitsNum * 2 + 2).reduce(add, 0);

        if (sumMyPits == 0 || sumEnemyPits == 0)
            return true;
        return false;
    }

    endGame() {
        if (this.turn) {
            for (let i = this.myStorePos + 1; i < this.pitsNum * 2 + 2; i++)
                this.moveNSeeds(i, this.enemyStorePos, this.pits[i]);
        } else {
            for (let i = 1; i < this.pitsNum + 1; i++)
                this.moveNSeeds(i, this.myStorePos, this.pits[i]);
        }

        let msg = "Draw";
        if (this.pits[this.enemyStorePos] < this.pits[this.myStorePos])
            msg = this.mode == "local" ? "Player 1 Won" : "You Won";
        else if (this.pits[this.enemyStorePos] > this.pits[this.myStorePos])
            msg = this.mode == "local" ? "Player 2 Won" : "You Lost";
        console.log(msg);
    }

    // Moves n seeds from the pit[from_i] to pit[to_i]
    moveNSeeds(from_i, to_i, n) {
        if (n > this.pits[from_i]) return -1;

        let fromValue = this.pitsElem[from_i].childNodes[0];
        let fromPit = this.pitsElem[from_i].children[0];
        let toValue = this.pitsElem[to_i].childNodes[0];
        let toPit = this.pitsElem[to_i].children[0];

        this.pits[from_i] -= n;
        this.pits[to_i] += n;

        // Moving n seeds
        fromValue.nodeValue = this.pits[from_i];
        for (let i = 0; i < n; i++)
            Board.moveSeedTo(fromPit.firstChild, toPit);
        toValue.nodeValue = this.pits[to_i];
    }

    // highlights playable pits
    highlightPits() {
        if (this.turn) {
            // Highliting my pits
            for (let i = 1; i < this.myStorePos; i++) {
                if (this.pits[i] != 0) {
                    this.pitsElem[i].children[0].style.boxShadow = pitShadow + "," + pitHighlightBlue;
                }
                else
                    this.pitsElem[i].children[0].style.boxShadow = pitShadow;
            }
            // Removing enemy pits highlight
            if (this.mode == 'local')
                for (let i = this.myStorePos + 1; i < this.pitsNum * 2 + 2; i++)
                    this.pitsElem[i].children[0].style.boxShadow = pitShadow;
        }
        else {
            // removing my pits highlight
            for (let i = 1; i < this.myStorePos; i++) {
                this.pitsElem[i].children[0].style.boxShadow = pitShadow;
            }
            // Highliting enemy pits
            if (this.mode == 'local') {
                for (let i = this.myStorePos + 1; i < this.pitsNum * 2 + 2; i++) {
                    if (this.pits[i] != 0) {
                        this.pitsElem[i].children[0].style.boxShadow = pitShadow + "," + pitHighlightRed;
                    }
                    else
                        this.pitsElem[i].children[0].style.boxShadow = pitShadow;
                }
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

    static randomPlay(board) {
        let pitPlayed;
        do {
            pitPlayed = Math.floor(Math.random() * board.pitsNum) + 1;
            pitPlayed += board.myStorePos;
        } while (board.pits[pitPlayed] == 0);
        board.movePit(pitPlayed);
    }
}

