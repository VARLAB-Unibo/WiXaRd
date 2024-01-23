/*
    ATON spatial UI

    author: bruno.fanini_AT_gmail.com

===========================================================*/
import Button from "./ATON.sui.button.js";
import Label from "./ATON.sui.label.js";
import Keyboard from "./ATON.sui.keyboard.js";
import Field from "./ATON.sui.field.js";

// import Backspace from '../../res/backspace.png';
// import Enter from '../../res/enter.png';
// import Shift from '../../res/shift.png';
import * as THREE from "three";
import FE from "../ATON.fe";
import ATON from "../ATON";
import Nav from "../ATON.nav";
import SemFactory from "../ATON.semfactory";
import { Text } from 'troika-three-text';

/**
 ATON Spatial UI
 @namespace SUI
 */
let SUI = {};

SUI.STD_BTN_SIZE = 0.1;
SUI.LABEL_WIDTH = 0.7;
SUI.STD_SELECTOR_TICKNESS = 1.05;

let mediaRecorder = undefined;
let audio = undefined;
let chunks = [];

SUI.Button = Button;
SUI.Label = Label;
SUI.Keyboard = Keyboard;
SUI.Field = Field;

//Initializes Spatial UI module
SUI.init = () => {
    SUI.initSelector();

    SUI.fpTeleport = ATON.createUINode();
    let gTeleport = new THREE.CylinderGeometry(0.4, 0.4, 0.9, 32, 1, true);
    //let gTeleport = new THREE.CylinderGeometry(0.4,0.4, 0.9, 32,1, true);

    let mTeleport = new THREE.Mesh(gTeleport, ATON.MatHub.getMaterial("teleportLoc"));
    mTeleport.renderOrder = 100;
    SUI.fpTeleport.add(mTeleport);
    SUI.fpTeleport.disablePicking();
    SUI.fpTeleport.visible = false;
    ATON._rootUI.add(SUI.fpTeleport);

    // Sem-shapes icons
    //SUI.enableSemIcons();

    // Main Font
    if (!SUI.PATH_FONT_JSON) {
        // SUI.PATH_FONT_JSON = ATON.PATH_RES + "fonts/custom-msdf.json"
        SUI.PATH_FONT_JSON = ATON.PATH_RES + "fonts/Roboto-msdf.json"

    }
    if (!SUI.PATH_FONT_TEX) {
        // SUI.PATH_FONT_TEX = ATON.PATH_RES + "fonts/custom.png"
        SUI.PATH_FONT_TEX = ATON.PATH_RES + "fonts/Roboto-msdf.png"
    }
    /*
        ThreeMeshUI.FontLibrary.addFont("mainFont",
            SUI.PATH_FONT_JSON,
            new THREE.TextureLoader().load(SUI.PATH_FONT_TEX)
        );
    */
    // Measurements
    SUI.gMeasures = ATON.createUINode();
    SUI._prevMPoint = undefined;
    SUI._measLabels = [];
    ATON._rootUI.add(SUI.gMeasures);

    // runtime measurement-line indicator
    let mLine = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    SUI._measLine = new THREE.Line(mLine, ATON.MatHub.getMaterial("measurement"));
    SUI._measLine.visible = false;
    ATON._rootUI.add(SUI._measLine);

    // Sem convex-shapes edit points 
    SUI.gPoints = ATON.createUINode();
    ATON._rootUI.add(SUI.gPoints);

    // Loc-Nodes
    SUI.gLocNodes = ATON.createUINode();
    ATON._rootUI.add(SUI.gLocNodes);

    SUI.buildInfoNode();
    SUI.bShowInfo = true;

    // InfoNode scale
    //SUI._labelScale   = ATON.Utils.isMobile()? 50.0 : 60.0; //note: inverse. Orginally 1.2 : 1.0;
    SUI._labelScale = ATON.Utils.isMobile() ? 80.0 : 90.0; //note: inverse. Orginally 1.2 : 1.0;
    SUI._labelScaleVR = 2.0;

    /*
        ATON.on("SemanticNodeHover", (semid)=>{
            SUI.setInfoNodeText(semid);
            if (SUI.gSemIcons) SUI.gSemIcons.hide();
        });
        ATON.on("SemanticNodeLeave", (semid)=>{
            if (SUI.gSemIcons) SUI.gSemIcons.show();
        });

        ATON.on("SemanticMaskHover", semid => {
            SUI.setInfoNodeText(semid);
        });
        ATON.on("SemanticMaskLeave", semid => {
        });
    */
    //SUI.setSemIconsOpacity(0.5);

    /*
        ATON.on("UINodeHover", (uiid)=>{
            console.log("Hover UI node: "+uiid);
        });
        ATON.on("UINodeLeave", (uiid)=>{
            console.log("Leave UI node: "+uiid);
        });
    */

    SUI.sprites = {};

    SUI._sync = 0;
};

// Sprites
SUI.getOrCreateSpritePointEdit = () => {
    if (SUI.sprites.pointEdit) {
        return SUI.sprites.pointEdit;
    }

    SUI.sprites.pointEdit = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load(ATON.PATH_RES + "sui-point.png"),
        color: ATON.MatHub.colors.orange,
        transparent: true,
        opacity: 1.0,
        //depthWrite: false, 
        depthTest: false
    });

    return SUI.sprites.pointEdit;
};

SUI.getOrCreateSpriteSemIcon = () => {
    if (SUI.sprites.semIcon) return SUI.sprites.semIcon;

    SUI.sprites.semIcon = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load(ATON.PATH_RES + "sui-sem.png"),
        //color: ATON.MatHub.colors.sem, // multiply
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        depthTest: false
    });

    //SUI.sprites.semIcon.sizeAttenuation = false;

    return SUI.sprites.semIcon;
};

SUI.getOrCreateSpriteLP = () => {
    if (SUI.sprites.lp) return SUI.sprites.lp;

    SUI.sprites.lp = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load(ATON.PATH_RES + "sui-lp.png"),
        //color: ATON.MatHub.colors.sem, // multiply
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        //depthTest: false
    });

    SUI.sprites.lp.sizeAttenuation = false;

    return SUI.sprites.lp;
};

SUI.getOrCreateSpriteWalk = () => {
    if (SUI.sprites.walk) return SUI.sprites.walk;

    SUI.sprites.walk = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load(ATON.PATH_RES + "sui-walk.png"),
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        //depthTest: false
        //depthFunc: THREE.GreaterDepth
    });

    //SUI.sprites.walk.sizeAttenuation = false;

    return SUI.sprites.walk;
};

// Realize main selector
SUI.initSelector = () => {
    SUI.mainSelector = ATON.createUINode();
    SUI._mSelectorSphere = new THREE.Mesh(ATON.Utils.geomUnitSphere, ATON.MatHub.getMaterial("selector"));
    SUI._mSelectorSphere.renderOrder = 100;
    /*
        let mSelBorder = new THREE.Mesh( ATON.Utils.geomUnitSphere, ATON.MatHub.getMaterial("outline"));
        mSelBorder.scale.set(SUI.STD_SELECTOR_TICKNESS, SUI.STD_SELECTOR_TICKNESS, SUI.STD_SELECTOR_TICKNESS);
        mSelBorder.renderOrder = 100;
        SUI.mainSelector.add( mSelBorder );
    */
    SUI.mainSelector.add(SUI._mSelectorSphere);
    SUI.mainSelector.disablePicking();

    SUI.setSelectorRadius(0.05);
    SUI.mainSelector.visible = false;
    ATON._rootUI.add(SUI.mainSelector);

    SUI._selOffset = new THREE.Vector3();

    SUI._bShowSelector = true;
};

// note: before adding LPs
SUI.enableLPIcons = () => {
    SUI.gLPIcons = ATON.createUINode();
    SUI.gLPIcons.disablePicking();
    ATON._rootUI.add(SUI.gLPIcons);
};


SUI.enableSemIcons = () => {
    SUI.gSemIcons = ATON.createUINode();
    SUI.gSemIcons.disablePicking();
    ATON._rootUI.add(SUI.gSemIcons);
};

/**
 Show or hide selector
 @param {boolean} b
 */
SUI.showSelector = (b) => {
    SUI._bShowSelector = b;
};

/**
 Set selector radius
 @param {number} r - the radius
 */
SUI.setSelectorRadius = (r) => {
    SUI._selectorRad = r;
    SUI.mainSelector.scale.set(r, r, r);
    // console.log("New selector radius: ", r);
};

/**
 Set selector offset
 @param {number} dx
 @param {number} dy
 @param {number} dz
 */
SUI.setSelectorOffset = (dx, dy, dz) => {
    if (dx !== undefined) {
        SUI._selOffset.x = dx;
    }
    if (dy !== undefined) {
        SUI._selOffset.y = dy;
    }
    if (dz !== undefined) {
        SUI._selOffset.z = dz;
    }

    let p = ATON.getSceneQueriedPoint();
    if (p === undefined) {
        return;
    }

    SUI.mainSelector.position.x = p.x + SUI._selOffset.x;
    SUI.mainSelector.position.y = p.y + SUI._selOffset.y;
    SUI.mainSelector.position.z = p.z + SUI._selOffset.z;
}

/**
 Get selector current radius
 @returns {number}
 */
