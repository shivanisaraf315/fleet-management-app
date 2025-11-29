// js/login.js
// Simple login validation for admin credentials

document.getElementById('loginBtn').addEventListener('click', function () {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const validEmail = 'admin@gmail.com';
  const validPassword = 'admin1234';

  if (email === validEmail && password === validPassword) {
    alert('Login success');
    // redirect to admin dashboard (relative path)
    window.location.href = 'admin.html';
  } else {
    alert('Wrong email or password');
  }
});

// allow pressing Enter to submit
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    document.getElementById('loginBtn').click();
  }
});
