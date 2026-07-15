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

      <!-- 지도가 그려질 영역 -->
      <div v-show="!mapError" ref="mapContainer" class="map-area"></div>

      <!-- 로드 실패 시 안내 -->
      <div v-if="mapError" class="map-placeholder">

        <div class="icon">
          🗺️
        </div>

        <h2>지도를 불러오지 못했습니다</h2>

        <p>
          {{ mapError }}
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

import { ref, onMounted } from 'vue'
import { loadKakaoMap } from '../api/kakaoMap'

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

// ---------------------------------
// Kakao Map
// ---------------------------------

const mapContainer = ref(null)
const mapError = ref('')

// 초기 중심: 경북 구미시 진평동 985-35
const CENTER_ADDRESS = '경북 구미시 진평동 985-35'

// 주소 변환 실패 시 대비용 근사 좌표 (구미 진평동 일대)
const FALLBACK_CENTER = { lat: 36.1042, lng: 128.4184 }

let map = null

onMounted(async () => {
  try {
    const kakao = await loadKakaoMap()

    // 1) 일단 fallback 좌표로 지도를 먼저 생성
    map = new kakao.maps.Map(mapContainer.value, {
      center: new kakao.maps.LatLng(FALLBACK_CENTER.lat, FALLBACK_CENTER.lng),
      level: 6 // 숫자가 클수록 넓게 보임
    })

    // 줌 컨트롤 추가 (우측)
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT)

    // 2) 주소 -> 좌표 변환 후 정확한 위치로 중심 이동
    const geocoder = new kakao.maps.services.Geocoder()

    geocoder.addressSearch(CENTER_ADDRESS, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result.length > 0) {
        map.setCenter(new kakao.maps.LatLng(result[0].y, result[0].x))
      }
      // 변환 실패 시에는 fallback 중심 그대로 유지
    })
  } catch (e) {
    mapError.value = e.message
    console.error(e)
  }
})

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

.map-area{

    width:100%;

    height:520px;

    border-radius:16px;

    overflow:hidden;

}

/* SDK 로드 실패 시에만 표시되는 안내 박스 */

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

.map-placeholder,
.map-area{

height:350px;

}

}

</style>