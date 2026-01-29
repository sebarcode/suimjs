<template>
    <input
      type="text"
      :value="fmtValue"
      @input="storeValue($event)"
      @focus="startEdit($event)"
      @blur="finishEdit"
      class="text-right input_field"
      :disabled="disabled"
    />
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  formatCode: {
    type: String,
    default: "en-US"
  },
  decimal: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: Infinity
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue']);

const fmtValue = ref("");
const editing = ref(false);

function createRawStringFromNumber(n) {
  const num = Number(n || 0);
  if (props.decimal === 0) {
    return String(Math.trunc(num));
  }
  const fixed = num.toFixed(props.decimal);
  const sep = detectSeparators();
  if (sep.decimal !== '.') {
    return fixed.replace('.', sep.decimal);
  }
  return fixed;
}

function localeFromFormat(code) {
  if (!code) return undefined;
  if (code === 'id') return 'id-ID';
  if (code === 'us') return 'en-US';
  return code;
}

function createNumberFormatter() {
  const locale = localeFromFormat(props.formatCode);
  return new Intl.NumberFormat(locale, { minimumFractionDigits: props.decimal, maximumFractionDigits: props.decimal });
}

function detectSeparators() {
  const locale = localeFromFormat(props.formatCode);
  const nf = new Intl.NumberFormat(locale, { minimumFractionDigits: props.decimal, maximumFractionDigits: props.decimal });
  const parts = nf.formatToParts(1234567.89);
  const group = parts.find(p => p.type === 'group')?.value || ',';
  const decimal = parts.find(p => p.type === 'decimal')?.value || '.';
  return { group, decimal };
}

function formatNumber(n) {
  const nf = createNumberFormatter();
  return nf.format(n);
}

function manualGroupDigits(s, groupChar) {
  const neg = s.startsWith('-');
  const digits = neg ? s.slice(1) : s;
  let out = '';
  for (let i = digits.length - 1, cnt = 0; i >= 0; i--, cnt++) {
    out = digits[i] + out;
    if (cnt % 3 === 2 && i !== 0) out = groupChar + out;
  }
  return (neg ? '-' : '') + out;
}

function parseNumber(str) {
  if (str === null || str === undefined) return 0;
  const s = String(str).trim();
  if (s.length === 0) return 0;
  const sep = detectSeparators();
  // remove group separators
  function escapeRegex(x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  const groupEsc = escapeRegex(sep.group);
  const decEsc = escapeRegex(sep.decimal);
  let cleaned = s.replace(new RegExp(groupEsc, 'g'), '');
  if (decEsc !== '.') {
    cleaned = cleaned.replace(new RegExp(decEsc, 'g'), '.');
  }
  // allow only digits, dot and minus (keep potential trailing dot)
  cleaned = cleaned.replace(/[^0-9.\-]/g, '');
  // collapse multiple dots to a single dot (keep first occurrence)
  if ((cleaned.match(/\./g) || []).length > 1) {
    const parts = cleaned.split('.');
    const intPart = parts.shift();
    cleaned = intPart + '.' + parts.join('');
  }
  // if there's a decimal point, enforce max fractional digits
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex >= 0) {
    const intPart = cleaned.slice(0, dotIndex) || '0';
    let frac = cleaned.slice(dotIndex + 1);
    if (props.decimal === 0) {
      cleaned = intPart;
    } else {
      if (frac.length > props.decimal) {
        frac = frac.slice(0, props.decimal);
      }
      cleaned = intPart + '.' + frac;
    }
  }
  // remove lone minus or lone dot
  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') return 0;
  const val = Number(cleaned);
  return isNaN(val) ? 0 : val;
}

watch(() => props.modelValue, (newVal) => {
  if (!editing.value) {
    fmtValue.value = formatNumber(Number(newVal || 0));
  }
}, { immediate: true });

watch(() => [props.formatCode, props.decimal], () => {
  if (!editing.value) {
    fmtValue.value = formatNumber(Number(props.modelValue || 0));
  }
});

