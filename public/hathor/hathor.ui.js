// Hathor UI buttons

HATHOR.uiAddButtonMeasure = (idcontainer) => {
    ATON.FE.uiAddButton(idcontainer, "measure", () => {
        HATHOR.updateSelectionMode(HATHOR.SELECTION_MEASURE)
    }, "Measure");
};

HATHOR.uiAddButtonAnnSphere = (idcontainer) => {
    ATON.FE.uiAddButton(idcontainer, "ann-sphere", () => {
        HATHOR.setSelectionMode(HATHOR.SELECTION_ADDSPHERESHAPE);
    }, "Annotate using basic sphere shape");
};

HATHOR.uiAddButtonAnnConvex = (idcontainer) => {
    ATON.FE.uiAddButton(idcontainer, "ann-convex", () => {
        if (HATHOR._actState !== HATHOR.SELECTION_ADDCONVEXPOINT) {
            ATON.Nav.setUserControl(false);
            $("#btn-cancel").show();
        } else {
            HATHOR.popupAddSemantic(ATON.FE.SEMSHAPE_CONVEX);
        }

        HATHOR.updateSelectionMode(HATHOR.SELECTION_ADDCONVEXPOINT)
    }, "Annotate using convex shape");
};

HATHOR.uiAddButtonEditNodes = (idcontainer) => {
    ATON.FE.uiAddButton(idcontainer, "editing", () => {
        HATHOR.toggleEditNodes()
        HATHOR.updateSelectionMode(HATHOR.SELECTION_EDITNODES)
    }, "Edit Nodes");
};

HATHOR.uiAddButtonAnnotation = (idcontainer) => {
    ATON.FE.uiAddButton(idcontainer, "write-annotation", () => {
        if (!ATON.getUINode("annotationToolbar")) {
            ATON.SUI.annotationToolbar("annotationToolbar")
        } else {
            if (ATON.getUINode("annotationToolbar").visible === false) {
                ATON.SemFactory.nowAnnotating = true
                ATON.getUINode("annotationToolbar").show()
                if (ATON.getUINode("pencilBtn")._bSwitched) {
                    ATON.SemFactory.startWritingAnnotation()
                } else {
                    ATON.SemFactory.startErasingAnnotation()
                }
            } else {
                ATON.SemFactory.nowAnnotating = false
                ATON.getUINode("annotationToolbar").hide()
            }
        }


        ATON.SemFactory.nowAnnotating = HATHOR._actState !== HATHOR.SELECTION_ANNOTATION;
        HATHOR.updateSelectionMode(HATHOR.SELECTION_ANNOTATION)

    }, "Annotation");
}


HATHOR.uiAddButtonTaskCancel = (idcontainer) => {
    ATON.FE.uiAddButton(idcontainer, "cancel", () => {
        HATHOR._actState = HATHOR.SELECTION_STD
        HATHOR.cancelCurrentTask();
    });

    $("#btn-cancel").hide();
};


// Hathor UI Profiles
HATHOR.uiBase = async () => {
    $("#idTopToolbar").html(""); // clear
    $("#idBottomToolbar").html(""); // clear
    $("#idBottomRToolbar").html(""); // clear

    if (HATHOR.paramBack) {
        ATON.FE.uiAddButtonBack("idTopToolbar");
    }

    if (HATHOR.paramPhoton) {
        ATON.FE.uiAddButtonPhoton("idTopToolbar")
    }

    ATON.FE.uiAddButtonUser("idTopToolbar");

    let sketchPromise = new Promise((resolve, reject) => {
        ATON.FE.checkAuth((r) => {
            if (r.username !== undefined) {
                ATON.FE.uiAddButtonSketchfab("idTopToolbar")
                // ATON.FE.uiAddButton("idTopToolbar", "sketchfab-logo", HATHOR.addSketchfab, "Sketchfab Menu");
            }
            resolve()
        })
    })

    await sketchPromise.then(() => {


        $("#btn-playpause").remove();
        ATON.FE.uiAddButtonMainVideoPanoPlayPause("idBottomToolbar");

        // Bottom toolbar
        //$("#idBottomToolbar").append("<input id='idSearch' type='text' maxlength='15' size='15'><br>");
        // ATON.FE.uiAddButton("idBottomToolbar", "prev", HATHOR.povPrev, "Previous Viewpoint");
        // ATON.FE.uiAddButtonHome("idBottomToolbar");
        // ATON.FE.uiAddButton("idBottomToolbar", "next", HATHOR.povNext, "Next Viewpoint");
        // ATON.FE.uiAddButtonTalk("idBottomToolbar");

        // ATON.FE.uiAddButton("idBottomRToolbar", "cc", HATHOR.popupCC, "Assets copyright");
        // ATON.FE.uiAddButton("idBottomRToolbar", "info", HATHOR.popupSceneInfo, "Scene information");

        // ATON.FE.checkAuth((r) => {
        //     if (r.username !== undefined) {
        //         $("#btn-talk").show();
        //         $("#btn-info").show();
        //         $("#btn-cc").show();
        //         $("#btn-prev").show();
        //         $("#btn-next").show();
        //     } else {
        //         $("#btn-talk").hide();
        //         $("#btn-info").hide();
        //         $("#btn-cc").hide();
        //         $("#btn-prev").hide();
        //         $("#btn-next").hide();
        //     }
        // })


        $("#idSemPanelBG").click(() => {
            HATHOR.toggleSideSemPanel(false);
        });

        if (HATHOR.paramProf) {
            //ATON._renderer.info.autoReset = false;
            $("#idTopToolbar").append("<div id='idProf' style='top:5px;right:5px;position:fixed;'></div>");
        }
    })


};

HATHOR.uiStandardUser = async () => {
    // $("#idTopToolbar").html(""); // clear

    ATON.FE.uiSetEditMode(false, "idTopToolbar");

    await HATHOR.uiBase();

    // ATON.FE.uiAddButton("idTopToolbar", "scene", HATHOR.popupScene, "Scene");
    // ATON.FE.uiSwitchButton("scene", ATON.SceneHub._bEdit);

    //ATON.FE.uiAddButtonNav("idTopToolbar");
    // if (!ATON.Utils.isLocalhost()) {
    ATON.FE.uiAddButton("idTopToolbar", "pdf", HATHOR.uploadFileToServer, "Add PDF file");

    // ATON.FE.uiAddButton("idTopToolbar", "share", HATHOR.popupShare, "Share");
    // }

    ATON.FE.uiAddButton("idTopToolbar", "nav", HATHOR.popupNav, "Navigation");
    //ATON.FE.uiAddButtonVR("idTopToolbar");
    ATON.FE.uiAddButton("idTopToolbar", "xr", HATHOR.popupXR, "Immersive, Augmented or Mixed Reality");

    // ATON.FE.uiAddButtonFullScreen("idTopToolbar");
    // ATON.FE.uiAddButton("idTopToolbar", "help", HATHOR.popupHelp, "Help");
};


HATHOR.uiEditorUser = async () => {
    await HATHOR.uiStandardUser()

    ATON.FE.checkAuth((r) => {
        let authUser = r.username;
        let bYourScene = (ATON.SceneHub.currID) ? ATON.SceneHub.currID.startsWith(authUser) : false;

        // // In order to allow editing, must be authenticated + our scene
        // if (!authUser || !bYourScene) {
        //     return;
        // }

        ATON.FE.uiSetEditMode(true, "idTopToolbar");
        // ATON.FE.uiAddButtonEditMode("idTopToolbar");

        // ATON.FE.uiAddButton("idTopToolbar", "scene", HATHOR.popupScene, "Scene");
        // ATON.FE.uiAddButton("idTopToolbar", "light", HATHOR.popupEnvironment, "Environment");
        ATON.FE.uiAddButton("idTopToolbar", "list", HATHOR.popupGraphs, "Scene Layers");
        // ATON.FE.uiAddButton("idTopToolbar", "sketchfab-addlink", HATHOR.popupAddLink, "Add sketchfab prefab to your collection");
        ATON.FE.uiAddButton("idTopToolbar", "addmesh", HATHOR.popupAddmesh, "Add Mesh");
        ATON.FE.uiAddButton("idTopToolbar", "remmesh", HATHOR.setDelMode, "Remove Mesh");
        /*
                ATON.FE.uiAddButton("idTopToolbar", "selector", ()=>{
                    ATON.FE.popupSelector();
                }, "3D Selector");
        */
        // HATHOR.uiAddButtonMeasure("idTopToolbar");
        HATHOR.uiAddButtonAnnSphere("idTopToolbar");
        HATHOR.uiAddButtonAnnConvex("idTopToolbar");
        HATHOR.uiAddButtonEditNodes("idTopToolbar");
        HATHOR.uiAddButtonAnnotation("idTopToolbar");

        ATON.FE.uiAddButton("idTopToolbar", "undo", HATHOR.handleUndo, "Undo");
        ATON.FE.uiAddButton("idTopToolbar", "redo", HATHOR.handleRedo, "Redo");

        // Cancel button
        HATHOR.uiAddButtonTaskCancel("idTopToolbar");

    })
}

// Custom UI button list
HATHOR.customUIList = (list) => {
    $("#idTopToolbar").html(""); // clear

    if (HATHOR.paramBack) {
        ATON.FE.uiAddButtonBack("idTopToolbar");
    }

    for (let i in list) {
        let uiname = list[i];

        switch (uiname) {
            case "back":
                ATON.FE.uiAddButtonBack("idTopToolbar");
                break
            case "nav":
                ATON.FE.uiAddButton("idTopToolbar", "nav", HATHOR.popupNav, "Navigation");
                break
            case "vr":
                ATON.FE.uiAddButtonVR("idTopToolbar");
                break
            case "ar":
                ATON.FE.uiAddButtonAR("idTopToolbar");
                break
            case "xr":
                ATON.FE.uiAddButton("idTopToolbar", "xr", HATHOR.popupXR, "Immersive, Augmented or Mixed Reality");
                break
            case "qr":
                ATON.FE.uiAddButtonQR("idTopToolbar");
                break
            case "share":
                ATON.FE.uiAddButton("idTopToolbar", "share", HATHOR.popupShare, "Share");
                break
            case "fs":
                ATON.FE.uiAddButtonFullScreen("idTopToolbar");
                break
            case "layers":
                ATON.FE.uiAddButton("idTopToolbar", "list", HATHOR.popupGraphs, "Scene Layers");
                break
            case "scene":
                ATON.FE.uiAddButton("idTopToolbar", "scene", HATHOR.popupScene, "Scene");
                break
            case "env":
                ATON.FE.uiAddButton("idTopToolbar", "light", HATHOR.popupEnvironment, "Environment");
                break
            case "collab":
                ATON.FE.uiAddButtonPhoton("idTopToolbar");
                break
            case "user":
                ATON.FE.uiAddButtonUser("idTopToolbar");
                break
            case "capture":
                ATON.FE.uiAddButtonScreenshot("idTopToolbar");
                break
            case "help":
                ATON.FE.uiAddButton("idTopToolbar", "help", HATHOR.popupHelp, "Help");
                break
            case "measure":
                HATHOR.uiAddButtonMeasure()
                break
        }
    }
};

// Create UI Profiles
HATHOR.buildUIProfiles = () => {
    // Standard
    ATON.FE.uiAddProfile("default", async () => {
        await HATHOR.uiStandardUser()

    });

    // Editor
    ATON.FE.uiAddProfile("editor", async () => {
        await HATHOR.uiEditorUser()
    });
};

// Popups
//=======================================

HATHOR._createPopupStdSem = (esemid) => {
    let htmlcontent = "";

    htmlcontent = "<div class='atonPopupTitle'>";
    if (esemid === undefined) htmlcontent += "New Annotation</div>";
    else htmlcontent += "Modify '" + esemid + "'</div>";

    // New ID
    if (esemid === undefined) {
        htmlcontent += "ID:<input id='semid' type='text' maxlength='15' size='15' list='semlist' >&nbsp;";
        /*
                let gSemXPF = ATON.XPFNetwork.getCurrentSemanticGroup();
                if (gSemXPF === undefined){
                    htmlcontent += "child of:";
                    htmlcontent += "<div class='select' style='width:100px;'><select id='psemid'>";
                    htmlcontent += "<option value='.'>root</option>";
                    for (let s in ATON.semnodes) if (s !== ATON.ROOT_NID) htmlcontent += "<option value='"+s+"'>"+s+"</option>";
                    htmlcontent += "</select><div class='selectArrow'></div></div>";
                }
        */

        htmlcontent += "<datalist id='semlist'>";
        for (let s in ATON.semnodes) {
            if (s !== ATON.ROOT_NID && !s.startsWith(ATON.XPFNetwork.SEMGROUP_PREFIX)) htmlcontent += "<option>" + s + "</option>";
        }
        htmlcontent += "</datalist>";

        htmlcontent += "<br><div id='btnRichContent' class='atonBTN atonBTN-gray atonBTN-horizontal'><img src='" + ATON.FE.PATH_RES_ICONS + "html.png'>Rich Content</div>";
        htmlcontent += "<div id='idSemDescCont' style='display:none'><textarea id='idSemDescription' style='width:100%;'></textarea></div>";
    }
    // modifying existing ID
    else {
        htmlcontent += "<textarea id='idSemDescription' style='width:100%;'></textarea><br>";
    }


    if (ATON.Utils.isConnectionSecure() && !ATON.MediaFlow.isAudioRecording()) {
        htmlcontent += "<div id='btnVocalNote' class='atonBTN atonBTN-gray atonBTN-horizontal'><img src='" + ATON.FE.PATH_RES_ICONS + "talk.png'>Vocal Note</div>";
        htmlcontent += "<br><audio id='ctrlVocalNote' style='display:none' controls ></audio>";
    }

    htmlcontent += "<br>";

    if (esemid === undefined) htmlcontent += "<div class='atonBTN atonBTN-green atonBTN-horizontal' id='idAnnOK'>ADD</div>";
    else htmlcontent += "<div class='atonBTN atonBTN-green atonBTN-horizontal' id='idAnnOK'>DONE</div>";

    return htmlcontent;
};

