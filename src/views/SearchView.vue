<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { fetchCategories, getImageUrl, searchComics } from "../api/otruyen";
import { chapterLabel, stripHtml, statusLabel } from "../utils/format";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref("");
const result = ref(null);
const categories = ref([]);
const jumpPage = ref("1");

const keyword = computed(() => route.query.keyword || route.query.q || "");
const currentPage = computed(() => Math.max(1, Number(route.query.page || 1)));
const pagination = computed(() => result.value?.data?.params?.pagination || null);
const totalPages = computed(() => {
  if (!pagination.value) return 1;
  return Math.max(
    1,
    Math.ceil(pagination.value.totalItems / pagination.value.totalItemsPerPage)
  );
});
const pageItems = computed(() => buildPageItems(currentPage.value, totalPages.value));

function buildPageItems(current, total) {
  if (total <= 1) return [1];
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current]);

  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page > 1 && page < total) {
      pages.add(page);
    }
  }

  const sorted = [...pages].sort((left, right) => left - right);
  const items = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index];
    const previous = sorted[index - 1];

    if (previous && page - previous > 1) {
      items.push(`ellipsis-${previous}-${page}`);
    }

    items.push(page);
  }

  return items;
}

function searchPageTarget(page) {
  return {
    name: "search",
    query: {
      keyword: keyword.value,
      page,
    },
  };
}

function submitJumpPage() {
  const nextPage = Math.min(totalPages.value, Math.max(1, Number(jumpPage.value || 1)));
  jumpPage.value = String(nextPage);
  router.push(searchPageTarget(nextPage));
}

async function loadSearch() {
  if (!keyword.value) {
    result.value = null;
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    result.value = await searchComics(keyword.value, currentPage.value);
  } catch (err) {
    error.value = "Không tìm kiếm được dữ liệu.";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  categories.value = (await fetchCategories()).data.items.slice(0, 8);
  await loadSearch();
});

watch(() => route.fullPath, loadSearch);
watch(currentPage, (page) => {
  jumpPage.value = String(page);
}, { immediate: true });
</script>

<template>
  <main class="container page-search">
    <section class="search-hero">
      <div class="detail-breadcrumb">
        <span>Trang chủ</span>
        <span>/</span>
        <span>Tìm kiếm</span>
      </div>
      <span class="eyebrow">TRA CỨU OTRUYEN API</span>
      <h1>
        {{ keyword ? `Kết quả tìm kiếm cho "${keyword}"` : "Nhập từ khóa để tìm truyện" }}
      </h1>
      <p>
        API tìm kiếm dùng endpoint `/tim-kiem?keyword=...` theo tài liệu chính thức của
        OTruyen.
      </p>
    </section>

    <section class="search-topics">
      <RouterLink
        v-for="category in categories"
        :key="category.slug"
        class="tag-pill"
        :to="{ name: 'category-page', params: { slug: category.slug } }"
      >
        {{ category.name }}
      </RouterLink>
    </section>

    <section class="search-layout">
      <aside class="search-sidebar detail-panel">
        <div class="section-heading">
          <h3>Tình trạng</h3>
        </div>
        <div class="filter-group">
          <strong>API đang dùng</strong>
          <label><input type="checkbox" checked disabled /> `/tim-kiem`</label>
          <label><input type="checkbox" checked disabled /> keyword query</label>
          <label><input type="checkbox" checked disabled /> page query</label>
        </div>
      </aside>

      <div class="search-results">
        <section class="detail-panel">
          <div class="search-meta-row">
            <div>
              <h3>Kết quả nổi bật</h3>
              <p v-if="pagination">
                {{ pagination.totalItems }} kết quả phù hợp, trang {{ pagination.currentPage }}
              </p>
            </div>
            <RouterLink class="dark-btn home-outline-btn" to="/danh-sach/truyen-moi">
              Chuyển sang danh mục
            </RouterLink>
          </div>

          <div v-if="loading" class="state-panel compact">
            <p>Đang tìm truyện...</p>
          </div>
          <div v-else-if="error" class="state-panel compact">
            <p>{{ error }}</p>
          </div>
          <div v-else-if="!result?.data?.items?.length" class="state-panel compact">
            <p>Chưa có dữ liệu cho từ khóa này.</p>
          </div>
          <div v-else class="search-result-list">
            <article
              v-for="comic in result.data.items"
              :key="comic.slug"
              class="search-result-card api-search-card"
            >
              <RouterLink
                class="search-result-cover api-search-cover"
                :to="{ name: 'comic-detail', params: { slug: comic.slug } }"
              >
                <img :src="getImageUrl(comic.thumb_url)" :alt="comic.name" loading="lazy" />
                <span class="badge vip">{{ statusLabel(comic.status) }}</span>
              </RouterLink>
              <div class="search-result-content">
                <div class="search-result-top">
                  <span class="eyebrow">Truyện tranh</span>
                  <span class="search-score">
                    {{ comic.chaptersLatest?.[0]?.chapter_name || "Mới" }}
                  </span>
                </div>
                <h3>
                  <RouterLink :to="{ name: 'comic-detail', params: { slug: comic.slug } }">
                    {{ comic.name }}
                  </RouterLink>
                </h3>
                <p>{{ stripHtml(comic?.content || "") || "Xem chi tiết để đọc mô tả đầy đủ." }}</p>
                <div class="detail-tags">
                  <span v-for="tag in comic.category.slice(0, 4)" :key="tag.slug" class="tag-pill">
                    {{ tag.name }}
                  </span>
                </div>
                <p class="api-result-chapter">
                  {{ chapterLabel(comic.chaptersLatest?.[0]) }}
                </p>
              </div>
            </article>
          </div>

          <div v-if="pagination && totalPages > 1" class="pagination-row">
            <RouterLink
              class="ghost-btn"
              :class="{ disabled: currentPage <= 1 }"
              :to="searchPageTarget(1)"
            >
              Đầu
            </RouterLink>

            <RouterLink
              class="ghost-btn"
              :class="{ disabled: currentPage <= 1 }"
              :to="searchPageTarget(Math.max(1, currentPage - 1))"
            >
              Trang trước
            </RouterLink>

            <div class="pagination-pages" aria-label="Chọn trang">
              <template v-for="item in pageItems" :key="item">
                <span v-if="typeof item === 'string'" class="pagination-ellipsis">...</span>
                <RouterLink
                  v-else
                  class="pagination-number"
                  :class="{ active: item === currentPage }"
                  :to="searchPageTarget(item)"
                >
                  {{ item }}
                </RouterLink>
              </template>
            </div>

            <span class="pagination-status">Trang {{ currentPage }} / {{ totalPages }}</span>

            <form class="pagination-jump" @submit.prevent="submitJumpPage">
              <label class="pagination-jump-label" for="search-page-jump">Tới trang</label>
              <input
                id="search-page-jump"
                v-model="jumpPage"
                class="pagination-jump-input"
                type="number"
                min="1"
                :max="totalPages"
                inputmode="numeric"
              />
              <button class="ghost-btn pagination-jump-btn" type="submit">Đi</button>
            </form>

            <RouterLink
              class="ghost-btn"
              :class="{ disabled: currentPage >= totalPages }"
              :to="searchPageTarget(currentPage + 1 > totalPages ? totalPages : currentPage + 1)"
            >
              Trang sau
            </RouterLink>
            <RouterLink
              class="ghost-btn"
              :class="{ disabled: currentPage >= totalPages }"
              :to="searchPageTarget(totalPages)"
            >
              Cuối
            </RouterLink>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
