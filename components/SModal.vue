<template>
    <div class="suim_modal" v-if="data.displayModal">
        <slot>
            This is MODAL
        </slot>
    </div>
</template>

<script setup>
import { data } from 'browserslist';
import { reactive, watch } from 'vue';


const props = defineProps({
    display: {type: Boolean, default: true}
})

const data = reactive({
    displayModal: props.display
})

watch(()=>props.display, (nv)=>{
    data.displayModal = nv
})

function show () {
    data.displayModal = true
}

function hide () {
    data.displayModal = false
}

</script>