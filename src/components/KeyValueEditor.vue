<template>
  <div class="kv-editor">
    <div v-if="rows.some(r => r.key)" class="kv-header">
      <span class="col-check"></span>
      <span class="col-key">{{ labelKey }}</span>
      <span class="col-val">{{ labelValue }}</span>
      <span class="col-del"></span>
    </div>

    <div v-for="(row, index) in rows" :key="index" class="kv-row">
      <label class="col-check">
        <input type="checkbox" v-model="row.enabled" @change="emit('update:modelValue', rows)" />
      </label>
      <input
        v-model="row.key"
        :placeholder="placeholderKey"
        class="col-key kv-input"
        @input="onInput"
      />
      <input
        v-model="row.value"
        :placeholder="placeholderValue"
        class="col-val kv-input"
        @input="onInput"
      />
      <button class="col-del btn-remove" @click="removeRow(index)" title="删除">×</button>
    </div>

    <button class="btn-add-row" @click="addRow">+ 添加一行</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholderKey: { type: String, default: 'Key' },
  placeholderValue: { type: String, default: 'Value' },
  labelKey: { type: String, default: '键' },
  labelValue: { type: String, default: '值' },
})

const emit = defineEmits(['update:modelValue'])

const makeRow = () => ({ key: '', value: '', enabled: true })

const rows = ref(
  props.modelValue?.length
    ? props.modelValue.map(r => ({ enabled: true, ...r }))
    : [makeRow()]
)

watch(() => props.modelValue, (val) => {
  if (val && JSON.stringify(val) !== JSON.stringify(rows.value)) {
    rows.value = val.length ? val.map(r => ({ enabled: true, ...r })) : [makeRow()]
  }
}, { deep: true })

const onInput = () => emit('update:modelValue', rows.value)

const addRow = () => {
  rows.value.push(makeRow())
  emit('update:modelValue', rows.value)
}

const removeRow = (index) => {
  rows.value.splice(index, 1)
  if (rows.value.length === 0) rows.value.push(makeRow())
  emit('update:modelValue', rows.value)
}
</script>

<style scoped>
.kv-editor {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kv-header, .kv-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kv-header {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  padding: 0 4px 4px;
  border-bottom: 1px solid #f0f0f0;
}

.col-check { width: 20px; flex-shrink: 0; display: flex; align-items: center; }
.col-key   { flex: 1; }
.col-val   { flex: 2; }
.col-del   { width: 28px; flex-shrink: 0; }

.kv-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.kv-input:focus { outline: none; border-color: #667eea; }

.btn-remove {
  width: 26px;
  height: 26px;
  border: none;
  background: none;
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  line-height: 1;
}
.btn-remove:hover { background: #fff0f0; color: #f56565; }

.btn-add-row {
  align-self: flex-start;
  margin-top: 4px;
  padding: 0.35rem 0.85rem;
  border: 1.5px dashed #d0d0d0;
  background: transparent;
  color: #888;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.btn-add-row:hover { border-color: #667eea; color: #667eea; background: #f5f7ff; }

@media (max-width: 480px) {
  .kv-header { display: none; }
  .kv-row { flex-wrap: wrap; gap: 6px; padding-bottom: 8px; border-bottom: 1px solid #f5f5f5; }
  .col-check { order: -1; }
  .col-key, .col-val { flex: 1 1 calc(50% - 24px); min-width: 100px; }
  .col-del { order: -1; }
}
</style>
