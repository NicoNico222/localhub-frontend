// src/api/http.js
//
// 백엔드(FastAPI, Cloudtype 배포) 호출용 axios 인스턴스입니다.
// 로컬에서 다른 서버를 바라보고 싶으면 .env.local 에
// VITE_API_BASE_URL=http://localhost:8000 처럼 덮어써서 사용하세요.

import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://port-0-localhub-backend-mpdltcf63345e3f5.sel3.cloudtype.app'

const http = axios.create({
  baseURL,
  timeout: 15000
})

export default http