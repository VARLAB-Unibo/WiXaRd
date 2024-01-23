/*
    ATON immersive XR module

    author: bruno.fanini_AT_gmail.com

===========================================================*/

import ATON from "./ATON";


// let uri;
// const motionControllers = {};

/**
 ATON Immersive XR
 @namespace XR
 */
let XR = {};

XR.STD_TELEP_DURATION = 0.03; // Teleport duration
XR.HAND_R = 0;
XR.HAND_L = 1;

XR.MOBILE_DENSITY_F = 0.5;
XR.MAX_QUERY_DISTANCE = 40.0; // Max distance query in first person (XR session)


//Initializes XR component
XR.init = () => {
    // uri = ATON.PATH_PROFILESLIST;
    ATON._renderer.xr.enabled = true;
    ATON._renderer.xr.setReferenceSpaceType('local');

    // WebXR density
    if (ATON.device.isMobile) {
        ATON._renderer.xr.setFramebufferScaleFactor(ATON._stdpxd * XR.MOBILE_DENSITY_F);
    } else {
        ATON._renderer.xr.setFramebufferScaleFactor(ATON._stdpxd);
    }

    XR._bPresenting = false; // true if we are presenting (immersive VR or AR)
    XR.currSession = null;
    XR._sessionType = "immersive-vr";
    XR._bReqPresenting = false;

    XR.rig = new THREE.Group();
    //XR.rig.position.set(0,0,0);
    XR.rig.add(ATON.Nav._camera);
    ATON._rootUI.add(XR.rig);

    //XR.hmdOri = new THREE.Quaternion();
    //XR.hmdPos = new THREE.Vector3();

    XR._cam = undefined;

    XR._currPos = XR.rig.position; //new THREE.Vector3();
    XR._fromPos = new THREE.Vector3();
    XR._reqPos = new THREE.Vector3();

    XR.gControllers = undefined;

    XR.controller0 = undefined;
    XR.controller1 = undefined;

    XR.controller0pos = new THREE.Vector3();
    XR.controller1pos = new THREE.Vector3();
    XR.controller0dir = new THREE.Vector3();
    XR.controller1dir = new THREE.Vector3();

    XR._lastPosR = undefined;
    XR._lastPosL = undefined;

    XR._pointerLineGeom = undefined;
    XR._pointerLineMesh = undefined;

    XR.gpad0 = undefined;
    XR.gpad1 = undefined;

    XR._urlHand = ATON.PATH_RES + "models/hand/hand.glb";
    XR._urlHTCViveController = ATON.PATH_RES + "models/controllers/HTCViveController.glb";
    // XR._urlHand = ATON.PATH_RES + "models/controllers/controllers.glb";

    // // Base ev
    // ATON.on("XRselect", (c) => {
    //     // ATON.Photon.log("TEST SELECT - Controller " + c);
    //     // ATON.Photon.log("----")
    // });
    //
    // ATON.on("XRselectStart", (c) => {
    //     // ATON.Photon.log("TEST SELECT START" + c)
    //     // ATON.Photon.log("----")
    //     if (c === XR.HAND_R) {
    //         // console.log("XRselectStart")
    //         ATON._stdActivation();
    //
    //         //XR.defaultSelectHandler(c);
    //     }
    // });
    // ATON.on("XRselectEnd", (c) => {
    //     ATON._mainClick = false;
        //ATON.Nav.stop();
        //console.log("Sel end "+c);
        // ATON.Photon.log("TEST SELECT END " + c)
        // ATON.Photon.log("----")
    // });
    //
    // ATON.on("XRsqueeze", (c) => {
    //     // ATON.Photon.log("TEST SQUEEZE")
    //     // ATON.Photon.log("----")
    // });

    ATON.on("XRsqueezeStart", (c) => {
        // ATON.Photon.log("TEST SQUEEZE START")
        // ATON.Photon.log("----")

        console.log("SQUEEZE START")

        if (c === XR.HAND_R) {
            ATON.Photon.setFocusStreaming(true);
            console.log("SQUEEZEEEEE RIGHT START")
        }

        //if (c === XR.HAND_L) ATON._bPauseQuery = true;
        //console.log("Squeeze "+c);
    });

    ATON.on("XRsqueezeEnd", (c) => {
        // ATON.Photon.log("TEST SQUEEZE END")
        // ATON.Photon.log("----")
        console.log("SQUEEZE END")

        if (c === XR.HAND_R) {
            console.log("SQUEEZEEEEE RIGHT END")
            ATON.Photon.setFocusStreaming(false);
        }

        //if (c === XR.HAND_L) ATON._bPauseQuery = false;
    });

    ATON.on("Photon_IDassigned", (uid) => {
        let rh = ATON.getUINode("Rhand");
        let lh = ATON.getUINode("Lhand");

        let avMats = ATON.MatHub.materials.avatars;
        let am = avMats[uid % avMats.length];
        if (lh) {
            lh.setMaterial(am);
        }
        if (rh) {
            rh.setMaterial(am);
        }
    });
};

