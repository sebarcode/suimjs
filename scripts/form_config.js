import formSection from "./form_section"

class formConfig {
    constructor(name, show) {
        this.setting = {
            title: name,
            showTitle: show
        }
        this.sections = []
    }

    addSection(name, show) {
        const section = new formSection(name, show)
        this.sections.push(section)
        return section
    }

    getSection(name) {
        for (let x = 0; x < this.sections.length; x++) {
            if (this.sections[x].title == name) {
                return this.sections[x]
            }
        }

        return undefined
    }
}

export default formConfig