function storeValue(event) {
  // format on each keystroke while preserving caret
  const el = event.target;
  const raw = el.value;
  const sel = el.selectionStart || 0;
  if (props.disabled) {
    // keep display synced but ignore user input when disabled
    fmtValue.value = formatNumber(Number(props.modelValue || 0));
    return;
  }
  editing.value = true;

  const sep = detectSeparators();
  // clean input and split parts
  function cleanInput(s) {
    const groupEsc = sep.group.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const decEsc = sep.decimal.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    let t = String(s).replace(new RegExp(groupEsc, 'g'), '');
    if (decEsc !== '.') t = t.replace(new RegExp(decEsc, 'g'), '.');
    t = t.replace(/[^0-9.\-]/g, '');
    // collapse multiple dots
    if ((t.match(/\./g) || []).length > 1) {
      const parts = t.split('.');
      const ip = parts.shift();
      t = ip + '.' + parts.join('');
    }
    // if decimals not allowed, strip decimal points entirely
    if (props.decimal === 0) {
      t = t.replace(/\./g, '');
    }
    return t;
  }

  const cleaned = cleanInput(raw);
  const hadDecimal = (props.decimal > 0) && (cleaned.indexOf('.') >= 0);
  const [intPartRaw, fracRaw = ''] = cleaned.split('.');
  const neg = intPartRaw.startsWith('-');
  let intDigitsOnly = (neg ? intPartRaw.slice(1) : intPartRaw) || '0';
  // trim leading zeros but leave single zero
  intDigitsOnly = intDigitsOnly.replace(/^0+(?=\d)/, '');
  // limit fractional input length
  const fracPart = props.decimal > 0 ? fracRaw.slice(0, props.decimal) : '';

  // build numeric value (truncate, do not round)
  const multiplier = Math.pow(10, props.decimal);
  let numeric = Number((neg ? '-' : '') + intDigitsOnly + (fracPart ? '.' + fracPart : ''));
  if (isNaN(numeric)) numeric = 0;
  if (props.decimal > 0) {
    numeric = Math.trunc(numeric * multiplier) / multiplier;
  }
  if (numeric < props.min) numeric = props.min;
  if (numeric > props.max) numeric = props.max;

  // while editing, display should be plain digits (no grouping) + decimal part
  let display = (numeric < 0 ? '-' : '') + String(intDigitsOnly);
  if (props.decimal > 0 && (hadDecimal || fracPart.length > 0)) {
    display += sep.decimal + fracPart;
  }

  // compute caret position: handle fractional editing and immediate decimal insertion
  const before = raw.slice(0, sel);
  const cleanedBefore = cleanInput(before);
  // since display has no grouping while editing, caret maps directly to cleanedBefore length
  const newPos = cleanedBefore.length;
  fmtValue.value = display;
  // ensure DOM input shows sanitized value immediately
  try { el.value = display; } catch (e) {}
  requestAnimationFrame(() => {
    try {
      el.setSelectionRange(newPos, newPos);
    } catch (e) {}
  });

  // emit numeric value
  emit('update:modelValue', numeric);
}

function startEdit(event) {
  if (props.disabled) return;
  editing.value = true;
  // build formatted display but trim leading zeros from integer part
  const sep = detectSeparators();
  const groupChar = sep.group || ',';
  const num = Number(props.modelValue || 0);
  const absInt = String(Math.trunc(Math.abs(num)) || 0);
  const formattedInt = manualGroupDigits((num < 0 ? '-' : '') + absInt, groupChar);
  let display = formattedInt;
  if (props.decimal > 0) {
    // get fractional part padded
    const multiplier = Math.pow(10, props.decimal);
    const fracNum = Math.trunc(Math.abs(num) * multiplier) % multiplier;
    const fracPart = String(fracNum).padStart(props.decimal, '0');
    if (props.decimal > 0) {
      display += sep.decimal + fracPart;
    }
  }
  fmtValue.value = display;
  // move caret to end of the displayed value
  requestAnimationFrame(() => {
    try {
      const el = event && event.target;
      if (el && typeof el.setSelectionRange === 'function') {
        const len = String(fmtValue.value).length;
        el.setSelectionRange(len, len);
      }
    } catch (e) {}
  });
}

function finishEdit() {
  editing.value = false;
  fmtValue.value = formatNumber(Number(props.modelValue || 0));
}

</script>