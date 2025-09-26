<template>
    <div class="sdd_root sdd" ref="root">
        <div class="sdd_row" v-if="!readOnly">
            <div class="sdd_toggle bg-amber-950">
                <div class="text-gray-400 w-full sdd" @click="bodyClick" v-if="!open && !selectedLabel">
                    {{ placeholder }}
                </div>
                <div class="sdd sdd_body" @click="bodyClick">
                    <div v-if="!open && selectedLabel" 
                        class="sdd sdd_selected_label" 
                        @click="clickBody">
                        {{ selectedLabel }}
                    </div>
                    <input v-if="open && searchable" 
                        ref="searchInput" 
                        v-model="search" 
                        @keydown.down.prevent="move(1)" 
                        @keydown.up.prevent="move(-1)" 
                        @keydown.enter.prevent="chooseHighlighted" 
                        @keydown.esc.prevent="close" 
                        @keydown.tab="handleSearchTabNavigation"
                        class="sdd_search_input" 
                        placeholder="Search..."
                        autocomplete="off"
                        autocorrect="off"
                        autosave="off"
                        />
                </div>
                <a 
                    href="#" 
                    class="sdd sdd_actions" 
                    @click="bodyClick"
                >
                    <button v-if="clearable && hasSelection" @click.stop="clearSelection" class="sdd_clear_btn" title="Clear selection">✕</button>
                    <svg class="sdd_chev" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.12 1.0l-4.25 4.653a.75.75 0 01-1.07 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                </a>
            </div>
        </div>

        <!-- read-only state -->
        <div v-else>
            <slot name="viewonly" :selected="selected" :items="data.items">
                <div class="sdd_selected" v-if="selected?.length !== 0">
                    <div class="sdd_selected_label">{{ selectedLabel }}</div>
                </div>
                <div v-else class="sdd_viewonly_noresult">
                    No selection
                </div>
            </slot>
        </div>

        <transition name="fade">
            <div v-if="open" class="sdd_dropdown">
                <ul class="sdd_list">
                    <li v-if="filtered.length === 0" class="sdd_noresult">
                        <div class="flex items-center justify-between gap-2">
                            <div class="text-gray-500">No results</div>
                            <button
                                v-if="allowAdd"
                                :disabled="(search || '').toString().trim().length < minimalKeywordLength"
                                @click.stop="addNewItem"
                                class="ssd_add_btn"
                                title="Add new item">
                                Add
                            </button>
                        </div>
                    </li>
                    <li v-for="(it, idx) in filtered" 
                        :key="it._uid" 
                        :class="['sdd_item', highlighted === idx ? 'sdd_highlighted' : '']" 
                        :tabindex="0"
                        @click="select(it)" 
                        @mousemove="highlight(idx)"
                        @keydown="handleItemKeydown($event, it, idx)"
                        @focus="highlight(idx)">
                        <div class="sdd_item_row" v-if="multiple">
                            <slot name="item" :item="it" :isSelected="isSelected(it)">
                                <input type="checkbox" v-if="multiple" :checked="isSelected(it)" />
                                <div class="sdd_item_label grow">{{ it.label }}</div>
                            </slot>
                        </div>
                        <div class="sdd_item_row" v-else>
                            <slot name="item" :item="it" :isSelected="isSelected(it)">
                                <div class="sdd_item_label grow">{{ it.label }}</div>
                                <div v-if="isSelected(it)" class="sdd_item_selected">Selected</div>
                            </slot>
                        </div>
                    </li>
                </ul>
            </div>
        </transition>

        <div class="flex flex-col gap-3" v-if="lookupUrl && !multiple && false">
            <div>selected: {{ selected }}</div>
            <div>filtered: {{ filtered }}</div>
            <div>data.items: {{ data.items }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, computed, inject, nextTick } from 'vue';

const props = defineProps({
    modelValue: { type: [Array, String, Object, Number, null], default: null },
    items: { type: Array, default: () => ([]) },
    itemKey: { type: String, default: 'key' },
    itemLabel: { type: String, default: 'value' },
    placeholder: { type: String, default: 'Select an option' },
    searchable: { type: Boolean, default: true },
    clearable: { type: Boolean, default: true },
    multiple: { type: Boolean, default: false },
    minimalKeywordLength: { type: Number, default: 0 },
    readOnly: { type: Boolean, default: false },
    allowAdd: { type: Boolean, default: false },
    searchFn: { type: Function, default: null },
    lookupUrl: { type: String, default: "" },
    lookupKey: { type: String, default: "" },
    lookupLabels: { type: Array, default: () => [] },
    lookupSearchs: { type: Array, default: () => [] },
    lookupPayloadBuilder: { type: Function },
});

