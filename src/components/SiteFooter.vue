<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="site-footer">
    <div class="footer-brand">
      <RouterLink class="logo brand-logo footer-brand-logo" to="/" aria-label="TÂM SEN">
        <img class="brand-logo-primary single-brand-logo" src="/logo-primary.png" alt="TÂM SEN logo" />
      </RouterLink>
    </div>

    <div class="footer-links">
      <div>
        <h4>Về chúng tôi</h4>
        <RouterLink to="/page/about">Giới thiệu</RouterLink>
        <RouterLink to="/page/ebooks">Sách điện tử</RouterLink>
        <RouterLink to="/page/audio">Sách nói</RouterLink>
      </div>
      <div>
        <h4>Thông tin hữu ích</h4>
        <RouterLink to="/page/terms">Thỏa thuận sử dụng</RouterLink>
        <RouterLink to="/page/privacy">Quy định riêng tư</RouterLink>
        <RouterLink to="/page/faq">Câu hỏi thường gặp</RouterLink>
      </div>
      <div>
        <h4>Khám phá</h4>
        <RouterLink to="/library">Thư viện của tôi</RouterLink>
        <RouterLink to="/profile">Hồ sơ của tôi</RouterLink>
        <RouterLink to="/danh-sach/truyen-moi">Truyện mới</RouterLink>
        <RouterLink to="/danh-sach/dang-phat-hanh">Đang phát hành</RouterLink>
        <RouterLink to="/danh-sach/hoan-thanh">Hoàn thành</RouterLink>
      </div>
    </div>
  </footer>
</template>
