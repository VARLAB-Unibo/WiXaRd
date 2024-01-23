HATHOR.previous_pdf = "";
HATHOR.uploadFileToServer = () => {
    let input = document.createElement('input');
    input.id = 'file'
    input.type = 'file';
    input.onchange = async _ => {

        if (ATON.getUINode("PDFVerticalContainer_0")) {
            // if (ATON.getUINode("PDFVerticalContainer").visible === true && HATHOR.previous_pdf === input.files[0].name) {
            //     ATON.SUI.createMessageLabel("samePDFAdded", 0.8, 0.4,
            //         "This PDF is already shown", 0.04, 4000)
            //     return;
            // }
            if (HATHOR.previous_pdf === input.files[0].name) {
                if (ATON.getUINode("PDFVerticalContainer_0").visible === true) {
                    ATON.SUI.createMessageLabel("samePDFAdded", 0.8, 0.4,
                        "This PDF is already shown", 0.04, 4000)
                } else {
                    ATON.getUINode("PDFVerticalContainer_0").show()
                }
                return;
            }
            if (ATON.getUINode("skSearchContainer_0")) {
                ATON.getUINode("skSearchContainer_0").hide()
            }
            ATON.getUINode("PDFVerticalContainer_0").hide()

            ATON.Photon.fireEvent("pdfClose", {})
        }

        HATHOR.previous_pdf = input.files[0].name

        // start loader for pdf
        ATON._pdfLoad()

        const user_id = ATON.Photon.uid

        const formData = new FormData();
        formData.append("file", input.files[0]);
        formData.append("user_id", user_id)

        const load_response = await fetch('http://127.0.0.1:5003/load_file', {
            method: "POST",
            // mode: 'no-cors',
            body: formData
        })

        console.log('load response: ', load_response)
        if (!load_response.ok) {
            console.error("Error in load file")
            return
        }

        HATHOR.number_of_pages = JSON.parse(await load_response.text()).number_of_pages
        // HATHOR.actual_number_of_page = 0
        HATHOR.dictPDFPages = {}
        HATHOR.actual_number_of_page = 0

        for (let i = 0; i < HATHOR.number_of_pages; i++) {
            HATHOR.loadPDF(i, user_id, true, true)
        }

        // HATHOR.loadPDF(HATHOR.actual_number_of_page, user_id, true, true)
        // HATHOR.getNextFilePage(HATHOR.actual_number_of_page, user_id)
    };
    input.click();
}

HATHOR.pdfFetch = (index, user_id, onResult) => {

    ATON._pdfLoad()

    fetch("http://127.0.0.1:5003/get_pdf_page_as_image?pdf_page_index=" + index + "&user_id=" + user_id, {
        // mode: 'no-cors'
    })
        .then(res => res.json())
        .then(res => {

            // console.log("RESRES", res)
            const img_b64 = res.base64.slice(2, -1)
            const detected_objects = res.detected_objects
            const img_width = res.width
            const img_height = res.height

            // close loader for pdf
            ATON._pdfComplete()

            onResult(img_b64, detected_objects, img_width, img_height)
        })
}
//
// HATHOR.getLabelDimensionsFromImageSize = (width, height) => {
//     // MAX DIM PANEL: w: 3.2, h: 1.8
//     // 1.8: 1800 = x: 1240
//     let correctWidth = 3.2
//     let correctHeight = 1.8
//
//     if (height > width) {
//         correctWidth = (correctHeight * width) / height
//     } else if (height < width) {
//         correctHeight = (correctWidth * height) / width
//         if (correctHeight > 1.8) {
//             correctHeight = 1.8
//             correctWidth = (correctHeight * width) / height
//         }
//     } else {
//         correctWidth = correctHeight
//     }
//
//     return [correctWidth, correctHeight]
// }

HATHOR.dictPDFPages = {}
HATHOR.actual_number_of_page = 0
// HATHOR.loadPDF = (index, user_id, newLoad, photon) => {
// if (newLoad) {
//     // if (HATHOR.dictPDFPages[HATHOR.actual_number_of_page]) {
//     //     ATON.SUI.changeVisibility(HATHOR.dictPDFPages[HATHOR.actual_number_of_page], false)
//     // }
//     HATHOR.dictPDFPages = {}
//     HATHOR.actual_number_of_page = 0
// }