/**
 Set session type
 @param {string} type - Can be "immersive-vr" or "immersive-ar"
 */
XR.setSessionType = (type) => {
    if (type === undefined) {
        return;
    }

    if (type !== "immersive-vr" && type !== "immersive-ar") {
        return;
    }

    XR._sessionType = type;
    console.log("Session type: " + type);
};

/**
 Return true if we are presenting (immersive VR or AR)
 @returns {boolean}
 */
XR.isPresenting = () => {
    return XR._bPresenting;
};

XR.teleportOnQueriedPoint = () => {
    if (!ATON.Nav.currentQueryValidForLocomotion()) {
        return false;
    }

    const P = ATON._queryDataScene.p;
    //const N = ATON._queryDataScene.n;

    // FIXME: height offset needed for "local", fill this automatically
    ATON.Nav.requestPOV(new ATON.POV().setPosition(P.x, P.y + ATON.userHeight, P.z), XR.STD_TELEP_DURATION);
    //ATON.Nav.requestPOV( new ATON.POV().setPosition(P.x, P.y, P.z), XR.STD_TELEP_DURATION );

    return true;
};

// Helper routine to setup a ray-caster
XR.setupQueryRay = (rc) => {
    if (rc === undefined) {
        return;
    }

    // We have at least one 6DOF controllers
    if (XR.controller0) {
        rc.set(XR.controller0pos, XR.controller0dir);
    } else { // else use HMD-aligned query
        rc.set(ATON.Nav.getCurrentEyeLocation(), ATON.Nav.getCurrentDirection());
    }
};

/**
 Set reference-space location (not the actual HMD camera location).
 This can be used to move around the user, given a proper locomotion technique
 @param {THREE.Vector3} p - the new location of reference space
 */
XR.setRefSpaceLocation = (p) => {
    XR.rig.position.copy(p);
};

