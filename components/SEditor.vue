<template>
  <div class="seditor_root">
    <div class="seditor_actions" v-if="showToggle">
      <button type="button" class="seditor_toggle_btn" @click="toggleMode">
        {{ localMode === 'rich' ? 'Switch to plain text' : 'Switch to rich text' }}
      </button>
    </div>

    <QuillEditor v-if="localMode === 'rich'" v-model:content="internalValue" content-type="html" />

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
import { QuillEditor } from '@vueup/vue-quill'

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
.seditor_root { display: flex; flex-direction: column; gap: 8px; }
.seditor_actions { text-align: right; }
.seditor_toggle_btn { background: #f3f4f6; border: 1px solid #d1d5db; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
.seditor_toggle_btn:hover { background: #e5e7eb; }
.seditor_textarea { width: 100%; font-family: inherit; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; min-height: 120px; resize: vertical; }
</style>