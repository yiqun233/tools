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

      <router-link to="/http-client" class="tool-card">
        <div class="tool-icon">🌐</div>
        <h3>HTTP 请求</h3>
        <p>在浏览器中发送 API 请求，支持多种方法与认证</p>
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

<script setup></script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.welcome-section h2 {
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
  color: #667eea;
}

.welcome-section p {
  font-size: 1.1rem;
  color: #666;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.tool-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem 1.5rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  line-height: 1;
}

.tool-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.4rem;
  color: #333;
}

.tool-card p {
  color: #666;
  line-height: 1.5;
  font-size: 0.9rem;
}

/* 移动端 */
@media (max-width: 600px) {
  .welcome-section h2 { font-size: 1.6rem; }
  .welcome-section p  { font-size: 1rem; }

  .tools-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .tool-card {
    padding: 1.25rem 0.75rem;
  }

  .tool-icon { font-size: 2rem; }
  .tool-card h3 { font-size: 1rem; }
  .tool-card p { font-size: 0.8rem; display: none; } /* 手机上隐藏描述节省空间 */
}

@media (max-width: 360px) {
  .tools-grid { grid-template-columns: 1fr; }
  .tool-card p { display: block; }
}
</style>
