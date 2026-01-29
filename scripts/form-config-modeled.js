class formConfigModeled {
    constructor() {
        this.setting = {
            title: "",
            showTitle: false
        }
        this.sectionGroups = []
    }

    changeFieldAttr(fieldName, attrName, attrValue) {  
        this.sectionGroups.forEach(sg => {
            sg.sections.forEach(s => {
                s.rows.forEach(r => {
                    r.inputs.forEach(f => {
                        if (f.field == fieldName) {
                            f[attrName] = attrValue
                        }
                    })
                })
            })
        })
    }
}

export default formConfigModeled
