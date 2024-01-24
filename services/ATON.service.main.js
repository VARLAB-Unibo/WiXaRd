/*!
    @preserve

      ATON Main Service (gateway)

      @author Bruno Fanini
    VHLab, CNR ISPC

==================================================================================*/

const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const url = require('url');
//const compression = require('compression');
const path = require('path');
const cors = require('cors');
const chalk = require('chalk');

const socketio = require('socket.io');
const socketio_cli = require('socket.io-client');
const Photon = require('./photon/Photon.js');
// const ATON = require('../public/dist/ATON.min.js');

const glob = require("glob");
const nanoid = require("nanoid");
const { createProxyMiddleware } = require('http-proxy-middleware');

const Core = require('./Core');
const lzutf8 = require('lzutf8');
const net = require('net');
const { debug } = require('console');

// Initialize & load config files
Core.init();

const CONF = Core.config;

// Standard PORTS
let PORT = CONF.services.main.PORT;
let PORT_SECURE = CONF.services.main.PORT_S;
let PHOTON_PORT = CONF.services.photon.PORT;
let PHOTON_ADDR = CONF.services.photon.address;
let PORT_WEBDAV = CONF.services.webdav.PORT;

let imgBuffer = [];

const pathCert = Core.getCertPath();
const pathKey = Core.getKeyPath();

let httpsOptions = {
    key: fs.readFileSync(pathKey, 'utf8'),
    cert: fs.readFileSync(pathCert, 'utf8')
};

let bExamples = CONF.services.main.examples;
//let bAPIdoc   = CONF.services.main.apidoc;

// Debug on req received (client)
let logger = function (req, res, next) {
    console.log('Request from: ' + req.ip + ' For: ' + req.path);
    next(); // Run the next handler
};

const fps = 60;

// Photon
if (CONF.services.photon) {
    if (CONF.services.photon.maxClientsPerSession) {
        Photon.MAX_CLIENTS_PER_SESSION = CONF.services.photon.maxClientsPerSession;
    }
    if (CONF.services.photon.PORT) {
        PHOTON_PORT = CONF.services.photon.PORT;
    }
}

const server = http.createServer(express);
// const server_to_proxy = http.createServer(express);
/*const server_to_proxy = https.createServer(httpsOptions, express().use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // Allow specific headers

    // Handle preflight requests (OPTIONS method)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next(); // Continue to the next middleware
}));*/
server.listen(PHOTON_PORT, () => {
    console.log('Photon service on *: ' + PHOTON_PORT);
});


// Listen for incoming connections on port 3000
/*server_to_proxy.listen(4000, () => {
    console.log('Server A: Listening on port 4000');
});*/

let io = socketio(server/*, {forceNew : true}*/);
Photon.init(io);

let io_to_proxy = socketio_cli("http://localhost:4000");
let mouseX = -1;
let mouseY = -1;
//io.set('transports', ['websocket']);

io_to_proxy.on('connect', () => {
    console.log('ATON Connected to the proxy server');
});

io_to_proxy.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

io_to_proxy.on('disconnect', function (reason) {
    console.log('User 1 disconnected because ' + reason);
});

io_to_proxy.on('mousemove_ta', (message) => {
    io.emit('EREP', { e: 'mousemove_th', d: message });
});

io_to_proxy.on('camerarot_ta', (message) => {
    io.emit('EREP', { e: 'camerarot_th', d: message });
})

io_to_proxy.on('camerazoom_ta', (message) => {
    io.emit('EREP', { e: 'camerazoom_th', d: message });
})

io_to_proxy.on('cameramove_ta', (message) => {
    io.emit('EREP', { e: 'cameramove_th', d: message });
})

io_to_proxy.on('reset_coordinates_ta', () => {
    io.emit('EREP', { e: 'reset_coordinates_th', d: {} });
})

io_to_proxy.on('mouseclick_ta', (message) => {
    io.emit('EREP', { e: 'mouseclick_th', d: message })
})

io_to_proxy.on('remote_ann_ta', (message) => {
    io.emit('EREP', { e: 'remote_ann_th', d: message })
})

io_to_proxy.on('switch_convex_mode_ta', (message) => {
    io.emit('EREP', { e: 'switch_convex_mode_th', d: message })
})

io_to_proxy.on('retrieve_popup_ta', (message) => {
    io.emit('EREP', { e: 'retrieve_popup_th', d: message })
})
// io_to_proxy.emit('message', 'Hello, server!');

io.on('connection', (socket) => {
    console.log("CONNECTED TO PHOTON");

    /*socket.on('open_insert_ann_popup_ta', (message) => {
        console.log('SEGNALE DA HATHOR ARRIVATO')
        io_to_proxy.emit('open_insert_ann_popup_tp', message)
    })*/
})


