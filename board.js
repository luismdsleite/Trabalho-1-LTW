const numberHolesForm = document.getElementById("config-form");


numberHolesForm.children.holes_number.addEventListener('change', (e) => {
    console.log(parseInt(e.target.value));
});

class Board {
    constructor(holes_num, seeds) {
        seeds = seeds;
        holes = holes_num;
    }
    

}