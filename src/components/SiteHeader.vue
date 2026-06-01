<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { fetchCategories, searchComics, getImageUrl } from "../api/otruyen";
import { useLibraryStore } from "../stores/library";
import { useAuthStore } from "../stores/auth";
import { chapterLabel, statusLabel } from "../utils/format";

const route = useRoute();
const router = useRouter();
const libraryStore = useLibraryStore();
const authStore = useAuthStore();
const { isAuthenticated, userName } = storeToRefs(authStore);

const keyword = ref(route.query.keyword || route.query.q || "");
const lightTheme = ref(document.documentElement.classList.contains("light-theme"));
const suggestions = ref([]);
const isSuggesting = ref(false);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const hasSuggestionQuery = ref(false);
const mobileCategories = ref([]);
const mobileCategoryOpen = ref(false);
const isMobile = ref(false);
const mobileMenuOpen = ref(false);
const mobileSearchOpen = ref(false);
const isHeaderCondensed = ref(false);
let debounceTimer = null;

const navItems = computed(() => [
  { label: "Truyện mới", to: "/danh-sach/truyen-moi" },
  { label: "Sách điện tử", to: "/page/ebooks" },
  { label: "Sách hội viên", to: "/" },
  { label: "Sách nói", to: "/page/audio" },
  { label: "Truyện tranh", to: "/" },
]);

const moreItems = computed(() => [
  { label: "Dịch vụ xuất bản", to: "/page/about" },
  { label: "Thư viện của tôi", to: "/library" },
  { label: "Hồ sơ của tôi", to: "/profile" },
  { label: "FAQ", to: "/page/faq" },
  { label: "Điều khoản", to: "/page/terms" },
]);

const mobileNavItems = computed(() => [
  { label: "Trang chủ", to: "/" },
  { label: "Tìm truyện", to: "/search" },
  { label: "Lịch sử", to: "/library" },
  { label: "Theo dõi", to: "/profile" },
  { label: "Truyện chữ", to: "/page/ebooks" },
]);

const showEmptyState = computed(
  () =>
    showSuggestions.value &&
    hasSuggestionQuery.value &&
    !isSuggesting.value &&
    suggestions.value.length === 0
);

function syncViewportState() {
  const wasMobile = isMobile.value;
  const nextIsMobile = window.innerWidth <= 720;
  isMobile.value = nextIsMobile;

  if (nextIsMobile && !wasMobile) {
    mobileMenuOpen.value = false;
  } else if (!nextIsMobile) {
    mobileMenuOpen.value = false;
    mobileSearchOpen.value = false;
    showSuggestions.value = false;
  }
}

function syncHeaderScrollState() {
  isHeaderCondensed.value = window.scrollY > 72;
}

function submitSearch() {
  const cleaned = keyword.value.trim();
  if (!cleaned) return;
  libraryStore.recordSearch(cleaned);
  showSuggestions.value = false;
  selectedIndex.value = -1;
  if (isMobile.value) mobileSearchOpen.value = false;
  router.push({ name: "search", query: { keyword: cleaned } });
}

function selectSuggestion(comic) {
  showSuggestions.value = false;
  selectedIndex.value = -1;
  keyword.value = comic.name;
  if (isMobile.value) mobileSearchOpen.value = false;
  router.push({ name: "comic-detail", params: { slug: comic.slug } });
}

function moveSelection(direction) {
  if (!suggestions.value.length) return;

  if (selectedIndex.value === -1) {
    selectedIndex.value = direction > 0 ? 0 : suggestions.value.length - 1;
    return;
  }

  selectedIndex.value =
    (selectedIndex.value + direction + suggestions.value.length) % suggestions.value.length;
}

function handleSearchKeydown(event) {
  if (event.key === "ArrowDown") {
    if (!showSuggestions.value) showSuggestions.value = true;
    moveSelection(1);
    event.preventDefault();
    return;
  }

  if (event.key === "ArrowUp") {
    if (!showSuggestions.value) showSuggestions.value = true;
    moveSelection(-1);
    event.preventDefault();
    return;
  }

  if (event.key === "Enter" && showSuggestions.value && selectedIndex.value >= 0) {
    selectSuggestion(suggestions.value[selectedIndex.value]);
    event.preventDefault();
    return;
  }

  if (event.key === "Escape") {
    showSuggestions.value = false;
    selectedIndex.value = -1;
    if (isMobile.value) mobileSearchOpen.value = false;
  }
}

