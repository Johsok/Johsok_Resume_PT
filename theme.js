(function () {
  "use strict";

  const photoPath = "myphoto.png";
  const photoBackgrounds = [
    "#f7d9dc",
    "#fde7c8",
    "#fff3b8",
    "#dff2d8",
    "#cfeee6",
    "#d9eefc",
    "#dcdafa",
    "#efd7f6",
    "#f8d8ea",
    "#e7ead7"
  ];

  const previewKey = "ptResumeDataDraft";
  const themeKey = "ptResumeTheme";
  const channelName = "pt-resume-data";
  const resumeRoot = document.getElementById("resumeRoot");
  const themeSelect = document.getElementById("themeSelect");
  const themeStyle = document.getElementById("themeStyle");
  const previewMode = new URLSearchParams(window.location.search).get("preview") === "1";
  const dataChannel = "BroadcastChannel" in window ? new BroadcastChannel(channelName) : null;

  const defaultData = {
    profile: { name: "", role: "", tagline: "" },
    contact: { phone: "", email: "", address: "", education: "", license: "", language: "" },
    application: {
      desiredPosition: "",
      salary: "",
      availableDate: "",
      gender: "",
      birthdate: "",
      heightWeight: "",
      militaryMarriage: ""
    },
    labels: {},
    sectionTitles: {},
    metrics: [],
    summary: [],
    clinicalSkills: [],
    toolsShort: [],
    toolsFull: [],
    skillBars: [],
    jobs: [],
    cases: []
  };

  const defaultLabels = {
    phone: "電話",
    email: "Email",
    address: "地址",
    education: "學歷",
    license: "證照",
    language: "語言"
  };

  const sectionFallbacks = {
    summary: "專業摘要",
    application: "應徵資訊",
    skills: "臨床專長",
    tools: "行政與 AI 工具",
    toolsShort: "工具",
    jobs: "工作經歷",
    contact: "聯絡資料",
    profile: "履歷資料矩陣",
    skillMatrix: "技能矩陣",
    cases: "行政流程案例",
    educationLicense: "學歷與證照"
  };

  const sharedCss = `
body {
  background: var(--theme-bg);
  color: var(--theme-ink);
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
h1, h2, h3, p { margin-top: 0; }
p { margin-bottom: 12px; }
.resume-root {
  min-height: 100vh;
  background: var(--theme-bg);
  color: var(--theme-ink);
}
.resume-page {
  position: relative;
  z-index: 1;
  width: min(1140px, calc(100% - 36px));
  margin: 0 auto;
  padding: 72px 0 56px;
}
.theme-photo {
  display: block;
  width: 100%;
  max-width: 100%;
  object-fit: contain;
  object-position: center bottom;
  background: var(--photo-bg, #eef2f4);
  border-radius: 8px;
  padding: 8px;
}
.panel,
.card,
.tile,
.job,
.metric,
.matrix-card,
.portfolio-card {
  border-radius: 8px;
}
.panel {
  background: var(--theme-paper);
  border: 1px solid var(--theme-line);
  box-shadow: var(--theme-shadow);
  padding: 22px;
}
.muted { color: var(--theme-muted); }
.role {
  color: var(--theme-accent);
  font-weight: 700;
  margin-bottom: 8px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--theme-accent);
  font-size: .95rem;
  margin-bottom: 14px;
  letter-spacing: 0;
}
.section-title::after {
  content: "";
  height: 1px;
  flex: 1;
  background: var(--theme-line);
}
.contact-list p {
  display: grid;
  grid-template-columns: 82px 1fr;
  gap: 10px;
  margin: 0 0 8px;
  word-break: break-word;
}
.contact-list span {
  color: var(--theme-muted);
}
.chip,
.tag,
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 7px 11px;
  margin: 0 6px 8px 0;
  font-size: .88rem;
  border: 1px solid var(--theme-line);
  background: var(--theme-soft);
  color: var(--theme-ink);
}
.metric strong {
  display: block;
  font-size: 1.55rem;
  line-height: 1.1;
}
.metric span {
  color: var(--theme-muted);
  font-size: .88rem;
}
.summary p {
  text-align: justify;
}
.theme-dashboard::before,
.theme-split::before,
.theme-matrix::before,
.theme-bento::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: var(--theme-texture);
  opacity: var(--theme-texture-opacity, .45);
}
.dash {
  min-height: calc(100vh - 128px);
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 18px;
  align-items: start;
}
.identity {
  position: sticky;
  top: 72px;
}
.identity .theme-photo {
  margin-bottom: 18px;
  border: 5px solid #fff;
  box-shadow: 0 14px 28px rgba(23, 35, 38, .14);
}
.dash h1,
.split h1,
.editorial h1,
.portfolio h1 {
  font-size: clamp(2.2rem, 5vw, 4.7rem);
  line-height: 1.02;
  margin-bottom: 16px;
  letter-spacing: 0;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}
.metric {
  border-left: 4px solid var(--theme-accent);
  background: var(--theme-card);
  padding: 14px;
}
.dash-main {
  display: grid;
  gap: 18px;
}
.two {
  display: grid;
  grid-template-columns: 1.15fr .85fr;
  gap: 18px;
}
.skill-meter {
  display: grid;
  gap: 10px;
}
.bar {
  min-height: 36px;
  border-radius: 8px;
  background: var(--theme-soft);
  border: 1px solid var(--theme-line);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  padding: 7px 12px;
  color: #fff;
  background: linear-gradient(90deg, var(--theme-accent), var(--theme-accent-3));
}
.job-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.job {
  padding: 14px;
  border: 1px solid var(--theme-line);
  background: var(--theme-card);
}
.job time {
  color: var(--theme-accent-2);
  font-weight: 700;
}
.job small {
  color: var(--theme-muted);
}
.split {
  min-height: calc(100vh - 128px);
  display: grid;
  grid-template-columns: minmax(280px, 38%) 1fr;
  background: var(--theme-paper);
  border: 1px solid var(--theme-line);
  box-shadow: var(--theme-shadow);
}
.brand {
  display: grid;
  align-content: center;
  gap: 18px;
  min-height: 720px;
  padding: 34px;
  color: #fff;
  background: linear-gradient(160deg, var(--theme-accent), var(--theme-accent-3));
}
.brand .theme-photo {
  border: 6px solid rgba(255, 255, 255, .18);
}
.brand .muted,
.brand .role {
  color: rgba(255, 255, 255, .82);
}
.split-content {
  display: grid;
  gap: 18px;
  padding: 34px;
}
.profile-line {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.profile-line .metric {
  border-left-color: var(--theme-accent-2);
}
.timeline-layout {
  display: grid;
  grid-template-columns: 330px 1fr;
  gap: 26px;
  align-items: start;
}
.intro {
  position: sticky;
  top: 72px;
}
.intro .theme-photo {
  margin-bottom: 20px;
}
.timeline {
  position: relative;
  display: grid;
  gap: 18px;
}
.timeline::before {
  content: "";
  position: absolute;
  left: 14px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--theme-line);
}
.timeline-item {
  position: relative;
  padding-left: 42px;
}
.timeline-item::before {
  content: "";
  position: absolute;
  left: 6px;
  top: 8px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--theme-accent);
  box-shadow: 0 0 0 5px var(--theme-soft);
}
.timeline-card {
  padding: 18px;
  background: var(--theme-card);
  border: 1px solid var(--theme-line);
  border-radius: 8px;
}
.timeline-card time {
  color: var(--theme-accent-2);
  font-weight: 700;
}
.modular-header {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 22px;
  align-items: end;
  margin-bottom: 18px;
}
.modular-header .theme-photo {
  box-shadow: 0 18px 38px rgba(35, 33, 43, .12);
}
.cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}
.card {
  grid-column: span 3;
  padding: 18px;
  background: var(--theme-card);
  border: 1px solid var(--theme-line);
}
.card.wide { grid-column: span 4; }
.card.side { grid-column: span 2; }
.card.full { grid-column: 1 / -1; }
.editorial {
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 42px;
  align-items: center;
  min-height: calc(100vh - 128px);
}
.editorial-copy {
  padding: 26px 0;
}
.cover-photo {
  position: relative;
  z-index: 1;
}
.cover-photo::before {
  content: "";
  position: absolute;
  inset: 18px -16px -16px 18px;
  border: 1px solid var(--theme-accent);
  border-radius: 8px;
  z-index: -1;
}
.editorial .theme-photo {
  box-shadow: 0 22px 48px rgba(0, 0, 0, .13);
}
.matrix-head {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 22px;
  align-items: start;
  margin-bottom: 18px;
}
.matrix-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.matrix-card {
  min-height: 120px;
  padding: 16px;
  background: var(--theme-card);
  border: 1px solid var(--theme-line);
}
.facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
}
.fact {
  padding: 14px;
  background: var(--theme-soft);
  border: 1px solid var(--theme-line);
  border-radius: 8px;
}
.classic {
  display: grid;
  grid-template-columns: 310px 1fr;
  background: var(--theme-paper);
  border: 1px solid var(--theme-line);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--theme-shadow);
}
.classic-sidebar {
  padding: 28px;
  color: #fff;
  background: var(--theme-accent);
}
.classic-sidebar .muted,
.classic-sidebar .role,
.classic-sidebar .contact-list span {
  color: rgba(255, 255, 255, .78);
}
.classic-sidebar .theme-photo {
  margin-bottom: 18px;
  border: 4px solid rgba(255, 255, 255, .22);
}
.classic-main {
  display: grid;
  gap: 18px;
  padding: 30px;
}
.bento {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 14px;
}
.tile {
  grid-column: span 4;
  padding: 18px;
  background: var(--theme-paper);
  border: 1px solid var(--theme-line);
  box-shadow: var(--theme-shadow);
}
.tile.hero {
  grid-column: span 7;
  min-height: 290px;
}
.tile.photo-tile {
  grid-column: span 5;
  padding: 0;
  overflow: hidden;
}
.tile.photo-tile .theme-photo {
  height: 100%;
  min-height: 290px;
  border-radius: 8px;
}
.tile.wide { grid-column: span 8; }
.tile.tall { grid-column: span 4; }
.tile.full { grid-column: 1 / -1; }
.metric-band {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.ats-paper {
  width: min(100%, 920px);
  margin: 0 auto;
  padding: 18px 20px 22px;
  background: #fff;
  box-shadow: 0 18px 50px rgba(20, 32, 30, .16);
}
.ats-title {
  margin: 0 0 14px;
  text-align: center;
  font-size: 32px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: 12px;
  text-indent: 12px;
}
.resume-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border: 2px solid #111;
  font-size: 16px;
  font-weight: 700;
}
.resume-table th,
.resume-table td {
  border: 1px solid #111;
  padding: 7px 8px;
  vertical-align: middle;
  word-break: break-word;
}
.resume-table .section-row th {
  padding: 6px 8px;
  text-align: center;
  font-size: 20px;
  letter-spacing: 8px;
  text-indent: 8px;
  background: #fff;
}
.resume-table .photo-cell {
  padding: 6px;
  text-align: center;
}
.resume-table .theme-photo {
  width: 128px;
  height: 146px;
  margin: 0 auto;
  padding: 4px;
}
.resume-table .job-head th,
.resume-table .job-row td {
  text-align: center;
}
.resume-table .job-row td:last-child {
  text-align: left;
}
.resume-table .brief {
  min-height: 260px;
  padding: 12px 14px;
  text-align: justify;
  font-size: 15.5px;
  line-height: 1.7;
}
.portfolio-head {
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 24px;
  align-items: center;
  margin-bottom: 18px;
}
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.portfolio-card {
  padding: 18px;
  background: var(--theme-card);
  border: 1px solid var(--theme-line);
}
@media (max-width: 900px) {
  .resume-page { width: min(100% - 24px, 720px); padding-top: 72px; }
  .dash,
  .two,
  .split,
  .timeline-layout,
  .modular-header,
  .editorial,
  .matrix-head,
  .classic,
  .portfolio-head {
    grid-template-columns: 1fr;
  }
  .identity,
  .intro {
    position: static;
  }
  .metric-grid,
  .profile-line,
  .job-grid,
  .matrix-grid,
  .facts,
  .metric-band,
  .portfolio-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .brand { min-height: auto; }
  .cards,
  .bento {
    display: block;
  }
  .card,
  .tile {
    margin-bottom: 14px;
  }
  .ats-paper {
    overflow-x: auto;
  }
  .resume-table {
    min-width: 820px;
  }
}
@media (max-width: 560px) {
  .metric-grid,
  .profile-line,
  .job-grid,
  .matrix-grid,
  .facts,
  .metric-band,
  .portfolio-grid {
    grid-template-columns: 1fr;
  }
  .dash h1,
  .split h1,
  .editorial h1,
  .portfolio h1 {
    font-size: 2.35rem;
  }
}
@media print {
  body,
  .resume-root {
    background: #fff !important;
    color: #111;
  }
  .resume-page {
    width: 100%;
    padding: 0;
  }
  .panel,
  .tile,
  .job,
  .classic,
  .ats-paper {
    box-shadow: none;
  }
}
`;

  const themes = [
    {
      id: "default",
      label: "00_預設表格",
      className: "theme-default",
      css: `
:root {
  --theme-bg: #eef2f1;
  --theme-ink: #111;
  --theme-muted: #555;
  --theme-line: #111;
  --theme-soft: #f6f6f6;
  --theme-paper: #fff;
  --theme-card: #fff;
  --theme-accent: #111;
  --theme-accent-2: #333;
  --theme-accent-3: #555;
  --theme-shadow: none;
  --theme-texture: none;
}
`,
      render: renderAts
    },
    {
      id: "dashboard",
      label: "01_資訊儀表",
      className: "theme-dashboard",
      css: `
:root {
  --theme-bg: #f4f8f7;
  --theme-ink: #172326;
  --theme-muted: #5d6a70;
  --theme-line: #d5e2df;
  --theme-soft: #eef6f3;
  --theme-paper: rgba(255, 255, 255, .94);
  --theme-card: #fff;
  --theme-accent: #0f8b75;
  --theme-accent-2: #d89b27;
  --theme-accent-3: #2d72b8;
  --theme-shadow: 0 18px 45px rgba(23, 35, 38, .10);
  --theme-texture: linear-gradient(90deg, rgba(15, 139, 117, .08) 1px, transparent 1px) 0 0 / 34px 34px,
                   linear-gradient(0deg, rgba(45, 114, 184, .07) 1px, transparent 1px) 0 0 / 34px 34px;
}
`,
      render: renderDashboard
    },
    {
      id: "split",
      label: "02_左右雙欄",
      className: "theme-split",
      css: `
:root {
  --theme-bg: #f3f4f8;
  --theme-ink: #1f2530;
  --theme-muted: #68707c;
  --theme-line: #dadde8;
  --theme-soft: #f0f2fa;
  --theme-paper: rgba(255, 255, 255, .96);
  --theme-card: #fff;
  --theme-accent: #5968a8;
  --theme-accent-2: #c2815f;
  --theme-accent-3: #25345f;
  --theme-shadow: 0 20px 48px rgba(31, 37, 48, .12);
  --theme-texture: radial-gradient(circle at 20% 20%, rgba(89, 104, 168, .12), transparent 26%),
                   linear-gradient(135deg, rgba(194, 129, 95, .10), transparent 46%);
}
`,
      render: renderSplit
    },
    {
      id: "timeline",
      label: "03_職涯年表",
      className: "theme-timeline",
      css: `
:root {
  --theme-bg: #f8f5f0;
  --theme-ink: #24211d;
  --theme-muted: #766c62;
  --theme-line: #e2d8c9;
  --theme-soft: #f2eadf;
  --theme-paper: rgba(255, 255, 255, .95);
  --theme-card: #fffaf3;
  --theme-accent: #9a5b36;
  --theme-accent-2: #5b7f7b;
  --theme-accent-3: #2f6f8a;
  --theme-shadow: 0 18px 44px rgba(81, 58, 39, .12);
  --theme-texture: none;
}
`,
      render: renderTimeline
    },
    {
      id: "modular",
      label: "04_模組卡片",
      className: "theme-modular",
      css: `
:root {
  --theme-bg: #f7f4fb;
  --theme-ink: #272331;
  --theme-muted: #6a6276;
  --theme-line: #ded6ea;
  --theme-soft: #f1ebf8;
  --theme-paper: rgba(255, 255, 255, .96);
  --theme-card: #fff;
  --theme-accent: #7b5aa6;
  --theme-accent-2: #c28b44;
  --theme-accent-3: #4c7c8d;
  --theme-shadow: 0 18px 45px rgba(39, 35, 49, .10);
  --theme-texture: none;
}
`,
      render: renderModular
    },
    {
      id: "editorial",
      label: "05_封面履歷",
      className: "theme-editorial",
      css: `
:root {
  --theme-bg: #fbfaf7;
  --theme-ink: #161616;
  --theme-muted: #64605a;
  --theme-line: #dfdbd3;
  --theme-soft: #f4f0e8;
  --theme-paper: transparent;
  --theme-card: #fff;
  --theme-accent: #a9483e;
  --theme-accent-2: #b88b2e;
  --theme-accent-3: #304f65;
  --theme-shadow: 0 18px 45px rgba(20, 20, 20, .10);
  --theme-texture: none;
}
`,
      render: renderEditorial
    },
    {
      id: "matrix",
      label: "06_資料矩陣",
      className: "theme-matrix",
      css: `
:root {
  --theme-bg: #f1f6f8;
  --theme-ink: #142229;
  --theme-muted: #596a72;
  --theme-line: #cfdfe6;
  --theme-soft: #e8f2f6;
  --theme-paper: rgba(255, 255, 255, .95);
  --theme-card: #fff;
  --theme-accent: #236b8a;
  --theme-accent-2: #77a85b;
  --theme-accent-3: #784f9f;
  --theme-shadow: 0 18px 46px rgba(20, 34, 41, .11);
  --theme-texture: linear-gradient(90deg, rgba(35, 107, 138, .08) 1px, transparent 1px) 0 0 / 28px 28px,
                   linear-gradient(0deg, rgba(35, 107, 138, .06) 1px, transparent 1px) 0 0 / 28px 28px;
}
`,
      render: renderMatrix
    },
    {
      id: "classic",
      label: "07_側欄履歷",
      className: "theme-classic",
      css: `
:root {
  --theme-bg: #f6f7f4;
  --theme-ink: #1d2522;
  --theme-muted: #69706b;
  --theme-line: #d9dfd9;
  --theme-soft: #eff3ef;
  --theme-paper: #fff;
  --theme-card: #fff;
  --theme-accent: #31594c;
  --theme-accent-2: #b78b35;
  --theme-accent-3: #4e758d;
  --theme-shadow: 0 20px 48px rgba(29, 37, 34, .10);
  --theme-texture: none;
}
`,
      render: renderClassic
    },
    {
      id: "bento",
      label: "08_方格總覽",
      className: "theme-bento",
      css: `
:root {
  --theme-bg: #f5f7fb;
  --theme-ink: #151c2c;
  --theme-muted: #647086;
  --theme-line: #d8deea;
  --theme-soft: #edf2fb;
  --theme-paper: rgba(255, 255, 255, .96);
  --theme-card: #fff;
  --theme-accent: #3d6bd7;
  --theme-accent-2: #e0a23a;
  --theme-accent-3: #1f9a93;
  --theme-shadow: 0 16px 38px rgba(21, 28, 44, .10);
  --theme-texture: linear-gradient(135deg, rgba(61, 107, 215, .08), transparent 48%),
                   linear-gradient(45deg, rgba(31, 154, 147, .08), transparent 58%);
}
`,
      render: renderBento
    },
    {
      id: "ats",
      label: "09_列印表格",
      className: "theme-ats",
      css: `
:root {
  --theme-bg: #eef2f1;
  --theme-ink: #111;
  --theme-muted: #555;
  --theme-line: #111;
  --theme-soft: #f6f6f6;
  --theme-paper: #fff;
  --theme-card: #fff;
  --theme-accent: #111;
  --theme-accent-2: #333;
  --theme-accent-3: #555;
  --theme-shadow: none;
  --theme-texture: none;
}
`,
      render: renderAts
    },
    {
      id: "clinical",
      label: "10_臨床作品",
      className: "theme-clinical",
      css: `
:root {
  --theme-bg: #f3f8f5;
  --theme-ink: #16251d;
  --theme-muted: #607168;
  --theme-line: #d3e2d8;
  --theme-soft: #eaf5ee;
  --theme-paper: rgba(255, 255, 255, .95);
  --theme-card: #fff;
  --theme-accent: #287852;
  --theme-accent-2: #cf8a3c;
  --theme-accent-3: #2d6f9f;
  --theme-shadow: 0 18px 44px rgba(22, 37, 29, .11);
  --theme-texture: none;
}
`,
      render: renderClinical
    }
  ];

  let currentData = null;
  let currentThemeId = getInitialThemeId();
  let dataVersion = 0;
  let renderToken = 0;
  let idlePrebuildId = null;
  const themeViewCache = new Map();
  const runWhenIdle = window.requestIdleCallback || function (callback) {
    return window.setTimeout(function () {
      callback({ didTimeout: false, timeRemaining: function () { return 12; } });
    }, 1);
  };
  const cancelWhenIdle = window.cancelIdleCallback || window.clearTimeout;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  async function init() {
    setupThemeSelect();
    listenForPreviewData();
    preloadPhoto();

    try {
      const draft = previewMode ? readPreviewDraft() : null;
      const source = draft || await loadJsonFast("data.json");
      setResumeData(source, { immediate: true });
    } catch (error) {
      resumeRoot.className = "resume-root error";
      resumeRoot.textContent = "無法讀取 data.json";
    }
  }

  function setupThemeSelect() {
    themeSelect.innerHTML = themes.map(function (theme) {
      return `<option value="${escapeAttr(theme.id)}"${theme.id === currentThemeId ? " selected" : ""}>${escapeHtml(theme.label)}</option>`;
    }).join("");

    themeSelect.addEventListener("change", function () {
      currentThemeId = themeSelect.value;
      localStorage.setItem(themeKey, currentThemeId);
      renderCurrentTheme({ immediate: true });
    });
  }

  function getInitialThemeId() {
    const themeParam = new URLSearchParams(window.location.search).get("theme");
    const selected = themeParam || themes[0].id;
    return themes.some(function (theme) { return theme.id === selected; }) ? selected : themes[0].id;
  }

  function listenForPreviewData() {
    dataChannel?.addEventListener("message", function (event) {
      if (event.data?.type === "resume-data" && event.data.data) {
        setResumeData(event.data.data, { immediate: true });
      }
    });

    window.addEventListener("message", function (event) {
      if (event.data?.type === "resume-data" && event.data.data) {
        setResumeData(event.data.data, { immediate: true });
      }
    });

    window.addEventListener("storage", function (event) {
      if (event.key !== previewKey || !event.newValue) return;

      try {
        setResumeData(JSON.parse(event.newValue), { immediate: true });
      } catch {}
    });
  }

  async function loadJsonFast(url) {
    if (!("Worker" in window) || location.protocol === "file:") {
      return await loadJson(url);
    }

    try {
      return await loadJsonInWorker(url);
    } catch {
      return await loadJson(url);
    }
  }

  function loadJsonInWorker(url) {
    return new Promise(function (resolve, reject) {
      const workerCode = `
self.onmessage = async function (event) {
  try {
    const response = await fetch(event.data.url, { cache: "no-cache" });
    if (!response.ok) throw new Error(response.status);
    self.postMessage({ ok: true, data: await response.json() });
  } catch (error) {
    self.postMessage({ ok: false, error: String(error && error.message || error) });
  }
};`;
      const workerUrl = URL.createObjectURL(new Blob([workerCode], { type: "application/javascript" }));
      const worker = new Worker(workerUrl);

      worker.onmessage = function (event) {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);

        if (event.data?.ok) {
          resolve(event.data.data);
        } else {
          reject(new Error(event.data?.error || "worker data load failed"));
        }
      };

      worker.onerror = function (error) {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        reject(error);
      };

      worker.postMessage({ url: new URL(url, location.href).href });
    });
  }

  async function loadJson(url) {
    try {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) throw new Error(response.status);
      return await response.json();
    } catch {
      return await loadJsonViaFrame(url);
    }
  }

  function loadJsonViaFrame(url) {
    return new Promise(function (resolve, reject) {
      const frame = document.createElement("iframe");
      frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden;";
      frame.onload = function () {
        try {
          const raw = frame.contentDocument?.body?.innerText || frame.contentWindow?.document?.body?.innerText || "";
          frame.remove();
          raw ? resolve(JSON.parse(raw)) : reject(new Error("empty data"));
        } catch (error) {
          frame.remove();
          reject(error);
        }
      };
      frame.onerror = function () {
        frame.remove();
        reject(new Error("data load failed"));
      };
      frame.src = url;
      document.body.appendChild(frame);
    });
  }

  function readPreviewDraft() {
    try {
      const raw = localStorage.getItem(previewKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function normalize(source) {
    const safeSource = source && typeof source === "object" ? source : {};
    return {
      ...clone(defaultData),
      ...safeSource,
      profile: { ...defaultData.profile, ...(safeSource.profile || {}) },
      contact: { ...defaultData.contact, ...(safeSource.contact || {}) },
      application: { ...defaultData.application, ...(safeSource.application || {}) },
      labels: { ...defaultLabels, ...(safeSource.labels || {}) },
      sectionTitles: { ...sectionFallbacks, ...(safeSource.sectionTitles || {}) },
      metrics: asArray(safeSource.metrics),
      summary: asArray(safeSource.summary),
      clinicalSkills: asArray(safeSource.clinicalSkills),
      toolsShort: asArray(safeSource.toolsShort),
      toolsFull: asArray(safeSource.toolsFull),
      skillBars: asArray(safeSource.skillBars),
      jobs: asArray(safeSource.jobs),
      cases: asArray(safeSource.cases)
    };
  }

  function setResumeData(source, options) {
    currentData = normalize(source);
    dataVersion += 1;
    themeViewCache.clear();
    renderCurrentTheme(options);
    scheduleThemePrebuild();
  }

  function renderCurrentTheme(options) {
    if (!currentData) return;

    const theme = themes.find(function (item) { return item.id === currentThemeId; }) || themes[0];
    const token = ++renderToken;
    currentThemeId = theme.id;
    themeSelect.value = currentThemeId;
    const view = getThemeView(theme);
    const commit = function () {
      if (token !== renderToken) return;

      themeStyle.textContent = view.css;
      document.title = view.title;
      resumeRoot.className = view.className;
      resumeRoot.innerHTML = view.html;
      applyResumePhoto(resumeRoot, currentData);
    };

    if (options?.immediate) {
      window.requestAnimationFrame(commit);
    } else {
      queueMicrotask(function () {
        window.requestAnimationFrame(commit);
      });
    }
  }

  function getThemeView(theme) {
    const cacheKey = `${dataVersion}:${theme.id}`;
    const cachedView = themeViewCache.get(cacheKey);

    if (cachedView) {
      return cachedView;
    }

    const view = {
      css: sharedCss + "\n" + theme.css,
      title: `${currentData.profile.name || "履歷"} Resume`,
      className: `resume-root ${theme.className}`,
      html: theme.render(currentData)
    };

    themeViewCache.set(cacheKey, view);
    return view;
  }

  function scheduleThemePrebuild() {
    if (!currentData) return;

    if (idlePrebuildId !== null) {
      cancelWhenIdle(idlePrebuildId);
    }

    const targetVersion = dataVersion;
    const queue = themes
      .filter(function (theme) { return theme.id !== currentThemeId; })
      .concat(themes.filter(function (theme) { return theme.id === currentThemeId; }));
    let index = 0;

    const prebuild = function (deadline) {
      while (index < queue.length && (deadline.timeRemaining() > 4 || deadline.didTimeout)) {
        if (targetVersion !== dataVersion) return;

        getThemeView(queue[index]);
        index += 1;
      }

      if (index < queue.length && targetVersion === dataVersion) {
        idlePrebuildId = runWhenIdle(prebuild);
      } else {
        idlePrebuildId = null;
      }
    };

    idlePrebuildId = runWhenIdle(prebuild);
  }

  function renderDashboard(data) {
    return `
      <div class="resume-page">
        <section class="dash">
          <aside class="panel identity">
            ${photo(data)}
            ${identity(data)}
            ${contactList(data)}
          </aside>
          <div class="dash-main">
            ${metricGrid(data)}
            <section class="panel">
              ${sectionTitle(data, "summary")}
              ${summary(data)}
            </section>
            <section class="two">
              <div class="panel">
                ${sectionTitle(data, "skills")}
                ${skillMeters(data)}
              </div>
              <div class="panel">
                ${sectionTitle(data, "tools")}
                ${chips(data.toolsShort.length ? data.toolsShort : data.toolsFull)}
              </div>
            </section>
            <section class="panel">
              ${sectionTitle(data, "jobs")}
              ${jobGrid(data.jobs)}
            </section>
          </div>
        </section>
      </div>
    `;
  }

  function renderSplit(data) {
    return `
      <div class="resume-page">
        <section class="split">
          <aside class="brand">
            ${photo(data)}
            ${identity(data)}
          </aside>
          <div class="split-content">
            ${metricLine(data)}
            <section class="panel">
              ${sectionTitle(data, "summary")}
              ${summary(data)}
            </section>
            <section class="two">
              <div class="panel">
                ${sectionTitle(data, "contact")}
                ${contactList(data)}
              </div>
              <div class="panel">
                ${sectionTitle(data, "application")}
                ${applicationFacts(data)}
              </div>
            </section>
            <section class="panel">
              ${sectionTitle(data, "jobs")}
              ${jobGrid(data.jobs)}
            </section>
          </div>
        </section>
      </div>
    `;
  }

  function renderTimeline(data) {
    return `
      <div class="resume-page">
        <section class="timeline-layout">
          <aside class="panel intro">
            ${photo(data)}
            ${identity(data)}
            ${contactList(data)}
          </aside>
          <div>
            <section class="panel" style="margin-bottom:18px;">
              ${sectionTitle(data, "summary")}
              ${summary(data)}
            </section>
            <section class="timeline" aria-label="${escapeAttr(title(data, "jobs"))}">
              ${data.jobs.map(timelineItem).join("")}
            </section>
          </div>
        </section>
      </div>
    `;
  }

  function renderModular(data) {
    return `
      <div class="resume-page">
        <section class="modular-header">
          <div>
            ${identity(data)}
            ${metricLine(data)}
          </div>
          ${photo(data)}
        </section>
        <section class="cards">
          <article class="card wide">
            ${sectionTitle(data, "summary")}
            ${summary(data)}
          </article>
          <article class="card side">
            ${sectionTitle(data, "contact")}
            ${contactList(data)}
          </article>
          <article class="card">
            ${sectionTitle(data, "skills")}
            ${chips(data.clinicalSkills)}
          </article>
          <article class="card">
            ${sectionTitle(data, "toolsShort")}
            ${chips(data.toolsShort)}
          </article>
          <article class="card full">
            ${sectionTitle(data, "jobs")}
            ${jobGrid(data.jobs)}
          </article>
        </section>
      </div>
    `;
  }

  function renderEditorial(data) {
    return `
      <div class="resume-page">
        <section class="editorial">
          <div class="editorial-copy">
            ${identity(data)}
            ${summary(data)}
            <div style="margin-top:22px;">${metricLine(data)}</div>
          </div>
          <div class="cover-photo">
            ${photo(data)}
          </div>
        </section>
        <section class="two">
          <div class="panel">
            ${sectionTitle(data, "jobs")}
            ${jobGrid(data.jobs)}
          </div>
          <div class="panel">
            ${sectionTitle(data, "contact")}
            ${contactList(data)}
          </div>
        </section>
      </div>
    `;
  }

  function renderMatrix(data) {
    return `
      <div class="resume-page">
        <section class="matrix-head">
          <div class="panel">
            ${identity(data)}
            ${summary(data)}
          </div>
          ${photo(data)}
        </section>
        <section class="matrix-grid">
          ${metrics(data).map(function (metric) {
            return `<article class="matrix-card metric"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></article>`;
          }).join("")}
        </section>
        <section class="facts">
          ${fact(title(data, "application"), applicationFacts(data))}
          ${fact(title(data, "skills"), chips(data.clinicalSkills))}
          ${fact(title(data, "tools"), chips(data.toolsFull))}
        </section>
        <section class="panel" style="margin-top:14px;">
          ${sectionTitle(data, "jobs")}
          ${jobGrid(data.jobs)}
        </section>
      </div>
    `;
  }

  function renderClassic(data) {
    return `
      <div class="resume-page">
        <section class="classic">
          <aside class="classic-sidebar">
            ${photo(data)}
            ${identity(data)}
            ${contactList(data)}
          </aside>
          <div class="classic-main">
            <section>
              ${sectionTitle(data, "summary")}
              ${summary(data)}
            </section>
            <section>
              ${sectionTitle(data, "skills")}
              ${chips(data.clinicalSkills)}
            </section>
            <section>
              ${sectionTitle(data, "jobs")}
              ${jobGrid(data.jobs)}
            </section>
            <section>
              ${sectionTitle(data, "tools")}
              ${chips(data.toolsFull)}
            </section>
          </div>
        </section>
      </div>
    `;
  }

  function renderBento(data) {
    return `
      <div class="resume-page">
        <section class="bento">
          <article class="tile hero">
            ${identity(data)}
            ${summary(data)}
          </article>
          <article class="tile photo-tile">
            ${photo(data)}
          </article>
          <article class="tile full">
            ${metricBand(data)}
          </article>
          <article class="tile wide">
            ${sectionTitle(data, "jobs")}
            ${jobGrid(data.jobs)}
          </article>
          <article class="tile tall">
            ${sectionTitle(data, "contact")}
            ${contactList(data)}
          </article>
          <article class="tile">
            ${sectionTitle(data, "skills")}
            ${chips(data.clinicalSkills)}
          </article>
          <article class="tile">
            ${sectionTitle(data, "toolsShort")}
            ${chips(data.toolsShort)}
          </article>
        </section>
      </div>
    `;
  }

  function renderAts(data) {
    return `
      <div class="resume-page">
        <section class="ats-paper">
          <h1 class="ats-title">履 歷 表</h1>
          <table class="resume-table">
            <colgroup><col><col><col><col><col><col><col></colgroup>
            <tbody>
              <tr class="section-row"><th colspan="7">基 本 資 料</th></tr>
              <tr>
                <td colspan="2">姓 名：${escapeHtml(spacedName(data.profile.name))}</td>
                <td colspan="2">性 別：${escapeHtml(data.application.gender)}</td>
                <td colspan="2">出生日期：${escapeHtml(data.application.birthdate)}</td>
                <td class="photo-cell" rowspan="5">${photo(data)}</td>
              </tr>
              <tr>
                <td colspan="4">聯絡電話：${escapeHtml(data.contact.phone)}</td>
                <td colspan="2">身高/體重：${escapeHtml(compactSlash(data.application.heightWeight))}</td>
              </tr>
              <tr>
                <td colspan="4"></td>
                <td colspan="2">兵役/婚姻：${escapeHtml(compactSlash(data.application.militaryMarriage))}</td>
              </tr>
              <tr>
                <td colspan="4">電子信箱：${escapeHtml(data.contact.email)}</td>
                <td colspan="2">最高學歷：${escapeHtml(data.contact.education)}</td>
              </tr>
              <tr>
                <td colspan="6">聯絡地址：${escapeHtml(data.contact.address)}</td>
              </tr>
              <tr class="section-row"><th colspan="7">${escapeHtml(title(data, "application"))}</th></tr>
              <tr>
                <td colspan="4">應徵職務：${escapeHtml(data.application.desiredPosition)}</td>
                <td colspan="3">希望待遇：${escapeHtml(compactText(data.application.salary))}</td>
              </tr>
              <tr>
                <td colspan="7">可上班日：${escapeHtml(data.application.availableDate)}</td>
              </tr>
              <tr class="section-row"><th colspan="7">${escapeHtml(title(data, "jobs"))}</th></tr>
              <tr class="job-head">
                <th>機構</th>
                <th colspan="2">職稱</th>
                <th colspan="2">期間</th>
                <th colspan="2">工作內容</th>
              </tr>
              ${data.jobs.map(function (job) {
                return `
                  <tr class="job-row">
                    <td>${escapeHtml(job.company)}</td>
                    <td colspan="2">${escapeHtml(job.title)}</td>
                    <td colspan="2">${escapeHtml(compactDash(job.period))}</td>
                    <td colspan="2">${escapeHtml(job.detail)}</td>
                  </tr>
                `;
              }).join("")}
              <tr class="section-row"><th colspan="7">${escapeHtml(title(data, "educationLicense"))}</th></tr>
              <tr><td colspan="7">證照：${escapeHtml(ensurePeriod(data.contact.license))}</td></tr>
              <tr><td colspan="7">語言：${escapeHtml(formatLanguage(data.contact.language))}</td></tr>
              <tr class="section-row"><th colspan="7">${escapeHtml(title(data, "summary"))}</th></tr>
              <tr><td colspan="7" class="brief">${escapeHtml(summaryText(data))}</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    `;
  }

  function renderClinical(data) {
    return `
      <div class="resume-page">
        <section class="portfolio-head">
          <div>
            ${identity(data)}
            ${summary(data)}
            ${metricLine(data)}
          </div>
          ${photo(data)}
        </section>
        <section class="portfolio-grid">
          <article class="portfolio-card">
            ${sectionTitle(data, "skills")}
            ${skillMeters(data)}
          </article>
          <article class="portfolio-card">
            ${sectionTitle(data, "tools")}
            ${chips(data.toolsFull)}
          </article>
          <article class="portfolio-card">
            ${sectionTitle(data, "cases")}
            ${caseList(data)}
          </article>
          <article class="portfolio-card">
            ${sectionTitle(data, "jobs")}
            ${jobGrid(data.jobs)}
          </article>
        </section>
      </div>
    `;
  }

  function identity(data) {
    return `
      <h1>${escapeHtml(data.profile.name || "履歷")}</h1>
      <p class="role">${escapeHtml(data.profile.role)}</p>
      <p class="muted">${escapeHtml(data.profile.tagline)}</p>
    `;
  }

  function photo(data) {
    return `<img class="theme-photo" data-theme-photo src="${escapeAttr(photoPath)}" alt="${escapeAttr(data.profile.name || "履歷")} 個人照片">`;
  }

  function preloadPhoto() {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.src = photoPath;

    if (image.decode) {
      image.decode().catch(function () {});
    }
  }

  function applyResumePhoto(root, data) {
    root.querySelectorAll("img[data-theme-photo]").forEach(function (target) {
      target.setAttribute("src", photoPath);
      target.setAttribute("alt", `${data.profile.name || "履歷"} 個人照片`);
      target.style.setProperty("--photo-bg", pickRandom(photoBackgrounds));
    });
  }

  function contactList(data) {
    const rows = [
      [data.labels.phone, data.contact.phone],
      [data.labels.email, data.contact.email],
      [data.labels.address, data.contact.address],
      [data.labels.education, data.contact.education],
      [data.labels.license, data.contact.license],
      [data.labels.language, data.contact.language]
    ].filter(function (row) { return row[1]; });

    return `<div class="contact-list">${rows.map(function (row) {
      return `<p><span>${escapeHtml(row[0])}</span>${escapeHtml(row[1])}</p>`;
    }).join("")}</div>`;
  }

  function applicationFacts(data) {
    const rows = [
      ["應徵職務", data.application.desiredPosition],
      ["希望待遇", data.application.salary],
      ["可上班日", data.application.availableDate],
      ["性別", data.application.gender],
      ["出生日期", data.application.birthdate],
      ["身高/體重", data.application.heightWeight],
      ["兵役/婚姻", data.application.militaryMarriage]
    ].filter(function (row) { return row[1]; });

    return `<div class="contact-list">${rows.map(function (row) {
      return `<p><span>${escapeHtml(row[0])}</span>${escapeHtml(row[1])}</p>`;
    }).join("")}</div>`;
  }

  function sectionTitle(data, key) {
    return `<h2 class="section-title">${escapeHtml(title(data, key))}</h2>`;
  }

  function title(data, key) {
    return data.sectionTitles[key] || sectionFallbacks[key] || key;
  }

  function summary(data) {
    const paragraphs = data.summary.length ? data.summary : [data.profile.tagline].filter(Boolean);

    return `<div class="summary">${paragraphs.map(function (item) {
      return `<p>${escapeHtml(item)}</p>`;
    }).join("")}</div>`;
  }

  function summaryText(data) {
    return (data.summary.length ? data.summary : [data.profile.tagline]).filter(Boolean).join("");
  }

  function metrics(data) {
    if (data.metrics.length) return data.metrics;

    return [
      { value: "19+", label: "臨床復健年資" },
      { value: "8+", label: "自費徒手經驗" },
      { value: String(data.jobs.length || 6), label: "醫院與診所歷練" },
      { value: data.application.availableDate, label: "可上班日" }
    ].filter(function (item) { return item.value; });
  }

  function metricGrid(data) {
    return `<section class="metric-grid">${metrics(data).map(metricCard).join("")}</section>`;
  }

  function metricLine(data) {
    return `<div class="profile-line">${metrics(data).map(metricCard).join("")}</div>`;
  }

  function metricBand(data) {
    return `<div class="metric-band">${metrics(data).map(metricCard).join("")}</div>`;
  }

  function metricCard(metric) {
    return `<div class="metric"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`;
  }

  function skillMeters(data) {
    const bars = data.skillBars.length ? data.skillBars : data.clinicalSkills.map(function (skill, index) {
      const widths = ["96%", "90%", "84%", "88%", "80%", "76%"];
      return { label: skill, width: widths[index] || "78%" };
    });

    return `<div class="skill-meter">${bars.map(function (bar) {
      return `<div class="bar"><span style="width:${escapeAttr(bar.width || "80%")}">${escapeHtml(bar.label)}</span></div>`;
    }).join("")}</div>`;
  }

  function chips(items) {
    const values = asArray(items).filter(Boolean);

    if (!values.length) return `<p class="muted">尚未填寫</p>`;

    return values.map(function (item) {
      return `<span class="chip">${escapeHtml(item)}</span>`;
    }).join("");
  }

  function jobGrid(jobs) {
    const rows = asArray(jobs);
    if (!rows.length) return `<p class="muted">尚未填寫</p>`;

    return `<div class="job-grid">${rows.map(function (job) {
      return `
        <article class="job">
          <time>${escapeHtml(job.period)}</time>
          <h3>${escapeHtml(job.company)}</h3>
          <p>${escapeHtml(job.title)}</p>
          <small>${escapeHtml(job.detail)}</small>
        </article>
      `;
    }).join("")}</div>`;
  }

  function timelineItem(job) {
    return `
      <article class="timeline-item">
        <div class="timeline-card">
          <time>${escapeHtml(job.period)}</time>
          <h3>${escapeHtml(job.company)}</h3>
          <p>${escapeHtml(job.title)}</p>
          <small class="muted">${escapeHtml(job.detail)}</small>
        </div>
      </article>
    `;
  }

  function caseList(data) {
    const cases = data.cases.length ? data.cases : data.jobs.slice(0, 4).map(function (job) {
      return { title: job.company, text: job.detail };
    });

    return cases.map(function (item) {
      return `
        <article class="job" style="margin-bottom:10px;">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `;
    }).join("");
  }

  function fact(label, content) {
    return `<article class="fact"><h3>${escapeHtml(label)}</h3>${content}</article>`;
  }

  function spacedName(name) {
    const clean = String(name || "").replace(/\s+/g, "");
    return clean.length > 1 ? clean.split("").join(" ") : clean;
  }

  function compactSlash(value) {
    return String(value || "").replace(/\s*\/\s*/g, "/");
  }

  function compactDash(value) {
    return String(value || "").replace(/\s*-\s*/g, "-");
  }

  function compactText(value) {
    return String(value || "").replace(/\s+/g, "");
  }

  function ensurePeriod(value) {
    const text = String(value || "").trim();
    return text && !/[。！？!?]$/.test(text) ? `${text}。` : text;
  }

  function formatLanguage(value) {
    const text = String(value || "").trim().replace(/^語言[:：]?\s*/, "");
    return text ? ensurePeriod(text) : "";
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
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
