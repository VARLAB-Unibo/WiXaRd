// SKETCHFAB
HATHOR.removeSketchfab = () => {
    $("#sketchfab").hide()
}

HATHOR.addSketchfab = () => {
    let html =
        "<div class=\"offcanvas offcanvas-bottom h-auto\"  tabindex=\"-1\" id=\"offcanvasBottom\"\n" +
        "     aria-labelledby=\"offcanvasBottomLabel\">\n" +
        "    <div class=\"offcanvas-header\">\n" +
        "        <!--        <h4 class=\"offcanvas-title\" id=\"offcanvasBottomLabel\">Sketchfab 3D Models</h4>-->\n" +
        "        <img src='" + ATON.FE.PATH_RES_ICONS + "sketchfab.png" + "' class=\"img-fluid w-25\" alt=\"sketchfabLogo\">\n" +
        "        <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"offcanvas\" aria-label=\"Close\"></button>\n" +
        "    </div>\n" +
        "\n" +
        "    <div class=\"offcanvas-body small\" style=\"padding-top: 0\">\n" +
        "        <div class=\"row\">\n" +
        "            <div class=\"col input-group mb-3 w-25\">\n" +
        "                <input id=\"search\" type=\"text\" class=\"form-control\" placeholder=\"Search 3D Model\"\n" +
        "                       aria-label=\"Recipient's username\" aria-describedby=\"searchButton\">\n" +
        "                <button id=\"searchButton\" class=\"btn btn-outline-primary\" type=\"button\">Search</button>\n" +
        "            </div>\n" +
        "            <div class=\"col\">\n" +
        "                <button id=\"loadOtherModelsButton\" hidden class=\"btn btn-outline-primary\" type=\"button\"\n" +
        "                        style=\"float: right\">Load\n" +
        "                    Other Models\n" +
        "                </button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "\n" +
        "    <div class=\"offcanvas-body small\" style=\"padding-top: 0\">\n" +
        "        <div id=\"container\" style=\"white-space: nowrap\"></div>\n" +
        "    </div>\n" +
        "\n" +
        "</div>"

    $("#sketchfab").html(html)

    // EVENT HANDLER
    $("#searchButton").on("click", () => {
        $("#container").empty(); // remove elements of the previous research

        $("#loadOtherModelsButton").removeAttr("hidden")

        let searchVal = $("#search").val()

        HATHOR.loadSketchfabModels(HATHOR.sketchfabSearchBaseURL + searchVal)
    })

    $("#loadOtherModelsButton").on("click", () => {
        HATHOR.loadSketchfabModels(HATHOR.sketchfabSearchNextPageURL)
    })

    HATHOR.newUrlForSketchfab()

}

HATHOR.newUrlForSketchfab = () => {
    // open sketchfab offcanvas
    if (HATHOR.sketchfabSearchParam) {
        $("#container").empty(); // remove elements of the previous research

        $("#loadOtherModelsButton").removeAttr("hidden")
        let bsOffcanvas = new bootstrap.Offcanvas($('#offcanvasBottom'))
        bsOffcanvas.show()

        $('#search').val(HATHOR.sketchfabSearchParam)

        HATHOR.loadSketchfabModels(HATHOR.sketchfabSearchBaseURL + HATHOR.sketchfabSearchParam)
    }
}

// HATHOR.sketchfabSearchBaseURL = "https://api.sketchfab.com/v3/search?&downloadable=true&count=3&sort_by=viewCount&type=models&q="
HATHOR.sketchfabSearchBaseURL = "https://api.sketchfab.com/v3/search?&downloadable=true&type=models&q="

HATHOR.sketchfabSearch = (url, onResult) => {
    $.getJSON(url, res => {
        console.log("RES: ", res)
        HATHOR.sketchfabSearchNextPageURL = res.next
        let results = res.results

        onResult(results)
    })
}

