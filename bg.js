(function () {
  "use strict";

  const bgKey = "ptResumeDynamicBg";
  const bgRoot = document.getElementById("dynamicBackground");
  const bgSelect = document.getElementById("bgSelect");
  const styleElement = document.createElement("style");

  const backgrounds = [
    { id: "none", label: "00_無背景", className: "bg-none" },
    { id: "galaxy", label: "01_夢幻銀河", className: "bg-galaxy" },
    { id: "aurora", label: "02_極光帷幕", className: "bg-aurora" },
    { id: "gradient", label: "03_柔彩流光", className: "bg-gradient" },
    { id: "bubbles", label: "04_漂浮光泡", className: "bg-bubbles" },
    { id: "stars", label: "05_星點微光", className: "bg-stars" },
    { id: "waves", label: "06_海浪流線", className: "bg-waves" },
    { id: "rain", label: "07_雨絲光幕", className: "bg-rain" },
    { id: "grid", label: "08_紙感幾何", className: "bg-grid" },
    { id: "mist", label: "09_晨曦雲霧", className: "bg-mist" },
    { id: "dust", label: "10_粒子星塵", className: "bg-dust" }
  ];

  const backgroundCss = `
.dynamic-bg {
  opacity: 1;
  transition: opacity .35s ease, background .35s ease;
}
.dynamic-bg.bg-none {
  opacity: 0;
}
.dynamic-bg::before,
.dynamic-bg::after {
  content: "";
  position: absolute;
  inset: -18%;
  pointer-events: none;
}
.bg-galaxy {
  background:
    radial-gradient(circle at 50% 52%, rgba(255, 236, 190, .34), transparent 8%),
    radial-gradient(ellipse at 50% 50%, rgba(127, 88, 255, .38), transparent 28%),
    radial-gradient(circle at 20% 18%, rgba(55, 128, 255, .28), transparent 24%),
    #050816;
}
.bg-galaxy::before {
  background:
    radial-gradient(circle, rgba(255,255,255,.95) 0 1px, transparent 1.8px) 0 0 / 78px 78px,
    radial-gradient(circle, rgba(196,220,255,.85) 0 1px, transparent 2px) 22px 26px / 126px 126px;
  animation: bgDrift 28s linear infinite;
}
.bg-galaxy::after {
  inset: 8% 6%;
  border-radius: 50%;
  background: conic-gradient(from 20deg, transparent, rgba(150, 115, 255, .32), rgba(255, 245, 204, .42), transparent 62%);
  filter: blur(12px);
  animation: bgSpin 34s linear infinite;
}
.bg-aurora {
  background: linear-gradient(120deg, #071522, #10213b 45%, #13251f);
}
.bg-aurora::before {
  background:
    linear-gradient(110deg, transparent 12%, rgba(101, 255, 188, .30), transparent 42%),
    linear-gradient(70deg, transparent 20%, rgba(127, 164, 255, .28), transparent 55%),
    linear-gradient(135deg, transparent 18%, rgba(238, 127, 255, .18), transparent 48%);
  filter: blur(18px);
  animation: bgSlide 16s ease-in-out infinite alternate;
}
.bg-gradient {
  background: linear-gradient(120deg, #f7d9dc, #d9eefc, #dff2d8, #efd7f6);
  background-size: 300% 300%;
  animation: bgGradient 18s ease infinite;
}
.bg-bubbles {
  background: #f6fbff;
}
.bg-bubbles::before {
  background:
    radial-gradient(circle at 18% 24%, rgba(111, 164, 255, .34), transparent 8%),
    radial-gradient(circle at 78% 18%, rgba(255, 182, 216, .36), transparent 9%),
    radial-gradient(circle at 28% 78%, rgba(140, 224, 191, .34), transparent 10%),
    radial-gradient(circle at 70% 72%, rgba(245, 214, 122, .30), transparent 9%);
  filter: blur(3px);
  animation: bgFloat 15s ease-in-out infinite alternate;
}
.bg-stars {
  background: linear-gradient(180deg, #101827, #1d2636);
}
.bg-stars::before {
  background:
    radial-gradient(circle, rgba(255,255,255,.88) 0 1px, transparent 1.7px) 4px 9px / 64px 64px,
    radial-gradient(circle, rgba(204,229,255,.74) 0 1px, transparent 1.8px) 24px 18px / 96px 96px;
  animation: bgTwinkle 4.5s ease-in-out infinite alternate;
}
.bg-waves {
  background: linear-gradient(180deg, #eaf7fb, #dff2ee);
}
.bg-waves::before {
  background:
    repeating-radial-gradient(ellipse at 50% 120%, rgba(44, 129, 156, .16) 0 3px, transparent 4px 20px);
  transform: translateY(0);
  animation: bgWave 12s ease-in-out infinite alternate;
}
.bg-rain {
  background: linear-gradient(180deg, #f6f8fb, #e9eef7);
}
.bg-rain::before {
  background: repeating-linear-gradient(112deg, rgba(77, 111, 160, .18) 0 1px, transparent 1px 18px);
  animation: bgRain 9s linear infinite;
}
.bg-grid {
  background: #faf8f2;
}
.bg-grid::before {
  background:
    linear-gradient(90deg, rgba(78, 89, 103, .12) 1px, transparent 1px) 0 0 / 32px 32px,
    linear-gradient(0deg, rgba(78, 89, 103, .10) 1px, transparent 1px) 0 0 / 32px 32px,
    radial-gradient(circle at 22% 28%, rgba(207, 138, 60, .12), transparent 20%);
  animation: bgDrift 30s linear infinite;
}
.bg-mist {
  background: linear-gradient(135deg, #fff7e8, #eaf4ff 48%, #f4ecff);
}
.bg-mist::before {
  background:
    radial-gradient(circle at 25% 34%, rgba(255, 255, 255, .75), transparent 18%),
    radial-gradient(circle at 68% 62%, rgba(255, 216, 161, .36), transparent 22%),
    radial-gradient(circle at 74% 24%, rgba(178, 217, 255, .45), transparent 20%);
  filter: blur(20px);
  animation: bgFloat 18s ease-in-out infinite alternate;
}
.bg-dust {
  background: linear-gradient(160deg, #18202f, #263648);
}
.bg-dust::before {
  background:
    radial-gradient(circle, rgba(255,255,255,.75) 0 1px, transparent 1.6px) 0 0 / 42px 42px,
    radial-gradient(circle, rgba(255,227,167,.52) 0 1px, transparent 1.7px) 18px 22px / 74px 74px;
  animation: bgDust 14s linear infinite;
}
@keyframes bgDrift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-42px, -28px, 0); }
}
@keyframes bgSpin {
  to { transform: rotate(360deg); }
}
@keyframes bgSlide {
  from { transform: translateX(-6%) skewX(-6deg); }
  to { transform: translateX(7%) skewX(5deg); }
}
@keyframes bgGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes bgFloat {
  from { transform: translate3d(-2%, -1%, 0) scale(1); }
  to { transform: translate3d(2%, 2%, 0) scale(1.04); }
}
@keyframes bgTwinkle {
  from { opacity: .55; transform: scale(1); }
  to { opacity: .95; transform: scale(1.02); }
}
@keyframes bgWave {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-26px) scale(1.03); }
}
@keyframes bgRain {
  from { transform: translate3d(0, -40px, 0); }
  to { transform: translate3d(-40px, 40px, 0); }
}
@keyframes bgDust {
  from { transform: translate3d(0, 0, 0); opacity: .65; }
  to { transform: translate3d(-24px, -52px, 0); opacity: .9; }
}
@media (prefers-reduced-motion: reduce) {
  .dynamic-bg,
  .dynamic-bg::before,
  .dynamic-bg::after {
    animation: none !important;
  }
}
`;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    if (!bgRoot || !bgSelect) return;

    document.head.appendChild(styleElement);
    styleElement.textContent = backgroundCss;

    bgSelect.innerHTML = backgrounds.map(function (bg) {
      return `<option value="${escapeAttr(bg.id)}">${escapeHtml(bg.label)}</option>`;
    }).join("");

    const selectedBg = getInitialBackground();
    bgSelect.value = selectedBg;
    applyBackground(selectedBg);

    bgSelect.addEventListener("change", function () {
      localStorage.setItem(bgKey, bgSelect.value);
      applyBackground(bgSelect.value);
    });
  }

  function getInitialBackground() {
    const bgParam = new URLSearchParams(window.location.search).get("bg");
    const storedBg = localStorage.getItem(bgKey);
    const selectedBg = bgParam || storedBg || backgrounds[0].id;
    return backgrounds.some(function (bg) { return bg.id === selectedBg; }) ? selectedBg : backgrounds[0].id;
  }

  function applyBackground(id) {
    const bg = backgrounds.find(function (item) { return item.id === id; }) || backgrounds[0];
    bgRoot.className = `dynamic-bg ${bg.className}`;
    document.body.dataset.dynamicBackground = bg.id;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/\n/g, " ");
  }
}());