SUI.getSelectorRadius = () => {
    //return SUI.mainSelector.scale.x;
    return SUI._selectorRad;
};

/**
 Get selector current location
 @returns {THREE.Vector3}
 */
SUI.getSelectorLocation = () => {
    return SUI.mainSelector.position;
};

/**
 Set selector 3D model
 @param {string} path - the model path (usually gltf or glb)
 @param {boolean} bUseStdMat - (optional) overwrites 3D model materials with standard selector material
 */
SUI.setSelectorModel = (path, bUseStdMat) => {
    if (path === undefined) return;

    SUI.mainSelector.removeChildren();

    SUI.mainSelector.load(path).disablePicking();
    if (bUseStdMat) SUI.mainSelector.setMaterial(ATON.MatHub.getMaterial("selector"));
};

/**
 Set selector color
 @param {THREE.Color} color - color
 @param {number} opacity - (optional) opacity
 */
SUI.setSelectorColor = (color, opacity) => {
    let matSel = ATON.MatHub.materials.selector;

    //ATON.MatHub.materials.selector.color = color;
    //if (opacity !== undefined) ATON.MatHub.materials.selector.opacity = opacity;

    matSel.uniforms.tint.value = color;
    if (opacity !== undefined) matSel.uniforms.opacity.value = opacity;
};

// Sem-shape icons
SUI.addSemIcon = (semid, meshape) => {
    if (SUI.gSemIcons === undefined) return;

    let bb = new THREE.Box3().setFromObject(meshape);
    let bs = new THREE.Sphere();
    bb.getBoundingSphere(bs);

    // icon sprite
    let semicon = new THREE.Sprite(SUI.getOrCreateSpriteSemIcon());
    semicon.position.copy(bs.center);

    //let ss = 0.06; // 0.035; //bs.radius * 0.3;
    let ss = 0.8;
    semicon.scale.set(ss, ss, 1.0);
    semicon.name = semid;

    SUI.gSemIcons.add(semicon);
};

SUI.addLPIcon = (LP) => {
    if (SUI.gLPIcons === undefined) return;

    let rn = LP._near;
    let isize = 0.1; //rn * 0.3;

    let lpicon = new THREE.Sprite(SUI.getOrCreateSpriteLP());
    lpicon.position.copy(LP.pos);
    lpicon.scale.set(isize, isize, isize);

    let s = new THREE.Mesh(ATON.Utils.geomUnitSphere, ATON.MatHub.materials.lp);
    s.scale.set(rn, rn, rn);
    s.position.copy(LP.pos);

    SUI.gLPIcons.add(lpicon);
    SUI.gLPIcons.add(s);
};

SUI.setSemIconsOpacity = (f) => {
    if (f === undefined) ATON.MatHub.spriteSemIcon.opacity = 1.0;
    else ATON.MatHub.spriteSemIcon.opacity = f;
};


SUI.buildInfoNode = () => {
    SUI.infoNode = ATON.createUINode();
    SUI.infoNode.attachToRoot();

    SUI.infoContainer = new ThreeMeshUI.Block({
        width: 0.2,
        height: 0.05, //0.07,
        padding: 0.01,
        borderRadius: 0.02,
        backgroundColor: ATON.MatHub.colors.black, //darksem,
        backgroundOpacity: 0.4,

        fontFamily: SUI.PATH_FONT_JSON,
        fontTexture: SUI.PATH_FONT_TEX,
        //fontFamily: "mainFont",
        //fontTexture: "mainFont",

        justifyContent: 'center', // could be 'center' or 'left'
        textAlign: 'center',
    });

    SUI.infoContainer.position.y = 0.03; // vertical offset
    SUI.infoNode.add(SUI.infoContainer);

    SUI.infoNodeText = new ThreeMeshUI.Text({
        content: "Info",
        fontSize: 0.02,
        fontColor: ATON.MatHub.colors.white
    });

    SUI.infoContainer.add(SUI.infoNodeText);
    //SUI.infoNode.scale.set(0.07,0.07,0.07);

    ThreeMeshUI.update();
};

/**
 Get main UI Info Node
 @returns {Node}
 */
SUI.getInfoNode = () => {
    return SUI.infoNode;
};

/**
 Set text for main info node
 @param {string} txt - the text
 */
SUI.setInfoNodeText = (txt) => {
    if (!SUI.bShowInfo) {
        return;
    }
    SUI.infoNodeText.set({content: txt});

    ThreeMeshUI.update();
};

SUI.createHorizontalContainer = (id, listofBloks) => {
    let numBlocks = listofBloks.length;
    let marginf = 0.03;
    let padding = 0.2;

    let sumOFWidth = 0;
    let blocksHeight = [];

    let prevMidWidth = 0.0;

    listofBloks.forEach(block => {
        let dimensions = block.getDimensions();
        blocksHeight.push(dimensions[1])
        sumOFWidth += dimensions[0]
    });

    let containerHeight = Math.max(...blocksHeight)
    let containerWidth = sumOFWidth + (numBlocks * marginf) + marginf
    // .setMaterial(ATON.MatHub.materials.black)

    let container = new SUI.Label(id, containerWidth, containerHeight + 0.03)

    let xStartPos = containerWidth / 2;

    listofBloks.forEach(block => {
        let midWidth = block.getDimensions()[0] / 2

        let diff = xStartPos - prevMidWidth - midWidth - marginf;
        block.setPosition(diff, 0.0, 0.01)

        xStartPos = diff
        prevMidWidth = midWidth

        container.add(block)
    });

    return container
}

// SUI.verticalPositions = (listOfBlocks, containerId, marginf) => {
//     let numBlocks = listOfBlocks.length;
//     // let marginf = 0.03;
//     let padding = 0.2;
//
//     let sumOFHeights = 0;
//     let labelsWidths = [];
//     let prevMidHeight = 0.0;
//
//     listOfBlocks.forEach(block => {
//         let dimensions = block.getDimensions();
//         labelsWidths.push(dimensions[0])
//         sumOFHeights += dimensions[1]
//     });
//
//     let containerWidth = Math.max(...labelsWidths)
//
//     let containerHeight = sumOFHeights + (numBlocks * marginf) + marginf
//
//     let container = new SUI.Label(containerId, containerWidth + 0.05, containerHeight)
//
//     let yStartPos = containerHeight / 2;
//
//     listOfBlocks.forEach(block => {
//         let midHeight = block.getDimensions()[1] / 2
//
//         let diff = yStartPos - prevMidHeight - midHeight - marginf;
//         block.setPosition(0.0, diff, 0.01)
//
//         yStartPos = diff
//         prevMidHeight = midHeight
//     });
//
//     return container
// }

SUI.verticalPositions = (listOfBlocks, containerId, marginf) => {
    let numBlocks = listOfBlocks.length;
    // let marginf = 0.03;
    let padding = 0.2;

    let sumOFHeights = 0;
    let labelsWidths = [];
    let prevMidHeight = 0.0;

    listOfBlocks.forEach(block => {
        let dimensions = block.getDimensions();
        labelsWidths.push(dimensions[0])
        sumOFHeights += dimensions[1]
    });

    let containerWidth = Math.max(...labelsWidths)

    let containerHeight = sumOFHeights + (numBlocks * marginf) + marginf

    let container = new SUI.Label(containerId, containerWidth + 0.05, containerHeight)

    let yStartPos = containerHeight / 2;

    listOfBlocks.forEach(block => {
        container.add(block)

        let midHeight = block.getDimensions()[1] / 2
        let diff = yStartPos - prevMidHeight - midHeight - marginf;

        block.setPosition(0.0, diff, 0.01)

        yStartPos = diff
        prevMidHeight = midHeight
    });

    return container
}