HATHOR.dictPagesCards = {}
HATHOR.counterPage = {}
HATHOR.loadPersonalSketchfabModelsSUI = (itemList, cubeXYZ) => {
    // console.log("item list: ", itemList)
    // let obj_count = sketchBlockId.split("_")[1]
    let skSearchContainer = ATON.getUINode("skSearchContainer_personal")
    if (skSearchContainer) {
        skSearchContainer.hide()
    }
    if (HATHOR.dictPagesCards["sketchfabCardsContainer_personal"]) {
        if (HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]]) {
            ATON.SUI.changeVisibility(HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]], false)
        }
    }
    HATHOR.dictPagesCards["sketchfabCardsContainer_personal"] = {}
    HATHOR.counterPage["sketchfabCardsContainer_personal"] = 0

    HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]] = []

    let obj_dict = {}
    let obj_count = 0;

    itemList.forEach((item, i) => {
        // debugger;
        // console.log("DICT PAGES PRE-PUSH: ", HATHOR.dictPagesCards);
        // console.log("COUNTER PAGE PRE-PUSH: ", HATHOR.counterPage);
        // console.log(item)
        let name = item["name"]
        let assetId = item["assetId"]
        let thumb = item["thumbnail"]

        for (let node in ATON.snodes) {
            if (node === "pivot_wrapper_" + name + "_objcount" + obj_count) obj_count += 1;
        }

        let sketchCard = ATON.SUI.createSketchCard(assetId, name, item["url"], name, thumb, true, () => {
            // console.log("NAME", name)
            // console.log("ASSETID", assetId)
            $('canvas').on('dblclick', canvasClickHandler)
            function canvasClickHandler(event) {
                // Get the mouse coordinates from the event object
                const mouseX = (event.pageX / window.innerWidth) * 2 - 1;
                const mouseY = -(event.pageY / window.innerHeight) * 2 + 1;

                ATON._rcScene.setFromCamera(new THREE.Vector2(mouseX, mouseY), ATON.Nav._camera);

                let intersects = [];

                ATON._rcScene.intersectObjects(ATON._mainRoot.children, true, intersects);

                obj_dict[name] = name + "_objcount" + obj_count;

                if (ATON.XR.isPresenting()){
                    const P = ATON._queryDataScene.p
                    // console.log(`P.x: ${P.x}`)
                    // console.log(`P.y: ${P.y}`)
                    // console.log(`P.z: ${P.z}`)
                    HATHOR.addSketchfabNode(assetId, name + "_objcount" + obj_count, undefined, item["tag"], obj_count, cubeXYZ, undefined, P.x, P.z, "https://sketchfab.com/models/" + assetId)
                        .then(() => {
                            ATON.SUI.changeVisibility(HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]], false)
                            ATON.getUINode("sketchfabCardsContainer_personal").hide();
                            ATON.getUINode("sketchfabCardsContainer_personal").delete();
                            ATON.getUINode("skSearchContainer_personal").hide();
                            ATON.getUINode("skSearchContainer_personal").delete();
                            ATON.getUINode("sui_addmesh").switch(false)
                            // const actNode = ATON.getSceneNode(name + "_objcount" + obj_count);
                            // console.log("NODE: ", actNode)
                            // console.log("PARENT: ", actNode.parent)
                            // const stackInfo = {
                            //     action: "add_mesh",
                            //     name: name + "_objcount" + obj_count,
                            //     node: actNode,
                            //     // pivot: (actNode.parent.isPivotWrapper) ? actNode.parent : undefined,
                            //     // parent: (actNode.parent.isPivotWrapper) ? actNode.parent.parent : actNode.parent
                            // }
                            // ATON.undoStack.push(stackInfo);
                            // console.log("UNDO STACK: ", ATON.undoStack)
                        })
                }
                else{
                    HATHOR.addSketchfabNode(assetId, name + "_objcount" + obj_count, undefined, item["tag"], obj_count, cubeXYZ, undefined, intersects[0].point.x, intersects[0].point.z, "https://sketchfab.com/models/" + assetId)
                        .then(() => {
                            ATON.SUI.changeVisibility(HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]], false)
                            ATON.getUINode("sketchfabCardsContainer_personal").hide();
                            ATON.getUINode("sketchfabCardsContainer_personal").delete();
                            ATON.getUINode("skSearchContainer_personal").hide();
                            ATON.getUINode("skSearchContainer_personal").delete();
                            ATON.getUINode("sui_addmesh").switch(false)
                            // const actNode = ATON.getSceneNode(name + "_objcount" + obj_count);
                            // console.log("NODE: ", actNode)
                            // console.log("PARENT: ", actNode.parent)
                            // const parNode = actNode.parent
                            // console.log("NODE: ", actNode)
                            // console.log("PAR NODE: ", parNode)
                            // const stackInfo = {
                            //     action: "add_mesh",
                            //     name: name + "_objcount" + obj_count,
                            //     node: actNode,
                                // pivot: (parNode.isPivotWrapper) ? parNode : undefined,
                                // parent: (parNode.isPivotWrapper) ? parNode.parent : parNode
                            // }
                            // ATON.undoStack.push(stackInfo);
                            // console.log("UNDO STACK: ", ATON.undoStack)
                        })
                }
                // Remove the click event listener after the first click
                $('canvas').off('dblclick', canvasClickHandler);
            }
            // skSearchContainer.hide()
        })
        // console.log("SKETCH-CARD: ", sketchCard);
        HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]].push(sketchCard)
        if (HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]].length % 3 === 0 && i !== itemList.length - 1) {
            HATHOR.counterPage["sketchfabCardsContainer_personal"] += 1
            HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]] = []
        }
        // console.log("DICT PAGES POST-PUSH: ", HATHOR.dictPagesCards);
        // console.log("COUNTER PAGE POST-PUSH: ", HATHOR.counterPage);
    })
    HATHOR.counterPage["sketchfabCardsContainer_personal"] = 0
    HATHOR.generateSketchfabCardsContainer(obj_count, undefined, true)
}

