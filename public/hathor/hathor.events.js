// Event handling
//====================================

// import ATON from "../src/ATON";

HATHOR.setupEventHandlers = () => {
    // XR
    ATON.on("XRmode", (b) => {
        HATHOR.resetSelectionMode();
        HATHOR.startRLOG()
    });

    ATON.on("XR_support", (d) => {
        switch (d.type) {
            case 'immersive-vr':
                if (d.v || ATON.Utils.isARsupported()) {
                    $("#btn-xr").show();
                } else {
                    $("#btn-xr").hide();
                }
                break
            case 'immersive-ar':
                if (d.v || ATON.Utils.isVRsupported()) {
                    $("#btn-xr").show();
                } else {
                    $("#btn-xr").hide();
                }
                break
        }
    });

    // Controllers
    ATON.on("XRcontrollerConnected", (c) => {
        switch (c){
            case ATON.XR.HAND_R:
                console.log("XRcontrollerConnectedRight")
                break
            case ATON.XR.HAND_L:
                console.log("XRcontrollerConnectedLeft")
                ATON.XR.controller1.add(HATHOR.suiToolbar);
                HATHOR.suiToolbar.show();
                break
        }

        //else {
        //    HATHOR.suiToolbar.attachToRoot();
        //    HATHOR.suiToolbar.hide();
        // }
    });

    // XR Select
    ATON.EventHub.clearEventHandlers("XRselectStart");

    ATON.on("XRselect", (c) => {
        // console.log("XRselect")
    });

    ATON.on("XRselectStart", (c) => {
        // console.log("XRselectStart")
        // ATON._mainClick = true;
        // ATON._isXRDragging = true;

        // if (ATON._SUIactivation()) {
        //     return;
        // }

        if (c === ATON.XR.HAND_R) {
            switch (HATHOR._actState) {
                case HATHOR.SELECTION_STD:
                    if (ATON._hoveredSemNode && !ATON._hoveredUI){
                        console.log(`HOVERED SEM NODE: ${ATON._hoveredSemNode}`)
                        ATON.SUI.showAnnotationPopupXR(ATON._hoveredSemNode)
                            .setPosition(4.5, 2.5, -2.3)
                            .setRotation(0.0, 300, 0)
                            .setScale(1.8)
                            .attachToRoot();
                    }
                    else {
                        // HATHOR.toggleSideSemPanel(false);
                        ATON._stdActivation();
                        // let annNode = ATON.getUINode("annPopUp");
                        // if (annNode) annNode.delete();
                    }
                    /*if (ATON._hoveredSemNode) {
                        ATON.SUI.showAnnotationPopupXR(ATON._hoveredSemNode)
                            .setPosition(4.5, 2.5, -2.3)
                            .setRotation(0.0, 300, 0)
                            .setScale(1.8)
                            .attachToRoot();
                    } else {
                        let annNode = ATON.getUINode("annPopUp");
                        if (annNode) annNode.delete();
                        // HATHOR.toggleSideSemPanel(false);
                        ATON._stdActivation();
                    }*/
                    // ATON._stdActivation();
                    //ATON.XR.teleportOnQueriedPoint();
                    break;
                case HATHOR.SELECTION_MEASURE:
                    HATHOR.measure();
                    HATHOR.measurePoints += 1;
                    if (HATHOR.measurePoints === 2){
                        HATHOR.cancelCurrentTask();
                        HATHOR.measurePoints = 0;
                    }
                    break;
                case HATHOR.SELECTION_ADDSPHERESHAPE:
                    ATON.SemFactory.stopCurrentConvex();
                    // HATHOR.popupAddSemantic(ATON.FE.SEMSHAPE_SPHERE);
                    let p = ATON._queryDataScene.p;
                    ATON.SUI.createAnnotationDataBlock(0, p) // 0 = ATON.FE.SEMSHAPE_SPHERE
                        .setPosition(4.5, 2.5, -2.3)
                        .setRotation(0.0, 300, 0)
                        .setScale(1.8)
                        .attachToRoot();
                    HATHOR.resetSelectionMode();
                    break
                case HATHOR.SELECTION_ADDCONVEXPOINT:
                    if (ATON.SemFactory.addSurfaceConvexPoint()) {
                        ATON.SUI.createAnnotationDataBlock(1) // 0 = ATON.FE.SEMSHAPE_SPHERE
                            .setPosition(4.5, 2.5, -2.3)
                            .setRotation(0.0, 300, 0)
                            .setScale(1.8)
                            .attachToRoot();
                        HATHOR.resetSelectionMode();
                    }
                    //TODO: ...or addConvecPoint() on selector location
                    break;
                case HATHOR.SELECTION_EDITNODES:
                    // TODO
                    ATON._stdActivation();
                    break;

                case HATHOR.SELECTION_ANNOTATION:
                    // TODO
                    ATON._stdActivation();
                    break;
                case HATHOR.REMOVE_OBJECT:
                    HATHOR.removeMesh();
                    break
            }
        }
    });

    ATON.on("XRselectEnd", (c) => {
        // ATON._mainClick = false;
        // ATON._isXRDragging =false;
    });

    ATON.on("XRcancelTask", (c) => {
        console.log("XRcancelTask")
        HATHOR.cancelCurrentTask()
    });

    ATON.on("XRdblClick", (c) => {
        console.log("XRdblClick")
        // HATHOR.cancelCurrentTask()
        const event = new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        document.querySelector('canvas').dispatchEvent(event)
    });

    // Immersive Sessions
    /*ATON.on("XRcontrollerConnected", (c) => {
        console.log("XRcontrollerConnected")

        // CON QUESTA LA TOOLBAR SEGUE IL BRACCIO SINISTRO
        if (c === ATON.XR.HAND_L) {
            ATON.XR.controller1.add(HATHOR.suiToolbar);
            HATHOR.suiToolbar.show();
        }

        //else {
        //    HATHOR.suiToolbar.attachToRoot();
        //    HATHOR.suiToolbar.hide();
        // }
    });*/


    // Photon
    ATON.on("Photon_Connected", () => {
        HATHOR.setupPhotonEventHandlers();

        ATON.FE.checkAuth((d) => {
            if (d.sketchfab_token !== undefined && d.sketchfab_token !== "") {
                ATON.setAPIToken("sketchfab", d.sketchfab_token);

                HATHOR.addSketchfab()
            }
        });
    });

    ATON.on("SceneJSONLoaded", () => {
        if (HATHOR.paramPhoton) {
            if (HATHOR.paramPhoton.length > 4) {
                ATON.Photon.setAddress(HATHOR.paramPhoton);
            }
            ATON.Photon.connect();

            //HATHOR._bVRCreq = true;
        }
        //if (HATHOR._bVRCreq) ATON.Photon.connect();

        if (ATON.SceneHub.getDescription()) {
            HATHOR.popupSceneInfo();
        }

        HATHOR.uiUpdatePOVs();

        // page title
        document.title = (ATON.SceneHub.currData.title) ? ATON.SceneHub.currData.title : ATON.SceneHub.currID;
        //if (ATON.SceneHub.currData.description) $('meta[name="description"]').attr("content", ATON.SceneHub.currData.description);

        // ATON
        //     .getSceneNode("sketchfab_point")
        //     // .setPosition(0, 1, 4)
        //     .setDefaultAndHighlightMaterials("black", "red")
        //     .highlightOnHover()
        // // .attachToRoot()
    });

    /*
    ATON.on("AllNodeRequestsCompleted", ()=>{
        if (HATHOR._bVRCreq){
            HATHOR._bVRCreq = false;

            setTimeout(()=>{
                ATON.Photon.connect();
            }, 1000);
        }
    });
    */

    // Auth
    ATON.on("Login", (d) => {
        //$('#idAuthTools').show();
        $('#btn-sketchfab-logo').show()
        if (HATHOR.paramPhoton === undefined) {
            return;
        }
        ATON.Photon.setUsername(d.username);

        if (d.sketchfab_token !== undefined && d.sketchfab_token !== "") {
            ATON.setAPIToken("sketchfab", d.sketchfab_token);

            HATHOR.addSketchfab()
        }

        HATHOR.suiSetup()
    });

    ATON.on("Logout", () => {
        $('#idAuthTools').hide();
        $('#btn-sketchfab-logo').hide()

        ATON.FE.uiSetEditMode(false, "idTopToolbar");

        ATON.setAPIToken("sketchfab", null);

        HATHOR.suiSetup()
        HATHOR.removeSketchfab()
    });


    ATON.on("FE_NodeSwitch", (node) => {

        let E = {};
        if (node.type === ATON.NTYPES.SEM) {
            E.semanticgraph = {};
            E.semanticgraph.nodes = {};
            E.semanticgraph.nodes[node.nid] = {};
            E.semanticgraph.nodes[node.nid].show = node.value;
        } else {
            E.scenegraph = {};
            E.scenegraph.nodes = {};
            E.scenegraph.nodes[node.nid] = {};
            E.scenegraph.nodes[node.nid].show = node.value;
        }

        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        //ATON.Photon.fireEvent("AFE_AddSceneEdit", E); // FIXME: check why this is not working
        ATON.Photon.fireEvent("AFE_NodeSwitch", {nid: node.nid, type: node.type, value: node.value});

        //console.log(E);
    });

    // ATON.on("SemanticNodeLeave", (semid) => {
    //     let S = ATON.getSemanticNode(semid);
    //     if (S === undefined) {
    //         return;
    //     }
    //
    //     S.restoreDefaultMaterial();
    //     //$('canvas').css({ cursor: 'default' });
    // });
    // ATON.on("SemanticNodeHover", (semid) => {
    //     let S = ATON.getSemanticNode(semid);
    //     if (S === undefined) {
    //         return;
    //     }
    //
    //     S.highlight();
    //     //$('canvas').css({ cursor: 'crosshair' });
    // });


    ATON.on("MouseRightButton", () => {
        console.log("Mouse Right Button")
        // console.log("hovered", ATON._hoveredSemNode)
        //
        // if (ATON._hoveredSemNode) {
        //     HATHOR.sideSemDescription(ATON._hoveredSemNode);
        // }
    });

    ATON.on("Tap", (e) => {
        /*
                if (HATHOR._bSidePanel){
                    HATHOR.toggleSideSemPanel(false);
                    return;
                }
        */
        // if (ATON.Nav._mode === ATON.Nav.MODE_FPW) {
        //     ATON.Nav._controls.lock();
        // }
        switch (HATHOR._actState) {
            case HATHOR.SELECTION_STD:
                if (ATON._hoveredSemNode && !ATON._hoveredUI) {
                    HATHOR.sideSemDescription(ATON._hoveredSemNode);
                } else {
                    HATHOR.toggleSideSemPanel(false);
                }
                break
            case HATHOR.SELECTION_ADDCONVEXPOINT:
                ATON.SemFactory.addSurfaceConvexPoint();
                break
            case HATHOR.SELECTION_ADDSPHERESHAPE:
                ATON.SemFactory.stopCurrentConvex();
                HATHOR.popupAddSemantic(ATON.FE.SEMSHAPE_SPHERE);
                HATHOR.resetSelectionMode();
                break
            case HATHOR.SELECTION_MEASURE:
                HATHOR.measure();
                break
            case HATHOR.SELECTION_EDITNODES:
                // TODO
                break
            case HATHOR.SELECTION_ANNOTATION:
                // TODO
                break
            case HATHOR.REMOVE_OBJECT:
                HATHOR.removeMesh();
                break
        }
    });


    /*
        ATON.on("DoubleTap", (e)=>{
            if (ATON._hoveredSemNode) HATHOR.sideSemDescription(ATON._hoveredSemNode);
        });
    */
    ATON.FE.useMouseWheelToScaleSelector();

    ATON.on("KeyPress", (k) => {
        if (ATON._kModCtrl) {
            switch (k) {
                case "Delete":
                    const node = ATON.getSemanticNode(ATON._hoveredSemNode)
                    if (ATON.SemFactory.deleteSemanticNode(ATON._hoveredSemNode)) {

                        let E = {};
                        E.semanticgraph = {};
                        E.semanticgraph.nodes = {};
                        E.semanticgraph.nodes[ATON._hoveredSemNode] = {};

                        console.log("CANCELLAZIONEEEEEEEE")
                        console.log(E);

                        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);

                        //if (HATHOR.paramVRC === undefined) return;
                        ATON.Photon.fireEvent("AFE_DeleteNode", {
                            t: ATON.NTYPES.SEM, nid: ATON._hoveredSemNode
                        });
                        console.log("NODE CHILDREN 0: ", node.children[0])
                        const stackInfo = {
                            action: (node.isSphereShape) ? "del_sphere" : "del_convex",
                            type: (node.isSphereShape) ? 0 : 1,
                            node: node
                        }
                        ATON.undoStack.push(stackInfo)
                        // console.log("UNDO STACK: ", ATON.undoStack)
                    }
                    break
                // case 'Backspace':
                //     break
                // case "Insert":
                //     break
                case " ":
                case "Space":
                    HATHOR.popupSettings();
                    break
                case "Enter":
                    HATHOR.finalizeCurrentTask();
                    break
                case "Escape":
                    HATHOR.cancelCurrentTask();
                    break
                // case "Shift":
                //     ATON.Nav.setUserControl(false)
                //     break
                // case "Control":
                //     ATON.Nav.setUserControl(false)
                //     break
                // case "y":
                //     ATON.Utils.updateTSetsCamera();
                //     break
                case "g":
                    HATHOR.popupGraphs();
                    break
                case "q":
                    HATHOR.popupExportSemShapes();
                    break
                case "u":
                    ATON.FE.popupUser();
                    break
                case "(":
                    ATON._envMapInt -= 0.5;
                    if (ATON._envMapInt < 0.5) {
                        ATON._envMapInt = 0.5;
                    }
                    console.log(ATON._envMapInt);
                    ATON.updateLightProbes();
                    break
                case ")":
                    ATON._envMapInt += 0.5;
                    console.log(ATON._envMapInt);
                    ATON.updateLightProbes();
                    break
                // case '[':
                //     break
                // case ']':
                //     break
                // case 'w':
                //     if (ATON.Nav._mode === ATON.Nav.MODE_FP) {
                //         ATON.Nav.setMotionAmount(0.5);
                //     }
                //     break
                case "a":
                    ATON.SemFactory.stopCurrentConvex();
                    HATHOR.popupAddSemantic(ATON.FE.SEMSHAPE_SPHERE);
                    break
                case "s":
                    ATON.SemFactory.addSurfaceConvexPoint();
                    break
                case "e":
                    let esemid = ATON._hoveredSemNode;
                    if (esemid !== undefined) {
                        HATHOR.popupAddSemantic(undefined, esemid);
                    } else {
                        HATHOR.popupEnvironment();
                    }
                    break
                case "m":
                    HATHOR.measure();
                    break
                case "c":
                    ATON.FE.popupScreenShot();
                    break
                case "b":
                    ATON.SUI.showSelector(!ATON.SUI._bShowSelector);
                    break
                case "#":
                    let bShadows = !ATON._renderer.shadowMap.enabled;
                    ATON.toggleShadows(bShadows);

                    let E = {};
                    E.environment = {};
                    E.environment.mainlight = {};
                    E.environment.mainlight.shadows = bShadows;

                    ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                    ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                    break
                case "l":
                    ATON.FE.controlLight(true);
                    break
                case "p":
                    HATHOR.addLightProbe();
                    break
                // case 'L':
                //     let D = ATON.Nav.getCurrentDirection();
                //     ATON.setMainLightDirection(D);
                //     let E = {};
                //     E.environment = {};
                //     E.environment.mainlight = {};
                //     E.environment.mainlight.direction = [D.x, D.y, D.z];
                //     ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                //     ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                //     break
                case "v":
                    HATHOR.popupPOV();
                    break
                case "ArrowRight":
                    HATHOR.povNext();
                    break
                case "ArrowLeft":
                    HATHOR.povPrev();
                    break
                case "n":
                    HATHOR.popupNav();
                    break
                // case 'h':
                //     ATON.setWorldScale(ATON._worldScale * 0.5);
                //     break
                //
                // case '^':
                //     ATON.Nav.setFirstPersonControl();
                //     break
                //
                // case 'h':
                //     let hp = ATON.Nav.copyCurrentPOV();
                //
                //     ATON.Nav.setHomePOV(hp);
                //
                //     let E = {};
                //     E.viewpoints = {};
                //     E.viewpoints.home = {};
                //     E.viewpoints.home.position = [hp.pos.x, hp.pos.y, hp.pos.z];
                //     E.viewpoints.home.target = [hp.target.x, hp.target.y, hp.target.z];
                //     E.viewpoints.home.fov = hp.fov;
                //
                //     console.log("Set home POV");
                //     console.log(hp);
                //
                //     ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                //     ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                //
                //     break
                // case 'y':
                //     ATON.XR.switchHands();
                //     break
                // case '.':
                //     ATON.MediaFlow.startMediaStreaming();
                //     break
                // case 'r':
                //     ATON.MediaFlow.startRecording();
                //     break
                case "f":
                    ATON.Photon.setFocusStreaming(true);

                    if (ATON._queryDataScene) {
                        ATON.FX.setDOFfocus(ATON._queryDataScene.d);
                    }
                    break
                // case '5':
                //     // TODO: switch perspective/ortho cam
                //     break
                // case '.':
                //     ATON.FE.controlSelectorScale(true);
                //     break
            }
        }
    })

    ATON.on("KeyUp", (k) => {
        if (ATON._kModCtrl) {
            switch (k) {
                case "w":
                    ATON.Nav.stop();
                    break
                // case '.':
                //     ATON.MediaFlow.stopMediaStreaming();
                //     break
                // case 'r':
                //     ATON.MediaFlow.stopRecording();
                //     break
                case "f":
                    ATON.Photon.setFocusStreaming(false);

                    if (ATON.FX.isPassEnabled(ATON.FX.PASS_DOF)) {
                        let k = ATON.FX.getDOFfocus().toPrecision(ATON.SceneHub.FLOAT_PREC);

                        ATON.SceneHub.sendEdit({
                            fx: {
                                dof: {
                                    f: k
                                }
                            }
                        }, ATON.SceneHub.MODE_ADD);
                    }
                    break
                case "l":
                    ATON.FE.controlLight(false);

                    let D = ATON.getMainLightDirection();

                    let E = {};
                    E.environment = {};
                    E.environment.mainlight = {};
                    E.environment.mainlight.direction = [D.x, D.y, D.z];
                    E.environment.mainlight.shadows = ATON._renderer.shadowMap.enabled;

                    ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                    ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                    break
                case ".":
                    ATON.FE.controlSelectorScale(false);
                    break
                // case "Shift":
                //     ATON.Nav.setUserControl(true);
                //     break
                // case "Control":
                //     ATON.Nav.setUserControl(true);
                //     break
            }
        }
    });

    ATON.on("MainPanoVideo", () => {
        $("#btn-playpause").show();
    });

    // Show/Hide UI on nav interaction
    ATON.on("NavInteraction", b => {
        if (ATON.FE._bPopup) return;

        if (b) {
            $("#idTopToolbar").hide();
            $("#idBottomToolbar").hide();
            $("#idBottomRToolbar").hide();
        } else {
            $("#idTopToolbar").show();
            $("#idBottomToolbar").show();
            $("#idBottomRToolbar").show();
        }
    });

    // handler url changed
    let prevUrl = undefined;
    setInterval(() => {
        const currUrl = window.location.href;
        if (currUrl !== prevUrl) {
            // URL changed
            prevUrl = currUrl;
            console.log(`URL changed to : ${currUrl}`);
            let url = new URL(currUrl);
            HATHOR.sketchfabSearchParam = url.searchParams.get("skSearch");

            HATHOR.newUrlForSketchfab()
        }
    }, 500);

    setInterval(() => {
        const currUrl = window.location.href;
        if (currUrl !== prevUrl) {
            // URL changed
            prevUrl = currUrl;
            console.log(`URL changed to : ${currUrl}`);
            let url = new URL(currUrl);
            HATHOR.sketchfabSearchParam = url.searchParams.get("skSearch");

            HATHOR.newUrlForSketchfab()
        }
    }, 500);


    // setInterval(() => {
    //
    // }, 500)


    //ATON.on("frame", HATHOR._update);
    //setInterval(HATHOR._update, 100);
};