// Right
XR._setupControllerR = (C, bAddRep) => {
    if (XR.controller0) {
        return;
    }

    XR.controller0 = C;
    console.log("R controllers");

    // Main trigger
    C.addEventListener('selectstart', (e) => {
        const ts = Date.now()
        if (ts - ATON._lastTimeStamp <= 300 && ATON.T1Click) {
            ATON._mainClick = false;
            ATON.T1Click = false;
            ATON.T2Click = true;
        }
        else if (ts - ATON._lastTimeStamp <= 300 && ATON.T2Click) {
            ATON._mainClick = false;
            ATON.T2Click = false;
            ATON.T3Click = true;
        }
        else if (ts - ATON._lastTimeStamp <= 300 && ATON.T3Click) {
            ATON._mainClick = false;
            ATON.T3Click = false;
            ATON.T4Click = true;
        }
        else {
            ATON._mainClick = true;
            ATON.T1Click = true;
            ATON._isXRDragging = true;
            ATON.T2Click = false;
            ATON.T3Click = false;
            ATON.T4Click = false;
            ATON._startInterval = true;
            if (ATON._hoveredUI) {
                const uiNode = ATON.getUINode(ATON._hoveredUI);
                ATON._dragControls.dispatchEvent({type: 'drag', object: uiNode})
            }
        }
        //if (XR._handleUISelection()) return;
        ATON._lastTimeStamp = ts;
        if (ATON._startInterval) {
            ATON._startInterval = false;
            setTimeout(() => {
                if (ATON.T1Click) {
                    ATON.fireEvent("XRselectStart", XR.HAND_R);
                    ATON.T1Click = false;
                }
                else if (ATON.T2Click) {
                    if (HATHOR._actState === HATHOR.SELECTION_EDITNODES) {
                        console.log(`HOVERED NODE: ${ATON._hoveredSceneNode}`)
                        const node = ATON.getSceneNode(ATON._hoveredSceneNode)
                        if (node.editable) {
                            node.setNowEditing(true)
                            ATON.actualEditingNode = node;
                        }
                    }
                    else {
                        const myEvent = new MouseEvent('dblclick', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        ATON._renderer.domElement.dispatchEvent(myEvent)
                        ATON.fireEvent("XRdblClick", XR.HAND_R);
                    }
                    ATON.T2Click = false;
                }
                else if (ATON.T3Click) {
                    console.log("THREE CLICKS")
                    ATON.fireEvent("XRcancelTask", XR.HAND_R)
                    // HATHOR.cancelCurrentTask()
                    ATON.T3Click = false;
                }
                else if (ATON.T4Click) {
                    console.log("FOUR CLICKS")
                    ATON.T4Click = false;
                }
                else {
                    console.log("NO CLICK")
                }
                ATON._firstTriggerClick = false;
            }, 900)
        }
        // console.log(`ONE CLICK: ${ATON.T1Click}`)
        // console.log(`TWO CLICKS: ${ATON.T2Click}`)
        // console.log(`THREE CLICKS: ${ATON.T3Click}`)
        // console.log(`FOUR CLICKS: ${ATON.T4Click}`)
        // ATON.fireEvent("XRselectStart", XR.HAND_R);
    });

    /*C.addEventListener('select', () => {
        if (ATON._hoveredUI) {
            const uiNode = ATON.getUINode(ATON._hoveredUI);
            ATON._dragControls.dispatchEvent({type: 'drag', object: uiNode})
        }
    })*/

    C.addEventListener('selectend', () => {
        ATON._mainClick = false
        ATON._isXRDragging = false;
        if (ATON._hoveredUI) {
            const uiNode = ATON.getUINode(ATON._hoveredUI);
            ATON._dragControls.dispatchEvent({type: 'dragend', object: uiNode})
        }
        if (ATON.SemFactory.nowAnnotating) {
            ATON.SemFactory.newAnnotation()
            ATON.Photon.fireEvent("StopActualAnnotation")
            // console.log("SEMFACTORY AnnotationPOINTS: ", SemFactory.annotationPoints)
            // console.log("SEMFACTORY Annotation Index: ", SemFactory.annotationsIndex)
            // console.log("Last Annotation Points: ", SemFactory.annotationPoints[SemFactory.annotationsIndex - 1])
            // console.log("Last Annotation Data: ", SemFactory.aPoints[SemFactory.annotationsIndex - 1])
            // console.log("Annotation uuid: ", SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid)
            // console.log("Color: ", SemFactory.annotationColor)
            // console.log("Width: ", SemFactory.annotationWidth)
            let E = {};
            E.semanticgraph = {};
            E.semanticgraph.nodes = {};
            E.semanticgraph.nodes[SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid] = {};

            E.semanticgraph.nodes[SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid].manualshapes = []
            E.semanticgraph.nodes[SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid].colors = []
            E.semanticgraph.nodes[SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid].widths = []

            if (SemFactory.nowWritingAnnotation) {
                const Pts = [];
                for (let point in SemFactory.annotationPoints[SemFactory.annotationsIndex - 1]) {
                    // console.log(SemFactory.annotationPoints[SemFactory.annotationsIndex - 1][point])
                    const p = SemFactory.annotationPoints[SemFactory.annotationsIndex - 1][point]
                    Pts.push(p.x);
                    Pts.push(p.y);
                    Pts.push(p.z);
                }
                E.semanticgraph.nodes[SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid].manualshapes.push(Pts);
                E.semanticgraph.nodes[SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid].colors.push(SemFactory.annotationColors[SemFactory.annotationsIndex - 1]);
                E.semanticgraph.nodes[SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid].widths.push(SemFactory.annotationWidths[SemFactory.annotationsIndex - 1]);

                E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);
                E.semanticgraph.edges["."].pop("manual_ann" + SemFactory.annotationsIndex);

                console.log("E: ", E);

                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                const stackInfo = {
                    action: "add_manual",
                    point: SemFactory.annotationPoints[SemFactory.annotationsIndex - 1],
                    annId: SemFactory.aPoints[SemFactory.annotationsIndex - 1].nid,
                    color: SemFactory.annotationColors[SemFactory.annotationsIndex - 1],
                    width: SemFactory.annotationWidths[SemFactory.annotationsIndex - 1],
                    index: SemFactory.annotationsIndex - 1,
                    node: SemFactory.aPoints[SemFactory.annotationsIndex - 1]
                }
                ATON.undoStack.push(stackInfo);
                // console.log("UNDO STACK: ", ATON.undoStack)
            } else if (SemFactory.nowErasingAnnotation) {
                console.log("E: ", E);
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);
            }
            ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        }
        // ATON.T1Click = false;
        ATON.fireEvent("XRselectEnd", XR.HAND_R);
        // console.log(`MAIN CLICK: ${ATON._mainClick}`)
    });

    // TODO aggiunta da me, funziona per il magic leap quando seleziono
    C.addEventListener("select", () => {
        // ATON._mainClick = true
        // ATON.fireEvent("XRselect", XR.HAND_R);
    })

    // Squeeze
    C.addEventListener('squeeze', () => {
        ATON.fireEvent("XRsqueeze", XR.HAND_R);
    });

    C.addEventListener('squeezestart', () => {
        console.log("SQUEEZE START BASSO LIVELLO")
        ATON.fireEvent("XRsqueezeStart", XR.HAND_R);
    });
    C.addEventListener('squeezeend', () => {
        console.log("SQUEEZE END BASSO LIVELLO")
        ATON.fireEvent("XRsqueezeEnd", XR.HAND_R);
    });

    XR.setupControllerUI(XR.HAND_R, bAddRep);

    ATON.fireEvent("XRcontrollerConnected", XR.HAND_R);
};

