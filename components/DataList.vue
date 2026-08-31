<template> 
  <s-card
    :title="resolvedGridTitle"
    class="w-full bg-white suim_datalist"
    hide-footer
    :no-gap="noGap"
    :hide-title="hideTitle"
  >
    <template v-if="data.loadingGridCfg || data.loadingSelectData" >
      <slot name="loader">
        <div class="loader"></div>
      </slot> 
    </template>


    <div
      v-if="data.listCfg.setting && gridMode == 'list'"
      v-show="isGridVisible"
    >
      <s-list
        ref="gridCtl"
        class="w-full"
        :read-url="data.gridReadUrl"
        :delete-url="data.gridDeleteUrl"
        :hide-search="gridHideSearch"
        :hide-control="gridHideControl"
        :hide-sort="gridHideSort"
        :hide-delete-button="gridHideDelete"
        :hide-refresh-button="gridHideRefresh"
        :hide-edit="gridHideEdit"
        :hide-new-button="gridHideNew"
        :hide-paging="gridHidePaging"
        :sort-field="gridSortField"
        :sort-direction="gridSortDirection"
        :page-size="gridPageSize"
        @list-refreshed="handleGridRefreshed"
        v-if="data.listCfg.setting"
        :config="data.listCfg"
        :keyword-operation="listKeywordOperation"
        @select-data="selectData"
        @new-data="newData"
        @resetCustomFilter="handleGridResetCustomFilter"
      >
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
        <template #footer_1="prop">
          <slot name="grid_footer_1" :items="prop.items" :recordCount="prop.recordCount" :currentPage="prop.currentPage" :pageCount="prop.pageCount"></slot>
        </template>
        <template #paging="prop" v-if="!gridHidePaging">
          <slot name="grid_paging" :items="prop.items" :recordCount="prop.recordCount" :currentPage="prop.currentPage" :pageCount="prop.pageCount"></slot>
        </template>
        <template #footer_2="prop">
          <slot name="grid_footer_2" :items="prop.items" :recordCount="prop.recordCount" :currentPage="prop.currentPage" :pageCount="prop.pageCount"></slot>
        </template>
      </s-list>
    </div>

    <!--<div>
      Grid debug:
      gridMode: {{  data.gridMode }}<br/>
      controlMode: {{ data.controlMode }}<br/>
    </div>-->

    <div
      v-if="data.listCfg.setting && gridMode == 'grid'"
      v-show="isGridVisible"
    >
      <s-grid
        ref="gridCtl"
        class="w-full"
        :hide-select="gridHideSelect"
        :editor="gridEditor"
        :read-url="data.gridReadUrl"
        :update-url="data.gridUpdateUrl"
        :delete-url="data.gridDeleteUrl"
        :config="data.listCfg"
        :hide-action="gridHideAction"
        :hide-search="gridHideSearch"
        :hide-control="gridHideControl"
        :hide-detail="gridHideDetail"
        :hide-sort="gridHideSort"
        :hide-edit="gridHideEdit"
        :disable-dbl-click="gridDisableDblClick"
        :hide-paging="gridHidePaging"
        :hide-save-button="gridHideSave"
        :hide-delete-button="gridHideDelete"
        :label-method="gridLabelMethod"
        :hide-refresh-button="gridHideRefresh"
        :id-field-name="idFieldName"
        :hide-new-button="gridHideNew"
        :custom-filter="gridCustomFilter"
        :no-confirm-delete="gridNoConfirmDelete"
        :auto-commit-line="gridAutoCommitLine"
        :total-url="gridTotalUrl"
        :sort-field="gridSortField"
        :sort-direction="gridSortDirection"
        :page-size="gridPageSize"
        :single-color="gridSingleColor"
        :fix-column="gridFixColumn"
        :keyword-operation="gridKeywordOperation"
        :secondary-row="gridSecondaryRow"
        :row-class="gridRowClass"
        :fit-viewport="gridFitViewport"
        @select-data="selectData"
        @new-data="newData"
        @get-data="getData"
        @delete-data="handleGridRowDelete"
        @row-updated="gridRowUpdated"
        @row-field-changed="handleGridFieldChanged"
        @save-row-data="handleGridRowSave"
        @row-deleted="handleGridRowDeleted"
        @grid-refreshed="handleGridRefreshed"
        @checkUncheckAll="onCheckUncheckAll"
        @checkUncheck="onCheckUncheck"
        @resetCustomFilter="handleGridResetCustomFilter"
      >
        <template #header_search="{ config }">
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
        <template #table_pre="prop">
          <slot
            name="grid_table_pre"
            :config="prop.config"
            :keyword="prop.keyword"
            :autoSearch="prop.autoSearch"
            :searchQuery="prop.searchQuery"
            :items="prop.items"
          ></slot>
        </template>
        <template #item_buttons_1="prop">
          <slot
            name="grid_item_buttons_1"
            :item="prop.item"
            :config="prop.config"
          ></slot>
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
            :header="slotData.header"
          ></slot>
        </template>

        
        <template #grid_total="prop">
          <slot name="grid_item_total" :item="prop.item"></slot>
        </template>

        <template #secondary_row="prop">
          <slot
            name="grid_secondary_row"
            :item="prop.item"
            :config="prop.config"
          />
        </template>
        
        <template #item_button_recordchange="prop">
          <slot
            name="grid_item_button_recordchange"
            :item="prop.item"
            :config="prop.config"
          />
        </template>
        <template #item_button_edit="prop">
          <slot
            name="grid_item_button_edit"
            :item="prop.item"
            :config="prop.config"
          />
        </template>
        <template #item_button_delete="prop">
          <slot
            name="grid_item_button_delete"
            :item="prop.item"
            :config="prop.config"
          />
        </template>

        <template #footer_1="prop">
            <slot name="grid_footer_1" :items="prop.items" :recordCount="prop.recordCount" :currentPage="prop.currentPage" :pageCount="prop.pageCount"></slot>
        </template>
        <template #paging="prop">
          <slot name="grid_paging" :items="prop.items" :recordCount="prop.recordCount" :currentPage="prop.currentPage" :pageCount="prop.pageCount"></slot>
        </template>
        <template #footer_2="prop">
          <slot name="grid_footer_2" :items="prop.items" :recordCount="prop.recordCount" :currentPage="prop.currentPage" :pageCount="prop.pageCount"></slot>
        </template>
          
      </s-grid>
    </div>

    <div
      v-if="isOverlayForm"
      class="form_view_overlay"
      :class="`form_view_${normalizedFormViewMethod}`"
      @click.self="cancelForm"
    >
      <div
        class="form_view_backdrop"
        aria-hidden="true"
        @click="cancelForm"
      ></div>
      <section ref="formViewPanel" class="form_view_panel" :style="formViewPanelStyle">
        <div
          v-if="normalizedFormViewMethod === 'sidebar'"
          class="form_view_resize_handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize form sidebar"
          @pointerdown.stop.prevent="startSidebarResize"
        ></div>
        <header v-if="!hideTitle" class="form_view_header">
          <span>{{ resolvedFormTitle }}</span>
        </header>
        <s-form
          v-if="data.formCfg && data.formCfg.setting"
          ref="formCtl"
          v-model="data.record"
          :keep-label="formKeepLabel"
          :config="data.formCfg"
          :mode="data.formMode"
          class="form_view_form"
          :auto-focus="formAutoFocus"
          :focus="formFocus"
          @submitForm="save"
          :showButtonsOnAllTabs="formShowButtonsOnAllTabs"
          :only-icon-top="formOnlyIcon"
          :tabs="formTabTitles"
          :initialTab="formInitialTab"
          @cancelForm="cancelForm"
          :hide-buttons="formHideButtons"
          :hide-submit="['edit','view'].includes(data.formMode) && gridHideEdit && !data.isAfterSave ? true : formHideSubmit"
          :hide-cancel="formHideCancel"
          @fieldChange="handleFormFieldChange"
          @recordChange="handleFormRecordChange"
        >
          <template
            v-for="name in formFieldInputHeaderSlotNames"
            v-slot:[name]="slotData"
          >
            <slot
              :name="'form_' + name"
              :item="slotData.item"
              :config="slotData.config"
              :mode="slotData.mode"
            ></slot>
          </template>

          <template
            v-for="name in formFieldInputSlotNames"
            v-slot:[name]="slotData"
          >
            <slot
              :name="'form_' + name"
              :item="slotData.item"
              :config="slotData.config"
              :mode="slotData.mode"
            ></slot>
          </template>

          <template
            v-for="name in formFieldInputFooterSlotNames"
            v-slot:[name]="slotData"
          >
            <slot
              :name="'form_' + name"
              :item="slotData.item"
              :config="slotData.config"
              :mode="slotData.mode"
            ></slot>
          </template>

          <template
            v-for="name in formFieldInputOptionSlotNames"
            v-slot:[name]="slotData"
          >
            <slot :name="'form_' + name" :option="slotData.option" :mode="slotData.mode"></slot>
          </template>

          <template
            v-for="name in formFieldInputSelectedOptionSlotNames"
            v-slot:[name]="slotData"
          >
            <slot :name="'form_' + name" :option="slotData.option" :mode="slotData.mode"></slot>
          </template>

          <template v-for="tabName in formTabNames" v-slot:[tabName]="slotData">
            <slot
              :name="'form_' + tabName"
              :item="slotData.item"
              :config="{
                formMode: data.formMode,
                appMode: data.controlMode,
                formCfg: data.formCfg,
              }"
              :mode="slotData.mode"
            >
              {{ tabName }}
            </slot>
          </template>

          <template #form_header="{ item, config, mode}">
            <slot name="form_header" :item="item" :config="config"  :mode="mode"></slot>
          </template>

          <template #loader>
            <slot name="form_loader"></slot>
          </template>

          <template #buttons>
            <slot name="form_buttons"></slot>
          </template>

          <template #buttons_1="{ item, config,inSubmission,loading, mode}">
            <slot name="form_buttons_1" :item="item" :config="config" :in-submission="inSubmission" :loading="loading" :mode="mode"></slot>
          </template>

          <template #buttons_2="{ item, config,inSubmission,loading,  mode}">
            <slot name="form_buttons_2" :item="item" :config="config" :in-submission="inSubmission" :loading="loading" :mode="mode"></slot>
          </template>

          <template v-slot:footer_1="{ item, config, mode}">
            <slot name="form_footer_1" :item="item" :config="config" :mode="mode"></slot>
          </template>

          <template v-slot:footer_2="{ item, config, mode}">
            <slot name="form_footer_2" :item="item" :config="config" :mode="mode"></slot>
          </template>
        </s-form>
      </section>
    </div>

    <s-form
      v-if="isInlineForm"
      ref="formCtl"
      v-model="data.record"
      :keep-label="formKeepLabel"
      :config="data.formCfg"
      :mode="data.formMode"
      class="pt-2"
      :auto-focus="formAutoFocus"
      :focus="formFocus"
      @submitForm="save"
      :showButtonsOnAllTabs="formShowButtonsOnAllTabs"
      :only-icon-top="formOnlyIcon"
      :tabs="formTabTitles"
      :initialTab="formInitialTab"
      @cancelForm="cancelForm"
      :hide-buttons="formHideButtons"
      :hide-submit="['edit','view'].includes(data.formMode) && gridHideEdit && !data.isAfterSave ? true : formHideSubmit"
      :hide-cancel="formHideCancel"
      @fieldChange="handleFormFieldChange"
      @recordChange="handleFormRecordChange"
    >
      <template
        v-for="name in formFieldInputHeaderSlotNames"
        v-slot:[name]="slotData"
      >
        <slot
          :name="'form_' + name"
          :item="slotData.item"
          :config="slotData.config"
          :mode="slotData.mode"
        ></slot>
      </template>

      <template
        v-for="name in formFieldInputSlotNames"
        v-slot:[name]="slotData"
      >
        <slot
          :name="'form_' + name"
          :item="slotData.item"
          :config="slotData.config"
          :mode="slotData.mode"
        ></slot>
      </template>

      <template
        v-for="name in formFieldInputFooterSlotNames"
        v-slot:[name]="slotData"
      >
        <slot
          :name="'form_' + name"
          :item="slotData.item"
          :config="slotData.config"
          :mode="slotData.mode"
        ></slot>
      </template>

      <template
        v-for="name in formFieldInputOptionSlotNames"
        v-slot:[name]="slotData"
      >
        <slot :name="'form_' + name" :option="slotData.option" :mode="slotData.mode"></slot>
      </template>

      <template
        v-for="name in formFieldInputSelectedOptionSlotNames"
        v-slot:[name]="slotData"
      >
        <slot :name="'form_' + name" :option="slotData.option" :mode="slotData.mode"></slot>
      </template>

      <template v-for="tabName in formTabNames" v-slot:[tabName]="slotData">
        <slot
          :name="'form_' + tabName"
          :item="slotData.item"
          :config="{
            formMode: data.formMode,
            appMode: data.controlMode,
            formCfg: data.formCfg,
          }" 
          :mode="slotData.mode"
        >
          {{ tabName }}
        </slot>
      </template>

      <template #form_header="{ item, config, mode}">
        <slot name="form_header" :item="item" :config="config"  :mode="mode"></slot>
      </template>

      <template #loader>
        <slot name="form_loader"></slot>
      </template>

      <template #buttons>
        <slot name="form_buttons"></slot>
      </template>

      <template #buttons_1="{ item, config,inSubmission,loading, mode}">
        <slot name="form_buttons_1" :item="item" :config="config" :in-submission="inSubmission" :loading="loading" :mode="mode"></slot>
      </template>

      <template #buttons_2="{ item, config,inSubmission,loading,  mode }">
        <slot name="form_buttons_2" :item="item" :config="config" :in-submission="inSubmission" :loading="loading" :mode="mode"></slot>
      </template>

      <template v-slot:footer_1="{ item, config, mode}">
        <slot name="form_footer_1" :item="item" :config="config" :mode="mode"></slot>
      </template>

      <template v-slot:footer_2="{ item, config, mode}">
        <slot name="form_footer_2" :item="item" :config="config" :mode="mode"></slot>
      </template>
    </s-form>
  </s-card>
