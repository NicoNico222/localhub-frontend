<template>
  <div class="community-page">

    <!-- Header -->
    <section class="header-card">

      <div>
        <h1>💬 커뮤니티</h1>
        <p>구미 시민들과 관광객들이 자유롭게 정보를 공유하는 공간입니다.</p>
      </div>

      <button class="write-btn" @click="openWriteModal">
        ✏ 글쓰기
      </button>

    </section>

    <!-- Search -->

    <section class="search-card">

      <input
        v-model="searchQuery"
        type="text"
        placeholder="제목, 내용, 작성자로 검색..."
        @keyup.enter="applySearch"
      />

      <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
        ✕
      </button>

      <button @click="applySearch">
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
        v-for="post in paginatedPosts"
        :key="post.id"
        @click="openDetailModal(post)"
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

      <div v-if="filteredPosts.length === 0" class="empty-row">
        {{ activeSearch ? `"${activeSearch}"에 대한 검색 결과가 없습니다.` : '등록된 게시글이 없습니다.' }}
      </div>

    </section>

    <!-- Pagination -->

    <section v-if="totalPages > 1" class="pagination">

      <button
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        ◀
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        ▶
      </button>

    </section>

    <!-- ===================== -->
    <!-- 글쓰기 모달 -->
    <!-- ===================== -->

    <div v-if="showWriteModal" class="modal-overlay" @click.self="closeWriteModal">

      <div class="modal-card">

        <div class="modal-header">
          <h2>✏ 새 글 작성</h2>
          <button class="modal-close" @click="closeWriteModal">✕</button>
        </div>

        <div class="modal-body">

          <label class="field-label">카테고리</label>
          <div class="category-select-grid">

            <button
              v-for="category in writableCategories"
              :key="category"
              class="category-chip"
              :class="{ active: writeForm.category === category }"
              @click="writeForm.category = category"
            >
              {{ category }}
            </button>

          </div>

          <label class="field-label">제목</label>
          <input
            v-model="writeForm.title"
            type="text"
            class="modal-input"
            placeholder="제목을 입력하세요"
          />

          <label class="field-label">내용</label>
          <textarea
            v-model="writeForm.content"
            class="modal-textarea"
            placeholder="내용을 입력하세요"
          ></textarea>

          <div class="field-row">

            <div class="field-col">
              <label class="field-label">작성자</label>
              <input
                v-model="writeForm.author"
                type="text"
                class="modal-input"
                placeholder="닉네임"
              />
            </div>

            <div class="field-col">
              <label class="field-label">비밀번호</label>
              <input
                v-model="writeForm.password"
                type="password"
                class="modal-input"
                placeholder="수정/삭제 시 사용"
              />
            </div>

          </div>

          <p v-if="writeError" class="form-error">{{ writeError }}</p>

        </div>

        <div class="modal-footer">
          <button class="btn-ghost" @click="closeWriteModal">취소</button>
          <button class="btn-solid" @click="submitWrite">등록</button>
        </div>

      </div>

    </div>

    <!-- ===================== -->
    <!-- 게시글 상세 / 수정 모달 -->
    <!-- ===================== -->

    <div v-if="showDetailModal && selectedPost" class="modal-overlay" @click.self="closeDetailModal">

      <div class="modal-card">

        <div class="modal-header">
          <h2>{{ editMode ? '✏ 게시글 수정' : '📄 게시글 상세' }}</h2>
          <button class="modal-close" @click="closeDetailModal">✕</button>
        </div>

        <div class="modal-body">

          <!-- ---------- 조회 모드 ---------- -->
          <template v-if="!editMode">

            <div class="detail-meta">
              <span class="category-tag">{{ selectedPost.category }}</span>
              <span class="detail-date">{{ selectedPost.date }}</span>
            </div>

            <h3 class="detail-title">{{ selectedPost.title }}</h3>

            <div class="detail-sub">
              <span>작성자 {{ selectedPost.author }}</span>
              <span>조회수 {{ selectedPost.views }}</span>
            </div>

            <p class="detail-content">{{ selectedPost.content }}</p>

            <!-- 비밀번호 확인 (수정/삭제 전) -->
            <div v-if="passwordStage" class="password-check">

              <label class="field-label">
                비밀번호 확인 ({{ passwordStage === 'edit' ? '수정' : '삭제' }})
              </label>

              <input
                v-model="passwordInput"
                type="password"
                class="modal-input"
                placeholder="작성 시 입력한 비밀번호"
                @keyup.enter="confirmPassword"
              />

              <p v-if="passwordError" class="form-error">{{ passwordError }}</p>

              <div class="password-check-actions">
                <button class="btn-ghost" @click="cancelPasswordCheck">취소</button>
                <button class="btn-solid" @click="confirmPassword">확인</button>
              </div>

            </div>

          </template>

          <!-- ---------- 수정 모드 ---------- -->
          <template v-else>

            <label class="field-label">카테고리</label>
            <div class="category-select-grid">

              <button
                v-for="category in writableCategories"
                :key="category"
                class="category-chip"
                :class="{ active: editForm.category === category }"
                @click="editForm.category = category"
              >
                {{ category }}
              </button>

            </div>

            <label class="field-label">제목</label>
            <input
              v-model="editForm.title"
              type="text"
              class="modal-input"
            />

            <label class="field-label">내용</label>
            <textarea
              v-model="editForm.content"
              class="modal-textarea"
            ></textarea>

            <label class="field-label">작성자</label>
            <input
              v-model="editForm.author"
              type="text"
              class="modal-input"
            />

            <p v-if="writeError" class="form-error">{{ writeError }}</p>

          </template>

        </div>

        <div class="modal-footer">

          <template v-if="!editMode">
            <button class="btn-ghost danger" @click="startPasswordCheck('delete')">삭제</button>
            <button class="btn-solid" @click="startPasswordCheck('edit')">수정</button>
          </template>

          <template v-else>
            <button class="btn-ghost" @click="cancelEdit">취소</button>
            <button class="btn-solid" @click="submitEdit">저장</button>
          </template>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>

