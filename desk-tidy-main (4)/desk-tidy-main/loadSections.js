const sections = [
  'program',
  'syllabus',
  'assessment',
  'project-unit',
  'main-theory',
  'support-activities',
  'advanced-activities'
];

const weekCounts = {
  'main-theory': 10,
  'support-activities': 10,
  'advanced-activities': 10
};

function loadSections() {
  return Promise.all(sections.map(id => {
    return fetch('sections/' + id + '.html')
      .then(resp => resp.text())
      .then(html => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      });
  }));
}

async function loadWeeks() {
  for (const [section, count] of Object.entries(weekCounts)) {
    const container = document.getElementById(section + '-weeks');
    if (!container) continue;

    const list = document.createElement('ul');

    for (let i = 1; i <= count; i++) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `sections/${section}/week${i}.html`;
      link.textContent = `Week ${i}`;
      link.target = '_blank';
      li.appendChild(link);
      list.appendChild(li);
    }

    container.appendChild(list);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSections()
    .then(loadWeeks)
    .then(() => {
      if (typeof initPage === 'function') initPage();
      if (typeof initQuizFeatures === 'function') initQuizFeatures();
    });
});
