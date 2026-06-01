<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import { useLibraryStore } from "../stores/library";
import { chapterLabel, formatRelativeDate, statusLabel } from "../utils/format";

const libraryStore = useLibraryStore();
const { favorites, readingHistory, searches } = storeToRefs(libraryStore);
const latestReads = computed(() => readingHistory.value.slice(0, 12));
</script>

<template>
  <main class="container page-library">
    <section class="library-hero">
      <div>
        <div class="detail-breadcrumb">
          <RouterLink to="/">Trang chủ</RouterLink>
          <span>/</span>
          <span>Thư viện của tôi</span>
        </div>
        <span class="eyebrow">PINIA + LOCAL STORAGE</span>
        <h1>Thư viện cá nhân</h1>
        <p>
          Trang này đang lấy dữ liệu thật từ store cục bộ: truyện yêu thích, chap vừa đọc
          và lịch sử tìm kiếm gần đây.
        </p>
      </div>

      <div class="library-hero-card">
        <strong>{{ favorites.length }}</strong>
        <span>truyện yêu thích</span>
        <strong>{{ readingHistory.length }}</strong>
        <span>mốc đọc đã lưu</span>
      </div>
    </section>

    <section class="library-layout">
      <section class="detail-panel">
        <div class="section-heading">
          <h3>Truyện yêu thích</h3>
        </div>
        <div v-if="!favorites.length" class="state-panel compact">
          <p>Chưa có truyện nào được lưu. Bạn có thể bấm nút yêu thích trong trang chi tiết.</p>
        </div>
        <div v-else class="book-grid five-col api-grid">
          <article v-for="item in favorites" :key="item.slug" class="book-card api-book-card">
            <RouterLink :to="{ name: 'comic-detail', params: { slug: item.slug } }">
              <div class="cover api-cover">
                <img :src="item.cover" :alt="item.name" loading="lazy" />
                <span class="badge vip">{{ statusLabel(item.status) }}</span>
                <strong>{{ item.name }}</strong>
              </div>
              <h4>{{ item.name }}</h4>
              <p class="api-card-meta">{{ formatRelativeDate(item.savedAt) }}</p>
            </RouterLink>
          </article>
        </div>
      </section>

      <section class="detail-panel">
        <div class="section-heading">
          <h3>Đọc gần đây</h3>
        </div>
        <div v-if="!latestReads.length" class="state-panel compact">
          <p>Chưa có lịch sử đọc nào được lưu.</p>
        </div>
        <div v-else class="chapter-list">
          <RouterLink
            v-for="item in latestReads"
            :key="`${item.slug}-${item.chapterApi}`"
            class="chapter-item chapter-link"
            :to="{
              name: 'reader',
              params: { slug: item.slug },
              query: { api: item.chapterApi, name: item.chapterName },
            }"
          >
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ chapterLabel({ chapter_name: item.chapterName, chapter_title: item.chapterTitle }) }}</p>
            </div>
            <span>{{ formatRelativeDate(item.readAt) }}</span>
          </RouterLink>
        </div>
      </section>

      <section class="detail-panel">
        <div class="section-heading">
          <h3>Tìm kiếm gần đây</h3>
        </div>
        <div v-if="!searches.length" class="state-panel compact">
          <p>Chưa có từ khóa nào được lưu.</p>
        </div>
        <div v-else class="detail-tags library-tags">
          <RouterLink
            v-for="item in searches"
            :key="item.keyword"
            class="tag-pill"
            :to="{ name: 'search', query: { keyword: item.keyword } }"
          >
            {{ item.keyword }}
          </RouterLink>
        </div>
      </section>
    </section>
  </main>
</template>
