/* ============================================================
   ePaper Reader - Home Page Script
   ============================================================ */

let selectedMethod = 1;
let selectedSource = 'express';
let dateMode = 'today';
let includeMagazine = false;

// Set today's date string in header
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

function selectMethod(method) {
  selectedMethod = method;
  const card1 = document.getElementById('method1-card');
  const card2 = document.getElementById('method2-card');
  const check1 = document.getElementById('method1-check');
  const check2 = document.getElementById('method2-check');

  if (method === 1) {
    card1.classList.add('selected');
    card2.classList.remove('selected');
    check1.style.display = '';
    check2.style.display = 'none';
  } else {
    card2.classList.add('selected');
    card1.classList.remove('selected');
    check2.style.display = '';
    check1.style.display = 'none';
  }
}

function selectSource(el) {
  if (el.classList.contains('coming-soon')) return;
  selectedSource = el.dataset.source;
  document.querySelectorAll('.newspaper-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function selectDateMode(mode) {
  dateMode = mode;
  const todayPill = document.getElementById('today-pill');
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

function toggleMagazine() {
  includeMagazine = !includeMagazine;
  const track = document.getElementById('mag-toggle-track');
  const label = document.getElementById('mag-toggle-label');

  if (includeMagazine) {
    track.classList.add('on');
    label.innerHTML = 'Magazine <strong>ON</strong>';
  } else {
    track.classList.remove('on');
    label.innerHTML = 'Magazine <strong>OFF</strong>';
  }
}

function launchReader() {
  let targetDate;

  if (dateMode === 'today') {
    const now = new Date();
    const pst = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    targetDate = pst;
    if (targetDate.getUTCHours() < 12) {
      targetDate.setUTCDate(targetDate.getUTCDate() - 1);
    }
  } else {
    const val = document.getElementById('custom-date-input').value;
    if (!val) { alert('Please select a date.'); return; }
    const [y, m, d] = val.split('-').map(Number);
    targetDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  }

  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${targetDate.getUTCFullYear()}${pad(targetDate.getUTCMonth() + 1)}${pad(targetDate.getUTCDate())}`;

  const params = new URLSearchParams({
    source: selectedSource,
    method: selectedMethod,
    date: dateStr,
    mag: includeMagazine ? '1' : '0',
  });

  window.location.href = `reader.html?${params.toString()}`;
}
