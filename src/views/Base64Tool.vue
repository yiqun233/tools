<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>Base64编解码工具</h2>
      <p>文本和Base64之间的相互转换（完整支持中文及Unicode）</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="section-header">
          <h3>输入文本</h3>
          <div class="button-group">
            <button @click="encode" class="btn btn-primary">编码</button>
            <button @click="decode" class="btn btn-secondary">解码</button>
            <button @click="clearAll" class="btn btn-danger">清空</button>
          </div>
        </div>
        <textarea
          v-model="inputText"
          placeholder="请输入要编码或解码的文本..."
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
          placeholder="转换结果将显示在这里..."
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

// 使用 TextEncoder/TextDecoder 正确处理 Unicode（替代废弃的 escape/unescape）
const encode = () => {
  error.value = ''
  try {
    const bytes = new TextEncoder().encode(inputText.value)
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
    outputText.value = btoa(binary)
  } catch (e) {
    error.value = '编码失败: ' + e.message
  }
}

const decode = () => {
  error.value = ''
  try {
    const binary = atob(inputText.value.trim())
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    outputText.value = new TextDecoder().decode(bytes)
  } catch (e) {
    error.value = '解码失败: 请确保输入的是有效的Base64字符串'
  }
}

const clearAll = () => {
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
