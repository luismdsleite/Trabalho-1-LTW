const fs = require("fs");
const crypto = require('crypto');
const http = require('http');
const process = require('process');
const mancala = require('./server/serverMancala');

const hostname = '192.168.1.57';
const port = 9059;
const originHost = '192.168.1.57';
const originPort = 5500;
const leaderboardPath = './server/ranking.json';
const usersPath = './server/users.json'
const backupTimer = 5; // In minutes


let leaderboard = fs.existsSync(leaderboardPath) ? JSON.parse(fs.readFileSync(leaderboardPath)) : {};
let users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : {};
let games = {}; // Games ongoing
let userToID = {} // list of users and its respective gameIDs
backupData(); // Backs up data from backupTimer minutes, calls itself after executing


http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === "GET") {
        const url = new URL(`http://${originHost}:${originPort}` + req.url);
        if (url.pathname === "/update") {
            updates(req, res, url);
            return;
        } else {
            let data = {};
            res.statusCode = 400;
            data.error = "Unknown GET request";
            res.write(JSON.stringify(data));
            res.end();
        }
    }
    let body = [];
    req.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        res.statusCode = 200;
        if (req.method === "POST") {
            body = Buffer.concat(body).toString();
            let data;
            try {
                data = JSON.parse(body)
            } catch (e) {
                res.statusCode = 500;
                data = {};
                data.error = "Error parsing JSON request: " + e.toString();
                res.end(JSON.stringify(data));
                return;
            }

            switch (req.url) {
                case "/join":
                    join(res, data);
                    break;
                case "/leave":
                    leave(res, data);
                    break;
                case "/notify":
                    notify(res, data);
                    break;
                case "/register":
                    register(res, data);
                    break;
                case "/ranking":
                    ranking(res, data);
                    break;
                default:
                    res.statusCode = 404;
                    data = {};
                    data.error = "Unknown POST request"
                    res.write(JSON.stringify(data));
                    break;
            }

        }
        res.end();
    });
}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// backs up users leaderboard data
async function backupData() {
    setTimeout(() => {
        saveDataToJson(usersPath, JSON.stringify(users));
        saveDataToJson(leaderboardPath, JSON.stringify(leaderboard));
        backupData()
    }, 60 * 1000 * backupTimer);
}

function join(res, data) {
    let resData = {};
    let size = data.size;
    let initial = data.initial;
    let nick = data.nick;
    let pass = data.password;

    if (!size) {
        res.statusCode = 400;
        resData.error = "size is undefined";
        res.write(JSON.stringify(resData));
        return;
    } else if (!initial) {
        res.statusCode = 400;
        resData.error = "initial is undefined";
        res.write(JSON.stringify(resData));
        return;
    } else if (!nick) {
        res.statusCode = 400;
        resData.error = "nick is undefined";
        res.write(JSON.stringify(resData));
        return;
    } else if (!pass) {
        res.statusCode = 400;
        resData.error = "password is undefined";
        res.write(JSON.stringify(resData));
        return;
    }

    nick = String(nick);
    pass = String(pass);
    size = parseInt(size);
    initial = parseInt(initial);

    if (size < 0) {
        res.statusCode = 400;
        resData.error = "size is not valid";
        res.write(JSON.stringify(resData));
        return;
    } else if (initial < 0) {
        res.statusCode = 400;
        resData.error = "initial is not valid";
        res.write(JSON.stringify(resData));
        return;
    }

    if (users[nick] !== crypto.createHash('md5').update(pass).digest('hex')) {
        res.statusCode = 401
        resData.error = "User registered with a different password";
        res.write(JSON.stringify(resData));
        return;
    }

    // Checking if users was already in a game
    let gameID = userToID[nick];
    if (gameID !== undefined) {
        resData.game = gameID;
        res.write(JSON.stringify(resData));
        return;
    }

    let game;
    // Finds and joins a valid and open session
    Object.keys(games).forEach(gameID => {
        let currentGame = games[gameID];
        if (currentGame.size == size
            && currentGame.initial == initial && currentGame.p2 === undefined) {
            currentGame.p2 = nick;
            let f = () => { };
            currentGame.mancala = new mancala.Mancala(size, initial, "invisible", [f, f, f]);
            resData.game = gameID;
            game = currentGame;
            userToID[nick] = gameID;
            return;
        }
    });

    // All valid sessions were full creating one
    if (game === undefined) {
        let id;
        do {
            id = crypto.randomBytes(16).toString("hex");
        } while (games[id] !== undefined);

        games[id] = {};
        games[id].size = size;
        games[id].initial = initial;
        games[id].p1 = nick;
        resData.game = id;
        userToID[nick] = id;
    }
    res.write(JSON.stringify(resData));
}
function leave(res, data) {
    let resData = {}
    let nick, pass, gameID;
    nick = data.nick;
    pass = data.password;
    gameID = data.game
    if (!nick) {
        res.statusCode = 400;
        resData.error = "nick is undefined";
        res.write(JSON.stringify(resData));
        return;
    } else if (!pass) {
        res.statusCode = 400;
        resData.error = "password is undefined";
        res.write(JSON.stringify(resData));
        return;
    } else if (!gameID) {
        res.statusCode = 400;
        resData.error = "game is undefined";
        res.write(JSON.stringify(resData));
        return;
    } else if (users[nick] !== crypto.createHash('md5').update(pass).digest('hex')) {
        res.statusCode = 401;
        resData.error = "User registered with a different password";
        res.write(JSON.stringify(resData));
        return;
    } else if (userToID[nick] !== null && userToID[nick] != gameID) {
        res.statusCode = 400;
        resData.error = "Invalid game reference";
        res.write(JSON.stringify(resData));
        return;
    } else {
        let game = games[gameID];
        if (game.p1 === undefined || game.p2 === undefined) {
            if (game.p1 === undefined) {
                game.p2Res.write("data:" + "\n\n")
                game.p2Res.end();
            } else {
                game.p1Res.write("data:" + "\n\n")
                game.p1Res.end();
            }
        } else {
            if (game.p1 === nick) {
                increaseRanking(game.p2, game.p1, game.p2);
                let winner = {};
                winner.winner = game.p2;
                winner = JSON.stringify(winner);
                game.p1Res.end("data:" + winner + "\n\n");
                game.p2Res.write("data:" + winner + "\n\n")
                game.p2Res.end();
            } else {
                increaseRanking(game.p1, game.p1, game.p2);
                let winner = {};
                winner.winner = game.p1;
                winner = JSON.stringify(winner);
                game.p2Res.end("data:" + winner + "\n\n");
                game.p1Res.write("data:" + winner + "\n\n")
                game.p1Res.end();
            }
            delete userToID[games[gameID].p1];
            delete userToID[games[gameID].p2];
            delete games[gameID];
            res.write(JSON.stringify({}));
        }
    }
    //res.end();
}

