(function () {
  const domain = location.hostname.toLowerCase();

  function loadScript(src, cb) {
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    if (cb) s.onload = cb;
    document.head.appendChild(s);
  }

  loadScript(
    "https://cdn.jsdelivr.net/gh/YOUR_USERNAME/ads-public@main/ads-domain-map.js",
    () => {
      const config = window.ADS_DOMAIN_MAP?.[domain];
      if (!config || !config.enabled) return;

      document
        .querySelectorAll("[data-ads-marquee]")
        .forEach((el) => {
          el.dataset.adsActive = "true";
          el.dataset.adsSet = config.adSet;
        });

      loadScript(
        "https://cdn.jsdelivr.net/gh/YOUR_USERNAME/ads-public@main/ads-runtime.js"
      );
    }
  );
})();