// Left
XR._setupControllerL = (C, bAddRep) => {
    if (XR.controller1) {
        return;
    }

    XR.controller1 = C;
    console.log("L controllers");

    // Main trigger
    C.addEventListener('selectstart', () => {
        //if (XR._handleUISelection()) return;
        ATON.fireEvent("XRselectStart", XR.HAND_L);
    });
    C.addEventListener('selectend', () => {
        ATON.fireEvent("XRselectEnd", XR.HAND_L);
    });
    C.addEventListener("select", () => {
        ATON.fireEvent("XRselect", XR.HAND_L);
    })

    // Squeeze
    C.addEventListener('squeezestart', () => {
        ATON.fireEvent("XRsqueezeStart", XR.HAND_L);
    });
    C.addEventListener('squeezeend', () => {
        ATON.fireEvent("XRsqueezeEnd", XR.HAND_L);
    });

    XR.setupControllerUI(XR.HAND_L, bAddRep);

    ATON.fireEvent("XRcontrollerConnected", XR.HAND_L);
};

XR.setupSceneForAR = () => {
    if (XR._sessionType !== "immersive-ar") {
        return;
    }

    ATON.recomputeSceneBounds();

    let C = ATON.bounds.center;
    ATON._rootVisible.position.x = -C.x;
    ATON._rootVisible.position.y = -C.y;
    ATON._rootVisible.position.z = -C.z;

    ATON._rootSem.position.x = -C.x;
    ATON._rootSem.position.y = -C.y;
    ATON._rootSem.position.z = -C.z;

    ATON.recomputeSceneBounds();
};

XR.resetSceneOffsets = () => {
    ATON._rootVisible.position.set(0, 0, 0);
    ATON._rootSem.position.set(0, 0, 0);

    ATON.recomputeSceneBounds();
};