function notify(res, data) {
    let nick, pass, gameID, move;
    let resData = {};
    nick = data.nick;
    pass = data.password;
    gameID = data.game;
    move = data.move;
    if (!nick) {
        res.statusCode = 400;
        resData.error = "nick is undefined";
        res.end(JSON.stringify(resData));
        return;
    } else if (!pass) {
        res.statusCode = 400;
        resData.error = "password is undefined";
        res.end(JSON.stringify(resData));
        return;
    } else if (!gameID) {
        res.statusCode = 400;
        resData.error = "game is undefined";
        res.end(JSON.stringify(resData));
        return;
    }
    else if (move === undefined) {
        res.statusCode = 400;
        resData.error = "move is undefined";
        res.end(JSON.stringify(resData));
        return;
    }

    move = parseInt(move);
    gameID = String(gameID);
    nick = String(nick);
    pass = String(pass);

    if (games[gameID] === undefined || userToID[nick] !== gameID) {
        res.statusCode = 400;
        resData.error = "Invalid game reference";
        res.end(JSON.stringify(resData));
        return;
    }

    let game = games[gameID];

    if (users[nick] !== crypto.createHash('md5').update(pass).digest('hex')) {
        res.statusCode = 401;
        resData.error = "User registered with a different password";
        res.end(JSON.stringify(resData));
        return;
    }
    if (!(0 <= move && move < game.mancala.pitsNum)) {
        res.statusCode = 400;
        resData.error = "Invalid Move";
        res.end(JSON.stringify(resData));
        return;
    }
    if (game.mancala.turn !== (nick === game.p1)) {
        res.statusCode = 400;
        resData.error = "It is not your turn";
        res.end(JSON.stringify(resData));
        return;
    }

    move = (nick === game.p1) ? move + 1 : move + game.mancala.myStorePos + 1;

    if (game.mancala.pits[move] === 0) {
        res.statusCode = 400;
        resData.error = "Invalid Move";
        res.end(JSON.stringify(resData));
        return;
    }

    game.mancala.movePit(move);
    let convertedMancala = mancalaConverter(game);
    if (game.mancala.checkIfEnded()) {
        game.mancala.endGame();
        let score = game.mancala.pits[game.mancala.myStorePos] - game.mancala.pits[0];
        if (score > 0) convertedMancala.winner = game.p1;
        else if (score < 0) convertedMancala.winner = game.p2;
        else data.winner = null;
        increaseRanking(convertedMancala.winner, game.p1, game.p2);
        convertedMancala = JSON.stringify(convertedMancala);
        game.p1Res.write("data:" + convertedMancala + "\n\n");
        game.p2Res.write("data:" + convertedMancala + "\n\n");
        delete game[userToID[game.p1]];
        delete game[userToID[game.p2]];
        delete userToID[game.p1];
        delete userToID[game.p2];
        game.p1Res.end();
        game.p2Res.end();
    } else {
        convertedMancala = JSON.stringify(convertedMancala);
        game.p1Res.write("data:" + convertedMancala + "\n\n");
        game.p2Res.write("data:" + convertedMancala + "\n\n");
    }
    res.write(JSON.stringify(resData));
}

