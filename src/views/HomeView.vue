<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { fetchCategories, fetchHome, fetchList, getImageUrl } from "../api/otruyen";
import { chapterLabel, statusLabel, stripHtml } from "../utils/format";
import SectionRow from "../components/SectionRow.vue";

const loading = ref(true);
const error = ref("");
const homeData = ref(null);
const categories = ref([]);
const ongoingList = ref([]);
const completedList = ref([]);

const heroComic = computed(() => homeData.value?.data?.items?.[0] || null);
const latestComics = computed(() => homeData.value?.data?.items?.slice(0, 10) || []);
const topCategories = computed(() => categories.value.slice(0, 10));

onMounted(async () => {
  try {
    loading.value = true;
    const [homeResponse, categoriesResponse, ongoingResponse, completedResponse] =
      await Promise.all([
        fetchHome(),
        fetchCategories(),
        fetchList("dang-phat-hanh"),
        fetchList("hoan-thanh"),
      ]);

    homeData.value = homeResponse;
    categories.value = categoriesResponse.data.items;
    ongoingList.value = ongoingResponse.data.items.slice(0, 10);
    completedList.value = completedResponse.data.items.slice(0, 10);
  } catch (err) {
    error.value = "Không tải được dữ liệu từ OTruyen API.";
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="container">
    <section v-if="loading" class="state-panel">
      <h2>Đang tải dữ liệu truyện...</h2>
      <p>Ứng dụng đang gọi `/home`, `/the-loai` và các danh sách phân loại.</p>
    </section>

    <section v-else-if="error" class="state-panel">
      <h2>Có lỗi xảy ra</h2>
      <p>{{ error }}</p>
    </section>

    <template v-else>
      <section class="hero api-hero" v-if="heroComic">
        <div class="hero-copy">
          <div class="hero-title-row">
            <h1>Truyện tranh</h1>
            <RouterLink class="category-btn" to="/danh-sach/truyen-moi">
              Khám phá ngay
            </RouterLink>
          </div>

          <h2>{{ heroComic.name }}</h2>
          <p>{{ stripHtml(homeData?.data?.seoOnPage?.descriptionHead || "") }}</p>

          <div class="detail-tags">
            <span v-for="tag in heroComic.category.slice(0, 4)" :key="tag.slug" class="tag-pill">
              {{ tag.name }}
            </span>
          </div>

          <div class="hero-actions">
            <RouterLink
              class="primary-btn large"
              :to="{ name: 'comic-detail', params: { slug: heroComic.slug } }"
            >
              Đọc truyện
            </RouterLink>
            <span class="hero-status">{{ statusLabel(heroComic.status) }}</span>
          </div>
        </div>

        <div class="hero-visual api-hero-visual">
          <img :src="getImageUrl(heroComic.thumb_url)" :alt="heroComic.name" />
          <div class="api-hero-note">
            {{ chapterLabel(heroComic.chaptersLatest?.[0]) }}
          </div>
        </div>
      </section>

      <section class="search-topics">
        <RouterLink
          v-for="category in topCategories"
          :key="category.slug"
          class="tag-pill"
          :to="{ name: 'category-page', params: { slug: category.slug } }"
        >
          {{ category.name }}
        </RouterLink>
      </section>

      <SectionRow
        title="Mới cập nhật từ API"
        :comics="latestComics"
        more-to="/danh-sach/truyen-moi"
      />
      <SectionRow
        title="Đang phát hành"
        :comics="ongoingList"
        more-to="/danh-sach/dang-phat-hanh"
      />
      <SectionRow
        title="Hoàn thành"
        :comics="completedList"
        more-to="/danh-sach/hoan-thanh"
      />
    </template>
  </main>
</template>
