// const server_uri = 'http://localhost:3000/';
const sec = 1000
// const io_rec = require('socket.io-client');
const socketCli = io('http://localhost:4000');
// const socket = io('ws://localhost:4001/');
const defaultFPS = 60
const buffer_of_buffers = [];
const canvas = document.getElementById('demoCanvas');
const btn_sph = document.getElementById('btn-sphere');
const btn_con = document.getElementById('btn-convex');
// const textInput = document.getElementById('text-input');
// const richTextInput = document.getElementById('rich-text-input');
// const btnSaveAnn = document.getElementById('send-button');
// const btnMic = document.getElementById('microphone-button');

let keyCode;
let mouseX = 0;
let mouseY = 0;
let isDragging = false;
let previousTime = 0;
let currentTime = performance.now();
let addingSphereShape = false;
let cameraMoveOff = true;
let addingConvexShape = false;
let mediaRecorder;
let chunks = [];
let audio;
let semType;

function drawImageOnCanvas(src) {
    // var canvas = document.getElementById("demoCanvas");
    var ctx = canvas.getContext("2d");
    // console.log(uuid + ' +++ ' + Date.now())

    var img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
    };
    img.src = src

}

// Function to open the popup
function openPopup() {
    // const popup = document.getElementById('popup-container');
    // popup.style.display = 'block';
}

// Function to close the popup

