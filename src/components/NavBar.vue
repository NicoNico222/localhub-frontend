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

    max-width:1100px;

    height:52px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:0 26px;

    background:white;

    border-radius:14px;

    box-shadow:0 6px 20px rgba(120, 90, 60, .08);

    margin:14px auto 24px;

}

/* ---------------------- */
/* Left */
/* ---------------------- */

.logo-section{

    display:flex;

    align-items:center;

    gap:10px;

}

.logo{

    font-size:19px;

    font-weight:700;

    color:#A47551;

}

.logo:hover{

    color:#8F6242;

}

.region-badge{

    background:#F3E9DC;

    color:#8A5A33;

    padding:5px 11px;

    border-radius:30px;

    font-size:12px;

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

    width:500px;

    max-width:100%;

    padding:8px 14px;

    border:none;

    border-radius:30px;

    background:#FAF4EB;

    outline:none;

    font-size:13px;

    transition:.3s;

}

.search-section input:focus{

    background:white;

    box-shadow:0 0 0 3px #EBDCC7;

}

/* ---------------------- */
/* Right */
/* ---------------------- */

nav{

    display:flex;

    align-items:center;

    gap:20px;

}

.nav-item{

    font-size:14px;

    font-weight:600;

    color:#8A7A68;

    transition:.25s;

    position:relative;

}

.nav-item:hover{

    color:#A47551;

}

.nav-item.router-link-exact-active{
    color:#A47551;
}

.nav-item.router-link-exact-active::after{
    content:"";
    position:absolute;
    left:0;
    bottom:-6px;
    width:100%;
    height:2px;
    background:#A47551;
    border-radius:10px;
}

/* ---------------------- */
/* Mobile */
/* ---------------------- */

@media (max-width:900px){

.navbar{

    flex-direction:column;

    height:auto;

    padding:14px;

    gap:12px;

}

.search-section{

    width:100%;

}

.search-section input{

    width:100%;

}

nav{

    gap:16px;

}

}

</style>