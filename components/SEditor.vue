<template>
    <div ref="editorCtl"></div>
</template>

<script setup>
    import Quill from 'quill';
    import { onMounted } from 'vue';
    import { ref } from "vue";
    import { reactive } from "vue";

    const props = defineProps({
        modelValue: {type: String, default:''},
    })
    
    const editorCtl = ref(null)

    const data = reactive({
        content: props.modelValue
    })

    const emit = defineEmits({
        'update:modelValue': null,
    })

    onMounted(() => {
        var toolbarOptions = [
            [{'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        
            
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'align': [] }],
            ['image', 'clean']                                         // remove formatting button
            ];

        editorCtl.value.innerHTML = data.content;
        const editor = new Quill(editorCtl.value, {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
            }
        });

        editor.on('editor-change', (ev, ...args) => {
            if (ev==='text-change') {
                data.content = editor.root.innerHTML;
                emit('update:modelValue', data.content);
            }
        })
    })
</script>