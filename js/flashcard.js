(async function initFlashcard() {
  const user = pastikanLogin();
  if (!user) return;

  const kategoriId = ambilParam('kategori');
  if (!kategoriId) {
    window.location.href = 'dashboard.html';
    return;
  }

  const judulEl = document.getElementById('judulKategori');
  const progressLabel = document.getElementById('progressLabel');
  const progressFill = document.getElementById('progressFill');
  const flipCard = document.getElementById('flipCard');
  const emojiFront = document.getElementById('emojiFront');
  const emojiBack = document.getElementById('emojiBack');
  const kataIndo = document.getElementById('kataIndo');
  const kataInggris = document.getElementById('kataInggris');
  const speakBtn = document.getElementById('speakBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const quizLink = document.getElementById('quizLink');

  let kataList = [];
  let index = 0;

  function acakArray(arr) {
    const salinan = [...arr];
    for (let i = salinan.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
    }
    return salinan;
  }

  function tampilkanKartu() {
    const item = kataList[index];
    flipCard.classList.remove('flipped');
    emojiFront.textContent = item.emoji || '📚';
    emojiBack.textContent = item.emoji || '📚';
    kataIndo.textContent = item.id;
    kataInggris.textContent = item.en;

    progressLabel.textContent = `${index + 1} / ${kataList.length}`;
    progressFill.style.width = `${((index + 1) / kataList.length) * 100}%`;

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === kataList.length - 1;
  }

  try {
    const data = await muatDetailKategori(kategoriId);

    judulEl.textContent = `${data.iconEmoji || '📚'} ${data.nama}`;
    kataList = data.kata || [];
    quizLink.href = `quiz.html?kategori=${encodeURIComponent(kategoriId)}`;

    if (!kataList.length) {
      judulEl.textContent = 'Belum ada kata di kelompok ini';
      return;
    }
    tampilkanKartu();
  } catch (err) {
    judulEl.textContent = 'Gagal memuat kategori';
    return;
  }

  flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('flipped');
  });

  speakBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ucapkanKata(kataList[index].en);
  });

  prevBtn.addEventListener('click', () => {
    if (index > 0) { index--; tampilkanKartu(); }
  });

  nextBtn.addEventListener('click', () => {
    if (index < kataList.length - 1) { index++; tampilkanKartu(); }
  });

  shuffleBtn.addEventListener('click', () => {
    kataList = acakArray(kataList);
    index = 0;
    tampilkanKartu();
  });
})();