// HTTP and HTTPS
let ATONServiceMain = express();

//ATONServiceMain.set('trust proxy', 1); 	// trust first proxy

//ATONServiceMain.use(compression());

ATONServiceMain.use(cors({
    credentials: true,
    origin: true
}));
/*ATONServiceMain.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // Allow specific headers

    // Handle preflight requests (OPTIONS method)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next(); // Continue to the next middleware
});*/
ATONServiceMain.use(express.json({ limit: '50mb' }));

// EJS
//TODO: move into proper ejs setup routine
ATONServiceMain.set('view engine', 'ejs');
ATONServiceMain.set('views', __dirname + "/views/");

ATONServiceMain.get(/^\/s\/(.*)$/, (req, res, next) => {
    let d = {};
    d.sid = req.params[0];
    d.title = d.sid;
    d.appicon = "/hathor/appicon.png";
    d.scripts = Core.FEScripts;

    let S = Core.readSceneJSON(d.sid);
    if (S) {
        if (S.title) d.title = S.title;
        d.appicon = "/api/cover/" + d.sid;
    }

    res.render("hathor/index", d);
});


// Scenes redirect /s/<sid>

// ATONServiceMain.get(/^\/s\/(.*)$/, function (req, res, next) {
//     let sid = req.params[0];

//     //req.url     = "/wixard";
//     //req.query.s = sid;
//     debugger;
//     res.redirect(url.format({
//         pathname: "/wixard",
//         query: { "s": sid }
//     }));

//     next();
// });


// Data routing (advanced)
//Core.setupDataRoute(ATONServiceMain);

const CACHING_OPT = {
    maxage: "3h"
};


// ATONServiceMain.use('/', express.static(Core.DIR_PUBLIC, CACHING_OPT));

ATONServiceMain.use('/', express.static(Core.DIR_PUBLIC, CACHING_OPT));

//ATONServiceMain.use('/', express.static(Core.DIR_FE));

//ATONServiceMain.use('/mods', express.static(Core.DIR_NODE_MODULES, /*CACHING_OPT*/));

// Official front-end (Hathor)
ATONServiceMain.use('/fe', express.static(Core.DIR_FE));

// Web-apps
ATONServiceMain.use('/a', express.static(Core.DIR_WAPPS));

// Data (static)
ATONServiceMain.use('/', express.static(Core.DIR_DATA, CACHING_OPT));


ATONServiceMain.use("/sk", function (req, res) {
    // console.log(req.session)
    res.sendFile(Core.SK_INDEX);
});




ATONServiceMain.post("/3d_viewer", function (req, res) {
    (async () => {
        const model_path = req.body.model_path
        const token = req.body.token

        // console.log(Core.SK_VIEWER + `?path="${model_path}"&token="${token}"`);
        // console.log("file://" + path.join(__dirname, "../" + Core.SK_VIEWER));
        // console.log(`http://localhost:8080/public/examples/sketchfab/index.html?path=${model_path}&token=${token}`);
        const browser = await puppeteer.launch({
            headless: 'new'
        });
        //   ,
        // 		defaultViewport: null,
        // 		args: ['--start-maximized']
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        const cdp = await page.target().createCDPSession();

        await cdp.send('Log.enable');

        cdp.on('Log.entryAdded', async ({ entry }) => {

            // console.log(entry);

        });

        await page.setRequestInterception(true);
        // await page.goto(`http://localhost:3000/index_threeJS.html?path="${model_path}"&token="${token}"&fps=${fps}`);
        const page_url = Core.DIR_FE;
        // console.log(page_url);
        // console.log("dirname: " + __dirname);
        await page.goto(page_url);
        await browser.close();
        res.send({ 'message': 'ok' })
    })();
});

ATONServiceMain.post("/imgs_manager", function (req, res) {
    // let buffer_compressed;
    if (imgBuffer.length < req.body.bufferSize) {
        imgBuffer.push(req.body.image);
    }
    else {
        // io_to_proxy.emit('EREP', {e: 'myEvent', d: {data: imgBuffer, bufferSize: req.body.bufferSize}});
        io_to_proxy.emit('img_buffer_send', { data: imgBuffer, bufferSize: req.body.bufferSize, sceneHierarchy: req.body.sceneHierarchy });
        imgBuffer = [];
        imgBuffer.push(req.body.image);
    }
    res.send(JSON.stringify({ 'message': 'ok' }));
})

ATONServiceMain.post('/show_ann', function (req, res) {
    io_to_proxy.emit('annotation_infos_tp', req.body.html);
    res.send(JSON.stringify({ 'message': 'ok' }));
})

