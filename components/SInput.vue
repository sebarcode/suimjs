<template>
  <div v-if="!readOnly" class="suim_input">
    <!-- radio -->
    <div v-if="kind == 'radio'" class="flex flex-col gap-2">
      <div v-for="(item, itemIndex) in items" class="flex gap-2 radio-item">
        <input
          type="radio"
          :name="field"
          class="bg-slate-800"
          :id="field + '_' + itemIndex"
          v-model="value"
          @focus="onFocus"
        />
        <label :for="field + '_' + itemIndex">{{ item.text }}</label>
      </div>

      <div>
        <div
          class="text-[0.7em] flex gap-1 text-error"
          v-show="errorsTxt.length > 0"
        >
          <div v-if="errorsTxt.length > 0">
            {{ errorsTxt }}
          </div>
          <div v-else>&nbsp;</div>
        </div>
      </div>
    </div>

    <!-- checkbox -->
    <div v-else-if="kind == 'bool' || kind == 'checkbox'">
      <div class="flex gap-2 items-center mt-1">
        <div>
          <input
            :type="kind == 'bool' ? 'checkbox' : kind"
            v-model="value"
            ref="control"
            @focus="onFocus"
          />
        </div>
        <div>{{ label }}</div>
      </div>
      <div>
        <div
          class="text-[0.7em] opacity-60 flex gap-1 text-red-300"
          v-show="errorsTxt.length > 0"
        >
          <div v-if="errorsTxt.length > 0">
            {{ errorsTxt }}
          </div>
          <div v-else>&nbsp;</div>
        </div>
      </div>
    </div>

    <!--standard input -->
    <div v-else>
      <label class="input_label" v-if="!hideLabel">
        <div
          v-if="
            (value && value.length > 0) ||
            !isNaN(value) ||
            useList ||
            kind == 'md' || kind == 'date' || kind == 'time' ||
            kind == 'markdown' ||
            keepLabel
          "
        >
          {{ label }}
          
          <span v-if="required" class="is_required font-extrabold text-yellow-200">*</span>
        </div>
        <div v-else>&nbsp;</div>
      </label>

      <!-- select -->
      <div v-if="useList === true">
        <s-select
          v-model="value"
          :items="items"
          class="w-[100%]"
          ref="control"
          :label="caption != '' ? caption : label != '' ? label : field"
          :show-clear-button="showClearButton"
          :allow-add="allowAdd"
          :lookup-url="lookupUrl"
          :lookup-key="lookupKey"
          :lookup-labels="lookupLabels"
          :lookup-searchs="lookupSearchs"
          :lookup-payload-builder="lookupPayloadBuilder"
          :disabled="disabled"
          :multiple="multiple"
          @focus="onFocus"
          @addItem="onAddItem"
        >
          <template #option="{option}">
            <slot name="option" :option="option" ></slot>
          </template>
          <template #selected-option="{option}">
            <slot name="selected-option" :option="option"></slot>
          </template>
        </s-select>
      </div>

      <!-- html -->
      <div v-else-if="kind == 'html'" class="flex flex-col gap-0">
        <s-editor ref="control" v-model="value" />
      </div>

      <!-- password -->
      <div v-else-if="kind == 'password'" class="flex flex-row relative w-full">
        <input
          :type="state.showPassword ? 'text' : 'password'"
          :placeholder="caption || label"
          class="input_field"
          v-model="value"
          ref="control"
          :disabled="disabled"
          @focus="onFocus"
        />
        <button
          class="input_icon"
          @click="state.showPassword = !state.showPassword"
        >
          <mdicon
            :name="state.showPassword ? 'eye' : 'eye-off'"
            size="16"
            :class="{ 'opacity-60': !state.showPassword }"
          />
        </button>
      </div>

      <!-- all other input type -->
      <div v-else>
        <input
          v-if="kind=='datetime'"
          type="datetime-local"
          :placeholder="caption || label"
          class="input_field"
          :value="value"
          @input="updateDateTimeValue($event.target.value)"
          ref="control"
          :disabled="disabled"
          @focus="onFocus"
        />

        <input
          v-else-if="multiRow <= 1 && kind != 'number'"
          :type="kind=='datetime' ? 'datetime-local' : kind"
          :placeholder="caption || label"
          class="input_field"
          v-model="value"
          ref="control"
          :disabled="disabled"
          @focus="onFocus"
        />
        <input
          v-else-if="multiRow <= 1 && kind == 'number'"
          :type="kind"
          class="input_field text-right"
          v-model="value"
          ref="control"
          :disabled="disabled"
          @focus="onFocus"
        />
        <textarea
          v-else="multiRow <= 1"
          :rows="multiRow"
          type="text"
          :placeholder="caption || label"
          class="input_field"
          ref="control"
          v-model="value"
          :disabled="disabled"
          @focus="onFocus"
        />
      </div>
      <div class="text-[0.7em] italic opacity-40">{{ hint }}</div>
      <div class="input_error"
        v-show="errorsTxt.length > 0 || keepErrorSection"
      >
        <div v-if="errorsTxt.length > 0">
          {{ errorsTxt }}
        </div>
        <div v-else>&nbsp;</div>
      </div>
    </div>
  </div>

  <!-- view mode -->
  <div v-else>
    <label class="input_label" v-if="!hideLabel">
      <div v-if="true">
        {{ label }}
        <span v-if="required" class="font-extrabold text-yellow-200">*</span>
      </div>
      <div v-else>&nbsp;</div>
    </label>

    <div class="bg-transparent" v-if="kind == 'datetime'">
      {{ moment(value).local().format("DD-MMM-YYYY HH:mm:ssZ") }}
    </div>
    <div class="bg-transparent" v-else-if="kind == 'date'">
      {{ moment(value).local().format("DD-MMM-YYYY") }}
    </div>
    <div class="bg-transparent" v-else-if="kind == 'number'">
      {{ util.formatMoney(value, { decimal: decimal }) }}
    </div>
    <div class="bg-transparent" v-else-if="lookupUrl && lookupUrl != ''">
      {{ state.fieldLabel }}
    </div>
    <div class="bg-transparent" v-else>{{ value && value!="" ? value : "&nbsp;" }}</div>
  </div>
