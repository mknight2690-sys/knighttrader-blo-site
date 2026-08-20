(() => {
  const windowsUrl = 'https://github.com/mknight2690-sys/KnightTrader-BloFin/releases/download/v1.0.0/KnightTrader-BloFin-Setup.exe';
  const macUrl = 'https://github.com/mknight2690-sys/KnightTrader-BloFin/releases/download/v1.0.0/KnightTrader-1.0.0-arm64.dmg';
  const btnWindows = document.getElementById('btn-download-windows');
  const btnMac = document.getElementById('btn-download-mac');
  const downloadNote = document.getElementById('download-note');
  const buttons = document.querySelectorAll('.platform-btn');

  function selectPlatform(key) {
    const isMac = key === 'mac';
    buttons.forEach((btn) => {
      const active = btn.dataset.platform === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (btnWindows) {
      btnWindows.classList.toggle('hidden', isMac);
      btnWindows.setAttribute('href', windowsUrl);
      btnWindows.textContent = 'Download for Windows';
    }
    if (btnMac) {
      btnMac.classList.toggle('hidden', !isMac);
      btnMac.setAttribute('href', macUrl);
      btnMac.textContent = 'Download for Mac';
    }
    if (downloadNote) {
      downloadNote.textContent = isMac
        ? 'Mac: download the KT BloFin .dmg directly.'
        : 'Windows: download the KT BloFin .exe installer directly.';
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => selectPlatform(btn.dataset.platform));
  });

  selectPlatform('windows');
})();
