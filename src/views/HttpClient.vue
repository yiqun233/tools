<template>
  <div class="tool-container http-client">
    <div class="tool-header">
      <h2>HTTP 请求工具</h2>
      <p>在浏览器中测试 API 接口，支持多种请求方式与认证</p>
    </div>

    <!-- CORS 提示 -->
    <div class="cors-notice">
      <span>⚠️</span>
      <span>浏览器安全限制：跨域请求需目标服务器允许 CORS。遇到 <em>Failed to fetch</em> 时通常是此原因，可尝试接口代理或在本地服务器中转。</span>
    </div>

    <!-- ===== 请求面板 ===== -->
    <div class="panel request-panel">

      <!-- URL 栏 -->
      <div class="url-bar">
        <select v-model="method" :class="['method-select', `m-${method}`]">
          <option v-for="m in METHODS" :key="m" :value="m">{{ m }}</option>
        </select>
        <input
          v-model="url"
          placeholder="https://api.example.com/endpoint"
          class="url-input"
          @keydown.enter="sendRequest"
          spellcheck="false"
        />
        <button
          @click="sendRequest"
          :disabled="loading"
          class="btn btn-primary send-btn"
        >
          <span v-if="loading" class="spinner-sm"></span>
          {{ loading ? '发送中…' : '发  送' }}
        </button>
      </div>

      <!-- 请求配置 Tabs -->
      <div class="tab-wrap">
        <div class="tab-nav">
          <button
            v-for="t in REQ_TABS" :key="t.id"
            :class="['tab-btn', { active: reqTab === t.id }]"
            @click="reqTab = t.id"
          >
            {{ t.label }}
            <sup v-if="getReqCount(t.id)" class="tab-badge">{{ getReqCount(t.id) }}</sup>
          </button>
        </div>

        <div class="tab-body">

          <!-- Params -->
          <div v-show="reqTab === 'params'">
            <KeyValueEditor
              v-model="queryParams"
              placeholder-key="参数名" placeholder-value="参数值"
              label-key="参数名" label-value="参数值"
            />
          </div>

          <!-- Headers -->
          <div v-show="reqTab === 'headers'">
            <div class="preset-headers">
              <button v-for="p in PRESET_HEADERS" :key="p.k" class="preset-btn" @click="addPresetHeader(p)">
                {{ p.k }}
              </button>
            </div>
            <KeyValueEditor
              v-model="reqHeaders"
              placeholder-key="Header 名" placeholder-value="Header 值"
              label-key="Header" label-value="值"
            />
          </div>

          <!-- Body -->
          <div v-show="reqTab === 'body'">
            <div class="body-type-bar">
              <label v-for="t in BODY_TYPES" :key="t.value" class="radio-label" :class="{ active: bodyType === t.value }">
                <input type="radio" v-model="bodyType" :value="t.value" hidden />
                {{ t.label }}
              </label>
            </div>

            <div v-if="bodyType === 'none'" class="body-empty">此请求不包含请求体</div>

            <textarea
              v-if="bodyType === 'json'"
              v-model="jsonBody"
              class="body-textarea"
              placeholder='{"key": "value"}'
              spellcheck="false"
            ></textarea>

            <textarea
              v-if="bodyType === 'text'"
              v-model="textBody"
              class="body-textarea"
              placeholder="输入纯文本内容..."
              spellcheck="false"
            ></textarea>

            <textarea
              v-if="bodyType === 'xml'"
              v-model="xmlBody"
              class="body-textarea"
              placeholder="<root><item>value</item></root>"
              spellcheck="false"
            ></textarea>

            <div v-if="bodyType === 'form'">
              <p class="body-hint">将以 <code>application/x-www-form-urlencoded</code> 编码发送</p>
              <KeyValueEditor v-model="formParams" placeholder-key="字段名" placeholder-value="字段值" />
            </div>

            <div v-if="bodyType === 'multipart'">
              <p class="body-hint">将以 <code>multipart/form-data</code> 编码发送</p>
              <KeyValueEditor v-model="multipartParams" placeholder-key="字段名" placeholder-value="字段值" />
            </div>

            <div v-if="bodyType === 'graphql'" class="graphql-wrap">
              <div>
                <label class="field-label">Query</label>
                <textarea v-model="graphqlQuery" class="body-textarea" placeholder="query { ... }" spellcheck="false"></textarea>
              </div>
              <div>
                <label class="field-label">Variables (JSON)</label>
                <textarea v-model="graphqlVars" class="body-textarea small" placeholder='{"id": 1}' spellcheck="false"></textarea>
              </div>
            </div>
          </div>

          <!-- Auth -->
          <div v-show="reqTab === 'auth'">
            <div class="field-row">
              <label class="field-label">认证方式</label>
              <select v-model="authType" class="field-select">
                <option value="none">无认证</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="apikey">API Key</option>
                <option value="digest">Digest Auth</option>
              </select>
            </div>

            <div v-if="authType === 'basic'" class="auth-fields">
              <div class="field-row"><label class="field-label">用户名</label><input v-model="basicUser" class="field-input" placeholder="username" /></div>
              <div class="field-row"><label class="field-label">密  码</label><input v-model="basicPass" class="field-input" type="password" placeholder="password" /></div>
              <div class="auth-preview">Authorization: Basic {{ basicPreview }}</div>
            </div>

            <div v-if="authType === 'bearer'" class="auth-fields">
              <div class="field-row"><label class="field-label">Token</label><input v-model="bearerToken" class="field-input mono" placeholder="eyJhbGciOi..." /></div>
              <div class="auth-preview">Authorization: Bearer {{ bearerToken || '…' }}</div>
            </div>

            <div v-if="authType === 'apikey'" class="auth-fields">
              <div class="field-row"><label class="field-label">Key 名称</label><input v-model="apiKeyName" class="field-input" placeholder="X-API-Key" /></div>
              <div class="field-row"><label class="field-label">Key 值</label><input v-model="apiKeyValue" class="field-input mono" placeholder="your-api-key" /></div>
              <div class="field-row">
                <label class="field-label">添加到</label>
                <select v-model="apiKeyIn" class="field-select">
                  <option value="header">请求头</option>
                  <option value="query">查询参数</option>
                </select>
              </div>
            </div>

            <div v-if="authType === 'digest'" class="auth-fields">
              <div class="field-row"><label class="field-label">用户名</label><input v-model="digestUser" class="field-input" placeholder="username" /></div>
              <div class="field-row"><label class="field-label">密  码</label><input v-model="digestPass" class="field-input" type="password" placeholder="password" /></div>
            </div>
          </div>

          <!-- Settings -->
          <div v-show="reqTab === 'settings'">
            <div class="field-row">
              <label class="field-label">超时时间</label>
              <input v-model.number="timeout" type="number" class="field-input" style="width:100px" min="1" max="60" /> 秒
            </div>
            <div class="field-row">
              <label class="field-label">跟随重定向</label>
              <input type="checkbox" v-model="followRedirect" />
            </div>
            <div class="field-row">
              <label class="field-label">发送 Cookie</label>
              <input type="checkbox" v-model="sendCookies" />
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ===== 响应面板 ===== -->
    <div v-if="responded" class="panel response-panel">
      <div class="response-header-bar">
        <h3>响应</h3>
        <div v-if="!reqError" class="response-meta">
          <span :class="['status-badge', statusClass(responseData.status)]">
            {{ responseData.status }} {{ responseData.statusText }}
          </span>
          <span class="meta-chip">⏱ {{ responseData.time }}ms</span>
          <span class="meta-chip">📦 {{ responseData.sizeText }}</span>
        </div>
      </div>

      <!-- 错误 -->
      <div v-if="reqError" class="req-error">
        <div class="req-error-icon">❌</div>
        <div>
          <strong>请求失败</strong>
          <p class="req-error-msg">{{ reqError }}</p>
          <div v-if="isCorsError" class="cors-help">
            <strong>💡 疑似 CORS 问题，解决方案：</strong>
            <ol>
              <li>在目标服务器添加响应头：<code>Access-Control-Allow-Origin: *</code></li>
              <li>使用 CORS 代理，例如 URL 前加：<code>https://corsproxy.io/?</code></li>
              <li>在同域的后端服务中转发请求</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- 响应内容 -->
      <div v-else class="tab-wrap">
        <div class="tab-nav">
          <button
            v-for="t in RES_TABS" :key="t.id"
            :class="['tab-btn', { active: resTab === t.id }]"
            @click="resTab = t.id"
          >{{ t.label }}</button>
          <button class="tab-action-btn" @click="copyResponse">{{ copyResLabel }}</button>
        </div>
        <div class="tab-body">

          <!-- Body -->
          <div v-show="resTab === 'body'" class="res-body-wrap">
            <div v-if="responseData.isImage" class="res-image-wrap">
              <img :src="responseData.imageUrl" class="res-image" />
            </div>
            <div v-else class="res-pre-wrap">
              <div class="res-toolbar">
                <span class="res-content-type">{{ responseData.contentType }}</span>
                <label class="res-wrap-toggle">
                  <input type="checkbox" v-model="wrapLines" /> 自动换行
                </label>
              </div>
              <pre class="res-pre" :class="{ wrap: wrapLines }">{{ responseData.formattedBody }}</pre>
            </div>
          </div>

          <!-- Headers -->
          <div v-show="resTab === 'headers'" class="res-headers">
            <div v-for="[k, v] in Object.entries(responseData.headers)" :key="k" class="header-row">
              <span class="hk">{{ k }}</span>
              <span class="hv">{{ v }}</span>
            </div>
          </div>

          <!-- 请求详情 -->
          <div v-show="resTab === 'request'" class="res-request-detail">
            <div class="detail-section">
              <div class="detail-title">请求行</div>
              <code>{{ method }} {{ responseData.finalUrl }}</code>
            </div>
            <div v-if="responseData.sentHeaders && Object.keys(responseData.sentHeaders).length" class="detail-section">
              <div class="detail-title">发送的 Headers</div>
              <div v-for="[k,v] in Object.entries(responseData.sentHeaders)" :key="k" class="header-row">
                <span class="hk">{{ k }}</span><span class="hv">{{ v }}</span>
              </div>
            </div>
            <div v-if="responseData.sentBody" class="detail-section">
              <div class="detail-title">发送的 Body</div>
              <pre class="res-pre wrap">{{ responseData.sentBody }}</pre>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ===== 历史记录 ===== -->
    <div v-if="history.length" class="panel history-panel">
      <div class="history-hd">
        <h3>历史记录</h3>
        <button class="btn btn-danger btn-small" @click="clearHistory">清空</button>
      </div>
      <div class="history-list">
        <div
          v-for="(item, i) in history"
          :key="i"
          class="history-item"
          @click="loadHistory(item)"
          :title="item.url"
        >
          <span :class="['hm-badge', `m-${item.method}`]">{{ item.method }}</span>
          <span class="h-url">{{ item.url }}</span>
          <span :class="['h-status', statusClass(item.status)]">{{ item.status }}</span>
          <span class="h-time">{{ item.at }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import KeyValueEditor from '../components/KeyValueEditor.vue'
import { useToast } from '../composables/useToast'

const { warning, success, error: toastError } = useToast()

// ─── 常量 ───────────────────────────────────────────────
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const REQ_TABS = [
  { id: 'params',   label: 'Params' },
  { id: 'headers',  label: 'Headers' },
  { id: 'body',     label: 'Body' },
  { id: 'auth',     label: 'Auth' },
  { id: 'settings', label: '设置' },
]

const RES_TABS = [
  { id: 'body',    label: 'Body' },
  { id: 'headers', label: 'Headers' },
  { id: 'request', label: '请求详情' },
]

const BODY_TYPES = [
  { value: 'none',       label: 'None' },
  { value: 'json',       label: 'JSON' },
  { value: 'form',       label: 'Form' },
  { value: 'multipart',  label: 'Multipart' },
  { value: 'text',       label: 'Text' },
  { value: 'xml',        label: 'XML' },
  { value: 'graphql',    label: 'GraphQL' },
]

const PRESET_HEADERS = [
  { k: 'Content-Type',  v: 'application/json' },
  { k: 'Accept',        v: 'application/json' },
  { k: 'Authorization', v: 'Bearer ' },
  { k: 'User-Agent',    v: 'Mozilla/5.0' },
  { k: 'Cache-Control', v: 'no-cache' },
]

// ─── 请求状态 ────────────────────────────────────────────
const method      = ref('GET')
const url         = ref('')
const reqTab      = ref('params')
const queryParams = ref([])
const reqHeaders  = ref([])
const bodyType    = ref('none')
const jsonBody    = ref('')
const textBody    = ref('')
const xmlBody     = ref('')
const formParams  = ref([])
const multipartParams = ref([])
const graphqlQuery = ref('')
const graphqlVars  = ref('')

// Auth
const authType    = ref('none')
const basicUser   = ref('')
const basicPass   = ref('')
const bearerToken = ref('')
const apiKeyName  = ref('X-API-Key')
const apiKeyValue = ref('')
const apiKeyIn    = ref('header')
const digestUser  = ref('')
const digestPass  = ref('')

// Settings
const timeout       = ref(30)
const followRedirect = ref(true)
const sendCookies   = ref(false)

// ─── 响应状态 ────────────────────────────────────────────
const loading     = ref(false)
const responded   = ref(false)
const reqError    = ref('')
const isCorsError = ref(false)
const responseData = ref(null)
const resTab      = ref('body')
const wrapLines   = ref(true)
const copyResLabel = ref('复制')

// ─── 历史记录 ────────────────────────────────────────────
const history = ref(JSON.parse(localStorage.getItem('httpclient_history') || '[]'))

// ─── 计算属性 ────────────────────────────────────────────
const basicPreview = computed(() => {
  if (!basicUser.value && !basicPass.value) return '…'
  return btoa(`${basicUser.value}:${basicPass.value}`)
})

const getReqCount = (tabId) => {
  const active = (arr) => arr.filter(r => r.enabled && r.key).length
  if (tabId === 'params')  return active(queryParams.value)
  if (tabId === 'headers') return active(reqHeaders.value)
  if (tabId === 'auth')    return authType.value !== 'none' ? 1 : 0
  if (tabId === 'body')    return bodyType.value !== 'none' ? 1 : 0
  return 0
}

// ─── 辅助函数 ────────────────────────────────────────────
const statusClass = (code) => {
  if (!code) return ''
  if (code < 300) return 'sc-2xx'
  if (code < 400) return 'sc-3xx'
  if (code < 500) return 'sc-4xx'
  return 'sc-5xx'
}

const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const addPresetHeader = (p) => {
  const existing = reqHeaders.value.find(r => r.key.toLowerCase() === p.k.toLowerCase())
  if (existing) { existing.value = p.v }
  else reqHeaders.value.push({ key: p.k, value: p.v, enabled: true })
}

// ─── 构建请求 ────────────────────────────────────────────
const buildUrl = () => {
  let base = url.value.trim()
  if (!base.startsWith('http')) base = 'https://' + base

  const activeParams = queryParams.value.filter(r => r.enabled && r.key)
  // API Key in query
  if (authType.value === 'apikey' && apiKeyIn.value === 'query' && apiKeyName.value) {
    activeParams.push({ key: apiKeyName.value, value: apiKeyValue.value })
  }

  if (activeParams.length) {
    const sp = new URLSearchParams()
    activeParams.forEach(r => sp.append(r.key, r.value))
    base += (base.includes('?') ? '&' : '?') + sp.toString()
  }
  return base
}

const buildHeaders = () => {
  const h = {}
  reqHeaders.value.filter(r => r.enabled && r.key).forEach(r => { h[r.key] = r.value })

  // Auth headers
  if (authType.value === 'basic' && basicUser.value) {
    h['Authorization'] = 'Basic ' + btoa(`${basicUser.value}:${basicPass.value}`)
  } else if (authType.value === 'bearer' && bearerToken.value) {
    h['Authorization'] = 'Bearer ' + bearerToken.value
  } else if (authType.value === 'apikey' && apiKeyIn.value === 'header' && apiKeyName.value) {
    h[apiKeyName.value] = apiKeyValue.value
  }

  return h
}

const buildBody = () => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(method.value)) return { body: null, contentType: null, bodyStr: '' }

  switch (bodyType.value) {
    case 'json': {
      let b = jsonBody.value.trim()
      if (!b) return { body: null, contentType: null, bodyStr: '' }
      return { body: b, contentType: 'application/json', bodyStr: b }
    }
    case 'text':
      return { body: textBody.value, contentType: 'text/plain', bodyStr: textBody.value }
    case 'xml':
      return { body: xmlBody.value, contentType: 'application/xml', bodyStr: xmlBody.value }
    case 'form': {
      const active = formParams.value.filter(r => r.enabled && r.key)
      const sp = new URLSearchParams()
      active.forEach(r => sp.append(r.key, r.value))
      return { body: sp.toString(), contentType: 'application/x-www-form-urlencoded', bodyStr: sp.toString() }
    }
    case 'multipart': {
      const fd = new FormData()
      multipartParams.value.filter(r => r.enabled && r.key).forEach(r => fd.append(r.key, r.value))
      return { body: fd, contentType: null, bodyStr: '[multipart/form-data]' } // browser sets Content-Type with boundary
    }
    case 'graphql': {
      const payload = { query: graphqlQuery.value }
      if (graphqlVars.value.trim()) {
        try { payload.variables = JSON.parse(graphqlVars.value) } catch {}
      }
      const b = JSON.stringify(payload)
      return { body: b, contentType: 'application/json', bodyStr: b }
    }
    default:
      return { body: null, contentType: null, bodyStr: '' }
  }
}

