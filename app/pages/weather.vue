<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

definePageMeta({ middleware: "auth" });

interface WeatherLocation {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface WeatherSnapshot {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
}

interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

const city = ref("Manila");
const location = ref<WeatherLocation | null>(null);
const current = ref<WeatherSnapshot | null>(null);
const daily = ref<DailyForecast | null>(null);
const error = ref("");
const isLoading = ref(false);
const updatedAt = ref("");
const unit = ref<"C" | "F">("C");

function formatTemp(celsius?: number) {
  const safeValue = typeof celsius === "number" && Number.isFinite(celsius) ? celsius : 0;

  if (unit.value === "F") {
    return Math.round((safeValue * 9) / 5 + 32);
  }
  return Math.round(safeValue);
}

function conditionFor(code?: number) {
  const safeCode = typeof code === "number" ? code : 0;

  if (safeCode === 0) return { label: "Sunny & Bright", icon: "mdi-weather-sunny", tip: "Clear skies today. Stay hydrated if heading outdoors." };
  if (safeCode <= 3) return { label: "Partly Cloudy", icon: "mdi-weather-partly-cloudy", tip: "Comfortable cloud cover. Great weather for outdoor errands." };
  if (safeCode <= 48) return { label: "Mist / Foggy", icon: "mdi-weather-fog", tip: "Reduced visibility in some areas. Drive safely." };
  if (safeCode <= 57) return { label: "Light Drizzle", icon: "mdi-weather-partly-rainy", tip: "Light rain expected. Keep a small umbrella handy." };
  if (safeCode <= 67) return { label: "Rain Showers", icon: "mdi-weather-rainy", tip: "Rainy conditions detected. Bring rain gear before going out." };
  if (safeCode <= 77) return { label: "Snow Flurries", icon: "mdi-weather-snowy", tip: "Cold conditions with snow. Dress warmly." };
  if (safeCode <= 82) return { label: "Heavy Rain", icon: "mdi-weather-pouring", tip: "Heavy downpour possible. Watch out for wet roads." };
  if (safeCode <= 86) return { label: "Heavy Snow", icon: "mdi-weather-snowy-heavy", tip: "Heavy snow showers. Limit unnecessary travel." };
  return { label: "Thunderstorm", icon: "mdi-weather-lightning-rainy", tip: "Thunderstorm alert. Stay indoors and monitor updates." };
}

const upcomingDays = computed(() => {
  if (!daily.value) return [];

  const weatherCodes = daily.value.weather_code ?? [];
  const maxTemps = daily.value.temperature_2m_max ?? [];
  const minTemps = daily.value.temperature_2m_min ?? [];

  return daily.value.time.slice(1, 4).map((dateStr, idx) => {
    const realIndex = idx + 1;
    const dateObj = new Date(dateStr + "T00:00:00");
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(dateObj);

    return {
      date: dayName,
      code: weatherCodes[realIndex] ?? 0,
      max: maxTemps[realIndex] ?? 0,
      min: minTemps[realIndex] ?? 0,
    };
  });
});

async function loadWeather() {
  const query = city.value.trim();
  if (!query) {
    error.value = "Please type a city name to look up weather data.";
    return;
  }

  isLoading.value = true;
  error.value = "";
  try {
    const places = await $fetch<{ results?: WeatherLocation[] }>("https://geocoding-api.open-meteo.com/v1/search", {
      query: { name: query, count: 1, language: "en", format: "json" },
    });
    const found = places.results?.[0];
    if (!found) throw new Error("Location not found. Please try another municipality or city.");

    await loadWeatherAt(found.latitude, found.longitude, found);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Failed to retrieve weather records.";
  } finally {
    isLoading.value = false;
  }
}

async function loadWeatherAt(latitude: number, longitude: number, place: WeatherLocation) {
  isLoading.value = true;
  error.value = "";
  try {
    const response = await $fetch<{ current: WeatherSnapshot; daily: DailyForecast }>("https://api.open-meteo.com/v1/forecast", {
      query: {
        latitude,
        longitude,
        current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
        daily: "weather_code,temperature_2m_max,temperature_2m_min",
        forecast_days: 4,
        timezone: "auto",
      },
    });
    location.value = place;
    current.value = response.current;
    daily.value = response.daily;
    updatedAt.value = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date());
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Forecast API connection error.";
  } finally {
    isLoading.value = false;
  }
}

