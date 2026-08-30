<template>
  <div ref="root" class="s-date-time">
    <div class="s-date-time__control" :class="{ 's-date-time__control--invalid': invalidTypedValue }">
      <input
        ref="input"
        type="text"
        class="input_field"
        :class="{ 's-date-time__input--invalid': invalidTypedValue }"
        :value="displayValue"
        :placeholder="placeholder || formatValue"
        :disabled="disabled"
        :aria-invalid="invalidTypedValue"
        :title="invalidTypedValue ? `Invalid date. Use format ${formatValue}` : ''"
        autocomplete="off"
        @input="onInput"
        @focus="emit('focus')"
        @keydown.enter.prevent="commitTypedValue"
        @blur="commitTypedValue"
      />
      <button
        type="button"
        class="s-date-time__toggle"
        :disabled="disabled"
        aria-label="Pilih tanggal"
        @mousedown.prevent
        @click="togglePicker"
      >
        <mdicon name="calendar-month" size="18" />
      </button>
    </div>

    <Teleport to="body">
    <div v-if="open" ref="picker" class="s-date-time__picker" :style="pickerStyle" @mousedown.stop>
      <div class="s-date-time__header">
        <button type="button" class="s-date-time__nav" aria-label="Bulan sebelumnya" @click="changeMonth(-1)">
          <mdicon name="chevron-left" size="18" />
        </button>
        <select v-model.number="pickerMonth" class="s-date-time__month" aria-label="Bulan">
          <option v-for="(month, index) in monthNames" :key="month" :value="index">{{ month }}</option>
        </select>
        <input v-model.number="pickerYear" class="s-date-time__year" type="number" min="1" max="9999" aria-label="Tahun" />
        <button type="button" class="s-date-time__nav" aria-label="Bulan berikutnya" @click="changeMonth(1)">
          <mdicon name="chevron-right" size="18" />
        </button>
      </div>

      <div class="s-date-time__weekdays">
        <div v-for="day in weekdays" :key="day">{{ day }}</div>
      </div>
      <div class="s-date-time__days" @mouseleave="hoveredWeek = null">
        <button
          v-for="day in calendarDays"
          :key="day.key"
          type="button"
          class="s-date-time__day"
          :class="{ 's-date-time__day--outside': !day.inCurrentMonth, 's-date-time__day--selected': day.selected, 's-date-time__day--week-hover': day.weekHovered, 's-date-time__day--today': day.today }"
          @mouseenter="hoverDate(day.date)"
          @click="selectDate(day.date)"
        >{{ day.date.date() }}</button>
      </div>

      <div v-if="mode === 'datetime'" class="s-date-time__time">
        <label for="s-date-time-time">Waktu</label>
        <input id="s-date-time-time" v-model="pickerTime" type="time" step="1" />
      </div>

      <div class="s-date-time__actions">
        <button type="button" @click="setToday">Today</button>
        <button type="button" @click="clear">Clear</button>
        <button v-if="mode === 'datetime'" type="button" class="s-date-time__apply" @click="applyDateTime">Terapkan</button>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import moment from 'moment';

const props = defineProps({
  modelValue: { type: [String, Date, Number, Object], default: null },
  mode: { type: String, default: 'date', validator: value => ['date', 'datetime', 'week'].includes(value) },
  format: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'focus', 'change']);
const root = ref(null);
const input = ref(null);
const picker = ref(null);
const open = ref(false);
const pickerPosition = ref({ left: 0, top: 0 });
const typedValue = ref('');
const hasTypedValue = ref(false);
const invalidTypedValue = ref(false);
const pickerMonth = ref(moment().month());
const pickerYear = ref(moment().year());
const pickerTime = ref('00:00:00');
const selectedDate = ref(null);
const hoveredWeek = ref(null);

const formatValue = computed(() => {
  const format = normalizeFormat(props.format || (props.mode === 'datetime' ? 'DD-MMM-YY HH:mm:ss' : 'DD-MMM-YY'));
  return props.mode === 'date' || props.mode === 'week' ? dateOnlyFormat(format) : format;
});
const monthNames = moment.months();
const weekdays = moment.weekdaysMin(true);

