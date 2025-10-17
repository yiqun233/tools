<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>书签管理器</h2>
      <p>管理和组织你的书签，支持文件夹分类和搜索</p>
    </div>

    <div class="tool-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索书签..."
            class="search-input"
          />
        </div>
        <div class="toolbar-actions">
          <button @click="showAddBookmarkModal" class="btn btn-primary">
            + 添加书签
          </button>
          <button @click="showAddFolderModal" class="btn btn-secondary">
            + 新建文件夹
          </button>
          <button @click="exportBookmarks" class="btn btn-success">
            导出书签
          </button>
          <button @click="importBookmarks" class="btn btn-info">
            导入书签
          </button>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 文件夹树 -->
        <div class="sidebar">
          <div class="sidebar-header">
            <h3>文件夹</h3>
          </div>
          <div class="folder-tree">
            <div
              :class="['folder-item', { active: currentFolder === null }]"
              @click="selectFolder(null)"
            >
              <span class="folder-icon">📚</span>
              <span class="folder-name">所有书签</span>
              <span class="folder-count">({{ totalBookmarks }})</span>
            </div>
            <div
              v-for="folder in folders"
              :key="folder.id"
              :class="['folder-item', { active: currentFolder === folder.id }]"
              @click="selectFolder(folder.id)"
            >
              <span class="folder-icon">📁</span>
              <span class="folder-name">{{ folder.name }}</span>
              <span class="folder-count">({{ getBookmarkCountInFolder(folder.id) }})</span>
              <div class="folder-actions">
                <button @click.stop="editFolder(folder)" class="btn-icon" title="编辑">✏️</button>
                <button @click.stop="deleteFolder(folder.id)" class="btn-icon" title="删除">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 书签列表 -->
        <div class="bookmark-list">
          <div class="list-header">
            <h3>{{ currentFolderName }}</h3>
            <span class="bookmark-count">共 {{ filteredBookmarks.length }} 个书签</span>
          </div>

          <div v-if="filteredBookmarks.length === 0" class="empty-state">
            <p>{{ searchQuery ? '未找到匹配的书签' : '暂无书签，点击"添加书签"开始添加' }}</p>
          </div>

          <div v-else class="bookmarks">
            <div
              v-for="bookmark in filteredBookmarks"
              :key="bookmark.id"
              class="bookmark-card"
            >
              <div class="bookmark-favicon">
                <img
                  :src="getFaviconUrl(bookmark.url)"
                  :alt="bookmark.title"
                  @error="handleFaviconError"
                />
              </div>
              <div class="bookmark-content">
                <h4 class="bookmark-title">
                  <a :href="bookmark.url" target="_blank" rel="noopener noreferrer">
                    {{ bookmark.title }}
                  </a>
                </h4>
                <p class="bookmark-url">{{ bookmark.url }}</p>
                <p v-if="bookmark.description" class="bookmark-description">
                  {{ bookmark.description }}
                </p>
                <div class="bookmark-meta">
                  <span class="bookmark-folder">📁 {{ getFolderName(bookmark.folderId) }}</span>
                  <span class="bookmark-date">{{ formatDate(bookmark.createdAt) }}</span>
                </div>
              </div>
              <div class="bookmark-actions">
                <button @click="editBookmark(bookmark)" class="btn-icon" title="编辑">✏️</button>
                <button @click="deleteBookmark(bookmark.id)" class="btn-icon" title="删除">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑书签模态框 -->
    <div v-if="showBookmarkModal" class="modal-overlay" @click="closeBookmarkModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingBookmark ? '编辑书签' : '添加书签' }}</h3>
          <button @click="closeBookmarkModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题 *</label>
            <input v-model="bookmarkForm.title" type="text" placeholder="输入书签标题" />
          </div>
          <div class="form-group">
            <label>网址 *</label>
            <input v-model="bookmarkForm.url" type="url" placeholder="https://example.com" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="bookmarkForm.description" placeholder="添加描述（可选）"></textarea>
          </div>
          <div class="form-group">
            <label>文件夹</label>
            <select v-model="bookmarkForm.folderId">
              <option :value="null">未分类</option>
              <option v-for="folder in folders" :key="folder.id" :value="folder.id">
                {{ folder.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeBookmarkModal" class="btn btn-secondary">取消</button>
          <button @click="saveBookmark" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑文件夹模态框 -->
    <div v-if="showFolderModal" class="modal-overlay" @click="closeFolderModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingFolder ? '编辑文件夹' : '新建文件夹' }}</h3>
          <button @click="closeFolderModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>文件夹名称 *</label>
            <input v-model="folderForm.name" type="text" placeholder="输入文件夹名称" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeFolderModal" class="btn btn-secondary">取消</button>
          <button @click="saveFolder" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 导入书签输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 数据状态
const bookmarks = ref([])
const folders = ref([])
const searchQuery = ref('')
const currentFolder = ref(null)

// 模态框状态
const showBookmarkModal = ref(false)
const showFolderModal = ref(false)
const editingBookmark = ref(null)
const editingFolder = ref(null)

// 表单数据
const bookmarkForm = ref({
  title: '',
  url: '',
  description: '',
  folderId: null
})

const folderForm = ref({
  name: ''
})

const fileInput = ref(null)

// 计算属性
const totalBookmarks = computed(() => bookmarks.value.length)

const currentFolderName = computed(() => {
  if (currentFolder.value === null) return '所有书签'
  const folder = folders.value.find(f => f.id === currentFolder.value)
  return folder ? folder.name : '所有书签'
})

const filteredBookmarks = computed(() => {
  let result = bookmarks.value

  // 按文件夹筛选
  if (currentFolder.value !== null) {
    result = result.filter(b => b.folderId === currentFolder.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(b =>
      b.title.toLowerCase().includes(query) ||
      b.url.toLowerCase().includes(query) ||
      (b.description && b.description.toLowerCase().includes(query))
    )
  }

  return result
})

// 方法
const getBookmarkCountInFolder = (folderId) => {
  return bookmarks.value.filter(b => b.folderId === folderId).length
}

const getFolderName = (folderId) => {
  if (!folderId) return '未分类'
  const folder = folders.value.find(f => f.id === folderId)
  return folder ? folder.name : '未分类'
}

const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).origin
    return `${domain}/favicon.ico`
  } catch {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="20" font-size="20">🔖</text></svg>'
  }
}

