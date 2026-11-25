import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, onSnapshot, collection, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, renderShell, $, esc, fmt, normUsername, toEmail, authErrorMsg, firebaseReady, ADMIN_EMAIL } from "./common.js";
import { REWARDS, MIN_TUKAR } from "./data.js";

renderShell("beruang");
$("#min").textContent = MIN_TUKAR;

const show = (id) => {
  ["login", "isadmin", "noprofile", "dash"].forEach((x) => $("#" + x).classList.toggle("hidden", x !== id));
};

$("#toggle").addEventListener("click", () => {
  const p = $("#p");
  p.type = p.type === "password" ? "text" : "password";
});
document.querySelectorAll("[data-logout]").forEach((b) => b.addEventListener("click", () => signOut(auth)));

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("#err");
  err.textContent = "";
  const u = normUsername($("#u").value);
  const p = $("#p").value;
  if (!u || !p) return (err.textContent = "Isi username dan password.");
  if (!firebaseReady) return (err.textContent = "Firebase belum dikonfigurasi (lihat PANDUAN.md).");
  const btn = $("#btn");
  btn.disabled = true;
  btn.textContent = "Masuk…";
  try {
    await signInWithEmailAndPassword(auth, toEmail(u), p);
  } catch (ex) {
    err.textContent = authErrorMsg(ex);
  }
  btn.disabled = false;
  btn.textContent = "Masuk";
});

function renderCatalog(poin) {
  $("#catalog").innerHTML = REWARDS.map((g) => `
    <h3 style="margin:22px 0 10px">${g.emoji} ${esc(g.grup)}</h3>
    <div class="rewards">
      ${g.items.map((r) => {
        const ok = poin >= Math.max(r.poin, MIN_TUKAR);
        return `<div class="reward ${ok ? "ok" : ""}">
          <div class="ic" aria-hidden="true">${r.ikon}</div>
          <div class="nm">${esc(r.nama)}</div>
          <span class="pt">${fmt(r.poin)} poin</span>
          <span class="st">${ok ? "✓ Poinmu cukup" : `Kurang ${fmt(Math.max(r.poin, MIN_TUKAR) - poin)} poin`}</span>
        </div>`;
      }).join("")}
    </div>`).join("");
}

function renderProfile(d) {
  const poin = Number(d.poin) || 0;
  $("#nama").textContent = `Halo, ${d.nama}! 👋`;
  $("#sub").textContent = `${d.domisili} · @${d.username}`;
  $("#poin").textContent = fmt(poin);
  const pct = Math.min(100, Math.round((poin / MIN_TUKAR) * 100));
  $("#barfill").style.width = pct + "%";
  $("#bar").setAttribute("aria-valuenow", pct);
  $("#status").textContent = poin >= MIN_TUKAR
    ? "🎉 Poinmu sudah cukup untuk ditukar reward!"
    : `Tinggal ${fmt(MIN_TUKAR - poin)} poin lagi untuk bisa menukar reward.`;
  renderCatalog(poin);
}

function renderHistory(snap) {
  const ul = $("#history");
  if (snap.empty) {
    ul.innerHTML = '<li class="muted">Belum ada riwayat. Setorkan sampahmu ke Kawan Bersih!</li>';
    return;
  }
  ul.innerHTML = snap.docs.map((s) => {
    const h = s.data();
    const t = h.tanggal?.toDate ? h.tanggal.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";
    const d = Number(h.perubahan) || 0;
    return `<li><span>${esc(h.keterangan || "Update poin")}<br><small class="muted">${t}</small></span>
      <span class="${d >= 0 ? "plus" : "minus"}">${d >= 0 ? "+" : ""}${fmt(d)}</span></li>`;
  }).join("");
}

let unsubs = [];
const clearSubs = () => { unsubs.forEach((f) => f()); unsubs = []; };

onAuthStateChanged(auth, (user) => {
  clearSubs();
  if (!user) return show("login");
  if (user.email === ADMIN_EMAIL) return show("isadmin");

  unsubs.push(onSnapshot(doc(db, "users", user.uid), (s) => {
    if (!s.exists()) return show("noprofile");
    renderProfile(s.data());
    show("dash");
  }, (e) => { console.error(e); show("noprofile"); }));

  unsubs.push(onSnapshot(
    query(collection(db, "users", user.uid, "riwayat"), orderBy("tanggal", "desc"), limit(20)),
    renderHistory,
    (e) => console.error(e)
  ));
});
