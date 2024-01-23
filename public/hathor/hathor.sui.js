// Spatial UI
//=======================

HATHOR.suiSetup = () => {
    let baseToolbar = ATON.SUI.baseToolbarSetup()
        .setPosition(2, 2, -5.5)
        .setRotation(0, 0, 0)
        .setScale(2)
        .attachToRoot();

    let baseToolbarNode = ATON.getUINode("baseToolbar")

    ATON.SUI.toolbarEditor([
        new ATON.SUI.Button("sui_redo"),
        new ATON.SUI.Button("sui_undo"),
        new ATON.SUI.Button("sui_annconvex"),
        new ATON.SUI.Button("sui_ann-sphere"),
        // new ATON.SUI.Button("sui_measure"),
        new ATON.SUI.Button("sui_scene_layer"),
        // new ATON.SUI.Button("sui_environment"),
        // new ATON.SUI.Button("sui_scene"),
        new ATON.SUI.Button("sui_cancel"),
        new ATON.SUI.Button("sui_editing"),
        new ATON.SUI.Button("sui_annotation"),
        // new ATON.SUI.Button("sui_collection"),
        new ATON.SUI.Button("sui_addmesh"),
        new ATON.SUI.Button("sui_delmesh")
    ])
        .setPosition(0, 0.3, 0.0)
        .attachTo(baseToolbarNode)

    ATON.getUINode("editToolbarMenu")
        .hide()

    ATON.SUI.checkAuth((data) => {
        if (data.username) {
            // console.log("BOOOOOOOOOOOOOOOOOOONO")
            let btnSketchfab = ATON.getUINode("sui_sketchfab")
            btnSketchfab.setIcon(ATON.FE.PATH_RES_ICONS + "sketchfab-logo.png")
                .setOnSelect(() => {
                    HATHOR.setSpawnSketchfabImporter(btnSketchfab, undefined, undefined);
                })
        }
    })

    let btnPhoton = ATON.getUINode("sui_photon");
    btnPhoton
        .setIcon(ATON.FE.PATH_RES_ICONS + "photon.png")
        .setOnSelect(() => {

        })

    let btnProfile = ATON.getUINode("sui_profile");
    btnProfile.setIcon(ATON.FE.PATH_RES_ICONS + "user.png")
        //.setSwitchColor(ATON.MatHub.colors.green)
        .setOnSelect(async () => {
            // console.log("SELECTED: ", btnProfile.onSelect)
            let containerProfile = ATON.getUINode("containerProfileBlock");

            let profileBlock = await ATON.SUI.createProfileBlock("profileBlock")

            if (btnProfile.getBSwitched()) {
                btnProfile.switch(false)
                containerProfile.hide()
            } else {
                btnProfile.switch(true)

                profileBlock
                    .setPosition(4.5, 2, -2.3)
                    .setRotation(0.0, 300, 0)
                    .setScale(2.0)
                    .attachToRoot();
            }
        });

    let btnTalk = ATON.getUINode("sui_talk");
    btnTalk.setIcon(ATON.FE.PATH_RES_ICONS + "talk.png")
        //.setSwitchColor(ATON.MatHub.colors.orange)
        .setOnSelect(() => {
            if (ATON.MediaFlow.isAudioRecording()) {
                ATON.MediaFlow.stopAudioStreaming();
                btnTalk.switch(false);
            } else {
                ATON.MediaFlow.startAudioStreaming();
                btnTalk.switch(true);
            }
        })

    ATON.getUINode("sui_home")
        .setIcon(ATON.FE.PATH_RES_ICONS + "home.png")
        .setOnSelect(() => {
            ATON.Nav.requestHome();
        })


    ATON.getUINode("sui_uscale")
        .setIcon(ATON.FE.PATH_RES_ICONS + "uscale.png")
        .setOnSelect(() => {
            HATHOR.switchUserScale();
        })

    ATON.getUINode("sui_pdf")
        .setIcon(ATON.FE.PATH_RES_ICONS + "pdf.png")
        .setOnSelect(() => {
            HATHOR.uploadFileToServer();
        })

    ATON.getUINode("sui_exitxr")
        .setBaseColor(ATON.MatHub.colors.red)
        .setIcon(ATON.FE.PATH_RES_ICONS + "vr.png")
        .setOnSelect(() => {
            ATON.XR.toggle();
        })

    ATON.getUINode("sui_annconvex")
        .setIcon(ATON.FE.PATH_RES_ICONS + "ann-convex.png")
        //.setSwitchColor(ATON.MatHub.colors.green)
        .setOnSelect(() => {
            if (HATHOR._actState !== HATHOR.SELECTION_ADDCONVEXPOINT) {
                // btnAnnConvex.switch(true);
            } else {
                let S = ATON.SemFactory.completeConvexShape();
                if (S) {
                    ATON.getRootSemantics().add(S);
                }

                // btnAnnConvex.switch(false);
            }

            HATHOR.updateSelectionMode(HATHOR.SELECTION_ADDCONVEXPOINT)
        })

    /*ATON.getUINode("sui_measure")
        .setIcon(ATON.FE.PATH_RES_ICONS + "measure.png")
        //.setSwitchColor(ATON.MatHub.colors.green)
        .setOnSelect(() => {
            // if (HATHOR._actState !== HATHOR.SELACTION_MEASURE) {
            //     btnMeasure.switch(true);
            // } else {
            //     btnMeasure.switch(false);
            // }

            HATHOR.updateSelectionMode(HATHOR.SELECTION_MEASURE)
        });*/

    ATON.getUINode("sui_ann-sphere")
        .setIcon(ATON.FE.PATH_RES_ICONS + "ann-sphere.png")
        .setOnSelect(() => {
            // HATHOR.openRemotePopup()
            HATHOR.updateSelectionMode(HATHOR.SELECTION_ADDSPHERESHAPE)
        });

    ATON.getUINode("sui_editing")
        .setIcon(ATON.FE.PATH_RES_ICONS + "editing.png") // TODO cambiare icona
        .setOnSelect(() => {
            HATHOR.toggleEditNodes()
            HATHOR.updateSelectionMode(HATHOR.SELECTION_EDITNODES)
        });

    HATHOR._annotationToolbar = ATON.SUI.annotationToolbar("annotationToolbar").hide()

    let annotationSUI = ATON.getUINode("sui_annotation")
        .setIcon(ATON.FE.PATH_RES_ICONS + "write-annotation.png")
        .setOnSelect(() => {
            if (annotationSUI.getBSwitched()) {
                ATON.SemFactory.nowAnnotating = false
                HATHOR._annotationToolbar.delete()
            } else {
                ATON.SemFactory.nowAnnotating = true
                if (ATON.getUINode("pencilBtn")._bSwitched) {
                    ATON.SemFactory.startWritingAnnotation()
                } else {
                    ATON.SemFactory.startErasingAnnotation()
                }
                // ATON.SemFactory.startWritingAnnotation() // Default: Writing
                HATHOR._annotationToolbar.show()
            }

            HATHOR.updateSelectionMode(HATHOR.SELECTION_ANNOTATION)
        });

    let sceneLayer = ATON.getUINode("sui_scene_layer")
        .setIcon(ATON.FE.PATH_RES_ICONS + "list.png")
        .setOnSelect(() => {
            let layersNode = ATON.SUI.createLayersNodes("layersNode", ATON.NTYPES.SCENE)

            if (sceneLayer.getBSwitched()) {
                sceneLayer.switch(false)
                layersNode.hide()
            } else {
                sceneLayer.switch(true)
                layersNode
                    .setPosition(4.5, 1.8, -2.3)
                    .setRotation(0.0, 300, 0)
                    .setScale(1.2)
                    .show()
                    .attachToRoot();
            }

        })

    /*ATON.getUINode("sui_environment")
        .setIcon(ATON.FE.PATH_RES_ICONS + "light.png")*/

    /*ATON.getUINode("sui_scene")
        .setIcon(ATON.FE.PATH_RES_ICONS + "scene.png")*/

    ATON.getUINode("sui_cancel")
        .setIcon(ATON.FE.PATH_RES_ICONS + "cancel.png")
        .setOnSelect(() => {
            HATHOR.cancelCurrentTask();
        })

    ATON.getUINode("sui_addmesh")
        .setIcon(ATON.FE.PATH_RES_ICONS + "addmesh.png")
        .setOnSelect(() => {
            let btnSketchfab = ATON.getUINode("sui_addmesh")
            HATHOR.setSpawnSketchfabImporter(btnSketchfab, undefined, undefined);
        })

    ATON.getUINode("sui_delmesh")
        .setIcon(ATON.FE.PATH_RES_ICONS + "remmesh.png")
        .setOnSelect(() => {
            ATON.getUINode("sui_delmesh").switch(true);
            HATHOR._actState = HATHOR.REMOVE_OBJECT;
        })

    ATON.getUINode("sui_undo")
        .setIcon(ATON.FE.PATH_RES_ICONS + "undo.png")
        .setOnSelect(() => {
            // ATON.getUINode("sui_delmesh").switch(true);
            // HATHOR._actState = HATHOR.REMOVE_OBJECT;
            HATHOR.handleUndo();
        })

    ATON.getUINode("sui_redo")
        .setIcon(ATON.FE.PATH_RES_ICONS + "redo.png")
        .setOnSelect(() => {
            // ATON.getUINode("sui_delmesh").switch(true);
            // HATHOR._actState = HATHOR.REMOVE_OBJECT;
            HATHOR.handleRedo();
        })

    // for (let b in buttonsMenu) {
    //     buttonsMenu[b].onHover = () => {
    //         ATON.AudioHub.playOnceGlobally(ATON.PATH_RES + "audio/blop.mp3");
    //         buttonsMenu[b].setBackgroundOpacity(0.9);
    //     };
    //
    //     buttonsMenu[b].onLeave = () => {
    //         buttonsMenu[b].setBackgroundOpacity(0.5);
    //     };
    // }

    // Nodo Highlight
    /*ATON
        .createSceneNode("highlight_cube")
        .load("samples/models/atoncube.glb")
        .setPosition(0, 1, 4)
        .setScale(0.5, 0.5, 0.5)
        .setDefaultAndHighlightMaterials("black", "red")
        .highlightOnHover()
        .attachToRoot()

    let nodoMod = ATON.createSceneNode("editable_cube")


    nodoMod.load("samples/models/atoncube.glb")
        .setPosition(-3, 1, 4)
        .setScale(1.2, 1.2, 1.2)
        .setEditable()
        .attachToRoot()


    setTimeout(()=>{
        const boundingBox = new THREE.Box3().setFromObject(ATON.getSceneNode("editable_cube"))
        // Get the dimensions (size) of the bounding box
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        // console.log("BOUNDING", boundingBox)
        // console.log('Size:', size);
    }, 10000)*/


    // Nodo modificabile
    // ATON
    //     .createSceneNode("editable_cube")
    //     .load("samples/models/atoncube.glb")
    //     .setPosition(-3, 1, 4)
    //     .setScale(1.2, 1.2, 1.2)
    //     .setEditable()
    //     .attachToRoot()
};

