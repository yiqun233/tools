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
          中文 ← English
        </button>
      </div>

      <div class="text-areas">
        <div class="text-area-wrapper">
          <div class="area-header">
            <span>{{ direction === 'zh-en' ? '中文' : 'English' }}</span>
            <button v-if="sourceText" class="clear-btn" @click="clearAll">清空</button>
          </div>
          <textarea
            v-model="sourceText"
            :placeholder="direction === 'zh-en' ? '输入中文...' : 'Enter English...'"
            @input="debounceTranslate"
          ></textarea>
        </div>

        <div class="text-area-wrapper">
          <div class="area-header">
            <span>{{ direction === 'zh-en' ? 'English' : '中文' }}</span>
            <button v-if="translatedText" class="copy-btn" @click="copyText">
              {{ copied ? '✓ 已复制' : '📋 复制' }}
            </button>
          </div>
          <textarea
            v-model="translatedText"
            :placeholder="direction === 'zh-en' ? 'English translation...' : '中文翻译...'"
            readonly
          ></textarea>
        </div>
      </div>

      <div class="status-bar">
        <div v-if="loading" class="status-loading">
          <span class="spinner"></span> 翻译中...
        </div>
        <div v-else-if="error" class="status-error">{{ error }}</div>
        <div v-else class="status-hint">输入文字后自动翻译</div>
      </div>
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

// 切换方向时自动重新翻译
const setDirection = (dir) => {
  direction.value = dir
}

watch(direction, () => {
  if (sourceText.value.trim()) {
    debounceTranslate()
  }
})

// 交换源文本和译文
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
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.translator-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.lang-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.lang-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}
.lang-btn:hover { background: #f0f4ff; }
.lang-btn.active { background: #667eea; color: white; }

.swap-btn {
  padding: 0.5rem 0.8rem;
  border: 2px solid #e0e0e0;
  background: #f8f9fa;
  color: #555;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}
.swap-btn:hover { border-color: #667eea; color: #667eea; background: #f0f4ff; }

.text-areas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-area-wrapper {
  position: relative;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s;
}
.text-area-wrapper:focus-within { border-color: #667eea; }

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
}

textarea {
  width: 100%;
  height: 180px;
  padding: 1rem;
  border: none;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  outline: none;
}
textarea[readonly] { background: #f9f9f9; }

.clear-btn {
  padding: 0.2rem 0.6rem;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
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
}
.copy-btn:hover { background: #5568d3; }

.status-bar {
  min-height: 28px;
  display: flex;
  align-items: center;
}

.status-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-size: 0.9rem;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-error {
  color: #e55;
  font-size: 0.9rem;
}

.status-hint {
  color: #bbb;
  font-size: 0.85rem;
}
</style>
