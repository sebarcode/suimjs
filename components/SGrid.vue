<template>
  <div ref="gridRoot" class="flex flex-col gap-1 suim_grid w-full max-w-full" :class="{ 'suim_viewport_grid': fitViewport }">
    <s-modal :display="false" ref="deleteModal" @submit="confirmDelete">
      You will delete data ! Are you sure ?<br />
      Please be noted, this can not be undone !
    </s-modal>

    <div
      v-if="data.editorTooltip.show"
      class="suim_editor_tooltip_fixed"
      :style="{
        left: data.editorTooltip.left + 'px',
        top: data.editorTooltip.top + 'px',
        transform: data.editorTooltip.transform
      }"
    >
      {{ data.editorTooltip.text }}
    </div>

    <div
      class="flex gap-1 items-center header"
      v-if="!hideControl"
    >
      <div class="grow">
        <slot name="header_search" :config="config">
          <div class="flex" v-if="!hideSearch && !data.autoSearch">
            <input
              type="text"
              class="input_field border_b_[1px] search_input"
              placeholder="enter search keyword"
              v-model="data.keyword"
              @keyup.enter="refreshData"
            />
            <s-button
              icon="close"
              class="btn_primary clear_btn"
              tooltip="clear search"
              @click="data.keyword=''; refreshData()"
            />
          </div>
        </slot>

        <div class="flex flex-col gap-1" v-if="data.autoSearch && !hideSearch">
        <div v-for="(sfield, sfidx) in data.searchableFields" 
          class="grid grid-cols-6 gap-1"
          :key="'search_field_' + sfidx">
          <div class="col-span-1">{{ sfield.field.label }}</div>
          <div 
            v-if="[ 'number', 'date', 'datetime'].includes(sfield.field.input.kind)"
            :key="'search_input_' + sfidx"
            class="col-span-4 flex gap-2 justify-between items-center"
          >
          <s-input
              class="w-full"
              v-model="sfield.value1"
              hide-label
              :ctl-ref="{ rowIndex: rIdx }"
              :field="sfield.field.input.field"
              :kind="sfield.field.input.kind"
              :label="
                sfield.field.input.kind == 'checkbox' || sfield.field.input.kind == 'bool'
                  ? ''
                  : sfield.field.input.label
              "
              :disabled="sfield.field.input.readOnly"
              :caption="sfield.field.input.caption || `enter ${sfield.field.input.label.toLowerCase()} to search`"
              :hint="sfield.field.input.hint"
              :multi-row="sfield.field.input.multiRow"
              :use-list="sfield.field.input.useList"
              :items="sfield.field.input.items"
              :rules="sfield.field.input.rules"
              :read-only="sfield.field.input.readOnly"
              :lookup-url="sfield.field.input.lookupUrl"
              :lookup-key="sfield.field.input.lookupKey"
              :allow-add="sfield.field.input.allowAdd"
              :lookup-format1="sfield.field.input.lookupFormat1"
              :lookup-format2="sfield.field.input.lookupFormat2"
              :decimal="sfield.field.input.decimal"
              :date-format="sfield.field.input.dateFormat"
              :lookup-labels="sfield.field.input.lookupLabels"
              :lookup-searchs="
                sfield.field.input.lookupSearchs &&
                sfield.field.input.lookupSearchs.length == 0
                  ? sfield.field.input.lookupLabels
                  : sfield.field.input.lookupSearchs
              "
            />
            <div>
              to
            </div>
            <s-input 
              class="w-full"
              v-model="sfield.value2"
              hide-label
              :ctl-ref="{ rowIndex: rIdx }"
              :field="sfield.field.input.field"
              :kind="sfield.field.input.kind"
              :label="
                sfield.field.input.kind == 'checkbox' || sfield.field.input.kind == 'bool'
                  ? ''
                  : sfield.field.input.label
              "
              :disabled="sfield.field.input.readOnly"
              :caption="`enter ${sfield.field.input.label.toLowerCase()} to search`"
              :hint="sfield.field.input.hint"
              :multi-row="sfield.field.input.multiRow"
              :use-list="sfield.field.input.useList"
              :items="sfield.field.input.items"
              :rules="sfield.field.input.rules"
              :read-only="sfield.field.input.readOnly"
              :lookup-url="sfield.field.input.lookupUrl"
              :lookup-key="sfield.field.input.lookupKey"
              :allow-add="sfield.field.input.allowAdd"
              :lookup-format1="sfield.field.input.lookupFormat1"
              :lookup-format2="sfield.field.input.lookupFormat2"
              :decimal="sfield.field.input.decimal"
              :date-format="sfield.field.input.dateFormat"
              :multiple="sfield.field.input.multiple"
              :lookup-labels="sfield.field.input.lookupLabels"
              :lookup-searchs="
                sfield.field.input.lookupSearchs &&
                sfield.field.input.lookupSearchs.length == 0
                  ? sfield.field.input.lookupLabels
                  : sfield.field.input.lookupSearchs
              "
            /> 
          </div> 
          <div 
            v-else
            :key="'search_input_nn_' + sfidx"
            class="col-span-4 flex gap-1 justify-between items-center"
          >
          <s-input
              class="w-full"
              v-model="sfield.value1"
              hide-label
              :ctl-ref="{ rowIndex: rIdx }"
              :field="sfield.field.input.field"
              :kind="sfield.field.input.kind"
              :label="
                sfield.field.input.kind == 'checkbox' || sfield.field.input.kind == 'bool'
                  ? ''
                  : sfield.field.input.label
              "
              :disabled="sfield.field.input.readOnly"
              :caption="`enter ${sfield.field.input.label.toLowerCase()} to search`"
              :hint="sfield.field.input.hint"
              :multi-row="sfield.field.input.multiRow"
              :use-list="sfield.field.input.useList"
              :items="sfield.field.input.items"
              :rules="sfield.field.input.rules"
              :read-only="sfield.field.input.readOnly"
              :lookup-url="sfield.field.input.lookupUrl"
              :lookup-key="sfield.field.input.lookupKey"
              :allow-add="sfield.field.input.allowAdd"
              :lookup-format1="sfield.field.input.lookupFormat1"
              :lookup-format2="sfield.field.input.lookupFormat2"
              :decimal="sfield.field.input.decimal"
              :date-format="sfield.field.input.dateFormat"
              :multiple="sfield.field.input.useList || sfield.field.input.lookupUrl != ''"
              :lookup-labels="sfield.field.input.lookupLabels"
              :lookup-searchs="
                sfield.field.input.lookupSearchs &&
                sfield.field.input.lookupSearchs.length == 0
                  ? sfield.field.input.lookupLabels
                  : sfield.field.input.lookupSearchs
              "
            />
          </div>
        </div>

        <div>
          <slot name="header_autoseach_footer" :config="config" :searchable="data.searchableFields"></slot>
        </div>

        <div hidden>
          {{ data.searchableFields.map(field => field.field.label + ": "+field.value1+" "+field.value2) }}
          <br/>
          {{ calcSearchQuery}}
        </div>
    </div>

      </div>

      <div class="flex header_button">
        <slot name="header_buttons_1" :config="config"></slot>
        <slot name="header_buttons" :config="config">
          <s-button
            icon="content-save"
            class="btn_primary refresh_btn"
            tooltip="save all changed rows"
            @click="saveChangedRows"
            v-if="showHeaderSaveButton"
            :disabled="data.savingChangedRows"
          />
          <s-button
            icon="refresh"
            class="btn_primary refresh_btn"
            tooltip="refresh"
            @click="refreshData"
            v-if="!hideRefreshButton"
          />
          <s-button
            icon="cog"
            class="btn_primary refresh_btn"
            tooltip="change to advance mode search"
            @click="data.autoSearch = !data.autoSearch; refreshData()"
            v-if="!hideRefreshButton && data.searchableFields.length > 0"
          />
          <s-button
            icon="plus"
            class="btn_primary new_btn"
            tooltip="add new"
            @click="newData"
            v-if="!hideNewButton"
            :disabled="data.recordChanged && !hideSaveButton"
          />
        </slot>
        <slot name="header_buttons_2" :config="config"></slot>
      </div>
    </div>

    <div v-if="$slots.table_pre" class="suim_table_pre w-full">
      <slot
        name="table_pre"
        :config="config"
        :keyword="data.keyword"
        :autoSearch="data.autoSearch"
        :searchQuery="calcSearchQuery"
        :items="data.items"
      ></slot>
    </div>

    <!--<div>data items: {{  data.items }}</div>-->
    <div v-if="!data.loading">
      <div v-if="data.items.length > 0">
        <div
          ref="tableScrollerEl"
          class="suim_area_table overflow-x-auto w-full max-w-full"
          :class="{ 'suim_grid_scroll': scrollMode }"
          :style="tableScrollerStyle"
          @pointerdown="startHorizontalDrag"
          @pointermove="moveHorizontalDrag"
          @pointerup="stopHorizontalDrag"
          @pointercancel="stopHorizontalDrag"
        >
          <table
            ref="tableEl"
            class="table-auto suim_table w-full"
            style="min-width: max-content;"
            :class="{ 'suim_editor_grid': editor }"
          >
          <!-- header -->
          <thead name="grid_header">
            <tr class="border-b-[1px] border-slate-500 bg-slate-50">
              <th
                class="row_select whitespace-nowrap px-2 py-1"
                :class="{ 'suim_sticky': scrollMode }"
                :style="[selectColumnStyle, scrollMode ? 'left:0px' : '']"
                data-role="select"
                v-if="!hideSelect"
              >
                <input type="checkbox" @change="checkUncheckAll" />
              </th>
              <th
                v-for="(hdr, hdrIndex) in config.fields.filter(
                  (el) => el.readType == 'show'
                )"
                :key="'grid_col_' + hdrIndex"
                class="whitespace-nowrap text-ellipsis relative"
                :class="{
                  'text-right': hdr.align == 'right' || hdr.kind == 'number',
                  'pr-4': hdr.align == 'right' || hdr.kind == 'number',
                  'text-left': !(hdr.align == 'right' || hdr.kind == 'number'),
                  'suim_sticky': isFixedColumn(hdrIndex),
                }"
                :style="[columnWidthStyle(hdr), isFixedColumn(hdrIndex) ? `left:${colLefts[hdrIndex] ?? 0}px` : '']"
                data-role="data"
                :data-col-index="hdrIndex"
              >
                  <button
                    type="button"
                    class="flex w-full items-center gap-1 text-inherit"
                    :class="isSortable(hdr) ? 'cursor-pointer' : 'cursor-default'"
                    :aria-label="isSortable(hdr) ? `Sort by ${hdr.label}` : undefined"
                    @click="toggleSort(hdr)"
                  >
                  <span class="grow">{{ hdr.label }}</span>
                  <svg
                    v-if="isSortable(hdr)"
                    class="h-4 w-4 shrink-0"
                    :class="data.sortField === hdr.field ? 'text-slate-700' : 'text-slate-400'"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path v-if="data.sortField === hdr.field && data.sortDirection === 'desc'" d="M7,10L12,15L17,10H7Z" />
                    <path v-else d="M7,14L12,9L17,14H7Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="suim_col_resize_handle"
                  :aria-label="`Resize column ${hdr.label}`"
                  @mousedown.prevent.stop="startColumnResize(hdr, $event)"
                ></button>
              </th>
              <th
                class="header_column_action"
                :class="{ 'suim_sticky': scrollMode, 'suim_sticky_right': scrollMode }"
                :style="scrollMode ? 'right:0px' : ''"
                data-role="action"
                v-if="!hideAction"
              >
                Action
              </th>
            </tr>
            <tr v-if="showInlineSearch">
              <td v-if="!hideSelect" class="whitespace-nowrap px-2 py-1"></td>
              <td
                v-for="(hdr, hdrIndex) in config.fields.filter(
                  (el) => el.readType == 'show' && (
                    (filteredFields && filteredFields.length > 0 ? filteredFields.includes(el.field) : true) &&
                    (unfilteredFields && unfilteredFields.length > 0 ? !unfilteredFields.includes(el.field) : true)
                  )
                )"
                :key="'grid_inline_search_' + hdrIndex"
                class="whitespace-nowrap px-2 py-1"
                :style="columnWidthStyle(hdr)"
              >
                <s-input
                  v-model="hdr.inlineSearchValue"
                  :placeholder="'Cari ' + hdr.label"
                  size="small"
                  hide-label
                  @keyup.enter="refreshData"
                />
              </td>
              <td
                v-if="!hideAction"
                class="whitespace-nowrap px-2 py-1"
                :class="{ 'suim_sticky': scrollMode, 'suim_sticky_right': scrollMode }"
                :style="scrollMode ? 'right:0px' : ''"
              ></td>
            </tr>
          </thead>

          <!-- records -->
          <tbody name="grid_body" :class="{ 'text-[0.9em] editor': editor }">
            <template
              v-for="(r, rIdx) in data.items"
              :key="'grid_item_group_' + rIdx"
            >
              <tr
                class="suim_data_row cursor-pointer border-b-[1px] border-slate-200 last:border-none hover:bg-slate-200 group"
                :class="[
                  { 'even:bg-slate-100': !editor && !singleColor, 'hover:none':hideEdit },
                  rowClass ? rowClass(r, rIdx) : ''
                ]"
                :data-row-index="rIdx"
                @dblclick.capture="handleRowDblClick($event, r, rIdx)"
                @focusin="onRowFocus(rIdx)"
              >
                <td
                  class="text-center whitespace-nowrap px-2 py-1"
                  :class="[{ 'suim_sticky': scrollMode }, scrollMode ? stickyTdBg(rIdx) : '']"
                  :style="[selectColumnStyle, scrollMode ? 'left:0px' : '']"
                  data-role="select"
                  v-if="!hideSelect"
                >
                  <!-- <input type="checkbox" v-model="r.isSelected" /> -->
                  <slot name="checkbox" :item="r"
                    ><input
                      type="checkbox"
                      v-model="r.isSelected"
                      @change="checkUncheck(r)"
                  /></slot>
                </td>

                <td
                  v-for="(hdr, hdrIndex) in config.fields.filter(
                    (el) => el.readType == 'show'
                  )"
                  :key="'grid_col_' + hdrIndex"
                  class="whitespace-nowrap px-2 py-1 text-ellipsis align-top"
                  :class="[{ 'suim_sticky': isFixedColumn(hdrIndex) }, isFixedColumn(hdrIndex) ? stickyTdBg(rIdx) : '']"
                  :style="[columnWidthStyle(hdr), isFixedColumn(hdrIndex) ? `left:${colLefts[hdrIndex] ?? 0}px` : '']"
                  data-role="data"
                  :data-col-index="hdrIndex"
                >
                  <slot :name="'item_' + hdr.field" :item="r" :header="hdr">
                    <div
                      v-if="editor && !(
                          hdr.input.readOnly || 
                          (hdr.input.readOnlyOnEdit && (r.suimRowMode=='edit' || r.suimRowMode==undefined))
                      )"
                      class="suim_editor_input"
                      :class="{
                        'suim_editor_bool': hdr.input.kind == 'checkbox' || hdr.input.kind == 'bool',
                        'suim_editor_input_focused': isEditorCellFocused(rIdx, hdr.input.field)
                      }"
                      @mouseenter="showEditorTooltip($event, r, hdr, rIdx)"
                      @mousemove="moveEditorTooltip($event)"
                      @mouseleave="hideEditorTooltip"
                      @focusin="setEditorCellFocus(rIdx, hdr.input.field)"
                      @focusout="clearEditorCellFocus(rIdx, hdr.input.field)"
                    >
                      <s-input
                        hide-label
                        :ctl-ref="{ rowIndex: rIdx }"
                        :field="hdr.input.field"
                        :kind="hdr.input.kind"
                        :label="
                          hdr.input.kind == 'checkbox' || hdr.input.kind == 'bool'
                            ? ''
                            : hdr.input.label
                        "
                        :disabled="hdr.input.readOnly"
                        :caption="hdr.input.caption"
                        :hint="hdr.input.hint"
                        :multi-row="hdr.input.multiRow"
                        :use-list="hdr.input.useList"
                        :items="hdr.input.items"
                        :rules="hdr.input.rules"
                        :required="hdr.input.required"
                        :read-only="hdr.input.readOnly"
                        :lookup-url="resolveInputLookupUrl(hdr.input.lookupUrl, r, hdr, rIdx)"
                        :lookup-key="hdr.input.lookupKey"
                        :allow-add="hdr.input.allowAdd"
                        :lookup-format1="hdr.input.lookupFormat1"
                        :lookup-format2="hdr.input.lookupFormat2"
                        :decimal="hdr.input.decimal"
                        :date-format="hdr.input.dateFormat"
                        :multiple="hdr.input.multiple"
                        hide-placeholder
                        :lookup-labels="hdr.input.lookupLabels"
                        :lookup-payload-builder="resolveInputLookupPayloadBuilder(hdr.input.lookupPayloadBuilder, r, hdr, rIdx)"
                        :lookup-searchs="
                          hdr.input.lookupSearchs &&
                          hdr.input.lookupSearchs.length == 0
                            ? hdr.input.lookupLabels
                            : hdr.input.lookupSearchs
                        "
                        @focus="rowFieldFocus"
                        @change="rowFieldChanged"
                        v-model="r[hdr.input.field]"
                      />
                    </div>
                    <div v-else class="suim_editor_display">
                      <s-grid-column
                        :record="r"
                        :column-config="hdr"
                        :label-method="labelMethod"
                        :id-field-name="idFieldName"
                      />
                    </div>
                  </slot>
                </td>

                <td
                  class="whitespace-nowrap px-2 py-1 align-top items-center flex gap-[2px]"
                  :class="[{ 'suim_sticky': scrollMode, 'suim_sticky_right': scrollMode }, scrollMode ? stickyTdBg(rIdx) : '']"
                  :style="scrollMode ? 'right:0px' : ''"
                  data-role="action"
                  v-if="!hideAction"
                >
                  <slot name="item_buttons_1" :item="r" :config="config"></slot>
                  <slot name="item_buttons" :item="r" :config="config">
                    <slot name="item_button_recordchange" :item="r" :config="config">
                      <a
                        href="#"
                        v-if="
                          editor &&
                          r.suimRecordChange === true &&
                          !hideSaveButton &&
                          !autoCommitLine
                        "
                        @click="saveRowData(r, rIdx)"
                        class="save_action"
                      >
                        <mdicon
                          name="content-save"
                          width="16"
                          alt="edit"
                          class="cursor-pointer hover:text-primary"
                        />
                      </a>
                    </slot>
                    <slot name="item_button_edit" :item="r" :config="config">
                      <a
                        href="#"
                        v-if="!hideDetail && !hideEdit"
                        @click="selectData(r, rIdx)"
                        class="edit_action"
                      >
                        <mdicon
                          name="pencil"
                          width="16"
                          alt="edit"
                          class="cursor-pointer hover:text-primary"
                        />
                      </a>
                    </slot>
                    <slot name="item_button_delete" :item="r" :config="config">
                      <a
                        href="#"
                        v-if="!(hideDeleteButton || (data.recordChanged && !hideSaveButton))"
                        @click="deleteData(r, rIdx)"
                        class="delete_action"
                      >
                        <mdicon
                          name="delete"
                          width="16"
                          alt="delete"
                          class=""
                        />
                      </a>
                    </slot>
                  </slot>
                  <slot name="item_buttons_2" :item="r" :config="config"></slot>
                </td>
              </tr>

              <tr
                v-if="secondaryRow"
                class="suim_secondary_row border-b-[1px] border-slate-200"
              >
                <td :colspan="gridColumnCount" class="px-2 py-1">
                  <slot name="secondary_row" :item="r" :config="config"></slot>
                </td>
              </tr>
            </template>
          </tbody>

        </table>
        </div>

        <div
          v-if="totalUrl !== ''"
          name="grid_total_area"
          class="suim_total_area"
          :class="{ 'text-[0.9em] editor': editor }"
        >
          <slot name="grid_total" :item="data.total"></slot>
        </div>

        <div v-if="!props.hideFooter" ref="gridFooterEl" class="footer">
          <slot
            name="footer_1"
            v-bind="{
              items: data.items,
              recordCount: data.recordCount,
              currentPage: data.currentPage,
              pageCount: pageCount, 
            }"
          ></slot>
          <slot
            name="paging"
            v-bind="{
              items: data.items,
              recordCount: data.recordCount,
              currentPage: data.currentPage,
              pageCount: pageCount, 
            }"
          >
            <s-pagination
              v-if="!hidePaging"
              :recordCount="data.recordCount"
              :pageCount="pageCount"
              :current-page="data.currentPage"
              :page-size="data.pageSize"
              @changePage="changePage"
              @changePageSize="changePageSize"
            ></s-pagination> 
          </slot>
          <slot
            name="footer_2"
            v-bind="{
              items: data.items,
              recordCount: data.recordCount,
              currentPage: data.currentPage,
              pageCount: pageCount,  
            }"
          ></slot>
        </div>
      </div>

      <div v-else>
        <slot name="nodata">
          <div class="nodata">No data</div>
        </slot>
      </div>
    </div>

    <div v-else>
      <slot name="loading">
        <div class="loading">loading data from server ...</div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import SButton from "./SButton.vue";
