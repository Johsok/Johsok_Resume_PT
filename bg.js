(function () {
  "use strict";

  const bgKey = "ptResumeDynamicBg";
  const bgRoot = document.getElementById("dynamicBackground");
  const bgSelect = document.getElementById("bgSelect");
  const styleElement = document.createElement("style");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let animationFrameId = null;
  let activeBackground = "none";
  let frame = 0;
  let stars = [];
  let particles = [];
  let meteors = [];
  const pointer = { x: 0, y: 0, active: false };
  const planetModel = [
    { name: "水星", orbit: .14, size: 3.2, color: ["#d8d8d8", "#777"], speed: 1.85 },
    { name: "金星", orbit: .22, size: 4.8, color: ["#f5df82", "#b8862c"], speed: 1.45 },
    { name: "地球", orbit: .31, size: 5.2, color: ["#66b7ff", "#1b5fae"], speed: 1.12 },
    { name: "火星", orbit: .40, size: 4.1, color: ["#e98c6d", "#9d321c"], speed: .92 },
    { name: "木星", orbit: .52, size: 9.2, color: ["#f2d1a2", "#9f6b3d"], speed: .58 },
    { name: "土星", orbit: .64, size: 8.0, color: ["#f3dfab", "#a98348"], speed: .46, ring: true },
    { name: "天王星", orbit: .75, size: 6.2, color: ["#bcf4f4", "#3aa6b8"], speed: .36 },
    { name: "海王星", orbit: .86, size: 5.9, color: ["#8ca1ff", "#2f49b8"], speed: .30 },
    { name: "冥王星", orbit: .96, size: 3.0, color: ["#d7b89c", "#7d5c43"], speed: .24 }
  ];

  const backgrounds = [
    { id: "none", label: "00_無背景", className: "bg-none" },
    { id: "ink", label: "01_流體墨水背景", className: "bg-ink" },
    { id: "network", label: "02_粒子連線網絡", className: "bg-network" },
    { id: "ecg", label: "03_脈衝心電圖背景", className: "bg-ecg" },
    { id: "prism", label: "04_玻璃折射光帶", className: "bg-prism" },
    { id: "wireframe", label: "05_漂浮3D幾何線框", className: "bg-wireframe" },
    { id: "contour", label: "06_動態等高線地圖", className: "bg-contour" },
    { id: "lightRain", label: "07_光點雨幕", className: "bg-light-rain" },
    { id: "pulse", label: "08_呼吸式醫療光圈", className: "bg-pulse" },
    { id: "orbit", label: "09_星球軌道儀表盤", className: "bg-orbit" },
    { id: "magnetic", label: "10_互動滑鼠磁場", className: "bg-magnetic" },
    { id: "aurora", label: "11_極光帷幕", className: "bg-aurora" },
    { id: "bubbles", label: "12_漂浮光泡", className: "bg-bubbles" },
    { id: "stars", label: "13_星點微光", className: "bg-stars" },
    { id: "waves", label: "14_海浪流線", className: "bg-waves" },
    { id: "rain", label: "15_雨絲光幕", className: "bg-rain" },
    { id: "grid", label: "16_紙感幾何", className: "bg-grid" },
    { id: "dust", label: "17_粒子星座", className: "bg-dust" }
  ];

  const backgroundCss = `
.dynamic-bg {
  opacity: 1;
  transition: opacity .35s ease, background .35s ease;
}
.dynamic-bg canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.dynamic-bg.bg-none {
  opacity: 0;
}
body[data-dynamic-background]:not([data-dynamic-background="none"]) {
  --theme-bg: transparent;
  --theme-ink: #172326;
  --theme-muted: #5a6663;
  --theme-line: #d8e1de;
  --theme-soft: #f3f7f5;
  --theme-paper: #ffffff;
  --theme-card: #ffffff;
  --theme-shadow: 0 16px 42px rgba(20, 36, 32, .11);
  --theme-texture: none;
  --resume-fixed-bg: linear-gradient(180deg, rgba(255,255,255,.97), rgba(248,251,250,.98));
  --resume-fixed-width: min(1188px, calc(100% - 24px));
  background: transparent !important;
}
body[data-dynamic-background]:not([data-dynamic-background="none"]) .resume-root {
  position: relative;
  isolation: isolate;
  background: transparent !important;
  color: var(--theme-ink) !important;
}
body[data-dynamic-background]:not([data-dynamic-background="none"]) .resume-root::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  z-index: -1;
  width: var(--resume-fixed-width);
  min-height: 100%;
  transform: translateX(-50%);
  background: var(--resume-fixed-bg);
  border-left: 1px solid rgba(216, 225, 222, .82);
  border-right: 1px solid rgba(216, 225, 222, .82);
  box-shadow: 0 0 42px rgba(0, 0, 0, .12);
  pointer-events: none;
}
body[data-dynamic-background]:not([data-dynamic-background="none"]) .resume-page {
  position: relative;
  z-index: 1;
  background: var(--resume-fixed-bg);
}
body[data-dynamic-background]:not([data-dynamic-background="none"]) .theme-dashboard::before,
body[data-dynamic-background]:not([data-dynamic-background="none"]) .theme-split::before,
body[data-dynamic-background]:not([data-dynamic-background="none"]) .theme-matrix::before,
body[data-dynamic-background]:not([data-dynamic-background="none"]) .theme-bento::before {
  display: none;
}
.dynamic-bg::before,
.dynamic-bg::after {
  content: "";
  position: absolute;
  inset: -18%;
  pointer-events: none;
  will-change: transform, opacity, background-position;
}
.bg-ink {
  background: linear-gradient(135deg, #fff8ed, #edf8fb 46%, #f7f0ff);
}
.bg-ink::before {
  background:
    radial-gradient(circle at 18% 28%, rgba(91, 151, 214, .22), transparent 18%),
    radial-gradient(circle at 72% 26%, rgba(219, 132, 172, .20), transparent 19%),
    radial-gradient(circle at 42% 78%, rgba(104, 185, 146, .18), transparent 20%);
  filter: blur(18px);
  animation: bgFloat 13s ease-in-out infinite alternate;
}
.bg-ink::after {
  background: linear-gradient(110deg, transparent 22%, rgba(255,255,255,.34), transparent 58%);
  filter: blur(12px);
  animation: bgSlide 11s ease-in-out infinite alternate;
}
.bg-network {
  background: linear-gradient(145deg, #061016, #13202a 45%, #18281f);
}
.bg-network::before {
  background:
    linear-gradient(90deg, rgba(133, 199, 213, .08) 1px, transparent 1px) 0 0 / 46px 46px,
    linear-gradient(0deg, rgba(126, 177, 142, .07) 1px, transparent 1px) 0 0 / 46px 46px;
  animation: bgDrift 26s linear infinite;
}
.bg-network::after {
  background:
    radial-gradient(circle at 24% 30%, rgba(78, 189, 180, .22), transparent 22%),
    radial-gradient(circle at 72% 68%, rgba(145, 185, 255, .18), transparent 25%);
  filter: blur(14px);
  animation: bgFloat 12s ease-in-out infinite alternate;
}
.bg-ecg {
  background: linear-gradient(180deg, #f6fbf8, #eaf4f2);
}
.bg-ecg::before {
  background:
    linear-gradient(90deg, rgba(65, 130, 115, .09) 1px, transparent 1px) 0 0 / 40px 40px,
    linear-gradient(0deg, rgba(65, 130, 115, .07) 1px, transparent 1px) 0 0 / 40px 40px;
  animation: bgGridShift 30s linear infinite;
}
.bg-ecg::after {
  background:
    radial-gradient(circle at 22% 72%, rgba(68, 191, 156, .18), transparent 16%),
    radial-gradient(circle at 80% 22%, rgba(82, 132, 200, .14), transparent 16%);
  filter: blur(14px);
  animation: bgPulseGlow 4s ease-in-out infinite alternate;
}
.bg-prism {
  background: linear-gradient(135deg, #fbfcff, #edf5f3 52%, #f8f2ee);
}
.bg-prism::before {
  background:
    linear-gradient(68deg, transparent 10%, rgba(255,255,255,.54) 22%, transparent 34%),
    linear-gradient(112deg, transparent 18%, rgba(98, 170, 224, .18) 32%, transparent 48%),
    linear-gradient(48deg, transparent 42%, rgba(224, 155, 92, .16) 54%, transparent 68%);
  filter: blur(6px);
  animation: bgPrismSweep 12s ease-in-out infinite alternate;
}
.bg-prism::after {
  background:
    linear-gradient(115deg, transparent 26%, rgba(255,255,255,.42), transparent 42%),
    linear-gradient(80deg, transparent 48%, rgba(105, 190, 158, .14), transparent 62%);
  mix-blend-mode: screen;
  animation: bgSlide 9s ease-in-out infinite alternate;
}
.bg-wireframe {
  background: linear-gradient(150deg, #081118, #17252a 55%, #221f28);
}
.bg-wireframe::before {
  background:
    radial-gradient(circle at 20% 28%, rgba(94, 217, 190, .18), transparent 22%),
    radial-gradient(circle at 78% 70%, rgba(218, 183, 111, .16), transparent 24%);
  filter: blur(12px);
  animation: bgFloat 10s ease-in-out infinite alternate;
}
.bg-wireframe::after {
  background:
    linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px) 0 0 / 68px 68px,
    linear-gradient(0deg, rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 68px 68px;
  animation: bgDrift 34s linear infinite;
}
.bg-contour {
  background: linear-gradient(145deg, #fbf7ed, #eef7f2 55%, #f4f7fb);
}
.bg-contour::before {
  background:
    radial-gradient(circle at 24% 30%, rgba(79, 145, 133, .16), transparent 20%),
    radial-gradient(circle at 78% 68%, rgba(82, 126, 170, .13), transparent 24%);
  filter: blur(14px);
  animation: bgFloat 16s ease-in-out infinite alternate;
}
.bg-contour::after {
  background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.28), transparent 58%);
  animation: bgSlide 14s ease-in-out infinite alternate;
}
.bg-light-rain {
  background: linear-gradient(180deg, #f7f9fb, #eaf1f5);
}
.bg-light-rain::before {
  background: repeating-linear-gradient(112deg, transparent 0 18px, rgba(72, 128, 154, .13) 19px 21px, transparent 22px 42px);
  animation: bgRain 7s linear infinite;
}
.bg-light-rain::after {
  background:
    linear-gradient(180deg, rgba(255,255,255,.48), transparent 54%),
    radial-gradient(circle at 78% 22%, rgba(92, 188, 210, .16), transparent 18%);
  animation: bgRainGlow 5.5s ease-in-out infinite alternate;
}
.bg-pulse {
  background: linear-gradient(145deg, #f6fbf7, #edf6f5 52%, #f8f5ef);
}
.bg-pulse::before {
  background:
    radial-gradient(circle at 22% 30%, rgba(75, 185, 143, .16), transparent 20%),
    radial-gradient(circle at 72% 68%, rgba(90, 150, 204, .14), transparent 22%);
  filter: blur(10px);
  animation: bgPulseGlow 4.8s ease-in-out infinite alternate;
}
.bg-pulse::after {
  background:
    radial-gradient(circle, rgba(79, 169, 138, .12) 0 1px, transparent 1.5px) 0 0 / 52px 52px;
  animation: bgDrift 28s linear infinite;
}
.bg-orbit {
  background: linear-gradient(150deg, #050710, #111827 50%, #17241f);
}
.bg-orbit::before {
  background:
    radial-gradient(circle, rgba(255,255,255,.78) 0 1px, transparent 1.6px) 0 0 / 58px 58px,
    radial-gradient(circle, rgba(185,220,255,.52) 0 1px, transparent 1.6px) 24px 18px / 92px 92px;
  animation: bgDust 16s linear infinite;
}
.bg-orbit::after {
  background:
    conic-gradient(from 0deg at 50% 50%, transparent, rgba(117, 183, 255, .16), transparent 30%, rgba(107, 207, 159, .12), transparent 58%);
  filter: blur(8px);
  animation: bgSpin 42s linear infinite;
}
.bg-magnetic {
  background: linear-gradient(145deg, #071015, #172026 50%, #111c1a);
}
.bg-magnetic::before {
  background:
    radial-gradient(circle at 22% 26%, rgba(78, 198, 184, .16), transparent 22%),
    radial-gradient(circle at 78% 72%, rgba(226, 185, 107, .13), transparent 24%);
  filter: blur(12px);
  animation: bgFloat 12s ease-in-out infinite alternate;
}
.bg-magnetic::after {
  background:
    linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px) 0 0 / 54px 54px,
    linear-gradient(0deg, rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 54px 54px;
  animation: bgDrift 24s linear infinite;
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
.bg-aurora::after {
  background:
    radial-gradient(ellipse at 28% 45%, rgba(99, 255, 208, .22), transparent 28%),
    radial-gradient(ellipse at 72% 58%, rgba(116, 153, 255, .20), transparent 30%);
  filter: blur(24px);
  animation: bgFloat 12s ease-in-out infinite alternate;
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
.bg-bubbles::after {
  background:
    radial-gradient(circle, rgba(111, 164, 255, .22) 0 8px, transparent 9px) 0 0 / 86px 86px,
    radial-gradient(circle, rgba(255, 182, 216, .26) 0 6px, transparent 7px) 32px 46px / 118px 118px;
  animation: bgBubbleRise 18s linear infinite;
}
.bg-stars {
  background: linear-gradient(180deg, #101827, #1d2636);
}
.bg-stars::before {
  background:
    radial-gradient(circle, rgba(255,255,255,.88) 0 1px, transparent 1.7px) 4px 9px / 64px 64px,
    radial-gradient(circle, rgba(204,229,255,.74) 0 1px, transparent 1.8px) 24px 18px / 96px 96px;
  animation: bgStarMove 22s linear infinite;
}
.bg-stars::after {
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, .55), transparent 2%),
    radial-gradient(circle at 74% 62%, rgba(180, 211, 255, .45), transparent 3%),
    linear-gradient(115deg, transparent 40%, rgba(255,255,255,.18), transparent 48%);
  opacity: .7;
  animation: bgTwinkle 4.5s ease-in-out infinite alternate, bgSlide 14s ease-in-out infinite alternate;
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
.bg-waves::after {
  background:
    repeating-linear-gradient(168deg, transparent 0 18px, rgba(61, 145, 171, .12) 19px 21px, transparent 22px 42px);
  filter: blur(1px);
  animation: bgWaterFlow 15s linear infinite;
}
.bg-rain {
  background: linear-gradient(180deg, #f6f8fb, #e9eef7);
}
.bg-rain::before {
  background: repeating-linear-gradient(112deg, rgba(77, 111, 160, .18) 0 1px, transparent 1px 18px);
  animation: bgRain 9s linear infinite;
}
.bg-rain::after {
  background: linear-gradient(180deg, rgba(255,255,255,.28), transparent 58%);
  animation: bgRainGlow 7s ease-in-out infinite alternate;
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
.bg-grid::after {
  background:
    linear-gradient(45deg, transparent 42%, rgba(49, 80, 112, .10) 43% 45%, transparent 46%),
    linear-gradient(-45deg, transparent 42%, rgba(207, 138, 60, .10) 43% 45%, transparent 46%);
  background-size: 120px 120px;
  animation: bgGridShift 20s linear infinite;
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
.bg-dust::after {
  background:
    radial-gradient(circle at 22% 72%, rgba(255, 214, 148, .20), transparent 12%),
    radial-gradient(circle at 78% 28%, rgba(194, 220, 255, .18), transparent 14%);
  filter: blur(8px);
  animation: bgFloat 10s ease-in-out infinite alternate;
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
@keyframes bgPrismSweep {
  from { transform: translate3d(-6%, -2%, 0) skewX(-8deg); opacity: .62; }
  to { transform: translate3d(7%, 3%, 0) skewX(7deg); opacity: .94; }
}
@keyframes bgFloat {
  from { transform: translate3d(-2%, -1%, 0) scale(1); }
  to { transform: translate3d(2%, 2%, 0) scale(1.04); }
}
@keyframes bgTwinkle {
  from { opacity: .55; transform: scale(1); }
  to { opacity: .95; transform: scale(1.02); }
}
@keyframes bgStarMove {
  from { transform: translate3d(0, 0, 0); opacity: .72; }
  to { transform: translate3d(-54px, -38px, 0); opacity: 1; }
}
@keyframes bgBubbleRise {
  from { transform: translate3d(0, 36px, 0) scale(1); opacity: .58; }
  to { transform: translate3d(-24px, -74px, 0) scale(1.04); opacity: .86; }
}
@keyframes bgWave {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-26px) scale(1.03); }
}
@keyframes bgWaterFlow {
  from { transform: translate3d(-30px, 18px, 0); }
  to { transform: translate3d(46px, -20px, 0); }
}
@keyframes bgRain {
  from { transform: translate3d(0, -40px, 0); }
  to { transform: translate3d(-40px, 40px, 0); }
}
@keyframes bgRainGlow {
  from { transform: translateY(-18px); opacity: .35; }
  to { transform: translateY(26px); opacity: .78; }
}
@keyframes bgGridShift {
  from { transform: translate3d(0, 0, 0) rotate(0deg); }
  to { transform: translate3d(-60px, -60px, 0) rotate(.01deg); }
}
@keyframes bgPulseGlow {
  from { transform: scale(.98); opacity: .48; }
  to { transform: scale(1.04); opacity: .88; }
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
@media (max-width: 760px) {
  body[data-dynamic-background]:not([data-dynamic-background="none"]) {
    --resume-fixed-width: 100%;
  }
  body[data-dynamic-background]:not([data-dynamic-background="none"]) .resume-root::before {
    border-left: 0;
    border-right: 0;
    box-shadow: none;
  }
  body[data-dynamic-background]:not([data-dynamic-background="none"]) .resume-page {
    width: min(100% - 16px, 720px);
  }
}
`;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    if (!bgRoot || !bgSelect || !ctx) return;

    document.head.appendChild(styleElement);
    styleElement.textContent = backgroundCss;
    bgRoot.appendChild(canvas);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

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
    const selectedBg = bgParam || "dust";
    return backgrounds.some(function (bg) { return bg.id === selectedBg; }) ? selectedBg : backgrounds[0].id;
  }

  function applyBackground(id) {
    const bg = backgrounds.find(function (item) { return item.id === id; }) || backgrounds[0];
    activeBackground = bg.id;
    bgRoot.className = `dynamic-bg ${bg.className}`;
    document.body.dataset.dynamicBackground = bg.id;
    document.documentElement.dataset.dynamicBackground = bg.id;
    createScene(bg.id);

    if (bg.id === "none") {
      stopAnimation();
    } else {
      startAnimation();
    }
  }

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
    if (!pointer.active) {
      pointer.x = centerX;
      pointer.y = centerY;
    }
    createScene(activeBackground);
  }

  function handlePointerMove(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }

  function handlePointerLeave() {
    pointer.active = false;
  }

  function startAnimation() {
    if (animationFrameId !== null) return;
    animate();
  }

  function stopAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    ctx.clearRect(0, 0, width, height);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    frame += 1;
    drawScene(frame * 0.016);
  }

  function createScene(id) {
    stars = makeStars(id === "stars" ? 520 : id === "dust" || id === "orbit" ? 680 : id === "network" || id === "magnetic" ? 240 : 180);
    particles = makeParticles(id);
    meteors = [];
  }

  function makeStars(count) {
    return Array.from({ length: count }, function () {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + .25,
        a: Math.random() * .55 + .25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * .018 + .006
      };
    });
  }

  function makeParticles(id) {
    const counts = {
      ink: 30,
      network: 110,
      ecg: 70,
      prism: 60,
      wireframe: 34,
      contour: 58,
      lightRain: 170,
      pulse: 52,
      orbit: 260,
      magnetic: 150,
      aurora: 28,
      bubbles: 46,
      waves: 38,
      rain: 130,
      grid: 36,
      dust: 260
    };
    const count = counts[id] || 60;

    return Array.from({ length: count }, function (_, index) {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 34 + 8,
        a: Math.random() * .38 + .12,
        vx: (Math.random() - .5) * .65,
        vy: (Math.random() - .5) * .65,
        phase: Math.random() * Math.PI * 2,
        index: index
      };
    });
  }

  function drawScene(time) {
    if (activeBackground === "none") return;

    const drawMap = {
      ink: drawInk,
      network: drawNetwork,
      ecg: drawEcg,
      prism: drawPrism,
      wireframe: drawWireframe,
      contour: drawContour,
      lightRain: drawLightRain,
      pulse: drawPulse,
      orbit: drawOrbitDashboard,
      magnetic: drawMagnetic,
      aurora: drawAurora,
      bubbles: drawBubbles,
      stars: drawStars,
      waves: drawWaves,
      rain: drawRain,
      grid: drawGrid,
      dust: drawDust
    };
    const draw = drawMap[activeBackground] || drawInk;
    draw(time);
  }

  function clearWithGradient(top, bottom) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawInk(time) {
    clearWithGradient("#fff8ed", "#edf8fb");
    ctx.globalCompositeOperation = "multiply";
    particles.forEach(function (blob, index) {
      const x = blob.x + Math.sin(time * (.18 + index * .004) + blob.phase) * 52;
      const y = blob.y + Math.cos(time * (.16 + index * .003) + blob.phase) * 38;
      const radius = blob.r * 2.6 + 34;
      const colors = [
        "rgba(75, 148, 200, .16)",
        "rgba(211, 125, 164, .15)",
        "rgba(82, 172, 137, .14)",
        "rgba(221, 171, 83, .12)"
      ];
      drawInkBlob(x, y, radius, time + index * .31, colors[index % colors.length]);
    });
    ctx.globalCompositeOperation = "source-over";
    drawSoftParticles(time, ["rgba(255,255,255,.28)", "rgba(103,168,191,.10)", "rgba(224,159,114,.10)"]);
  }

  function drawNetwork(time) {
    clearWithGradient("#071018", "#14251f");
    const nodes = particles.map(function (particle, index) {
      particle.x += particle.vx * .22;
      particle.y += particle.vy * .22;
      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      return {
        x: particle.x + Math.sin(time * .36 + particle.phase) * 10,
        y: particle.y + Math.cos(time * .31 + particle.phase) * 9,
        r: Math.max(1, particle.r * .045),
        a: particle.a,
        index: index
      };
    });

    ctx.lineWidth = .75;
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      for (let next = index + 1; next < nodes.length; next += 1) {
        const other = nodes[next];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance < 118) {
          const alpha = .22 * (1 - distance / 118);
          ctx.strokeStyle = `rgba(119, 214, 190, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(function (node, index) {
      const pulse = .35 + Math.sin(time * 2.4 + node.index) * .18;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r + pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 245, 229, ${clamp(node.a + .18, .20, .84)})`;
      ctx.fill();

      if (index % 17 === 0) {
        const target = nodes[(index + 9) % nodes.length];
        const progress = (Math.sin(time * 1.4 + index) + 1) / 2;
        const x = node.x + (target.x - node.x) * progress;
        const y = node.y + (target.y - node.y) * progress;
        drawCircle(x, y, 2.4, "rgba(255,238,176,.72)", "rgba(255,255,255,.32)");
      }
    });
  }

  function drawEcg(time) {
    clearWithGradient("#f7fbf8", "#e8f3f1");
    drawCanvasGrid(40, "rgba(69, 130, 116, .085)");
    for (let line = 0; line < 4; line += 1) {
      const baseY = height * (.24 + line * .17);
      drawEcgTrace(baseY, time, line);
    }

    const pulseX = (time * 120) % (width + 180) - 90;
    const glow = ctx.createRadialGradient(pulseX, centerY, 0, pulseX, centerY, 170);
    glow.addColorStop(0, "rgba(74, 196, 156, .18)");
    glow.addColorStop(1, "rgba(74, 196, 156, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawPrism(time) {
    clearWithGradient("#fbfcff", "#eef6f1");
    ctx.globalCompositeOperation = "screen";
    for (let band = 0; band < 7; band += 1) {
      const x = ((time * (34 + band * 5) + band * 190) % (width + 520)) - 260;
      const y = height * (.16 + band * .12);
      const strip = ctx.createLinearGradient(x - 160, y, x + 260, y + 80);
      strip.addColorStop(0, "rgba(255,255,255,0)");
      strip.addColorStop(.35, band % 3 === 0 ? "rgba(91, 168, 224, .22)" : "rgba(255,255,255,.40)");
      strip.addColorStop(.62, band % 3 === 1 ? "rgba(224, 164, 94, .18)" : "rgba(101, 190, 158, .16)");
      strip.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-.34 + band * .025);
      ctx.fillStyle = strip;
      ctx.fillRect(-180, -34, 420, 72);
      ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over";
    drawSoftParticles(time, ["rgba(255,255,255,.24)", "rgba(85,164,206,.10)", "rgba(213,150,93,.10)"]);
  }

  function drawWireframe(time) {
    clearWithGradient("#071018", "#201e27");
    drawMovingStars(time, .22);
    const shapes = [
      { x: width * .23, y: height * .32, s: 78, c: "rgba(113, 225, 200, .52)", p: .2 },
      { x: width * .76, y: height * .34, s: 92, c: "rgba(227, 192, 116, .46)", p: 1.6 },
      { x: width * .34, y: height * .72, s: 64, c: "rgba(148, 184, 255, .42)", p: 2.5 },
      { x: width * .66, y: height * .72, s: 58, c: "rgba(116, 215, 163, .38)", p: 3.1 }
    ];

    shapes.forEach(function (shape, index) {
      drawWireCube(shape.x, shape.y, shape.s, time * (.55 + index * .09) + shape.p, shape.c);
    });

    drawWireOrb(centerX, centerY, Math.min(width, height) * .16, time);
  }

  function drawContour(time) {
    clearWithGradient("#fbf7ed", "#edf7f2");
    drawSoftParticles(time, ["rgba(75,144,129,.10)", "rgba(86,124,165,.09)", "rgba(217,166,91,.08)"]);
    ctx.lineCap = "round";
    for (let line = 0; line < 18; line += 1) {
      ctx.beginPath();
      for (let x = -80; x <= width + 80; x += 16) {
        const y = height * (.08 + line * .052) +
          Math.sin(x * .008 + time * .58 + line * .52) * (18 + line * .7) +
          Math.cos(x * .019 - time * .42 + line) * 7;
        if (x === -80) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = line % 4 === 0 ? "rgba(62, 126, 112, .22)" : "rgba(73, 102, 128, .13)";
      ctx.lineWidth = line % 4 === 0 ? 1.45 : .95;
      ctx.stroke();
    }
  }

  function drawLightRain(time) {
    clearWithGradient("#f7f9fb", "#e8f1f5");
    ctx.lineCap = "round";
    particles.forEach(function (drop, index) {
      drop.x += .45 + Math.sin(time + drop.phase) * .12;
      drop.y += 2.8 + drop.r * .035;
      if (drop.y > height + 70) {
        drop.y = -70;
        drop.x = Math.random() * width;
      }
      const length = 22 + drop.r * .55;
      const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x - 14, drop.y + length);
      gradient.addColorStop(0, `rgba(255,255,255,${clamp(drop.a + .25, .18, .75)})`);
      gradient.addColorStop(1, "rgba(78, 135, 160, 0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = index % 5 === 0 ? 1.6 : .9;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 14, drop.y + length);
      ctx.stroke();
    });
  }

  function drawPulse(time) {
    clearWithGradient("#f7fbf7", "#edf6f3");
    drawSoftParticles(time, ["rgba(76,184,143,.10)", "rgba(80,142,195,.08)", "rgba(221,172,92,.08)"]);
    const centers = [
      { x: width * .22, y: height * .32, p: .2 },
      { x: width * .72, y: height * .28, p: 1.8 },
      { x: width * .34, y: height * .72, p: 3.1 },
      { x: width * .78, y: height * .70, p: 4.4 },
      { x: centerX, y: centerY, p: 5.2 }
    ];

    centers.forEach(function (center, index) {
      for (let ring = 0; ring < 4; ring += 1) {
        const wave = (time * 48 + ring * 44 + index * 18) % 190;
        const alpha = .28 * (1 - wave / 190);
        ctx.beginPath();
        ctx.arc(center.x, center.y, wave + 12, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(60, 160, 128, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      const glowRadius = 12 + Math.sin(time * 2 + center.p) * 3;
      drawCircle(center.x, center.y, glowRadius, "rgba(70, 183, 143, .16)", "rgba(255,255,255,.42)");
    });
  }

  function drawOrbitDashboard(time) {
    clearWithGradient("#030610", "#111b25");
    drawNebula(time);
    drawMovingStars(time, .72);
    drawOrbitGauge(centerX, centerY, Math.min(width, height) * .23, time);
    drawPlanetSystem(width * .16, height * .52, -1, time);
    drawPlanetSystem(width * .84, height * .52, 1, time);
    drawConstellationParticles(time);
    drawHeavyMeteors(time);
  }

  function drawMagnetic(time) {
    clearWithGradient("#071015", "#151f1d");
    const focusX = pointer.active ? pointer.x : centerX + Math.sin(time * .42) * width * .18;
    const focusY = pointer.active ? pointer.y : centerY + Math.cos(time * .36) * height * .12;

    const glow = ctx.createRadialGradient(focusX, focusY, 0, focusX, focusY, 230);
    glow.addColorStop(0, "rgba(93, 227, 202, .20)");
    glow.addColorStop(.42, "rgba(226, 188, 105, .08)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const nodes = particles.map(function (particle) {
      const dx = focusX - particle.x;
      const dy = focusY - particle.y;
      const distance = Math.hypot(dx, dy);
      const influence = clamp(1 - distance / 240, 0, 1);
      particle.x += particle.vx * .34 + dx * influence * .018;
      particle.y += particle.vy * .34 + dy * influence * .018;
      if (particle.x < -24) particle.x = width + 24;
      if (particle.x > width + 24) particle.x = -24;
      if (particle.y < -24) particle.y = height + 24;
      if (particle.y > height + 24) particle.y = -24;
      return particle;
    });

    ctx.lineCap = "round";
    nodes.forEach(function (node, index) {
      const distance = Math.hypot(focusX - node.x, focusY - node.y);
      if (distance < 260) {
        const alpha = .28 * (1 - distance / 260);
        ctx.strokeStyle = `rgba(113, 225, 200, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.quadraticCurveTo((node.x + focusX) / 2, (node.y + focusY) / 2 + Math.sin(time + index) * 18, focusX, focusY);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(1, node.r * .04), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(218, 246, 235, ${clamp(node.a + .12, .18, .74)})`;
      ctx.fill();
    });

    drawCircle(focusX, focusY, pointer.active ? 5.5 : 4.2, "rgba(255, 231, 166, .76)", "rgba(255,255,255,.45)");
  }

  function drawNebula(time) {
    [
      { x: .22 + Math.sin(time * .13) * .04, y: .32, r: .34, c: "rgba(110,76,210,.20)" },
      { x: .76, y: .62 + Math.cos(time * .11) * .04, r: .30, c: "rgba(42,132,210,.18)" },
      { x: .52, y: .22, r: .25, c: "rgba(210,88,168,.14)" }
    ].forEach(function (n) {
      const g = ctx.createRadialGradient(n.x * width, n.y * height, 0, n.x * width, n.y * height, n.r * Math.min(width, height));
      g.addColorStop(0, n.c);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    });
  }

  function drawMovingStars(time, drift) {
    stars.forEach(function (star) {
      const x = (star.x + time * 10 * drift) % width;
      const y = (star.y + time * 5 * drift) % height;
      const alpha = star.a + Math.sin(time * 2 + star.phase) * .22;
      ctx.beginPath();
      ctx.arc(x, y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${clamp(alpha, .06, 1)})`;
      ctx.fill();
    });
  }

  function drawMeteors(time) {
    if (Math.random() < .025) {
      meteors.push({
        x: Math.random() * width,
        y: -20,
        vx: 6 + Math.random() * 6,
        vy: 5 + Math.random() * 5,
        life: 1,
        len: 70 + Math.random() * 80
      });
    }

    for (let index = meteors.length - 1; index >= 0; index -= 1) {
      const meteor = meteors[index];
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.life -= .012;

      if (meteor.life <= 0 || meteor.x > width + 120 || meteor.y > height + 120) {
        meteors.splice(index, 1);
        continue;
      }

      const tailX = meteor.x - meteor.vx * meteor.len / 10;
      const tailY = meteor.y - meteor.vy * meteor.len / 10;
      const g = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      g.addColorStop(0, `rgba(255,255,255,${meteor.life})`);
      g.addColorStop(1, "rgba(120,170,255,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  function drawAurora(time) {
    clearWithGradient("#06111f", "#10251f");
    drawMovingStars(time, .28);
    for (let band = 0; band < 4; band += 1) {
      ctx.beginPath();
      for (let x = -80; x <= width + 80; x += 18) {
        const y = height * (.25 + band * .12) + Math.sin(x * .008 + time * (1.1 + band * .2)) * (44 + band * 8);
        if (x === -80) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(width + 80, height);
      ctx.lineTo(-80, height);
      ctx.closePath();
      ctx.fillStyle = band % 2 ? "rgba(95,156,255,.11)" : "rgba(91,255,190,.13)";
      ctx.fill();
    }
  }

  function drawBubbles(time) {
    clearWithGradient("#f7fbff", "#eaf8f1");
    particles.forEach(function (bubble) {
      bubble.y -= .35 + bubble.r * .004;
      bubble.x += Math.sin(time + bubble.phase) * .18;
      if (bubble.y < -80) bubble.y = height + 80;
      drawCircle(bubble.x, bubble.y, bubble.r, `rgba(120,170,255,${bubble.a})`, `rgba(255,255,255,${bubble.a * .8})`);
    });
  }

  function drawStars(time) {
    clearWithGradient("#0c1324", "#1b273b");
    drawMovingStars(time, 1.8);
    drawMeteors(time);
  }

  function drawWaves(time) {
    clearWithGradient("#eaf8fb", "#dff3ee");
    for (let line = 0; line < 8; line += 1) {
      ctx.beginPath();
      for (let x = -40; x <= width + 40; x += 18) {
        const y = height * (.28 + line * .09) + Math.sin(x * .018 + time * (1.2 + line * .08)) * 16;
        if (x === -40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(42, 139, 163, ${.10 + line * .012})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawRain(time) {
    clearWithGradient("#f6f8fb", "#e8eef8");
    ctx.strokeStyle = "rgba(74, 106, 154, .28)";
    ctx.lineWidth = 1;
    particles.forEach(function (drop) {
      drop.x += 1.2;
      drop.y += 4.8;
      if (drop.y > height + 40) {
        drop.y = -40;
        drop.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 16, drop.y + 34);
      ctx.stroke();
    });
  }

  function drawGrid(time) {
    clearWithGradient("#fbfaf5", "#eef4f4");
    const size = 34;
    ctx.strokeStyle = "rgba(72, 84, 98, .13)";
    ctx.lineWidth = 1;
    const offset = (time * 16) % size;
    for (let x = -size; x < width + size; x += size) {
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset, height);
      ctx.stroke();
    }
    for (let y = -size; y < height + size; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y + offset);
      ctx.lineTo(width, y + offset);
      ctx.stroke();
    }
    drawSoftParticles(time, ["rgba(207,138,60,.13)", "rgba(49,80,112,.10)"]);
  }

  function drawDust(time) {
    clearWithGradient("#030612", "#111b34");
    drawNebula(time);
    drawMovingStars(time, .85);
    drawConstellationParticles(time);
    drawPlanetSystem(width * .13, height * .52, -1, time);
    drawPlanetSystem(width * .87, height * .52, 1, time);
    drawHeavyMeteors(time);
  }

  function drawConstellationParticles(time) {
    const nodes = particles.map(function (particle) {
      return {
        x: particle.x + Math.sin(time * .45 + particle.phase) * 18,
        y: particle.y + Math.cos(time * .38 + particle.phase) * 14,
        r: Math.max(.8, particle.r * .035),
        a: particle.a
      };
    });

    ctx.lineWidth = .65;
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      for (let next = index + 1; next < Math.min(nodes.length, index + 10); next += 1) {
        const other = nodes[next];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance < 105) {
          ctx.strokeStyle = `rgba(143, 188, 255, ${(.20 * (1 - distance / 105)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(function (node) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 234, 180, ${clamp(node.a + .18, .18, .78)})`;
      ctx.fill();
    });
  }

  function drawPlanetSystem(originX, originY, side, time) {
    const maxOrbit = Math.min(width * .155, height * .34, 180);
    const sunRadius = Math.max(10, maxOrbit * .08);

    ctx.save();
    ctx.translate(originX, originY);

    for (let index = planetModel.length - 1; index >= 0; index -= 1) {
      const planet = planetModel[index];
      const orbit = maxOrbit * planet.orbit;
      ctx.beginPath();
      ctx.ellipse(0, 0, orbit, orbit * .74, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,.105)";
      ctx.lineWidth = .65;
      ctx.stroke();
    }

    drawSunDisc(0, 0, sunRadius);

    planetModel.forEach(function (planet, index) {
      const orbit = maxOrbit * planet.orbit;
      const angle = time * planet.speed * side + index * .74 + side * .38;
      const x = Math.cos(angle) * orbit;
      const y = Math.sin(angle) * orbit * .74;
      const radius = Math.max(2.2, planet.size * maxOrbit / 170);

      if (planet.ring) {
        drawPlanetRing(x, y, radius, time * planet.speed);
      }

      drawPlanetDisc(x, y, radius, planet.color, time * (1.5 + planet.speed));
    });

    ctx.restore();
  }

  function drawSunDisc(x, y, radius) {
    const glow = ctx.createRadialGradient(x, y, radius * .7, x, y, radius * 3.8);
    glow.addColorStop(0, "rgba(255, 203, 88, .34)");
    glow.addColorStop(1, "rgba(255, 85, 30, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3.8, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(x - radius * .3, y - radius * .3, 0, x, y, radius);
    core.addColorStop(0, "#fffbd5");
    core.addColorStop(.45, "#ffd454");
    core.addColorStop(1, "#f46b26");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlanetDisc(x, y, radius, colors, rotation) {
    const gradient = ctx.createRadialGradient(x - radius * .35, y - radius * .35, 0, x, y, radius * 1.25);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(.58, colors[1]);
    gradient.addColorStop(1, "rgba(0,0,0,.70)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = Math.max(.5, radius * .12);
    for (let stripe = -1; stripe <= 1; stripe += 1) {
      ctx.beginPath();
      ctx.ellipse(0, stripe * radius * .32, radius * .82, radius * .18, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(x, y, radius * 1.45, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.035)";
    ctx.fill();
  }

  function drawPlanetRing(x, y, radius, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * .3);
    ctx.scale(1, .34);
    ctx.strokeStyle = "rgba(230, 206, 145, .55)";
    ctx.lineWidth = Math.max(1, radius * .28);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 2.2, radius * 1.05, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHeavyMeteors(time) {
    if (Math.random() < .22) spawnSideMeteor();
    if (Math.random() < .12) spawnSideMeteor();
    if (Math.random() < .07) spawnSideMeteor();

    for (let index = meteors.length - 1; index >= 0; index -= 1) {
      const meteor = meteors[index];
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.life -= meteor.decay;

      if (meteor.life <= 0 || meteor.x > width + 180 || meteor.y > height + 180) {
        meteors.splice(index, 1);
        continue;
      }

      const tailX = meteor.x - meteor.vx * meteor.len / 10;
      const tailY = meteor.y - meteor.vy * meteor.len / 10;
      const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255,255,255,${meteor.life})`);
      gradient.addColorStop(.32, `rgba(163,205,255,${meteor.life * .58})`);
      gradient.addColorStop(1, "rgba(93,150,255,0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = meteor.width * meteor.life;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  function spawnSideMeteor() {
    const fromLeft = Math.random() < .52;
    const startX = fromLeft ? Math.random() * width * .42 - 80 : width * .58 + Math.random() * width * .42;
    const startY = -40 - Math.random() * height * .22;
    const speed = 7.5 + Math.random() * 8.5;
    const angle = Math.PI / 4 + (Math.random() - .5) * .32;

    meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 74 + Math.random() * 118,
      life: .82 + Math.random() * .18,
      decay: .009 + Math.random() * .009,
      width: .9 + Math.random() * 1.8
    });

    if (meteors.length > 70) {
      meteors.splice(0, meteors.length - 70);
    }
  }

  function drawInkBlob(x, y, radius, phase, color) {
    const gradient = ctx.createRadialGradient(x - radius * .24, y - radius * .18, 0, x, y, radius * 1.15);
    gradient.addColorStop(0, color);
    gradient.addColorStop(.62, color);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;

    ctx.beginPath();
    for (let point = 0; point <= 30; point += 1) {
      const angle = point / 30 * Math.PI * 2;
      const wobble = 1 +
        Math.sin(angle * 3 + phase * .9) * .09 +
        Math.cos(angle * 5 - phase * .7) * .055;
      const px = x + Math.cos(angle) * radius * wobble;
      const py = y + Math.sin(angle) * radius * wobble;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawCanvasGrid(size, color) {
    const offset = frame * .08 % size;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let x = -size; x <= width + size; x += size) {
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset, height);
      ctx.stroke();
    }
    for (let y = -size; y <= height + size; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y + offset);
      ctx.lineTo(width, y + offset);
      ctx.stroke();
    }
  }

  function drawEcgTrace(baseY, time, line) {
    const speed = time * (92 + line * 6) + line * 120;
    ctx.beginPath();
    for (let x = -160; x <= width + 160; x += 7) {
      const phase = ((x + speed) % 280 + 280) % 280;
      let y = baseY + Math.sin(x * .012 + time + line) * 2.8;

      if (phase > 34 && phase < 62) {
        y -= Math.sin((phase - 34) / 28 * Math.PI) * 8;
      } else if (phase > 86 && phase < 96) {
        y += (phase - 86) / 10 * 18;
      } else if (phase >= 96 && phase < 110) {
        y -= (phase - 96) / 14 * 54 - 18;
      } else if (phase >= 110 && phase < 126) {
        y += (phase - 110) / 16 * 42 - 36;
      } else if (phase > 162 && phase < 214) {
        y -= Math.sin((phase - 162) / 52 * Math.PI) * 12;
      }

      if (x === -160) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = line % 2 ? "rgba(46, 139, 121, .34)" : "rgba(58, 165, 132, .42)";
    ctx.lineWidth = line === 1 ? 2.1 : 1.35;
    ctx.stroke();
  }

  function drawWireCube(originX, originY, size, angle, color) {
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    const projected = vertices.map(function (vertex) {
      let x = vertex[0];
      let y = vertex[1];
      let z = vertex[2];

      const cosY = Math.cos(angle);
      const sinY = Math.sin(angle);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(angle * .73);
      const sinX = Math.sin(angle * .73);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const scale = size * 1.35 / (2.7 + z2);
      return {
        x: originX + x1 * scale,
        y: originY + y1 * scale
      };
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.15;
    edges.forEach(function (edge) {
      const a = projected[edge[0]];
      const b = projected[edge[1]];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
  }

  function drawWireOrb(originX, originY, radius, time) {
    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(time * .15);
    ctx.strokeStyle = "rgba(130, 210, 198, .26)";
    ctx.lineWidth = 1;
    for (let ring = -3; ring <= 3; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(0, ring * radius * .18, radius, radius * (.18 + Math.abs(ring) * .055), time * .22 + ring * .3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.rotate(Math.PI / 2);
    for (let ring = -2; ring <= 2; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(0, ring * radius * .18, radius * .82, radius * (.20 + Math.abs(ring) * .06), -time * .18 + ring * .28, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawOrbitGauge(originX, originY, radius, time) {
    ctx.save();
    ctx.translate(originX, originY);
    ctx.lineCap = "round";

    for (let ring = 1; ring <= 4; ring += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * ring / 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(147, 194, 255, ${(0.12 - ring * .012).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let arc = 0; arc < 8; arc += 1) {
      const orbit = radius * (.34 + arc * .072);
      const start = time * (.16 + arc * .018) + arc * .82;
      ctx.beginPath();
      ctx.arc(0, 0, orbit, start, start + Math.PI * (.20 + arc * .018));
      ctx.strokeStyle = arc % 2 ? "rgba(98, 216, 164, .28)" : "rgba(128, 179, 255, .26)";
      ctx.lineWidth = arc % 3 === 0 ? 2 : 1;
      ctx.stroke();
    }

    for (let marker = 0; marker < 10; marker += 1) {
      const orbit = radius * (.32 + marker * .055);
      const angle = time * (.28 + marker * .025) + marker * .78;
      const x = Math.cos(angle) * orbit;
      const y = Math.sin(angle) * orbit * .72;
      drawCircle(x, y, marker % 3 === 0 ? 2.8 : 1.8, "rgba(255,229,162,.70)", "rgba(255,255,255,.20)");
    }

    ctx.beginPath();
    ctx.moveTo(-radius, 0);
    ctx.lineTo(radius, 0);
    ctx.moveTo(0, -radius * .74);
    ctx.lineTo(0, radius * .74);
    ctx.strokeStyle = "rgba(255,255,255,.09)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function drawSoftParticles(time, colors) {
    particles.forEach(function (particle, index) {
      const x = particle.x + Math.sin(time * .45 + particle.phase) * 52;
      const y = particle.y + Math.cos(time * .38 + particle.phase) * 42;
      const color = colors[index % colors.length];
      const g = ctx.createRadialGradient(x, y, 0, x, y, particle.r * 2.8);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, particle.r * 2.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawCircle(x, y, radius, fill, stroke) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
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
