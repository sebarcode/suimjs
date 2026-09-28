import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sform = await readFile(new URL('../components/SForm.vue', import.meta.url), 'utf8')
const sinput = await readFile(new URL('../components/SInput.vue', import.meta.url), 'utf8')
const dropdown = await readFile(new URL('../components/SDropDown.vue', import.meta.url), 'utf8')

test('view mode keeps every configured field disabled', () => {
  assert.match(sform, /if \(props\.mode == "view"\) return true;/)
  assert.match(sform, /:view-mode="mode == 'view'"/)
})

test('view mode renders controls and preserves their normal colors', () => {
  assert.match(sinput, /v-if="!readOnly \|\| viewMode"/)
  assert.match(sinput, /const controlDisabled = computed\(\(\) => props\.disabled \|\| \(props\.readOnly && props\.viewMode\)\)/)
  assert.match(sinput, /background-color: var\(--color-bgpopup, #ffffff\) !important;/)
  assert.match(sinput, /-webkit-text-fill-color: var\(--color-input-text, #111827\);/)
  assert.doesNotMatch(sinput, /v-else-if="multiRow > 1 && disabled"/)
})

test('disabled dropdown keeps its control shape and blocks interaction', () => {
  assert.match(dropdown, /'sdd_disabled': disabled/)
  assert.match(dropdown, /if \(props\.disabled\) return;/)
  assert.match(dropdown, /:disabled="disabled" @click\.stop="clearSelection"/)
})
