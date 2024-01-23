/*
    ATON Node Class

    author: bruno.fanini_AT_gmail.com

===========================================================*/

//import Period from "./ATON.period.js";


import ATON from "./ATON";
// import SceneHub from "./ATON.scenehub";

/**
 Class representing an ATON node.
 Constructor allows to create different types (scene nodes, semantic nodes and UI nodes)
 @class Node
 @example
 let myNode = new ATON.Node("someID")
 */
class Node extends THREE.Group {

    constructor(id, type) {
        super();

        this.type = type ? type : ATON.NTYPES.SCENE;

        this.enablePicking();

        // this.annotable = true

        switch (this.type) {
            case ATON.NTYPES.SCENE:
                this._rootG = ATON._rootVisible;
                this._nodes = ATON.snodes;
                //this.period = undefined; // TODO: assign period object (read-only, centralized) - NOT USED FOR NOW
                break
            case ATON.NTYPES.UI:
                this._rootG = ATON._rootUI;
                this._nodes = ATON.uinodes;
                break
            case ATON.NTYPES.SEM:
                this._rootG = ATON._rootSem;
                this._nodes = ATON.semnodes;
                //this.period = undefined;
                break
        }

        // Register
        this.as(id);

        this.kwords = undefined;

        this._bCloneOnLoadHit = true;

        // Transform list (instancing)
        this._tlist = undefined;

        // Animation mixers
        this._aniMixers = undefined;

        // Shadows
        this.castShadow = false;
        this.receiveShadow = false;

        this._bs = new THREE.Sphere();

        this.autocenter = false;

        // Local handlers
        this.onHover = undefined;
        this.onLeave = undefined;
        this.onSelect = undefined;

        //
        this.nowHover = false
        this.nowEditing = false
        this.editable = false
        this.draggable = false
        this.nowDragging = false
        this.nowRotating = false
        this.isImported = false
        this.isImporter = false
        this.searchbarActive = false;
        this.keyboardActive = false;
        this.cardviewActive = false;
        this.isPivotWrapper = false;
        this.loadedFromJSON = false;
        this.sketchfabUrl = "";
        this.assetId = "";
        this._points = undefined;
        this.isSphereShape = false;
        this.isConvexShape = false;

        this.autoRotationInterval = undefined

        ATON.on("SceneNodeLeave", id => {
            if (this.nid === id) {
                this.nowHover = false

                if (this.nowEditing) {
                    ATON.Nav.setZoomWithWheel(true)
                }
            }
        })

        ATON.on("SceneNodeHover", id => {
            if (this.nid === id) {
                this.nowHover = true

                if (this.nowEditing) {
                    ATON.Nav.setZoomWithWheel(false)
                }
            }
        })
    }

    /**
     (Re)assign node ID
     @param {string} id - the new ID
     @example
     myNode.as("newID")
     */
    as(id) {
        if (id === undefined) {
            return;
        }
        if (id === ATON.ROOT_NID) {
            return;
        }

        // console.log("new nodeAA", id)
        this._nodes[id] = this;
        this.nid = id;
        this.name = id;

        return this;
    }

    setAsRoot() {
        this._nodes[ATON.ROOT_NID] = this;
        this.nid = ATON.ROOT_NID;

        return this;
    }

    setCloneOnLoadHit(b) {
        this._bCloneOnLoadHit = b;
        return this;
    }

    /**
     Add keyword(s) to this node. Keywords are also recursively added into the sub-graph
     @param {string} kw - the keyword or comma-separated list of keywords
     @example
     myNode.addKeywords("heritage,reconstruction");
     */
    addKeywords(kw) {
        let K = kw.split(",");

        if (this.kwords === undefined) this.kwords = {};
        for (let k in K) {
            let kw = K[k].trim();
            if (kw.length > 0) this.kwords[kw] = true;
        }

        // recurse into ATON nodes
        for (let c in this.children) {
            let C = this.children[c];
            if (C.type !== undefined) C.addKeywords(kw);
        }

        return this;
    }

    /**
     Returns true if this node has specific keyword
     @param {string} kw - the keyword
     @returns {boolean}
     @example
     if (myNode.hasKeyword("heritage")){ ... }
     */
    hasKeyword(kw) {
        if (this.kwords === undefined) {
            return;
        }

        return (this.kwords[kw] !== undefined);
    }

    /**
     Set custom description (string) to the node
     @param {string} s - content
     @example
     myNode.setDescription("This is a small description");
     */
    setDescription(s) {
        this.userData.description = s;
        return this;
    }

    /**
     Get node description (string) if any
     @returns {string}
     @example
     let desc = myNode.getDescription();
     */
    getDescription() {
        return this.userData.description;
    }

    setAudio(au) {
        this.userData.audio = au;
        return this;
    }

    getAudio() {
        return this.userData.audio;
    }

    /**
     Hide this node (and sub-graph), also invisible to queries (ray casting, picking)
     @example
     myNode.hide()
     */
    hide() {
        this.visible = false;

        //this.traverse((o) => { o.layers.disable(this.type); });
        ATON.Utils.setPicking(this, this.type, false);

        if (ATON._renderer.shadowMap.enabled) {
            ATON._dMainL.shadow.needsUpdate = true;
        }

        return this;
    }

    /**
     Show this node (and sub-graph). If pickable, becomes sensible to queries (ray casting)
     @example
     myNode.show()
     */
    show() {
        this.visible = true;

        //if (this.bPickable) ATON.Utils.setPicking(this, this.type, true); //this.traverse((o) => { o.layers.enable(this.type); });
        ATON.Utils.setPicking(this, this.type, this.bPickable);

        if (ATON._renderer.shadowMap.enabled) {
            if (ATON._dMainL !== undefined && ATON._dMainL.shadow !== undefined) ATON._dMainL.shadow.needsUpdate = true;
        }

        return this;
    }

    /**
     Toggle node visibility. If visible, becomes invisible, and viceversa.
     @example
     myNode.toggle()
     */
    toggle(b) {
        if (b === undefined) {
            if (this.visible) return this.hide(); else return this.show();
        }

        if (b) return this.show(); else return this.hide();

        ThreeMeshUI.update();
        return this;
    }

    /**
     Disable this node for runtime queries (ray casters). Useful for instance on vegetation, etc...
     @example
     myNode.load("somevegetation.gltf").disablePicking()
     */
    disablePicking() {
        this.bPickable = false;
        ATON.Utils.setPicking(this, this.type, this.bPickable);

        return this;
    }

    /**
     Enable this node for runtime queries (ray casters)
     @example
     myNode.enablePicking()
     */
    enablePicking() {
        this.bPickable = true;
        ATON.Utils.setPicking(this, this.type, this.bPickable);

        return this;
    }

    setPickable(b) {
        if (b) {
            this.enablePicking();
        } else {
            this.disablePicking();
        }

        return this;
    }

    setDraggable(b) {
        if (!b) {
            b = true
        }

        this.draggable = b;

        return this
    }

    setNowScaling(b) {
        if (b === undefined) {
            return
        }

        ATON.actualEditingNode.nowScaling = b

        if (ATON.actualEditingNode.nowScaling === true) {
            if (ATON.actualEditingNode.isPivotWrapper === true) {
                ATON.getUINode("editModeLabelMessage")
                    .setText("Now scaling " + ATON.actualEditingNode.children[0].nid)
            }
            else {
                ATON.getUINode("editModeLabelMessage")
                    .setText("Now scaling " + ATON.actualEditingNode.nid)
            }
            ATON.actualEditingNode.setNowDragging(false)
            ATON.actualEditingNode.setNowRotating(false)
        }
    }

