<template>
  <div style="w-full" class="flex flex-col gap-1 suim_grid">
    <s-modal :display="false" ref="deleteModal" @submit="confirmDelete">
      You will delete data ! Are you sure ?<br />
      Please be noted, this can not be undone !
    </s-modal>

    <div
      class="flex gap-2 justify-center items-center header"
      v-if="!hideControl"
    >
      <slot name="header_search" :config="config">
        <input
          type="text"
          class="grow input_field border_b_[1px] search_input"
          placeholder="enter search keyword"
          v-model="data.keyword"
          @keyup.enter="refreshData"
          v-if="!hideSearch"
        />
        <div v-else class="grow">&nbsp;</div>
      </slot>
      <div class="flex header_button">
        <slot name="header_buttons_1" :config="config"></slot>
        <slot name="header_buttons" :config="config">
          <s-button
            icon="refresh"
            class="btn_primary refresh_btn"
            tooltip="refresh"
            @click="refreshData"
            v-if="!hideRefreshButton"
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

    <!--<div>data items: {{  data.items }}</div>-->
    <div v-if="!data.loading">
      <div v-if="data.items.length > 0" class="suim_area_table overflow-x-auto">
        <table class="w-full table-auto suim_table min-w-[600px]">
          <!-- header -->
          <thead name="grid_header">
            <tr class="border-b-[1px] border-slate-500">
              <th class="row_select whitespace-nowrap px-2 py-1" v-if="!hideSelect">
                <input type="checkbox" @change="checkUncheckAll" />
              </th>
              <th
                v-for="(hdr, hdrIndex) in config.fields.filter(
                  (el) => el.readType == 'show'
                )"
                :key="'grid_col_' + hdrIndex"
                class="whitespace-nowrap text-ellipsis"
                :class="{
                  'text-right': hdr.align == 'right' || hdr.kind == 'number',
                  'pr-4': hdr.align == 'right' || hdr.kind == 'number',
                  'text-left': !(hdr.align == 'right' || hdr.kind == 'number'),
                }"
                :style="hdr.width != '' ? `width:${hdr.width}` : ''"
              >
                <div class="flex w-full items-center justify-between">
                  <div class="grow">{{ hdr.label }}</div>
                  <div 
                    class="items-end justify-end align-right flex flex-col"
                    v-if="props.config.setting.sortable?.indexOf(hdr.field) >= 0 && !hideSort"
                  >
                    <svg 
                      :class="data.sortField === hdr.field && data.sortDirection === 'asc' ? 'text-grey-300 disabled cursor-not-allowed' : 'text-white cursor-pointer'" 
                      class="h-3 w-3 -mb-1 cursor-pointer" 
                      @click="changeSortOpts(hdr.field, 'asc')"
                      fill="currentColor"  
                      viewBox="0 0 24 24"
                    >
                      <path d="M7,14L12,9L17,14H7Z" />
                    </svg>
                    <svg 
                      :class="data.sortField === hdr.field && data.sortDirection === 'desc' ? 'text-grey-300 disabled cursor-not-allowed' : 'text-white cursor-pointer'" 
                      class="h-3 w-3 cursor-pointer"
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      @click="changeSortOpts(hdr.field, 'desc')"
                    >
                      <path d="M7,10L12,15L17,10H7Z" />
                    </svg>
                  </div>
                </div>
              </th>
              <th
                class="header_column_action"
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
              >
                <s-input
                  v-model="hdr.inlineSearchValue"
                  :placeholder="'Cari ' + hdr.label"
                  size="small"
                  hide-label
                  @keyup.enter="refreshData"
                />
              </td>
              <td v-if="!hideAction" class="whitespace-nowrap px-2 py-1"></td>
            </tr>
          </thead>

          <!-- records -->
          <tbody name="grid_body" :class="{ 'text-[0.9em] editor': editor }">
            <tr
              v-for="(r, rIdx) in data.items"
              :key="'grid_item_' + rIdx"
              class="cursor-pointer border-b-[1px] border-slate-200 last:border-none hover:bg-slate-200"
              :class="{ 'even:bg-slate-100': !editor && !singleColor, 'hover:none':hideEdit}"
              @dblclick="selectData(r, 'detail', true)"
            >
              <td class="w-[30px] text-center whitespace-nowrap px-2 py-1" v-if="!hideSelect">
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
                class="whitespace-nowrap px-2 py-1 text-ellipsis"
              >
                <slot :name="'item_' + hdr.field" :item="r" :header="hdr">
                  <div v-if="editor && !(
                        hdr.input.readOnly || 
                        (hdr.input.readOnlyOnEdit && (r.suimRowMode=='edit' || r.suimRowMode==undefined))
                    )">
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
                      :lookup-url="hdr.input.lookupUrl"
                      :lookup-key="hdr.input.lookupKey"
                      :allow-add="hdr.input.allowAdd"
                      :lookup-format1="hdr.input.lookupFormat1"
                      :lookup-format2="hdr.input.lookupFormat2"
                      :decimal="hdr.input.decimal"
                      :date-format="hdr.input.dateFormat"
                      :multiple="hdr.input.multiple"
                      :lookup-labels="hdr.input.lookupLabels"
                      :lookup-searchs="
                        hdr.input.lookupSearchs &&
                        hdr.input.lookupSearchs.length == 0
                          ? hdr.input.lookupLabels
                          : hdr.input.lookupSearchs
                      "
                      @focus="rowFieldFocus"
                      @change="rowFieldChanged"
                      v-model="r[hdr.input.field]"
                      ref="inputs"
                    />
                  </div>
                  <div v-else>
                    <s-grid-column
                      :record="r"
                      :column-config="hdr"
                      :label-method="labelMethod"
                    />
                  </div>
                </slot>
              </td>

              <!-- sebelumnya ada class row_action -->
              <td class="whitespace-nowrap px-2 py-1 align-middle items-center flex gap-[2px]" v-if="!hideAction">
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
          </tbody>

          <!-- total -->
          <tbody
            name="grid_body_total"
            :class="{ 'text-[0.9em] editor': editor }"
            v-if="totalUrl !== ''"
          >
            <slot name="grid_total" :item="data.total"></slot>
          </tbody>
        </table>

        <div v-if="!props.hideFooter" class="footer">
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
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import util from "../scripts/util";
import { useRoute } from "vue-router";
import { onUnmounted } from "vue";

