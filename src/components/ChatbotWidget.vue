<template>

  <!-- 화면 우하단에 고정되는 챗봇 위젯 -->
  <div class="chatbot">

    <!-- 채팅 패널 -->
    <Transition name="panel">

      <div v-if="isOpen" class="chat-panel">

        <!-- 헤더 -->
        <div class="chat-header">

          <div class="chat-header-info">

            <span class="chat-avatar">🤖</span>

            <div>
              <strong>LocalHub 도우미</strong>
              <p>구미 여행 · 맛집 · 축제 안내</p>
            </div>

          </div>

          <button
            class="chat-close"
            aria-label="챗봇 닫기"
            @click="isOpen = false"
          >
            ✕
          </button>

        </div>

        <!-- 메시지 목록 -->
        <div ref="messageArea" class="chat-messages">

          <!-- 첫 안내 말풍선 -->
          <div class="msg msg-bot">
            안녕하세요! 구미 지역 안내 챗봇이에요.
            관광지, 맛집, 축제 등 궁금한 걸 물어봐주세요 😊
          </div>

          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="msg"
            :class="msg.role === 'user' ? 'msg-user' : 'msg-bot'"
          >
            {{ msg.content }}
          </div>

          <!-- 응답 대기 표시 -->
          <div v-if="loading" class="msg msg-bot msg-typing">
            <span></span><span></span><span></span>
          </div>

        </div>

        <!-- 입력 영역 -->
        <div class="chat-input">

          <input
            v-model="input"
            type="text"
            placeholder="예: 금오산 근처 맛집 알려줘"
            :disabled="loading"
            @keyup.enter="sendMessage"
          />

          <button
            class="chat-send"
            :disabled="loading || !input.trim()"
            @click="sendMessage"
          >
            전송
          </button>

        </div>

      </div>

    </Transition>

    <!-- 토글 버튼 -->
    <button
      class="chat-toggle"
      :aria-label="isOpen ? '챗봇 닫기' : '챗봇 열기'"
      @click="isOpen = !isOpen"
    >
      {{ isOpen ? '✕' : '💬' }}
    </button>

  </div>

</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import http from '../api/http'



const SYSTEM_PROMPT = `
당신은 경북 구미 지역 정보 사이트 "LocalHub"의 안내 챗봇입니다.

[역할]
- 구미의 관광지, 문화시설, 축제/공연/행사, 여행코스, 레포츠, 숙박, 쇼핑, 음식점 질문에 답합니다.
- 커뮤니티 게시글 검색도 도와줍니다.
- 답변에 필요한 정보가 있으면 반드시 제공된 도구(function)를 호출해서
  실제 데이터를 확인한 뒤 답하세요. 도구를 쓰지 않고 추측으로 답하지 마세요.

[답변 규칙]
- 한국어로, 친근하고 간결하게 답합니다.
- 도구 조회 결과에 없는 장소나 축제는 지어내지 않습니다.
- 조회 결과가 비어있으면 "관련 정보를 찾지 못했어요"라고 솔직히 답합니다.

[범위 제한]
- 구미/경북 지역 및 LocalHub와 무관한 질문에는
  "저는 구미 지역 안내를 도와드리는 챗봇이에요. 구미 여행이나 맛집에 대해 물어봐주세요!"
  라고 답하고 그 이상 답변하지 않습니다.
`.trim()

const HISTORY_LIMIT = 10
const CATEGORY_KEYS = [
  'tourist', 'leports', 'culture', 'shopping', 'room', 'course', 'food', 'event'
]



const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_places',
      description: '구미 지역의 관광지/문화시설/축제/여행코스/레포츠/숙박/쇼핑/음식점 데이터를 카테고리별로 검색합니다.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: CATEGORY_KEYS, description: '조회할 데이터 카테고리' },
          keyword: { type: 'string', description: "장소명 또는 주소에 포함될 검색어 (예: '금오산'). 없으면 전체 반환" }
        },
        required: ['category']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_festival_schedule',
      description: '구미 지역 축제/공연/행사 일정을 조회합니다. 오늘 날짜 기준 진행중/예정 필터가 가능합니다.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ongoing', 'upcoming', 'all'], description: 'ongoing=진행중, upcoming=예정, all=전체(기본값)' },
          keyword: { type: 'string', description: '행사명/주소에 포함될 검색어' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_community_posts',
      description: 'LocalHub 커뮤니티 게시판에서 제목에 특정 키워드가 포함된 게시글을 검색합니다.',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '검색어' }
        },
        required: ['keyword']
      }
    }
  }
]


