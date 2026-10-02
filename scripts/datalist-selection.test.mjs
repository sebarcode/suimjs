import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

const source = await readFile(new URL('../components/DataList.vue', import.meta.url), 'utf8')
const gridSelection = source.match(/<s-grid\s[\s\S]*?@select-data="([^"]+)"/)[1]
const selectionFunction = source.slice(source.indexOf('function selectData('), source.indexOf('function readFormRecord('))

function selectionHarness(defaultMode) {
  const record = { _id: 'job-1', Status: 'Running' }
  const data = { formMode: defaultMode, formCfg: {} }
  const context = {
    data,
    props: { formRead: '/lexa/ai-job/get', idFieldName: '_id', formDefaultMode: defaultMode },
    axios: { post: async (url, ids) => {
      assert.equal(url, '/lexa/ai-job/get')
      assert.deepEqual(Array.from(ids), ['job-1'])
      return { data: record }
    } },
    emit() {},
    nextTick: callback => callback(),
    refreshForm: () => { data.loadedConfigMode = data.formMode },
    util: { showError: error => { throw error } },
  }
  vm.createContext(context)
  vm.runInContext(selectionFunction, context)
  const selectFromGrid = vm.runInContext(gridSelection, context)
  return { data, record, selectFromGrid, selectData: context.selectData }
}

test('grid double-click opens a view-only job with the view configuration', async () => {
  const { data, record, selectFromGrid } = selectionHarness('view')
  selectFromGrid(record, 0, true)
  await Promise.resolve()
  assert.equal(data.formMode, 'view')
  assert.equal(data.loadedConfigMode, 'view')
  assert.equal(data.isAfterSave, false)
  assert.equal(data.controlMode, 'form')
  assert.equal(data.record, record)
})

test('detail click uses the configured default form mode', async () => {
  for (const mode of ['view', 'edit']) {
    const { data, record, selectFromGrid } = selectionHarness(mode)
    selectFromGrid(record, 0, false)
    await Promise.resolve()
    assert.equal(data.formMode, mode)
    assert.equal(data.isAfterSave, false)
  }
})

test('explicit reopening after a save still uses edit mode', async () => {
  const { data, record, selectData } = selectionHarness('view')
  selectData(record, 'detail', true)
  await Promise.resolve()
  assert.equal(data.formMode, 'edit')
  assert.equal(data.isAfterSave, true)
})
