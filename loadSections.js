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
  'main-theory': 20,
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
    // Get the container div where week content should appear (e.g. "main-theory-weeks")
    const container = document.getElementById(section + '-weeks');
    if (!container) continue;

    // Fetch each week file and insert its <details> content
    for (let i = 1; i <= count; i++) {
      const resp = await fetch(`sections/${section}/week${i}.html`);
      const text = await resp.text();

      // Parse the fetched HTML to extract the <details> block (or fall back to <body>)
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const details = doc.querySelector('details') || doc.body;

      container.appendChild(details.cloneNode(true));
    }
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
