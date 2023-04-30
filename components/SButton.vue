<template>
  <button class="flex gap-1 btn items-center" :disabled="disabled" @click="emit('click')">
    <mdicon width="14" :name="icon" v-if="icon != ''" />
    <div class="mt-0" v-if="label!=''">{{ label }}</div>
  </button>
</template>

<script setup>
//import { reactive, ref, computed } from "vue";

const props = defineProps({
  label: { type: String, default: "" },
  icon: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  /*
  bgColor: { type: String, default: "primary" },
  textColor: { type: String, default: "" },
  rounded: { type: String, default: "" },
  kind: { type: String, default: "button" }, // kind: button, link, fab, icon
  */
});

const emit = defineEmits({
  click: null,
});
</script>

<style scoped>

.btn {
  @apply hover:opacity-60 
    disabled:opacity-30
    border-none normal-case px-2 font-normal
    rounded-sm;

  min-height: 20px !important;
  height: 2rem;
}
</style>