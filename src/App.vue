<template>
  <div id="app">
    <nav class="navbar">
      <div class="container">
        <router-link to="/" class="logo" @click="menuOpen = false">🧰 我的工具箱</router-link>
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }" aria-label="菜单">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-links" :class="{ open: menuOpen }">
          <router-link to="/json-formatter" @click="menuOpen = false">JSON格式化</router-link>
          <router-link to="/base64" @click="menuOpen = false">Base64</router-link>
          <router-link to="/text-diff" @click="menuOpen = false">文本对比</router-link>
          <router-link to="/translator" @click="menuOpen = false">翻译</router-link>
          <router-link to="/ocr" @click="menuOpen = false">图片识字</router-link>
          <router-link to="/bookmarks" @click="menuOpen = false">书签</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ToastContainer from './components/ToastContainer.vue'

const menuOpen = ref(false)
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
  -webkit-text-size-adjust: 100%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.85rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.logo {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  white-space: nowrap;
}

/* 汉堡按钮 - 默认隐藏 */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
}

.hamburger:hover { background: rgba(255,255,255,0.15); }

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* 导航链接 */
.nav-links {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition: background 0.3s;
  font-size: 0.9rem;
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.main-content {
  flex: 1;
  padding: 1.5rem;
}

/* ===== 移动端 ===== */
@media (max-width: 768px) {
  .hamburger { display: flex; }

  .nav-links {
    display: none;
    position: absolute;
    top: calc(100% + 0.85rem);
    left: 0;
    right: 0;
    background: linear-gradient(160deg, #5a6fd6 0%, #6b3fa0 100%);
    flex-direction: column;
    padding: 0.75rem;
    gap: 0.25rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    border-radius: 0 0 10px 10px;
  }

  .nav-links.open { display: flex; }

  .nav-links a {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border-radius: 8px;
    text-align: center;
  }

  .main-content {
    padding: 0.85rem;
  }
}
</style>