HATHOR.createSemanticTextEditor = (idtextarea) => {
    let txtarea = document.getElementById(idtextarea);
    //sceditor.create(txtarea, {
    let SCE = $("#" + idtextarea).sceditor({
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

    //console.log(SCE);
    return SCE;
};

HATHOR.handleUndo = () => {
    HATHOR.cancelCurrentTask();
    if (ATON.undoStack.length > 0) {
        const undoAction = ATON.undoStack.pop();
        // TODO: gestire operazioni di undo
        let E = {};
        let S = ATON.snodes;
        switch (undoAction.action) {
            case "add_mesh":
                // console.log("UNDO ACTION: ", undoAction)
                HATHOR.removeMesh(undoAction.node.nid, false);
                break;
            case "del_mesh":
                // if (undoAction.pivot) {
                //     undoAction.node.attachTo(undoAction.pivot)
                //     undoAction.pivot.attachTo(undoAction.parent)
                // }
                // else {
                //     undoAction.node.attachTo(undoAction.parent)
                // }
                E = {}
                E.scenegraph = {}
                E.scenegraph.nodes = {}
                E.scenegraph.edges = {}

                if (undoAction.pivot) {
                    E.scenegraph.nodes[undoAction.pivot.nid] = {}

                    E.scenegraph.nodes[undoAction.pivot.nid].urls = undoAction.pivot.sketchfabUrl;
                    E.scenegraph.nodes[undoAction.pivot.nid].assetId = undoAction.pivot.assetId;
                    E.scenegraph.nodes[undoAction.pivot.nid].editable = true;
                    E.scenegraph.nodes[undoAction.pivot.nid].isImported = undoAction.pivot.isImported;
                    E.scenegraph.nodes[undoAction.pivot.nid].isImporter = undoAction.pivot.isImporter;
                    E.scenegraph.nodes[undoAction.pivot.nid].isPivotWrapper = undoAction.pivot.isPivotWrapper;
                    E.scenegraph.nodes[undoAction.pivot.nid].transform = {}

                    E.scenegraph.nodes[undoAction.pivot.nid].transform.scale = [undoAction.pivot.scale.x, undoAction.pivot.scale.y, undoAction.pivot.scale.z];
                    E.scenegraph.nodes[undoAction.pivot.nid].transform.rotation = [undoAction.pivot.rotation.x, undoAction.pivot.rotation.y, undoAction.pivot.rotation.z];
                    E.scenegraph.nodes[undoAction.pivot.nid].transform.position = [undoAction.pivot.position.x, undoAction.pivot.position.y, undoAction.pivot.position.z];
                }

                E.scenegraph.nodes[undoAction.node.nid] = {}

                E.scenegraph.nodes[undoAction.node.nid].urls = undoAction.node.sketchfabUrl;
                E.scenegraph.nodes[undoAction.node.nid].assetId = undoAction.node.assetId;
                E.scenegraph.nodes[undoAction.node.nid].editable = true;
                E.scenegraph.nodes[undoAction.node.nid].isImported = undoAction.node.isImported;
                E.scenegraph.nodes[undoAction.node.nid].isImporter = undoAction.node.isImporter;
                E.scenegraph.nodes[undoAction.node.nid].isPivotWrapper = undoAction.node.isPivotWrapper;
                E.scenegraph.nodes[undoAction.node.nid].transform = {}

                E.scenegraph.nodes[undoAction.node.nid].transform.scale = [undoAction.node.scale.x, undoAction.node.scale.y, undoAction.node.scale.z];
                E.scenegraph.nodes[undoAction.node.nid].transform.rotation = [undoAction.node.rotation.x, undoAction.node.rotation.y, undoAction.node.rotation.z];
                E.scenegraph.nodes[undoAction.node.nid].transform.position = [undoAction.node.position.x, undoAction.node.position.y, undoAction.node.position.z];

                S = ATON.snodes;

                // debugger;

                for (let node in S) {
                    if (!S.hasOwnProperty(S[node].parent.nid)) {
                        E.scenegraph.edges[S[node].nid] = [];
                    }
                    else {
                        if (!E.scenegraph.edges[S[node].parent.nid]) {
                            E.scenegraph.edges[S[node].parent.nid] = []
                        }
                        E.scenegraph.edges[S[node].parent.nid].push(S[node].nid)
                    }
                }

                if (undoAction.pivot) {
                    if (undoAction.parent.nid !== ".") {
                        E.scenegraph.edges[undoAction.parent.nid] = [];
                        E.scenegraph.edges[undoAction.parent.nid].push(undoAction.pivot.nid)
                        E.scenegraph.edges["."].push(undoAction.pivot.nid)
                        E.scenegraph.edges[undoAction.pivot.nid] = []
                        E.scenegraph.edges[undoAction.pivot.nid].push(undoAction.node.nid)
                    } else {
                        E.scenegraph.edges["."].push(undoAction.pivot.nid)
                        E.scenegraph.edges[undoAction.pivot.nid] = []
                        E.scenegraph.edges[undoAction.pivot.nid].push(undoAction.node.nid)
                    }
                }
                else {
                    E.scenegraph.edges["."].push(undoAction.node.nid)
                }

                // console.log("E: ", E)
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SceneHub.parseScene(E)
                console.log("MAIN ROOT: ", ATON._rootVisible)
                break;
            case "add_sphere":
                if (ATON.SemFactory.deleteSemanticNode(undoAction.node.nid)) {

                    E = {};
                    E.semanticgraph = {};
                    E.semanticgraph.nodes = {};
                    E.semanticgraph.nodes[undoAction.node.nid] = {};

                    // console.log("CANCELLAZIONEEEEEEEE")
                    console.log(E);

                    ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);

                    //if (HATHOR.paramVRC === undefined) return;
                    ATON.Photon.fireEvent("AFE_DeleteNode", {
                        t: ATON.NTYPES.SEM, nid: undoAction.node.nid
                    });
                    // console.log("MAIN ROOT: ", ATON._mainRoot)
                }
                break;
            case "del_sphere":
                E = {};
                // console.log("E 1: ", E)
                E.semanticgraph = {};
                // console.log("E 2: ", E)
                E.semanticgraph.nodes = {};
                // console.log("E 3: ", E)
                E.semanticgraph.nodes[undoAction.node.nid] = {};
                // console.log("E PRIMA: ", E)

                if (undoAction.type === ATON.FE.SEMSHAPE_SPHERE) {
                    E.semanticgraph.nodes[undoAction.node.nid].spheres = undoAction.node._points;
                }
                // if (undoAction.type === ATON.FE.SEMSHAPE_CONVEX) {
                //     E.semanticgraph.nodes[undoAction.node.nid].convexshapes = [undoAction.node.children[0].userData._convexPoints];
                // }

                // console.log("E dopo nodi: ", E)

                if (undoAction.node.getDescription()) {
                    E.semanticgraph.nodes[undoAction.node.nid].description = undoAction.node.getDescription();
                }
                if (undoAction.node.getAudio()) {
                    E.semanticgraph.nodes[undoAction.node.nid].audio = undoAction.node.getAudio();
                }

                E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);

                // console.log("E dopo edges: ", E)

                ATON.getRootSemantics().add(undoAction.node)
                ATON.SceneHub.parseScene(E)
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                // console.log("MAIN ROOT: ", ATON._mainRoot)
                break;
            case "add_convex":
                if (ATON.SemFactory.deleteSemanticNode(undoAction.node.nid)) {
                    console.log("AAAAAAAAAAAAA")
                    E = {};
                    E.semanticgraph = {};
                    E.semanticgraph.nodes = {};
                    E.semanticgraph.nodes[undoAction.node.nid] = {};

                    // console.log("CANCELLAZIONEEEEEEEE")
                    console.log(E);

                    ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);
                    console.log("BBBBBBBBBBBBBB")
                    //if (HATHOR.paramVRC === undefined) return;
                    ATON.Photon.fireEvent("AFE_DeleteNode", {
                        t: ATON.NTYPES.SEM, nid: undoAction.node.nid
                    });
                    console.log("CCCCCCCCCCCCC")
                    // ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                    console.log("MAIN ROOT: ", ATON._mainRoot)
                    // console.log("UNDO STACK: ", ATON.undoStack)
                }
                break;
            case "del_convex":
                E = {};
                // console.log("E 1: ", E)
                E.semanticgraph = {};
                // console.log("E 2: ", E)
                E.semanticgraph.nodes = {};
                // console.log("E 3: ", E)
                E.semanticgraph.nodes[undoAction.node.nid] = {};
                // console.log("E PRIMA: ", E)

                // if (undoAction.type === ATON.FE.SEMSHAPE_SPHERE) {
                //     E.semanticgraph.nodes[undoAction.node.nid].spheres = ATON.SceneHub.getJSONsemanticSpheresList(undoAction.node.nid);
                // }
                // console.log("NODE: ", undoAction)
                if (undoAction.type === ATON.FE.SEMSHAPE_CONVEX) {
                    E.semanticgraph.nodes[undoAction.node.nid].convexshapes = undoAction.node._points;
                }

                // console.log("E dopo nodi: ", E)

                if (undoAction.node.getDescription()) {
                    E.semanticgraph.nodes[undoAction.node.nid].description = undoAction.node.getDescription();
                }
                if (undoAction.node.getAudio()) {
                    E.semanticgraph.nodes[undoAction.node.nid].audio = undoAction.node.getAudio();
                }

                E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);

                // console.log("E dopo edges: ", E)

                ATON.getRootSemantics().add(undoAction.node)
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SceneHub.parseScene(E)
                // console.log("MAIN ROOT: ", ATON._mainRoot)
                break;
            case "add_manual":
                // console.log("UNDO ACTION: ", undoAction);
                E = {};
                E.semanticgraph = {};
                E.semanticgraph.nodes = {};
                E.semanticgraph.nodes[undoAction.node.nid] = {};

                E.semanticgraph.nodes[undoAction.node.nid].manualshapes = []
                E.semanticgraph.nodes[undoAction.node.nid].colors = []
                E.semanticgraph.nodes[undoAction.node.nid].widths = []
                console.log("UNDO ACTION: ", undoAction);
                console.log("E UNDO ADD MANUAL: ", E);
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SemFactory.removeAnnotationByIndex(undoAction.index, false)
                ATON.SceneHub.annotationsIndex = undoAction.index;
                break;
            case "del_manual":
                E = {};
                E.semanticgraph = {};
                E.semanticgraph.nodes = {};
                E.semanticgraph.nodes[undoAction.node.nid] = {};

                E.semanticgraph.nodes[undoAction.node.nid].manualshapes = []
                E.semanticgraph.nodes[undoAction.node.nid].colors = []
                E.semanticgraph.nodes[undoAction.node.nid].widths = []

                const Pts = [];
                for (let point in undoAction.point) {
                    // console.log(SemFactory.annotationPoints[undoAction.index][point])
                    const p = undoAction.point[point]
                    Pts.push(p.x);
                    Pts.push(p.y);
                    Pts.push(p.z);
                }
                E.semanticgraph.nodes[undoAction.node.nid].manualshapes.push(Pts);
                E.semanticgraph.nodes[undoAction.node.nid].colors.push(undoAction.color);
                E.semanticgraph.nodes[undoAction.node.nid].widths.push(undoAction.width);

                E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);
                // E.semanticgraph.edges["."].pop("manual_ann" + SemFactory.annotationsIndex);
                console.log("UNDO ACTION: ", undoAction);
                console.log("E UNDO ADD MANUAL: ", E);

                ATON._rootSem.add(undoAction.node)
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SceneHub.parseScene(E)
                // ATON.SemFactory.annotationsIndex += 1;
                break;
            case "drag":
                const node_drag = ATON.getSceneNode(undoAction.node.nid);
                const redo_position = (node_drag.isImported) ? node_drag.parent.position.clone() : node_drag.position.clone();
                console.log("UNDO ACTION POSITION: ", undoAction.position)
                console.log("REDO POSITION: ", redo_position)
                node_drag.setPosition(undoAction.position.x, undoAction.position.y, undoAction.position.z, true);
                undoAction.position = redo_position;
                break;
            case "scale":
                const node_scale = ATON.getSceneNode(undoAction.node.nid);
                const redo_scale = (node_scale.isImported) ? node_scale.parent.scale.clone() : node_scale.scale.clone();
                node_scale.setScale(undoAction.scale.x, undoAction.scale.y, undoAction.scale.z, true);
                undoAction.scale = redo_scale;
                break;
            case "rot":
                const node_rot = ATON.getSceneNode(undoAction.node.nid);
                const redo_rot = (node_rot.isImported) ? node_rot.parent.rotation.clone() : node_rot.rotation.clone();
                node_rot.setRotation(undoAction.rot.x, undoAction.rot.y, undoAction.rot.z, true);
                undoAction.rot = redo_rot;
                break;
        }
        ATON.redoStack.push(undoAction)
        console.log("UNDO STACK: ", ATON.undoStack)
        console.log("REDO STACK: ", ATON.redoStack)
    }
}

