<template>
    <div class="sdd_root sdd" :class="{ 'sdd_disabled': disabled }" :aria-disabled="disabled" ref="root">
        <div class="sdd_row" v-if="!readOnly">
            <div
                class="sdd_toggle bg-amber-950"
                ref="triggerEl"
                role="combobox"
                :tabindex="disabled ? -1 : 0"
                :aria-disabled="disabled"
                :aria-expanded="open"
                @click="openDropdown"
                @focus="handleTriggerFocus"
                @keydown.down.prevent.self="openDropdown"
                @keydown.enter.prevent.self="openDropdown"
                @keydown.space.prevent.self="openDropdown"
            >
                <div class="text-gray-400 w-full sdd" v-if="!open && !selectedLabel && !hidePlaceholder">
                    {{ placeholder }}
                </div>
                <div class="sdd sdd_body">
                    <div v-if="!open && selectedLabel" 
                        class="sdd sdd_selected_label">
                        {{ selectedLabel }}
                    </div>
                    <input v-if="open && searchable" 
                        ref="searchInput" 
                        v-model="search" 
                        @keydown.down.prevent="handleSearchArrowDown" 
                        @keydown.up.prevent="handleSearchArrowUp" 
                        @keydown.enter.prevent="handleSearchEnter" 
                        @keydown.esc.prevent="close" 
                        @keydown.tab="handleSearchTabNavigation"
                        class="sdd_search_input" 
                        placeholder="Search..."
                        autocomplete="off"
                        autocorrect="off"
                        autosave="off"
                    />   
                </div>
                <div
                    class="sdd sdd_actions"
                >
                    <button v-if="showClearButton" :disabled="disabled" @click.stop="clearSelection" class="sdd_clear_btn" title="Clear selection" type="button">✕</button>
                    <button v-if="showInsertButton" :disabled="disabled" @pointerdown.stop @click.stop="requestInsert" class="sdd_insert_btn" title="Add new item" type="button"><mdicon name="plus" size="16" /></button>
                    <svg class="sdd_chev" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.12 1.0l-4.25 4.653a.75.75 0 01-1.07 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                </div>
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

        <teleport to="body">
            <transition name="fade">
                <div v-if="open" ref="dropdownEl" class="sdd_dropdown sdd" :style="dropdownStyle" @scroll.passive="handleLookupScroll" @keydown="handleDropdownKeydown">
                    <div v-if="showMultiClearButton" class="sdd_multi_clear">
                        <span>{{ selected.length }} selected</span>
                        <button
                            type="button"
                            class="sdd_multi_clear_btn"
                            title="Clear all selections"
                            aria-label="Clear all selections"
                            @click.stop="clearAllSelections"
                            @keydown.enter.stop
                            @keydown.space.stop>
                            <mdicon name="close" size="16" />
                        </button>
                    </div>
                    <ul class="sdd_list">
                        <li v-if="displayedItems.length === 0 && !lookupState.loading && !lookupState.error" class="sdd_noresult">
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
                    <li v-for="(it, idx) in displayedItems"
                        :key="it._uid"
                        :class="['sdd_item', highlighted === idx ? 'sdd_highlighted' : '']"
                        :tabindex="0"
                        @click="select(it, !multiple, true)"
                        @dblclick="select(it, true, true)"
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
                                    <div v-if="isSelected(it)" class="sdd_item_selected" hidden>Selected</div>
                                </slot>
                            </div>
                        </li>
                        <li v-if="lookupState.loading" class="sdd_lookup_status" role="status">Loading...</li>
                        <li v-else-if="lookupState.error" class="sdd_lookup_status" role="status">
                            Unable to load options.
                            <button type="button" @click.stop="loadMoreItems">Retry</button>
                        </li>
                    </ul>
                </div>
            </transition>
        </teleport>

        <div class="flex flex-col gap-3" v-if="lookupUrl && !multiple && false">
            <div>selected: {{ selected }}</div>
            <div>filtered: {{ filtered }}</div>
            <div>data.items: {{ data.items }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, computed, inject, nextTick } from 'vue';
import { getCachedLookup } from '../scripts/lookup_cache';
import { buildLookupRequest } from '../scripts/lookup_request.mjs';
import { selectedItemsFirst } from '../scripts/dropdown_selection.mjs';
import { createLookupPager } from '../scripts/lookup_pagination.mjs';

