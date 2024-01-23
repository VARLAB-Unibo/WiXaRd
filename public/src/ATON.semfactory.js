/*
    ATON Semantic shapes factory
    TODO: rename in SemHub

    author: bruno.fanini_AT_gmail.com

===========================================================*/

/**
 ATON Semantic Factory
 @namespace SemFactory
 */

import {Line2} from 'three/addons/lines/Line2.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import Photon from "./ATON.photon";
import ATON from "./ATON";
import SUI from "./ATON.sui/ATON.sui";
import { v4 as uuidv4 } from 'uuid';

let SemFactory = {};

SemFactory.FLOAT_PREC = 5;
SemFactory._firstAnnotationAfterLoad = false;

SemFactory.init = () => {
    SemFactory.bConvexBuilding = false;
    SemFactory.convexPoints = [];
    //SemFactory.convexMeshes  = [];
    SemFactory.convexNode = undefined; // keeps track of current convex semnode
    SemFactory.currConvexMesh = undefined;

    // Temp sem node to hold developing convex mesh
    SemFactory.currSemNode = ATON.createSemanticNode();
    SemFactory.currSemNode.disablePicking();
    SemFactory.currSemNode.attachToRoot();

    SemFactory.resetMaterial();

    SemFactory._numShapes = 0; // counter of shapes produced

    // Annotations
    SemFactory.nowAnnotating = false
    SemFactory.nowWritingAnnotation = false
    SemFactory.nowErasingAnnotation = false
    SemFactory.annotationColor = 0x000000
    SemFactory.annotationWidth = 5
    SemFactory.annotationColors = {}
    SemFactory.annotationWidths = {}
    SemFactory.annotationPoints = [[]]
    SemFactory.annotationsIndex = 0;
    SemFactory.aPoints = [ATON.createSemanticNode("manual_ann" + SemFactory.annotationsIndex)]
    ATON._rootSem.add(SemFactory.aPoints[SemFactory.annotationsIndex]);

    // ATON.on("HitsUI", queryDataUI => SemFactory.annotation(queryDataUI.p))
    ATON.on("HitsScene", queryDataScene => SemFactory.annotation(queryDataScene.p))
};


// Current material
SemFactory.resetMaterial = () => {
    SemFactory.currMaterial = ATON.MatHub.getMaterial("semanticShapeHL"); // current sem material we are using. Was "semanticShape"
};

SemFactory.setMaterial = (m) => {
    if (m === undefined) return;
    SemFactory.currMaterial = m;
    // SemFactory.currMaterial = ATON.MatHub.getMaterial(m);
};

SemFactory.setAnnotationsIndex = (idx) => {
    SemFactory.annotationsIndex = idx;
    console.log("IDX: ", SemFactory.annotationsIndex)
}


/**
 Add a convex point in a given location for current convex semantic shape.
 A minimum of 4 points are required. Return true if point was successfully added
 @param {THREE.Vector3} p - the point
 @returns {boolean}
 */
