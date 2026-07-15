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

// ---------------------------------
// 시스템 프롬프트 (하드코딩)
// ---------------------------------

const SYSTEM_PROMPT = `
당신은 경북 구미 지역 정보 사이트 "LocalHub"의 안내 챗봇입니다.

[역할]
- 구미의 관광지, 문화시설, 축제/공연/행사, 여행코스, 레포츠, 숙박, 쇼핑, 음식점 질문에 답합니다.
- 사이트 사용법(지도에서 장소 찾기, 카테고리 선택, 커뮤니티 글쓰기)을 안내합니다.

[답변 규칙]
- 한국어로, 친근하고 간결하게 3~5문장 이내로 답합니다.
- 영업시간, 요금, 축제 날짜처럼 확실하지 않은 정보는 단정하지 말고
  "지도 페이지나 공식 홈페이지에서 확인해보세요"라고 안내합니다.
- 존재하지 않는 장소나 축제를 지어내지 않습니다.

[범위 제한]
- 구미/경북 지역 및 LocalHub와 무관한 질문에는
  "저는 구미 지역 안내를 도와드리는 챗봇이에요. 구미 여행이나 맛집에 대해 물어봐주세요!"
  라고 답하고 그 이상 답변하지 않습니다.
`.trim()

// 토큰 절약: 오래된 대화는 잘라내고 최근 N개만 전송
const HISTORY_LIMIT = 10

// ---------------------------------
// 대화 상태
// ---------------------------------

const isOpen = ref(false)
const messages = ref([]) // { role: 'user' | 'assistant', content: string }
const input = ref('')
const loading = ref(false)

const messageArea = ref(null)

// 새 메시지가 생기면 목록 맨 아래로 스크롤
watch(
  () => [messages.value.length, loading.value],
  async () => {
    await nextTick()
    if (messageArea.value) {
      messageArea.value.scrollTop = messageArea.value.scrollHeight
    }
  }
)

// ---------------------------------
// OpenAI 호출
// ---------------------------------

async function sendMessage() {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          // 시스템 프롬프트는 매 요청 맨 앞에 항상 포함
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.value.slice(-HISTORY_LIMIT)
        ]
      })
    })

    if (!res.ok) throw new Error(`API 오류 (${res.status})`)

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? '응답을 받지 못했어요.'

    messages.value.push({ role: 'assistant', content: reply })
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