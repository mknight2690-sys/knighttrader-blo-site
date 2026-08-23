(() => {
  const owner = 'mknight2690-sys';
  const repo = 'KnightTrader-BloFin';
  const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const releaseWebBase = `https://github.com/${owner}/${repo}/releases`;
  const windowsAssetUrl = 'https://github.com/mknight2690-sys/KnightTrader-BloFin/releases/download/v1.0.7/KnightTrader.Blofin.Setup.1.0.7.exe';
  const macAssetUrl = 'https://github.com/mknight2690-sys/KnightTrader-BloFin/releases/download/v1.0.7/KnightTrader-Blofin-1.0.7-arm64.dmg';
  let windowsUrl = windowsAssetUrl;
  let macUrl = macAssetUrl;
  const btnWindows = document.getElementById('btn-download-windows');
  const btnMac = document.getElementById('btn-download-mac');
  const downloadNote = document.getElementById('download-note');
  const buttons = document.querySelectorAll('.platform-btn');

  async function fetchLatestRelease() {
    try {
      const res = await fetch(releaseApiUrl, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function findAsset(assets, pattern) {
    if (!Array.isArray(assets)) return null;
    return assets.find((asset) => pattern.test(asset.name)) || null;
  }

  async function updateDownloadLinks() {
    const release = await fetchLatestRelease();
    if (release?.assets?.length) {
      const windowsAsset = findAsset(release.assets, /KnightTrader[-.]Blofin[-.]Setup.*\.exe$/i)
        || findAsset(release.assets, /\.exe$/i);
      const macAsset = findAsset(release.assets, /KnightTrader[-.]Blofin.*\.dmg$/i)
        || findAsset(release.assets, /\.dmg$/i);
      if (windowsAsset?.browser_download_url) {
        windowsUrl = windowsAsset.browser_download_url;
      }
      if (macAsset?.browser_download_url) {
        macUrl = macAsset.browser_download_url;
      }
    }
  }

  function triggerDownload(url) {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // ignore and fall through
    }
  }

  function selectPlatform(key) {
    const isMac = key === 'mac';
    buttons.forEach((btn) => {
      const active = btn.dataset.platform === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (btnWindows) {
      btnWindows.classList.toggle('hidden', isMac);
      btnWindows.textContent = 'Download for Windows';
    }
    if (btnMac) {
      btnMac.classList.toggle('hidden', !isMac);
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

  if (btnWindows) {
    btnWindows.addEventListener('click', (e) => {
      e.preventDefault();
      triggerDownload(windowsUrl);
    });
  }

  if (btnMac) {
    btnMac.addEventListener('click', (e) => {
      e.preventDefault();
      triggerDownload(macUrl);
    });
  }

  updateDownloadLinks().then(() => selectPlatform('windows'));
})();
