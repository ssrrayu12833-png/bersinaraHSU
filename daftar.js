import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, renderShell, $, normUsername, validUsername, toEmail, authErrorMsg, toast, firebaseReady, ADMIN_USERNAME } from "./common.js";

renderShell("daftar");

$("#toggle").addEventListener("click", () => {
  const p = $("#password");
  p.type = p.type === "password" ? "text" : "password";
});

$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("#err");
  err.textContent = "";

  const nama = $("#nama").value.trim().replace(/\s+/g, " ");
  const domisili = $("#domisili").value.trim().replace(/\s+/g, " ");
  const username = normUsername($("#username").value);
  const password = $("#password").value;

  if (!nama || !domisili) return (err.textContent = "Nama dan domisili wajib diisi.");
  if (!validUsername(username)) return (err.textContent = "Username 3–20 karakter: huruf kecil, angka, titik, atau garis bawah.");
  if (username === ADMIN_USERNAME) return (err.textContent = "Username ini tidak tersedia.");
  if (password.length < 6) return (err.textContent = "Password minimal 6 karakter.");
  if (!firebaseReady) return (err.textContent = "Firebase belum dikonfigurasi (lihat PANDUAN.md).");

  const btn = $("#submit");
  btn.disabled = true;
  btn.textContent = "Mendaftarkan…";
  try {
    const cred = await createUserWithEmailAndPassword(auth, toEmail(username), password);
    await setDoc(doc(db, "users", cred.user.uid), {
      nama, domisili, username, poin: 0, dibuat: serverTimestamp(),
    });
    toast("Pendaftaran berhasil! Selamat bergabung 🌱");
    setTimeout(() => (location.href = "beruang.html"), 900);
  } catch (ex) {
    console.error(ex);
    err.textContent = authErrorMsg(ex);
    btn.disabled = false;
    btn.textContent = "Daftar Sekarang";
  }
});
