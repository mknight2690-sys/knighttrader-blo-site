(() => {
  const owner = 'mknight2690-sys';
  const repo = 'KnightTrader-BloFin';
  const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const releaseWebBase = `https://github.com/${owner}/${repo}/releases`;
  // Fallback URLs point at the latest *published* release (v1.2.1).
  // These are overwritten at runtime when the GitHub API responds
  // successfully — they are only here for offline / API-blocked cases.
  const FALLBACK_TAG = 'v1.2.1';
  const windowsUrl = `https://github.com/${owner}/${repo}/releases/download/${FALLBACK_TAG}/KnightTrader-Blofin-Setup-${FALLBACK_TAG.replace(/^v/, '')}.exe`;
  const macUrl = `https://github.com/${owner}/${repo}/releases/download/${FALLBACK_TAG}/KnightTrader-Blofin-1.2.1-arm64.dmg`;

  const btnWindows = document.getElementById('btn-download-windows');
  const btnMac = document.getElementById('btn-download-mac');
  const downloadNote = document.getElementById('download-note');
  const downloadLatest = document.getElementById('download-latest');
  const downloadPlatformName = document.getElementById('download-platform-name');
  const buttons = document.querySelectorAll('.platform-btn');

  function triggerDownload(url) {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // ignore and fall through
    }
  }

  let activePlatform = 'windows';

  function selectPlatform(key) {
    activePlatform = key;
    const isMac = key === 'mac';
    buttons.forEach((btn) => {
      const active = btn.dataset.platform === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
      btn.setAttribute('aria-selected', String(active));
    });
    if (btnWindows) {
      btnWindows.classList.toggle('hidden', isMac);
    }
    if (btnMac) {
      btnMac.classList.toggle('hidden', !isMac);
    }
    if (downloadNote) {
      if (isMac) {
        downloadNote.textContent = 'macOS: download the KT BloFin .dmg, then drag the app into Applications.';
      } else {
        downloadNote.textContent = 'Windows: download the KT BloFin installer .exe, then double-click to install.';
      }
    }
    if (downloadPlatformName) {
      downloadPlatformName.textContent = isMac ? 'macOS 11 (Big Sur) or later' : 'Windows 11 or later';
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => selectPlatform(btn.dataset.platform));
  });

  function bindDownloads() {
    if (btnWindows) {
      btnWindows.onclick = () => triggerDownload(windowsUrl);
    }
    if (btnMac) {
      btnMac.onclick = () => triggerDownload(macUrl);
    }
  }

  bindDownloads();

  // Set initial platform label
  if (downloadLatest) {
    downloadLatest.textContent = FALLBACK_TAG;
  }
  selectPlatform('windows');
})();
