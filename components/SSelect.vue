<template>
  <div v-if="!disabled" @mouseover="onFocus">
    <v-select
      v-if="lookupUrl == ''"
      class="p-0 m-0 border border-white s-select-style h-[30px]"
      label="text"
      @option:created="addItem"
      @option:selected="selectItem"
      :multiple="multiple"
      :taggable="allowAdd"
      :options="data.options"
      :reduce="reduceItem"
      :select-on-key-codes="[188, 13]"
      :disabled="disabled"
      @search:focus="onFocus" 
      v-model="value"
      ref="vs"
      :clearable="showClearButton"
    >
      <template #selected-option="option">
        <slot name="selected" :item="option"> </slot>
      </template>
      <template #option="option"> 
        <slot name="option" :option="option" ></slot>
      </template>
    </v-select>

    <v-select
      v-else
      class="p-0 m-0 border border-white s-select-style"
      label="text"
      @open="selectOpen"
      @search="fetchOptions"
      @option:created="addItem"
      @option:selected="selectItem"
      :multiple="multiple"
      :taggable="allowAdd"
      :filterable="!allowAdd"
      :options="data.options"
      :select-on-key-codes="[188, 13]"
      :reduce="reduceItem"
      :disabled="disabled"
      @search:focus="onFocus"
      v-model="value"
      :clearable="showClearButton"
      ref="vs"
    >
        <template #selected-option="option">
          <slot name="selected-option" :option="option"> </slot>
        </template>    
        <template #option="option"> 
          <slot name="option" :option="option" ></slot>
        </template>
    </v-select>
  </div>
  <div v-else>
    <div class="border-b border-slate-300 py-1">
      {{ data.valueTxt || value || "&nbsp;" }}
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import util from '../scripts/util';

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: () => "" },
  items: {
    type: Array,
    default: () => {
      return [];
    },
  },
  lookupUrl: { type: String, default: "" },
  lookupKey: { type: String, default: "" },
  lookupLabels: { type: Array, default: () => [] },
  lookupSearchs: { type: Array, default: () => [] },
  lookupPayloadBuilder: {type: Function},
  label: { type: String, default: "Please select" },
  showSearch: { type: Boolean },
  multiple: { type: Boolean, default: false },
  allowAdd: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  showAddButton: { type: Boolean, default: false },
  showClearButton: { type: Boolean, default: false },
  showTriggerButton: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue", "change", "addItem", "focus"]);

const axios = inject("axios");

const data = reactive({
  valueTxt: "",
  filterTxt: "",
  showOptions: false,
  additionalItems: [],
  options:
    props.lookupUrl != ""
      ? fetchOptions("")
      : props.items.map((el) => {
          return typeof el == "object" ? el : { key: el, text: el };
        }),
});

watch(() => props.items, (nv) => {
  data.options = nv.map((el) => {
      return typeof el == "object" ? el : { key: el, text: el };
    });
});

const vs = ref(null);

function onFocus() { 
  emit("focus");
}

const value = computed({
  get() {
    if (props.multiple) {
      if (props.modelValue == undefined || props.modelValue == null) return [];
    }

    if (props.modelValue == undefined || props.modelValue == null) return "";
    return props.modelValue;
  },

  set(v) {
    emit("update:modelValue", v);
  },
});