function ranking(res) {
    res.write(JSON.stringify({
        "ranking": leaderboard.ranking
            .sort(function (a, b) {
                return b.victories - a.victories;
            })
            .slice(0, 10)
    }));
}

function register(res, data) {
    let nick, pass;
    let resData = {};
    nick = data.nick;
    pass = data.password;
    if (!nick) {
        res.statusCode = 400;
        resData.error = "nick is undefined";
    } else if (!pass) {
        res.statusCode = 400;
        resData.error = "password is undefined";
    } else {
        nick = String(nick);
        pass = String(pass);
        const hash = crypto
            .createHash('md5')
            .update(pass)
            .digest('hex');

        if (users[nick] !== undefined && users[nick] !== hash) {
            res.statusCode = 401;
            resData.error = "User registered with a different password";
        } else
            users[nick] = hash;
    }
    res.write(JSON.stringify(resData));
}

function updates(req, res, url) {
    let resData = {};
    let nick = url.searchParams.get("nick");
    let gameID = url.searchParams.get("game");
    if (!gameID) {
        res.statusCode = 400;
        resData.error = "Game reference is undefined";
        res.write(JSON.stringify(resData));
        return;
    }
    if (!nick) {
        res.statusCode = 400;
        resData.error = "nick is undefined";
        res.write(JSON.stringify(resData));
        return;
    }

    nick = String(nick);
    gameID = String(gameID);
    if (userToID[nick] === undefined || userToID[nick] !== gameID) {
        res.statusCode = 400;
        resData.error = "Invalid game reference";
        res.write(JSON.stringify(resData));
        return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');

    let game = games[gameID];

    if (game === undefined) {
        res.statusCode = 400;
        resData.error = "Invalid game reference";
        res.write(JSON.stringify(resData));
        return;
    }
    if (game.p1 === nick) {
        game.p1Res = res;
    } else if (game.p2 === nick) {
        game.p2Res = res;
    }

    if (game.p1Res !== undefined && game.p2Res !== undefined) {
        // Starting the game
        let convertedMancala = JSON.stringify(mancalaConverter(game));
        game.p1Res.write("data:" + convertedMancala + "\n\n");
        game.p2Res.write("data:" + convertedMancala + "\n\n");
    }
    /* req.on("close", function () {

    }) */
}

/**
 * @param {String} fileName 
 */
function saveDataToJson(fileName, content) {
    fs.writeFile(fileName, content, err => {
        if (err) {
            console.error(err);
            return;
        }
    })
}

process.on('SIGINT', () => {
    console.log('Got SIGINT signal.');
    fs.writeFileSync(leaderboardPath, JSON.stringify(leaderboard))
    fs.writeFileSync(usersPath, JSON.stringify(users));
    console.log('Exiting.');
    process.exit(0);
});

function mancalaConverter(game) {
    let p1 = game.p1, p2 = game.p2, mancala = game.mancala;
    let data = {};
    data.board = {};
    data.board.sides = {};
    data.board.sides[p1] = {};
    data.board.sides[p2] = {}
    data.board.sides[p1].pits = [];
    data.board.sides[p2].pits = [];

    data.board.turn = game.mancala.turn ? p1 : p2;
    data.board.sides[p2].store = mancala.pits[mancala.myStorePos];
    data.board.sides[p2].store = mancala.pits[mancala.enemyStorePos];

    data.stores = {};
    data.stores[p1] = mancala.pits[mancala.myStorePos];
    data.stores[p2] = mancala.pits[mancala.enemyStorePos];

    for (let i = 0; i < mancala.pitsNum; i++) {
        data.board.sides[p1].pits[i] = mancala.pits[i + mancala.enemyStorePos + 1];
        data.board.sides[p2].pits[i] = mancala.pits[i + mancala.myStorePos + 1];
    }
    return data;
}

function increaseRanking(winnerNick, nick1, nick2) {
    let ranking = leaderboard.ranking;
    let rank1 = ranking.find(e => e.nick == nick1);
    let rank2 = ranking.find(e => e.nick == nick2);
    if (rank1 === undefined) {
        rank1 = {
            "nick": nick1,
            "victories": 0,
            "games": 0
        };
        ranking.push(rank1);
    }
    if (rank2 === undefined) {
        rank2 = {
            "nick": nick2,
            "victories": 0,
            "games": 0
        };
        ranking.push(rank2);
    }
    rank1.games += 1;
    rank2.games += 1;
    if (winnerNick == nick1) {
        rank1.victories += 1;
    } else if (winnerNick == nick2) {
        rank2.victories += 1;
    }
}