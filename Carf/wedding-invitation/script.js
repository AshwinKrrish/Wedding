document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const experience = document.querySelector("#wedding-experience");
  const openButton = document.querySelector(".open-button");
  const invitation = document.querySelector("#invitation");
  const backgroundMusic = document.querySelector("#background-music");
  const optionalPages = document.querySelectorAll(".optional-page img");
  const essentialDisplayImages = document.querySelectorAll(".temple img, .open-button img, .invitation-page:first-child img");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Change the opening sequence timing here. CSS durations live in :root in styles.css.
  const timings = {
    doorStart: 300,
    reveal: 700,
    enableScroll: 1550,
    focus: 2050
  };

  let hasOpened = false;

  // Select only the artwork for the current layout, plus the button and first page.
  const mobileLayout = window.matchMedia("(max-width: 768px)").matches;
  const criticalAssets = mobileLayout
    ? [
        "assets/temple-frame-mobile.webp",
        "assets/left-door-mobile.webp",
        "assets/right-door-mobile.webp",
        "assets/open-invitation-button.webp",
        "assets/invitation-pages/page-1.webp"
      ]
    : [
        "assets/temple-frame-desktop.webp",
        "assets/left-door-desktop.webp",
        "assets/right-door-desktop.webp",
        "assets/open-invitation-button.webp",
        "assets/invitation-pages/page-1.webp"
      ];

  const preloadImage = (source) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = source;
  });

  const markReady = () => {
    body.classList.remove("is-loading");
    body.classList.add("is-ready", "is-closed");
    openButton.disabled = false;
  };

  Promise.all(criticalAssets.map(preloadImage)).then((loaded) => {
    // The entrance is never exposed in a broken state: it unlocks only when
    // every essential image for the current viewport is ready.
    if (loaded.every(Boolean)) markReady();
  });

  // Optional invitation images are removed cleanly if their files do not exist.
  optionalPages.forEach((image) => {
    const removeMissingPage = () => image.closest(".invitation-page")?.remove();
    image.addEventListener("error", removeMissingPage, { once: true });
    if (image.complete && image.naturalWidth === 0) removeMissingPage();
  });

  // Suppress the browser's broken-image icon if a required file is unavailable.
  essentialDisplayImages.forEach((image) => {
    const hideBrokenImage = () => image.classList.add("image-unavailable");
    image.addEventListener("error", hideBrokenImage, { once: true });
    if (image.complete && image.naturalWidth === 0) hideBrokenImage();
  });

  const openInvitation = () => {
    if (hasOpened || openButton.disabled) return;
    hasOpened = true;
    openButton.disabled = true;

    // This runs directly inside the user's click/keyboard activation so mobile
    // browsers permit playback. With no loop attribute, it stops at the end.
    const playback = backgroundMusic?.play();
    playback?.catch(() => {
      // Playback may still be blocked by an unusually strict browser policy.
    });

    experience.classList.add("is-activated");
    body.classList.remove("is-closed");
    body.classList.add("is-opening");

    const motionTimings = reducedMotion.matches
      ? { doorStart: 0, reveal: 0, enableScroll: 120, focus: 220 }
      : timings;

    window.setTimeout(() => experience.classList.add("invitation-open"), motionTimings.doorStart);
    window.setTimeout(() => experience.classList.add("is-revealing"), motionTimings.reveal);
    window.setTimeout(() => {
      experience.classList.add("is-readable");
      body.classList.remove("is-opening");
    }, motionTimings.enableScroll);
    window.setTimeout(() => {
      if (!mobileLayout) invitation.focus({ preventScroll: false });
    }, motionTimings.focus);
  };

  openButton.addEventListener("click", openInvitation);
});