HATHOR.handleRedo = () => {
    HATHOR.cancelCurrentTask();
    if (ATON.redoStack.length > 0) {
        const redoAction = ATON.redoStack.pop();
        // TODO: gestire operazioni di redo
        let E = {};
        let S = ATON.snodes;
        switch (redoAction.action) {
            case "add_mesh":
                // if (redoAction.pivot) {
                //     redoAction.node.attachTo(redoAction.pivot)
                //     redoAction.pivot.attachTo(redoAction.parent)
                // }
                // else {
                //     redoAction.node.attachTo(redoAction.parent)
                // }
                E = {}
                E.scenegraph = {}
                E.scenegraph.nodes = {}
                E.scenegraph.edges = {}
                // console.log("SNODES: ", ATON.snodes)
                // let S = ATON.snodes;

                E.scenegraph.nodes[redoAction.pivot.nid] = {}

                E.scenegraph.nodes[redoAction.pivot.nid].urls = redoAction.pivot.sketchfabUrl;
                E.scenegraph.nodes[redoAction.pivot.nid].assetId = redoAction.pivot.assetId;
                E.scenegraph.nodes[redoAction.pivot.nid].editable = true;
                E.scenegraph.nodes[redoAction.pivot.nid].isImported = redoAction.pivot.isImported;
                E.scenegraph.nodes[redoAction.pivot.nid].isImporter = redoAction.pivot.isImporter;
                E.scenegraph.nodes[redoAction.pivot.nid].isPivotWrapper = redoAction.pivot.isPivotWrapper;
                E.scenegraph.nodes[redoAction.pivot.nid].transform = {}

                E.scenegraph.nodes[redoAction.pivot.nid].transform.scale = [redoAction.pivot.scale.x, redoAction.pivot.scale.y, redoAction.pivot.scale.z];
                E.scenegraph.nodes[redoAction.pivot.nid].transform.rotation = [redoAction.pivot.rotation.x, redoAction.pivot.rotation.y, redoAction.pivot.rotation.z];
                E.scenegraph.nodes[redoAction.pivot.nid].transform.position = [redoAction.pivot.position.x, redoAction.pivot.position.y, redoAction.pivot.position.z];

                E.scenegraph.nodes[redoAction.node.nid] = {}

                E.scenegraph.nodes[redoAction.node.nid].urls = redoAction.node.sketchfabUrl;
                E.scenegraph.nodes[redoAction.node.nid].assetId = redoAction.node.assetId;
                E.scenegraph.nodes[redoAction.node.nid].editable = true;
                E.scenegraph.nodes[redoAction.node.nid].isImported = redoAction.node.isImported;
                E.scenegraph.nodes[redoAction.node.nid].isImporter = redoAction.node.isImporter;
                E.scenegraph.nodes[redoAction.node.nid].isPivotWrapper = redoAction.node.isPivotWrapper;
                E.scenegraph.nodes[redoAction.node.nid].transform = {}

                E.scenegraph.nodes[redoAction.node.nid].transform.scale = [redoAction.node.scale.x, redoAction.node.scale.y, redoAction.node.scale.z];
                E.scenegraph.nodes[redoAction.node.nid].transform.rotation = [redoAction.node.rotation.x, redoAction.node.rotation.y, redoAction.node.rotation.z];
                E.scenegraph.nodes[redoAction.node.nid].transform.position = [redoAction.node.position.x, redoAction.node.position.y, redoAction.node.position.z];

                S = ATON.snodes;

                for (let node in S) {
                    if (!S.hasOwnProperty(S[node].parent.nid)) {
                        E.scenegraph.edges[S[node].nid] = [];
                    }
                    else {
                        if (!E.scenegraph.edges[S[node].parent.nid]) {
                            E.scenegraph.edges[S[node].parent.nid] = []
                        }
                        E.scenegraph.edges[S[node].parent.nid].push(S[node].nid)
                    }
                }

                if (redoAction.pivot) {
                    E.scenegraph.edges["."].push(redoAction.pivot.nid)
                    E.scenegraph.edges[redoAction.pivot.nid] = []
                    E.scenegraph.edges[redoAction.pivot.nid].push(redoAction.node.nid)
                }
                else {
                    E.scenegraph.edges["."].push(redoAction.node.nid)
                }

                // console.log("E: ", E)
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SceneHub.parseScene(E)
                console.log("MAIN ROOT: ", ATON._rootVisible)
                break;
            case "del_mesh":
                HATHOR.removeMesh(redoAction.node.nid, false);
                // console.log("MAIN ROOT: ", ATON._mainRoot)
                break;
            case "add_sphere":
                E = {};
                // console.log("E 1: ", E)
                E.semanticgraph = {};
                // console.log("E 2: ", E)
                E.semanticgraph.nodes = {};
                // console.log("E 3: ", E)
                E.semanticgraph.nodes[redoAction.node.nid] = {};
                // console.log("E PRIMA: ", E)

                if (redoAction.type === ATON.FE.SEMSHAPE_SPHERE) {
                    E.semanticgraph.nodes[redoAction.node.nid].spheres = redoAction.node._points;
                }
                // if (redoAction.type === ATON.FE.SEMSHAPE_CONVEX) {
                //     E.semanticgraph.nodes[redoAction.node.nid].convexshapes = ATON.SceneHub.getJSONsemanticConvexShapes(redoAction.node.nid);
                // }

                // console.log("E dopo nodi: ", E)

                if (redoAction.node.getDescription()) {
                    E.semanticgraph.nodes[redoAction.node.nid].description = redoAction.node.getDescription();
                }
                if (redoAction.node.getAudio()) {
                    E.semanticgraph.nodes[redoAction.node.nid].audio = redoAction.node.getAudio();
                }

                E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);

                // console.log("E dopo edges: ", E)

                ATON.getRootSemantics().add(redoAction.node)
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SceneHub.parseScene(E)
                console.log("MAIN ROOT: ", ATON._rootVisible)
                break;
            case "del_sphere":
                if (ATON.SemFactory.deleteSemanticNode(redoAction.node.nid)) {

                    E = {};
                    E.semanticgraph = {};
                    E.semanticgraph.nodes = {};
                    E.semanticgraph.nodes[redoAction.node.nid] = {};

                    // console.log("CANCELLAZIONEEEEEEEE")
                    console.log(E);

                    ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);

                    //if (HATHOR.paramVRC === undefined) return;
                    ATON.Photon.fireEvent("AFE_DeleteNode", {
                        t: ATON.NTYPES.SEM, nid: redoAction.node.nid
                    });
                    // console.log("MAIN ROOT: ", ATON._mainRoot)
                    // console.log("UNDO STACK: ", ATON.undoStack)
                }
                break;
            case "add_convex":
                E = {};
                // console.log("E 1: ", E)
                E.semanticgraph = {};
                // console.log("E 2: ", E)
                E.semanticgraph.nodes = {};
                // console.log("E 3: ", E)
                E.semanticgraph.nodes[redoAction.node.nid] = {};
                // console.log("E PRIMA: ", E)

                // if (redoAction.type === ATON.FE.SEMSHAPE_SPHERE) {
                //     E.semanticgraph.nodes[redoAction.node.nid].spheres = ATON.SceneHub.getJSONsemanticSpheresList(redoAction.node.nid);
                // }
                if (redoAction.type === ATON.FE.SEMSHAPE_CONVEX) {
                    E.semanticgraph.nodes[redoAction.node.nid].convexshapes = redoAction.node._points;
                }

                // console.log("E dopo nodi: ", E)

                if (redoAction.node.getDescription()) {
                    E.semanticgraph.nodes[redoAction.node.nid].description = redoAction.node.getDescription();
                }
                if (redoAction.node.getAudio()) {
                    E.semanticgraph.nodes[redoAction.node.nid].audio = redoAction.node.getAudio();
                }

                E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);

                // console.log("E dopo edges: ", E)

                ATON.getRootSemantics().add(redoAction.node)
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                // console.log("MAIN ROOT: ", ATON._mainRoot)
                break;
            case "del_convex":
                if (ATON.SemFactory.deleteSemanticNode(redoAction.node.nid)) {

                    E = {};
                    E.semanticgraph = {};
                    E.semanticgraph.nodes = {};
                    E.semanticgraph.nodes[redoAction.node.nid] = {};

                    // console.log("CANCELLAZIONEEEEEEEE")
                    console.log(E);

                    ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);

                    //if (HATHOR.paramVRC === undefined) return;
                    ATON.Photon.fireEvent("AFE_DeleteNode", {
                        t: ATON.NTYPES.SEM, nid: redoAction.node.nid
                    });
                    // console.log("MAIN ROOT: ", ATON._mainRoot)
                    // console.log("UNDO STACK: ", ATON.undoStack)
                }
                break;
            case "add_manual":
                E = {};
                E.semanticgraph = {};
                E.semanticgraph.nodes = {};
                E.semanticgraph.nodes[redoAction.node.nid] = {};

                E.semanticgraph.nodes[redoAction.node.nid].manualshapes = []
                E.semanticgraph.nodes[redoAction.node.nid].colors = []
                E.semanticgraph.nodes[redoAction.node.nid].widths = []

                const Pts = [];
                for (let point in redoAction.point) {
                    // console.log(SemFactory.annotationPoints[redoAction.index][point])
                    const p = redoAction.point[point]
                    Pts.push(p.x);
                    Pts.push(p.y);
                    Pts.push(p.z);
                }
                E.semanticgraph.nodes[redoAction.node.nid].manualshapes.push(Pts);
                E.semanticgraph.nodes[redoAction.node.nid].colors.push(redoAction.color);
                E.semanticgraph.nodes[redoAction.node.nid].widths.push(redoAction.width);

                E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);
                // E.semanticgraph.edges["."].pop("manual_ann" + SemFactory.annotationsIndex);

                console.log("REDO ACTION: ", redoAction);
                console.log("E REDO ADD MANUAL: ", E);

                ATON._rootSem.add(redoAction.node)
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SceneHub.parseScene(E);
                // ATON.SemFactory.annotationsIndex += 1;
                // console.log("UNDO STACK: ", ATON.undoStack)
                break;
            case "del_manual":
                E = {};
                E.semanticgraph = {};
                E.semanticgraph.nodes = {};
                E.semanticgraph.nodes[redoAction.node.nid] = {};

                E.semanticgraph.nodes[redoAction.node.nid].manualshapes = []
                E.semanticgraph.nodes[redoAction.node.nid].colors = []
                E.semanticgraph.nodes[redoAction.node.nid].widths = []
                console.log("E: ", E);
                ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);
                ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
                ATON.SemFactory.removeAnnotationByIndex(redoAction.index, false)
                ATON.SceneHub.annotationsIndex = redoAction.index;
                break;
            case "drag":
                const node_drag = ATON.getSceneNode(redoAction.node.nid);
                const undo_position = (node_drag.isImported) ? node_drag.parent.position.clone() : node_drag.position.clone();
                console.log("REDO ACTION POSITION: ", redoAction.position)
                console.log("UNDO POSITION: ", undo_position)
                node_drag.setPosition(redoAction.position.x, redoAction.position.y, redoAction.position.z, true);
                redoAction.position = undo_position;
                break;
            case "scale":
                const node_scale = ATON.getSceneNode(redoAction.node.nid);
                const undo_scale = (node_scale.isImported) ? node_scale.parent.scale.clone() : node_scale.scale.clone();
                node_scale.setScale(redoAction.scale.x, redoAction.scale.y, redoAction.scale.z, true);
                redoAction.scale = undo_scale;
                break;
            case "rot":
                const node_rot = ATON.getSceneNode(redoAction.node.nid);
                const undo_rot = (node_rot.isImported) ? node_rot.parent.rotation.clone() : node_rot.rotation.clone();
                node_rot.setRotation(redoAction.rot.x, redoAction.rot.y, redoAction.rot.z, true);
                redoAction.rot = undo_rot;
                break;
        }
        ATON.undoStack.push(redoAction)
        console.log("UNDO STACK: ", ATON.undoStack)
        console.log("REDO STACK: ", ATON.redoStack)
    }
}

// Add/Edit/Finalize semantic shape
HATHOR.popupAddSemantic = (semtype, esemid) => {
    if (ATON._queryDataScene === undefined) {
        return;
    }

    let htmlcontent = HATHOR._createPopupStdSem(esemid);

    if (semtype === undefined) {
        semtype = ATON.FE.SEMSHAPE_SPHERE;
    }

    // Not yet a valid convex shape
    if (semtype === ATON.FE.SEMSHAPE_CONVEX && !ATON.SemFactory.bConvexBuilding) {
        return;
    }

    if (!ATON.FE.popupShow(htmlcontent, "atonPopupLarge")) {
        return;
    }

    $("#btnRichContent").click(() => {
        $("#idSemDescCont").toggle();
    });

    let SCE = HATHOR.createSemanticTextEditor("idSemDescription");

    if (esemid === undefined) {
        //$("#semid").focus();
        //$("#semid").val("");
        ATON.FE.uiAttachInputFilterID("semid");

        $("#semid").on("input", () => {
            let semid = $("#semid").val();

            let descr = HATHOR.getHTMLDescriptionFromSemNode(semid);
            console.log("DESCR POST ENSDRONGO: ", descr);
            if (descr !== undefined) {
                //$("#idSemDescription").val(descr);
                //console.log(SCE.getBody());
                //sceditor.instance.val(descr);
                //let C = $("#idPopupContent").find("body[contenteditable='true']");
                //let C = $("body[contenteditable='true']");
                //let C = $("#idSCEditor iframe").first();
                //console.log(C);

                //C.html(descr);
                SCE.setWysiwygEditorValue(descr);

                //console.log(descr);
            }
        });
    } else {
        let descr = HATHOR.getHTMLDescriptionFromSemNode(esemid);
        if (descr !== undefined) {
            SCE.setWysiwygEditorValue(descr);
        }
    }


    let vocnote = undefined;
    let bRecVN = false;
    ATON.on("AudioRecordCompleted", (au64) => {
        vocnote = au64;
        //console.log(vocnote);

        $('#ctrlVocalNote').attr("src", au64);
    });


    $('#btnVocalNote').click(() => {
        // We start recording a vocal note
        if (!ATON.MediaFlow.isAudioRecording()) {
            bRecVN = true;
            $('#btnVocalNote').attr("class", "atonBTN atonBTN-rec");
            $('#btnVocalNote').html("<img src='" + ATON.FE.PATH_RES_ICONS + "rec.png'>STOP Recording");
            ATON.MediaFlow.startRecording();

        } else {
            $('#btnVocalNote').attr("class", "atonBTN");
            $('#btnVocalNote').html("<img src='" + ATON.FE.PATH_RES_ICONS + "talk.png'>Vocal Note");
            ATON.MediaFlow.stopRecording();
            $('#ctrlVocalNote').show();
            bRecVN = false;
        }
    });

    //$('#btnRichContent').click(()=>{ $('#idSemDescCont').toggle(); });

    $("#idAnnOK").click(() => {
        //if (ATON.MediaFlow.isAudioRecording()) return;
        // console.log("hathor.ui bRecVN: ", bRecVN)
        // console.log("hathor.ui vocnote: ", vocnote)
        if (bRecVN && vocnote === undefined) {
            return;
        }

        $("#semid").blur();
        $("#idSemDescription").blur();

        let semid = $("#semid").val();
        let psemid = $("#psemid").val();

        if (!psemid) {
            psemid = ATON.ROOT_NID;
        }

        let xxtmldescr = JSON.stringify($("#idSemDescription").val());
        //console.log(xxtmldescr);

        // console.log('hathor.ui semid: ', semid)
        // console.log('hathor.ui psemid: ', psemid)
        // console.log('hathor.ui esemid: ', esemid)
        // console.log('hathor.ui xxtmldescr: ', xxtmldescr)

        ATON.FE.popupClose();

        let S = undefined;
        const convexPoints = ATON.SemFactory.convexPoints;
        const point = ATON._queryDataScene.p;
        if (esemid === undefined) {
            if (semid === undefined || semid.length < 2 || semid === ATON.ROOT_NID) {
                return;
            }
            if (semid === psemid) {
                return;
            }

            if (semtype === ATON.FE.SEMSHAPE_SPHERE) {
                S = ATON.SemFactory.createSurfaceSphere(semid);
            }
            if (semtype === ATON.FE.SEMSHAPE_CONVEX) {
                S = ATON.SemFactory.completeConvexShape(semid);
            }
            console.log('SPHERE S: ', S)
            if (S === undefined) {
                return;
            }

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
        } else {
            S = ATON.getSemanticNode(esemid);
            if (S === undefined) return;
        }

        if (xxtmldescr && xxtmldescr.length > 2) {
            S.setDescription(xxtmldescr);
        }
        if (vocnote) {
            S.setAudio(vocnote);
        }


        let E = {};
        // console.log("E 1: ", E)
        E.semanticgraph = {};
        // console.log("E 2: ", E)
        E.semanticgraph.nodes = {};
        // console.log("E 3: ", E)
        E.semanticgraph.nodes[S.nid] = {};
        // console.log("E PRIMA: ", E)

        if (esemid === undefined) {
            if (semtype === ATON.FE.SEMSHAPE_SPHERE) {
                E.semanticgraph.nodes[S.nid].spheres = ATON.SceneHub.getJSONsemanticSpheresList(semid);
            }
            if (semtype === ATON.FE.SEMSHAPE_CONVEX) {
                E.semanticgraph.nodes[S.nid].convexshapes = ATON.SceneHub.getJSONsemanticConvexShapes(semid);
            }
        }

        // console.log("E dopo nodi: ", E)

        if (S.getDescription()) {
            E.semanticgraph.nodes[S.nid].description = S.getDescription();
        }
        if (S.getAudio()) {
            E.semanticgraph.nodes[S.nid].audio = S.getAudio();
        }

        E.semanticgraph.edges = ATON.SceneHub.getJSONgraphEdges(ATON.NTYPES.SEM);

        console.log("E dopo edges: ", E)

        // ATON.SceneHub.parseScene(E)
        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        console.log("S: ", S)
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
            // ATON._render();
            ATON.SceneHub.parseScene(E);
        }
    })
};

HATHOR.getHTMLDescriptionFromSemNode = (semid) => {
    let S = ATON.getSemanticNode(semid);
    if (S === undefined) {
        return undefined;
    }

    let descr = S.getDescription();
    if (descr === undefined) {
        return undefined;
    }

    descr = JSON.parse(descr);
    return descr;
}

HATHOR.toggleSideSemPanel = (b, content) => {
    if (b) {
        $("#idSemPanel").show(0); //, ()=>{ HATHOR._bSidePanel = true; });

        ///$("#idSemPanelBG").show(0);
        //setTimeout(()=>{ $("#idSemPanelBG").show(0); }, 1000);

        $("#idTopToolbar").hide();
        $("#idBottomToolbar").hide();
        $("#idBottomRToolbar").hide();

        if (content) $("#idSemPanel").html(content);

        ATON.FE._bPopup = true;
        HATHOR._bSidePanel = true;
        //ATON._bPauseQuery  = true;
    } else {
        if (ATON.FE._auSemNode) ATON.FE._auSemNode.stop();

        $("#idSemPanel").hide(0); //, ()=>{ HATHOR._bSidePanel = false; });
        $("#idSemPanelBG").hide(0);

        $("#idTopToolbar").show();
        // $("#idBottomToolbar").show();
        // $("#idBottomRToolbar").show();

        ATON.FE._bPopup = false;
        HATHOR._bSidePanel = false;
        //ATON._bPauseQuery  = false;

        $("#idSemPanel").html("");
    }
};

HATHOR.sideSemDescription = (semid) => {
    if (semid === undefined) {
        return;
    }
    //if (HATHOR._bSidePanel) return;

    if (ATON.FE._auSemNode) {
        ATON.FE._auSemNode.stop();
    }
    // ATON.FE.playAudioFromSemanticNode(semid);

    let semNode = ATON.getSemanticNode(semid)
    let audio = semNode.getAudio();

    let descr = HATHOR.getHTMLDescriptionFromSemNode(semid);
    // if (descr === undefined) {
    //     if (!audio) {
    //         HATHOR.toggleSideSemPanel(false);
    //         return;
    //     }
    // }

    let htmlcontent = "<div class='atonSidePanelHeader'>";
    htmlcontent += "<div class='atonSidePanelCloseBTN atonBTN atonBTN-pulseRed' onclick='HATHOR.toggleSideSemPanel(false)'><img src='" + ATON.FE.PATH_RES_ICONS + "cancel.png'></div>";
    if (ATON.SceneHub._bEdit) {
        htmlcontent += "<div class='atonSidePanelTopRightBTN atonBTN' id='btnEditSem' style='display:none;'><img src='" + ATON.FE.PATH_RES_ICONS + "edit.png'></div>";
    }
    htmlcontent += semid + "</div>";

    if (descr === undefined) {
        htmlcontent += "<div class='atonSidePanelContent'>No text added. Edit to add description.</div>";
    } else {
        htmlcontent += "<div class='atonSidePanelContent'>" + descr + "</div>";
    }

    if (audio) {
        htmlcontent += "<div style='position: absolute; bottom: 30px; width: 90%'><audio src='" + audio + "' id='ctrlVocalNoteSide' controls style='width: 100%'></audio></div>";
    }

    HATHOR.toggleSideSemPanel(true, htmlcontent);

    const data = {
        'html': htmlcontent
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
        fetch('https://localhost:8084/' + 'show_ann', options)
            .then(r => console.log(r))
            .catch(error => console.log(error));
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }


    ATON.FE.checkAuth((r) => {
        let authUser = r.username;

        if (authUser) {
            console.log("PROVA1")
            $("#btnEditSem").show();
            $("#btnEditSem").click(() => {
                HATHOR.toggleSideSemPanel(false);
                ATON.FE.subPopup(() => {
                    HATHOR.popupAddSemantic(undefined, semid);
                });
            });
        }
    });
};

