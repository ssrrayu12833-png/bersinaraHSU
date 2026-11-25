// Data program BERUANG (sesuai brosur). Ubah di sini jika ketentuan berubah.
export const RATES = {
  botol: 10, // poin per kg botol plastik (PET)
  gelas: 20, // poin per kg gelas plastik
};
export const MIN_TUKAR = 50; // minimal penukaran (poin)

export const REWARDS = [
  { grup: "Kebutuhan Rumah Tangga", emoji: "🏠", items: [
    { nama: "Sabun Mandi", poin: 50, ikon: "🧼" },
    { nama: "Deterjen", poin: 50, ikon: "🧺" },
    { nama: "Minyak Goreng 1 Liter", poin: 100, ikon: "🛢️" },
    { nama: "Gula Pasir 1 Kg", poin: 100, ikon: "🍬" },
    { nama: "Beras 1 Kg", poin: 100, ikon: "🍚" },
    { nama: "Paket Sembako Mini", poin: 500, ikon: "🧺" },
  ]},
  { grup: "Perlengkapan Sekolah", emoji: "🎓", items: [
    { nama: "Buku Tulis", poin: 50, ikon: "📓" },
    { nama: "Pensil + Penghapus", poin: 50, ikon: "✏️" },
    { nama: "Tempat Pensil", poin: 200, ikon: "🖍️" },
    { nama: "Paket Alat Tulis", poin: 200, ikon: "📏" },
    { nama: "Tas Sekolah", poin: 700, ikon: "🎒" },
  ]},
];
