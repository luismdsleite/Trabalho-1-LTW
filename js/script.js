"use strict"

// tells Mancala class the div to create the board
const boardID = 'mancala';
// Used for configs
const authForm = document.getElementById("auth-form");
const authPop = document.getElementById("pop2");
const configForm = document.getElementById("config-form");
const configPop = document.getElementById("pop3");
const minSeeds = 1;
const maxSeeds = 14;
const minPits = 1;
const maxPits = 14;
const defaultSeedsNum = 6;
const defaultPitsNum = 6;
const openPopButton = document.querySelectorAll('[data-pop-target]');
const closePopButton = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');
const modesIndex = { "multiplayer": 0, "local": 1, "AI_1": 2, "AI_2": 3, "AI_3": 4 };
const configs = configForm.children;
// Variables required for communicating with the server
let nick, pass, game, eventSrc, opponent, multiplayerStatus, leaveButton;
// Will hold the board class
let mancala;


configs.holesNum.min = minPits;
configs.holesNum.max = maxPits;
configs.seedsNum.min = minSeeds;
configs.seedsNum.max = maxSeeds;

// If a user enters the site with multiplayer already selected
if (configs.opponent.selectedIndex == modesIndex.multiplayer)
	configs.opponent.selectedIndex = modesIndex.local;

// If value of pits or seeds does not fit range (or is undefined)
if (!(minPits < configs.holesNum.value && configs.holesNum.value > maxPits)
	&& !(minSeeds < configs.holesNum.value && configs.holesNum.value > maxSeeds)) {
	configs.holesNum.value = defaultPitsNum;
	configs.seedsNum.value = defaultSeedsNum;
}

parseConfigs(); // To have a predefined mancala

// remove pop up
function openPop(pop) {
	if (pop == null) return;
	pop.classList.add('active');
	overlay.classList.add('active');
}

// Open pop up
function closePop(pop) {
	if (pop == null) return;
	pop.classList.remove('active');
	overlay.classList.remove('active');
}

// Listener to open a pop
openPopButton.forEach(button => {
	const popTarget = button.dataset.popTarget;

	button.addEventListener('click', () => {
		const pop = document.querySelector(popTarget);
		if (popTarget == '#pop4') {
			const divs = Array.from(document.querySelectorAll(".pop-body"));
			const popBody4 = divs.filter(item => item.parentNode.id == 'pop4')[0];
			getRanking(popBody4)
				.catch(() => alert("Unable to fetch leaderboard"));
		}
		openPop(pop);
	});
});

// Listener to close all active pops when clicking anywhere outside pop or popheader
overlay.addEventListener('click', () => {
	const pops = document.querySelectorAll('.pop.active');
	pops.forEach(pop => {
		closePop(pop);
	});
});

// Listener on x button to close pop
closePopButton.forEach(button => {
	button.addEventListener('click', () => {
		const pop = button.closest('.pop');
		closePop(pop);
	});
});

// Submit button on configurations
configs.configFormButton.addEventListener('click', parseConfigs, false);
// Submit button on Authentication
authForm.children.authButton.addEventListener('click', parseAuth, false);


function parseConfigs() {

	let pitsNum = parseInt(configs.holesNum.value);
	let seedsNum = parseInt(configs.seedsNum.value);

	// If not all values were filled
	if (seedsNum == undefined || pitsNum == undefined)
		return;

	// If within expected range
	else if (seedsNum >= minSeeds && seedsNum <= maxSeeds && pitsNum >= minPits && pitsNum <= maxPits) {
		let boardElement = document.getElementById("mancala");
		if (boardElement !== undefined) boardElement.textContent = '';

		// choosing mode
		if (configs.opponent.selectedIndex == modesIndex.local)
			mancala = new Mancala(pitsNum, seedsNum, 'local', [win, lose, draw]);
		else if (configs.opponent.selectedIndex == modesIndex.multiplayer) {
			if (nick == undefined) {
				alert("Login is required for multiplayer, please log in and try again");
				closePop(configPop);
				return;
			}
			if (multiplayerStatus === undefined) multiplayerStatus = document.createElement("button");
			multiplayerStatus.className = "button-1";
			multiplayerStatus.textContent = "Creating Game";
			document.getElementById("interface").appendChild(multiplayerStatus);
			if (leaveButton === undefined) leaveButton = document.createElement("button");
			leaveButton.className = "leave-button";
			leaveButton.textContent = "Leave Game";
			leaveButton.addEventListener('click',
				() => leave(nick, pass, game),
				false);
			mancala = new Mancala(pitsNum, seedsNum, 'multiplayer', [win, lose, draw]);
			boardElement.parentNode.insertBefore(leaveButton, boardElement.nextSibling);
			setUpMultiplayer(pitsNum, seedsNum, boardID);
		}
		else {
			mancala = new Mancala(pitsNum, seedsNum, 'ai', [win, lose, draw], configs.opponent.selectedIndex - 2);
		}

		// choosing who plays first
		if (mancala.mode != 'multiplayer' && configs.firstMove.selectedIndex != 0) {
			mancala.changeTurn();
		}
		// Initializing mancala with function in boardEvents.js
		if (mancala.mode != 'multiplayer') mancala.initBoard(clickPit, boardID);
		if (mancala.mode == 'ai' && !mancala.turn) setTimeout(() => mancala.AImove(), AIPlayDelay);

	}
	else {
		window.alert("Invalid input, you can choose between " + minPits + " a " + maxPits +
			" pits per row and " + minSeeds + " a " + maxPits + " seeds per pit");
	}
	closePop(configPop);

}

