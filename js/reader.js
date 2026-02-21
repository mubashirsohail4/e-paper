/* ============================================================
   ePaper Reader - Reader Page Script
   ============================================================ */

const SOURCES = {
  express: {
    name: 'Express',
    city: 'NP_KHI',
    buildUrl(city, dateStr) {
      return `https://www.express.com.pk/images/${city}/${dateStr}/${dateStr}-${city}-`;
    },
    getPages(method, baseUrl) {
      if (method === 2) {
        return {
          label: 'Sunday / Holiday Edition',
          paperPages: [
            { src: baseUrl + 'FRONT_PAGE_1.jpg',             label: 'Front Page' },
            { src: baseUrl + 'METROPOLITAN_PAGEC002_2.JPG',  label: 'Metropolitan' },
            { src: baseUrl + 'NAT_INT_PAGEC003_3.jpg',       label: 'National / International' },
            { src: baseUrl + 'CITY_PAGEC004_4.jpg',          label: 'City' },
            { src: baseUrl + 'BAQIA_PAGEC005_5.jpg',         label: 'Baqia' },
            { src: baseUrl + 'EDITORIAL_PAGEC006_6.jpg',     label: 'Editorial' },
            { src: baseUrl + 'CLASSIFIED_PAGEC007_7.jpg',    label: 'Classified' },
            { src: baseUrl + 'SPORTS_PAGEC008_8.jpg',         label: 'Sports' },
            { src: baseUrl + 'MAGAZINE_PAGEC009_9.jpg',      label: 'Magazine' },
            { src: baseUrl + 'BACK_PAGEC010_10.jpg',         label: 'Back Page' },
            { src: baseUrl + 'EXP_SUP_01_17.jpg',           label: 'Supplement 1' },
            { src: baseUrl + 'EXP_SUP_02_18.jpg',           label: 'Supplement 2' },
            { src: baseUrl + 'EXP_SUP_03_19.jpg',           label: 'Supplement 3' },
            { src: baseUrl + 'EXP_SUP_04_20.jpg',           label: 'Supplement 4' },
          ],
        };
      } else {
        return {
          label: 'Regular Edition',
          paperPages: [
            { src: baseUrl + 'FRONT_PAGE_1.jpg',            label: 'Front Page' },
            { src: baseUrl + 'METROPOLITAN_PAGEC002_2.jpg', label: 'Metropolitan' },
            { src: baseUrl + 'NAT_INT_PAGEC003_3.jpg',      label: 'National / International' },
            { src: baseUrl + 'CITY_PAGEC004_4.jpg',         label: 'City' },
            { src: baseUrl + 'BAQIA_PAGEC005_5.jpg',        label: 'Baqia' },
            { src: baseUrl + 'EDITORIAL_PAGEC006_6.jpg',    label: 'Editorial' },
            { src: baseUrl + 'CLASSIFIED_PAGEC007_7.jpg',   label: 'Classified' },
            { src: baseUrl + 'SPORTS_PAGEC008_8.jpg',       label: 'Sports' },
            { src: baseUrl + 'MAGAZINE_PAGEC009_9.jpg',     label: 'Magazine' },
            { src: baseUrl + 'BACK_PAGEC010_10.jpg',        label: 'Back Page' },
          ],
        };
      }
    },
    getMagPages(baseUrl) {
      return [
        { src: baseUrl + 'EXP-SM01_53.jpg',    label: 'SM 01' },
        { src: baseUrl + 'EXP-SM02_54.jpg',    label: 'SM 02' },
        { src: baseUrl + 'EXP-SM03_55.jpg',    label: 'SM 03' },
        { src: baseUrl + 'EXP-SM04_56.jpg',    label: 'SM 04' },
        { src: baseUrl + 'EXP-SM05_57.jpg',    label: 'SM 05' },
        { src: baseUrl + 'EXP-SM06_58.jpg',    label: 'SM 06' },
        { src: baseUrl + 'EXP-SM07_59.jpg',    label: 'SM 07' },
        { src: baseUrl + 'EXP-SM0809_60.jpg',  label: 'SM 08-09' },
        { src: baseUrl + 'EXP-SM10_61.jpg',    label: 'SM 10' },
        { src: baseUrl + 'EXP-SM11_63.jpg',    label: 'SM 11' },
        { src: baseUrl + 'EXP-SM12_64.jpg',    label: 'SM 12' },
        { src: baseUrl + 'EXP-SM13_65.jpg',    label: 'SM 13' },
        { src: baseUrl + 'EXP-SM14_66.jpg',    label: 'SM 14' },
        { src: baseUrl + 'EXP-SM15_67.jpg',    label: 'SM 15' },
        { src: baseUrl + 'EXP-SM16_68.jpg',    label: 'SM 16' },
      ];
    },
  }
};

