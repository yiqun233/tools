<template>
  <div class="home">
    <div class="welcome-section">
      <h2>欢迎使用我的工具箱</h2>
      <p>这里收集了一些常用的开发工具，帮助提高工作效率</p>
    </div>

    <div class="tools-grid">
      <router-link to="/json-formatter" class="tool-card">
        <div class="tool-icon">{ }</div>
        <h3>JSON格式化</h3>
        <p>格式化、压缩和验证JSON数据</p>
      </router-link>

      <router-link to="/base64" class="tool-card">
        <div class="tool-icon">🔐</div>
        <h3>Base64编解码</h3>
        <p>文本和Base64之间的相互转换</p>
      </router-link>

      <router-link to="/text-diff" class="tool-card">
        <div class="tool-icon">📝</div>
        <h3>文本对比</h3>
        <p>比较两段文本的差异，高亮显示不同之处</p>
      </router-link>

      <router-link to="/translator" class="tool-card">
        <div class="tool-icon">🌐</div>
        <h3>翻译工具</h3>
        <p>中译英、英译中文互译</p>
      </router-link>

      <router-link to="/ocr" class="tool-card">
        <div class="tool-icon">📷</div>
        <h3>图片识字</h3>
        <p>上传图片，自动提取图片中的文字内容</p>
      </router-link>

      <router-link to="/bookmarks" class="tool-card">
        <div class="tool-icon">🔖</div>
        <h3>书签管理</h3>
        <p>管理和组织你的书签，支持文件夹分类</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.welcome-section p {
  font-size: 1.2rem;
  color: #666;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.tool-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  text-align: center;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.tool-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tool-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.tool-card p {
  color: #666;
  line-height: 1.6;
}
</style>