SUI.createAnnotationDataBlock = (semtype, point, id = undefined, text = undefined, audioB64 = undefined) => {
    // if (semtype === undefined) {
    //     semtype = ATON.FE.SEMSHAPE_SPHERE;
    // }
    // Not yet a valid convex shape
    if (semtype === ATON.FE.SEMSHAPE_CONVEX && !ATON.SemFactory.bConvexBuilding) {
        return;
    }
    // debugger;
    let idText = undefined;
    let annTxt = undefined;
    let annNode = ATON.getUINode("annPopUp");
    if (!annNode) {
        annNode = ATON.createUINode("annPopUp");
        let title = new SUI.Label("annTitle", 0.25, 0.1)
            .setBackgroundOpacity(0.0)
            .setText("New Annotation")
            .setFontSize(0.05)
            .setTextAlign('left')
        let containerTitle = SUI.createHorizontalContainer("annTitleContainer", [title])

        let annIDlbl = new SUI.Label("annIDlbl", 0.25, 0.1)
            .setBackgroundOpacity(0.0)
            .setText("ID")
            .setFontSize(0.05)
            .setTextAlign('left')
        let annID = new SUI.Label("annID", 1, 0.1)
        if (id === undefined){
            annID.setBaseColor(ATON.MatHub.colors.white)
                .setTextColor(ATON.MatHub.colors.black)
                .setOnSelect(() => {
                    let keyboardIDChecker = ATON.getUINode("idKeyboard");
                    if (keyboardIDChecker) {
                        keyboardIDChecker.delete();
                    }
                    else {
                        let keyboard = new ATON.SUI.Keyboard("idKeyboard", "eng")
                        keyboard
                            .setFieldToWrite("annID")
                            .setHideOnEnter(true)
                            .setOnEnter(() => {
                                idText = annID.getText();
                                keyboard.delete();
                            })
                            .show()
                            .attachTo(annID)
                    }
                })
        }
        else {
            annID.setBaseColor(ATON.MatHub.colors.white)
                .setTextColor(ATON.MatHub.colors.black)
                .setText(id)
                .setOnSelect(() => {
                    let keyboardIDChecker = ATON.getUINode("idKeyboard");
                    if (keyboardIDChecker) {
                        keyboardIDChecker.delete();
                    }
                    else {
                        let keyboard = new ATON.SUI.Keyboard("idKeyboard", "eng")
                        keyboard
                            .setFieldToWrite("annID")
                            .setHideOnEnter(true)
                            .setOnEnter(() => {
                                idText = annID.getText();
                                keyboard.delete();
                            })
                            .show()
                            .attachTo(annID)
                    }
                })
        }
        let containerID = SUI.createHorizontalContainer("annIDContainer", [annID, annIDlbl])

        let annTxtlbl = new SUI.Label("annTxtlbl", 0.25, 0.1)
            .setBackgroundOpacity(0.0)
            .setText("Annotation text")
            .setFontSize(0.05)
            .setTextAlign('left')
        let annText = new SUI.Label("annText", 1, 0.1)
        if (text === undefined) {
            annText.setBaseColor(ATON.MatHub.colors.white)
                .setTextColor(ATON.MatHub.colors.black)
                .setOnSelect(() => {
                    let keyboardTextChecker = ATON.getUINode("textKeyboard");
                    if (keyboardTextChecker) {
                        keyboardTextChecker.delete();
                    }
                    else {
                        let keyboard = new ATON.SUI.Keyboard("textKeyboard", "eng")
                        keyboard
                            .setFieldToWrite("annText")
                            .setHideOnEnter(true)
                            .setOnEnter(() => {
                                annTxt = annText.getText();
                                keyboard.delete();
                            })
                            .show()
                            .attachTo(annText)
                    }
                })
        }
        else {
            annText.setBaseColor(ATON.MatHub.colors.white)
                .setTextColor(ATON.MatHub.colors.black)
                .setText(text.replace(/<[^>]*>/g, ""))
                .setOnSelect(() => {
                    let keyboardTextChecker = ATON.getUINode("textKeyboard");
                    if (keyboardTextChecker) {
                        keyboardTextChecker.delete();
                    }
                    else {
                        let keyboard = new ATON.SUI.Keyboard("textKeyboard", "eng")
                        keyboard
                            .setFieldToWrite("annText")
                            .setHideOnEnter(true)
                            .setOnEnter(() => {
                                annTxt = annText.getText();
                                keyboard.delete();
                            })
                            .show()
                            .attachTo(annText)
                    }
                })
        }

        let containerText = SUI.createHorizontalContainer("annTextContainer", [annText, annTxtlbl])

        let playBTN = new SUI.Button("recBTN", 2.0)
        if (audioB64 !== undefined) {
            playBTN.setText("Play Vocal Note")
                .setOnSelect(() => {
                    const audio = new Audio(audioB64);
                    audio.play();
                })
        }

        let recBTN = new SUI.Button("recBTN", 2.0)
            .setText("Record Vocal Note")
            .setOnSelect(() => {
                if (recBTN.getBSwitched()) {
                    recBTN.switch(false);
                    mediaRecorder.stop()
                    mediaRecorder = undefined;
                    audio = undefined;
                    chunks = [];
                }
                else {
                    recBTN.switch(true);
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
                                        // $('#ctrlVocalNote').attr("src", SUI.audio);
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
            })

        let saveBTN = new SUI.Button("saveBTN", 2.0)
            .setText("Add")
            .setOnSelect(() => {
                let semid = idText;
                if (id) semid = id;
                let psemid = ATON.ROOT_NID;
                const esemid = undefined;
                // console.log(`ANN TXT: ${annTxt}`)
                let xxtmldescr = '\"<p>' +  annTxt + '</p>\"';
                let S = undefined;

                // console.log(`CI ARRIVA 1`)
                // console.log(`SEMID: ${semid}`)

                if (semid === undefined || semid.length < 2 || semid === ATON.ROOT_NID) {
                    return;
                }
                // console.log(`CI ARRIVA 2`)
                if (semid === psemid) {
                    return;
                }
                // console.log(`CI ARRIVA 3`)

                if (semtype === ATON.FE.SEMSHAPE_SPHERE) {
                    S = ATON.SemFactory.createSurfaceSphere(semid, point);
                }
                // console.log(`CI ARRIVA 4`)
                // console.log(`TYPE: ${JSON.stringify(ATON.getSemanticNode(semid))}`)
                const convexPoints = ATON.SemFactory.convexPoints;
                if (semtype === ATON.FE.SEMSHAPE_CONVEX) {
                    S = ATON.SemFactory.completeConvexShape(semid);
                }
                console.log('CONVEX S: ', S)
                if (S === undefined) {
                    S = ATON.getSemanticNode(semid)
                }
                // console.log(`CI ARRIVA 6`)

                let gSemXPF = ATON.XPFNetwork.getCurrentSemanticGroup();

                if (gSemXPF) {
                    gSemXPF.add(S);
                } else {
                    let parS = ATON.getSemanticNode(psemid);

                    if (parS) {
                        parS.add(S);
                    } else {
                        ATON.getRootSemantics().add(S);
                    }
                }

                if (xxtmldescr && xxtmldescr.length > 2) {
                    S.setDescription(xxtmldescr);
                }
                if (audio) {
                    S.setAudio(audio);
                }

                let E = {};
                E.semanticgraph = {};
                E.semanticgraph.nodes = {};
                E.semanticgraph.nodes[S.nid] = {};

                if (semtype === ATON.FE.SEMSHAPE_SPHERE) {
                    E.semanticgraph.nodes[S.nid].spheres = ATON.SceneHub.getJSONsemanticSpheresList(semid);
                }
                if (semtype === ATON.FE.SEMSHAPE_CONVEX) {
                    E.semanticgraph.nodes[S.nid].convexshapes = ATON.SceneHub.getJSONsemanticConvexShapes(semid);
                }

                if (S.getDescription()) {
                    E.semanticgraph.nodes[S.nid].description = S.getDescription();
                }
                if (S.getAudio()) {
                    E.semanticgraph.nodes[S.nid].audio = S.getAudio();
                }

                E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);
                console.log(E)

                ATON.SceneHub._bEdit = true;

                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SceneHub._bEdit = false;
                annNode.delete();
                const stackInfo = {
                    action: (semtype === ATON.FE.SEMSHAPE_SPHERE) ? "add_sphere" : "add_convex",
                    type: semtype,
                    node: S,
                    point: (semtype === ATON.FE.SEMSHAPE_SPHERE) ? point : convexPoints,
                    radius: (semtype === ATON.FE.SEMSHAPE_SPHERE) ? ATON.SUI.getSelectorRadius() : undefined
                }
                ATON.undoStack.push(stackInfo);
                // console.log("UNDO STACK: ", ATON.undoStack)
                if (semtype === ATON.FE.SEMSHAPE_CONVEX) {
                    // ATON.getRootSemantics().add(S)
                    ATON.SceneHub.parseScene(E);
                }
            })

        let container;
        if (audioB64) {
            container = SUI.verticalPositions([containerTitle, containerID, containerText, playBTN, recBTN, saveBTN], "firstContainerAnn", 0.03)
        }
        else {
            container = SUI.verticalPositions([containerTitle, containerID, containerText, recBTN, saveBTN], "firstContainerAnn", 0.03)
        }

        // console.log(`CONTAINER: ${container}`)

        annNode.add(container);
    }

    return annNode;
}

