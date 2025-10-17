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
          <button @click="copyOutput" class="btn btn-success">复制</button>
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

const inputText = ref('')
const outputText = ref('')
const error = ref('')

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
  if (outputText.value) {
    try {
      await navigator.clipboard.writeText(outputText.value)
      alert('已复制到剪贴板')
    } catch (e) {
      alert('复制失败')
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h2 {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: #666;
}

.tool-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.input-section, .output-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.2rem;
  color: #333;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.textarea {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.3s;
}

.textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #48bb78;
  color: white;
}

.btn-secondary:hover {
  background: #38a169;
}

.btn-success {
  background: #4299e1;
  color: white;
}

.btn-success:hover {
  background: #3182ce;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
}

.error-message {
  grid-column: 1 / -1;
  background: #fff5f5;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .tool-content {
    grid-template-columns: 1fr;
  }
}
</style>
