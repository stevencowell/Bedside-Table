const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTomPeDrZ-vDZyEC72wXeoeFpro0Z8zCD2OfgL9HxY7nBsokoieXxy4sT3n_O4x3iqhg/exec";
const CLASSROOM_LINK = "https://classroom.google.com/w/NzQ5MDQxMzk4MjAz/t/all"; // STAFF: Replace with your Google Classroom link

const synth = window.speechSynthesis;
let voices = [];
synth.onvoiceschanged = () => { voices = synth.getVoices(); };

function speakText(btn) {
  let text = '';
  if (btn.dataset.text) {
    text = btn.dataset.text;
  } else {
    const p = btn.closest('p');
    if (p) {
      text = Array.from(p.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .join(' ');
    } else {
      const lbl = btn.closest('label');
      text = Array.from(lbl.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .filter(t => t.length)
        .join(' ');
    }
  }
  if (!voices.length) voices = synth.getVoices();
  const utt = new SpeechSynthesisUtterance(text);
  utt.voice = voices.find(v => v.name === 'Google UK English Female')
             || voices.find(v => /Natural/.test(v.name))
             || voices[0];
  synth.speak(utt);
}

function showResultPopup(url) {
  const overlay = document.getElementById('resultPopup');
  const link = document.getElementById('popupClassroomLink');
  if (link) link.href = url || '#';
  if (overlay) overlay.classList.add('active');
}

function showSubmittedPopup(url) {
  const overlay = document.getElementById('submittedPopup');
  const btn = document.getElementById('submittedOkBtn');
  if (!overlay || !btn) { showResultPopup(url); return; }
  overlay.classList.add('active');
  btn.onclick = () => {
    overlay.classList.remove('active');
    showResultPopup(url);
  };
}

function askForName() {
  return new Promise(resolve => {
    const overlay = document.getElementById('namePopup');
    const input = document.getElementById('studentName');
    const btn = document.getElementById('submitNameBtn');
    if (!overlay || !input || !btn) { resolve(''); return; }
    overlay.classList.add('active');
    btn.onclick = () => {
      const name = input.value.trim();
      if (!name) return;
      overlay.classList.remove('active');
      resolve(name);
    };
  });
}

function shuffleQuizAnswers() {
  document.querySelectorAll('form.quiz li').forEach(li => {
    const labels = Array.from(li.querySelectorAll('label'));
    if (labels.length <= 1) return;
    li.querySelectorAll('br').forEach(br => br.remove());
    labels.forEach(l => l.remove());
    for (let i = labels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [labels[i], labels[j]] = [labels[j], labels[i]];
    }
    labels.forEach((label, idx) => {
      li.appendChild(label);
      if (idx < labels.length - 1) li.appendChild(document.createElement('br'));
    });
  });
}

function initQuizFeatures() {
  if (initQuizFeatures.hasRun) return;
  initQuizFeatures.hasRun = true;

  shuffleQuizAnswers();
  const closeBtn = document.querySelector('#resultPopup .close-popup');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('resultPopup').classList.remove('active');
    });
  }
  document.querySelectorAll('form.quiz li > p button').forEach(btn => {
    if (!btn.hasAttribute('aria-label')) {
      btn.setAttribute('aria-label', 'Read question aloud');
    }
  });
  document.querySelectorAll('form.quiz label').forEach(label => {
    if (!label.querySelector('button')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '🔊';
      const answerText = label.textContent.trim();
      btn.setAttribute('aria-label', 'Read answer ' + answerText);
      btn.addEventListener('click', e => { e.preventDefault(); speakText(btn); });
      label.appendChild(document.createTextNode(' '));
      label.appendChild(btn);
    }
  });
}

initQuizFeatures.hasRun = false;

document.addEventListener('DOMContentLoaded', initQuizFeatures);

function submitQuiz(btn, quizType) {
  const form = btn.closest('form');
  const fieldset = form.querySelector('fieldset');
  let correct = 0, total = 0;
  const results = [];
  fieldset.querySelectorAll('li').forEach((li) => {
    const radios = li.querySelectorAll('input[type=radio]');
    let userCorrect = false, answered = false;
    radios.forEach(radio => {
      if (radio.checked) {
        answered = true;
        const isCorrect =
          radio.getAttribute('data-correct') === 'true' ||
          radio.parentElement?.getAttribute('data-correct') === 'true';
        if (isCorrect) userCorrect = true;
      }
      radio.parentElement.removeAttribute('data-result');
    });
    total += 1;
    radios.forEach(radio => {
      if (radio.checked) {
        radio.parentElement.setAttribute('data-result', userCorrect ? "right" : "wrong");
      }
    });
    if (userCorrect) correct += 1;
    results.push({
      question: li.querySelector('p').textContent,
      answer: Array.from(radios).find(r => r.checked)?.value || ''
    });
  });

  let msg = `You got ${correct} out of ${total} correct.`;
  form.querySelector('.quiz-msg').textContent = msg;

  askForName().then(name => {
    let quizNumber = '';
    if (/^[MSA]\d+/i.test(quizType)) {
      quizNumber = quizType.toUpperCase();
    } else {
      const numMatch = quizType.match(/Week\s*(\d+)/i);
      const prefix = /Support/i.test(quizType)
        ? 'S'
        : /(Advanced|Adv)/i.test(quizType)
        ? 'A'
        : 'M';
      quizNumber = prefix + (numMatch ? String(numMatch[1]).padStart(3, '0') : '');
    }
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizType,
        quizNumber,
        quiz: results,
        score: correct + "/" + total,
        studentName: name,
        timestamp: new Date().toISOString()
      })
    }).then(() => {
      showSubmittedPopup(CLASSROOM_LINK);
    });
  });
}

function submitAdvancedQuiz(btn, quizType) {
  const form = btn.closest('form');
  const textareas = form.querySelectorAll('textarea');
  const responses = [];
  textareas.forEach((ta) => {
    responses.push({
      question: ta.closest('li').querySelector('p').textContent,
      answer: ta.value.trim()
    });
  });

  const studentName = prompt('Please enter your name to submit your answers:');
  if (!studentName) return;

  form.querySelector('.quiz-msg').textContent =
    'Responses submitted. Your teacher will review them.';

  let quizNumber = '';
  if (/^[MSA]\d+/i.test(quizType)) {
    quizNumber = quizType.toUpperCase();
  } else {
    const numMatch = quizType.match(/Week\s*(\d+)/i);
    const prefix = /Support/i.test(quizType)
      ? 'S'
      : /(Advanced|Adv)/i.test(quizType)
      ? 'A'
      : 'M';
    quizNumber = prefix + (numMatch ? String(numMatch[1]).padStart(3, '0') : '');
  }
  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quizType,
      quizNumber,
      studentName: studentName.trim(),
      responses,
      timestamp: new Date().toISOString()
    })
  }).then(() => {
    showSubmittedPopup(CLASSROOM_LINK);
  });
}
