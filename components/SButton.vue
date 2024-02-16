<template>
  <div class="has_suim_tooltip relative flex flex-col items-center group">
    <button
      class="flex gap-1 btn items-center"
      :disabled="disableBtn"
      @click="clickBtn"
    >
      <mdicon width="14" :name="icon" v-if="icon != ''" />
      <div class="mt-0" v-if="label != ''">{{ label }}</div>
    </button>
    <div
      v-if="isTooltip"
      class="suim_tooltip absolute flex flex-col items-center group-hover:flex rounded"
    >
      <span
        class="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg"
        >{{ label ? label : tooltip }}</span
      >
      <div class="rotate-45 bg-black arrow-bottom"></div>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance } from "vue";
import { reactive } from "vue";
import { computed } from "vue";

const props = defineProps({
  label: { type: String, default: "" },
  icon: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  disableWhenClicked: { type: Boolean, default: false },
  tooltip: { type: String, default: "tooltip" },
  isTooltip: { type: String, default: true },
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