import SInput from "./SInput.vue";
import SGridColumn from "./SGridColumn.vue";
import SModal from "./SModal.vue";
import SPagination from "./SPagination.vue";
import { computed, inject, nextTick, onMounted, reactive, ref, watch } from "vue";
import util from "../scripts/util";
import { useRoute } from "vue-router";
import { onUnmounted } from "vue";

const route = useRoute();
let sGridShortcutScopeSeq = 0;
let activeSGridShortcutScopeId = null;
const sGridShortcutRegistry = new Map();

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  config: { type: Object, default: () => {} },
  customFilter: { type: Object, default: () => {} },
  readUrl: { type: String, default: "" },
  updateUrl: { type: String, default: "" },
  deleteUrl: { type: String, default: "" },
  pageSize: { type: Number, default: 20 },
  hideHeader: { type: Boolean, default: false },
  editor: { type: Boolean, default: false },
  singleColor: { type: Boolean, default: false },
  autoSearch: { type: Boolean, default: false },
  sortField: { type: String, default: "" },
  sortDirection: { type: String, default: "" },
  autoCommitLine: { type: Boolean, default: false },
  labelMethod: { type: String, default: "none" },
  noConfirmDelete: { type: Boolean },
  hideNew: { type: Boolean },
  hideControl: { type: Boolean },
  hideSearch: { type: Boolean },
  hideSort: { type: Boolean },
  hideButtons: { type: Boolean, default: false },
  hideRefreshButton: { type: Boolean, default: false },
  hideNewButton: { type: Boolean, default: false },
  hideSaveButton: { type: Boolean },
  hideEdit: { type: Boolean, default: false },
  hideDeleteButton: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false },
  hidePaging: { type: Boolean, default: false },
  hideSelect: { type: Boolean, default: false },
  hideDetail: { type: Boolean, default: false },
  hideAction: { type: Boolean, default: false },
  totalUrl: { type: String, default: "" },
  inlineSearch: { type: Boolean, default: false },
  keywordOperation: { type: String, default: "" },
  disableDblClick: { type: Boolean, default: false },
  fixColumn: { type: Number, default: 0 },
  secondaryRow: { type: Boolean, default: false },
  rowClass: { type: Function, default: null },
  idFieldName: { type: String, default: "_id" },
  fitViewport: { type: Boolean, default: false },
});