SemFactory.addConvexPoint = (/*semid,*/ p) => {
    if (p === undefined) return false;

    if (SemFactory.convexPoints.length > 0) {
        let pp = SemFactory.convexPoints[SemFactory.convexPoints.length - 1];
        if (p.equals(pp)) return false;
    }

    SemFactory.convexPoints.push(p);
    let numPoints = SemFactory.convexPoints.length;

    // Spatial UI
    //let M = new THREE.Mesh( ATON.Utils.geomUnitSphere, ATON.MatHub.getMaterial("semanticShapeEdit"));
    //M.position.copy(p);
    //M.scale.set(0.001,0.001,0.001);
    //ATON.SUI.gPoints.add( M );

    let iconP = new THREE.Sprite(ATON.SUI.getOrCreateSpritePointEdit());
    let ss = ATON.getSceneQueriedDistance() * 0.02;
    if (ss === undefined) ss = 0.02;
    iconP.position.copy(p);
    iconP.scale.set(ss, ss, ss);
    ATON.SUI.gPoints.add(iconP);

    if (numPoints < 4) return false;

    // lets build convex shape
    let geom = new THREE.ConvexGeometry(SemFactory.convexPoints); // new THREE.ConvexBufferGeometry( SemFactory.convexPoints );
    // let semesh = new THREE.Mesh(geom, ATON.MatHub.materials.semanticShapeEdit);
    let semesh = new THREE.Mesh(geom, ATON.MatHub.getMaterial("semanticShapeEdit"));

    //let numMeshes = SemFactory.convexMeshes.length;

    // First time: create semnode and add it to current sem group
    if (!SemFactory.bConvexBuilding) {
        //if (semid === undefined) semid = "sem"+SemFactory._numShapes;

        //SemFactory.convexNode = ATON.getSemanticNode(semid) || ATON.createSemanticNode(semid);
        //SemFactory.convexNode = ATON.createSemanticNode();
        //SemFactory.convexNode.add(semesh);
        SemFactory.currSemNode.add(semesh);

        // Store
        semesh.userData._convexPoints = [];
        for (let i = 0; i < numPoints; i++) {
            //semesh.userData._convexPoints.push( ATON.Utils.setVectorPrecision(SemFactory.convexPoints[i],3) );

            ATON.Utils.setVectorPrecision(SemFactory.convexPoints[i], SemFactory.FLOAT_PREC);

            semesh.userData._convexPoints.push(SemFactory.convexPoints[i].x);
            semesh.userData._convexPoints.push(SemFactory.convexPoints[i].y);
            semesh.userData._convexPoints.push(SemFactory.convexPoints[i].z);
        }

        SemFactory.currConvexMesh = semesh;
        SemFactory.bConvexBuilding = true;
    }

    // keep updating current semantic geometry
    else {
        let currSemesh = SemFactory.currConvexMesh;
        currSemesh.geometry.dispose();
        currSemesh.geometry = geom;

        //currSemesh.userData._convexPoints.push( ATON.Utils.setVectorPrecision(p,3) );

        ATON.Utils.setVectorPrecision(p, 4);
        currSemesh.userData._convexPoints.push(p.x);
        currSemesh.userData._convexPoints.push(p.y);
        currSemesh.userData._convexPoints.push(p.z);
    }

    return true;
};

SemFactory.undoConvexPoint = () => {
    let numPoints = SemFactory.convexPoints.length;
    if (numPoints === 0) return;

    //if (!SemFactory.bConvexBuilding) return;

    SemFactory.convexPoints.pop();

    if (SemFactory.currConvexMesh) {
        let udMesh = SemFactory.currConvexMesh.userData;
        if (udMesh._convexPoints) udMesh._convexPoints.pop();
    }
};

/**
 Cancel current convex semantic shape, if building one
 */
SemFactory.stopCurrentConvex = () => {
    if (!SemFactory.bConvexBuilding) return;

    SemFactory.convexPoints = [];
    SemFactory.bConvexBuilding = false;

    SemFactory.currSemNode.removeChildren();
    ATON.SUI.gPoints.removeChildren();
};

/**
 Get current convex semantic shape
 @returns {Node}
 */
SemFactory.getCurrentConvexShape = () => {
    return SemFactory.currSemNode;
};

/**
 Return true if currently building a convex semantic shape
 @returns {boolean}
 */
SemFactory.isBuildingShape = () => {
    if (SemFactory.convexPoints.length > 0) return true;

    return false;
};

/**
 Complete and return the semantic convex shape (if currently building one) providing a semantic-ID.
 NOTE: if semid exists, add mesh under the same semantic id
 @param {string} semid - the semantic ID to assign
 @returns {Node}
 @example
 let S = ATON.SemFactory.completeConvexShape("face")
 */
