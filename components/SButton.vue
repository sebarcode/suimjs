<template>
  <s-tooltip :no-tooltip="noTooltip" :tooltip="label ? label : tooltip">
    <template #content>
      <button
        class="flex gap-1 btn items-center w-full justify-center"
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
import { getCurrentInstance } from "vue";
import { reactive } from "vue";
import { computed } from "vue";

const props = defineProps({
  label: { type: String, default: "" },
  icon: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  disableWhenClicked: { type: Boolean, default: false },
  tooltip: { type: String, default: "tooltip" },
  noTooltip: { type: String, default: false },
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
.btn {
  @apply hover:opacity-60
    disabled:opacity-30
    border-none normal-case px-2 font-normal
    rounded-sm;

  min-height: 20px !important;
  height: 2rem;
}
</style>
