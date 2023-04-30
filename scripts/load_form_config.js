import createFormConfig from "./create_form_config"

const loadFormConfig = async (axios, url) => {
    const r = (await axios.post(url)).data
    const cfg = createFormConfig(r.setting.title, r.setting.showTitle)
    cfg.setting = r.setting

    r.sections.forEach(s => {
        //console.log("loading form section:", s.title, s.showTitle, s)
        const fs = cfg.addSection(s.title, s.showTitle)
        s.rows.forEach(row => {
            fs.addRow(...(row.map(f => {
                f.colSpan = isNaN(f.width=="") || f.width=="0" ? "auto" : f.width 
                return f
            })))
            //console.log(`grid-cols-${colLength}`)
            //row.colsName = `grid-cols-${colLength}` 
        })
    })

    //console.log('form config is generated:', cfg)
    return cfg
}

export default loadFormConfig