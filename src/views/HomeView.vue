<template>
  <div class="home">

    <!-- Hero Section -->
    <section class="hero-card">

      <h1>
        구미의 모든 지역정보를<br />
        한 곳에서 <span class="hero-pin">📍</span>
      </h1>

      <p>
        구미 지역 정보를 한눈에 만나보세요
      </p>

      <div class="hero-buttons">

        <button
          class="primary-btn"
          @click="$router.push('/map')"
        >
          구미 전역 둘러보기
        </button>

        <button
          class="secondary-btn"
          @click="$router.push('/community')"
        >
          커뮤니티 가기
        </button>

      </div>

    </section>

    <!-- Category Section -->
    <section class="category-section">

      <div class="section-header">
        카테고리
      </div>

      <div class="category-grid">

        <button
          v-for="category in categories"
          :key="category.name"
          class="category-btn"
        >

          <span
            class="category-icon"
            :style="{ background: category.bg }"
          >
            {{ category.icon }}
          </span>

          <span class="category-name">
            {{ category.name }}
          </span>

        </button>

      </div>

    </section>

    <!-- Recent Posts -->
    <section class="post-section">

      <div class="section-header">
        최근 게시글
      </div>

      <div v-if="recentLoading" class="post-loading">
        불러오는 중...
      </div>

      <div v-else-if="recentError" class="post-loading">
        {{ recentError }}
      </div>

      <div v-else class="post-table">

        <div class="table-header">

          <div>카테고리</div>
          <div>게시글 제목</div>
          <div>작성자</div>
          <div>조회수</div>
          <div>날짜</div>

        </div>

        <div
          v-for="post in recentPosts"
          :key="post.id"
          class="table-row"
          @click="goToPost(post.id)"
        >

          <div>
            <span class="category-tag">
              {{ post.category }}
            </span>
          </div>

          <div class="title">
            {{ post.title }}
          </div>

          <div>
            {{ post.author }}
          </div>

          <div>
            {{ post.views }}
          </div>

          <div>
            {{ post.date }}
          </div>

        </div>

      </div>

    </section>

  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPosts } from '../stores/posts'

const router = useRouter()

// 최근 게시글 클릭 시 커뮤니티 페이지로 이동 + 해당 게시글 상세 자동 오픈
function goToPost(id) {
  router.push({ path: '/community', query: { post: id } })
}

// 카테고리: 이름 + 아이콘 + 아이콘 배경색
const categories = [
  { name: '관광지',       icon: '🗺️', bg: '#E7F3E7' },
  { name: '문화시설',     icon: '🏛️', bg: '#F0EAF7' },
  { name: '축제공연행사', icon: '🎆', bg: '#FBEAEA' },
  { name: '여행코스',     icon: '🧳', bg: '#EAF0F7' },
  { name: '레포츠',       icon: '⚡', bg: '#EEEAF9' },
  { name: '숙박',         icon: '🏠', bg: '#E7F4F1' },
  { name: '쇼핑',         icon: '🛍️', bg: '#FBF3DE' },
  { name: '음식점',       icon: '🍽️', bg: '#FBEEE0' }
]

// 커뮤니티에 실제로 등록된 게시글 중 최신 3개 (백엔드 GET /posts/?page=1&limit=3)
const recentPosts = ref([])
const recentLoading = ref(true)
const recentError = ref('')

onMounted(async () => {
  try {
    const result = await fetchPosts(1, 3)
    recentPosts.value = result.posts
  } catch (e) {
    recentError.value = '최근 게시글을 불러오지 못했습니다.'
    console.error(e)
  } finally {
    recentLoading.value = false
  }
})

</script>

<style scoped>

.home{
  display:flex;
  flex-direction:column;
  gap:32px;
}

/* Hero */

.hero-card{
  background:linear-gradient(135deg, #FBF5EC 0%, #FFFDFA 60%);
  border:1px solid #EDE3D6;
  border-radius:20px;
  padding:60px 40px;
  text-align:center;
  box-shadow:0 6px 20px rgba(120, 90, 60, .06);
}

.hero-card h1{
  font-size:38px;
  font-weight:700;
  color:#4A3826;
  line-height:1.4;
}

.hero-pin{
  font-size:30px;
}

.hero-card p{
  margin-top:16px;
  font-size:16px;
  color:#8A7A68;
}

.hero-buttons{
  margin-top:30px;
  display:flex;
  justify-content:center;
  gap:14px;
}

.primary-btn,
.secondary-btn{

  border:none;
  border-radius:12px;

  padding:13px 26px;

  cursor:pointer;

  font-size:15px;
  font-weight:600;

  transition:.3s;
}

.primary-btn{

  background:#A47551;
  color:white;
}

.primary-btn:hover{

  background:#8F6242;
  transform:translateY(-2px);
}

.secondary-btn{

  background:white;
  color:#8A6A4B;
  border:1px solid #E3D5C3;
}

.secondary-btn:hover{

  background:#FAF4EB;
  transform:translateY(-2px);
}

/* Category */

.category-section,
.post-section{

  background:#FFFDFA;

  border:1px solid #EDE3D6;

  border-radius:20px;

  padding:30px;

  box-shadow:0 6px 20px rgba(120, 90, 60, .06);
}

.section-header{

  font-size:22px;

  font-weight:700;

  margin-bottom:22px;

  color:#4A3826;
}

/* 1줄 8칸 */

.category-grid{

  display:grid;

  grid-template-columns:repeat(8, 1fr);

  gap:12px;
}

.category-btn{

  display:flex;

  flex-direction:column;

  align-items:center;

  gap:10px;

  border:1px solid #EDE3D6;

  background:white;

  border-radius:16px;

  padding:18px 8px;

  cursor:pointer;

  transition:.25s;
}

.category-btn:hover{

  border-color:#D9C4A9;

  box-shadow:0 6px 16px rgba(120, 90, 60, .12);

  transform:translateY(-3px);
}

/* 아이콘 타일 */

.category-icon{

  width:44px;

  height:44px;

  display:flex;

  align-items:center;

  justify-content:center;

  border-radius:12px;

  font-size:20px;
}

.category-name{

  font-size:13px;

  font-weight:600;

  color:#5C4632;

  white-space:nowrap;
}

/* Posts */

.post-loading{

  padding:40px 20px;

  text-align:center;

  color:#8A7A68;

  font-size:14px;
}

.post-table{

  width:100%;
}

.table-header,
.table-row{

  display:grid;

  grid-template-columns:
  1fr
  3fr
  1fr
  1fr
  1.2fr;

  align-items:center;

  padding:16px;

  border-bottom:1px solid #F0E8DC;
}

.table-header{

  font-weight:700;

  color:#5C4632;

  background:#FAF4EB;

  border-radius:12px;

  border-bottom:none;
}

.table-row{

  transition:.2s;

  cursor:pointer;
}

.table-row:hover{

  background:#FCF8F2;
}

.category-tag{

  display:inline-block;

  background:#F3E9DC;

  color:#8A5A33;

  padding:4px 12px;

  border-radius:999px;

  font-size:13px;

  font-weight:600;
}

.title{

  font-weight:500;

  color:#4A3826;
}

/* Responsive */

@media (max-width:900px){

  .hero-card h1{
    font-size:28px;
  }

  /* 화면이 좁아지면 4칸 x 2줄 */
  .category-grid{
    grid-template-columns:repeat(4,1fr);
  }

  .table-header,
  .table-row{

    font-size:13px;

    grid-template-columns:
    1fr
    2fr
    1fr
    1fr
    1fr;
  }

  .hero-buttons{

    flex-direction:column;
  }
}

</style>