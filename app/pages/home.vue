<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

definePageMeta({ middleware: "auth" });

const profile = ref<{ name?: string; given_name?: string; email?: string } | null>(null);
const firstName = computed(() => profile.value?.given_name || profile.value?.name?.split(" ")[0] || profile.value?.email?.split("@")[0] || "there");
const today = ref("");

onMounted(() => {
  const savedProfile = localStorage.getItem("google_user") || sessionStorage.getItem("google_user");
  if (savedProfile) {
    try {
      profile.value = JSON.parse(savedProfile);
    } catch {
      profile.value = null;
    }
  }

  today.value = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
});
</script>

<template>
  <div class="dashboard-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">YOUR WORKSPACE <span>{{ today }}</span></p>
        <h1>Good to see you, {{ firstName }}.</h1>
        <p class="intro">A little space to check in, scan, and plan your day.</p>
      </div>
    </header>

    <section class="welcome-band" aria-label="Workspace overview">
      <div class="welcome-copy">
        <div class="band-top">
          <p class="band-kicker">KOVA WORKSPACE</p>
          <span class="status-badge">
            <span class="status-dot"></span>
            Google Session Active
          </span>
        </div>
        <h2>Make today<br />a little clearer.</h2>
        <p>Everything you need is one step away.</p>
      </div>
      <div class="band-art" aria-hidden="true">
        <span class="sun-disc"></span>
        <span class="horizon horizon-back"></span>
        <span class="horizon horizon-front"></span>
      </div>
    </section>

    <div class="section-heading">
      <div>
        <p class="eyebrow">PICK UP WHERE YOU LEFT OFF</p>
        <h2>Your modules</h2>
      </div>
      <span class="module-count">02 ACTIVE MODULES</span>
    </div>

    <section class="module-grid" aria-label="Workspace modules">
      <NuxtLink to="/qr-scanner" class="module-tile scan-tile">
        <span class="tile-icon"><v-icon icon="mdi-qrcode-scan" size="22" /></span>
        <span class="tile-copy">
          <span class="tile-kicker">CAPTURE</span>
          <strong>QR scanner</strong>
          <span>Read a code with your camera</span>
        </span>
        <v-icon class="tile-arrow" icon="mdi-arrow-up-right" size="20" />
      </NuxtLink>

      <NuxtLink to="/weather" class="module-tile weather-tile">
        <span class="tile-icon"><v-icon icon="mdi-weather-partly-cloudy" size="22" /></span>
        <span class="tile-copy">
          <span class="tile-kicker">OUTSIDE</span>
          <strong>Local weather</strong>
          <span>See conditions for any city</span>
        </span>
        <v-icon class="tile-arrow" icon="mdi-arrow-up-right" size="20" />
      </NuxtLink>
    </section>

    <footer class="dashboard-footer">
      <v-icon icon="mdi-shield-check-outline" size="18" />
      <span>Your workspace is ready when you are.</span>
    </footer>
  </div>
</template>

