<template>
  <div class="app-shell">
    <aside class="sidebar">
      <NuxtLink to="/home" class="brand">
        <span class="brand-mark"><v-icon icon="mdi-orbit" /></span>
        <span>Northstar</span>
      </NuxtLink>

      <p class="nav-label">WORKSPACE</p>
      <nav class="module-nav" aria-label="Main navigation">
        <NuxtLink
          v-for="item in modules"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="is-active"
        >
          <v-icon :icon="item.icon" size="20" />
          <span>{{ item.label }}</span>
          <v-icon v-if="item.to === '/weather'" icon="mdi-arrow-up-right" size="16" class="nav-arrow" />
        </NuxtLink>
      </nav>

      <div class="sidebar-bottom">
        <div class="profile-mark">{{ initials }}</div>
        <div class="profile-copy">
          <strong>{{ displayName }}</strong>
          <span>{{ displayEmail }}</span>
        </div>
        <button class="logout-button" type="button" aria-label="Sign out" title="Sign out" @click="logout">
          <v-icon icon="mdi-logout" size="19" />
        </button>
      </div>
    </aside>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const modules = [
  { label: "Dashboard", to: "/home", icon: "mdi-view-dashboard-outline" },
  { label: "QR scanner", to: "/qr-scanner", icon: "mdi-qrcode-scan" },
  { label: "Weather", to: "/weather", icon: "mdi-weather-partly-cloudy" },
];

const profile = ref<{ name?: string; email?: string } | null>(null);
const displayName = computed(() => profile.value?.name || profile.value?.email?.split("@")[0] || "Your account");
const displayEmail = computed(() => profile.value?.email || "Signed in");
const initials = computed(() => displayName.value.slice(0, 2).toUpperCase());

onMounted(() => {
  const savedProfile = localStorage.getItem("google_user") || sessionStorage.getItem("google_user");
  if (savedProfile) {
    try {
      profile.value = JSON.parse(savedProfile);
    } catch {
      profile.value = null;
    }
  }
});

async function logout() {
  localStorage.removeItem("google_user");
  localStorage.removeItem("google_token");
  sessionStorage.removeItem("google_user");
  await navigateTo("/login");
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  background: #f4f7f4;
  color: #202b28;
}

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  flex-direction: column;
  padding: 26px 16px 18px;
  border-right: 1px solid #e3e9e4;
  background: #fbfcfa;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 10px;
  color: #1e302b;
  font-size: 20px;
  font-weight: 750;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: #e8f1ea;
  color: #267550;
}

.nav-label {
  margin: 50px 10px 12px;
  color: #89948e;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.2px;
}

.module-nav {
  display: grid;
  gap: 5px;
}

.nav-link {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 8px;
  color: #65716a;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: color 150ms ease, background 150ms ease;
}

.nav-link:hover,
.nav-link.is-active {
  background: #eaf2ec;
  color: #236d4b;
}

.nav-arrow {
  margin-left: auto;
  opacity: 0.55;
}

.sidebar-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 14px 4px 2px;
  border-top: 1px solid #e6ebe7;
}

.profile-mark {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: #f8e8df;
  color: #a44c2e;
  font-size: 12px;
  font-weight: 750;
}

.profile-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
  flex: 1;
}

.profile-copy strong,
.profile-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-copy strong {
  font-size: 12px;
}

.profile-copy span {
  color: #87918b;
  font-size: 11px;
}

.logout-button {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #78837c;
  cursor: pointer;
}

.logout-button:hover {
  background: #f8e8df;
  color: #a44c2e;
}

.main-content {
  min-width: 0;
  padding: 38px clamp(22px, 5vw, 64px) 56px;
}

@media (max-width: 700px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
    padding: 14px 16px 10px;
    border-right: 0;
    border-bottom: 1px solid #e3e9e4;
  }

  .brand {
    padding: 0 4px 12px;
    font-size: 18px;
  }

  .nav-label {
    display: none;
  }

  .sidebar-bottom {
    margin-top: 8px;
    padding: 8px 2px 0;
  }

  .profile-copy {
    display: none;
  }

  .module-nav {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
  }

  .nav-link {
    min-height: 44px;
    justify-content: center;
    gap: 6px;
    padding: 0 5px;
    font-size: 12px;
  }

  .nav-arrow {
    display: none;
  }

  .main-content {
    padding: 28px 18px 40px;
  }
}
</style>