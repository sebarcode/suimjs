<template>
  <div>
    <h2>Contoh Penggunaan SGrid</h2>
    <s-grid
      :config="gridConfig"
      :model-value="items"
      :read-url="''"
      :update-url="''"
      :delete-url="''"
      :editor="true"
      @getData="onGetData"
      @rowUpdated="onRowUpdated"
      @rowDeleted="onRowDeleted"
    />
  </div>
</template>

<script setup>
import SGrid from '../components/SGrid.vue';
import { ref } from 'vue';

const items = ref([
  { _id: 1, name: 'Item 1', qty: 10 },
  { _id: 2, name: 'Item 2', qty: 5 },
]);

const gridConfig = {
  title: 'Contoh Grid',
  fields: [
    { field: 'name', label: 'Nama', readType: 'show', input: { field: 'name', kind: 'text' } },
    { field: 'qty', label: 'Qty', readType: 'show', input: { field: 'qty', kind: 'number' } },
  ],
  setting: {
    sortable: ['name', 'qty'],
    keywordFields: ['name']
  }
};

function onGetData() {}
function onRowUpdated() {}
function onRowDeleted() {}
</script>