HATHOR.loadSketchfabModelsSUI = (url, newSearch, spawn_node, obj_count, cubeXYZ, base_BB_top, pdfSearch = false) => {
    let skSearchContainerName = "";
    let skCardsContainerName = "";
    let skBlockName = "";
    if (spawn_node) {
        skSearchContainerName = "skSearchContainer_" + spawn_node.nid;
        skCardsContainerName = "sketchfabCardsContainer_" + spawn_node.nid;
        skBlockName = "sketchfabBlock_" + spawn_node.nid;
    }
    else {
        if (pdfSearch){
            skSearchContainerName = "skSearchContainer_pdf";
            skCardsContainerName = "sketchfabCardsContainer_pdf";
            skBlockName = "sketchfabBlock_pdf";
        }
        else {
            skSearchContainerName = "skSearchContainer";
            skCardsContainerName = "sketchfabCardsContainer";
            skBlockName = "sketchfabBlock";
        }
    }
    // console.log("spawn node name: ", spawn_node.nid)
    // let obj_count = sketchBlockId.split("_")[1]
    let skSearchContainer = ATON.getUINode(skSearchContainerName)
    if (skSearchContainer) {
        skSearchContainer.hide()
    }
    if (newSearch) {
        if (HATHOR.dictPagesCards[skCardsContainerName]) {
            if (HATHOR.dictPagesCards[skCardsContainerName][HATHOR.counterPage[skCardsContainerName]]) {
                ATON.SUI.changeVisibility(HATHOR.dictPagesCards[skCardsContainerName][HATHOR.counterPage[skCardsContainerName]], false)
            }
        }
        HATHOR.dictPagesCards[skCardsContainerName] = {}
        HATHOR.counterPage[skCardsContainerName] = 0
    }

    HATHOR.sketchfabSearch(url, results => {
        // HATHOR.dictPagesCards[skCardsContainerName] = {}
        HATHOR.dictPagesCards[skCardsContainerName][HATHOR.counterPage[skCardsContainerName]] = []
        // console.log("RES", results)

        let obj_dict = {}

        results.forEach((item, i) => {
            // console.log("RERE", results)
            let name = item["name"]
            let assetId = item["uid"]
            let thumb = item["thumbnails"]["images"][0]["url"]
            // console.log("ITEM: ", item)
            // console.log("COUNTER: ", i)
            // console.log("THUMB LINK: ", thumb)

            let nodeId = name + "_objcount" + obj_count

            let sketchCard = ATON.SUI.createSketchCard(assetId, name, "https://sketchfab.com/models/" + assetId, name, thumb, false, () => {
                // console.log("NAME", name)
                // console.log("ASSETID", assetId)
                HATHOR.addSketchfabNode(assetId, nodeId, spawn_node, undefined, obj_count, cubeXYZ, base_BB_top, undefined, undefined, "https://sketchfab.com/models/" + assetId)

                obj_dict[name] = nodeId;

                ATON.SUI.changeVisibility(HATHOR.dictPagesCards[skCardsContainerName][HATHOR.counterPage[skCardsContainerName]], false)
                ATON.getUINode(skCardsContainerName).hide();
                ATON.getUINode(skSearchContainerName).hide();
                ATON.getUINode(skCardsContainerName).delete();
                ATON.getUINode(skSearchContainerName).delete();
                ATON.getUINode(skBlockName).hide();
                // ATON.getUINode(skBlockName).delete();
                // skSearchContainer.hide()
                // const actNode = ATON.getSceneNode(name + "_objcount" + obj_count);
                // console.log("NODE: ", actNode)
                // console.log("PARENT: ", actNode.parent)
                // const stackInfo = {
                //     action: "add_mesh",
                //     name: name + "_objcount" + obj_count,
                //     node: actNode,
                    // pivot: (actNode.parent.isPivotWrapper) ? actNode.parent : undefined,
                    // parent: (actNode.parent.isPivotWrapper) ? actNode.parent.parent : actNode.parent
                // }
                // ATON.undoStack.push(stackInfo);
                // console.log("UNDO STACK: ", ATON.undoStack)
            })
            HATHOR.dictPagesCards[skCardsContainerName][HATHOR.counterPage[skCardsContainerName]].push(sketchCard)
            // HATHOR.dictPagesCards["sketchfabCardsContainer_personal"][HATHOR.counterPage["sketchfabCardsContainer_personal"]].push(sketchCard)
            if (HATHOR.dictPagesCards[skCardsContainerName][HATHOR.counterPage[skCardsContainerName]].length % 3 === 0 && i !== results.length - 1) {
                HATHOR.counterPage[skCardsContainerName] += 1
                HATHOR.dictPagesCards[skCardsContainerName][HATHOR.counterPage[skCardsContainerName]] = []
            }
        })
        // console.log("DICT PAGES: ", HATHOR.dictPagesCards)
        HATHOR.counterPage[skCardsContainerName] = 0
        HATHOR.generateSketchfabCardsContainer(obj_count, (spawn_node) ? spawn_node.nid : undefined)
    })
}

