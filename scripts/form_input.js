
class formInput {
    constructor(input) {        
        for (var propName in input) {
            this[propName] = input[propName]
        }
        
        //-- standard variable that will be required
        this.field = input && input.field ? input.field : ''
        this.label = input && input.label ? input.label : this.field
        this.caption = input && input.caption ? input.caption : undefined
        this.hint = input && input.hint ? input.hint : undefined
        this.kind = input && input.kind ? input.kind : 'text'
        this.readOnly = input && input.readOnly===true
        this.readOnlyOnEdit = input && input.readOnlyOnEdit===true ? true : false 
        this.required = input && input.required===true
        this.rules = input && input.rules ? input.rules : []
        this.multiRow = input && input.multiRow ? input.multiRow : 1
        this.useList = input && input.useList ? input.useList : false
        this.multiple = input && input.multiple ? input.multiple : false
        this.items = input && input.items ? input.items.map(el => {
            if (typeof el=='string') return {key: el, text: el}
                else return el
        }) : []
        
        this.errors = []
    }
}

export default formInput