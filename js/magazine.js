/* ============================================================
   ePaper Magazine - Express Sunday Magazine
   URL format: YYYYMMDD-NP_KHI-EXP-SM{NN}_{pageNum}.jpg
   Uses auto-detect to find all available pages.
   ============================================================ */

const urlParams = new URLSearchParams(window.location.search);
const dateStr   = urlParams.get('date') || getLatestSundayStr();

function getLatestSundayStr() {
  const pst = new Date(Date.now() + 5 * 60 * 60 * 1000);
  pst.setUTCDate(pst.getUTCDate() - pst.getUTCDay());
  const pad = n => String(n).padStart(2, '0');
  return `${pst.getUTCFullYear()}${pad(pst.getUTCMonth() + 1)}${pad(pst.getUTCDate())}`;
}

function formatDisplayDate(str) {
  const y = parseInt(str.slice(0, 4));
  const m = parseInt(str.slice(4, 6)) - 1;
  const d = parseInt(str.slice(6, 8));
  return new Date(y, m, d).toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// Known Express magazine page filenames with their positions
// Format: EXP-SM{NN}_{pageOffset}.jpg
function getMagCandidates(dateStr) {
  const base = `https://www.express.com.pk/images/NP_KHI/${dateStr}/${dateStr}-NP_KHI-`;
  const pages = [
    { file: 'EXP-SM01_53.jpg',   label: 'Magazine 01', pos: 1  },
    { file: 'EXP-SM02_54.jpg',   label: 'Magazine 02', pos: 2  },
    { file: 'EXP-SM03_55.jpg',   label: 'Magazine 03', pos: 3  },
    { file: 'EXP-SM04_56.jpg',   label: 'Magazine 04', pos: 4  },
    { file: 'EXP-SM05_57.jpg',   label: 'Magazine 05', pos: 5  },
    { file: 'EXP-SM06_58.jpg',   label: 'Magazine 06', pos: 6  },
    { file: 'EXP-SM07_59.jpg',   label: 'Magazine 07', pos: 7  },
    { file: 'EXP-SM0809_60.jpg', label: 'Magazine 08-09', pos: 8 },
    { file: 'EXP-SM10_61.jpg',   label: 'Magazine 10', pos: 9  },
    { file: 'EXP-SM11_63.jpg',   label: 'Magazine 11', pos: 10 },
    { file: 'EXP-SM12_64.jpg',   label: 'Magazine 12', pos: 11 },
    { file: 'EXP-SM13_65.jpg',   label: 'Magazine 13', pos: 12 },
    { file: 'EXP-SM14_66.jpg',   label: 'Magazine 14', pos: 13 },
    { file: 'EXP-SM15_67.jpg',   label: 'Magazine 15', pos: 14 },
    { file: 'EXP-SM16_68.jpg',   label: 'Magazine 16', pos: 15 },
  ];
  return pages.map(p => ({ ...p, src: base + p.file }));
}

/* Status */
let probeTotal = 0, probeDone = 0, successCount = 0;
const slotMap = new Map();

function updateStatus() {
  const text    = document.getElementById('status-text');
  const counter = document.getElementById('status-counter');
  const bar     = document.getElementById('status-bar');
  if (probeDone < probeTotal) {
    text.textContent    = `Loading magazine… (${successCount} pages ready)`;
    counter.textContent = `${probeDone} / ${probeTotal}`;
  } else {
    text.textContent    = successCount > 0
      ? `Magazine loaded — ${successCount} pages.`
      : `Magazine not available for this Sunday. Try a different date.`;
    counter.textContent = `${successCount} pages`;
    if (successCount > 0) setTimeout(() => bar.classList.add('hidden'), 3000);
  }
}

function buildSlots(candidates, grid) {
  candidates.forEach(c => {
    const slot = document.createElement('div');
    slot.className = 'page-slot pending';
    slot.dataset.key = c.src;
    slot.innerHTML = `<div class="page-skeleton"><div class="page-skeleton-label">${c.label}</div></div>`;
    grid.appendChild(slot);
    slotMap.set(c.src, slot);
  });
}

function revealSlot(src, label) {
  const slot = slotMap.get(src);
  if (!slot) return;
  slot.classList.remove('pending');
  slot.classList.add('page-item');
  slot.innerHTML = '';

  const img = document.createElement('img');
  img.alt      = label;
  img.decoding = 'async';
  img.style.cssText = 'width:100%;display:block;opacity:0;transform:translateZ(0);backface-visibility:hidden;-webkit-backface-visibility:hidden;';
  img.onload = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      img.style.transition = 'opacity 0.35s ease';
      img.style.opacity    = '1';
    }));
    const lbl = document.createElement('div');
    lbl.className   = 'page-label';
    lbl.textContent = label;
    slot.appendChild(lbl);
  };
  img.src = src;
  slot.appendChild(img);
}

function discardSlot(src) {
  const slot = slotMap.get(src);
  if (slot) slot.style.display = 'none';
}

function probeImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

let currentCandidates = [];

async function loadMagazine(candidates, grid) {
  buildSlots(candidates, grid);
  probeTotal = candidates.length;
  probeDone = successCount = 0;
  updateStatus();

  await Promise.all(candidates.map(async c => {
    const ok = await probeImage(c.src);
    probeDone++;
    if (ok) { successCount++; revealSlot(c.src, c.label); }
    else     { discardSlot(c.src); }
    updateStatus();
  }));
}

function reloadMag() {
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning');
  setTimeout(() => btn.classList.remove('spinning'), 900);

  slotMap.clear();
  probeDone = successCount = 0;
  document.getElementById('status-bar').classList.remove('hidden');
  const grid = document.getElementById('mag-pages');
  grid.innerHTML = '';
  loadMagazine(currentCandidates, grid);
}

window.addEventListener('load', function () {
  const displayDate = formatDisplayDate(dateStr);
  document.getElementById('reader-edition-label').textContent =
    `Express Sunday Magazine · ${displayDate}`;
  document.title = `ePaper Magazine — ${displayDate}`;

  currentCandidates = getMagCandidates(dateStr);
  probeTotal        = currentCandidates.length;
  loadMagazine(currentCandidates, document.getElementById('mag-pages'));
});
