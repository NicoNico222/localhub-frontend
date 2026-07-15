// src/api/kakaoMap.js
//
// Kakao Maps JavaScript SDK를 동적으로 로드하는 유틸입니다.
// .env 에 VITE_KAKAO_MAP_KEY=발급받은_JavaScript_키 를 넣어주세요.
// (카카오 개발자 콘솔 > 내 애플리케이션 > 앱 키 > JavaScript 키)
//
// 주의: 콘솔의 [플랫폼 > Web] 에 사이트 도메인
// (예: http://localhost:5173, 배포 주소)을 등록해야 지도가 뜹니다.

let loadPromise = null

export function loadKakaoMap() {
  // 이미 로드된 경우
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve(window.kakao)
  }

  // 로드 진행 중인 경우 같은 Promise 재사용 (중복 script 삽입 방지)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY

    if (!appKey) {
      reject(new Error('VITE_KAKAO_MAP_KEY가 설정되지 않았습니다. .env를 확인하세요.'))
      return
    }

    const script = document.createElement('script')
    // autoload=false: kakao.maps.load 콜백 안에서 안전하게 초기화
    // libraries=services: 주소 -> 좌표 변환(Geocoder) 사용
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Kakao Maps SDK 로드에 실패했습니다. 앱 키와 도메인 등록을 확인하세요.'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}