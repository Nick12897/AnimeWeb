<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import { useLibraryStore } from "../stores/library";
import { useAuthStore } from "../stores/auth";
import { formatRelativeDate } from "../utils/format";

const libraryStore = useLibraryStore();
const authStore = useAuthStore();

const { favorites, readingHistory, searches } = storeToRefs(libraryStore);
const { isAuthenticated, userEmail, userName, user } = storeToRefs(authStore);

const latestFavorite = computed(() => favorites.value[0] || null);
const latestRead = computed(() => readingHistory.value[0] || null);
const avatarLabel = computed(() => {
  const source = userName.value || userEmail.value || "TS";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
});
const providerLabel = computed(() => {
  const provider = user.value?.app_metadata?.provider;
  if (!provider) return "Email";
  return provider === "google" ? "Google" : "Email";
});

async function handleSignOut() {
  await authStore.signOut();
}
</script>

<template>
  <main class="container page-profile">
    <section v-if="!isAuthenticated" class="profile-hero profile-auth-empty">
      <div class="profile-user">
        <div class="profile-avatar">TS</div>
        <div>
          <div class="detail-breadcrumb">
            <RouterLink to="/">Trang chủ</RouterLink><span>/</span><span>Hồ sơ của tôi</span>
          </div>
          <span class="eyebrow">TÀI KHOẢN</span>
          <h1>Đăng nhập để đồng bộ hồ sơ</h1>
          <p>
            Hãy đăng nhập bằng email hoặc Google để lưu lịch sử đọc, yêu thích và quản lý tài khoản
            trên nhiều thiết bị.
          </p>
        </div>
      </div>

      <div class="profile-status-card">
        <strong>Bạn chưa đăng nhập</strong>
        <span>Tài khoản Supabase sẽ giúp đồng bộ dữ liệu ổn định hơn localStorage.</span>
        <div class="profile-auth-actions">
          <RouterLink class="dark-btn profile-cta" to="/page/register">Đăng ký</RouterLink>
          <RouterLink class="primary-btn profile-cta" to="/page/login">Đăng nhập</RouterLink>
        </div>
      </div>
    </section>

    <template v-else>
      <section class="profile-hero">
        <div class="profile-user">
          <div class="profile-avatar">{{ avatarLabel }}</div>
          <div>
            <div class="detail-breadcrumb">
              <RouterLink to="/">Trang chủ</RouterLink><span>/</span><span>Hồ sơ của tôi</span>
            </div>
            <span class="eyebrow">TÀI KHOẢN SUPABASE</span>
            <h1>{{ userName }}</h1>
            <p>
              {{ userEmail }}
            </p>
          </div>
        </div>

        <div class="profile-status-card">
          <strong>Đăng nhập bằng {{ providerLabel }}</strong>
          <span>Favorites, lịch sử đọc và tìm kiếm cục bộ vẫn hoạt động song song trong trình duyệt.</span>
          <div class="profile-auth-actions">
            <RouterLink class="primary-btn profile-cta" to="/library">Mở thư viện</RouterLink>
            <button class="dark-btn profile-cta" type="button" @click="handleSignOut">Đăng xuất</button>
          </div>
        </div>
      </section>

      <section class="profile-grid">
        <section class="detail-panel">
          <div class="section-heading"><h3>Thống kê nhanh</h3></div>
          <div class="home-stat-grid profile-stats">
            <article class="home-stat"><strong>{{ favorites.length }}</strong><span>mục yêu thích</span></article>
            <article class="home-stat"><strong>{{ readingHistory.length }}</strong><span>lần đọc đã lưu</span></article>
            <article class="home-stat"><strong>{{ searches.length }}</strong><span>từ khóa gần đây</span></article>
          </div>
        </section>

        <section class="detail-panel">
          <div class="section-heading"><h3>Hoạt động gần nhất</h3></div>
          <div class="settings-list">
            <div class="setting-row">
              <span>Yêu thích mới nhất</span>
              <strong>{{ latestFavorite?.name || "Chưa có" }}</strong>
            </div>
            <div class="setting-row">
              <span>Truyện vừa đọc</span>
              <strong>{{ latestRead?.name || "Chưa có" }}</strong>
            </div>
            <div class="setting-row">
              <span>Thời gian cập nhật</span>
              <strong>{{ latestRead ? formatRelativeDate(latestRead.readAt) : "Chưa có" }}</strong>
            </div>
          </div>
        </section>
      </section>
    </template>
  </main>
</template>
