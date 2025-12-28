// Local Storage (Privacy Safe)
const STORE_KEY = "__ads_metrics__";

function getStore() {
  return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
}
function saveStore(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

// Load Ads Data
async function loadAdsData() {
  if (window.ADS_DATA) return window.ADS_DATA;

  const res = await fetch(
    "https://amitmund.github.io/ads-public/ads-data.json",
    { cache: "force-cache" }
  );

  window.ADS_DATA = await res.json();
  return window.ADS_DATA;
}

// Filtering Rules
function isActive(ad) {
  const now = Date.now();
  return (
    now >= new Date(ad.startDate).getTime() &&
    now <= new Date(ad.endDate).getTime()
  );
}

function canShow(ad) {
  const store = getStore();
  return (store[ad.adId]?.impressions || 0) <
    (ad.maxImpressionsPerUser || Infinity);
}

// Weighted sorting for fairness
function sortAdsByWeight(ads) {
  return [...ads].sort((a, b) => (b.weight || 1) - (a.weight || 1));
}

// Impression + Click Tracking
function track(type, ad) {
  const store = getStore();
  store[ad.adId] ||= { impressions: 0, clicks: 0 };
  store[ad.adId][type + "s"]++;
  saveStore(store);

  navigator.sendBeacon(
    "https://metrics.sretoolkit.com/ads",
    JSON.stringify({
      type,
      adId: ad.adId,
      domain: location.hostname,
      ts: Date.now()
    })
  );
}

async function initAds() {
  const slots = document.querySelectorAll(
    '[data-ads-active="true"]'
  );
  if (!slots.length) return;

  const data = await loadAdsData();

  slots.forEach((slot) => {
    if (slot.dataset.adsInitialized) return;
    slot.dataset.adsInitialized = "true";

    const ads = (data[slot.dataset.adsSet] || [])
      .filter(isActive)
      .filter(canShow);

    if (!ads.length) {
      slot.innerHTML = `<div style="text-align:center; padding:10px;">No ads available</div>`;
      return;
    }

    const sortedAds = sortAdsByWeight(ads);

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.gap = "10px";

    if (slot.hasAttribute("data-ads-marquee")) {
      container.style.animation = "ads-marquee 15s linear infinite";
      container.style.whiteSpace = "nowrap";
    } else {
      container.style.justifyContent = "center";
      container.style.flexWrap = "wrap";
    }

    sortedAds.forEach((ad) => {
      const adWrapper = document.createElement("div");

      const img = document.createElement("img");
      img.src = ad.image;
      img.alt = ad.text;
      img.width = ad.width;
      img.height = ad.height;
      img.loading = "lazy";

      const a = document.createElement("a");
      a.href = ad.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer sponsored";
      a.appendChild(img);
      adWrapper.appendChild(a);

      a.addEventListener("click", () => track("click", ad));

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            track("impression", ad);
            io.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      io.observe(adWrapper);
      container.appendChild(adWrapper);
    });

    slot.appendChild(container);
  });
}

// Mutation observer
initAds();
new MutationObserver(initAds).observe(document.body, {
  attributes: true,
  subtree: true,
  attributeFilter: ["data-ads-active"]
});
