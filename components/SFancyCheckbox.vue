<template>
    <div>
        <mdicon :width="width" :name="iconName" @click="triggerSelect" />
    </div>
</template>

<script setup>
import { reactive, watch, computed, nextTick } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: "" },
    optionValue: { type: String, default: "" },
    width: { type: Number, default: 16 }
})

const emit = defineEmits({
    "update:modelValue": null
})

const data = reactive({
    selected: props.modelValue == props.optionValue
})

watch(() => props.modelValue, nv => data.selected = props.modelValue == props.optionValue)

function triggerSelect () {
    data.selected = !data.selected
    emit("update:modelValue", data.selected ? props.optionValue : "")
    nextTick(() => {
        //console.log(data.selected, props.optionValue, props.modelValue)
    })
}

const iconName = computed(() => {
    return data.selected ? "checkbox-blank-circle" : "checkbox-blank-circle-outline"
})

</script>