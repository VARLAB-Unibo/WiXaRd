// Tools
//=======================================


HATHOR.measure = () => {
    let P = ATON.getSceneQueriedPoint();
    let M = ATON.SUI.addMeasurementPoint(P);

    if (M === undefined) return;

    let mid = ATON.Utils.generateID("meas");

    let E = {};
    E.measurements = {};
    E.measurements[mid] = {};
    E.measurements[mid].points = [
        parseFloat(M.A.x.toPrecision(ATON.SceneHub.FLOAT_PREC)),
        parseFloat(M.A.y.toPrecision(ATON.SceneHub.FLOAT_PREC)),
        parseFloat(M.A.z.toPrecision(ATON.SceneHub.FLOAT_PREC)),
        parseFloat(M.B.x.toPrecision(ATON.SceneHub.FLOAT_PREC)),
        parseFloat(M.B.y.toPrecision(ATON.SceneHub.FLOAT_PREC)),
        parseFloat(M.B.z.toPrecision(ATON.SceneHub.FLOAT_PREC))
    ];

    ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
    ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
};

HATHOR.switchUserScale = () => {
    let sceneNodes = ATON.snodes
    console.log("NODES", sceneNodes)
    if (ATON._ws === 0) {
        ATON.setUserScaleLevel(ATON.SCALE_BIG);

        for (n in sceneNodes) {
            console.log(n)
            if (n !== "."){
                sceneNodes[n].setScale(ATON.SCALE_SCENE)
            }
        }
    } else {
        ATON.setUserScaleLevel(ATON.SCALE_DEFAULT);

        for (n in sceneNodes) {
            console.log(n)
            if (n !== "."){
                sceneNodes[n].setScale(ATON.SCALE_DEFAULTSCENE)
            }
        }
    }
};

// POVs
HATHOR.enableAutoNav = (dur) => {
    HATHOR._povLoopD = dur;
    ATON.Nav.setUserControl(false);
};

HATHOR.disableAutoNav = () => {
    HATHOR._povLoopD = undefined;
    ATON.Nav.setUserControl(true);
};

HATHOR.povNext = () => {
    let numpovs = HATHOR._povs.length;
    if (numpovs < 1) return;

    if (HATHOR._cPOVind === undefined) HATHOR._cPOVind = 0;
    else HATHOR._cPOVind = (HATHOR._cPOVind + 1) % numpovs;

    let pov = HATHOR._povs[HATHOR._cPOVind];

    let dur = (ATON.XR._bPresenting) ? ATON.XR.STD_TELEP_DURATION : 1.0;
    if (HATHOR._povLoopD !== undefined) dur = HATHOR._povLoopD;

    ATON.Nav.requestPOV(pov, dur);
};
HATHOR.povPrev = () => {
    let numpovs = HATHOR._povs.length;
    if (numpovs < 1) return;

    if (HATHOR._cPOVind === undefined) HATHOR._cPOVind = (numpovs - 1);
    else HATHOR._cPOVind = (HATHOR._cPOVind - 1);

    if (HATHOR._cPOVind < 0) HATHOR._cPOVind = (numpovs - 1);

    let pov = HATHOR._povs[HATHOR._cPOVind];

    let dur = (ATON.XR._bPresenting) ? ATON.XR.STD_TELEP_DURATION : 1.0;
    if (HATHOR._povLoopD !== undefined) dur = HATHOR._povLoopD;

    ATON.Nav.requestPOV(pov, dur);
};

HATHOR.uiUpdatePOVs = () => {

    HATHOR._povs = [];

    for (let k in ATON.Nav.povlist) {
        let pov = ATON.Nav.povlist[k];

        HATHOR._povs.push(pov);
        //console.log(pov);
    }

    //console.log(HATHOR._povs);

    if (HATHOR._povs.length > 0) {
        HATHOR._cPOVind = undefined;
        $("#btn-prev").show();
        $("#btn-next").show();
    } else {
        HATHOR._cPOVind = undefined;
        $("#btn-prev").hide();
        $("#btn-next").hide();
    }
};

HATHOR.addLightProbe = () => {
    if (!ATON.SUI.mainSelector.visible) return;
    let P = ATON.SUI.mainSelector.position;

    let r = ATON.SUI.getSelectorRadius();

    ATON.addLightProbe(new ATON.LightProbe().setPosition(P).setNear(r));

    ATON.getRootScene().assignLightProbesByProximity();
    ATON.updateLightProbes();

    ATON.Utils.setVectorPrecision(P, 4);

    let E = {};
    E.environment = {};
    E.environment.lightprobes = {};
    E.environment.lightprobes.list = {};

    let idlp = ATON.Utils.generateID("LP");
    E.environment.lightprobes.list[idlp] = {};
    E.environment.lightprobes.list[idlp].pos = [P.x, P.y, P.z];
    E.environment.lightprobes.list[idlp].near = r;

    //console.log(E);

    ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
    ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
};