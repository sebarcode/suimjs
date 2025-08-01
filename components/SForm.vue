<template>
   <div class="suim_form" :class="[focus ? 'focus' :'', data.inSubmission || data.loading ? 'loading' :''] ">
      
      <template v-if="data.inSubmission || data.loading" >
        <slot name="loader">
          <div class="loader"></div>
        </slot> 
      </template>

      <div v-if="config && config.setting">
        <h1 v-if="config.setting.showTitle && config.setting.title != ''" class="title">
          {{ config.setting.title }}
        </h1>

        <!-- tab header -->
        <div class="header">
          <div
            class="tab_container"
            v-if="tabs.length > 1"
          >
            <div
              v-for="(tabTitle, tabIdx) in tabs"
              @click="data.currentTab = tabIdx"
              :class="{
                tab_selected: data.currentTab == tabIdx,
                tab: data.currentTab != tabIdx,
              }"
            >
              {{ tabTitle }}
            </div>
            <div class="sform_tab_close">
              <button
                class="close-button"
                @click="onCancelForm"
              >
                <mdicon name="close" size="16"></mdicon>
              </button>
            </div>
          </div>

          <s-form-buttons v-if="buttonsOnTop" ref="buttonsTopCtl" class="form_button_top"
              :hide-buttons="hideButtons" :hide-cancel-button="hideCancel" :hide-submit-button="hideSubmit" 
              :only-icon="onlyIconTop" :disable-submit="data.inSubmission || data.loading"
              :submit-text="submitText" :submit-icon="submitIcon" :cancel-text="cancelText" :cancel-icon="cancelIcon"
              :tab="data.currentTab"
              :showOnAllTabs="showButtonsOnAllTabs" 
              @submit-click="onSubmitForm" 
              @cancel-click="onCancelForm">
              <template #buttons_1="item"><slot name="buttons_1" :item="value" :in-submission="data.inSubmission" :loading="data.loading" :mode="mode"></slot></template>
              <template #buttons="item"><slot name="buttons" :item="value" :in-submission="data.inSubmission" :loading="data.loading" :mode="mode"></slot></template>
              <template #buttons_2="item"><slot name="buttons_2" :item="value" :in-submission="data.inSubmission" :loading="data.loading" :mode="mode"></slot></template>
          </s-form-buttons>
        </div>
        
        <div class="form_inputs" v-show="data.currentTab == 0">
          <slot name="form_header" :item="value" :config="config"></slot>
          
          <div class="section_group_container" :class="{'flex-col':config.setting.sectionDirection=='row'}">
            <div v-for="g in config.sectionGroups" 
              class="section_group" 
              :class="{
                'col flex-col w-full': config.setting.sectionDirection=='col' || 
                    (config.setting.sectionDirection=='row' && g.sections.length==1),
                grid: config.setting.sectionDirection=='row' && g.sections.length > 1,
                gridCol2: config.setting.sectionDirection=='row' && g.sections.length==2,
                gridCol3: config.setting.sectionDirection=='row' && g.sections.length==3,
                gridCol4: config.setting.sectionDirection=='row' && g.sections.length==4,
                gridCol5: config.setting.sectionDirection=='row' && g.sections.length==5,
                gridCol6: config.setting.sectionDirection=='row' && g.sections.length==6,
              }">
              <div v-for="(section, sectionIdx) in g.sections" v-show="section.visible" :key="section.id" class="section">    
              <div
                v-if="section.showTitle && section.title != ''"
                class="title section_title"
              >
                {{ section.title }}
              </div>
              <slot
                :name="'section_' + section.title.replace(' ', '') + '_header'"
                :item="value"
                :config="config"
                :mode="mode"
              ></slot>
              <div class="form-section-content">
                <div
                  v-for="(row, rowIdx) in section.rows"
                  :key="'form_section_' + sectionIdx + '_row_' + rowIdx"
                  class="form-row"
                  :class="{
                    gridCol1: row.colCount == 1,
                    gridCol2: row.colCount == 2,
                    gridCol3: row.colCount == 3,
                    gridCol4: row.colCount == 4,
                    gridCol5: row.colCount == 5,
                    gridCol6: row.colCount == 6,
                  }"
                >
                  <div
                    v-for="(input, inputIdx) in row.inputs.filter((el) => !el.hide)"
                    :key="
                      'form_input_' + sectionIdx + '_' + rowIdx + '_' + inputIdx
                    "
                    :class="{
                      colSpan1: input.colSpan == 1,
                      colSpan2: input.colSpan == 2,
                      colSpan3: input.colSpan == 3,
                      colSpan4: input.colSpan == 4,
                      colSpan5: input.colSpan == 5,
                      colSpan6: input.colSpan == 6,
                      colSpan7: input.colSpan == 7,
                      colSpan8: input.colSpan == 8,
                      colSpan9: input.colSpan == 9,
                      colSpan10: input.colSpan == 10,
                      colSpan11: input.colSpan == 11,
                      colSpan12: input.colSpan == 12,
                      'col-auto': input.colSpan == undefined || input.colSpan == 0,
                    }"
                  >
                    <slot
                      :name="'input_' + input.field + '_header'"
                      :item="value"
                      :config="input"
                      :mode="mode"
                    ></slot>
                    <slot
                      :name="'input_' + input.field"
                      :item="value"
                      :config="input"
                      :mode="mode"
                    >
                      <div v-if="input.kind == 'space'">&nbsp;</div>
                      <s-input
                        v-else-if="input.readOnly"
                        :field="input.field"
                        :kind="input.kind"
                        :label="input.label"
                        @change="handleChange"
                        :disabled="
                          data.inSubmission ||
                          data.loading ||
                          inputIsDisabled(input)
                        "
                        :caption="input.caption"
                        :hint="input.hint"
                        :multi-row="input.multiRow"
                        :use-list="input.useList"
                        :items="input.items"
                        :rules="input.rules"
                        :required="input.required"
                        :read-only="input.readOnly"
                        :lookup-url="input.lookupUrl"
                        :lookup-key="input.lookupKey"
                        :allow-add="input.allowAdd"
                        :lookup-format1="input.lookupFormat1"
                        :lookup-format2="input.lookupFormat2"
                        :lookup-payload-builder="input.lookupPayloadBuilder"
                        :decimal="input.decimal"
                        :date-format="input.dateFormat"
                        :multiple="input.multiple"
                        :keep-label="keepLabel"
                        :lookup-labels="input.lookupLabels"
                        :lookup-searchs="
                          input.lookupSearchs && input.lookupSearchs.length == 0
                            ? input.lookupLabels
                            : input.lookupSearchs
                        "
                        v-model="value[input.field]"
                      />
    
                      <s-input
                        v-else
                        :field="input.field"
                        :kind="input.kind"
                        :label="input.label"
                        @change="handleChange"
                        :disabled="
                          data.inSubmission ||
                          data.loading ||
                          inputIsDisabled(input) 
                        "
                        :caption="input.caption"
                        :hint="input.hint"
                        :multi-row="input.multiRow"
                        :use-list="input.useList"
                        :items="input.items"
                        :rules="input.rules"
                        :required="input.required"
                        :read-only="input.readOnly"
                        :lookup-url="input.lookupUrl"
                        :lookup-key="input.lookupKey"
                        :allow-add="input.allowAdd"
                        :lookup-format1="input.lookupFormat1"
                        :lookup-format2="input.lookupFormat2"
                        :lookup-payload-builder="input.lookupPayloadBuilder"
                        :decimal="input.decimal"
                        :date-format="input.dateFormat"
                        :multiple="input.multiple"
                        :keep-label="keepLabel"
                        :lookup-labels="input.lookupLabels"
                        :lookup-searchs="
                          input.lookupSearchs && input.lookupSearchs.length == 0
                            ? input.lookupLabels
                            : input.lookupSearchs
                        "
                        v-model="value[input.field]"
                        :class="{checkboxOffset: input.kind=='checkbox'}"
                        ref="inputs"
                      >
                        <template v-if="input.useList === true" #option="{option}">
                          <slot  :name="'input_' + input.field + '_option'" :option="option"  :mode="mode"></slot>
                        </template>
                        <template v-if="input.useList  === true" #selected-option="{option}">
                          <slot  :name="'input_' + input.field + '_selected-option'"  :option="option"  :mode="mode"> </slot>
                        </template>
                      </s-input>
                    </slot>
                    <slot
                      :name="'input_' + input.field + '_footer'"
                      :item="value"
                      :config="input"
                      :mode="mode"
                    ></slot>
                  </div>
                </div>
              </div>
              <slot
                :name="'section_' + section.title.replace(' ', '') + '_footer'"
                :item="value"
                :config="config"
                :mode="mode"
              ></slot>
            </div>
          </div>
          </div>
          <slot name="footer_1" :item="value" :config="config" :mode="mode"/>
  
          <div class="mt-2">
            <s-form-buttons v-if="buttonsOnBottom" ref="buttonsBottomCtl" class="form_button_bottom"
                :hide-buttons="hideButtons" :hide-cancel-button="hideCancel" :hide-submit-button="hideSubmit"
                :only-icon="onlyIconBottom" :disable-submit="data.inSubmission || data.loading" 
                :submit-text="submitText" :submit-icon="submitIcon" :cancel-text="cancelText" :cancel-icon="cancelIcon"
                :tab="data.currentTab" :showButtonsOnAllTabs="showButtonsOnAllTabs"
                @submit-click="onSubmitForm" @cancel-click="onCancelForm">
                <template #buttons_1="item"><slot name="buttons_1" :item="item"></slot></template>
                <template #buttons="item"><slot name="buttons" :item="item"></slot></template>
                <template #buttons_2="item"><slot name="buttons_2" :item="item"></slot></template>
            </s-form-buttons>
          </div>
  
          <slot name="footer_2" :item="value" :config="config" :mode="mode"/>
        </div>
  
        <div
          v-if="tabs.length > 1"
          v-for="(tabName, tabIdx) in tabs.slice(1, tabs.length)"
        >
          <div v-show="data.currentTab == tabIdx + 1">
            <slot :name="'tab_' + tabName.replace(' ', '_')" :item="modelValue" :mode="mode">
              {{ tabName }}
            </slot>
          </div>
        </div>
      </div>
  
      <s-loader v-else />
    </div>
