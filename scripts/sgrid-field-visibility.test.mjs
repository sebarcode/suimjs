import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { computed, reactive, ref } from 'vue';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

const source = await readFile(new URL('../components/SGrid.vue', import.meta.url), 'utf8');

function visibilityHarness() {
  const fields = [
    { field: 'name', label: 'Name', readType: 'show' },
    { field: 'qty', label: 'Quantity', readType: 'show' },
    { field: 'internal', label: 'Internal', readType: 'hide' },
  ];
  const props = reactive({ config: { fields }, hideSelect: false, hideAction: false });
  const context = vm.createContext({ props, computed, ref });
  const state = source.slice(source.indexOf('const hiddenFields ='), source.indexOf('function closeFieldMenu('));
  const columnCount = source.slice(source.indexOf('const gridColumnCount ='), source.indexOf('const selectColumnStyle ='));
  vm.runInContext(state + columnCount + '\nglobalThis.api = { hiddenFields, selectableFields, visibleFields, setFieldVisible, gridColumnCount, showFieldButton };', context);
  return { props, ...context.api };
}

test('all configured display fields start visible and configured hidden fields stay excluded', () => {
  const grid = visibilityHarness();
  assert.deepEqual(Array.from(grid.visibleFields.value, field => field.field), ['name', 'qty']);
  assert.equal(grid.hiddenFields.value.size, 0);
  grid.setFieldVisible('internal', true);
  assert.deepEqual(Array.from(grid.selectableFields.value, field => field.field), ['name', 'qty']);
});

test('field button defaults to hidden below five eligible data columns and honors explicit overrides', () => {
  const grid = visibilityHarness();
  for (const count of [0, 4, 5, 6]) {
    grid.props.config.fields = Array.from({ length: count }, (_, index) => ({ field: `field${index}`, readType: 'show' }));
    grid.props.config.fields.push({ field: 'internal', readType: 'hide' });
    assert.equal(grid.showFieldButton.value, count >= 5);
    grid.props.hideShowFieldButton = false;
    assert.equal(grid.showFieldButton.value, true);
    grid.props.hideShowFieldButton = true;
    assert.equal(grid.showFieldButton.value, false);
    grid.props.hideShowFieldButton = undefined;
  }
});

test('hiding data columns does not hide the field button needed to restore them', () => {
  const grid = visibilityHarness();
  grid.props.config.fields = Array.from({ length: 5 }, (_, index) => ({ field: `field${index}`, readType: 'show' }));
  for (const field of grid.props.config.fields) grid.setFieldVisible(field.field, false);
  assert.equal(grid.visibleFields.value.length, 0);
  assert.equal(grid.showFieldButton.value, true);
});

test('toggling fields updates column count without changing shared configuration', () => {
  const grid = visibilityHarness();
  const original = JSON.stringify(grid.props.config);
  const otherGrid = visibilityHarness();
  otherGrid.props.config = grid.props.config;

  grid.setFieldVisible('name', false);
  assert.deepEqual(Array.from(grid.visibleFields.value, field => field.field), ['qty']);
  assert.equal(grid.gridColumnCount.value, 3);
  assert.equal(otherGrid.visibleFields.value.length, 2);
  assert.equal(JSON.stringify(grid.props.config), original);

  grid.setFieldVisible('qty', false);
  assert.equal(grid.visibleFields.value.length, 0);
  assert.equal(grid.gridColumnCount.value, 2);
  grid.props.hideSelect = true;
  assert.equal(grid.gridColumnCount.value, 1);

  grid.setFieldVisible('name', true);
  grid.setFieldVisible('qty', true);
  assert.deepEqual(Array.from(grid.visibleFields.value, field => field.field), ['name', 'qty']);
});

test('refreshed configuration preserves choices while new fields start visible', () => {
  const grid = visibilityHarness();
  grid.setFieldVisible('name', false);
  grid.props.config = { fields: [
    { field: 'name', readType: 'show' },
    { field: 'status', readType: 'show' },
    { field: 'private', readType: 'hide' },
  ] };
  assert.deepEqual(Array.from(grid.visibleFields.value, field => field.field), ['status']);
});

test('grid and DataList compile with the field menu and its visibility prop', async () => {
  for (const [filename, content] of [
    ['SGrid.vue', source],
    ['DataList.vue', await readFile(new URL('../components/DataList.vue', import.meta.url), 'utf8')],
  ]) {
    const { descriptor } = parse(content, { filename });
    const script = compileScript(descriptor, { id: filename });
    const template = compileTemplate({
      source: descriptor.template.content,
      filename,
      id: filename,
      compilerOptions: { bindingMetadata: script.bindings },
    });
    assert.deepEqual(template.errors, []);
    assert.equal(script.bindings.hideShowFieldButton, 'props');
  }
});
