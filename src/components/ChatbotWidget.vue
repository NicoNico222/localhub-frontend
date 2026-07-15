<template>
  <div class="chatbot-widget">

    <!-- 펼쳐진 대화창 -->
    <transition name="pop">

      <div
        v-if="isOpen"
        class="chat-panel"
      >

        <!-- 헤더 -->
        <div class="chat-header">

          <div class="chat-header-left">

            <span class="bot-avatar">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3 L14.5 9 L21 9.8 L16.2 14.3 L17.5 21 L12 17.6 L6.5 21 L7.8 14.3 L3 9.8 L9.5 9 Z"
                  fill="currentColor"
                />
              </svg>
            </span>

            <div class="chat-header-text">
              <strong>LocalHub 도우미</strong>
              <span>구미 지역 정보 안내</span>
            </div>

          </div>

          <button
            class="close-btn"
            @click="isOpen = false"
          >
            ✕
          </button>

        </div>

        <!-- 대화 내용 -->
        <div class="chat-body" ref="chatBody">

          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="msg-row"
            :class="msg.from"
          >

            <span
              v-if="msg.from === 'bot'"
              class="msg-avatar"
            >
              🍂
            </span>

            <div class="msg-bubble">
              {{ msg.text }}
            </div>

          </div>

          <!-- 응답 대기 표시 -->
          <div v-if="isThinking" class="msg-row bot">

            <span class="msg-avatar">🍂</span>

            <div class="msg-bubble typing">
              <span></span><span></span><span></span>
            </div>

          </div>

          <!-- 예시 질문 칩 -->
          <div class="suggestion-row">

            <button
              v-for="tip in suggestions"
              :key="tip"
              class="suggestion-chip"
              @click="sendSuggestion(tip)"
            >
              {{ tip }}
            </button>

          </div>

        </div>

        <!-- 입력창 -->
        <div class="chat-input">

          <input
            v-model="draft"
            type="text"
            placeholder="궁금한 점을 물어보세요"
            :disabled="isThinking"
            @keyup.enter="sendMessage"
          />

          <button
            class="send-btn"
            :disabled="isThinking"
            @click="sendMessage"
          >
            전송
          </button>

        </div>

      </div>

    </transition>

    <!-- 플로팅 버튼 -->
    <button
      class="fab-btn"
      :class="{ 'is-open': isOpen }"
      @click="isOpen = !isOpen"
    >

      <svg
        v-if="!isOpen"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 21c-.9 0-1.7-.2-2.5-.5L5 21l1.2-3.8A7.9 7.9 0 0 1 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 9-8 9Z"
          fill="currentColor"
        />
        <circle cx="9" cy="12" r="1" fill="#FFFDFA" />
        <circle cx="12" cy="12" r="1" fill="#FFFDFA" />
        <circle cx="15" cy="12" r="1" fill="#FFFDFA" />
      </svg>

      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 6L18 18M18 6L6 18"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
        />
      </svg>

    </button>

  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const isOpen = ref(false)
const draft = ref('')
const isThinking = ref(false)
const chatBody = ref(null)

// 초기 안내 메시지
const messages = ref([
  { from: 'bot', text: 'LocalHub 도우미 챗봇입니다. 궁금한 것을 물어보세요.' }
])

const suggestions = [
  '금오산 관광 코스',
  '구미 맛집 추천',
  '이번 주 축제 일정'
]

// ---------------------------------
// OpenAI API 연동 (프론트 직접 호출)
// ---------------------------------
// .env 에 VITE_OPENAI_API_KEY=sk-... 를 넣어주세요.
// ⚠ 주의: 프론트에서 직접 호출하면 빌드 결과물에 API 키가 노출됩니다.
//    데모/과제용으로만 쓰고, 실서비스라면 FastAPI에 /api/chat 을 만들어
//    서버에서 OpenAI를 호출하는 방식으로 옮기는 것을 권장합니다.

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const SYSTEM_PROMPT = `당신은 "LocalHub 도우미"입니다.
경상북도 구미시와 경북권의 관광지, 문화시설, 축제·공연·행사, 여행코스, 레포츠, 숙박, 쇼핑, 음식점 정보를 안내하는 지역 정보 챗봇입니다.

규칙:
- 한국어로 친절하고 간결하게 답합니다. (답변은 3~5문장 이내를 기본으로)
- 구미/경북 지역과 무관한 질문이면, 지역 정보 안내 챗봇임을 밝히고 정중히 안내를 돌려줍니다.
- 확실하지 않은 정보(운영시간, 요금, 축제 날짜 등)는 단정하지 말고 공식 홈페이지나 전화 확인을 권합니다.`

