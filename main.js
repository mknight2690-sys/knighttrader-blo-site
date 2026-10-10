(() => {
  const owner = 'mknight2690-sys';
  const repo = 'KnightTrader-BloFin';
  const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const latestYmlUrl = `https://github.com/${owner}/${repo}/releases/latest/download/latest.yml`;
  const latestMacYmlUrl = `https://github.com/${owner}/${repo}/releases/latest/download/latest-mac.yml`;
  // Last-resort pin — only used if API + latest.yml both fail.
  // Prefer resolving live filenames so we never 404 mid-publish.
  const FALLBACK_TAG = 'v1.2.54';
  const FALLBACK_VER = FALLBACK_TAG.replace(/^v/, '');
  let windowsUrl = `https://github.com/${owner}/${repo}/releases/latest/download/KnightTrader-Blofin-Setup-${FALLBACK_VER}.exe`;
  let macUrl = `https://github.com/${owner}/${repo}/releases/latest/download/KnightTrader-Blofin-${FALLBACK_VER}-arm64.dmg`;
  let latestTag = FALLBACK_TAG;
  let linksReady = false;

  const platformButtons = document.querySelectorAll('.platform-btn');
  const btnWindowsList = document.querySelectorAll('.btn-download-windows');
  const btnMacList = document.querySelectorAll('.btn-download-mac');
  const downloadNote = document.getElementById('download-note');
  const downloadLatest = document.getElementById('download-latest');
  const downloadPlatformName = document.getElementById('download-platform-name');

  function triggerDownload(url) {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function setButtonsEnabled(enabled) {
    [...btnWindowsList, ...btnMacList].forEach((btn) => {
      btn.disabled = !enabled;
      btn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    });
  }

  function selectPlatform(key) {
    const isMac = key === 'mac';
    platformButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.platform === key);
    });
    btnWindowsList.forEach((btn) => {
      btn.classList.toggle('hidden', isMac);
      btn.textContent = isMac ? '' : (linksReady ? 'Download Windows Installer' : 'Preparing download…');
    });
    btnMacList.forEach((btn) => {
      btn.classList.toggle('hidden', !isMac);
      btn.textContent = isMac ? (linksReady ? 'Download macOS Installer' : 'Preparing download…') : '';
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
      downloadLatest.textContent = latestTag;
    }
  }

  function bindDownloads() {
    btnWindowsList.forEach((btn) => {
      btn.onclick = () => {
        if (!linksReady) return;
        triggerDownload(windowsUrl);
      };
    });
    btnMacList.forEach((btn) => {
      btn.onclick = () => {
        if (!linksReady) return;
        triggerDownload(macUrl);
      };
    });
    platformButtons.forEach((btn) => {
      btn.onclick = () => selectPlatform(btn.dataset.platform || 'windows');
    });
  }

  async function fetchText(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  function parseElectronUpdaterYml(text) {
    if (!text) return null;
    const version = (text.match(/^version:\s*(.+)$/m) || [])[1]?.trim();
    const pathName = (text.match(/^path:\s*(.+)$/m) || [])[1]?.trim()
      || (text.match(/^\s+-\s+url:\s*(.+)$/m) || [])[1]?.trim();
    if (!pathName) return null;
    return {
      version: version || null,
      file: pathName.replace(/^["']|["']$/g, ''),
    };
  }

  async function urlExists(url) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      // Some CDNs block HEAD — treat opaque/ok as success; only fail hard 404.
      if (res.status === 404) return false;
      return res.ok || res.status === 0 || res.type === 'opaque';
    } catch {
      // CORS may block HEAD from the browser; assume OK if we got the name from latest.yml
      return true;
    }
  }

  async function resolveFromLatestYml() {
    const [winText, macText] = await Promise.all([
      fetchText(latestYmlUrl),
      fetchText(latestMacYmlUrl),
    ]);
    const win = parseElectronUpdaterYml(winText);
    const mac = parseElectronUpdaterYml(macText);
    let ok = false;
    if (win?.file) {
      windowsUrl = `https://github.com/${owner}/${repo}/releases/latest/download/${win.file}`;
      if (win.version) latestTag = `v${win.version}`;
      ok = true;
    }
    if (mac?.file) {
      macUrl = `https://github.com/${owner}/${repo}/releases/latest/download/${mac.file}`;
      if (mac.version) latestTag = `v${mac.version}`;
      ok = true;
    }
    return ok;
  }

  async function fetchLatestReleaseWithRetry() {
    for (let i = 1; i <= 3; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const response = await fetch(releaseApiUrl, {
          signal: controller.signal,
          headers: { Accept: 'application/vnd.github+json' },
          cache: 'no-store',
        });
        clearTimeout(timeout);
        if (response.ok) return await response.json();
      } catch {
        if (i < 3) await new Promise((r) => setTimeout(r, 1200 * i));
      }
    }
    return null;
  }

  async function updateDownloadLinks() {
    setButtonsEnabled(false);
    selectPlatform('windows');

    // 1) Prefer latest.yml (no API rate limit; always matches published assets)
    const fromYml = await resolveFromLatestYml();

    // 2) Overlay with GitHub API asset URLs when available
    const release = await fetchLatestReleaseWithRetry();
    if (release) {
      const assets = release.assets || [];
      const tag = release.tag_name || latestTag;
      const winAsset = assets.find((a) => /Setup.*\.exe$/i.test(a.name));
      const macAsset = assets.find((a) => /\.dmg$/i.test(a.name) && !/blockmap/i.test(a.name));
      if (winAsset?.browser_download_url) windowsUrl = winAsset.browser_download_url;
      if (macAsset?.browser_download_url) macUrl = macAsset.browser_download_url;
      latestTag = tag;
    } else if (!fromYml) {
      console.log(`Using pinned fallback ${FALLBACK_TAG} (API + latest.yml unavailable)`);
      windowsUrl = `https://github.com/${owner}/${repo}/releases/download/${FALLBACK_TAG}/KnightTrader-Blofin-Setup-${FALLBACK_VER}.exe`;
      macUrl = `https://github.com/${owner}/${repo}/releases/download/${FALLBACK_TAG}/KnightTrader-Blofin-${FALLBACK_VER}-arm64.dmg`;
      latestTag = FALLBACK_TAG;
    }

    // 3) Avoid enabling a known-missing Windows build (mid-publish race)
    const winOk = await urlExists(windowsUrl);
    if (!winOk) {
      const ymlRetry = await resolveFromLatestYml();
      if (!ymlRetry) {
        if (downloadNote) {
          downloadNote.textContent = 'Installer is still publishing — refresh in a minute.';
        }
        selectPlatform('windows');
        return;
      }
    }

    linksReady = true;
    setButtonsEnabled(true);
    selectPlatform('windows');
  }

  bindDownloads();
  setButtonsEnabled(false);
  updateDownloadLinks();
})();