import { ref, reactive, computed } from 'vue'
import {
  posts,
  categories,
  writableCategories,
  addPost,
  updatePost,
  removePost,
  incrementViews,
  verifyPassword
} from '../stores/posts'

// ---------------------------------
// 검색
// ---------------------------------

const searchQuery = ref('')
const activeSearch = ref('')

const filteredPosts = computed(() => {
  const q = activeSearch.value.trim().toLowerCase()

  if (!q) return posts

  return posts.filter(post =>
    post.title.toLowerCase().includes(q) ||
    post.content.toLowerCase().includes(q) ||
    post.author.toLowerCase().includes(q)
  )
})

function applySearch() {
  activeSearch.value = searchQuery.value
  currentPage.value = 1
}

function clearSearch() {
  searchQuery.value = ''
  activeSearch.value = ''
  currentPage.value = 1
}

// ---------------------------------
// 페이지네이션 (10개씩)
// ---------------------------------

const postsPerPage = 10
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPosts.value.length / postsPerPage))
)

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  return filteredPosts.value.slice(start, start + postsPerPage)
})

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// ---------------------------------
// 글쓰기 모달
// ---------------------------------

const showWriteModal = ref(false)
const writeError = ref('')

const writeForm = reactive({
  category: '',
  title: '',
  content: '',
  author: '',
  password: ''
})

function openWriteModal() {
  writeForm.category = ''
  writeForm.title = ''
  writeForm.content = ''
  writeForm.author = ''
  writeForm.password = ''
  writeError.value = ''
  showWriteModal.value = true
}

function closeWriteModal() {
  showWriteModal.value = false
}

function submitWrite() {

  if (!writeForm.category) {
    writeError.value = '카테고리를 선택해주세요.'
    return
  }

  if (!writeForm.title.trim() || !writeForm.content.trim() || !writeForm.author.trim() || !writeForm.password.trim()) {
    writeError.value = '모든 항목을 입력해주세요.'
    return
  }

  addPost({
    category: writeForm.category,
    title: writeForm.title.trim(),
    content: writeForm.content.trim(),
    author: writeForm.author.trim(),
    password: writeForm.password
  })

  searchQuery.value = ''
  activeSearch.value = ''
  currentPage.value = 1
  closeWriteModal()
}

// ---------------------------------
// 상세 / 수정 / 삭제 모달
// ---------------------------------

const showDetailModal = ref(false)
const selectedPost = ref(null)

const editMode = ref(false)
const editForm = reactive({
  category: '',
  title: '',
  content: '',
  author: ''
})

const passwordStage = ref(null) // null | 'edit' | 'delete'
const passwordInput = ref('')
const passwordError = ref('')