SUI.showAnnotationPopupXR = (semid) => {
    console.log(`semid: ${semid}`)
    if (semid === undefined) {
        return;
    }

    // if (ATON.FE._auSemNode) {
    //     ATON.FE._auSemNode.stop();
    // }

    let semNode = ATON.getSemanticNode(semid)
    let audioB64 = semNode.getAudio();
    let descr = HATHOR.getHTMLDescriptionFromSemNode(semid);

    // debugger;
    // let idText = undefined;
    // let annTxt = undefined;
    let annNode = ATON.getUINode("annPopUp");
    if (!annNode) {
        // console.log(`ANN NODE: ${annNode}`)
        annNode = ATON.createUINode("annPopUp");
        // console.log(`ANN NODE DOPO: ${JSON.stringify(annNode)}`)
        let title = new SUI.Label("annTitle", 0.25, 0.1)
            .setBackgroundOpacity(0.0)
            .setText(semid)
            .setFontSize(0.05)
            .setTextAlign('left')
        let containerTitle = SUI.createHorizontalContainer("annTitleContainer", [title])

        let annTxtlbl = new SUI.Label("annTxtlbl", 0.25, 0.1)
            .setBackgroundOpacity(0.0)
            .setText(descr.replace(/<[^>]*>/g, ""))
            .setFontSize(0.05)
            .setTextAlign('left')

        let containerText = SUI.createHorizontalContainer("annTextContainer", [/*annText, */annTxtlbl])

        let playBTN = new SUI.Button("recBTN", 2.0)
            .setText("Play Vocal Note")
            .setOnSelect(() => {
                const audio = new Audio(audioB64);
                audio.play();
            })

        let editBTN = new SUI.Button("recBTN", 2.0)
            .setText("Edit Annotation")
            .setOnSelect(() => {
                annNode.delete();
                SUI.createAnnotationDataBlock(undefined, undefined, semid, descr, audioB64)
                    .setPosition(4.5, 2.5, -2.3)
                    .setRotation(0.0, 300, 0)
                    .setScale(1.8)
                    .attachToRoot();
            })

        let closeBTN = new SUI.Button("closeBTN", 2.0)
            .setText("Close")
            .setOnSelect(() => {
                annNode.delete();
            })

        let container;

        const myPromise = new Promise((resolve, reject) => {
            ATON.FE.checkAuth((r) => {
                let authUser = r.username;
                // console.log(`AUTH USER: ${authUser}`)
                if (authUser) {
                    if (audioB64) {
                        container = SUI.verticalPositions([containerTitle, containerText, playBTN, editBTN, closeBTN], "firstContainerAnn", 0.03)
                    }
                    else {
                        container = SUI.verticalPositions([containerTitle, containerText, editBTN, closeBTN], "firstContainerAnn", 0.03)
                    }

                    // console.log(`FIRST CONTAINER: ${JSON.stringify(container)}`)
                    resolve(container);
                }
                else {
                    if (audioB64) {
                        container = SUI.verticalPositions([containerTitle, containerText, playBTN, closeBTN], "firstContainerAnn", 0.03)
                    }
                    else {
                        container = SUI.verticalPositions([containerTitle, containerText, closeBTN], "firstContainerAnn", 0.03)
                    }
                    resolve(container)
                }
            })
        })

        myPromise.then(r => {
            // console.log(`\n\n\n\n\n\n\n\n\n\nCONTAINER: ${JSON.stringify(r)}`)

            annNode.add(r);
            return annNode;
        })
    }
    return annNode;
}

SUI.createSketchfabBlock = (id, searchSketchId) => {
    let sketchfabNode = ATON.getUINode(id);
    // let searchSketchId;
    // if (id.split("_").length > 1) searchSketchId = "searchSketchModel_" + id.split("_")[1]
    // else searchSketchId = "searchSketchModel"
    // console.log("searchSketchId: ", searchSketchId);

    if (!sketchfabNode) {
        sketchfabNode = ATON.createUINode(id);

        let icon = new SUI.Label("sketchfabIcon", 0.1, 0.1)
            .setIcon(ATON.FE.PATH_RES_ICONS + "sketchfab-logo.png", false)

        let title = new SUI.Label("sketchfabTitle", 0.25, 0.1)
            .setBackgroundOpacity(0.0)
            .setText("Sketchfab")
            .setFontSize(0.05)
            .setTextAlign('left')

        let containerTitle = SUI.createHorizontalContainer("sketchfabBlockTitleContainer", [title, icon])
        // containerTitle.add(icon, title)

        let searchBarModel = new SUI.Label(searchSketchId, 1, 0.1)
            .setBaseColor(ATON.MatHub.colors.white)
            .setTextColor(ATON.MatHub.colors.black)

        let container = SUI.verticalPositions([containerTitle, searchBarModel], "firstContainerSketch", 0.03)

        // container.add(containerTitle, searchBarModel)

        sketchfabNode.add(container);
    }

    return sketchfabNode;
}


SUI.createSketchCard = (id, name, url, nameModelSketch, thumb, isPersonalCollection = false, onButtonPress) => {
    let imageContainer = new SUI.Label(id + "ImageSketchContainer", 0.5, 0.28)

    let image = ATON.SUI.buildPanelNode(id + "ImageSketchfab", thumb,
        0.5, 0.28, false, true, THREE.FrontSide)
    imageContainer.add(image)

    image.setPosition(undefined, undefined, 0.002)

    let modelName = new SUI.Label("modelName", 0.3, 0.2)

    try {
        modelName.setText(nameModelSketch)
    } catch (e) {
        console.error(e)
        modelName.setText("Model")
    }

    let addButton = new SUI.Button(id + "buttonNode", 2.0)
        .setText("Add Model")
        .setOnSelect(onButtonPress)

    let bookmarkButton;
    let containerItems = [imageContainer, modelName, addButton]

    if (!isPersonalCollection) {
        bookmarkButton = new SUI.Button(id + "bookmark", 2.0)
            .setText("Add Bookmark")
            .setOnSelect(() => {
                ATON.FE.checkAuth((r) => {
                    const username = r.username
                    const newObj = {
                        name: name,
                        type: "sketchfab",
                        url: url,
                        tag: "sceneobj",
                        assetId: id,
                        thumbnail: thumb
                    }

                    const data = {
                        username: username,
                        obj: newObj
                    }
                    $.ajax({
                        url: ATON.PATH_RESTAPI + "addtocollection",
                        type: "POST",
                        data: JSON.stringify(data),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",

                        success: (r) => {
                            // $('#idPopup').hide();
                            // $('#idPopup').html('');
                            // $('#idTopToolbar').show();
                            // console.log("LI DATI APPENA AGGIORNATI: ", r);
                            ATON._userObjects = r;
                            console.log("NEW LIST: ", ATON._userObjects)
                            // if (r) {
                            //     ATON.fireEvent("Login", r);
                            //     $("#btn-user").addClass("switchedON");
                            //     ATON.FE.popupClose();
                            // }
                        }

                    }).fail((err) => {
                        console.log(err);
                        // $("#idLoginBTN").html("LOGIN FAILED");
                        // $("#idLoginBTN").attr("class", "atonBTN atonBTN-red");
                    });
                })
            })
        containerItems = [imageContainer, modelName, addButton, bookmarkButton]
    }

    let container = SUI.verticalPositions(containerItems, "backCard", 0.03)
        .setBaseColor(ATON.MatHub.colors.black)

    // containerItems.forEach(item => {
    //     container.add(item)
    // })

    return container;
}
//
// SUI.horizontalSketchfabPanel = (previousArrow, containerCard, nextArrow) => {
//     // let myNode = ATON.createUINode("sketchfabSearchContainer")
//     //
//     // if (!myNode) {
//         let container = SUI.createHorizontalContainer("skSearchContainer", [previousArrow, containerCard, nextArrow])
//
//         container.add(previousArrow, containerCard, nextArrow)
//     //     myNode.add(container)
//     // }
//     //
//     // return myNode
// }

SUI.changeVisibility = (items, newVisibility) => {
    items.forEach(item => {
        item.visible = newVisibility

        // parent.remove(item)
    })
}

// SUI.createSketchCard = (id, nameModelSketch, url) => {
//     let myNode = ATON.createUINode(id);
//     let imageNode = ATON.createUINode("imageNode");
//     let titleNode = ATON.createUINode("titleNode");
//     let buttonNode = ATON.createUINode(id + "buttonNode");
//
//     let container = new ThreeMeshUI.Block({
//         width: 1,
//         height: 1,
//         padding: 0.001,
//         // margin: 0.2,
//         borderRadius: 0.03,
//         backgroundColor: ATON.MatHub.colors.black,
//         backgroundOpacity: 1,
//
//         fontFamily: ATON.SUI.PATH_FONT_JSON,
//         fontTexture: ATON.SUI.PATH_FONT_TEX,
//
//         justifyContent: 'center',
//         textAlign: 'center',
//     });
//
//     let imageContainer = new ThreeMeshUI.Block({
//         width: 0.8,
//         height: 0.3,
//         padding: 0.001,
//         margin: 0.05,
//         borderRadius: 0.03,
//         backgroundColor: ATON.MatHub.colors.black,
//         backgroundOpacity: 1,
//         fontFamily: ATON.SUI.PATH_FONT_JSON,
//         fontTexture: ATON.SUI.PATH_FONT_TEX,
//         justifyContent: 'center',
//         textAlign: 'center'
//     });
//
//     let image = SUI.buildPanelNode("imageSketchfab", url,
//         0.5, 0.3, false, true, THREE.FrontSide)
//     image.setPosition(undefined, undefined, 0.005)
//
//     imageContainer.add(image)
//     // imageNode.add(imageContainer)
//
//
//     let modelNameBlock = new ThreeMeshUI.Block({
//         width: 0.3,
//         height: 0.1,
//         padding: 0.001,
//         margin: 0.05,
//         borderRadius: 0.03,
//         backgroundColor: ATON.MatHub.colors.green,
//         backgroundOpacity: 1,
//         fontFamily: ATON.SUI.PATH_FONT_JSON,
//         fontTexture: ATON.SUI.PATH_FONT_TEX,
//         justifyContent: 'center',
//         textAlign: 'center'
//     });
//
//     let modelName = new ThreeMeshUI.Text({
//         content: nameModelSketch,
//         fontSize: 0.05,
//         fontColor: ATON.MatHub.colors.white
//     });
//     modelNameBlock.add(modelName)
//     titleNode.add(modelNameBlock)
//
//     let addButton = new ThreeMeshUI.Block({
//         width: 0.2,
//         height: 0.1,
//         padding: 0.001,
//         margin: 0.02,
//         borderRadius: 0.03,
//         backgroundColor: ATON.MatHub.colors.green,
//         backgroundOpacity: 1,
//         fontFamily: ATON.SUI.PATH_FONT_JSON,
//         fontTexture: ATON.SUI.PATH_FONT_TEX,
//         justifyContent: 'center',
//         textAlign: 'center'
//     }).add(new ThreeMeshUI.Text({
//         content: "Add Model",
//         fontSize: 0.03,
//         fontColor: ATON.MatHub.colors.white
//     }));
//     buttonNode.add(addButton)
//
//     container.add(imageContainer, modelNameBlock, addButton)
//
//     myNode.add(container);
//     ThreeMeshUI.update();
//     return myNode;
// }

