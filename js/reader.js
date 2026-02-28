/* ============================================================
   ePaper Reader - Reader Script
   Auto-detects available pages; supports Express, Jang, Ummat
   ============================================================ */

/* ======================================================
   SOURCE DEFINITIONS
   ====================================================== */
const SOURCES = {

  /* ---- EXPRESS ----------------------------------------
     URL: https://www.express.com.pk/images/NP_KHI/YYYYMMDD/YYYYMMDD-NP_KHI-{filename}
     Strategy: probe all known filename variants simultaneously.
     Each candidate has a sort position (pos). If multiple candidates
     share the same pos, all that succeed are shown in pos order.
  -------------------------------------------------------- */
  express: {
    name: 'Express',
    label: 'Daily Express Urdu',

    getCandidates(dateStr) {
      const base = `https://www.express.com.pk/images/NP_KHI/${dateStr}/${dateStr}-NP_KHI-`;
      // Exhaustive list of every known page filename variant.
      // pos = display order (extracted from trailing _N in filename).
      return [
        // ---- Front Page ----
        { file: 'FRONT_PAGE_1.jpg',               label: 'Front Page',               pos: 1  },
        { file: 'Front_Page_1.jpg',               label: 'Front Page',               pos: 1  },

        // ---- Page 2 ----
        { file: 'City_Page002_2.jpg',             label: 'City',                     pos: 2  },
        { file: 'Metropolitan_PageC002_2.jpg',    label: 'Metropolitan',             pos: 2  },
        { file: 'METROPOLITAN_PAGEC002_2.JPG',    label: 'Metropolitan',             pos: 2  },
        { file: 'MetropolitanHYD_PageC002_2.jpg', label: 'Metropolitan HYD',         pos: 2  },

        // ---- Page 3 ----
        { file: 'National_Page003_3.jpg',         label: 'National',                 pos: 3  },
        { file: 'NAT_INT_PageC003_3.jpg',         label: 'National / International', pos: 3  },
        { file: 'NAT_INT_PAGEC003_3.jpg',         label: 'National / International', pos: 3  },

        // ---- Page 4 ----
        { file: 'Classified_Page004_4.jpg',       label: 'Classified',               pos: 4  },
        { file: 'City_PageC004_4.jpg',            label: 'City',                     pos: 4  },
        { file: 'CITY_PAGEC004_4.jpg',            label: 'City',                     pos: 4  },

        // ---- Page 5 ----
        { file: 'Baqia_Page005_5.jpg',            label: 'Baqia',                    pos: 5  },
        { file: 'Baqia_PageC005_5.jpg',           label: 'Baqia',                    pos: 5  },
        { file: 'BAQIA_PAGEC005_5.jpg',           label: 'Baqia',                    pos: 5  },

        // ---- Page 6 ----
        { file: 'Commerce_PageBW_6.jpg',          label: 'Commerce',                 pos: 6  },
        { file: 'Editorial_PageC006_6.jpg',       label: 'Editorial',                pos: 6  },
        { file: 'EDITORIAL_PAGEC006_6.jpg',       label: 'Editorial',                pos: 6  },

        // ---- Page 7 ----
        { file: 'Sports_PAGE007_7.jpg',           label: 'Sports',                   pos: 7  },
        { file: 'Classified_PageC007_7.jpg',      label: 'Classified',               pos: 7  },
        { file: 'CLASSIFIED_PAGEC007_7.jpg',      label: 'Classified',               pos: 7  },

        // ---- Page 8 ----
        { file: 'Back_Page008_8.jpg',             label: 'Back Page',                pos: 8  },
        { file: 'Sports_PageC008_8.jpg',          label: 'Sports',                   pos: 8  },
        { file: 'SPORTS_PAGEC008_8.jpg',          label: 'Sports',                   pos: 8  },

        // ---- Page 9 ----
        { file: 'Metropolitan_Page009_9.jpg',     label: 'Metropolitan',             pos: 9  },
        { file: 'Magazine_PageC009_9.jpg',        label: 'Magazine',                 pos: 9  },
        { file: 'MAGAZINE_PAGEC009_9.jpg',        label: 'Magazine',                 pos: 9  },

        // ---- Page 10 ----
        { file: 'Editorial_Page10_10.jpg',        label: 'Editorial',                pos: 10 },
        { file: 'Back_PageC010_10.jpg',           label: 'Back Page',                pos: 10 },
        { file: 'BACK_PAGEC010_10.jpg',           label: 'Back Page',                pos: 10 },

        // ---- Page 11 ----
        { file: 'Opinion_Page011_11.jpg',         label: 'Opinion',                  pos: 11 },

        // ---- Page 12 ----
        { file: 'Magazine_Page12_12.jpg',         label: 'Magazine',                 pos: 12 },

        // ---- Supplements ----
        { file: 'EXP_SUP_01_17.jpg',             label: 'Supplement 1',             pos: 17 },
        { file: 'EXP_SUP_02_18.jpg',             label: 'Supplement 2',             pos: 18 },
        { file: 'EXP_SUP_03_19.jpg',             label: 'Supplement 3',             pos: 19 },
        { file: 'EXP_SUP_04_20.jpg',             label: 'Supplement 4',             pos: 20 },
      ].map(c => ({ ...c, src: base + c.file }));
    },

    // Returns { dateStr } for the magazine page (latest Sunday)
    getMagDateStr() {
      const pst = new Date(Date.now() + 5 * 60 * 60 * 1000);
      const dayOfWeek = pst.getUTCDay();
      pst.setUTCDate(pst.getUTCDate() - dayOfWeek);
      const pad = n => String(n).padStart(2, '0');
      return `${pst.getUTCFullYear()}${pad(pst.getUTCMonth() + 1)}${pad(pst.getUTCDate())}`;
    },
  },

  /* ---- JANG -------------------------------------------
     URL: https://e.jang.com.pk/static_pages/{M}-{D}-{YYYY}/karachi/mainpage/page{N}.jpg
     M = month without leading zero, D = day without leading zero
     Strategy: sequential probe pages 1..20, stop on 3 consecutive failures.
  -------------------------------------------------------- */
  jang: {
    name: 'Jang',
    label: 'Daily Jang Urdu',

    getCandidates(dateStr) {
      // dateStr is YYYYMMDD
      const y  = dateStr.slice(0, 4);
      const m  = parseInt(dateStr.slice(4, 6));  // no leading zero
      const d  = parseInt(dateStr.slice(6, 8));  // no leading zero
      const base = `https://e.jang.com.pk/static_pages/${m}-${d}-${y}/karachi/mainpage/page`;

      // Probe pages 1 through 20
      return Array.from({ length: 20 }, (_, i) => ({
        src:   base + (i + 1) + '.jpg',
        label: `Page ${i + 1}`,
        pos:   i + 1,
        file:  `page${i + 1}.jpg`,
      }));
    },
  },

  /* ---- UMMAT ------------------------------------------
     URL: https://ummat.net/cdn/YYYY/MM/DD//images/page-{N}.jpg
     MM and DD are zero-padded. Note the double slash.
     Strategy: sequential probe pages 1..12, stop on failures.
  -------------------------------------------------------- */
  ummat: {
    name: 'Ummat',
    label: 'Daily Ummat Urdu',

    getCandidates(dateStr) {
      const y   = dateStr.slice(0, 4);
      const mm  = dateStr.slice(4, 6);
      const dd  = dateStr.slice(6, 8);
      const base = `https://ummat.net/cdn/${y}/${mm}/${dd}//images/page-`;

      // Ummat KHI typically 6-10 pages, probe up to 16
      return Array.from({ length: 16 }, (_, i) => ({
        src:   base + (i + 1) + '.jpg',
        label: `Page ${i + 1}`,
        pos:   i + 1,
        file:  `page-${i + 1}.jpg`,
      }));
    },
  },
};