ATONServiceMain.post('/new_ann', function (req, res) {
    io_to_proxy.emit('new_ann_tp', { html: req.body.html, descr: req.body.descr });
    res.send(JSON.stringify({ 'message': 'ok' }));
})

async function compressBufferAndSend() {
    const buffer_joined = imgBuffer.join(",");
    return lzutf8.compress(buffer_joined, {/*inputEncoding: "Base64", */outputEncoding: "Base64" });
}

function base64ToUint8Array(base64String) {
    const decodedString = atob(base64String);
    const encoder = new TextEncoder();
    return encoder.encode(decodedString);
}

function calculateSize(base64Image) {
    let yourBase64String = "";
    if (base64Image.includes('data')) {
        yourBase64String = base64Image.substring(base64Image.indexOf(',') + 1);
    } else {
        yourBase64String = base64Image;
    }
    return Math.ceil(((yourBase64String.length * 6) / 8) / 1000); // 426 kb
}

ATONServiceMain.get('/get_token', (req, res) => {
    // console.log(req.session.token)
    res.json(({ token: req.session.token }));
});

ATONServiceMain.get('/get_buffer', (req, res) => {
    const jsonArrayBuffer = [];
    while (imgBuffer.length != 0) {
        const frame = imgBuffer.shift();
        jsonArrayBuffer.push({ 'frame': frame });
    }

    res.send({ 'fps': fps, 'arrayBuffer': jsonArrayBuffer });

});

ATONServiceMain.post('/save_token', (req, res) => {
    req.session.token = req.body.token
    res.send(JSON.stringify({ "success_message": "Token saved successfully" }))
});


Core.setupPassport();
Core.realizeAuth(ATONServiceMain);

// REST API
Core.realizeBaseAPI(ATONServiceMain);

// Micro-services proxies
//=================================================

// Photon
ATONServiceMain.use('/photon', createProxyMiddleware({
    target: PHOTON_ADDR + ":" + PHOTON_PORT,
    ws: true,
    pathRewrite: { '^/photon': '' },
    changeOrigin: true
}));

ATONServiceMain.use('/sphoton', createProxyMiddleware({
    target: PHOTON_ADDR + ":" + PHOTON_PORT,
    ws: true,
    pathRewrite: { '^/sphoton': '' },
    secure: true,
    changeOrigin: true
}));

// Home page route.
// ATONServiceMain.get("/", function (req, res) {
// 	res.sendFile(__dirname + "/index.html");
// });


// ATONServiceMain.get("/test", function (req, res) {
// 	console.log(req.session)
//     // console.log("TEST",  "public/dist/index.html")
// 	res.sendFile("index.html");
// });

ATONServiceMain.get('/get_token', (req, res) => {
    console.log(req.session.token)
    res.json(({ token: req.session.token }))
})

ATONServiceMain.post('/save_token', (req, res) => {
    req.session.token = req.body.token
    res.send(JSON.stringify({ "success_message": "Token saved successfully" }))
})


ATONServiceMain.all('/*', function(req, res) {
    res.redirect("/");
});



// WebDav
/*
ATONServiceMain.use('/dav', createProxyMiddleware({
    //target: CONF.services.webdav.address+":"+PORT_WEBDAV, 
    target: "http://localhost:"+PORT_WEBDAV,
    pathRewrite: { '^/dav': ''},
    changeOrigin: false, //true,
    //xfwd: true,
    //secure: true,

    //router: { "/dav" : "http://localhost:"+PORT_WEBDAV }
}));
*/

// Collect & setup flares (if found)
//==================================
Core.setupFlares(ATONServiceMain);

for (let f in Core.flares) {
    let flarename = Core.flares[f];
    ATONServiceMain.use('/flares/' + flarename, express.static(Core.DIR_FLARES + flarename + "/public/"));
}

// Start HTTP
http.createServer(ATONServiceMain).listen(PORT, () => {
    Core.logGreen("\nWiXaRd up and running!");
    console.log("- OFFLINE: http://localhost:" + PORT);

    for (let n in Core.nets) {
        console.log("- NETWORK ('" + n + "'): http://" + Core.nets[n][0] + ":" + PORT);
    }

    console.log("\n");
});

// Start HTTPS
if (fs.existsSync(pathCert) && fs.existsSync(pathKey)) {

    https.createServer(httpsOptions, ATONServiceMain).listen(PORT_SECURE, () => {
        Core.logGreen("\nHTTPS WiXaRd up and running!");
        console.log("- OFFLINE: https://localhost:" + PORT_SECURE);
        for (let n in Core.nets) console.log("- NETWORK ('" + n + "'): https://" + Core.nets[n][0] + ":" + PORT_SECURE);

        console.log("\n");
    });
} else {
    console.log("SSL certs not found: " + pathKey + ", " + pathCert);
    console.log("\n");
}