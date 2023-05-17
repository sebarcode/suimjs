<template>
    <s-card :title="title" class="w-full bg-white" hide-footer :no-gap="noGap" :hide-title="hideTitle">
      <div v-if="data.listCfg.setting && gridMode == 'list'" v-show="data.appMode == 'grid'">
          <s-list ref="listGrid" class="w-full" :read-url="data.gridReadUrl" :delete-url="data.gridDeleteUrl"
              :hide-search="gridHideSearch" :hide-control="gridHideControl" :hide-sort="gridHideSort"
              :hide-delete-button="gridHideDelete" :hide-refresh-button="gridHideRefresh"
              :hide-new-button="gridHideNew" v-if="data.listCfg.setting" :config="data.listCfg"
              @select-data="selectData" @new-data="newData">
              <template v-slot:item="item">
                  <slot name="list_item" :item="item" :config="data.listCfg">
                      {{ item }}
                  </slot>
              </template>
              <template #grid_item_buttons_1="item">
                  <slot name="list_item_buttons_1" :item="item"></slot>
              </template>
              <template #grid_item_buttons="item">
                  <slot name="list_item_buttons" :item="item"></slot>
              </template>
              <template #grid_item_buttons_2="item">
                  <slot name="list_item_buttons_2" :item="item"></slot>
              </template>
          </s-list>
        </div>

        <div v-if="data.listCfg.setting && gridMode == 'grid'" v-show="data.appMode == 'grid'">
            <s-grid ref="listGrid" class="w-full" :hide-select="gridHideSelect" :editor="gridEditor"
                :read-url="data.gridReadUrl" :update-url="data.gridUpdateUrl" :delete-url="data.gridDeleteUrl"
                :config="data.listCfg" :hide-search="gridHideSearch" :hide-control="gridHideControl"
                :hide-detail="gridHideDetail"
                :hide-sort="gridHideSort" :hide-delete-button="gridHideDelete" :label-method="gridLabelMethod"
                :hide-refresh-button="gridHideRefresh" :hide-new-button="gridHideNew" 
                :custom-filter="gridCustomFilter"
                @select-data="selectData" @new-data="newData" 
                @row-updated="gridRowUpdated" @row-field-changed="handleGridFieldChanged" 
                @row-deleted="handleGridRowDeleted">
                <template #header_search="{config}">
                    <slot name="grid_header_search" :config="config"></slot>
                </template>
                <template #header_buttons_1="{ config }">
                    <slot name="grid_header_buttons_1" :config="config"></slot>
                </template>
                <template #header_buttons="{ config }">
                    <slot name="grid_header_buttons" :config="config"></slot>
                </template>
                <template #header_buttons_2="{ config }">
                    <slot name="grid_header_buttons_2" :config="config"></slot>
                </template>
                <template #item_buttons_1="prop">
                    <slot name="grid_item_buttons_1" :item="prop.item" :config="prop.config" />
                </template>

        <template #item_buttons="prop">
          <slot
            name="grid_item_buttons"
            :item="prop.item"
            :config="prop.config"
          />
        </template>

        <template #item_buttons_2="prop">
          <slot
            name="grid_item_buttons_2"
            :item="prop.item"
            :config="prop.config"
          />
        </template>

        <template
          v-for="slotname in gridFieldInputSlotNames"
          v-slot:[slotname.itemSlotName]="slotData"
        >
          <slot
            :name="slotname.gridSlotName"
            :item="slotData.item"
            :config="slotData.config"
          ></slot>
        </template>
      </s-grid>
    </div>

    <s-form
      ref="listForm"
      v-if="data.appMode == 'form' && data.formCfg.setting"
      v-model="data.record"
      :config="data.formCfg"
      :mode="data.formMode"
      class="pt-2"
      :auto-focus="formAutoFocus"
      @submitForm="save"
      :tabs="formTabTitles"
      :initialTab="formInitialTab"
      @cancelForm="cancelForm"
      :hide-buttons="formHideButtons"
      :hide-submit="formHideSubmit"
      :hide-cancel="formHideCancel"
      @fieldChange="handleFormFieldChange"
      @recordChange="handleFormRecordChange"
    >
      <template
        v-for="name in formFieldInputSlotNames"
        v-slot:[name]="slotData"
      >
        <slot
          :name="'form_' + name"
          :item="slotData.item"
          :config="slotData.config"
        ></slot>
      </template>

      <template v-for="tabName in formTabNames" v-slot:[tabName]="{ item }">
        <slot
          :name="'form_' + tabName"
          :item="item"
          :config="{
            formMode: data.formMode,
            appMode: data.appMode,
            formCfg: data.formCfg,
          }"
        >
          {{ tabName }}
        </slot>
      </template>

      <template #buttons>
        <slot name="form_buttons"></slot>
      </template>

      <template #buttons_1="{ item, config }">
        <slot name="form_buttons_1" :item="item" :config="config"></slot>
      </template>

      <template #buttons_2="{ item, config }">
        <slot name="form_buttons_2" :item="item" :config="config"></slot>
      </template>

      <template v-slot:footer_1="{ item, config }">
        <slot name="form_footer_1" :item="item" :config="config"></slot>
      </template>

      <template v-slot:footer_2="{ item, config }">
        <slot name="form_footer_2" :item="item" :config="config"></slot>
      </template>
    </s-form>
  </s-card>