const props = defineProps({
    modelValue: { type: [Array, String, Object, Number, null], default: null },
    items: { type: Array, default: () => ([]) },
    itemKey: { type: String, default: 'key' },
    itemLabel: { type: String, default: 'text' },
    placeholder: { type: String, default: 'Select an option' },
    hidePlaceholder: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    clearable: { type: Boolean, default: true },
    multiple: { type: Boolean, default: false },
    minimalKeywordLength: { type: Number, default: 0 },
    maxResultCount: { type: Number, default: 100 },
    readOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    allowAdd: { type: Boolean, default: false },
    searchFn: { type: Function, default: null },
    lookupUrl: { type: String, default: "" },
    lookupKey: { type: String, default: "" },
    lookupLabels: { type: Array, default: () => [] },
    lookupSearchs: { type: Array, default: () => [] },
    lookupPayloadBuilder: { type: Function },
    showInsertButton: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'change', 'item-added', 'insert-request', 'focus']);

const axios = inject('axios');
const root = ref(null);
const searchInput = ref(null);
const dropdownEl = ref(null);
const triggerEl = ref(null);
const open = ref(false);
const search = ref('');
const highlighted = ref(-1);
const dropdownStyle = ref({});
let suppressOpenOnFocus = false;
let fetchGeneration = 0;
const lookupState = reactive({});
const lookupPager = createLookupPager(async (request) => {
    return getCachedLookup(request.url, request.payload, async () => {
        const response = await axios.post(request.url, request.payload);
        return response?.data;
    });
}, lookupState);
const usesPagedLookup = computed(() => !!props.lookupUrl && typeof props.searchFn !== 'function');

function syncLookupItems() {
    filtered.value = joinWithSelected(normalizeList(lookupState.items));
}

async function loadMoreItems() {
    if (!open.value || props.disabled || props.readOnly || !usesPagedLookup.value) return;
    const generation = fetchGeneration;
    if (await lookupPager.loadMore()) {
        const scrollTop = dropdownEl.value?.scrollTop || 0;
        syncLookupItems();
        await nextTick();
        if (generation === fetchGeneration && dropdownEl.value) dropdownEl.value.scrollTop = scrollTop;
    }
}

function handleLookupScroll(event) {
    const list = event.currentTarget;
    if (list.scrollHeight - list.scrollTop - list.clientHeight <= 16 && !lookupState.error) {
        loadMoreItems();
    }
}

let scrollListener = null;
let resizeListener = null;

function updateDropdownPosition() {
    if (!root.value || !open.value) return;
    const rect = root.value.getBoundingClientRect();
    dropdownStyle.value = {
        position: 'fixed',
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        // Keep lookup options above form-insert modals, which use z-index 10000.
        zIndex: 10010,
    };
}

function onScrollOrResize(e) {
    if (!open.value) return;
    // Jangan update posisi jika scroll berasal dari dalam dropdown list itu sendiri
    if (e && e.target && e.target.closest && e.target.closest('.sdd_dropdown')) return;
    updateDropdownPosition();
}

function attachDropdownListeners() {
    scrollListener = (e) => onScrollOrResize(e);
    resizeListener = () => onScrollOrResize();
    window.addEventListener('scroll', scrollListener, true);
    window.addEventListener('resize', resizeListener);
}

function detachDropdownListeners() {
    if (scrollListener) window.removeEventListener('scroll', scrollListener, true);
    if (resizeListener) window.removeEventListener('resize', resizeListener);
    scrollListener = null;
    resizeListener = null;
}

const data = reactive({
    items: [],
    searchFn: props.searchFn,
});