HATHOR.setSpawnSketchfabImporter = (btnSketchfab, sk_spawn_node, obj_count) => {
    let sketchBlock;
    let sketchBlockId;
    let keyboard;
    let searchSketchId;
    if (sk_spawn_node) sk_spawn_node.isImported = true;
    if (obj_count) {
        sketchBlockId = "sketchfabBlock_" + sk_spawn_node.nid;
        searchSketchId = "searchSketchModel_" + sk_spawn_node.nid
        sketchBlock = ATON.SUI.createSketchfabBlock(sketchBlockId, searchSketchId)
    }
    else {
        if (btnSketchfab.nid !== "sui_addmesh") {
            sketchBlockId = "sketchfabBlock"
            searchSketchId = "searchSketchModel"
            sketchBlock = ATON.SUI.createSketchfabBlock(sketchBlockId, searchSketchId)
        }
        else {
            // sketchBlockId = "sketchfabBlock_personal"
            // sketchBlock = ATON.SUI.createSketchfabBlock(sketchBlockId)
            searchSketchId = "searchSketchModel_personal"
        }
    }

    if (btnSketchfab) {
        // console.log("BTN NAME: ", btnSketchfab.nid)
        if (btnSketchfab.getBSwitched()) {
            btnSketchfab.switch(false)

            // console.log("parent: ", sketchBlock.parent)
            if (keyboard) {
                keyboard.hide()
                keyboard.delete()
            }

            if (sketchBlock) {
                sketchBlock.hide()
                sketchBlock.delete()
            }

            if (ATON.getUINode("skSearchContainer_personal")) {
                ATON.getUINode("skSearchContainer_personal").hide();
                ATON.getUINode("skSearchContainer_personal").delete();
            }
        } else if (btnSketchfab.nid !== "sui_addmesh") {
            btnSketchfab.switch(true)

            sketchBlock
                .setPosition(4.5, 2.5, -2.3)
                .setRotation(0.0, 300, 0)
                .setScale(2.0)
                .show()
                .attachToRoot();

            let searchSketchModel = ATON.getUINode(searchSketchId);

            searchSketchModel
                .setOnSelect(() => {
                    keyboard = new ATON.SUI.Keyboard("keyboard", "eng")
                    keyboard
                        .setFieldToWrite(searchSketchId)
                        .setHideOnEnter(true)
                        .setOnEnter(() => {
                            let textModel = searchSketchModel.getText()
                            let cubeXYZ = {
                                x: 2,
                                y: 2,
                                z: 2
                            };
                            HATHOR.loadSketchfabModelsSUI(HATHOR.sketchfabSearchBaseURL + textModel, true, undefined, undefined, cubeXYZ, undefined)
                        })
                        .show()
                        .attachTo(searchSketchModel)

                })
        } else if (btnSketchfab.nid === "sui_addmesh") {
            btnSketchfab.switch(true)
            let cubeXYZ = {
                x: 2,
                y: 2,
                z: 2
            };
            const obj_lst = ATON._userObjects;
            HATHOR.loadPersonalSketchfabModelsSUI(obj_lst, cubeXYZ)
        }
    } else {
        if (!sk_spawn_node.searchbarActive && HATHOR._actState !== HATHOR.SELECTION_EDITNODES) {
            if (sk_spawn_node) {

                // console.log("sk spawn parent: ", sk_spawn_node.parent)

                sketchBlock
                    .setPosition(0, 2.5, 0)
                    .setRotation(0.0, 0.5 * Math.PI, 0)
                    .setScale(2.0)
                    .show()

                // sk_spawn_node.boxBound()
                let spawn_BB = sk_spawn_node._bb;
                let spawn_width = spawn_BB.max.x - spawn_BB.min.x;
                let spawn_depth = spawn_BB.max.z - spawn_BB.min.z;

                let block_BB = new THREE.Box3().setFromObject(sketchBlock);

                sketchBlock.attachTo(sk_spawn_node);

                let cubeXYZ = {
                    x: spawn_width,
                    y: block_BB.min.y - spawn_BB.max.y,
                    z: spawn_depth
                };

                // console.log("SEARCH SKETCH ID: ", searchSketchId)

                let searchSketchModel = ATON.getUINode(searchSketchId);

                searchSketchModel
                    .setOnSelect(() => {
                        // console.log("keyboard: ", keyboard)
                        if (!sk_spawn_node.keyboardActive) {
                            keyboard = new ATON.SUI.Keyboard("keyboard_" + obj_count, "eng")
                            keyboard
                                .setFieldToWrite(searchSketchId)
                                .setHideOnEnter(true)
                                .setOnEnter(() => {
                                    let textModel = searchSketchModel.getText()
                                    let oldCardContainer = ATON.getUINode("sketchfabCardsContainer_" + sk_spawn_node.nid)
                                    if (oldCardContainer) {
                                        oldCardContainer.hide();
                                        oldCardContainer.delete();
                                    }

                                    // console.log("base BB: ", spawn_BB)
                                    // console.log("block BB: ", block_BB)

                                    HATHOR.loadSketchfabModelsSUI(HATHOR.sketchfabSearchBaseURL + textModel, true, sk_spawn_node, obj_count, cubeXYZ, spawn_BB.max.y)
                                })
                                .show()
                                .attachTo(searchSketchModel)
                            sk_spawn_node.keyboardActive = true;
                        } else {
                            keyboard.hide();
                            keyboard.delete();
                            sk_spawn_node.keyboardActive = false;
                        }

                    })
                sk_spawn_node.searchbarActive = true;
            }
        } else if (sk_spawn_node.searchbarActive && HATHOR._actState !== HATHOR.SELECTION_EDITNODES) {
            sketchBlock.hide()
            sketchBlock.delete()
            if (sk_spawn_node.keyboardActive) {
                if (keyboard) {
                    keyboard.hide()
                    keyboard.delete()
                }
                sk_spawn_node.keyboardActive = false;
            }
            sk_spawn_node.searchbarActive = false;
        }
    }
}