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
        :key="category.key"
        class="category-btn"
        :class="{ active: category.key === selectedCategory }"
        @click="selectCategory(category.key)"
      >
        {{ category.label }}
      </button>

    </section>

    <!-- 지도 -->
    <section class="map-card">

      <div class="map-status">

        <span v-if="dataLoading">데이터를 불러오는 중...</span>

        <span v-else-if="dataError">{{ dataError }}</span>

        <span v-else-if="searchNotice">{{ searchNotice }}</span>

        <span v-else>
          {{ currentCategoryLabel }} {{ markerCount }}곳이 지도에 표시되어 있습니다. 마커를 눌러 상세 정보를 확인하세요.
        </span>

      </div>

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

    <!-- 축제 일정 (축제공연행사 카테고리에서만 표시) -->
    <section
      v-if="selectedCategory === 'event' && !dataLoading && sortedEvents.length"
      class="festival-card"
    >

      <h2 class="festival-title">📅 축제 일정</h2>

      <p class="festival-desc">
        일정이 가까운 축제부터 보여드려요. 항목을 누르면 지도에서 위치를 확인할 수 있습니다.
      </p>

      <ul class="festival-list">

        <li
          v-for="ev in pagedEvents"
          :key="ev.contentid"
          class="festival-item"
          @click="focusEvent(ev)"
        >

          <img
            v-if="ev.firstimage2 || ev.firstimage"
            class="festival-img"
            :src="ev.firstimage2 || ev.firstimage"
            :alt="ev.title"
          />

          <div v-else class="festival-img festival-noimg">
            🎪
          </div>

          <div class="festival-info">

            <span class="festival-status" :class="eventStatus(ev).cls">
              {{ eventStatus(ev).label }}
            </span>

            <h3>{{ ev.title }}</h3>

            <p class="festival-date">
              {{ formatEventPeriod(ev) }}
            </p>

          </div>

        </li>

      </ul>

      <!-- 페이지네이션 -->
      <div v-if="totalEventPages > 1" class="festival-pagination">

        <button
          :disabled="eventPage === 1"
          @click="eventPage--"
        >
          이전
        </button>

        <button
          v-for="p in totalEventPages"
          :key="p"
          :class="{ active: p === eventPage }"
          @click="eventPage = p"
        >
          {{ p }}
        </button>

        <button
          :disabled="eventPage === totalEventPages"
          @click="eventPage++"
        >
          다음
        </button>

      </div>

    </section>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { loadKakaoMap } from '../api/kakaoMap'
import http from '../api/http'

const route = useRoute()