</template>

<script setup>
import SCard from "./SCard.vue";
import SGrid from "./SGrid.vue";
import SList from "./SList.vue";
import SForm from "./SForm.vue";
import loadFormConfig from "../scripts/load_form_config.js";
import loadGridConfig from "../scripts/load_grid_config.js";

import {
  reactive,
  inject,
  provide,
  onMounted,
  ref,
  nextTick,
  computed,
  watch,
  onBeforeUnmount,
} from "vue";
import util from "../scripts/util.js";
import formConfig from "../scripts/form_config.js";

const props = defineProps({
  noGap: { type: Boolean },
  title: { type: String, default: "" },
  gridTitle: { type: String, default: "" },
  formTitle: { type: String, default: "" },
  hideTitle: { type: Boolean },
  gridEditor: { type: Boolean },
  gridEditorNoForm: { type: Boolean },
  gridSingleColor: { type: Boolean },
  gridFields: { type: Array, default: () => [] },
  gridHideControl: { type: Boolean, default: false },
  gridHideAction: { type: Boolean, default: false },
  gridHideSearch: { type: Boolean, default: false },
  gridHideSelect: { type: Boolean, default: false },
  gridHideDetail: { type: Boolean },
  gridHideSort: { type: Boolean, default: false },
  gridHidePaging: { type: Boolean },
  gridHideNew: { type: Boolean, default: false },
  gridHideRefresh: { type: Boolean, default: false },
  gridHideSave: { type: Boolean, default: false },
  gridHideDelete: { type: Boolean, default: false },
  gridHideEdit: { type: Boolean, default: false },
  gridDisableDblClick: { type: Boolean, default: false },
  gridSortField: {type: String, default:""},
  gridSortDirection: {type: String, default:""},
  gridCustomFilter: { type: Object, default: () => {} },
  gridNoConfirmDelete: { type: Boolean, default: false },
  gridPageSize: { type: Number, default: 20 },
  gridFixColumn: { type: Number, default: 0 },
  gridSecondaryRow: { type: Boolean, default: false },
  gridRowClass: { type: Function, default: null },
  gridFitViewport: { type: Boolean, default: false },
  formFields: { type: Array, default: () => [] },
  formConfig: { type: [String, Object], default: () => {} },
  formConfigNew: { type: [String, Object], default: () => undefined },
  formConfigUpdate: { type: [String, Object], default: () => undefined },
  formConfigView: { type: [String, Object], default: () => undefined },
  formDefaultMode: { type: String, default: "edit" },
  formOnlyIcon: { type: Boolean, default: false },
  formRead: { type: String, default: "" },
  formInsert: { type: String, default: "" },
  formUpdate: { type: String, default: "" },
  formHideButtons: { type: Boolean, default: false },
  formHideSubmit: { type: Boolean, default: false },
  formHideCancel: { type: Boolean, default: false },
  formFocus: { type: Boolean, default: false },
  formAutoFocus: { type: Boolean },
  formKeepLabel: { type: Boolean },
  gridMode: { type: String, default: "list" },
  gridLabelMethod: { type: String, default: "labelfield" },
  gridAutoCommitLine: { type: Boolean, default: false },
  gridKeywordOperation: { type: String, default: "" },
  listKeywordOperation: { type: String, default: "" },
  gridConfig: { type: [String, Object], default: () => {} },
  gridRead: { type: String, default: "" },
  gridUpdate: { type: String, default: "" },
  gridDelete: { type: String, default: "" },
  gridTotalUrl: { type: String, default: "" },
  stayOnFormAfterInsert: { type: Boolean, default: false },
  stayOnFormAfterUpdate: { type: Boolean, default: false },
  stayOnFormAfterSave: { type: Boolean, default: false },
  formShowButtonsOnAllTabs: { type: Boolean, default: false },
  formTabsNew: { type: Array, default: () => [] },
  formTabsEdit: { type: Array, default: () => [] },
  formTabsView: { type: Array, default: () => [] },
  formInitialTab: { type: Number, default: 0 },
  // inline keeps the existing DataList behavior. modal and sidebar keep the
  // grid visible and show the form above it.
  formViewMethod: { type: String, default: "" },
  formViewMethodInsert: { type: String, default: "" },
  formViewMethodUpdate: { type: String, default: "" },
  formModalSize: { type: [String, Number], default: undefined },
  formSidebarSize: { type: [String, Number], default: undefined },
  // Snake_case aliases keep form parameters compatible with server-driven
  // configuration and existing conventions.
  form_view_method: { type: String, default: "inline" },
  form_modal_size: { type: [String, Number], default: "32rem" },
  form_sidebar_size: { type: [String, Number], default: undefined },
  initAppMode: { type: String, default: "grid" },
  newRecordType: { type: String, default: "form" },
  //initFormMode: { type: String, default: "edit" },
  preSaveFn: { type: Function, default: null },
  idFieldName: { type: String, default: "_id" },
});

