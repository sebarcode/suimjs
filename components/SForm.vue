<template>
    <div class="suim_form">
      <div v-if="config && config.setting">
        <h1 v-if="config.setting.showTitle && config.setting.title != ''">
          {{ config.title }}
        </h1>
  
        <!-- tab header -->
        <div
          class="flex gap-1 mb-2 items-center font-semibold"
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
          <div class="flex gap-2 ml-2 mr-2">
            <button
              class="p-1 hover:bg-white hover:text-primary"
              @click="onCancelForm"
            >
              <mdicon name="close" size="16"></mdicon>
            </button>
          </div>
        </div>
  
        <div id="form_inputs" v-if="data.currentTab == 0">
            <s-form-buttons v-if="buttonsOnTop" ref="buttonsTopCtl"
                :hide-buttoms="hideButtons" :hide-cancel-button="hideCancel" :hide-submit-button="hideSubmit"
                :only-icon="onlyIconTop" :disable-submit="data.inSubmission"
                :submit-text="submitText" :submit-icon="submitIcon" :cancel-text="cancelText" :cancel-icon="cancelIcon"
                @submit-click="onSubmitForm" @cancel-click="onCancelForm">
                <template #buttons_1="item"><slot name="buttons_1" :item="item"></slot></template>
                <template #buttons="item"><slot name="buttons" :item="item"></slot></template>
                <template #buttons_2="item"><slot name="buttons_2" :item="item"></slot></template>
            </s-form-buttons>
            <slot name="form_header" :item="value" :config="config" />
          <div
            v-for="(section, sectionIdx) in config.sections"
            :key="'form_section_' + sectionIdx"
            v-show="section.visible"
            class="section"
          >
            <h3
              v-if="section.showTitle && section.title != ''"
              class="border-b border-slate-600 pb-1"
            >
              {{ section.title }}
            </h3>
            <slot
              :name="'section_' + section.title.replace(' ', '') + '_header'"
              :item="value"
              :config="config"
            ></slot>
            <div class="flex flex-col gap-2">
              <div
                v-for="(row, rowIdx) in section.rows"
                :key="'form_section_' + sectionIdx + '_row_' + rowIdx"
                class="w-full items-start gap-2 grid-flow-col grid"
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
                  <!--
                  {{ inputIdx==0 ?  `grid-cols-${row.colCount}` : ''}}
                  {{ input.colSpan==undefined || input.colSpan=='' || input.colSpan=='auto' || input.colSpan=='0' ? `` : `col-span-${input.colSpan}` }}
                  -->
                  <slot
                    :name="'input_' + input.field + '_header'"
                    :item="value"
                    :config="input"
                  ></slot>
                  <slot
                    :name="'input_' + input.field"
                    :item="value"
                    :config="input"
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
                        inputIsDisabled(input) ||
                        input.readOnly ||
                        mode == 'view'
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
                      :decimal="input.decimal"
                      :date-format="input.dateFormat"
                      :multiple="input.multiple"
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
                        inputIsDisabled(input) ||
                        input.readOnly ||
                        mode == 'view'
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
                      :decimal="input.decimal"
                      :date-format="input.dateFormat"
                      :multiple="input.multiple"
                      :lookup-labels="input.lookupLabels"
                      :lookup-searchs="
                        input.lookupSearchs && input.lookupSearchs.length == 0
                          ? input.lookupLabels
                          : input.lookupSearchs
                      "
                      v-model="value[input.field]"
                      :class="{checkboxOffset: input.kind=='checkbox'}"
                      ref="inputs"
                    />
                  </slot>
                  <slot
                    :name="'input_' + input.field + '_footer'"
                    :item="value"
                    :config="input"
                  ></slot>
                </div>
              </div>
            </div>
            <slot
              :name="'section_' + section.title.replace(' ', '') + '_footer'"
              :item="value"
              :config="config"
            ></slot>
          </div>
          <slot name="footer_1" :item="value" :config="config" />
  
          <div class="mt-2">
            <s-form-buttons v-if="buttonsOnBottom" ref="buttonsBottomCtl"
                :hide-buttoms="hideButtons" :hide-cancel-button="hideCancel" :hide-submit-button="hideSubmit"
                :only-icon="onlyIconBottom" :disable-submit="data.inSubmission" 
                :submit-text="submitText" :submit-icon="submitIcon" :cancel-text="cancelText" :cancel-icon="cancelIcon"
                @submit-click="onSubmitForm" @cancel-click="onCancelForm">
                <template #buttons_1="item"><slot name="buttons_1" :item="item"></slot></template>
                <template #buttons="item"><slot name="buttons" :item="item"></slot></template>
                <template #buttons_2="item"><slot name="buttons_2" :item="item"></slot></template>
            </s-form-buttons>
          </div>
  
          <slot name="footer_2" :item="value" :config="config" />
        </div>
  
        <div
          v-if="tabs.length > 1"
          v-for="(tabName, tabIdx) in tabs.slice(1, tabs.length)"
        >
          <div v-show="data.currentTab == tabIdx + 1">
            <slot :name="'tab_' + tabName.replace(' ', '_')" :item="modelValue">
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
  
  const inputs = ref([]);

  const buttonsTopCtl = ref(null)
  const buttonsBottomCtl = ref(null)
  
  const props = defineProps({
    config: {
      type: Object,
      default: () => {},
    },
    submitIcon: {type: String, default:'content-save'},
    submitText: {type: String, default: 'Save'},
    cancelIcon: {type: String, default:'rewind'},
    cancelText: {type: String, default: 'Cancel'},
    hideSubmit: { type: Boolean, default: false },
    hideCancel: { type: Boolean, default: false },
    hideButtons: { type: Boolean, default: false },
    buttonsOnTop: { type: Boolean, default: true},
    buttonsOnBottom: { type: Boolean }, 
    onlyIconTop: { type: Boolean, default: false},
    onlyIconBottom: { type: Boolean, default: false},
    loading: { type: Boolean },
    autoFocus: { type: Boolean },
    mode: { type: String, default: "edit" }, // mode: new, edit, view
    modelValue: { type: Object, default: () => {} },
    tabs: { type: Array, default: () => [] },
    initialTab: { type: Number, default: 0 },
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
    setFieldAttr,
    submit: onSubmitForm,
  });
  
  //const inputValidities = ref({});
  
  const data = reactive({
    inSubmission: false,
    showSubmitError: false,
    submitErrorTxt: "",
    currentTab: props.initialTab,
    changeFields: [],
  });
  
  const inputIsDisabled = (input) => {
    if (props.mode == "view") return true;
  
    if (props.mode == "new" && input.readOnlyOnNew) return true;
    if (props.mode == "edit" && input.readOnlyOnEdit) return true;
  
    return false;
  };
  
  function validate() {
    let isValid = true;
    inputs.value.forEach((el) => {
      if (!el.validate()) {
        //el.debug()
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
  
  function showError() {
  }
  
  function handleChange(name, value1, value2, oldValue) {
    //console.log(name,"is changed from",oldValue,"to",value1,value2)
    const v = props.modelValue;
    const input = getConfigInputByName(name);
    if (input == undefined) return;
  
    if (input.labelField && input.labelField != "") {
      v[name] = value1;
      v[input.labelField] = value2;
      //console.log('configInputByName', data.changeFields[0], v[input.field], v[input.labelField])
    }
    emit("update:modelValue", v);
    nextTick(() => {
      emit("fieldChange", name, value1, value2, oldValue);
    });
  }
  
  /*
  function inputValidated(field, isValid) {
    inputValidities[field] = isValid;
  }
  */
  
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
    //console.log('changefields calculated')
  
    const changefieldsBuffer = [];
    cfg.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.inputs.forEach((input) => {
          if (input.labelField != "" || input.needChangeHandler === true)
            changefieldsBuffer.push(input.field);
        });
      });
    });
    data.changeFields = changefieldsBuffer;
  }
  
  function getConfigInputByName(fieldName) {
    if (props.config.sections == undefined) return;
    let found = false;
    let resInput = undefined;
    props.config.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.inputs.forEach((input) => {
          //console.log(input.field, fieldName)
          //if (input.labelField != "" || input.needChangeHandler === true) changefieldsBuffer.push(input.field)
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
    return resInput;
  }
  
  function getSection(name) {
    const sections = props.config.sections.filter((x) => x.Title == name);
    if (sections && sections.length > 0) return sections[0];
  }
  
  function getField(name) {
    let field;
    let found;
    props.config.sections.forEach((section) => {
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
  
    if (found) return field;
  }
  
  function setSectionAttr(name, attr, value) {
    const sections = props.config.sections.filter((x) => x.Title == name);
    if (sections && sections.length > 0) {
      sections[0][attr] = value;
    }
  }
  
  function setFieldAttr(name, attr, value) {
    props.config.sections.forEach((section, sIdx) => {
      section.rows.forEach((row, rIdx) => {
        row.inputs.forEach((input) => {
          //console.log(name)
          if (input.field == name) {
            input[attr] = value;
          }
        });
      });
    });
  }
  
  watch(
    () => props.modelValue,
    (newValue) => {
      emit("recordChange", newValue);
    },
    { deep: true }
  );
  
  onMounted(() => {
    calcChangeFields();
    if (
      props.autoFocus &&
      inputs.value.length > 0 &&
      typeof inputs.value[0].focus == "function"
    )
      inputs.value[0].focus();
  });
  </script>
  
  <style scope>
  .tab_selected {
    @apply p-2 border-b-[5px] border-primary text-primary;
  }
  
  .tab {
    @apply p-2 border-b border-slate-600 cursor-pointer hover:text-secondary hover:border-secondary;
  }

  .gridCol1 {@apply grid-cols-1}
  .gridCol2 {@apply grid-cols-2}
  .gridCol3 {@apply grid-cols-3}
  .gridCol4 {@apply grid-cols-4}
  .gridCol5 {@apply grid-cols-5}
  .gridCol6 {@apply grid-cols-6}
  .gridCol7 {@apply grid-cols-7}
  .gridCol8 {@apply grid-cols-8}
  .gridCol9 {@apply grid-cols-9}
  .gridCol10 {@apply grid-cols-10}
  .gridCol11 {@apply grid-cols-11}
  .gridCol12 {@apply grid-cols-12}

  .colSpan1 { @apply col-span-1 }
  .colSpan2 { @apply col-span-2 }
  .colSpan3 { @apply col-span-3 }
  .colSpan4 { @apply col-span-4 }
  .colSpan5 { @apply col-span-5 }
  .colSpan6 { @apply col-span-6 }
  .colSpan7 { @apply col-span-7 }
  .colSpan8 { @apply col-span-8 }
  .colSpan9 { @apply col-span-9 }
  .colSpan10 { @apply col-span-10 }
  .colSpan11 { @apply col-span-11 }
  .colSpan12 { @apply col-span-12 }

  .checkboxOffset { @apply pt-[22px] }
  </style>
  