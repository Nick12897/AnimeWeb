<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { RouterLink, useRoute } from "vue-router";
import { fetchCategory, fetchComic, getImageUrl } from "../api/otruyen";
import { useLibraryStore } from "../stores/library";
import {
  chapterLabel,
  formatRelativeDate,
  statusLabel,
  stripHtml,
} from "../utils/format";

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const libraryStore = useLibraryStore();
const { favoriteSlugs } = storeToRefs(libraryStore);

const loading = ref(false);
const error = ref("");
const comicData = ref(null);
const recommendations = ref([]);

const comic = computed(() => comicData.value?.data?.item || null);
const chapters = computed(() =>
  comic.value?.chapters?.flatMap((server) =>
    server.server_data.map((chapter) => ({
      ...chapter,
      server_name: server.server_name,
    }))
  ) || []
);

const isFavorite = computed(() => favoriteSlugs.value.includes(props.slug));

function toggleFavorite() {
  if (!comic.value) return;
  libraryStore.toggleFavorite(comic.value);
}

async function loadComic() {
  try {
    loading.value = true;
    error.value = "";
    comicData.value = await fetchComic(props.slug);

    const firstCategory = comicData.value?.data?.item?.category?.[0];
    if (firstCategory?.slug) {
      const categoryResponse = await fetchCategory(firstCategory.slug);
      recommendations.value = categoryResponse.data.items
        .filter((item) => item.slug !== props.slug)
        .slice(0, 5);
    } else {
      recommendations.value = [];
    }
  } catch (err) {
    error.value = "Không tải được chi tiết truyện.";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadComic);
watch(() => route.params.slug, loadComic);
</script>

<template>
  <main class="container page-detail">
    <section v-if="loading" class="state-panel">
      <h2>Đang tải chi tiết truyện...</h2>
      <p>Ứng dụng đang gọi endpoint `/truyen-tranh/{{ slug }}`.</p>
    </section>

    <section v-else-if="error" class="state-panel">
      <h2>Không thể tải truyện</h2>
      <p>{{ error }}</p>
    </section>

    <template v-else-if="comic">
      <section class="detail-hero">
        <div class="detail-cover-wrap">
          <div class="detail-cover api-detail-cover">
            <img :src="getImageUrl(comic.thumb_url)" :alt="comic.name" />
          </div>

          <div class="detail-side-card">
            <div class="detail-side-item">
              <span>Trạng thái</span>
              <strong>{{ statusLabel(comic.status) }}</strong>
            </div>
            <div class="detail-side-item">
              <span>Tác giả</span>
              <strong>{{ comic.author?.join(", ") || "Đang cập nhật" }}</strong>
            </div>
            <div class="detail-side-item">
              <span>Cập nhật</span>
              <strong>{{ formatRelativeDate(comic.updatedAt) }}</strong>
            </div>
          </div>
        </div>

        <div class="detail-copy">
          <div class="detail-breadcrumb">
            <RouterLink to="/">Trang chủ</RouterLink>
            <span>/</span>
            <span>{{ comic.name }}</span>
          </div>

          <span class="eyebrow">OTRUYEN API</span>
          <h1>{{ comic.name }}</h1>

          <div class="detail-meta">
            <span>Tác giả: {{ comic.author?.join(", ") || "Đang cập nhật" }}</span>
            <span>Trạng thái: {{ statusLabel(comic.status) }}</span>
            <span>Cập nhật: {{ formatRelativeDate(comic.updatedAt) }}</span>
          </div>

          <p class="detail-summary">
            {{ stripHtml(comic.content) || "Chưa có mô tả cho truyện này." }}
          </p>

          <div class="detail-tags">
            <RouterLink
              v-for="tag in comic.category"
              :key="tag.slug"
              class="tag-pill"
              :to="{ name: 'category-page', params: { slug: tag.slug } }"
            >
              {{ tag.name }}
            </RouterLink>
          </div>

          <div class="detail-actions" v-if="chapters.length">
            <RouterLink
              class="primary-btn large"
              :to="{
                name: 'reader',
                params: { slug: comic.slug },
                query: {
                  api: chapters[0].chapter_api_data,
                  name: chapters[0].chapter_name,
                },
              }"
            >
              Đọc từ đầu
            </RouterLink>
            <RouterLink
              class="dark-btn home-outline-btn"
              :to="{
                name: 'reader',
                params: { slug: comic.slug },
                query: {
                  api: chapters[chapters.length - 1].chapter_api_data,
                  name: chapters[chapters.length - 1].chapter_name,
                },
              }"
            >
              Đọc chap mới nhất
            </RouterLink>
            <button class="icon-btn detail-favorite-btn" type="button" @click="toggleFavorite">
              {{ isFavorite ? "♥" : "♡" }}
            </button>
          </div>
        </div>
      </section>

      <section class="detail-layout">
        <div class="detail-main">
          <section class="detail-panel">
            <div class="section-heading">
              <h3>Giới thiệu</h3>
            </div>
            <div class="detail-body api-content" v-html="comic.content"></div>
          </section>

          <section class="detail-panel">
            <div class="section-heading">
              <h3>Danh sách chương</h3>
            </div>
            <div class="chapter-list">
              <RouterLink
                v-for="chapter in chapters"
                :key="chapter.chapter_api_data"
                class="chapter-item chapter-link"
                :to="{
                  name: 'reader',
                  params: { slug: comic.slug },
                  query: {
                    api: chapter.chapter_api_data,
                    name: chapter.chapter_name,
                  },
                }"
              >
                <div>
                  <strong>{{ chapterLabel(chapter) }}</strong>
                  <p>{{ chapter.server_name }}</p>
                </div>
                <span>Đọc chap</span>
              </RouterLink>
            </div>
          </section>
        </div>

        <aside class="detail-sidebar">
          <section class="detail-panel">
            <div class="section-heading">
              <h3>Thông tin nhanh</h3>
            </div>
            <div class="info-list">
              <div class="info-row"><span>Slug</span><strong>{{ comic.slug }}</strong></div>
              <div class="info-row">
                <span>Số chương</span>
                <strong>{{ chapters.length }}</strong>
              </div>
              <div class="info-row">
                <span>Thể loại</span>
                <strong>{{ comic.category?.length || 0 }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-panel" v-if="recommendations.length">
            <div class="section-heading">
              <h3>Có thể bạn sẽ thích</h3>
            </div>
            <div class="mini-reco-list">
              <RouterLink
                v-for="item in recommendations"
                :key="item.slug"
                class="mini-reco api-mini-reco"
                :to="{ name: 'comic-detail', params: { slug: item.slug } }"
              >
                <div class="mini-reco-cover">
                  <img :src="getImageUrl(item.thumb_url)" :alt="item.name" loading="lazy" />
                </div>
                <div>
                  <strong>{{ item.name }}</strong>
                  <span>{{ chapterLabel(item.chaptersLatest?.[0]) }}</span>
                </div>
              </RouterLink>
            </div>
          </section>
        </aside>
      </section>
    </template>
  </main>
</template>
