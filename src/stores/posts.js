// src/stores/posts.js
//
// 커뮤니티 게시글을 여러 화면(HomeView, CommunityView 등)에서
// 함께 참조할 수 있도록 만든 간단한 반응형 스토어입니다.
// 아직 백엔드가 없으므로 이 배열이 곧 "DB" 역할을 합니다.
// TODO: FastAPI 연동 시 이 파일의 함수들을 axios/fetch 호출로 교체하세요.

import { reactive } from 'vue'

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

// 글쓰기 모달에서 선택 가능한 카테고리 (전체 제외 8개)
export const writableCategories = categories.filter(c => c !== '전체')

export const posts = reactive([

  {
    id: 1,
    category: '관광지',
    title: '금오산 야경 정말 예쁘네요.',
    content: '어제 저녁에 금오산 케이블카 타고 올라가서 야경을 봤는데 정말 예뻤습니다. 다음에 또 가고 싶네요.',
    author: '홍길동',
    password: '1234',
    views: 128,
    date: '2026-07-14'
  },

  {
    id: 2,
    category: '음식점',
    title: '구미역 근처 맛집 추천해주세요.',
    content: '구미역 근처에서 저녁 식사할만한 맛집 아시는 분 계신가요? 추천 부탁드립니다.',
    author: '김철수',
    password: '1234',
    views: 77,
    date: '2026-07-14'
  },

  {
    id: 3,
    category: '축제',
    title: '이번 주말 축제 일정 공유',
    content: '이번 주말 구미에서 열리는 축제 일정 정리해봤습니다. 다들 좋은 시간 보내세요!',
    author: '이영희',
    password: '1234',
    views: 59,
    date: '2026-07-13'
  },

  {
    id: 4,
    category: '쇼핑',
    title: '구미 대형마트 할인 행사',
    content: '이번 주 대형마트에서 할인 행사 크게 하네요. 필요하신 분들은 참고하세요.',
    author: '박민수',
    password: '1234',
    views: 34,
    date: '2026-07-12'
  }

])

let nextId = 5

function todayString() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// 새 게시글 추가 (목록 맨 앞에 삽입)
// TODO: FastAPI POST /api/posts 연동 후 서버 저장으로 교체
export function addPost({ category, title, content, author, password }) {
  const newPost = {
    id: nextId++,
    category,
    title,
    content,
    author,
    password,
    views: 0,
    date: todayString()
  }
  posts.unshift(newPost)
  return newPost
}

// 게시글 수정
// TODO: FastAPI PUT /api/posts/{id} 연동 후 서버 저장으로 교체
export function updatePost(id, { category, title, content, author }) {
  const post = posts.find(p => p.id === id)
  if (!post) return
  post.category = category
  post.title = title
  post.content = content
  post.author = author
}

// 게시글 삭제
// TODO: FastAPI DELETE /api/posts/{id} 연동 후 서버 삭제로 교체
export function removePost(id) {
  const index = posts.findIndex(p => p.id === id)
  if (index !== -1) posts.splice(index, 1)
}

// 조회수 증가
// TODO: FastAPI GET /api/posts/{id} 연동 후 조회수 증가는 서버에서 처리
export function incrementViews(id) {
  const post = posts.find(p => p.id === id)
  if (post) post.views++
}

// 비밀번호 확인
// TODO: FastAPI POST /api/posts/{id}/verify 연동 후 서버 검증으로 교체
export function verifyPassword(id, password) {
  const post = posts.find(p => p.id === id)
  return !!post && post.password === password
}

// 최근 게시글 N개 (HomeView 등에서 사용)
export function getRecentPosts(count = 3) {
  return [...posts]
    .sort((a, b) => b.id - a.id)
    .slice(0, count)
}