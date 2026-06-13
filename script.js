/* Shared site behavior: mobile nav + active link highlight */
(function () {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Mark current page link as active
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Update footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