async function loadCurrentLocation() {
  if (!navigator.geolocation) {
    await loadWeather();
    return;
  }

  isLoading.value = true;
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        maximumAge: 300000,
        timeout: 7000,
      });
    });
    const { latitude, longitude } = position.coords;
    let place: WeatherLocation = { name: "GPS Coordinate Location", latitude, longitude };

    try {
      const address = await $fetch<{
        city?: string;
        locality?: string;
        principalSubdivision?: string;
        countryName?: string;
      }>("https://api.bigdatacloud.net/data/reverse-geocode-client", {
        query: { latitude, longitude, localityLanguage: "en" },
      });
      place = {
        ...place,
        name: address.city || address.locality || place.name,
        admin1: address.principalSubdivision,
        country: address.countryName,
      };
    } catch {
      city.value = "Manila";
    }

    city.value = place.name;
    await loadWeatherAt(latitude, longitude, place);
  } catch {
    city.value = "Manila";
    await loadWeather();
  }
}

onMounted(loadCurrentLocation);
</script>

<template>
  <div class="weather-module-container">
    <!-- Header Section -->
    <header class="custom-header">
      <div class="header-titles">
        <span class="custom-tag">FORECAST</span>
        <h1>Weather</h1>
        <p class="custom-desc">Check live temperature and conditions in any city.</p>
      </div>

      <div class="header-actions">
        <!-- Unit Switcher -->
        <div class="unit-toggle" role="group" aria-label="Temperature unit">
          <button type="button" :class="{ active: unit === 'C' }" @click="unit = 'C'">°C</button>
          <button type="button" :class="{ active: unit === 'F' }" @click="unit = 'F'">°F</button>
        </div>

        <form class="custom-search-box" @submit.prevent="loadWeather">
          <v-text-field
            v-model="city"
            aria-label="Location search"
            placeholder="Enter location..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
          />
          <v-btn type="submit" icon="mdi-arrow-right" aria-label="Submit search" color="#4a6b5d" :loading="isLoading" />
        </form>
      </div>
    </header>

    <p v-if="error" class="custom-error" role="alert"><v-icon icon="mdi-alert" size="16" /> {{ error }}</p>

    <template v-if="current && location">
      <!-- Main Hero Banner (Matte Sage / Olive Green) -->
      <section class="custom-hero-card" aria-label="Current conditions summary">
        <div class="hero-inner-content">
          <div class="loc-badge">
            <v-icon icon="mdi-map-marker-check" size="16" />
            <span>{{ location.name }}<template v-if="location.admin1">, {{ location.admin1 }}</template><template v-if="location.country">, {{ location.country }}</template></span>
          </div>
          <div class="temp-row">
            <span class="big-temp">{{ formatTemp(current.temperature_2m) }}°</span>
            <div class="weather-desc-group">
              <v-icon :icon="conditionFor(current.weather_code).icon" size="38" />
              <strong>{{ conditionFor(current.weather_code).label }}</strong>
            </div>
          </div>
          <p class="timestamp-note">Refreshed at {{ updatedAt }} (Local Time)</p>
        </div>

        <div class="hero-watermark-art" aria-hidden="true">
          <v-icon :icon="conditionFor(current.weather_code).icon" size="120" />
          <span class="ring-overlay"></span>
        </div>
      </section>

      <!-- Smart Weather Tip Bar -->
      <div class="advisory-bar">
        <v-icon icon="mdi-information-outline" size="18" color="#3b564a" />
        <span>{{ conditionFor(current.weather_code).tip }}</span>
      </div>

      <!-- 3-Column Metrics Grid -->
      <div class="grid-title-row">
        <div>
          <span class="section-micro-tag">DETAILS</span>
          <h2>Today's Overview</h2>
        </div>
        <span class="standard-badge">{{ unit === "C" ? "CELSIUS" : "FAHRENHEIT" }} / KM/H</span>
      </div>

      <section class="custom-metrics-grid" aria-label="Detailed metrics">
        <article class="metric-box">
          <div class="icon-wrap feels-bg"><v-icon icon="mdi-thermometer-high" /></div>
          <div class="metric-data">
            <span>Feels Like</span>
            <strong>{{ formatTemp(current.apparent_temperature) }}°{{ unit }}</strong>
          </div>
        </article>

        <article class="metric-box">
          <div class="icon-wrap humid-bg"><v-icon icon="mdi-water-percent" /></div>
          <div class="metric-data">
            <span>Humidity Level</span>
            <strong>{{ current.relative_humidity_2m }}%</strong>
          </div>
        </article>

        <article class="metric-box">
          <div class="icon-wrap wind-bg"><v-icon icon="mdi-weather-windy" /></div>
          <div class="metric-data">
            <span>Wind Velocity</span>
            <strong>{{ Math.round(current.wind_speed_10m) }} <small>km/h</small></strong>
          </div>
        </article>
      </section>

      <!-- 3-Day Forecast Section -->
      <div v-if="upcomingDays.length" class="forecast-section">
        <div class="grid-title-row">
          <div>
            <span class="section-micro-tag">OUTLOOK</span>
            <h2>Next 3 Days</h2>
          </div>
          <span class="standard-badge">HIGH / LOW</span>
        </div>

        <div class="forecast-grid">
          <article v-for="day in upcomingDays" :key="day.date" class="forecast-card">
            <span class="forecast-date">{{ day.date }}</span>
            <div class="forecast-condition">
              <v-icon :icon="conditionFor(day.code).icon" size="26" color="#4a6b5d" />
              <span>{{ conditionFor(day.code).label }}</span>
            </div>
            <div class="forecast-temps">
              <strong>{{ formatTemp(day.max) }}°</strong>
              <span>/ {{ formatTemp(day.min) }}°</span>
            </div>
          </article>
        </div>
      </div>
    </template>

    <div v-else-if="isLoading" class="loader-box">
      <v-progress-circular indeterminate color="#4a6b5d" size="40" />
      <span>Fetching weather dataset...</span>
    </div>

    <footer class="bottom-credit">
      <span>System Integration Project · Open-Meteo API Client</span>
    </footer>
  </div>