</template>
  
<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import SFormButtons from "./SFormButtons.vue";
import SLoader from "./SLoader.vue";
import SInput from "./SInput.vue";
import { onUnmounted } from "vue";

const inputs = ref([]);

const buttonsTopCtl = ref(null);
const buttonsBottomCtl = ref(null);

const props = defineProps({
  config: {
    type: Object,
    default: () => {},
  },
  submitIcon: { type: String, default: "content-save" },
  submitText: { type: String, default: "Save" },
  cancelIcon: { type: String, default: "rewind" },
  cancelText: { type: String, default: "Back" },
  hideSubmit: { type: Boolean, default: false },
  hideCancel: { type: Boolean, default: false },
  hideButtons: { type: Boolean, default: false },
  buttonsOnTop: { type: Boolean, default: true },
  buttonsOnBottom: { type: Boolean },
  keepLabel: { type: Boolean },
  showButtonsOnAllTabs: { type: Boolean, default: false },
  onlyIconTop: { type: Boolean, default: false },
  onlyIconBottom: { type: Boolean, default: false },
  loading: { type: Boolean },
  autoFocus: { type: Boolean },
  mode: { type: String, default: "edit" }, // mode: new, edit, view
  modelValue: { type: Object, default: () => {} },
  tabs: { type: Array, default: () => [] },
  initialTab: { type: Number, default: 0 },
  focus: { type: Boolean, default: false },
});

