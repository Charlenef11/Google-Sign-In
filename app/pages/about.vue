<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const features = [
  {
    icon: "mdi-shield-account-outline",
    title: "Google OAuth Authentication",
    desc: "Role-based access control ensuring only authorized workspace members can access internal modules.",
  },
  {
    icon: "mdi-weather-partly-cloudy",
    title: "Live Weather Telemetry",
    desc: "Real-time meteorological data, 3-day outlook, and automated safety advisories powered by Open-Meteo.",
  },
  {
    icon: "mdi-qrcode-scan",
    title: "QR Pass Verification",
    desc: "Fast camera-based code scanning built for workspace attendance, asset tracking, and entry validation.",
  },
];
</script>

<template>
  <div class="about-page">
    <header class="page-header">
      <span class="micro-tag">SYSTEM OVERVIEW</span>
      <h1>About Kova</h1>
      <p class="subtitle">An integrated workspace portal built for seamless daily operations.</p>
    </header>

    <section class="hero-summary">
      <div class="summary-badge">
        <v-icon icon="mdi-hexagon-outline" size="22" />
        <span>KOVA WORKSPACE v1.0</span>
      </div>
      <h2>Unified tools in one clean environment.</h2>
      <p>
        Kova brings together secure authentication, real-time environmental monitoring, and quick QR scanning into a single responsive web application. Built as a System Integration project to demonstrate live API consumption, client-side reactivity, and cross-platform accessibility.
      </p>
    </section>

    <div class="section-title">
      <span class="micro-tag">ARCHITECTURE</span>
      <h2>Integrated Modules</h2>
    </div>

    <section class="features-grid">
      <article v-for="item in features" :key="item.title" class="feature-card">
        <div class="icon-box">
          <v-icon :icon="item.icon" size="24" />
        </div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </article>
    </section>

    <footer class="about-footer">
      <span>Built with Nuxt 3 · Vue 3 · Vuetify · Open-Meteo API</span>
    </footer>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 1040px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.micro-tag {
  display: inline-block;
  margin-bottom: 6px;
  color: #4a6b5d;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.page-header h1 {
  margin: 0 0 6px;
  color: #2c3e35;
  font-size: 32px;
  font-weight: 750;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.hero-summary {
  padding: 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f3f6f4 0%, #e5ece8 100%);
  border: 1px solid #d0dad5;
  margin-bottom: 32px;
}

.summary-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ffffff;
  color: #3b564a;
  font-size: 11px;
  font-weight: 750;
  margin-bottom: 16px;
}

.hero-summary h2 {
  margin: 0 0 10px;
  color: #1f332a;
  font-size: 24px;
  font-weight: 700;
}

.hero-summary p {
  margin: 0;
  max-width: 720px;
  color: #3b564a;
  font-size: 14px;
  line-height: 1.6;
}

.section-title {
  margin-bottom: 16px;
}

.section-title h2 {
  margin: 0;
  color: #2c3e35;
  font-size: 19px;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 24px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e0e8e4;
}

.icon-box {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 10px;
  background: #e5ece8;
  color: #4a6b5d;
  margin-bottom: 16px;
}

.feature-card h3 {
  margin: 0 0 8px;
  color: #2c3e35;
  font-size: 15px;
  font-weight: 700;
}

.feature-card p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.about-footer {
  margin-top: 32px;
  color: #94a3b8;
  font-size: 11px;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>