const axios = inject("axios");

const keywordOp = computed(() => {
  return (
    props.keywordOperation ||
    props.config?.setting?.keywordOperator ||
    "$contains"
  );
});

const emit = defineEmits({
  newData: null,
  getData: null,
  selectData: null,
  deleteData: null,
  rowUpdated: null,
  rowDeleted: null,
  rowFieldChanged: null,
  gridRefreshed: null,
  saveRowData: null,
  "update:modelValue": null,
  refreshTotal: null,
  checkUncheckAll: null,
  checkUncheck: null,
  resetCustomFilter:null,
});

const data = reactive({
  keyword: "",
  items: props.modelValue == undefined ? [] : 
    props.modelValue.map(el => normalizeGridRow(el)),
  recordCount: props.modelValue == undefined ? 0 : props.modelValue.length,
  currentPage: 1,
  sortField:
    props.sortField == undefined || props.sortField == ""
      ? "_id"
      : props.sortField,
  sortDirection: ["asc", "desc"].includes(props.sortDirection)
    ? props.sortDirection
    : "desc",
  searchableFields: [],
  pageSize: props.pageSize,
  deleteFn: undefined,
  loading: false,
  currentIndex: -1,
  editorFocusedCell: null,
  editorTooltip: {
    show: false,
    text: "",
    left: 0,
    top: 0,
    transform: "translate(0, 0)",
  },
  recordChanged: false,
  savingChangedRows: false,
  autoSearch: props.autoSearch,
  showDeleteModal: false,
  total: [],
});

