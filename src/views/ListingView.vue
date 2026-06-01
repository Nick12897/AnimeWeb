<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { fetchCategory, fetchList } from "../api/otruyen";
import { listTitle } from "../utils/format";
import ComicCard from "../components/ComicCard.vue";

const props = defineProps({
  mode: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref("");
const data = ref(null);
const jumpPage = ref("1");

const title = computed(() => {
  if (props.mode === "category") return data.value?.data?.titlePage || "Theo thể loại";
  return listTitle(props.value);
});

const currentPage = computed(() => Math.max(1, Number(route.query.page || 1)));
const pagination = computed(() => data.value?.data?.params?.pagination || null);
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

function listingPageTarget(page) {
  return {
    name: props.mode === "category" ? "category-page" : "list-page",
    params: props.mode === "category" ? { slug: props.value } : { type: props.value },
    query: { page },
  };
}

function submitJumpPage() {
  const nextPage = Math.min(totalPages.value, Math.max(1, Number(jumpPage.value || 1)));
  jumpPage.value = String(nextPage);
  router.push(listingPageTarget(nextPage));
}

async function loadListing() {
  try {
    loading.value = true;
    error.value = "";
    data.value =
      props.mode === "category"
        ? await fetchCategory(props.value, currentPage.value)
        : await fetchList(props.value, currentPage.value);
  } catch (err) {
    error.value = "Không tải được danh sách truyện.";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadListing);
watch(() => route.fullPath, loadListing);
watch(currentPage, (page) => {
  jumpPage.value = String(page);
}, { immediate: true });
</script>

<template>
  <main class="container">
    <section class="search-hero">
      <div class="detail-breadcrumb">
        <span>Trang chủ</span>
        <span>/</span>
        <span>{{ title }}</span>
      </div>
      <span class="eyebrow">OTRUYEN API LISTING</span>
      <h1>{{ title }}</h1>
      <p>
        {{ data?.data?.seoOnPage?.descriptionHead || "Danh sách đang được tải từ API." }}
      </p>
    </section>

    <section v-if="loading" class="state-panel">
      <p>Đang tải danh sách truyện...</p>
    </section>
    <section v-else-if="error" class="state-panel">
      <p>{{ error }}</p>
    </section>
    <section v-else class="section-block">
      <div class="book-grid five-col api-grid">
        <ComicCard v-for="comic in data?.data?.items || []" :key="comic.slug" :comic="comic" />
      </div>

      <div v-if="pagination && totalPages > 1" class="pagination-row">
        <RouterLink
          class="ghost-btn"
          :class="{ disabled: currentPage <= 1 }"
          :to="listingPageTarget(1)"
        >
          Đầu
        </RouterLink>

        <RouterLink
          class="ghost-btn"
          :class="{ disabled: currentPage <= 1 }"
          :to="listingPageTarget(Math.max(1, currentPage - 1))"
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
              :to="listingPageTarget(item)"
            >
              {{ item }}
            </RouterLink>
          </template>
        </div>

        <span class="pagination-status">Trang {{ currentPage }} / {{ totalPages }}</span>

        <form class="pagination-jump" @submit.prevent="submitJumpPage">
          <label class="pagination-jump-label" for="listing-page-jump">Tới trang</label>
          <input
            id="listing-page-jump"
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
          :to="listingPageTarget(currentPage + 1 > totalPages ? totalPages : currentPage + 1)"
        >
          Trang sau
        </RouterLink>
        <RouterLink
          class="ghost-btn"
          :class="{ disabled: currentPage >= totalPages }"
          :to="listingPageTarget(totalPages)"
        >
          Cuối
        </RouterLink>
      </div>
    </section>
  </main>
</template>
