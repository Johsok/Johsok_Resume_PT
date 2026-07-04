(function () {
  "use strict";

  const photoPath = "myphoto.png";
  const pastelBackgrounds = [
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

  function getPhotoTargets() {
    return Array.from(document.querySelectorAll("img[data-random-photo]"));
  }

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function applyResumePhoto() {
    getPhotoTargets().forEach(function (target) {
      target.setAttribute("src", photoPath);
      target.style.backgroundColor = pickRandom(pastelBackgrounds);
      target.style.objectFit = "contain";
      target.style.objectPosition = "center bottom";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyResumePhoto);
  } else {
    applyResumePhoto();
  }
}());
