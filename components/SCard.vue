<template>
  <div class="flex flex-col suim_card" :class="[hideTitle?'hide_title':'show_title']">
    <div
      class="card_header_container flex py-2 items-center justify-center text-primary title"
      :class="{ hasGap: !noGap, cardTitleSeparator: !props.hideTitleSeparator }"
      v-if="!hideTitle"
    >
      <slot name="title">
        <div class="card_title_container flex flex-col">
          <div class="card_title">
            {{ props.title }}
          </div>
          <div class="card_subtitle" v-if="props.subtitle && props.subtitle !== ''">
            {{ props.subtitle }}
          </div>
        </div>
        <div class="card_title_controls"><slot name="title_controls"></slot></div>
      </slot>
    </div>
    <div class="h-full card_body" :class="{hasGap: !noGap}">
      <slot></slot>
    </div>
    <div
      class="py-1"
      :class="{ cardFooterSeparator: !props.hideFooterSeparator }"
      v-if="!hideFooter"
    >
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  noGap: { type: Boolean, default: false },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  rounded: { type: String, default: "md" },
  hideTitle: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false },
  shadow: { type: Boolean, default: false },
  hideTitleSeparator: { type: Boolean, default: false },
  hideFooterSeparator: { type: Boolean, default: false },
});
</script>

<style scoped>
/* Converted from Tailwind to regular CSS */
.cardTitleSeparator {
}
.cardFooterSeparator {
  border-top: solid 1px var(--color-border);
}
.card_title {
  color: var(--primary-color, #2563eb);
}
.hasGap {
  padding-left: 10px;
  padding-right: 10px;
}
</style>