const emit = defineEmits(['update:modelValue', 'change', 'item-added']);

const axios = inject('axios');
const root = ref(null);
const searchInput = ref(null);
const open = ref(false);
const search = ref('');
const highlighted = ref(-1);

const data = reactive({
    items: [],
    searchFn: props.searchFn,
});

// map incoming items to normalized objects while keeping original
function normalizeList(list){
    const out = [];
    const keyField =  props.lookupUrl ? props.lookupKey || 'key' : props.itemKey;
    const labelField = props.lookupUrl ? 
        (props.lookupLabels && props.lookupLabels.length > 0 ? props.lookupLabels[0] : 'label') : 
        props.itemLabel;
    for (let i=0;i<list.length;i++){
        const el = list[i];
        if (typeof el === 'string' || typeof el === 'number'){
            out.push({ _uid: `i_${i}`, key: el, label: String(el), original: el });
        } else if (el && typeof el === 'object'){
            out.push({ 
                _uid: `i_${i}`, 
                key: el[keyField] ?? el.key ?? i, 
                label: el[labelField] ?? el.label ?? String(el[keyField] ?? el.key ?? i), 
                original: el,
                keyField, 
                labelField
            });
        }
    }
    return out;
}

watch(() => props.items, (nv) => {
    data.items = normalizeList(nv || []);
    // reset highlight
    highlighted.value = -1;
}, { immediate: true });

const selected = ref(props.multiple ? [] : null);

async function fetchSelected(values) {
    if (!props.lookupUrl) return;
    if (values==undefined || values=== null || values.length==0) return;
    const payload = props.multiple ? 
        { Where: { Op: '$in', Field: props.lookupKey, Value: values } } :
        { Where: { Field: props.lookupKey, Op: '$eq', Value: [values] } };

    try {
        const resp = await axios.post(props.lookupUrl, payload);
        if (resp.data) {
            selected.value = props.multiple ? normalizeList(resp.data) : normalizeList(resp.data)[0] || null;
        }
    } catch(error) {
        console.error('SDropDown: fetchSelected error', error);
    }
} 

const selectedLabel = computed(() => {
    if (props.multiple) {
        if (!selected.value || selected.value.length === 0) return '';
        return selected.value.map(s => s.label).join('; ');
    }
    return selected.value ? selected.value.label : '';
});

const hasSelection = computed(() => {
    if (props.multiple) return selected.value && selected.value.length > 0;
    return !!selected.value;
});

function toggle(){
    open.value = !open.value;
    if (open.value) {
        // focus search input on next tick
        nextTick(() => {
            if (searchInput.value) searchInput.value.focus();
        });
    }
}

function bodyClick(ev){
    // If dropdown already open, let input handle interactions.
    if (open.value) return;
    toggle();
}

function close(){
    open.value = false;
    search.value = '';
    highlighted.value = -1;
}

function select(it){
    if (props.multiple) {
        // toggle membership
        const idx = selected.value.findIndex(s => s._uid === it._uid || s.key === it.key);
        if (idx >= 0) selected.value.splice(idx, 1);
        else selected.value.push(it);
        // emit array of keys
        emit('update:modelValue', selected.value.map(s => s.key));
        emit('change', selected.value.map(s => s.key));
        return;
    }

    selected.value = it;
    // emit the key for single-select
    emit('update:modelValue', it.key);
    emit('change', it.key);
    close();
}

function clearSelection(){
    if (data.lookupUrl && data.searchFn && typeof data.searchFn === 'function') 
        filtered.value = [];

    if (props.multiple) {
        selected.value = [];
        emit('update:modelValue', []);
        emit('change', []);
        return;
    }

    selected.value = null;
    emit('update:modelValue', null);
    emit('change', null);
}

/**
 * Create a new item from the current search text (or given value), append to list and emit 'item-added'.
 * Returns the created normalized item.
 */
function addNewItem(){
    const v = search.value.trim();
    if (!v || v.length < (props.minimalKeywordLength || 0)) return null;
    const uid = `new_${Date.now()}`;
    const key = v;
    const label = v;
    const newItem = { _uid: uid, key, label, isNew:true, desc: '', original: v };

    // emit event for listeners
    emit('item-added', newItem);

    // add to master list
    data.items.push(newItem);
    
    // select the new item (respect multiple mode)
    if (props.multiple) {
        selected.value.push(newItem);
        emit('update:modelValue', selected.value.map(s => s.key));
        emit('change', selected.value.map(s => s.key));
    } else {
        selected.value = newItem;
        emit('update:modelValue', newItem.key);
        emit('change', newItem.key);
        close();
    }

    // clear search and return created item
    search.value = '';
    return newItem;
}