const axios = inject("axios");
const emit = defineEmits({
  postSave: null,
  formFieldChange: null,
  formRecordChange: null,
  formNewData: null,
  formEditData: null,
  formLoaded: null,
  alterGridConfig: null,
  alterFormConfig: null,
  gridRefreshed: null,
  gridGetData: null,
  gridRowAdd: null,
  gridRowUpdated: null,
  gridRowDeleted: null,
  gridRowDelete: null,
  gridRowSave: null,
  gridRowFieldChanged: null,
  controlModeChanged: null,
  formModeChanged: null,
  gridCheckUncheckAll: null,
  gridCheckUncheck: null,
  gridResetCustomFilter:null,
});

const data = reactive({
  controlMode: props.initAppMode,
  formMode: props.formDefaultMode,
  formCfg: {},
  listCfg: {},
  gridReadUrl: props.gridRead,
  gridDeleteUrl: props.gridDelete,
  gridUpdateUrl: props.gridUpdate,
  record: {
    Enable: true,
  },
  loadingGridCfg: false,
  loadingSelectData: false,
  isAfterSave: false
});

const gridCtl = ref(null);
const formCtl = ref(null);
const formViewPanel = ref(null);
const sidebarWidth = ref(null);
const viewportWidth = ref(typeof window == "undefined" ? 0 : window.innerWidth);
const xiSidebarWidth = ref(0);
let stopSidebarResize = null;
let xiSidebarObserver = null;