function scheduleSuggestions(value) {
  clearTimeout(debounceTimer);
  const cleaned = String(value || "").trim();
  hasSuggestionQuery.value = cleaned.length >= 2;
  selectedIndex.value = -1;

  if (cleaned.length < 2) {
    suggestions.value = [];
    isSuggesting.value = false;
    return;
  }

  isSuggesting.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const response = await searchComics(cleaned, 1);
      suggestions.value = response?.data?.items?.slice(0, 6) || [];
      showSuggestions.value = true;
    } catch {
      suggestions.value = [];
    } finally {
      isSuggesting.value = false;
    }
  }, 280);
}

function onFocusSearch() {
  if (suggestions.value.length || showEmptyState.value) {
    showSuggestions.value = true;
  }
}

function onBlurSearch() {
  window.setTimeout(() => {
    showSuggestions.value = false;
    selectedIndex.value = -1;
  }, 120);
}

function toggleTheme() {
  const root = document.documentElement;
  root.classList.toggle("light-theme");
  lightTheme.value = root.classList.contains("light-theme");
  localStorage.setItem("waka-theme", lightTheme.value ? "light" : "dark");
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function toggleMobileSearch() {
  mobileSearchOpen.value = !mobileSearchOpen.value;
  if (!mobileSearchOpen.value) {
    showSuggestions.value = false;
    selectedIndex.value = -1;
  }
}

function toggleMobileCategory() {
  mobileCategoryOpen.value = !mobileCategoryOpen.value;
}

async function signOut() {
  await authStore.signOut();
  router.push("/");
}

const isLight = computed(() => lightTheme.value);
const authLabel = computed(() => {
  const source = userName.value || "Hồ sơ";
  return source.length > 14 ? `${source.slice(0, 14)}…` : source;
});

watch(
  () => route.fullPath,
  () => {
    keyword.value = route.query.keyword || route.query.q || "";
    if (!isMobile.value) return;
    mobileMenuOpen.value = false;
    mobileSearchOpen.value = false;
    mobileCategoryOpen.value = false;
  }
);

watch(keyword, (value) => {
  scheduleSuggestions(value);
});

onMounted(async () => {
  try {
    const response = await fetchCategories();
    mobileCategories.value = response?.data?.items?.slice(0, 10) || [];
  } catch (error) {
    console.error(error);
    mobileCategories.value = [];
  }

  syncViewportState();
  syncHeaderScrollState();
  window.addEventListener("resize", syncViewportState);
  window.addEventListener("scroll", syncHeaderScrollState, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncViewportState);
  window.removeEventListener("scroll", syncHeaderScrollState);
  clearTimeout(debounceTimer);
});
</script>

<template>
  <header
    class="site-header"
    :class="{ 'mobile-search-open': mobileSearchOpen, 'is-condensed': isHeaderCondensed }"
  >
    <RouterLink class="logo brand-logo" to="/" aria-label="TÂM SEN">
      <img class="brand-logo-primary single-brand-logo" src="/logo-primary.png" alt="TÂM SEN logo" />
    </RouterLink>

    <nav
      class="main-nav"
      :class="{ 'mobile-open': !isMobile || mobileMenuOpen }"
      aria-label="Điều hướng chính"
    >
      <div class="main-nav-inner">
      <template v-if="!isMobile">
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          :class="{ active: item.label === 'Truyện tranh' && route.path === '/' }"
        >
          {{ item.label }}
        </RouterLink>

        <div class="nav-more">
          <button class="nav-more-toggle" type="button" aria-label="Xem thêm">
            Xem thêm
          </button>
          <div class="nav-more-menu">
            <RouterLink v-for="item in moreItems" :key="item.label" :to="item.to">
              {{ item.label }}
            </RouterLink>
          </div>
        </div>
      </template>

      <template v-else>
        <button
          class="mobile-nav-link mobile-nav-toggle"
          type="button"
          :aria-expanded="String(mobileCategoryOpen)"
          @click="toggleMobileCategory"
        >
          <span>Thể loại</span>
          <span class="mobile-nav-caret" :class="{ open: mobileCategoryOpen }" aria-hidden="true">
            ▾
          </span>
        </button>

        <div v-if="mobileCategoryOpen" class="mobile-category-panel">
          <RouterLink
            v-for="category in mobileCategories"
            :key="category.slug"
            class="mobile-category-pill"
            :to="{ name: 'category-page', params: { slug: category.slug } }"
          >
            {{ category.name }}
          </RouterLink>
        </div>

        <RouterLink
          v-for="item in mobileNavItems"
          :key="item.label"
          :to="item.to"
          class="mobile-nav-link"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.hasCaret" class="mobile-nav-caret" aria-hidden="true">▾</span>
        </RouterLink>
      </template>
      </div>
    </nav>

    <div class="header-tools">
      <button
        class="theme-toggle"
        type="button"
        :aria-pressed="String(isLight)"
        :aria-label="isLight ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'"
        @click="toggleTheme"
      >
        <span class="theme-toggle-icon" aria-hidden="true">
          {{ isLight ? "☾" : "☀" }}
        </span>
        <span class="theme-toggle-text">{{ isLight ? "Tối" : "Sáng" }}</span>
      </button>

      <button
        v-if="isMobile"
        class="mobile-search-toggle"
        type="button"
        aria-label="Mở tìm kiếm"
        @click="toggleMobileSearch"
      >
        ⌕
      </button>

      <div
        v-if="!isMobile || mobileSearchOpen"
        class="search-shell"
        @focusin="onFocusSearch"
        @focusout="onBlurSearch"
      >
        <form class="search-box" role="search" @submit.prevent="submitSearch">
          <input
            v-model="keyword"
            type="search"
            placeholder="Tìm truyện, tác giả..."
            aria-label="Tìm kiếm"
            autocomplete="off"
            @keydown="handleSearchKeydown"
          />
          <button class="search-submit" type="submit" aria-label="Tìm kiếm">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10.5 4.5a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm0 0c-3.314 0-6 2.686-6 6s2.686 6 6 6m7.5 3.5l-3.6-3.6"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.9"
              />
            </svg>
          </button>
        </form>

        <div
          v-if="showSuggestions && (suggestions.length || isSuggesting || showEmptyState)"
          class="search-suggestions"
        >
          <div v-if="isSuggesting" class="suggestion-state">Đang tìm gợi ý...</div>
          <div v-else-if="showEmptyState" class="suggestion-state">
            Không tìm thấy kết quả phù hợp.
          </div>
          <button
            v-for="(comic, index) in suggestions"
            v-else
            :key="comic.slug"
            class="suggestion-item"
            :class="{ active: index === selectedIndex }"
            type="button"
            @mousedown.prevent="selectSuggestion(comic)"
            @mouseenter="selectedIndex = index"
          >
            <img :src="getImageUrl(comic.thumb_url)" :alt="comic.name" class="suggestion-thumb" />
            <div class="suggestion-copy">
              <strong>{{ comic.name }}</strong>
              <span>{{ chapterLabel(comic.chaptersLatest?.[0]) }}</span>
            </div>
            <span class="suggestion-status">{{ statusLabel(comic.status) }}</span>
          </button>
        </div>
      </div>

      <template v-if="isAuthenticated">
        <RouterLink class="dark-btn" to="/profile">{{ authLabel }}</RouterLink>
        <button class="primary-btn auth-logout-btn" type="button" @click="signOut">Đăng xuất</button>
      </template>
      <template v-else>
        <RouterLink class="dark-btn" to="/page/register">Đăng ký</RouterLink>
        <RouterLink class="primary-btn" to="/page/login">Đăng nhập</RouterLink>
      </template>

      <button
        v-if="isMobile"
        class="mobile-menu-toggle"
        type="button"
        :aria-expanded="String(mobileMenuOpen)"
        :aria-label="mobileMenuOpen ? 'Đóng menu' : 'Mở menu'"
        @click="toggleMobileMenu"
      >
        {{ mobileMenuOpen ? "✕" : "☰" }}
      </button>
    </div>
  </header>
</template>