function isSelected(it){
    if (props.multiple) {
        return !!selected.value.find(s => s.key === it.key);
    }
    if (!selected.value) return false;
    return selected.value.key === it.key;
}

function highlight(idx){ highlighted.value = idx; }

function move(dir){
    if (!data.items.length) return;
    const list = filtered.value;
    if (!list.length) return;
    if (highlighted.value === -1) highlighted.value = 0;
    else highlighted.value = Math.max(0, Math.min(list.length - 1, highlighted.value + dir));
}

function chooseHighlighted(){
    const list = filtered.value;
    if (highlighted.value >=0 && highlighted.value < list.length){ select(list[highlighted.value]); }
}

function handleSearchTabNavigation(event) {
    if (!event.shiftKey && filtered.value.length > 0) {
        // Tab forward - move focus to first dropdown item
        event.preventDefault();
        const firstItem = root.value.querySelector('.sdd_item[tabindex="0"]');
        if (firstItem) {
            firstItem.focus();
            highlight(0);
        }
    }
    // If Shift+Tab, let it bubble up to move focus to previous element outside dropdown
}

function handleItemKeydown(event, item, index) {
    switch (event.key) {
        case 'Enter':
        case ' ':
            event.preventDefault();
            select(item);
            break;
        case 'ArrowDown':
            event.preventDefault();
            moveToNextItem(index);
            break;
        case 'ArrowUp':
            event.preventDefault();
            moveToPrevItem(index);
            break;
        case 'Tab':
            if (event.shiftKey) {
                // Shift+Tab - move focus back to search input or previous element
                if (index === 0 && searchInput.value) {
                    event.preventDefault();
                    searchInput.value.focus();
                } else if (index > 0) {
                    event.preventDefault();
                    const prevItem = root.value.querySelectorAll('.sdd_item[tabindex="0"]')[index - 1];
                    if (prevItem) {
                        prevItem.focus();
                        highlight(index - 1);
                    }
                }
            } else {
                // Tab forward - move to next item or let it bubble to next element outside dropdown
                if (index < filtered.value.length - 1) {
                    event.preventDefault();
                    const nextItem = root.value.querySelectorAll('.sdd_item[tabindex="0"]')[index + 1];
                    if (nextItem) {
                        nextItem.focus();
                        highlight(index + 1);
                    }
                }
                // If last item, let tab move to next focusable element outside dropdown
            }
            break;
        case 'Escape':
            event.preventDefault();
            close();
            break;
    }
}

function moveToNextItem(currentIndex) {
    const nextIndex = Math.min(filtered.value.length - 1, currentIndex + 1);
    const nextItem = root.value.querySelectorAll('.sdd_item[tabindex="0"]')[nextIndex];
    if (nextItem) {
        nextItem.focus();
        highlight(nextIndex);
    }
}

function moveToPrevItem(currentIndex) {
    if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        const prevItem = root.value.querySelectorAll('.sdd_item[tabindex="0"]')[prevIndex];
        if (prevItem) {
            prevItem.focus();
            highlight(prevIndex);
        }
    } else if (searchInput.value) {
        // If at first item, move back to search input
        searchInput.value.focus();
        highlight(-1);
    }
}

function onClickOutside(e){
    if (!e.target.closest('.sdd')) {  
        close();
    }
}

function options() {
    return data.items;
}

function setSelected(keys) {
    if (props.multiple) {
        if (!Array.isArray(keys)) return;
        selected.value = [];
        for (const k of keys) {
            const found = data.items.find(it => it.key === k);
            if (found) selected.value.push(found);
            else selected.value.push({ _uid: `x_${selected.value.length}`, key: k, label: String(k), original: k });
        }
        emit('update:modelValue', selected.value.map(s => s.key));
        emit('change', selected.value.map(s => s.key));
        return;
    }

    // single-select behavior: keys is expected to be a single key
    const k = keys;
    selected.value = null;
    if (k == null) {
        emit('update:modelValue', null);
        emit('change', null);
        return;
    }
    for (const it of data.items){
        if (it.key === k) { 
            selected.value = it; 
            emit('update:modelValue', it.key);
            emit('change', it.key);
            return;
        }
    }
    // not found, set to null
    emit('update:modelValue', null);
    emit('change', null);
}

defineExpose({ options, setSelected });

