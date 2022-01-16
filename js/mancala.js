"use strict"
// Used for Board class
const boardClass = "holesGrid";
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
const seedAnimationTime = 0.25; // time for seed animation in seconds

const AIPlayDelay = 500;


class Mancala {
    /**
     *
     * @param {number} pitsNum 
     * @param {number} seedsNum 
     * @param {string} mode 
     * @param {[Function, Function, Function]} winLoseDrawFunct 
     * @param {number} ai_difficulty 
     */
    constructor(pitsNum, seedsNum, mode, winLoseDrawFunct, ai_difficulty) {
        this.pitsNum = pitsNum; // Number of pits per row (Stores are not counted here)
        this.pits = Array(this.pitsNum * 2 + 2); // Number of seeds each pit has (including both stores)
        this.pitsElem = Array(this.pitsNum * 2 + 2); // Array that will hold the div that contains the pit and the value
        this.turn = true; // Bool indicating whose turn it is
        this.myStorePos = pitsNum + 1;
        this.enemyStorePos = 0;
        this.mode = mode; // Local, Multiplayer, vs AI
        this.ai = ai_difficulty; // Only used vs AI
        this.boardEle = null;
        // Settings stores to both have 0 seeds
        this.pits[this.myStorePos] = 0;
        this.pits[this.enemyStorePos] = 0;

        for (let i = 1; i < this.pits.length; i++) {
            if (i == this.myStorePos || i == this.enemyStorePos)
                this.pits[i] = 0;
            else
                this.pits[i] = seedsNum;
        }

        this.clickEvent;
        this.winLoseDrawFunct = winLoseDrawFunct;
    }