HATHOR.loadPDF = (index, user_id, photon) => {
    HATHOR.pdfFetch(index, user_id, (img_b64, detected_objects, img_width, img_height) => {
        console.log("ResPDF", detected_objects)

        let pdf = new ATON.SUI.Label("PDF", img_width / 1000, img_height / 1000)
            .setIcon("data:image/png;base64, " + img_b64, false)

        let innerDict = {"pdf": pdf, "detectedObj": []}

        detected_objects.forEach(detected_object => {
            // console.log(detected_object[0])
            const object_name = detected_object[0]

            innerDict["detectedObj"].push(object_name)
        })
        console.log("innerDict: ", innerDict)

        HATHOR.dictPDFPages[index] = innerDict


        /*if (photon) {
            ATON.Photon.fireEvent("pdfSpawn", {
                "indexPDF": HATHOR.actual_number_of_page,
                "userId": user_id,
                "numPages": HATHOR.number_of_pages
            })
        }*/

        HATHOR.generatePDFContainer(index, user_id)

    })
}

HATHOR.generateOrLoadPDF = (index, user_id, photon) => {

    console.log("DICTDICT", index, HATHOR.dictPDFPages)

    if (index in HATHOR.dictPDFPages) {
        HATHOR.generatePDFContainer(index, user_id)
    } else {
        // HATHOR.loadPDF(index, user_id, false, photon)
        HATHOR.loadPDF(index, user_id, photon)
    }
}

HATHOR.createKeywordSearchPanel = (id, user_id) => {
    let idx = id.split("_")[1];
    let titleContainer = new ATON.SUI.Label("titleKeySearch_" + idx, 0.5, 0.08, 0.06)
        .setText("Search Word")

    let caseSensitiveButton = new ATON.SUI.Button("caseSensitiveButton_" + idx, 1.5, 1.5, 1.7)
        .setText("W")
        .setBaseColor(ATON.MatHub.colors.white)
        .setTextColor(ATON.MatHub.colors.black)
        .setSwitchColor(ATON.MatHub.colors.blue)
        .setOnSelect(() => {
            if (caseSensitiveButton.getBSwitched()) {
                caseSensitiveButton.switch(false)
                    .setTextColor(ATON.MatHub.colors.black)
            } else {
                caseSensitiveButton.switch(true)
                    .setTextColor(ATON.MatHub.colors.white)
            }
        })

    let searchBar = new ATON.SUI.Field("searchKeyword_" + idx, 2.2, 0.15, id)
        .addOnEnterBehaviorToSetOnKeyboardWhenFieldIsSelected(() => {
            let word = searchBar.getText()
            console.log("Word", word)

            fetch("http://127.0.0.1:5003/get_word_in_detected_ocr?user_id=" + user_id + "&word_to_find=" + word + "&case_sensitive=" + caseSensitiveButton.getBSwitched(), {
                // mode: 'no-cors'
            })
                .then(res => res.json())
                .then(res => {

                    console.log("RES", res)

                    let horizontalLabels = []

                    let found = false

                    for (const [key, value] of Object.entries(res)) {
                        if (value !== 0) {
                            found = true
                            let labelPageAndOccurrences = new ATON.SUI.Label(key + "PdfPage", 1.9, 0.1, 0.06)
                                .setText(value + " occurrences at page: " + key)
                            let buttonToPage = new ATON.SUI.Button(key + "PdfPageButton", 4.0, 1.0, 1.5)
                                .setText("Go to page " + key)
                                .setTextColor(ATON.MatHub.colors.black)
                                .setBaseColor(ATON.MatHub.colors.green)
                                .setOnSelect(() => {
                                    HATHOR.actual_number_of_page = key - 1
                                    HATHOR.generateOrLoadPDF(HATHOR.actual_number_of_page, user_id, false)
                                })

                            horizontalLabels.push(ATON.SUI.createHorizontalContainer(key + "Horizontal", [buttonToPage, labelPageAndOccurrences]))
                        }
                    }

                    if (ATON.getUINode("pdfSearchedKey")) {
                        ATON.getUINode("pdfSearchedKey").hide()
                    }

                    if (found) {
                        ATON.SUI.verticalPositions(horizontalLabels, "pdfSearchedKey", 0.03)
                            .setPosition(0, 0.5, 0)
                            .attachTo(id)
                    } else {
                        ATON.SUI.createMessageLabel("timeoutNoKeyword", 0.5, 0.3, "Nothing Found", 0.04, 3000)
                    }

                })
        })
        .setBaseColor(ATON.MatHub.colors.white)
        .setTextColor(ATON.MatHub.colors.black)
        .setPlaceholder("keyword")

    let searchAndCaseBtn = ATON.SUI.createHorizontalContainer("searchAndCaseBtn", [caseSensitiveButton, searchBar])


    ATON.SUI.verticalPositions([titleContainer, searchAndCaseBtn], id, 0.03)
        .setPosition(4.5, 2.2, 2)
        .setRotation(0.0, 300, 0)
        .attachToRoot()
}


