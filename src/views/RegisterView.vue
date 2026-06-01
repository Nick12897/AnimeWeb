<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const redirectTarget = computed(() =>
  typeof route.query.redirect === "string" && route.query.redirect ? route.query.redirect : "/profile"
);

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const submitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const emailError = computed(() => {
  if (!email.value) return "";
  return /\S+@\S+\.\S+/.test(email.value) ? "" : "Email chưa hợp lệ.";
});

const passwordError = computed(() => {
  if (!password.value) return "";
  return password.value.length >= 6 ? "" : "Mật khẩu bao gồm ít nhất 6 ký tự";
});

const confirmError = computed(() => {
  if (!confirmPassword.value) return "";
  if (confirmPassword.value.length < 6) return "Mật khẩu bao gồm ít nhất 6 ký tự";
  return confirmPassword.value === password.value ? "" : "Mật khẩu nhập lại chưa khớp.";
});

const canSubmit = computed(() => {
  return (
    email.value.trim() &&
    password.value.length >= 6 &&
    confirmPassword.value === password.value &&
    !emailError.value
  );
});

async function submitRegister() {
  if (!canSubmit.value || submitting.value) return;

  try {
    submitting.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const data = await authStore.signUpWithEmail({
      email: email.value.trim(),
      password: password.value,
    });

    if (data.session) {
      router.push(redirectTarget.value);
      return;
    }

    successMessage.value =
      "Tài khoản đã được tạo. Vui lòng kiểm tra email để xác nhận rồi quay lại đăng nhập.";
  } catch (error) {
    errorMessage.value = error?.message || "Không thể tạo tài khoản lúc này.";
  } finally {
    submitting.value = false;
  }
}

async function continueWithGoogle() {
  try {
    submitting.value = true;
    errorMessage.value = "";
    successMessage.value = "";
    await authStore.signInWithGoogle();
  } catch (error) {
    submitting.value = false;
    errorMessage.value = error?.message || "Không thể đăng ký với Google.";
  }
}

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    router.replace(redirectTarget.value);
  }
}, { immediate: true });
</script>

<template>
  <main class="register-page">
    <div class="register-backdrop"></div>

    <section class="register-modal">
      <RouterLink class="register-close" to="/" aria-label="Đóng đăng ký">✕</RouterLink>

      <div class="register-head">
        <h1>Đăng ký tài khoản</h1>
        <p>Đăng ký để lưu lịch sử đọc, yêu thích truyện và đồng bộ tài khoản</p>
      </div>

      <form class="register-form" @submit.prevent="submitRegister">
        <label class="register-field">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            autocomplete="email"
          />
          <small v-if="emailError">{{ emailError }}</small>
        </label>

        <label class="register-field">
          <span class="register-input-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mật khẩu"
              autocomplete="new-password"
            />
            <button
              class="register-toggle"
              type="button"
              :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="showPassword"
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9" />
                <path d="M9.4 5.3A11.1 11.1 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-4 4.8" />
                <path d="M6.6 6.7C4.1 8.2 2 12 2 12a17.4 17.4 0 0 0 10 7 10.7 10.7 0 0 0 5.4-1.4" />
              </svg>
            </button>
          </span>
          <small>{{ passwordError || "Mật khẩu bao gồm ít nhất 6 ký tự" }}</small>
        </label>

        <label class="register-field">
          <span class="register-input-wrap">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Nhập lại mật khẩu"
              autocomplete="new-password"
            />
            <button
              class="register-toggle"
              type="button"
              :aria-label="showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg
                v-if="showConfirmPassword"
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9" />
                <path d="M9.4 5.3A11.1 11.1 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-4 4.8" />
                <path d="M6.6 6.7C4.1 8.2 2 12 2 12a17.4 17.4 0 0 0 10 7 10.7 10.7 0 0 0 5.4-1.4" />
              </svg>
            </button>
          </span>
          <small>{{ confirmError || "Nhập lại mật khẩu để xác nhận" }}</small>
        </label>

        <p v-if="errorMessage" class="auth-feedback auth-feedback-error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="auth-feedback auth-feedback-success">{{ successMessage }}</p>

        <button class="register-submit" type="submit" :disabled="!canSubmit || submitting">
          {{ submitting ? "Đang tạo tài khoản..." : "Đăng ký" }}
        </button>
      </form>

      <div class="register-divider">
        <span>Hoặc đăng ký với</span>
      </div>

      <div class="register-socials register-socials-single">
        <button class="register-social register-social-google" type="button" @click="continueWithGoogle">
          <span class="register-social-icon register-social-icon-google" aria-hidden="true">G</span>
          <span>Tiếp tục với Google</span>
        </button>
      </div>

      <p class="register-agreement">
        Bằng việc nhấn “Đăng ký”, bạn đã đọc và đồng ý với điều kiện và điều khoản của TÂM SEN
      </p>

      <div class="register-switch">
        <span>Bạn đã có tài khoản?</span>
        <RouterLink to="/page/login">Đăng nhập ngay</RouterLink>
      </div>
    </section>
  </main>
</template>