HATHOR.popupSemDescription = (semid) => {
    if (semid === undefined) return;

    ATON.FE.playAudioFromSemanticNode(semid);

    let descr = HATHOR.getHTMLDescriptionFromSemNode(semid);
    if (descr === undefined) {
        return;
    }

    let htmlcontent = "<div class='atonPopupTitle'>";
    if (ATON.SceneHub._bEdit) htmlcontent += "<div class='atonBTN' id='btnEditSem' style='display:none;'><img src='" + ATON.FE.PATH_RES_ICONS + "edit.png'></div>";
    htmlcontent += semid + "</div>";

    htmlcontent += "<div class='atonPopupDescriptionContainer'>" + descr + "</div>";

    if (!ATON.FE.popupShow(htmlcontent, "atonPopupCompact")) {
        return;
    }

    ATON.FE.checkAuth((r) => {
        let authUser = r.username;

        if (authUser) {
            $("#btnEditSem").show();
            $("#btnEditSem").click(() => {
                ATON.FE.subPopup(() => {
                    HATHOR.popupAddSemantic(undefined, semid);
                });
            });
        }
    });
};

HATHOR.popupExportSemShapes = () => {
    let htmlcontent = "<div class='atonPopupTitle'>Export</div>";

    htmlcontent += "<label for='semid'>Semantic Node ID:</label><br>";
    htmlcontent += "<div class='select' style='width:250px;'><select id='semid'>";
    htmlcontent += "<option value=''></option>";
    for (let s in ATON.semnodes) {
        if (s !== ATON.ROOT_NID) {
            htmlcontent += "<option value='" + s + "'>" + s + "</option>"
        }
    }
    htmlcontent += "</select><div class='selectArrow'></div></div><br><br>";

    htmlcontent += "<label for='idxformat'>3D format:</label><br>";
    htmlcontent += "<div class='select' style='width:150px;'><select id='idxformat'>";
    htmlcontent += "<option value='.glb'>GLTF (*.glb)</option>";
    htmlcontent += "<option value='.obj'>OBJ</option>";
    htmlcontent += "</select><div class='selectArrow'></div></div>";

    htmlcontent += "<br><br>";
    htmlcontent += "<a class='atonBTN atonBTN-green' id='downloadInfo' style='width:80%; display: none'><img src='" + ATON.FE.PATH_RES_ICONS + "download.png'>Download HTML file</a>";
    htmlcontent += "<div class='atonBTN atonBTN-green' id='idExport' style='width:80%'><img src='" + ATON.FE.PATH_RES_ICONS + "download.png'>EXPORT 3D OBJ</div>";

    if (!ATON.FE.popupShow(htmlcontent)) {
        return;
    }

    let exportButton = document.getElementById("downloadInfo")

    $('#semid').on('change', function () {
        let semanticNode = ATON.getSemanticNode(this.value);
        if (semanticNode.userData.description || semanticNode.userData.audio) {
            $("#downloadInfo").show()

            if (semanticNode.userData.description && semanticNode.userData.audio) {
                exportButton.textContent = 'Download Files';
            }
            if (!semanticNode.userData.description) {
                exportButton.textContent = 'Download Audio File';
            }
            if (!semanticNode.userData.audio) {
                exportButton.textContent = 'Download HTML File';
            }
        } else {
            $("#downloadInfo").hide()
        }
    });

    $("#downloadInfo").click(() => {
        let semid = $("#semid").val();
        let S = ATON.getSemanticNode(semid);
        console.log("NODO", S)

        // const doc = new jsPDF()
        //
        // doc.fromHTML(bodyContent, 15, 15, {
        //     width: 170
        // });

        if (S.userData.description && S.userData.audio) {
            HATHOR.downloadSemanticInfo(exportButton, semid, S.userData.description, S.userData.audio)
        }
        if (!S.userData.description) {
            HATHOR.downloadSemanticInfo(exportButton, semid, undefined, S.userData.audio)
        }
        if (!S.userData.audio) {
            HATHOR.downloadSemanticInfo(exportButton, S.userData.description)
        }

    })

    $("#idExport").click(() => {
        let semid = $("#semid").val();
        let ext = $("#idxformat").val();

        if (semid.length > 0) {
            let S = ATON.getSemanticNode(semid);
            if (S) {
                for (let s in S.children) {
                    ATON.Utils.exportNode(S.children[s], semid + String(s) + ext);
                }
            }
        }
    });
};

HATHOR.downloadAudioIfExist = (audioContent, semid) => {
    let link = document.createElement('a');
    link.href = audioContent;
    link.setAttribute('download', semid + 'Audio.mp3');
    document.getElementsByTagName("body")[0].appendChild(link);
    // Firefox
    if (document.createEvent) {
        let event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        link.dispatchEvent(event);
    }
    // IE
    else if (link.click) {
        link.click();
    }
    link.parentNode.removeChild(link);
}

HATHOR.download = (zip, item) => {
    //download single file as blob and add it to zip archive
    return axios.get(item.url, {responseType: "blob"}).then((resp) => {
        zip.file(item.name, resp.data);
    });
};

