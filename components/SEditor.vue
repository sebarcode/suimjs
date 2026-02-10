<template>
  <div class="seditor_root">
    <div class="seditor_actions" v-if="showToggle">
      <button type="button" class="seditor_toggle_btn" @click="toggleMode">
        {{ localMode === 'rich' ? 'Switch to plain text' : 'Switch to rich text' }}
      </button>
    </div>

    <QuillEditor 
      v-if="localMode === 'rich'" 
      v-model:content="internalValue" 
      content-type="html"
      :toolbar="toolbarOptions"
      :options="editorOptions"
      theme="snow"
    />

    <textarea
      v-else
      v-model="internalValue"
      :rows="textareaRows"
      class="seditor_textarea"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { QuillEditor, Quill } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// Register custom formats to support div and other HTML elements
const Block = Quill.import('blots/block')
const Inline = Quill.import('blots/inline')

// Custom Div blot
class DivBlot extends Block {
  static blotName = 'div'
  static tagName = 'div'
}

// Custom Span blot
class SpanBlot extends Inline {
  static blotName = 'span'
  static tagName = 'span'
}

// Register custom blots
Quill.register(DivBlot)
Quill.register(SpanBlot)

const props = defineProps({
  modelValue: { type: String, default: '' },
  // initial mode: 'rich' (Quill) or 'plain' (textarea)
  mode: { type: String, default: 'rich' },
  // show a small toggle button to switch modes
  showToggle: { type: Boolean, default: true },
  // rows for plain textarea
  textareaRows: { type: Number, default: 8 },
})

const emit = defineEmits(['update:modelValue'])

// Complete toolbar configuration
const toolbarOptions = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'font': [] }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  
  [{ 'script': 'sub'}, { 'script': 'super' }],
  
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  
  [{ 'align': [] }],
  
  ['blockquote', 'code-block'],
  
  ['link', 'image', 'video'],
  
  ['clean']
]

// Editor options with custom formats
const editorOptions = {
  modules: {
    toolbar: toolbarOptions,
  },
  formats: [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'div', 'span' // Add custom formats
  ],
  placeholder: 'Type your content here...',
}

// local mode so component can toggle independently; follow prop.mode if parent changes it
const localMode = ref(props.mode || 'rich')
watch(() => props.mode, (nv) => { if (nv) localMode.value = nv })

// internal value synced with prop.modelValue. Emit update:modelValue when internalValue changes.
const internalValue = ref(props.modelValue)
watch(() => props.modelValue, (nv) => { internalValue.value = nv })
watch(internalValue, (nv) => { emit('update:modelValue', nv) })

function toggleMode() {
  localMode.value = localMode.value === 'rich' ? 'plain' : 'rich'
}
</script>

<style scoped>
.seditor_root { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}

.seditor_actions { 
  text-align: right; 
}

.seditor_toggle_btn { 
  background: #f3f4f6; 
  border: 1px solid #d1d5db; 
  padding: 4px 8px; 
  border-radius: 6px; 
  cursor: pointer; 
  font-size: 12px;
}

.seditor_toggle_btn:hover { 
  background: #e5e7eb; 
}

.seditor_textarea { 
  width: 100%; 
  font-family: inherit; 
  padding: 8px; 
  border: 1px solid #d1d5db; 
  border-radius: 6px; 
  min-height: 120px; 
  resize: vertical; 
}

/* Enhanced Quill Editor Styles */
.seditor_root :deep(.ql-container) {
  min-height: 200px;
  font-size: 14px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.seditor_root :deep(.ql-toolbar) {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  background: #f9fafb;
}

.seditor_root :deep(.ql-editor) {
  min-height: 200px;
}

.seditor_root :deep(.ql-editor.ql-blank::before) {
  font-style: italic;
  color: #9ca3af;
}

/* Support for div and span in editor */
.seditor_root :deep(.ql-editor div) {
  display: block;
}

.seditor_root :deep(.ql-editor span) {
  display: inline;
}
</style>