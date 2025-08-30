<template>
    <div class="suim_editor">
        <div class="editor_toolbar">
            <a href="#" @click.prevent="toggleMode">Switch to {{ isPlain ? 'HTML Editor' : 'Plain' }}</a>
        </div>

    <div ref="editorCtl" v-show="!isPlain"></div>
    <textarea v-show="isPlain" class="plain_textarea" v-model="data.content" @input="onTextareaInput"></textarea>
    </div>
</template>

<script setup>
    import Quill from 'quill';
    import { onMounted, onBeforeUnmount, ref, reactive, watch, nextTick } from 'vue';

    const props = defineProps({
        modelValue: {type: String, default:''},
    })
    
    const emit = defineEmits(['update:modelValue'])

    const editorCtl = ref(null)
    const isPlain = ref(false)

    const data = reactive({
        content: props.modelValue
    })

    let editor = null
    let editorChangeHandler = null

    function initQuill() {
    if (!editorCtl.value) return

    // if an editor already exists, destroy it first to avoid duplicates
    if (editor) destroyQuill()

    // ensure container is clean before creating Quill
        try { editorCtl.value.innerHTML = '' } catch (e) {}

        // remove any leftover Quill toolbar/container inside this component root
        try {
            const root = editorCtl.value.closest && editorCtl.value.closest('.suim_editor') ? editorCtl.value.closest('.suim_editor') : editorCtl.value.parentNode || document.body
            if (root) {
                root.querySelectorAll('.ql-toolbar, .ql-container').forEach(n => n.remove())
            }
        } catch (e) {}

        var toolbarOptions = [
            [{'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['image', 'clean']
        ];

        // create editor
        editor = new Quill(editorCtl.value, {
            theme: 'snow',
            modules: { toolbar: toolbarOptions }
        })

        // set initial content
        try {
            if (data.content && typeof data.content === 'string') {
                editor.clipboard.dangerouslyPasteHTML(data.content)
            }
        } catch (e) {
            // ignore
        }

        // bind change
        editorChangeHandler = function(ev, ...args) {
            if (ev === 'text-change') {
                data.content = editor.root.innerHTML
                emit('update:modelValue', data.content)
            }
        }
        editor.on('editor-change', editorChangeHandler)

    // force layout in case Quill didn't measure correctly
    try { window.dispatchEvent(new Event('resize')) } catch (e) {}
    }

    function destroyQuill() {
        if (!editor && !editorCtl.value) return
        try {
            if (editorChangeHandler && editor && editor.off) editor.off('editor-change', editorChangeHandler)
        } catch (e) {}

        // Remove any Quill-generated DOM nodes scoped to the component root (toolbar and container)
        try {
            const root = editorCtl.value && editorCtl.value.closest && editorCtl.value.closest('.suim_editor') ? editorCtl.value.closest('.suim_editor') : editorCtl.value && editorCtl.value.parentNode ? editorCtl.value.parentNode : document.body
            if (root) {
                root.querySelectorAll('.ql-toolbar, .ql-container').forEach(n => n.remove())
            }
        } catch (e) {}

        // ensure container cleared
        try { if (editorCtl.value) editorCtl.value.innerHTML = '' } catch (e) {}

        try { editor = null } catch (e) {}
        editorChangeHandler = null
    }

    async function toggleMode() {
        isPlain.value = !isPlain.value
        if (isPlain.value) {
            // switching to plain textarea: keep editor instance but hide it and capture content
            if (editor) {
                try { data.content = editor.root.innerHTML } catch (e) {}
                try { editor.disable() } catch (e) {}
                try { if (editorCtl.value) editorCtl.value.style.display = 'none' } catch (e) {}
            }
        } else {
            // switching to quill: show/enable existing editor or initialize if absent
            await nextTick()
            if (editor) {
                try { if (editorCtl.value) editorCtl.value.style.display = '' } catch (e) {}
                try { editor.enable() } catch (e) {}
                try { if (data.content) editor.clipboard.dangerouslyPasteHTML(data.content) } catch (e) {}
                try { window.dispatchEvent(new Event('resize')) } catch (e) {}
            } else {
                initQuill()
            }
        }
        emit('update:modelValue', data.content)
    }

    function onTextareaInput (e) {
        emit('update:modelValue', data.content)
    }

    // initialize on mount (default to quill)
    onMounted(() => {
        isPlain.value = false
        // ensure container exists, then initialize
        nextTick(() => initQuill())
    })

    onBeforeUnmount(() => {
        destroyQuill()
    })

    // watch external modelValue changes and update internal content/editor
    watch(() => props.modelValue, (nv) => {
        if (nv === undefined) return
        if (nv === data.content) return
        data.content = nv
        if (editor && !isPlain.value) {
            try {
                editor.clipboard.dangerouslyPasteHTML(nv)
            } catch (e) {}
        }
    })
</script>

<style scoped>
.suim_editor .editor_toolbar {
    margin-bottom: 0.5rem;
}
.suim_editor .editor_toolbar a {
    color: var(--primary-color, #2563eb);
    cursor: pointer;
    text-decoration: underline;
}
.plain_textarea {
    width: 100%;
    min-height: 200px;
    height: 300px;
}
</style>