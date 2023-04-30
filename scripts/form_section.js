import formRow from "./form_row"

class formSection {
    constructor(name, show) {
        this.title = name
        this.showTitle = show
        this.rows = []
        this.visible = true
    }

    setConfig(cfg) {
        this.visible = cfg.visible != undefined ? cfg.visible : this.visible
        return this
    }

    addRow(...inputFields) {
        const row = new formRow(...inputFields)
        //row.className = 'grid grid-cols-' + row.inputs.length
        this.rows.push(row)
        return this
    }

    addRowAuto(columnPerRow, ...inputFields) {
        let cols = []
        inputFields.forEach(el => {
            cols.push(el)
            if (cols.length == columnPerRow) {
                this.addRow(...cols)
                cols = []
            }
        })

        this.addRow(...cols)
    }

    getField(field) {
        for (let r = 0; r < this.rows.length; r++) {
            const row = this.rows[r]
            for (let c = 0; c < row.inputs.length; c++) {
                const col = row.inputs[c]
                if (col.field == field) return col
            }
        }
        return undefined
    }
}

export default formSection