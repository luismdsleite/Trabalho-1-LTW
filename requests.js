// Functions responsible for communicating with the server
const server = 'twserver.alunos.dcc.fc.up.pt';
const port = 8008;
async function request(func, init) {
    const url = `http://${server}:${port}/${func}`;
    const resp = await fetch(url, init);
    return resp;
}

/*
urlencoded data functions:
    encodeURI(uri) e decodeURI(uri)
    encodeURIComponent() e decodeURIComponent()
*/

// Requests ranking and fills the div with a table containing the JSON data
async function getRanking(div) {
    const init = {
        method: 'POST',
        body: JSON.stringify({})
    };
    const req = await request('ranking', init);
    const data = await req.json();
    const ranking = data.ranking;

    let text = "<table><tr>"
    for (key in ranking[0]) {
        text += '<td><b>' + key + '</b></td>';
    }
    text += "</tr>";
    for (var i = 0; i < ranking.length; i++) {
        text += '<tr>';
        for (key in ranking[i]) {
            text += '<td>' + ranking[i][key] + '</td>';
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