//call this function to download all files as ZIP archive
HATHOR.downloadAll = (zip, fileArr, semid) => {
    const arrOfFiles = fileArr.map((item) => HATHOR.download(zip, item)); //create array of promises
    Promise.all(arrOfFiles)
        .then(() => {
            //when all promises resolved - save zip file
            zip.generateAsync({type: "blob"}).then(function (blob) {
                saveAs(blob, semid + ".zip")
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

HATHOR.downloadSemanticInfo = (exportButton, semid, description, audioContent) => {

    if (description !== undefined) {

        let S = ATON.getSemanticNode(semid)

        let bodyContent = S.userData.description.slice(1, -1); // remove first and last character (")
        bodyContent = bodyContent.replace(/\\/g, ''); // remove \ before "

        console.log(bodyContent);
        // Create the HTML content as a string
        const htmlContent = "<html>" +
            "<head>" +
            "<title>" + semid + "</title>" +
            "</head>" +
            "<body style='padding: 2em; font-size: 1.2em'>" +
            "<h2>" + semid + " Semantic Text</h2>" +
            bodyContent +
            "</body>" +
            "</html>"

        // Create a Blob from the HTML content
        const blob = new Blob([htmlContent], {type: 'text/html'});

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);


        if (audioContent) {

            const zip = new JSZip();

            const fileArr = [
                {
                    name: semid + '.html',
                    url: url,
                },
                {
                    name: semid + '.mp3',
                    url: audioContent,
                }
            ];
            // let ext = $("#idxformat").val();
            // for (let s in S.children) {
            //     HATHOR.getUrl3DObject(S.children[s], semid + String(s) + ext, fileArr)
            //     // ATON.Utils.exportNode(S.children[s], semid + String(s) + ext);
            // }

            exportButton.textContent = 'Download Files';
            HATHOR.downloadAll(zip, fileArr, semid)
            // HATHOR.downloadAudioIfExist(audioContent, semid)

        } else {
            //download html
            exportButton.href = url;
            exportButton.download = semid + '.html';
            exportButton.textContent = 'Download HTML File';
        }

    } else {
        exportButton.textContent = 'Download Audio File';
        HATHOR.downloadAudioIfExist(audioContent, semid)
    }

}
//
// HATHOR.getUrl3DObject = (node, filename, fileArr) => {
//     let ext = ATON.Utils.getFileExtension(filename);
//
//     if (ext.length < 1) return;
//
//     // GLTF
//     if (ext === "glb" || ext === "gltf") {
//         let bBin = (ext === "glb");
//
//         let opts = {
//             //trs: true, // Export position, rotation and scale instead of matrix per node. Default is false
//             binary: bBin, // Export in binary (.glb) format, returning an ArrayBuffer. Default is false
//             //onlyVisible: false,
//             //truncateDrawRange: true
//         };
//
//         if (ATON.Utils.exporterGLTF === undefined) {
//             ATON.Utils.exporterGLTF = new THREE.GLTFExporter();
//         }
//
//         ATON.Utils.exporterGLTF.parse(node, (output) => {
//             if (output instanceof ArrayBuffer) {
//                 // Utils.downloadArrayBuffer(output, filename);
//                 console.log("OOO", output)
//                 fileArr.push({
//                     name: filename,
//                     url: new Blob([output], {type: 'application/octet-stream'}),
//                 })
//             } else {
//                 // console.log(output);
//                 // Utils.downloadJSONobj(output, filename);
//                 console.log("OOO1", output)
//                 fileArr.push({
//                     name: filename,
//                     url: new Blob([JSON.stringify(output)], {type: 'text/plain'}),
//                 })
//             }
//         }, opts);
//     }
//
//     // OBJ format
//     if (ext === "obj") {
//         if (ATON.Utils.exporterOBJ === undefined) {
//             ATON.Utils.exporterOBJ = new THREE.OBJExporter();
//         }
//
//         let output = ATON.Utils.exporterOBJ.parse(node);
//         //console.log(output);
//         // Utils.downloadText(output, filename);
//         fileArr.push({
//             name: filename,
//             url: new Blob([output], {type: 'text/plain'}),
//         })
//     }
//
//     // USDZ
//     if (ext === "usdz") {
//         if (ATON.Utils.exporterUSDZ === undefined) {
//             ATON.Utils.exporterUSDZ = new THREE.USDZExporter();
//         }
//
//         $("#idLoader").show();
//         //ATON._bPauseQuery = true;
//
//         ATON.Utils.exporterUSDZ.parse(node).then((output) => {
//             // Utils.downloadArrayBuffer(output, filename);
//             fileArr.push({
//                 name: filename,
//                 url: new Blob([output], {type: 'application/octet-stream'}),
//             })
//             //ATON._bPauseQuery = false;
//             $("#idLoader").hide();
//         });
//
//     }
//     console.log("ARR", fileArr)
// }

// General scene info
HATHOR.popupSceneInfo = () => {
    let head = ATON.SceneHub.getTitle();
    if (head === undefined) head = ATON.SceneHub.currID;

    let descr = ATON.SceneHub.getDescription();

    let htmlcontent = "";

    htmlcontent += "<div class='atonPopupTitle'>";
    if (ATON.SceneHub._bEdit) htmlcontent += "<div class='atonBTN' id='btnEditInfo' style='display:none;'><img src='" + ATON.FE.PATH_RES_ICONS + "edit.png'></div>";
    htmlcontent += head + "</div>";

    //htmlcontent += "<div class='atonBTN atonBTN-gray' id='btnEditInfo' style='display:none; float:left'><img src='"+ATON.FE.PATH_RES_ICONS+"edit.png'></div>";
    //htmlcontent += "<div class='atonPopupTitle'>"+head+"</div>";
    if (descr) htmlcontent += "<div class='atonPopupDescriptionContainer'>" + JSON.parse(descr) + "</div>";

    htmlcontent += "<div class='atonBTN atonBTN-green' id='btnOK' style='width:90%'>OK</div>";

    if (!ATON.FE.popupShow(htmlcontent, "atonPopupCompact")) return;

    $("#btnOK").click(() => {
        ATON.FE.popupClose();
    });

    ATON.FE.checkAuth((r) => {
        let authUser = r.username;

        if (authUser) {
            $("#btnEditInfo").show();
            $("#btnEditInfo").click(() => {
                ATON.FE.subPopup(HATHOR.popupEditSceneInfo);
            });
        }
    });
};

HATHOR.popupCC = () => {
    let htmlcontent = "<div class='atonPopupTitle'>Assets Copyright</div>";

    let numCC = ATON.CC.list.length;

    htmlcontent += "<div style='text-align:left;'>";
    htmlcontent += "Assets referenced in this scene contain " + numCC + " copyright information<br>";
    for (let cc in ATON.CC.list) {
        let CC = ATON.CC.list[cc];

        htmlcontent += "<div class='atonBlockRound' style='display:block; max-width:400px'>";

        for (let e in CC) {
            htmlcontent += "<strong>" + e + "</strong>: " + ATON.Utils.URLify(CC[e]) + "<br>";
        }

        htmlcontent += "</div>";
    }
    htmlcontent += "</div>";

    if (!ATON.FE.popupShow(htmlcontent)) return;
};

HATHOR.popupPOV = () => {
    let pov = ATON.Nav.copyCurrentPOV();
    console.log(pov);

    let htmlcontent = "<div class='atonPopupTitle'>Viewpoint</div>";

    htmlcontent += "<div class='atonBlockRound' style='padding:2px; display:block; background-color:rgba(0,255,0, 0.1)'>";
    htmlcontent += "<div style='text-align:right;'>";

    let strCurrEye = pov.pos.x.toPrecision(3) + "," + pov.pos.y.toPrecision(3) + "," + pov.pos.z.toPrecision(3);
    let strCurrTgt = pov.target.x.toPrecision(3) + "," + pov.target.y.toPrecision(3) + "," + pov.target.z.toPrecision(3);

    //htmlcontent += "<strong>Position</strong>: "+pov.pos.x.toPrecision(3)+","+pov.pos.y.toPrecision(3)+","+pov.pos.z.toPrecision(3)+"<br>";
    //htmlcontent += "<strong>Target</strong>: "+pov.target.x.toPrecision(3)+","+pov.target.y.toPrecision(3)+","+pov.target.z.toPrecision(3)+"<br>";
    //htmlcontent += "<strong>FoV</strong>: "+pov.fov+"<br>";
    htmlcontent += "<strong>Position</strong>: <input id='idPOVeye' type='text' size='20' placeholder='x,y,z' value='" + strCurrEye + "'><br>";
    htmlcontent += "<strong>Target</strong>: <input id='idPOVtgt' type='text' size='20' placeholder='x,y,z' value='" + strCurrTgt + "'><br>";
    htmlcontent += "<strong>FoV</strong>: <input id='idPOVfov' type='text' size='20' placeholder='f' value='" + pov.fov + "'><br>";

    htmlcontent += "</div>";

    htmlcontent += "<div class='atonBTN atonBTN-green atonBTN-horizontal atonBTN-text' id='btnPOVgo'><img src='" + ATON.FE.PATH_RES_ICONS + "pov.png'>Go</div>";
    htmlcontent += "</div><br>";

    htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-horizontal atonBTN-text' id='btnPOVsetHome'><img src='" + ATON.FE.PATH_RES_ICONS + "home.png'>Set as Home</div><br>";
    htmlcontent += "<div class='atonBlockRound' style='padding:2px; display:block; background-color:rgba(255,255,2555, 0.1)'>";
    htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-horizontal atonBTN-text' id='btnPOVadd'><img src='" + ATON.FE.PATH_RES_ICONS + "pov.png'>Add current viewpoint</div>";
    htmlcontent += "as: <input id='idPOVid' type='text' size='15' placeholder='Viewpoint-ID' value='" + ATON.Utils.generateID("pov") + "'></div>";
    /*
        htmlcontent += "<img id='idPOVmodeIcon' src='"+ATON.FE.PATH_RES_ICONS+"home.png' class='atonDefIcon'>&nbsp;";
        htmlcontent += "<div class='select' style='width:250px;'><select id='idPOVmode'>";
        htmlcontent += "<option value='h'>Set viewpoint as Home</option>";
        htmlcontent += "<option value='v'>Add viewpoint</option>";
        htmlcontent += "</select><div class='selectArrow'></div></div><br><br>";

        htmlcontent += "<div id='idPOVmodeHome'>";
        htmlcontent += "";
        htmlcontent += "</div>";

        htmlcontent += "<div id='idPOVmodeAdd' style='display:none'>";
        htmlcontent += "<label for='idPOVkword'>keywords (comma-separated)</label><br><input id='idPOVkwords' type='text'>";
        htmlcontent += "</div>";

        htmlcontent += "<div class='atonBTN atonBTN-green' id='btnPOV' style='width:90%'>OK</div>"; // <img src='"+FE.PATH_RES_ICONS+"pov.png'>
    */
    if (!ATON.FE.popupShow(htmlcontent)) return;

    let povid = undefined;

    $("#btnPOVgo").click(() => {
        let eye = $("#idPOVeye").val();
        let tgt = $("#idPOVtgt").val();
        let fov = $("#idPOVfov").val();

        eye = eye.split(",");
        tgt = tgt.split(",");

        if (eye.length !== 3 || tgt.length !== 3) return;

        let goPOV = new ATON.POV();
        goPOV.setPosition(
            parseFloat(eye[0]),
            parseFloat(eye[1]),
            parseFloat(eye[2])
        );
        goPOV.setTarget(
            parseFloat(tgt[0]),
            parseFloat(tgt[1]),
            parseFloat(tgt[2])
        );
        goPOV.setFOV(parseFloat(fov));

        ATON.Nav.requestPOV(goPOV);
    });

    $("#btnPOVsetHome").click(() => {
        povid = "home";

        ATON.Nav.setHomePOV(pov);

        ATON.FE.popupClose();

        let E = {};
        E.viewpoints = {};
        E.viewpoints[povid] = {};
        E.viewpoints[povid].position = [pov.pos.x, pov.pos.y, pov.pos.z];
        E.viewpoints[povid].target = [pov.target.x, pov.target.y, pov.target.z];
        E.viewpoints[povid].fov = pov.fov;

        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);


    });

    $("#btnPOVadd").click(() => {
        povid = $("#idPOVid").val().trim(); //ATON.Utils.generateID("pov");
        if (povid.length < 3) return;

        pov.as(povid);

        //console.log(pov)

        ATON.Nav.addPOV(pov);
        HATHOR.uiUpdatePOVs();

        ATON.FE.popupClose();

        let E = {};
        E.viewpoints = {};
        E.viewpoints[povid] = {};
        E.viewpoints[povid].position = [pov.pos.x, pov.pos.y, pov.pos.z];
        E.viewpoints[povid].target = [pov.target.x, pov.target.y, pov.target.z];
        E.viewpoints[povid].fov = pov.fov;

        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
    });

    /*
        $("#idPOVmode").on("change",()=>{
            let mode = $("#idPOVmode").val();

            if (mode === 'h'){
                $("#idPOVmodeIcon").attr("src",ATON.FE.PATH_RES_ICONS+"home.png");
                $("#idPOVmodeHome").show();
                $("#idPOVmodeAdd").hide();
            }
            else {
                $("#idPOVmodeIcon").attr("src",ATON.FE.PATH_RES_ICONS+"pov.png");
                $("#idPOVmodeHome").hide();
                $("#idPOVmodeAdd").show();
            }
        });

        $("#btnPOV").click(()=>{
            let mode = $("#idPOVmode").val();
            let povid = "home";

            // Home
            if (mode === 'h'){
                ATON.Nav.setHomePOV( pov );
            }
            // New viewpoint
            else {
                povid = ATON.Utils.generateID("pov");
                pov.as(povid);

                let kwords = $("#idPOVkwords").val();
                if (kwords.length>1) pov.addKeywords(kwords);

                ATON.Nav.addPOV(pov);
                HATHOR.uiUpdatePOVs();
            }

            ATON.FE.popupClose();

            let E = {};
            E.viewpoints = {};
            E.viewpoints[povid] = {};
            E.viewpoints[povid].position = [pov.pos.x, pov.pos.y, pov.pos.z];
            E.viewpoints[povid].target   = [pov.target.x, pov.target.y, pov.target.z];
            E.viewpoints[povid].fov      = pov.fov;

            ATON.SceneHub.sendEdit( E, ATON.SceneHub.MODE_ADD);
            ATON.Photon.fireEvent("AFE_AddSceneEdit", E);

            console.log(pov);
        });
    */
};

HATHOR.popupGraphs = () => {
    let htmlcontent = "<div class='atonPopupTitle'>Layers</div>";

    ATON.useGizmo(true);

    htmlcontent += "<div>";

    let dBlock = "<div style='display:inline-block; text-align:left; margin:10px; vertical-align:top; min-width:150px;'>";

    // Scene
    htmlcontent += dBlock;
    //htmlcontent += "<div style='text-align:center'><b>STANDARD</b></div><br>";
    htmlcontent += ATON.FE.uiCreateGraph(ATON.NTYPES.SCENE);
    //htmlcontent += "<div id='idNewNID' class='atonBTN atonBTN-green atonBTN-horizontal'>NEW</div>";
    htmlcontent += "</div>";

    // Semantics
    let semchk = ATON._rootSem.visible ? "checked" : "";
    htmlcontent += dBlock;
    //htmlcontent += "<div style='text-align:center'><b>SEMANTIC</b></div><br>";
    htmlcontent += "<input type='checkbox' " + semchk + " id='idToggleSem'>Semantic Annotations";
    htmlcontent += "</div>";
    /*
        if (Object.keys(ATON.semnodes).length > 1){
            htmlcontent += dBlock;
            htmlcontent += "<div style='text-align:center'><b>SEMANTIC</b></div><br>";
            htmlcontent += ATON.FE.uiCreateGraph(ATON.NTYPES.SEM);
            htmlcontent += "</div>";
        }
    */
    // Measurements
    if (ATON.SUI.gMeasures.children.length > 0) {
        let chk = ATON.SUI.gMeasures.visible ? "checked" : "";
        htmlcontent += dBlock;
        htmlcontent += "<div style='text-align:center'><b>MEASUREMENTS</b></div><br>";
        htmlcontent += "<div class='atonBTN atonBTN-red' style='width:100%' id='btnClearMeas'><img src='" + ATON.FE.PATH_RES_ICONS + "trash.png'>Delete all</div>";
        htmlcontent += "<input type='checkbox' " + chk + " onchange=\"ATON.SUI.gMeasures.toggle(this.checked);\">Show<br>";
        htmlcontent += "</div>";
    }

    if (!ATON.FE.popupShow(htmlcontent /*,"atonPopupLarge"*/)) return;

    $("#idToggleSem").click(() => {
        ATON._rootSem.toggle();
    });

    $("#btnClearMeas").click(() => {
        ATON.SUI.clearMeasurements();

        let E = {};
        E.measurements = {};
        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);
        ATON.Photon.fireEvent("AFE_ClearMeasurements");
    });

    $("#idNewNID").click(() => {
        ATON.FE.subPopup(() => {
            ATON.FE.popupNewNode(ATON.NTYPES.SCENE);
        });
    });

};

HATHOR.popupAddLink = (name, type, url, thumb, assetId) => {
    let htmlcontent = "";

    htmlcontent = "<div class='atonPopupTitle'>";
    htmlcontent += "Add tag for the selected object</div>";
    htmlcontent += "Tag:<input id='skl_tag' type='text' maxlength='100' size='15' >";
    htmlcontent += "<br>";
    htmlcontent += "<div class='atonBTN atonBTN-green atonBTN-horizontal' id='idAddOK'>ADD</div>";

    if (!ATON.FE.popupShow(htmlcontent /*,"atonPopupLarge"*/)) return;

    $('#idAddOK').on('click', () => {
        // const name = $('#skl_name').val()
        // const type = $('#skl_type').val()
        // const url = $('#skl_url').val()
        const tag = $('#skl_tag').val()
        // const assid = $('#skl_assid').val()

        ATON.FE.checkAuth((r) => {
            const username = r.username
            const newObj = {
                name: name,
                type: type,
                url: url,
                tag: tag,
                assetId: assetId,
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
                    $('#idPopup').hide();
                    $('#idPopup').html('');
                    $('#idTopToolbar').show();
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
}

HATHOR.popupAddmesh = () => {
    // console.log("ADDABLES: ", ATON._userObjects)
    const obj_lst = ATON._userObjects;

    // ATON.FE.uiShowObjects();
    let htmlcontent = "<div class='atonPopupTitle'>Choose an object to add</div>";
    //
    // // ATON.useGizmo(true);
    //
    htmlcontent += "<div>";
    //
    // let dBlock = "<div style='display:inline-block; text-align:left; margin:10px; vertical-align:top; min-width:150px;'>";
    let dBlock = "<div class=\"offcanvas-body small\" style=\"padding-top: 0\">\n" +
        "                   <div id=\"container\" style=\"white-space: nowrap\"></div>\n" +
        "                </div>"
    // // Scene
    htmlcontent += dBlock;
    let obj_index = 0;

    for (let obj in obj_lst) {
        // console.log(obj)
        // console.log(obj_lst[obj])
        // console.log(obj_lst[obj].url.split("/"))
        let urlSplitted = obj_lst[obj].url.split("/");
        let urlBuilder = "";
        for (let i = 0; i < urlSplitted.length; i++) {
            if (i === 4) urlBuilder += obj_lst[obj].assetId + "/embed";
            else  urlBuilder += urlSplitted[i].replace("3d-models", "models") + "/";

        }
        // console.log("urlBuilder: ", urlBuilder)
        // htmlcontent += `<div id='idObjCard_${obj_index}' class='atonCARD'>` +
        //     `<img src="${obj_lst[obj].imgurl}" alt="${obj.toString()}">` +
        //     `<div id='idCardTitle_${obj_index}' class='atonPopupTitle'>${obj.toString()}</div></div>`;
        htmlcontent += "<div class='card' style='width: 18rem; cursor: pointer; display: inline-block; margin: 1%'> " +
            "<iframe class='card-img-top' title=" + obj_lst[obj].name + " " +
            "frameborder='0' allowfullscreen mozallowfullscreen='true' webkitallowfullscreen='true'" +
            "allow='autoplay; fullscreen; xr-spatial-tracking' xr-spatial-tracking " +
            "execution-while-out-of-viewport execution-while-not-rendered web-share " +
            "src=" + urlBuilder + "?autospin=1&autostart=1&camera=0" +
            "> </iframe> " +
            "<div class='card-body'>" +
            "<p class='card-title' style='font-size: 1.3em; font-weight: bold'> " + obj_lst[obj].name + "</p>" +
            "<button data-bs-dismiss='offcanvas' id=" + obj_lst[obj].assetId + " class='btn btn-success' >Add Model</button>" +
            "</div>" +
            "</div>"
        obj_index += 1;
    }
    htmlcontent += "</div>";

    if (!ATON.FE.popupShow(htmlcontent /*,"atonPopupLarge"*/)) return;

    for (let obj in obj_lst) {
        $("#" + obj_lst[obj].assetId).on("click", () => {
            let obj_count = 0;
            // console.log("ATON SNODES: ", ATON.snodes)
            for (let node in ATON.snodes) {
                if (node === "pivot_wrapper_" + obj_lst[obj].name + "_objcount" + obj_count) obj_count += 1;
                // console.log("OBJ COUNT: ", obj_count)
                // console.log("NODE: ", node)
                // console.log("NAME TO CHECK: ", "pivot_wrapper_" + obj_lst[obj].name + "_objcount" + obj_count)
            }
            let cubeXYZ = {
                x: 2,
                y: 2,
                z: 2
            };
            $('#idPopup').hide();
            $('#idPopup').html('');
            $('canvas').on('click', canvasClickHandler)
            function canvasClickHandler(event) {
                // Get the mouse coordinates from the event object
                const mouseX = (event.pageX / window.innerWidth) * 2 - 1;
                const mouseY = -(event.pageY / window.innerHeight) * 2 + 1;

                ATON._rcScene.setFromCamera(new THREE.Vector2(mouseX, mouseY), ATON.Nav._camera);

                let intersects = [];

                ATON._rcScene.intersectObjects(ATON._mainRoot.children, true, intersects);

                /*if (intersects.length > 0) {
                    console.log('Coordinate 3d: ', intersects[0].point) ;
                }*/
                // console.log("sketch url: ", )
                HATHOR.addSketchfabNode(obj_lst[obj].assetId, obj_lst[obj].name + "_objcount" + obj_count, undefined, obj_lst[obj].tag, obj_count, cubeXYZ, undefined, intersects[0].point.x, intersects[0].point.z, "https://sketchfab.com/models/" + obj_lst[obj].assetId)
                // const actNode = ATON.getSceneNode(obj_lst[obj].name + "_objcount" + obj_count);
                // const parNode = actNode.parent
                // console.log("NODE: ", actNode)
                // console.log("PAR NODE: ", actNode.parent)
                // console.log("PARENT: ", actNode.parent)
                // const stackInfo = {
                //     action: "add_mesh",
                //     name: obj_lst[obj].name + "_objcount" + obj_count,
                //     node: actNode,
                    // pivot: (parNode.isPivotWrapper) ? parNode : undefined,
                    // parent: (parNode.isPivotWrapper) ? parNode.parent : parNode
                // }
                // ATON.undoStack.push(stackInfo);
                // console.log("UNDO STACK: ", ATON.undoStack)
                // Remove the click event listener after the first click
                $('canvas').off('click', canvasClickHandler);
            }
        })
    }
    /*for (let i = 0; i <= obj_index; i++) {
        $(`#idObjCard_${i}`).click((event) => {
            if (event.button === 0) {
                const sel_obj = $(`#idCardTitle_${i}`).text();
                // const sel_obj = sel_obj_el.innerText;
                // console.log("SELECTED OBJ: ", sel_obj);
                // console.log("obj: ", obj_lst[sel_obj]);
                // console.log("ATON NODES: ", ATON.snodes);
                // console.log("ATON EDGES: ", ATON.sedges);
                // console.log("ATON SEMANTIC: ", ATON.semnodes);
                let adding_obj = true;
                let obj_counter = 0;
                for (let node in ATON.snodes) {
                    // console.log("BASTONE NODOSO: ", node)
                    if (node.includes(sel_obj)) obj_counter += 1;
                }
                // console.log("obj counter: ", obj_counter);

                // let N = sel_obj + obj_counter;
                let G = ATON.getOrCreateSceneNode(sel_obj + obj_counter).removeChildren();

                let urls = obj_lst[sel_obj].urls;
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

                $('#idPopup').hide();
                $('#idPopup').html('');
                // alert("select a point where place the object")
                ATON._renderer.domElement.addEventListener('mousedown', (e) => {
                    if (e.button === 0 && adding_obj) {
                        const h = ATON._hitsScene[0];
                        G.setPosition(h.point.x, 0, h.point.z)
                            .setEditable()
                            .attachToRoot()
                            .show();
                        ATON.Photon.fireEvent("nodeSpawn", {name: sel_obj + obj_counter, urls: urls, points: h});
                        // ATON._renderer.removeEventListener('mousedown');
                        adding_obj = false;
                    }
                })

            }
        });
    }*/
};

HATHOR.setDelMode = () => {
    HATHOR._actState = HATHOR.REMOVE_OBJECT;
    $("#btn-cancel").show();
}

HATHOR.removeMesh = async (passedNID = undefined, pushInStack = true, E = {
    scenegraph: {
        nodes: {},
        edges: {}
    }
}, childs = undefined, sendDelete = true) => {
    // console.log("HOOVERED SCENE NODE: ", ATON._hoveredSceneNode)
    // debugger;
    // console.log("SNODES: ", ATON.snodes)

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let remNode = ATON.getSceneNode(ATON._hoveredSceneNode)
    // console.log("REMNODE: ", remNode)
    // console.log("REMNODE CHILDRENS: ", remNode.children)
    if (passedNID) remNode = ATON.getSceneNode(passedNID);
    if (childs) remNode = childs;
    let parNode = remNode.parent;
    // console.log("PAR NODE: ", parNode)
    let grandParNode;
    if (parNode.isPivotWrapper) grandParNode = parNode.parent;
    // console.log("PAR PAR NODE: ", grandParNode)
    // await sleep(500)
    // if (passedData) parNode = (passedData.pivot) ? passedData.pivot : passedData.parent

    if (remNode.children.length > 0) {
        for (let child in remNode.children) {
            if (remNode.children[child].isPivotWrapper) HATHOR.removeMesh(undefined, undefined, false, E, remNode.children[child].children[0], false)
        }
    }

    if (parNode && parNode.isPivotWrapper) {
        // console.log("SNODES PRIMA DEL: ", ATON.snodes)
        // console.log("parNode: ", parNode)
        // console.log("remNode: ", remNode)
        E.scenegraph.nodes[remNode.nid] = {};
        E.scenegraph.edges[remNode.nid] = [];
        E.scenegraph.nodes[parNode.nid] = {};
        E.scenegraph.edges[parNode.nid] = [];
        delete ATON.snodes[remNode.nid];
        delete ATON.snodes[parNode.nid];
        // console.log("SNODES DOPO 1 DEL: ", ATON.snodes)
    } else {
        E.scenegraph.nodes[remNode.nid] = {};
        E.scenegraph.edges[remNode.nid] = [];
        delete ATON.snodes[remNode.nid];
    }

    // for (const [key, value] of Object.entries(ATON.snodes)) {
    //     console.log(`${key}: ${value}`);
    // }

    for (let node in ATON.snodes) {
        // console.log("NODE NAME: ", node)
        // console.log("NODE: ", ATON.snodes[node])
        if (ATON.snodes[node] === undefined) {
            delete ATON.snodes[node]
        }
    }

    if (sendDelete) {
        // console.log("E: ", E)
        if (pushInStack) {
            remNode.parent = parNode;
            if (grandParNode) remNode.parent.parent = grandParNode;
            const stackInfo = {
                action: "del_mesh",
                name: remNode.nid,
                node: remNode,
                pivot: (parNode.isPivotWrapper) ? parNode : undefined,
                parent: (parNode.isPivotWrapper) ? grandParNode : parNode
            }
            ATON.undoStack.push(stackInfo);
        }
        // console.log("UNDO STACK: ", ATON.undoStack)

        if (remNode) remNode.delete();
        if (parNode) parNode.delete();

        // debugger;
        // ATON.SceneHub.parseScene(E);
        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);

        ATON.Photon.fireEvent("AFE_DeleteNode", {
            t: ATON.NTYPES.SCENE, nid: parNode && parNode.isPivotWrapper ? parNode.nid : remNode.nid
        });

        HATHOR._actState = HATHOR.SELECTION_STD;
        if (ATON.getUINode("sui_delmesh").getBSwitched()) {
            ATON.getUINode("sui_delmesh").switch(false);
        }
        $("#btn-cancel").hide();


    }
    // await sleep(500);
    // console.log("SNODES FINE REM MESH: ", ATON.snodes)
};

HATHOR.popupEnvironment = () => {
    let htmlcontent = "<div class='atonPopupTitle'>Environment</div>";

    htmlcontent += "<div style='text-align:left'>";

    let bMainLight = ATON.isMainLightEnabled();
    let bShadows = ATON._renderer.shadowMap.enabled;

    htmlcontent += "<div style='text-align:center;'>Exposure (<span id='idExpVal'></span>)<br>";
    htmlcontent += "<input id='idExposure' type='range' min='0.05' max='10.0' step='0.05' >";
    htmlcontent += "</div><br>";

    let str = (bMainLight) ? "checked" : "";
    htmlcontent += "<div id='idOptLight' class='atonOptionBlockShort' >";
    htmlcontent += "<input type='checkbox' id='idDirLight' " + str + "><b>Direct light</b><br>";
    htmlcontent += "<img src='" + ATON.FE.PATH_RES_ICONS + "light.png' class='atonDefIcon' style='float:left'>you can enable a main directional light (you can control it by pressing 'l' key)</div>";

    str = (bShadows) ? "checked" : "";
    htmlcontent += "<div id='idOptShadows' class='atonOptionBlockShort' >";
    htmlcontent += "<input type='checkbox' id='idShadows' " + str + "><b>Shadows</b><br>";
    htmlcontent += "you can enable real-time shadows (warning, this may impact performances)</div>";

    str = (ATON._bAutoLP) ? "checked" : "";
    htmlcontent += "<div id='idOptAutoLP' class='atonOptionBlockShort' >";
    htmlcontent += "<input type='checkbox' id='idAutoLP' " + str + "><b>Auto Light-Probe</b><br>";
    htmlcontent += "<img src='" + ATON.FE.PATH_RES_ICONS + "lp.png' class='atonDefIcon' style='float:left'>this option estimates location and radius of a light-probe</div>";


    // Pano
    if (ATON.FE.getCurrentUIP() === "editor") {
        htmlcontent += "<br><br>";
        htmlcontent += "<div style='text-align:center;'>";
        htmlcontent += "Select panorama from collection or URL: <input id='idPanoURL' type='text' size='30'>";
        htmlcontent += "<div id='idClearPano' class='atonBTN'><img src='" + ATON.FE.PATH_RES_ICONS + "search-clear.png'></div><div id='idSetPano' class='atonBTN atonBTN-green'>Set</div><br>";
        htmlcontent += "<div id='idPanoPreview' style='margin:auto;'></div>"; // width:200px; height:100px
        htmlcontent += "</div><br>";

        htmlcontent += "<div style='text-align:center;'>Panorama rotation (<span id='idEnvRotVal'></span>)<br>";
        htmlcontent += "<input id='idEnvRot' type='range' min='0.0' max='1.0' step='0.02' >";
        htmlcontent += "</div><br>";
    }

    // Advanced FX
    if (ATON.getNumLightProbes() > 0) {
        htmlcontent += "<br><div id='idUpdLPs' class='atonBTN atonBTN-text atonBTN-green'><img src='" + ATON.FE.PATH_RES_ICONS + "lp.png'>Update all LightProbes</div><br>";
    }

    if (ATON.FX.composer) {
        htmlcontent += "<details><summary><b>Advanced Effects</b></summary>";

        str = (ATON.FX.isPassEnabled(ATON.FX.PASS_AO)) ? "checked" : "";
        htmlcontent += "<div class='atonOptionBlockShort' >";
        htmlcontent += "<input type='checkbox' id='idFXPassSAO' " + str + "><b>Ambient Occlusion</b><br>";
        htmlcontent += "Enable or disable real-time Ambient Occlusion<br><br>";
        htmlcontent += "Intensity (<span id='idFXAOintVal'></span>)<br><input id='idFXAOint' type='range' min='0.1' max='0.5' step='0.05' >";
        htmlcontent += "</div>";

        str = (ATON.FX.isPassEnabled(ATON.FX.PASS_BLOOM)) ? "checked" : "";
        htmlcontent += "<div class='atonOptionBlockShort' >";
        htmlcontent += "<input type='checkbox' id='idFXPassBloom' " + str + "><b>Bloom</b><br>";
        htmlcontent += "Enable or disable real-time bloom<br><br>";
        htmlcontent += "Strength (<span id='idFXBloomStrengthVal'></span>)<br><input id='idFXBloomStrength' type='range' min='0.1' max='3.0' step='0.01' ><br>";
        htmlcontent += "Threshold (<span id='idFXBloomThresholdVal'></span>)<br><input id='idFXBloomThreshold' type='range' min='0.1' max='1.0' step='0.01' ><br>";
        htmlcontent += "</div>";

        str = (ATON.FX.isPassEnabled(ATON.FX.PASS_DOF)) ? "checked" : "";
        htmlcontent += "<div class='atonOptionBlockShort' >";
        htmlcontent += "<input type='checkbox' id='idFXPassDOF' " + str + "><b>Depth of Field</b><br>";
        htmlcontent += "Enable or disable real-time DOF<br><br>";
        //htmlcontent += "Focus (<span id='idFXDOFfocusVal'></span>)<br><input id='idFXDOFfocus' type='range' min='0.1' max='50.0' step='0.02' ><br>";
        htmlcontent += "</div>";

        htmlcontent += "</details>";
    }

    htmlcontent += "</div>";

    if (!ATON.FE.popupShow(htmlcontent)) return;

    let E = {};
    E.environment = {};

    ATON.FE.uiAttachCollectionItemsToInput("idPanoURL", "panoramas");

    $("#idPanoURL").on("change", () => {
        let ppath = $("#idPanoURL").val();
        if (ppath && ppath.length > 0) {
            // fetch preview
            if (!ppath.startsWith("http")) ppath = ATON.PATH_COLLECTION + ppath;

            if (ATON.Utils.isVideo(ppath)) $("#idPanoPreview").html("<video src='" + ppath + "' autoplay='true' style='width:90%;height:auto'>");
            else $("#idPanoPreview").html("<img src='" + ppath + "' style='width:90%;height:auto'>");
        } else {
            $("#idPanoPreview").html("");
        }
    });

    $("#idClearPano").click(() => {
        $("#idPanoURL").val("");
        $("#idPanoPreview").html("");
    });

    $("#idSetPano").click(() => {
        let purl = $("#idPanoURL").val();

        ATON.setMainPanorama(purl);

        E.environment.mainpano = {};
        E.environment.mainpano.url = purl;

        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
    });

    $("#idUpdLPs").click(() => {
        ATON.updateLightProbes();
    });

    let ex = ATON.getExposure();
    $("#idExposure").val(ex);
    $("#idExpVal").html(ex);

    let aoi = ATON.FX.getAOintensity();
    $("#idFXAOint").val(aoi);
    $("#idFXAOintVal").html(aoi);

    let blooms = ATON.FX.getBloomStrength();
    $("#idFXBloomStrength").val(blooms);
    $("#idFXBloomStrengthVal").html(blooms);

    let bloomt = ATON.FX.getBloomThreshold();
    $("#idFXBloomThreshold").val(bloomt);
    $("#idFXBloomThresholdVal").html(bloomt);

    if (bMainLight) $("#idOptShadows").show();
    else $("#idOptShadows").hide();

    // FX
    $("#idFXAOint").on("input change", () => {
        let k = parseFloat($("#idFXAOint").val());
        ATON.FX.setAOintensity(k);
        $("#idFXAOintVal").html(k);

        if (!ATON.FX.isPassEnabled(ATON.FX.PASS_AO)) return;

        ATON.SceneHub.sendEdit({
            fx: {
                ao: {
                    i: k.toPrecision(ATON.SceneHub.FLOAT_PREC)
                }
            }
        }, ATON.SceneHub.MODE_ADD);
    });

    $("#idFXBloomStrength").on("input change", () => {
        let k = parseFloat($("#idFXBloomStrength").val());
        ATON.FX.setBloomStrength(k);
        $("#idFXBloomStrengthVal").html(k);

        if (!ATON.FX.isPassEnabled(ATON.FX.PASS_BLOOM)) return;

        ATON.SceneHub.sendEdit({
            fx: {
                bloom: {
                    i: k.toPrecision(ATON.SceneHub.FLOAT_PREC)
                }
            }
        }, ATON.SceneHub.MODE_ADD);
    });
    $("#idFXBloomThreshold").on("input change", () => {
        let k = parseFloat($("#idFXBloomThreshold").val());
        ATON.FX.setBloomThreshold(k);
        $("#idFXBloomThresholdVal").html(k);

        if (!ATON.FX.isPassEnabled(ATON.FX.PASS_BLOOM)) return;

        ATON.SceneHub.sendEdit({
            fx: {
                bloom: {
                    t: k.toPrecision(ATON.SceneHub.FLOAT_PREC)
                }
            }
        }, ATON.SceneHub.MODE_ADD);
    });


    $("#idExposure").on("input change", () => {
        let e = parseFloat($("#idExposure").val());
        ATON.setExposure(e);
        $("#idExpVal").html(e);

        E.environment.exposure = e;
        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
    });

    $("#idDirLight").on("change", () => {
        let b = $("#idDirLight").is(':checked');
        if (b) {
            let ld = ATON.getMainLightDirection();
            if (ld === undefined) ld = new THREE.Vector3(0, -1.0, 1.0);
            ATON.setMainLightDirection(ld);

            //ATON.updateDirShadows();
            $("#idOptShadows").show();

            E.environment.mainlight = {};
            E.environment.mainlight.direction = [ld.x, ld.y, ld.z];
            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
            ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        } else {
            $("#idOptShadows").hide();

            //ATON.SceneHub.sendEdit( { environment:{ mainlight:{} } }, ATON.SceneHub.MODE_ADD);
            //ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
            E.environment.mainlight = {};
            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);
            ATON.Photon.fireEvent("AFE_LightSwitch", false);
        }

        //console.log(E);

        ATON.toggleMainLight(b);
    });

    $("#idShadows").on("change", () => {
        let b = $("#idShadows").is(':checked');
        ATON.toggleShadows(b);
        //if (b) ATON.updateDirShadows();

        let ld = ATON.getMainLightDirection();

        if (!ATON.isMainLightEnabled()) return;

        E.environment.mainlight = {};
        E.environment.mainlight.shadows = b;
        //if (ld) E.environment.mainlight.direction = [ld.x,ld.y,ld.z];
        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);

        ATON.updateLightProbes();
    });

    $("#idEnvRot").on("input change", () => {
        let r = parseFloat($("#idEnvRot").val() * Math.PI * 2.0).toPrecision(4);
        ATON.setMainPanoramaRotation(r);
        $("#idEnvRotVal").html(r);

        E.environment.mainpano = {};
        E.environment.mainpano.rotation = r;
        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
    });

    $("#idAutoLP").on("change", () => {
        let b = $("#idAutoLP").is(':checked');
        ATON.setAutoLP(b);

        if (b) ATON.updateLightProbes();
        //else TODO:

        E.environment.lightprobes = {};
        E.environment.lightprobes.auto = b;
        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
    });

    $("#idFXPassSAO").on("change", () => {
        let b = $("#idFXPassSAO").is(':checked');

        ATON.FX.togglePass(ATON.FX.PASS_AO, b);

        if (b) {
            ATON.SceneHub.sendEdit({
                fx: {
                    ao: {
                        i: ATON.FX.getAOintensity().toPrecision(ATON.SceneHub.FLOAT_PREC)
                    }
                }
            }, ATON.SceneHub.MODE_ADD);
        } else ATON.SceneHub.sendEdit({fx: {ao: {}}}, ATON.SceneHub.MODE_DEL);
    });

    $("#idFXPassBloom").on("change", () => {
        let b = $("#idFXPassBloom").is(':checked');

        if (b) {
            ATON.SceneHub.sendEdit({
                fx: {
                    bloom: {
                        i: ATON.FX.getBloomStrength().toPrecision(ATON.SceneHub.FLOAT_PREC),
                        t: ATON.FX.getBloomThreshold().toPrecision(ATON.SceneHub.FLOAT_PREC)
                    }
                }
            }, ATON.SceneHub.MODE_ADD);
        } else ATON.SceneHub.sendEdit({fx: {bloom: {}}}, ATON.SceneHub.MODE_DEL);

        ATON.FX.togglePass(ATON.FX.PASS_BLOOM, b);
    });

    $("#idFXPassDOF").on("change", () => {
        let b = $("#idFXPassDOF").is(':checked');

        if (b) {
            ATON.SceneHub.sendEdit({
                fx: {
                    dof: {
                        f: ATON.FX.getDOFfocus().toPrecision(ATON.SceneHub.FLOAT_PREC)
                    }
                }
            }, ATON.SceneHub.MODE_ADD);
        } else ATON.SceneHub.sendEdit({fx: {dof: {}}}, ATON.SceneHub.MODE_DEL);

        ATON.FX.togglePass(ATON.FX.PASS_DOF, b);
    });

};

HATHOR.popupShare = () => {
    let htmlcontent = "<div class='atonPopupTitle'>Share</div>";
    htmlcontent += "<div class='atonQRcontainer' id='idQRcode'></div><br><br>";

    htmlcontent += "<details><summary><b>Embed this Scene</b></summary>";
    htmlcontent += "Copy and paste this HTML code in your blog or website to embed an interactive 3D component for this scene<br><br>";
    htmlcontent += "<input id='idEmbStaticCover' type='checkbox'>Use static cover<br>";
    htmlcontent += "<textarea id='idEmbed' style='width:90%; height:100px; resize:none;' readonly ></textarea><br>";
    //htmlcontent += "<div id='idEmbed' class='atonCode'></div>";

    htmlcontent += "<div class='atonBTN atonBTN-green' style='width:90%' id='btnEmbedCopy'>Copy</div>";
    htmlcontent += "</details>";

    if (!ATON.FE.popupShow(htmlcontent)) return;

    let url = window.location.href;
    new QRCode(document.getElementById("idQRcode"), url);

    let iframecode = "<iframe style='height:500px; margin:0;' src='" + window.location.href + "' width='100%' height='500px' frameborder='0' allow='autoplay; fullscreen; xr-spatial-tracking' xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share allowfullscreen mozallowfullscreen='true' webkitallowfullscreen='true'></iframe>";
    let istaticcode = "<a href='" + window.location.href + "'><img src='" + ATON.PATH_SCENES + ATON.SceneHub.currID + "/cover.png'></a>";

    $('#idEmbed').val(iframecode);
    //$('#idEmbed').text(iframecode);

    $("#btnEmbedCopy").click(() => {
        let copyText = document.getElementById("idEmbed");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");

        ATON.FE.popupClose();
    });

    $("#idEmbStaticCover").on("change", () => {
        let b = $("#idEmbStaticCover").is(':checked');

        if (b) $('#idEmbed').val(istaticcode);
        else $('#idEmbed').val(iframecode);
    });
};

HATHOR.popupScene = () => {
    if (ATON.SceneHub.currID === undefined) return;

    let title = (ATON.SceneHub.getTitle()) ? ATON.SceneHub.getTitle() : ATON.SceneHub.currID;

    let htmlcontent = "<div class='atonPopupTitle'>" + title + "</div>";
    if (ATON.SceneHub.getTitle()) htmlcontent += ATON.SceneHub.currID + "<br>";

    // Keywords
    if (ATON.SceneHub.currData) {
        let kwds = ATON.SceneHub.currData.kwords;
        if (kwds) {
            htmlcontent += "<div>";
            for (let k in kwds) {
                htmlcontent += "<a class='atonKeyword atonKeywordActivable' href='/?q=" + k + "'>" + k + "</a>";
            }
            htmlcontent += "</div><br>";
        }
    }

    //htmlcontent += "<div class='atonQRcontainer' style='display:inline-block; max-width:200px; margin:6px; vertical-align:top;' id='idQRcode'></div>"; // <br><br>

    htmlcontent += "<div id='btnCover' class='atonCover' style='margin:5px'>";
    htmlcontent += "<img src='" + ATON.PATH_RESTAPI + "cover/" + ATON.SceneHub.currID + "' style='width:200px; height:auto'></div>";

    //htmlcontent += "<div class='atonBTN' id='idPopQR'><img src='"+ATON.FE.PATH_RES_ICONS+"qr.png'>&nbsp;Share</div><br>";

    ATON.FE.checkAuth((r) => {
        let authUser = r.username;
        let bYourScene = ATON.SceneHub.currID.startsWith(authUser);

        htmlcontent += "<div style='display:inline-block; text-align:left; margin:6px; vertical-align:top; max-width:300px; text-align:center'>";

        // Authenticated
        if (authUser && bYourScene) {
            /*
                        if (ATON.SceneHub._bEdit) htmlcontent += "<div class='atonBTN switchedON' style='width:80%' id='btnSchanges'><img src='"+ATON.FE.PATH_RES_ICONS+"scene.png'>Persistent changes</div>";
                        else htmlcontent += "<div class='atonBTN' style='width:250px' id='btnSchanges'><img src='"+ATON.FE.PATH_RES_ICONS+"scene.png'>Temporary changes</div>";

                        htmlcontent += "<br><br>";
            */
            /*
                        let pe = (ATON.SceneHub._bEdit)? "checked" : "";
                        htmlcontent += "<input type='checkbox' id='idSchanges' "+pe+">Persistent scene changes<br>";
            */
            //htmlcontent += "<div class='atonBTN atonBTN-red' onclick='ATON.SUI.clearMeasurements'><img src='"+ATON.FE.PATH_RES_ICONS+"trash.png'>Clear measurements</div>";

            ///htmlcontent += "<div class='atonBTN atonBTN-green' id='btnSetCover'><img src='"+ATON.FE.PATH_RES_ICONS+"sshot.png'>Set Cover</div>";
            //htmlcontent += "<div class='atonBTN atonBTN-green' id='idPopSShot'><img src='"+ATON.FE.PATH_RES_ICONS+"sshot.png'>Screenshot / Cover</div>";

            htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-horizontal atonBTN-text' id='btnInfo'><img src='" + ATON.FE.PATH_RES_ICONS + "edit.png'>Edit info</div>";

            //htmlcontent += "<br>";
        }

        // Common scene options
        htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-horizontal atonBTN-text' id='btnPopGraphs'><img src='" + ATON.FE.PATH_RES_ICONS + "list.png'>Layers</div>";
        htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-horizontal atonBTN-text' id='btnPopEnv'><img src='" + ATON.FE.PATH_RES_ICONS + "light.png'>Environment</div>";
        //htmlcontent += "<div class='atonBTN atonBTN-gray' style='width:120px' id='btnPopEmbed'><img src='"+ATON.FE.PATH_RES_ICONS+"embed.png'>Embed</div>";
        // htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-horizontal atonBTN-text' id='idEditNodes'><img src='" + ATON.FE.PATH_RES_ICONS + "edit.png'>Edit Nodes</div>";
        htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-horizontal atonBTN-text' id='btnSShot'><img src='" + ATON.FE.PATH_RES_ICONS + "sshot.png'>Capture</div>";

        if (ATON.FE.getCurrentUIP() === "editor") {
            htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-horizontal atonBTN-text' id='btnPopPOV'><img src='" + ATON.FE.PATH_RES_ICONS + "pov.png'>Viewpoint</div>";
        }

        htmlcontent += "</div>";

        // Only for auth users
        if (authUser /*&& ATON.FE.getCurrentUIP()==="editor"*/) {
            htmlcontent += "<br><br>";
            htmlcontent += "<div class='atonBTN atonBTN-orange atonBTN-horizontal atonBTN-text' id='idSHUclone'><img src='" + ATON.FE.PATH_RES_ICONS + "clone.png'>Clone this Scene</div>";

            if (!bYourScene) { // Not my scene
                //
            } else { // My scene
                htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-text' id='idSHUscene'><img src='" + ATON.FE.PATH_RES_ICONS + "scene.png'>Manage this Scene</div>";
                htmlcontent += "<div class='atonBTN atonBTN-gray atonBTN-text' id='idSHUscenes'><img src='" + ATON.FE.PATH_RES_ICONS + "scene.png'>Manage my Scenes</div>";
                htmlcontent += "<br><div class='atonBTN atonBTN-red atonBTN-horizontal atonBTN-text' id='idDelScene'><img src='" + ATON.FE.PATH_RES_ICONS + "trash.png'>Delete this scene</div>";
            }
        }

        if (!ATON.FE.popupShow(htmlcontent /*,"atonPopupLarge"*/)) {
            return;
        }

        if (ATON.SceneHub._bEdit) {
            $('#btnInfo').show();
        } else {
            $('#btnInfo').hide();
        }
        /*
                // Build QR
                let url = window.location.href;
                new QRCode(document.getElementById("idQRcode"), url);
        */
        /*
                $('#btnSchanges').click(()=>{
                    ATON.SceneHub._bEdit = !ATON.SceneHub._bEdit;

                    if (ATON.SceneHub._bEdit){
                        $('#btnInfo').show();
                        $('#btnSchanges').html("<img src='"+ATON.FE.PATH_RES_ICONS+"scene.png'>Persistent changes");
                        $('#btnSchanges').attr("class","atonBTN switchedON");
                        ATON.FE.uiSwitchButton("scene",true);
                        console.log("Scene edits are now persistent");
                    }
                    else {
                        $('#btnInfo').hide();
                        $('#btnSchanges').html("<img src='"+ATON.FE.PATH_RES_ICONS+"scene.png'>Temporary changes");
                        $('#btnSchanges').attr("class","atonBTN");
                        ATON.FE.uiSwitchButton("scene",false);
                        console.log("Scene edits are now temporary");
                    }
                });
        */
        /*
                if (ATON.SceneHub._bEdit) $('#idEditMode').val('1');
                else $('#idEditMode').val('0');

                $("#idEditMode").on("change",()=>{
                    let emode = $("#idEditMode").val();

                    if (emode === '0'){
                        ATON.SceneHub._bEdit = false;
                        ATON.FE.uiSwitchButton("scene",false);
                        console.log("Scene edits are now temporary");
                    }
                    else {
                        ATON.SceneHub._bEdit = true;
                        ATON.FE.uiSwitchButton("scene",true);
                        console.log("Scene edits are now persistent");
                    }

                    ATON.FE.popupClose();
                });
        */

        $("#btnPopPOV").click(() => {
            ATON.FE.subPopup(HATHOR.popupPOV);
        });

        $("#btnPopEnv").click(() => {
            ATON.FE.subPopup(HATHOR.popupEnvironment);
        });

        $("#btnPopGraphs").click(() => {
            ATON.FE.subPopup(HATHOR.popupGraphs);
        });

        $("#btnInfo").click(() => {
            ATON.FE.subPopup(HATHOR.popupEditSceneInfo);
        });

        $("#btnSShot").click(() => {
            ATON.FE.subPopup(ATON.FE.popupScreenShot);
        });
        $("#btnCover").click(() => {
            ATON.FE.subPopup(ATON.FE.popupScreenShot);
        });

        /*
                $("#idPopQR").click(()=>{

                });
        */
        $("#idSHUscene").click(() => {
            if (ATON.SceneHub.currID === undefined) {
                return;
            }
            window.open("/shu/scenes/?s=" + ATON.SceneHub.currID, "_self");
        });

        $("#idSHUscenes").click(() => {
            if (ATON.SceneHub.currID === undefined) {
                return;
            }
            window.open("/shu/scenes/", "_self");
        });

        $("#idSHUclone").click(() => {
            ATON.Utils.postJSON(ATON.PATH_RESTAPI + "clone/scene", {sid: ATON.SceneHub.currID}, (newsid) => {
                if (newsid) {
                    window.location.href = "/s/" + newsid;
                }
            });
        });

        $("#idDelScene").click(() => {
            ATON.FE.subPopup(HATHOR.popupSceneDelete);
        });
    });
};

HATHOR.popupEditSceneInfo = () => {
    let htmlcontent = "<div class='atonPopupTitle'>Scene information</div>";

    htmlcontent += "Title: <input id='idSceneTitle' type='text' maxlength='30' size='30' ><br>";
    htmlcontent += "<textarea id='idSummaryEditor' style='width:100%'></textarea><br>";
    //htmlcontent += "Keywords (comma separated):<br><input id='idSceneKWords' type='text' maxlength='100' style='width:90%' ><br>";

    htmlcontent += "<div id='idSceneKWords'></div>";

    htmlcontent += "<div class='atonBTN atonBTN-green' id='idSceneSummaryOK' style='width:80%'>DONE</div>";

    if (!ATON.FE.popupShow(htmlcontent, "atonPopupLarge")) return;

    let SCE = HATHOR.createSemanticTextEditor("idSummaryEditor");

    let D = ATON.SceneHub.getDescription();
    if (D) {
        SCE.setWysiwygEditorValue(JSON.parse(D));
    }

    let T = ATON.SceneHub.getTitle();
    if (T) {
        $("#idSceneTitle").val(T);
    }

    let kwlist = [];
    if (ATON.SceneHub.currData && ATON.SceneHub.currData.kwords) {
        for (let kw in ATON.SceneHub.currData.kwords) kwlist.push(kw);
    }

    ATON.FE.uiAddKeywordsArea("idSceneKWords", kwlist,
        (kw) => { // on add keyword
            let E = {};
            E.kwords = {};
            E.kwords[kw] = 1;

            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        },
        (kw) => { // on remove keyword
            let E = {};
            E.kwords = {};
            E.kwords[kw] = 1;

            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);

        });

    $('#idSceneSummaryOK').click(() => {
        let xxtmldescr = JSON.stringify($("#idSummaryEditor").val());
        let title = $("#idSceneTitle").val();

        /*
                let kwords = $("#idSceneKWords").val().trim();
                if (kwords.length>2){
                    kwords = kwords.toLowerCase();
                    kwords = kwords.split(",");
                }
        */
        ATON.FE.popupClose();

        let E = {};

        /*
                if (kwords && kwords.length>0){
                    E.kwords = {};
                    for (let k in kwords) E.kwords[ kwords[k] ] = 1;
                }
        */
        if (xxtmldescr && xxtmldescr.length > 2) {
            ATON.SceneHub.setDescription(xxtmldescr);
            E.description = xxtmldescr;
            $("#btn-info").show();
        }
        if (title && title.length > 0) {
            ATON.SceneHub.setTitle(title);
            E.title = title;
        }

        if (E.title || E.description) {
            //console.log(E);
            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
            ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        }
    });
};

HATHOR.popupHelp = () => {
    let htmlcontent = "<div class='atonPopupTitle'>Hathor <img src='" + ATON.FE.PATH_RES_ICONS + "hathor.png' class='atonDefIcon'> help</div>";

    htmlcontent += "<i>Hathor</i> is the official ATON front-end. This advanced web-app can be used to present and interact with 3D models, scenes and panoramic content - with several features built on top of existing ATON functionalities<br><div id='idSettings' class='atonBTN atonBTN-text'><img src='" + ATON.FE.PATH_RES_ICONS + "settings.png'>Settings <span class='atonKey'>'space'</span></div><a class='atonBTN atonBTN-text' href='https://osiris.itabc.cnr.it/aton/index.php/overview/hathor/' target='_blank'><img src='" + ATON.FE.PATH_RES_ICONS + "link.png'>More details</a><br>";

    htmlcontent += "<div style='text-align:left;'>";

    // Toolbar
    //let sp = "<br>";
    let iblock = "<div style='width:250px; display:inline-block; margin:5px; vertical-align:top;'>";
    htmlcontent += "<h3>Icons</h3>";
    htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "home.png' class='atonDefIcon'> Home viewpoint</div>";
    htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "user.png' class='atonDefIcon'> User authentication</div>";
    htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "nav.png' class='atonDefIcon'> Navigation menu</div>";
    htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "prev.png' class='atonDefIcon'><img src='" + ATON.FE.PATH_RES_ICONS + "next.png' class='atonDefIcon'> Previous/Next viewpoint</div>";
    htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "scene.png' class='atonDefIcon'> Current scene</div>";
    htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "fullscreen.png' class='atonDefIcon'> Fullscreen</div>";
    htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "info.png' class='atonDefIcon'> Scene information</div>";

    if (ATON.Utils.isConnectionSecure()) {
        if (ATON.Utils.isARsupported() || ATON.Utils.isVRsupported()) htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "xr.png' class='atonDefIcon'> Immersive, Augmented or Mixed Reality</div>";

        if (ATON.Utils.isMobile()) {
            htmlcontent += iblock + "<img src='" + ATON.FE.PATH_RES_ICONS + "devori.png' class='atonDefIcon'> Device orientation mode</div>";
        }
    }

    htmlcontent += "<br><br>";

    let blblock = "<div style='width:300px; display:inline-block; margin:5px; vertical-align:top;'>";

    htmlcontent += blblock + "<h3>Navigation</h3>";
    htmlcontent += "<ul>";
    if (ATON.Utils.isMobile()) {
        htmlcontent += "<li><b>Pinch</b>: dolly / zoom</li>";
        htmlcontent += "<li><b>Double-tap</b>: retarget on surface (orbit); locomotion (first-person navigation modes)</li>";
    } else {
        htmlcontent += "<li><b>Double-click</b>: retarget on surface (orbit); locomotion (first-person navigation modes)</li>";
        htmlcontent += "<li><span class='atonKey'>'CTRL' + mouse wheel</span>: increase/decrease field-of-view</li>";
        htmlcontent += "<li><span class='atonKey'>'v'</span>: viewpoint</li>";
        htmlcontent += "<li><span class='atonKey'>'n'</span>: navigation modes</li>";
    }
    htmlcontent += "</ul></div>";

    // 3D selector
    htmlcontent += blblock + "<h3>3D Selector</h3>";
    htmlcontent += "<ul>";
    if (ATON.Utils.isMobile()) {
        htmlcontent += "<li><b>Tap</b>: move location of 3D selector</li>";
    } else {
        htmlcontent += "<li><span class='atonKey'>'SHIFT' + mouse wheel</span>: increase/decrease radius of selector</li>";
        htmlcontent += "<li><span class='atonKey'>'space'</span>: Selector options</li>";
    }
    htmlcontent += "</ul></div>";

    // Annotation
    htmlcontent += blblock + "<h3>Annotation</h3>";
    htmlcontent += "<ul>";
    if (ATON.Utils.isMobile()) {
        htmlcontent += "<li><b>Double-tap on annotation</b>: open associated content</li>";
    } else {
        htmlcontent += "<li><span class='atonKey'>'a'</span>: add basic annotation (sphere)</li>";
        htmlcontent += "<li><span class='atonKey'>'s'</span>: initiate convex shape annotation (add surface point)</li>";
        htmlcontent += "<li><span class='atonKey'>'ENTER'</span>: finalize convex shape annotation</li>";
        htmlcontent += "<li><span class='atonKey'>'ESC'</span>: cancel/stop current convex shape annotation</li>";
        htmlcontent += "<li><span class='atonKey'>'e'</span>: edit hovered annotation</li>";
        htmlcontent += "<li><span class='atonKey'>'CANC'</span>: delete hovered annotation</li>";
        htmlcontent += "<li><span class='atonKey'>'x'</span>: export (download) semantic shapes</li>";
        htmlcontent += "<li><span class='atonKey'>'m'</span>: add measurement point</li>";
    }
    htmlcontent += "</ul></div>";

    // Other
    if (ATON.Utils.isMobile()) {

    } else {
        htmlcontent += blblock + "<h3>Other</h3>";
        htmlcontent += "<ul>";
        htmlcontent += "<li><span class='atonKey'>'c'</span>: screenshot/capture</li>";
        htmlcontent += "</ul></div>";
    }


    htmlcontent += "</div>";

    if (!ATON.FE.popupShow(htmlcontent, "atonPopupLarge")) return;

    $("#idSettings").click(() => {
        ATON.FE.subPopup(HATHOR.popupSettings);
    });
};

HATHOR.popupSceneDelete = () => {
    let htmlcontent = "<div class='atonPopupTitle'>DELETE this scene?</div>";

    htmlcontent += "<div class='atonBTN atonBTN-red' id='btnDELyes'>YES</div>";
    htmlcontent += "<div class='atonBTN atonBTN-green' id='btnDELno'>NO</div>";

    if (!ATON.FE.popupShow(htmlcontent)) return;

    $('#btnDELyes').click(() => {
        let sid = ATON.SceneHub.currID;
        if (sid === undefined) return;

        ATON.Utils.postJSON(ATON.PATH_RESTAPI + "del/scene", {sid: sid}, (b) => {
            if (b) window.open("/shu/scenes/", "_self");
        });
    });

    $('#btnDELno').click(() => {
        ATON.FE.popupClose();
    });
};

HATHOR.popupXR = () => {
    if (!ATON.Utils.isConnectionSecure()) return;

    let htmlcontent = "<div class='atonPopupTitle'>XR</div>";

    htmlcontent += "Available Immersive, Augmented or Mixed Reality,<br>depending on your device and browser.<br><br>";

    if (ATON.Utils.isVRsupported()) {
        /*
                htmlcontent +="<div style='display:inline-block;margin:14px'>";
                htmlcontent +="<div style='display:inline-block;' id='idVRx'></div>";
                htmlcontent +="<br>Immersive VR";
                htmlcontent += "</div>";
        */
        htmlcontent += "<div id='btnEnterVR' class='atonBTN atonBTN-green atonBTN-text atonBTN-horizontal'><img src='" + ATON.FE.PATH_RES_ICONS + "vr.png'><br>Immersive VR</div><br>";
    }

    if (ATON.Utils.isARsupported()) {
        /*
                htmlcontent +="<div style='display:inline-block;margin:14px'>";
                htmlcontent +="<div style='display:inline-block;' id='idARx'></div>";
                htmlcontent +="<br>Augmented/Mixed Reality</div>";
        */
        htmlcontent += "<div id='btnEnterAR' class='atonBTN atonBTN-green atonBTN-text atonBTN-horizontal'><img src='" + ATON.FE.PATH_RES_ICONS + "ar.png'><br>Augmented/Mixed Reality</div><br>";
    }

    let fbxr = ATON._stdpxd;
    //console.log(ATON._renderer.xr)

    htmlcontent += "<details><summary><b>Advanced options</b></summary>";
    htmlcontent += "<br>Resolution scale (<span id='idXRfbstxt'>" + fbxr + "</span>):";
    htmlcontent += "<input id='idXRfbs' type='range' min='0.25' max='1.0' step='0.25' value='" + fbxr + "'>";
    htmlcontent += "</details>";

    if (!ATON.FE.popupShow(htmlcontent)) return;

    //ATON.FE.uiAddButtonVR("idVRx");
    //ATON.FE.uiAddButtonAR("idARx");

    $("#btnEnterVR").on("click", () => {
        ATON.XR.toggle("immersive-vr");
        ATON.FE.popupClose();
    });
    $("#btnEnterAR").on("click", () => {
        //ATON._rootVisible.autoFit(true, 2.0);
        //ATON._rootSem.autoFit(true, 2.0);

        ATON.XR.toggle("immersive-ar");
        ATON.FE.popupClose();
    });


    $("#idXRfbs").on("input change", () => {
        let f = parseFloat($("#idXRfbs").val());
        $("#idXRfbstxt").html(f);

        ATON._renderer.xr.setFramebufferScaleFactor(f);
    });
};

HATHOR.popupNav = () => {
    let eye = ATON.Nav.copyCurrentPOV().pos;

    let htmlcontent = "<div class='atonPopupTitle'>Navigation</div>";

    //htmlcontent += "<div id='idNavModes'></div>";

    htmlcontent += "<div style='display:block; width:90%; min-height:50px; vertical-align:top'>";
    htmlcontent += "<div style='display:inline-block; width:60px; float:left' id='idNMfp'></div>";
    htmlcontent += "<div style='text-align:left'>Switch between first-person and orbit navigation mode</div>";
    htmlcontent += "</div>";
    htmlcontent += "<div style='display:block; width:90%; min-height:50px; vertical-align:top'>";
    htmlcontent += "<div style='display:inline-block; width:60px; float:left' id='idNMfpw'></div>";
    htmlcontent += "<div style='text-align:left'>Enalbe first-person walking navigation mode</div>";
    htmlcontent += "</div>";

    if (ATON.Utils.isConnectionSecure()) {
        /*
                htmlcontent += "<div style='display:block; width:90%; min-height:50px; vertical-align:top'>";
                htmlcontent +="<div style='display:inline-block; width:60px; float:left' id='idNMvr'></div>";
                htmlcontent +="<div style='text-align:left'>Immersive VR mode</div>";
                htmlcontent += "</div>";
        */
        if (ATON.Utils.isMobile()) {
            htmlcontent += "<div style='display:block; width:90%; min-height:50px; vertical-align:top'>";
            htmlcontent += "<div style='display:inline-block; width:60px; float:left' id='idNMdevori'></div>";
            htmlcontent += "<div style='text-align:left'>Enable or disable device-orientation mode</div>";
            htmlcontent += "</div>";
        }
    }

    if (ATON.SceneHub._bEdit) {
        htmlcontent += "<div class='atonBTN atonBTN-horizontal' id='btnDefNavMode'>Set current navigation mode as default</div>";

        htmlcontent += "<div class='atonBTN atonBTN-green atonBTN-horizontal' id='btnAddLocNode'>Add Locomotion Node here</div>";
        if (ATON.Nav._locNodes.length > 0) htmlcontent += "<div class='atonBTN atonBTN-red atonBTN-horizontal' id='btnDelLocNodes'>Remove all Locomotion Nodes</div>";
    }

    htmlcontent += "<div class='atonBTN atonBTN-horizontal' id='btnViewpoint'><img src='" + ATON.FE.PATH_RES_ICONS + "pov.png'>Viewpoint</div>";

    if (!ATON.FE.popupShow(htmlcontent)) return;

    ATON.FE.uiAddButtonFirstPerson("idNMfp");
    // ATON.FE.uiAddButtonFirstPersonWalking("idNMfpw");
    ATON.FE.uiAddButtonDeviceOrientation("idNMdevori");
    //ATON.FE.uiAddButtonVR("idNMvr");

    $("#btnViewpoint").click(() => {
        ATON.FE.subPopup(() => {
            HATHOR.popupPOV();
        });
    });

    $('#btnDefNavMode').click(() => {
        let E = {};
        E.navmode = ATON.Nav._mode;
        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);

        ATON.FE.popupClose();
    });

    $("#btnAddLocNode").click(() => {
        lnid = ATON.Utils.generateID("ln");

        ATON.Nav.addLocomotionNode(eye.x, eye.y, eye.z, true);

        let E = {};
        E.locomotionGraph = {};
        E.locomotionGraph[lnid] = {};
        E.locomotionGraph[lnid].pos = [
            eye.x.toPrecision(3),
            eye.y.toPrecision(3),
            eye.z.toPrecision(3)
        ];

        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
        ATON.Photon.fireEvent("AFE_AddSceneEdit", E);

        ATON.FE.popupClose();
    });

    $("#btnDelLocNodes").click(() => {
        ATON.Nav.clearLocomotionNodes();

        let E = {};
        E.locomotionGraph = {};

        ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_DEL);
        ATON.Photon.fireEvent("AFE_ClearLocNodes"); // TODO:

        ATON.FE.popupClose();
    });
};

HATHOR.popupEmbed = () => {
    let htmlcontent = "<div class='atonPopupTitle' style='min-width:300px'>Embed</div>";

    htmlcontent += "Copy and paste this HTML code in your blog or website to embed an interactive 3D component for this scene<br><br>";
    htmlcontent += "<input id='idEmbStaticCover' type='checkbox'>Use static cover<br>";
    htmlcontent += "<textarea id='idEmbed' style='width:90%; height:100px; resize:none;' readonly ></textarea><br>";
    //htmlcontent += "<div id='idEmbed' class='atonCode'></div>";

    htmlcontent += "<div class='atonBTN atonBTN-green' style='width:90%' id='btnEmbedCopy'>Copy</div>";

    if (!ATON.FE.popupShow(htmlcontent)) return;

    let iframecode = "<iframe style='height:500px; margin:0;' src='" + window.location.href + "' width='100%' height='500px' frameborder='0' allowfullscreen='1'></iframe>";
    let istaticcode = "<a href='" + window.location.href + "'><img src='" + ATON.PATH_SCENES + ATON.SceneHub.currID + "/cover.png'></a>";

    $('#idEmbed').val(iframecode);
    //$('#idEmbed').text(iframecode);

    $("#btnEmbedCopy").click(() => {
        let copyText = document.getElementById("idEmbed");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");

        ATON.FE.popupClose();
    });

    $("#idEmbStaticCover").on("change", () => {
        let b = $("#idEmbStaticCover").is(':checked');

        if (b) $('#idEmbed').val(istaticcode);
        else $('#idEmbed').val(iframecode);
    });
};

HATHOR.popupSettings = () => {
    const divBlock = "<div class='atonBlockRound' style='display:inline-block; min-width:350px; max-width:800px; min-height:50px; vertical-align:top; padding:10px; background-color:rgba(255,255,255, 0.1)'>"; // white-space: nowrap;

    let htmlcontent = "<div class='atonPopupTitle'>Hathor Settings</div>";

    let rad = ATON.SUI.getSelectorRadius();
    let hr = ATON.Utils.getHumanReadableDistance(rad);

    ATON.FE.computeSelectorRanges();

    htmlcontent += "<div id='btnEditSwitch' class='atonBTN atonBTN-text atonBTN-orange atonBTN-horizontal' style='display:none'></div>"

    // Selector
    htmlcontent += divBlock;
    htmlcontent += "<details><summary><b>3D Selector</b></summary><br>";
    htmlcontent += "Radius (<span id='idSelRadTxt'>" + hr + "</span>):<br>";
    //htmlcontent += ATON.Utils.getHumanReadableDistance(ATON.FE._selRanges[0])+"&nbsp;";
    htmlcontent += "<input id='idSelRad' type='range' min='" + ATON.FE._selRanges[0] + "' max='" + ATON.FE._selRanges[1] + "' step='" + ATON.FE._selRanges[0] + "'>";
    //htmlcontent += "&nbsp;"+ATON.Utils.getHumanReadableDistance(ATON.FE._selRanges[1]);

    htmlcontent += "Offset X: <span id='idSeldxTxt'>" + ATON.SUI._selOffset.x.toPrecision(3) + "</span><br>";
    htmlcontent += "<input id='idSeldx' type='range' min='" + (-ATON.FE._selRanges[1]) + "' max='" + ATON.FE._selRanges[1] + "' step='" + ATON.FE._selRanges[0] + "'>";

    htmlcontent += "Offset Y: <span id='idSeldyTxt'>" + ATON.SUI._selOffset.y.toPrecision(3) + "</span><br>";
    htmlcontent += "<input id='idSeldy' type='range' min='" + (-ATON.FE._selRanges[1]) + "' max='" + ATON.FE._selRanges[1] + "' step='" + ATON.FE._selRanges[0] + "'>";

    htmlcontent += "Offset Z: <span id='idSeldzTxt'>" + ATON.SUI._selOffset.z.toPrecision(3) + "</span><br>";
    htmlcontent += "<input id='idSeldz' type='range' min='" + (-ATON.FE._selRanges[1]) + "' max='" + ATON.FE._selRanges[1] + "' step='" + ATON.FE._selRanges[0] + "'>";

    htmlcontent += "<div id='idSelOffReset' class='atonBTN atonBTN-text atonBTN-yellow atonBTN-horizontal'>Reset offsets</div>";
    htmlcontent += "</details></div>";

    // Multires
    if (ATON.MRes._tsets.length > 0) {
        htmlcontent += divBlock;
        htmlcontent += "<details><summary><b>Multiresolution</b></summary><br>";
        htmlcontent += "Error target (<span id='idTSerrTxt'>" + ATON.MRes._tsET + "</span>):<br>";
        htmlcontent += "More detail&nbsp;<input id='idTSerr' style='width:40%' type='range' min='1.0' max='25.0' step='0.5'>&nbsp;Less detail";
        if (ATON.MRes._bPCs) {
            htmlcontent += "<br><br>Point size (<span id='idTSpcsTxt'>" + ATON.MatHub.materials.point.size + "</span>):<br>";
            htmlcontent += "<input id='idTSpcs' style='width:100%' type='range' min='0.5' max='10.0' step='0.5'>";
        }
        htmlcontent += "</details></div>";
    }

    if (!ATON.FE.popupShow(htmlcontent)) {
        return;
    }

    ATON.FE.checkAuth((r) => {
        let authUser = r.username;

        if (authUser) {
            let bYourScene = (ATON.SceneHub.currID) ? ATON.SceneHub.currID.startsWith(authUser) : false;
            if (!bYourScene) return;

            if (!ATON.SceneHub._bEdit) {
                $("#btnEditSwitch").html("<img id='idPOVmodeIcon' src='" + ATON.FE.PATH_RES_ICONS + "edit.png' class='atonDefIcon'>Enter Editor Mode");
            } else {
                $("#btnEditSwitch").html("<img id='idPOVmodeIcon' src='" + ATON.FE.PATH_RES_ICONS + "exit.png' class='atonDefIcon'>Quit Editor Mode");
            }

            $("#btnEditSwitch").show();
            $("#btnEditSwitch").click(() => {
                if (!ATON.SceneHub._bEdit) {
                    ATON.FE.uiLoadProfile("editor");
                    ATON.SUI.toggleButtonsProfile("editMode", "userMode", true)
                    ATON.FE.popupClose();
                } else {
                    ATON.FE.uiLoadProfile("default");
                    ATON.SUI.toggleButtonsProfile("userMode", "editMode", false)
                    ATON.FE.popupClose();
                }
            });
        }
    });

    $("#idSelRad").val(rad);
    $("#idTSerr").val(ATON.MRes._tsET);

    if (ATON.MRes._bPCs) {
        $("#idTSpcs").val(ATON.MatHub.materials.point.size);
        $("#idTSpcs").on("input change", () => {
            let ps = parseFloat($("#idTSpcs").val());

            ATON.MatHub.materials.point.size = ps;
            $("#idTSpcsTxt").html(ps.toPrecision(2));
        });
    }

    $("#idSelRad").on("input change", () => {
        let r = parseFloat($("#idSelRad").val());

        ATON.SUI.setSelectorRadius(r);
        $("#idSelRadTxt").html(ATON.Utils.getHumanReadableDistance(r));
    });

    $("#idSeldx").on("input change", () => {
        let v = parseFloat($("#idSeldx").val());
        ATON.SUI.setSelectorOffset(v, undefined, undefined);
        $("#idSeldxTxt").html(v.toPrecision(3));
    });

    $("#idSeldy").on("input change", () => {
        let v = parseFloat($("#idSeldy").val());
        ATON.SUI.setSelectorOffset(undefined, v, undefined);
        $("#idSeldyTxt").html(v.toPrecision(3));
    });

    $("#idSeldz").on("input change", () => {
        let v = parseFloat($("#idSeldz").val());
        ATON.SUI.setSelectorOffset(undefined, undefined, v);
        $("#idSeldzTxt").html(v.toPrecision(3));
    });

    $("#idTSerr").on("input change", () => {
        let e = parseFloat($("#idTSerr").val());

        if (e <= 0.0) return;

        ATON.MRes.setTSetsErrorTarget(e);
        $("#idTSerrTxt").html(ATON.MRes._tsET);
    });

    $("#idSelOffReset").click(() => {
        ATON.SUI.setSelectorOffset(0.0, 0.0, 0.0);
        $("#idSeldxTxt").val(0.0);
        $("#idSeldyTxt").val(0.0);
        $("#idSeldzTxt").val(0.0);
        $("#idSeldxTxt").html("0");
        $("#idSeldyTxt").html("0");
        $("#idSeldzTxt").html("0");
    });
}