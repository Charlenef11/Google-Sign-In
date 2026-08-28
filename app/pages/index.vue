```vue
<template>
    <div class="login-page">

        <v-card class="login-card" elevation="20">

            <!-- Logo / Header -->
            <div class="text-center mb-8">
                <div class="logo">
                    <v-icon size="32">mdi-shield-lock</v-icon>
                </div>

                <h1 class="login-title">
                    Welcome Back
                </h1>

                <p class="login-subtitle">
                    Sign in to continue to your account
                </p>
            </div>

            <!-- Login Form -->
            <v-form @submit.prevent="login">

                <!-- Email -->
                <label class="input-label">
                    Email Address
                </label>

                <v-text-field v-model="email" placeholder="Enter your email" type="email" variant="outlined" density="compact"
                    prepend-inner-icon="mdi-email-outline" hide-details class="mb-5" ></v-text-field>


                <!-- Password -->
                <div class="password-header">
                    <label class="input-label">
                        Password
                    </label>

                    <a href="#" class="forgot-password">
                        Forgot password?
                    </a>
                </div>

                <v-text-field v-model="password" placeholder="Enter your password" density="compact"
                    :type="showPassword ? 'text' : 'password'" variant="outlined" prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword
                            ? 'mdi-eye-off-outline'
                            : 'mdi-eye-outline'
                        " @click:append-inner="showPassword = !showPassword" hide-details class="mb-4"></v-text-field>


                <!-- Remember Me -->
                <div class="remember-container">

                    <v-checkbox v-model="rememberMe" label="Remember me" density="compact" hide-details></v-checkbox>

                </div>


                <!-- Login Button -->
                <v-btn type="submit" block size="large" class="login-button" elevation="0">
                    Sign In

                    <v-icon end>
                        mdi-arrow-right
                    </v-icon>
                </v-btn>


                <!-- Divider -->
                <div class="divider">
                    <span>OR</span>
                </div>


                <!-- Google Button -->
                <v-btn block size="large" variant="outlined" class="google-button" @click="loginWithGoogle">
                    <v-icon start color="red">
                        mdi-google
                    </v-icon>

                    Sign in with Google
                </v-btn>

            </v-form>


            <!-- Sign Up -->
            <div class="signup-container">

                <span>
                    Don't have an account?
                </span>

                <NuxtLink to="/register" class="signup-link">
                    Create an account
                </NuxtLink>

            </div>

        </v-card>

    </div>
</template>


<script setup lang="ts">

import { ref } from 'vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)


function login() {

    alert(
        'Email: ' +
        email.value +
        '\nRemember me: ' +
        rememberMe.value
    )

}
const config = useRuntimeConfig()
declare global {
 interface Window {
 google: any
 }
}

const loginWithGoogle = () => {
 const client = window.google.accounts.oauth2.initTokenClient({
 client_id: config.public.googleClientId,
 scope: 'openid email profile',
 callback: async (response: any) => {
 const userInfo = await $fetch(
 'https://www.googleapis.com/oauth2/v3/userinfo',
 {
 headers: {
 Authorization: `Bearer ${response.access_token}`
 }
 }
 )
 localStorage.setItem(
 'google_user',
 JSON.stringify(userInfo)
 )
 localStorage.setItem(
 'google_token',
 response.access_token
 )
 navigateTo('/home')
 }
 })
 client.requestAccessToken()
}



</script>


<style scoped>
.login-page {
    min-height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;

    padding: 24px;

    background:
        linear-gradient(135deg,
            #eef2ff 0%,
            #f8fafc 50%,
            #e0e7ff 100%);
}


/* Card */

.login-card {

    width: 100%;
    max-width: 450px;

    padding: 40px;

    border-radius: 24px !important;

    background: rgba(255, 255, 255, 0.95);

    backdrop-filter: blur(10px);

}


/* Logo */

.logo {

    width: 64px;
    height: 64px;

    margin: 0 auto 20px;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 18px;

    color: white;

    background:
        linear-gradient(135deg,
            #4f46e5,
            #7c3aed);

    box-shadow:
        0 10px 25px rgba(79, 70, 229, 0.3);

}


/* Title */

.login-title {

    margin: 0;

    font-size: 30px;

    font-weight: 700;

    color: #111827;

}


.login-subtitle {

    margin-top: 8px;

    color: #6b7280;

    font-size: 15px;

}


/* Labels */

.input-label {

    display: block;

    margin-bottom: 8px;

    font-size: 14px;

    font-weight: 600;

    color: #374151;

}


.password-header {

    display: flex;

    justify-content: space-between;

    align-items: center;

}


.forgot-password {

    font-size: 13px;

    color: #4f46e5;

    text-decoration: none;

    font-weight: 500;

}


.forgot-password:hover {

    text-decoration: underline;

}


/* Remember */

.remember-container {

    margin-top: -8px;

    margin-bottom: 12px;

}


/* Login Button */

.login-button {

    height: 52px !important;

    border-radius: 12px !important;

    font-size: 16px;

    font-weight: 600;

    color: white !important;

    background:
        linear-gradient(135deg,
            #4f46e5,
            #7c3aed) !important;

    cursor: pointer;

}


.login-button:hover {

    transform: translateY(-1px);
    box-shadow:
        0 8px 20px rgba(79, 70, 229, 0.3);

}


/* Divider */

.divider {

    display: flex;

    align-items: center;

    gap: 15px;

    margin: 28px 0;

    color: #9ca3af;

    font-size: 12px;

    font-weight: 600;

}


.divider::before,
.divider::after {

    content: '';

    flex: 1;

    height: 1px;

    background: #e5e7eb;

}


/* Google */

.google-button {

    height: 52px !important;

    border-radius: 12px !important;

    border-color: #d1d5db !important;

    font-size: 15px;

    font-weight: 600;

    color: #374151;

    cursor: pointer;
}




.google-button:hover {
    transform: translateY(-1px);
    box-shadow:
        0 8px 20px rgba(79, 70, 229, 0.3);

}


/* Sign up */

.signup-container {

    margin-top: 30px;

    text-align: center;

    font-size: 14px;

    color: #6b7280;

}


.signup-link {

    margin-left: 5px;

    color: #4f46e5;

    font-weight: 600;

    text-decoration: none;

}


.signup-link:hover {

    text-decoration: underline;

}
:deep(.v-btn:hover .v-btn__overlay) {
    opacity: 0 !important;
}

/* Keep button text and icons above everything */
:deep(.v-btn .v-btn__content) {
    position: relative;
    z-index: 2;
}

/* Remove unwanted hover background from text fields */
:deep(.v-field:hover .v-field__overlay) {
    opacity: 0 !important;
}

/* Keep text field content above the overlay */
:deep(.v-field__input),
:deep(.v-field__prepend-inner),
:deep(.v-field__append-inner) {
    position: relative;
    z-index: 2;
}

/* Mobile */

@media (max-width: 500px) {

    .login-card {

        padding: 28px 22px;

        border-radius: 20px !important;

    }

    .login-title {

        font-size: 26px;

    }

    :deep(.v-btn:hover .v-btn__overlay) {
    opacity: 0 !important;
}

/* Keep button content visible */
:deep(.v-btn .v-btn__content) {
    position: relative;
    z-index: 2;
}

/* Remove Vuetify text-field hover overlay */
:deep(.v-field:hover .v-field__overlay) {
    opacity: 0 !important;
}

/* Keep text field content visible */
:deep(.v-field__input),
:deep(.v-field__prepend-inner),
:deep(.v-field__append-inner) {
    position: relative;
    z-index: 2;
}

}
</style>
