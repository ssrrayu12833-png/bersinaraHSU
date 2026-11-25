import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, doc, onSnapshot, writeBatch, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, renderShell, $, esc, fmt, normUsername, toEmail, authErrorMsg, toast, firebaseReady, ADMIN_EMAIL } from "./common.js";
import { RATES, MIN_TUKAR, REWARDS } from "./data.js";

renderShell("");

const show = (id) => ["login", "panel"].forEach((x) => $("#" + x).classList.toggle("hidden", x !== id));
let members = [];
let unsub = null;

/* ---------- login ---------- */
$("#toggle").addEventListener("click", () => {
  const p = $("#p");
  p.type = p.type === "password" ? "text" : "password";
});
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
    const cred = await signInWithEmailAndPassword(auth, toEmail(u), p);
    if (cred.user.email !== ADMIN_EMAIL) {
      await signOut(auth);
      err.textContent = "Akun ini bukan admin.";
    }
  } catch (ex) {
    err.textContent = authErrorMsg(ex);
  }
  btn.disabled = false;
  btn.textContent = "Masuk";
});
$("#logout").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (unsub) { unsub(); unsub = null; }
  if (!user || user.email !== ADMIN_EMAIL) return show("login");
  show("panel");
  unsub = onSnapshot(collection(db, "users"), (snap) => {
    members = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(a.nama).localeCompare(String(b.nama), "id"));
    render();
  }, (e) => {
    console.error(e);
    $("#members").innerHTML = `<p class="error">${esc(authErrorMsg(e))}</p>`;
  });
});

/* ---------- daftar member ---------- */
function render() {
  const q = $("#search").value.trim().toLowerCase();
  $("#s-members").textContent = fmt(members.length);
  $("#s-poin").textContent = fmt(members.reduce((a, m) => a + (Number(m.poin) || 0), 0));
  $("#s-siap").textContent = fmt(members.filter((m) => (Number(m.poin) || 0) >= MIN_TUKAR).length);

  const list = members.filter((m) => !q || `${m.nama} ${m.domisili} ${m.username}`.toLowerCase().includes(q));
  $("#members").innerHTML = list.length
    ? list.map((m) => `
      <div class="card member">
        <div class="who"><b>${esc(m.nama)}</b><br><span class="muted">${esc(m.domisili)} · @${esc(m.username)}</span></div>
        <div class="right">
          <div class="pts">${fmt(m.poin)} <small style="font-size:.5em">poin</small></div>
          <button class="btn small" data-id="${esc(m.id)}">Update</button>
        </div>
      </div>`).join("")
    : '<p class="muted">Belum ada member yang cocok.</p>';
}
$("#search").addEventListener("input", render);
$("#members").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-id]");
  if (b) openDialog(b.dataset.id);
});

/* ---------- dialog update poin ---------- */
const dlg = $("#dlg");
let current = null;

$("#reward").innerHTML = REWARDS.map((g) =>
  `<optgroup label="${esc(g.grup)}">${g.items.map((r) => `<option value="${esc(r.nama)}" data-p="${r.poin}">${esc(r.nama)} — ${r.poin} poin</option>`).join("")}</optgroup>`
).join("");

const mode = () => document.querySelector('input[name="mode"]:checked').value;

function compute() {
  const m = mode();
  let delta = 0, ket = "";
  if (m === "setor") {
    const b = Math.max(0, parseFloat($("#kg-botol").value) || 0);
    const g = Math.max(0, parseFloat($("#kg-gelas").value) || 0);
    delta = Math.round(b * RATES.botol + g * RATES.gelas);
    const parts = [];
    if (b) parts.push(`botol ${b} kg`);
    if (g) parts.push(`gelas ${g} kg`);
    ket = `Setor sampah: ${parts.join(", ") || "-"}`;
  } else if (m === "tukar") {
    const opt = $("#reward").selectedOptions[0];
    delta = -Number(opt.dataset.p);
    ket = `Tukar reward: ${opt.value}`;
  } else {
    delta = parseInt($("#delta").value, 10) || 0;
    ket = $("#ket").value.trim() || "Penyesuaian poin";
  }
  return { delta, ket };
}

function refresh() {
  const m = mode();
  $("#m-setor").classList.toggle("hidden", m !== "setor");
  $("#m-tukar").classList.toggle("hidden", m !== "tukar");
  $("#m-manual").classList.toggle("hidden", m !== "manual");
  const { delta } = compute();
  const after = (Number(current?.poin) || 0) + delta;
  $("#preview").textContent = `Perubahan: ${delta >= 0 ? "+" : ""}${fmt(delta)} poin → total ${fmt(after)} poin`;
  $("#d-err").textContent = "";
}
dlg.addEventListener("input", refresh);
dlg.addEventListener("change", refresh);

function openDialog(id) {
  current = members.find((m) => m.id === id);
  if (!current) return;
  $("#d-title").textContent = current.nama;
  $("#d-sub").textContent = `${current.domisili} · poin sekarang: ${fmt(current.poin)}`;
  $("#dlg-form").reset();
  refresh();
  dlg.showModal();
}
$("#d-cancel").addEventListener("click", () => dlg.close());

$("#dlg-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("#d-err");
  const { delta, ket } = compute();
  const now = Number(current.poin) || 0;
  const m = mode();

  if (delta === 0) return (err.textContent = "Isi jumlah sampah / pilih reward / isi perubahan poin.");
  if (m === "setor" && delta < 0) return (err.textContent = "Jumlah tidak valid.");
  if (m === "tukar") {
    if (now < MIN_TUKAR) return (err.textContent = `Minimal penukaran ${MIN_TUKAR} poin.`);
    if (now + delta < 0) return (err.textContent = "Poin member tidak cukup untuk reward ini.");
  }
  if (now + delta < 0) return (err.textContent = "Total poin tidak boleh kurang dari 0.");

  const btn = $("#d-save");
  btn.disabled = true;
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, "users", current.id);
    batch.update(userRef, { poin: increment(delta) });
    batch.set(doc(collection(userRef, "riwayat")), {
      tanggal: serverTimestamp(), perubahan: delta, jenis: m, keterangan: ket,
    });
    await batch.commit();
    toast(`Poin ${current.nama} diperbarui (${delta >= 0 ? "+" : ""}${delta})`);
    dlg.close();
  } catch (ex) {
    console.error(ex);
    err.textContent = authErrorMsg(ex);
  }
  btn.disabled = false;
});
