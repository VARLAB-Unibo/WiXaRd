const express = require('express');
const router = express.Router();
const app = express();
const sessions = require('express-session');
const bodyParser = require('body-parser');
// const puppeteer = require('puppeteer');
const fs = require('fs');
// const server = require('http').createServer(app);  // Create an HTTP server using Express app
// const io_rec = require('socket.io-client');
const http = require("http");
const io = require('socket.io');
const https = require('https');
const path = require("path");

const port = 4000;
// const proxy_to_client = https.createServer(httpsOptions, express);
const proxy_to_client = http.createServer(app);

// Replace 'http://localhost:3000' with the URL of Server A (Socket.IO server)
const socketB = io(proxy_to_client/*'http://localhost:4000'*/, { maxHttpBufferSize: 1e9 });

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
const fps = 60;

// let imgBuffer = [];
// let uuid;
//session middleware
app.use(sessions({
    secret: generateUUID(),
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
// Serve static files from the 'public' directory (e.g., stylesheets, scripts, images)
app.use(express.static(path.join(__dirname, '/public/dist_proxy')));
// app.use(express.static("dist"));
app.use(bodyParser.urlencoded({ extended: false, limit: '200mb' }));
app.use(bodyParser.json({limit: '200mb'}));

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = (c === 'x') ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Define a connection event handler when a client connects
socketB.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for the 'message' event from the client
    socket.on('img_buffer_send', (message) => {
        // console.log('Received message from ATON:', message);

        // Broadcast the received message to all connected clients (including the sender)
        socketB.emit('send_to_cli', message);
    });

    socket.on('mousemove_tp', (message) => {
        socketB.emit('mousemove_ta', message)
    });

    socket.on('camerarot_tp', (message) => {
        socketB.emit('camerarot_ta', message)
    })

    socket.on('camerazoom_tp', (message) => {
        socketB.emit('camerazoom_ta', message)
    })

    socket.on('cameramove_tp', (message) => {
        socketB.emit('cameramove_ta', message)
    })

    socket.on('reset_coordinates_tp', () => {
        socketB.emit('reset_coordinates_ta')
    })

    socket.on('mouseclick_tp', (message) => {
        socketB.emit('mouseclick_ta', message)
    })

    socket.on('remote_ann_tp', (message) => {
        socketB.emit('remote_ann_ta', message)
    })

    socket.on('switch_convex_mode_tp', (message) => {
        socketB.emit('switch_convex_mode_ta', message)
    })

    socket.on('annotation_infos_tp', (message) => {
        socketB.emit('annotation_infos_td', message)
    })

    socket.on('new_ann_tp', (message) => {
        socketB.emit('new_ann_td', message)
    })

    socket.on('retrieve_popup_tp', (message) => {
        socketB.emit('retrieve_popup_ta', message)
    })

    // Handle any other events as needed
    // socket.on('event-name', (data) => {
    //   console.log('Received event: event-name', data);
    // });

    // Disconnect event handler
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Listen for error events
socketB.on('connect_error', (error) => {
    console.error('Socket.io Error:', error);
});

proxy_to_client.listen(port, () => {
    console.log(__dirname);
})

app.get('/', function (req, res) {
    // console.log(__dirname);
    res.sendFile(path.join(__dirname, "/demo.html"));
});

/*app.post('/show_ann', function (req, res) {
    socketB.emit('annotation_infos_tc', req.body.html)
})*/

// app.use('/', router);