</template>

<script setup>
import SCard from './SCard.vue'
import SGrid from './SGrid.vue'
import SList from './SList.vue'
import SForm from './SForm.vue'
import loadFormConfig from '../scripts/load_form_config.js'
import loadGridConfig from '../scripts/load_grid_config.js'

import {
  reactive,
  inject,
  onMounted,
  ref,
  nextTick,
  computed,
  watch,
} from "vue";
import util from "../scripts/util.js";

const props = defineProps({
    noGap: { type: Boolean },
    title: { type: String, default: "" },
    hideTitle: { type: Boolean },
    gridEditor: { type: Boolean },
    gridFields: { type: Array, default: () => [] },
    gridHideControl: { type: Boolean, default: false },
    gridHideSearch: { type: Boolean, default: false },
    gridHideSelect: { type: Boolean, default: false },
    gridHideDetail: { type: Boolean },
    gridHideSort: { type: Boolean },
    gridHideNew: { type: Boolean, default: false },
    gridHideRefresh: { type: Boolean, default: false },
    gridHideDelete: { type: Boolean, default: false },
    gridCustomFilter: { type: Object, default: () => {}},
    formFields: { type: Array, default: () => [] },
    formConfig: { type: [String, Object], default: () => { } },
    formDefaultMode: { type: String, default: "edit" },
    formRead: { type: [String, Object], default: () => { } },
    formInsert: { type: [String, Object], default: () => { } },
    formUpdate: { type: [String, Object], default: () => { } },
    formHideButtons: { type: Boolean, default: false },
    formHideSubmit: { type: Boolean, default: false },
    formHideCancel: { type: Boolean, default: false },
    formAutoFocus: { type: Boolean },
    gridMode: { type: String, default: "list" },
    gridLabelMethod: { type: String, default: "labelfield" },
    gridConfig: { type: [String, Object], default: () => { } },
    gridRead: { type: [String, Object], default: () => { } },
    gridUpdate: { type: [String, Object], default: () => { } },
    gridDelete: { type: [String, Object], default: () => { } },
    stayOnFormAfterSave: { type: Boolean, default: false },
    formTabsNew: { type: Array, default: () => [] },
    formTabsEdit: { type: Array, default: () => [] },
    formTabsView: { type: Array, default: () => [] },
    formInitialTab: { type: Number, default: 0 },
    initAppMode: { type: String, default: "grid" },
    //initFormMode: { type: String, default: "edit" },
})

const axios = inject("axios");
const emit = defineEmits({
    "preSave": null,
    "postSave": null,
    "formFieldChange": null,
    "formRecordChange": null,
    "formNewData": null,
    "formEditData": null,
    "formLoaded": null,
    "alterGridConfig": null,
    "alterFormConfig": null,
    "gridRowUpdated": null,
    "gridRowDeleted": null,
    "gridRowFieldChanged": null,
})

const data = reactive({
  appMode: props.initAppMode,
  formMode: props.formDefaultMode,
  formCfg: {},
  listCfg: {},
  gridReadUrl: props.gridRead,
  gridDeleteUrl: props.gridDelete,
  gridUpdateUrl: props.gridUpdate,
  record: {
    Enable: true,
  },
});

const listGrid = ref(null);
const listForm = ref(null);

function handleFormFieldChange(name, v1, v2, old) {
  emit("formFieldChange", name, v1, v2, old, data.record);
}

function handleFormRecordChange(nv) {
  emit("formRecordChange", nv);
}

function handleGridFieldChanged(name, v1, v2, old, record) {
    emit("gridRowFieldChanged", name, v2, v2, old, record)
}

function handleGridRowDeleted (record) {
    emit("gridRowDeleted", record)
}

const formTabTitles = computed({
  get() {
    let tabNames =
      data.formMode == "new"
        ? props.formTabsNew
        : data.formMode == "edit"
        ? props.formTabsEdit
        : props.formTabsView;

    return tabNames;
  },
});

const formTabNames = computed({
  get() {
    let tabNames =
      data.formMode == "new"
        ? props.formTabsNew
        : data.formMode == "edit"
        ? props.formTabsEdit
        : props.formTabsView;

    if (tabNames.length <= 1) return [];

    return tabNames.slice(1, tabNames.length).map((el) => {
      return "tab_" + el.replace(" ", "_");
    });
  },
});