// On XR session started
XR.onSessionStarted = (session) => {
    console.log("DENTRO VR")

    if (XR.currSession) {  // Already running
        return;
    }
    XR._bReqPresenting = false;

    session.addEventListener('end', XR.onSessionEnded);
    session.isImmersive = true;

    console.log(XR._sessionType + " session started.");

    //console.log(session);

    // If any streaming is ongoing, terminate it
    ATON.MediaFlow.stopAllStreams();

    if (XR._sessionType === "immersive-ar") {
        ATON._renderer.xr.setReferenceSpaceType('local');
    }

    // Promised
    ATON._renderer.xr.setSession(session).then(() => {
            XR.currSession = session;
            // XR.currSession.addEventListener('inputsourceschange', onInputSourcesChange);

            console.log(XR.currSession);

            // AR sessions
            if (XR._sessionType === "immersive-ar") {
                ATON._mainRoot.background = null;
                if (ATON._mMainPano) {
                    ATON._mMainPano.visible = false;
                }

                //XR.setupSceneForAR();

                // Mobile AR
                let c0 = ATON._renderer.xr.getController(0);
                if (c0 && ATON.device.isMobile) {
                    XR.controller0 = ATON._renderer.xr.getController(0);

                    /*XR.controller0.addEventListener('selectstart', () => {
                        //if (XR._handleUISelection()) return;
                        ATON.fireEvent("XRselectStart", XR.HAND_R);

                        console.log("Head-aligned select");
                    });
                    XR.controller0.addEventListener('selectend', () => {
                        ATON.fireEvent("XRselectEnd", XR.HAND_R);
                    });
                    XR.controller0.addEventListener('select', () => {
                        ATON.fireEvent("XRselect", XR.HAND_R);
                    });
                    XR.controller0.addEventListener('squeezestart', () => {
                        ATON.fireEvent("XRsqueezeStart", XR.HAND_R);
                    });*/

                    XR.gControllers.add(XR.controller0);
                }

                /*
                            XR._bPresenting = true;
                            ATON.Nav._bInteracting = false;

                            console.log("AR now presenting");

                            ATON.fireEvent("XRmode", true);
                            return;
                */
            }

                // get xrRefSpace
            /*
            session.requestReferenceSpace('local').then((refSpace) => {
                xrRefSpace = refSpace.getOffsetReferenceSpace(new XRRigidTransform({x: 0, y: 1.5, z: 0}));
            });
            */

            else {
                // let numOfControllers = 1
                // let noControllerConnected = true;
                for (let c = 0; c < 2; c++) {
                    const controller = ATON._renderer.xr.getController(c);
                    console.log("CONTROLLER: ", controller)

                    if (controller !== undefined && !controller.userData.bXRconfig) {
                        //console.log(C);

                        controller.visible = false;
                        controller.userData.bXRconfig = true;

                        controller.addEventListener('connected', (e) => {
                                // noControllerConnected = false;
                                //console.log( e.data.handedness );
                                let hand = e.data.handedness;
                                controller.gm = e.data.gamepad;

                                console.log(e.data)
                                console.log(e.data.handedness);
                                console.log(hand);
                                // console.log("GamePad " + C.gm);

                                if (hand === "left") {
                                    console.log("left")
                                    XR._setupControllerL(controller, true);
                                } else if (hand === "right") {
                                    console.log("right")
                                    XR._setupControllerR(controller, true);
                                } else { // FIXME:
                                    console.log("other")
                                    // XR._setupControllerR(C, false);

                                    /*C.addEventListener('selectstart', () => {
                                        //if (XR._handleUISelection()) return;
                                        ATON._mainClick = true
                                        ATON.fireEvent("XRselectStart", XR.HAND_R);
                                        console.log("Head-aligned select");
                                    });
                                    C.addEventListener('selectend', () => {
                                        ATON._mainClick = false
                                        ATON.fireEvent("XRselectEnd", XR.HAND_R);
                                    });*/
                                    // C.addEventListener('select', () => {
                                    //     // ATON._mainClick = false
                                    //     ATON.fireEvent("XRselect", XR.HAND_R);
                                    // });
                                    // C.addEventListener('squeezestart', () => {
                                    //     console.log("SQUEEZE START BASSO LIVELLO")
                                    //     ATON.fireEvent("XRsqueezeStart", XR.HAND_R);
                                    // });
                                    // C.addEventListener('squeezeend', () => {
                                    //     console.log("SQUEEZE END BASSO LIVELLO")
                                    //     ATON.fireEvent("XRsqueezeEnd", XR.HAND_R);
                                    // });

                                    ATON.fireEvent("XRcontrollerConnected", XR.HAND_R);
                                }

                            }
                        )
                    }
                }
                /*if (noControllerConnected) {
                    session.requestReferenceSpace('local').then((referenceSpace) => {
                        session.requestAnimationFrame(onXRFrame);
                    });
                    function onXRFrame(time, frame) {
                        // Get hand input sources and update hand positions
                        const handInputSources = frame.getInputSources();

                        handInputSources.forEach((inputSource) => {
                            const handPose = frame.getPose(inputSource.targetRaySpace, referenceSpace);
                            if (handPose) {
                                // Update hand position based on handPose
                                const handPosition = handPose.transform.position;
                                // Perform actions based on hand position
                            }
                        });

                        // Continue animation loop
                        session.requestAnimationFrame(onXRFrame);
                    }
                }*/

                // reparent current camera to the XR rig
                XR.rig.add(ATON.Nav._camera);

                XR.setRefSpaceLocation(ATON.Nav._currPOV.pos);
                //console.log(ATON.Nav._currPOV.pos);

                // console.log("TESTONE")
                console.log(XR.currSession)
            }

            let camera = ATON._renderer.xr.getCamera(ATON.Nav._camera);
            ATON.Nav._updCamera(camera);

            XR._bPresenting = true;
            ATON.Nav._bInteracting = false;

            console.log("XR now presenting");

            //XR.setupControllersUI();

            ATON.fireEvent("XRmode", true);

            ATON.toggleShadows(false); // disable shadows for XR sessions

            // for immersive sessions we (re)set selector radius to 10cm
            if (ATON.SUI.getSelectorRadius() > ATON.FE.STD_SEL_RAD) {
                ATON.SUI.setSelectorRadius(ATON.FE.STD_SEL_RAD);
            }

            //console.log(session);

            ATON._qSyncInt = 2; // Query interval (perf)

            if (ATON.XPFNetwork.getNumXPFs() > 0) {
                ATON.setQueryRange(0.0, 100.0);
            } else {
                ATON.setQueryRange(0.0, XR.MAX_QUERY_DISTANCE);
            }

            ATON.MRes.estimateTSErrorTarget();

            // FIXME: needed bc selector radius is not applied
            setTimeout(() => {
                //ATON.Utils.updateTSetsCamera();
                if (ATON.SUI.getSelectorRadius() > ATON.FE.STD_SEL_RAD) {
                    ATON.SUI.setSelectorRadius(ATON.FE.STD_SEL_RAD);
                }
            }, 2000);
        }
    )
    ;
}

