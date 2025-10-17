<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>UUID生成器</h2>
      <p>快速生成UUID/GUID标识符</p>
    </div>

    <div class="tool-content">
      <div class="control-section">
        <div class="control-group">
          <label>生成数量:</label>
          <input
            type="number"
            v-model.number="count"
            min="1"
            max="100"
            class="number-input"
          />
        </div>

        <div class="control-group">
          <label>
            <input type="checkbox" v-model="uppercase" />
            大写字母
          </label>
        </div>

        <div class="control-group">
          <label>
            <input type="checkbox" v-model="withHyphens" />
            包含连字符
          </label>
        </div>

        <button @click="generateUuids" class="btn btn-primary btn-large">生成UUID</button>
      </div>

      <div class="output-section">
        <div class="section-header">
          <h3>生成结果 ({{ uuids.length }} 个)</h3>
          <div class="button-group">
            <button @click="copyAll" class="btn btn-success">复制全部</button>
            <button @click="clearAll" class="btn btn-danger">清空</button>
          </div>
        </div>

        <div class="uuid-list">
          <div
            v-for="(uuid, index) in uuids"
            :key="index"
            class="uuid-item"
          >
            <span class="uuid-text">{{ uuid }}</span>
            <button @click="copyOne(uuid)" class="btn-copy">复制</button>
          </div>

          <div v-if="uuids.length === 0" class="empty-state">
            点击"生成UUID"按钮开始生成
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(5)
const uppercase = ref(false)
const withHyphens = ref(true)
const uuids = ref([])

const generateUuid = () => {
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })

  if (!withHyphens.value) {
    uuid = uuid.replace(/-/g, '')
  }

  if (uppercase.value) {
    uuid = uuid.toUpperCase()
  }

  return uuid
}

const generateUuids = () => {
  const num = Math.min(Math.max(1, count.value), 100)
  uuids.value = Array.from({ length: num }, () => generateUuid())
}

const copyOne = async (uuid) => {
  try {
    await navigator.clipboard.writeText(uuid)
    alert('已复制到剪贴板')
  } catch (e) {
    alert('复制失败')
  }
}

const copyAll = async () => {
  if (uuids.value.length > 0) {
    try {
      await navigator.clipboard.writeText(uuids.value.join('\n'))
      alert('已复制全部到剪贴板')
    } catch (e) {
      alert('复制失败')
    }
  }
}

const clearAll = () => {
  uuids.value = []
}
</script>

<style scoped>
.tool-container {
  max-width: 1000px;
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
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.control-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  color: #333;
}

.number-input {
  width: 80px;
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.number-input:focus {
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

.btn-large {
  padding: 0.75rem 2rem;
  font-size: 16px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover {
  background: #38a169;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
}

.output-section {
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

.uuid-list {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

.uuid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  transition: background 0.3s;
}

.uuid-item:hover {
  background: #e9ecef;
}

.uuid-text {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: #333;
  flex: 1;
}

.btn-copy {
  padding: 0.4rem 0.8rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.btn-copy:hover {
  background: #3182ce;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 3rem;
  font-size: 16px;
}

@media (max-width: 768px) {
  .control-section {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    justify-content: space-between;
  }
}
</style>
