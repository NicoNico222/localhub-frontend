let loadPromise = null

export function loadKakaoMap() {
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve(window.kakao)
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY

    if (!appKey) {
      reject(new Error('VITE_KAKAO_MAP_KEY가 설정되지 않았습니다. .env를 확인하세요.'))
      return
    }

    const script = document.createElement('script')
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