</template>

<style scoped>
.weather-module-container {
  max-width: 1080px;
  margin: 0 auto;
}

.custom-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.custom-tag {
  display: inline-block;
  margin-bottom: 6px;
  color: #4a6b5d;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.header-titles h1 {
  margin: 0 0 4px;
  color: #2c3e35;
  font-size: 32px;
  font-weight: 750;
}

.custom-desc {
  margin: 0;
  color: #64748b;
  font-size: 13.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unit-toggle {
  display: flex;
  padding: 4px;
  border-radius: 10px;
  background: #e5ece8;
  border: 1px solid #d0dad5;
}

.unit-toggle button {
  padding: 8px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #4a6b5d;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms ease;
}

.unit-toggle button.active {
  background: #4a6b5d;
  color: #ffffff;
}

.custom-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(100%, 300px);
}

.custom-search-box :deep(.v-field) {
  background: #ffffff;
  border-radius: 10px;
}

.custom-search-box :deep(.v-btn) {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  box-shadow: none;
  color: #ffffff;
}

.custom-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: #fff1f2;
  color: #e11d48;
  font-size: 13px;
  font-weight: 500;
}

/* Matte Sage / Olive Green Fade Gradient */
.custom-hero-card {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 255px;
  padding: 32px;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg, #f3f6f4 0%, #e5ece8 100%);
  border: 1px solid #d0dad5;
  box-shadow: 0 10px 25px -5px rgba(74, 107, 93, 0.08);
}

.hero-inner-content {
  position: relative;
  z-index: 2;
}

.loc-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ffffff;
  color: #3b564a;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(59, 86, 74, 0.08);
}

.temp-row {
  display: flex;
  align-items: center;
  gap: 22px;
  margin: 16px 0 8px;
}

.big-temp {
  color: #1f332a;
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
}

.weather-desc-group {
  display: grid;
  gap: 4px;
  color: #3b564a;
}

.weather-desc-group strong {
  font-size: 14px;
  font-weight: 700;
}

.timestamp-note {
  margin: 0;
  color: #6b7280;
  font-size: 11px;
}

