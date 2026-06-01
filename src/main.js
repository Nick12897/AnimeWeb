import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import "../styles.css";

const savedTheme = localStorage.getItem("waka-theme");
if (savedTheme === "light") {
  document.documentElement.classList.add("light-theme");
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const authStore = useAuthStore(pinia);
authStore.init();

app.mount("#app");
