<template>
    <div>
        <div class="flex items-center justify-end w-full" :class="{hasGap:!onlyIcon}">
            <div class="grow">&nbsp;</div>
            <slot name="buttons_1" :item="modelValue" />
            <slot
            name="buttons"
            :item="modelValue"
            v-if="mode == 'new' || mode == 'edit'"
            >
            <s-button
                v-if="!hideSubmitButton"
                :icon="submitIcon"
                class="btn_primary"
                :label="onlyIcon ? '' : submitText || 'Save'"
                @click="onSubmitForm"
                :disabled="disableSubmit"
            />
            <s-button
                v-if="!hideCancelButton"
                :icon="cancelIcon" 
                class="btn_warning"
                :label="onlyIcon ? '' : cancelText || 'Back'"
                @click="onCancelForm"
            />
            </slot>
            <slot v-else name="buttons">
            <s-button
                v-if="hideCancelButton == undefined || hideCancelButton === false"
                :icon="cancelIcon" 
                class="btn_warning"
                :label="onlyIcon ? '' : cancelText || 'Back'"
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
    submitIcon: {type: String, default:'content-save'},
    submitText: {type: String, default: 'Save'},
    cancelIcon: {type: String, default:'rewind'},
    cancelText: {type: String, default: 'Cancel'},
    hideSubmitButton: {type: Boolean, default: false},
    hideCancelButton: {type: Boolean, default: false},
    hideButtoms: {type: Boolean, default: false},
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