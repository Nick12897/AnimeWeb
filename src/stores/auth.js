import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { buildAuthRedirectUrl, getPublicAppUrl, supabase } from "../lib/supabase";
import { useLibraryStore } from "./library";

const POST_AUTH_REDIRECT_KEY = "tam-sen-post-auth-redirect";

export const useAuthStore = defineStore("auth", () => {
  const session = ref(null);
  const user = ref(null);
  const profile = ref(null);
  const initialized = ref(false);
  const authListener = ref(null);
  const initPromise = ref(null);

  const isAuthenticated = computed(() => Boolean(user.value));
  const userEmail = computed(() => user.value?.email || profile.value?.email || "");
  const userName = computed(() => {
    const metadataName =
      profile.value?.display_name ||
      user.value?.user_metadata?.full_name ||
      user.value?.user_metadata?.name ||
      user.value?.user_metadata?.display_name;

    return metadataName || user.value?.email || "Người dùng";
  });

  function rememberPostAuthRedirect(path = "/profile") {
    if (typeof window === "undefined") return;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    window.sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, normalizedPath);
  }

  function consumePostAuthRedirect() {
    if (typeof window === "undefined") return "";
    const value = window.sessionStorage.getItem(POST_AUTH_REDIRECT_KEY) || "";
    window.sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
    return value;
  }

  function hasOAuthPayloadInUrl() {
    if (typeof window === "undefined") return false;
    return (
      window.location.search.includes("code=") ||
      window.location.hash.includes("access_token=") ||
      window.location.hash.includes("refresh_token=")
    );
  }

  function redirectAfterAuthIfNeeded() {
    if (typeof window === "undefined") return;
    const target = consumePostAuthRedirect();
    if (!target) return;

    const normalizedTarget = target.startsWith("/") ? target : `/${target}`;
    window.location.replace(`${getPublicAppUrl()}/#${normalizedTarget}`);
  }

  async function upsertProfile(currentUser) {
    if (!currentUser?.id) return null;

    const payload = {
      id: currentUser.id,
      email: currentUser.email,
      display_name:
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.user_metadata?.display_name ||
        null,
      avatar_url: currentUser.user_metadata?.avatar_url || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return payload;
  }

  async function loadProfile(userId) {
    if (!userId) {
      profile.value = null;
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    profile.value = data;
    return data;
  }

  async function syncUserResources(currentUser) {
    if (!currentUser?.id) {
      profile.value = null;
      return;
    }

    await upsertProfile(currentUser);
    await loadProfile(currentUser.id);

    const libraryStore = useLibraryStore();
    await libraryStore.syncWithCloud(currentUser.id);
  }

  async function syncUserResourcesSafely(currentUser) {
    try {
      await syncUserResources(currentUser);
    } catch (error) {
      console.error("Failed to sync authenticated user resources.", error);
    }
  }

  async function init() {
    if (initialized.value) return;
    if (initPromise.value) return initPromise.value;

    initPromise.value = (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        session.value = currentSession;
        user.value = currentSession?.user ?? null;

        if (currentSession?.user) {
          await syncUserResourcesSafely(currentSession.user);
          if (hasOAuthPayloadInUrl()) {
            redirectAfterAuthIfNeeded();
          }
        }

        if (!authListener.value) {
          const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
            session.value = nextSession;
            user.value = nextSession?.user ?? null;

            if (nextSession?.user) {
              await syncUserResourcesSafely(nextSession.user);
              if (hasOAuthPayloadInUrl()) {
                redirectAfterAuthIfNeeded();
              }
            } else {
              profile.value = null;
            }
          });

          authListener.value = data.subscription;
        }
      } catch (error) {
        console.error("Failed to initialize auth store.", error);
      } finally {
        initialized.value = true;
        initPromise.value = null;
      }
    })();

    return initPromise.value;
  }

  async function signUpWithEmail({ email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildAuthRedirectUrl("/profile"),
      },
    });

    if (error) throw error;
    session.value = data.session;
    user.value = data.user;
    if (data.user) {
      await syncUserResourcesSafely(data.user);
    }
    return data;
  }

  async function signInWithEmail({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    session.value = data.session;
    user.value = data.user;
    if (data.user) {
      await syncUserResourcesSafely(data.user);
    }
    return data;
  }

  async function signInWithGoogle(redirectPath = "/profile") {
    rememberPostAuthRedirect(redirectPath);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildAuthRedirectUrl(redirectPath),
      },
    });

    if (error) throw error;
    return data;
  }

  async function sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildAuthRedirectUrl("/page/login?mode=recovery"),
    });

    if (error) throw error;
  }

  async function updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
    session.value = data.session ?? session.value;
    user.value = data.user ?? user.value;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    session.value = null;
    user.value = null;
    profile.value = null;
  }

  function dispose() {
    authListener.value?.unsubscribe?.();
    authListener.value = null;
    initialized.value = false;
    initPromise.value = null;
  }

  return {
    session,
    user,
    profile,
    initialized,
    isAuthenticated,
    userEmail,
    userName,
    init,
    dispose,
    loadProfile,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    updatePassword,
    signOut,
  };
});