// ─── 发送请求 ────────────────────────────────────────────
const sendRequest = async () => {
  if (!url.value.trim()) { warning('请输入请求 URL'); return }

  loading.value = true
  responded.value = false
  reqError.value = ''
  isCorsError.value = false
  responseData.value = null

  const finalUrl = buildUrl()
  const headers  = buildHeaders()
  const { body, contentType, bodyStr } = buildBody()

  if (contentType) headers['Content-Type'] = contentType

  const fetchOpts = {
    method:      method.value,
    headers,
    credentials: sendCookies.value ? 'include' : 'same-origin',
    redirect:    followRedirect.value ? 'follow' : 'manual',
  }
  if (body !== null) fetchOpts.body = body

  const controller = new AbortController()
  fetchOpts.signal = controller.signal
  const timer = setTimeout(() => controller.abort(), timeout.value * 1000)

  const t0 = Date.now()

  try {
    const res = await fetch(finalUrl, fetchOpts)
    clearTimeout(timer)
    const time = Date.now() - t0

    // Collect response headers
    const resHeaders = {}
    res.headers.forEach((v, k) => { resHeaders[k] = v })
    const ct = resHeaders['content-type'] || ''

    let formattedBody = '', isImage = false, imageUrl = '', rawText = ''

    if (ct.includes('image/')) {
      isImage = true
      const blob = await res.blob()
      imageUrl = URL.createObjectURL(blob)
      rawText = `[Image ${ct} — ${fmtSize(blob.size)}]`
      formattedBody = rawText
    } else {
      rawText = await res.text()
      if (ct.includes('application/json') || ct.includes('text/json')) {
        try { formattedBody = JSON.stringify(JSON.parse(rawText), null, 2) }
        catch { formattedBody = rawText }
      } else if (ct.includes('text/html')) {
        formattedBody = rawText // show raw HTML
      } else {
        formattedBody = rawText
      }
    }

    const sizeText = fmtSize(new Blob([rawText]).size)

    responseData.value = {
      status:       res.status,
      statusText:   res.statusText,
      headers:      resHeaders,
      contentType:  ct,
      body:         rawText,
      formattedBody,
      isImage,
      imageUrl,
      time,
      sizeText,
      finalUrl,
      sentHeaders:  headers,
      sentBody:     bodyStr,
    }

    responded.value = true
    resTab.value = 'body'

    // Save to history
    const entry = { method: method.value, url: url.value, status: res.status, at: new Date().toLocaleTimeString('zh-CN') }
    history.value = [entry, ...history.value.filter((_, i) => i < 19)]
    localStorage.setItem('httpclient_history', JSON.stringify(history.value))

  } catch (e) {
    clearTimeout(timer)
    reqError.value = e.name === 'AbortError'
      ? `请求超时（超过 ${timeout.value} 秒）`
      : e.message
    isCorsError.value = e.message.toLowerCase().includes('fetch') || e.message.toLowerCase().includes('cors')
    responded.value = true
  } finally {
    loading.value = false
  }
}