const columnWidthOverrides = ref({});
const resizeState = reactive({
  active: false,
  field: "",
  startX: 0,
  startWidth: 0,
  minWidth: 60,
});

// Untuk menyimpan nilai inline search per kolom
if (props.inlineSearch && props.config && props.config.fields) {
  props.config.fields.forEach(f => {
    if (f.readType === 'show') {
      if (typeof f.inlineSearchValue === 'undefined') {
        f.inlineSearchValue = '';
      }
    }
  });
}

const deleteModal = ref(null);
const showInlineSearch = ref(false);
const tableEl = ref(null);
const tableScrollerEl = ref(null);
const gridFooterEl = ref(null);
const gridRoot = ref(null);
const colLefts = ref({});
const shortcutScopeId = `sgrid-shortcut-${++sGridShortcutScopeSeq}`;
const viewportTableHeight = ref("");
const horizontalDrag = reactive({
  active: false,
  moved: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  startScrollLeft: 0,
});

const tableScrollerStyle = computed(() => {
  return props.fitViewport && viewportTableHeight.value
    ? { maxHeight: viewportTableHeight.value }
    : {};
});

function resetCustomFilter(){
  emit("resetCustomFilter")
}

function activateShortcutScope() {
  activeSGridShortcutScopeId = shortcutScopeId;
}

function isGridVisible() {
  const el = gridRoot.value;
  return !!(el && el.isConnected && el.getClientRects().length > 0);
}

function getGridDepth(el) {
  let depth = 0;
  let current = el?.parentElement || null;
  while (current) {
    depth += 1;
    current = current.parentElement;
  }
  return depth;
}

function resolveActiveShortcutScope() {
  const activeElement = document.activeElement;
  const visibleEntries = Array.from(sGridShortcutRegistry.values())
    .filter((entry) => entry.isVisible())
    .sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return b.order - a.order;
    });

  if (activeElement instanceof Node) {
    const focusedEntry = visibleEntries.find((entry) => entry.element()?.contains(activeElement));
    if (focusedEntry) {
      activeSGridShortcutScopeId = focusedEntry.id;
      return focusedEntry.id;
    }
  }

  const activeEntry = visibleEntries.find((entry) => entry.id === activeSGridShortcutScopeId);
  if (activeEntry) {
    return activeEntry.id;
  }

  const fallbackEntry = visibleEntries[0];
  activeSGridShortcutScopeId = fallbackEntry?.id || null;
  return activeSGridShortcutScopeId;
}

function isShortcutScopeActive(event) {
  if (!isGridVisible()) return false;

  const target = event?.target;
  if (target instanceof Node && gridRoot.value?.contains(target)) {
    activateShortcutScope();
    return true;
  }

  return resolveActiveShortcutScope() === shortcutScopeId;
}

function rowFieldFocus(name, v1, v2, ctlRef) {
  const currentRowIndex = ctlRef?.rowIndex;
  if (currentRowIndex === undefined) return;
  setEditorCellFocus(currentRowIndex, name);
  setCurrentRow(currentRowIndex);
}

function onRowFocus(rowIndex) {
  setCurrentRow(rowIndex);
}

function setCurrentRow(rowIndex) {
  if (data.currentIndex === rowIndex) return;
  data.currentIndex = rowIndex;
  data.recordChanged = false;
}

function editorCellKey(rowIndex, field) {
  return `${rowIndex}:${field || ""}`;
}

function resolveInputLookupUrl(lookupUrl, record, header, rowIndex) {
  if (typeof lookupUrl === "function") {
    return lookupUrl(record, header, rowIndex) || "";
  }

  return lookupUrl || "";
}

function resolveInputLookupPayloadBuilder(lookupPayloadBuilder, record, header, rowIndex) {
  if (typeof lookupPayloadBuilder !== "function") return lookupPayloadBuilder;

  return (query) => lookupPayloadBuilder(query, record, header, rowIndex) || {};
}

function setEditorCellFocus(rowIndex, field) {
  data.editorFocusedCell = editorCellKey(rowIndex, field);
  hideEditorTooltip();
}

function clearEditorCellFocus(rowIndex, field) {
  if (data.editorFocusedCell === editorCellKey(rowIndex, field)) {
    data.editorFocusedCell = null;
  }
}

function isEditorCellFocused(rowIndex, field) {
  return data.editorFocusedCell === editorCellKey(rowIndex, field);
}

function editorTooltipText(record = {}, hdr = {}) {
  const field = hdr.input?.field || hdr.field;
  const value = record?.[field];
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);

  const kind = String(hdr.input?.kind || hdr.kind || "").toLowerCase();
  if (["number", "int", "integer", "float", "decimal"].includes(kind)) {
    const decimal = hdr.input?.decimal ?? hdr.decimal ?? 0;
    return util.formatMoney(value, { decimal });
  }

  return String(value);
}

function showEditorTooltip(event, record = {}, hdr = {}, rowIndex) {
  const field = hdr.input?.field || hdr.field;
  if (isEditorCellFocused(rowIndex, field)) return;

  const text = editorTooltipText(record, hdr);
  if (!text) return;

  data.editorTooltip.text = text;
  data.editorTooltip.show = true;
  moveEditorTooltip(event);
}

function moveEditorTooltip(event) {
  if (!data.editorTooltip.show) return;

  const offset = 12;
  const nearRight = event.clientX > window.innerWidth - 360;
  const nearBottom = event.clientY > window.innerHeight - 96;

  data.editorTooltip.left = nearRight ? event.clientX - offset : event.clientX + offset;
  data.editorTooltip.top = nearBottom ? event.clientY - offset : event.clientY + offset;
  data.editorTooltip.transform = `${nearRight ? "translateX(-100%)" : "translateX(0)"} ${nearBottom ? "translateY(-100%)" : "translateY(0)"}`;
}

function hideEditorTooltip() {
  data.editorTooltip.show = false;
}

function saveRowData(r, rowIndex) {
  if (
    props.updateUrl == undefined ||
    props.updateUrl == "" ||
    props.updateUrl == null
  ) {
    emit("saveRowData", r, rowIndex);
    return Promise.resolve();
  }

  return axios.post(props.updateUrl, r).then(
    (r) => {
      r = r.data;
      r.suimRecordChange = false;
      r.suimRowMode = "edit";
      data.items[rowIndex] = r;
      emit("rowUpdated", r);
      updateRecordChanged();
      return r;
    },
    (e) => {
      util.showError(e);
      throw e;
    }
  );
}