SUI.checkAuth = (onReceive) => {
    ATON.Utils.checkAuth((data) => {
        SUI._userAuth = data;
        if (data.username !== undefined) {
            // $("#btn-user").addClass("switchedON"); // TODO METTERE CHE L'ICONA Profile nella toolbar diventa bianca o qualcosa del genere
            if (ATON.Photon._username === undefined) {
                ATON.Photon.setUsername(data.username);
            }
        } else {
            //$("#btn-user").removeClass("switchedON");// TODO METTERE CHE L'ICONA Profile nella toolbar diventa normale
        }

        if (onReceive) {
            onReceive(data);
        }
    });
};

// SUI.bannerEditorAlreadyExist = () => {
//     return new SUI.Label("bannerEditor", 0.8, 0.4, 0.06)
//         .setMaterialById("red")
//         .setText("Another editor is \nediting this node")
//         // .setBaseColor(ATON.MatHub.colors.red)
// }

SUI.createMessageLabel = (id, width, height, text, fontSize = 0.04, ms) => {
    // let P = ATON.getSceneQueriedPoint();
    // let test = ATON.getSceneFocalPoint()

    let panel = new SUI.Label(id, width, height, fontSize)
    panel
        .setMaterialById("red")
        .setText(text)
        .show()
        .attachToRoot()

    if (id !== "editModeLabelMessage" || id !== "writeAnnotationToolbar") {
        ATON.Nav._camera.add(panel)
        panel.setPosition(0, 0, -2.5)
    }

    if (ms) {
        setTimeout(() => {
            ATON.getUINode(id).hide()
        }, ms)
    }
}

SUI.toggleBtn = (listOfBtn, switchOn) => {

    listOfBtn.forEach(btn => {
        if (btn._bSwitched) {
            btn.switch(false)
        }
    })
    switchOn.switch(true)
}

