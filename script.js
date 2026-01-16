const cakeBtn = document.getElementById("cakeBtn");
const playground = document.querySelector(".playground");

// position in %
let x = 50;
let y = 50;

const FLEE_RADIUS_PX = 180;     // how close your mouse can get before it flees
const FLEE_STRENGTH = 32;       // how hard it flees per tick (in %-ish effect)
const IDLE_WIGGLE = 4;          // tiny movement even when not fleeing
const TICK_MS = 20;             // reaction speed (smaller = more evil)
const MIN_X = 6,  MAX_X = 94;   // movement bounds (percent)
const MIN_Y = 6,  MAX_Y = 94;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Keep track of mouse position inside the playground
let mouseX = null;
let mouseY = null;

playground.addEventListener("mousemove", (e) => {
  const rect = playground.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

playground.addEventListener("mouseleave", () => {
  mouseX = null;
  mouseY = null;
});

// Moves cake to current x/y
function applyPosition() {
  cakeBtn.style.left = x + "%";
  cakeBtn.style.top = y + "%";
}

// Convert % position to pixel position for distance math
function cakeCenterPx() {
  const rect = playground.getBoundingClientRect();
  return {
    cx: (x / 100) * rect.width,
    cy: (y / 100) * rect.height,
  };
}

function tick() {
  // always wiggle a little (so it never “rests”)
  x = clamp(x + rand(-IDLE_WIGGLE, IDLE_WIGGLE), MIN_X, MAX_X);
  y = clamp(y + rand(-IDLE_WIGGLE, IDLE_WIGGLE), MIN_Y, MAX_Y);

  if (mouseX !== null && mouseY !== null) {
    const { cx, cy } = cakeCenterPx();
    const dx = cx - mouseX;
    const dy = cy - mouseY;
    const dist = Math.hypot(dx, dy);

    if (dist < FLEE_RADIUS_PX && dist > 0.0001) {
      // Normalize direction away from cursor
      const ux = dx / dist;
      const uy = dy / dist;

      // Convert flee push into % space
      // (scaled by how close you are: closer = stronger)
      const fear = (FLEE_RADIUS_PX - dist) / FLEE_RADIUS_PX; // 0..1
      const push = FLEE_STRENGTH * (0.35 + fear);           // stronger when close

      x = clamp(x + ux * push, MIN_X, MAX_X);
      y = clamp(y + uy * push, MIN_Y, MAX_Y);

      // Occasionally do a sudden dash (fake-out)
      if (Math.random() < 0.08) {
        x = clamp(x + rand(-20, 20), MIN_X, MAX_X);
        y = clamp(y + rand(-16, 16), MIN_Y, MAX_Y);
      }
    }
  }

  applyPosition();
}

applyPosition();
const timer = setInterval(tick, TICK_MS);

const confettiLayer = document.getElementById("confetti");
const reveal = document.getElementById("reveal");

function popConfetti() {
  const colors = ["#9b6cff", "#ff5c7a", "#ffcc66", "#5de0c6", "#ffffff", "#caa9ff"];
  const count = 120;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("i");
    piece.style.left = Math.random() * window.innerWidth + "px";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (0.8 + Math.random() * 0.8) + "s";
    piece.style.width = (8 + Math.random() * 8) + "px";
    piece.style.height = (10 + Math.random() * 10) + "px";

    confettiLayer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

cakeBtn.addEventListener("click", () => {
    cakeBtn.style.display = "none";
  clearInterval(timer);          // stop movement
  popConfetti();                 // confetti
  reveal.classList.remove("hidden"); // show Jinshi/Geto panel
});