function openDetailModal(post) {
  selectedPost.value = post
  incrementViews(post.id)
  editMode.value = false
  passwordStage.value = null
  passwordInput.value = ''
  passwordError.value = ''
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedPost.value = null
  editMode.value = false
  passwordStage.value = null
}

function startPasswordCheck(stage) {
  passwordStage.value = stage
  passwordInput.value = ''
  passwordError.value = ''
}

function cancelPasswordCheck() {
  passwordStage.value = null
  passwordInput.value = ''
  passwordError.value = ''
}

function confirmPassword() {

  if (!verifyPassword(selectedPost.value.id, passwordInput.value)) {
    passwordError.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  if (passwordStage.value === 'edit') {
    editForm.category = selectedPost.value.category
    editForm.title = selectedPost.value.title
    editForm.content = selectedPost.value.content
    editForm.author = selectedPost.value.author
    editMode.value = true
    passwordStage.value = null
  } else if (passwordStage.value === 'delete') {
    handleDelete()
  }
}

function cancelEdit() {
  editMode.value = false
}

function submitEdit() {

  if (!editForm.category || !editForm.title.trim() || !editForm.content.trim() || !editForm.author.trim()) {
    writeError.value = '모든 항목을 입력해주세요.'
    return
  }

  updatePost(selectedPost.value.id, {
    category: editForm.category,
    title: editForm.title.trim(),
    content: editForm.content.trim(),
    author: editForm.author.trim()
  })

  writeError.value = ''
  editMode.value = false
}

function handleDelete() {

  removePost(selectedPost.value.id)

  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }

  closeDetailModal()
}

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

background:#FFFDFA;

border:1px solid #EDE3D6;

padding:35px;

border-radius:20px;

box-shadow:0 6px 20px rgba(120, 90, 60, .06);

}

.header-card h1{

color:#A47551;

margin-bottom:10px;

}

.header-card p{

color:#8A7A68;

}

.write-btn{

background:#A47551;

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

background:#8F6242;

transform:translateY(-2px);

}

/* Search */

.search-card{

display:flex;

gap:15px;

background:#FFFDFA;

border:1px solid #EDE3D6;

padding:25px;

border-radius:20px;

box-shadow:0 6px 20px rgba(120, 90, 60, .06);

}

.search-card input{

flex:1;

padding:15px;

border:none;

background:#FAF4EB;

border-radius:12px;

font-size:15px;

outline:none;

}

.search-card button{

background:#A47551;

color:white;

border:none;

padding:0 28px;

border-radius:12px;

cursor:pointer;

}

.search-card button:hover{

background:#8F6242;

}

.clear-btn{

background:#F3E9DC !important;

color:#8A5A33 !important;

padding:0 18px !important;

}

.clear-btn:hover{

background:#EBDCC7 !important;

}

.empty-row{

padding:40px 20px;

text-align:center;

color:#8A7A68;

font-size:14px;

}

/* Category */

.category-card{

display:flex;

flex-wrap:wrap;

gap:12px;

background:#FFFDFA;

border:1px solid #EDE3D6;

padding:25px;

border-radius:20px;

box-shadow:0 6px 20px rgba(120, 90, 60, .06);

}

.category-card button{

border:none;

background:#F3E9DC;

padding:12px 18px;

border-radius:30px;

cursor:pointer;

color:#8A5A33;

font-weight:600;

transition:.25s;

}

.category-card button:hover{

background:#EBDCC7;

}

/* Table */

.board-card{

background:#FFFDFA;

border:1px solid #EDE3D6;

border-radius:20px;

overflow:hidden;

box-shadow:0 6px 20px rgba(120, 90, 60, .06);

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

background:#FAF4EB;

font-weight:700;

color:#4A3826;

}

.table-row{

border-top:1px solid #F0E8DC;

transition:.25s;

cursor:pointer;

}

.table-row:hover{

background:#FCF8F2;

}

.category{

font-weight:600;

color:#A47551;

}

.title{

font-weight:500;

color:#4A3826;

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

background:#FFFDFA;

border:1px solid #EDE3D6;

border-radius:12px;

cursor:pointer;

box-shadow:0 4px 10px rgba(120, 90, 60, .06);

color:#4A3826;

}

.active{

background:#A47551 !important;

color:white;

border:1px solid #A47551 !important;

}

.pagination button:disabled{

opacity:.4;

cursor:not-allowed;

}

.pagination button:disabled:hover{

transform:none;

}