// On XR session terminated
XR.onSessionEnded = ( /*event*/) => {
    XR.currSession.removeEventListener('end', XR.onSessionEnded);
    XR.currSession = null;

    XR._bReqPresenting = false;

    XR._bPresenting = false;
    ATON.Nav._bInteracting = false;

    if (XR._sessionType === "immersive-ar") {
        //XR.resetSceneOffsets();

        if (ATON._mMainPano) {
            ATON._mMainPano.visible = true;
        }
    }

    //XR.rig.position.set(0.0,0.0,0.0);
    XR.setRefSpaceLocation(new THREE.Vector3(0, 0, 0));

    ATON.fireEvent("XRmode", false);

    ATON._qSyncInt = 1; // Query interval (unused)

    // If any streaming is ongoing, terminate it
    ATON.MediaFlow.stopAllStreams();

    ATON.Nav.requestHome();

    //ATON.Utils.updateTSetsCamera();
    ATON.Nav._updCamera();

    ATON.setQueryRange(0.0, Infinity);

    ATON.MRes.estimateTSErrorTarget();

    console.log("Quit XR");
};

/**
 Toggle immersive VR/AR mode
 @param {string} sessiontype - Can be "immersive-vr" or "immersive-ar", if undefined defaults to immersive VR
 */
XR.toggle = (sessiontype) => {
    XR.setSessionType(sessiontype);

    if (!ATON.device.xrSupported[XR._sessionType]) {
        return;
    }

    // Enter XR
    if (XR.currSession === null) {
        let sessionInit = {
            optionalFeatures: [
                //"local",
                "local-floor",
                "bounded-floor",

                "hand-tracking", // TODO se attivo questo non funziona più WebXR

                "high-refresh-rate",
                //"high-fixed-foveation-level",
            ]
        };

        if (XR._sessionType === "immersive-ar") {
            if (sessionInit.optionalFeatures === undefined) {
                sessionInit.optionalFeatures = [];
            }

            //sessionInit.requiredFeatures = [ 'hit-test' ];
            /*
                        let overlay = document.createElement('div');
                        overlay.style.display = 'none';
                        document.body.appendChild( overlay );

                        sessionInit.optionalFeatures.push( 'dom-overlay' );
                        sessionInit.domOverlay = { root: overlay };
            */
            sessionInit.optionalFeatures.push('light-estimation');
        }
        XR._bReqPresenting = true;
        navigator.xr.requestSession(XR._sessionType, sessionInit)
            .then(XR.onSessionStarted);
        //console.log(navigator.xr);
    } else { // Exit XR
        XR.currSession.end();
    }
};

