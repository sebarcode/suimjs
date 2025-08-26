<template>
  <s-tooltip :no-tooltip="noTooltip || tooltip==''" :tooltip="tooltip=='' ? label : tooltip">
    <template #content>
      <button
        class="flex gap-1 btn items-center w-full justify-center cursor-pointer"
        :disabled="disableBtn"
        @click="clickBtn"
      >
        <mdicon width="14" :name="icon" v-if="icon != ''" />
        <div class="mt-0" v-if="label != ''">{{ label }}</div>
      </button>
    </template>
  </s-tooltip>
</template>

<script setup>
import STooltip from "./STooltip.vue";
import { reactive } from "vue";
import { computed } from "vue";

const props = defineProps({
  label: { type: String, default: "" },
  icon: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  disableWhenClicked: { type: Boolean, default: false },
  tooltip: { type: String, default: "" },
  noTooltip: { type: Boolean, default: false },
});

const data = reactive({
  disabled: false,
});

const emit = defineEmits({
  click: null,
  clickAndDisable: null,
});

function clickBtn() {
  if (props.disableWhenClicked) {
    data.disabled = true;
    emit("clickAndDisable", () => {
      data.disabled = false;
    });
  } else {
    emit("click");
  }
}

const disableBtn = computed({
  get() {
    return props.disabled || data.disabled;
  },
});
</script>

<style scoped>
/* Converted from Tailwind to regular CSS */
.btn {
  border: none;
  text-transform: none;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-weight: 400;
  border-radius: 0.2rem;
  min-height: 18px !important;
  height: 1.8rem;
  transition: opacity 0.2s;
}
.btn:hover {
  opacity: 0.6;
}
.btn:disabled {
  opacity: 0.3;
  pointer-events: none;
}
</style>
