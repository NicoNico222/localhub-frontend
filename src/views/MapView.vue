<template>
  <div class="map-page">

    <!-- 상단 제목 -->
    <section class="page-header">

      <h1>🗺️ 구미 지도</h1>

      <p>
        관광지, 문화시설, 음식점 등 다양한 지역 정보를 지도에서 확인하세요.
      </p>

    </section>

    <!-- 카테고리 -->
    <section class="category-card">

      <button
        v-for="category in categories"
        :key="category"
        class="category-btn"
      >
        {{ category }}
      </button>

    </section>

    <!-- 지도 -->
    <section class="map-card">

      <div class="map-placeholder">

        <div class="icon">
          🗺️
        </div>

        <h2>Kakao Map 영역</h2>

        <p>
          추후 Kakao Maps API가 연결됩니다.
        </p>

      </div>

    </section>

    <!-- 지역 정보 -->
    <section class="info-card">

      <h2>구미 지역 안내</h2>

      <div class="info-grid">

        <div class="info-box">

          <h3>🏞 관광지</h3>

          <p>
            금오산, 박정희 생가, 새마을운동테마공원 등
          </p>

        </div>

        <div class="info-box">

          <h3>🍜 음식점</h3>

          <p>
            구미 대표 맛집과 지역 음식 정보를 제공합니다.
          </p>

        </div>

        <div class="info-box">

          <h3>🎉 축제</h3>

          <p>
            계절별 행사와 문화축제 정보를 제공합니다.
          </p>

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

</script>

<style scoped>

.map-page{

    display:flex;

    flex-direction:column;

    gap:28px;

}

/* ---------- */

.page-header{

    background:#FFFDFA;

    border:1px solid #EDE3D6;

    border-radius:20px;

    padding:40px;

    box-shadow:0 6px 20px rgba(120, 90, 60, .06);

}

.page-header h1{

    color:#A47551;

    font-size:36px;

    margin-bottom:12px;

}

.page-header p{

    color:#8A7A68;

    font-size:17px;

}

/* ---------- */

.category-card{

    background:#FFFDFA;

    border:1px solid #EDE3D6;

    border-radius:20px;

    padding:24px;

    display:grid;

    grid-template-columns:repeat(4,1fr);

    gap:15px;

    box-shadow:0 6px 20px rgba(120, 90, 60, .06);

}

.category-btn{

    border:none;

    border-radius:14px;

    background:#F3E9DC;

    color:#8A5A33;

    padding:15px;

    cursor:pointer;

    font-size:15px;

    font-weight:600;

    transition:.25s;

}

.category-btn:hover{

    background:#EBDCC7;

    transform:translateY(-2px);

}

/* ---------- */

.map-card{

    background:#FFFDFA;

    border:1px solid #EDE3D6;

    border-radius:20px;

    padding:25px;

    box-shadow:0 6px 20px rgba(120, 90, 60, .06);

}

.map-placeholder{

    height:520px;

    border-radius:16px;

    background:linear-gradient(
    135deg,
    #F8F1E7,
    #EFE1CD
    );

    display:flex;

    flex-direction:column;

    justify-content:center;

    align-items:center;

}

.icon{

    font-size:70px;

}

.map-placeholder h2{

    margin-top:20px;

    color:#8A5A33;

}

.map-placeholder p{

    margin-top:10px;

    color:#8A7A68;

}

/* ---------- */

.info-card{

    background:#FFFDFA;

    border:1px solid #EDE3D6;

    border-radius:20px;

    padding:30px;

    box-shadow:0 6px 20px rgba(120, 90, 60, .06);

}

.info-card h2{

    margin-bottom:25px;

    color:#4A3826;

}

.info-grid{

    display:grid;

    grid-template-columns:repeat(3,1fr);

    gap:20px;

}

.info-box{

    background:#FAF4EB;

    border-radius:16px;

    padding:25px;

}

.info-box h3{

    color:#8A5A33;

    margin-bottom:15px;

}

.info-box p{

    color:#8A7A68;

    line-height:1.7;

}

/* ---------- */

@media(max-width:900px){

.category-card{

grid-template-columns:repeat(2,1fr);

}

.info-grid{

grid-template-columns:1fr;

}

.map-placeholder{

height:350px;

}

}

</style>