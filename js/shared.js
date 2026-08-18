// Dipakai di semua halaman setelah login (dashboard, flashcard, quiz).

function pastikanLogin() {
  const sudahLogin = localStorage.getItem('sudahLogin') === 'ya';
  if (!sudahLogin) {
    window.location.href = 'index.html';
    return null;
  }
  const namaEl = document.getElementById('namaPengguna');
  if (namaEl) namaEl.textContent = localStorage.getItem('namaPengguna') || 'Pengguna';
  return { nama: localStorage.getItem('namaPengguna') };
}

function pasangTombolLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem('sudahLogin');
    localStorage.removeItem('namaPengguna');
    window.location.href = 'index.html';
  });
}

// Ucapkan kata bahasa Inggris memakai Web Speech API (tanpa perlu file audio).
function ucapkanKata(teks) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(teks);
  utter.lang = 'en-US';
  utter.rate = 0.85;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

function ambilParam(nama) {
  return new URLSearchParams(window.location.search).get(nama);
}

// Muat daftar kategori aktif dari manifest.json, lalu ambil detail tiap file kategori.
async function muatDaftarKategori() {
  const resManifest = await fetch('data/manifest.json');
  if (!resManifest.ok) throw new Error('Gagal memuat manifest.json');
  const manifest = await resManifest.json();
  const daftarId = manifest.aktif || [];

  const semuaKategori = await Promise.all(
    daftarId.map(async (id) => {
      try {
        const res = await fetch(`data/categories/${id}.json`);
        if (!res.ok) return null;
        const data = await res.json();
        return {
          id: data.id || id,
          nama: data.nama || id,
          iconEmoji: data.iconEmoji || '📚',
          warnaTema: data.warnaTema || '#2EC4B6',
          urutan: typeof data.urutan === 'number' ? data.urutan : 999,
          jumlahKata: Array.isArray(data.kata) ? data.kata.length : 0
        };
      } catch (err) {
        console.error(`Gagal memuat kategori "${id}":`, err);
        return null;
      }
    })
  );

  return semuaKategori
    .filter(Boolean)
    .sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama));
}

// Muat detail lengkap satu kategori (termasuk daftar katanya).
async function muatDetailKategori(id) {
  const res = await fetch(`data/categories/${id}.json`);
  if (!res.ok) throw new Error('Kategori tidak ditemukan');
  return res.json();
}

document.addEventListener('DOMContentLoaded', pasangTombolLogout);