async function askOpenAI(userText) {
  if (!OPENAI_API_KEY) {
    return 'OpenAI API 키가 설정되지 않았습니다. .env의 VITE_OPENAI_API_KEY를 확인해주세요.'
  }

  const payload = {
    model: 'gpt-5-mini',
    input: userText // 사용자 질문만 전달 (system 프롬프트/히스토리 없음)
  }

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  console.log('OpenAI /responses result:', data)

  // 여러 응답 포맷을 안전하게 추출하는 헬퍼
  function extractText(d) {
    if (!d) return ''
    if (typeof d.output_text === 'string' && d.output_text.trim()) return d.output_text.trim()
    if (Array.isArray(d.output)) {
      const parts = []
      for (const item of d.output) {
        if (typeof item === 'string' && item.trim()) parts.push(item.trim())
        else if (item?.content) {
          const content = item.content
          if (typeof content === 'string' && content.trim()) parts.push(content.trim())
          else if (Array.isArray(content)) {
            for (const c of content) {
              if (typeof c === 'string' && c.trim()) parts.push(c.trim())
              else if (c?.text && c.text.trim()) parts.push(c.text.trim())
            }
          }
        }
      }
      if (parts.length) return parts.join('\n')
    }
    if (d.choices?.[0]?.message?.content) return d.choices[0].message.content
    if (d.choices?.[0]?.text) return d.choices[0].text
    return ''
  }

  const text = extractText(data).trim()
  return text || '답변을 생성하지 못했습니다.'
}