    setNowRotating(b) {
        if (b === undefined) {
            return
        }

        ATON.actualEditingNode.nowRotating = b

        if (ATON.actualEditingNode.nowRotating === true) {
            if (ATON.actualEditingNode.isPivotWrapper === true) {
                ATON.getUINode("editModeLabelMessage")
                    .setText("Now rotating " + ATON.actualEditingNode.children[0].nid)
            }
            else {
                ATON.getUINode("editModeLabelMessage")
                    .setText("Now rotating " + ATON.actualEditingNode.nid)
            }
            ATON.actualEditingNode.setNowScaling(false)
            ATON.actualEditingNode.setNowDragging(false)
        }
    }

    rotationEvent(coords) {
        // console.log("ROT EVENT SEL AXIS: ", ATON._lastSelectedAxis)
        // console.log("ROT EVENT COORDS: ", coords.x, " --- ", coords.y)
        if (this.nowRotating) {
            let newRot = {
                "x": undefined,
                "y": undefined,
                "z": undefined
            }

            switch (ATON._lastSelectedAxis) {
                case 'x':
                    newRot.x = -(coords.y)
                    newRot.y = 0
                    newRot.z = 0
                    break;
                case 'y':
                    newRot.x = 0
                    newRot.y = coords.x
                    newRot.z = 0
                    break;
                case 'z':
                    newRot.x = 0
                    newRot.y = 0
                    newRot.z = coords.x
                    break;
            }


            this.setRotation(newRot.x, newRot.y, newRot.z)
        }
    }

    // Per far ruotare l'oggetto automaticamente
    setAutoRotation(b = true) {
        if (!b) {
            if (this.autoRotationInterval) {
                clearInterval(this.autoRotationInterval);
            }
        } else {
            this.autoRotationInterval = setInterval(() => {
                this.setRotation(this.rotation.x + 0.01/*undefined*/, this.rotation.y + 0.01/*undefined*/, this.rotation.z + 0.01/*undefined*/)
                // this.rotateX(Math.PI / 90)
                // this.rotateY(Math.PI / 90)
                // this.rotateZ(Math.PI / 90)
            }, 10);
        }

        return this
    }

    setNowDragging(b) {
        if (b === undefined) {
            return
        }

        ATON.actualEditingNode.nowDragging = b

        if (ATON.actualEditingNode.nowDragging === true) {
            if (ATON.actualEditingNode.isPivotWrapper === true) {
                ATON.getUINode("editModeLabelMessage")
                    .setText("Now dragging " + ATON.actualEditingNode.children[0].nid)
            }
            else {
                ATON.getUINode("editModeLabelMessage")
                    .setText("Now dragging " + ATON.actualEditingNode.nid)
            }
            ATON.actualEditingNode.setNowRotating(false)
            ATON.actualEditingNode.setNowScaling(false)
        }
    }

    setNowEditing(b) {
        if (b === undefined) {
            return
        }
        console.log("ACTUAL EDITING NODE: ", ATON.actualEditingNode)
        if (b === true) {
            if (ATON.SceneHub.nowEditingNodes.includes(ATON.actualEditingNode.nid)) {

                ATON.SUI.createMessageLabel("bannerEditor", 0.8, 0.4,
                    "Another editor is editing this node", 0.04, 3000)

                console.log("Another editor is editing this node")
                return;
            }

            ATON.getUINode("editModeLabelMessage")
                .setText("Now editing " + ATON.actualEditingNode.nid)

            if (!ATON.getUINode("verticalToolbarEditor")) {
                ATON.SUI.verticalToolbarEditor("verticalToolbarEditor", ATON.actualEditingNode)
                    .setPosition(0, -0.35, 0)
                    .attachTo(ATON.getUINode("editModeLabelMessage"))
            }

            // ATON.getUINode("verticalToolbarEditor").show()

            // ATON.SUI.verticalToolbarEditor("verticalToolbarEditor")
            //     .setPosition(0, -0.35, 0)
            //     .attachTo(ATON.getUINode("editModeLabelMessage"))



            // if (!ATON.getUINode("verticalToolbarEditor")) {
            //     let [listOfBtn, container] = ATON.SUI.verticalToolbarEditor("verticalToolbarEditor")
            //     container
            //         .setPosition(0, -0.35, 0)
            //         .attachTo(ATON.getUINode("editModeLabelMessage"))
            //
            //     for (let btn of listOfBtn) {
            //         btn.setPosition(-0.005, undefined, undefined)
            //     }
            //     console.log("OOO")
            // } else {
            //     console.log("OO", ATON.getUINode("verticalToolbarEditor").visible)
            //     if (ATON.getUINode("verticalToolbarEditor").visible === false) {
            //         ATON.getUINode("verticalToolbarEditor").show()
            //         console.log("O", ATON.getUINode("verticalToolbarEditor").visible)
            //     }
            //
            // }


        }
        else {
            if (ATON.getUINode("verticalToolbarEditor")) {
                ATON.getUINode("verticalToolbarEditor").delete()
            }
            ATON.actualEditingNode.nowDragging = b
            ATON.actualEditingNode.nowScaling = b
            ATON.actualEditingNode.nowRotating = b
        }

        ATON.actualEditingNode.nowEditing = b

        if (ATON.actualEditingNode.nowEditing === true) {
            ATON.Photon.fireEvent("StartEditNode", ATON.actualEditingNode.nid)
        } else {
            // ATON.actualEditingNode.nowEditing = false;
            ATON.Photon.fireEvent("StopEditNode", ATON.actualEditingNode.nid)
        }
    }

    positionEvent(newPos) {
        if (ATON.actualEditingNode.nowDragging && ATON._mainClick) {
            if (ATON.actualEditingNode.isImported) {
                if (ATON.actualEditingNode.parent) {
                    const parentNode = ATON.actualEditingNode.parent;
                    const oldY = parentNode.position.y;
                    parentNode.setPosition(newPos.x, oldY, newPos.z, true)
                }
            }
            else {
                const oldY = ATON.actualEditingNode.position.y;
                ATON.actualEditingNode.setPosition(newPos.x, oldY, newPos.z, true)
            }
            // ATON.actualEditingNode.setNowDragging(false)
            // ATON.getUINode('moveObj').switch(false);
            // this.setPosition(newPos.x, newPos.y, newPos.z)
        }
    }

    /**
     Set cascading material. Note this applies to this node and all children (even all those still loading)
     @param {THREE.Material} M - the Material
     @param mat_id_for_photon - if different from "" send the material change to Photon
     @example
     myNode.setMaterial( new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.2, wireframe: true }) )
     */
    setMaterial(M, mat_id_for_photon = "") {
        this.userData.cMat = M;

        this.traverse((o) => {
            if (o.isMesh) {
                o.material = M;
                //console.log(o);
            }

            if (o.type) {
                this.userData.cMat = M;
            }
        });


        // // children
        // for (let c in this.children) {
        //     let C = this.children[c];
        //     if (C.setMaterial) {
        //         // console.log(C)
        //         C.setMaterial(M);
        //     }
        // }

        if (mat_id_for_photon !== "") {
            // console.log("SEND", mat_id_for_photon)

            ATON.Photon.fireEvent("NodeChangeMaterial", {
                "nid": this.nid,
                "material_id": mat_id_for_photon
            })

            ATON.Photon.updateSceneState(this.nid, mat_id_for_photon)
        }

        return this;
    }

