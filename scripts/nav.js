function initPage() {
  if (initPage.hasRun) return;
  initPage.hasRun = true;

  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');

  function setActiveSection() {
    let targetID = window.location.hash.substring(1) || 'program';
    if (!document.getElementById(targetID)) {
      targetID = 'program';
    }

    navLinks.forEach(nav => {
      nav.classList.remove('active');
      if (nav.getAttribute('data-section') === targetID) {
        nav.classList.add('active');
      }
    });

    sections.forEach(sec => {
      sec.classList.remove('active');
      if (sec.id === targetID) {
        sec.classList.add('active');
      }
    });
  }

  setActiveSection();

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetID = link.getAttribute('data-section');
      window.location.hash = targetID;

      navLinks.forEach(nav => nav.classList.remove('active'));
      sections.forEach(sec => sec.classList.remove('active'));

      link.classList.add('active');
      const targetSection = document.getElementById(targetID);
      if (targetSection) {
        targetSection.classList.add('active');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  window.addEventListener('hashchange', setActiveSection);
}

initPage.hasRun = false;

document.addEventListener('DOMContentLoaded', initPage);