/* ------ Parse URL params ------ */
const params = new URLSearchParams(window.location.search);
const sourceKey   = params.get('source') || 'express';
const method      = parseInt(params.get('method') || '1', 10);
const dateStr     = params.get('date') || getTodayStr();
const showMag     = params.get('mag') === '1';

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
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

/* ------ State ------ */
let totalPages = 0;
let loadedPages = 0;
let erroredPages = 0;

// Keep track of all page definitions for reload
let allPageDefs = [];

function updateStatus() {
  const done = loadedPages + erroredPages;
  const text = document.getElementById('status-text');
  const counter = document.getElementById('status-counter');
  const bar = document.getElementById('status-bar');

  if (done < totalPages) {
    text.textContent = erroredPages > 0
      ? `Loading… (${erroredPages} page(s) failed so far)`
      : `Loading pages…`;
  } else {
    text.textContent = erroredPages > 0
      ? `Done — ${erroredPages} page(s) failed. Try the other method or use Reload.`
      : `All ${totalPages} pages loaded successfully.`;
    if (erroredPages === 0) {
      setTimeout(() => bar.classList.add('hidden'), 3000);
    }
  }

  counter.textContent = `${done} / ${totalPages}`;
}

/* ------ Create a page item ------ */
function createPageItem(src, label, index) {
  const item = document.createElement('div');
  item.className = 'page-item';
  item.id = `page-item-${index}`;
  item.dataset.src = src;
  item.dataset.label = label;
  item.dataset.index = index;

  renderSkeleton(item, label);
  loadImage(item, src, label);

  return item;
}

function renderSkeleton(item, label) {
  item.innerHTML = '';
  item.classList.remove('errored');
  const skeleton = document.createElement('div');
  skeleton.className = 'page-skeleton';
  const skeletonLabel = document.createElement('div');
  skeletonLabel.className = 'page-skeleton-label';
  skeletonLabel.textContent = label;
  skeleton.appendChild(skeletonLabel);
  item.appendChild(skeleton);
}

function loadImage(item, src, label) {
  const img = document.createElement('img');
  img.alt = label;
  img.style.display = 'none';

  img.onload = function () {
    item.querySelector('.page-skeleton')?.remove();
    img.style.display = 'block';
    img.style.opacity = '0';
    requestAnimationFrame(() => {
      img.style.transition = 'opacity 0.4s ease';
      img.style.opacity = '1';
    });
    // Label overlay
    const existing = item.querySelector('.page-label');
    if (!existing) {
      const labelEl = document.createElement('div');
      labelEl.className = 'page-label';
      labelEl.textContent = label;
      item.appendChild(labelEl);
    }
    loadedPages++;
    updateStatus();
  };

  img.onerror = function () {
    const skeleton = item.querySelector('.page-skeleton');
    if (skeleton) {
      skeleton.classList.add('errored');
      const lbl = skeleton.querySelector('.page-skeleton-label');
      if (lbl) lbl.textContent = `⚠ ${label} — not available`;
    }
    item.classList.add('errored');
    erroredPages++;
    updateStatus();
  };

  img.src = src;
  item.appendChild(img);
}

