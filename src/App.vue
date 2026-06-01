<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterView, useRoute } from "vue-router";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";

const route = useRoute();
const hideChrome = computed(() => Boolean(route.meta.hideChrome));
const showBackToTop = ref(false);
let backToTopFrame = 0;

function syncBackToTopState() {
  showBackToTop.value = window.scrollY > 360;
}

function scrollToTop() {
  if (backToTopFrame) {
    cancelAnimationFrame(backToTopFrame);
  }

  const startY = window.scrollY;
  const duration = 500;
  const startTime = performance.now();

  const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const nextY = startY * (1 - easeOutCubic(progress));

    window.scrollTo(0, nextY);

    if (progress < 1) {
      backToTopFrame = requestAnimationFrame(step);
    } else {
      backToTopFrame = 0;
    }
  };

  backToTopFrame = requestAnimationFrame(step);
}

onMounted(() => {
  syncBackToTopState();
  window.addEventListener("scroll", syncBackToTopState, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", syncBackToTopState);
  if (backToTopFrame) {
    cancelAnimationFrame(backToTopFrame);
  }
});
</script>

<template>
  <div class="page-shell app-shell">
    <SiteHeader v-if="!hideChrome" />
    <RouterView />
    <SiteFooter v-if="!hideChrome" />
    <button
      v-if="!hideChrome"
      class="back-to-top"
      :class="{ visible: showBackToTop }"
      type="button"
      aria-label="Back to top"
      @click="scrollToTop"
    >
      <span class="back-to-top-arrow" aria-hidden="true">⌃</span>
      <span class="back-to-top-text">TOP</span>
    </button>
  </div>
</template>
