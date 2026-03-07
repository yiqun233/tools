<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>JSON格式化工具</h2>
      <p>格式化、压缩和验证JSON数据</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="section-header">
          <h3>输入JSON</h3>
          <div class="button-group">
            <button @click="formatJson" class="btn btn-primary">格式化</button>
            <button @click="compressJson" class="btn btn-secondary">压缩</button>
            <button @click="clearInput" class="btn btn-danger">清空</button>
          </div>
        </div>
        <textarea
          v-model="inputText"
          placeholder="请输入JSON数据..."
          class="textarea"
        ></textarea>
      </div>

      <div class="output-section">
        <div class="section-header">
          <h3>输出结果</h3>
          <button @click="copyOutput" class="btn btn-success">
            {{ copyLabel }}
          </button>
        </div>
        <textarea
          v-model="outputText"
          readonly
          placeholder="格式化后的结果将显示在这里..."
          class="textarea"
        ></textarea>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../composables/useToast'

const { success, error: toastError } = useToast()

const inputText = ref('')
const outputText = ref('')
const error = ref('')
const copyLabel = ref('复制')

const formatJson = () => {
  error.value = ''
  try {
    const parsed = JSON.parse(inputText.value)
    outputText.value = JSON.stringify(parsed, null, 2)
  } catch (e) {
    error.value = '无效的JSON格式: ' + e.message
  }
}

const compressJson = () => {
  error.value = ''
  try {
    const parsed = JSON.parse(inputText.value)
    outputText.value = JSON.stringify(parsed)
  } catch (e) {
    error.value = '无效的JSON格式: ' + e.message
  }
}

const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  error.value = ''
}

const copyOutput = async () => {
  if (!outputText.value) return
  try {
    await navigator.clipboard.writeText(outputText.value)
    success('已复制到剪贴板')
    copyLabel.value = '✓ 已复制'
    setTimeout(() => copyLabel.value = '复制', 2000)
  } catch (e) {
    toastError('复制失败，请手动选中文本复制')
  }
}
</script>

<style scoped>
.tool-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.input-section, .output-section {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .tool-content {
    grid-template-columns: 1fr;
  }
}
</style>
