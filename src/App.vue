<template>
  <div id="app">
    <nav class="navbar">
      <div class="container">
        <h1 class="logo">我的工具箱</h1>
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/json-formatter">JSON格式化</router-link>
          <router-link to="/base64">Base64编解码</router-link>
          <router-link to="/uuid">UUID生成器</router-link>
          <router-link to="/text-diff">文本对比</router-link>
          <router-link to="/bookmarks">书签管理</router-link>
          <router-link to="/ocr">图片识字</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>
