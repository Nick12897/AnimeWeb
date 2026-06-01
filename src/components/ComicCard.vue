<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { getImageUrl } from "../api/otruyen";
import { statusLabel, chapterLabel } from "../utils/format";

const props = defineProps({
  comic: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const latestChapter = computed(() => props.comic.chaptersLatest?.[0]);
const badgeClass = computed(() => {
  if (props.comic.status === "completed") return "free";
  if (props.comic.status === "coming_soon") return "serial";
  return "vip";
});
</script>

<template>
  <article class="book-card api-book-card" :class="{ compact }">
    <RouterLink :to="{ name: 'comic-detail', params: { slug: comic.slug } }">
      <div class="cover api-cover">
        <img :src="getImageUrl(comic.thumb_url)" :alt="comic.name" loading="lazy" />
        <span class="badge" :class="badgeClass">{{ statusLabel(comic.status) }}</span>
        <strong>{{ comic.name }}</strong>
      </div>
      <h4>{{ comic.name }}</h4>
      <p class="api-card-meta">
        {{ latestChapter ? chapterLabel(latestChapter) : "Chưa có chap" }}
      </p>
    </RouterLink>
  </article>
</template>