// A nested DataList (for example ClientContact inside Client) receives the
// level of its parent and opens its own overlay one level deeper.
const parentDataListLevel = inject("suimDataListLevel", 0);
const dataListLevel = parentDataListLevel + 1;
provide("suimDataListLevel", dataListLevel);

const resolvedGridTitle = computed(() => props.gridTitle || props.title);
const resolvedFormTitle = computed(() => props.formTitle || props.title);

const resolvedFormViewMethod = computed(() => {
  if (data.formMode == "new" && props.formViewMethodInsert) {
    return props.formViewMethodInsert;
  }
  if (data.formMode == "edit" && props.formViewMethodUpdate) {
    return props.formViewMethodUpdate;
  }
  return props.formViewMethod || props.form_view_method || "inline";
});

const normalizedFormViewMethod = computed(() => {
  const value = String(resolvedFormViewMethod.value).toLowerCase();
  return ["inline", "modal", "sidebar"].includes(value) ? value : "inline";
});

const isInlineForm = computed(() =>
  data.controlMode == "form" && normalizedFormViewMethod.value == "inline" && data.formCfg && data.formCfg.setting
);

const isOverlayForm = computed(() =>
  data.controlMode == "form" && normalizedFormViewMethod.value != "inline"
);

const isGridVisible = computed(() =>
  data.controlMode == "grid" || normalizedFormViewMethod.value != "inline"
);