function saveActiveRow() {
  if (!props.editor || props.autoCommitLine || props.hideSaveButton) return;
  const rowIndex = data.currentIndex;
  if (rowIndex < 0 || rowIndex >= data.items.length) return;

  const row = data.items[rowIndex];
  if (!row || row.suimRecordChange !== true) return;
  saveRowData(row, rowIndex);
}

async function saveChangedRows() {
  if (!showHeaderSaveButton.value || data.savingChangedRows) return;

  const changedRowIndexes = data.items
    .map((row, index) => (row?.suimRecordChange === true ? index : -1))
    .filter((index) => index >= 0);

  if (changedRowIndexes.length === 0) return;

  data.savingChangedRows = true;
  try {
    for (const rowIndex of changedRowIndexes) {
      const row = data.items[rowIndex];
      if (!row || row.suimRecordChange !== true) continue;
      await saveRowData(row, rowIndex);
    }
  } finally {
    data.savingChangedRows = false;
  }
}

function updateRecordChanged() {
  for (const itIndex in data.items) {
    const it = data.items[itIndex];
    if (it.suimRecordChange === true) {
      data.recordChanged = true;
      return;
    }
  }

  data.recordChanged = false;
}

function rowFieldChanged(name, v1, v2) {
  const currentIndex = data.currentIndex;
  const current = data.items[currentIndex];
  if (props.autoCommitLine) {
    emit("rowFieldChanged", name, v1, v2, current, current);
    emit("update:modelValue", data.items);
  } else {
    current.suimRecordChange = true;
    data.recordChanged = true;
    emit("rowFieldChanged", name, v1, v2, current, current);
  }
}

const selecteds = computed(() => {
  return data.items.filter((el) => el.isSelected === true);
});

const sortIcon = computed({
  get() {
    switch (data.sortDirection) {
      case "asc":
        return "arrow-up";

      case "desc":
        return "arrow-down";

      default:
        return "radiobox-blank";
    }
  },
});

const pageCount = computed({
  get() {
    return Math.ceil(data.recordCount / data.pageSize);
  },
});

function normalizeGridRow(row = {}) {
  row.suimRecordChange = row.suimRecordChange === true;
  row.suimRowMode = row.suimRowMode === "new" ? "new" : "edit";
  return row;
}

const showHeaderSaveButton = computed(() => {
  return props.editor && !props.autoCommitLine && !props.hideSaveButton && data.recordChanged;
});

const scrollMode = computed({
  get() {
    return props.fixColumn > 0;
  },
});

const gridColumnCount = computed({
  get() {
    const visibleColumnCount = props.config?.fields?.filter((el) => el.readType == "show").length || 0;
    return visibleColumnCount + (props.hideSelect ? 0 : 1) + (props.hideAction ? 0 : 1);
  },
});

const selectColumnStyle = {
  width: "60px",
  minWidth: "60px",
};

function normalizeWidth(width) {
  if (width === undefined || width === null || width === "") return "";
  return typeof width === "number" ? `${width}px` : width;
}

function parsePixelWidth(width) {
  if (typeof width === "number" && Number.isFinite(width)) return width;
  if (typeof width !== "string") return null;
  const match = width.trim().match(/^(\d+(?:\.\d+)?)px$/i);
  if (!match) return null;
  return Number(match[1]);
}

function columnDefaultWidth(hdr = {}) {
  const kind = String(hdr.input?.kind || hdr.kind || "").toLowerCase();
  const hasDropdownSource = hdr.input?.useList || hdr.input?.lookupUrl || hdr.input?.items?.length > 0;

  if (hasDropdownSource || ["dropdown", "selection", "select"].includes(kind)) return "120px";
  if (["number", "int", "integer", "float", "decimal"].includes(kind)) return "100px";
  if (["date", "time"].includes(kind)) return "100px";
  if (["datetime"].includes(kind)) return "140px";
  return "auto";
}

function columnWidthStyle(hdr = {}) {
  const overriddenWidth = normalizeWidth(columnWidthOverrides.value[hdr.field]);
  if (overriddenWidth) {
    return {
      width: overriddenWidth,
      minWidth: overriddenWidth,
      maxWidth: overriddenWidth,
    };
  }

  const explicitWidth = normalizeWidth(hdr.width);
  if (explicitWidth) {
    return {
      width: explicitWidth,
      minWidth: explicitWidth,
      maxWidth: explicitWidth,
    };
  }

  const defaultWidth = columnDefaultWidth(hdr);
  if (!defaultWidth || defaultWidth === "auto") return {};

  return {
    minWidth: defaultWidth,
  };
}

function columnResizeMinWidth(hdr = {}) {
  const defaultWidth = parsePixelWidth(columnDefaultWidth(hdr));
  return Math.max(60, Math.min(defaultWidth || 60, 120));
}

function isFixedColumn(hdrIndex) {
  return scrollMode.value && hdrIndex < props.fixColumn;
}

function stickyTdBg(rowIndex) {
  let cls = !props.editor && !props.singleColor && rowIndex % 2 === 1 ? "bg-slate-100" : "bg-white";
  if (!props.hideEdit) cls += " group-hover:bg-slate-200";
  return cls;
}

let stickyObserver = null;
let stickyTarget = null;
let viewportObserver = null;

function updateViewportHeight() {
  if (!props.fitViewport || !tableScrollerEl.value || typeof window === "undefined") {
    viewportTableHeight.value = "";
    return;
  }

  const tableTop = tableScrollerEl.value.getBoundingClientRect().top;
  const footerHeight = gridFooterEl.value?.offsetHeight || 0;
  const totalHeight = gridRoot.value?.querySelector(".suim_total_area")?.offsetHeight || 0;
  const availableHeight = Math.floor(window.innerHeight - tableTop - footerHeight - totalHeight - 16);

  viewportTableHeight.value = `${Math.max(0, availableHeight)}px`;
}

function ensureViewportObserver() {
  if (!props.fitViewport || typeof ResizeObserver === "undefined") return;
  if (viewportObserver) viewportObserver.disconnect();

  viewportObserver = new ResizeObserver(() => updateViewportHeight());
  if (gridRoot.value) viewportObserver.observe(gridRoot.value);
  if (gridFooterEl.value) viewportObserver.observe(gridFooterEl.value);
}

function ensureStickyObserver() {
  if (tableEl.value && tableEl.value !== stickyTarget) {
    if (stickyObserver) stickyObserver.disconnect();
    stickyObserver = new ResizeObserver(() => updateSticky());
    stickyObserver.observe(tableEl.value);
    stickyTarget = tableEl.value;
  }
}

function updateSticky() {
  if (!scrollMode.value) return;
  const table = tableEl.value;
  if (!table) return;
  const headerRow = table.querySelector("thead tr");
  if (!headerRow) return;

  const next = {};
  let acc = 0;
  headerRow.querySelectorAll("th").forEach((th) => {
    const role = th.getAttribute("data-role");
    const colIdx = Number(th.getAttribute("data-col-index") ?? -1);
    const fixed =
      role == "select" ||
      (role == "data" && colIdx >= 0 && colIdx < props.fixColumn);
    if (!fixed) return;
    next[role == "select" ? "__select" : String(colIdx)] = acc;
    acc += th.offsetWidth;
  });

  colLefts.value = next;
}

function refreshSticky() {
  ensureStickyObserver();
  nextTick(updateSticky);
}

function isHorizontalDragTarget(target) {
  if (!(target instanceof Element)) return false;
  if (!target.closest("tbody")) return false;
  return !target.closest("input, textarea, select, button, a, label, [contenteditable='true'], .suim_editor_input");
}

