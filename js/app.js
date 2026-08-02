let currentLang = 'ru';
let currentMode = 'images';
let fileQueue = [];
let sortableInstance = null;

// Регистрация PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW Error:', err));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const fileList = document.getElementById('fileList');
  const dropInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const qualityRange = document.getElementById('qualityRange');
  const qualityVal = document.getElementById('qualityVal');

  // Ползунок качества
  if (qualityRange) {
    qualityRange.addEventListener('input', (e) => {
      qualityVal.textContent = Math.round(e.target.value * 100) + '%';
    });
  }

  // Клик по зоне DropZone
  if (dropZone) {
    dropZone.addEventListener('click', (e) => {
      if (e.target !== dropInput) dropInput.click();
    });
  }

  // Сортировка Drag-to-Reorder
  if (fileList) {
    sortableInstance = new Sortable(fileList, {
      animation: 150,
      ghostClass: 'ghost-class',
      handle: '.drag-handle',
      onEnd: () => {
        const newQueue = [];
        fileList.querySelectorAll('[data-id]').forEach(row => {
          const item = fileQueue.find(f => f.id === row.dataset.id);
          if (item) newQueue.push(item);
        });
        fileQueue = newQueue;
      }
    });
  }

  // Вставка из буфера обмена (Ctrl+V)
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) handleFiles(files);
  });

  // Инициализация языка
  initLanguage();
});

function initLanguage() {
  const pathLang = window.location.pathname.split('/')[1];
  const userLang = translations[pathLang] ? pathLang : (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
  currentLang = translations[userLang] ? userLang : 'en';
  
  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.value = currentLang;
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  currentLang = lang;
  const t = translations[lang] || translations['en'];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  // RTL поддержка для арабского
  document.getElementById('htmlTag').setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  updateDropSubtitle();
}

function updateDropSubtitle() {
  const t = translations[currentLang] || translations['en'];
  const dropSubtitle = document.getElementById('dropSubtitle');
  if (!dropSubtitle) return;
  if (currentMode === 'images') dropSubtitle.textContent = t.drop_sub_images;
  else if (currentMode === 'toPdf') dropSubtitle.textContent = t.drop_sub_topdf;
  else if (currentMode === 'mergePdf') dropSubtitle.textContent = t.drop_sub_mergepdf;
}