const defaultSidebarSize = computed(() => {
  if (viewportWidth.value <= 1024) return "32rem";
  return dataListLevel >= 2 ? "480px" : "720px";
});

const availableSidebarWidth = computed(() =>
  Math.max(0, viewportWidth.value - xiSidebarWidth.value)
);

function updateViewportWidth() {
  viewportWidth.value = window.innerWidth;
  updateXiSidebarWidth();
}

function updateXiSidebarWidth() {
  if (typeof document == "undefined") return;
  const panel = document.querySelector(".xisb_root.xisb_open .xisb_panel");
  const nextWidth = panel ? Math.round(panel.getBoundingClientRect().width) : 0;
  if (nextWidth && isOverlayForm.value && normalizedFormViewMethod.value == "sidebar" && window.innerWidth - nextWidth < 320) {
    document.querySelector(".xisb_root.xisb_open .xisb_backdrop")?.click();
    xiSidebarWidth.value = 0;
    return;
  }
  if (xiSidebarWidth.value != nextWidth) xiSidebarWidth.value = nextWidth;
}

function closeXiSidebarWhenFormCannotFit() {
  if (!xiSidebarWidth.value || availableSidebarWidth.value >= 320) return;
  document.querySelector(".xisb_root.xisb_open .xisb_backdrop")?.click();
  xiSidebarWidth.value = 0;
}

const formViewPanelStyle = computed(() => {
  const isModal = normalizedFormViewMethod.value == "modal";
  const isSidebar = normalizedFormViewMethod.value == "sidebar";
  if (!isModal && !isSidebar) return {};
  const size = isModal
    ? props.formModalSize ?? props.form_modal_size
    : sidebarWidth.value ?? props.formSidebarSize ?? props.form_sidebar_size ?? defaultSidebarSize.value;
  const style = { width: typeof size == "number" ? `${size}px` : size || "32rem" };
  if (isSidebar && xiSidebarWidth.value) style.maxWidth = `${availableSidebarWidth.value}px`;
  return style;
});

function startSidebarResize(event) {
  if (event.button !== undefined && event.button !== 0) return;
  stopSidebarResize?.();
  const startWidth = formViewPanel.value?.getBoundingClientRect().width;
  if (!startWidth) return;
  const startX = event.clientX;

  const onPointerMove = (moveEvent) => {
    const maxWidth = Math.max(240, availableSidebarWidth.value || window.innerWidth - 24);
    const minWidth = Math.min(320, maxWidth);
    const nextWidth = startWidth + startX - moveEvent.clientX;
    sidebarWidth.value = Math.min(maxWidth, Math.max(minWidth, nextWidth));
  };
  stopSidebarResize = () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
    stopSidebarResize = null;
  };
  const onPointerUp = () => stopSidebarResize?.();

  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp, { once: true });
}

