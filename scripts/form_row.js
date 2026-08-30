import formInput from "./form_input"

class formRow {
    constructor(...inputFields) {
        this.inputs = []
        this.colCount = 0
        inputFields.forEach(el => {
            const input = new formInput(el)
            this.inputs.push(input)
            if (Number.isInteger(input.colSpan) && input.colSpan > 0) {
                this.colCount += input.colSpan
            } else {
                this.colCount++
            }
            //this.colCount += input.spaceBefore
            //this.colCount += input.spaceAfter
            //console.log(`${input.kind}: ${this.colCount}`)
        });
        //console.log(this)
    }

    addInput(inputField) {
        this.inputs.push(inputField)
        return this
    }
}

export default formRow
