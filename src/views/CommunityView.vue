<template>
  <div class="community-page">

    <!-- Header -->
    <section class="header-card">

      <div>
        <h1>💬 커뮤니티</h1>
        <p>구미 시민들과 관광객들이 자유롭게 정보를 공유하는 공간입니다.</p>
      </div>

      <button class="write-btn">
        ✏ 글쓰기
      </button>

    </section>

    <!-- Search -->

    <section class="search-card">

      <input
        type="text"
        placeholder="게시글 검색..."
      />

      <button>
        검색
      </button>

    </section>

    <!-- Category -->

    <section class="category-card">

      <button
        v-for="category in categories"
        :key="category"
      >
        {{ category }}
      </button>

    </section>

    <!-- Table -->

    <section class="board-card">

      <div class="table-header">

        <div>카테고리</div>
        <div>제목</div>
        <div>작성자</div>
        <div>조회수</div>
        <div>작성일</div>

      </div>

      <div
        class="table-row"
        v-for="post in posts"
        :key="post.id"
      >

        <div class="category">

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

    </section>

    <!-- Pagination -->

    <section class="pagination">

      <button>◀</button>

      <button class="active">
        1
      </button>

      <button>2</button>

      <button>3</button>

      <button>▶</button>

    </section>

  </div>
</template>

<script setup>

const categories = [

  '전체',
  '관광지',
  '문화시설',
  '축제',
  '여행코스',
  '레포츠',
  '숙박',
  '쇼핑',
  '음식점'

]

const posts = [

  {
    id:1,
    category:'관광지',
    title:'금오산 야경 정말 예쁘네요.',
    author:'홍길동',
    views:128,
    date:'2026-07-14'
  },

  {
    id:2,
    category:'음식점',
    title:'구미역 근처 맛집 추천해주세요.',
    author:'김철수',
    views:77,
    date:'2026-07-14'
  },

  {
    id:3,
    category:'축제',
    title:'이번 주말 축제 일정 공유',
    author:'이영희',
    views:59,
    date:'2026-07-13'
  },

  {
    id:4,
    category:'쇼핑',
    title:'구미 대형마트 할인 행사',
    author:'박민수',
    views:34,
    date:'2026-07-12'
  }

]

</script>

<style scoped>

.community-page{

display:flex;

flex-direction:column;

gap:28px;

}

/* Header */

.header-card{

display:flex;

justify-content:space-between;

align-items:center;

background:white;

padding:35px;

border-radius:22px;

box-shadow:0 8px 24px rgba(0,0,0,.08);

}

.header-card h1{

color:#5A8DEE;

margin-bottom:10px;

}

.header-card p{

color:#666;

}

.write-btn{

background:#5A8DEE;

color:white;

border:none;

padding:14px 28px;

border-radius:12px;

cursor:pointer;

font-size:15px;

font-weight:600;

transition:.3s;

}

.write-btn:hover{

transform:translateY(-2px);

}

/* Search */

.search-card{

display:flex;

gap:15px;

background:white;

padding:25px;

border-radius:22px;

box-shadow:0 8px 24px rgba(0,0,0,.08);

}

.search-card input{

flex:1;

padding:15px;

border:none;

background:#f4f8ff;

border-radius:12px;

font-size:15px;

outline:none;

}

.search-card button{

background:#5A8DEE;

color:white;

border:none;

padding:0 28px;

border-radius:12px;

cursor:pointer;

}

/* Category */

.category-card{

display:flex;

flex-wrap:wrap;

gap:12px;

background:white;

padding:25px;

border-radius:22px;

box-shadow:0 8px 24px rgba(0,0,0,.08);

}

.category-card button{

border:none;

background:#edf5ff;

padding:12px 18px;

border-radius:30px;

cursor:pointer;

color:#4d7be6;

font-weight:600;

transition:.25s;

}

.category-card button:hover{

background:#dcecff;

}

/* Table */

.board-card{

background:white;

border-radius:22px;

overflow:hidden;

box-shadow:0 8px 24px rgba(0,0,0,.08);

}

.table-header,
.table-row{

display:grid;

grid-template-columns:
1.2fr
3fr
1fr
1fr
1.3fr;

padding:18px 20px;

align-items:center;

}

.table-header{

background:#f6faff;

font-weight:700;

}

.table-row{

border-top:1px solid #eee;

transition:.25s;

}

.table-row:hover{

background:#fafcff;

}

.category{

font-weight:600;

color:#5A8DEE;

}

.title{

font-weight:500;

cursor:pointer;

}

.title:hover{

text-decoration:underline;

}

/* Pagination */

.pagination{

display:flex;

justify-content:center;

gap:10px;

}

.pagination button{

width:42px;

height:42px;

border:none;

background:white;

border-radius:12px;

cursor:pointer;

box-shadow:0 4px 10px rgba(0,0,0,.08);

}

.active{

background:#5A8DEE !important;

color:white;

}

/* Responsive */

@media(max-width:900px){

.header-card{

flex-direction:column;

gap:20px;

align-items:flex-start;

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

.search-card{

flex-direction:column;

}

}

</style>