function startHorizontalDrag(event) {
  if (!tableScrollerEl.value || !isHorizontalDragTarget(event.target)) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;

  horizontalDrag.active = true;
  horizontalDrag.moved = false;
  horizontalDrag.pointerId = event.pointerId;
  horizontalDrag.startX = event.clientX;
  horizontalDrag.startY = event.clientY;
  horizontalDrag.startScrollLeft = tableScrollerEl.value.scrollLeft;
}

function moveHorizontalDrag(event) {
  if (!horizontalDrag.active || horizontalDrag.pointerId !== event.pointerId || !tableScrollerEl.value) return;

  const deltaX = event.clientX - horizontalDrag.startX;
  const deltaY = event.clientY - horizontalDrag.startY;
  if (!horizontalDrag.moved) {
    if (Math.abs(deltaX) < 4 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    horizontalDrag.moved = true;
    tableScrollerEl.value.setPointerCapture?.(event.pointerId);
  }

  event.preventDefault();
  tableScrollerEl.value.scrollLeft = horizontalDrag.startScrollLeft - deltaX;
}

function stopHorizontalDrag(event) {
  if (!horizontalDrag.active || (event && horizontalDrag.pointerId !== event.pointerId)) return;
  if (tableScrollerEl.value?.hasPointerCapture?.(horizontalDrag.pointerId)) {
    tableScrollerEl.value.releasePointerCapture(horizontalDrag.pointerId);
  }
  horizontalDrag.active = false;
  horizontalDrag.pointerId = null;
}

function setGridResizeCursor(active) {
  if (typeof document === "undefined") return;
  document.body.style.cursor = active ? "col-resize" : "";
  document.body.style.userSelect = active ? "none" : "";
}

function handleColumnResizeMove(event) {
  if (!resizeState.active || !resizeState.field) return;
  const deltaX = event.clientX - resizeState.startX;
  const nextWidth = Math.max(
    resizeState.minWidth,
    Math.round(resizeState.startWidth + deltaX)
  );
  columnWidthOverrides.value = {
    ...columnWidthOverrides.value,
    [resizeState.field]: `${nextWidth}px`,
  };
  refreshSticky();
}

function stopColumnResize() {
  if (!resizeState.active) return;
  resizeState.active = false;
  resizeState.field = "";
  setGridResizeCursor(false);
  if (typeof document !== "undefined") {
    document.removeEventListener("mousemove", handleColumnResizeMove);
    document.removeEventListener("mouseup", stopColumnResize);
  }
  refreshSticky();
}

function startColumnResize(hdr, event) {
  const th = event.currentTarget?.closest?.("th");
  if (!th || !hdr?.field) return;

  resizeState.active = true;
  resizeState.field = hdr.field;
  resizeState.startX = event.clientX;
  resizeState.startWidth = th.offsetWidth;
  resizeState.minWidth = columnResizeMinWidth(hdr);

  setGridResizeCursor(true);
  if (typeof document !== "undefined") {
    document.addEventListener("mousemove", handleColumnResizeMove);
    document.addEventListener("mouseup", stopColumnResize);
  }
}

watch(
  () => [data.items.length, props.modelValue],
  () => {
    refreshSticky();
    nextTick(() => {
      ensureViewportObserver();
      updateViewportHeight();
    });
  },
  { flush: "post" }
);

watch(
  () => [props.config, props.fixColumn, props.editor, props.hideSelect],
  () => {
    refreshSticky();
    nextTick(() => {
      ensureViewportObserver();
      updateViewportHeight();
    });
  },
  { flush: "post" }
);

function setLoading(loading) {
  data.loading = loading;
}
function getLoading(){
  return data.loading
}

function checkUncheckAll(ev) {
  const checked = ev.target.checked;
  data.items.forEach((i) => (i.isSelected = checked));
  emit("checkUncheckAll", checked);
}

function isSortable(hdr = {}) {
  return !props.hideSort && (props.config?.setting?.sortable || []).includes(hdr.field);
}

function toggleSort(hdr = {}) {
  if (!isSortable(hdr)) return;

  const direction = data.sortField === hdr.field && data.sortDirection === "asc"
    ? "desc"
    : "asc";
  changeSortOpts(hdr.field, direction);
}

function changeSortOpts(field, direction) {
  if (data.sortField == field && data.sortDirection == direction) {
    data.sortField = "";
    data.sortDirection = "";
  } else {
    data.sortField = field;
    data.sortDirection = direction;
  }
  refreshData();
}

function queryParam() {
  const keywordFields = props.config.setting
    ? props.config.setting.keywordFields
    : [];
  const param = {
    Skip: (data.currentPage - 1) * data.pageSize,
    Take: data.pageSize,
  };

  const filters = [];

  // Custom && Inline search filter
  if (props.config && props.config.fields) {
    if (props.inlineSearch) {
      const inlineFilters = props.config.fields
        .filter(f => f.readType === 'show' && f.inlineSearchValue && f.inlineSearchValue !== '')
        .map(f => ({
          Field: f.field,
          Op: keywordOp.value,
          Value: f.inlineSearchValue,
        }));
      if (inlineFilters.length > 0) {
        filters.push({ Op: '$and', Items: inlineFilters });
      }
    } else if (data.autoSearch) {
      const autoFilters = calcSearchQuery.value;
      if (autoFilters.length > 0 ) {
        filters.push(...autoFilters);
      }
    } else if (keywordFields.length > 0 && data.keyword && data.keyword != "") {
      const kwOp = keywordOp.value;
      filters.push({
        Op: "$or",
        Items: keywordFields.map((k) => {
          return {
            Field: k,
            Op: kwOp,
            Value: data.keyword,
          };
        }),
      });
    }
  }

  if (props.customFilter && props.customFilter.Op != "")
    filters.push(props.customFilter);
  if (filters.length > 0)
    param.Where =
      filters.length === 1 ? filters[0] : { Op: "$and", Items: filters };

  if (data.sortField != "") {
    if (data.sortDirection == "asc") {
      param.Sort = [data.sortField];
    } else {
      param.Sort = ["-" + data.sortField];
    }
  }

  param.Select = props.config.fields.map((f) => f.field);
  return param;
}

function resetFilter(){
  data.keyword ="";
  resetCustomFilter()

}

function refreshData(callBackFn) {
  if (props.readUrl == undefined || props.readUrl == "") {
    emit("getData", data.keyword);
    if (callBackFn && typeof callBackFn == "function") callBackFn();
    emit("gridRefreshed");
    return;
  }
  setLoading(true);
  axios.post(props.readUrl, queryParam()).then(
    (r) => {
      data.items = r.data.data.map((d) => {
        d.isSelected = false;
        return d;
      });
      data.recordCount = r.data.count;
      setLoading(false);
      emit("gridRefreshed", data.items);
      if (props.totalUrl != "") {
        setTotal();
      }
      if (callBackFn && typeof callBackFn == "function") callBackFn(); 
    },
    (e) => {
      //util.showError(e);
      setLoading(false);
    }
  );
}

function newData() {
  emit("newData", null);
}

function addData(dt) {
  dt.suimRowMode="new";
  dt.suimRecordChange = true;
  data.items.push(dt);
  emit("update:modelValue", data.items);
  emit("rowUpdated", dt);
  updateRecordChanged();
  focusNewEditorRow(data.items.length - 1);
}

function focusNewEditorRow(rowIndex) {
  if (!props.editor || rowIndex < 0) return;

  let attempts = 0;
  const focusControl = () => {
    const row = gridRoot.value?.querySelector(`tr[data-row-index="${rowIndex}"]`);
    const control = row?.querySelector(
      '.suim_editor_input input:not([type="hidden"]):not([disabled]), .suim_editor_input textarea:not([disabled]), .suim_editor_input select:not([disabled]), .suim_editor_input button:not([disabled])'
    );
    if (control) {
      row.scrollIntoView?.({ block: "nearest" });
      control.focus?.({ preventScroll: true });
      return;
    }

    attempts += 1;
    if (attempts < 4) setTimeout(focusControl, 50);
  };

  // The parent v-model update can render once more after addData(), so wait for
  // both Vue render passes before resolving the new row's first editor control.
  nextTick(() => nextTick(() => setTimeout(focusControl, 0)));
}

function deleteData(record, dataIndex) {
  data.deleteFn = () => {
    if (props.deleteUrl == "") {
      emit("deleteData", record, dataIndex);
      refreshData(() => {
        emit("rowDeleted", record);
        updateRecordChanged();
      });
      return; 
    } else {
      axios.post(props.deleteUrl, record).then(
        (r) => {
          refreshData(() => {
            emit("rowDeleted", record);
            updateRecordChanged();
          });
        },
        (e) => {
          util.showError(e);
        }
      );
    }
  };

  if (props.noConfirmDelete) {
    data.deleteFn();
    return;
  }

  deleteModal.value.show();
}

function confirmDelete() {
  deleteModal.value.hide();
  data.deleteFn();
}

function handleRowDblClick(event, record, index) {
  if (!isHorizontalDragTarget(event.target)) return;
  selectData(record, index, true);
}

function selectData(record, index, dblclick) {
  if (dblclick && props.disableDblClick) return;
  if (dblclick && props.editor) return;
  data.currentIndex = index;
  emit("selectData", record, index, dblclick === true);
}
function changePageSize(pageSize){
  data.pageSize = pageSize
  data.currentPage = 1; 
  refreshData();
}
function changePage(page) {
  data.currentPage = page;
  refreshData();
}

function getRecords() {
  return data.items;
}

function getRecord(recordIndex) {
  return data.items[recordIndex];
}

function setRecord(recordIndex, record) {
  data.items[recordIndex] = normalizeGridRow(record);
  updateRecordChanged();
}

function setRecordByID(record) {
  data.items.forEach((dt, index) => {
    if (dt[props.idFieldName] == record[props.idFieldName]) {
      data.items[index] = normalizeGridRow(record);   
    }
  });
  updateRecordChanged();
}

function setTotal() {
  const url = props.totalUrl;
  const params = data.items;
  axios.post(url, params).then(
    (r) => {
      data.total = r.data;
      emit("RefreshTotal", r.data);
    },
    (e) => {
      util.showError(e);
    }
  );
}

function getActiveIndex() {
  return data.currentIndex;
}

function setRecords(newDataSet) {
  data.items = (newDataSet || []).map((item) => normalizeGridRow(item));
  updateRecordChanged();
}

function getCurrentIndex() {
  return data.currentIndex;
}

function getSortField() {
  return data.sortField;
}

function setSortField(s) {
  data.sortField = s;
}

function getSortDirection() {
  return data.sortDirection;
}

function setSortDirection(d) {
  data.sortDirection = d;
}

function getSelected() {
  return selecteds;
}

function checkUncheck(item) {
  emit("checkUncheck", item);
}
defineExpose({
  getCurrentIndex,
  getRecords,
  getRecord,
  getActiveIndex,
  setRecord,
  setRecordByID,
  getSelected,
  refreshData,
  addData,
  newData,
  getSortField,
  setSortField,
  getSortDirection,
  setSortDirection,
  setLoading,
  getLoading,
  setRecords,
  setTotal,
  resetFilter,
});

onMounted(() => {
  window.addEventListener("resize", updateViewportHeight, { passive: true });
  sGridShortcutRegistry.set(shortcutScopeId, {
    id: shortcutScopeId,
    order: sGridShortcutScopeSeq,
    depth: getGridDepth(gridRoot.value),
    element: () => gridRoot.value,
    isVisible: isGridVisible,
  });
  document.addEventListener('keydown', handleKeyDown);
  gridRoot.value?.addEventListener("focusin", activateShortcutScope);
  gridRoot.value?.addEventListener("mousedown", activateShortcutScope);
  gridRoot.value?.addEventListener("touchstart", activateShortcutScope, { passive: true });
  if (isGridVisible()) {
    resolveActiveShortcutScope();
  }
  refreshSticky();
  nextTick(() => {
    ensureViewportObserver();
    updateViewportHeight();
  });
  //refreshData();
  //console.log(`mounting grid ${props.config.title}`);
});

onUnmounted(() => {
  stopColumnResize();
  stopHorizontalDrag();
  window.removeEventListener("resize", updateViewportHeight);
  document.removeEventListener("keydown", handleKeyDown);
  gridRoot.value?.removeEventListener("focusin", activateShortcutScope);
  gridRoot.value?.removeEventListener("mousedown", activateShortcutScope);
  gridRoot.value?.removeEventListener("touchstart", activateShortcutScope);
  sGridShortcutRegistry.delete(shortcutScopeId);
  if (activeSGridShortcutScopeId === shortcutScopeId) {
    activeSGridShortcutScopeId = null;
    resolveActiveShortcutScope();
  }
  if (stickyObserver) stickyObserver.disconnect();
  if (viewportObserver) viewportObserver.disconnect();
  //console.log(`unmounting grid ${props.config.title}`);
});

const editActions =ref([]);
const currentFocusIndex = ref(-1);

function handleKeyDown(event) {
  if (!isShortcutScopeActive(event)) return;

  const key = String(event.key || "").toLowerCase();
  if (event.altKey && key === "r") {
    event.preventDefault();
    refreshData();
  } else if (event.altKey && key === "n") {
    event.preventDefault();
    newData();
  } else if (event.altKey && key === "s") {
    event.preventDefault();
    saveActiveRow();
  } else if (event.altKey && event.key === "1") {
    event.preventDefault();
    editActions.value = document.querySelectorAll(".edit_action");
    if (editActions.value.length > 0) {
      const nextIndex = (currentFocusIndex.value + 1) % editActions.value.length;
      editActions.value[nextIndex].focus();
      currentFocusIndex.value = nextIndex;
    } else {
      console.log("no edit actions found");
    }
  }
}

const computedSearchableFields = () => {
  if (props.config && props.config.fields) {
    return props.config.fields
      .filter(f => props.config.setting?.searchable?.includes(f.field))
      .map(f => {
        const ops = []
        switch (f.kind) {
          case 'number':
            ops.push('equal', 'not equal', 'greater than', 'less than', 'greater or equal', 'less or equal');
            break;
          case 'date':
          case 'datetime':
            ops.push('equal', 'not equal', 'before', 'after', 'on or before', 'on or after');
            break;
          case 'bool':
          case 'checkbox':
            ops.push('is', 'is not');
            break;
          case 'text':
          case 'string':
            ops.push('contains', 'not contains', 'starts with', 'ends with', 'equal', 'not equal');
        }
        
        f.input.readOnly = false;
        f.input.disable = false;
        
        return { 
          field: f,
          ops: ops,
          value1: f.input.lookupUrl ? [] : null,
          value2: null
        }});
  }
  return [];
};

watch(
  () => props.modelValue,
  (nv) => {
    if (nv == undefined) {
      data.items = [];
      return;
    }
    data.items = nv.map((item) => normalizeGridRow(item));
  }
);

watch(
  () => route.query,
  () => {
    data.keyword = "";
  }
);

watch(
  () => props.config,
  (nv) => {
    data.searchableFields = computedSearchableFields();
    //showInlineSearch.value = props.inlineSearch && data.searchableFields.length > 0;
  },
  { immediate: true }
);

const calcSearchQuery = computed(() => {
  if (data.searchableFields.length == 0) return {};
  const parts = [];
  data.searchableFields.forEach(sf => {
    //console.log(sf.field.input.field, sf.field.input.kind, sf.value1, sf.value2);
    // if field is number, then value1 and value2 should be parsed to float
    if (sf.field.input.kind=='number') {
      if (sf.value1 != null && sf.value2 != null) {
        const v1 = parseFloat(sf.value1);
        const v2 = parseFloat(sf.value2);
        if (!isNaN(v1) && !isNaN(v2)) {
          parts.push({
            Field: sf.field.field,
            Op: '$range',
            Value: [v1, v2],
          });
        }
      } else if (sf.value1 != null) {
        const v1 = parseFloat(sf.value1);
        if (!isNaN(v1)) {
          parts.push({
            Field: sf.field.field,
            Op: '$gte',
            Value: v1,
          });
        }
      } else if (sf.value2 != null) {
        const v2 = parseFloat(sf.value2);
        if (!isNaN(v2)) {
          parts.push({
            Field: sf.field.field,
            Op: '$lte',
            Value: v2,
          });
        }
      }
    } else if (sf.field.input.kind=='date' || sf.field.input.kind=='datetime') {
      // if field is date or datetime, then value1 and value2 should be parsed to date
      if (sf.value1 && sf.value2) {
        const d1 = new Date(sf.value1);
        const d2 = new Date(sf.value2);
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
          parts.push({
            Field: sf.field.field,
            Op: '$between',
            Value: [d1.toISOString(), d2.toISOString()],
          });
        }
      } else if (sf.value1) {
        const d1 = new Date(sf.value1);
        if (!isNaN(d1.getTime())) {
          parts.push({
            Field: sf.field.field,
            Op: '$eq',
            Value: d1.toISOString(),
          });
        }
      }
    } else if (sf.field.input.kind=='checkbox') {
      if (sf.value1===true) {
        parts.push({
          Field: sf.field.field,
          Op: '$eq',
          Value: true,
        });
      }
    } else {
      if (sf.field.input.lookupUrl) {
        // if field is lookup, then value1 is array
        if (sf.value1 && Array.isArray(sf.value1)) {
          if (sf.value1.length == 0) return;

          if (sf.field.input.multiple) {
            // if multiple, then use $or with literal because field will be json or jsonb on database
            return parts.push({
              Op: '$or',
              Items: sf.value1.map(v => {
                return {
                  Field: `${sf.field.field} ? '${v}'`,
                  Op: '$literal',
                };
              })
            });
          } else {
            return parts.push({
              Field: sf.field.field,
              Op: '$in',
              Value: sf.value1,
            });
          }
        }
      } else if (sf.value1) {
        if (Array.isArray(sf.value1)) {
          if (sf.value1.length == 0) return;
          return parts.push({
            Field: sf.field.field,
            Op: '$in',
            Value: sf.value1,
          });
        } else {
          return parts.push({
            Field: sf.field.field,
            Op: keywordOp.value,
            Value: sf.value1,
          });
        }
      }
    }
  });
  return parts;
});

