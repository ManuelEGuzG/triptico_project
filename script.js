const brochure = document.querySelector("#brochure");
const stage = document.querySelector("#paper-stage");
const outsideFace = document.querySelector(".face-outside");
const insideFace = document.querySelector(".face-inside");
const sideButtons = document.querySelectorAll(".side-button");
const announcement = document.querySelector("#side-announcement");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let changeTimeout;

function setSide(side) {
  const isInside = side === "inside";
  const isAlreadyActive = brochure.classList.contains("is-inside") === isInside;
  if (isAlreadyActive) return;

  brochure.classList.toggle("is-inside", isInside);
  outsideFace.setAttribute("aria-hidden", String(isInside));
  insideFace.setAttribute("aria-hidden", String(!isInside));
  outsideFace.toggleAttribute("inert", isInside);
  insideFace.toggleAttribute("inert", !isInside);
  stage.classList.add("is-changing");
  brochure.setAttribute(
    "aria-label",
    isInside ? "Mostrar el exterior del tríptico" : "Mostrar el interior del tríptico",
  );
  announcement.textContent = isInside
    ? "Vista interior del tríptico"
    : "Vista exterior del tríptico";

  sideButtons.forEach((button) => {
    const active = button.dataset.side === side;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  window.clearTimeout(changeTimeout);
  changeTimeout = window.setTimeout(
    () => stage.classList.remove("is-changing"),
    reducedMotion.matches ? 1 : 700,
  );
}

function toggleSide() {
  setSide(brochure.classList.contains("is-inside") ? "outside" : "inside");
}

let ignoreClickUntil = 0;

brochure.addEventListener("click", (event) => {
  if (performance.now() < ignoreClickUntil) {
    event.preventDefault();
    return;
  }

  toggleSide();
});

sideButtons.forEach((button) => {
  button.addEventListener("click", () => setSide(button.dataset.side));
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    toggleSide();
  }
});

let pointerStartX = null;

stage.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch") pointerStartX = event.clientX;
});

stage.addEventListener("pointerup", (event) => {
  if (pointerStartX === null) return;

  const distance = event.clientX - pointerStartX;
  pointerStartX = null;
  if (Math.abs(distance) < 55) return;

  ignoreClickUntil = performance.now() + 400;
  setSide(distance < 0 ? "inside" : "outside");
});

stage.addEventListener("pointercancel", () => {
  pointerStartX = null;
});