    setMaterialById(material_id, photon = false) {
        let mat = ATON.MatHub.getMaterial(material_id)

        /*if (!photon) {
            this.setMaterial(ATON.MatHub.getMaterial(material_id))
        } else {
            this.setMaterial(ATON.MatHub.getMaterial(material_id), material_id)
        }*/
        this.setMaterial.apply(this, (!photon ? [mat] : [mat, material_id]))

        return this;
    }

    /**
     Get cascading material
     @returns {THREE.Material}
     */
    getMaterial() {
        return this.userData.cMat;
    }

    // Set default and highlight materials
    setDefaultAndHighlightMaterials(matSTDId, matHLId) {
        this.userData.matSTDId = matSTDId;

        this.setMaterialById(matSTDId)

        this.userData.matHLId = matHLId;

        console.log("BAU", matHLId)

        return this;
    }

    highlight() {
        if (this.userData.matHLId) {
            console.log("HIGH", this.userData.matHLId)
            this.setMaterialById(this.userData.matHLId, true);
        }
        return this;
    }

    restoreDefaultMaterial() {
        if (this.userData.matSTDId) {
            this.setMaterialById(this.userData.matSTDId, true);
        }
        return this;
    }

// Set cascading opacity
    setOpacity(f) {
        this.traverse((o) => {
            if (o.isMesh) {
                o.material.opacity = f;
                //o.material.needsUpdate = true;
            }
        });

        return this;
    }

// FIXME: not working
    setShadowCast(b) {
        this.castShadow = b;

        this.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = b;
            }
        });

        return this;
    };

    setShadowReceive(b) {
        this.receiveShadow = b;

        this.traverse((o) => {
            if (o.isMesh) {
                o.receiveShadow = b;
            }
        });

        return this;
    };

    setEnvMap(envtex) {
        this.traverse((o) => {
            if (o.isMesh) {
                o.material.envMap = envtex;
                //o.material.combine = THREE.MultiplyOperation;
                //o.material.needsUpdate = true;
            }
        });

        return this;
    }

    assignLightProbe(LP) {
        this.traverse((o) => {
            if (o.isMesh && o.geometry) ATON.Utils.assignLightProbeToMesh(LP, o);
        });

        return this;
    }

// (re)assign LPs for each mesh depending on proximity
    assignLightProbesByProximity() {
        if (ATON._lps.length === 0) return this;

        this.traverse((o) => {
            if (o.isMesh && o.geometry) {
                let c = new THREE.Vector3();
                let bbox = new THREE.Box3().setFromObject(o).getCenter(c);

                let cLP = undefined;
                let mdist = undefined;

                for (let i in ATON._lps) {
                    let LP = ATON._lps[i];
                    let d = c.distanceToSquared(LP.pos);

                    if (cLP === undefined || d < mdist) {
                        mdist = d;
                        cLP = LP;
                    }
                }

                if (cLP) ATON.Utils.assignLightProbeToMesh(cLP, o);
            }
        });

        return this;
    };

    clearLightProbing() {
        this.traverse((o) => {
            if (o.isMesh && o.geometry) {
                ATON.Utils.clearLightProbeFromMesh(o);

                if (o.material) {
                    o.material.envMap.dispose();
                    o.material.needsUpdate = true;
                }
            }
        });

        return this;
    }

// Find & update all LPs under this subgraph
// FIXME: not working
    updateLightProbes = () => {
        this.traverse((o) => {
            if (o.isMesh && o.geometry) {
                let LP = o.userData.LP;

                if (LP !== undefined) {
                    LP.update();
                    o.material.envMap = LP.getEnvTex();
                    //o.material.envMapIntensity = 5.0;
                    //console.log("x");
                    o.material.needsUpdate = true;
                }
            }
        });

        return this;
    };

// Deep clone
    duplicate(bTraverse = true) {
        // console.log("this.type: ", this.type)
        let C = this.clone();
        // console.log("C.type: ", C.type)

        if (bTraverse) {
            console.log("traversaaaaaaaaaaaaaaaaaaaaaaaa")
            C.traverse((o) => {
                if (o.isMesh) {
                    o.material = o.material.clone();
                }
            });
        }
        C.type = this.type;
        return C;
    }