function trimItem(it) {
  return {
    title: it.title,
    addr1: it.addr1,
    tel: it.tel,
    mapx: it.mapx,
    mapy: it.mapy
  }
}

function filterByKeyword(items, keyword) {
  if (!keyword) return items
  const kw = keyword.trim()
  return items.filter(it => (it.title || '').includes(kw) || (it.addr1 || '').includes(kw))
}

async function toolSearchPlaces({ category, keyword }) {
  const { data } = await http.get(`/data/${category}`)
  const items = filterByKeyword(data.items || [], keyword)
  return { count: items.length, items: items.slice(0, 8).map(trimItem) }
}

async function toolGetFestivalSchedule({ status = 'all', keyword } = {}) {
  const { data } = await http.get('/data/event')
  let items = filterByKeyword(data.items || [], keyword)

  const today = new Date()
  const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`

  if (status === 'ongoing') {
    items = items.filter(it => it.eventstartdate && it.eventenddate && it.eventstartdate <= todayStr && todayStr <= it.eventenddate)
  } else if (status === 'upcoming') {
    items = items.filter(it => it.eventstartdate && it.eventstartdate > todayStr)
  }

  const result = items.slice(0, 8).map(it => ({
    title: it.title,
    addr1: it.addr1,
    eventstartdate: it.eventstartdate,
    eventenddate: it.eventenddate,
    eventplace: it.eventplace
  }))

  return { count: items.length, items: result }
}

async function toolSearchCommunityPosts({ keyword }) {
  const { data } = await http.get('/posts/', { params: { page: 1, limit: 100 } })
  const kw = (keyword || '').trim()
  const matched = data.data.filter(p => (p.title || '').includes(kw))

  const items = matched.slice(0, 8).map(p => ({
    id: p.id,
    category: p.category,
    title: p.title,
    nickname: p.nickname
  }))

  return { count: matched.length, items }
}

const FUNCTION_MAP = {
  search_places: toolSearchPlaces,
  get_festival_schedule: toolGetFestivalSchedule,
  search_community_posts: toolSearchCommunityPosts
}



const isOpen = ref(false)
const messages = ref([]) 
const input = ref('')
const loading = ref(false)

const messageArea = ref(null)

watch(
  () => [messages.value.length, loading.value],
  async () => {
    await nextTick()
    if (messageArea.value) {
      messageArea.value.scrollTop = messageArea.value.scrollHeight
    }
  }
)



async function callOpenAI(conversation) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-5-mini', 
      messages: conversation,
      tools: TOOLS
    })
  })

  if (!res.ok) throw new Error(`API 오류 (${res.status})`)
  const data = await res.json()
  return data.choices?.[0]?.message
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true

  try {
    const conversation = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.value.slice(-HISTORY_LIMIT).map(m => ({ role: m.role, content: m.content }))
    ]

    let finalReply = null

    for (let i = 0; i < 4; i++) {
      const message = await callOpenAI(conversation)
      conversation.push(message)

      const toolCalls = message.tool_calls
      if (!toolCalls) {
        finalReply = message.content ?? '응답을 받지 못했어요.'
        break
      }

      for (const call of toolCalls) {
        const fn = FUNCTION_MAP[call.function.name]
        let result

        try {
          const args = JSON.parse(call.function.arguments || '{}')
          result = fn ? await fn(args) : { error: '알 수 없는 함수' }
        } catch (err) {
          result = { error: String(err) }
        }

        conversation.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result)
        })
      }
    }

    messages.value.push({
      role: 'assistant',
      content: finalReply ?? '죄송해요, 답변 생성이 지연되고 있어요. 다시 시도해주세요.'
    })
  } catch (e) {
    console.error(e)
    messages.value.push({
      role: 'assistant',
      content: '죄송해요, 잠시 오류가 발생했어요. 다시 시도해주세요.'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>

.chatbot{

    position:fixed;

    right:24px;

    bottom:24px;

    z-index:1000;

    display:flex;

    flex-direction:column;

    align-items:flex-end;

    gap:12px;

}

/* ---------------------- */
/* Toggle Button */
/* ---------------------- */

.chat-toggle{

    width:56px;

    height:56px;

    border-radius:50%;

    background:#A47551;

    color:white;

    font-size:22px;

    box-shadow:0 8px 24px rgba(120, 90, 60, .3);

    display:flex;

    justify-content:center;

    align-items:center;

}

.chat-toggle:hover{

    background:#8F6242;

}

/* ---------------------- */
/* Panel */
/* ---------------------- */

.chat-panel{

    width:400px;

    height:min(600px, calc(100vh - 120px));

    background:#FFFDFA;

    border:1px solid #EDE3D6;

    border-radius:20px;

    box-shadow:0 12px 36px rgba(120, 90, 60, .18);

    display:flex;

    flex-direction:column;

    overflow:hidden;

}

/* 열림/닫힘 애니메이션 */

.panel-enter-active,
.panel-leave-active{

    transition:.25s ease;

}

.panel-enter-from,
.panel-leave-to{

    opacity:0;

    transform:translateY(12px) scale(.97);

}

@media (prefers-reduced-motion: reduce){

.panel-enter-active,
.panel-leave-active{

    transition:none;

}

}

/* ---------------------- */
/* Header */
/* ---------------------- */

.chat-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:14px 16px;

    background:#A47551;

    color:white;

}

.chat-header-info{

    display:flex;

    align-items:center;

    gap:10px;

}

.chat-avatar{

    width:36px;

    height:36px;

    border-radius:50%;

    background:rgba(255,255,255,.2);

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:18px;

}

.chat-header-info strong{

    font-size:14px;

}

.chat-header-info p{

    font-size:11.5px;

    opacity:.85;

}

.chat-close{

    background:transparent;

    color:white;

    font-size:14px;

    padding:6px;

}

.chat-close:hover{

    transform:none;

    opacity:.75;

}

/* ---------------------- */
/* Messages */
/* ---------------------- */

.chat-messages{

    flex:1;

    overflow-y:auto;

    padding:16px;

    display:flex;

    flex-direction:column;

    gap:10px;

    background:#FAF6F0;

}

.msg{

    max-width:82%;

    padding:11px 15px;

    font-size:14.5px;

    line-height:1.55;

    white-space:pre-wrap;

    word-break:break-word;

}

.msg-bot{

    align-self:flex-start;

    background:white;

    border:1px solid #EDE3D6;

    color:#4A3826;

    border-radius:14px 14px 14px 4px;

}

.msg-user{

    align-self:flex-end;

    background:#A47551;

    color:white;

    border-radius:14px 14px 4px 14px;

}

/* 응답 대기 점 세 개 */

.msg-typing{

    display:flex;

    gap:5px;

    padding:14px;

}

.msg-typing span{

    width:7px;

    height:7px;

    border-radius:50%;

    background:#C7AC8B;

    animation:bounce 1.1s infinite;

}

.msg-typing span:nth-child(2){

    animation-delay:.15s;

}

.msg-typing span:nth-child(3){

    animation-delay:.3s;

}

@keyframes bounce{

0%, 60%, 100%{

transform:translateY(0);

}

30%{

transform:translateY(-5px);

}

}

@media (prefers-reduced-motion: reduce){

.msg-typing span{

    animation:none;

}

}

/* ---------------------- */
/* Input */
/* ---------------------- */

.chat-input{

    display:flex;

    gap:8px;

    padding:12px;

    background:#FFFDFA;

    border-top:1px solid #EDE3D6;

}

.chat-input input{

    flex:1;

    min-width:0;

    padding:10px 14px;

    border:1px solid #EDE3D6;

    border-radius:12px;

    background:#FAF4EB;

    font-size:13px;

    transition:.3s;

}

.chat-input input:focus{

    background:white;

    box-shadow:0 0 0 3px #EBDCC7;

}

.chat-send{

    padding:10px 16px;

    border-radius:12px;

    background:#A47551;

    color:white;

    font-size:13px;

    font-weight:600;

    white-space:nowrap;

}

.chat-send:hover:not(:disabled){

    background:#8F6242;

}

.chat-send:disabled{

    opacity:.45;

    cursor:default;

    transform:none;

}

/* ---------------------- */
/* Mobile */
/* ---------------------- */

@media (max-width:900px){

.chatbot{

    right:16px;

    bottom:16px;

}

.chat-panel{

    width:calc(100vw - 32px);

    max-width:400px;

    height:min(540px, calc(100vh - 110px));

}

}

</style>