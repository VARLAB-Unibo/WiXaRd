let Worker = {}

// Receive a message from the main script
Worker.onmessage = function (e) {
    console.log('Message received in the Web Worker:', e.data);

    // Perform some computation
    // const result = e.data + ' - Processed in the Web Worker';

    // Send the result back to the main script
    // postMessage(result);
    Worker.sendBufferToServer(e.data.img, e.data.fps).then(() => {
        postMessage("images sent" + e.data)
    })
};

Worker.sendBufferToServer = async function (captured_image, buffer_size/*, hier*/) { // Added \uuid as a parameter
    const data = {
        'image': captured_image,
        'bufferSize': buffer_size
        /*'sceneHierarchy': hier*/
    };
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        mode: 'cors',
        body: JSON.stringify(data)
    };

    try {
        fetch('https://localhost:8084/imgs_manager', options);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export default Worker;