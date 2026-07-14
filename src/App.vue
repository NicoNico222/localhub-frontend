<template>
  <div id="app">
    <!-- 공통 네비게이션 -->
    <NavBar />

    <!-- 페이지 내용 -->
    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<style>
/* 전체 앱 */
#app {
  min-height: 100vh;
  background: #f8fbff;
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
}

/* 페이지 영역 */
.page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 기본 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f8fbff;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
}
</style>