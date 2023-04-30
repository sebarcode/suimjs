import formConfig from "./form_config"

const createFormConfig = (title, show) => {
    const cfg = new formConfig(title, show)
    return cfg
}

export default createFormConfig