HATHOR.generateSketchfabCardsContainer = (obj_count, spawn_node_name = undefined, isPersonalCollection = false) => {
    let skCardContName;
    let skSearchContName;
    let skBlockName;
    let prevBtnName;
    let nextBtnName;
    if (isPersonalCollection) {
        skCardContName = "sketchfabCardsContainer_personal";
        skSearchContName = "skSearchContainer_personal";
        skBlockName = "sketchfabBlock_personal";
        prevBtnName = "previousSketch_personal";
        nextBtnName = "nextSketch_personal";
    }
    else {
        if (spawn_node_name) {
            skCardContName = "sketchfabCardsContainer_" + spawn_node_name;
            skSearchContName = "skSearchContainer_" + spawn_node_name;
            skBlockName = "sketchfabBlock_" + spawn_node_name;
            prevBtnName = "previousSketch_" + spawn_node_name;
            nextBtnName = "nextSketch_" + spawn_node_name;
        }
        else {
            skCardContName = "sketchfabCardsContainer";
            skSearchContName = "skSearchContainer";
            skBlockName = "sketchfabBlock";
            prevBtnName = "previousSketch";
            nextBtnName = "nextSketch";
        }
    }
    console.log("SKCARDCONTNAME: ", skCardContName)
    let cardsContainer = ATON.SUI.createHorizontalContainer(skCardContName, HATHOR.dictPagesCards[skCardContName][HATHOR.counterPage[skCardContName]])

    // HATHOR.dictPagesCards[HATHOR.counterPage["sketchfabCardsContainer_" + spawn_node.nid]].forEach(card => {
    //     cardsContainer.add(card)
    // })

    let containerCardsHeight = cardsContainer.getHeight()

    let previousButton = new ATON.SUI.Button(prevBtnName)
        .setPosition(undefined, undefined, 0.02)
        .setIcon(ATON.FE.PATH_RES_ICONS + "left_arrow.png")
        .setOnSelect(() => {
            HATHOR.counterPage[skCardContName] -= 1

            // if (HATHOR.counterPage[skCardContName] === 0) {
            //     previousButton.hide()
            // }

            ATON.getUINode(skSearchContName).hide()
            if (isPersonalCollection) HATHOR.generateSketchfabCardsContainer(obj_count, undefined, true)
            else HATHOR.generateSketchfabCardsContainer(obj_count, spawn_node_name, false)
        })

    if (HATHOR.counterPage[skCardContName] === 0) {
        previousButton.hide()
    }

    let nextButton = new ATON.SUI.Button(nextBtnName)
        .setPosition(undefined, undefined, 0.02)
        .setIcon(ATON.FE.PATH_RES_ICONS + "right_arrow.png")
        .setOnSelect(() => {
            HATHOR.counterPage[skCardContName] += 1

            previousButton.show()

            // console.log(Object.keys(HATHOR.dictPagesCards[skCardContName]).length)

            ATON.getUINode(skSearchContName).hide()

            // console.log("HATHOR counterpage: ", HATHOR.counterPage)
            // console.log("HATHOR dictpagescards: ", HATHOR.dictPagesCards)

            if (HATHOR.counterPage[skCardContName] in HATHOR.dictPagesCards[skCardContName]) {
                // ATON.SUI.changeVisibility(HATHOR.dictPagesCards[HATHOR.counterPage["sketchfabCardsContainer_" + spawn_node.nid]], true)
                if (isPersonalCollection) HATHOR.generateSketchfabCardsContainer(obj_count, undefined, true)
                else HATHOR.generateSketchfabCardsContainer(obj_count, spawn_node_name, false)
            } else {
                // HATHOR.loadSketchfabModelsSUI(HATHOR.sketchfabSearchNextPageURL, false, undefined, obj_count, undefined, undefined)
            }
        })
    if (HATHOR.counterPage[skCardContName] === Object.keys(HATHOR.dictPagesCards[skCardContName]).length - 1) {
        nextButton.hide()
    }


    let sketchfabSearchedContainer = ATON.SUI.createHorizontalContainer(skSearchContName, [nextButton, cardsContainer, previousButton])
    // .add(nextButton, cardsContainer, previousButton)

    // console.log("obj_count: ", obj_count)
    let sketchfabBlock = ATON.getUINode(skBlockName)

    // console.log("SUI NODES: ", ATON.uinodes);
    // console.log("sketchfabBlock: ", sketchfabBlock)
    // console.log(ATON.uinodes)
    // console.log(ATON._rootVisible)
    // console.log("sketchfabBlock.visible: ", sketchfabBlock.visible)
    if (sketchfabBlock !== undefined && sketchfabBlock.visible === true) {
        let firstContainerChildren = Object.values(ATON.getUINode(skBlockName).children)
        let firstContainerHeight = firstContainerChildren[0].height

        sketchfabSearchedContainer
            .setPosition(0, -(containerCardsHeight / 2) - (firstContainerHeight / 2) - 0.015, 0)
            .setRotation(0.0, 6.28, 0)
            .setScale(0.7)
            .attachTo(skBlockName);
    } else {
        // console.log("ENTRA QUI")
        // const lookAtVector = new THREE.Vector3(0,0, -1);
        // lookAtVector.applyQuaternion(ATON.Nav._camera.quaternion);

        sketchfabSearchedContainer
            .setPosition(4.5, 2.5, -2.3)
            .setRotation(0.0, 300, 0)
            .setScale(1.8)
            .attachToRoot();
    }

}