const emit = defineEmits({
  cancelForm: null,
  preSubmitForm: null,
  postSubmitForm: null,
  onSubmit: null,
  submitForm: null,
  fieldChange: null,
  recordChange: null,
  "update:modelValue": null,
});

defineExpose({
  validate,
  showError,
  calcChangeFields,
  getSection,
  setSectionAttr,
  getField,
  removeField,
  setFieldAttr,
  submit: onSubmitForm,
  setLoading,
  getLoading,  
  setCurrentTab,
  getCurrentTab,
  getAllField
});

//const inputValidities = ref({});

const data = reactive({
  inSubmission: false,
  loading: false,
  showSubmitError: false,
  submitErrorTxt: "",
  currentTab: props.initialTab,
  changeFields: [],

});

const inputIsDisabled = (input) => {
  if (props.mode == "view") return input.disabled===false ? false : true;
  if (input.readOnly) return true;
  if (input.disabled) return true;
  
  if (props.mode == "new" && input.readOnlyOnNew) return true;
  if (props.mode == "edit" && input.readOnlyOnEdit) return true;
  
  return false;
};

function validate() {
  let isValid = true;
  inputs.value.forEach((el) => {
    if (!el.validate()) {
      isValid = false;
    }
  });
  return isValid;
}

function onSubmitForm() {
  let isValid = true;
  try {
    emit("preSubmitForm", props.modelValue);
    isValid = validate();
  } catch (err) {
    showError(err);
    return;
  }

  data.inSubmission = true;
  data.hasErrors = false;

  if (!isValid) {
    data.inSubmission = false;
    showError();
    return;
  }

  emit(
    "submitForm",
    props.modelValue,
    () => {
      data.inSubmission = false;
      emit("postSubmitForm", props.modelValue);
    },
    () => {
      data.inSubmission = false;
    }
  );
}

