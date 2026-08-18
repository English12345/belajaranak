const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMsg.classList.remove('show');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (username === AKUN_VALID.username && password === AKUN_VALID.password) {
    // Simpan status login di perangkat ini supaya tidak perlu login ulang tiap buka aplikasi.
    localStorage.setItem('sudahLogin', 'ya');
    localStorage.setItem('namaPengguna', username);
    window.location.href = 'dashboard.html';
  } else {
    errorMsg.textContent = 'Username atau password salah.';
    errorMsg.classList.add('show');
  }
});