    /**
     * Configures a div with id=boardID to be a mancala board
     * @param {Function} clickEvent 
     * @param {string} boardID 
     * @returns 
     */
    initBoard(clickEvent, boardID) {
        this.clickEvent = clickEvent;

        // ID where mancala will be constructed
        this.boardEle = document.getElementById(boardID);
        if (this.boardEle == null) {
            console.error("Invalid id, InitBoard()");
            return -2;
        }
        this.boardEle.className = boardClass;

        if (this.mode == 'invisible') {
            return 0;
        }

        this.initHoles();
        this.initSeeds();

        if (this.mode == 'local')
            for (let i = 1; i < this.pitsNum * 2 + 2; i++) {
                if (i == this.myStorePos || i == this.enemyStorePos) continue;
                let hole = this.pitsElem[i].children[0]
                hole.addEventListener("click", clickEvent, false);
                hole.i = i;
                hole.mancala = this;
            }
        else if (this.mode == 'multiplayer' || this.mode == 'ai') {
            for (let i = 1; i < this.myStorePos; i++) {
                let hole = this.pitsElem[i].children[0]
                hole.addEventListener("click", clickEvent, false);
                hole.i = i;
                hole.mancala = this;
            }
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
        enemyStoreParent.textContent = this.pits[this.enemyStorePos];
        enemyStoreParent.appendChild(enemyStore);
        this.boardEle.appendChild(enemyStoreParent);

        // Creating a grid between enemy store and my store
        let smallPitsGrid = document.createElement("div");
        smallPitsGrid.classList = PitsGridClass;
        this.boardEle.appendChild(smallPitsGrid);

        // Creating my store
        let myStoreParent = document.createElement("div");
        myStoreParent.classList = storeRightParent;
        let myStore = document.createElement("div");
        myStore.classList = myStoreClass;
        myStoreParent.textContent = this.pits[this.myStorePos];
        myStoreParent.appendChild(myStore);
        this.boardEle.appendChild(myStoreParent);


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
                Mancala.createSeed(this.pitsElem[i].children[0]);
            }
        }
    }

    AImove() {

        if (this.ai == 0) {
            MancalaAI.randomPlay(this);
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

        let s = this
        if (state != 0 && this.mode == 'ai' && !this.turn) {
            setTimeout(() => this.AImove(), AIPlayDelay);
        }
    }

    // Syncs board with another array pits
    syncBoard(pits, turn) {
        let pitsDiff = pits.slice().map((n, i) => n - this.pits[i]);
        let min = this.turn ? 1 : this.myStorePos + 1;
        let max = this.turn ? this.myStorePos : this.pitsNum * 2 + 2;

        let interestPits = pitsDiff.slice(min, max);
        let seedsMoved = Math.min(...interestPits);
        let pitMoved = interestPits.indexOf(seedsMoved);

        // Compensating slice() offset
        if (!this.turn) pitMoved += this.myStorePos + 1;
        else pitMoved += 1;

        this.movePit(pitMoved);

        // In case server and local Boards are not correctly synced
        let arraysEqual = true;
        for (let i = 0; i < this.pits.length; ++i) {
            if (this.pits[i] !== pits[i]) {
                arraysEqual = false;
                break;
            }
        }
        if (!arraysEqual) {
            console.log("BOARD WAS NOT SYNCED!");
            this.boardEle.textContent = "";
            this.pits = pits;
            this.pitsElem = Array(this.pitsNum * 2 + 2);
            this.initBoard(this.clickEvent, this.boardEle.id);
        }

        if (turn != this.turn) this.changeTurn();
        this.highlightPits();
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
        for (let i = 1; i < this.myStorePos; i++)
            if (this.pits[i] != 0) this.moveNSeeds(i, this.myStorePos, this.pits[i]);
        for (let i = this.myStorePos + 1; i < this.pitsNum * 2 + 2; i++)
            if (this.pits[i] != 0) this.moveNSeeds(i, this.enemyStorePos, this.pits[i]);

        if (this.pits[this.enemyStorePos] < this.pits[this.myStorePos])
            this.winLoseDrawFunct[0]();
        else if (this.pits[this.enemyStorePos] > this.pits[this.myStorePos])
            this.winLoseDrawFunct[1]();
        else this.winLoseDrawFunct[2]();
    }

    // Moves n seeds from the pit[from_i] to pit[to_i]
    moveNSeeds(from_i, to_i, n) {
        if (n > this.pits[from_i]) return -1;

        this.pits[from_i] -= n;
        this.pits[to_i] += n;

        if (this.mode != 'invisible') {
            let fromValue = this.pitsElem[from_i].childNodes[0];
            let fromPit = this.pitsElem[from_i].children[0];
            let toValue = this.pitsElem[to_i].childNodes[0];
            let toPit = this.pitsElem[to_i].children[0];
            // Moving n seeds
            fromValue.nodeValue = this.pits[from_i];
            for (let i = 0; i < n; i++)
                Mancala.moveSeedTo(fromPit.firstChild, toPit, true);
            toValue.nodeValue = this.pits[to_i];
        }
    }

    // highlights playable pits
    highlightPits() {
        if (this.mode == 'invisible') return;
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
        Mancala.moveSeedTo(seed, parent, false);
        return seed;
    }

    // positions a seed in parent pit in a random position
    static moveSeedTo(seed, parent, animated) {

        let div, scrollTop = document.documentElement.scrollTop;
        if (animated) {
            // Creating a "Fake" seed on top the real one, and making the other one invisible
            div = document.createElement("div");
            div.className = seed.className;
            div.setAttribute('style', seed.getAttribute('style'));
            let seedRect = seed.getBoundingClientRect();
            document.body.appendChild(div);
            div.style.position = "absolute";
            div.style.left = seedRect.left + "px";
            div.style.top = seedRect.top + scrollTop + "px";
            div.style.transition = "all " + seedAnimationTime + "s linear";
            seed.style.display = "none";
        }

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

        if (animated) {
            // Moving "Fake" seed to target pit, making real seed visible and removing the "Fake" seed 
            let randomOffset1PX = (rectparent.width) * randomOffset1 / 100 // converted to pixels
            let randomOffset2PX = (rectparent.height) * randomOffset2 / 100 // converted to pixels
            div.style.position = "absolute";
            div.style.left = (rectparent.left + rectparent.width / 2 - width / 2 + randomOffset1PX) + "px";
            div.style.top = (rectparent.top + rectparent.height / 2 - height / 2 + randomOffset2PX) + scrollTop + "px";
            setTimeout((div, seed) => {
                seed.style.display = "";
                div.remove();
            }, seedAnimationTime * 1000, div, seed);
        }

    }
}

class MancalaAI {
    static randomPlay(mancala) {
        let pitPlayed;
        do {
            pitPlayed = Math.floor(Math.random() * mancala.pitsNum) + 1;
            pitPlayed += mancala.myStorePos;
        } while (mancala.pits[pitPlayed] == 0);
        mancala.movePit(pitPlayed);
    }
}

