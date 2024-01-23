// const server_uri = 'http://localhost:3000/';
const sec = 1000
const io_rec = require('socket.io-client');
const socketCli = io_rec('http://localhost:4000');
// const socket = io('ws://localhost:4001/');
const defaultFPS = 60
const buffer_of_buffers = [];

function drawImageOnCanvas(src,uuid) {
    var canvas = document.getElementById("demoCanvas");
    var ctx = canvas.getContext("2d");
    console.log(uuid + ' +++ ' + Date.now())

    var img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
    };
    img.src = src

}

// setInterval(function(){ 
//     getBuffer()
// }, sec);

socketCli.on('connection', () => {
    console.log('Client: Connected to Server Proxy');
    // Send data to Server A
    // socketB.emit('myEvent', { message: 'Hello Server A, this is Server B!' });
});

socketCli.on('send_to_cli', (data) => {
    buffer_of_buffers.push({buffer: data.data, size: data.data.length});
    setInterval(() => {
        if (buffer_of_buffers.length !== 0) {
            while (buffer_of_buffers.length !== 0) {
                const b_obj = buffer_of_buffers.shift();
                const buffer = b_obj.buffer;
                const size = b_obj.size;
                setInterval(() => {
                    if(buffer.length > 0)drawImageOnCanvas(buffer.shift())
                }, 1000 / size )
            }
        }
    }, 500);
});

// Event handler for disconnection
socketCli.on('disconnect', () => {
    console.log('client: Disconnected from Server Proxy');
});