.hero-watermark-art {
  position: absolute;
  right: 6%;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 160px;
  height: 160px;
  color: #5d8272;
  opacity: 0.22;
}

.ring-overlay {
  position: absolute;
  width: 150px;
  height: 150px;
  border: 2px dashed #4a6b5d;
  border-radius: 50%;
}

.advisory-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 11px 16px;
  border-radius: 10px;
  background: #f8faf9;
  border: 1px solid #dfe7e3;
  color: #3b564a;
  font-size: 12.5px;
  font-weight: 500;
}

.grid-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 28px 0 14px;
}

.section-micro-tag {
  display: block;
  margin-bottom: 2px;
  color: #4a6b5d;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
}

.grid-title-row h2 {
  margin: 0;
  color: #2c3e35;
  font-size: 18px;
  font-weight: 700;
}

.standard-badge {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.custom-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e0e8e4;
  box-shadow: 0 4px 12px rgba(74, 107, 93, 0.03);
}

.icon-wrap {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
}

.feels-bg { background: #fdf4ed; color: #b45309; }
.humid-bg { background: #eef5f2; color: #2d6a4f; }
.wind-bg { background: #f0f7f4; color: #386641; }

.metric-data {
  display: grid;
  gap: 3px;
}

.metric-data span {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

.metric-data strong {
  color: #2c3e35;
  font-size: 20px;
  font-weight: 750;
}

.metric-data small {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
}

/* 3-Day Forecast Cards */
.forecast-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.forecast-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e0e8e4;
}

.forecast-date {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.forecast-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e35;
  font-size: 13px;
  font-weight: 600;
}

.forecast-temps {
  margin-top: auto;
  font-size: 16px;
}

.forecast-temps strong {
  color: #1f332a;
  font-weight: 750;
}

.forecast-temps span {
  color: #64748b;
  font-size: 13px;
}

.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 260px;
  color: #64748b;
  font-size: 13px;
}

.bottom-credit {
  margin-top: 30px;
  text-align: right;
  color: #94a3b8;
  font-size: 10px;
}

@media (max-width: 768px) {
  .custom-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
  }
  .custom-search-box {
    flex: 1;
  }
  .custom-metrics-grid,
  .forecast-grid {
    grid-template-columns: 1fr;
  }
  .big-temp {
    font-size: 64px;
  }
}
</style>





<!-- 
<script setup lang="ts">

import { onMounted, ref } from "vue";

definePageMeta({ middleware: "auth" });

interface WeatherLocation {

  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;

}

interface WeatherSnapshot {

  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;

}

const city = ref("Manila");

const location = ref<WeatherLocation | null>(null);
const current = ref<WeatherSnapshot | null>(null);
const error = ref("");
const isLoading = ref(false);
const updatedAt = ref("");

function conditionFor(code: number) {

  if (code === 0) return { label: "Clear sky", icon: "mdi-weather-sunny" };
  if (code <= 3) return { label: "Partly cloudy", icon: "mdi-weather-partly-cloudy" };
  if (code <= 48) return { label: "Foggy", icon: "mdi-weather-fog" };
  if (code <= 57) return { label: "Drizzle", icon: "mdi-weather-partly-rainy" };
  if (code <= 67) return { label: "Rain", icon: "mdi-weather-rainy" };
  if (code <= 77) return { label: "Snow", icon: "mdi-weather-snowy" };
  if (code <= 82) return { label: "Rain showers", icon: "mdi-weather-pouring" };
  if (code <= 86) return { label: "Snow showers", icon: "mdi-weather-snowy-heavy" };
  return { label: "Thunderstorms", icon: "mdi-weather-lightning-rainy" };

}

async function loadWeather() {

  const query = city.value.trim();

  if (!query) {

    error.value = "Enter a city name to check the weather.";
    return;

  }

  isLoading.value = true;

  error.value = "";
  try {

    const places = await $fetch<{ results?: WeatherLocation[] }>("https://geocoding-api.open-meteo.com/v1/search", {

      query: { name: query, count: 1, language: "en", format: "json" },

    });

    const found = places.results?.[0];

    if (!found) throw new Error("We couldn't find that place. Try another city.");

    await loadWeatherAt(found.latitude, found.longitude, found);

  } catch (cause) {

    error.value = cause instanceof Error ? cause.message : "Weather data could not be loaded.";

  } finally {

    isLoading.value = false;

  }
}

async function loadWeatherAt(latitude: number, longitude: number, place: WeatherLocation) {

  isLoading.value = true;
  error.value = "";

  try {

    const response = await $fetch<{ current: WeatherSnapshot }>("https://api.open-meteo.com/v1/forecast", {

      query: {

        latitude,
        longitude,
        current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
        timezone: "auto",

      },
    });

    location.value = place;
    current.value = response.current;
    updatedAt.value = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date());

  } catch (cause) {

    error.value = cause instanceof Error ? cause.message : "Weather data could not be loaded.";

  } finally {

    isLoading.value = false;

  }
}

