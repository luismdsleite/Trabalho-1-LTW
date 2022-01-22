const hostname = '192.168.1.57';
const port = 3000;
const originHost = '192.168.1.57';
const originPort = 5500;

const http = require('http');
const error500 = { error: "Invalid request" };

http.createServer((req, res) => {
    console.log(req.headers.origin);
    let hasBody = false;
    let body = [];
    req.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        try {
            let data = JSON.parse(body);
            console.log(data);
        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            res.end(JSON.stringify(error500));
            return;
        }
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', `http://${originHost}:${originPort}`);

        switch (req.url) {
            case "/join":
                join(req, res);
                break;
            case "/leave":
                leave(req, res);
                break;
            case "/notify":
                notify(req, res);
                break;
            case "/ranking":
                ranking(req, res);
                break;
            case "/register":
                register(req, res);
                break;
            default:
                res.statusCode = 500;
                res.write(JSON.stringify(error500));
                break;
        }
        res.end();
    });
}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function join(req, res) {
    console.log("join");
    try {
        let x = undefined;
        console.log(x.data);
    } catch (error) {
        console.log(error);
    }
}
function leave(req, res, data) {
    console.log("leave");
}
function notify(req, res, data) {
    console.log("notify");
}
function ranking(req, res) {
    console.log("ranking");
}
function register(req, res, data) {
    console.log("register");
}