const handleFaviconError = (e) => {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="20" font-size="20">🔖</text></svg>'
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const selectFolder = (folderId) => {
  currentFolder.value = folderId
}

// 书签操作
const showAddBookmarkModal = () => {
  editingBookmark.value = null
  bookmarkForm.value = {
    title: '',
    url: '',
    description: '',
    folderId: currentFolder.value
  }
  showBookmarkModal.value = true
}

const editBookmark = (bookmark) => {
  editingBookmark.value = bookmark
  bookmarkForm.value = {
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description || '',
    folderId: bookmark.folderId
  }
  showBookmarkModal.value = true
}

const closeBookmarkModal = () => {
  showBookmarkModal.value = false
  editingBookmark.value = null
}

const saveBookmark = () => {
  if (!bookmarkForm.value.title || !bookmarkForm.value.url) {
    alert('请填写标题和网址')
    return
  }

  if (editingBookmark.value) {
    // 编辑现有书签
    const index = bookmarks.value.findIndex(b => b.id === editingBookmark.value.id)
    if (index !== -1) {
      bookmarks.value[index] = {
        ...bookmarks.value[index],
        ...bookmarkForm.value
      }
    }
  } else {
    // 添加新书签
    bookmarks.value.push({
      id: Date.now(),
      ...bookmarkForm.value,
      createdAt: Date.now()
    })
  }

  saveToLocalStorage()
  closeBookmarkModal()
}

const deleteBookmark = (id) => {
  if (confirm('确定要删除这个书签吗？')) {
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)
    saveToLocalStorage()
  }
}

// 文件夹操作
const showAddFolderModal = () => {
  editingFolder.value = null
  folderForm.value = { name: '' }
  showFolderModal.value = true
}

const editFolder = (folder) => {
  editingFolder.value = folder
  folderForm.value = { name: folder.name }
  showFolderModal.value = true
}

const closeFolderModal = () => {
  showFolderModal.value = false
  editingFolder.value = null
}

const saveFolder = () => {
  if (!folderForm.value.name) {
    alert('请填写文件夹名称')
    return
  }

  if (editingFolder.value) {
    // 编辑现有文件夹
    const index = folders.value.findIndex(f => f.id === editingFolder.value.id)
    if (index !== -1) {
      folders.value[index] = {
        ...folders.value[index],
        ...folderForm.value
      }
    }
  } else {
    // 添加新文件夹
    folders.value.push({
      id: Date.now(),
      ...folderForm.value,
      createdAt: Date.now()
    })
  }

  saveToLocalStorage()
  closeFolderModal()
}

