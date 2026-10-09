import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { ref, reactive, computed, watch, nextTick, effectScope } from 'vue';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { createLookupPager } from './lookup_pagination.mjs';
import { buildLookupRequest } from './lookup_request.mjs';
import { selectedItemsFirst } from './dropdown_selection.mjs';

const source = await readFile(new URL('../components/SDropDown.vue', import.meta.url), 'utf8');
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm, '');
const rows = (count, start = 0) => Array.from({ length: count }, (_, i) => ({ id: start + i, name: `Device ${start + i}` }));
const deferred = () => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
};
const flush = async () => {
    await new Promise(resolve => setImmediate(resolve));
    await nextTick();
};
const plain = value => JSON.parse(JSON.stringify(value));

function harness(t, fetchPage, overrides = {}) {
    const calls = [];
    const scope = effectScope();
    const cleanup = [];
    let props;
    const context = vm.createContext({
        ref, reactive, computed, watch, nextTick,
        createLookupPager, buildLookupRequest, selectedItemsFirst,
        getCachedLookup: (_url, _payload, fetcher) => fetcher(),
        inject: () => ({ post: async (url, payload) => {
            calls.push({ url, payload: plain(payload) });
            return { data: await fetchPage(payload, url) };
        } }),
        defineProps: definitions => {
            props = reactive(Object.fromEntries(Object.entries(definitions).map(([key, def]) => [
                key, typeof def.default === 'function' && def.type !== Function ? def.default() : def.default,
            ])));
            Object.assign(props, { lookupUrl: '/device/find', lookupKey: 'id', lookupLabels: ['name'], ...overrides });
            return props;
        },
        defineEmits: () => () => {},
        defineExpose: () => {},
        onMounted: () => {},
        onBeforeUnmount: fn => cleanup.push(fn),
        document: { querySelector: () => null, removeEventListener() {} },
        console,
    });
    scope.run(() => vm.runInContext(script, context));
    const get = expression => vm.runInContext(expression, context);
    const state = get('lookupState');
    const filtered = get('filtered');
    const scroll = { scrollTop: 0, clientHeight: 240, scrollHeight: 2400 };
    get('dropdownEl').value = scroll;
    t.after(() => { cleanup.forEach(fn => fn()); scope.stop(); });
    return {
        calls, state, filtered, props, scroll, get,
        async open() { get('open').value = true; await flush(); },
        async search(value) { get('search').value = value; await flush(); },
        async bottom() {
            scroll.scrollTop = scroll.scrollHeight - scroll.clientHeight;
            context.handleLookupScroll({ currentTarget: scroll });
            await flush();
        },
    };
}

test('dropdown script and template compile with the scroll listener', () => {
    const { descriptor, errors } = parse(source);
    assert.deepEqual(errors, []);
    const compiled = compileScript(descriptor, { id: 'dropdown' });
    const template = compileTemplate({
        id: 'dropdown', source: descriptor.template.content,
        compilerOptions: { bindingMetadata: compiled.bindings },
    });
    assert.deepEqual(template.errors, []);
    assert.match(template.code, /onScrollPassive:.*handleLookupScroll/);
});

test('scroll appends pages of 100 until the API returns no data and keeps position', async t => {
    const devices = rows(250);
    const h = harness(t, payload => devices.slice(payload.Skip, payload.Skip + payload.Take));
    await h.open();
    assert.equal(h.filtered.value.length, 100);
    const firstUid = h.filtered.value[0]._uid;
    h.scroll.scrollTop = 50;
    h.get('handleLookupScroll')({ currentTarget: h.scroll });
    await flush();
    assert.equal(h.calls.length, 1);
    await h.bottom();
    assert.equal(h.filtered.value.length, 200);
    assert.equal(h.scroll.scrollTop, 2160);
    assert.equal(h.filtered.value[0]._uid, firstUid);
    await h.bottom();
    assert.equal(h.filtered.value.length, 250);
    await h.bottom();
    await h.bottom();
    assert.deepEqual(h.calls.map(call => call.payload.Skip), [0, 100, 200, 250]);
    assert.ok(h.calls.every(call => call.payload.Take === 100));
    assert.equal(h.state.hasMore, false);
    assert.equal(new Set(h.filtered.value.map(item => item._uid)).size, 250);
});

test('multiple bottom scroll events share one in-flight page request', async t => {
    const page = deferred();
    const h = harness(t, payload => payload.Skip === 0 ? rows(100) : page.promise);
    await h.open();
    await h.bottom();
    await h.bottom();
    assert.equal(h.calls.length, 2);
    assert.equal(h.state.loading, true);
    page.resolve(rows(100, 100));
    await flush();
    assert.equal(h.filtered.value.length, 200);
    assert.equal(h.state.loading, false);
});

