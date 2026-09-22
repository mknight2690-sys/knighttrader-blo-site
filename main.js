(() => {
  const owner = 'mknight2690-sys';
  const repo = 'KnightTrader-BloFin';
  const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  // v1.2.2 URLs - will be updated dynamically by GitHub API
  const FALLBACK_TAG = 'v1.2.2';
  const ver = FALLBACK_TAG.replace(/^v/, '');
  let windowsUrl = `https://github.com/${owner}/${repo}/releases/download/v1.2.2/KnightTrader-Blofin-Setup-1.2.2.exe`;
  let macUrl = `https://github.com/${owner}/${repo}/releases/download/v1.2.2/KnightTrader-Blofin-1.2.2-arm64.dmg`;

  // Get ALL button instances (both hero section and bottom download card)
  const platformButtons = document.querySelectorAll('.platform-btn');
  const btnWindowsList = document.querySelectorAll('.btn-download-windows');
  const btnMacList = document.querySelectorAll('.btn-download-mac');

  // Get other UI elements
  const downloadNote = document.getElementById('download-note');
  const downloadLatest = document.getElementById('download-latest');
  const downloadPlatformName = document.getElementById('download-platform-name');

  // Trigger download by creating and clicking an anchor tag
  function triggerDownload(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Select platform and update ALL button instances
  function selectPlatform(key) {
    const isMac = key === 'mac';

    // Update tab buttons
    platformButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.platform === key);
    });

    // Update ALL Windows buttons (both hero + bottom)
    btnWindowsList.forEach((btn) => {
      btn.classList.toggle('hidden', isMac);
      btn.textContent = isMac ? '' : 'Download Windows Installer';
    });

    // Update ALL Mac buttons (both hero + bottom)
    btnMacList.forEach((btn) => {
      btn.classList.toggle('hidden', !isMac);
      btn.textContent = isMac ? 'Download macOS Installer' : '';
    });

    // Update note text
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

  // Attach click handlers to ALL button instances
  function bindDownloads() {
    btnWindowsList.forEach((btn) => {
      btn.onclick = () => triggerDownload(windowsUrl);
    });
    btnMacList.forEach((btn) => {
      btn.onclick = () => triggerDownload(macUrl);
    });
  }

  // Fetch latest release from GitHub API to get correct asset URLs
  async function updateDownloadLinks() {
    try {
      const response = await fetch(releaseApiUrl);
      if (response.ok) {
        const release = await response.json();
        const assets = release.assets || [];

        const winAsset = assets.find(a => a.name.includes('Setup') && a.name.endsWith('.exe'));
        if (winAsset?.browser_download_url) {
          windowsUrl = winAsset.browser_download_url;
        }

        const macAsset = assets.find(a => a.name.endsWith('.dmg') && !a.name.includes('blockmap'));
        if (macAsset?.browser_download_url) {
          macUrl = macAsset.browser_download_url;
        }
      }
    } catch {
      console.log('Using fallback v1.2.2 URLs');
    }
    selectPlatform('windows');
  }

  // Initialize
  updateDownloadLinks();
  bindDownloads();
})();