HATHOR.generatePDFContainer = (index, user_id) => {

    if (ATON.getUINode("PDFVerticalContainer_" + index)) {
        ATON.getUINode("PDFVerticalContainer_" + index).hide()
    }

    let closePDF = new ATON.SUI.Button("closePDF_" + index, 1.0, 1.0)
        .setIcon(ATON.FE.PATH_RES_ICONS + "cancel.png")
        .setBaseColor(ATON.MatHub.colors.red)
        .setTextColor(ATON.MatHub.colors.white)
        // .setText("Close PDF")
        .setOnSelect(() => {
            console.log("INDEX: " + index)
            console.log("NODE: ", ATON.getUINode("PDFVerticalContainer_" + index))
            ATON.getUINode("PDFVerticalContainer_" + index).delete()
            ATON.Photon.fireEvent("pdfClose", {})
            if (ATON.getUINode("skSearchContainer_" + index)) {
                ATON.getUINode("skSearchContainer_" + index).delete()
            }
            if (ATON.getUINode("searchbarKeywordContainer_" + index)) {
                ATON.getUINode("searchbarKeywordContainer_" + index).delete()
            }
        })

    let numberPageLabel = new ATON.SUI.Label("numPages_" + index, 0.2, 0.1, 0.06)
        .setBaseColor(ATON.MatHub.colors.white)
        .setTextColor(ATON.MatHub.colors.black)
        .setText((index + 1) + "/" + HATHOR.number_of_pages)

    let searchPDF = new ATON.SUI.Button("searchInPDF_" + index, 1.0, 1.0)
        .setIcon(ATON.FE.PATH_RES_ICONS + "search.png")
        .setBaseColor(ATON.MatHub.colors.black)
        .setTextColor(ATON.MatHub.colors.white)
        // .setText("Search In PDF")
        .setOnSelect(() => {
            if (!ATON.getUINode("searchbarKeywordContainer_" + index)) {
                HATHOR.createKeywordSearchPanel("searchbarKeywordContainer_" + index, user_id)
            } else {
                if (ATON.getUINode("searchbarKeywordContainer_" + index).visible === false) {
                    ATON.getUINode("searchbarKeywordContainer_" + index).show()
                } else {
                    ATON.getUINode("searchbarKeywordContainer_" + index).hide()
                }
            }
        })

    let bottomPDFContainer = ATON.SUI.createHorizontalContainer("bottomPDFContainer_" + index, [searchPDF, numberPageLabel, closePDF])
    // .add(numberPageLabel, closePDF)


    /*let previousButtonPDF = new ATON.SUI.Button("previousButtonPDF", 2.5, 1.5)
        .setIcon(ATON.FE.PATH_RES_ICONS + "left_arrow.png")
        .setOnSelect(() => {

            HATHOR.actual_number_of_page -= 1

            if (HATHOR.actual_number_of_page === 0) {
                previousButtonPDF.hide()
            }

            numberPageLabel.setText("")

            ATON.getUINode("PDFVerticalContainer").hide()

            if (ATON.getUINode("skSearchContainer")) {
                ATON.getUINode("skSearchContainer").hide()
            }

            ATON.Photon.fireEvent("pdfSpawn", {
                "indexPDF": HATHOR.actual_number_of_page,
                "userId": user_id,
                "numPages": HATHOR.number_of_pages
            })

            // HATHOR.generatePDFContainer(HATHOR.actual_number_of_page, user_id)
            HATHOR.generateOrLoadPDF(HATHOR.actual_number_of_page, user_id, false)
        })*/


    /*let nextButtonPDF = new ATON.SUI.Button("nextButtonPDF", 2.5, 1.5)
        .setIcon(ATON.FE.PATH_RES_ICONS + "right_arrow.png")
        .show()
        .setOnSelect(() => {
            HATHOR.actual_number_of_page += 1

            if (HATHOR.actual_number_of_page === HATHOR.number_of_pages - 1) {
                nextButtonPDF.hide()
            }

            numberPageLabel.setText("")
            ATON.getUINode("PDFVerticalContainer").hide()
            if (ATON.getUINode("skSearchContainer")) {
                ATON.getUINode("skSearchContainer").hide()
            }

            // if (HATHOR.actual_number_of_page in HATHOR.dictPDFPages) {
            //     HATHOR.generatePDFContainer(HATHOR.actual_number_of_page, user_id)
            // } else {
            //     HATHOR.loadPDF(HATHOR.actual_number_of_page, user_id, false)
            // }

            ATON.Photon.fireEvent("pdfSpawn", {
                "indexPDF": HATHOR.actual_number_of_page,
                "userId": user_id,
                "numPages": HATHOR.number_of_pages
            })

            HATHOR.generateOrLoadPDF(HATHOR.actual_number_of_page, user_id, false)
        })*/

    // if (HATHOR.actual_number_of_page === 0) {
    //     previousButtonPDF.hide()
    // }

    // if (HATHOR.actual_number_of_page === HATHOR.number_of_pages - 1) {
    //     nextButtonPDF.hide()
    // }

    let pdfContainer = ATON.SUI.createHorizontalContainer("pdfContainer_" + index, [/*nextButtonPDF, */HATHOR.dictPDFPages[index]["pdf"]/*, previousButtonPDF*/])
        // .add(nextButtonPDF, HATHOR.dictPDFPages[HATHOR.actual_number_of_page]["pdf"], previousButtonPDF)
        .setBackgroundOpacity(0.0)
        .setOnHover(() => {
        })
        .setOnLeave(() => {
        })

    let finalPDFContainer = undefined

    if (HATHOR.dictPDFPages[index]["detectedObj"].length !== 0) {
        let objButtons = []

        HATHOR.dictPDFPages[index]["detectedObj"].forEach(objLabel => {
            let objectNameLabel = new ATON.SUI.Button(objLabel + "-detected_" + index, 5, 1, 3)
                .setBaseColor(ATON.MatHub.colors.white)
                .setTextColor(ATON.MatHub.colors.black)
                .setText(objLabel)
                .setOnSelect(() => {
                    if (objectNameLabel.getBSwitched()) {
                        objectNameLabel.switch(false)
                        ATON.getUINode("skSearchContainer_pdf").delete()
                    } else {
                        // // switch off the other buttons
                        // objButtons.forEach(buttonsOfImages => {
                        //     if (buttonsOfImages._bSwitched) {
                        //         buttonsOfImages.switch(false)
                        //     }
                        // })
                        // objectNameLabel.switch(true)
                        ATON.SUI.toggleBtn(objButtons, objectNameLabel)

                        if (ATON.getUINode("skSearchContainer_pdf") !== undefined) {
                            ATON.getUINode("skSearchContainer_pdf").delete()
                        }

                        HATHOR.loadSketchfabModelsSUI(HATHOR.sketchfabSearchBaseURL + objLabel, true, undefined, undefined, undefined, undefined)

                    }
                })

            objButtons.push(objectNameLabel)
        })

        let labelsDetectedContainer = ATON.SUI.createHorizontalContainer("labelsDetected_" + index, objButtons)
            .setPosition(undefined, undefined, 0.02)

        // objButtons.forEach(item => {
        //     labelsDetectedContainer.add(item)
        // })

        finalPDFContainer = ATON.SUI.verticalPositions([labelsDetectedContainer, pdfContainer, bottomPDFContainer], "PDFVerticalContainer_" + index, 0.03)
        // .add(labelsDetectedContainer, pdfContainer, bottomPDFContainer)

    } else {

        finalPDFContainer = ATON.SUI.verticalPositions([pdfContainer, bottomPDFContainer], "PDFVerticalContainer_" + index, 0.03)
        // .add(pdfContainer, bottomPDFContainer)
    }

    finalPDFContainer
        .setPosition(4.5 + index, 1.8, -2.35)
        .setRotation(0.0, 300, 0)
        .attachToRoot()

}
