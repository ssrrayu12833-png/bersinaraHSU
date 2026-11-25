// ============================================================
//  KONFIGURASI FIREBASE — ganti nilai di bawah dengan milik Anda
//  Firebase Console > Project settings > General > Your apps > Web app (</>)
//  (Nilai ini memang publik; keamanan dijaga oleh firestore.rules)
// ============================================================
export const firebaseConfig = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_PROJECT_ID.firebaseapp.com",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID",
};

// Username diubah menjadi email internal agar bisa memakai Firebase Authentication.
// Anggota tetap login hanya dengan username + password.
export const EMAIL_DOMAIN = "bersinara.app";

// Username admin. PASSWORD admin TIDAK ditulis di kode — dibuat di Firebase Console (lihat PANDUAN.md).
export const ADMIN_USERNAME = "bersinarahsu";
