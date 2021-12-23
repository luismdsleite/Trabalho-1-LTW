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

let nick = undefined, pass = undefined;

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
				.catch(e => alert("Unable to fetch leaderboard"));
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
			mancala = new Mancala(pitsNum, seedsNum, boardElement, 'local');
		else if (configs.opponent.selectedIndex == 0) {
			if (nick == undefined) {
				alert("Tem de tar logado para jogar multiplayer");
				closePop(configPop);
				return;
			}
			mancala = new Mancala(pitsNum, seedsNum, boardElement, 'multiplayer');
		}
		else {
			mancala = new Mancala(pitsNum, seedsNum, boardElement, 'ai', configs.opponent.selectedIndex - 2);
			ai = configs.opponent.selectedIndex;
		}
		// choosing who plays first
		if (configs.firstMove.selectedIndex != 0) {
			mancala.changeTurn();
		}


		// Initializing mancala with function in boardEvents.js
		mancala.initBoard(clickPit);

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
	} else{
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