onMounted(()=>{ document.addEventListener('click', onClickOutside); });
onBeforeUnmount(()=>{ document.removeEventListener('click', onClickOutside); });

const filtered = ref([]);

function joinWithSelected(normalizedResult) {
    if (props.multiple) {
        for (const si of selected.value) {
            if (!normalizedResult.find(it => it.key === si.key)) {
                normalizedResult.push(si);
            }
        }
    } else {
        if (selected.value && !normalizedResult.find(it => it.key === selected.value.key)) {
            normalizedResult.push({ _uid: `x_${Date.now()}`, 
                key: selected.value.key, 
                label: String(selected.value.key), 
                original: selected.value.key });
        }
    }
    return normalizedResult;
}

function manageLookup() {
    if (!props.lookupUrl) return;
    if (!axios) {
        console.warn('SDropDown: axios instance not found in context, cannot perform lookup');
        return;
    }

    if(props.searchFn && typeof props.searchFn === 'function') {
        // if custom search function is provided, do not perform lookup
        return;
    }

    data.searchFn = async (q) => {
        if (q.length < (props.minimalKeywordLength || 0)) return [];
        try {
            const payload = {};
            if (props.lookupPayloadBuilder && typeof props.lookupPayloadBuilder === 'function') {
                Object.assign(payload, props.lookupPayloadBuilder(q));
            } else {
                payload.Take = props.maxResultCount || 100;
                const trimmedQ = q.trim();
                if (trimmedQ && trimmedQ.length > 0 && props.lookupSearchs && props.lookupSearchs.length > 0) {
                    if (props.lookupSearchs.length === 1) {
                        payload.Where = { Field: props.lookupSearchs[0], Op: '$contains', Value: [trimmedQ] };
                    } else {
                        payload.Where = { Op: '$or', Items: props.lookupSearchs.map(fld => ({ Field: fld, Op: '$contains', Value: [trimmedQ] })) };
                    }

                }
            }
            const response = await axios.post(props.lookupUrl, payload);
            if (response && response.data && Array.isArray(response.data)) {
                /*
                return response.data.map(item => {
                    return item;
                });
                */
               return response.data;
            }
            return [];
        } catch (error) {
            console.error('SDropDown: lookup error', error);
            return [];
        }
    };
} 

async function fetchItems(nv) {
    manageLookup();

    // transform search value, trim and lowercase for comparison and if it is using api then do not transform as it can be anything
    // use ' ' (space) as search term to trigger api call without filtering
    const q = props.lookupUrl ? (nv || '') : (nv || '').toString().toLowerCase().trim();
    if (data.searchFn && typeof data.searchFn === 'function' && q.length >= props.minimalKeywordLength) {
        // use custom search function
        const result = await data.searchFn(q);
        if (result && Array.isArray(result)) {
            filtered.value = joinWithSelected(normalizeList(result));
            //filtered.value = normalizeList(result);
        } else if (result && typeof result.then === 'function') {
            // promise
            result.then(res => {
                if (res && Array.isArray(res)) {
                    filtered.value = joinWithSelected(normalizeList(res));
                    //filtered.value = normalizeList(result);
                } else {
                    filtered.value = [];
                }
            }).catch(() => { filtered.value = []; });
        } else {
            filtered.value = [];
        }
        //console.log('custom search function used, filtered:', filtered.value);
        return;
    }

    // default filtering
    if (!q) {
        filtered.value = data.items;
        return;
    }
    filtered.value = data.items.filter(it => 
        (it.label || '')
        .toString().toLowerCase()
        .includes(q)
    );
}

watch(() => search.value, (nv) => {
    fetchItems(nv);
}, { immediate: true });


// when modelValue changes, sync the internal selected representation
watch(() => props.modelValue, async (nv) => {
    await fetchSelected(nv);

    if (props.multiple) {
        const newSelected = [];
        if (!nv || !Array.isArray(nv)) return;
        for (const v of nv) {
            // v is expected to be item.key
            let found = data.items.find(it => it.key === v);
            if (found) newSelected.push(found);

            // not found in items, check if already in selected (possible if items changed)
            if (!found) {
               found = selected.value.find(it => it.key === v);
               if (found) newSelected.push(found);
            }

            if (!found) newSelected.push({ _uid: `x_${newSelected.length}`, key: v, label: String(v), original: v });
        }
        selected.value = newSelected;
        return;
    }

    // single-select behavior: nv is expected to be a key
    // selected.value = null;
    if (nv == null) return;
    for (const it of data.items){
        if (it.key === nv) { selected.value = it; break; }
    }
}, { immediate: true });

</script>

<style>
</style>