onBeforeUnmount(() => {
  stopSidebarResize?.();
  window.removeEventListener("resize", updateViewportWidth);
  xiSidebarObserver?.disconnect();
});

watch(isOverlayForm, (isVisible) => {
  if (!isVisible || normalizedFormViewMethod.value != "sidebar") return;
  nextTick(() => {
    updateXiSidebarWidth();
    closeXiSidebarWhenFormCannotFit();
  });
});

 
watch(
  () => data.controlMode,
  (nv) => {
    emit("controlModeChanged", nv);
  }
);

watch(
  () => data.formMode,
  (nv) => {
    emit("formModeChanged", nv);
  }
);

const stayOnForm = computed({
  get() {
    return props.stayOnFormAfterSave ||
      (props.stayOnFormAfterInsert && data.formMode=="new") || 
      (props.stayOnFormAfterUpdate && data.formMode=="edit");
  },
});

function handleGridResetCustomFilter(){ 
  emit("gridResetCustomFilter")
}
function handleFormFieldChange(name, v1, v2, old) {
  emit("formFieldChange", name, v1, v2, old, data.record);
}

function handleFormRecordChange(nv) {
  emit("formRecordChange", nv);
}

function handleGridRefreshed() {
  emit("gridRefreshed");
}

function handleGridFieldChanged(name, v1, v2, old, record) {
  emit("gridRowFieldChanged", name, v1, v2, old, record);
}

function handleGridRowDeleted(record) {
  emit("gridRowDeleted", record);
}

function handleGridRowDelete(record, index) {
  emit("gridRowDelete", record, index);
}