<style scoped>
.dashboard-page {
  width: min(100%, 1040px);
  margin: 0 auto;
  padding-bottom: 24px;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.eyebrow,
.band-kicker,
.tile-kicker {
  margin: 0;
  color: #6a7b71;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.2px;
}

.eyebrow span {
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid #d5ded8;
  color: #8b9990;
  font-weight: 500;
  letter-spacing: 0.2px;
}

h1,
h2,
p {
  margin-top: 0;
}

.page-heading h1 {
  margin: 8px 0 6px;
  color: #192b24;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 750;
  letter-spacing: -0.5px;
}

.intro {
  margin: 0;
  color: #6f7f76;
  font-size: 14px;
}

/* Welcome Banner */
.welcome-band {
  position: relative;
  display: flex;
  min-height: 240px;
  align-items: center;
  overflow: hidden;
  padding: 36px 42px;
  border-radius: 14px;
  background: #1e3b31;
  color: #fff;
}

.welcome-copy {
  position: relative;
  z-index: 1;
}

.band-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.band-kicker {
  color: #a3c4b1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #d6e8dd;
  font-size: 10.5px;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6ee7b7;
}

.welcome-copy h2 {
  margin: 0 0 12px;
  font-size: 32px;
  line-height: 1.12;
  font-weight: 680;
  letter-spacing: -0.3px;
}

.welcome-copy > p:last-child {
  margin: 0;
  color: #cde0d4;
  font-size: 13.5px;
}

.band-art {
  position: absolute;
  top: 0;
  right: 0;
  width: 54%;
  height: 100%;
  pointer-events: none;
}

.sun-disc {
  position: absolute;
  top: 28px;
  right: 24%;
  width: 94px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #e2a872;
}

.horizon {
  position: absolute;
  right: -5%;
  bottom: -72px;
  width: 118%;
  height: 175px;
  border-radius: 50% 50% 0 0;
  transform: rotate(-8deg);
}

.horizon-back {
  right: 5%;
  bottom: -94px;
  background: #3a634f;
  transform: rotate(9deg);
}

.horizon-front {
  background: #284b3b;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin: 38px 0 16px;
}

.section-heading h2 {
  margin: 6px 0 0;
  color: #1f312a;
  font-size: 20px;
  font-weight: 720;
}

.module-count {
  padding: 4px 10px;
  border-radius: 20px;
  background: #eef3f0;
  color: #6c7c72;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.module-tile {
  display: flex;
  min-height: 126px;
  align-items: center;
  gap: 16px;
  padding: 22px;
  border: 1px solid #dfe7e2;
  border-radius: 12px;
  background: #ffffff;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(25, 43, 36, 0.03);
  transition: border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.module-tile:hover {
  transform: translateY(-3px);
  border-color: #9abfa8;
  box-shadow: 0 10px 20px -6px rgba(27, 54, 45, 0.1);
}

.tile-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 11px;
  background: #e6f0ea;
  color: #236946;
  transition: transform 180ms ease;
}

.module-tile:hover .tile-icon {
  transform: scale(1.05);
}

.weather-tile .tile-icon {
  background: #fdf0e4;
  color: #b56534;
}

.tile-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.tile-kicker {
  color: #7d8c83;
  font-size: 9px;
}

.tile-copy strong {
  color: #1f312a;
  font-size: 15.5px;
  font-weight: 700;
}

.tile-copy > span:last-child {
  color: #738279;
  font-size: 12.5px;
}

.tile-arrow {
  flex: 0 0 auto;
  margin-left: auto;
  color: #87968d;
  transition: transform 180ms ease, color 180ms ease;
}

.module-tile:hover .tile-arrow {
  transform: translate(2px, -2px);
  color: #236946;
}

.dashboard-footer {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid #ebf0ed;
  color: #74847a;
  font-size: 12px;
}

.dashboard-footer :deep(.v-icon) {
  color: #3d7d58;
}

@media (max-width: 700px) {
  .page-heading h1 {
    font-size: 28px;
  }

  .welcome-band {
    min-height: 220px;
    padding: 28px 24px;
  }

  .band-art {
    right: -16%;
    width: 68%;
    opacity: 0.75;
  }

  .sun-disc {
    right: 20%;
    width: 72px;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>







<!-- <script setup lang="ts">
import { computed, onMounted, ref } from "vue";

definePageMeta({ middleware: "auth" });

const profile = ref<{ name?: string; given_name?: string; email?: string } | null>(null);
const firstName = computed(() => profile.value?.given_name || profile.value?.name?.split(" ")[0] || profile.value?.email?.split("@")[0] || "there");
const today = ref("");

onMounted(() => {
  const savedProfile = localStorage.getItem("google_user") || sessionStorage.getItem("google_user");
  if (savedProfile) {
    try {
      profile.value = JSON.parse(savedProfile);
    } catch {
      profile.value = null;
    }
  }

  today.value = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
});
</script>

<template>
  <div class="dashboard-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">YOUR WORKSPACE <span>{{ today }}</span></p>
        <h1>Good to see you, {{ firstName }}.</h1>
        <p class="intro">A little space to check in, scan, and plan your day.</p>
      </div>
      <div class="heading-icon" aria-hidden="true">
        <v-icon icon="mdi-white-balance-sunny" size="25" />
      </div>
    </header>

    <section class="welcome-band" aria-label="Workspace overview">
      <div class="welcome-copy">
        <p class="band-kicker">KOVA WORKSPACE</p>
        <h2>Make today<br />a little clearer.</h2>
        <p>Everything you need is one step away.</p>
      </div>
      <div class="band-art" aria-hidden="true">
        <span class="sun-disc"></span>
        <span class="horizon horizon-back"></span>
        <span class="horizon horizon-front"></span>
      </div>
    </section>

    <div class="section-heading">
      <div>
        <p class="eyebrow">PICK UP WHERE YOU LEFT OFF</p>
        <h2>Your modules</h2>
      </div>
      <span class="module-count">03 MODULES</span>
    </div>

    <section class="module-grid" aria-label="Workspace modules">
      <NuxtLink to="/qr-scanner" class="module-tile scan-tile">
        <span class="tile-icon"><v-icon icon="mdi-qrcode-scan" size="23" /></span>
        <span class="tile-copy">
          <span class="tile-kicker">CAPTURE</span>
          <strong>QR scanner</strong>
          <span>Read a code with your camera</span>
        </span>
        <v-icon class="tile-arrow" icon="mdi-arrow-up-right" size="20" />
      </NuxtLink>

      <NuxtLink to="/weather" class="module-tile weather-tile">
        <span class="tile-icon"><v-icon icon="mdi-weather-partly-cloudy" size="23" /></span>
        <span class="tile-copy">
          <span class="tile-kicker">OUTSIDE</span>
          <strong>Local weather</strong>
          <span>See conditions for any city</span>
        </span>
        <v-icon class="tile-arrow" icon="mdi-arrow-up-right" size="20" />
      </NuxtLink>
    </section>

    <footer class="dashboard-footer">
      <v-icon icon="mdi-shield-check-outline" size="19" />
      <span>Your workspace is ready when you are.</span>
    </footer>
  </div>
</template>

<style scoped>
.dashboard-page {
  width: min(100%, 1040px);
  margin: 0 auto;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}

.eyebrow,
.band-kicker,
.tile-kicker {
  margin: 0;
  color: #77857c;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1px;
}

.eyebrow span {
  margin-left: 12px;
  color: #9ba49e;
  font-weight: 500;
  letter-spacing: 0;
}

h1,
h2,
p {
  margin-top: 0;
}

.page-heading h1 {
  margin: 9px 0 7px;
  color: #20312a;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 720;
}

.intro {
  margin: 0;
  color: #78847c;
  font-size: 14px;
}

.heading-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #f1d9c2;
  border-radius: 50%;
  background: #fff3e5;
  color: #bb7138;
}

.welcome-band {
  position: relative;
  display: flex;
  min-height: 235px;
  align-items: center;
  overflow: hidden;
  padding: 32px 38px;
  border-radius: 10px;
  background: #203d34;
  color: #fff;
}

.welcome-copy {
  position: relative;
  z-index: 1;
}

.band-kicker {
  margin-bottom: 14px;
  color: #b5d0be;
}

.welcome-copy h2 {
  margin: 0 0 10px;
  font-size: 30px;
  line-height: 1.12;
  font-weight: 650;
}

.welcome-copy > p:last-child {
  margin: 0;
  color: #d1ded5;
  font-size: 13px;
}

.band-art {
  position: absolute;
  top: 0;
  right: 0;
  width: 52%;
  height: 100%;
}

.sun-disc {
  position: absolute;
  top: 26px;
  right: 24%;
  width: 96px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #e8b17b;
}

.horizon {
  position: absolute;
  right: -5%;
  bottom: -70px;
  width: 118%;
  height: 170px;
  border-radius: 50% 50% 0 0;
  transform: rotate(-8deg);
}

.horizon-back {
  right: 5%;
  bottom: -92px;
  background: #426c56;
  transform: rotate(9deg);
}

.horizon-front {
  background: #2c5140;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin: 36px 0 15px;
}

.section-heading h2 {
  margin: 7px 0 0;
  color: #293831;
  font-size: 20px;
  font-weight: 700;
}

.module-count {
  padding-bottom: 3px;
  color: #929d95;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.module-tile {
  display: flex;
  min-height: 123px;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e4e9e5;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition: border-color 150ms ease, transform 150ms ease;
}

.module-tile:hover {
  transform: translateY(-2px);
  border-color: #b8d2bf;
}

.tile-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  background: #e8f2ec;
  color: #28744e;
}

.weather-tile .tile-icon {
  background: #fff0e4;
  color: #b96a39;
}

.tile-copy {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.tile-kicker {
  color: #849087;
  font-size: 9px;
}

.tile-copy strong {
  color: #293831;
  font-size: 15px;
}

.tile-copy > span:last-child {
  color: #7e8981;
  font-size: 12px;
}

.tile-arrow {
  flex: 0 0 auto;
  margin-left: auto;
  color: #8a968e;
}

.dashboard-footer {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 25px;
  color: #79877e;
  font-size: 12px;
}

.dashboard-footer :deep(.v-icon) {
  color: #4c8a64;
}

@media (max-width: 700px) {
  .page-heading h1 {
    font-size: 28px;
  }

  .welcome-band {
    min-height: 220px;
    padding: 27px 23px;
  }

  .band-art {
    right: -16%;
    width: 68%;
    opacity: 0.75;
  }

  .sun-disc {
    right: 20%;
    width: 72px;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style> -->