SemFactory.completeConvexShape = (semid) => {
    SemFactory.bConvexBuilding = false;

    //if (SemFactory.convexNode === undefined) return undefined;
    //if (SemFactory.currConvexMesh === undefined) return undefined;
    if (SemFactory.currSemNode === undefined) return;

    if (semid === undefined) semid = "sem" + SemFactory._numShapes;

    let S = ATON.getSemanticNode(semid) || ATON.createSemanticNode(semid);

    let meshape = SemFactory.currSemNode.children[0];

    ATON.SUI.addSemIcon(semid, meshape);

    S.add(meshape);
    console.log("CONVEX POINTS: ", SemFactory.convexPoints)
    S._points = [];
    for (let pt in SemFactory.convexPoints) {
        S._points.push(pt.x);
        S._points.push(pt.y);
        S._points.push(pt.z);
    }
    SemFactory.convexPoints = [];
    // S.setMaterial( /*SemFactory.currMaterial*/ATON.MatHub.materials.semanticShape);
    // S.setDefaultAndHighlightMaterials(/*SemFactory.currMaterial*/ ATON.MatHub.materials.semanticShape, /*ATON.MatHub.materials.semanticShapeHL*/SemFactory.currMaterial);
    // S.enablePicking();
    S.setMaterial("semanticShape");
    // S.setDefaultAndHighlightMaterials("semanticShape", SemFactory.currMaterial);
    S.enablePicking();

    SemFactory.currSemNode.removeChildren();

    /*
        SemFactory.convexNode = ATON.getSemanticNode(semid) || ATON.createSemanticNode(semid);
        SemFactory.convexNode.add(SemFactory.currConvexMesh);

        SemFactory.convexNode.setMaterial( SemFactory.currMaterial );
        SemFactory.convexNode.setDefaultMaterial(SemFactory.currMaterial);
        SemFactory.convexNode.enablePicking();
    */
    SemFactory._numShapes++;

    //console.log(SemFactory.convexNode);
    //console.log(SemFactory.convexNode.userData._convexPoints);

    //return SemFactory.convexNode;

    // Spatial UI
    ATON.SUI.gPoints.removeChildren();
    ATON._bqSem = true;

    return S;
};
/**
 Create a semantic convex shape providing a semantic-ID and a set of points.
 NOTE: if semid exists, add mesh under the same semantic id
 @param {string} semid - the semantic ID to assign
 @param {[]} points - the list of points
 @returns {Node}
 @example
 let S = ATON.SemFactory.createConvexShape("face", points)
 */
SemFactory.createConvexShape = (semid, points, pts_data = undefined) => {
    let geom = new THREE.ConvexGeometry(points); // CHECK: it was THREE.ConvexBufferGeometry( points );
    // let semesh = new THREE.Mesh(geom, ATON.MatHubmaterials.semanticShape);
    let semesh = new THREE.Mesh(geom, ATON.MatHub.getMaterial("semanticShape"));

    semesh.userData._convexPoints = [];
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        if (!pts_data) ATON.Utils.setVectorPrecision(p, 4);

        semesh.userData._convexPoints.push(p.x);
        semesh.userData._convexPoints.push(p.y);
        semesh.userData._convexPoints.push(p.z);
    }

    ATON.SUI.addSemIcon(semid, semesh);

    let S = ATON.getOrCreateSemanticNode(semid);
    S._points = [pts_data];
    S.isConvexShape = true;
    S.add(semesh);
    // S.setDefaultAndHighlightMaterials(/*SemFactory.currMaterial*/ATON.MatHub.materials.semanticShape, SemFactory.currMaterial /*ATON.MatHub.materials.semanticShapeHL*/);
    // S.setDefaultAndHighlightMaterials("semanticShape", SemFactory.currMaterial);

    S.enablePicking();
    ATON._bqSem = true;

    return S;
};

/**
 Add a convex point for current convex semantic shape on currently picked surface if valid
 A minimum of 4 points are required. Return location
 @param {Number} offset - (optional) the offset as percentage on distance between surface and camera (default: 0.02)
 @returns {Boolean}
 */