HATHOR.loadSketchfabModels = (url) => {
    HATHOR.sketchfabSearch(url, results => {
        for (let i = 0; i < results.length; i++) {
            let name = results[i]["name"]
            let embedUrl = results[i]["embedUrl"]
            let assetId = results[i]["uid"].replace("/embed", "")
            let thumb = results[i]["thumbnails"]["images"][0]["url"]

            $("#container").append("" +
                "<div class='card' style='width: 18rem; cursor: pointer; display: inline-block; margin: 1%'> " +
                "<iframe class='card-img-top' title=" + name + " " +
                "frameborder='0' allowfullscreen mozallowfullscreen='true' webkitallowfullscreen='true'" +
                "allow='autoplay; fullscreen; xr-spatial-tracking' xr-spatial-tracking " +
                "execution-while-out-of-viewport execution-while-not-rendered web-share " +
                "src=" + embedUrl + "?autospin=1&autostart=1&camera=0" +
                "> </iframe> " +
                "<div class='card-body'>" +
                "<p class='card-title' style='font-size: 1.3em; font-weight: bold'> " + name + "</p>" +
                "<button data-bs-dismiss='offcanvas' id=" + assetId + " class='btn btn-success' >Add Model</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                "<button data-bs-dismiss='offcanvas' id= bookmark_" + assetId + " class='btn btn-success' >Add Bookmark</button>" +
                "</div>" +
                "</div>")

            $("#" + assetId).on("click", () => {
                let cubeXYZ = {
                    x: 2,
                    y: 2,
                    z: 2
                };
                HATHOR.addSketchfabNode(assetId, name + "-" + i, undefined, undefined, undefined, cubeXYZ, undefined, undefined, undefined, embedUrl)
                // const actNode = ATON.getSceneNode(name + "-" + i);
                // console.log("NODE: ", actNode)
                // console.log("PARENT: ", actNode.parent)
                // const stackInfo = {
                //     action: "add_mesh",
                //     name: name + "-" + i,
                //     node: actNode,
                    // pivot: (actNode.parent.isPivotWrapper) ? actNode.parent : undefined,
                    // parent: (actNode.parent.isPivotWrapper) ? actNode.parent.parent : actNode.parent
                // }
                // ATON.undoStack.push(stackInfo);
                // console.log("UNDO STACK: ", ATON.undoStack)
            })

            $("#bookmark_" + assetId).on("click", () => {
                HATHOR.popupAddLink(name, "sketchfab", embedUrl, thumb, assetId)
            })
        }
    })
}

