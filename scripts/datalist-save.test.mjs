import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

const source = await readFile(new URL('../components/DataList.vue', import.meta.url), 'utf8')
const stayOnForm = source.slice(source.indexOf('const stayOnForm ='), source.indexOf('function handleGridResetCustomFilter('))
const saveFunctions = source.slice(source.indexOf('function captureGridState('), source.indexOf('function gridRowUpdated('))

function saveHarness(mode, overrides = {}, failure = null) {
  const record = { _id: 'group-1', Name: 'Updated group' }
  const data = { formMode: mode, controlMode: 'form' }
  const state = { keyword: 'group', currentPage: 3, pageSize: 25, sortField: 'Name', sortDirection: 'desc' }
  const originalState = { ...state }
  const props = { formInsert: '/insert', formUpdate: '/update', ...overrides }
  const calls = { refreshed: [], selected: [], events: [], requests: [], errors: [], succeeded: 0, failed: 0 }
  const pendingTicks = []
  const grid = { refreshData: () => calls.refreshed.push({ ...state }) }
  for (const field of Object.keys(state)) {
    const name = field[0].toUpperCase() + field.slice(1)
    grid[`get${name}`] = () => state[field]
    grid[`set${name}`] = value => { state[field] = value }
  }
  const gridCtl = { value: grid }
  const context = {
    data, props, gridCtl,
    computed: definition => Object.defineProperty({}, 'value', { get: definition.get }),
    axios: { post: async (url, saved) => {
      calls.requests.push({ url, saved })
      if (failure) throw failure
      return { data: record }
    } },
    emit: (name, saved) => calls.events.push({ name, saved }),
    nextTick: callback => pendingTicks.push(callback),
    selectData: (...args) => calls.selected.push(args),
    util: { showInfo() {}, showError: error => calls.errors.push(error) },
  }
  vm.createContext(context)
  vm.runInContext(stayOnForm + saveFunctions, context)
  return {
    calls, data, record, originalState, gridCtl,
    async save() {
      await context.save(record, () => calls.succeeded++, () => calls.failed++)
    },
    flush() {
      // Simulate grid state changing during the render before the refresh.
      for (const field of Object.keys(state)) state[field] = undefined
      pendingTicks.splice(0).forEach(callback => callback())
    },
  }
}

for (const [mode, option] of [
  ['new', 'stayOnFormAfterInsert'],
  ['edit', 'stayOnFormAfterUpdate'],
  ['new', 'stayOnFormAfterSave'],
  ['edit', 'stayOnFormAfterSave'],
  ['new', null],
  ['edit', null],
]) {
  test(`${mode} save refreshes once and preserves grid state with ${option || 'default navigation'}`, async () => {
    const harness = saveHarness(mode, option ? { [option]: true } : {})
    await harness.save()
    assert.equal(harness.calls.requests[0].url, mode === 'new' ? '/insert' : '/update')
    assert.equal(harness.calls.refreshed.length, 0)
    harness.flush()
    assert.deepEqual(harness.calls.refreshed, [harness.originalState])
    assert.equal(harness.data.record, harness.record)
    assert.equal(harness.data.controlMode, option ? 'form' : 'grid')
    assert.deepEqual(harness.calls.selected, option ? [[harness.record, 'detail', true]] : [])
    assert.deepEqual(harness.calls.events.map(event => event.name), ['postSave', 'gridRowUpdated'])
    assert.equal(harness.calls.succeeded, 1)
    assert.equal(harness.calls.failed, 0)
  })
}

test('failed save leaves the form open without refreshing the grid', async () => {
  const error = new Error('Save failed')
  const harness = saveHarness('new', { stayOnFormAfterInsert: true }, error)
  await harness.save()
  harness.flush()
  assert.deepEqual(harness.calls.refreshed, [])
  assert.deepEqual(harness.calls.selected, [])
  assert.deepEqual(harness.calls.events, [])
  assert.deepEqual(harness.calls.errors, [error])
  assert.equal(harness.data.controlMode, 'form')
  assert.equal(harness.calls.failed, 1)
  assert.equal(harness.calls.succeeded, 0)
})

test('grid unmounted before the scheduled refresh does not throw', async () => {
  const harness = saveHarness('edit', { stayOnFormAfterUpdate: true })
  await harness.save()
  harness.gridCtl.value = null
  assert.doesNotThrow(() => harness.flush())
  assert.equal(harness.calls.succeeded, 1)
})
