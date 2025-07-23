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
                    <s-button class="btn_primary" label="Submit" @click="submit" v-if="!hideSubmit" ref="cancelBtn" />
                    <slot name="buttons_1"></slot>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';
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

const cancelBtn = ref(null);

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
    if (cancelBtn.value) {
        cancelBtn.value.focus();
    }
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
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: black;
    opacity: 0.6;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
}
.modal_container {
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.modal_title {
    background: var(--primary-color, #2563eb);
    color: #e2e8f0;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    display: flex;
    gap: 0.5rem;
}
.modal_action {
    cursor: pointer;
    transition: opacity 0.2s;
}
.modal_action:hover {
    opacity: 0.3;
}
.modal_content {
    padding: 0.75rem;
}
.modal_buttons {
    padding: 0.5rem;
    display: flex;
    flex-direction: row-reverse;
    gap: 0.25rem;
    font-size: 0.8em;
}

</style>