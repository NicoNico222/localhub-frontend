// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import MapView from '../views/MapView.vue'
import CommunityView from '../views/CommunityView.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '홈'
      }
    },

    {
      path: '/map',
      name: 'map',
      component: MapView,
      meta: {
        title: '지도'
      }
    },

    {
      path: '/community',
      name: 'community',
      component: CommunityView,
      meta: {
        title: '커뮤니티'
      }
    },

    // 존재하지 않는 주소 접근 시 홈으로 이동
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],

  scrollBehavior() {
    return {
      top: 0
    }
  }
})

// 페이지 제목 변경
router.beforeEach((to, from, next) => {
  document.title = `LocalHub | ${to.meta.title}`

  next()
})

export default router