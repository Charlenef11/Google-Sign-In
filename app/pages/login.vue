```vue
<template>
  <div class="login-page">
    <v-card class="login-card" elevation="20">
      <!-- Logo / Header -->
      <div class="text-center mb-8">
        <div class="logo">
          <v-icon size="32">mdi-shield-lock</v-icon>
        </div>

        <h1 class="login-title">Welcome Back</h1>

        <p class="login-subtitle">Sign in to open your workspace</p>
      </div>

      <!-- Login Form -->
      <form novalidate @submit.prevent="login">
        <!-- Email -->
        <label class="input-label" for="login-email">Email address</label>

        <v-text-field
          v-model="email"
          id="login-email"
          placeholder="Enter your email"
          type="email"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-email-outline"
          hide-details="auto"
          class="mb-5"
        ></v-text-field>

        <!-- Password -->
        <div class="password-header">
          <label class="input-label" for="login-password">Password</label>
        </div>

        <v-text-field
          v-model="password"
          id="login-password"
          placeholder="Enter your password"
          density="compact"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="
            showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          @click:append-inner="showPassword = !showPassword"
          hide-details="auto"
          class="mb-4"
        ></v-text-field>

        <!-- Remember Me -->
        <div class="remember-container">
          <v-checkbox
            v-model="rememberMe"
            label="Remember me"
            density="compact"
            hide-details
          ></v-checkbox>
        </div>

        <p v-if="error" class="form-message" role="alert">{{ error }}</p>
        <!-- Login Button -->
        <v-btn
          type="button"
          block
          size="large"
          class="login-button"
          elevation="0"
          @click="login"
        >
          Sign In

          <v-icon end> mdi-arrow-right </v-icon>
        </v-btn>

        <!-- Divider -->
        <div class="divider">
          <span>OR</span>
        </div>

        <!-- Google Button -->
        <v-btn
          block
          size="large"
          variant="outlined"
          class="google-button"
          :loading="googleLoading"
          :disabled="googleLoading"
          @click="loginWithGoogle"
        >
          <v-icon start color="red"> mdi-google </v-icon>

          Sign in with Google
        </v-btn>
      </form>

      <!-- Sign Up -->
      <div class="signup-container">
        <span>Demo access accepts any valid email and non-empty password.</span>
      </div>
    </v-card>
  </div>
</template>


<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const error = ref("");
const googleLoading = ref(false);

function saveUser(user: Record<string, unknown>, remember = false) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("google_user", JSON.stringify(user));
}

async function login() {
  error.value = "";

  const normalizedEmail = email.value.trim();
  if (!normalizedEmail) {
    error.value = "Email is required.";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    error.value = "Please enter a valid email address.";
    return;
  }

  if (!password.value) {
    error.value = "Password is required.";
    return;
  }

  saveUser({ email: normalizedEmail, name: normalizedEmail.split("@")[0], provider: "demo" }, rememberMe.value);
  await navigateTo("/home");
}

const config = useRuntimeConfig();
declare global {
  interface Window {
    google: any;
  }
}

async function loginWithGoogle() {
  error.value = "";
  const google = typeof window !== "undefined" ? window.google?.accounts?.oauth2 : undefined;
  const clientId = config.public.googleClientId;

  if (!clientId) {
    error.value = "Google sign-in is not configured. Add NUXT_PUBLIC_GOOGLE_CLIENT_ID.";
    return;
  }

  if (!google) {
    error.value = "Google sign-in is still loading. Please try again in a moment.";
    return;
  }

  googleLoading.value = true;
  try {
    const client = google.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: async (response: { access_token?: string; error?: string }) => {
        try {
          if (response.error || !response.access_token) {
            throw new Error("Google sign-in was cancelled or could not be completed.");
          }

          const user = await $fetch<Record<string, unknown>>(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${response.access_token}` } }
          );
          saveUser(user, true);
          localStorage.setItem("google_token", response.access_token);
          await navigateTo("/home");
        } catch (cause) {
          error.value = cause instanceof Error ? cause.message : "Google sign-in failed.";
        } finally {
          googleLoading.value = false;
        }
      },
    });
    client.requestAccessToken();
  } catch {
    googleLoading.value = false;
    error.value = "Google sign-in could not be started. Please try again.";
  }
}


definePageMeta({
  layout: "auth",
})
</script>


<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #f1f5f0;
  background-image: radial-gradient(#d8e3d9 0.8px, transparent 0.8px);
  background-size: 22px 22px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 38px;
  border: 1px solid #e3e9e3;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18px 55px rgba(43, 67, 49, 0.1) !important;
}

.logo {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  margin: 0 auto 20px;
  border-radius: 12px;
  background: #e9f2eb;
  color: #28744e;
}

.login-title {
  margin: 0;
  color: #20312a;
  font-size: 29px;
  font-weight: 720;
}

.login-subtitle {
  margin: 8px 0 0;
  color: #7b8780;
  font-size: 14px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: #39473f;
  font-size: 13px;
  font-weight: 650;
}

.password-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-container {
  margin-top: -8px;
  margin-bottom: 12px;
}

.remember-container :deep(.v-label) {
  color: #626f66;
  font-size: 12px;
}

.form-message {
  margin: 0 0 12px;
  color: #b43c36;
  font-size: 12px;
  line-height: 1.5;
}

.login-button {
  height: 50px !important;
  border-radius: 7px !important;
  background: #28744e !important;
  color: #fff !important;
  font-size: 14px;
  font-weight: 650;
  text-transform: none;
}

.login-button:hover {
  background: #205f3f !important;
}

.divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 23px 0;
  color: #98a19b;
  font-size: 10px;
  font-weight: 700;
}

.divider::before,
.divider::after {
  height: 1px;
  flex: 1;
  background: #e6ebe6;
  content: "";
}

.google-button {
  height: 50px !important;
  border-color: #d9e1da !important;
  border-radius: 7px !important;
  color: #39473f;
  font-size: 13px;
  font-weight: 600;
  text-transform: none;
}

.signup-container {
  margin-top: 22px;
  color: #89948c;
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
}

:deep(.v-field) {
  border-radius: 7px;
}

:deep(.v-btn .v-btn__content) {
  position: relative;
  z-index: 1;
}

@media (max-width: 500px) {
  .login-card {
    padding: 30px 23px;
  }

  .login-title {
    font-size: 26px;
  }
}
</style>