XR.setupControllerUI = (h, bAddRep) => {
    let raytick = 0.003;
    let raylen = 1.0;

    let rhand = undefined;
    let lhand = undefined;

    //console.log("Setup controllers "+h);

    if (XR.gControllers === undefined) {
        XR.gControllers = ATON.createUINode();

        XR.gControllers.disablePicking();
        XR.rig.add(XR.gControllers);
    }

    // Left
    if (h === XR.HAND_L) {
        // TODO tolta da me per il magic leap
        // XR.gControllers.add(XR.controller1);
        //
        // if (bAddRep) {
        //     lhand = ATON
        //         .createUINode("Lhand")
        //         .load(XR._urlHand)
        //         .setMaterial(ATON.MatHub.materials.controllerRay)
        //         .setScale(-1, 1, 1);
        //
        //     XR.controller1.add(lhand);
        // }
    } else { // Right
        XR.gControllers.add(XR.controller0);

        if (bAddRep) {
            //XR._pointerLineGeom = new THREE.CylinderGeometry( raytick,raytick, raylen, 4 );
            XR._pointerLineGeom = new THREE.CylinderGeometry(raytick, raytick, raylen, 4);
            XR._pointerLineGeom.rotateX(-Math.PI / 2);
            XR._pointerLineGeom.translate(0, 0, -(raylen * 0.5));
            XR._pointerLineMesh = new THREE.Mesh(XR._pointerLineGeom, ATON.MatHub.materials.controllerRay);
            XR._pointerLineMesh.visible = false;
            // XR._pointerLineMesh.visible = true;
            XR.controller0.add(XR._pointerLineMesh); /*mesh.clone()*/

            // TODO TOLTA DA ME PER PROVARE IL TELECOMANDO DEL MAGIC LEAP
            // rhand = ATON
            //     .createUINode("Rhand")
            //     .load(XR._urlHand)
            //     .setMaterial(ATON.MatHub.materials.controllerRay);

            // Questo è il controller dell'HTC
            rhand = ATON
                .createUINode("Rhand")
                .load(XR._urlHTCViveController)
                .setScale(0.1, 0.1, 0.1)
                .setRotation(undefined, -1.5, undefined)
                .setMaterial(ATON.MatHub.materials.controllerRay);

            console.log("x " + rhand.rotation.x + " y " + rhand.rotation.y + " z " + rhand.rotation.z)

            XR.controller0.add(rhand);
        }
    }

    // We are connected to Photon
    if (ATON.Photon.uid !== undefined && bAddRep) {
        let avMats = ATON.MatHub.materials.avatars;
        let am = avMats[ATON.Photon.uid % avMats.length];
        if (h === XR.HAND_L) {
            lhand.setMaterial(am);
        } else {
            rhand.setMaterial(am);
        }
    }
};

// TODO tolto da me perchè sto usando il magic leap per ora
// FIXME:
// XR.switchHands = () => {
//
//     /*
//         let C0 = new THREE.Group();
//         for (let cr in XR.controller0.children){
//             C0.add(XR.controller0.children[cr]);
//         }
//
//         let C1 = new THREE.Group();
//         for (let cl in XR.controller1.children){
//             C1.add(XR.controller1.children[cl]);
//         }
//
//         //XR.controller1.removeChildren();
//         //XR.controller0.removeChildren();
//
//         return;
//
//         for (let c in C1.children){
//             XR.controller0.add(C1.children[c]);
//         }
//         for (let c in C0.children){
//             XR.controller1.add(C0.children[c]);
//         }
//     */
//     let H = XR.controller1;
//     XR.controller1 = XR.controller0;
//     XR.controller0 = H;
//
//     //XR.controller0 = ATON._renderer.xr.getController(1);
//     //XR.controller1 = ATON._renderer.xr.getController(0);
//
//     for (let c in XR.controller0.children) {
//         XR.controller0.remove(XR.controller0.children[c]);
//     }
//
//     for (let c in XR.controller1.children) {
//         XR.controller1.remove(XR.controller1.children[c]);
//     }
//
//     XR.gControllers.removeChildren();
//
//     XR.setupControllerUI(XR.HAND_L);
//     XR.setupControllerUI(XR.HAND_R);
//
//     console.log("VR controllers switched");
// };

