const openPopButton = document.querySelectorAll('[data-pop-target]');
const closePopButton = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');

// Listener to open a pop
openPopButton.forEach(button => {
	button.addEventListener('click', () => {
		const pop = document.querySelector(button.dataset.popTarget);
		openPop(pop);
	});
})

// Listener to close all active pops when clicking anywhere outside pop or popheader
overlay.addEventListener('click', () => {
	const pops = document.querySelectorAll('.pop.active');
	pops.forEach(pop => {
		closePop(pop);
	});
})

// Listener on x button to close pop
closePopButton.forEach(button => {
	button.addEventListener('click', () => {
		const pop = button.closest('.pop');
		closePop(pop);
	});
})

function openPop(pop) {
	if (pop == null) return;
	pop.classList.add('active');
	overlay.classList.add('active');
}

function closePop(pop) {
	if (pop == null) return;
	pop.classList.remove('active');
	overlay.classList.remove('active');
}