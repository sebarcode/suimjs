import assert from 'node:assert/strict';
import test from 'node:test';

import { selectedItemsFirst } from './dropdown_selection.mjs';

test('selectedItemsFirst moves selected items to the top in model order', () => {
    const items = [
        { key: 1, label: 'One' },
        { key: 2, label: 'Two' },
        { key: 3, label: 'Three' },
        { key: 4, label: 'Four' },
    ];

    const result = selectedItemsFirst(items, [{ key: 3 }, { key: 1 }]);

    assert.deepEqual(result.map((item) => item.key), [3, 1, 2, 4]);
    assert.deepEqual(items.map((item) => item.key), [1, 2, 3, 4]);
});

test('selectedItemsFirst preserves unselected order and key types', () => {
    const items = [{ key: '2' }, { key: 2 }, { key: 1 }];

    const result = selectedItemsFirst(items, [{ key: 2 }]);

    assert.deepEqual(result.map((item) => item.key), [2, '2', 1]);
});

test('selectedItemsFirst returns a copy when there is no selection', () => {
    const items = [{ key: 1 }, { key: 2 }];
    const result = selectedItemsFirst(items, []);

    assert.deepEqual(result, items);
    assert.notEqual(result, items);
});