function showError() {}

function handleChange(name, value1, value2, oldValue) {
  const v = props.modelValue;
  const input = getConfigInputByName(name);
  if (input == undefined) return;

  if ((input.kind=="date" || input.kind=="datetime") && (value1=="" || value1==null || value1==undefined)) {
    v[name] = null;
  } else {
    v[name] = value1;
  } 
  
  if (input.labelField && input.labelField != "") {
    v[input.labelField] = value2;
  }
  
  emit("update:modelValue", v);
  nextTick(() => {
    emit("fieldChange", name, value1, value2, oldValue);
  });
}

const value = computed({
  get() {
    return props.modelValue;
  },

  set(v) {
    emit("update:modelValue", v);
  },
});

function onCancelForm() {
  emit("cancelForm");
}

function calcChangeFields(cfg) {
  if (cfg == undefined) cfg = props.config;
  if (!(cfg && cfg.sections)) return;

  const changefieldsBuffer = [];
  cfg.sectionGroups.forEach((sg) => {
    sg.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.inputs.forEach((input) => {
          if (input.labelField != "" || input.needChangeHandler === true)
            changefieldsBuffer.push(input.field);
        });
      });
    });
  });

  data.changeFields = changefieldsBuffer;
}

function getConfigInputByName(fieldName) {
  if (props.config.sectionGroups == undefined) return;
  let found = false;
  let resInput = undefined;
  props.config.sectionGroups.forEach((sg) => {
    sg.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.inputs.forEach((input) => {
          if (input.field == fieldName) {
            found = true;
            resInput = input;
            return;
          }
        });
        if (found) return;
      });
      if (found) return;
    });
    if (found) return;
  });
  return resInput;
}

function nextTab() {
  if (props.tabs.length > 1) {
    data.currentTab = data.currentTab + 1;
    if (data.currentTab >= props.tabs.length) data.currentTab = 0;
  }
}

function prevTab() {
  if (props.tabs.length > 1) {
    data.currentTab = data.currentTab - 1;
    if (data.currentTab < 0) data.currentTab = props.tabs.length - 1;
  }
}

function getSection(name) {
  let found = false;
  let section = undefined;

  props.config.sectionGroups.forEach((g) => {
    g.sections.forEach((s) => {
      if (s.title == name) {
        found = true;
        section = s;
      }
      if (found) return;
    });
    if (found) return;
  });
  return section;
}

function getField(name) {
  let field;
  let found;
  props.config.sectionGroups.forEach((g) => {
    if (found) return;
    g.sections.forEach((section) => {
      if (found) return;
      section.rows.forEach((row) => {
        if (found) return;
        row.inputs.forEach((input) => {
          if (found) return;

          if (input.field == name) {
            found = true;
            field = input;
          }
        });
      });
    });
  }); 

  if (found) return field;
}