SemFactory.addSurfaceConvexPoint = (/*semid,*/ offset) => {
    if (ATON._queryDataScene === undefined) return false;

    if (offset === undefined) offset = 0.02;

    let p = ATON._queryDataScene.p;
    let eye = ATON.Nav.getCurrentEyeLocation();
    /*
        let n = ATON._queryDataScene.n;
        p.x += (n.x * offset);
        p.y += (n.y * offset);
        p.z += (n.z * offset);
    */
    p.lerpVectors(p, eye, offset);

    return SemFactory.addConvexPoint(p);
    // return p;
};


/**
 Add a basic (spherical) semantic shape with given location and radius.
 Return the semantic node if successful, otherwise undefined.
 NOTE: if semid exists, add mesh under the same semantic id
 @param {string} semid - the semantic ID to assign
 @param {THREE.Vector3} location - the location (sphere center)
 @param {Number} radius - the radius
 @returns {Node}
 @example
 let S = ATON.SemFactory.createSphere("face", THREE.Vector3(0,0,0), 1.5)
 */
SemFactory.createSphere = (semid, location, radius) => {
    if (location === undefined) return undefined;
    if (radius === undefined) return undefined;

    /*
        if (ATON.getSemanticNode(semid)){
            console.log("ERROR SemFactory: semantic node "+semid+" already exists.");
            return false;
        }
    */
    if (semid === undefined) semid = "sem" + SemFactory._numShapes;

    let S = ATON.getOrCreateSemanticNode(semid);

    //let g = new THREE.SphereGeometry( 1.0, 16, 16 );
    // let M = new THREE.Mesh(ATON.Utils.geomUnitSphere, /*SemFactory.currMaterial*/ATON.MatHub.materials.semanticShape);
    let M = new THREE.Mesh(ATON.Utils.geomUnitSphere, ATON.MatHub.getMaterial("semanticShape"));

    // Note: we add multiple spheres to the same <semid> node
    let sphere = new THREE.Object3D();
    sphere.position.copy(location);
    sphere.scale.set(radius, radius, radius);
    sphere.add(M);

    // XPF test
    //sphere.xpf = ATON.XPFNetwork.getCurrentXPFindex();

    ATON.SUI.addSemIcon(semid, sphere);

    // console.log("SPHERE", SemFactory.currMaterial)

    S.add(sphere);
    S._points = [[sphere.position.x, sphere.position.y, sphere.position.z, radius]];
    S.isSphereShape = true;
    S.enablePicking();
    // S.setDefaultAndHighlightMaterials(/*SemFactory.currMaterial*/ATON.MatHub.materials.semanticShape, SemFactory.currMaterial/*ATON.MatHub.materials.semanticShapeHL*/);
    // S.setDefaultAndHighlightMaterials("semanticShape", SemFactory.currMaterial);
    // S.setDefaultAndHighlightMaterials("semanticShape", "semanticShapeHL");

    //SemFactory.currParent.add( S );

    SemFactory._numShapes++;
    ATON._bqSem = true;

    return S;
};

/**
 Add a basic (spherical) semantic shape on currently picked surface if valid.
 This routine uses current location and radius of main ATON selector for the the spherical shape, see SemFactory.createSphere()
 Return the semantic node if successful, otherwise undefined.
 NOTE: if semid exists, add mesh under the same semantic id
 @param {string} semid - the semantic ID to assign
 @returns {Node}
 @example
 let S = ATON.SemFactory.createSurfaceSphere("face")
 */
SemFactory.createSurfaceSphere = (semid, point = undefined) => {
    if (!ATON._queryDataScene) return undefined;

    let p = ATON._queryDataScene.p;

    if (point) {
        p = point;
    }
    let r = ATON.SUI.getSelectorRadius();

    // console.log("create", p, r)

    return SemFactory.createSphere(semid, p, r);
};

SemFactory.createSurfaceSphereFromRemote = (semid, coords) => {
    // if (!ATON._queryDataScene) return undefined;

    let p = coords;
    let r = ATON.SUI.getSelectorRadius();

    // console.log("create", p, r)

    return SemFactory.createSphere(semid, p, r);
};

