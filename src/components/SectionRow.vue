<script setup>
import ComicCard from "./ComicCard.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  comics: {
    type: Array,
    default: () => [],
  },
  moreTo: {
    type: [String, Object],
    default: null,
  },
});
</script>

<template>
  <section class="section-block" v-if="comics.length">
    <div class="section-heading">
      <h3>{{ title }}</h3>
      <RouterLink v-if="moreTo" class="section-link" :to="moreTo">Xem thêm</RouterLink>
    </div>
    <div class="book-grid five-col api-grid">
      <ComicCard v-for="comic in comics" :key="comic.slug" :comic="comic" />
    </div>
  </section>
</template>
