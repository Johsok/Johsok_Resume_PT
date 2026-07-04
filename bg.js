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
.dynamic-bg canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.dynamic-bg.bg-none {
  opacity: 0;
}
body[data-dynamic-background]:not([data-dynamic-background="none"]) {
  background: transparent !important;
}
body[data-dynamic-background]:not([data-dynamic-background="none"]) .resume-root {
  background: transparent !important;
}
.dynamic-bg::before,
.dynamic-bg::after {
  content: "";
  position: absolute;
  inset: -18%;
  pointer-events: none;
  will-change: transform, opacity, background-position;
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
.bg-aurora::after {
  background:
    radial-gradient(ellipse at 28% 45%, rgba(99, 255, 208, .22), transparent 28%),
    radial-gradient(ellipse at 72% 58%, rgba(116, 153, 255, .20), transparent 30%);
  filter: blur(24px);
  animation: bgFloat 12s ease-in-out infinite alternate;
}
.bg-gradient {
  background: linear-gradient(120deg, #f7d9dc, #d9eefc, #dff2d8, #efd7f6);
  background-size: 300% 300%;
  animation: bgGradient 18s ease infinite;
}
.bg-gradient::before {
  background:
    radial-gradient(circle at 18% 28%, rgba(255, 255, 255, .46), transparent 18%),
    radial-gradient(circle at 78% 64%, rgba(142, 198, 255, .28), transparent 22%),
    radial-gradient(circle at 54% 22%, rgba(255, 179, 221, .30), transparent 18%);
  animation: bgFloat 14s ease-in-out infinite alternate;
}
.bg-gradient::after {
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.22), transparent 54%);
  animation: bgSlide 10s ease-in-out infinite alternate;
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
.bg-mist::after {
  background:
    linear-gradient(95deg, transparent 16%, rgba(255,255,255,.48), transparent 48%),
    linear-gradient(145deg, transparent 22%, rgba(255, 224, 179, .26), transparent 58%);
  filter: blur(18px);
  animation: bgMistFlow 16s ease-in-out infinite alternate;
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
@keyframes bgMistFlow {
  from { transform: translate3d(-5%, -2%, 0) scale(1.02); opacity: .58; }
  to { transform: translate3d(5%, 3%, 0) scale(1.08); opacity: .88; }
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
    if (!bgRoot || !bgSelect || !ctx) return;

    document.head.appendChild(styleElement);
    styleElement.textContent = backgroundCss;
    bgRoot.appendChild(canvas);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

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
    const selectedBg = bgParam || backgrounds[0].id;
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
    createScene(activeBackground);
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
    stars = makeStars(id === "galaxy" ? 420 : id === "stars" ? 520 : 180);
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
      aurora: 28,
      gradient: 22,
      bubbles: 46,
      waves: 38,
      rain: 130,
      grid: 36,
      mist: 34,
      dust: 180
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
      galaxy: drawGalaxy,
      aurora: drawAurora,
      gradient: drawGradient,
      bubbles: drawBubbles,
      stars: drawStars,
      waves: drawWaves,
      rain: drawRain,
      grid: drawGrid,
      mist: drawMist,
      dust: drawDust
    };
    const draw = drawMap[activeBackground] || drawGradient;
    draw(time);
  }

  function clearWithGradient(top, bottom) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawGalaxy(time) {
    clearWithGradient("#02030b", "#0a1024");
    drawNebula(time);
    drawMovingStars(time, 1.2);
    drawGalaxyCore(time);
    drawMeteors(time);
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

  function drawGalaxyCore(time) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time * .08);
    ctx.scale(1.8, .46);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(width, height) * .34);
    g.addColorStop(0, "rgba(255,244,205,.45)");
    g.addColorStop(.24, "rgba(158,116,255,.28)");
    g.addColorStop(.72, "rgba(78,146,255,.12)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(width, height) * .34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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

  function drawGradient(time) {
    const hueA = 205 + Math.sin(time * .4) * 28;
    const hueB = 320 + Math.cos(time * .35) * 24;
    clearWithGradient(`hsl(${hueA}, 78%, 88%)`, `hsl(${hueB}, 72%, 91%)`);
    drawSoftParticles(time, ["rgba(255,255,255,.30)", "rgba(93,160,255,.20)", "rgba(255,142,207,.20)"]);
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

  function drawMist(time) {
    clearWithGradient("#fff7e8", "#eaf4ff");
    drawSoftParticles(time, ["rgba(255,255,255,.45)", "rgba(255,216,161,.22)", "rgba(178,217,255,.28)"]);
  }

  function drawDust(time) {
    clearWithGradient("#172030", "#263648");
    particles.forEach(function (dust) {
      dust.x += Math.sin(time + dust.phase) * .18 - .08;
      dust.y -= .32 + dust.r * .002;
      if (dust.y < -20) dust.y = height + 20;
      if (dust.x < -20) dust.x = width + 20;
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, Math.max(.7, dust.r * .045), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,226,168,${dust.a})`;
      ctx.fill();
    });
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