const displayValue = computed(() => typedValue.value !== '' ? typedValue.value : formatModelValue(props.modelValue));
const pickerStyle = computed(() => ({ left: `${pickerPosition.value.left}px`, top: `${pickerPosition.value.top}px` }));
const calendarDays = computed(() => {
  const monthStart = moment({ year: pickerYear.value, month: pickerMonth.value, day: 1 });
  const start = monthStart.clone().startOf('week');
  const selected = selectedDate.value;
  const today = moment();

  return Array.from({ length: 42 }, (_, index) => {
    const date = start.clone().add(index, 'days');
    return {
      date,
      key: date.format('YYYY-MM-DD'),
      inCurrentMonth: date.month() === pickerMonth.value,
      selected: !!selected && (props.mode === 'week' ? date.isSame(selected, 'week') : date.isSame(selected, 'day')),
      weekHovered: props.mode === 'week' && !!hoveredWeek.value && date.isSame(hoveredWeek.value, 'week'),
      today: date.isSame(today, 'day'),
    };
  });
});

function isUsableDate(value) {
  if (!value) return false;
  const parsed = moment(value);
  return parsed.isValid() && parsed.year() > 1;
}

function dateOnlyFormat(format) {
  return String(format || 'DD-MMM-YY').split(/[ T]/, 1)[0] || 'DD-MMM-YY';
}

function normalizeFormat(format) {
  return String(format)
    .replace(/yyyy/g, 'YYYY')
    .replace(/yy/g, 'YY')
    .replace(/dd/g, 'DD');
}

function modelDate(value = props.modelValue) {
  return isUsableDate(value) ? moment(value).local() : null;
}

function formatModelValue(value) {
  const date = modelDate(value);
  return date ? date.format(formatValue.value) : '';
}

function syncPicker(value = props.modelValue) {
  const date = modelDate(value) || moment();
  selectedDate.value = date.clone();
  hoveredWeek.value = null;
  pickerMonth.value = date.month();
  pickerYear.value = date.year();
  pickerTime.value = date.format('HH:mm:ss');
}

function parseTypedValue(value) {
  const formats = acceptedInputFormats();
  const parsed = moment(value, formats, true);
  return parsed.isValid() && parsed.year() > 1 ? parsed : null;
}

function acceptedInputFormats() {
  const format = formatValue.value;
  const separatorFormats = [' ', '-', '/'].map(separator => format.replace(/[-/.]/g, separator));
  return [...new Set([format, ...separatorFormats, 'YYYY-MM-DD', moment.ISO_8601])];
}

function emitValue(date) {
  if (!date) {
    emit('update:modelValue', null);
    emit('change', null);
    return;
  }

  const result = props.mode === 'date' || props.mode === 'week'
    ? moment(date.format('YYYY-MM-DD'), 'YYYY-MM-DD').utc().format()
    : date.clone().utc().format();
  emit('update:modelValue', result);
  emit('change', result);
}

function onInput(event) {
  typedValue.value = event.target.value;
  hasTypedValue.value = true;
  invalidTypedValue.value = typedValue.value !== '' && !parseTypedValue(typedValue.value);
}

function commitTypedValue() {
  if (!hasTypedValue.value) return;

  if (typedValue.value === '') {
    emitValue(null);
    hasTypedValue.value = false;
    invalidTypedValue.value = false;
    return;
  }
  const date = parseTypedValue(typedValue.value);
  if (!date) {
    invalidTypedValue.value = true;
    return;
  }
  typedValue.value = '';
  hasTypedValue.value = false;
  invalidTypedValue.value = false;
  syncPicker(date);
  emitValue(date);
}

async function togglePicker() {
  open.value = !open.value;
  if (open.value) {
    typedValue.value = '';
    hasTypedValue.value = false;
    invalidTypedValue.value = false;
    syncPicker();
    await nextTick();
    updatePickerPosition();
  }
}

function updatePickerPosition() {
  if (!open.value || !input.value) return;

  const rect = input.value.getBoundingClientRect();
  const pickerWidth = picker.value?.offsetWidth || 304;
  pickerPosition.value = {
    left: Math.max(8, Math.min(rect.left, window.innerWidth - pickerWidth - 8)),
    top: rect.bottom + 4,
  };
}

function changeMonth(amount) {
  const date = moment({ year: pickerYear.value, month: pickerMonth.value, day: 1 }).add(amount, 'month');
  pickerMonth.value = date.month();
  pickerYear.value = date.year();
}

function selectDate(date) {
  const selected = props.mode === 'week' ? date.clone().startOf('week') : date.clone();
  if (props.mode === 'datetime') {
    const [hour, minute, second] = pickerTime.value.split(':').map(Number);
    selected.hour(hour || 0).minute(minute || 0).second(second || 0);
    selectedDate.value = selected;
    return;
  }

  selectedDate.value = selected;
  invalidTypedValue.value = false;
  open.value = false;
  emitValue(selected);
}

function hoverDate(date) {
  if (props.mode === 'week') hoveredWeek.value = date.clone();
}

