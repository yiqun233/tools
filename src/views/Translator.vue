<template>
  <div class="translator">
    <div class="tool-header">
      <h2>翻译工具</h2>
      <p>支持中译英、英译中</p>
    </div>

    <div class="translator-content">
      <div class="lang-bar">
        <button
          :class="['lang-btn', { active: direction === 'zh-en' }]"
          @click="setDirection('zh-en')"
        >
          中文 → English
        </button>
        <button class="swap-btn" @click="swapTexts" title="交换文本">⇄</button>
        <button
          :class="['lang-btn', { active: direction === 'en-zh' }]"
          @click="setDirection('en-zh')"
        >
          English → 中文
        </button>
      </div>

      <div class="text-areas">
        <div class="text-area-wrapper">
          <div class="area-header">
            <span class="area-label">{{ direction === 'zh-en' ? '中文输入' : 'English Input' }}</span>
            <button v-if="sourceText" class="clear-btn" @click="clearAll">清空</button>
          </div>
          <textarea
            v-model="sourceText"
            :placeholder="direction === 'zh-en' ? '输入中文...' : 'Enter English...'"
            @input="debounceTranslate"
          ></textarea>
          <div class="char-count">{{ sourceText.length }} 字符</div>
        </div>

        <div class="text-area-wrapper output-wrapper">
          <div class="area-header">
            <span class="area-label">{{ direction === 'zh-en' ? 'English Output' : '中文翻译' }}</span>
            <button v-if="translatedText" class="copy-btn" @click="copyText">
              {{ copied ? '✓ 已复制' : '📋 复制' }}
            </button>
          </div>
          <div class="output-area">
            <div v-if="loading" class="output-loading">
              <span class="spinner"></span> 翻译中...
            </div>
            <textarea
              v-else
              v-model="translatedText"
              :placeholder="direction === 'zh-en' ? 'English translation...' : '中文翻译...'"
              readonly
            ></textarea>
          </div>
        </div>
      </div>

      <div v-if="error" class="status-error">{{ error }}</div>
      <div v-else-if="!loading" class="status-hint">输入文字后自动翻译 · 免费每天 1000 次</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from '../composables/useToast'

const { success, error: toastError, warning } = useToast()

const sourceText = ref('')
const translatedText = ref('')
const direction = ref('zh-en')
const loading = ref(false)
const error = ref('')
const copied = ref(false)
let debounceTimer = null

const translate = async () => {
  if (!sourceText.value.trim()) {
    translatedText.value = ''
    return
  }

  if (sourceText.value.length > 500) {
    warning('文本超过500字符，可能触发 API 限制，建议分段翻译')
  }

  loading.value = true
  error.value = ''

  try {
    const langpair = direction.value === 'zh-en' ? 'zh|en' : 'en|zh'
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText.value)}&langpair=${langpair}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.responseStatus === 200) {
      translatedText.value = data.responseData.translatedText
    } else if (data.responseStatus === 429) {
      error.value = '今日翻译次数已达上限（免费版每天1000次），请明天再试'
    } else {
      error.value = data.responseDetails || '翻译失败，请稍后重试'
    }
  } catch (e) {
    error.value = '网络错误，请检查网络连接后重试'
  } finally {
    loading.value = false
  }
}

const debounceTranslate = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(translate, 600)
}

const setDirection = (dir) => {
  direction.value = dir
}

watch(direction, () => {
  if (sourceText.value.trim()) debounceTranslate()
})

const swapTexts = () => {
  const tmp = sourceText.value
  sourceText.value = translatedText.value
  translatedText.value = tmp
  direction.value = direction.value === 'zh-en' ? 'en-zh' : 'zh-en'
  if (sourceText.value.trim()) debounceTranslate()
}

const clearAll = () => {
  sourceText.value = ''
  translatedText.value = ''
  error.value = ''
}

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(translatedText.value)
    success('已复制到剪贴板')
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (e) {
    toastError('复制失败，请手动选中文本复制')
  }
}
</script>

<style scoped>
.translator {
  max-width: 860px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.translator-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 语言选择栏 */
.lang-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}

.lang-btn {
  flex: 1;
  max-width: 180px;
  padding: 0.7rem 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
  touch-action: manipulation;
  text-align: center;
}
.lang-btn:hover { background: #f0f4ff; }
.lang-btn.active { background: #667eea; color: white; }

.swap-btn {
  padding: 0.6rem 0.85rem;
  border: 2px solid #e0e0e0;
  background: #f8f9fa;
  color: #555;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.3rem;
  transition: all 0.3s;
  touch-action: manipulation;
  flex-shrink: 0;
}
.swap-btn:hover { border-color: #667eea; color: #667eea; background: #f0f4ff; }

/* 文本区域 */
.text-areas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.text-area-wrapper {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s;
  display: flex;
  flex-direction: column;
}
.text-area-wrapper:focus-within { border-color: #667eea; }

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.85rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.area-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

textarea {
  width: 100%;
  height: 200px;
  padding: 0.85rem;
  border: none;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  outline: none;
  line-height: 1.6;
}
textarea[readonly] { background: #f9f9f9; }

.output-area {
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.output-area textarea { flex: 1; resize: none; height: auto; min-height: 200px; }

.output-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #667eea;
  font-size: 0.9rem;
  min-height: 200px;
  background: #f9f9f9;
}

.char-count {
  padding: 0.25rem 0.85rem;
  font-size: 0.75rem;
  color: #bbb;
  text-align: right;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.clear-btn {
  padding: 0.2rem 0.6rem;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  touch-action: manipulation;
}
.clear-btn:hover { border-color: #f56565; color: #f56565; }

.copy-btn {
  padding: 0.2rem 0.8rem;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  touch-action: manipulation;
}
.copy-btn:hover { background: #5568d3; }

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.status-error {
  color: #e55;
  font-size: 0.9rem;
  text-align: center;
}

.status-hint {
  color: #ccc;
  font-size: 0.8rem;
  text-align: center;
}

/* ===== 移动端 ===== */
@media (max-width: 640px) {
  .translator {
    padding: 1rem;
    border-radius: 8px;
  }

  .lang-bar {
    gap: 0.5rem;
  }

  .lang-btn {
    font-size: 0.82rem;
    padding: 0.65rem 0.5rem;
    max-width: none;
  }

  .swap-btn {
    font-size: 1.1rem;
    padding: 0.55rem 0.6rem;
  }

  /* 移动端上下排列 */
  .text-areas {
    grid-template-columns: 1fr;
  }

  textarea {
    height: 150px;
    font-size: 16px !important; /* 防止 iOS 缩放 */
  }

  .output-area,
  .output-area textarea {
    min-height: 150px;
  }
}
</style>
