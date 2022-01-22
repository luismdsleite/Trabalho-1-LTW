// Functions responsible for communicating with the server
"use strict"

const server = 'twserver.alunos.dcc.fc.up.pt';
//const server = '192.168.1.57';
const port = 8008;
//const port = 3000;

/**
 * Only function that interacts with server
 * @param {String} func 
 * @param {RequestInit} init 
 * @returns {Promise<Response>}
 */
async function request(func, init) {
    const url = `http://${server}:${port}/${func}`;
    const resp = fetch(url, init);
    return resp;
}


let group = '59'; // For debugging


/**
 * Requests ranking and fills the div with a table containing the JSON data
 * @param {HTMLElement} div 
 */
async function getRanking(div) {
    const init = {
        method: 'POST',
        body: JSON.stringify({})
    };
    const req = await request('ranking', init);
    const data = await req.json();

    // Turning JSON to Table
    const ranking = data.ranking;
    let keys = Object.keys(ranking[0]);
    let text = "<table><tr>";
    for (let i = 0; i < keys.length; i++) {
        text += '<td><b>' + keys[i] + '</b></td>';
    }
    text += "</tr>";

    for (let i = 0; i < ranking.length; i++) {
        text += '<tr>';
        for (let j = 0; j < keys.length; j++) {
            text += '<td>' + ranking[i][keys[j]] + '</td>';
        }
        text += '</tr>';
    }
    text += "</table>";
    div.innerHTML = text;
}

/**
 * Registeres user if the username was never used or tries to log in otherwise
 * @param {String} nick 
 * @param {String} pass 
 * @returns {Promise<Response>}
 */
async function register(nick, pass) {
    const init = {
        method: 'POST',
        body: JSON.stringify({
            'nick': nick,
            'password': pass,
        })
    };
    const req = request('register', init);
    return req;
}

/**
 * Receives a function in case of a status update and if there occurs an error
 * @param {String} nick 
 * @param {String} game 
 * @param {(e:Event) => any} funct 
 * @param {(e:Event) => any} errFunct 
 * @returns {Promise<EventSource>}
 */
async function update(nick, game, funct, errFunct) {
    const url = new URL(`http://${server}:${port}/update`);
    let params = [
        ['nick', nick],
        ['game', game],
    ];
    url.search = new URLSearchParams(params).toString();

    const source = new EventSource(url)
    source.onerror = errFunct
    source.onmessage = funct
    return source;
}

/**
 * REMEMBER TO REMOVE GROUP!
 * Joins/creates lobby
 * @param {String} nick 
 * @param {String} pass 
 * @param {number} size number of pits per player (excluding store)
 * @param {number} initial number of seeds per pit
 * @returns {Promise<Response>}
 */
async function join(nick, pass, size, initial) {
    const init = {
        method: 'POST',
        body: JSON.stringify({
            'group': group,
            'nick': nick,
            'password': pass,
            'size': size,
            'initial': initial
        })
    };
    return request('join', init);
}

/**
 * @param {String} nick 
 * @param {String} pass 
 * @param {String} game 
 * @returns {Promise<Responde>}
 */
async function leave(nick, pass, game) {
    const init = {
        method: 'POST',
        body: JSON.stringify({
            'group': group,
            'nick': nick,
            'password': pass,
            'game': game
        })
    };
    let req = request('leave', init);
    return req;
}

/**
 * 
 * @param {String} nick 
 * @param {String} pass 
 * @param {String} game 
 * @param {number} move Target pit
 * @returns 
 */
async function notify(nick, pass, game, move) {
    const init = {
        method: 'POST',
        body: JSON.stringify({
            'nick': nick,
            'password': pass,
            'game': game,
            'move': move
        })
    };
    return request('notify', init);
}