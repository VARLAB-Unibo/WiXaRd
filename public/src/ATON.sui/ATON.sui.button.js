/*
    ATON spatial UI Button class

    author: bruno.fanini_AT_gmail.com

===========================================================*/

import Node from "../ATON.node.js";

/**
 Class representing a SpatialUI Button.
 Constructor requires a uiid (UI Node ID)
 @class Button
 @example
 new ATON.SUI.Button("myButton")
 */
class Button extends Node {

    constructor(uiid, ratioWidth = 1.0, ratioHeight = 1.0, fsize = 1.0) {
        super(uiid, ATON.NTYPES.UI);

        this.uiid = uiid
        this.width = 0.1 * ratioWidth
        this.height = 0.1 * ratioHeight
        this.baseColor = ATON.MatHub.colors.black;
        this.switchColor = ATON.MatHub.colors.green;
        this.fsize = fsize

        this.baseOpacity = 1.0;
        this.hoverOpacity = 0.5;

        this._bSwitched = false;

        this.container = new ThreeMeshUI.Block({
            width: this.width,
            height: this.height,
            padding: 0.0,
            margin: 0.0,
            borderRadius: 0.02,
            backgroundColor: this.baseColor,
            backgroundOpacity: this.baseOpacity,

            fontFamily: ATON.SUI.PATH_FONT_JSON,
            fontTexture: ATON.SUI.PATH_FONT_TEX,

            justifyContent: 'center', // could be 'center' or 'left'
            textAlign: 'center',
        });

        // console.log("Button", this.container)
        this.container.frame.material.side = THREE.DoubleSide
        // this.container.frame.material.uniforms.u_opacity.value = 0.5

        this.add(this.container);

        this.uiText = new ThreeMeshUI.Text({
            content: "",
            fontSize: 0.02 * fsize,
            fontColor: ATON.MatHub.colors.white
        });
        //this.uiText.position.set(0,0,-0.01);
        this.container.add(this.uiText);

        // Trigger geom
        // let trw = ATON.SUI.STD_BTN_SIZE * 0.9 * ratioWidth;
        // let trh = ATON.SUI.STD_BTN_SIZE * 0.9;
        let trw = this.height - 0.02;
        let trh = this.height - 0.02;
        this._trigger = new THREE.Mesh(
            new THREE.PlaneGeometry(trw, trh, 2),
            ATON.MatHub.getMaterial("fullyTransparent")
        );
        this._trigger.position.set(0, 0, 0.002);

        this.add(this._trigger);

        this.setOnHover(() => {
            this.setBackgroundOpacity(this.hoverOpacity);
            ATON.AudioHub.playOnceGlobally(ATON.PATH_RES + "audio/blop.mp3");
        })

        this.setOnLeave(() => {
            this.setBackgroundOpacity(this.baseOpacity);
        })

        this.enablePicking();

        ThreeMeshUI.update();
    }

    getDimensions(){
        return [this.width, this.height]
    }

    getUiid(){
        return this.uiid
    }

    getBSwitched(){
        return this._bSwitched
    }

    getBaseColor(){
        return this.container.backgroundColor
    }

    /**
     Set base color of the button
     @param {THREE.Color} c - the color
     */
    setBaseColor(c) {
        this.baseColor = c;
        if (!this._bSwitched) {
            this.container.set({backgroundColor: this.baseColor});
        }

        ThreeMeshUI.update();
        return this;
    }

    setHoverOpacity(c) {
        this.container.set({backgroundOpacity: c});

        ThreeMeshUI.update();
        return this;
    }

    /**
     Set button switch color (when activated)
     @param {THREE.Color} c - the color
     */
    setSwitchColor(c) {
        this.switchColor = c;
        if (this._bSwitched) {
            this.container.set({backgroundColor: this.switchColor});
        }

        ThreeMeshUI.update();
        return this;
    }

    setBackgroundOpacity(f) {
        this.container.set({
            backgroundOpacity: f
        });

        // this.baseOpacity = f;

        ThreeMeshUI.update();
        return this;
    }

    /**
     Set button text
     @param {string} text
     */
    setText(text) {
        this.uiText.set({content: text});

        ThreeMeshUI.update();
        return this;
    }

    setTextColor(c) {
        this.uiText.set({fontColor: c});

        ThreeMeshUI.update();
        return this;
    }

    /**
     Switch the button (ON/OFF)
     @param {boolean} b
     */
    switch(b) {
        this._bSwitched = b;
        if (b) {
            this.container.set({backgroundColor: this.switchColor});
        } else {
            this.container.set({backgroundColor: this.baseColor});
        }

        ThreeMeshUI.update();
        return this;
    }

    /**
     Set button icon
     @param {string} url - the url to the icon (tipically a PNG file)
     */
    setIcon(url, bNoBackground) {
        ATON.Utils.textureLoader.load(url, (texture) => {

            this._trigger.material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                depthWrite: true //stava a false
            });

            if (bNoBackground) {
                this.setBackgroundOpacity(0.0);
                this.hoverOpacity = 0.0;
            }

            /*
                    this.container.set({
                        backgroundTexture: texture,
                        backgroundOpacity: 1.0,
                        backgroundColor: undefined
                    });
            */
            this.uiText.position.set(0.0, -0.065, 0.0);
            this.uiText.set({fontSize: this.fsize});
        });

        ThreeMeshUI.update();
        return this;
    }

}

export default Button;