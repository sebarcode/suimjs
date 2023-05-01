<template>
    <ul class="flex flex-col gap-2 justify-center">
        <li class="flex gap-2 items-center" v-if="!hideHeader">
            <slot name="header"></slot>
        </li>
        <li class="border-b pb-2 last:border-b-0 last:pb-0 flex gap-2 items-center"
            v-for="(record, recordIndex) in data.records">
            <div class="w-[80px]" v-if="!hideSelect">
                <input type="checkbox" :value="recordIndex" />
            </div>
            <slot name="item" :item="record" :config="data.config">
                <div class="grow">{{ record }}</div>
            </slot>
            <div>
                <mdicon name="delete" class="cursor-pointer" size="18" @click="deleteRecord(recordIndex)" />
            </div>
        </li>
        <li v-if="allowAdd">
            <div class="flex gap-2 items-start">
                <div class="w-[80px]" v-if="!hideSelect">&nbsp;</div>
                <div class="grow">
                    <slot name="editor" :item="data.record" :config="data.config"></slot>
                </div>
                <div class="pt-6">
                    <button @click="addRecord">
                        <mdicon name="plus-circle" class="cursor-pointer" size="18" />
                    </button>
                </div>
            </div>
        </li>
    </ul>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    config: { type: [String, Object, Function], default: () => { } },
    allowAdd: { type: Boolean, default: false },
    hideHeader: { type: Boolean, default: false },
    hideSelect: { type: Boolean, default: false },
    hideDelete: { type: Boolean, default: false },
})

const emit = defineEmits({
    "update:modelValue": null,
    validate: null,
    validateItem: null,
    preChange: null,
    postChange: null,
    saveRecord: null,
    deleteRecord: null,
})

const data = reactive({
    config: {},
    records: props.modelValue == undefined ? [] : props.modelValue,
    record: {},
    validateItemOK: false
})

watch(() => props.modelValue, (nv) => data.records = nv)

const value = computed({
    get() {
        return props.modelValue
    },

    set(v) {
        const newV = v
        const oldV = props.modelValue
        emit("update:modelValue", v)
    }
})

function addRecord() {
    emit("preChange", data.record)
    emit("validateItem", data.record)

    if (data.validateItemOK) {
        const newData = {}
        for (var objName in data.record) {
            newData[objName] = data.record[objName]
        }
        data.records.push(newData)
        emit("saveRecord", data.record)
        commitChange()
    }
}

function deleteRecord(index) {
    emit("deleteRecord", data.records[index])
    data.records = data.records.filter((el, elIndex) => index != elIndex)
    commitChange()
}

function commitChange() {
    emit('update:modelValue', data.records)
    //emit("saveRecord", data.record)
    data.validateItemOK = false
}

function setRecord(r) {
    //console.log(JSON.stringify(r))
    data.record = r
}

function setValidateItem(ok) {
    data.validateItemOK = ok
}

defineExpose({ setRecord, setValidateItem })

</script>