function handleGridRowSave(record, index) {
  emit("gridRowSave", record, index);
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

const formFieldInputHeaderSlotNames = computed({
  get() {
    return props.formFields.map((el) => {
      return "input_" + el + "_header";
    });
  },
});

const formFieldInputFooterSlotNames = computed({
  get() {
    return props.formFields.map((el) => {
      return "input_" + el + "_footer";
    });
  },
});

const formFieldInputOptionSlotNames = computed({
  get() {
    return props.formFields.map((el) => {
      return "input_" + el + "_option";
    });
  },
});

const formFieldInputSelectedOptionSlotNames = computed({
  get() {
    return props.formFields.map((el) => {
      return "input_" + el + "_selected-option";
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

function selectData(dt, index, isAfterSave = false) {
  if (props.formRead == "") {
    data.record = dt;
    emit("formEditData", data.record);
    data.controlMode = "form";
    data.formMode = props.formDefaultMode;
    nextTick(() => {
      emit("formLoaded", data.record);
    });
    return;
  }
  
  data.loadingSelectData =true
  axios.post(props.formRead, [dt[props.idFieldName]]).then(
    (r) => {
      
     data.loadingSelectData = false
      emit("formEditData", r.data);
      data.controlMode = "form";
      if(isAfterSave){
        data.formMode = 'edit'
      }else{
        data.formMode = props.formDefaultMode;
      } 
      data.isAfterSave = isAfterSave
      
      data.record = r.data;
      // Insert, edit, and view may use different server-side form
      // configurations. Clear the previous mode before loading the new one
      // so an earlier insert form cannot leak into an edit form.
      data.formCfg = {};
      refreshForm();
      nextTick(() => {
        emit("formLoaded", data.record);
      });
    },
    (e) => {
      data.loadingSelectData = false
      util.showError(e);
    }
  );
}

function readFormRecord(dt) {
  axios.post(props.formRead, [dt[props.idFieldName]]).then(
    (r) => {      
      emit("formEditData", r.data);
      data.record = r.data;
    },
    (e) => {
      util.showError(e);
    }
  );
}

function newData(dt) {
  if (dt == undefined) dt = {};

  switch (props.newRecordType) {
    case "form":
      emit("formNewData", dt);
      data.record = dt == undefined ? {} : dt;
      data.controlMode = "form";
      data.formMode = "new";
      data.formCfg = {};
      nextTick(() => {
        refreshForm();
        emit("gridRowUpdated", data.record);
        emit("formLoaded", data.record);
      });

    case "grid":
      emit("gridRowAdd", dt);
  }
}

function getData(keyword) {
  emit("gridGetData", keyword);
}

function cancelForm() {
  // Cancel does not persist any data, so keep the current grid result intact.
  data.controlMode = "grid";
}

function captureGridState() {
  if (!gridCtl.value) return null;
  return {
    keyword: gridCtl.value.getKeyword?.(),
    currentPage: gridCtl.value.getCurrentPage?.(),
    pageSize: gridCtl.value.getPageSize?.(),
    sortField: gridCtl.value.getSortField?.(),
    sortDirection: gridCtl.value.getSortDirection?.(),
  };
}

function restoreGridState(state) {
  if (!state || !gridCtl.value) return;
  gridCtl.value.setKeyword?.(state.keyword);
  gridCtl.value.setCurrentPage?.(state.currentPage);
  gridCtl.value.setPageSize?.(state.pageSize);
  if (state.sortField != undefined) gridCtl.value.setSortField?.(state.sortField);
  if (state.sortDirection != undefined) gridCtl.value.setSortDirection?.(state.sortDirection);
}

function save(saveData, cbOK, cbFalse, disableNotif) {
  if (props.preSaveFn) {
    const result = props.preSaveFn(saveData);
    if (result === false) {
      if (cbFalse) cbFalse();
      return;
    }
  }
  const saveEndPoint =
    data.formMode == "new" ? props.formInsert : props.formUpdate;

  if (saveEndPoint == "") {
    emit("postSave", saveData, data.currentIndex);
    if (!stayOnForm.value) {
      data.controlMode = "grid";
    }
    if (disableNotif !== true) util.showInfo("Data has been saved.");
    cbOK();
    return;
  }

  axios.post(saveEndPoint, saveData).then(
    (r) => {
      let record = r.data;
      const gridState = captureGridState();
      data.record = record;
      emit("postSave", record);
      emit("gridRowUpdated", record);
      
      if (!stayOnForm.value) {
        data.controlMode = "grid";
        // Refresh the grid with its existing state.  Saving a form must not
        // discard keyword/custom filters, current page, or page size.
        nextTick(() => {
          restoreGridState(gridState);
          gridCtl.value.refreshData();
        });
      } else {
        selectData(data.record, "detail", true);
      }
      if (disableNotif !== true) util.showInfo("Data has been saved.");
      cbOK();
    },
    (e) => {
      util.showError(e);
      cbFalse();
    }
  );
}

function gridRowUpdated(dt) {
  emit("gridRowUpdated", dt);
}

function refreshList() {
  const gridState = captureGridState();
  data.loadingGridCfg = true
  loadGridConfig(axios, props.gridConfig).then(
    (r) => {
      let cfg = r;
      emit("alterGridConfig", cfg);
      data.listCfg = cfg;
      data.loadingGridCfg = false

      util.nextTickN(1, () => {
        if (gridCtl.value) {
          restoreGridState(gridState);
          gridCtl.value.refreshData();
          return;
        }
      })
    },
    (e) => data.loadingGridCfg = false
  );
  if (typeof props.gridRead == "string") data.gridReadUrl = props.gridRead;
}

function refreshForm() {
  if (props.formConfig == undefined || props.formConfig == "") return;
  const requestedMode = data.formMode;
  let configSource = props.formConfig;
  if (data.formMode == "new" && props.formConfigNew) {
    configSource = props.formConfigNew;
  } else if (data.formMode == "edit" && props.formConfigUpdate) {
    configSource = props.formConfigUpdate;
  } else if (data.formMode == "view" && props.formConfigView) {
    configSource = props.formConfigView;
  }
  loadFormConfig(axios, configSource).then(
    (r) => {
      // A slower request from a previous form mode must not overwrite the
      // configuration for the form currently being displayed.
      if (data.formMode != requestedMode) return;
      emit("alterFormConfig", r);
      data.formCfg = r;
    },
    //(e) => util.showError(e)
  );
}

function getFormSection(name) {
  return formCtl.value.getSection(name);
}

function getFormField(name) {
  return formCtl.value.getField(name);
}

function setFormSectionAttr(name, attr, value) {
  if (formCtl.value == undefined) return;
  formCtl.value.setSectionAttr(name, attr, value);
}

function setFormFieldAttr(name, attr, value) {
  if (formCtl.value == undefined) {
    console.warn("calling setFormFieldAttr when form is not yet initiated");
    return;
  }
  formCtl.value.setFieldAttr(name, attr, value);
}

function removeFormField(name) {
  formCtl.value.removeField(name);
}

function getGridConfig() {
  return data.listCfg;
}

function setGridConfig(cfg) {
  data.listCfg = cfg;
}

function setGridAttr(name, attr, value) {
  const fields = data.listCfg.fields.map((el) => {
    if (el.field != name) return el;

    el[attr] = value;
    return el;
  });
  data.listCfg.fields = fields;
}

function setGridField(name, field) {
  const fields = data.listCfg.fields.map((el) => {
    if (el.field != name) return el;

    return field;
  });
  data.listCfg.fields = fields;
}

function getGridField(name) {
  const fields = data.listCfg.fields.filter((el) => el.field == name);
  if (fields.length == 0) {
    return {};
  }
  return fields[0];
}

function removeGridField(name) {
  const newFields = data.listCfg.fields.filter((el) => {
    return el.field != name;
  });
  data.listCfg.fields = newFields;
}

function getFormRecord() {
  return data.record;
}

function gridAddData(dt) {
  gridCtl.value.addData(dt);
}

function setFormRecord(record) {
  data.record = record;
}

function getGridRecords() {
  return gridCtl.value?.getRecords();
}

function getGridRecord(idx) {
  return gridCtl.value.getRecord(idx);
}

function setGridRecord(idx, dt) {
  return gridCtl.value?.setRecord(idx, dt);
}

function setGridRecordByID(dt) {
  return gridCtl.value?.setRecordByID(dt);
}

function setFormMode(mode) {
  data.formMode = mode;
}

function getFormMode() {
  return data.formMode;
}

function newGridData() {
  if (gridCtl.value) {
    gridCtl.value.newData();
  }
}

function refreshGrid() {
  refreshList();
}

function setControlMode(mode) {
  data.controlMode = mode;
}

function getControlMode() {
  return data.controlMode;
}

function setGridRecords(items) {
  gridCtl.value?.setRecords(items);
}

watch(
  () => props.gridRead,
  (nv) => {
    data.gridReadUrl = nv;
    util.nextTickN(1, () => gridCtl.value.refreshData());
  }
);

function getGridCurrentIndex() {
  return gridCtl.value.getCurrentIndex();
}

function getGridSortField() {
  return gridCtl.value.getSortField();
}

function setGridSortField(s) {
  gridCtl.value.setSortField(s);
}

function getGridSortDirection() {
  return gridCtl.value.getSortDirection();
}

function setGridSortDirection(d) {
  gridCtl.value.setSortDirection(d);
}

function getGridSelected() {
  return gridCtl.value.getSelected();
}

function setFormLoading(loading) {
  formCtl.value.setLoading(loading);
}
function getFormLoading() {
  return formCtl.value.getLoading();
}

function setGridLoading(loading) {
  gridCtl.value.setLoading(loading);
}
function getGridLoading() {
  return gridCtl.value.getLoading();
}

function formValidate() {
  return formCtl.value.validate();
}

function setFormCurrentTab(formCurrentTab) {
  if (formCtl.value == undefined) {
    return;
  }
  formCtl.value.setCurrentTab(formCurrentTab);
}
function getFormCurrentTab() {
  if (formCtl.value == undefined) {
    return;
  }
  return formCtl.value.getCurrentTab();
}
function getFormAllField() {
  if (formCtl.value == undefined) {
    return [];
  }
  return formCtl.value.getAllField();
}
function gridResetFilter(){
  gridCtl.value.resetFilter();
}
function onCheckUncheckAll(checked) {
  emit("gridCheckUncheckAll", checked);
}

function onCheckUncheck(val) {
  emit("gridCheckUncheck", val);
}

defineExpose({
  getGridRecords,
  getGridRecord,
  refreshGrid,
  setGridRecords,
  getGridSelected,
  setGridRecord,
  setGridRecordByID,
  getGridCurrentIndex,
  getFormRecord,
  setFormRecord,
  getFormField,
  removeFormField,
  setFormFieldAttr,
  getFormSection,
  setFormSectionAttr,
  getGridConfig,
  setGridConfig,
  getGridField,
  removeGridField,
  setGridField,
  setGridAttr,
  refreshList,
  refreshForm,
  setFormMode,
  getFormMode,
  newGridData,
  submitForm: save,
  cancelForm,
  setControlMode,
  getControlMode,
  getGridSortField,
  setGridSortField,
  getGridSortDirection,
  setGridSortDirection,
  setFormLoading,
  getFormLoading,
  setGridLoading,
  getGridLoading,
  formValidate,
  setFormCurrentTab,
  getFormCurrentTab,
  getFormAllField,
  gridResetFilter,
  gridAddData,
  selectData,
  readFormRecord
});

onMounted(() => {
  updateViewportWidth();
  window.addEventListener("resize", updateViewportWidth);
  xiSidebarObserver = new MutationObserver(updateXiSidebarWidth);
  xiSidebarObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["class"],
  });
  refreshList();
  refreshForm();
});
</script>

<style scoped>
.form_view_overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
}

.form_view_backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  background: rgb(0 0 0 / 60%);
  cursor: default;
}

.form_view_panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  background: white;
  box-shadow: 0 16px 48px rgb(0 0 0 / 25%);
}

.form_view_modal {
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.form_view_modal .form_view_panel {
  width: min(32rem, 100%);
}

.form_view_sidebar {
  justify-content: flex-end;
}

.form_view_sidebar .form_view_panel {
  max-width: 100vw;
  max-height: 100vh;
  height: 100%;
}

.form_view_resize_handle {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 0;
  left: 0;
  width: 8px;
  cursor: col-resize;
  touch-action: none;
}

.form_view_resize_handle:hover,
.form_view_resize_handle:active {
  background: rgb(30 58 138 / 20%);
}

.form_view_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
}

.form_view_form {
  padding: 1rem;
}
</style>
