import createFormConfig from "./create_form_config"

const loadFormConfigFromData = (r) => {
    const cfg = {}
    cfg.setting = r.setting

    r.sectionGroups.forEach(sg => {
        sg.sections.forEach(s => {
            const inputRows = s.rows.map(row => {
                const modeledRow = {}
                modeledRow.inputs =  row.map(f => {
                    const span = Number(f.colSpan || f.width)
                    f.colSpan = Number.isInteger(span) && span > 0 ? span : "auto"
                    return f
                })
                modeledRow.colCount = s.autoCol > 0 ? s.autoCol : row.length
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
