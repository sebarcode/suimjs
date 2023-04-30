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
                icon="content-save"
                class="btn_primary"
                :label="onlyIcon ? '' : 'Save'"
                @click="onSubmitForm"
                :disabled="disableSubmit"
            />
            <s-button
                v-if="!hideCancelButton"
                icon="rewind"
                :label="onlyIcon ? '' : 'Back'"
                class="btn_warning"
                @click="onCancelForm"
            />
            </slot>
            <slot v-else name="buttons">
            <s-button
                v-if="hideCancelButton == undefined || hideCancelButton === false"
                icon="arrow-left"
                class="bg-warning text-black"
                :label="onlyIcon ? '' : 'Back'"
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
    submitText: {type: String, default: 'Save'},
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