test('changing search resets Skip and ignores a late page from the previous search', async t => {
    const page = deferred();
    const h = harness(t, payload => payload.Where ? rows(1, 900) : payload.Skip ? page.promise : rows(100), {
        lookupSearchs: ['name'],
    });
    await h.open();
    await h.bottom();
    await h.search('new');
    assert.equal(h.scroll.scrollTop, 0);
    assert.equal(h.calls.at(-1).payload.Skip, 0);
    assert.deepEqual(h.calls.at(-1).payload.Where, { Field: 'name', Op: '$contains', Value: ['new'] });
    page.resolve(rows(100, 100));
    await flush();
    assert.deepEqual(plain(h.filtered.value.map(item => item.key)), [900]);
});

test('a late initial response cannot replace newer search results', async t => {
    const old = deferred();
    const h = harness(t, payload => payload.Where ? rows(1, 300) : old.promise, { lookupSearchs: ['name'] });
    await h.open();
    await h.search('other');
    old.resolve(rows(100));
    await flush();
    assert.deepEqual(plain(h.filtered.value.map(item => item.key)), [300]);
    assert.equal(h.state.loading, false);
});

test('failed pages retain options and retry the same Skip', async t => {
    let fail = true;
    const h = harness(t, payload => {
        if (payload.Skip && fail) throw new Error('offline');
        return rows(100, payload.Skip);
    });
    await h.open();
    await h.bottom();
    assert.equal(h.filtered.value.length, 100);
    assert.equal(h.state.error.message, 'offline');
    // Automatic scrolling does not repeatedly retry a failing endpoint.
    await h.bottom();
    assert.equal(h.calls.length, 2);
    fail = false;
    await h.get('loadMoreItems')();
    assert.deepEqual(h.calls.map(call => call.payload.Skip), [0, 100, 100]);
    assert.equal(h.filtered.value.length, 200);
    assert.equal(h.state.error, null);
});

test('custom payload filters and URL sort persist across pages without mutating the builder', async t => {
    const payload = { Take: 2, Skip: 4, Where: { Field: 'active', Op: '$eq', Value: [true] }, Sort: ['-name'] };
    const original = plain(payload);
    const h = harness(t, request => rows(2, request.Skip), {
        lookupUrl: '/device/find?sortby=name', lookupPayloadBuilder: () => payload,
    });
    await h.open();
    await h.bottom();
    assert.deepEqual(h.calls.map(call => call.payload.Skip), [4, 6]);
    for (const call of h.calls) {
        assert.equal(call.url, '/device/find');
        assert.equal(call.payload.Take, 2);
        assert.deepEqual(call.payload.Sort, ['name', 'id']);
        assert.deepEqual(call.payload.Where, payload.Where);
    }
    assert.deepEqual(payload, original);
});

test('selected options do not inflate Skip and selections use keys across pages', async t => {
    const h = harness(t, payload => rows(100, payload.Skip), { multiple: true });
    h.get('selected').value = [{ _uid: 'i_0', key: 999, label: 'Selected device' }];
    await h.open();
    assert.equal(h.filtered.value.length, 101);
    await h.bottom();
    assert.equal(h.calls.at(-1).payload.Skip, 100);
    assert.equal(h.filtered.value.length, 201);
    h.get('select')(h.filtered.value[100], false);
    assert.deepEqual(plain(h.get('selected').value.map(item => item.key)), [999, 100]);
    assert.equal(h.get('displayedItems').value[0].key, 999);
    assert.equal(h.get('displayedItems').value[1].key, 100);
});

test('duplicate-only pages stop an endpoint that ignores Skip', async t => {
    const h = harness(t, () => rows(100));
    await h.open();
    await h.bottom();
    await h.bottom();
    assert.equal(h.filtered.value.length, 100);
    assert.equal(h.calls.length, 2);
    assert.equal(h.state.hasMore, false);
});

test('Take zero remains a one-request lookup and local/custom searches do not paginate', async t => {
    const h = harness(t, () => rows(5), { lookupPayloadBuilder: () => ({ Take: 0 }) });
    await h.open();
    await h.bottom();
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].payload.Take, 0);
    const local = harness(t, () => { throw Error('should not call API'); }, {
        lookupUrl: '', items: [{ key: 1, text: 'Local' }],
    });
    await local.open();
    await local.bottom();
    assert.equal(local.filtered.value[0].label, 'Local');
    assert.equal(local.calls.length, 0);
    const custom = harness(t, () => { throw Error('should not call API'); }, { searchFn: () => rows(1) });
    await custom.open();
    await custom.bottom();
    assert.equal(custom.filtered.value.length, 1);
    assert.equal(custom.calls.length, 0);
});

test('closing the dropdown invalidates a pending request', async t => {
    const response = deferred();
    const h = harness(t, () => response.promise);
    await h.open();
    h.get('close')();
    await flush();
    response.resolve(rows(100));
    await flush();
    assert.equal(h.filtered.value.length, 0);
    assert.equal(h.state.loading, false);
    assert.equal(h.state.hasMore, false);
});