// ─── 复制响应 ────────────────────────────────────────────
const copyResponse = async () => {
  if (!responseData.value) return
  try {
    await navigator.clipboard.writeText(responseData.value.formattedBody)
    success('已复制响应内容')
    copyResLabel.value = '✓ 已复制'
    setTimeout(() => copyResLabel.value = '复制', 2000)
  } catch { toastError('复制失败') }
}

// ─── 历史记录操作 ────────────────────────────────────────
const loadHistory = (item) => {
  method.value = item.method
  url.value    = item.url
  success('已载入历史请求')
}

const clearHistory = () => {
  history.value = []
  localStorage.removeItem('httpclient_history')
  success('历史记录已清空')
}
</script>

<style scoped>
.http-client { max-width: 1100px; }

.cors-notice {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  background: #fffbeb;
  border: 1px solid #f6d860;
  border-radius: 8px;
  font-size: 13px;
  color: #7c5e00;
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

/* ── 面板 ── */
.panel {
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.request-panel, .response-panel { }

/* ── URL 栏 ── */
.url-bar {
  display: flex;
  gap: 0;
  border-bottom: 1.5px solid #e8e8e8;
}

.method-select {
  padding: 0 1rem;
  border: none;
  border-right: 1.5px solid #e8e8e8;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  min-width: 105px;
  outline: none;
  appearance: none;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 0;
  letter-spacing: 0.04em;
}

/* Method 颜色 */
.m-GET     { color: #2563eb; background: #eff6ff; }
.m-POST    { color: #16a34a; background: #f0fdf4; }
.m-PUT     { color: #d97706; background: #fffbeb; }
.m-PATCH   { color: #7c3aed; background: #f5f3ff; }
.m-DELETE  { color: #dc2626; background: #fef2f2; }
.m-HEAD    { color: #0891b2; background: #ecfeff; }
.m-OPTIONS { color: #65a30d; background: #f7fee7; }

.url-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: none;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', monospace;
  outline: none;
  background: white;
  min-width: 0;
}

.send-btn {
  border-radius: 0;
  min-width: 90px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-left: 1.5px solid #e8e8e8;
}

/* ── Tabs ── */
.tab-wrap { }

.tab-nav {
  display: flex;
  gap: 0;
  border-bottom: 1.5px solid #e8e8e8;
  background: #f8f9fa;
  padding: 0 0.75rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-btn {
  padding: 0.65rem 1rem;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  white-space: nowrap;
  transition: all 0.2s;
  touch-action: manipulation;
}
.tab-btn:hover { color: #333; }
.tab-btn.active { color: #667eea; border-bottom-color: #667eea; }

.tab-badge {
  display: inline-block;
  background: #667eea;
  color: white;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  text-align: center;
  line-height: 16px;
  padding: 0 4px;
  margin-left: 4px;
  vertical-align: middle;
}

.tab-body {
  padding: 1rem;
}

/* ── Preset Headers ── */
.preset-headers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.preset-btn {
  padding: 0.2rem 0.6rem;
  border: 1.5px dashed #d0d0d0;
  background: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  font-family: monospace;
}
.preset-btn:hover { border-color: #667eea; color: #667eea; }

/* ── Body ── */
.body-type-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.radio-label {
  padding: 0.3rem 0.8rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
  user-select: none;
  touch-action: manipulation;
}
.radio-label:hover, .radio-label.active {
  border-color: #667eea;
  color: #667eea;
  background: #f0f4ff;
}

.body-textarea {
  width: 100%;
  min-height: 180px;
  padding: 0.85rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
  line-height: 1.6;
}
.body-textarea.small { min-height: 80px; }
.body-textarea:focus { outline: none; border-color: #667eea; }

.body-hint { font-size: 12px; color: #999; margin-bottom: 0.75rem; }
.body-empty { padding: 1.5rem; text-align: center; color: #bbb; font-size: 14px; }

.graphql-wrap { display: flex; flex-direction: column; gap: 0.75rem; }

/* ── Auth ── */
.auth-fields { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }

.field-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.field-label {
  min-width: 80px;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  text-align: right;
  white-space: nowrap;
}

.field-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.2s;
}
.field-input.mono { font-family: 'Consolas', 'Monaco', monospace; }
.field-input:focus { outline: none; border-color: #667eea; }

.field-select {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}
.field-select:focus { outline: none; border-color: #667eea; }

.auth-preview {
  margin-left: 88px;
  padding: 0.5rem 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  color: #555;
  word-break: break-all;
}

/* ── 响应 ── */
.response-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border-bottom: 1.5px solid #e8e8e8;
  background: #f8f9fa;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.response-header-bar h3 { font-size: 1rem; color: #333; }

.response-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  font-family: monospace;
}
.sc-2xx { background: #d1fae5; color: #065f46; }
.sc-3xx { background: #fef3c7; color: #92400e; }
.sc-4xx { background: #fee2e2; color: #991b1b; }
.sc-5xx { background: #f5d0fe; color: #6b21a8; }

.meta-chip {
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

/* 错误 */
.req-error {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #fef2f2;
}

.req-error-icon { font-size: 1.5rem; flex-shrink: 0; }
.req-error-msg { color: #7f1d1d; margin: 0.4rem 0; font-family: monospace; font-size: 13px; word-break: break-all; }

.cors-help {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
}
.cors-help ol { margin: 0.5rem 0 0 1.25rem; line-height: 1.8; }
.cors-help code { background: #f3f4f6; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 12px; }

/* 响应 Body */
.tab-action-btn {
  margin-left: auto;
  padding: 0.35rem 0.85rem;
  border: 1.5px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  align-self: center;
}
.tab-action-btn:hover { border-color: #667eea; color: #667eea; }

.res-body-wrap { }

.res-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 12px;
  color: #999;
}

.res-content-type { font-family: monospace; }

.res-wrap-toggle { display: flex; align-items: center; gap: 0.4rem; cursor: pointer; }

.res-pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  max-height: 500px;
  overflow: auto;
  white-space: pre;
  margin: 0;
}
.res-pre.wrap { white-space: pre-wrap; word-break: break-word; }

.res-image-wrap { text-align: center; }
.res-image { max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

/* 响应 Headers */
.res-headers { display: flex; flex-direction: column; gap: 0; }
.header-row {
  display: flex;
  gap: 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  font-family: monospace;
  flex-wrap: wrap;
}
.hk { color: #667eea; min-width: 220px; font-weight: 500; }
.hv { color: #333; flex: 1; word-break: break-all; }

/* 请求详情 */
.res-request-detail { display: flex; flex-direction: column; gap: 1rem; }
.detail-section { }
.detail-title { font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.5rem; }
.detail-section code { display: block; font-family: monospace; font-size: 13px; padding: 0.5rem 0.75rem; background: #f8f9fa; border-radius: 6px; word-break: break-all; }

/* ── 历史记录 ── */
.history-panel { background: white; }
.history-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1.5px solid #e8e8e8;
  background: #f8f9fa;
}
.history-hd h3 { font-size: 1rem; color: #333; }

.history-list { max-height: 260px; overflow-y: auto; }

.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f5f5f5;
}
.history-item:hover { background: #f8f9fa; }

.hm-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  min-width: 60px;
  text-align: center;
  font-family: monospace;
  flex-shrink: 0;
}

.h-url {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #444;
}

.h-status {
  font-size: 12px;
  font-weight: 600;
  font-family: monospace;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
}

.h-time { font-size: 12px; color: #bbb; white-space: nowrap; flex-shrink: 0; }

/* ── Loading spinner ── */
.spinner-sm {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── 移动端 ── */
@media (max-width: 640px) {
  .url-bar { flex-wrap: wrap; }
  .method-select { min-width: 90px; border-right: none; border-bottom: 1.5px solid #e8e8e8; }
  .url-input { order: 1; width: 100%; border-bottom: 1.5px solid #e8e8e8; }
  .send-btn { order: 2; flex: 1; border-left: none; min-height: 46px; }
  .method-select { order: 0; flex: 1; }

  .field-row { flex-direction: column; align-items: flex-start; }
  .field-label { min-width: auto; text-align: left; }
  .field-input { width: 100%; }
  .auth-preview { margin-left: 0; }

  .hk { min-width: 120px; }
  .h-url { font-size: 11px; }
}
</style>