socketCli.on('send_to_cli', (data) => {
    buffer_of_buffers.push({buffer: data.data, size: data.data.length, hier: data.sceneHierarchy});
    setInterval(() => {
        if (buffer_of_buffers.length !== 0) {
            while (buffer_of_buffers.length !== 0) {
                const b_obj = buffer_of_buffers.shift();
                const buffer = b_obj.buffer;
                const size = b_obj.size;
                const sceneHier = b_obj.hier;
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

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Add a 'mousemove' event listener to the element
canvas.addEventListener('mousemove', (event) => {
    // Update the mouseX and mouseY variables with the current mouse coordinates
    // mouseX = event.clientX;
    // mouseY = event.clientY;

    // Log or use the mouse coordinates as needed
    // console.log(`MouseX: ${mouseX}, MouseY: ${mouseY}`);
    currentTime = performance.now();
    const deltaTime = currentTime - previousTime;
    if (isDragging) {
        if (deltaTime >= 0) {
            if (keyCode) {
                switch (keyCode) {
                    case 1:
                        console.log("TASTO SINISTRO: ", keyCode)
                        // console.log("mouseX: ", mouseX, " mouseY: ", mouseY)
                        socketCli.emit('camerarot_tp', {x: event.clientX, y: event.clientY})
                        break;
                    case 2:
                        console.log("TASTO CENTRALE (ROTELLA): ", keyCode)
                        socketCli.emit('camerazoom_tp', {x: event.clientX, y: event.clientY})
                        break;
                    case 3:
                        console.log("TASTO DESTRO: ", keyCode)
                        socketCli.emit('cameramove_tp', {x: event.clientX, y: event.clientY})
                        break;
                }
            }
            previousTime = currentTime;
        }
    } else {
        socketCli.emit('mousemove_tp', {x: event.clientX, y: event.clientY})
    }
});

canvas.addEventListener('mousedown', (event) => {
    // Update the mouseX and mouseY variables with the current mouse coordinates
    // event.preventDefault();
    isDragging = true;
    // mouseX = event.clientX;
    // mouseY = event.clientY;
    keyCode = event.keyCode || event.which;
    console.log("KEYCODE: ", keyCode)
    const btns = event.buttons;
    socketCli.emit('mouseclick_tp', {x: event.clientX, y: event.clientY, kc: keyCode, btns: btns})
    // Log or use the mouse coordinates as needed
    // console.log("mousedown triggered: ", keyCode)
    // console.log(`MouseX: ${mouseX}, MouseY: ${mouseY}`);
});

canvas.addEventListener('mouseup', (event) => {
    isDragging = false;
    keyCode = undefined;
    socketCli.emit('reset_coordinates_tp')
});

canvas.addEventListener('wheel', (event) => {
    const delta = event.deltaY;

    // Determine the direction of rotation (positive for scrolling up, negative for scrolling down)
    if (delta > 0) {
        console.log('Mouse wheel scrolled down.');
    } else if (delta < 0) {
        console.log('Mouse wheel scrolled up.');
    }

    socketCli.emit('camerazoom_tp', {delta: delta})
});

canvas.addEventListener('dblclick', function(event) {
    // Get the mouse coordinates relative to the canvas
    // const rect = canvas.getBoundingClientRect();
    if (addingSphereShape) {
        socketCli.emit('retrieve_popup_tp', {semid: undefined});
        mouseX = event.clientX;
        mouseY = event.clientY;
        // alert("double click");
        // openPopup();

        addingSphereShape = false;
    }

    if (addingConvexShape) {
        // socketCli.emit('retrieve_popup_tp', {semid: undefined});
        mouseX = event.clientX;
        mouseY = event.clientY;

    }
});

window.addEventListener('contextmenu', function(event) {
    // Prevent the default right-click context menu from opening
    event.preventDefault();
});

window.addEventListener('mousedown', function(event) {
    event.preventDefault();
});

window.addEventListener('wheel', function(event) {
    event.preventDefault();
}, { passive: false });

btn_sph.addEventListener('mousedown', function() {
    // Action for Button 1
    semType = 0;
    addingSphereShape = true;
    btn_sph.classList.add("atonBTN-rec");
    alert('Adding sphere shape annotation, select a point to put it');
});

btn_con.addEventListener('click', function() {
    // Action for Button 2
    semType = 1;
    btn_con.classList.add("atonBTN-rec");
    if (btn_con.textContent !== "End shape definition") {
        addingConvexShape = true;
        alert('Adding convex shape annotation, define a shape adding points');
        btn_con.textContent = "End shape definition";
        socketCli.emit('switch_convex_mode_tp', {data: true});
    } else {
        addingConvexShape = false;
        // openPopup();
        btn_con.textContent = "Add convex annotation";
        socketCli.emit('switch_convex_mode_tp', {data: false});
        socketCli.emit('retrieve_popup_tp', {semid: undefined});
    }
});

function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const base64Data = reader.result.split(',')[1]; // Extract the base64 data (remove the data URL prefix)
            resolve(base64Data);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(blob);
    });
}

socketCli.on('new_ann_td', (message) => {
    const htmlPopUp = message.html.replaceAll('https://localhost:8084', 'http://localhost:4000');
    console.log(htmlPopUp)
    $("#idPopup").html(htmlPopUp);
    // console.log($("#idPopup").html())
    // const popUp = document.getElementById('idPopup')
    // console.log(popUp);
    $(".hideWhenOpeningPopup").hide()
    $("#idPopup").show();
    $("#semid").click(function() {
        // Focus the textbox when clicked
        $(this).focus();
    });
    $("#btnRichContent").click(() => {
        $("#idSemDescCont").toggle();
    });
    let SCE = $("#idSemDescription").sceditor({
        id: "idSCEditor",
        //format: 'bbcode',
        //bbcodeTrim: true,
        width: "100%",
        height: "300px", //"100%",
        resizeEnabled: false,
        autoExpand: true,
        emoticonsEnabled: false,
        autoUpdate: true,
        style: 'vendors/sceditor/minified/themes/content/default.min.css',
        toolbar: "bold,italic,underline,link,unlink,font,size,color,removeformat|left,center,right,justify|bulletlist,orderedlist,table,code|image,youtube|source"
    }).sceditor('instance');
    if (message.descr){
        SCE.setWysiwygEditorValue(message.descr);
    }
    $('#btnVocalNote').click(() => {
        // We start recording a vocal note
        if (mediaRecorder) {
            $('#btnVocalNote').attr("class", "atonBTN");
            $('#btnVocalNote').html("<img src='http://localhost:4000/res/icons/talk.png'>Vocal Note");
            // ATON.MediaFlow.stopRecording();
            mediaRecorder.stop();
            mediaRecorder = undefined;
            $('#ctrlVocalNote').show();
            // bRecVN = false;
        } else {
            // bRecVN = true;
            $('#btnVocalNote').attr("class", "atonBTN atonBTN-rec");
            $('#btnVocalNote').html("<img src='http://localhost:4000/res/icons/rec.png'>STOP Recording");
            // ATON.MediaFlow.startRecording();
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function(stream) {
                    mediaRecorder = new MediaRecorder(stream);

                    mediaRecorder.ondataavailable = function(event) {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = function() {
                        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                        convertBlobToBase64(audioBlob)
                            .then((base64Audio) => {
                                // The base64 conversion is complete, and you can use the base64Audio data here.
                                // console.log("audio b64: ", base64Audio);
                                audio = "data:audio/wav;base64," + base64Audio;
                                $('#ctrlVocalNote').attr("src", audio);
                            })
                            .catch((error) => {
                                console.error('Error converting Blob to base64:', error);
                            });
                    };

                    // Start recording
                    mediaRecorder.start();
                })
                .catch(function(error) {
                    console.log('An error has occured: ', error)
                });
        }
    });
    $('#idAnnOK').click(() => {
        const idText = $('#semid').val();
        const annText = JSON.stringify(SCE.val());
        console.log(idText, annText);
        socketCli.emit('remote_ann_tp', {x: mouseX, y: mouseY, annId: idText, annTxt: annText, annVoc: audio, semtype: semType});
        $("#idPopup").hide();
        $("#idPopup").html('');
        $(".hideWhenOpeningPopup").show()
        if (btn_sph.classList.contains("atonBTN-rec")) {
            btn_sph.classList.remove("atonBTN-rec");
        }
        if (btn_con.classList.contains("atonBTN-rec")) {
            btn_con.classList.remove("atonBTN-rec");
        }
    });
    $("#idPopup").click((event) => {
        if (!$("#idPopupContent").is(event.target) && $("#idPopupContent").has(event.target).length === 0) {
            $("#idPopup").hide();
            $("#idPopup").html('');
            $(".hideWhenOpeningPopup").show()
            if (btn_sph.classList.contains("atonBTN-rec")) {
                btn_sph.classList.remove("atonBTN-rec");
            }
            if (btn_con.classList.contains("atonBTN-rec")) {
                btn_con.classList.remove("atonBTN-rec");
            }
        }
    })
})

socketCli.on('annotation_infos_td', (message) => {
    console.log(message);
    const htmlHostReplace = message.replace('https://localhost:8084', 'http://localhost:4000');
    const htmlOnClickReplace = htmlHostReplace.replace('HATHOR.toggleSideSemPanel(false)', '');
    // console.log(htmlOnClickReplace);
    const htmlSplit = htmlOnClickReplace.split('</div>')
    // console.log(htmlSplit);
    let newHtml = '';
    htmlSplit.forEach((elem, index) => {
        newHtml += elem + "</div>";
        if (index === 0) {
            newHtml += "<div class='atonSidePanelTopRightBTN atonBTN' id='btnEditSem'><img src='http://localhost:4000/res/icons/edit.png'></div>";
        }
    })
    console.log(newHtml)
    // newHtml = newHtml.replace('https://localhost:8084', 'http://localhost:4000')
    $("#idSemPanel").html(newHtml);
    $("#idSemPanel").show();
    const closeBtn = document.querySelector('.atonSidePanelCloseBTN');
    console.log(closeBtn);
    closeBtn.addEventListener('click', function() {
        $("#idSemPanel").hide(); //, ()=>{ HATHOR._bSidePanel = false; });
        $("#idSemPanelBG").hide();
        $("#idSemPanel").html("");
        // You can perform any action you want here
    });
    $("#btnEditSem").click(() => {
        const semid = document.querySelector('.atonSidePanelHeader').textContent;
        console.log(semid);
        socketCli.emit('retrieve_popup_tp', {semid: semid});
        $("#idSemPanel").hide(); //, ()=>{ HATHOR._bSidePanel = false; });
        $("#idSemPanelBG").hide();
        $("#idSemPanel").html("");
        // ATON.FE.subPopup(() => {
        //     HATHOR.popupAddSemantic(undefined, semid);
        // });
    });
})

