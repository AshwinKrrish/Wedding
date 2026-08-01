document.addEventListener("DOMContentLoaded", () => {
  const DOOR_ANIMATION_DURATION = 2000;
  const INVITATION_EXPAND_DELAY = 2200;
  const ZOOM_ANIMATION_DURATION = 950;

  const body = document.body;
  const app = document.querySelector("#weddingApp");
  const scene = document.querySelector("#templeScene");
  const openButton = document.querySelector("#openInvitationButton");
  const invitationStage = document.querySelector("#invitationStage");
  const invitationImage = document.querySelector("#invitationImage");
  const audio = document.querySelector("#doorAudio");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const criticalAssets = [
    "./assets/weddin temple.png",
    "./assets/weddin temple door left.png",
    "./assets/weddin temple door right.png",
    "./assets/open button.png",
    "./assets/Invitation Page.webp"
  ];

  let hasOpened = false;
  let hasExpanded = false;

  const preloadImage = (source) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = source;
  });

  const markReady = () => {
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
    openButton.disabled = false;
  };

  Promise.all(criticalAssets.map(preloadImage)).then((results) => {
    if (results.every(Boolean)) markReady();
  });

  const finishExpansion = () => {
    invitationImage.style.removeProperty("transition");
    invitationImage.style.removeProperty("transform");
    invitationImage.focus({ preventScroll: true });
    invitationStage.scrollTop = 0;
  };

  const expandInvitation = () => {
    if (hasExpanded) return;

    hasExpanded = true;
    const startRect = invitationImage.getBoundingClientRect();

    // Move the existing card into the fixed reading layout, then invert its
    // position so it visually continues from its doorway-sized location.
    scene.append(invitationStage);
    app.classList.add("invitation-expanded");

    if (reducedMotion.matches) {
      finishExpansion();
      return;
    }

    const endRect = invitationImage.getBoundingClientRect();
    const offsetX = startRect.left - endRect.left;
    const offsetY = startRect.top - endRect.top;
    const startScale = startRect.width / endRect.width;

    invitationImage.style.transition = "none";
    invitationImage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${startScale})`;

    invitationImage.getBoundingClientRect();
    requestAnimationFrame(() => {
      invitationImage.style.transition = `transform ${ZOOM_ANIMATION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`;
      invitationImage.style.transform = "translate(0, 0) scale(1)";
      window.setTimeout(finishExpansion, ZOOM_ANIMATION_DURATION);
    });
  };

  const openInvitation = () => {
    if (hasOpened || openButton.disabled) return;

    hasOpened = true;
    openButton.disabled = true;

    audio.currentTime = 0;
    audio.loop = false;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // The visual experience remains functional if playback is blocked.
      });
    }

    app.classList.add("invitation-open");

    // Doors finish at 2000ms; the extra 200ms preserves the doorway pause.
    window.setTimeout(
      expandInvitation,
      reducedMotion.matches ? 0 : INVITATION_EXPAND_DELAY
    );
  };

  openButton.addEventListener("click", openInvitation);

  // Keep the duration constant visible to maintainers and aligned with CSS.
  app.style.setProperty("--door-duration", `${DOOR_ANIMATION_DURATION}ms`);
});
