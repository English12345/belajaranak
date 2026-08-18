(async function initQuiz() {
  const user = pastikanLogin();
  if (!user) return;

  const kategoriId = ambilParam('kategori');
  if (!kategoriId) {
    window.location.href = 'dashboard.html';
    return;
  }

  const quizArea = document.getElementById('quizArea');
  quizArea.innerHTML = `<p class="section-sub">Menyiapkan soal...</p>`;

  function acakArray(arr) {
    const salinan = [...arr];
    for (let i = salinan.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
    }
    return salinan;
  }

  let kategoriNama = '';
  let kategoriIcon = '📚';
  let soalList = [];
  let soalIndex = 0;
  let skor = 0;
  let sudahDijawab = false;

  try {
    const data = await muatDetailKategori(kategoriId);
    kategoriNama = data.nama;
    kategoriIcon = data.iconEmoji || '📚';

    const kataList = data.kata || [];
    if (kataList.length < 4) {
      quizArea.innerHTML = `<div class="empty-state">Kelompok kata ini butuh minimal 4 kata untuk membuat kuis.</div>`;
      return;
    }

    const acak = acakArray(kataList);
    soalList = acak.map(item => {
      const distraktor = acakArray(kataList.filter(k => k.en !== item.en)).slice(0, 3);
      const opsi = acakArray([item, ...distraktor]);
      return { soal: item, opsi };
    });

    renderSoal();
  } catch (err) {
    quizArea.innerHTML = `<div class="empty-state">Gagal memuat kuis. Coba muat ulang halaman.</div>`;
    return;
  }

  function renderSoal() {
    sudahDijawab = false;
    const { soal, opsi } = soalList[soalIndex];

    quizArea.innerHTML = `
      <h2 class="section-title">🧠 Kuis: ${kategoriIcon} ${kategoriNama}</h2>
      <p class="section-sub">Soal ${soalIndex + 1} dari ${soalList.length}</p>
      <div class="quiz-card">
        <div class="quiz-emoji">${soal.emoji || '📚'}</div>
        <div class="quiz-question">Dalam Bahasa Inggris, ini disebut apa?</div>
        <div class="quiz-prompt">${soal.id}</div>
        <div class="options-grid" id="optionsGrid">
          ${opsi.map((o, i) => `<button class="option-btn" data-en="${o.en}" data-index="${i}">${o.en}</button>`).join('')}
        </div>
        <div class="quiz-footer">
          <span class="quiz-score-pill">Skor: ${skor} / ${soalIndex}</span>
          <button class="btn-secondary" id="nextSoalBtn" style="display:none;">Lanjut →</button>
        </div>
      </div>
    `;

    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => jawabSoal(btn, soal));
    });

    document.getElementById('nextSoalBtn').addEventListener('click', soalBerikutnya);
  }

  function jawabSoal(btn, soalBenar) {
    if (sudahDijawab) return;
    sudahDijawab = true;

    const dipilihBenar = btn.dataset.en === soalBenar.en;
    if (dipilihBenar) skor++;

    document.querySelectorAll('.option-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.en === soalBenar.en) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });

    document.querySelector('.quiz-score-pill').textContent = `Skor: ${skor} / ${soalIndex + 1}`;
    ucapkanKata(soalBenar.en);

    const nextSoalBtn = document.getElementById('nextSoalBtn');
    nextSoalBtn.style.display = 'inline-block';
    nextSoalBtn.textContent = soalIndex === soalList.length - 1 ? 'Lihat Hasil →' : 'Lanjut →';
  }

  function soalBerikutnya() {
    if (soalIndex < soalList.length - 1) {
      soalIndex++;
      renderSoal();
    } else {
      tampilkanHasil();
    }
  }

  function tampilkanHasil() {
    const persen = Math.round((skor / soalList.length) * 100);
    let pesan, emoji;
    if (persen >= 90) { pesan = 'Luar biasa! Kamu sudah hafal banget!'; emoji = '🏆'; }
    else if (persen >= 70) { pesan = 'Bagus sekali! Sedikit lagi sempurna!'; emoji = '🎉'; }
    else if (persen >= 50) { pesan = 'Cukup baik, ayo belajar lagi ya!'; emoji = '💪'; }
    else { pesan = 'Yuk belajar kartu katanya dulu, lalu coba lagi!'; emoji = '📚'; }

    quizArea.innerHTML = `
      <div class="result-card">
        <div class="result-emoji">${emoji}</div>
        <div class="result-score">${skor} / ${soalList.length}</div>
        <p class="result-sub">${pesan}</p>
        <div class="result-actions">
          <a href="flashcard.html?kategori=${encodeURIComponent(kategoriId)}" class="btn-secondary" style="text-decoration:none;">📖 Belajar Lagi</a>
          <button class="btn-primary" id="ulangiBtn" style="width:auto; padding:12px 24px;">🔁 Ulangi Kuis</button>
        </div>
      </div>
    `;
    document.getElementById('ulangiBtn').addEventListener('click', () => {
      window.location.reload();
    });
  }
})();