// FIXME: xxx
    delete() {
        // if (parent && (this.parent !== null || this.parent !== undefined))
        //     this.attachTo(parent)
        let p = this.parent;

        if (p !== undefined && p.nid !== undefined) p.removeChild(this);
        else ATON._rootSem.remove(this);
    }

    removeChild(c) {
        if (c === undefined) return;

        let nid = c.nid;
        // TODO: check this statement
        if (c.nid !== undefined) {
            delete this._nodes[c.nid];
        }

        c.parent = undefined;

        // console.log("OBJECT NODE REM CHILDS DIOCAAAAAAAAAAAAN: ", c)
        try {
            c.traverse((o) => {
                // console.log("O: ", o)
                if (o.geometry) {
                    o.geometry.dispose();
                }
                if (o.material) {
                    o.material.dispose();
                }
            });

            this.remove(c);

            return this;
        } catch (e) {
            return undefined;
        }
    }

    /**
     Delete all children of this node
     */
    removeChildren() {
        let num = this.children.length;
        for (let i = (num - 1); i >= 0; i--) {
            this.removeChild(this.children[i]);
        }

        return this;
    }


    /**
     Attach this node to parent by providing ID (string) or node object
     @param {string|Node} node - the parent node
     @example
     myNode.attachTo("someGroupID")
     @example
     myNode.attachTo(myParentGroup)
     */
    attachTo(node) {
        let N = (typeof node === 'string') ? this._nodes[node] : node;
        if (N) {
            N.add(this);
            if (N.userData.cMat !== undefined) {
                this.userData.cMat = N.userData.cMat; // this.setMaterial(N.userData.cMat);
            }
            if (N.bPickable !== undefined) {
                this.bPickable = N.bPickable;
            }
            //this.toggle(N.visible);
        }

        return N;
    }

    /**
     Attach this node to main root. This is usually mandatory in order to visualize the node and all its descendants.
     Depending on node type this will be the scene root (visible scene-graph), the semantic-graph root or UI root
     @example
     myNode.attachToRoot()
     */
    attachToRoot() {
        this._rootG.add(this);

        if (this._rootG.userData.cMat !== undefined) {
            this.userData.cMat = this._rootG.userData.cMat;
        }

        if (this._rootG.bPickable !== undefined) {
            this.bPickable = this._rootG.bPickable;
        }

        //this.toggle(this._rootG.visible);

        return this._rootG;
    }

    /**
     Return bounding sphere of this node
     @returns {THREE.Sphere}
     @example
     let bs = myNode.getBound()
     */
    getBound() {
        /*
            let bb = new THREE.Box3().setFromObject( this );
            let bs = new THREE.Sphere();
            bb.getBoundingSphere(bs);

            return bs;
        */
        this.dirtyBound();
        return this._bs;
    }

    getBoxBound() {
        /*
            let bb = new THREE.Box3().setFromObject( this );
            let bs = new THREE.Sphere();
            bb.getBoundingSphere(bs);

            return bs;
        */
        this.boxBound();
        return this._bb;
    }

    dirtyBound() {
        // console.log("THIS: ", this)
        let bb = new THREE.Box3().setFromObject(this);
        // console.log("Bounding Box: ", bb)
        /*if (this.name === 'Cat-2') {
            const sketchCubeHelper = new THREE.BoxHelper(this, 0x4287f5)
            ATON._rootVisible.add(sketchCubeHelper);
        }*/
        bb.getBoundingSphere(this._bs);
        // console.log("Bounding Box after get bounding sphere: ", bb)
        return this;
    }

    boxBound() {
        // console.log("THIS: ", this)
        this._bb = new THREE.Box3().setFromObject(this);
        // console.log("Bounding Box: ", this._bb)
        // if (this.name === 'Cat-2') {
        //     const sketchCubeHelper = new THREE.BoxHelper(this, 0x4287f5)
        //     ATON._rootVisible.add(sketchCubeHelper);
        // }
        // bb.getBoundingSphere(this._bs);
        // console.log("Bounding Box after get bounding sphere: ", bb)
        return this;
    }

    autoFit(bCenter, maxRad) {
        // console.log("L'HA CHIAMATA L'AUTOFIT")
        // console.log("maxRad :", maxRad)
        this.dirtyBound();
        // console.log("this._bs.radius :", this._bs.radius)

        if (bCenter) {
            this.position.copy(this._bs.center);
            this.position.multiplyScalar(-1);
        }

        if (maxRad && maxRad > 0.0 && this._bs.radius > 0.0) {
            let s = maxRad / this._bs.radius;
            // console.log("S: ", s)
            // console.log("THIS PRE SCALE: ", this)
            this.scale.set(s, s, s);
        }

        // return this;
    }

    autoFitToSpawn(bCenter, maxRad, skNode) {
        // console.log("L'HA CHIAMATA L'AUTOFIT")
        // console.log("maxRad :", maxRad)
        this.dirtyBound();
        // console.log("this._bs.radius :", this._bs.radius)

        if (bCenter) {
            this.position.copy(this._bs.center);
            this.position.multiplyScalar(-1);
        }

        if (maxRad && maxRad > 0.0 && this._bs.radius > 0.0) {
            let s = maxRad / this._bs.radius;
            // console.log("S: ", s)
            // console.log("THIS PRE SCALE: ", skNode)
            skNode.scale.set(s, s, s);
        }

        // return this;
    }

    autoPlaceOnSpawn(newMeshCenter) {
        this.setPosition(undefined, newMeshCenter, undefined)
    }

    getBoundingBoxForSketchfabNodes(){
        const box = new THREE.Box3();
        const tempBox = new THREE.Box3();

        // console.log("CCC", group)
        // console.log("CCC1", this.children[0])
        const obj = this.children[2];
        const BS = obj.getBound();
        console.log("SK NODE BS: ", BS);
        // const geometry = new THREE.SphereGeometry(BS.radius);
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const sphere = new THREE.Mesh(geometry, material);
        // obj.add(sphere);
        /*obj.traverse(child => {
            // let cc = child.children[0].children[0]
            console.log("CHIIIIIIIIIIRD: ", child)
            child.geometry.computeBoundingBox();
            tempBox.setFromPoints([
                child.geometry.boundingBox.min.clone().applyMatrix4(child.matrixWorld),
                child.geometry.boundingBox.max.clone().applyMatrix4(child.matrixWorld)
            ]);
            box.union(tempBox);
        });*/
        const BB = new THREE.Box3().setFromObject(obj);
        console.log("SK NODE BB: ", BB);

        return this;
    }

    /**
     Set location (translation) of this node
     @example
     myNode.setPosition(1.0,3.0,0.0)
     @example
     myNode.setPosition( new THREE.Vector3(1.0,3.0,0.0) )
     */
    setPosition(x, y, z, photon = false) {
        // console.log("NODE: ", this)
        // console.log("RAYCASTED", new THREE.Vector3(x, y, z));

        if (x instanceof THREE.Vector3) {
            // console.log("NEW POSITION: ", x);
            if (this.isImported) {
                // console.log("PARENT OLD POSITION: ", this.parent.position)
                // console.log("NODE OLD POSITION: ", this.position)
                this.parent.position.copy(x);
                // console.log("PARENT NEW POSITION: ", this.parent.position)
                // console.log("NODE NEW POSITION: ", this.position)
            }
            else {
                // console.log("NODE OLD POSITION: ", this.position)
                this.position.copy(x);
                // console.log("NODE NEW POSITION: ", this.position)
            }

        } else {
            // console.log("NEW POSITION: ", new THREE.Vector3(x, y, z));
            x = x === undefined ? this.position.x : x
            y = y === undefined ? this.position.y : y
            z = z === undefined ? this.position.z : z

            if (this.isImported) {
                // console.log("PARENT OLD POSITION: ", this.parent.position)
                // console.log("NODE OLD POSITION: ", this.position)
                this.parent.position.set(x, y, z)
                // console.log("PARENT NEW POSITION: ", this.parent.position)
                // console.log("NODE NEW POSITION: ", this.position)
            }
            else {
                // console.log("NODE OLD POSITION: ", this.position)
                // this.position.set(x, y, z);
                // console.log("NODE NEW POSITION: ", this.position)
                if (this.parent && this.parent.nid && this.parent.nid.includes("objcount")) {
                    if (this.parent.parent) {
                        // console.log("HATHOR ACT STATE: ", HATHOR._actState)
                        if (this.parent.parent.nid && HATHOR._actState === HATHOR.SELECTION_EDITNODES) {
                            // console.log("PARENT OF PARENT: ", this.parent.parent.nid)
                            const pivotParentX = this.parent.parent.position.x;
                            const pivotParentZ = this.parent.parent.position.z;
                            // const ParentX = this.parent.position.x;
                            // const ParentZ = this.parent.position.z;
                            // const catX = this.children[0].position.x;
                            // const catZ = this.children[0].position.z;
                            this.position.set(x - pivotParentX, y, z - pivotParentZ);
                            // console.log("PIVOT DEL GATTO PRIMA X: ", this.position.x)
                            // console.log("PIVOT DEL GATTO PRIMA Z: ", this.position.z)
                            // this.position.x = x;
                            // this.position.z = z;

                            // this.position.set((x - pivotParentX), y, (z - pivotParentZ));

                            // console.log("PIVOT DELLA BASE POSIZIONE X: ", pivotParentX)
                            // console.log("PIVOT DELLA BASE POSIZIONE Z: ", pivotParentZ)
                            // console.log("BASE POSIZIONE X: ", ParentX)
                            // console.log("BASE POSIZIONE Z: ", ParentZ)
                            // console.log("PIVOT DEL GATTO POSIZIONE DOPO X: ", this.position.x)
                            // console.log("PIVOT DEL GATTO POSIZIONE DOPO Z: ", this.position.z)
                            // console.log("GATTO POSIZIONE X: ", catX)
                            // console.log("GATTO POSIZIONE Z: ", catZ)
                            // console.log("NODE OLD POSITION: ", this.position)
                            // console.log("CHILD OLD POSITION: ", this.children[0].position)
                            // this.position.set(this.children[0].position.x - oldParentX, y, this.children[0].position.z - oldParentZ);
                            // this.position.set(x - this.children[0].position.x, y, z - this.children[0].position.z);
                            // console.log("NODE NEW POSITION: ", this.position)
                            // console.log("CHILD NEW POSITION: ", this.children[0].position)
                        }
                    }
                    // else {
                    //     console.log("NODE OLD POSITION: ", this.position)
                    //     this.position.set(x, y, z);
                    //     console.log("NODE NEW POSITION: ", this.position)
                    // }
                }
                else {
                    // console.log("NODE OLD POSITION: ", this.position)
                    this.position.set(x, y, z);
                    // console.log("NODE NEW POSITION: ", this.position)
                }
            }
        }

        if (photon) {
            // Update logged in users
            ATON.Photon.fireEvent("NodeNewPosition", {
                "nid": this.nid,
                "pos": {
                    "x": x,
                    "y": y,
                    "z": z
                }
            })

            ATON.Photon.updateSceneState(this.nid)

            let E = {}
            E.scenegraph = {}
            E.scenegraph.nodes = {}
            // E.scenegraph.edges = {}

            if (this.isImported) {
                E.scenegraph.nodes[this.parent.nid] = {}

                E.scenegraph.nodes[this.parent.nid].urls = this.parent.sketchfabUrl;
                E.scenegraph.nodes[this.parent.nid].assetId = this.parent.assetId;
                E.scenegraph.nodes[this.parent.nid].editable = true;
                E.scenegraph.nodes[this.parent.nid].isImported = this.parent.isImported;
                E.scenegraph.nodes[this.parent.nid].isImporter = this.parent.isImporter;
                E.scenegraph.nodes[this.parent.nid].isPivotWrapper = this.parent.isPivotWrapper;
                E.scenegraph.nodes[this.parent.nid].transform = {}

                E.scenegraph.nodes[this.parent.nid].transform.scale = [this.parent.scale.x, this.parent.scale.y, this.parent.scale.z];
                E.scenegraph.nodes[this.parent.nid].transform.rotation = [this.parent.rotation.x, this.parent.rotation.y, this.parent.rotation.z];
                E.scenegraph.nodes[this.parent.nid].transform.position = [this.parent.position.x, this.parent.position.y, this.parent.position.z];
            }
            else {
                E.scenegraph.nodes[this.nid] = {}

                E.scenegraph.nodes[this.nid].urls = this.sketchfabUrl;
                E.scenegraph.nodes[this.nid].assetId = this.assetId;
                E.scenegraph.nodes[this.nid].editable = true;
                E.scenegraph.nodes[this.nid].isImported = this.isImported;
                E.scenegraph.nodes[this.nid].isImporter = this.isImporter;
                E.scenegraph.nodes[this.nid].isPivotWrapper = this.isPivotWrapper;
                E.scenegraph.nodes[this.nid].transform = {}
                E.scenegraph.nodes[this.nid].transform.scale = [this.scale.x, this.scale.y, this.scale.z];
                E.scenegraph.nodes[this.nid].transform.rotation = [this.rotation.x, this.rotation.y, this.rotation.z];
                E.scenegraph.nodes[this.nid].transform.position = [this.position.x, this.position.y, this.position.z];
            }

            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
            // ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        }



        return this;
    }

    getPosition() {
        return this.position;
    }

    addToPosition(x, y, z) {
        let actualPosition = this.getPosition()
        let newx = actualPosition.x + x
        let newy = actualPosition.y + y
        let newz = actualPosition.z + z
        this.setPosition(newx, newy, newz)
    }

    /**
     Set scale of this node
     @example
     myNode.setScale(3.0,2.0,1.0)
     @example
     myNode.setScale(2.0)
     @example
     myNode.setScale( new THREE.Vector3(3.0,2.0,1.0) )
     */
    setScale(sx, sy, sz, photon = false) {
        if (sx instanceof THREE.Vector3) {
            if (this.isImported && this.parent) this.parent.scale.copy(sx);
            else this.scale.copy(sx);
        } else {
            if (sy === undefined) {
                sy = sx;
                sz = sx;
            }
            if (this.isImported && this.parent) this.parent.scale.set(sx, sy, sz);
            else this.scale.set(sx, sy, sz);
        }

        if (photon) {
            // Update logged in users
            ATON.Photon.fireEvent("NodeNewScale", {
                "nid": this.nid,
                "scale": {
                    "x": sx,
                    "y": sy,
                    "z": sz
                }
            })

            ATON.Photon.updateSceneState(this.nid)

            let E = {}
            E.scenegraph = {}
            E.scenegraph.nodes = {}
            // E.scenegraph.edges = {}

            if (this.isImported) {
                E.scenegraph.nodes[this.parent.nid] = {}

                E.scenegraph.nodes[this.parent.nid].urls = this.parent.sketchfabUrl;
                E.scenegraph.nodes[this.parent.nid].assetId = this.parent.assetId;
                E.scenegraph.nodes[this.parent.nid].editable = true;
                E.scenegraph.nodes[this.parent.nid].isImported = this.parent.isImported;
                E.scenegraph.nodes[this.parent.nid].isImporter = this.parent.isImporter;
                E.scenegraph.nodes[this.parent.nid].isPivotWrapper = this.parent.isPivotWrapper;
                E.scenegraph.nodes[this.parent.nid].transform = {}

                E.scenegraph.nodes[this.parent.nid].transform.scale = [this.parent.scale.x, this.parent.scale.y, this.parent.scale.z];
                E.scenegraph.nodes[this.parent.nid].transform.rotation = [this.parent.rotation.x, this.parent.rotation.y, this.parent.rotation.z];
                E.scenegraph.nodes[this.parent.nid].transform.position = [this.parent.position.x, this.parent.position.y, this.parent.position.z];
            }
            else {
                E.scenegraph.nodes[this.nid] = {}

                E.scenegraph.nodes[this.nid].urls = this.sketchfabUrl;
                E.scenegraph.nodes[this.nid].assetId = this.assetId;
                E.scenegraph.nodes[this.nid].editable = true;
                E.scenegraph.nodes[this.nid].isImported = this.isImported;
                E.scenegraph.nodes[this.nid].isImporter = this.isImporter;
                E.scenegraph.nodes[this.nid].isPivotWrapper = this.isPivotWrapper;
                E.scenegraph.nodes[this.nid].transform = {}
                E.scenegraph.nodes[this.nid].transform.scale = [this.scale.x, this.scale.y, this.scale.z];
                E.scenegraph.nodes[this.nid].transform.rotation = [this.rotation.x, this.rotation.y, this.rotation.z];
                E.scenegraph.nodes[this.nid].transform.position = [this.position.x, this.position.y, this.position.z];
            }

            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
            // ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        }

        return this;
    }

    incrementScale() {
        this.setScale(this.scale.x + 0.1, this.scale.y + 0.1, this.scale.z + 0.1, true)
        return this;
    }

    positiveRot() {
        switch (ATON._lastSelectedAxis) {
            case "x":
                this.setRotation(this.rotation.x + 0.05, this.rotation.y, this.rotation.z, true)
                break;
            case "y":
                this.setRotation(this.rotation.x, this.rotation.y + 0.05, this.rotation.z, true)
                break;
            case "z":
                this.setRotation(this.rotation.x, this.rotation.y, this.rotation.z + 0.05, true)
                break;
        }
        return this;
    }

    decrementScale() {
        this.setScale(this.scale.x - 0.1, this.scale.y - 0.1, this.scale.z - 0.1, true)
        return this;
    }

    negativeRot() {
            switch (ATON._lastSelectedAxis) {
                case "x":
                    this.setRotation(this.rotation.x - 0.05, this.rotation.y, this.rotation.z, true)
                    break;
                case "y":
                    this.setRotation(this.rotation.x, this.rotation.y - 0.05, this.rotation.z, true)
                    break;
                case "z":
                    this.setRotation(this.rotation.x, this.rotation.y, this.rotation.z - 0.05, true)
                    break;
        }
        return this;
    }

    getScale() {
        return this.scale;
    }

    /**
     Set rotation of this node (Euler rx,ry,rz) in radians
     @example
     myNode.setRotation(3.0,2.0,1.0)
     @example
     myNode.setRotation( new THREE.Vector3(3.0,2.0,1.0) )
     */
    setRotation(rx, ry, rz, photon = false) {
        let parentPivot = undefined;
        if (this.isImported) {
            parentPivot = this.parent;
            if (rx instanceof THREE.Vector3) {
                parentPivot.rotation.copy(rx);
            } else {
                rx = rx === undefined ? parentPivot.rotation.x : rx
                ry = ry === undefined ? parentPivot.rotation.y : ry
                rz = rz === undefined ? parentPivot.rotation.z : rz

                parentPivot.rotation.set(rx, ry, rz);
            }
        }
        else {
            if (rx instanceof THREE.Vector3) {
                this.rotation.copy(rx);
            } else {
                rx = rx === undefined ? this.rotation.x : rx
                ry = ry === undefined ? this.rotation.y : ry
                rz = rz === undefined ? this.rotation.z : rz

                this.rotation.set(rx, ry, rz);
            }
        }

        if (photon) {
            ATON.Photon.fireEvent("NodeNewRotation", {
                "nid": this.nid,
                "rot": {
                    "x": rx,
                    "y": ry,
                    "z": rz,
                }
            })

            ATON.Photon.updateSceneState(this.nid)

            let S = ATON.snodes;
            let E = {}
            E.scenegraph = {}
            E.scenegraph.nodes = {}
            E.scenegraph.edges = {}

            if (this.isImported) {
                E.scenegraph.nodes[this.parent.nid] = {}

                E.scenegraph.nodes[this.parent.nid].urls = this.parent.sketchfabUrl;
                E.scenegraph.nodes[this.parent.nid].assetId = this.parent.assetId;
                E.scenegraph.nodes[this.parent.nid].editable = true;
                E.scenegraph.nodes[this.parent.nid].isImported = this.parent.isImported;
                E.scenegraph.nodes[this.parent.nid].isImporter = this.parent.isImporter;
                E.scenegraph.nodes[this.parent.nid].isPivotWrapper = this.parent.isPivotWrapper;
                E.scenegraph.nodes[this.parent.nid].transform = {}

                E.scenegraph.nodes[this.parent.nid].transform.scale = [this.parent.scale.x, this.parent.scale.y, this.parent.scale.z];
                E.scenegraph.nodes[this.parent.nid].transform.rotation = [this.parent.rotation.x, this.parent.rotation.y, this.parent.rotation.z];
                E.scenegraph.nodes[this.parent.nid].transform.position = [this.parent.position.x, this.parent.position.y, this.parent.position.z];
            }
            else {
                E.scenegraph.nodes[this.nid] = {}

                E.scenegraph.nodes[this.nid].urls = this.sketchfabUrl;
                E.scenegraph.nodes[this.nid].assetId = this.assetId;
                E.scenegraph.nodes[this.nid].editable = true;
                E.scenegraph.nodes[this.nid].isImported = this.isImported;
                E.scenegraph.nodes[this.nid].isImporter = this.isImporter;
                E.scenegraph.nodes[this.nid].isPivotWrapper = this.isPivotWrapper;
                E.scenegraph.nodes[this.nid].transform = {}
                E.scenegraph.nodes[this.nid].transform.scale = [this.scale.x, this.scale.y, this.scale.z];
                E.scenegraph.nodes[this.nid].transform.rotation = [this.rotation.x, this.rotation.y, this.rotation.z];
                E.scenegraph.nodes[this.nid].transform.position = [this.position.x, this.position.y, this.position.z];
            }

            /*for (let node in S) {
                if (S[node].parent.nid) {
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
            }*/

            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
            // ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        }

        return this;
    }

    getRotation() {
        return this.rotation;
    }

    /**
     Orient this node to current camera
     */
    orientToCamera() {
        this.quaternion.copy(ATON.Nav._qOri);
        return this;
    }

    /**
     Orient this node from z-up to y-up
     */
    setYup() {
        this.rotation.set(-1.57079632679, 0.0, 0.0);
        return this;
    }

    /**
     Add a transform for this node.
     Adding multiple transforms before loading a 3D model will result in instancing these resources
     @param {string} T - the transform string to be added
     @example
     myNode.addTransform("10 0 0").addTransform("-5 0 0").load("mymodel.gltf").attachToRoot()
     */
    addTransform(T) {
        let TT = undefined;

        if (typeof T === "string") {
            TT = ATON.Utils.parseTransformString(T);
        }

        if (TT === undefined) {
            return this;
        }

        if (this._tlist === undefined) {
            this._tlist = [];
        }
        this._tlist.push(TT);

        return this;
    }

    /**
     Load a 3D model under this node, with optional onComplete handler.
     Note the system will take care of loading the resources in background, and will manage duplicate requests to same resources avoiding waste of bandwidth
     @param {string} url - the url of the 3D model (local to collection or complete)
     @param {function} onComplete - the optional handler to be fired on completion
     @example
     myNode.load("mymodel.gltf", ()=>{ console.log("completed!") })
     */
    load(url, onComplete) {
        if (url === undefined) {
            return this;
        }

        let N = this;

        url = ATON.Utils.resolveCollectionURL(url);

        // Try load from known services/platforms
        if (ATON.Utils.tryLoadFromService(url, N)) {
            if (onComplete) {
                onComplete();
            }
            return N;
        }

        let ext = ATON.Utils.getFileExtension(url);

        // Tileset
        if (ext === "json") {
            ATON.MRes.loadTileSetFromURL(url, N);
            //ATON._bqScene = true;
            if (onComplete) {
                onComplete();
            }
            return N;
        }

        // IFC
        if (ext === "ifc" && ATON._ifcLoader !== undefined) {
            // TODO:

            ATON._ifcLoader.load(url, (ifcmodel) => {
                N.add(ifcmodel);

                ATON._bqScene = true;

                ATON.Utils.modelVisitor(N, ifcmodel);

                if (N.bPickable) N.enablePicking();
                N.dirtyBound();

                if (onComplete) onComplete();
            });

            return N;
        }

        // Check custom resource handler for given extension if any
        if (ATON._resHandler && ATON._resHandler[ext]) {
            ATON._resHandler[ext](url, N);
            return N;
        }

        // [C] Promise already requested
        if (N._bCloneOnLoadHit && ATON._assetsManager[url] !== undefined) {
            ATON._assetsManager[url].then((o) => {
                let C = o.clone();

                ATON.Utils.modelVisitor(N, C);

                if (N._tlist !== undefined) {
                    for (let t in N._tlist) {
                        N._tlist[t].add(C.clone());
                        N.add(N._tlist[t]);
                    }
                } else {
                    N.add(C);
                }

                // animations
                //ATON.Utils.registerAniMixers(N, data);

                //N.setPickable(N.bPickable);
                //N.toggle(N.visible);

                if (onComplete) {
                    onComplete();
                }
            });

            //console.log("HIT!");
            return N;
        }

        // Fire request
        /*if (N.type === ATON.NTYPES.SCENE)*/
        ATON._assetReqNew(url);

        let P = new Promise((resolve, reject) => {
            ATON._aLoader.load(url, (data) => {
                let model = data.scene || data.scene[0];

                // Visit loaded model
                ATON.Utils.modelVisitor(N, model);

                if (N._tlist !== undefined) {
                    for (let t in N._tlist) {
                        N._tlist[t].add(model.clone());
                        N.add(N._tlist[t]);
                    }
                } else N.add(model);

                // animations
                ATON.Utils.registerAniMixers(N, data);

                // Copyrigth extraction
                ATON.CC.extract(data);

                resolve(model);
                console.log("Model "+url+" loaded");
                console.log("%cModel loaded", "color:green");

                /*if (N.type === ATON.NTYPES.SCENE)*/
                ATON._assetReqComplete(url);

                // post-visit (FIXME:)
                //N.setPickable(N.bPickable);
                //N.toggle(N.visible);

                if (N.type === ATON.NTYPES.SCENE) {
                    ATON._bqScene = true;
                } else if (N.type === ATON.NTYPES.SEM) {
                    ATON._bqSem = true;
                }

                //
                if (N.bPickable) N.enablePicking();

                N.dirtyBound();
                N.boxBound();

                if (onComplete) onComplete();
            }, undefined, (err) => {
                console.log(err);
                //reject(model);
                console.log("%cError loading model " + url, "color:red");

                /*if (N.type === ATON.NTYPES.SCENE)*/
                ATON._assetReqComplete(url);
                if (onComplete) onComplete();
            });

            /*
                    ATON._aLoader.load( url+"__LOD2-d.gltf", (data)=>{
                        let model = data.scene || data.scene[0];
                        ATON._modelVisitor(model);

                        let C = new THREE.Vector3();
                        let bb = new THREE.Box3().setFromObject( model ).getCenter(C);
                        model.position.set(-C.x,-C.y,-C.z);

                        let lod = new THREE.LOD();
                        lod.position.set(C.x,C.y,C.z);
                        lod.matrixAutoUpdate = true;
                        lod.addLevel(model, 40.0);
                        N.add(lod);

                        //N.add( model );

                        resolve(model);
                        console.log("ATON model "+url+" loaded");

                        ATON._aLoader.load( url+"__LOD1-d.gltf", (data2)=>{
                            let model2 = data2.scene || data2.scene[0];
                            ATON._modelVisitor(model2);

                            model2.position.set(-C.x,-C.y,-C.z);

                            lod.addLevel(model2, 0.0);
                        });

                        ATON._assetReqComplete(url);
                    });
            */
        });

        // Register
        if (N._bCloneOnLoadHit) {
            ATON._assetsManager[url] = P;
        }

        return this;
    }

    loadProm(url) {
        // console.log("inside loadprom before")
        return new Promise((resolve, reject) => {
            // console.log("inside loadprom")
            if (url === undefined) {
                reject("URL is undefined");
            }

            let N = this;
            url = ATON.Utils.resolveCollectionURL(url);

            if (ATON.Utils.tryLoadFromService(url, N)) {
                resolve(N);
            } else {
                let ext = ATON.Utils.getFileExtension(url);

                if (ext === "json") {
                    ATON.MRes.loadTileSetFromURL(url, N);
                    resolve(N);
                } else if (ext === "ifc" && ATON._ifcLoader !== undefined) {
                    ATON._ifcLoader.load(url, ifcmodel => {
                        N.add(ifcmodel);
                        ATON._bqScene = true;
                        ATON.Utils.modelVisitor(N, ifcmodel);
                        if (N.bPickable) N.enablePicking();
                        N.dirtyBound();
                        resolve(N);
                    });
                } else if (ATON._resHandler && ATON._resHandler[ext]) {
                    ATON._resHandler[ext](url, N);
                    resolve(N);
                } else {
                    if (N._bCloneOnLoadHit && ATON._assetsManager[url] !== undefined) {
                        ATON._assetsManager[url].then(o => {
                            let C = o.clone();
                            ATON.Utils.modelVisitor(N, C);
                            if (N._tlist !== undefined) {
                                for (let t in N._tlist) {
                                    N._tlist[t].add(C.clone());
                                    N.add(N._tlist[t]);
                                }
                            } else {
                                N.add(C);
                            }
                            if (onComplete) {
                                onComplete();
                            }
                            resolve(N);
                        });
                    } else {
                        ATON._assetReqNew(url);

                        ATON._aLoader.load(
                            url,
                            data => {
                                let model = data.scene || data.scene[0];
                                // console.log("MODEEEEEEEEEEL: ", model)
                                ATON.Utils.modelVisitor(N, model);
                                if (N._tlist !== undefined) {
                                    for (let t in N._tlist) {
                                        N._tlist[t].add(model.clone());
                                        N.add(N._tlist[t]);
                                    }
                                } else N.add(model);
                                ATON.Utils.registerAniMixers(N, data);
                                ATON.CC.extract(data);
                                // Copyrigth extraction

                                resolve(model);
                                ATON._assetReqComplete(url);
                                if (N.type === ATON.NTYPES.SCENE) {
                                    ATON._bqScene = true;
                                } else if (N.type === ATON.NTYPES.SEM) {
                                    ATON._bqSem = true;
                                }
                                if (N.bPickable) N.enablePicking();
                                N.dirtyBound();
                                N.boxBound();
                            },
                            undefined,
                            err => {
                                console.log("Error loading model " + url, "color:red");
                                ATON._assetReqComplete(url);
                                reject(err);
                            }
                        );
                    }
                }
            }
        });
    }

    exportAs(filename) {
        ATON.Utils.exportNode(this, filename);

        return this;
    }

    highlightOnHover(b) {
        if (b === undefined) {
            b = true
        }

        if (b) {
            this.setOnHover(() => {
                this.highlight()
            })

            this.setOnLeave(() => {
                this.restoreDefaultMaterial()
            })
        } else {
            this.setOnHover(() => {
            })
            this.setOnLeave(() => {
            })
        }

        return this
    }

    setOnHover(f) {
        this.onHover = f;
        return this;
    }

    setOnLeave(f) {
        this.onLeave = f;
        return this;
    }

    setOnSelect(f) {
        this.onSelect = f;
        return this;
    }

    setEditable() {
        this.setOnSelect(() => {
            if (ATON.SceneHub.editNodes === true) {
                console.log("HOVERED NODE BEFORE SetNowEditing: ", this)
                ATON.actualEditingNode = this;
                this.setNowEditing(true)
                // this.setNowDragging(true)
            }
        })

        ATON.on("MouseWheel", (d) => {
            if (this.nowEditing && this.nowHover && ATON.SceneHub.editNodes) {
                switch (ATON._lastSelectedEditMode) {
                    case "scale":
                        if (d < 0) {
                            if (this.isImported) {
                                const stackInfo = {
                                    action: "scale",
                                    node: this,
                                    scale: this.parent.scale.clone()
                                }
                                ATON.undoStack.push(stackInfo);
                                this.parent.incrementScale()
                            }
                            else if (this.isPivotWrapper) {
                                const stackInfo = {
                                    action: "scale",
                                    node: this.children[0],
                                    scale: this.children[0].scale.clone()
                                }
                                ATON.undoStack.push(stackInfo);
                                this.children[0].incrementScale()
                            }
                            else {
                                const stackInfo = {
                                    action: "scale",
                                    node: this,
                                    scale: this.scale.clone()
                                }
                                ATON.undoStack.push(stackInfo);
                                this.incrementScale()
                            }
                        } else if (d > 0) {
                            if (this.isImported) {
                                const stackInfo = {
                                    action: "scale",
                                    node: this,
                                    scale: this.parent.scale.clone()
                                }
                                ATON.undoStack.push(stackInfo);
                                this.parent.decrementScale()
                            }
                            else if (this.isPivotWrapper) {
                                const stackInfo = {
                                    action: "scale",
                                    node: this.children[0],
                                    scale: this.children[0].scale.clone()
                                }
                                ATON.undoStack.push(stackInfo);
                                this.children[0].decrementScale()
                            }
                            else {
                                const stackInfo = {
                                    action: "scale",
                                    node: this,
                                    scale: this.scale.clone()
                                }
                                ATON.undoStack.push(stackInfo);
                                this.decrementScale()
                            }
                        }
                        break;
                    case "rot":
                        const delta = d * 0.0001
                        console.log("DELTA: ", delta)
                        switch (ATON._lastSelectedAxis) {
                            case "x":
                                if (this.isImported) {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this,
                                        rot: this.parent.rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.parent.rotation.x - delta, this.parent.rotation.y, this.parent.rotation.z, true);
                                }
                                else if (this.isPivotWrapper) {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this.children[0],
                                        rot: this.children[0].rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.children[0].rotation.x - delta, this.children[0].rotation.y, this.children[0].rotation.z, true);
                                }
                                else {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this,
                                        rot: this.rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.rotation.x - delta, this.rotation.y, this.rotation.z, true);
                                }
                                // let BBx = new THREE.Box3().setFromObject(this);
                                // console.log("BB after rot x: ", BBx)
                                break;
                            case "y":
                                if (this.isImported) {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this,
                                        rot: this.parent.rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.parent.rotation.x, this.parent.rotation.y - delta, this.parent.rotation.z, true);
                                }
                                else if (this.isPivotWrapper) {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this.children[0],
                                        rot: this.children[0].rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.children[0].rotation.x, this.children[0].rotation.y - delta, this.children[0].rotation.z, true);
                                }
                                else {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this,
                                        rot: this.rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.rotation.x, this.rotation.y - delta, this.rotation.z, true);
                                }
                                // let BBy = new THREE.Box3().setFromObject(this);
                                // console.log("BB after rot y: ", BBy)
                                break;
                            case "z":
                                if (this.isImported) {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this,
                                        rot: this.parent.rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.parent.rotation.x, this.parent.rotation.y, this.parent.rotation.z - delta, true);
                                }
                                else if (this.isPivotWrapper) {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this.children[0],
                                        rot: this.children[0].rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.children[0].rotation.x, this.children[0].rotation.y, this.children[0].rotation.z - delta, true);
                                }
                                else {
                                    const stackInfo = {
                                        action: "rot",
                                        node: this,
                                        rot: this.rotation.clone()
                                    }
                                    ATON.undoStack.push(stackInfo);
                                    this.setRotation(this.rotation.x, this.rotation.y, this.rotation.z - delta, true);
                                }
                                // let BBz = new THREE.Box3().setFromObject(this);
                                // console.log("BB after rot z: ", BBz)
                                break;
                        }
                        break;
                    case "drag":
                        // const P = ATON._queryDataScene.p
                        // this.positionEvent(P)
                        break;
                }
            }
        })

        ATON.on("ChangedRotationAxis", (axis) => {
            if (ATON.actualEditingNode.isPivotWrapper) {
                ATON.getUINode("editModeLabelMessage")
                    .setText("Now rotating " + ATON.actualEditingNode.children[0].nid + " on " + axis)
            }
            else {
                ATON.getUINode("editModeLabelMessage")
                    .setText("Now rotating " + ATON.actualEditingNode.nid + " on " + axis)
            }
        })

        return this
    }

    /**
     Load a Cesium ION asset. If not set, a prompt will ask for a valid token
     @param {string} ionAssID - the asset ID on Cesium ION
     @example
     myNode.loadCesiumIONAsset("354759")
     */
    loadCesiumIONAsset(ionAssID) {
        ATON.MRes.loadCesiumIONAsset(ionAssID, this);
        return this;
    }

    /**
     Load a SketchFab asset. If not set, a prompt will ask for a valid token
     @param {string} skfAssID - the asset ID on SketchFab
     @example
     myNode.loadSketchfabAsset("62662d27c94d4994b2479b8de3a66ca7")
     */
    /*loadSketchfabAsset(skfAssID) {
        let tok = ATON.getAPIToken("sketchfab");
        let N = this;

        if (tok == null) {
            console.log("A valid Sketchfab token is required");

            tok = prompt("Please enter a valid Sketchfab token:");
            if (tok == null || tok === "") {
                return this;
            }
        }

        //console.log(tok)

        let url = "https://api.sketchfab.com/v3/models/" + skfAssID + "/download";
        let options = {
            method: 'GET',
            headers: {
                //Authorization: 'Bearer '+tok,
                Authorization: 'Token ' + tok
            },
            mode: 'cors'
        };

        console.log("OPTIONS", options)

        fetch(url, options)
            .then(res => res.json())
            .then(data => {
                // ATON.setAPIToken("sketchfab", tok);

                if (data.glb) {
                    let url = data.glb.url;

                    N.load(url);
                    return N;
                }
                /!*
                            if (data.gltf){
                                let zipurl = data.gltf.url;
                                // TODO:
                                //N.load(...);
                                return N;
                            }
                *!/
            });

        return this;
    }*/

    async loadSketchfabAsset(skfAssID) {
        // console.log("inside loadSketchfabAsset ")

        let tok = ATON.getAPIToken("sketchfab");
        let N = this;

        if (tok == null) {
            console.log("A valid Sketchfab token is required");

            tok = prompt("Please enter a valid Sketchfab token:");
            if (tok == null || tok === "") {
                return this;
            }
        }

        //console.log(tok)

        let url = "https://api.sketchfab.com/v3/models/" + skfAssID + "/download";
        let options = {
            method: 'GET',
            headers: {
                //Authorization: 'Bearer '+tok,
                Authorization: 'Token ' + tok
            },
            mode: 'cors'
        };

        // console.log("OPTIONS", options)

        // console.log("inside loadSketchfabAsset before fetch ")

        await fetch(url, options)
            .then(res => res.json())
            .then(async data => {
                // ATON.setAPIToken("sketchfab", tok);
                // console.log("inside loadSketchfabAsset inside fetch then ")

                if (data.glb) {
                    let url = data.glb.url;
                    // console.log("inside loadSketchfabAsset before loadProm ")
                    await N.loadProm(url);
                    return N;
                }
                /*
                            if (data.gltf){
                                let zipurl = data.gltf.url;
                                // TODO:
                                //N.load(...);
                                return N;
                            }
                */
            });

        return this;
    }
    async loadSketchfabAssetProm(skfAssID) {
        return new Promise(async (resolve, reject) => {
            let tok = ATON.getAPIToken("sketchfab");
            let N = this;

            if (tok == null) {
                console.log("A valid Sketchfab token is required");

                tok = prompt("Please enter a valid Sketchfab token:");
                if (tok == null || tok === "") {
                    reject("Invalid Sketchfab token");
                    return;
                }
            }

            let url = "https://api.sketchfab.com/v3/models/" + skfAssID + "/download";
            let options = {
                method: 'GET',
                headers: {
                    Authorization: 'Token ' + tok
                },
                mode: 'cors'
            };

            await fetch(url, options)
                .then(res => res.json())
                .then(data => {
                    if (data.glb) {
                        let url = data.glb.url;
                        N.loadProm(url)
                            /*.then(result => {
                                console.log("Asset loaded successfully:", result);
                            })
                            .catch(error => {
                                console.error("Error loading asset:", error);
                            });*/
                        resolve(N);
                    } else {
                        // Handle other cases like data.gltf here
                        // For now, we are just rejecting with an error message
                        reject("Unsupported Sketchfab asset format");
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

// Assign a period to this node
// TODO: 
    /*
    setPeriod(p){
        if (this.type === ATON.NTYPES.UI) return this; // not on UI nodes

        let P = (typeof p === 'string')? ATON.periods[p] : p;
        if (P === undefined) return this;

        this.period = P;
        return this;
    }

    filterByPeriodID(id){
        if (this.period === undefined) return this;

        if (this.period.id !== id){
            this.hide();
            return this;
            }
        else {
            this.show();
            return this;
        }

        this.traverse((o) => {
            if (o.period){
                if (o.period.id === id) this.show();
                else this.hide();
            }
        });

        return this;
    }
    */

}

export default Node;