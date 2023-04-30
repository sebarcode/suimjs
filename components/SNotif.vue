<template>
    <div class="p-2 text-[0.8em] text-center">
        <div class="flex gap-1 mb-1">
            <h1 v-if="title != ''" class="font-bold grow">{{ title }}</h1>
        </div>
        <div>
            {{ message }}
        </div>
    </div>
</template>

<script setup>
//import { onMounted, reactive } from 'vue'
//import { notifStore } from "@/stores/notif.js";

const notif = notifStore()
const props = defineProps({
    title: String,
    message: String,
    autoHide: { type: Number, default: 0 }
})

function hideNotif() {
    //notif.hide()
}

/*
onMounted(() => {
    if (props.autoHide > 0) {
        setTimeout(() => {
            notif.show = false
        }, props.autoHide);
    }
})
*/

</script>