/**
 Delete a semantic node via semantic-ID.
 Note: all shapes under this semid will be deleted.
 Return true on success, otherwise false (e.g. the semantic node does not exist)
 @param {string} semid - the semantic ID to delete
 @returns {boolean}
 @example
 ATON.SemFactory.deleteSemanticNode("face")
 */
SemFactory.deleteSemanticNode = (semid) => {
    let S = ATON.getSemanticNode(semid);

    if (S === undefined) return false;
    // console.log("PRIMA DI REMOVE CHILDREN O DELETE")
    if (S.removeChildren() === undefined) {
        S.delete()
    }
    // console.log("DOPO REMOVE CHILDREN O DELETE E PRIMA DI UNA RETURN")
    // S.removeChildren();

    if (ATON.SUI.gSemIcons === undefined) return true;

    for (let s in ATON.SUI.gSemIcons.children) {
        let C = ATON.SUI.gSemIcons.children[s];
        if (C && C.name === semid) ATON.SUI.gSemIcons.removeChild(C);
    }

    return true;
};

// Annotation
SemFactory.writeAnnotation = (p, photon = true) => {
    if (SemFactory._firstAnnotationAfterLoad) {
        SemFactory.annotationsIndex = ATON.SceneHub.getAnnotationsIndex();
        SemFactory.annotationPoints = ATON.SceneHub.getAnnotationsPoints();
        SemFactory._firstAnnotationAfterLoad = false;
    }

    if (!SemFactory.annotationPoints[SemFactory.annotationsIndex]) SemFactory.annotationPoints[SemFactory.annotationsIndex] = [];
    if (!SemFactory.aPoints[SemFactory.annotationsIndex]) {
        SemFactory.aPoints[SemFactory.annotationsIndex] = ATON.createSemanticNode("manual_ann" + SemFactory.annotationsIndex);
        ATON._rootSem.add(SemFactory.aPoints[SemFactory.annotationsIndex]);
    }

    if (p === undefined) {
        return false;
    }

    if (!(p instanceof THREE.Vector3)) {
        p = new THREE.Vector3(p.x, p.y, p.z)
    }

    SemFactory.annotationPoints[SemFactory.annotationsIndex].push(p);
    // SemFactory.actualAnnotationPoints.push(p)

    let actualAnnotationPoints = SemFactory.annotationPoints[SemFactory.annotationsIndex]

    // console.log("ACTUAL ANNOTATION POINTS: ", actualAnnotationPoints)

    if (photon) {
        ATON.Photon.fireEvent("NewAnnotationPoint", p)
        Photon.updateAnnotationState(p, SemFactory.annotationsIndex)
    }

    let numPoints = actualAnnotationPoints.length;

    if (numPoints < 2) {
        return
    }

    const points = [
        actualAnnotationPoints[numPoints - 1],
        actualAnnotationPoints[numPoints - 2]
    ];

    console.log("POINTS: ", points)

    const spline = new THREE.CatmullRomCurve3(points);
    const divisions = Math.round(12 * points.length);
    const point = new THREE.Vector3();
    const positions = [];

    for (let i = 0, l = divisions; i < l; i++) {
        const t = i / l;

        spline.getPoint(t, point);
        positions.push(point.x, point.y, point.z);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    let material = new LineMaterial({
        color: SemFactory.annotationColor,
        linewidth: SemFactory.annotationWidth, // in world units with size attenuation, pixels otherwise
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        // vertexColors: true,
        // dashed: false,
        // alphaToCoverage: true,
    });

    let line = new Line2(geometry, material);
    // line.computeLineDistances();

    // console.log("LINE: ", line)

    SemFactory.aPoints[SemFactory.annotationsIndex].add(line);

};

SemFactory.newAnnotation = () => {
    // console.log("ANN INDEX: ", SemFactory.annotationsIndex)
    // console.log("ANN POINTS: ", SemFactory.annotationPoints)
    if (SemFactory.nowAnnotating && SemFactory.nowWritingAnnotation) {
        SemFactory.annotationColors[SemFactory.annotationsIndex] = "0x" + SemFactory.annotationColor.toString(16);
        SemFactory.annotationWidths[SemFactory.annotationsIndex] = SemFactory.annotationWidth;

        SemFactory.annotationsIndex += 1
        SemFactory.annotationPoints[SemFactory.annotationsIndex] = []

        // const uniqueId = uuidv4();
        // console.log("UNIQUE ID: ", uniqueId.toString())

        SemFactory.aPoints[SemFactory.annotationsIndex] = ATON.createSemanticNode("manual_ann" + SemFactory.annotationsIndex)
        ATON._rootSem.add(SemFactory.aPoints[SemFactory.annotationsIndex]);
    }
}

SemFactory.redoQueueAnnotationPoints = []

SemFactory.undoAnnotation = () => {
    if (SemFactory.nowAnnotating && SemFactory.nowErasingAnnotation) {
        if (SemFactory.annotationsIndex > 0) {
            SemFactory.annotationsIndex -= 1

            SemFactory.redoQueueAnnotationPoints.push(SemFactory.annotationPoints[SemFactory.annotationsIndex])

            SemFactory.removeAnnotationByIndex(SemFactory.annotationsIndex)
        }
    }
}

SemFactory.redoAnnotation = () => {
    let pointsToRedo = SemFactory.redoQueueAnnotationPoints.pop()

    if (pointsToRedo) {
        SemFactory.newAnnotation()

        pointsToRedo.forEach(point => {
            SemFactory.writeAnnotation(point)
        })
    }
}

SemFactory.removeAnnotationByPoint = (point) => {
    if (SemFactory._firstAnnotationAfterLoad) {
        SemFactory.annotationsIndex = ATON.SceneHub.getAnnotationsIndex();
        SemFactory.annotationPoints = ATON.SceneHub.getAnnotationsPoints();
        SemFactory._firstAnnotationAfterLoad = false;
    }
    for (const annotation of SemFactory.annotationPoints) {
        for (const p of annotation) {
            if (p.distanceTo(point) < 0.1) {
                // console.log("CANCELLA STE CAZZO DI ANNOTAZIONI")
                const indexToRemove = SemFactory.annotationPoints.indexOf(annotation)
                SemFactory.removeAnnotationByIndex(indexToRemove)
                break;
            }
        }
    }
}

SemFactory.removeAnnotationByIndex = (index, pushInStack = true) => {
    if (pushInStack) {
        const stackInfo = {
            action: "del_manual",
            point: SemFactory.annotationPoints[index],
            annId: SemFactory.aPoints[index].nid,
            color: SemFactory.annotationColors[index],
            width: SemFactory.annotationWidths[index],
            index: index,
            node: SemFactory.aPoints[index]
        }
        ATON.undoStack.push(stackInfo)
    }
    // console.log("UNDO STACK: ", ATON.undoStack)
    SemFactory.aPoints[index].removeChildren();
    SemFactory.annotationPoints[index] = []
}

SemFactory.startWritingAnnotation = () => {
    SemFactory.nowWritingAnnotation = true
    SemFactory.nowErasingAnnotation = false
}

SemFactory.startErasingAnnotation = () => {
    SemFactory.nowWritingAnnotation = false
    SemFactory.nowErasingAnnotation = true
}

SemFactory.annotation = (point) => {
    if (SemFactory.nowAnnotating && (ATON._kModCtrl || ATON._isXRDragging)) {
        if (SemFactory.nowWritingAnnotation) {
            SemFactory.writeAnnotation(point)
        } else if (SemFactory.nowErasingAnnotation) {
            SemFactory.removeAnnotationByPoint(point)
        }
    }
    /*else {
        ATON._stdActivation();
    }*/
}

SemFactory.stopAnnotating = () => {
    SemFactory.nowAnnotating = false;
}

export default SemFactory;