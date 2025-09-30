document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.navbar-overlay');
  if (!nav) return;

  const THRESHOLD = 20; // px de scroll para activar
  const apply = () => {
    if (window.scrollY > THRESHOLD) {
      nav.classList.add('navbar-solid');
    } else {
      nav.classList.remove('navbar-solid');
    }
  };

  apply(); // estado correcto al cargar
  window.addEventListener('scroll', apply, { passive: true });
});