async function loadCurrentLocation() {

  if (!navigator.geolocation) {
    await loadWeather();
    return;

  }

  isLoading.value = true;

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        maximumAge: 300000,
        timeout: 7000,

      });
    });

    const { latitude, longitude } = position.coords;

    let place: WeatherLocation = { name: "Your current location", latitude, longitude };

    try {

      const address = await $fetch<{
        city?: string;
        locality?: string;
        principalSubdivision?: string;
        countryName?: string;

      }>("https://api.bigdatacloud.net/data/reverse-geocode-client", {

        query: { latitude, longitude, localityLanguage: "en" },

      });

      place = {

        ...place,
        name: address.city || address.locality || place.name,
        admin1: address.principalSubdivision,
        country: address.countryName,

      };

    } catch {

      city.value = "Current location";

    }


    city.value = place.name;

    await loadWeatherAt(latitude, longitude, place);

  } catch {

    city.value = "Manila";
    await loadWeather();

  }
}

onMounted(loadCurrentLocation);
</script>

<template>

  <div class="weather-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">OUTSIDE</p>
        <h1>Weather</h1>
        <p class="intro">A fresh look at conditions wherever you are.</p>
      </div>

      <form class="city-search" @submit.prevent="loadWeather">
        <v-text-field v-model="city" aria-label="City name" placeholder="Search city" prepend-inner-icon="mdi-map-marker-outline" variant="outlined" density="comfortable" hide-details />
        <v-btn type="submit" icon="mdi-magnify" aria-label="Search weather" color="primary" :loading="isLoading" />
      </form>

    </header>


    <p v-if="error" class="error-message" role="alert">{{ error }}</p>

    <template v-if="current && location">
      <section class="current-weather" aria-label="Current weather">
        <div class="current-main">
          <div class="location-line">
            <v-icon icon="mdi-map-marker" size="18" />
            <span>{{ location.name }}<template v-if="location.admin1">, {{ location.admin1 }}</template><template v-if="location.country">, {{ location.country }}</template></span>
          </div>
          <div class="temperature-line">
            <span class="temperature">{{ Math.round(current.temperature_2m) }}°</span>
            <span class="condition"><v-icon :icon="conditionFor(current.weather_code).icon" size="35" /><strong>{{ conditionFor(current.weather_code).label }}</strong></span>
          </div>
          <p class="updated">Updated {{ updatedAt }} <span>·</span> Local time</p>
        </div>
        <div class="weather-art" aria-hidden="true">
          <v-icon :icon="conditionFor(current.weather_code).icon" size="108" />
          <span class="art-circle"></span>
        </div>
      </section>


      <div class="detail-heading"><div><p class="eyebrow">AT A GLANCE</p><h2>Current conditions</h2></div><span class="units-note">METRIC</span></div>

      <section class="detail-grid" aria-label="Weather details">
        <article class="detail-item"><span class="detail-icon feels"><v-icon icon="mdi-thermometer" /></span><div><span>Feels like</span><strong>{{ Math.round(current.apparent_temperature) }}°</strong></div></article>

        <article class="detail-item"><span class="detail-icon humidity"><v-icon icon="mdi-water-percent" /></span><div><span>Humidity</span><strong>{{ current.relative_humidity_2m }}%</strong></div></article>

        <article class="detail-item"><span class="detail-icon wind"><v-icon icon="mdi-weather-windy" /></span><div><span>Wind speed</span><strong>{{ Math.round(current.wind_speed_10m) }} <small>km/h</small></strong></div></article>
      </section>

    </template>


    <div v-else-if="isLoading" class="loading-state"><v-progress-circular indeterminate color="primary" /><span>Finding the forecast...</span></div>

    <p class="source-note">Weather data by Open-Meteo</p>
  </div>
