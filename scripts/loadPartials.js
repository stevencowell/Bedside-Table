async function insertPartial(placeholderId, partialPath) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  try {
    const response = await fetch(partialPath);
    placeholder.innerHTML = await response.text();
  } catch (error) {
    console.error(`Failed to load partial: ${partialPath}`, error);
  }
}

async function loadPartials() {
  await Promise.all([
    insertPartial('header-placeholder', 'partials/header.html'),
    insertPartial('footer-placeholder', 'partials/footer.html')
  ]);

  if (typeof initPage === 'function') {
    initPage.hasRun = false;
    initPage();
  }
}

let weekCardTemplate;

async function getWeekCardTemplate() {
  if (weekCardTemplate) return weekCardTemplate;

  try {
    const response = await fetch('partials/week-card.html');
    const html = await response.text();
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    weekCardTemplate = template;
  } catch (error) {
    console.error('Failed to load week card template', error);
    weekCardTemplate = document.createElement('template');
  }

  return weekCardTemplate;
}

async function createWeekCard() {
  const template = await getWeekCardTemplate();
  const content = template.content.firstElementChild;
  if (!content) return document.createElement('div');
  return content.cloneNode(true);
}

document.addEventListener('DOMContentLoaded', loadPartials);

window.createWeekCard = createWeekCard;
