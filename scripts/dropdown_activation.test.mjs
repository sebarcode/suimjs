import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../components/SDropDown.vue', import.meta.url), 'utf8');

test('the full dropdown control opens on click and focus', () => {
    const trigger = source.match(/<div\s+class="sdd_toggle[\s\S]*?>/)?.[0];

    assert.ok(trigger, 'dropdown trigger must exist');
    assert.match(trigger, /role="combobox"/);
    assert.match(trigger, /@click="openDropdown"/);
    assert.match(trigger, /@focus="handleTriggerFocus"/);
    assert.match(trigger, /:aria-expanded="open"/);
});

test('dropdown exposes programmatic focus for SInput and guards disabled controls', () => {
    assert.match(source, /function focus\(\)\s*{[\s\S]*?triggerEl\.value\?\.focus\?\.\(\);[\s\S]*?}/);
    assert.match(source, /if \(props\.disabled \|\| props\.readOnly \|\| open\.value\) return;/);
    assert.match(source, /defineExpose\(\{ options, setSelected, value2, focus }\);/);
});