SUI.annotationToolbar = (id) => {
    let undoBtn = new SUI.Button("undoBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "undo.png")
        .setOnSelect(() => {
            SemFactory.undoAnnotation()
        })

    let redoBtn = new SUI.Button("redoBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "redo.png")
        .setOnSelect(() => {
            SemFactory.redoAnnotation()
        })

    let redoUndoContainer = SUI.createHorizontalContainer("redoUndoContainer", [redoBtn, undoBtn])
        .setBackgroundOpacity(0.0)
        .setOnHover(() => {
        })
        .setOnLeave(() => {
        })

    let pencilBtn = new SUI.Button("pencilBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "edit.png")
        .setOnSelect(() => {
            if (eraserBtn._bSwitched) {
                eraserBtn.switch(false)
            }
            pencilBtn.switch(true)

            SemFactory.startWritingAnnotation()
        })
        .switch(true)


    let eraserBtn = new SUI.Button("eraserBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "eraser.png")
        .setOnSelect(() => {
            if (pencilBtn._bSwitched) {
                pencilBtn.switch(false)
            }
            eraserBtn.switch(true)

            SemFactory.startErasingAnnotation()
        })

    let toolsContainer = SUI.createHorizontalContainer("toolsContainer", [pencilBtn, eraserBtn])
        // .add(pencilBtn, eraserBtn)
        .setBackgroundOpacity(0.0)
        .setOnHover(() => {
        })


    let blackBtn = new SUI.Button("blackBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "blackBtn.png")
        .setOnSelect(() => {
            ATON.SemFactory.annotationColor = 0x000000
            SUI.toggleBtn(colorsList, blackBtn)
        })
        .switch(true)


    let redBtn = new SUI.Button("redBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "redBtn.png")
        .setOnSelect(() => {
            ATON.SemFactory.annotationColor = 0xFF0000
            SUI.toggleBtn(colorsList, redBtn)
        })

    let blueBtn = new SUI.Button("blueBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "blueBtn.png")
        .setOnSelect(() => {
            ATON.SemFactory.annotationColor = 0x0000FF
            SUI.toggleBtn(colorsList, blueBtn)
        })

    let colorsList = [blueBtn, redBtn, blackBtn]

    let colorsContainer = SUI.createHorizontalContainer("toolsContainer", colorsList)
        // .add(blueBtn, redBtn, blackBtn)
        .setBackgroundOpacity(0.0)
        .setOnHover(() => {
        })

    let numOfPencilSize = new SUI.Label("pencilSize", 0.3, 0.1, 0.04)
        .setText(ATON.SemFactory.annotationWidth.toString())

    let minusBtn = new SUI.Button("minusBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "minus.png")
        .setOnSelect(() => {
            if (ATON.SemFactory.annotationWidth > 1) {
                ATON.SemFactory.annotationWidth -= 1
                numOfPencilSize.setText(ATON.SemFactory.annotationWidth.toString())
            }
        })

    let plusBtn = new SUI.Button("plusBtn")
        .setIcon(ATON.FE.PATH_RES_ICONS + "plus.png")
        .setOnSelect(() => {
            if (ATON.SemFactory.annotationWidth <= 20) {
                ATON.SemFactory.annotationWidth += 1
                numOfPencilSize.setText(ATON.SemFactory.annotationWidth.toString())
            }
        })

    let pencilContainer = SUI.createHorizontalContainer("toolsContainer", [minusBtn, numOfPencilSize, plusBtn])
        // .add(minusBtn, numOfPencilSize, plusBtn)
        .setBackgroundOpacity(0.0)
        .setOnHover(() => {
        })
        .setOnLeave(() => {
        })

    let toolbarAnnotation = SUI.verticalPositions([
        redoUndoContainer, toolsContainer, colorsContainer, pencilContainer
    ], id, 0.03)

    toolbarAnnotation
        // .add(toolsContainer, colorsContainer, pencilContainer)
        .attachToRoot()

    return toolbarAnnotation

}

SUI.baseToolbarSetup = () => {

    let buttonsTopMenu = [
        new ATON.SUI.Button("sui_sketchfab"),
        new ATON.SUI.Button("sui_talk"),
        new ATON.SUI.Button("sui_photon"),
        new ATON.SUI.Button("sui_profile")
    ];

    let buttonsBottomMenu = [
        new ATON.SUI.Button("sui_exitxr"),
        new ATON.SUI.Button("sui_pdf"),
        new ATON.SUI.Button("sui_uscale"),
        new ATON.SUI.Button("sui_home")
    ];

    let topToolbarMenu = ATON.SUI.createToolbar("toolbarTopMenu", buttonsTopMenu)
    let bottomToolbarMenu = ATON.SUI.createToolbar("toolbarBottomMenu", buttonsBottomMenu)

    let menuList = [topToolbarMenu, bottomToolbarMenu]
    let menu = ATON.SUI.verticalPositions(menuList, "baseToolbar", 0.03)
    // menuList.forEach(block => {
    //     menu.add(block)
    // })

    return menu
}

SUI.toolbarEditor = (buttons) => {
    return SUI.createToolbar("editToolbarMenu", buttons)
}

SUI.toggleButtonsProfile = (buttonToTrue, buttonToFalse, toShowEditToolbar) => {
    if (ATON.getUINode(buttonToTrue)) {
        ATON.getUINode(buttonToTrue).switch(true)
    }

    if (ATON.getUINode(buttonToFalse)) {
        ATON.getUINode(buttonToFalse).switch(false)
    }

    if (toShowEditToolbar) {
        ATON.getUINode("editToolbarMenu").show()
    } else {
        ATON.getUINode("editToolbarMenu").hide()
    }

}

SUI.createProfileBlock = async (id) => {
    let myNode = ATON.createUINode(id);

    const authPromise = new Promise((resolve, reject) => {
        SUI.checkAuth((r) => {
            let listOfBlocks = []

            // We are already logged
            if (r.username !== undefined) {

                let userIcon = new Label("userLogged", 0.1, 0.1)
                    .setIcon(ATON.FE.PATH_RES_ICONS + "user.png", true)

                let userLogged = new Label("userLogged", 0.5, 0.07)
                    .setText(r.username)
                    .setBaseColor(ATON.MatHub.colors.white)
                    .setTextColor(ATON.MatHub.colors.black)

                let userMode = new Button("userMode", 1.0, 1.0, 0.03)
                    .setIcon(ATON.FE.PATH_RES_ICONS + "user.png", false)
                    .setText("User")

                let editMode = new Button("editMode", 1.0, 1.0, 0.03)
                    .setIcon(ATON.FE.PATH_RES_ICONS + "edit_mode.png", false)
                    .setText("Editor")

                if (ATON.FE._uiCurrProfile === "editor") {
                    editMode.switch(true)
                } else {
                    userMode.switch(true)
                }

                let modalities = SUI.createToolbar("mod", [editMode, userMode])
                    .setBackgroundOpacity(0.0)
                // .setOnHover(()=>{})
                // .setOnLeave(()=>{})

                userMode.setOnSelect(() => {
                    if (!userMode.getBSwitched()) {
                        // userMode.switch(true)
                        // editMode.switch(false)
                        // ATON.getUINode("editToolbarMenu").hide()
                        ATON.FE.uiLoadProfile("default");
                        ATON.SUI.toggleButtonsProfile("userMode", "editMode", false)
                    }
                })

                editMode.setOnSelect(() => {
                    if (!editMode.getBSwitched()) {
                        // editMode.switch(true)
                        // userMode.switch(false)
                        // ATON.getUINode("editToolbarMenu").show()
                        ATON.FE.uiLoadProfile("editor");
                        ATON.SUI.toggleButtonsProfile("editMode", "userMode", true)

                    }
                })

                let logoutButton = new Button("logoutButton", 2.0, 1.0, 1.3)
                    .setText("Logout")
                    .setBaseColor(ATON.MatHub.colors.red)
                    .setTextColor(ATON.MatHub.colors.white)

                listOfBlocks.push(userIcon, userLogged, modalities, logoutButton)
            } else {

                let username = new SUI.Field("username", 0.5, 0.07, id)
                    .addOnEnterBehaviorToSetOnKeyboardWhenFieldIsSelected(() => {
                        username.setNextNodeToSelect("password")
                    })
                    .setBaseColor(ATON.MatHub.colors.white)
                    .setTextColor(ATON.MatHub.colors.black)
                    .setPlaceholder("Username")

                let password = new SUI.Field("password", 0.5, 0.07)
                    .addOnEnterBehaviorToSetOnKeyboardWhenFieldIsSelected(() => {
                        password.setNextNodeToSelect("loginButton")
                    })
                    .setBaseColor(ATON.MatHub.colors.white)
                    .setTextColor(ATON.MatHub.colors.black)
                    .setPlaceholder("Password")

                let buttonLogin = new SUI.Button("loginButton", 2)
                    .setText("LOGIN")
                    .setBaseColor(ATON.MatHub.colors.green)
                // .setTextColor(ATON.MatHub.colors.white)

                listOfBlocks.push(username, password, buttonLogin)
            }

            resolve(listOfBlocks)
        })
    });


    return await authPromise
        .then((listOfBlocks) => {
            let container = SUI.verticalPositions(listOfBlocks, "containerProfileBlock", 0.03)

            // listOfBlocks.forEach(block => {
            //     container.add(block)
            // })

            let logoutButtonNode = ATON.getUINode("logoutButton")
            if (logoutButtonNode !== undefined) {
                logoutButtonNode.setOnSelect(() => {
                    $.get(ATON.PATH_RESTAPI + "logout", (r) => {
                        // console.log(r);
                        //
                        // ATON.SceneHub.setEditMode(false);
                        // FE.uiSwitchButton("edit", false);

                        ATON.fireEvent("Logout");
                        // $("#btn-user").removeClass("switchedON");
                        container.hide()
                    });
                })
            }

            let loginButton = ATON.getUINode("loginButton")
            if (loginButton !== undefined) {
                let username = ATON.getUINode("username")
                let password = ATON.getUINode("password")
                loginButton.setOnSelect(() => {
                    let jstr = JSON.stringify({
                        username: username.getText(), password: password.getText()
                    });

                    $.ajax({
                        url: ATON.PATH_RESTAPI + "login",
                        type: "POST",
                        data: jstr,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",

                        success: (r) => {
                            console.log(r);
                            if (r) {
                                ATON.fireEvent("Login", r);
                                console.log("LOGGED IN") // TODO mettere messaggio
                                // $("#btn-user").addClass("switchedON");
                                // ATON.FE.popupClose();
                                container.hide()
                            }
                        }

                    }).fail((err) => {
                        console.log("Login failed") // TODO mettere messaggio
                        //console.log(err);
                        // $("#idLoginBTN").html("LOGIN FAILED");
                        // $("#idLoginBTN").attr("class", "atonBTN atonBTN-red");
                        container.hide()
                    });
                })

            }

            myNode.add(container);
            ThreeMeshUI.update();
            return myNode;
        })

    //
    // return await authPromise
    //     .then((listOfBlocks) => {
    //
    //         let container = SUI.verticalPositions(listOfBlocks, "containerProfileBlock", 0.03)
    //
    //         listOfBlocks.forEach(block => {
    //             container.add(block)
    //         })
    //
    //         myNode.add(container);
    //         ThreeMeshUI.update();
    //         return myNode;
    //     })
}

SUI.createChatBlock = (id) => {
    let myNode = ATON.createUINode(id);
    let listOfLabels = [];

    let titleContainer = new SUI.Label("titleContainer", 0.7, 0.07)
        .setText("Chat Session")
    // .setPosition(0.0, 0.25, 0.01)

    let chatBox = new SUI.Label("chatBox", 0.7, 0.4)
        .setBaseColor(ATON.MatHub.colors.white)
        .setTextColor(ATON.MatHub.colors.black)

    let textBox = new SUI.Label("chatTextBox", 0.7, 0.05)
    textBox
        .setBaseColor(ATON.MatHub.colors.white)
        .setTextColor(ATON.MatHub.colors.black)

    let testButton = new SUI.Button("testButton")
    testButton.setText("Push Me")

    listOfLabels.push(titleContainer, chatBox, textBox, testButton)
    let container = SUI.verticalPositions(listOfLabels, "containerChatBlock", 0.03)
    // listOfLabels.forEach(label => {
    //     container.add(label)
    // });

    console.log(container.children)

    myNode.add(container);

    ThreeMeshUI.update();

    return myNode;
}

SUI.createMsgContainer = (username, message) => {
    // let myNode = ATON.createUINode();
    let listOfLabels = []

    let nameUser = new SUI.Label("userName", 0.4, 0.05)
        .setText(username)
    let msg = new SUI.Label("msg", 0.4, 0.05)
        .setText(message)

    listOfLabels.push(nameUser, msg)

    let container = SUI.verticalPositions(listOfLabels, "containerMsgBlock", 0.03)

    // listOfLabels.forEach(label => {
    //     container.add(label)
    // });

    // console.log(container.children)

    // myNode.add(container);
    //
    // ThreeMeshUI.update();

    return container;
}

// SUI.createBlock = (id) => {
//     let myNode = ATON.createUINode(id);
//
//     let container = new ThreeMeshUI.Block({
//         width: 1,
//         padding: 0.01,
//         borderRadius: 0.02,
//         backgroundColor: ATON.MatHub.colors.black,
//         backgroundOpacity: 0.4,
//         fontFamily: SUI.PATH_FONT_JSON,
//         fontTexture: SUI.PATH_FONT_TEX,
//         justifyContent: 'center',
//         textAlign: 'center',
//         bestFit: 'shrink',
//     });
//
//     let titleContainer = SUI.createMyLabel(0.7, 0.07, "Chat Session")
//     container.add(titleContainer);
//
//     let chatBlock = new ThreeMeshUI.Block({
//         width: 0.7,
//         height: 0.4,
//         padding: 0.01,
//         borderRadius: 0.02,
//         backgroundColor: ATON.MatHub.colors.white,
//         backgroundOpacity: 0.4,
//         fontFamily: SUI.PATH_FONT_JSON,
//         fontTexture: SUI.PATH_FONT_TEX,
//         justifyContent: 'center',
//         textAlign: 'center',
//         bestFit: 'shrink',
//     });
//
//     container.add(chatBlock);
//
//     let textToSend = new ThreeMeshUI.Text({content: ''});
//
//     let textToSendBlock = new ThreeMeshUI.Block({
//         width: 0.7,
//         height: 0.05,
//         padding: 0.01,
//         margin: 0.03,
//         borderRadius: 0.02,
//         backgroundColor: ATON.MatHub.colors.white,
//         backgroundOpacity: 0.4,
//         fontFamily: SUI.PATH_FONT_JSON,
//         fontTexture: SUI.PATH_FONT_TEX,
//         justifyContent: 'center',
//         textAlign: 'center',
//         bestFit: 'shrink',
//     }).add(textToSend);
//
//     container.add(textToSendBlock)
//
//     myNode.add(container);
//
//     ThreeMeshUI.update();
//
//     return myNode;
// };

SUI.verticalToolbarEditor = (id, node) => {
    let moveObj = new ATON.SUI.Button("moveObj")
    moveObj.setIcon(ATON.FE.PATH_RES_ICONS + "move.png")
        // .switch(true)
        .setOnSelect(() => {
            if (ATON.getUINode(id + 'Axis')) ATON.getUINode(id + 'Axis').delete();
            if (moveObj.getBSwitched()){
                ATON._lastSelectedEditMode = undefined;
                node.setNowDragging(false);
                moveObj.switch(false);
            }
            else {
                ATON._lastSelectedEditMode = "drag";
                SUI.toggleBtn(listOfBtn, moveObj)
                node.setNowDragging(true)
            }
        })

    let rotateObj = new ATON.SUI.Button("rotateObj")
    rotateObj.setIcon(ATON.FE.PATH_RES_ICONS + "rotate.png")
        .setOnSelect(() => {
            if (rotateObj.getBSwitched()){
                ATON._lastSelectedAxis = undefined;
                ATON._lastSelectedEditMode = undefined;
                node.setNowRotating(false)
                rotateObj.switch(false)
                if (ATON.getUINode(id + 'Axis')) ATON.getUINode(id + 'Axis').delete();
            }
            else {
                ATON._lastSelectedEditMode = "rot";
                SUI.toggleBtn(listOfBtn, rotateObj)

                node.setNowRotating(true)

                ATON._lastSelectedAxis = undefined
                // ATON.fireEvent("ChangedRotationAxis", ATON._lastSelectedAxis)

                let rotX = new ATON.SUI.Button("rotX", 1.0, 1.0, 1.3)
                rotX.setText("X")
                    // .switch(true)
                    .setOnSelect(() => {
                        SUI.toggleBtn(listOfAxis, rotX)
                        ATON._lastSelectedAxis = "x"
                        ATON.fireEvent("ChangedRotationAxis", ATON._lastSelectedAxis)
                    })

                let rotY = new ATON.SUI.Button("rotY", 1.0, 1.0, 1.3)
                rotY.setText("Y")
                    .setOnSelect(() => {
                        SUI.toggleBtn(listOfAxis, rotY)
                        ATON._lastSelectedAxis = "y"
                        ATON.fireEvent("ChangedRotationAxis", ATON._lastSelectedAxis)
                    })

                let rotZ = new ATON.SUI.Button("rotZ", 1.0, 1.0, 1.3)
                rotZ.setText("Z")
                    .setOnSelect(() => {
                        SUI.toggleBtn(listOfAxis, rotZ)
                        ATON._lastSelectedAxis = "z"
                        ATON.fireEvent("ChangedRotationAxis", ATON._lastSelectedAxis)
                    })

                let listOfAxis = [rotZ, rotY, rotX]

                // return SUI.createHorizontalContainer(id, listOfBtn)

                if (!ATON.getUINode(id + 'Axis')) {
                    SUI.createHorizontalContainer(id + "Axis", listOfAxis)
                        .setPosition(0, -0.15, 0)
                        .attachTo(id)
                }
            }


            // node.rotationEvent(ATON._screenPointerCoords)


        })

    let scaleObj = new ATON.SUI.Button("scaleObj")
    scaleObj.setIcon(ATON.FE.PATH_RES_ICONS + "scale.png")
        .setOnSelect(() => {
            if (ATON.getUINode(id + 'Axis')) ATON.getUINode(id + 'Axis').delete();
            if (scaleObj.getBSwitched()){
                ATON._lastSelectedEditMode = undefined;
                scaleObj.switch(false)
                // SUI.toggleBtn(listOfBtn, scaleObj)
                node.setNowScaling(false)
            }
            else {
                ATON._lastSelectedEditMode = "scale";
                SUI.toggleBtn(listOfBtn, scaleObj)
                node.setNowScaling(true)
            }

            // ATON.on("MouseWheel", (d) => {
            //     if (this.nowEditing && this.nowHover) {
            //         if (d < 0) {
            //             this.incrementScale()
            //         } else if (d > 0) {
            //             this.decrementScale()
            //         }
            //     }
            // })
        })

    let listOfBtn = [moveObj, rotateObj, scaleObj]

    // return SUI.createHorizontalContainer(id, listOfBtn)

    let container = SUI.createHorizontalContainer(id, listOfBtn)

    for (let btn of listOfBtn) {
        btn.setPosition(btn.position.x - 0.005, undefined, undefined)
    }

    return container
}


/**
 Create a SpatialUI toolbar from a list of SUI buttons
 This can be arranged anywhere in the scene or attached to other UI nodes
 @param id - id of the Node
 @param {array} buttonlist - a list (array) of SUI buttons
 @param {THREE.Color} color - (optional) base color for the toolbar
 @param opacity
 @returns {Node}
 */
SUI.createToolbar = (id, buttonlist, color, opacity) => {

    let num = buttonlist.length;
    let padding = SUI.STD_BTN_SIZE * 0.5;
    let marginf = 1.1;

    let cont = SUI.createHorizontalContainer(id, buttonlist)
    // buttonlist.forEach(button => {
    //     cont.add(button)
    //     // button.attachTo(cont)
    // })

    return cont
};

SUI.createLayerRow = (nid) => {
    let checkButton = new SUI.Button(nid + "Button")
    let nameLayer = new SUI.Label(nid + "Label", 0.5, 0.07)
        .setText(nid)
    return SUI.createToolbar(nid + "Toolbar", [nameLayer, checkButton])
}

SUI.createLayersNodes = (id, type) => {
    let layersNode = ATON.getUINode(id);

    if (!layersNode) {
        let nodes = ATON.snodes;
        let layersList = []
        for (let nid in nodes) {
            let actualNode = nodes[nid];

            if (nid !== ".") {
                let actualLayerNode = SUI.createLayerRow(nid)
                layersList.unshift(actualLayerNode)
                let checkButton = ATON.getUINode(nid + "Button")
                    .setBaseColor(ATON.MatHub.colors.green)

                checkButton.setOnSelect(() => {
                    if (actualNode.visible) {
                        ATON.FE.switchNode(nid, false, type)
                        checkButton.setBaseColor(ATON.MatHub.colors.black)
                    } else {
                        ATON.FE.switchNode(nid, true, type)
                        checkButton.setBaseColor(ATON.MatHub.colors.green)
                    }
                })

            }

        }

        layersNode = SUI.verticalPositions(layersList, id, 0.03)
        // layersList.forEach(layer => {
        //     layersNode.add(layer)
        // })
    }

    return layersNode
}


SUI.createImageFromUrl = (url, width, height, transparent, depthWrite, side = THREE.DoubleSide) => {
    if (width === undefined) {
        width = 1.0;
    }
    if (height === undefined) {
        height = 1.0;
    }

    // Load an image file into a custom material
    let material = new THREE.MeshLambertMaterial({
        map: ATON.Utils.textureLoader.load(url),
        transparent: transparent,
        depthWrite: depthWrite,
        side: side
    });

    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
        .setPosition(undefined, undefined, 0.02)
}

/**
 Create a UI Node with a textured panel from URL
 This can be arranged anywhere in the scene or attached to other UI nodes
 @param {string} suid - The SUI Node ID (e.g.: "myPanel")
 @param {string} url - URL to image
 @param {number} w - (Optional) width
 @param {number} h - (Optional) height
 @param transparent
 @param depthWrite
 @param side
 @returns {Node}
 */
SUI.buildPanelNode = (suid, url, w, h, transparent, depthWrite, side = THREE.DoubleSide) => {
    if (w === undefined) {
        w = 1.0;
    }
    if (h === undefined) {
        h = 1.0;
    }

    let suiNode = ATON.createUINode(suid);

    let pmesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h, 2),
        ATON.MatHub.materials.fullyTransparent
    );
    suiNode.add(pmesh);


    if (url !== undefined) {
        ATON.Utils.textureLoader.load(url, (texture) => {
            pmesh.material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: transparent,
                depthWrite: depthWrite,
                side: THREE.DoubleSide
            });
        });
    }

    return suiNode;
};

// Measurements
SUI.addMeasurementPoint = (P) => {
    if (P === undefined) return undefined;

    let s = 0.01;
    let linetick = 0.001;
    /*
        let M = new THREE.Mesh( ATON.Utils.geomUnitSphere, ATON.MatHub.getMaterial("measurement"));
        M.position.copy(P);
        M.scale.set(s,s,s);
        SUI.gMeasures.add(M);
    */

    // First time
    if (SUI._prevMPoint === undefined) {
        SUI._prevMPoint = P;

        let mlArr = SUI._measLine.geometry.attributes.position.array;
        mlArr[0] = P.x;
        mlArr[1] = P.y;
        mlArr[2] = P.z;
        //mlArr[3] = P.x;
        //mlArr[4] = P.y;
        //mlArr[5] = P.z;

        //SUI._measLine.geometry.attributes.position.needsUpdate = true;

        //SUI._measLine.visible = true;
        return undefined;
    }

    SUI._measLine.visible = false;

    // Second point
    let d = SUI._prevMPoint.distanceTo(P);
    //console.log(d);

    s *= d;
    linetick *= d;

    let A = new THREE.Mesh(ATON.Utils.geomUnitCube, ATON.MatHub.getMaterial("measurement"));
    A.position.copy(SUI._prevMPoint);
    A.scale.set(s, s, s);
    SUI.gMeasures.add(A);

    let B = new THREE.Mesh(ATON.Utils.geomUnitCube, ATON.MatHub.getMaterial("measurement"));
    B.position.copy(P);
    B.scale.set(s, s, s);
    SUI.gMeasures.add(B);

    let scale = d * 2.0; //1.5; //Math.max(d*1.5, 1.0);

    //let gLine = new THREE.CylinderBufferGeometry( linetick,linetick, d, 4 );
    let gLine = new THREE.BufferGeometry().setFromPoints([SUI._prevMPoint, P]);

    SUI.gMeasures.add(new THREE.Line(gLine, ATON.MatHub.getMaterial("measurement")));

    let L = new SUI.Label();
    L.setBaseColor(ATON.MatHub.colors.white).setTextColor(ATON.MatHub.colors.black);

    L.userData.vStart = new THREE.Vector3();
    L.userData.vEnd = new THREE.Vector3();
    L.userData.vStart.copy(SUI._prevMPoint);
    L.userData.vEnd.copy(P);

    L.userData.vSEdir = new THREE.Vector3();
    L.userData.vSEdir.x = L.userData.vStart.x - L.userData.vEnd.x;
    L.userData.vSEdir.y = L.userData.vStart.y - L.userData.vEnd.y;
    L.userData.vSEdir.z = L.userData.vStart.z - L.userData.vEnd.z;
    L.userData.vSEdir.normalize();

    L.setPosition(
        (SUI._prevMPoint.x + P.x) * 0.5,
        (SUI._prevMPoint.y + P.y) * 0.5,
        (SUI._prevMPoint.z + P.z) * 0.5,
    );

    L.setScale(scale).setText(ATON.Utils.getHumanReadableDistance(d)); // setScale(d*2.0)

    SUI.gMeasures.add(L);

    SUI._measLabels.push(L);

    // return obj
    let R = {};
    R.A = L.userData.vStart; //SUI._prevMPoint.clone();
    R.B = L.userData.vEnd;   //P.clone();

    SUI._prevMPoint = undefined;

    return R;
};

SUI.clearMeasurements = () => {
    SUI.gMeasures.removeChildren();
    SUI._measLabels = [];
};

SUI._updateMeasurements = () => {
    if (SUI._measLabels.length <= 0) return;
    /*
        const eye = ATON.Nav.getCurrentEyeLocation();
        let v  = new THREE.Vector3();
        let dn = new THREE.Vector3();
        let op = new THREE.Vector3();
    */
    for (let ml in SUI._measLabels) {
        let L = SUI._measLabels[ml];
        L.orientToCamera();

        // Orientation based on segment - TODO: improve
        /*
                let A = L.userData.vStart;
                let B = L.userData.vEnd;
                let D = L.userData.vSEdir;

                v.crossVectors(D, ATON.Nav._vDir);
                dn.crossVectors(D, v);

                op.set(
                    L.position.x + dn.x,
                    L.position.y + dn.y,
                    L.position.z + dn.z
                );

                L.lookAt(op);
        */
    }
    /*
        v = null;
        dn = null;
        op = null;
    */
};

SUI.addNodeToCamera = (id, positions) => {
    // console.log("ID: ", id)
    if (ATON.getUINode(id)) {
        let childCheck = false;
        for (let child in ATON.Nav._camera.children) {
            // console.log("CHILD: ", child)
            if (ATON.Nav._camera.children[child].nid === id) {
                childCheck = true;
            }
        }
        if (!childCheck){
            // let cameraPos = ATON.Nav._currPOV.pos
            let panel = ATON.getUINode(id)
            ATON.Nav._camera.add(panel)
            panel.setPosition(positions.x, positions.y, positions.z)
        }
    }
}

// Main update routine
SUI.update = () => {

    if (ATON.Nav.isTransitioning() || ATON._bPauseQuery) {
        SUI.infoNode.visible = false;
        return;
    }
    /*
        SUI._sync = (SUI._sync+1) % 10;
        if (SUI._sync===0){
            ThreeMeshUI.update();
            //console.log("sync");
        }
    */

    // Meas-line indicator
    if (SUI._prevMPoint) {
        if (ATON._queryDataScene) {
            let mlArr = SUI._measLine.geometry.attributes.position.array;
            mlArr[3] = ATON._queryDataScene.p.x;
            mlArr[4] = ATON._queryDataScene.p.y;
            mlArr[5] = ATON._queryDataScene.p.z;
            SUI._measLine.geometry.attributes.position.needsUpdate = true;
        }

        SUI._measLine.visible = true;
    } else {
        SUI._measLine.visible = false;
    }

    // Selector
    if (ATON._queryDataScene && !ATON.Nav._bInteracting) {
        if (SUI._bShowSelector) SUI.mainSelector.visible = true;

        SUI.mainSelector.position.x = ATON._queryDataScene.p.x + SUI._selOffset.x;
        SUI.mainSelector.position.y = ATON._queryDataScene.p.y + SUI._selOffset.y;
        SUI.mainSelector.position.z = ATON._queryDataScene.p.z + SUI._selOffset.z;
    } else {
        SUI.mainSelector.visible = false;
        //SUI.fpTeleport.visible = false;
    }

    // SemIcons
    if (SUI.gSemIcons) {
        if (ATON.Nav._bInteracting) {
            SUI.gSemIcons.hide();
        } else {
            if (ATON._hoveredSemNode === undefined) {
                SUI.gSemIcons.show();
            }
        }
    }

    // Teleport SUI
    if ((!ATON.Nav.isOrbit() || ATON.XR._bPresenting) && ATON.Nav.currentQueryValidForLocomotion()) {
        SUI.fpTeleport.visible = true;
        SUI.fpTeleport.position.copy(ATON._queryDataScene.p);
    } else {
        SUI.fpTeleport.visible = false;
    }

    // Pointer-line
    if (ATON.XR._pointerLineMesh) {

        let d = 0.0;
        if (ATON._queryDataScene) {
            d = ATON._queryDataScene.d;
        }

        if (ATON._queryDataUI && (d <= 0.0 || ATON._queryDataUI.d < d)) {
            d = ATON._queryDataUI.d;
            SUI.mainSelector.visible = false;
            SUI.fpTeleport.visible = false;
        }

        // console.log("d " + d)

        // QUESTO D dice quando sto puntando verso il terreno, se è 0 sto puntando altrove
        if (d > 0.0) {
            ATON.XR._pointerLineMesh.visible = true;
            ATON.XR._pointerLineMesh.scale.set(1, 1, d);
        } else {
            ATON.XR._pointerLineMesh.visible = false;
        }
    }

    // Measures
    SUI._updateMeasurements();

    // InfoNode (semantics)
    if (ATON._queryDataSem) {

        // Immersive Session
        if (ATON.XR._bPresenting) {
            // console.log("CCCC")
            if (SUI.bShowInfo) SUI.infoNode.visible = true;

            if (ATON.XR.controller0) {
                SUI.infoNode.position.copy(ATON.XR.controller0pos); //.lerpVectors(ATON._queryDataSem.p, ATON.XR.controller0pos, 0.8);
                SUI.infoNode.position.x -= (ATON.XR.controller0dir.x * 0.1);
                SUI.infoNode.position.y -= (ATON.XR.controller0dir.y * 0.1); // + 0.1;
                SUI.infoNode.position.z -= (ATON.XR.controller0dir.z * 0.1);
                SUI.infoNode.setScale(1.0);
            } else {
                SUI.infoNode.position.lerpVectors(ATON._queryDataSem.p, ATON.Nav._currPOV.pos, 0.1);
                SUI.infoNode.setScale(ATON._queryDataSem.d * SUI._labelScaleVR);
            }

            SUI.infoNode.orientToCamera();
        }
        /*
                // Default session
                else {
                    SUI.infoNode.position.lerpVectors(ATON._queryDataSem.p, ATON.Nav._currPOV.pos, 0.5);
                    const ls = ATON._queryDataSem.d * (ATON.Nav._currPOV.fov / SUI._labelScale);
                    SUI.infoNode.setScale(ls);
                }
                SUI.infoNode.orientToCamera();

                if (SUI.bShowInfo) SUI.infoNode.visible = true;
        */

        if (!ATON.Photon._bStreamFocus) SUI.mainSelector.visible = false;
    } else {

        // XPF
        if (ATON.XR._bPresenting && SUI.bShowInfo && ATON._queryDataScene && ATON.XPFNetwork._semCurr !== undefined) {
            SUI.infoNode.position.lerpVectors(ATON._queryDataScene.p, ATON.Nav._currPOV.pos, 0.5);

            const ls = ATON._queryDataScene.d * (ATON.Nav._currPOV.fov / SUI._labelScale);
            SUI.infoNode.setScale(ls);
            SUI.infoNode.orientToCamera();

            SUI.infoNode.visible = true;
        } else {
            SUI.infoNode.visible = false;
        }
    }


    if (SUI.mainSelector.visible && ATON.Photon._bStreamFocus) {
        let ss = SUI._selectorRad * (1.0 + (Math.cos(ATON._clock.elapsedTime * 10.0) * 0.2));
        SUI.mainSelector.scale.set(ss, ss, ss);

        let fp = ATON.getSceneFocalPoint();
        if (fp !== undefined && ATON.plight !== undefined) {
            ATON.enablePointLight();
            ATON.plight.position.copy(fp);
            ATON.plight.distance = SUI._selectorRad * 2.0;
            //fp = null;
        }
    }

    // if (ATON.getUINode("pro")) {
    //     let cameraPos = ATON.Nav._currPOV.pos
    //     // console.log(cameraPos)
    //     let panel = ATON.getUINode("pro")
    //     // console.log("camera", ATON.Nav._camOrbit)
    //
    //     ATON.Nav._camera.add(panel)
    //
    //     // panel.orientToCamera()
    //     // panel.position.copy(cameraPos)
    //     // panel.position.y = cameraPos.y + 0.5
    //     panel.setPosition(0, 0, -1.5)
    //
    //
    // }

    SUI.addNodeToCamera("editModeLabelMessage",
        {"x": 1, "y": 0.4, "z": -1.8})

    SUI.addNodeToCamera("annotationToolbar",
        {"x": 1, "y": 0.4, "z": -1.8})

};

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

export default SUI;