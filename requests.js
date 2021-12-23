// Functions responsible for communicating with the server

const server = 'twserver.alunos.dcc.fc.up.pt';
const port = 8008;
async function request(func, init) {
    const url = `http://${server}:${port}/${func}`;
    const resp = await fetch(url, init);
    return await resp.json();
}

// Requests ranking and fills the div with a table containing the JSON data
async function getRanking(div) {
    const init = {
        method: 'POST',
        body: JSON.stringify({})
    }
    const req = await request('ranking', init);
    const data = await req.ranking;

    let text = "<table><tr>"
    for (key in data[0]) {
        text += '<td><b>' + key + '</b></td>';
    }
    text += "</tr>";
    for (var i = 0; i < data.length; i++) {
        text += '<tr>';
        for (key in data[i]) {
            text += '<td>' + data[i][key] + '</td>';
        }
        text += '</tr>';
    }
    text += "</table>";
    div.innerHTML = text;
}