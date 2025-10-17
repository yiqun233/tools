<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>图片文字识别 (OCR)</h2>
      <p>上传图片，自动提取图片中的文字内容</p>
    </div>

    <div class="tool-content">
      <!-- 上传区域 -->
      <div class="upload-section">
        <div
          class="upload-area"
          :class="{ dragging: isDragging }"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />
          <div class="upload-icon">📷</div>
          <p class="upload-text">点击或拖拽图片到此处上传</p>
          <p class="upload-hint">支持 JPG、PNG、GIF、BMP 等格式，或按 Ctrl+V 粘贴图片</p>
        </div>

        <div class="options-bar">
          <div class="option-group">
            <label>识别语言:</label>
            <select v-model="selectedLanguage" class="language-select">
              <option value="chi_sim">简体中文</option>
              <option value="chi_tra">繁体中文</option>
              <option value="eng">英文</option>
              <option value="chi_sim+eng">中英混合</option>
              <option value="jpn">日文</option>
              <option value="kor">韩文</option>
            </select>
          </div>
          <button
            v-if="imageUrl && !isProcessing"
            @click="recognizeText"
            class="btn btn-primary btn-large"
          >
            开始识别
          </button>
        </div>
      </div>

      <!-- 处理中状态 -->
      <div v-if="isProcessing" class="processing-section">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在识别中，请稍候...</p>
        <p class="progress-text">{{ progressText }}</p>
      </div>

      <!-- 结果展示 -->
      <div v-if="imageUrl || recognizedText" class="result-section">
        <div class="image-preview">
          <div class="section-header">
            <h3>预览图片</h3>
            <button v-if="imageUrl" @click="clearImage" class="btn btn-danger btn-small">
              清除图片
            </button>
          </div>
          <div v-if="imageUrl" class="preview-container">
            <img :src="imageUrl" alt="预览" class="preview-image" />
            <div class="image-info">
              <span>文件名: {{ fileName }}</span>
              <span>大小: {{ fileSize }}</span>
            </div>
          </div>
        </div>

        <div class="text-result">
          <div class="section-header">
            <h3>识别结果</h3>
            <div class="button-group">
              <button
                v-if="recognizedText"
                @click="copyText"
                class="btn btn-success btn-small"
              >
                复制文本
              </button>
              <button
                v-if="recognizedText"
                @click="downloadText"
                class="btn btn-info btn-small"
              >
                下载文本
              </button>
            </div>
          </div>
          <textarea
            v-model="recognizedText"
            readonly
            placeholder="识别的文字将显示在这里..."
            class="result-textarea"
          ></textarea>
          <div v-if="confidence" class="confidence-info">
            识别置信度: {{ confidence }}%
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="info-section">
        <h3>使用说明</h3>
        <ul>
          <li>支持上传 JPG、PNG、GIF、BMP 等常见图片格式</li>
          <li>支持 Ctrl+V (或 Cmd+V) 直接粘贴剪贴板中的图片</li>
          <li>为获得最佳识别效果，请上传清晰、对比度高的图片</li>
          <li>支持多种语言识别，包括中文、英文、日文、韩文等</li>
          <li>首次使用需要下载语言包，可能需要一些时间</li>
          <li>所有处理均在浏览器本地完成，不会上传到服务器</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createWorker } from 'tesseract.js'

// 状态
const fileInput = ref(null)
const imageUrl = ref('')
const fileName = ref('')
const fileSize = ref('')
const selectedLanguage = ref('chi_sim')
const recognizedText = ref('')
const isProcessing = ref(false)
const isDragging = ref(false)
const progressText = ref('')
const confidence = ref(0)

// OCR Worker
let worker = null

// 初始化 Worker
const initWorker = async () => {
  if (worker) return worker

  worker = await createWorker(selectedLanguage.value, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        progressText.value = `识别进度: ${Math.round(m.progress * 100)}%`
      } else if (m.status === 'loading tesseract core') {
        progressText.value = '正在加载 OCR 引擎...'
      } else if (m.status === 'initializing tesseract') {
        progressText.value = '正在初始化...'
      } else if (m.status === 'loading language traineddata') {
        progressText.value = '正在下载语言包...'
      }
    }
  })

  return worker
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽上传
const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  } else {
    alert('请上传图片文件')
  }
}