/* ------ Reload all pages ------ */
function reloadPages() {
  // Reset counters
  totalPages = allPageDefs.length;
  loadedPages = 0;
  erroredPages = 0;

  // Show status bar again
  const bar = document.getElementById('status-bar');
  bar.classList.remove('hidden');
  updateStatus();

  // Spin the refresh icon
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning');
  setTimeout(() => btn.classList.remove('spinning'), 1000);

  // Re-render each page
  allPageDefs.forEach(({ src, label, index, container }) => {
    const item = document.getElementById(`page-item-${index}`);
    if (!item) return;

    // Remove old image and reset
    const oldImg = item.querySelector('img');
    if (oldImg) oldImg.remove();
    renderSkeleton(item, label);

    // Use cache-busting timestamp
    const bustSrc = src + (src.includes('?') ? '&' : '?') + '_r=' + Date.now();
    loadImage(item, bustSrc, label);
  });
}

/* ------ Build section tabs ------ */
function buildTabs(sections) {
  const tabsEl = document.getElementById('section-tabs');
  tabsEl.innerHTML = '';
  sections.forEach(({ id, label }) => {
    const tab = document.createElement('button');
    tab.className = 'section-tab';
    tab.textContent = label;
    tab.onclick = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    tabsEl.appendChild(tab);
  });
}

/* ------ Main init ------ */
window.addEventListener('load', function () {
  const source = SOURCES[sourceKey];
  if (!source) {
    document.getElementById('reader-edition-label').textContent = 'Unknown source';
    return;
  }

  // Edition label
  const displayDate = formatDisplayDate(dateStr);
  const methodLabel = method === 2 ? 'Holiday Edition' : 'Regular Edition';
  const magNote = showMag ? ' + Magazine' : '';
  document.getElementById('reader-edition-label').textContent =
    `${source.name} · ${methodLabel}${magNote} · ${displayDate}`;
  document.title = `ePaper — ${source.name} ${displayDate}`;

  // Build newspaper URL
  const baseUrl = source.buildUrl(source.city, dateStr);
  const { paperPages } = source.getPages(method, baseUrl);

  // Magazine: use Sunday of the same week
  let magPages = [];
  if (showMag) {
    const y = parseInt(dateStr.slice(0, 4));
    const m = parseInt(dateStr.slice(4, 6)) - 1;
    const d = parseInt(dateStr.slice(6, 8));
    const dateObj = new Date(y, m, d);
    const sunday = new Date(dateObj);
    sunday.setDate(dateObj.getDate() - dateObj.getDay());
    const pad = n => String(n).padStart(2, '0');
    const sundayStr = `${sunday.getFullYear()}${pad(sunday.getMonth() + 1)}${pad(sunday.getDate())}`;
    const magBaseUrl = source.buildUrl(source.city, sundayStr);
    magPages = source.getMagPages(magBaseUrl);

    document.getElementById('section-magazine').style.display = '';
  }

  totalPages = paperPages.length + magPages.length;
  updateStatus();

  // Build paper pages
  const paperGrid = document.getElementById('paper-pages');
  paperPages.forEach((p, i) => {
    const item = createPageItem(p.src, p.label, i);
    allPageDefs.push({ src: p.src, label: p.label, index: i });
    paperGrid.appendChild(item);
  });

  // Build mag pages
  if (showMag) {
    const magGrid = document.getElementById('mag-pages');
    magPages.forEach((p, i) => {
      const idx = paperPages.length + i;
      const item = createPageItem(p.src, p.label, idx);
      allPageDefs.push({ src: p.src, label: p.label, index: idx });
      magGrid.appendChild(item);
    });
  }

  // Build tabs
  const tabs = [{ id: 'section-newspaper', label: 'Newspaper' }];
  if (showMag) tabs.push({ id: 'section-magazine', label: 'Magazine' });
  buildTabs(tabs);
});