</script>
<style scoped>
/* ...existing code... */

/* Responsive grid table */
.suim_area_table {
  max-width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.suim_area_table::-webkit-scrollbar {
  display: none;
}

.suim_grid {
  max-width: 100%;
}

/* Keep the data area inside the viewport while controls and footer remain visible. */
.suim_viewport_grid {
  min-height: 0;
}

.suim_viewport_grid .suim_area_table {
  overflow-x: auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  scrollbar-width: thin;
  -ms-overflow-style: auto;
}

.suim_viewport_grid .suim_area_table::-webkit-scrollbar {
  display: block;
  width: 10px;
  height: 10px;
}

.suim_viewport_grid .suim_table thead th {
  position: sticky;
  top: 0;
  z-index: 4;
}

.suim_viewport_grid .suim_table thead tr:nth-child(2) td {
  position: sticky;
  top: 33px;
  z-index: 4;
}

.suim_viewport_grid .footer {
  flex: 0 0 auto;
  background: #fff;
}

.suim_table tbody tr.suim_data_row + tr.suim_data_row,
.suim_table tbody tr.suim_secondary_row + tr.suim_data_row {
  border-top: 1px solid #cbd5e1;
}

/* Fixed (sticky) columns on the left when fixColumn > 0 */
.suim_grid_scroll .suim_sticky {
  position: sticky;
  z-index: 2;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.06);
}

