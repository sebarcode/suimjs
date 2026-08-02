<template>
  <div>
    <h2>Contoh Penggunaan DataList gridFixColumn</h2>

    <p class="mb-4 text-slate-500">
      Prop <code>grid-fix-column</code> pada DataList diteruskan ke prop
      <code>fixColumn</code> pada SGrid. Nilai default <code>0</code> berarti tidak ada kolom
      yang dikunci.
    </p>

    <div class="mb-4 flex items-center gap-2">
      <label for="gridFixColumnSelect" class="font-semibold">gridFixColumn:</label>
      <select
        id="gridFixColumnSelect"
        v-model.number="gridFixColumn"
        class="border border-slate-300 rounded px-2 py-1"
      >
        <option :value="0">0</option>
        <option :value="1">1</option>
        <option :value="2">2</option>
        <option :value="3">3</option>
      </select>
    </div>

    <!--
      Catatan: DataList memuat config grid dari backend melalui loadGridConfig (axios.post url),
      jadi isi gridConfig/gridRead dengan URL backend Anda agar tabel tampil.
    -->
    <data-list
      :grid-config="gridConfig"
      :grid-read="gridRead"
      :grid-mode="'grid'"
      :grid-fix-column="gridFixColumn"
    />
  </div>
</template>

<script setup>
import DataList from '../components/DataList.vue';
import { ref } from 'vue';

const gridFixColumn = ref(2);

// Ganti dengan URL config grid yang dikembalikan backend, contoh: '/api/grid/config/example'
const gridConfig = '';
// Ganti dengan URL read grid, contoh: '/api/example/grid/read'
const gridRead = '';
</script>
