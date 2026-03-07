<template>
  <div class="tool-container" style="max-width: 1600px">
    <div class="tool-header">
      <h2>文本对比与合并工具</h2>
      <p>比较两段文本的差异，选择保留的内容并合并</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="input-panel">
          <div class="section-header">
            <h3>原文本 (左侧)</h3>
            <button @click="clearLeft" class="btn btn-danger btn-small">清空</button>
          </div>
          <textarea
            v-model="leftText"
            placeholder="请输入原始文本..."
            class="textarea"
            style="min-height: 250px"
            @input="clearDiff"
          ></textarea>
        </div>

        <div class="input-panel">
          <div class="section-header">
            <h3>新文本 (右侧)</h3>
            <button @click="clearRight" class="btn btn-danger btn-small">清空</button>
          </div>
          <textarea
            v-model="rightText"
            placeholder="请输入要对比的文本..."
            class="textarea"
            style="min-height: 250px"
            @input="clearDiff"
          ></textarea>
        </div>
      </div>

      <div class="button-bar">
        <button @click="compareDiff" class="btn btn-primary btn-large">开始对比</button>
        <div class="compare-options">
          <label>
            <input type="checkbox" v-model="ignoreCase" />
            忽略大小写
          </label>
          <label>
            <input type="checkbox" v-model="ignoreWhitespace" />
            忽略空白字符
          </label>
        </div>
      </div>

      <div v-if="hasCompared" class="diff-result">
        <div class="result-header">
          <h3>对比结果 - 选择保留的内容</h3>
          <div class="legend">
            <span class="legend-item"><span class="legend-box added"></span>新增</span>
            <span class="legend-item"><span class="legend-box removed"></span>删除</span>
            <span class="legend-item"><span class="legend-box unchanged"></span>相同</span>
            <span class="legend-item"><span class="legend-box conflict"></span>冲突</span>
          </div>
        </div>

        <div class="diff-chunks">
          <div
            v-for="(chunk, index) in diffChunks"
            :key="'chunk-' + index"
            :class="['chunk-container', chunk.type]"
          >
            <div class="chunk-header">
              <span class="chunk-type-label">
                <template v-if="chunk.type === 'unchanged'">相同内容</template>
                <template v-else-if="chunk.type === 'conflict'">
                  冲突区域 #{{ chunk.conflictId }}
                </template>
              </span>
              <div v-if="chunk.type === 'conflict'" class="chunk-controls">
                <button
                  @click="selectChunkSide(index, 'left')"
                  :class="['btn-choice', { active: chunk.selected === 'left' }]"
                >
                  ← 使用左侧
                </button>
                <button
                  @click="selectChunkSide(index, 'both')"
                  :class="['btn-choice', { active: chunk.selected === 'both' }]"
                >
                  ↕ 保留两侧
                </button>
                <button
                  @click="selectChunkSide(index, 'right')"
                  :class="['btn-choice', { active: chunk.selected === 'right' }]"
                >
                  使用右侧 →
                </button>
              </div>
            </div>

            <div class="chunk-content">
              <div class="chunk-side">
                <div class="side-label">左侧 (原文本)</div>
                <div class="chunk-lines">
                  <div
                    v-for="(line, lineIdx) in chunk.leftLines"
                    :key="'left-' + lineIdx"
                    :class="['chunk-line', line.type]"
                  >
                    <span class="line-number">{{ line.lineNum }}</span>
                    <span class="line-content">{{ line.content || ' ' }}</span>
                  </div>
                </div>
              </div>

              <div class="chunk-side">
                <div class="side-label">右侧 (新文本)</div>
                <div class="chunk-lines">
                  <div
                    v-for="(line, lineIdx) in chunk.rightLines"
                    :key="'right-' + lineIdx"
                    :class="['chunk-line', line.type]"
                  >
                    <span class="line-number">{{ line.lineNum }}</span>
                    <span class="line-content">{{ line.content || ' ' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="merge-section">
          <div class="section-header">
            <h3>合并结果</h3>
            <div class="button-group">
              <button @click="generateMerge" class="btn btn-primary">生成合并结果</button>
              <button @click="copyMergeResult" class="btn btn-success">{{ mergeLabel }}</button>
              <button @click="applyToLeft" class="btn btn-secondary">应用到左侧</button>
              <button @click="applyToRight" class="btn btn-secondary">应用到右侧</button>
            </div>
          </div>
          <textarea
            v-model="mergeResult"
            readonly
            placeholder="点击'生成合并结果'按钮查看合并后的文本..."
            class="textarea"
            style="min-height: 300px; background: #f9f9f9"
          ></textarea>
        </div>

        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">冲突区域:</span>
            <span class="stat-value conflict">{{ stats.conflicts }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">新增行数:</span>
            <span class="stat-value added">{{ stats.added }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">删除行数:</span>
            <span class="stat-value removed">{{ stats.removed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">相同行数:</span>
            <span class="stat-value">{{ stats.unchanged }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useToast } from '../composables/useToast'

const { success, warning, info } = useToast()

const MAX_LINES = 3000

const leftText = ref('')
const rightText = ref('')
const hasCompared = ref(false)
const ignoreCase = ref(false)
const ignoreWhitespace = ref(false)
const mergeResult = ref('')
const mergeLabel = ref('复制结果')

const diffChunks = ref([])
const stats = reactive({
  conflicts: 0,
  added: 0,
  removed: 0,
  unchanged: 0
})

const clearLeft = () => { leftText.value = ''; clearDiff() }
const clearRight = () => { rightText.value = ''; clearDiff() }

const clearDiff = () => {
  hasCompared.value = false
  diffChunks.value = []
  mergeResult.value = ''
  stats.conflicts = 0
  stats.added = 0
  stats.removed = 0
  stats.unchanged = 0
}

const preprocessText = (text) => {
  let processed = text
  if (ignoreWhitespace.value) processed = processed.replace(/\s+/g, ' ').trim()
  if (ignoreCase.value) processed = processed.toLowerCase()
  return processed
}

const compareDiff = () => {
  const leftLines = leftText.value.split('\n')
  const rightLines = rightText.value.split('\n')

  if (leftLines.length > MAX_LINES || rightLines.length > MAX_LINES) {
    if (!confirm(`文本行数较多（左侧 ${leftLines.length} 行 / 右侧 ${rightLines.length} 行），对比可能需要较长时间，是否继续？`)) return
    warning('正在对比大文本，请稍候...')
  }

  const leftProcessed = leftLines.map(preprocessText)
  const rightProcessed = rightLines.map(preprocessText)
  const lcs = computeLCS(leftProcessed, rightProcessed)
  buildDiffChunks(leftLines, rightLines, lcs)
  hasCompared.value = true
}

const computeLCS = (left, right) => {
  const m = left.length
  const n = right.length
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const lcsIndices = { left: new Set(), right: new Set() }
  let i = m, j = n
  while (i > 0 && j > 0) {
    if (left[i - 1] === right[j - 1]) {
      lcsIndices.left.add(i - 1)
      lcsIndices.right.add(j - 1)
      i--; j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }
  return lcsIndices
}

const buildDiffChunks = (leftLines, rightLines, lcs) => {
  diffChunks.value = []
  stats.conflicts = 0; stats.added = 0; stats.removed = 0; stats.unchanged = 0

  let leftIdx = 0, rightIdx = 0
  let leftLineNum = 1, rightLineNum = 1
  let conflictId = 1
  let currentChunk = null, currentChunkType = null

  const finishChunk = () => {
    if (currentChunk && currentChunk.leftLines.length > 0) {
      diffChunks.value.push(currentChunk)
    }
  }

  while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
    const leftInLCS = lcs.left.has(leftIdx)
    const rightInLCS = lcs.right.has(rightIdx)

    if (leftInLCS && rightInLCS) {
      if (currentChunkType !== 'unchanged') {
        finishChunk()
        currentChunk = { type: 'unchanged', leftLines: [], rightLines: [], selected: null }
        currentChunkType = 'unchanged'
      }
      currentChunk.leftLines.push({ lineNum: leftLineNum++, content: leftLines[leftIdx], type: 'unchanged' })
      currentChunk.rightLines.push({ lineNum: rightLineNum++, content: rightLines[rightIdx], type: 'unchanged' })
      stats.unchanged++
      leftIdx++; rightIdx++
    } else {
      if (currentChunkType !== 'conflict') {
        finishChunk()
        currentChunk = { type: 'conflict', conflictId: conflictId++, leftLines: [], rightLines: [], selected: 'both' }
        currentChunkType = 'conflict'
        stats.conflicts++
      }
      if (!leftInLCS && leftIdx < leftLines.length) {
        currentChunk.leftLines.push({ lineNum: leftLineNum++, content: leftLines[leftIdx], type: 'removed' })
        stats.removed++
        leftIdx++
        if (!rightInLCS && rightIdx < rightLines.length) {
          currentChunk.rightLines.push({ lineNum: rightLineNum++, content: rightLines[rightIdx], type: 'added' })
          stats.added++
          rightIdx++
        } else {
          currentChunk.rightLines.push({ lineNum: '', content: '', type: 'empty' })
        }
      } else if (!rightInLCS && rightIdx < rightLines.length) {
        currentChunk.leftLines.push({ lineNum: '', content: '', type: 'empty' })
        currentChunk.rightLines.push({ lineNum: rightLineNum++, content: rightLines[rightIdx], type: 'added' })
        stats.added++
        rightIdx++
      }
    }
  }
  finishChunk()
}

const selectChunkSide = (chunkIndex, side) => {
  if (diffChunks.value[chunkIndex]) {
    diffChunks.value[chunkIndex].selected = side
  }
}

const generateMerge = () => {
  const result = []
  for (const chunk of diffChunks.value) {
    if (chunk.type === 'unchanged') {
      for (const line of chunk.leftLines) result.push(line.content)
    } else if (chunk.type === 'conflict') {
      if (chunk.selected === 'left') {
        for (const line of chunk.leftLines) { if (line.type !== 'empty') result.push(line.content) }
      } else if (chunk.selected === 'right') {
        for (const line of chunk.rightLines) { if (line.type !== 'empty') result.push(line.content) }
      } else {
        for (const line of chunk.leftLines) { if (line.type !== 'empty') result.push(line.content) }
        for (const line of chunk.rightLines) { if (line.type !== 'empty') result.push(line.content) }
      }
    }
  }
  mergeResult.value = result.join('\n')
  info('合并结果已生成')
}

const copyMergeResult = async () => {
  if (!mergeResult.value) { info('请先生成合并结果'); return }
  try {
    await navigator.clipboard.writeText(mergeResult.value)
    success('合并结果已复制到剪贴板')
    mergeLabel.value = '✓ 已复制'
    setTimeout(() => mergeLabel.value = '复制结果', 2000)
  } catch (e) {
    warning('复制失败，请手动选中文本复制')
  }
}

const applyToLeft = () => {
  if (!mergeResult.value) { info('请先生成合并结果'); return }
  leftText.value = mergeResult.value
  clearDiff()
  success('已应用到左侧文本')
}

const applyToRight = () => {
  if (!mergeResult.value) { info('请先生成合并结果'); return }
  rightText.value = mergeResult.value
  clearDiff()
  success('已应用到右侧文本')
}
</script>

<style scoped>
.tool-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.input-panel {
  display: flex;
  flex-direction: column;
}

.button-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.compare-options {
  display: flex;
  gap: 1.5rem;
}

.compare-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #333;
}

.diff-result {
  margin-top: 1rem;
  border-top: 2px solid #e0e0e0;
  padding-top: 2rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.result-header h3 {
  font-size: 1.5rem;
  color: #333;
}

.legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: #666;
}

.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
.legend-box.added     { background: #d4f4dd; }
.legend-box.removed   { background: #ffd7d5; }
.legend-box.unchanged { background: #f5f5f5; }
.legend-box.conflict  { background: #fff4e6; border-color: #ffa940; }

.diff-chunks {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chunk-container {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}
.chunk-container.conflict { border-color: #ffa940; }

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}
.chunk-container.conflict .chunk-header { background: #fff4e6; }

.chunk-type-label { font-weight: 600; color: #333; }

.chunk-controls { display: flex; gap: 0.5rem; }

.btn-choice {
  padding: 0.4rem 0.8rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
  color: #333;
}
.btn-choice:hover { border-color: #667eea; background: #f0f4ff; }
.btn-choice.active { border-color: #667eea; background: #667eea; color: white; }

.chunk-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.chunk-side { display: flex; flex-direction: column; }
.chunk-side:first-child { border-right: 1px solid #e0e0e0; }

.side-label {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.chunk-line {
  display: flex;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.6;
  min-height: 24px;
}
.chunk-line.added     { background: #d4f4dd; }
.chunk-line.removed   { background: #ffd7d5; }
.chunk-line.unchanged { background: #f5f5f5; }
.chunk-line.empty     { background: #fafafa; }

.line-number {
  display: inline-block;
  width: 50px;
  padding: 0 0.5rem;
  text-align: right;
  color: #999;
  background: rgba(0, 0, 0, 0.05);
  border-right: 1px solid #ddd;
  user-select: none;
  flex-shrink: 0;
}

.line-content {
  padding: 0 1rem;
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
}

.merge-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.stat-item { display: flex; align-items: center; gap: 0.5rem; }
.stat-label { font-weight: 500; color: #666; }
.stat-value { font-size: 1.5rem; font-weight: 600; color: #333; }
.stat-value.added   { color: #48bb78; }
.stat-value.removed { color: #f56565; }
.stat-value.conflict { color: #ffa940; }

@media (max-width: 768px) {
  .input-section,
  .chunk-content { grid-template-columns: 1fr; }
  .chunk-side:first-child { border-right: none; border-bottom: 1px solid #e0e0e0; }
  .button-bar { flex-direction: column; }
  .compare-options { flex-direction: column; gap: 0.5rem; }
  .stats { flex-direction: column; gap: 1rem; }
  .chunk-controls { flex-wrap: wrap; }
}
</style>
