"use strict"
// Functions responsible for communicating with the server
const server = 'twserver.alunos.dcc.fc.up.pt';
const port = 8008;

async function request(func, init) {
    const url = `http://${server}:${port}/${func}`;
    const resp = await fetch(url, init);
    return resp;
}


let group = '39429'; // For debugging

// Requests ranking and fills the div with a table containing the JSON data
async function getRanking(div) {
    const init = {
        method: 'POST',
        body: JSON.stringify(
            {
                mode: 'cors'
            })
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

async function register(nick, pass) {
    const init = {
        method: 'POST',
        body: JSON.stringify({
            'nick': nick,
            'password': pass,
            mode: 'cors'
        })
    };
    const req = await request('register', init);
    if (req.ok) {
        return "Login was Successful";
    } else {
        let data = await req.json();
        return data.error;
    }
}

// Receives a function in case of a status update and if there occurs an error
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

// REMEMBER TO REMOVE GROUP!
// Receives nick, pass, number of pits per player (excluding store) and number of seeds per pit
async function join(nick, pass, size, initial) {
    const init = {
        method: 'POST',
        body: JSON.stringify({
            'group': group,
            'nick': nick,
            'password': pass,
            'size': size,
            'initial': initial,
            mode: 'cors'
        })
    };
    const req = await request('join', init);
    let data = await req.json();
    return data.game;
}

async function leave(nick, pass, game) {
    const init = {
        method: 'POST',
        body: JSON.stringify({
            'group': group,
            'nick': nick,
            'password': pass,
            'game': game,
            mode: 'cors'
        })
    };
    const req = await request('leave', init);
    let data = await req.json();
}

// Receives a function in case the move is rejected
async function notify(nick, pass, game, move) {
    const init = {
        method: 'POST',
        body: JSON.stringify({
            'nick': nick,
            'password': pass,
            'game': game,
            'move': move,
            mode: 'cors'
        })
    };
    const req = await request('notify', init);
    if (req.ok)
        return "Successfully notified move"
    else {
        let data = await req.json();
        return data.error;
    }
}