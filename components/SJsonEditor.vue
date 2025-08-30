<template>
    <div class="suim_jsoneditor">
        <div ref="editorContainer" class="jsoneditor_container"></div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, defineEmits, defineProps, defineExpose } from 'vue'
// jsoneditor (ensure it's installed in the project: npm i jsoneditor)
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'

const props = defineProps({
    modelValue: { type: [Object, Array, String, Number, Boolean, null], default: () => ({}) },
    mode: { type: String, default: 'tree' },
    options: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'change'])

const editorContainer = ref(null)
let editor = null

function setEditorValue(val) {
    if (!editor) return
    try {
        // If the incoming value is a JSON string, try to parse it first
        const v = typeof val === 'string' ? JSON.parse(val) : val
        editor.update ? editor.update(v) : editor.set(v)
    } catch (e) {
        // If value cannot be parsed, set as string in code mode if applicable
        if (props.mode === 'code' && editor.setText) {
            editor.setText(String(val))
        }
    }
}

function getEditorValue() {
    if (!editor) return null
    try {
        return editor.get()
    } catch (e) {
        // editor.get() throws when JSON is invalid (code mode) — ignore until valid
        return null
    }
}

onMounted(() => {
    const defaultOptions = Object.assign({ mode: props.mode, navigationBar: false, mainMenuBar: false }, props.options)
    editor = new JSONEditor(editorContainer.value, defaultOptions)

    // initialize
    setEditorValue(props.modelValue)

    // listen for changes
    try {
        // jsoneditor supports change callback via on('change') or onChange option
        if (editor.on) {
            editor.on('change', () => {
                const val = getEditorValue()
                if (val !== null) {
                    emit('update:modelValue', val)
                    emit('change', val)
                }
            })
        } else if (typeof editor.options.onChange === 'function') {
            // nothing to do, it's internal
        } else {
            // fallback: poll for changes (very rare)
            let last = JSON.stringify(getEditorValue())
            const interval = setInterval(() => {
                const cur = JSON.stringify(getEditorValue())
                if (cur !== last) {
                    last = cur
                    try {
                        const val = JSON.parse(cur)
                        emit('update:modelValue', val)
                        emit('change', val)
                    } catch (e) {}
                }
            }, 300)
            // store interval on editor for cleanup
            editor.__suim_poll = interval
        }
    } catch (err) {
        // ignore event binding errors
        console.warn('SJsonEditor: unable to bind change event', err)
    }
})

onBeforeUnmount(() => {
    if (!editor) return
    if (editor.__suim_poll) {
        clearInterval(editor.__suim_poll)
    }
    try {
        editor.destroy()
    } catch (e) {
        // ignore
    }
    editor = null
})

// respond to external prop changes
watch(() => props.modelValue, (nv) => {
    const cur = getEditorValue()
    // only update if different (and editor currently has a parsable value)
    try {
        const curStr = JSON.stringify(cur)
        const newStr = JSON.stringify(typeof nv === 'string' ? JSON.parse(nv) : nv)
        if (curStr !== newStr) setEditorValue(nv)
    } catch (e) {
        // when current editor content is invalid, don't overwrite
    }
}, { deep: true })

defineExpose({
    getJson: getEditorValue,
    setJson: setEditorValue
})
</script>

<style scoped>
.jsoneditor_container {
    width: 100%;
    min-height: 200px;
    height: 300px;
}
</style>