</template>

<style scoped>

.weather-page { width: min(100%, 1040px); margin: 0 auto; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 22px; margin-bottom: 27px; }
.eyebrow { margin: 0 0 8px; color: #77857c; font-size: 10px; font-weight: 750; letter-spacing: 1px; }

h1 { margin: 0 0 7px; color: #20312a; font-size: 34px; font-weight: 720; }

.intro { margin: 0; color: #78847c; font-size: 14px; }
.city-search { display: flex; width: min(100%, 330px); align-items: center; gap: 8px; }
.city-search :deep(.v-field) { background: #fff; }
.city-search :deep(.v-btn) { width: 48px; height: 48px; border-radius: 8px; }
.current-weather { position: relative; display: flex; min-height: 280px; align-items: center; overflow: hidden; padding: 34px; border-radius: 10px; background: #e6f0ec; }
.current-main { position: relative; z-index: 1; }
.location-line { display: flex; align-items: center; gap: 5px; color: #597268; font-size: 13px; font-weight: 600; }
.location-line :deep(.v-icon) { color: #bd6f3e; }
.temperature-line { display: flex; align-items: center; gap: 19px; margin: 12px 0 4px; }
.temperature { color: #213d33; font-size: 82px; font-weight: 650; line-height: 1; }
.condition { display: grid; justify-items: start; gap: 4px; color: #496357; }
.condition strong { font-size: 13px; font-weight: 650; }
.updated { margin: 9px 0 0; color: #74867d; font-size: 11px; }
.updated span { margin: 0 4px; }
.weather-art { position: absolute; top: 50%; right: 8%; display: grid; width: 180px; height: 180px; place-items: center; transform: translateY(-50%); color: #ae754b; }
.weather-art :deep(.v-icon) { position: relative; z-index: 1; filter: drop-shadow(0 9px 8px #4963572a); }
.art-circle { position: absolute; width: 165px; aspect-ratio: 1; border: 1px solid #bed2c8; border-radius: 50%; }
.detail-heading { display: flex; align-items: end; justify-content: space-between; margin: 33px 0 14px; }
.detail-heading h2 { margin: 0; color: #293831; font-size: 19px; }
.units-note { padding-bottom: 2px; color: #929d95; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; }
.detail-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); overflow: hidden; border: 1px solid #e2e9e3; border-radius: 8px; background: #fff; }
.detail-item { display: flex; min-height: 100px; align-items: center; gap: 13px; padding: 18px; }
.detail-item + .detail-item { border-left: 1px solid #e8ede9; }
.detail-icon { display: grid; width: 42px; height: 42px; flex: 0 0 auto; place-items: center; border-radius: 8px; }
.detail-icon.feels { background: #fff0e3; color: #bb7138; }
.detail-icon.humidity { background: #e9f1fa; color: #4d789e; }
.detail-icon.wind { background: #e9f2ea; color: #4a8258; }
.detail-item > div { display: grid; gap: 5px; }
.detail-item > div > span { color: #7d8981; font-size: 11px; }
.detail-item strong { color: #283a31; font-size: 21px; font-weight: 700; }
.detail-item small { font-size: 11px; font-weight: 500; }
.source-note { margin: 20px 0 0; color: #99a39c; font-size: 10px; text-align: right; }
.loading-state { display: flex; min-height: 250px; align-items: center; justify-content: center; gap: 12px; color: #78847c; font-size: 13px; }
.error-message { margin: 0 0 15px; color: #b43c36; font-size: 13px; }
@media (max-width: 700px) { .page-heading { align-items: flex-start; flex-direction: column; } .city-search { width: 100%; } h1 { font-size: 29px; } .current-weather { min-height: 235px; padding: 24px; } .temperature { font-size: 68px; } .temperature-line { gap: 11px; } .weather-art { right: -18%; opacity: 0.42; } .detail-grid { grid-template-columns: 1fr; } .detail-item + .detail-item { border-top: 1px solid #e8ede9; border-left: 0; } }
</style>  -->