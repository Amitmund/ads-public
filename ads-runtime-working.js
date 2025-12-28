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
    // "https://cdn.jsdelivr.net/gh/YOUR_USERNAME/ads-public@main/ads-data.json",
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
function pickAd(ads) {
  const total = ads.reduce((s, a) => s + (a.weight || 1), 0);
  let r = Math.random() * total;

  for (const ad of ads) {
    r -= ad.weight || 1;
    if (r <= 0) return ad;
  }
}


// Impression + Click Tracking
function track(type, ad) {
  const store = getStore();
  store[ad.adId] ||= { impressions: 0, clicks: 0 };
  store[ad.adId][type + "s"]++;
  saveStore(store);

  navigator.sendBeacon(
    "https://metrics.yoursite.com/ads",
    JSON.stringify({
      type,
      adId: ad.adId,
      advertiserId: ad.advertiserId,
      campaignId: ad.campaignId,
      domain: location.hostname,
      ts: Date.now()
    })
  );
}


// Render Ads

async function initAds() {
  const slots = document.querySelectorAll(
    '[data-ads-marquee][data-ads-active="true"]'
  );
  if (!slots.length) return;

  const data = await loadAdsData();

  slots.forEach((slot) => {
    if (slot.dataset.adsInitialized) return;
    slot.dataset.adsInitialized = "true";

    const ads = (data[slot.dataset.adsSet] || [])
      .filter(isActive)
      .filter(canShow);

    if (!ads.length) return;

    const ad = pickAd(ads);
    const img = document.createElement("img");

    img.src = ad.image;
    img.alt = ad.text;
    img.loading = "lazy";
    img.width = ad.width;
    img.height = ad.height;

    const a = document.createElement("a");
    a.href = ad.link;
    a.target = "_blank";
    a.rel = "noopener noreferrer sponsored";
    a.appendChild(img);

    a.addEventListener("click", () => track("click", ad));

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          track("impression", ad);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    slot.appendChild(a);
    io.observe(a);
  });
}

initAds();
new MutationObserver(initAds).observe(document.body, {
  attributes: true,
  subtree: true,
  attributeFilter: ["data-ads-active"]
});

