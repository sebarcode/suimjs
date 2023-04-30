import formInput from "./form_input"

class formRow {
    constructor(...inputFields) {
        this.inputs = []
        this.colCount = 0
        inputFields.forEach(el => {
            const input = new formInput(el)
            this.inputs.push(input)
            if (!isNaN(input.width) && !input.width=="0") {
                this.colCount += parseInt(input.width)
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