/* ======================================================
   URL PARAMS
   ====================================================== */
const urlParams  = new URLSearchParams(window.location.search);
const sourceKey  = urlParams.get('source') || 'express';
const dateStr    = urlParams.get('date')   || getTodayStr();

function getTodayStr() {
  const pst = new Date(Date.now() + 5 * 60 * 60 * 1000);
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

/* ======================================================
   STATUS
   ====================================================== */
let probeTotal   = 0;
let probeDone    = 0;
let successCount = 0;

function updateStatus() {
  const text    = document.getElementById('status-text');
  const counter = document.getElementById('status-counter');
  const bar     = document.getElementById('status-bar');

  if (probeDone < probeTotal) {
    text.textContent    = `Detecting pages… (${successCount} found so far)`;
    counter.textContent = `${probeDone} / ${probeTotal} checked`;
  } else {
    text.textContent    = successCount > 0
      ? `Loaded ${successCount} page(s) successfully.`
      : `No pages found. The edition may not be published yet, or try a different date.`;
    counter.textContent = `${successCount} pages`;
    if (successCount > 0) setTimeout(() => bar.classList.add('hidden'), 3000);
  }
}

/* ======================================================
   PAGE RENDERING
   The grid is pre-ordered: candidate slots are appended in
   pos order. Successful loads reveal the image; failures
   silently remove the slot. This keeps display order correct
   even when images load out of order.
   ====================================================== */

// posSlotMap: pos (number) → slot DOM element (one slot per page position)
const posSlotMap = new Map();
// posWinner: tracks which positions have already been claimed by a successful probe
const posWinner  = new Set();
// slotMap: src → slot DOM element (used by Jang/Ummat sequential flow)
const slotMap    = new Map();

function buildOrderedSlots(candidates, grid) {
  // Collect unique pos values in ascending order
  const seenPos = new Set();
  const sorted  = [...candidates].sort((a, b) => a.pos - b.pos);

  sorted.forEach(c => {
    if (!seenPos.has(c.pos)) {
      seenPos.add(c.pos);
      const slot = document.createElement('div');
      slot.className = 'page-slot pending';
      slot.innerHTML = `<div class="page-skeleton"><div class="page-skeleton-label">${c.label}</div></div>`;
      grid.appendChild(slot);
      posSlotMap.set(c.pos, slot);
    }
    // All src variants for this pos point to the same slot
    slotMap.set(c.src, posSlotMap.get(c.pos));
  });
}

function revealSlot(src, label, pos) {
  // For pos-based sources (Express): only the first winner per pos is shown
  if (pos !== undefined) {
    if (posWinner.has(pos)) return; // another variant already won this slot
    posWinner.add(pos);
  }
  const slot = slotMap.get(src) || posSlotMap.get(pos);
  if (!slot) return;

  slot.style.display = '';        // un-hide if a failing variant already hid this slot
  slot.classList.remove('pending');
  slot.classList.add('page-item');
  slot.innerHTML = '';

  const img = document.createElement('img');
  img.alt      = label;
  img.decoding = 'async';
  // GPU-accelerated layer — fixes black screen on mobile
  img.style.cssText = 'width:100%;display:block;opacity:0;transform:translateZ(0);backface-visibility:hidden;-webkit-backface-visibility:hidden;';

  img.onload = () => {
    // Double rAF ensures browser has painted before fade-in starts
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
  // Only hide the slot if no winner has claimed it yet
  const slot = slotMap.get(src);
  if (!slot) return;
  // Check if this slot belongs to a pos that already has a winner
  // Find pos for this src
  const entry = [...posSlotMap.entries()].find(([, s]) => s === slot);
  if (entry && posWinner.has(entry[0])) return; // already won by another variant
  slot.style.display = 'none';
}

/* ======================================================
   PROBING
   For Express: all candidates fired simultaneously.
   For Jang/Ummat: sequential with early stop on consecutive
   failures (so we don't wait for all 20 probes after the
   paper ends at page 12).
   ====================================================== */

function probeImage(src) {
  return new Promise(resolve => {
    const img  = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src     = src;
  });
}

async function probeAllSimultaneous(candidates, grid) {
  buildOrderedSlots(candidates, grid);

  // Group candidates by pos
  const groups = new Map();
  candidates.forEach(c => {
    if (!groups.has(c.pos)) groups.set(c.pos, []);
    groups.get(c.pos).push(c);
  });

  probeTotal = candidates.length;
  probeDone  = 0;
  updateStatus();

  // For each pos group: race all variants — first success wins, rest are dropped.
  // All groups run in parallel.
  const groupPromises = [...groups.entries()].map(async ([pos, group]) => {
    // Fire all variants in this group simultaneously
    const racePromises = group.map(c =>
      probeImage(c.src).then(ok => ({ ok, c }))
    );

    let won = false;
    // Process results as they arrive
    const results = await Promise.all(racePromises);
    probeDone += group.length;

    for (const { ok, c } of results) {
      if (ok && !won) {
        won = true;
        successCount++;
        revealSlot(c.src, c.label, c.pos);
      } else {
        discardSlot(c.src);
      }
    }

    // If all variants failed, hide the slot
    if (!won) {
      const slot = posSlotMap.get(pos);
      if (slot) slot.style.display = 'none';
    }

    updateStatus();
  });

  await Promise.all(groupPromises);
}

async function probeSequentialWithStop(candidates, grid, maxConsecFail = 3) {
  buildOrderedSlots(candidates, grid);
  probeTotal = candidates.length;
  probeDone  = 0;
  updateStatus();

  let consecFail = 0;

  for (const c of candidates) {
    if (consecFail >= maxConsecFail) {
      // Discard remaining slots silently
      const remaining = candidates.slice(candidates.indexOf(c));
      remaining.forEach(r => { discardSlot(r.src); probeDone++; });
      updateStatus();
      break;
    }
    const ok = await probeImage(c.src);
    probeDone++;
    if (ok) {
      consecFail = 0;
      successCount++;
      revealSlot(c.src, c.label);
    } else {
      consecFail++;
      discardSlot(c.src);
    }
    updateStatus();
  }
}

/* ======================================================
   RELOAD
   ====================================================== */
let reloadCandidates = [];

function reloadPages() {
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning');
  setTimeout(() => btn.classList.remove('spinning'), 900);

  // Remove all existing slots and reset all state
  slotMap.clear();
  posSlotMap.clear();
  posWinner.clear();
  successCount = 0;
  probeDone    = 0;

  const bar = document.getElementById('status-bar');
  bar.classList.remove('hidden');

  const grid = document.getElementById('paper-pages');
  grid.innerHTML = '';

  const source = SOURCES[sourceKey];
  if (!source) return;

  if (sourceKey === 'express') {
    probeAllSimultaneous(reloadCandidates, grid);
  } else {
    probeSequentialWithStop(reloadCandidates, grid);
  }
}

/* ======================================================
   INIT
   ====================================================== */
window.addEventListener('load', function () {
  const source = SOURCES[sourceKey];
  if (!source) {
    document.getElementById('reader-edition-label').textContent = 'Unknown source';
    return;
  }

  const displayDate = formatDisplayDate(dateStr);
  document.getElementById('reader-edition-label').textContent =
    `${source.label} · ${displayDate}`;
  document.title = `ePaper — ${source.name} ${displayDate}`;

  const candidates = source.getCandidates(dateStr);
  reloadCandidates = candidates; // save for reload
  probeTotal       = candidates.length;

  const grid = document.getElementById('paper-pages');

  if (sourceKey === 'express') {
    probeAllSimultaneous(candidates, grid);
  } else {
    probeSequentialWithStop(candidates, grid);
  }
});