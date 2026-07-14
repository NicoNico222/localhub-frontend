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

      <div class="post-table">

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

const recentPosts = [
  {
    id: 1,
    category: '관광지',
    title: '금오산 다녀온 후기',
    author: '김구미',
    views: 125,
    date: '2026-07-14'
  },
  {
    id: 2,
    category: '음식점',
    title: '구미 맛집 추천합니다',
    author: '홍길동',
    views: 98,
    date: '2026-07-14'
  },
  {
    id: 3,
    category: '축제',
    title: '이번 주 축제 일정 공유',
    author: '이영희',
    views: 76,
    date: '2026-07-13'
  }
]

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