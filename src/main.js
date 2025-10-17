import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import JsonFormatter from './views/JsonFormatter.vue'
import Base64Tool from './views/Base64Tool.vue'
import UuidGenerator from './views/UuidGenerator.vue'
import TextDiff from './views/TextDiff.vue'
import BookmarkManager from './views/BookmarkManager.vue'
import ImageOCR from './views/ImageOCR.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/json-formatter', component: JsonFormatter },
  { path: '/base64', component: Base64Tool },
  { path: '/uuid', component: UuidGenerator },
  { path: '/text-diff', component: TextDiff },
  { path: '/bookmarks', component: BookmarkManager },
  { path: '/ocr', component: ImageOCR }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