function getAllField() {
  let fields = []
  props.config.sectionGroups.forEach((g) => {
    g.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.inputs.forEach((input) => {
          fields.push(input)
        });
      });
    });
  });
  return fields
}

function removeField(name) {
  props.config.sectionGroups.forEach((g) => {
    g.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.inputs = row.inputs.filter((input) => input.field != name);
      });
    });
  });

  props.config.sectionGroups.forEach((g) => {
    g.sections.forEach((section) => {
      section.rows = section.rows.filter((row) => row.inputs.length > 0);
    });
  });
}

function setSectionAttr(name, attr, value) {
  props.config.sectionGroups.forEach((sg) => {
    sg.sections.forEach((s) => {
      if (s.title == name) {
        s[attr] = value;
      }
    });
  });
}

function setFieldAttr(name, attr, value) {
  props.config.sectionGroups.forEach((g) => {
    g.sections.forEach((s) => {
      s.rows.forEach((row) => {
        row.inputs.forEach((input) => {
          if (input.field == name) { 
            input[attr] = value;
          }
        });
      });
    });
  });
}

function setLoading(loading) {
  data.loading = loading
}

function getLoading() {
  return data.loading
}

function setCurrentTab(tabIdx) {
  if(props.tabs.length > 1) data.currentTab = isNaN(parseInt(tabIdx)) ? 0 : parseInt(tabIdx)

}
function getCurrentTab() {
  return data.currentTab
}

watch(
  () => props.modelValue,
  (newValue) => {
    emit("recordChange", newValue);
  },
  { deep: true }
);

let formsInputs = ref([])

onMounted(() => {
  calcChangeFields();
  if (
    props.autoFocus &&
    inputs.value.length > 0 &&
    typeof inputs.value[0].focus == "function"
  )
  inputs.value[0].focus();
  document.addEventListener("keydown", handleKeyDown);
  formsInputs.value = Array.from(document.querySelectorAll(".suim_form input, .suim_form select, .suim_form textarea"))
      .filter(input => !input.disabled);
  if (formsInputs.value.length > 0) {
    formsInputs.value[0].focus();
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
})

function handleKeyDown(event) {
  if (event.altKey && event.key === "ArrowRight") {
    event.preventDefault();
    nextTab();
  } else if (event.altKey && event.key === "ArrowLeft") {
    event.preventDefault();
    prevTab();
  } 
}

</script>
  
  <style scoped>
  .header {
    margin-bottom: 0.5rem;
    display: flex;
  }

  .tab_container {
    display: flex;
    flex-grow: 1;
  }

  .sform_tab_close {
    display: flex;
    gap: 0.5rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }

  .close-button {
    padding: 0.25rem;
  }

  .close-button:hover {
    background-color: white;
    color: var(--primary-color);
  }

  .section_group_container {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .form_button_top {
    flex-grow: 1;
  }

  .form-section-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-row {
    width: 100%;
    align-items: flex-start;
    gap: 0.5rem;
    display: grid;
  }

  .gridCol1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .gridCol2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gridCol3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .gridCol4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .gridCol5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .gridCol6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .gridCol7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }
  .gridCol8 { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  .gridCol9 { grid-template-columns: repeat(9, minmax(0, 1fr)); }
  .gridCol10 { grid-template-columns: repeat(10, minmax(0, 1fr)); }
  .gridCol11 { grid-template-columns: repeat(11, minmax(0, 1fr)); }
  .gridCol12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

  .colSpan1 { grid-column: span 1 / span 1; }
  .colSpan2 { grid-column: span 2 / span 2; }
  .colSpan3 { grid-column: span 3 / span 3; }
  .colSpan4 { grid-column: span 4 / span 4; }
  .colSpan5 { grid-column: span 5 / span 5; }
  .colSpan6 { grid-column: span 6 / span 6; }
  .colSpan7 { grid-column: span 7 / span 7; }
  .colSpan8 { grid-column: span 8 / span 8; }
  .colSpan9 { grid-column: span 9 / span 9; }
  .colSpan10 { grid-column: span 10 / span 10; }
  .colSpan11 { grid-column: span 11 / span 11; }
  .colSpan12 { grid-column: span 12 / span 12; }
  </style>
  