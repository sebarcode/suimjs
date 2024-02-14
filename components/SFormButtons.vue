<template>
    <div class="suim_form_button">
        <div class="flex items-center justify-end w-full" :class="{hasGap:!onlyIcon}" v-if="!hideButtons">
            <div class="grow">&nbsp;</div>
            <slot name="buttons_1" :item="modelValue" />
            <slot
            name="buttons"
            :item="modelValue"
            v-if="mode == 'new' || mode == 'edit'"
            >
            <s-button
                v-if="!hideSubmitButton && tab==0"
                :icon="submitIcon"
                class="btn_primary submit_btn"
                :label="onlyIcon ? '' : submitText || 'Save'"
                @click="onSubmitForm"
                :disabled="disableSubmit"
            />
            <s-button
                v-if="!hideCancelButton && tab==0"
                :icon="cancelIcon" 
                class="btn_warning back_btn"
                :label="onlyIcon ? '' : cancelText"
                @click="onCancelForm"
            />
            </slot>
            <slot v-else name="buttons">
            <s-button
                v-if="(hideCancelButton == undefined || hideCancelButton === false) && tab==0"
                :icon="cancelIcon" 
                class="btn_warning back_btn"
                :label="onlyIcon ? '' : cancelText"
                @click="onCancelForm"
            />
            </slot>
            <slot name="buttons_2" :item="modelValue" />
        </div>
        </div>
</template>

<script setup>
import { reactive } from 'vue';
import SButton from './SButton.vue'

const props = defineProps({
    mode: {type:String, default: 'edit'},
    tab: {type: Number, default: 0},
    submitIcon: {type: String, default:'content-save'},
    submitText: {type: String, default: 'Save'},
    cancelIcon: {type: String, default:'rewind'},
    cancelText: {type: String, default: 'Cancel'},
    hideSubmitButton: {type: Boolean, default: false},
    hideCancelButton: {type: Boolean, default: false},
    hideButtons: {type: Boolean, default: false},
    disableSubmit: {type: Boolean},
    onlyIcon: {type: Boolean, default: false},
    modelValue: {type: Object, default: ()=>{}},
})

const emit = defineEmits({
    submitClick: null,
    cancelClick: null,
})

defineExpose({
    changeSubmissionState
})

const data = reactive({
    submissionState: ''
})


function onSubmitForm () {
    emit('submitClick', props.modelValue)
}

function onCancelForm () {
    emit('cancelClick', props.modelValue)
}

function changeSubmissionState (state) {
    data.submissionState = state
}

</script>

<style scoped>

.hasGap {
    @apply gap-1
}

</style>