</template>

<style>
.radio-item {
  display: inline-block;
  position: relative;
  padding: 0px;
  margin: 0px;
}

.radio-item input[type="radio"] {
  display: none;
}

.radio-item label {
  color: #666;
  font-weight: normal;
}

.radio-item label:before {
  content: " ";
  display: inline-block;
  position: relative;
  top: 5px;
  margin: 0 5px 0 0;
  width: 20px;
  height: 20px;
  border-radius: 11px;
  border: 2px solid;
  @apply bg-inherit;
}

.radio-item input[type="radio"]:checked + label:after {
  border-radius: 11px;
  width: 12px;
  height: 12px;
  position: absolute;
  top: 9px;
  left: 4px;
  content: " ";
  display: block;
  background-color: #000000;
}
</style>

<script setup>
import { reactive, computed, onMounted, nextTick, ref, inject } from "vue";
import SSelect from "./SSelect.vue";
import moment from "moment";
import util from "../scripts/util";
import SEditor from './SEditor.vue';

const control = ref(null);
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: () => {},
  },
  field: { type: String, default: "" },
  ctlRef: { type: [Object, String], default: () => {} },
  label: { type: String, default: "" },
  caption: { type: String, default: "" },
  hint: { type: String, default: "" },
  kind: { type: String, default: "text" },
  items: {
    type: Array,
    default() {
      return [];
    },
  },
  bgColor: { type: String, default: "bg-transparent" },
  multiRow: { type: Number, default: 1 },
  allowAdd: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  readOnly: { type: Boolean },
  hideLabel: { type: Boolean },
  keepLabel: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] },
  masked: { type: Boolean, default: false },
  useList: { type: Boolean, default: false },
  lookupUrl: { type: String, default: "" },
  lookupKey: { type: String, default: "" },
  lookupLabels: { type: Array, default: () => [] },
  lookupSearchs: { type: Array, default: () => [] },
  lookupFormat1: { type: String, default: "" },
  lookupFormat2: { type: String, default: "" },
  lookupPayloadBuilder: { type: Function },
  dateFormat: { type: String, default: "" },
  decimal: { type: Number, default: 0 },
  multiple: { type: Boolean, default: false },
  rounded: { type: Number, default: 0 },
  validateOnMount: { type: Boolean },
  disableValidateOnChange: { type: Boolean, default: false },
  keepErrorSection: { type: Boolean, default: false },
  width: { type: String, default: "" },
  showClearButton:{ type: Boolean, default: true },
});

