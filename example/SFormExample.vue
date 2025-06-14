<template>
  <div>
    <h2>Contoh Penggunaan SForm</h2>
    <s-form
      :config="formConfig"
      v-model="formData"
      @submit="onSubmit"
    />
    <div class="mt-4">Data: {{ formData }}</div>
  </div>
</template>

<script setup>
import SForm from '../components/SForm.vue';
import { ref } from 'vue';

const formData = ref({ name: '', qty: 0 });

const formConfig = {
  title: 'Contoh Form',
  fields: [
    { field: 'name', label: 'Nama', kind: 'text', required: true },
    { field: 'qty', label: 'Qty', kind: 'number', required: true },
  ]
};

function onSubmit(data) {
  alert('Submit: ' + JSON.stringify(data));
}
</script>
