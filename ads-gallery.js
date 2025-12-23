// ads-gallery.js (V1 and its working. Don;t change for the newer version.).

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("ads");
  if (!container || !window.ADS_CONFIG) return;

  const { items, speed } = window.ADS_CONFIG;

  // Outer wrapper
  const wrapper = document.createElement("div");
  wrapper.style.overflow = "hidden";
  wrapper.style.whiteSpace = "nowrap";
  wrapper.style.width = "100%";

  // Marquee track
  const track = document.createElement("div");
  track.style.display = "inline-flex";
  track.style.alignItems = "center";
  track.style.gap = "24px";
  track.style.animation = `ads-marquee ${speed}s linear infinite`;

  // Duplicate items for seamless scroll
  const allItems = [...items, ...items];

  allItems.forEach(item => {
    const card = document.createElement("div");
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";
    card.style.minWidth = `${item.width}px`;

    const img = document.createElement("img");
    img.src = item.image;
    img.width = item.width;
    img.height = item.height;
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";

    const text = document.createElement("div");
    text.textContent = item.text;
    text.style.marginTop = "8px";
    text.style.fontSize = "14px";
    text.style.textAlign = "center";

    card.appendChild(img);
    card.appendChild(text);
    track.appendChild(card);
  });

  wrapper.appendChild(track);
  container.appendChild(wrapper);

  // Inject keyframes dynamically
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes ads-marquee {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }
  `;
  document.head.appendChild(style);
});
