<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { fetchChapter, fetchComic } from "../api/otruyen";
import { useLibraryStore } from "../stores/library";

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const libraryStore = useLibraryStore();

const loading = ref(false);
const error = ref("");
const chapterData = ref(null);
const comicData = ref(null);

const chapterApi = computed(() => route.query.api || "");
const chapterName = computed(() => route.query.name || "");

const images = computed(() => chapterData.value?.data?.item?.chapter_image || []);
const cdn = computed(() => chapterData.value?.data?.domain_cdn || "");
const chapterPath = computed(() => chapterData.value?.data?.item?.chapter_path || "");

const chapterList = computed(
  () => comicData.value?.data?.item?.chapters?.flatMap((server) => server.server_data) || []
);

const chapterIndex = computed(() =>
  chapterList.value.findIndex((item) => item.chapter_api_data === chapterApi.value)
);

const prevChapter = computed(() =>
  chapterIndex.value > 0 ? chapterList.value[chapterIndex.value - 1] : null
);

const nextChapter = computed(() =>
  chapterIndex.value >= 0 && chapterIndex.value < chapterList.value.length - 1
    ? chapterList.value[chapterIndex.value + 1]
    : null
);

function chapterTarget(chapter) {
  return {
    name: "reader",
    params: { slug: props.slug },
    query: {
      api: chapter.chapter_api_data,
      name: chapter.chapter_name,
    },
  };
}

function goBackFallback() {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push({ name: "comic-detail", params: { slug: props.slug } });
}

async function loadReader() {
  if (!chapterApi.value) {
    error.value = "Thiếu chapter_api_data để tải ảnh chap.";
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    const [chapterResponse, comicResponse] = await Promise.all([
      fetchChapter(chapterApi.value),
      fetchComic(props.slug),
    ]);

    chapterData.value = chapterResponse;
    comicData.value = comicResponse;

    const currentChapter =
      comicResponse.data.item?.chapters
        ?.flatMap((server) => server.server_data)
        .find((item) => item.chapter_api_data === chapterApi.value) || {
        chapter_api_data: chapterApi.value,
        chapter_name: chapterName.value,
        chapter_title: "",
      };

    libraryStore.recordReading({
      comic: comicResponse.data.item,
      chapter: currentChapter,
    });
  } catch (err) {
    error.value = "Không tải được dữ liệu chapter.";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadReader);
watch(() => route.fullPath, loadReader);
</script>

<template>
  <main class="container reader-page">
    <section class="detail-panel reader-header">
      <div>
        <div class="detail-breadcrumb">
          <RouterLink to="/">Trang chủ</RouterLink>
          <span>/</span>
          <RouterLink :to="{ name: 'comic-detail', params: { slug } }">Chi tiết truyện</RouterLink>
          <span>/</span>
          <span>Chap {{ chapterName || "đang đọc" }}</span>
        </div>
        <h1>Chap {{ chapterName || "đang đọc" }}</h1>
      </div>

      <div class="reader-nav">
        <RouterLink v-if="prevChapter" class="ghost-btn" :to="chapterTarget(prevChapter)">
          Chap trước
        </RouterLink>
        <RouterLink v-if="nextChapter" class="primary-btn" :to="chapterTarget(nextChapter)">
          Chap sau
        </RouterLink>
      </div>
    </section>

    <section v-if="loading" class="state-panel">
      <h2>Đang tải ảnh chap...</h2>
      <p>Reader đang gọi trực tiếp `chapter_api_data` từ OTruyen CDN.</p>
    </section>

    <section v-else-if="error" class="state-panel">
      <h2>Không thể mở chap</h2>
      <p>{{ error }}</p>
    </section>

    <section v-else class="reader-stack">
      <img
        v-for="page in images"
        :key="page.image_page"
        class="reader-image"
        :src="`${cdn}/${chapterPath}/${page.image_file}`"
        :alt="`Trang ${page.image_page + 1}`"
        loading="lazy"
      />
    </section>

    <section v-if="!loading && !error" class="reader-finish-actions">
        <RouterLink v-if="prevChapter" class="ghost-btn" :to="chapterTarget(prevChapter)">
          Chap trước
        </RouterLink>
        <button v-else class="ghost-btn" type="button" @click="goBackFallback">
          Quay lại trang trước
        </button>

        <RouterLink v-if="nextChapter" class="primary-btn" :to="chapterTarget(nextChapter)">
          Xem tiếp
        </RouterLink>
        <button v-else class="dark-btn" type="button" @click="goBackFallback">
          Quay lại trang trước
        </button>
    </section>
  </main>
</template>