HATHOR.addSketchfabNode = async (assetId, nodeId, spawn_point, tag, obj_count, cubeXYZ, baseTop, clickPosX = undefined, clickPosZ = undefined, skUrl = "") => {
    // let nodePos = new THREE.Vector3(-2.9, 1, -2.1)
    // console.log("taaaaaaaaag: ", tag)

    let pivotName = "pivot_wrapper_" + nodeId;
    let posX = 0;
    let posY = 0;
    let posZ = 0;
    let scaleX = 0;
    let scaleY = 0;
    let scaleZ = 0;
    let pivot;

    let skNode = ATON.createSceneNode(nodeId)
    // console.log("skNode: ", skNode)
    if (obj_count !== undefined && tag !== undefined){
        const myPromise = new Promise((resolve, reject) => {
            // Inside this function, you can perform asynchronous operations.
            resolve(skNode.loadSketchfabAsset(assetId));
        });

        myPromise.then(r => {
            if (tag === "importer") r.isImporter = true;
            r.isImported = true;
            r.editable = true;
            r.sketchfabUrl = skUrl;
            r.assetId = assetId;

            let meshXYZ = {
                x: r._bb.max.x - r._bb.min.x,
                y: r._bb.max.y - r._bb.min.y,
                z: r._bb.max.z - r._bb.min.z
            }

            let maxLabel = ""; // Initialize with an empty string
            let maxValue = -Infinity; // Initialize with negative infinity

            // Iterate through the properties of the meshXYZ object
            // console.log("LATI MESH PARTE GIUSTA: ", meshXYZ)
            for (const label in meshXYZ) {
                const value = meshXYZ[label];

                // Check if the current value is greater than the current maximum
                if (value > maxValue) {
                    maxValue = value; // Update the maximum value
                    maxLabel = label; // Update the label corresponding to the maximum value
                }
            }

            const scaleFactor = cubeXYZ[maxLabel] / maxValue;
            const oldScale = r.getScale();



            pivot = ATON.getOrCreateSceneNode(pivotName);
            pivot.isPivotWrapper = true;
            const pivot_box = new THREE.Box3().setFromObject(r);

            const piv_center = new THREE.Vector3();
            pivot_box.getCenter(piv_center)
            r.position.sub(piv_center)

            scaleX = oldScale.x * scaleFactor;
            scaleY = oldScale.y * scaleFactor;
            scaleZ = oldScale.z * scaleFactor;

            r.setScale(scaleX, scaleY, scaleZ, false);
            r.setEditable()/*.setAutoRotation()*/
                .attachTo(pivot);
            // r.boxBound();
            const oldPos = r.getPosition();
            // r.position.set(oldPos.x, meshXYZ.y/2, oldPos.z)
            pivot/*.setAutoRotation()*/.attachToRoot()

            posX = oldPos.x;
            posY = (pivot_box.max.y - pivot_box.min.y) / 2;
            posZ = oldPos.z;

            if (clickPosX && clickPosZ)  pivot.position.set(clickPosX, posY, clickPosZ)
            else pivot.position.set(posX, posY, posZ);

            const stackInfo = {
                action: "add_mesh",
                name: nodeId,
                node: r,
                pivot: pivot,
                parent: ATON._rootVisible
            }
            ATON.undoStack.push(stackInfo);
            // console.log("UNDO STACK: ", ATON.undoStack)
            // console.log("r.NID: ", r.nid)
            // console.log("pivot.NID: ", pivot.nid)



            // console.log("NODI: ", ATON._rootVisible)

            // Alert other users in the same scene
            let E = {}
            E.scenegraph = {}
            E.scenegraph.nodes = {}
            E.scenegraph.edges = {}

            let S = ATON.snodes;

            console.log("SNODES: ", ATON.snodes)
            for (let node in S) {
                // console.log("NODO: ", S[node])
                // console.log("NODO PARENT: ", S[node].parent)
                // console.log("NODO PARENT NID: ", S[node].parent.nid)
                if (S[node].parent.nid) {
                    // console.log("IS LOADED FROM JSON: ", S[node].loadedFromJSON)
                    if (!S[node].loadedFromJSON && S[node].type === 3 && (S[node].nid === pivot.nid || S[node].nid === r.nid)) {
                        if (!E.scenegraph.nodes[S[node].nid]) E.scenegraph.nodes[S[node].nid] = {};

                        E.scenegraph.nodes[S[node].nid].urls = S[node].sketchfabUrl;
                        E.scenegraph.nodes[S[node].nid].assetId = S[node].assetId;
                        E.scenegraph.nodes[S[node].nid].editable = true;
                        E.scenegraph.nodes[S[node].nid].isImported = S[node].isImported;
                        E.scenegraph.nodes[S[node].nid].isImporter = S[node].isImporter;
                        E.scenegraph.nodes[S[node].nid].isPivotWrapper = S[node].isPivotWrapper;
                        E.scenegraph.nodes[S[node].nid].transform = {}
                        if (S[node].isPivotWrapper) {
                            E.scenegraph.nodes[S[node].nid].transform.scale = [S[node].scale.x, S[node].scale.y, S[node].scale.z];
                            E.scenegraph.nodes[S[node].nid].transform.rotation = [S[node].rotation.x, S[node].rotation.y, S[node].rotation.z];
                            E.scenegraph.nodes[S[node].nid].transform.position = [S[node].position.x, S[node].position.y, S[node].position.z];
                        }
                        else {
                            E.scenegraph.nodes[S[node].nid].transform.scale = [S[node].scale.x, S[node].scale.y, S[node].scale.z];
                            E.scenegraph.nodes[S[node].nid].transform.rotation = [S[node].rotation.x, S[node].rotation.y, S[node].rotation.z];
                            E.scenegraph.nodes[S[node].nid].transform.position = [S[node].position.x, S[node].position.y, S[node].position.z];
                        }
                    }
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
            }

            console.log("E: ", E)
            // console.log("SNODES: ", ATON.snodes)
            // ATON.SceneHub.parseScene(E);
            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
            ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        });
    }
    else if (obj_count && tag === undefined) {
        // console.log("IMPORT NORMALE DA SKETCHFAB")
        // let spawn_point = ATON.getSceneNode("sketchfab_point" + obj_count)

        // skNode.getBound()

        const myPromise = new Promise((resolve, reject) => {
            // Inside this function, you can perform asynchronous operations.
            resolve(skNode.loadSketchfabAsset(assetId));
        });

        myPromise.then(r => {
            // console.log("la mesh properties: ", r)
            r.isImported = true;
            r.editable = true;
            r.sketchfabUrl = skUrl;
            r.assetId = assetId;

            let meshXYZ = {
                x: r._bb.max.x - r._bb.min.x,
                y: r._bb.max.y - r._bb.min.y,
                z: r._bb.max.z - r._bb.min.z
            }

            let maxLabel = ""; // Initialize with an empty string
            let maxValue = -Infinity; // Initialize with negative infinity

            // Iterate through the properties of the meshXYZ object
            // console.log("LATI MESH: ", meshXYZ)
            for (const label in meshXYZ) {
                const value = meshXYZ[label];

                // Check if the current value is greater than the current maximum
                if (value > maxValue) {
                    maxValue = value; // Update the maximum value
                    maxLabel = label; // Update the label corresponding to the maximum value
                }
            }

            const scaleFactor = cubeXYZ[maxLabel] / maxValue;
            const oldScale = r.getScale();

            scaleX = oldScale.x * scaleFactor;
            scaleY = oldScale.y * scaleFactor;
            scaleZ = oldScale.z * scaleFactor;

            r.setScale(scaleX, scaleY, scaleZ, false);

            // const oldPos = r.getPosition();

            pivot = ATON.getOrCreateSceneNode(pivotName);
            pivot.isPivotWrapper = true;
            const pivot_box = new THREE.Box3().setFromObject(r);

            const piv_center = new THREE.Vector3();
            pivot_box.getCenter(piv_center)
            r.position.sub(piv_center)

            r.setEditable()/*.setAutoRotation()*/
                .attachTo(pivot);
            // pivot.position.set(0, 0, 0)

            pivot/*.setAutoRotation()*/.attachTo(spawn_point)
            // const boundingBox = new THREE.BoxHelper(pivot, 0xffff00);
            // pivot.add(boundingBox)
            posX = 0;
            posY = baseTop + (cubeXYZ.y/2);
            posZ = 0;
            pivot.position.set(posX, posY, posZ)

            // console.log("PIVOTOOOOOOOOOOOO: ", pivot)

            const stackInfo = {
                action: "add_mesh",
                name: nodeId,
                node: r,
                pivot: pivot,
                parent: spawn_point
            }
            ATON.undoStack.push(stackInfo);
            // console.log("UNDO STACK: ", ATON.undoStack)

            let E = {}
            E.scenegraph = {}
            E.scenegraph.nodes = {}
            E.scenegraph.edges = {}

            let S = ATON.snodes;

            for (let node in S) {

                if (S[node].parent.nid) {
                    // console.log("IS LOADED FROM JSON: ", S[node].loadedFromJSON)
                    if (!S[node].loadedFromJSON && S[node].type === 3 && (S[node].nid === pivot.nid || S[node].nid === r.nid)) {
                        if (!E.scenegraph.nodes[S[node].nid]) E.scenegraph.nodes[S[node].nid] = {};

                        E.scenegraph.nodes[S[node].nid].urls = S[node].sketchfabUrl;
                        E.scenegraph.nodes[S[node].nid].assetId = S[node].assetId;
                        E.scenegraph.nodes[S[node].nid].editable = true;
                        E.scenegraph.nodes[S[node].nid].isImported = S[node].isImported;
                        E.scenegraph.nodes[S[node].nid].isImporter = S[node].isImporter;
                        E.scenegraph.nodes[S[node].nid].isPivotWrapper = S[node].isPivotWrapper;
                        E.scenegraph.nodes[S[node].nid].transform = {}
                        if (S[node].isPivotWrapper) {
                            E.scenegraph.nodes[S[node].nid].transform.scale = [S[node].scale.x, S[node].scale.y, S[node].scale.z];
                            E.scenegraph.nodes[S[node].nid].transform.rotation = [S[node].rotation.x, S[node].rotation.y, S[node].rotation.z];
                            E.scenegraph.nodes[S[node].nid].transform.position = [S[node].position.x, S[node].position.y, S[node].position.z];
                        }
                        else {
                            E.scenegraph.nodes[S[node].nid].transform.scale = [S[node].scale.x, S[node].scale.y, S[node].scale.z];
                            E.scenegraph.nodes[S[node].nid].transform.rotation = [S[node].rotation.x, S[node].rotation.y, S[node].rotation.z];
                            E.scenegraph.nodes[S[node].nid].transform.position = [S[node].position.x, S[node].position.y, S[node].position.z];
                        }
                    }
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
            }

            console.log("E: ", E)
            // console.log("SNODES CANE: ", ATON.snodes)

            // Alert other users in the same scene
            // ATON.SceneHub.parseScene(E);
            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
            ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        });


    } else {
        const myPromise = new Promise((resolve, reject) => {
            // Inside this function, you can perform asynchronous operations.
            resolve(skNode.loadSketchfabAsset(assetId));
        });
        myPromise.then(r => {
            r.isImported = true;
            r.editable = true;
            r.sketchfabUrl = skUrl;
            r.assetId = assetId;

            let meshXYZ = {
                x: r._bb.max.x - r._bb.min.x,
                y: r._bb.max.y - r._bb.min.y,
                z: r._bb.max.z - r._bb.min.z
            }

            let maxLabel = ""; // Initialize with an empty string
            let maxValue = -Infinity; // Initialize with negative infinity

            // Iterate through the properties of the meshXYZ object
            // console.log("LATI MESH: ", meshXYZ)
            for (const label in meshXYZ) {
                const value = meshXYZ[label];

                // Check if the current value is greater than the current maximum
                if (value > maxValue) {
                    maxValue = value; // Update the maximum value
                    maxLabel = label; // Update the label corresponding to the maximum value
                }
            }

            const scaleFactor = cubeXYZ[maxLabel] / maxValue;
            const oldScale = r.getScale();

            scaleX = oldScale.x * scaleFactor;
            scaleY = oldScale.y * scaleFactor;
            scaleZ = oldScale.z * scaleFactor;

            r.setScale(scaleX, scaleY, scaleZ, false);

            pivot = ATON.getOrCreateSceneNode(pivotName);
            pivot.isPivotWrapper = true;
            const pivot_box = new THREE.Box3().setFromObject(r);

            const piv_center = new THREE.Vector3();
            pivot_box.getCenter(piv_center)
            r.position.sub(piv_center)

            r.setEditable()/*.setAutoRotation()*/
                .attachTo(pivot);
            pivot/*.setEditable()*//*.setAutoRotation()*/.attachToRoot();

            posX = 0;
            posY = (cubeXYZ.y/2);
            posZ = 0;

            pivot.position.set(posX, posY, posZ)

            // console.log("PIVOTOOOOOOOOOOOO: ", pivot)

            const stackInfo = {
                action: "add_mesh",
                name: nodeId,
                node: r,
                pivot: pivot,
                parent: ATON._rootVisible
            }
            ATON.undoStack.push(stackInfo);
            // console.log("UNDO STACK: ", ATON.undoStack)

            let E = {}
            E.scenegraph = {}
            E.scenegraph.nodes = {}
            E.scenegraph.edges = {}

            let S = ATON.snodes;

            for (let node in S) {
                if (S[node].parent.nid) {
                    // console.log("IS LOADED FROM JSON: ", S[node].loadedFromJSON)
                    if (!S[node].loadedFromJSON && S[node].type === 3 && (S[node].nid === pivot.nid || S[node].nid === r.nid)) {
                        if (!E.scenegraph.nodes[S[node].nid]) E.scenegraph.nodes[S[node].nid] = {};

                        E.scenegraph.nodes[S[node].nid].urls = S[node].sketchfabUrl;
                        E.scenegraph.nodes[S[node].nid].assetId = S[node].assetId;
                        E.scenegraph.nodes[S[node].nid].editable = true;
                        E.scenegraph.nodes[S[node].nid].isImported = S[node].isImported;
                        E.scenegraph.nodes[S[node].nid].isImporter = S[node].isImporter;
                        E.scenegraph.nodes[S[node].nid].isPivotWrapper = S[node].isPivotWrapper;
                        E.scenegraph.nodes[S[node].nid].transform = {}
                        if (S[node].isPivotWrapper) {
                            E.scenegraph.nodes[S[node].nid].transform.scale = [S[node].scale.x, S[node].scale.y, S[node].scale.z];
                            E.scenegraph.nodes[S[node].nid].transform.rotation = [S[node].rotation.x, S[node].rotation.y, S[node].rotation.z];
                            E.scenegraph.nodes[S[node].nid].transform.position = [S[node].position.x, S[node].position.y, S[node].position.z];
                        }
                        else {
                            E.scenegraph.nodes[S[node].nid].transform.scale = [S[node].scale.x, S[node].scale.y, S[node].scale.z];
                            E.scenegraph.nodes[S[node].nid].transform.rotation = [S[node].rotation.x, S[node].rotation.y, S[node].rotation.z];
                            E.scenegraph.nodes[S[node].nid].transform.position = [S[node].position.x, S[node].position.y, S[node].position.z];
                        }
                    }
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
            }

            console.log("E: ", E)

            // Alert other users in the same scene
            // ATON.SceneHub.parseScene(E);
            ATON.SceneHub.sendEdit(E, ATON.SceneHub.MODE_ADD);
            ATON.Photon.fireEvent("AFE_AddSceneEdit", E);
        });
    }

    // console.log("SPAWN NAME: ", spawn_point)
}