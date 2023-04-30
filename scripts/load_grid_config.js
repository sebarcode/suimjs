const loadGridConfig = async (axios, url) => {
    const r = (await axios.post(url)).data
   
    const cfg = {}
    cfg.setting = r.setting
    cfg.fields = r.fields

    //console.log('form config is generated:', cfg)
    return cfg
}

export default loadGridConfig