<template>
  <div class="home">

    <!-- Hero Section -->
    <section class="hero-card">

      <h1>
        구미 지역 정보 공유 커뮤니티
        <span>LocalHub</span>
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
          커뮤니티
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
          :key="category"
          class="category-btn"
        >
          {{ category }}
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

          <div class="category-tag">
            {{ post.category }}
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

const categories = [
  '관광지',
  '문화시설',
  '축제공연행사',
  '여행코스',
  '레포츠',
  '숙박',
  '쇼핑',
  '음식점'
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
  background:white;
  border-radius:24px;
  padding:70px 40px;
  text-align:center;
  box-shadow:0 8px 24px rgba(0,0,0,.08);
}

.hero-card h1{
  font-size:42px;
  font-weight:700;
  color:#333;
  line-height:1.4;
}

.hero-card span{
  display:block;
  color:#5A8DEE;
  margin-top:8px;
}

.hero-card p{
  margin-top:18px;
  font-size:18px;
  color:#777;
}

.hero-buttons{
  margin-top:32px;
  display:flex;
  justify-content:center;
  gap:16px;
}

.primary-btn,
.secondary-btn{

  border:none;
  border-radius:14px;

  padding:14px 28px;

  cursor:pointer;

  font-size:16px;
  font-weight:600;

  transition:.3s;
}

.primary-btn{

  background:#5A8DEE;
  color:white;
}

.primary-btn:hover{

  transform:translateY(-2px);
}

.secondary-btn{

  background:#e8f1ff;
  color:#4c6fdc;
}

.secondary-btn:hover{

  transform:translateY(-2px);
}

/* Category */

.category-section,
.post-section{

  background:white;

  border-radius:24px;

  padding:30px;

  box-shadow:0 8px 24px rgba(0,0,0,.08);
}

.section-header{

  font-size:22px;

  font-weight:700;

  margin-bottom:22px;

  color:#333;
}

.category-grid{

  display:grid;

  grid-template-columns:repeat(4,1fr);

  gap:14px;
}

.category-btn{

  border:none;

  background:#eef5ff;

  color:#4c6fdc;

  border-radius:14px;

  padding:16px;

  cursor:pointer;

  font-size:15px;

  font-weight:600;

  transition:.25s;
}

.category-btn:hover{

  background:#d9e8ff;

  transform:translateY(-2px);
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

  border-bottom:1px solid #eee;
}

.table-header{

  font-weight:700;

  background:#f7faff;

  border-radius:12px;
}

.table-row{

  transition:.2s;
}

.table-row:hover{

  background:#fafcff;
}

.category-tag{

  color:#4c6fdc;

  font-weight:600;
}

.title{

  font-weight:500;
}

/* Responsive */

@media (max-width:900px){

  .hero-card h1{
    font-size:30px;
  }

  .category-grid{
    grid-template-columns:repeat(2,1fr);
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