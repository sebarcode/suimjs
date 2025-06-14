<template>
  <div>
    <h2>Contoh Penggunaan DataList</h2>
    <data-list :items="items" :fields="fields" />
  </div>
</template>

<script setup>
import DataList from '../components/DataList.vue';
import { ref } from 'vue';

const items = ref([
  { name: 'Item 1', qty: 10 },
  { name: 'Item 2', qty: 5 },
]);

const fields = [
  { field: 'name', label: 'Nama' },
  { field: 'qty', label: 'Qty' },
];
</script>
