<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import QRCode from "qrcode";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const email = ref("");
const password = ref("");
const newPassword = ref("");
const showPassword = ref(false);
const showNewPassword = ref(false);
const qrCodeUrl = ref("");
const submitting = ref(false);
const errorMessage = ref("");
const infoMessage = ref("");

const webUrl = computed(() => {
  const envUrl = import.meta.env.VITE_PUBLIC_WEB_URL?.trim();
  if (envUrl) return envUrl;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5173";
});

const isRecoveryMode = computed(() => route.query.mode === "recovery");
const redirectTarget = computed(() =>
  typeof route.query.redirect === "string" && route.query.redirect ? route.query.redirect : "/profile"
);

const passwordError = computed(() => {
  const target = isRecoveryMode.value ? newPassword.value : password.value;
  if (!target) return "";
  return target.length >= 6 ? "" : "Mật khẩu bao gồm ít nhất 6 ký tự";
});

const emailError = computed(() => {
  if (!email.value) return "";
  return /\S+@\S+\.\S+/.test(email.value) ? "" : "Email chưa hợp lệ.";
});

const canSubmit = computed(() => {
  if (isRecoveryMode.value) {
    return newPassword.value.length >= 6;
  }

  return email.value.trim() && password.value.length >= 6 && !emailError.value;
});

async function buildQrCode() {
  qrCodeUrl.value = await QRCode.toDataURL(webUrl.value, {
    width: 236,
    margin: 1,
    color: {
      dark: "#111111",
      light: "#ffffff",
    },
  });
}

async function submitLogin() {
  if (!canSubmit.value || submitting.value) return;

  try {
    submitting.value = true;
    errorMessage.value = "";
    infoMessage.value = "";

    if (isRecoveryMode.value) {
      await authStore.updatePassword(newPassword.value);
      infoMessage.value = "Mật khẩu đã được cập nhật. Bạn có thể tiếp tục sử dụng tài khoản.";
      router.push(redirectTarget.value);
      return;
    }

    await authStore.signInWithEmail({
      email: email.value.trim(),
      password: password.value,
    });

    router.push(redirectTarget.value);
  } catch (error) {
    errorMessage.value = error?.message || "Không thể hoàn tất thao tác lúc này.";
  } finally {
    submitting.value = false;
  }
}

async function continueWithGoogle() {
  try {
    submitting.value = true;
    errorMessage.value = "";
    infoMessage.value = "";
    await authStore.signInWithGoogle();
  } catch (error) {
    submitting.value = false;
    errorMessage.value = error?.message || "Không thể đăng nhập với Google.";
  }
}

async function sendResetEmail() {
  if (!email.value.trim() || emailError.value) {
    errorMessage.value = "Hãy nhập email hợp lệ để nhận liên kết đặt lại mật khẩu.";
    return;
  }

  try {
    submitting.value = true;
    errorMessage.value = "";
    infoMessage.value = "";
    await authStore.sendPasswordReset(email.value.trim());
    infoMessage.value = "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.";
  } catch (error) {
    errorMessage.value = error?.message || "Không thể gửi email đặt lại mật khẩu.";
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await buildQrCode();
  if (isAuthenticated.value && !isRecoveryMode.value) {
    router.replace(redirectTarget.value);
  }
});

watch(webUrl, buildQrCode);
watch(isAuthenticated, (authenticated) => {
  if (authenticated && !isRecoveryMode.value) {
    router.replace(redirectTarget.value);
  }
});
</script>

<template>
  <main class="register-page login-page">
    <div class="register-backdrop"></div>

    <section class="register-modal login-modal">
      <RouterLink class="register-close" to="/" aria-label="Đóng đăng nhập">✕</RouterLink>

      <div class="register-head login-head">
        <h1>{{ isRecoveryMode ? "Đặt mật khẩu mới" : "Đăng nhập" }}</h1>
        <p>
          {{
            isRecoveryMode
              ? "Nhập mật khẩu mới để hoàn tất khôi phục tài khoản"
              : "Chọn phương thức đăng nhập"
          }}
        </p>
      </div>

      <div class="login-layout">
        <section class="login-panel login-panel-qr">
          <h2>Trải nghiệm app TÂM SEN ngay!</h2>
          <div class="login-qr-box" aria-label="QR code mở web">
            <img
              v-if="qrCodeUrl"
              class="login-qr-image"
              :src="qrCodeUrl"
              :alt="`QR code mở ${webUrl}`"
            />
          </div>
          <p>
            Bạn vui lòng quét mã QR để truy cập <strong>{{ webUrl }}</strong> và tiếp tục đọc trên
            thiết bị khác.
          </p>
        </section>

        <section class="login-panel login-panel-form">
          <h2>{{ isRecoveryMode ? "Cập nhật mật khẩu" : "Đăng nhập với email" }}</h2>

          <form class="register-form login-form" @submit.prevent="submitLogin">
            <label v-if="!isRecoveryMode" class="register-field">
              <input
                v-model="email"
                type="email"
                placeholder="Email"
                autocomplete="email"
              />
              <small v-if="emailError">{{ emailError }}</small>
            </label>

            <label v-if="!isRecoveryMode" class="register-field">
              <span class="register-input-wrap">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mật khẩu"
                  autocomplete="current-password"
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
              <small v-if="passwordError">{{ passwordError }}</small>
            </label>

            <label v-else class="register-field">
              <span class="register-input-wrap">
                <input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Mật khẩu mới"
                  autocomplete="new-password"
                />
                <button
                  class="register-toggle"
                  type="button"
                  :aria-label="showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                  @click="showNewPassword = !showNewPassword"
                >
                  <svg
                    v-if="showNewPassword"
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
              <small v-if="passwordError">{{ passwordError }}</small>
            </label>

            <div v-if="!isRecoveryMode" class="login-forgot-row">
              <button class="auth-link-button" type="button" :disabled="submitting" @click="sendResetEmail">
                Quên mật khẩu
              </button>
            </div>

            <p v-if="errorMessage" class="auth-feedback auth-feedback-error">{{ errorMessage }}</p>
            <p v-if="infoMessage" class="auth-feedback auth-feedback-info">{{ infoMessage }}</p>

            <button class="register-submit" type="submit" :disabled="!canSubmit || submitting">
              {{
                submitting
                  ? isRecoveryMode
                    ? "Đang cập nhật..."
                    : "Đang đăng nhập..."
                  : isRecoveryMode
                    ? "Lưu mật khẩu mới"
                    : "Đăng nhập"
              }}
            </button>
          </form>

          <template v-if="!isRecoveryMode">
            <div class="register-divider login-divider">
              <span>Hoặc đăng nhập với</span>
            </div>

            <div class="register-socials login-socials login-socials-single">
              <button
                class="register-social register-social-google login-google-btn"
                type="button"
                :disabled="submitting"
                @click="continueWithGoogle"
              >
                <span class="register-social-icon register-social-icon-google" aria-hidden="true">G</span>
                <span>Tiếp tục với Google</span>
              </button>
            </div>
          </template>
        </section>
      </div>

      <div v-if="!isRecoveryMode" class="register-switch login-switch">
        <span>Bạn chưa có tài khoản?</span>
        <RouterLink to="/page/register">Đăng ký ngay</RouterLink>
      </div>
    </section>
  </main>
</template>
