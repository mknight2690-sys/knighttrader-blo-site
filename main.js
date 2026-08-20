(() => {
  const releaseUrl = 'https://github.com/mknig/hermes-trader/releases/latest';
  const platforms = {
    windows: {
      label: 'Download for Windows',
      note: '.exe installer • If the download button breaks, use the release page and download KnightTrader.BloFin.exe manually.',
      href: releaseUrl,
    },
    mac: {
      label: 'Open macOS build/release page',
      note: 'Use the latest release assets for Mac guidance and available downloads.',
      href: releaseUrl,
    },
  };

  const btnDownload = document.getElementById('btn-download');
  const downloadNote = document.getElementById('download-note');
  const buttons = document.querySelectorAll('.platform-btn');

  function selectPlatform(key) {
    const data = platforms[key];
    if (!data || !btnDownload || !downloadNote) return;
    buttons.forEach((btn) => {
      const active = btn.dataset.platform === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    btnDownload.textContent = data.label;
    downloadNote.innerHTML = data.note;
    if (data.href && btnDownload.getAttribute('href') !== data.href) {
      btnDownload.setAttribute('href', data.href);
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => selectPlatform(btn.dataset.platform));
  });

  selectPlatform('windows');
})();