// 대화창 맨 아래로 스크롤임
async function scrollToBottom() {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

async function ask(text) {
  messages.value.push({ from: 'user', text })
  scrollToBottom()

  isThinking.value = true

  try {
    const answer = await askOpenAI(text)
    messages.value.push({ from: 'bot', text: answer })
  } catch (e) {
    console.error(e)
    messages.value.push({
      from: 'bot',
      text: '오류가 발생했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.'
    })
  } finally {
    isThinking.value = false
    scrollToBottom()
  }
}

function sendMessage() {
  const text = draft.value.trim()
  if (!text || isThinking.value) return

  draft.value = ''
  ask(text)
}

function sendSuggestion(tip) {
  if (isThinking.value) return
  ask(tip)
}
</script>

<style scoped>

.chatbot-widget{

    position:fixed;

    right:28px;

    bottom:28px;

    z-index:200;

    display:flex;

    flex-direction:column;

    align-items:flex-end;

    gap:16px;

}

/* ---------------------- */
/* 플로팅 버튼 */
/* ---------------------- */

.fab-btn{

    width:58px;

    height:58px;

    border:none;

    border-radius:20px;

    background:linear-gradient(135deg, #A47551, #8A5A33);

    color:white;

    display:flex;

    align-items:center;

    justify-content:center;

    box-shadow:0 10px 24px rgba(120, 90, 60, .35);

    cursor:pointer;

    transition:.25s;

}

.fab-btn svg{

    width:26px;

    height:26px;

}

.fab-btn:hover{

    transform:translateY(-3px);

    box-shadow:0 14px 28px rgba(120, 90, 60, .4);

}

.fab-btn.is-open{

    background:#8A7A68;

}

/* ---------------------- */
/* 대화창 */
/* ---------------------- */

.chat-panel{

    width:340px;

    max-width:calc(100vw - 40px);

    height:600px;

    max-height:calc(100vh - 100px);

    background:#FFFDFA;

    border:1px solid #EDE3D6;

    border-radius:22px;

    box-shadow:0 16px 40px rgba(120, 90, 60, .2);

    display:flex;

    flex-direction:column;

    overflow:hidden;

}

/* 헤더 */

.chat-header{

    background:linear-gradient(135deg, #A47551, #8A5A33);

    color:white;

    padding:16px 18px;

    display:flex;

    justify-content:space-between;

    align-items:center;

}

.chat-header-left{

    display:flex;

    align-items:center;

    gap:10px;

}

.bot-avatar{

    width:32px;

    height:32px;

    border-radius:10px;

    background:rgba(255,255,255,.18);

    display:flex;

    align-items:center;

    justify-content:center;

}

.bot-avatar svg{

    width:16px;

    height:16px;

    color:#FFE9C7;

}

.chat-header-text{

    display:flex;

    flex-direction:column;

    line-height:1.3;

}

.chat-header-text strong{

    font-size:14px;

}

.chat-header-text span{

    font-size:11px;

    opacity:.85;

}

.close-btn{

    background:none;

    border:none;

    color:white;

    font-size:15px;

    cursor:pointer;

    opacity:.85;

}

.close-btn:hover{

    opacity:1;

}

/* 대화 내용 */

.chat-body{

    flex:1;

    padding:18px;

    overflow-y:auto;

    display:flex;

    flex-direction:column;

    gap:12px;

    background:#FAF6F0;

}

.msg-row{

    display:flex;

    align-items:flex-end;

    gap:8px;

}

.msg-row.user{

    justify-content:flex-end;

}

.msg-avatar{

    width:26px;

    height:26px;

    border-radius:50%;

    background:#F3E9DC;

    display:flex;

    align-items:center;

    justify-content:center;

    font-size:13px;

    flex-shrink:0;

}

.msg-bubble{

    max-width:75%;

    padding:11px 14px;

    border-radius:16px;

    font-size:13.5px;

    line-height:1.5;

}

.msg-row.bot .msg-bubble{

    background:white;

    border:1px solid #EDE3D6;

    color:#4A3826;

    border-bottom-left-radius:4px;
}

.msg-row.user .msg-bubble{

    background:#A47551;

    color:white;

    border-bottom-right-radius:4px;
}

/* 응답 대기 점 3개 애니메이션 */

.msg-bubble.typing{

    display:flex;

    align-items:center;

    gap:5px;

    min-width:52px;
}

.msg-bubble.typing span{

    width:7px;

    height:7px;

    border-radius:50%;

    background:#C7AC8B;

    animation:typing-bounce 1.2s infinite ease-in-out;
}

.msg-bubble.typing span:nth-child(2){

    animation-delay:.15s;
}

.msg-bubble.typing span:nth-child(3){

    animation-delay:.3s;
}

@keyframes typing-bounce{

    0%, 60%, 100%{ transform:translateY(0); opacity:.5; }

    30%{ transform:translateY(-4px); opacity:1; }
}

/* 추천 칩 */

.suggestion-row{

    display:flex;

    flex-wrap:wrap;

    gap:8px;

    padding-left:34px;

}

.suggestion-chip{

    border:1px solid #E3D5C3;

    background:#FFFDFA;

    color:#8A5A33;

    padding:7px 12px;

    border-radius:30px;

    font-size:12px;

    font-weight:600;

    cursor:pointer;

    transition:.2s;
}

.suggestion-chip:hover{

    background:#F3E9DC;
}

/* 입력창 */

.chat-input{

    display:flex;

    gap:8px;

    padding:14px;

    border-top:1px solid #EDE3D6;

    background:#FFFDFA;

}

.chat-input input{

    flex:1;

    padding:10px 14px;

    border:none;

    background:#FAF4EB;

    border-radius:30px;

    font-size:13px;

    outline:none;

}

.send-btn{

    background:#A47551;

    color:white;

    border:none;

    padding:0 18px;

    border-radius:30px;

    font-size:13px;

    font-weight:600;

    cursor:pointer;

    transition:.2s;
}

.send-btn:hover{

    background:#8A5A33;
}

.chat-input input:disabled,
.send-btn:disabled{

    opacity:.6;

    cursor:not-allowed;
}

/* 트랜지션 */

.pop-enter-active,
.pop-leave-active{

    transition:.2s ease;
}

.pop-enter-from,
.pop-leave-to{

    opacity:0;

    transform:translateY(12px) scale(.96);
}

/* ---------------------- */
/* Mobile: 전체 화면 */
/* ---------------------- */

@media (max-width:600px){

.chatbot-widget{

    right:16px;

    bottom:16px;

}

.chat-panel{

    position:fixed;

    inset:0;

    width:100%;

    max-width:100%;

    height:100%;

    max-height:100%;

    border-radius:0;
}

}

</style>