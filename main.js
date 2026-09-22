(() => {
  const owner = 'mknight2690-sys';
  const repo = 'KnightTrader-BloFin';
  const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const releaseWebBase = `https://github.com/${owner}/${repo}/releases`;

  // Fallback URLs point at v1.2.2 - these will be updated dynamically
  const FALLBACK_TAG = 'v1.2.2';
  const ver = FALLBACK_TAG.replace(/^v/, '');
  let windowsUrl = `https://github.com/${owner}/${repo}/releases/download/${FALLBACK_TAG}/KnightTrader-Blofin-Setup-${ver}.exe`;
  let macUrl = `https://github.com/${owner}/${repo}/releases/download/${FALLBACK_TAG}/KnightTrader-Blofin-${ver}-arm64.dmg`;

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

    // Update button text based on selection
    if (btnWindows) {
      btnWindows.classList.toggle('hidden', isMac);
      btnWindows.textContent = isMac ? '' : 'Download Windows Installer';
    }
    if (btnMac) {
      btnMac.classList.toggle('hidden', !isMac);
      btnMac.textContent = isMac ? 'Download macOS Installer' : '';
    }

    if (downloadNote) {
      if (isMac) {
        downloadNote.textContent = 'macOS: Download the .dmg file, then drag the app into your Applications folder.';
      } else {
        downloadNote.textContent = 'Windows: Download the .exe installer and double-click to run.';
      }
    }
    if (downloadPlatformName) {
      downloadPlatformName.textContent = isMac ? 'macOS 11 (Big Sur) or later' : 'Windows 11 or later';
    }
    if (downloadLatest) {
      downloadLatest.textContent = FALLBACK_TAG;
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

  // Fetch latest release to get actual URLs
  async function updateDownloadLinks() {
    try {
      const response = await fetch(releaseApiUrl);
      if (response.ok) {
        const release = await response.json();
        const assets = release.assets || [];

        // Find Windows installer
        const windowsAsset = assets.find(asset =>
          asset.name.includes('Setup') && asset.name.endsWith('.exe')
        );
        if (windowsAsset?.browser_download_url) {
          windowsUrl = windowsAsset.browser_download_url;
        }

        // Find macOS installer
        const macAsset = assets.find(asset =>
          asset.name.endsWith('.dmg') && !asset.name.includes('blockmap')
        );
        if (macAsset?.browser_download_url) {
          macUrl = macAsset.browser_download_url;
        }
      }
    } catch (error) {
      console.log('Could not fetch latest release, using fallback URLs');
    }
  }

  // Initialize
  updateDownloadLinks().then(() => {
    selectPlatform('windows');
  });
})();