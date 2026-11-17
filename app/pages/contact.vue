<script setup lang="ts">
import { ref, onMounted } from "vue";

definePageMeta({ middleware: "auth" });

const name = ref("");
const email = ref("");
const subject = ref("");
const message = ref("");
const submitted = ref(false);
const error = ref("");
const savedMessages = ref<any[]>([]);

// Load previous submissions from localStorage when page opens
onMounted(() => {
  const stored = localStorage.getItem("kova_contact_messages");
  if (stored) {
    try {
      savedMessages.value = JSON.parse(stored);
    } catch {
      savedMessages.value = [];
    }
  }
});

function submitForm() {
  error.value = "";
  if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
    error.value = "Please fill in your name, email, and message.";
    return;
  }

  // Create new message object
  const newMessage = {
    id: Date.now(),
    name: name.value.trim(),
    email: email.value.trim(),
    subject: subject.value.trim() || "General Inquiry",
    message: message.value.trim(),
    date: new Date().toLocaleString(),
  };

  // Save to list and localStorage
  savedMessages.value.unshift(newMessage);
  localStorage.setItem("kova_contact_messages", JSON.stringify(savedMessages.value));

  submitted.value = true;
}

function resetForm() {
  name.value = "";
  email.value = "";
  subject.value = "";
  message.value = "";
  submitted.value = false;
  error.value = "";
}

function clearHistory() {
  localStorage.removeItem("kova_contact_messages");
  savedMessages.value = [];
}
</script>

<template>
  <div class="contact-page">
    <header class="page-header">
      <span class="micro-tag">SUPPORT & INQUIRIES</span>
      <h1>Contact Us</h1>
      <p class="subtitle">Have questions about Kova Workspace or need technical assistance? Reach out below.</p>
    </header>

    <div class="contact-grid">
      <!-- Contact Form -->
      <section class="form-card">
        <div v-if="submitted" class="success-state">
          <div class="success-icon">
            <v-icon icon="mdi-check-circle-outline" size="42" color="#4a6b5d" />
          </div>
          <h2>Message Logged Successfully!</h2>
          <p>Your message has been saved to the local workspace storage. You can view it in the submissions panel.</p>
          <v-btn color="#4a6b5d" variant="flat" class="action-btn" @click="resetForm">
            Send Another Message
          </v-btn>
        </div>

        <form v-else @submit.prevent="submitForm">
          <div class="field-group">
            <label for="contact-name">Full Name</label>
            <v-text-field
              id="contact-name"
              v-model="name"
              placeholder="Juan Dela Cruz"
              variant="outlined"
              density="compact"
              hide-details
            />
          </div>

          <div class="field-group">
            <label for="contact-email">Email Address</label>
            <v-text-field
              id="contact-email"
              v-model="email"
              type="email"
              placeholder="juan@example.com"
              variant="outlined"
              density="compact"
              hide-details
            />
          </div>

          <div class="field-group">
            <label for="contact-subject">Subject (Optional)</label>
            <v-text-field
              id="contact-subject"
              v-model="subject"
              placeholder="Weather API feedback or account issue"
              variant="outlined"
              density="compact"
              hide-details
            />
          </div>

          <div class="field-group">
            <label for="contact-message">Message</label>
            <v-textarea
              id="contact-message"
              v-model="message"
              placeholder="Write your message here..."
              variant="outlined"
              rows="4"
              hide-details
            />
          </div>

          <p v-if="error" class="error-msg" role="alert">{{ error }}</p>

          <v-btn type="submit" block color="#4a6b5d" size="large" class="action-btn">
            Send & Save Message
            <v-icon end icon="mdi-send-outline" size="18" />
          </v-btn>
        </form>
      </section>

      <!-- Workspace Info & Local Database Log Sidebar -->
      <aside class="info-column">
        <div class="info-card log-card">
          <div class="log-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="info-icon"><v-icon icon="mdi-database-outline" size="20" /></div>
              <div>
                <h3>Stored Inquiries</h3>
                <p>{{ savedMessages.length }} message(s) saved locally</p>
              </div>
            </div>
            <v-btn v-if="savedMessages.length > 0" size="x-small" variant="text" color="error" @click="clearHistory">
              Clear
            </v-btn>
          </div>

          <div v-if="savedMessages.length > 0" class="messages-list">
            <div v-for="item in savedMessages" :key="item.id" class="message-item">
              <div class="msg-top">
                <strong>{{ item.name }}</strong>
                <span class="msg-date">{{ item.date }}</span>
              </div>
              <span class="msg-sub">{{ item.subject }}</span>
              <p>{{ item.message }}</p>
              <small>{{ item.email }}</small>
            </div>
          </div>
          <div v-else class="empty-log">
            <p>No messages sent yet. Try filling out the form!</p>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon"><v-icon icon="mdi-map-marker-outline" size="22" /></div>
          <div>
            <h3>Operations Hub</h3>
            <p>San Fernando, Central Luzon, Philippines</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
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

.contact-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
  align-items: start;
}

.form-card {
  padding: 32px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e0e8e4;
}

.field-group {
  margin-bottom: 18px;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  color: #3b564a;
  font-size: 12.5px;
  font-weight: 650;
}

.error-msg {
  margin: 0 0 14px;
  color: #e11d48;
  font-size: 12.5px;
}

.action-btn {
  color: #ffffff !important;
  font-weight: 650;
  text-transform: none;
  border-radius: 10px !important;
}

.success-state {
  text-align: center;
  padding: 28px 12px;
}

.success-icon {
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #e5ece8;
}

.success-state h2 {
  margin: 0 0 8px;
  color: #2c3e35;
  font-size: 20px;
}

.success-state p {
  margin: 0 0 22px;
  color: #64748b;
  font-size: 13.5px;
}

.info-column {
  display: grid;
  gap: 14px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e0e8e4;
}

.log-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  background: #e5ece8;
  color: #4a6b5d;
}

.info-card h3 {
  margin: 0 0 2px;
  color: #2c3e35;
  font-size: 13.5px;
  font-weight: 700;
}

.info-card p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.messages-list {
  display: grid;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.message-item {
  padding: 12px;
  border-radius: 10px;
  background: #f8faf9;
  border: 1px solid #dfe7e3;
  display: grid;
  gap: 3px;
}

.msg-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.msg-top strong {
  font-size: 12.5px;
  color: #2c3e35;
}

.msg-date {
  font-size: 10px;
  color: #94a3b8;
}

.msg-sub {
  font-size: 11px;
  font-weight: 700;
  color: #4a6b5d;
}

.message-item p {
  margin: 2px 0;
  font-size: 12px;
  color: #475569;
}

.message-item small {
  font-size: 10px;
  color: #94a3b8;
}

.empty-log {
  text-align: center;
  padding: 16px;
  color: #94a3b8;
  font-size: 12px;
  background: #f8faf9;
  border-radius: 10px;
  border: 1px dashed #dfe7e3;
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>