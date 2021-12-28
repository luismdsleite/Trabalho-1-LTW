"use strict"
// Used for configs
const authForm = document.getElementById("auth-form");
const authPop = document.getElementById("pop2");
const configForm = document.getElementById("config-form");
const configPop = document.getElementById("pop3");
const minSeeds = 2;
const maxSeeds = 14;
const minPits = 2;
const maxPits = 14;
const openPopButton = document.querySelectorAll('[data-pop-target]');
const closePopButton = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');

// Variables required for communicating with the server
let nick, pass, game, eventSrc, opponent, multiplayerStatus, leaveButton;

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
configForm.children.configFormButton.addEventListener('click', parseConfigs, false);
// Submit button on Authentication
authForm.children.authButton.addEventListener('click', parseAuth, false);

function parseConfigs() {
	let configs = configForm.children;
	let pitsNum = parseInt(configs.holesNum.value);
	let seedsNum = parseInt(configs.seedsNum.value);

	// If not all values were filled
	if (seedsNum == undefined || pitsNum == undefined)
		return;

	// If within expected range
	else if (seedsNum >= minSeeds && seedsNum <= maxSeeds && pitsNum >= minPits && pitsNum <= maxPits) {
		let boardElement = document.getElementById("mancala");
		if (boardElement !== undefined) boardElement.textContent = '';

		let ai;
		// choosing mode
		if (configs.opponent.selectedIndex == 1)
			mancala = new Mancala(pitsNum, seedsNum, boardElement, 'local', [win, lose, draw]);
		else if (configs.opponent.selectedIndex == 0) {
			if (nick == undefined) {
				alert("Tem de tar logado para jogar multiplayer");
				closePop(configPop);
				return;
			}
			if (multiplayerStatus === undefined) multiplayerStatus = document.createElement("button");
			multiplayerStatus.className = "button-1";
			multiplayerStatus.textContent = "Criando Jogo";
			document.getElementById("interface").appendChild(multiplayerStatus);
			if (leaveButton === undefined) leaveButton = document.createElement("button");
			leaveButton.className = "leave-button";
			leaveButton.textContent = "Sair do Jogo";
			leaveButton.addEventListener('click', () => leave(nick, pass, game).catch("Não se encontra num jogo online"), false);
			mancala = new Mancala(pitsNum, seedsNum, boardElement, 'multiplayer', [win, lose, draw]);
			mancala.boardID.parentNode.insertBefore(leaveButton, mancala.boardID.nextSibling);
			setUpMultiplayer(pitsNum, seedsNum, boardElement);
		}
		else {
			mancala = new Mancala(pitsNum, seedsNum, boardElement, 'ai', [win, lose, draw], ai_difficulty = configs.opponent.selectedIndex - 2);
			ai = configs.opponent.selectedIndex;
		}

		// choosing who plays first
		if (mancala.mode != 'multiplayer' && configs.firstMove.selectedIndex != 0) {
			mancala.changeTurn();
		}
		// Initializing mancala with function in boardEvents.js
		if (mancala.mode != 'multiplayer') mancala.initBoard(clickPit);
		if (mancala.mode == 'ai' && !mancala.turn) mancala.AImove();

	}
	else {
		window.alert("Input invalido são aceites entre " + minPits + " a " + maxPits +
			" cavidades por linha e entre " + minSeeds + " a " + maxPits + " sementes por cavidade");
	}
	closePop(configPop);

}

async function parseAuth() {
	closePop(authPop);
	let formNick = authForm.fname.value, formPass = authForm.fpass.value;

	if (isNullOrWhitespace(formNick) || isNullOrWhitespace(formPass)) {
		alert("Username ou Palavra-Passe não preenchidos");
		return;
	}
	let answer = await register(formNick, formPass);
	if (answer == "Login was Successful") {
		nick = formNick;
		pass = formPass;
	} else {
		nick = undefined;
		pass = undefined;
	}
	alert(answer);
	return;
}


function isNullOrWhitespace(input) {
	return (typeof input === 'undefined' || input == null)
		|| input.replace(/\s/g, '').length < 1;
}

async function setUpMultiplayer(pitsNum, seedsNum) {
	game = await join(nick, pass, pitsNum, seedsNum);
	multiplayerStatus.textContent = "À espera de jogadores";
	eventSrc = await update(nick, game, serverUpdate, serverError);
}

async function serverUpdate(e) {
	let data = JSON.parse(e.data);
	if (data.winner !== undefined) {
		if (data.winner === null)
			setTimeout(() => alert("Desististe do Jogo"), seedAnimationTime * 1000 * 2);
		else if (data.winner === nick)
			setTimeout(() => alert("Ganhaste"), seedAnimationTime * 1000 * 2);
		else if (data.winner === opponent)
			setTimeout(() => alert("Perdeste"), seedAnimationTime * 1000 * 2);
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
			multiplayerStatus.textContent = "Found a match";
			if ((data.board.turn != nick && mancala.turn) || (data.board.turn == nick && !mancala.turn)) {
				mancala.changeTurn();
			}
			mancala.initBoard(multiplayerClickPit);
			Object.keys(data.stores).forEach(player => {
				if (player != nick) opponent = player;
			});
			if (mancala.turn) multiplayerStatus.textContent = "Vez de " + nick;
			else multiplayerStatus.textContent = "Vez de " + opponent;
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
			if (mancala.turn) multiplayerStatus.textContent = "Vez de " + nick;
			else multiplayerStatus.textContent = "Vez de " + opponent;
		}
	}
}

async function serverError() {
	game = undefined;
	opponent = undefined;
	leftGame = false;
	eventSrc.close()
	eventSrc = undefined;
	alert("Algo de errado ocorreu a juntar à sessão, tente novamente ou dê refresh à pagina");
}

async function notifyServer(i) {
	const status = await notify(nick, pass, game, i);
	if (status === "Successfully notified move");
	else alert(status);
}


function win() {
	if (mancala.mode == 'multiplayer') return;
	let msg = mancala.mode == "local" ? "Player 1 Won" : "You Won";
	setTimeout(() => alert(msg), seedAnimationTime * 1000 * 2);
}
function lose() {
	if (mancala.mode == 'multiplayer') return;
	let msg = mancala.mode == "local" ? "Player 2 Won" : "You Lost";
	setTimeout(() => alert(msg), seedAnimationTime * 1000 * 2);
}
function draw() {
	if (mancala.mode == 'multiplayer') return;
	let msg = "Draw";
	setTimeout(() => alert(msg), seedAnimationTime * 1000 * 2);
}