HATHOR.setupPhotonEventHandlers = () => {
    if (HATHOR._bPhotonSetup) {
        return;
    }

    //ATON.Photon.on("VRC_test", (d)=>{ console.log(d); });

    ATON.Photon.on("AFE_DeleteNode", (d) => {
        let nid = d.nid;
        let type = d.t;

        if (nid === undefined) {
            return;
        }

        if (type === undefined) {
            return;
        }

        if (type === ATON.NTYPES.SEM) {
            ATON.SemFactory.deleteSemanticNode(nid);
        }

        if (type === ATON.NTYPES.SCENE){
            ATON.getSceneNode(nid).removeChildren();
        }
    });

    ATON.Photon.on("AFE_ClearMeasurements", () => {
        ATON.SUI.clearMeasurements();
    });

    ATON.Photon.on("AFE_AddSceneEdit", (d) => {
        console.log("ARCO....: ", d);
        ATON.SceneHub.parseScene(d);
    });

    ATON.Photon.on("AFE_NodeSwitch", (d) => {
        let nid = d.nid;

        if (nid === undefined) {
            return;
        }

        let node = undefined;
        if (d.type === ATON.NTYPES.SEM) {
            node = ATON.getSemanticNode(nid);
        } else {
            node = ATON.getSceneNode(nid);
        }

        if (node === undefined) {
            return;
        }

        node.toggle(d.value);
    });

    ATON.Photon.on("NodeNewPosition", (data) => {
        let nid = data.nid;
        let newPos = data.pos;

        const node = ATON.getSceneNode(nid)

        if (node) {
            node.setPosition(newPos.x, newPos.y, newPos.z, false)
        }
    });

    ATON.Photon.on("NodeNewRotation", (data) => {
        let nid = data.nid;
        let newRot = data.rot;
        console.log("NIID: ", nid)

        let rotNode = ATON.getSceneNode(nid)
        if (rotNode.isImported){
            let pivotNode = rotNode.parent
            pivotNode.setRotation(newRot.x, newRot.y, newRot.z, false)
        }
        else {
            rotNode.setRotation(newRot.x, newRot.y, newRot.z, false)
        }
    });

    ATON.Photon.on("NodeNewScale", (data) => {
        let nid = data.nid;
        let newScale = data.scale;

        let scaleNode = ATON.getSceneNode(nid)
        if (scaleNode.isImported){
            let pivotNode = scaleNode.parent
            pivotNode.setScale(newScale.x, newScale.y, newScale.z, false)
        }
        else {
            scaleNode.setScale(newScale.x, newScale.y, newScale.z, false)
        }
    });

    ATON.Photon.on("NodeChangeMaterial", (data) => {
        let nid = data.nid;
        let material_id = data.material_id;

        let node = ATON.getSceneNode(nid)

        if (node) {
            node.setMaterialById(material_id)
        }
    });

    ATON.Photon.on("RemoveSceneNode", (data) => {
        // console.log("EVENTO RICEVUTOOOOOOOOOOOOO")
        const remNode = ATON.getSceneNode(data.node);
        if (remNode) remNode.delete();
    })

    // We handle incoming remote items placement fom other users
    ATON.Photon.on("sketchfabSpawn", (data) => {
        let node = data.node.object;
        let spawn_node = data.spawnNode;
        // console.log("NODOOOOOOOOOOO: ", node)

        if (spawn_node !== undefined) {
            // console.log("SPAWN NODE: ", spawn_node)
            node.attachTo(spawn_node);
        }
        else node.attachToRoot()
    });

    ATON.Photon.on("pdfSpawn", (data) => {
        let indexPDF = data.indexPDF;
        let user_id = data.userId
        let numPages = data.numPages

        // console.log("JJ:", data)
        HATHOR.actual_number_of_page = indexPDF
        HATHOR.number_of_pages = numPages

        HATHOR.generateOrLoadPDF(indexPDF, user_id, false)
    })

    ATON.Photon.on("pdfClose", (data) => {
        ATON.getUINode("PDFVerticalContainer").hide()
        HATHOR.dictPDFPages = {}
        HATHOR.actual_number_of_page = 0
        HATHOR.number_of_pages = 0
    })

    // We handle incoming remote items placement fom other users
    ATON.Photon.on("nodeSpawn", (data) => {
        let G = ATON.getOrCreateSceneNode(data.name).removeChildren();

        let urls = data.urls;
        // console.log("UUUUUUUUUUURLS: ", urls);

        if (urls) {
            if (Array.isArray(urls)) {
                urls.forEach(u => {
                    //ATON.createSceneNode().load(u).attachTo(G);
                    G.load(u);
                });
            } else {
                G.load(urls);
            }
        }

        G.setPosition(data.points.point.x, 0, data.points.point.z).setEditable().attachToRoot().show();
    });

    ATON.Photon.on("StartEditNode", (nid) => {
        ATON.SceneHub.nowEditingNodes.push(nid)
    })

    ATON.Photon.on("StopEditNode", (nid) => {
        ATON.SceneHub.nowEditingNodes = ATON.SceneHub.nowEditingNodes.filter(el => el !== nid)
    })

    ATON.Photon.on("NewAnnotationPoint", (p) => {
        ATON.SemFactory.writeAnnotation(p, false)
    })

    ATON.Photon.on("StopActualAnnotation", () => {
        ATON.SemFactory.newAnnotation()
    })

    ATON.Photon.on("AFE_LightSwitch", (b) => {
        ATON.toggleMainLight(b);
    });

    ATON.on("Photon_IDassigned", (uid) => {
        $("#btn-talk").show();
    });
    ATON.on("Photon_Disconnected", () => {
        $("#btn-talk").hide();
    });

    ATON.on("Photon_UVideo", (data) => {
        let b64 = data.video;
        let uid = data.uid;

        let A = ATON.Photon.avatarList[uid];
        if (!A) {
            return;
        }

        if (!A._elVStream) {
            A.realizeStreamPanel();
            A.userlabelnode.add(A.getStreamPanel());
        } else {
            A.toggleStreamPanel(true);
        }

        A._elVStream.src = b64;
        if (A._elVStream.paused) {
            A._elVStream.play();
        }
    });

    ATON.on("Photon_SceneState", (sstate) => {
        let snodes = sstate.snodes
        let annotationPoints = sstate.annotationPoints
        let annotationsIndex = sstate.annotationsIndex
        // console.log("SNODES: ", snodes)
        // console.log(ATON.snodes)
        for (let node in snodes) {
            let n = snodes[node]
            let pos = n.pos
            let rot = n.rot
            let scale = n.scale
            let materialId = n.materialId

            // console.log("LU NODU MALEDETTU: ", node)

            let sceneNode = ATON.getOrCreateSceneNode(node)
                .setPosition(pos.x)
                .setRotation(rot.x)
                .setScale(scale.x)

            if (materialId !== "") {
                sceneNode
                    .setMaterialById(materialId)
            }
        }

        ATON.SemFactory.annotationsIndex = annotationsIndex

        annotationPoints.forEach(ann => {
            ATON.SemFactory.annotationPoints[annotationsIndex] = []

            ann.forEach(point => {
                ATON.SemFactory.writeAnnotation(point, false)
            })
        })
    })

    HATHOR._bPhotonSetup = true;
};