const deleteFolder = (id) => {
  const bookmarkCount = getBookmarkCountInFolder(id)
  if (bookmarkCount > 0) {
    if (!confirm(`此文件夹中有 ${bookmarkCount} 个书签，删除后这些书签将移至"未分类"，确定要删除吗？`)) {
      return
    }
    // 将文件夹中的书签移至未分类
    bookmarks.value.forEach(b => {
      if (b.folderId === id) {
        b.folderId = null
      }
    })
  } else {
    if (!confirm('确定要删除这个文件夹吗？')) {
      return
    }
  }

  folders.value = folders.value.filter(f => f.id !== id)
  if (currentFolder.value === id) {
    currentFolder.value = null
  }
  saveToLocalStorage()
}

// 导入导出
const exportBookmarks = () => {
  const data = {
    bookmarks: bookmarks.value,
    folders: folders.value,
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bookmarks-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importBookmarks = () => {
  fileInput.value.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.bookmarks && data.folders) {
        bookmarks.value = data.bookmarks
        folders.value = data.folders
        saveToLocalStorage()
        alert('导入成功！')
      } else {
        alert('无效的书签文件格式')
      }
    } catch (error) {
      alert('导入失败：' + error.message)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

// 本地存储
const saveToLocalStorage = () => {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks.value))
  localStorage.setItem('folders', JSON.stringify(folders.value))
}

const loadFromLocalStorage = () => {
  const savedBookmarks = localStorage.getItem('bookmarks')
  const savedFolders = localStorage.getItem('folders')

  if (savedBookmarks) {
    bookmarks.value = JSON.parse(savedBookmarks)
  }

  if (savedFolders) {
    folders.value = JSON.parse(savedFolders)
  }

  // 如果没有数据，添加一些示例数据
  if (bookmarks.value.length === 0) {
    folders.value = [
      { id: 1, name: '开发工具', createdAt: Date.now() },
      { id: 2, name: '学习资源', createdAt: Date.now() }
    ]

    bookmarks.value = [
      {
        id: 1,
        title: 'GitHub',
        url: 'https://github.com',
        description: '全球最大的代码托管平台',
        folderId: 1,
        createdAt: Date.now()
      },
      {
        id: 2,
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        description: 'Web 开发文档',
        folderId: 2,
        createdAt: Date.now()
      },
      {
        id: 3,
        title: 'Vue.js',
        url: 'https://vuejs.org',
        description: '渐进式 JavaScript 框架',
        folderId: 1,
        createdAt: Date.now()
      }
    ]

    saveToLocalStorage()
  }
}

// 初始化
onMounted(() => {
  loadFromLocalStorage()
})
</script>

<style scoped>
.tool-container {
  max-width: 1600px;
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
  gap: 1.5rem;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* 主内容区 */
.main-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  min-height: 500px;
}

/* 侧边栏 */
.sidebar {
  border-right: 2px solid #e0e0e0;
  padding-right: 1.5rem;
}

.sidebar-header {
  margin-bottom: 1rem;
}

.sidebar-header h3 {
  font-size: 1.2rem;
  color: #333;
}

.folder-tree {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.folder-item:hover {
  background: #f0f4ff;
}

.folder-item.active {
  background: #667eea;
  color: white;
}

.folder-icon {
  font-size: 1.2rem;
}

.folder-name {
  flex: 1;
  font-weight: 500;
}

.folder-count {
  font-size: 0.85rem;
  opacity: 0.7;
}

.folder-actions {
  display: none;
  gap: 0.25rem;
}

.folder-item:hover .folder-actions {
  display: flex;
}

/* 书签列表 */
.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h3 {
  font-size: 1.5rem;
  color: #333;
}

.bookmark-count {
  color: #666;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.bookmarks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bookmark-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
}

.bookmark-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.1);
}

.bookmark-favicon {
  flex-shrink: 0;
}

.bookmark-favicon img {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.bookmark-content {
  flex: 1;
}

.bookmark-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.bookmark-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.bookmark-title a:hover {
  color: #667eea;
}

.bookmark-url {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  word-break: break-all;
}

.bookmark-description {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.bookmark-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #999;
}

.bookmark-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
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

.btn-info {
  background: #ed8936;
  color: white;
}

.btn-info:hover {
  background: #dd6b20;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.btn-icon:hover {
  opacity: 1;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 2px solid #e0e0e0;
    padding-right: 0;
    padding-bottom: 1.5rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
