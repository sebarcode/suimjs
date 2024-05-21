import createFormConfig from "./create_form_config"

const loadFormConfigFromData = (r) => {
    const cfg = {}
    cfg.setting = r.setting

    r.sectionGroups.forEach(sg => {
        sg.sections.forEach(s => {
            const inputRows = s.rows.map(row => {
                const modeledRow = {}
                modeledRow.inputs =  row.map(f => {
                    f.colSpan = isNaN(f.width=="") || f.width=="0" ? "auto" : f.width 
                    return f
                })
                modeledRow.colCount = row.length
                return modeledRow
            })
            s.visible = true
            s.rows = inputRows
        })
    })
    cfg.sectionGroups = r.sectionGroups

    return cfg
}

export default loadFormConfigFromData