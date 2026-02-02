const wishes = [
  "One kiss, a thousand smiles. Happy Kiss Day!",
  "Here’s a sweet kiss to brighten your day. Mwah!",
  "May your day be soft, sweet, and full of love.",
  "A kiss is a tiny promise of happiness—sending you mine.",
  "If kisses were stars, I’d send you the whole sky.",
  "Kiss Day reminder: you deserve all the love today and always.",
];

const $ = (sel) => document.querySelector(sel);

const wishTitle = $("#wishTitle");
const wishText = $("#wishText");
const btnKiss = $("#btnKiss");
const btnWish = $("#btnWish");
const btnNo = $("#btnNo");
const yearEl = $("#year");

if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function pickWish() {
  const idx = Math.floor(Math.random() * wishes.length);
  return wishes[idx];
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / permissions
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

function setWish(next) {
  if (!wishText) return;
  wishText.animate(
    [{ opacity: 0.15, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 260, easing: "ease-out" },
  );
  wishText.textContent = `“${next}”`;
}

// --- Cute FX (hearts confetti) ---

const canvas = $("#fxCanvas");
const ctx = canvas?.getContext("2d");

let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
let w = 0;
let h = 0;

function resize() {
  if (!canvas || !ctx) return;
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  w = Math.floor(window.innerWidth);
  h = Math.floor(window.innerHeight);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize, { passive: true });
resize();

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function heartPath(c, x, y, size) {
  const top = size * 0.28;
  c.beginPath();
  c.moveTo(x, y + top);
  c.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + top);
  c.bezierCurveTo(
    x - size / 2,
    y + (size + top) / 2,
    x,
    y + (size + top) / 1.15,
    x,
    y + size,
  );
  c.bezierCurveTo(
    x,
    y + (size + top) / 1.15,
    x + size / 2,
    y + (size + top) / 2,
    x + size / 2,
    y + top,
  );
  c.bezierCurveTo(x + size / 2, y, x, y, x, y + top);
  c.closePath();
}

const palette = ["#ff4fa0", "#ff7fbf", "#ffb6a7", "#86f0cf", "#ffd1e8"];

class Heart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = rand(-0.7, 0.7);
    this.vy = rand(-2.6, -1.2);
    this.rot = rand(-0.6, 0.6);
    this.vr = rand(-0.03, 0.03);
    this.size = rand(10, 22);
    this.life = 0;
    this.ttl = rand(60, 120);
    this.color = palette[(Math.random() * palette.length) | 0];
    this.alpha = 1;
  }

  step() {
    this.life += 1;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.04; // gravity-ish
    this.rot += this.vr;
    this.alpha = Math.max(0, 1 - this.life / this.ttl);
  }

  draw(c) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.rot);
    c.globalAlpha = this.alpha * 0.95;
    c.fillStyle = this.color;
    c.shadowColor = "rgba(255,79,160,.22)";
    c.shadowBlur = 10;
    heartPath(c, 0, 0, this.size);
    c.fill();
    c.restore();
  }

  get dead() {
    return this.life >= this.ttl || this.y > h + 60;
  }
}

const hearts = [];
let raf = 0;
let boostUntil = 0;

function spawnBurst(count, originX = w / 2, originY = h * 0.35) {
  for (let i = 0; i < count; i += 1) {
    hearts.push(new Heart(originX + rand(-40, 40), originY + rand(-10, 10)));
  }
}

function loop() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, w, h);

  // gentle idle spawns
  const now = performance.now();
  const idleRate = now < boostUntil ? 2 : 0.6;
  if (Math.random() < idleRate / 60) {
    hearts.push(new Heart(rand(40, w - 40), h + 30));
  }

  for (let i = hearts.length - 1; i >= 0; i -= 1) {
    const p = hearts[i];
    p.step();
    p.draw(ctx);
    if (p.dead) hearts.splice(i, 1);
  }

  raf = requestAnimationFrame(loop);
}

function startFx() {
  if (raf) return;
  raf = requestAnimationFrame(loop);
}

function boostFx(ms = 1600) {
  startFx();
  boostUntil = performance.now() + ms;
  spawnBurst(26, w / 2, h * 0.38);
}

function moveNoButton() {
  if (!btnNo) return;
  startFx();

  // Ensure it can move independently (without breaking layout)
  btnNo.style.position = "relative";

  const maxX = Math.min(220, Math.max(120, w * 0.35));
  const maxY = Math.min(140, Math.max(90, h * 0.18));
  const x = rand(-maxX, maxX);
  const y = rand(-maxY, maxY);

  btnNo.animate(
    [
      { transform: `translate(${x * 0.2}px, ${y * 0.2}px)` },
      { transform: `translate(${x}px, ${y}px)` },
    ],
    { duration: 220, easing: "cubic-bezier(.2,.9,.2,1)" },
  );
  btnNo.style.transform = `translate(${x}px, ${y}px)`;

  spawnBurst(10, w / 2, h * 0.32);
}

// Events
btnKiss?.addEventListener("click", () => boostFx(2400));

btnWish?.addEventListener("click", async () => {
  const next = pickWish();
  setWish(next);
  const ok = await copyToClipboard(next);
  if (wishTitle) wishTitle.textContent = ok ? "Copied to clipboard:" : "Your Kiss Day wish:";
  boostFx(1200);
});

btnNo?.addEventListener("mouseenter", moveNoButton);
btnNo?.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
});
btnNo?.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoButton();
});

// Start gentle background animation
startFx();

