// src/stores/posts.js
//
// 게시판 API 연동 모듈입니다.
// 실제 데이터는 FastAPI 백엔드(Cloudtype 배포)에서 가져옵니다.
//
// 주의: 백엔드 posts.py 라우터는 Pydantic 모델을 쓰지 않고
// 단순 타입(str, int 등)의 파라미터를 그대로 받기 때문에,
// FastAPI 규칙상 POST/PUT 요청이라도 body가 아니라
// "쿼리 파라미터"로 전송해야 합니다. (아래 http.post/put 의 params 참고)

import http from '../api/http'

export const categories = [
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

// 글쓰기 모달에서 선택 가능한 카테고리 (전체 제외)
export const writableCategories = categories.filter(c => c !== '전체')

// ---------------------------------
// 서버 응답 -> 프론트에서 쓰던 필드명으로 변환
// (nickname -> author, view_count -> views, created_at -> date)
// ---------------------------------

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function normalizePost(raw) {
  return {
    id: raw.id,
    category: raw.category,
    title: raw.title,
    content: raw.content, // 목록 조회(get_posts)에는 내려오지 않고, 상세 조회에만 존재
    author: raw.nickname,
    views: raw.view_count,
    date: formatDate(raw.created_at)
  }
}

// ---------------------------------
// 목록 조회
// GET /posts/?page=&limit=
// ---------------------------------
export async function fetchPosts(page = 1, limit = 10) {
  const { data } = await http.get('/posts/', { params: { page, limit } })

  return {
    posts: data.data.map(normalizePost),
    page: data.page,
    limit: data.limit,
    totalCount: data.total_count,
    totalPages: data.total_pages
  }
}

// ---------------------------------
// 상세 조회 (호출 시 서버에서 조회수 자동 증가)
// GET /posts/{id}
// ---------------------------------
export async function fetchPostDetail(id) {
  const { data } = await http.get(`/posts/${id}`)
  return normalizePost(data)
}

// ---------------------------------
// 글쓰기
// POST /posts/  (쿼리 파라미터로 전송)
// ---------------------------------
export async function createPost({ category, title, content, author, password }) {
  const { data } = await http.post('/posts/', null, {
    params: { category, title, content, nickname: author, password }
  })
  return data
}

// ---------------------------------
// 수정 (비밀번호 필요)
// PUT /posts/{id}
// 참고: 백엔드가 닉네임 수정은 지원하지 않아 작성자는 수정할 수 없습니다.
// ---------------------------------
export async function updatePost(id, { category, title, content, password }) {
  const { data } = await http.put(`/posts/${id}`, null, {
    params: { password, category, title, content }
  })
  return data
}

// ---------------------------------
// 삭제 (비밀번호 필요)
// DELETE /posts/{id}
// ---------------------------------
export async function deletePost(id, password) {
  const { data } = await http.delete(`/posts/${id}`, {
    params: { password }
  })
  return data
}