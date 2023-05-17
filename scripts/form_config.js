import formSection from "./form_section"

class formConfig {
    constructor(name, show) {
        this.setting = {
            title: name,
            showTitle: show
        }
        this.sections = []
        this.setting.sectionDirection = 'row'
        this.setting.sectionSize = 1
    }

    setSectionConfig(direction, size) {
        if (direction && direction!="") this.setting.sectionDirection = direction
        if (size && size > 0) this.setting.sectionSize = size
    }

    sectionGroups() {
        const groupCount = Math.ceil(this.sections.length / this.setting.sectionSize)

        const groups = []
        for (let i=0; i<groupCount; i++) {
            const iLow = i * this.setting.sectionSize
            const iHi = (iLow + this.setting.sectionSize) >= this.sections.length ? this.sections.length : iLow + this.setting.sectionSize
            const groupSections = this.sections.slice(iLow, iHi)
            
            groups.push({
                title: `group ${i}`,
                sections: groupSections.map(x => {
                    x.id = x.title.replace(' ','_')
                    return x
                })
            })
        }

        return groups
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

    generateConfig () {
        const modeledConfig = {
            setting: this.setting
        }
        modeledConfig.sectionGroups = this.sectionGroups()
        return modeledConfig
    }
}

export default formConfig