function applyDateTime() {
  const selected = (selectedDate.value || moment({ year: pickerYear.value, month: pickerMonth.value, day: 1 })).clone();
  const [hour, minute, second] = pickerTime.value.split(':').map(Number);
  selected.hour(hour || 0).minute(minute || 0).second(second || 0);
  selectedDate.value = selected;
  invalidTypedValue.value = false;
  open.value = false;
  emitValue(selected);
}

function setToday() {
  const date = props.mode === 'week' ? moment().startOf('week') : moment();
  selectedDate.value = date;
  pickerMonth.value = date.month();
  pickerYear.value = date.year();
  pickerTime.value = date.format('HH:mm:ss');
  if (props.mode === 'date') {
    emitValue(date);
    open.value = false;
  }
}

function clear() {
  typedValue.value = '';
  hasTypedValue.value = false;
  invalidTypedValue.value = false;
  open.value = false;
  emitValue(null);
}

function onDocumentMouseDown(event) {
  if (root.value && !root.value.contains(event.target)) {
    commitTypedValue();
    open.value = false;
  }
}

function focus() {
  input.value?.focus();
}

watch(() => props.modelValue, () => {
  if (typedValue.value === '') syncPicker();
}, { immediate: true });

watch([pickerMonth, pickerYear], () => {
  pickerMonth.value = Math.max(0, Math.min(11, Number(pickerMonth.value) || 0));
  pickerYear.value = Math.max(1, Math.min(9999, Number(pickerYear.value) || moment().year()));
});

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMouseDown);
  window.addEventListener('resize', updatePickerPosition);
  window.addEventListener('scroll', updatePickerPosition, true);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown);
  window.removeEventListener('resize', updatePickerPosition);
  window.removeEventListener('scroll', updatePickerPosition, true);
});

defineExpose({ focus });
</script>

<style scoped>
.s-date-time { position: relative; width: 100%; }
.s-date-time__control { display: flex; position: relative; }
.s-date-time__control--invalid { background: #fee2e2 !important; border: 2px solid #dc2626 !important; border-radius: .25rem; box-shadow: 0 0 0 2px rgba(220, 38, 38, .38) !important; }
.s-date-time__control--invalid input { background: transparent !important; border-color: transparent !important; }
.s-date-time__control input { padding-right: 2.2rem; width: 100%; }
.s-date-time__control .s-date-time__input--invalid { color: #991b1b; font-weight: 600; }
.s-date-time__toggle { background: transparent; border: 0; cursor: pointer; position: absolute; right: .25rem; top: 50%; transform: translateY(-50%); color: inherit; }
.s-date-time__toggle:disabled { cursor: default; opacity: .45; }
.s-date-time__picker { background: white; border: 1px solid #d1d5db; border-radius: .25rem; box-shadow: 0 8px 18px rgba(0,0,0,.16); box-sizing: border-box; color: #1f2937; min-width: 19rem; padding: .5rem; position: fixed; z-index: 1000; }
.s-date-time__header { align-items: center; display: flex; gap: .25rem; margin-bottom: .5rem; }
.s-date-time__nav { background: transparent; border: 0; border-radius: .2rem; cursor: pointer; display: flex; padding: .2rem; }
.s-date-time__nav:hover, .s-date-time__actions button:hover { background: #e5e7eb; }
.s-date-time__month { flex: 1; min-width: 0; }
.s-date-time__year { width: 4.6rem; }
.s-date-time__weekdays, .s-date-time__days { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; }
.s-date-time__weekdays { color: #6b7280; font-size: .75rem; margin-bottom: .2rem; }
.s-date-time__day { background: transparent; border: 0; border-radius: .2rem; cursor: pointer; height: 2rem; margin: 1px; }
.s-date-time__day:hover { background: #e5e7eb; }
.s-date-time__day--week-hover { background: color-mix(in srgb, var(--primary-color, #0f766e) 18%, white); }
.s-date-time__day--outside { color: #9ca3af; }
.s-date-time__day--today { box-shadow: inset 0 0 0 1px #0f766e; }
.s-date-time__day--selected { background: var(--primary-color, #0f766e); color: white; }
.s-date-time__time { align-items: center; border-top: 1px solid #e5e7eb; display: flex; gap: .5rem; margin-top: .5rem; padding-top: .5rem; }
.s-date-time__time input { flex: 1; }
.s-date-time__actions { border-top: 1px solid #e5e7eb; display: flex; gap: .25rem; justify-content: flex-end; margin-top: .5rem; padding-top: .5rem; }
.s-date-time__actions button { background: transparent; border: 0; border-radius: .2rem; cursor: pointer; padding: .25rem .45rem; }
.s-date-time__actions .s-date-time__apply { background: var(--primary-color, #0f766e); color: white; }
</style>
