<template>
  <header class="navbar">

    <!-- 왼쪽 -->
    <div class="logo-section">

      <RouterLink to="/" class="logo">
        LocalHub
      </RouterLink>

      <span class="region-badge">
        구미 / 경북
      </span>

    </div>

    <!-- 가운데 -->
    <div class="search-section">

      <input
        type="text"
        placeholder="지역 정보 검색..."
      />

    </div>

    <!-- 오른쪽 -->
    <nav>

      <RouterLink to="/" class="nav-item">
        홈
      </RouterLink>

      <RouterLink to="/map" class="nav-item">
        지도
      </RouterLink>

      <RouterLink to="/community" class="nav-item">
        커뮤니티
      </RouterLink>

    </nav>

  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>

.navbar{

    width:100%;

    height:75px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:0 45px;

    background:white;

    border-radius:18px;

    box-shadow:0 6px 20px rgba(0,0,0,.08);

    margin-top:18px;

    margin-bottom:30px;

}

/* ---------------------- */
/* Left */
/* ---------------------- */

.logo-section{

    display:flex;

    align-items:center;

    gap:14px;

}

.logo{

    font-size:30px;

    font-weight:700;

    color:#5A8DEE;

}

.logo:hover{

    color:#4677d8;

}

.region-badge{

    background:#dbeafe;

    color:#3563c8;

    padding:8px 15px;

    border-radius:30px;

    font-size:14px;

    font-weight:600;

}

/* ---------------------- */
/* Center */
/* ---------------------- */

.search-section{

    flex:1;

    display:flex;

    justify-content:center;

}

.search-section input{

    width:420px;

    max-width:100%;

    padding:13px 18px;

    border:none;

    border-radius:30px;

    background:#f3f7fd;

    outline:none;

    font-size:15px;

    transition:.3s;

}

.search-section input:focus{

    background:white;

    box-shadow:0 0 0 3px #c7ddff;

}

/* ---------------------- */
/* Right */
/* ---------------------- */

nav{

    display:flex;

    align-items:center;

    gap:30px;

}

.nav-item{

    font-size:17px;

    font-weight:600;

    color:#666;

    transition:.25s;

    position:relative;

}

.nav-item:hover{

    color:#5A8DEE;

}

.router-link-active{

    color:#5A8DEE;

}

.router-link-active::after{

    content:"";

    position:absolute;

    left:0;

    bottom:-8px;

    width:100%;

    height:3px;

    background:#5A8DEE;

    border-radius:10px;

}

/* ---------------------- */
/* Mobile */
/* ---------------------- */

@media (max-width:900px){

.navbar{

    flex-direction:column;

    height:auto;

    padding:20px;

    gap:18px;

}

.search-section{

    width:100%;

}

.search-section input{

    width:100%;

}

nav{

    gap:22px;

}

}

</style>