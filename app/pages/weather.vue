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
</style>