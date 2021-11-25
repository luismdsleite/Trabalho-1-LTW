const openPopButton = document.querySelectorAll('[data-pop-target]');
const closePopButton = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');	
const openPop2Button = document.querySelectorAll('[data-pop2-target]');
const closePop2Button = document.querySelectorAll('[data-close2-button]');

openPopButton.forEach(button => {
	button.addEventListener('click', () => {
		const pop = document.querySelector(button.dataset.popTarget);
    openPop(pop);
	});
})

openPop2Button.forEach(button => {
	button.addEventListener('click', () => {
		const pop2 = document.querySelector(button.dataset.pop2Target);
	openPop(pop2);
	});
})

overlay.addEventListener('click', () => {
	const pops = document.querySelectorAll('.pop.active');
	pops.forEach(pop => {
		closePop(pop);
	});
})

closePopButton.forEach(button => {
	button.addEventListener('click', () =>{
		const pop =button.closest('.pop');
    closePop(pop);
	});
})

closePop2Button.forEach(button => {
	button.addEventListener('click', () =>{
		const pop2 =button.closest('.pop');
		closePop(pop2);
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