// Not working
XR.getControllerSpace = (i) => {
    if (i === 1) {
        XR.getControllerGrip(1);
    } else {
        XR.getControllerGrip(0);
    }
};

/**
 Get controllers world location
 @param {number} i - the controllers ID (0 or 1)
 @returns {THREE.Vector3}
 */
XR.getControllerWorldLocation = (i) => {
    if (i === 1) {
        return XR.controller1pos;
    } else {
        return XR.controller0pos;
    }
};

/**
 Get controllers world direction
 @param {number} i - the controllers ID (0 or 1)
 @returns {THREE.Vector3}
 */
XR.getControllerWorldDirection = (i) => {
    if (i === 1) {
        return XR.controller1dir;
    } else {
        return XR.controller0dir;
    }
};

XR._deltaMotionController = (C) => {
    if (C === XR.HAND_L && XR._lastPosL === undefined) {
        return;
    }
    if (C === XR.HAND_R && XR._lastPosR === undefined) {
        return;
    }

    let p = (C === XR.HAND_L) ? XR.controller1pos : XR.controller0pos;
    let prev = (C === XR.HAND_L) ? XR._lastPosL : XR._lastPosR;

    let D = THREE.Vector3(
        p.x - prev.x,
        p.y - prev.y,
        p.z - prev.z
    );

    let m = D.lengthSq();

    if (C === XR.HAND_L) XR._lastPosL = p;
    else XR._lastPosR = p;
};

XR.update = () => {

    /*
        //if (XR._bPresenting) ATON.Utils.updateTSetsCamera();
        if (XR._bPresenting){
            let C = ATON._renderer.xr.getCamera();
            ATON.Utils.updateTSetsCamera( C );
        }
    */
    // R controllers
    if (XR.controller0 && XR.controller0.visible) {
        XR.controller0.getWorldPosition(XR.controller0pos);
        XR.controller0.getWorldDirection(XR.controller0dir);
        XR.controller0dir.negate();

        //XR._deltaMotionController(XR.HAND_R);
    }
    // L controllers
    if (XR.controller1 && XR.controller1.visible) {
        XR.controller1.getWorldPosition(XR.controller1pos);
        XR.controller1.getWorldDirection(XR.controller1dir);
        XR.controller1dir.negate();

        //XR._deltaMotionController(XR.HAND_L);
    }

    /*
        if (XR.gpad0 && XR.gpad0.buttons){
            //if (XR.gpad0.buttons[1] && XR.gpad0.buttons[1].pressed) ATON.fireEvent("XRsqueezePressed", 0);
            if (XR.gpad0.buttons[4] && XR.gpad0.buttons[4].pressed) ATON.fireEvent("XRbuttonAPressed");
            if (XR.gpad0.buttons[5] && XR.gpad0.buttons[5].pressed) ATON.fireEvent("XRbuttonBPressed");
        }

        if (XR.gpad1 && XR.gpad1.buttons){
            //if (XR.gpad1.buttons[1] && XR.gpad1.buttons[1].pressed) ATON.fireEvent("XRsqueezePressed", 1);
            if (XR.gpad1.buttons[4] && XR.gpad1.buttons[4].pressed) ATON.fireEvent("XRbuttonXPressed");
            if (XR.gpad1.buttons[5] && XR.gpad1.buttons[5].pressed) ATON.fireEvent("XRbuttonYPressed");
        }
    */
};

// Get VR controllers axes values
XR.getAxisValue = (c) => {
    let V = new THREE.Vector2(0.0, 0.0);

    let C = (c === XR.HAND_L) ? XR.controller1 : XR.controller0;

    if (C === undefined) {
        return V;
    }

    if (C.gm === undefined || C.gm.axes === undefined) {
        return V;
    }

    // console.log(`PROVA BOTTONI: ${JSON.stringify(C)}`)
    let x0 = C.gm.axes[0];
    let x1 = C.gm.axes[2];

    let y0 = C.gm.axes[1];
    let y1 = C.gm.axes[3];

    V.x = (x0 > 0.0) ? -x0 : x1;
    V.y = (y0 > 0.0) ? y0 : -y1;

    return V;
};

export default XR;