/* ============================= */
/* 모달 공통 */
/* ============================= */

.modal-overlay{

position:fixed;

inset:0;

background:rgba(74, 56, 38, .35);

display:flex;

align-items:center;

justify-content:center;

z-index:300;

padding:20px;

}

.modal-card{

width:520px;

max-width:100%;

max-height:88vh;

background:#FFFDFA;

border-radius:20px;

box-shadow:0 20px 50px rgba(120, 90, 60, .25);

display:flex;

flex-direction:column;

overflow:hidden;

}

.modal-header{

display:flex;

justify-content:space-between;

align-items:center;

padding:22px 26px;

border-bottom:1px solid #EDE3D6;

background:linear-gradient(135deg, #FBF5EC 0%, #FFFDFA 60%);

}

.modal-header h2{

font-size:18px;

color:#4A3826;

}

.modal-close{

background:none;

border:none;

font-size:16px;

color:#8A7A68;

cursor:pointer;

}

.modal-close:hover{

color:#4A3826;

}

.modal-body{

padding:24px 26px;

overflow-y:auto;

display:flex;

flex-direction:column;

gap:8px;

}

.modal-footer{

display:flex;

justify-content:flex-end;

gap:10px;

padding:18px 26px;

border-top:1px solid #EDE3D6;

background:#FFFDFA;

}

.field-label{

font-size:13px;

font-weight:600;

color:#8A5A33;

margin-top:14px;

margin-bottom:6px;

}

.field-label:first-child{

margin-top:0;

}

.modal-input,
.modal-textarea{

width:100%;

padding:12px 14px;

border:1px solid #EDE3D6;

background:#FAF4EB;

border-radius:12px;

font-size:14px;

outline:none;

transition:.2s;

}

.modal-input:focus,
.modal-textarea:focus{

background:white;

border-color:#D9C4A9;

box-shadow:0 0 0 3px #EBDCC7;

}

.modal-textarea{

min-height:120px;

resize:vertical;

line-height:1.6;

}

.field-row{

display:grid;

grid-template-columns:1fr 1fr;

gap:16px;

}

.category-select-grid{

display:grid;

grid-template-columns:repeat(4, 1fr);

gap:8px;

}

.category-chip{

border:1px solid #E3D5C3;

background:#FFFDFA;

color:#8A5A33;

padding:9px 6px;

border-radius:12px;

font-size:13px;

font-weight:600;

cursor:pointer;

transition:.2s;

}

.category-chip:hover{

background:#F3E9DC;

}

.category-chip.active{

background:#A47551;

border-color:#A47551;

color:white;

}

.form-error{

margin-top:10px;

color:#C1533D;

font-size:13px;

font-weight:600;

}

.btn-ghost{

background:#FFFDFA;

border:1px solid #E3D5C3;

color:#8A5A33;

padding:11px 20px;

border-radius:12px;

font-weight:600;

font-size:14px;

cursor:pointer;

transition:.2s;

}

.btn-ghost:hover{

background:#F3E9DC;

}

.btn-ghost.danger{

border-color:#EAC5BB;

color:#C1533D;

}

.btn-ghost.danger:hover{

background:#FBEAE6;

}

.btn-solid{

background:#A47551;

border:none;

color:white;

padding:11px 24px;

border-radius:12px;

font-weight:600;

font-size:14px;

cursor:pointer;

transition:.2s;

}

.btn-solid:hover{

background:#8F6242;

}

/* 상세보기 */

.detail-meta{

display:flex;

align-items:center;

gap:10px;

}

.detail-date{

font-size:13px;

color:#8A7A68;

}

.detail-title{

margin-top:14px;

font-size:20px;

color:#4A3826;

line-height:1.4;

}

.detail-sub{

margin-top:10px;

display:flex;

gap:16px;

font-size:13px;

color:#8A7A68;

}

.detail-content{

margin-top:18px;

padding-top:18px;

border-top:1px solid #EDE3D6;

font-size:14.5px;

line-height:1.8;

color:#4A3826;

white-space:pre-wrap;

}

.password-check{

margin-top:20px;

padding:18px;

background:#FAF4EB;

border-radius:14px;

border:1px solid #EDE3D6;

}

.password-check-actions{

margin-top:12px;

display:flex;

justify-content:flex-end;

gap:8px;

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

.field-row{

grid-template-columns:1fr;

}

.category-select-grid{

grid-template-columns:repeat(2, 1fr);

}

}

</style>