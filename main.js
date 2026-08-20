(() => {
  const canonicalUrl = 'https://mknight2690-sys.github.io/knighttrader-blo-site/';
  const btnDownload = document.getElementById('btn-download');
  const downloadNote = document.getElementById('download-note');
  const buttons = document.querySelectorAll('.platform-btn');

  function selectPlatform(key) {
    const isMac = key === 'mac';
    buttons.forEach((btn) => {
      const active = btn.dataset.platform === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (btnDownload) {
      btnDownload.textContent = isMac ? 'Download for Mac' : 'Download for Windows';
      btnDownload.setAttribute('href', canonicalUrl + '#download');
    }
    if (downloadNote) {
      downloadNote.textContent = isMac
        ? 'Mac: use this page for the official Mac path or local Electron build guidance.'
        : 'Windows: use this page for the latest Windows download when available.';
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => selectPlatform(btn.dataset.platform));
  });

  selectPlatform('windows');
})();