// 处理文件
const processFile = (file) => {
  // 清除之前的结果
  recognizedText.value = ''
  confidence.value = 0

  // 保存文件信息
  fileName.value = file.name
  fileSize.value = formatFileSize(file.size)

  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 清理文本中的多余空格
const cleanText = (text) => {
  if (!text) return text

  // 根据语言类型决定清理策略
  const isChinese = selectedLanguage.value.includes('chi')

  if (isChinese) {
    // 中文文本处理：移除中文字符间的空格
    text = text.replace(/([(\u4e00-\u9fa5)])\s+(?=[\u4e00-\u9fa5])/g, '$1')
    // 保留中英文之间的空格
    text = text.replace(/([a-zA-Z0-9])\s+(?=[a-zA-Z0-9])/g, '$1 ')
  } else {
    // 英文文本处理：规范化空格，多个空格替换为单个
    text = text.replace(/\s+/g, ' ')
  }

  // 移除行尾空格
  text = text.replace(/\s+$/gm, '')
  // 移除行首空格
  text = text.replace(/^\s+/gm, '')
  // 移除多余的空行（保留最多一个空行）
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

// 识别文字
const recognizeText = async () => {
  if (!imageUrl.value) {
    alert('请先上传图片')
    return
  }

  isProcessing.value = true
  progressText.value = '准备识别...'

  try {
    // 初始化 worker
    const currentWorker = await initWorker()

    // 如果语言改变，重新加载语言包
    await currentWorker.loadLanguage(selectedLanguage.value)
    await currentWorker.initialize(selectedLanguage.value)

    // 执行识别
    const { data } = await currentWorker.recognize(imageUrl.value)

    // 清理识别结果中的多余空格
    recognizedText.value = cleanText(data.text)
    confidence.value = Math.round(data.confidence)

    if (!data.text.trim()) {
      alert('未识别到文字，请尝试上传更清晰的图片')
    }
  } catch (error) {
    console.error('识别失败:', error)
    alert('识别失败: ' + error.message)
  } finally {
    isProcessing.value = false
    progressText.value = ''
  }
}

// 复制文本
const copyText = async () => {
  if (recognizedText.value) {
    try {
      await navigator.clipboard.writeText(recognizedText.value)
      alert('文本已复制到剪贴板')
    } catch (e) {
      alert('复制失败')
    }
  }
}

// 下载文本
const downloadText = () => {
  if (recognizedText.value) {
    const blob = new Blob([recognizedText.value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ocr-result-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// 清除图片
const clearImage = () => {
  imageUrl.value = ''
  fileName.value = ''
  fileSize.value = ''
  recognizedText.value = ''
  confidence.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 处理粘贴事件
const handlePaste = (event) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        processFile(file)
        event.preventDefault()
      }
      break
    }
  }
}

// 组件挂载和卸载时的处理
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // 添加全局粘贴事件监听
  window.addEventListener('paste', handlePaste)
})

onUnmounted(async () => {
  // 移除粘贴事件监听
  window.removeEventListener('paste', handlePaste)

  // 清理 worker
  if (worker) {
    await worker.terminate()
    worker = null
  }
})
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
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 上传区域 */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  border: 3px dashed #ccc;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-area.dragging {
  border-color: #667eea;
  background: #e8f0ff;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.upload-hint {
  color: #999;
  font-size: 0.9rem;
}

.options-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 1rem;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-group label {
  font-weight: 500;
  color: #333;
}

.language-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.language-select:focus {
  outline: none;
  border-color: #667eea;
}

/* 处理中状态 */
.processing-section {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.progress-text {
  color: #666;
  font-size: 0.9rem;
}

/* 结果展示 */
.result-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.image-preview,
.text-result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 1.2rem;
  color: #333;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.preview-container {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  display: block;
}

.image-info {
  padding: 1rem;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.result-textarea {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  resize: vertical;
  line-height: 1.6;
}

.result-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.confidence-info {
  padding: 0.75rem;
  background: #e8f5e9;
  border-radius: 6px;
  color: #2e7d32;
  font-weight: 500;
  text-align: center;
}

/* 使用说明 */
.info-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-section h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 0.5rem 0;
  color: #666;
  line-height: 1.6;
}

.info-section li::before {
  content: "• ";
  color: #667eea;
  font-weight: bold;
  margin-right: 0.5rem;
}

/* 按钮 */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 13px;
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

.btn-info {
  background: #4299e1;
  color: white;
}

.btn-info:hover {
  background: #3182ce;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
}

/* 响应式 */
@media (max-width: 768px) {
  .result-section {
    grid-template-columns: 1fr;
  }

  .options-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}
</style>
