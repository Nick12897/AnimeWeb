import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { getImageUrl } from "../api/otruyen";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "waka-vue-library";

function emptyState() {
  return {
    favorites: [],
    readingHistory: [],
    searches: [],
  };
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyState();
    }

    return {
      ...emptyState(),
      ...JSON.parse(raw),
    };
  } catch {
    return emptyState();
  }
}

function normalizeComic(comic) {
  return {
    slug: comic.slug,
    name: comic.name,
    thumb_url: comic.thumb_url,
    status: comic.status,
    categories: comic.category || comic.categories || [],
    author: comic.author || [],
    updatedAt: comic.updatedAt || null,
  };
}

function sortByDate(items, key) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left[key] || 0).getTime();
    const rightTime = new Date(right[key] || 0).getTime();
    return rightTime - leftTime;
  });
}

function mergeByKey(localItems, remoteItems, getKey, limit, sortKey) {
  const map = new Map();

  [...(remoteItems || []), ...(localItems || [])].forEach((item) => {
    if (!item) return;
    const key = getKey(item);
    if (!key) return;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
      return;
    }

    const existingTime = new Date(existing[sortKey] || 0).getTime();
    const nextTime = new Date(item[sortKey] || 0).getTime();
    map.set(key, nextTime >= existingTime ? item : existing);
  });

  return sortByDate([...map.values()], sortKey).slice(0, limit);
}

export const useLibraryStore = defineStore("library", () => {
  const initial = loadInitialState();
  const favorites = ref(initial.favorites || []);
  const readingHistory = ref(initial.readingHistory || []);
  const searches = ref(initial.searches || []);
  const syncStatus = ref("idle");
  const syncError = ref("");
  const lastSyncedAt = ref("");

  watch(
    [favorites, readingHistory, searches],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          favorites: favorites.value,
          readingHistory: readingHistory.value,
          searches: searches.value,
        })
      );
    },
    { deep: true }
  );

  const favoriteSlugs = computed(() => favorites.value.map((item) => item.slug));

  function replaceState(nextState) {
    favorites.value = nextState.favorites || [];
    readingHistory.value = nextState.readingHistory || [];
    searches.value = nextState.searches || [];
  }

  function getSnapshot() {
    return {
      favorites: favorites.value,
      readingHistory: readingHistory.value,
      searches: searches.value,
    };
  }

  function toggleFavorite(comic) {
    const exists = favorites.value.find((item) => item.slug === comic.slug);
    if (exists) {
      favorites.value = favorites.value.filter((item) => item.slug !== comic.slug);
      return false;
    }

    favorites.value = [
      {
        ...normalizeComic(comic),
        cover: getImageUrl(comic.thumb_url),
        savedAt: new Date().toISOString(),
      },
      ...favorites.value,
    ].slice(0, 100);

    return true;
  }

  function recordReading({ comic, chapter }) {
    if (!comic?.slug || !chapter?.chapter_api_data) return;

    const entry = {
      ...normalizeComic(comic),
      cover: getImageUrl(comic.thumb_url),
      chapterName: chapter.chapter_name || "",
      chapterTitle: chapter.chapter_title || "",
      chapterApi: chapter.chapter_api_data,
      readAt: new Date().toISOString(),
    };

    readingHistory.value = [
      entry,
      ...readingHistory.value.filter(
        (item) => !(item.slug === entry.slug && item.chapterApi === entry.chapterApi)
      ),
    ].slice(0, 120);
  }

  function recordSearch(keyword) {
    const cleaned = String(keyword || "").trim();
    if (!cleaned) return;

    searches.value = [
      {
        keyword: cleaned,
        searchedAt: new Date().toISOString(),
      },
      ...searches.value.filter((item) => item.keyword.toLowerCase() !== cleaned.toLowerCase()),
    ].slice(0, 20);
  }

  async function syncWithCloud(userId) {
    if (!userId) return;

    try {
      syncStatus.value = "syncing";
      syncError.value = "";

      const { data: remoteState, error: fetchError } = await supabase
        .from("reader_state")
        .select("favorites, reading_history, searches, updated_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const mergedFavorites = mergeByKey(
        favorites.value,
        remoteState?.favorites || [],
        (item) => item.slug,
        100,
        "savedAt"
      );

      const mergedReadingHistory = mergeByKey(
        readingHistory.value,
        remoteState?.reading_history || [],
        (item) => `${item.slug}:${item.chapterApi}`,
        120,
        "readAt"
      );

      const mergedSearches = mergeByKey(
        searches.value,
        remoteState?.searches || [],
        (item) => item.keyword?.toLowerCase(),
        20,
        "searchedAt"
      );

      replaceState({
        favorites: mergedFavorites,
        readingHistory: mergedReadingHistory,
        searches: mergedSearches,
      });

      const now = new Date().toISOString();
      const { error: upsertError } = await supabase.from("reader_state").upsert(
        {
          user_id: userId,
          favorites: mergedFavorites,
          reading_history: mergedReadingHistory,
          searches: mergedSearches,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );

      if (upsertError) throw upsertError;

      syncStatus.value = "synced";
      lastSyncedAt.value = now;
    } catch (error) {
      syncStatus.value = "error";
      syncError.value = error?.message || "Không thể đồng bộ dữ liệu.";
      console.error(error);
    }
  }

  function clearLocalState() {
    replaceState(emptyState());
  }

  return {
    favorites,
    readingHistory,
    searches,
    favoriteSlugs,
    syncStatus,
    syncError,
    lastSyncedAt,
    replaceState,
    getSnapshot,
    toggleFavorite,
    recordReading,
    recordSearch,
    syncWithCloud,
    clearLocalState,
  };
});
