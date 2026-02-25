<template>
  <div class="translator">
    <div class="translator-header">
      <h2>翻译工具</h2>
      <p>支持中译英、英译中</p>
    </div>

    <div class="translator-content">
      <div class="lang-selector">
        <button 
          :class="['lang-btn', { active: direction === 'zh-en' }]"
          @click="direction = 'zh-en'"
        >
          中文 → English
        </button>
        <button 
          :class="['lang-btn', { active: direction === 'en-zh' }]"
          @click="direction = 'en-zh'"
        >
          中文 ← English
        </button>
      </div>

      <div class="text-areas">
        <div class="text-area-wrapper">
          <textarea
            v-model="sourceText"
            :placeholder="direction === 'zh-en' ? '输入中文...' : 'Enter English...'"
            @input="debounceTranslate"
          ></textarea>
          <button v-if="sourceText" class="clear-btn" @click="sourceText = ''; translatedText = ''">×</button>
        </div>

        <div class="text-area-wrapper">
          <textarea
            v-model="translatedText"
            :placeholder="direction === 'zh-en' ? 'English translation...' : '中文翻译...'"
            readonly
          ></textarea>
          <button v-if="translatedText" class="copy-btn" @click="copyText">
            {{ copied ? '✓ 已复制' : '📋 复制' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        翻译中...
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sourceText = ref('')
const translatedText = ref('')const direction = ref('zh-en')
const loading = ref(false)
const error = ref('')
const copied = ref(false)
let debounceTimer = null

const langPair = () => {
  return direction.value === 'zh-en' ? 'zh|en' : 'en|zh'
}

const translate = async () => {
  if (!sourceText.value.trim()) {
    translatedText.value = ''
    return
  }

  loading.value = true
  error.value = ''

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText.value)}&langpair=${langPair()}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.responseStatus === 200) {
      translatedText.value = data.responseData.translatedText
    } else {
      error.value = data.responseDetails || '翻译失败'
    }
  } catch (e) {
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const debounceTranslate = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(translate, 500)
}

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(translatedText.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (e) {
    error.value = '复制失败'
  }
}
</script>

<style scoped>
.translator {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.translator-header {
  text-align: center;
  margin-bottom: 2rem;
}

.translator-header h2 {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.translator-header p {
  color: #666;
}

.lang-selector {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.lang-btn:hover {
  background: #f0f4ff;
}

.lang-btn.active {
  background: #667eea;
  color: white;
}

.text-areas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-area-wrapper {
  position: relative;
}

textarea {
  width: 100%;
  height: 200px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

textarea:focus {
  outline: none;
  border-color: #667eea;
}

textarea[readonly] {
  background: #f9f9f9;
}

.clear-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border: none;
  background: #ccc;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.clear-btn:hover {
  background: #999;
}

.copy-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 0.5rem 1rem;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.copy-btn:hover {
  background: #5a6fd6;
}

.loading {
  text-align: center;
  color: #667eea;
  margin-top: 1rem;
}

.error {
  text-align: center;
  color: #e55;
  margin-top: 1rem;
}
</style>
