import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, EMAIL_DOMAIN, ADMIN_USERNAME } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ADMIN_EMAIL = `${ADMIN_USERNAME}@${EMAIL_DOMAIN}`;
export { ADMIN_USERNAME };

export const firebaseReady = !String(firebaseConfig.apiKey).startsWith("ISI_");

/* ---------- helper ---------- */
export const normUsername = (s) => String(s || "").trim().toLowerCase();
export const validUsername = (u) => /^[a-z0-9._]{3,20}$/.test(u);
export const toEmail = (u) => `${u}@${EMAIL_DOMAIN}`;
export const fmt = (n) => new Intl.NumberFormat("id-ID").format(n ?? 0);
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);

export function authErrorMsg(e) {
  const map = {
    "auth/email-already-in-use": "Username sudah dipakai. Coba username lain.",
    "auth/weak-password": "Password terlalu lemah (minimal 6 karakter).",
    "auth/invalid-credential": "Username atau password salah.",
    "auth/invalid-login-credentials": "Username atau password salah.",
    "auth/user-not-found": "Username atau password salah.",
    "auth/wrong-password": "Username atau password salah.",
    "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
    "auth/network-request-failed": "Gagal terhubung ke internet. Periksa koneksi Anda.",
    "auth/operation-not-allowed": "Login email/password belum diaktifkan di Firebase (lihat PANDUAN.md).",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Konfigurasi Firebase belum diisi dengan benar.",
    "permission-denied": "Akses ditolak oleh aturan database. Periksa firestore.rules.",
  };
  return map[e?.code] || `Terjadi kesalahan (${e?.code || e?.message || "tidak diketahui"}).`;
}

export function toast(msg, type = "ok") {
  let box = $("#toasts");
  if (!box) {
    box = document.createElement("div");
    box.id = "toasts";
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.classList.add("out"), 3200);
  setTimeout(() => t.remove(), 3700);
}

/* ---------- header & footer bersama ---------- */
export function renderShell(active) {
  const nav = [
    ["index.html", "Beranda", "home"],
    ["daftar.html", "Daftar Member", "daftar"],
    ["beruang.html", "Beruang", "beruang"],
  ];
  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <div class="brandbar">
        <a href="index.html" aria-label="Bersinara — beranda">
          <img class="logo" src="assets/logo.jpg" alt="Logo Bersinara — Aksi Kecil, untuk Bumi yang Lebih Baik" />
        </a>
      </div>
      <nav class="nav" aria-label="Menu utama">
        ${nav.map(([href, label, key]) => `<a href="${href}" class="${key === active ? "active" : ""}" ${key === active ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>`;
  }
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <p><strong>Bersinara_HSU</strong> — Aksi Kecil, untuk Bumi yang Lebih Baik</p>
      <p class="muted">Amuntai, Kabupaten Hulu Sungai Utara · © 2026 · <a href="admin.html">Admin</a></p>`;
  }
  if (!firebaseReady) {
    const b = document.createElement("div");
    b.className = "banner warn";
    b.innerHTML = "⚠️ Firebase belum dikonfigurasi. Isi <code>js/firebase-config.js</code> (lihat PANDUAN.md) agar pendaftaran & poin berfungsi.";
    document.body.prepend(b);
  }
}