const formFieldInputSlotNames = computed({
  get() {
    return props.formFields.map((el) => {
      return "input_" + el;
    });
  },
});

const gridFieldInputSlotNames = computed({
  get() {
    return props.gridFields.map((el) => {
      return {
        itemSlotName: "item_" + el,
        gridSlotName: "grid_" + el,
      };
    });
  },
});

function selectData(dt, op) {
  axios.post(props.formRead, [dt._id]).then(
    (r) => {
      emit("formEditData", r.data);
      data.appMode = "form";
      data.formMode = props.formDefaultMode;
      data.record = r.data;
      nextTick(() => {
        emit("formLoaded", data.record);
      });
    },
    (e) => {
      util.showError(e);
    }
  );
}

function newData(dt) {
    if (dt == undefined) dt = {}
    emit("formNewData", dt)
    data.record = dt == undefined ? {} : dt
    data.appMode = "form"
    data.formMode = "new"
    nextTick(() => {
        emit("gridRowUpdated", data.record)
        emit("formLoaded", data.record)
    })
}

function cancelForm() {
  data.appMode = "grid";
  nextTick(() => {
    listGrid.value.refreshData();
  });
}

function save(saveData, cbOK, cbFalse) {
    emit("preSave", data.record)
    const saveUrl = data.formMode == "new" ? props.formInsert : props.formUpdate
    axios.post(saveUrl, data.record).then(r => {
        let record = r.data
        data.record = record
        emit("postSave", record)
        emit("gridRowUpdated", record)
        if (!props.stayOnFormAfterSave) {
            data.appMode = "grid"
            nextTick(() => {
                listGrid.value.refreshData()
            })
        } else {
            util.showInfo("data has been saved")
            selectData(data.record, "detail")
        }
        cbOK()
    }, e => {
        util.showError(e)
        cbFalse()
    })
}

function gridRowUpdated (dt) {
    emit("gridRowUpdated", dt)
}

function refreshList() {
  loadGridConfig(axios, props.gridConfig).then(
    (r) => {
      emit("alterGridConfig", r);
      data.listCfg = r;
    },
    (e) => util.showError(e)
  );
  if (typeof props.gridRead == "string") data.gridReadUrl = props.gridRead;
}

function refreshForm() {
  loadFormConfig(axios, props.formConfig).then(
    (r) => {
      emit("alterFormConfig", r);
      data.formCfg = r;
    },
    (e) => util.showError(e)
  );
}

function getFormSection(name) {
  return listForm.value.getSection(name);
}

function getFormField(name) {
  return listForm.value.getField(name);
}

function setFormSectionAttr(name, attr, value) {
  if (listForm.value == undefined) return;
  listForm.value.setSectionAttr(name, attr, value);
}

function setFormFieldAttr(name, attr, value) {
  if (listForm.value == undefined) {
    console.warn("calling setFormFieldAttr when form is not yet initiated");
    return;
  }
  listForm.value.setFieldAttr(name, attr, value);
}

function getGridConfig() {
  return data.listCfg;
}

function setGridConfig(cfg) {
  data.listCfg = cfg;
}

function setListAttr(name, attr, value) {
  const fields = data.listCfg.fields.map((el) => {
    if (el.field != name) return el;

    el[attr] = value;
    return el;
  });
  data.listCfg.fields = fields;
}

function getFormRecord() {
  return data.record;
}

function setFormRecord(record) {
  data.record = record;
}

function getGridRecords () {
    return listGrid.value.getRecords()
}

function getGridRecord (idx) {
    return listGrid.value.getRecord(idx)
}

function setGridRecord (idx, dt) {
    return listGrid.value.setRecord(idx, dt)
}

function setGridRecordByID (dt) {
    return listGrid.value.setRecordByID(dt)
}

function setFormMode(mode) {
  data.formMode = mode;
}

function getFormMode () {
    return data.formMode
}

function newGridData () {
    if (listGrid.value) {
        listGrid.value.newData()
    }
}

function refreshGrid () {
    refreshList()
}

watch(
  () => props.gridRead,
  (nv) => {
    data.gridReadUrl = nv;
    util.nextTickN(1, () => listGrid.value.refreshData());
  }
);

defineExpose({
    getGridRecords, getGridRecord, refreshGrid, setGridRecord, setGridRecordByID,
    getFormRecord, setFormRecord, getFormField,
    setFormFieldAttr, getFormSection, setFormSectionAttr,
    getGridConfig, setGridConfig,
    setListAttr, refreshList, refreshForm,
    setFormMode, getFormMode, newGridData, submitForm, cancelForm
})

onMounted(() => {
  refreshList();
  refreshForm();
});
</script>
