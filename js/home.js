/* ============================================================
   ePaper Reader - Home Page Script
   ============================================================ */

let selectedSource = 'express';
let dateMode = 'today';

// Header date
(function () {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('header-date-str').textContent = now.toLocaleDateString('en-PK', options);

  const input = document.getElementById('custom-date-input');
  const pad = n => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  input.setAttribute('max', todayStr);
  input.value = todayStr;
})();

function selectSource(el) {
  selectedSource = el.dataset.source;
  document.querySelectorAll('.newspaper-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  // Show magazine button only for Express
  const magBtn  = document.getElementById('mag-btn');
  const magNote = document.getElementById('mag-note');
  if (selectedSource === 'express') {
    magBtn.style.display  = '';
    magNote.style.display = '';
  } else {
    magBtn.style.display  = 'none';
    magNote.style.display = 'none';
  }
}

function selectDateMode(mode) {
  dateMode = mode;
  const todayPill  = document.getElementById('today-pill');
  const customPill = document.getElementById('custom-pill');
  const customInput = document.getElementById('custom-date-input');

  if (mode === 'today') {
    todayPill.classList.add('active-date-pill');
    customPill.classList.remove('active-date-pill');
    customInput.style.display = 'none';
  } else {
    customPill.classList.add('active-date-pill');
    todayPill.classList.remove('active-date-pill');
    customInput.style.display = '';
    customInput.focus();
  }
}

function getTargetDate() {
  if (dateMode === 'today') {
    // Pakistan Standard Time = UTC+5
    const pst = new Date(Date.now() + 5 * 60 * 60 * 1000);
    // If before noon, show previous day
    if (pst.getUTCHours() < 12) pst.setUTCDate(pst.getUTCDate() - 1);
    return pst;
  } else {
    const val = document.getElementById('custom-date-input').value;
    if (!val) return null;
    const [y, m, d] = val.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  }
}

function buildDateStr(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function launchReader() {
  const date = getTargetDate();
  if (!date) { alert('Please select a date.'); return; }
  const params = new URLSearchParams({
    source: selectedSource,
    date:   buildDateStr(date),
  });
  window.location.href = `reader.html?${params.toString()}`;
}

function launchMagazine() {
  // Magazine is always the latest Sunday Express edition
  const pst = new Date(Date.now() + 5 * 60 * 60 * 1000);
  // Find most recent Sunday (today if sunday, otherwise go back)
  const dayOfWeek = pst.getUTCDay(); // 0=Sunday
  pst.setUTCDate(pst.getUTCDate() - dayOfWeek);
  const params = new URLSearchParams({ date: buildDateStr(pst) });
  window.location.href = `magazine.html?${params.toString()}`;
}