const emit = defineEmits({
  validate: null,
  "update:modelValue": null,
  focus: null,
  addItem :null,
  change: null,
});

const axios = inject("axios");

const state = reactive({
  errors: [],
  fieldLabel: props.modelValue,
  editorMode: "text",
  showPassword: false,
  payloadBuilder: undefined,
});

const value = computed({
  get() {
    switch (props.kind) {
      case "date":
        if (props.modelValue) return moment.utc(props.modelValue).local().format("YYYY-MM-DD")
          else return null;

      case "datetime":
      case "timestamp":
        if (props.modelValue)  
          return moment.utc(props.modelValue).local().format("YYYY-MM-DDTHH:mm")
          else return null;

      default:
        return props.modelValue;
    }
  },

  set(v) {
    switch (props.kind) {
      case "date":
        if (v == null || v == "") {
          v = null;
        } else {
          v = moment(v, "YYYY-MM-DD").utc().format();
        }
        break;
    
      default:
        if (v == undefined) v = "";
    }

    handleChange(v, value2(v), props.modelValue, props.ctlRef);
    emit("update:modelValue", v);
    nextTick(() => {
      if (!props.disableValidateOnChange) validate();
    });
  },
});

function updateDateTimeValue(value) {
  if (value == null || value == "") {
    value = null;
  } else {
    value = moment(value).utc().format();
  }
  handleChange(value, value2(value), props.modelValue, props.ctlRef);
  emit("update:modelValue", value);
  nextTick(() => {
    if (!props.disableValidateOnChange) validate();
  });
}

const errorsTxt = computed(() => {
  return state.errors.filter((x) => x != "").join(", ");
});

onMounted(() => {
  if (props.validateOnMount) validate();

  if (props.lookupUrl != "") {
    axios
      .post(props.lookupUrl, {
        Take: 1,
        Where: { Field: "_id", Op: "$eq", Value: props.modelValue },
      })
      .then((r) => {
        if (r.data.length == 0) return;
        state.fieldLabel = props.lookupLabels
          .map((l) => {
            //console.log(l, r.data[0][l])
            return r.data[0][l];
          })
          .join(" | ");
      });
  }
});

function handleChange(v1, v2, old, ctlRef) {
  if (props.kind=="date" && v1=="") {
    v1 = null;
  } 
  
  if (v1 == undefined) v1 = null;
  if (v2 == undefined) v2 = null;
  if (old == undefined) old = "";
  
  emit("change", props.field, v1, v2, old, props.ctlRef);
}

function validate() {
  const data = props.modelValue;
  state.errors = [];

  let res = true;

  if (props.required) {
    if (data === false || data === undefined || data === "" || data==null ) {
      state.errors.push("required");
      res = false;
    }
  }

  props.rules.forEach((rule) => {
    const ruleResult = rule(data);
    if (ruleResult != "") {
      state.errors.push(ruleResult);
      res = false;
    }
  });

  emit("validate", props.field, res);
  return res;
}

function focus() {
  if (control.value.focus) control.value.focus();
}

function onFocus() {
  emit("focus", props.field, props.modelValue, value2(), props.ctlRef);
}

function debug() {
  console.log(props.field);
}

function value2(key) {
  if (key == undefined) key = props.modelValue;
  if (control.value && control.value.value2) {
    const v2 = control.value.value2(key);
    return v2 ? v2 : key;
  }

  return key;
}

function isValid() {
  return validate();
}

function searchText () {
  if (control.value && control.value.searchText)
    return control.value.searchText();
  return "";
}
function onAddItem(v){
  emit("addItem", props.field, v)

}
defineExpose({ validate, focus, debug, value2, isValid, searchText});
</script>