// methods
function fetchOptions(search, loading) {
  
  let qp = {}
  if (props.lookupPayloadBuilder==undefined || props.lookupPayloadBuilder==null) {
    if (search != "") data.filterTxt = search;
    qp.Take =20
    qp.Sort = [props.lookupLabels[0]]
    qp.Select = props.lookupLabels 
    let idInSelect = false;
    const selectedFields = props.lookupLabels.map(x => {
      if (x==props.lookupKey) {
        idInSelect = true;
      }
      return x;
    });
    if (!idInSelect) {
      selectedFields.push(props.lookupKey);
    }
    qp.Select = selectedFields;

    //setting search
    if (search.length > 0 && props.lookupSearchs.length > 0) {
      if (props.lookupSearchs.length == 1)
        qp.Where = {
          Field: props.lookupSearchs[0],
          Op: "$contains",
          Value: [search],
        };
      else
        qp.Where = {
          Op: "$or",
          items: props.lookupSearchs.map((el) => {
            return { Field: el, Op: "$contains", Value: [search] };
          }),
        };
    }

    if (
      props.multiple &&
      props.modelValue &&
      props.modelValue.length > 0 &&
      qp.Where != undefined
    ) {
      const whereExisting =
        props.modelValue.length == 1
          ? { Op: "$eq", Field: props.lookupKey, Value: props.modelValue[0] }
          : {
              Op: "$or",
              items: props.modelValue.map((el) => {
                return { Field: props.lookupKey, Op: "$eq", Value: el };
              }),
            };

      qp.Where = { Op: "$or", items: [qp.Where, whereExisting] };
    }
  } else {
    qp = props.lookupPayloadBuilder(search)
  }
  if (loading) loading(true);
  axios.post(props.lookupUrl, qp).then(
    (r) => {
      if (r.data && r.data.error) {
        if (loading) loading(false)
        util.showError(r.data.error)
        return
      }

      const existingOptions = []
      if (props.modelValue && data.options && data.options.length > 0) {
        if (typeof props.modelValue==Array) {
          props.modelValue.forEach(el => {
            const opts = data.options.filter(el => el.key==props.modelValue)
            if (opts.length > 0) existingOptions.push(...opts)
          })
        } else if (typeof props.modelValue=="string") {
          const opts = data.options.filter(el => el.key==props.modelValue)
          if (opts.length > 0) existingOptions.push(...opts)
        }
      }

      data.options = r.data.map((d) => {
        return {
          key: d[props.lookupKey],
          text: getValue2(d),
          item: {...d}
        };
      });

      existingOptions.forEach(el => {
        const dataOptExists = data.options.filter(dtopt => el.key==dtopt.key)
        if (dataOptExists==undefined || dataOptExists.length==0) {
          data.options.push(el)
        }
      })
      
      if (loading) loading(false);
    },
    (e) => {
      if (loading) loading(false);
    }
  );
}

function selectOpen() {
  fetchOptions("");
}

function addItem(opt) {
  const opts = data.options ? data.options : [];
  if (typeof opt == "object") {
    opt.key = opt.text;
  } else if (typeof opt == "string") {
    opt = { key: opt, text: opt };
  }

  const currentOpts = opts.filter((el) => el.key == opt.key);
  if (currentOpts.length > 0) {
    return;
  }

  opts.push(opt);
  data.options = opts;

  emit("addItem", opt);
}

function selectItem(opt) {
  emit("change", opt);
}

function reduceItem(item) {
  if (typeof item == "string") return item;
  return item.key ? item.key : item.text ? item.text : item;
}

function getValue2(d) {
  return props.lookupLabels
    .map((el) => {
      return d[el];
    })
    .join(" | ");
}

function value2(key) {
  if (key == undefined) {
    key = props.modelValue;
  }
  const opts = data.options && data.options.filter ? data.options.filter((el) => el.key == key) : undefined;
  return opts && opts.length > 0 ? opts[0].text : key;
}

async function getLookupLabel(id) {
  if (props.lookupUrl == "") return id;

  const url =
    props.lookupUrl +
    (props.lookupUrl.indexOf("?") > 0 ? "&_id=" + id : "?_id=" + id);

  await axios.post(url, { Take: 1 }).then(
    (r) => {
      if (r.data.length == 0) return "";

      const labelTexts = props.lookupLabels.map((labelField) => {
        return r.data[0][labelField];
      });
      data.valueTxt = labelTexts.join(" - ");
    },
    (e) => util.showError(e)
  );
}

function searchText() {
  if (data) return data.filterTxt;
  return "";
}

defineExpose({ value2, searchText });

onMounted(() => {
  if (props.disabled) getLookupLabel(props.modelValue);
});
</script>

<style> 
.vs__dropdown-toggle {
  @apply rounded-none;
}

.vs__actions {
  @apply border-none;
}

.s-select-style .vs__search::placeholder,
.s-select-style
.s-select-style .vs__selected,
.s-select-style  {
  @apply text-slate-600 border-none;
}

.s-select-style .vs__search {
  margin: 0px;
}

.s-select-style .vs__clear,
.s-select-style .vs__open-indicator {
  @apply text-black;
}

.s-select-style .vs__dropdown-menu {
  @apply border border-slate-300 bg-white text-slate-600;
}

.s-select-style .vs__selected {
  @apply bg-transparent;
}

.s-select-style .vs__deselect {
  @apply text-white;
}
</style>
