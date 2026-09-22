(() => {
  const owner = 'mknight2690-sys';
  const repo = 'KnightTrader-BloFin';
  const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const releaseWebBase = `https://github.com/${owner}/${repo}/releases`;

  const FALLBACK_TAG = 'v1.2.2';
  const ver = FALLBACK_TAG.replace(/^v/, '');
  let windowsUrl = `https://github.com/${owner}/${repo}/releases/download/${FALLBACK_TAG}/KnightTrader-Blofin-Setup-${ver}.exe`;
  let macUrl = `https://github.com/${owner}/${repo}/releases/download/${FALLBACK_TAG}/KnightTrader-Blofin-${ver}-arm64.dmg`;

  const platformButtons = document.querySelectorAll('.platform-btn');
  const btnWindowsList = document.querySelectorAll('.btn-download-windows');
  const btnMacList = document.querySelectorAll('.btn-download-mac');
  const downloadNote = document.getElementById('download-note');
  const downloadLatest = document.getElementById('download-latest');
  const downloadPlatformName = document.getElementById('download-platform-name');

  function triggerDownload(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.style.display = 'none';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  let activePlatform = 'windows';

  function selectPlatform(key) {
    activePlatform = key;
    const isMac = key === 'mac';
    platformButtons.forEach((btn) => {
      const active = btn.dataset.platform === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
      btn.setAttribute('aria-selected', String(active));
    });

    // Update ALL Windows download buttons (hero section + download card)
    btnWindowsList.forEach((btn) => {
      btn.classList.toggle('hidden', isMac);
      btn.textContent = isMac ? '' : 'Download Windows Installer';
    });

    // Update ALL Mac download buttons (hero section + download card)
    btnMacList.forEach((btn) => {
      btn.classList.toggle('hidden', !isMac);
      btn.textContent = isMac ? 'Download macOS Installer' : '';
    });

    if (downloadNote) {
      downloadNote.textContent = isMac
        ? 'macOS: Download the .dmg file, then drag the app into your Applications folder.'
        : 'Windows: Download the .exe installer and double-click to run.';
    }
    if (downloadPlatformName) {
      downloadPlatformName.textContent = isMac ? 'macOS 11 (Big Sur) or later' : 'Windows 11 or later';
    }
    if (downloadLatest) {
      downloadLatest.textContent = FALLBACK_TAG;
    }
  }

  platformButtons.forEach((btn) => {
    btn.addEventListener('click', () => selectPlatform(btn.dataset.platform));
  });

  function bindDownloads() {
    btnWindowsList.forEach((btn) => {
      btn.onclick = () => triggerDownload(windowsUrl);
    });
    btnMacList.forEach((btn) => {
      btn.onclick = () => triggerDownload(macUrl);
    });
  }

  bindDownloads();

  // Initialize: fetch latest release, then set initial platform
  (async () => {
    try {
      const response = await fetch(releaseApiUrl);
      if (response.ok) {
        const release = await response.json();
        const assets = release.assets || [];
        const win = assets.find(a => a.name.includes('Setup') && a.name.endsWith('.exe'));
        const mac = assets.find(a => a.name.endsWith('.dmg') && !a.name.includes('blockmap'));
        if (win?.browser_download_url) windowsUrl = win.browser_download_url;
        if (mac?.browser_download_url) macUrl = mac.browser_download_url;
      }
    } catch {
      // fallback to hardcoded v1.2.2 URLs
    }
    selectPlatform('windows');
  })();
})();