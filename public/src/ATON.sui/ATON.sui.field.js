import Label from "./ATON.sui.label";

class Field extends Label {
    constructor(uiid, w, h, idToAttachKeyboard) {
        super(uiid, w, h, 0.06)

        this.uiid = uiid
        this.keyboard = ATON.getUINode("keyboard")
        if (!this.keyboard) {
            this.keyboard = new ATON.SUI.Keyboard("keyboard", "eng")
        }

        this.idToAttachKeyboard = idToAttachKeyboard

        this.setOnSelect(() => {
            this.onSelectDefaultBehavior()
        })
    }

    onSelectDefaultBehavior() {
        this.keyboard.setFieldToWrite(this.uiid)
        this.setTextColor(ATON.MatHub.colors.black)
        this.setText("")

        if (this.idToAttachKeyboard) {
            this.keyboard.attachTo(this.idToAttachKeyboard)
        } else {
            this.keyboard.attachTo(this)
        }
    }

    addOnEnterBehaviorToSetOnKeyboardWhenFieldIsSelected(f) {
        if (!f) {
            console.error("Behavior not provided")
            return this
        }
        this.setOnSelect(() => {
            this.onSelectDefaultBehavior()

            this.keyboard.setOnEnter(f)
        })

        return this;
    }

    setNextNodeToSelect(nodeId) {
        let nodeToSelect = ATON.getUINode(nodeId)
        if (!nodeToSelect) {
            console.error("Button doesn't exist")
            return this
        }

        nodeToSelect.onSelect()

        return this
    }

    setPlaceholder(placeholder) {
        if (!placeholder) {
            console.error("No placeholder provided")
            return this
        }

        this.setText(placeholder)
        this.setTextColor(ATON.MatHub.colors.lightgrey)

        return this
    }
}

export default Field;