const route = useRoute();

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
  sortField: { type: String, default: "" },
  sortDirection: { type: String, default: "" },
  autoCommitLine: { type: Boolean, default: false },
  labelMethod: { type: String, default: "database" },
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
  disableDblClick: { type: Boolean, default: false },
});

const axios = inject("axios");

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
    props.modelValue.map(el => {
      el.suimRecordChange = false;
      el.suimRowMode = "edit";
      return el;
    }),
  recordCount: props.modelValue == undefined ? 0 : props.modelValue.length,
  currentPage: 1,
  sortField:
    props.sortField == undefined || props.sortField == ""
      ? "_id"
      : props.sortField,
  sortDirection: ["asc", "desc"].includes(props.sortDirection)
    ? props.sortDirection
    : "desc",
  pageSize: props.pageSize,
  deleteFn: undefined,
  loading: false,
  currentIndex: -1,
  recordChanged: false,
  showDeleteModal: false,
  total: [],
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

function resetCustomFilter(){
  emit("resetCustomFilter")
}

function rowFieldFocus(name, v1, v2, ctlRef) {
  const prevIndex = data.currentIndex;
  const currentRowIndex = ctlRef.rowIndex;

  if (prevIndex == currentRowIndex) {
    return;
  }

  data.currentIndex = currentRowIndex;
  data.recordChanged = false;
}

function saveRowData(r, rowIndex) {
  if (
    props.updateUrl == undefined ||
    props.updateUrl == "" ||
    props.updateUrl == null
  ) {
    emit("saveRowData", r, rowIndex);
    return;
  }

  axios.post(props.updateUrl, r).then(
    (r) => {
      r = r.data;
      r.suimRecordChange = false;
      r.suimRowMode = "edit";
      data.items[rowIndex] = r;
      emit("rowUpdated", r);
      updateRecordChanged();
    },
    (e) => util.showError(e)
  );
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
          Op: '$contains',
          Value: [f.inlineSearchValue],
        }));
      if (inlineFilters.length > 0) {
        filters.push({ Op: '$and', Items: inlineFilters });
      }
    } else if (keywordFields.length > 0 && data.keyword && data.keyword != "") {
      filters.push({
        Op: "$or",
        Items: keywordFields.map((k) => {
          return {
            Field: k,
            Op: "$contains",
            Value: [data.keyword],
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

function selectData(data, index, dblclick) {
  if (dblclick && props.disableDblClick) return;
  if (dblclick && props.editor) return;
  data.currentIndex = index;
  emit("selectData", data, index);
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
  data.items[recordIndex] = record;
  updateRecordChanged();
}

function setRecordByID(record) {
  data.items.forEach((dt, index) => {
    if (dt._id == record._id) {
      data.items[index] = record;   
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
  data.items = newDataSet;
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
  document.addEventListener('keydown', handleKeyDown);
  //refreshData();
  //console.log(`mounting grid ${props.config.title}`);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  //console.log(`unmounting grid ${props.config.title}`);
});

const editActions =ref([]);
const currentFocusIndex = ref(-1);

function handleKeyDown(event) {
  if (event.altKey && event.key === "r") {
    event.preventDefault();
    refreshData();
  } else if (event.altKey && event.key === "n") {
    event.preventDefault();
    newData();
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

watch(
  () => props.modelValue,
  (nv) => {
    if (nv == undefined) data.items = [];
    data.items = nv;
  }
);

watch(
  () => route.query,
  () => {
    data.keyword = "";
  }
);
</script>
<style scoped>
/* ...existing code... */

/* Responsive grid table */
.suim_area_table {
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