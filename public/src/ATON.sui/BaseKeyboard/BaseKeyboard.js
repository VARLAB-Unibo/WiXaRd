import {Object3D} from 'three';
import keymaps from './Keymaps';
import {mix} from "./mix"
import BoxComponent from "../../ThreeMeshUI/components/core/BoxComponent";
import MeshUIComponent from "../../ThreeMeshUI/components/core/MeshUIComponent";

/**
 * Job: high-level component that returns a keyboard
 */
// export default class BaseKeyboard extends mix.withBase( Object3D )( BoxComponent, MeshUIComponent ) {
export default class BaseKeyboard extends mix.withBase(Object3D)(BoxComponent, MeshUIComponent) {
    constructor(options) {

        // DEFAULTS

        if (!options) options = {};
        if (!options.width) options.width = 1;
        if (!options.height) options.height = 0.4;
        if (!options.margin) options.margin = 0.003;
        if (!options.padding) options.padding = 0.01;

        //

        super(options);

        this.currentPanel = 0;

        this.isLowerCase = true;

        this.charsetCount = 1;

        //////////
        // KEYMAP
        //////////

        // ../utils/Keymaps contains information about various keyboard layouts
        // We select one depending on the user's browser language if
        // there is no options.language

        let keymap;

        if (options.language || navigator.language) {

            switch (options.language || navigator.language) {

                case 'fr' :
                case 'fr-CH' :
                case 'fr-CA' :
                    keymap = keymaps.fr;
                    break;

                case 'ru' :
                    this.charsetCount = 2;
                    keymap = keymaps.ru;
                    break;

                case 'de' :
                case 'de-DE' :
                case 'de-AT' :
                case 'de-LI' :
                case 'de-CH' :
                    keymap = keymaps.de;
                    break;

                case 'es' :
                case 'es-419' :
                case 'es-AR' :
                case 'es-CL' :
                case 'es-CO' :
                case 'es-ES' :
                case 'es-CR' :
                case 'es-US' :
                case 'es-HN' :
                case 'es-MX' :
                case 'es-PE' :
                case 'es-UY' :
                case 'es-VE' :
                    keymap = keymaps.es;
                    break;

                case 'el' :
                    this.charsetCount = 2;
                    keymap = keymaps.el;
                    break;

                case 'nord' :
                    keymap = keymaps.nord;
                    break;

                default :
                    keymap = keymaps.eng;
                    break;

            }

        } else {

            keymap = keymaps.eng;

        }

        ////////////////////
        // BLOCKS CREATION
        ////////////////////

        // PANELS

        this.keys = [];

        this.panels = keymap.map((panel) => {

            let horizontalPanelsList = []

            panel.map((line) => {

                let keysList = []
                line.map((keyItem) => {

                    const char = keyItem.chars[0].lowerCase || keyItem.chars[0].icon || 'undif';
                    let keyNode = undefined
                    if (char === 'space') {
                        keyNode = new ATON.SUI.Button(char + Math.random(), 5, 1.0, 2.0)
                    } else if (char === 'enter' || char === 'shift' || char === 'backspace') {
                        keyNode = new ATON.SUI.Button(char + Math.random(), 1.5, 1.0, 2.0)
                            .setMaterialById("black")
                    } else {
                        keyNode = new ATON.SUI.Button(char + Math.random(), 1.0, 1.0, 2.0)
                    }
                    keyNode.type = 'Key';
                    keyNode.info = keyItem;
                    keyNode.info.input = char;

                    if (
                        (char === 'enter' && options.enterTexture) ||
                        (char === 'shift' && options.shiftTexture) ||
                        (char === 'backspace' && options.backspaceTexture)
                    ) {
                        const url = (() => {
                            switch (char) {
                                case 'backspace':
                                    return options.backspaceTexture;
                                case 'enter':
                                    return options.enterTexture;
                                case 'shift':
                                    return options.shiftTexture;
                                default:
                                    console.warn('There is no icon image for this key');
                            }
                        })();

                        keyNode.setIcon(url, true)
                    } else {
                        keyNode.setText(char)
                    }

                    this.keys.push(keyNode);
                    keysList.unshift(keyNode)
                })

                let horizontalContainer = ATON.SUI.createHorizontalContainer("keyboardContainer" + Math.random(), keysList)
                    .setBaseOpacity(0.8)
                    .setPosition(undefined, undefined, 0.02)
                // keysList.forEach(key => {
                //     key.attachTo(horizontalContainer)
                // })

                horizontalPanelsList.push(horizontalContainer)

            })

            let panelBlockNode = ATON.SUI.verticalPositions(horizontalPanelsList, "panel_block-" + Math.random(), 0.009)
            // horizontalPanelsList.forEach(cont => {
            //     cont.attachTo(panelBlockNode)
            // })

            return panelBlockNode;

        });

        this.set(options);
    }

    /**
     * Used to switch to an entirely different panel of this keyboard,
     * with potentially a completely different layout
     */
    // setNextPanel() {
    //
    //     console.log("ciao")
    //     this.remove(this.panels[0]);
    //
    //     // this.panels.forEach((panel) => {
    //     //
    //     //     this.remove(panel);
    //     //
    //     // });
    //     //
    //     // this.currentPanel = (this.currentPanel + 1) % (this.panels.length);
    //     //
    //     // this.add(this.panels[this.currentPanel]);
    //
    //     // this.update(true, true, true);
    //
    // }

    /*
     * Used to change the keys charset. Some layout support this,
     * like the Russian or Greek keyboard, to be able to switch to
     * English layout when necessary
     */
    // setNextCharset() {
    //
    //     this.panels[this.currentPanel].charset = (this.panels[this.currentPanel].charset + 1) % this.charsetCount;
    //
    //     this.keys.forEach((key) => {
    //
    //         // Here we sort the keys, we only keep the ones that are part of the current panel.
    //
    //         const isInCurrentPanel = this.panels[this.currentPanel].getObjectById(key.id);
    //
    //         if (!isInCurrentPanel) return;
    //
    //         //
    //
    //         const char = key.info.chars[key.panel.charset] || key.info.chars[0];
    //
    //         const newContent = this.isLowerCase || !char.upperCase ? char.lowerCase : char.upperCase;
    //
    //         if (!key.childrenTexts.length) return;
    //
    //         const textComponent = key.childrenTexts[0];
    //
    //         key.info.input = newContent;
    //
    //         textComponent.set({
    //             content: newContent
    //         });
    //
    //         textComponent.update(true, true, true);
    //
    //     });
    //
    // }

    /** Toggle case for characters that support it. */
    toggleCase() {

        this.isLowerCase = !this.isLowerCase;

        this.keys.forEach((key) => {
            const char = key.info.chars[0] || key.info.chars[0];

            const newContent = this.isLowerCase || !char.upperCase ? char.lowerCase : char.upperCase;

            // if (!key.childrenTexts.length) {
            //     return;
            // }

            // const textComponent = key.childrenTexts[0];

            key.info.input = newContent;
            //
            // textComponent.set({
            //     content: newContent
            // });
            //
            // textComponent.update(true, true, true);

            key.setText(newContent)
        });

    }

    ////////////
    //  UPDATE
    ////////////

    parseParams() {
    }

    updateLayout() {
    }

    updateInner() {
    }

}