.suim_grid_scroll thead th.suim_sticky {
  z-index: 5;
}

/* Fixed (sticky) action column on the right when fixColumn > 0 */
.suim_grid_scroll .suim_sticky_right {
  position: sticky;
  right: 0;
  z-index: 2;
  box-shadow: inset 1px 0 0 rgba(0, 0, 0, 0.06);
}

.suim_grid_scroll thead th.suim_sticky_right {
  z-index: 5;
}

.suim_col_resize_handle {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  border: 0;
  padding: 0;
  z-index: 5;
}

.suim_col_resize_handle::before {
  content: "";
  position: absolute;
  top: 20%;
  bottom: 20%;
  left: 3px;
  width: 1px;
  background: rgba(148, 163, 184, 0.45);
  transition: background 0.15s ease;
}

.suim_col_resize_handle:hover::before,
.suim_col_resize_handle:focus-visible::before {
  background: rgba(37, 99, 235, 0.75);
}

/* Excel-like compact cell layout when grid is in editor mode */
.suim_editor_grid td {
  padding: 0;
  vertical-align: top;
}

.suim_editor_grid td[data-role="select"],
.suim_editor_grid td[data-role="action"] {
  padding: 4px 6px;
}

.suim_editor_grid td .suim_editor_display {
  padding: 3px 6px;
}

.suim_editor_grid td .suim_editor_input {
  position: relative;
}

.suim_editor_grid td .suim_editor_input.suim_editor_bool {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 24px;
  padding-top: 2px;
}

.suim_editor_tooltip_fixed {
  position: fixed;
  z-index: 2147483647;
  max-width: min(320px, 70vw);
  padding: 4px 8px;
  white-space: normal;
  overflow-wrap: anywhere;
  pointer-events: none;
  color: #fff;
  background: rgba(15, 23, 42, 0.96);
  border-radius: 4px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.22);
  font-size: 12px;
  line-height: 1.35;
  pointer-events: none;
}

.suim_editor_grid :deep(.suim_input) {
  display: block;
  width: 100%;
}

.suim_editor_grid :deep(.suim_editor_bool .suim_input) {
  display: flex;
  justify-content: center;
  width: 100%;
}

.suim_editor_grid :deep(.suim_editor_bool input[type="checkbox"]) {
  display: block;
  margin: 2px auto 0;
}

.suim_editor_grid :deep(.suim_input input.input_field) {
  width: 100%;
  height: 24px;
  min-height: 24px;
  padding: 2px 6px;
  background: transparent;
  border: 0 !important;
  border-bottom: 0 !important;
  border-radius: 0;
  outline: none;
  box-shadow: none;
}

.suim_editor_grid :deep(.suim_input textarea.input_field) {
  width: 100%;
  min-height: 24px;
  padding: 2px 6px;
  background: transparent;
  border: 0 !important;
  border-bottom: 0 !important;
  border-radius: 0;
  outline: none;
  box-shadow: none;
}

.suim_editor_grid :deep(.suim_input input.input_field:focus),
.suim_editor_grid :deep(.suim_input textarea.input_field:focus) {
  background: #fff;
  box-shadow: inset 0 0 0 2px #2563eb;
}

.suim_editor_grid :deep(.suim_input .input_error),
.suim_editor_grid :deep(.suim_input .italic.opacity-40) {
  display: none !important;
}

.suim_editor_grid :deep(.sdd_root .sdd_toggle) {
  padding: 1px 4px;
  min-height: 24px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0;
}

/* Each data column keeps a readable minimum width */
.suim_table th[data-role="data"],
.suim_table td[data-role="data"] {
  min-width: 80px;
}

/* Non-editor grid: allow cell content to wrap to avoid overlap */
.suim_table:not(.suim_editor_grid) td[data-role="data"] {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  overflow: hidden;
}

/* Responsive th/td for small screens */
@media (max-width: 640px) {
  .suim_table th,
  .suim_table td {
    font-size: 0.85em;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    max-width: 120px;
    white-space: nowrap;
    overflow: visible !important;
    text-overflow: ellipsis;
  }

  .suim_table {
    min-width: 480px;
  }
}
</style>
