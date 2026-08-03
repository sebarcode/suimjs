<template>
  <div>
    <h2>Contoh Penggunaan SGrid FixColumn (Kolom Terkunci di Kiri)</h2>

    <div class="mb-4 flex items-center gap-2">
      <label for="fixColumnSelect" class="font-semibold">fixColumn:</label>
      <select
        id="fixColumnSelect"
        v-model.number="fixColumn"
        class="border border-slate-300 rounded px-2 py-1"
      >
        <option :value="0">0 (tidak ada kolom fix / default)</option>
        <option :value="1">1</option>
        <option :value="2">2</option>
        <option :value="3">3</option>
      </select>
      <span class="text-sm text-slate-500">
        Saat fixColumn &gt; 0, grid scrollable secara horizontal dan N kolom pertama di sisi kiri
        (termasuk kolom checkbox select) terkunci. Kolom Action di sisi kanan juga otomatis
        sticky sehingga tetap terlihat saat scroll.
      </span>
    </div>

    <s-grid
      :config="gridConfig"
      :model-value="items"
      :read-url="''"
      :update-url="''"
      :delete-url="''"
      :fix-column="fixColumn"
      @getData="onGetData"
      @rowUpdated="onRowUpdated"
      @rowDeleted="onRowDeleted"
    />
  </div>
</template>

<script setup>
import SGrid from '../components/SGrid.vue';
import { ref } from 'vue';

const fixColumn = ref(2);

const items = ref(
  Array.from({ length: 15 }, (_, i) => ({
    _id: i + 1,
    code: 'SKU-' + (1000 + i),
    name: 'Produk ' + (i + 1),
    qty: Math.floor(Math.random() * 100),
    price: Math.floor(Math.random() * 1000000),
    category: ['Elektronik', 'Fashion', 'Makanan', 'Alat Tulis'][i % 4],
    supplier: 'Supplier ' + ((i % 5) + 1),
    warehouse: 'Gudang ' + ((i % 3) + 1),
    expireDate: '2026-12-' + String((i % 28) + 1).padStart(2, '0'),
    notes: 'Catatan item ke-' + (i + 1),
  }))
);

const gridConfig = {
  title: 'Contoh Grid FixColumn',
  fields: [
    { field: 'code', label: 'Kode', readType: 'show', width: '120px', input: { field: 'code', kind: 'text' } },
    { field: 'name', label: 'Nama Produk', readType: 'show', width: '200px', input: { field: 'name', kind: 'text' } },
    { field: 'qty', label: 'Qty', readType: 'show', width: '100px', kind: 'number', input: { field: 'qty', kind: 'number' } },
    { field: 'price', label: 'Harga', readType: 'show', width: '150px', kind: 'number', input: { field: 'price', kind: 'number' } },
    { field: 'category', label: 'Kategori', readType: 'show', width: '140px', input: { field: 'category', kind: 'text' } },
    { field: 'supplier', label: 'Supplier', readType: 'show', width: '160px', input: { field: 'supplier', kind: 'text' } },
    { field: 'warehouse', label: 'Gudang', readType: 'show', width: '130px', input: { field: 'warehouse', kind: 'text' } },
    { field: 'expireDate', label: 'Tanggal Kadaluarsa', readType: 'show', width: '170px', kind: 'date', input: { field: 'expireDate', kind: 'date' } },
    { field: 'notes', label: 'Catatan', readType: 'show', width: '220px', input: { field: 'notes', kind: 'text' } },
  ],
  setting: {
    sortable: ['code', 'name', 'qty', 'price'],
    keywordFields: ['name', 'code'],
  },
};

function onGetData() {}
function onRowUpdated() {}
function onRowDeleted() {}
</script>
