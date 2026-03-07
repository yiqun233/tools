<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-code">404</div>
      <h2>页面不存在</h2>
      <p>您访问的页面不存在或已被删除</p>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.not-found-content {
  text-align: center;
}

.not-found-code {
  font-size: 8rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}
</style>
