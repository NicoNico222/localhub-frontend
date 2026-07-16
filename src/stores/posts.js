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

export const writableCategories = categories.filter(c => c !== '전체')


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
    content: raw.content, 
    author: raw.nickname,
    views: raw.view_count,
    date: formatDate(raw.created_at)
  }
}

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

export async function fetchPostDetail(id) {
  const { data } = await http.get(`/posts/${id}`)
  return normalizePost(data)
}


export async function createPost({ category, title, content, author, password }) {
  const { data } = await http.post('/posts/', null, {
    params: { category, title, content, nickname: author, password }
  })
  return data
}


export async function updatePost(id, { category, title, content, password }) {
  const { data } = await http.put(`/posts/${id}`, null, {
    params: { password, category, title, content }
  })
  return data
}


export async function deletePost(id, password) {
  const { data } = await http.delete(`/posts/${id}`, {
    params: { password }
  })
  return data
}