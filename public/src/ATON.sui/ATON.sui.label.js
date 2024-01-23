/*
    ATON spatial UI Label class

    author: bruno.fanini_AT_gmail.com

===========================================================*/

import Node from "../ATON.node.js";

/**
 Class representing a SpatialUI Label.
 Constructor requires a uiid (UI Node ID)
 @class Label
 @example
 new ATON.SUI.Label().setText("Hello")
 */
class Label extends Node {

    constructor(uiid, w, h, fsize = 0.03) {
        super(uiid, ATON.NTYPES.UI);

        this.uiid = uiid
        this.baseColor = ATON.MatHub.colors.black;
        this.baseOpacity = 0.5;
        this.width = (w) ? w : 0.2;
        this.height = (h) ? h : 0.05;
        this.textAlign = 'center'
        this.justifyContent = 'center'
        this.borderRadius = 0.03
        this.hoverOpacity = 0.5;

        this.container = new ThreeMeshUI.Block({
            width: this.width,
            height: this.height,
            padding: 0.001,
            // margin: 0.03,
            borderRadius: this.borderRadius,
            backgroundColor: this.baseColor,
            backgroundOpacity: this.baseOpacity,

            fontFamily: ATON.SUI.PATH_FONT_JSON,
            fontTexture: ATON.SUI.PATH_FONT_TEX,

            justifyContent: this.justifyContent,
            textAlign: this.textAlign,
            // bestFit: 'shrink'
        });

        // console.log("LABEL", this.uiid, this.container)
        this.container.frame.material.side = THREE.DoubleSide
        this.container.frame.material.uniforms.u_borderRadiusBottomLeft.value = 0.1
        this.container.frame.material.uniforms.u_opacity.value = 1

        // this.container.position.z = 0.03;
        this.add(this.container);

        this.uiText = new ThreeMeshUI.Text({
            content: "",
            fontSize: fsize,
            fontColor: ATON.MatHub.colors.white
        });
        this.container.add(this.uiText);

        ThreeMeshUI.update();

        this._trigger = undefined

        this.setOnHover(() => {
            this.setBackgroundOpacity(this.hoverOpacity);
        })

        this.setOnLeave(() => {
            this.setBackgroundOpacity(this.baseOpacity);
        })

        this.enablePicking();

    }

    visibilityContainerChildren(visibility){
        console.log("PRIMA", this.container.children)
        this.container.children.forEach(child => {
            child.visible = visibility
        })
        console.log("DOPO", this.container.children)

    }

    setBaseOpacity(opacity){
        this.container.set({
            backgroundOpacity: opacity
        });
        ThreeMeshUI.update();
        return this;
    }

    setHoverOpacity(opacity){
        this.container.set({
            backgroundOpacity: opacity
        });
        ThreeMeshUI.update();
        return this;
    }

    setBorderRadius(radius){
        this.borderRadius = radius

        ThreeMeshUI.update();
        return this;
    }

    setTextAlign(alignment){
        this.textAlign = alignment

        ThreeMeshUI.update();
        return this;
    }

    setJustifyContent(pos){
        this.justifyContent = pos

        ThreeMeshUI.update();
        return this;
    }

    getWidth() {
        return this.width
    }

    getHeight() {
        return this.height
    }

    getDimensions() {
        return [this.width, this.height]
    }

    setWidth(newWidth) {
        this.width = newWidth

        ThreeMeshUI.update();
        return this;
    }

    setHeight(newHeight) {
        this.height = newHeight

        ThreeMeshUI.update();
        return this;
    }

    getUiid() {
        return this.uiid
    }

    getText(){
        // console.log(this.uiText)
        return this.uiText.content
    }

    setIcon(url, bNoBackground) {
        ATON.Utils.textureLoader.load(url, (texture) => {

            // texture.needsUpdate = true

            this._trigger = new THREE.Mesh(
                // new THREE.PlaneGeometry(ATON.SUI.STD_BTN_SIZE * 0.9, ATON.SUI.STD_BTN_SIZE * 0.9, 2),
                new THREE.PlaneGeometry(this.width, this.height, 2),
                ATON.MatHub.getMaterial("fullyTransparent")
            );
            this._trigger.position.set(0, 0, 0.002);

            // this._trigger.scale.set(0.5, texture.image.height / texture.image.width, 0.5);

            this.add(this._trigger);

            this._trigger.material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                depthWrite: false
            });

            if (bNoBackground) {
                this.setBackgroundOpacity(0.0);
                this.hoverOpacity = 0.0;
            }

            this.uiText.position.set(0, -0.035, 0);
        });

        ThreeMeshUI.update();
        return this;
    }

    /**
     Set base color of the label
     @param {THREE.Color} c - the color
     */
    setBaseColor(c) {
        this.baseColor = c;
        this.container.set({backgroundColor: this.baseColor});

        ThreeMeshUI.update();
        return this;
    }

    setTextColor(c) {
        this.uiText.set({fontColor: c});

        ThreeMeshUI.update();
        return this;
    }

    setBackgroundOpacity(f) {
        this.container.set({backgroundOpacity: f});
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

    setFontSize(fontSize) {
        this.uiText.set({fontSize: fontSize});

        ThreeMeshUI.update();
        return this;
    }

    /*
    setAutoOrientation(b){
        if (b === true){
            let self = this;

            this.onAfterRender = ()=>{
                self.quaternion.copy( ATON.Nav._qOri );
                console.log("x");
            };
        }
        else this.onAfterRender = undefined;
    }
    */


}

export default Label;