async function parseAuth() {
	closePop(authPop);
	let formNick = authForm.fname.value, formPass = authForm.fpass.value;

	if (isNullOrWhitespace(formNick) || isNullOrWhitespace(formPass)) {
		alert("Username or Password were left blank");
		return;
	}
	let req = await register(formNick, formPass);
	if (req.ok) {
		nick = formNick;
		pass = formPass;
		alert("Logged in with success");
	} else {
		let json = await req.json();
		alert(json.error);
		nick = undefined;
		pass = undefined;
	}
}

function isNullOrWhitespace(input) {
	return (typeof input === 'undefined' || input == null)
		|| input.replace(/\s/g, '').length < 1;
}

async function setUpMultiplayer(pitsNum, seedsNum) {
	let req = await join(nick, pass, pitsNum, seedsNum);
	if (req.ok) {
		let data = await req.json();
		game = data.game;
		multiplayerStatus.textContent = "Waiting for a player to join";
		eventSrc = await update(nick, game, serverUpdate, serverError);
	} else {
		alert("An error ocurred while creating a game");
	}
}

async function serverUpdate(e) {
	let data = JSON.parse(e.data);
	if (data.winner !== undefined) {
		if (data.winner === null) {
			if (data.board !== undefined) draw();
			else setTimeout(() => alert("Stopped Search"), seedAnimationTime * 1000 * 2);
		}
		else if (data.winner === nick)
			win()
		else if (data.winner === opponent)
			lose()
		multiplayerStatus.parentNode.removeChild(multiplayerStatus);
		leaveButton.parentNode.removeChild(leaveButton);
		multiplayerStatus = undefined;
		leaveButton = undefined;
		game = undefined;
		opponent = undefined;
		eventSrc.close();
		eventSrc = undefined;
	}
	else {
		if (opponent === undefined) {
			// Creating board and warning user a match was found
			multiplayerStatus.textContent = "Game Found";
			if ((data.board.turn != nick && mancala.turn) || (data.board.turn == nick && !mancala.turn)) {
				mancala.changeTurn();
			}
			mancala.initBoard(multiplayerClickPit, boardID);
			Object.keys(data.stores).forEach(player => {
				if (player != nick) opponent = player;
			});
			if (mancala.turn) multiplayerStatus.textContent = "Turn:" + nick;
			else multiplayerStatus.textContent = "Turn:" + opponent;
		} else {
			// Transforming server board to a format that our local mancala board can read and sending to its syncBoard() method
			let mancalaArray = [];
			// Adding opponent Store
			mancalaArray.push(data.stores[opponent]);
			// Adding my pits
			data.board.sides[nick].pits.forEach(seeds => mancalaArray.push(seeds));
			mancalaArray.push(data.stores[nick]);
			data.board.sides[opponent].pits.forEach(seeds => mancalaArray.push(seeds));
			mancala.syncBoard(mancalaArray, data.board.turn == nick);
			if (mancala.turn) multiplayerStatus.textContent = "Turn:" + nick;
			else multiplayerStatus.textContent = "Turn:" + opponent;
		}
	}
}

async function serverError() {
	game = undefined;
	opponent = undefined;
	leftGame = false;
	eventSrc.close()
	eventSrc = undefined;
	alert("Something went wrong");
}

async function notifyServer(i) {
	let req = await notify(nick, pass, game, i);
	if (!req.ok) {
		let json = await req.json();
		alert(json.error);
	}
}


function win() {
	let msg = mancala.mode == "local" ? "Player 1 Won" : "You Won";
	setTimeout(() => alert(msg), seedAnimationTime * 1000 * 2);
}
function lose() {
	let msg = mancala.mode == "local" ? "Player 2 Won" : "You Lost";
	setTimeout(() => alert(msg), seedAnimationTime * 1000 * 2);
}
function draw() {
	let msg = "Draw";
	setTimeout(() => alert(msg), seedAnimationTime * 1000 * 2);
}
