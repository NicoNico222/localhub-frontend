<template>
  <div id="app">
    <!-- 공통 네비게이션 -->
    <NavBar />

    <!-- 페이지 내용 -->
    <main class="page-container">
      <RouterView />
    </main>

    <!-- 우측 하단 플로팅 챗봇 -->
    <ChatbotWidget />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import ChatbotWidget from './components/ChatbotWidget.vue'
</script>

<style>
/* 전체 앱 */
#app {
  min-height: 100vh;
  background: #FAF6F0;
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
}

/* 페이지 영역 (네비게이션 바 내부 칸과 같은 폭) */
.page-container {
  max-width: 1100px;
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
  background: #FAF6F0;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
}
</style>