// 화면 라벨 <-> 백엔드 /data/{key} 매핑
const categories = [
  { key: 'tourist',  label: '관광지' },
  { key: 'culture',  label: '문화시설' },
  { key: 'event',    label: '축제공연행사' },
  { key: 'course',   label: '여행코스' },
  { key: 'leports',  label: '레포츠' },
  { key: 'room',     label: '숙박' },
  { key: 'shopping', label: '쇼핑' },
  { key: 'food',     label: '음식점' }
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

let kakaoRef = null
let map = null
let markers = []       // 현재 지도에 올라간 마커들: { marker, item } 쌍으로 저장
let infoWindow = null  // 마커 클릭 시 여는 정보창 (하나를 재사용)

// ---------------------------------
// 카테고리 데이터 / 마커
// ---------------------------------

// 초기 카테고리: 기본은 관광지.
// 홈 화면 등에서 /map?category=food 처럼 진입하면 해당 카테고리로 시작.
const queryCategory = route.query.category
const initialCategory = categories.some(c => c.key === queryCategory)
  ? queryCategory
  : 'tourist'

const selectedCategory = ref(initialCategory)
const dataLoading = ref(false)
const dataError = ref('')
const markerCount = ref(0)
const searchNotice = ref('') // 네비바 검색 결과가 없을 때 안내 문구

// ---------------------------------
// 축제 일정 목록 (event 카테고리 전용)
// ---------------------------------

const EVENT_PAGE_SIZE = 10

const eventItems = ref([]) // event 카테고리 원본 items
const eventPage = ref(1)   // 현재 페이지 (1부터 시작)

const currentCategoryLabel = computed(
  () => categories.find(c => c.key === selectedCategory.value)?.label ?? ''
)

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

// 정보창에 들어갈 HTML 생성
function buildInfoContent(item) {
  const title = escapeHtml(item.title)
  const addr = escapeHtml(item.addr1)
  const tel = escapeHtml(item.tel)
  const img = item.firstimage2 || item.firstimage

  return `
    <div style="padding:12px 14px; width:230px; font-family:'Pretendard','Noto Sans KR',sans-serif;">
      ${img ? `<img src="${img}" alt="${title}" style="width:100%; height:110px; object-fit:cover; border-radius:8px; margin-bottom:8px;" />` : ''}
      <div style="font-size:14px; font-weight:700; color:#4A3826; line-height:1.4;">${title}</div>
      ${addr ? `<div style="margin-top:6px; font-size:12px; color:#8A7A68; line-height:1.5;">📍 ${addr}</div>` : ''}
      ${tel ? `<div style="margin-top:3px; font-size:12px; color:#8A7A68;">📞 ${tel}</div>` : ''}
    </div>
  `
}

// 기존 마커 전부 제거
function clearMarkers() {
  markers.forEach(({ marker }) => marker.setMap(null))
  markers = []
  if (infoWindow) infoWindow.close()
}

// 카테고리 데이터 받아서 마커 찍기
async function loadCategoryMarkers(categoryKey) {
  if (!map) return

  dataLoading.value = true
  dataError.value = ''

  try {
    // 백엔드 GET /data/{category}
    const { data } = await http.get(`/data/${categoryKey}`)
    const items = data.items ?? []

    // 축제공연행사 카테고리면 일정 목록도 갱신
    eventItems.value = categoryKey === 'event' ? items : []
    eventPage.value = 1

    clearMarkers()

    const kakao = kakaoRef

    for (const item of items) {
      // SCHEMA.md: mapx(경도)/mapy(위도)는 string이라 숫자 변환 필요
      const lng = parseFloat(item.mapx)
      const lat = parseFloat(item.mapy)

      if (Number.isNaN(lat) || Number.isNaN(lng)) continue

      const marker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(lat, lng),
        title: item.title
      })

      // 마커 클릭 -> 정보창 열기
      kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.setContent(buildInfoContent(item))
        infoWindow.open(map, marker)
      })

      // 검색 기능에서 장소 이름으로 마커를 찾을 수 있도록
      // 마커와 원본 데이터를 함께 저장
      markers.push({ marker, item })
    }

    markerCount.value = markers.length
  } catch (e) {
    dataError.value = '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
    console.error(e)
  } finally {
    dataLoading.value = false
  }
}

function selectCategory(key) {
  if (key === selectedCategory.value) return
  selectedCategory.value = key
  searchNotice.value = ''
  loadCategoryMarkers(key)
}

// ---------------------------------
// 네비바 검색 -> 마커로 이동
// ---------------------------------

// 현재 마커들 중 장소 이름에 검색어가 포함된 것 찾기
function findMarkerEntry(keyword) {
  return markers.find(({ item }) =>
    String(item.title ?? '').toLowerCase().includes(keyword)
  )
}

// 검색어에 해당하는 장소로 지도 이동 + 마커 클릭(정보창 열기)
async function searchAndFocus(rawKeyword) {
  if (!map) return

  const keyword = String(rawKeyword ?? '').trim().toLowerCase()
  if (!keyword) return

  searchNotice.value = ''

  // 1) 현재 카테고리 마커에서 먼저 찾기
  let entry = findMarkerEntry(keyword)

  // 2) 없으면 다른 카테고리를 순회하며 찾기
  //    (찾으면 해당 카테고리로 전환 후 마커 다시 로드)
  if (!entry) {
    for (const c of categories) {
      if (c.key === selectedCategory.value) continue

      try {
        const { data } = await http.get(`/data/${c.key}`)
        const items = data.items ?? []

        const hit = items.some(it =>
          String(it.title ?? '').toLowerCase().includes(keyword)
        )

        if (hit) {
          selectedCategory.value = c.key
          await loadCategoryMarkers(c.key)
          entry = findMarkerEntry(keyword)
          break
        }
      } catch (e) {
        // 특정 카테고리 조회 실패 시 다음 카테고리로 넘어감
        console.error(e)
      }
    }
  }

  if (entry) {
    // 확대 후 해당 위치로 이동
    map.setLevel(4)
    map.panTo(entry.marker.getPosition())

    // 마커 클릭 이벤트를 프로그래밍적으로 발생 -> 정보창 열림
    kakaoRef.maps.event.trigger(entry.marker, 'click')
  } else {
    searchNotice.value = `'${String(rawKeyword).trim()}' 검색 결과가 없습니다. 다른 검색어로 시도해보세요.`
  }
}

