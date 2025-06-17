<template>
  <div id="pagingContainer" class="flex flex-wrap gap-4 suim_pagination justify-between mb-2">
    <div class="info_page">
       {{infoPage}}
    </div>
    <div class="flex justify-center pagging ">
        <div
            class="btn_pagination first_page mr-2" 
            :class="{
                'disable':isFirstPge
            }"
            @click="onChangePage(1)"
        >  
            First
        </div>
        <div class="flex btn_group">
        <button
            class="btn_pagination prev_page"
            :class="{
                'disable':isFirstPge
            }"
            @click="onChangePage(currentPage - 1)"
        >
            <mdicon name="chevron-left" size="18"></mdicon>
        </button>
        <button
            v-for="(item, index) in pages"
            :key="'page' + index"
            class="btn_pagination number border-y-[1px]     tooltip"
            :class="[
                item == '...' ? 'disable' : '',
                item == props.currentPage ? 'active' : '', 
            ]" 
            @click="onChangePage(item)"
        > 
            {{ item }}
        
        </button>
        <div
            class="btn_pagination next_page"
            :class="{
                'disable':isLastPage
            }"
            @click="onChangePage(currentPage + 1)"
        >
            <mdicon name="chevron-right" size="18"></mdicon>
        </div>
        </div>
        <div
            class="btn_pagination last_page ml-2"
            :class="{
                    'disable':isLastPage
                }"
            @click="onChangePage(pageCount)"
        > 
            Last
        </div>
    </div>
    <div class="pagesize">
        <s-input 
            field=""
            class="min-w-[80px] select-dropdown"
            :show-clear-button="false" 
            use-list 
            :items="data.itemsPageSize" 
            v-model="data.pageSize"
            @change="onChangePageSize" 
        />
    </div>
  </div>
</template>
<script setup>
import { computed, reactive} from "vue";
import SInput from "./SInput.vue";

const props = defineProps({
  recordCount: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 },
  currentPage: { type: Number, default: 0 },
  pageSize: { type: Number, default: 20 },
});

const emit = defineEmits({
  changePage: null,
  changePageSize:null,
}); 
const itemsPageSize = [5,10,15,20,25]
itemsPageSize.push(props.pageSize) 
 
const data = reactive({  
    itemsPageSize: [...new Set(itemsPageSize.map((item) => item))].sort((a, b) => a - b),
    pageSize: props.pageSize
}) 
function onChangePage(page) {
  if (isNaN(page)) return;
  if ([0, props.pageCount + 1].includes(parseInt(page))) return;
  emit("changePage", page);
}
function onChangePageSize(field, v1){
    emit('changePageSize',v1)
}
function createPagination() {
  let delta = 2;
  let left = props.currentPage - delta;
  let right = props.currentPage + delta + 1;
  let range = [];
  let rangeWithDots = [];
  let l;

  for (let i = 1; i <= props.pageCount; i++) {
    if (i == 1 || i == props.pageCount || (i >= left && i < right)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

const pages = computed({
  get() {
    return createPagination();
  },
});
const isFirstPge = computed({
  get() {
    return props.currentPage <= 1;
  },
});
const isLastPage = computed({
  get() {
    return props.currentPage >= props.pageCount;
  },
});
const infoPage = computed({
    get() {
        const start = (props.currentPage - 1) * props.pageSize + 1 ;
        const end =  isLastPage.value ? props.recordCount :  props.pageSize * props.currentPage
        return `${start} to ${end} of ${props.recordCount} entries`; 
    },
})
</script>
<style>
.suim_pagination .pagesize .select-dropdown ul.vs__dropdown-menu{
    min-width: 80px !important;
    max-width: 80px !important
}
/* Responsive styles for pagingContainer */
#pagingContainer {
    /* Allow wrapping on small screens */
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
}

/* Stack items vertically on small screens */
@media (max-width: 640px) {
    #pagingContainer {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }
    #pagingContainer .info_page,
    #pagingContainer .pagging,
    #pagingContainer .pagesize {
        width: 100%;
        justify-content: center;
        margin-bottom: 0.25rem;
    }
    #pagingContainer .pagging {
        justify-content: flex-start;
    }
    #pagingContainer .pagesize {
        justify-content: flex-end;
    }
}
</style>
<style scoped>
.suim_pagination{
    @apply text-xs;
}
.btn_pagination{
    @apply flex items-center justify-center px-2 py-1 border-[1px] border-gray-300 cursor-pointer ;
}
.btn_pagination:hover{
    @apply bg-slate-200;
}
.btn_pagination.disable{
    @apply pointer-events-none text-slate-400;
}
.btn_pagination.active{
    @apply font-bold bg-slate-200 pointer-events-none;
}
.btn_pagination.number{
    border-left: none !important;
}
.btn_pagination.number:last-of-type{
    border-right: none !important;
}
</style>