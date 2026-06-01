import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import SearchView from "../views/SearchView.vue";
import ComicDetailView from "../views/ComicDetailView.vue";
import ReaderView from "../views/ReaderView.vue";
import ListingView from "../views/ListingView.vue";
import StaticView from "../views/StaticView.vue";
import LibraryView from "../views/LibraryView.vue";
import ProfileView from "../views/ProfileView.vue";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/search", name: "search", component: SearchView },
    {
      path: "/comic/:slug",
      name: "comic-detail",
      component: ComicDetailView,
      props: true,
    },
    {
      path: "/comic/:slug/read",
      name: "reader",
      component: ReaderView,
      props: true,
    },
    {
      path: "/danh-sach/:type",
      name: "list-page",
      component: ListingView,
      props: (route) => ({ mode: "list", value: route.params.type }),
    },
    {
      path: "/the-loai/:slug",
      name: "category-page",
      component: ListingView,
      props: (route) => ({ mode: "category", value: route.params.slug }),
    },
    {
      path: "/page/login",
      name: "login-page",
      component: LoginView,
      meta: { hideChrome: true },
    },
    {
      path: "/page/register",
      name: "register-page",
      component: RegisterView,
      meta: { hideChrome: true },
    },
    {
      path: "/page/:slug",
      name: "static-page",
      component: StaticView,
      props: true,
    },
    {
      path: "/library",
      name: "library",
      component: LibraryView,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    { path: "/:pathMatch(.*)*", name: "404", component: NotFoundView },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.init();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: "login-page",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (
    authStore.isAuthenticated &&
    (to.name === "login-page" || to.name === "register-page") &&
    to.query.mode !== "recovery"
  ) {
    return typeof to.query.redirect === "string" ? to.query.redirect : "/profile";
  }

  return true;
});

export default router;
