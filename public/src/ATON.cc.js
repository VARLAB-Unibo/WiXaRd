/*
    ATON Copyright Hub
    Manages embedded copyright

    author: bruno.fanini_AT_gmail.com

===========================================================*/

/**
ATON Copyright Hub
@namespace CC
*/
let CC = {};


CC.init = ()=>{
    CC.list = [];
};

/**
Return true if any copyright information is found in loaded resources so far.
Copyright list is located in ATON.CC.list.
@returns {boolean}
*/
CC.anyCopyrightFound = ()=>{
    return (CC.list.length > 0);
};

// Copyright extraction
CC.extract = (data)=>{
    if (data === undefined) return;
    if (data.asset === undefined) return;

    let cc = {};

    if (data.asset.copyright) cc.copyright = data.asset.copyright;
    if (data.asset.extras){
        for (let e in data.asset.extras){
            if (typeof data.asset.extras[e] === "string") cc[e] = data.asset.extras[e];
        }
    }

    // XMP 3DC Metadata
    CC.extractXMP3DC(data, cc);

    // Empty cc object
    if (Object.keys(cc).length === 0) return;

    if (data.asset.generator) cc.generator = data.asset.generator;

    // check for replicate entries
    for (let e in CC.list){
        let o = CC.list[e];

        if ( CC.compare(cc, o) ) return;
    }

    CC.list.push(cc); // Add to cc list
    
    // console.log(cc);
};

// Shallow compare two copyright objects
CC.compare = (A,B)=>{
    if (A === undefined || B === undefined) return false;

    const keysA = Object.keys(A);
    const keysB = Object.keys(B);

    if (keysA.length !== keysB.length) return false;

    for (let k of keysA){
        if (A[k] !== B[k]) return false;
    }

    return true;
};

// If found in data, extracts 3DC metadata to cc object
// https://github.com/KhronosGroup/3DC-Metadata-Recommendations/blob/main/model3d.md
CC.extractXMP3DC = (data, cc)=>{
    if (data === undefined || cc === undefined) return;

    if (!data.userData) return;
    let exts = data.userData.gltfExtensions
    
    if (!exts) return;
    if (!exts.KHR_xmp) return;

    let pkts = exts.KHR_xmp.packets;
        
    if (!pkts) return;
    let a = pkts[0];

    // TODO: improve
    if (a["model3d:spdxLicense"]) cc.license = a["model3d:spdxLicense"];
    if (a["dc:date"])             cc.date  = a["dc:date"];
    if (a["dc:title"])            cc.title = a["dc:title"];
    if (a["xmp:CreatorTool"])     cc.creatorTool = a["xmp:CreatorTool"];
    if (a["dc:description"])      cc.description  = a["dc:description"];
    if (a["dc:rights"])           cc.rights = a["dc:rights"];
    if (a["xmpRights:Owner"])     cc.owner  = a["xmpRights:Owner"];
};

export default CC;