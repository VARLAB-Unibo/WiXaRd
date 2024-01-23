import * as THREE from 'three';
import Node from "../ATON.node.js";
import BaseKeyboard from "./BaseKeyboard/BaseKeyboard";
class Keyboard extends Node {

    constructor(uiid, language) {
        if (!uiid) {
            console.error("No UUID provided")
        }

        super(uiid, ATON.NTYPES.UI);

        this.supportedCharsets = [
            ['English', 'eng'],
            ['Nordic', 'nord'],
            ['German', 'de'],
            ['Spanish', 'es'],
            ['French', 'fr'],
            ['Russian', 'ru'],
            ['Greek', 'el']
        ];

        if (!language) {
            language = "eng"
        }

        if (!this.supportedCharsets.some(row => row[1] === language)) {
            console.error("Language not supported");
            return;
        }

        this.uiid = uiid

        this.field = undefined // Field where the keyboard writes
        // this.setOnEnter(this.defaultEnterBehavior)

        this.defaultEnterBehavior = "none" // "none", "newline", "hideKeyboard"

        this.colors = {
            keyboardBack: 0x858585,
            panelBack: 0x262626,
            button: 0x363636,
            hovered: 0x1c1c1c,
            selected: 0x109c5d
        };
        this.enablePicking();
        this.language = language

        this.setPosition(undefined, -0.4, 0.2);
        this.setRotation(-0.55, undefined, undefined)

        this.generateKeyboard()
    }

    addChar(char) {
        this.replaceText(this.field.getText() + char)
    }

    replaceText(newText) {
        if (this.field) {
            this.field.setText(newText)
        }
    }

    setFieldToWrite(fieldId) {
        if (!fieldId) {
            return;
        }

        this.field = ATON.getUINode(fieldId)

        return this;
    }

    removeFieldToWrite() {
        this.field = undefined

        return this;
    }

    setOnEnter(f, overwriteActualOnEnter = true) {
        if (overwriteActualOnEnter) {
            this.onEnter = () => {
                switch (this.defaultEnterBehavior){
                    case "none":
                        break
                    case "newline":
                        this.addChar('\n')
                        break
                    case "hideKeyboard":
                        this.hide()
                        break
                }

                f()
            }
        } else {
            this.setOnEnter(() => {
                this.onEnter()

                f()
            }, true)
        }

        return this;
    }

    setHideOnEnter(b) {
        if (b === undefined) {
            b = true
        }

        this.defaultEnterBehavior = b === true ? "hideKeyboard" : "none"

        // console.log("NEW BEHAV", this.defaultEnterBehavior)

        return this;
    }

    /**
     * Used to switch to an entirely different panel of this keyboard,
     * with potentially a completely different layout
     */
    setNextPanel() {
        this.keyboard.panels.forEach((panel) => {
            this.remove(panel);
        });

        this.keyboard.currentPanel = (this.keyboard.currentPanel + 1) % (this.keyboard.panels.length);

        this.add(this.keyboard.panels[this.keyboard.currentPanel]);
    }

    setNextCharset() {
        let nextCharset;
        for (let charsetIndex = 0; charsetIndex < this.supportedCharsets.length; charsetIndex++) {
            const charset = this.supportedCharsets[charsetIndex];
            if (charset[1] === this.language) {
                const nextCharsetIndex = (charsetIndex + 1) % (this.supportedCharsets.length)
                nextCharset = this.supportedCharsets[nextCharsetIndex];
                break;
            }
        }

        this.language = nextCharset[1]

        this.keyboard.panels.forEach((panel) => {
            this.remove(panel);
        });

        this.generateKeyboard()
    }

    generateKeyboard() {
        this.keyboard = new BaseKeyboard({
            language: this.language, // fontFamily: FontJSON,
            // fontTexture: FontImage,
            fontFamily: ATON.SUI.PATH_FONT_JSON, fontTexture: ATON.SUI.PATH_FONT_TEX, fontSize: 0.035, // fontSize will propagate to the keys blocks
            backgroundColor: new THREE.Color(this.colors.keyboardBack),
            backgroundOpacity: 1, // backspaceTexture: Backspace,
            shiftTexture: ATON.FE.PATH_RES_ICONS + "keyboard/shift.png",
            enterTexture: ATON.FE.PATH_RES_ICONS + "keyboard/enter.png",
            backspaceTexture: ATON.FE.PATH_RES_ICONS + "keyboard/backspace.png"
        });

        // this.container = this.keyboard.panels[0]
        this.add(this.keyboard.panels[0]);

        // ThreeMeshUI.update();

        this.keyboard.keys.forEach((key) => {
            key.setOnLeave(() => {
                key.setBaseColor(new THREE.Color(this.colors.button)) // TODO mettere colori corretti
            })

            key.setOnHover(() => {
                key.setBaseColor(new THREE.Color(this.colors.hovered)) // TODO mettere colori corretti
            })

            key.setOnSelect(() => {
                key.setBaseColor(new THREE.Color(this.colors.selected)) // TODO mettere colori corretti
                setTimeout(() => {
                    key.setBaseColor(new THREE.Color(this.colors.button)) // TODO mettere colori corretti
                }, 100);

                // TODO if the key have a command (eg: 'backspace', 'switch', 'enter'...)
                // special actions are taken
                if (key.info.command) {
                    switch (key.info.command) {
                        case 'switch': // switch between panels
                            this.setNextPanel();
                            break;
                        case 'switch-set': // switch between panel charsets (eg: russian/english)
                            this.setNextCharset();
                            break;
                        case 'enter' :
                            // this.addChar('\n')
                            this.onEnter()
                            break;
                        case 'space' :
                            this.addChar(' ')
                            break;
                        case 'backspace' :
                            let actualText = this.field.getText()
                            if (!actualText.length) {
                                break
                            }
                            this.replaceText(actualText.substring(0, actualText.length - 1) || '')
                            break;
                        case 'shift' :
                            console.log("SSHHHHIFT")
                            this.keyboard.toggleCase();
                            break;
                    }
                } else if (key.info.input) { // print a glyph, if any
                    this.addChar(key.info.input)
                }
            })
        });
    }
}

export default Keyboard;