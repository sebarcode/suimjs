const loadGridConfig = async (axios, url) => {
    const r = (await axios.post(url)).data
    if (!r || typeof r !== 'object' || !Array.isArray(r.fields)) {
        throw new Error('Invalid grid configuration response.')
    }
   
    const cfg = new gridConfig()
    cfg.setting = r.setting || {}
    cfg.fields = r.fields

    //console.log('form config is generated:', cfg)
    return cfg
}

class gridConfig {
    constructor(setting, fields) {
        this.setting = setting
        this.fields = fields
    }

    changeFieldAttr(fieldName, attrName, attrValue) {  
        this.fields.forEach(f => {
            if (f.field == fieldName) {
                f[attrName] = attrValue
            }
        })
    }

    changeInputAttr(fieldName, attrName, attrValue) {  
        this.fields.forEach(f => {
            if (f.field == fieldName) {
                f.input[attrName] = attrValue
            }
        })
    }
}

export default loadGridConfig