// 네비바에서 검색하면 /map?q=검색어&t=타임스탬프 로 이동해 옴.
// 이미 지도 페이지에 있을 때도 반응하도록 route.query를 감시.
// (t 덕분에 같은 검색어를 다시 검색해도 query 객체가 바뀌어 watch가 동작)
watch(
  () => route.query,
  (query) => {
    if (query.q) searchAndFocus(query.q)
  }
)

// ---------------------------------
// 축제 일정: 정렬 / 표시 / 클릭 이동
// ---------------------------------

const DAY_MS = 24 * 60 * 60 * 1000

// 'YYYYMMDD' -> Date (자정 기준). 형식이 아니면 null
function parseYmd(ymd) {
  if (!ymd || String(ymd).length !== 8) return null
  const s = String(ymd)
  const d = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))
  return Number.isNaN(d.getTime()) ? null : d
}

// 'YYYYMMDD' -> 'YYYY.MM.DD'
function formatYmd(ymd) {
  if (!ymd || String(ymd).length !== 8) return ''
  const s = String(ymd)
  return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`
}

function formatEventPeriod(ev) {
  const start = formatYmd(ev.eventstartdate)
  const end = formatYmd(ev.eventenddate)

  if (!start && !end) return '일정 미정'
  if (start && end) return start === end ? start : `${start} ~ ${end}`
  return start || end
}

// 오늘 자정 기준 Date
function today0() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// 정렬 키: 작을수록 위에 표시
// - 진행중: 0
// - 예정: 시작까지 남은 일수
// - 종료: 큰 오프셋 + 종료 후 지난 일수 (최근 종료가 먼저)
// - 일정 미정: 맨 뒤
function eventSortKey(ev) {
  const start = parseYmd(ev.eventstartdate)
  const end = parseYmd(ev.eventenddate) || start

  if (!start) return Number.MAX_SAFE_INTEGER

  const today = today0()

  if (end && end < today) {
    return 1e9 + (today - end) / DAY_MS
  }

  if (start <= today) return 0 // 진행중

  return (start - today) / DAY_MS // 시작까지 D-일수
}

// 카드에 붙는 상태 배지
function eventStatus(ev) {
  const start = parseYmd(ev.eventstartdate)
  const end = parseYmd(ev.eventenddate) || start

  if (!start) return { label: '일정 미정', cls: 'status-none' }

  const today = today0()

  if (end && end < today) return { label: '종료', cls: 'status-done' }

  if (start <= today) return { label: '진행중', cls: 'status-ing' }

  const dday = Math.round((start - today) / DAY_MS)
  return { label: `D-${dday}`, cls: 'status-soon' }
}

// 일정 가까운 순 정렬
const sortedEvents = computed(() =>
  [...eventItems.value].sort((a, b) => eventSortKey(a) - eventSortKey(b))
)

const totalEventPages = computed(() =>
  Math.ceil(sortedEvents.value.length / EVENT_PAGE_SIZE)
)

// 현재 페이지의 10개
const pagedEvents = computed(() => {
  const startIdx = (eventPage.value - 1) * EVENT_PAGE_SIZE
  return sortedEvents.value.slice(startIdx, startIdx + EVENT_PAGE_SIZE)
})

// 축제 카드 클릭 -> 지도 이동 + 마커 클릭(정보창)
function focusEvent(ev) {
  if (!map) return

  const entry = markers.find(({ item }) => item.contentid === ev.contentid)
  if (!entry) return

  map.setLevel(4)
  map.panTo(entry.marker.getPosition())
  kakaoRef.maps.event.trigger(entry.marker, 'click')

  // 목록이 지도 아래에 있으므로 지도가 보이도록 스크롤
  mapContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// ---------------------------------
// 초기화
// ---------------------------------

onMounted(async () => {
  try {
    const kakao = await loadKakaoMap()
    kakaoRef = kakao

    // 1) 일단 fallback 좌표로 지도를 먼저 생성
    map = new kakao.maps.Map(mapContainer.value, {
      center: new kakao.maps.LatLng(FALLBACK_CENTER.lat, FALLBACK_CENTER.lng),
      level: 10 // 숫자가 클수록 넓게 보임
    })

    // 줌 컨트롤 추가 (우측)
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT)

    // 정보창은 하나만 만들어 재사용 (다른 마커 클릭 시 내용 교체)
    infoWindow = new kakao.maps.InfoWindow({ removable: true })

    // 지도 빈 곳 클릭 시 정보창 닫기
    kakao.maps.event.addListener(map, 'click', () => infoWindow.close())

    // 2) 주소 -> 좌표 변환 후 정확한 위치로 중심 이동
    const geocoder = new kakao.maps.services.Geocoder()

    geocoder.addressSearch(CENTER_ADDRESS, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result.length > 0) {
        map.setCenter(new kakao.maps.LatLng(result[0].y, result[0].x))
      }
      // 변환 실패 시에는 fallback 중심 그대로 유지
    })

    // 3) 초기 카테고리(관광지) 마커 로드
    await loadCategoryMarkers(selectedCategory.value)

    // 4) 다른 페이지에서 /map?q=검색어 로 진입한 경우
    //    (마운트 시점에는 watch가 안 잡히므로 여기서 직접 실행)
    if (route.query.q) {
      await searchAndFocus(route.query.q)
    }
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

.category-btn.active{

    background:#A47551;

    color:white;

}

/* ---------- */

.map-status{

    margin-bottom:14px;

    padding:12px 16px;

    background:#FAF4EB;

    border-radius:12px;

    font-size:13.5px;

    color:#8A5A33;

    font-weight:600;

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
/* 축제 일정 */
/* ---------- */

.festival-card{

    background:#FFFDFA;

    border:1px solid #EDE3D6;

    border-radius:20px;

    padding:25px;

    box-shadow:0 6px 20px rgba(120, 90, 60, .06);

}

.festival-title{

    color:#A47551;

    font-size:24px;

    margin-bottom:8px;

}

.festival-desc{

    color:#8A7A68;

    font-size:14px;

    margin-bottom:20px;

}

.festival-list{

    display:flex;

    flex-direction:column;

    gap:12px;

}

.festival-item{

    display:flex;

    align-items:center;

    gap:16px;

    padding:12px;

    border:1px solid #EDE3D6;

    border-radius:14px;

    background:#FFFDFA;

    cursor:pointer;

    transition:.25s;

}

.festival-item:hover{

    background:#FAF4EB;

    transform:translateY(-2px);

    box-shadow:0 6px 16px rgba(120, 90, 60, .1);

}

.festival-img{

    width:96px;

    height:72px;

    object-fit:cover;

    border-radius:10px;

    flex-shrink:0;

}

.festival-noimg{

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:30px;

    background:#F3E9DC;

}

.festival-info{

    min-width:0;

}

.festival-info h3{

    font-size:16px;

    color:#4A3826;

    margin:6px 0 4px;

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

}

.festival-date{

    font-size:13px;

    color:#8A7A68;

}

.festival-status{

    display:inline-block;

    padding:3px 10px;

    border-radius:999px;

    font-size:11.5px;

    font-weight:700;

}

.status-ing{

    background:#A47551;

    color:white;

}

.status-soon{

    background:#F3E9DC;

    color:#8A5A33;

}

.status-done{

    background:#EEE9E2;

    color:#A79B8C;

}

.status-none{

    background:#FAF4EB;

    color:#B4A48F;

}

.festival-pagination{

    display:flex;

    justify-content:center;

    flex-wrap:wrap;

    gap:8px;

    margin-top:20px;

}

.festival-pagination button{

    min-width:36px;

    padding:8px 12px;

    border-radius:10px;

    background:#F3E9DC;

    color:#8A5A33;

    font-size:13px;

    font-weight:600;

}

.festival-pagination button:hover:not(:disabled){

    background:#EBDCC7;

}

.festival-pagination button.active{

    background:#A47551;

    color:white;

}

.festival-pagination button:disabled{

    opacity:.4;

    cursor:default;

    transform:none;

}

/* ---------- */

@media(max-width:900px){

.category-card{

grid-template-columns:repeat(2,1fr);

}

.map-placeholder,
.map-area{

height:350px;

}

.festival-img{

width:76px;

height:60px;

}

}

</style>
<style>

.map-area img {
  display: inline;
  width: auto;
  max-width: none;
}
</style>