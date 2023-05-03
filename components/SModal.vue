<template>
    <div class="modal_fullbg" v-if="data.displayModal">&nbsp;</div>

    <div class="w-full h-full absolute top-0 left-0 z-50 flex items-center justify-center" v-if="data.displayModal">
        <div class="modal_container">
            <slot name="title">
                <div class="modal_title" v-if="!hideTitle">
                    <div class="grow">{{ title  }}</div>
                    <div class="flex gap-1" v-if="!hideActions">
                        <slot name="actions">
                        <slot name="actions_1">
                        </slot>
                        <mdicon width="12" name="close" class="modal_action" @click="hide" v-if="!hideClose" />
                        <slot name="actions_2">
                        </slot>
                        </slot>
                    </div>
                </div>
            </slot>

            <div class="modal_content"><slot>&nbsp;</slot></div>

            <div class="modal_buttons" v-if="!hideButtons">
                <slot name="buttons">
                    <slot name="buttons_2"></slot>
                    <s-button class="btn_warning" label="Cancel" @click="hide" v-if="!hideCancel" />
                    <s-button class="btn_primary" label="Submit" @click="submit" v-if="!hideSubmit" />
                    <slot name="buttons_1"></slot>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
import SButton from './SButton.vue';


const props = defineProps({
    display: {type: Boolean, default: true},
    hideClose: {type: Boolean, default: false},
    hideTitle: {type: Boolean, default: false},
    hideActions: {type: Boolean, default: false},
    title: {type: String, default: "Modal"},
    hideButtons: {type: Boolean, default: false},
    hideCancel: {type: Boolean, default: false},
    hideSubmit: {type: Boolean, default: false},
})

const data = reactive({
    displayModal: props.display
})

watch(()=>props.display, (nv)=>{
    data.displayModal = nv
})

const emit = defineEmits({
    "beforeHide": null,
    "beforeSubmit": null,
    "submit": null
})

function show () {
    data.displayModal = true
}

function hide () {
    emit("beforeHide")
    data.displayModal = false
}

function submit () {
    emit("beforeSubmit")
    emit("submit")
}

defineExpose({
    hide, show,
})

</script>

<style scoped>

.modal_fullbg {
    @apply absolute top-0 left-0 w-full h-full bg-black opacity-60 flex items-center justify-center z-30
}

.modal_container {
    @apply bg-white shadow-md
}

.modal_title {
    @apply bg-primary text-slate-200 px-2 flex gap-2
}

.modal_action {
    @apply cursor-pointer hover:opacity-30
}

.modal_content {
    @apply p-3
}

.modal_buttons {
    @apply p-2 flex flex-row-reverse gap-1 text-[0.8em]
}

</style>