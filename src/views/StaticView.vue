<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { staticPages } from "../data/staticPages";

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const page = computed(() => staticPages[props.slug] || null);
</script>

<template>
  <main class="container page-info">
    <section v-if="page" class="info-hero">
      <div class="detail-breadcrumb">
        <span>Trang chủ</span>
        <span>/</span>
        <span>{{ page.title }}</span>
      </div>
      <span class="eyebrow">{{ page.eyebrow }}</span>
      <h1>{{ page.title }}</h1>
      <p>{{ page.description }}</p>
    </section>

    <section v-if="page" class="info-grid single">
      <article v-for="section in page.sections" :key="section.title" class="detail-panel">
        <div class="section-heading">
          <h3>{{ section.title }}</h3>
        </div>
        <p class="detail-body">{{ section.body }}</p>
      </article>
    </section>

    <section v-else class="state-panel">
      <h2>Không tìm thấy nội dung</h2>
      <p>Route `{{ route.fullPath }}` chưa có dữ liệu tĩnh tương ứng.</p>
    </section>
  </main>
</template>
