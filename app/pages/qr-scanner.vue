<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

definePageMeta({ middleware: "auth" });

const videoElement = ref<HTMLVideoElement | null>(null);
const result = ref("");
const imageLoadError = ref(false);
const error = ref("");
const isScanning = ref(false);
const isImagePayload = computed(() => /^data:image\//i.test(result.value));
const imageSource = computed(() => {
  if (isImagePayload.value) return result.value;
  return /^https?:\/\//i.test(result.value) ? result.value : "";
});
const isWebLink = computed(() => /^https?:\/\//i.test(result.value));
let scanner: { start: () => Promise<void>; stop: () => void; destroy: () => void } | null = null;

async function startScanner() {
  error.value = "";
  result.value = "";
  imageLoadError.value = false;

  if (!videoElement.value) return;

  try {
    const { default: QrScanner } = await import("qr-scanner");
    scanner = new QrScanner(
      videoElement.value,
      (scanResult) => {
        result.value = typeof scanResult === "string" ? scanResult : scanResult.data;
        imageLoadError.value = false;
        stopScanner();
      },
      { preferredCamera: "environment", highlightScanRegion: true, highlightCodeOutline: true },
    );
    await scanner.start();
    isScanning.value = true;
  } catch (cause) {
    scanner?.destroy();
    scanner = null;
    error.value = cause instanceof Error ? cause.message : "Camera access failed. Check your browser permissions.";
    isScanning.value = false;
  }
}

function stopScanner() {
  scanner?.stop();
  isScanning.value = false;
}

onBeforeUnmount(() => {
  scanner?.destroy();
  scanner = null;
});
</script>

<template>
  <div class="scanner-page">
    <header class="page-heading">
      <p class="eyebrow">CAPTURE</p>
      <h1>QR scanner</h1>
      <p class="intro">Point your camera at a QR code to read it.</p>
    </header>

    <section class="scanner-layout">
      <div class="camera-panel">
        <div class="camera-topline">
          <span><i class="status-dot" :class="{ live: isScanning }"></i>{{ isScanning ? "Camera active" : "Camera ready" }}</span>
          <v-icon icon="mdi-qrcode-scan" size="20" />
        </div>
        <div class="video-frame">
          <video ref="videoElement" class="qr-video" muted playsinline></video>
          <div v-if="!isScanning" class="camera-empty">
            <span class="camera-icon"><v-icon icon="mdi-camera-outline" size="30" /></span>
            <strong>Ready to scan</strong>
            <span>Allow camera access when your browser asks.</span>
          </div>
        </div>
        <div class="camera-actions">
          <v-btn v-if="!isScanning" color="primary" prepend-icon="mdi-camera" @click="startScanner">Start camera</v-btn>
          <v-btn v-else color="error" variant="tonal" prepend-icon="mdi-stop-circle-outline" @click="stopScanner">Stop camera</v-btn>
          <span class="camera-hint">Camera access requires HTTPS or localhost.</span>
        </div>
      </div>

      <aside class="result-panel">
        <div class="result-title">
          <span class="result-icon"><v-icon icon="mdi-text-box-check-outline" size="20" /></span>
          <div><p class="eyebrow">LATEST READ</p><h2>Scan result</h2></div>
        </div>
        <div v-if="result" class="result-value">
          <img
            v-if="imageSource && !imageLoadError"
            class="result-image"
            :src="imageSource"
            alt="Image from scanned QR code"
            @error="imageLoadError = true"
          />
          <p v-if="!isImagePayload || imageLoadError" class="result-text">{{ result }}</p>
          <a
            v-if="isWebLink"
            class="result-link"
            :href="result"
            target="_blank"
            rel="noopener noreferrer"
          >
            <v-icon icon="mdi-open-in-new" size="16" />
            Open scanned link
          </a>
        </div>
        <div v-else class="result-placeholder">
          <v-icon icon="mdi-arrow-left-bottom" size="20" />
          <span>Your scanned code will appear here.</span>
        </div>
        <p v-if="error" class="error-message" role="alert">{{ error }}</p>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.scanner-page { width: min(100%, 1040px); margin: 0 auto; }
.page-heading { margin-bottom: 27px; }
.eyebrow { margin: 0 0 8px; color: #77857c; font-size: 10px; font-weight: 750; letter-spacing: 1px; }
h1 { margin: 0 0 7px; color: #20312a; font-size: 34px; font-weight: 720; }
.intro { margin: 0; color: #78847c; font-size: 14px; }
.scanner-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(250px, 0.8fr); gap: 16px; align-items: start; }
.camera-panel, .result-panel { border: 1px solid #e2e9e3; border-radius: 9px; background: #fff; }
.camera-panel { padding: 17px; }
.camera-topline { display: flex; height: 27px; align-items: center; justify-content: space-between; margin-bottom: 12px; color: #53635a; font-size: 12px; font-weight: 650; }
.camera-topline > span { display: flex; align-items: center; gap: 8px; }
.camera-topline > :deep(.v-icon) { color: #38805c; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #bac4bd; }
.status-dot.live { background: #32a56b; box-shadow: 0 0 0 3px #e0f3e8; }
.video-frame { position: relative; display: grid; min-height: 340px; overflow: hidden; place-items: center; border-radius: 7px; background: #15211c; }
.qr-video { display: block; width: 100%; max-height: 460px; aspect-ratio: 4 / 3; object-fit: cover; }
.camera-empty { position: absolute; display: grid; justify-items: center; gap: 10px; padding: 20px; color: #f5f8f5; text-align: center; }
.camera-icon { display: grid; width: 58px; height: 58px; place-items: center; border: 1px solid #536259; border-radius: 50%; color: #c5d9cb; }
.camera-empty strong { font-size: 14px; }
.camera-empty > span:last-child { color: #aab8af; font-size: 12px; }
.camera-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding-top: 15px; }
.camera-actions :deep(.v-btn) { text-transform: none; font-weight: 650; }
.camera-hint { color: #89958d; font-size: 11px; }
.result-panel { min-height: 230px; padding: 19px; }
.result-title { display: flex; align-items: center; gap: 11px; }
.result-icon { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 8px; background: #fff0e4; color: #b96a39; }
.result-title .eyebrow { margin-bottom: 3px; }
.result-title h2 { margin: 0; color: #293831; font-size: 16px; }
.result-placeholder { display: flex; align-items: flex-start; gap: 8px; margin-top: 35px; color: #89958d; font-size: 12px; line-height: 1.5; }
.result-placeholder :deep(.v-icon) { flex: 0 0 auto; color: #40845e; }
.result-value { display: grid; gap: 12px; overflow-wrap: anywhere; margin: 26px 0 0; padding: 13px; border-radius: 6px; background: #f2f6f2; color: #30493a; font-size: 13px; line-height: 1.6; }
.result-image { display: block; width: 100%; max-height: 320px; border-radius: 5px; background: #fff; object-fit: contain; }
.result-text { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-family: monospace; }
.result-link { display: inline-flex; align-items: center; gap: 5px; color: #28744e; font-size: 12px; font-weight: 650; text-decoration: none; }
.error-message { margin: 18px 0 0; color: #b43c36; font-size: 12px; line-height: 1.5; }
@media (max-width: 760px) { .scanner-layout { grid-template-columns: 1fr; } .video-frame { min-height: 260px; } h1 { font-size: 29px; } }
</style>