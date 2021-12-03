// Used for configs
const configForm = document.getElementById("config-form");
const configPop = document.getElementById("pop3");
const minSeeds = 2;
const maxSeeds = 14;
const minPits = 2;
const maxPits = 14;
const openPopButton = document.querySelectorAll('[data-pop-target]');
const closePopButton = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');

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
	button.addEventListener('click', () => {
		const pop = document.querySelector(button.dataset.popTarget);
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


function parseConfigs() {
	let pitsNum = parseInt(configForm.children.holesNum.value);
	let seedsNum = parseInt(configForm.children.seedsNum.value);
	// If not all values were filled
	if (seedsNum == undefined || pitsNum == undefined) {
		return;
	}
	// If within expected range
	else if (board === undefined) {
		// If no board was previously created
		if (seedsNum >= minSeeds && seedsNum <= maxSeeds && pitsNum >= minPits && pitsNum <= maxPits) {
			board = new Board(pitsNum, seedsNum, document.getElementById("board"));
			
			// Disabling inputs and selects to make sure user doesnt change them mid game
			var nodes = configForm.childNodes;
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].disabled = true;
			}

			board.initBoard();
			
		}
		else{
			window.alert("Input invalido são aceites entre " + minPits + " a " + maxPits +
				" cavidades por linha e entre " + minSeeds + " a " + maxPits + " sementes por cavidade");
		}
	}

	closePop(configPop);

}