// map incoming items to normalized objects while keeping original
function normalizeList(list){
    const out = [];
    const keyField =  props.lookupUrl ? props.lookupKey || 'key' : props.itemKey;
    const labelField = props.lookupUrl ? 
        (props.lookupLabels && props.lookupLabels.length > 0 ? props.lookupLabels[0] : 'text') : 
        props.itemLabel;
            
    for (let i=0;i<list.length;i++){
        const el = list[i];
        const key = el && typeof el === 'object' ? el[keyField] ?? el.key ?? i : el;
        const uid = props.lookupUrl ? `lookup_${typeof key}_${key}` : `i_${i}`;
        if (typeof el === 'string' || typeof el === 'number'){
            out.push({ _uid: uid, key: el, label: String(el), original: el });
        } else if (el && typeof el === 'object'){
            let concatenatedLabel = '';
            if (props.lookupUrl && props.lookupLabels && props.lookupLabels.length > 0) {
                concatenatedLabel = props.lookupLabels.map(lf => el[lf] ?? '').filter(v => v).join(' - ');
            }
            out.push({ 
                _uid: uid,
                key: el[keyField] ?? el.key ?? i, 
                label: concatenatedLabel || el[labelField] || el.label  || String(el[keyField] || el.key || i), 
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
    if (values == undefined || values === null || values.length == 0) return;
    const payload = props.multiple ? 
        { Where: { Op: '$in', Field: props.lookupKey, Value: values } } :
        { Where: { Field: props.lookupKey, Op: '$eq', Value: [values] } };
    const request = buildLookupRequest(
        props.lookupUrl,
        payload,
        props.lookupLabels,
        props.lookupSearchs
    );

    try {
        const result = await getCachedLookup(
            request.url,
            request.payload,
            async () => {
                const resp = await axios.post(request.url, request.payload);
                return Array.isArray(resp?.data) ? resp.data : [];
            }
        );
        if (result) {
            selected.value = props.multiple ? normalizeList(result) : normalizeList(result)[0] || null;
        }
    } catch(error) {
        console.error('SDropDown: fetchSelected error', error);
    }
} 

const selectedLabel = computed(() => {
    if (props.multiple) {
        if (!selected.value || selected.value.length === 0) return '';
        const first = selected.value[0]?.label || '';
        const remaining = selected.value.length - 1;
        return remaining > 0 ? `${first}, +${remaining}` : first;
    }
    return selected.value ? selected.value.label : '';
});

const hasSelection = computed(() => {
    if (props.multiple) return selected.value && selected.value.length > 0;
    return !!selected.value;
});

const showClearButton = computed(() => {
    return props.clearable && hasSelection.value && !!props.lookupUrl;
});

function openDropdown(){
    if (props.disabled || props.readOnly || open.value) return;
    open.value = true;
    highlighted.value = -1;
    // focus search input on next tick, or first item if not searchable
    nextTick(() => {
        if (searchInput.value) {
            searchInput.value.focus();
        } else {
            const firstItem = dropdownEl.value?.querySelector('.sdd_item');
            if (firstItem) firstItem.focus();
        }
    });
}

function handleDropdownKeydown(e){
    if (e.defaultPrevented) return;
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            move(1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            move(-1);
            break;
        case 'Enter':
            e.preventDefault();
            chooseHighlighted();
            break;
        case 'Escape':
            e.preventDefault();
            close();
            break;
    }
}

function handleTriggerFocus(){
    emit('focus');
    if (suppressOpenOnFocus) {
        suppressOpenOnFocus = false;
        return;
    }
    openDropdown();
}

function focusTrigger() {
    nextTick(() => {
        triggerEl.value?.focus?.();
    });
}

function close(returnFocus = false){
    open.value = false;
    search.value = '';
    highlighted.value = -1;
    if (returnFocus) {
        suppressOpenOnFocus = true;
        focusTrigger();
    }
}

function focus() {
    if (props.disabled || props.readOnly) return;
    triggerEl.value?.focus?.();
}

function select(it, closeAfterSelect = !props.multiple, returnFocus = false){
    if (props.disabled) return;
    if (props.multiple) {
        // toggle membership
        const idx = selected.value.findIndex(s => s.key === it.key);
        if (idx >= 0) selected.value.splice(idx, 1);
        else selected.value.push(it);
        // emit array of keys
        emit('update:modelValue', selected.value.map(s => s.key));
        emit('change', selected.value.map(s => s.key));
        if (closeAfterSelect) close(returnFocus);
        return;
    }

    selected.value = it;
    // emit the key for single-select
    emit('update:modelValue', it.key);
    emit('change', it.key);
    if (closeAfterSelect) close(returnFocus);
}

function clearSelection(){
    if (props.disabled) return;
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

function clearAllSelections() {
    if (props.disabled) return;
    clearSelection();
    nextTick(() => {
        if (searchInput.value) searchInput.value.focus();
        else focusDropdownItem(0);
    });
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
    const list = displayedItems.value;
    if (!list.length) return;
    if (highlighted.value === -1) highlighted.value = 0;
    else highlighted.value = Math.max(0, Math.min(list.length - 1, highlighted.value + dir));
}

function requestInsert() {
    if (!props.showInsertButton || props.readOnly || props.disabled) return;
    close();
    emit('insert-request');
}

function dropdownItems() {
    return dropdownEl.value?.querySelectorAll('.sdd_item[tabindex="0"]') || [];
}

function focusDropdownItem(index) {
    const items = dropdownItems();
    const target = items[index];
    if (!target) return false;
    target.focus();
    highlight(index);
    return true;
}

function handleSearchArrowDown() {
    const list = displayedItems.value;
    if (!list.length) return;

    const nextIndex = highlighted.value < 0 ? 0 : Math.min(list.length - 1, highlighted.value + 1);
    if (!focusDropdownItem(nextIndex)) {
        move(1);
    }
}

function handleSearchArrowUp() {
    const list = displayedItems.value;
    if (!list.length) return;

    if (highlighted.value <= 0) {
        highlight(0);
        return;
    }

    const prevIndex = Math.max(0, highlighted.value - 1);
    if (!focusDropdownItem(prevIndex)) {
        move(-1);
    }
}

function chooseHighlighted(returnFocus = false){
    const list = displayedItems.value;
    if (highlighted.value >=0 && highlighted.value < list.length){ select(list[highlighted.value], !props.multiple, returnFocus); }
}

function handleSearchEnter() {
    chooseHighlighted(true);
}

function handleSearchTabNavigation(event) {
    if (!event.shiftKey && displayedItems.value.length > 0) {
        // Tab forward - move focus to first dropdown item
        event.preventDefault();
        focusDropdownItem(0);
    }
    // If Shift+Tab, let it bubble up to move focus to previous element outside dropdown
}

function handleItemKeydown(event, item, index) {
    switch (event.key) {
        case 'Enter':
        case ' ':
            event.preventDefault();
            select(item, !props.multiple, true);
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
                    focusDropdownItem(index - 1);
                }
            } else {
                // Tab forward - move to next item or let it bubble to next element outside dropdown
                if (index < displayedItems.value.length - 1) {
                    event.preventDefault();
                    focusDropdownItem(index + 1);
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
    const nextIndex = Math.min(displayedItems.value.length - 1, currentIndex + 1);
    focusDropdownItem(nextIndex);
}

function moveToPrevItem(currentIndex) {
    if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        focusDropdownItem(prevIndex);
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

onMounted(()=>{
    document.addEventListener('click', onClickOutside);
    attachDropdownListeners();
});
onBeforeUnmount(()=>{
    document.removeEventListener('click', onClickOutside);
    detachDropdownListeners();
    fetchGeneration++;
    lookupPager.clear();
});

watch(() => open.value, (nv) => {
    if (nv) {
        nextTick(() => {
            updateDropdownPosition();
            fetchItems(search.value);
        });
    } else {
        dropdownStyle.value = {};
        fetchGeneration++;
        lookupPager.clear();
    }
});

watch(() => props.disabled, (disabled) => {
    if (disabled) close();
});

watch(() => highlighted.value, (idx) => {
    if (idx < 0) return;
    nextTick(() => {
        const activeItem = document.querySelector('.sdd_highlighted');
        if (activeItem && activeItem.scrollIntoView) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    });
});

const filtered = ref([]);

const displayedItems = computed(() => {
    if (!props.multiple) return filtered.value;
    return selectedItemsFirst(filtered.value, selected.value);
});

const showMultiClearButton = computed(() => {
    return props.multiple && props.clearable && selected.value.length > 1;
});

watch(() => displayedItems.value, (list) => {
    if (highlighted.value >= list.length) {
        highlighted.value = list.length > 0 ? list.length - 1 : -1;
    }
});

function joinWithSelected(normalizedResult) {
    if (props.multiple) {
        for (const si of selected.value) {
            if (!normalizedResult.find(it => it.key === si.key)) {
                normalizedResult.push(si);
            }
        }
    } else {
        if (selected.value && !normalizedResult.find(it => it.key === selected.value.key)) {
            normalizedResult.push(selected.value);
        }
    }
    return normalizedResult;
}

function buildPagedLookup(q) {
    const payload = {};
    if (typeof props.lookupPayloadBuilder === 'function') {
        Object.assign(payload, props.lookupPayloadBuilder(q));
    } else {
        const trimmedQ = q.trim();
        if (trimmedQ && props.lookupSearchs.length > 0) {
            payload.Where = props.lookupSearchs.length === 1
                ? { Field: props.lookupSearchs[0], Op: '$contains', Value: [trimmedQ] }
                : { Op: '$or', Items: props.lookupSearchs.map(Field => ({ Field, Op: '$contains', Value: [trimmedQ] })) };
        }
    }
    if (payload.Take == null) payload.Take = props.maxResultCount;
    const request = buildLookupRequest(props.lookupUrl, payload, props.lookupLabels, props.lookupSearchs);
    // A unique tie breaker keeps rows with the same label in a stable page order.
    if (props.lookupKey) {
        const sort = Array.isArray(request.payload.Sort) ? request.payload.Sort : [];
        if (!sort.some(field => field.replace(/^-/, '') === props.lookupKey)) {
            request.payload.Sort = [...sort, props.lookupKey];
        }
    }
    return request;
}

async function fetchItems(nv) {
    const generation = ++fetchGeneration;
    lookupPager.clear();

    // transform search value, trim and lowercase for comparison and if it is using api then do not transform as it can be anything
    // use ' ' (space) as search term to trigger api call without filtering
    const q = props.lookupUrl ? (nv || '') : (nv || '').toString().toLowerCase().trim();
    if (props.lookupUrl && !open.value && q === '') {
        filtered.value = joinWithSelected([...data.items]);
        return;
    }

    highlighted.value = -1;
    if (dropdownEl.value) dropdownEl.value.scrollTop = 0;
    if (usesPagedLookup.value) {
        filtered.value = joinWithSelected([]);
        if (!axios || q.length < props.minimalKeywordLength) return;
        const request = buildPagedLookup(q);
        const keyField = props.lookupKey || 'key';
        const getKey = row => row && typeof row === 'object' ? row[keyField] ?? row.key ?? row : row;
        if (await lookupPager.reset(request, getKey)) syncLookupItems();
        return;
    }

    if (data.searchFn && typeof data.searchFn === 'function' && q.length >= props.minimalKeywordLength) {
        // use custom search function
        const result = await data.searchFn(q);
        if (generation !== fetchGeneration) return;
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
    if (props.lookupUrl && !open.value) return;
    fetchItems(nv);
});

watch(() => [props.lookupUrl, props.lookupKey, props.lookupLabels, props.lookupSearchs,
    props.lookupPayloadBuilder, props.maxResultCount, props.minimalKeywordLength, props.searchFn], () => {
    data.searchFn = props.searchFn;
    if (open.value) {
        fetchItems(search.value);
    } else {
        fetchGeneration++;
        lookupPager.clear();
    }
}, { deep: true });


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


function value2(key) {
  if (key == undefined) {
    key = props.modelValue;
  }
  // const opts = data.options && data.options.filter ? data.options.filter((el) => el.key == key) : undefined;
  // return opts && opts.length > 0 ? opts[0].text : key;

  const opts=filtered.value.filter((el) => el.key == key);
  return opts && opts.length > 0 ? opts[0].label : key;
}

defineExpose({ options, setSelected, value2, focus });

</script>

<style scoped>
.sdd_lookup_status {
    padding: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
}

.sdd_lookup_status button {
    cursor: pointer;
    text-decoration: underline;
}

.sdd_insert_btn {
    cursor: pointer;
}

.sdd_disabled .sdd_toggle {
    background: var(--color-bgpopup, #ffffff) !important;
    border-color: var(--color-input-border, var(--border-medium, #cbd5e1)) !important;
    color: var(--color-input-text, #111827) !important;
    cursor: not-allowed;
    opacity: 1;
}

.sdd_disabled :deep(.sdd_selected_label),
.sdd_disabled :deep(.sdd_chev),
.sdd_disabled :deep(.text-gray-400),
.sdd_disabled :deep(button:disabled) {
    color: var(--color-input-text, #111827) !important;
    cursor: not-allowed;
    opacity: 1;
}

.sdd_multi_clear {
    align-items: center;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    color: #6b7280;
    display: flex;
    font-size: 0.75rem;
    justify-content: space-between;
    padding: 0.5rem;
    position: sticky;
    top: 0;
    z-index: 1;
}

.sdd_multi_clear_btn {
    align-items: center;
    background: transparent;
    border: 0;
    color: #9ca3af;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    padding: 0;
}

.sdd_multi_clear_btn:hover {
    color: #374151;
}
</style>
