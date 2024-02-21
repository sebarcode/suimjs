<template>
  <div class="has_suim_tooltip relative flex flex-col items-center group">
    <slot name="content"></slot>
    <div
      v-if="!noTooltip"
      class="suim_tooltip absolute flex flex-col items-center group-hover:flex rounded"
    >
      <span
        class="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg"
        >{{ tooltip }}</span
      >
      <div class="rotate-45 bg-black arrow-bottom"></div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const props = defineProps({
  noTooltip: { type: Boolean, default: false },
  tooltip: { type: String, default: "tooltip" },
});

const data = reactive({});
const emit = defineEmits({});
defineExpose({});
</script>

<style scoped>
.suim_tooltip {
  visibility: hidden;
  background-color: #333333;
  top: -50px;
  z-index: 100;
  width: max-content;
}
.has_suim_tooltip:hover .suim_tooltip {
  visibility: visible;
}
.arrow-bottom {
  content: " ";
  position: absolute;
  bottom: -8px;
  border-top: 8px solid #333333;
  border-right: 8px solid transparent;
  border-left: 8px solid transparent;
  border-bottom: none;
}
</style>
