function initPage() {
  if (initPage.hasRun) return;
  initPage.hasRun = true;

  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');

  function applyActiveState(targetID) {
    navLinks.forEach(nav => {
      const isActive = nav.getAttribute('data-section') === targetID;
      nav.classList.toggle('active', isActive);
      if (isActive) {
        nav.setAttribute('aria-current', 'page');
      } else {
        nav.removeAttribute('aria-current');
      }
    });

    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === targetID);
    });
  }

  function setActiveSection() {
    let targetID = window.location.hash.substring(1) || 'program';
    if (!document.getElementById(targetID)) {
      targetID = 'program';
    }

    applyActiveState(targetID);
  }

  setActiveSection();

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetID = link.getAttribute('data-section');
      window.location.hash = targetID;

      applyActiveState(targetID);
      const targetSection = document.getElementById(targetID);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  window.addEventListener('hashchange', setActiveSection);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        applyActiveState(entry.target.id);
      }
    });
  }, { rootMargin: '-50% 0% -50% 0%', threshold: 0.01 });

  sections.forEach(section => observer.observe(section));
}

initPage.hasRun = false;

document.addEventListener('DOMContentLoaded', initPage);
