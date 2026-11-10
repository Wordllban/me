// Client-side interactivity for the Dark Fantasy portfolio.
// Ported from the design concept's DCLogic (rewritten as framework-free DOM code).
import { ivySrc, uprightLeaves } from "../data/ivy";
import { sectionMeta } from "../data/portfolio";
import { initVine } from "./vine";

const ORDER = ["about", "path", "work", "give", "wins", "corner", "contact"];

const root = document.querySelector<HTMLElement>("[data-root]");
if (root) {
  init(root);
  initVine(root);
}

function detectLayout(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  return w < 600 ? "mobile" : w < 1000 ? "tablet" : "desktop";
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one closure owns all page state; split tracked as debt
function init(root: HTMLElement) {
  let section = "about";
  let openCard = "garden";
  let layout = detectLayout();

  const sections = [...root.querySelectorAll<HTMLElement>("[data-section]")];
  const navButtons = [...root.querySelectorAll<HTMLElement>("[data-nav]")];

  // page-turner nav + chapter sheet references
  const pagerNumeral = root.querySelector<HTMLElement>("[data-pager-numeral]");
  const pagerLabel = root.querySelector<HTMLElement>("[data-pager-label]");
  const pagerDots = [...root.querySelectorAll<HTMLElement>("[data-pager-dot]")];
  const navRows = [...root.querySelectorAll<HTMLElement>("[data-nav-row]")];
  const navSheet = root.querySelector<HTMLElement>("[data-nav-sheet]");

  function updatePager(key: string) {
    const meta = sectionMeta.find((m) => m.key === key);
    if (meta) {
      if (pagerNumeral) pagerNumeral.textContent = meta.n;
      if (pagerLabel) pagerLabel.textContent = meta.label;
    }
    pagerDots.forEach((d) => {
      if (d.dataset.pagerDot === key) d.setAttribute("data-active", "");
      else d.removeAttribute("data-active");
    });
    navRows.forEach((r) => {
      if (r.dataset.navRow === key) r.setAttribute("data-active", "");
      else r.removeAttribute("data-active");
    });
  }

  // ---------- section switching ----------
  function applySection(key: string) {
    sections.forEach((p) => {
      const on = p.dataset.section === key;
      if (on) p.setAttribute("data-active", "");
      else p.removeAttribute("data-active");
      if (on) {
        const b = p.querySelector<HTMLElement>("[data-body]");
        if (b) b.scrollTop = 0;
      }
      if (on && key === "contact") {
        const rows = p.querySelectorAll<HTMLElement>("[data-ch-row]");
        rows.forEach((r, i) => {
          r.style.animation = "none";
          void r.offsetWidth;
          r.style.animation =
            "chIn .55s " +
            (0.06 + i * 0.09) +
            "s cubic-bezier(.22,1,.36,1) both";
          r.addEventListener(
            "animationend",
            () => {
              r.style.animation = "";
            },
            { once: true }
          );
        });
      }
    });
    navButtons.forEach((b) => {
      if (b.dataset.nav === key) b.setAttribute("data-active", "");
      else b.removeAttribute("data-active");
    });
    updatePager(key);
    // On mobile/tablet the whole document scrolls, so reset it to the top
    // when the chapter changes (the desktop console scrolls per-section body).
    if (layout !== "desktop") window.scrollTo(0, 0);
  }
  function setSection(key: string) {
    section = key;
    applySection(key);
  }
  function closeSheet() {
    navSheet?.removeAttribute("data-open");
  }
  function step(dir: number) {
    let i = ORDER.indexOf(section);
    i = (i + dir + ORDER.length) % ORDER.length;
    setSection(ORDER[i]);
  }

  navButtons.forEach((b) => {
    b.addEventListener("click", () => setSection(b.dataset.nav as string));
  });

  // ---------- page-turner nav (prev · chapter · next) ----------
  root
    .querySelector<HTMLElement>("[data-pager-prev]")
    ?.addEventListener("click", () => step(-1));
  root
    .querySelector<HTMLElement>("[data-pager-next]")
    ?.addEventListener("click", () => step(1));
  root
    .querySelector<HTMLElement>("[data-pager-toggle]")
    ?.addEventListener("click", () => {
      if (navSheet) navSheet.toggleAttribute("data-open");
    });
  pagerDots.forEach((d) => {
    d.addEventListener("click", (e) => {
      e.stopPropagation(); // dots live inside the toggle button - don't also open the sheet
      setSection(d.dataset.pagerDot as string);
    });
  });

  // ---------- jump-to-chapter bottom sheet ----------
  root
    .querySelector<HTMLElement>("[data-nav-close]")
    ?.addEventListener("click", closeSheet);
  navSheet?.addEventListener("click", closeSheet); // tap the scrim closes
  root
    .querySelector<HTMLElement>("[data-nav-panel]")
    ?.addEventListener("click", (e) => e.stopPropagation());
  navRows.forEach((r) => {
    r.addEventListener("click", () => {
      setSection(r.dataset.navRow as string);
      closeSheet();
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Escape") closeSheet();
  });

  // ---------- easter-egg FX ----------
  let fx: HTMLElement | null = null;
  function ensureFX() {
    if (fx && document.body.contains(fx)) return fx;
    const d = document.createElement("div");
    d.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden";
    document.body.appendChild(d);
    fx = d;
    return d;
  }
  function leafImage(i: number, size: number) {
    const img = document.createElement("img");
    img.src = ivySrc(uprightLeaves[i % uprightLeaves.length]);
    img.alt = "";
    img.style.cssText = `display:block;width:${size}px;height:auto`;
    return img;
  }
  function spawnLeafRain(n: number) {
    const layer = ensureFX();
    for (let i = 0; i < n; i++) {
      const wrap = document.createElement("div");
      const size = 22 + Math.random() * 36;
      wrap.style.cssText = `position:absolute;top:-60px;left:${Math.random() * 100}vw`;
      wrap.appendChild(leafImage(i, size));
      const drift = (Math.random() * 2 - 1) * 150;
      const rot = (Math.random() * 2 - 1) * 780;
      const dur = 3200 + Math.random() * 2800;
      const delay = Math.random() * 700;
      wrap.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 0 },
          { opacity: 1, offset: 0.08 },
          { opacity: 1, offset: 0.85 },
          {
            transform:
              "translate(" +
              drift +
              "px," +
              (window.innerHeight + 140) +
              "px) rotate(" +
              rot +
              "deg)",
            opacity: 0.15,
          },
        ],
        {
          duration: dur,
          delay,
          easing: "cubic-bezier(.35,.1,.6,1)",
          fill: "forwards",
        }
      );
      setTimeout(() => wrap.remove(), dur + delay + 200);
      layer.appendChild(wrap);
    }
  }
  function showToast(text: string) {
    const layer = ensureFX();
    const t = document.createElement("div");
    t.textContent = text;
    t.style.cssText =
      "position:absolute;left:50%;bottom:46px;transform:translateX(-50%);font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.03em;padding:12px 20px;border-radius:999px;border:1px solid rgba(176,138,86,.3);background:#0b0812;color:#ece2d2;box-shadow:0 16px 44px -14px rgba(0,0,0,.7);white-space:nowrap";
    layer.appendChild(t);
    t.animate(
      [
        { opacity: 0, transform: "translateX(-50%) translateY(16px)" },
        { opacity: 1, transform: "translateX(-50%) translateY(0)" },
      ],
      { duration: 360, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
    );
    setTimeout(() => {
      t.animate(
        [
          { opacity: 1 },
          { opacity: 0, transform: "translateX(-50%) translateY(10px)" },
        ],
        {
          duration: 400,
          fill: "forwards",
        }
      );
      setTimeout(() => t.remove(), 420);
    }, 2600);
  }

  // ---------- drifting embers ----------
  const embers = root.querySelector<HTMLElement>("[data-embers]");
  function spawnEmber() {
    if (!embers || document.hidden) return;
    if (layout !== "desktop" && Math.random() < 0.55) return; // fewer embers on touch devices
    const e = document.createElement("span");
    const size = 2 + Math.random() * 3;
    e.style.cssText =
      "position:absolute;bottom:-10px;left:" +
      Math.random() * 100 +
      "vw;width:" +
      size +
      "px;height:" +
      size +
      "px;border-radius:50%;background:var(--ember);box-shadow:0 0 7px var(--ember)";
    embers.appendChild(e);
    const drift = (Math.random() * 2 - 1) * 70;
    const dur = 5200 + Math.random() * 3600;
    e.animate(
      [
        { transform: "translate(0,0)", opacity: 0 },
        { opacity: 0.9, offset: 0.12 },
        { opacity: 0.65, offset: 0.7 },
        { transform: `translate(${drift}px,-86vh)`, opacity: 0 },
      ],
      { duration: dur, easing: "ease-out", fill: "forwards" }
    );
    setTimeout(() => e.remove(), dur + 120);
  }
  setInterval(spawnEmber, 1500);

  // ---------- the Ivy medallion senses interactive elements (Witcher nod) ----------
  let lastSense = 0;
  function trembleMedallion() {
    const m = root.querySelector<HTMLElement>("[data-medallion]");
    if (!m) return;
    const now = Date.now();
    if (now - lastSense < 420) return;
    lastSense = now;
    m.classList.remove("sense");
    void m.offsetWidth;
    m.classList.add("sense");
  }
  root.addEventListener("mouseover", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest?.("button,a,article,[data-spark]")) trembleMedallion();
  });

  // ---------- logo click (both the rail sigil and the mobile topbar sigil) ----------
  let logoN = 0;
  root.querySelectorAll<HTMLElement>("[data-logo-click]").forEach((logo) => {
    logo.addEventListener("click", () => {
      logoN += 1;
      const leaf = root.querySelector<HTMLElement>("[data-logo-leaf]");
      leaf?.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        {
          duration: 640,
          easing: "cubic-bezier(.34,1.56,.64,1)",
        }
      );
      if (logoN >= 7) {
        showToast("you really like ivy, huh?");
        spawnLeafRain(14);
        logoN = 0;
      }
    });
  });

  // ---------- d20 roll ----------
  function rollD20(el: HTMLElement) {
    const state = el as HTMLElement & { _rolling?: boolean };
    if (state._rolling) return;
    state._rolling = true;
    const iv = setInterval(() => {
      el.textContent = `// rolling… ${1 + Math.floor(Math.random() * 20)}`;
    }, 70);
    setTimeout(() => {
      clearInterval(iv);
      const r = 1 + Math.floor(Math.random() * 20);
      if (r === 20) {
        el.textContent = "// NAT 20 - critical hit";
        spawnLeafRain(28);
        showToast("NATURAL 20 - critical hit");
      } else if (r === 1) {
        el.textContent = "// natural 1… click to reroll";
      } else {
        el.textContent = `// rolled a ${r} · click to reroll`;
      }
      state._rolling = false;
    }, 760);
  }

  // ---------- table sanctum card : "just one more turn" click gag ----------
  // The prototype defines this joke but never wires a trigger for it, so it
  // rides on the "table & D&D" card's existing open/close click.
  let tableTurns = 0;
  function tableTurn() {
    tableTurns += 1;
    const msgs = [
      "one more turn…",
      "okay, ONE more turn…",
      "(you said that 2 turns ago)",
      "it is somehow 3am now",
    ];
    showToast(msgs[Math.min(tableTurns, msgs.length - 1)]);
    if (tableTurns === 3) showToast("just one more turn, promise");
  }

  // ---------- Sanctum : click a card → it blooms into a 2×2 well (FLIP) ----------
  const cardSel = "[data-sanctum-card]";
  function toggleSanctum(key: string) {
    const before = new Map(
      [...root.querySelectorAll<HTMLElement>(cardSel)].map((c) => [
        c.dataset.sanctumCard,
        c.getBoundingClientRect(),
      ])
    );
    const next = openCard === key ? null : key;
    openCard = next ?? "";

    const cards = [...root.querySelectorAll<HTMLElement>(cardSel)];
    cards.forEach((c) => {
      const on = c.dataset.sanctumCard === next;
      if (on) c.setAttribute("data-open", "");
      else c.removeAttribute("data-open");
      const cue = c.querySelector<HTMLElement>("[data-sanctum-cue]");
      if (cue) cue.textContent = on ? "✕ close" : "⤢ open";
    });

    cards.forEach((c) => {
      const f = before.get(c.dataset.sanctumCard);
      if (!f) return;
      const l = c.getBoundingClientRect();
      const dx = f.left - l.left;
      const dy = f.top - l.top;
      const sx = f.width / l.width;
      const sy = f.height / l.height;
      if (
        Math.abs(dx) < 0.5 &&
        Math.abs(dy) < 0.5 &&
        Math.abs(sx - 1) < 0.01 &&
        Math.abs(sy - 1) < 0.01
      )
        return;
      const active = c.dataset.sanctumCard === next;
      c.style.transition = "none";
      c.style.transformOrigin = "top left";
      c.style.transform = active
        ? `translate(${dx}px,${dy}px)`
        : `translate(${dx}px,${dy}px) scale(${sx},${sy})`;
    });
    void root.offsetWidth;
    cards.forEach((c) => {
      if (!before.has(c.dataset.sanctumCard)) return;
      c.style.transition = "transform .55s cubic-bezier(.22,1,.36,1)";
      c.style.transform = "";
    });
    setTimeout(() => {
      cards.forEach((c) => {
        c.style.transition = "";
        c.style.transform = "";
        c.style.transformOrigin = "";
      });
    }, 640);
  }

  root.querySelectorAll<HTMLElement>(cardSel).forEach((card) => {
    const key = card.dataset.sanctumCard as string;
    const id = card.querySelector<HTMLElement>("[data-sanctum-toggle]");
    id?.addEventListener("click", () => toggleSanctum(key));
    if (key === "table") id?.addEventListener("click", () => tableTurn());
    if (card.hasAttribute("data-roll")) {
      const meta = card.querySelector<HTMLElement>("[data-sanctum-meta]");
      meta?.addEventListener("click", (e) => {
        e.stopPropagation();
        rollD20(meta);
      });
    }
  });

  // ---------- Konami code ----------
  let konami: string[] = [];
  const seq = [
    "arrowup",
    "arrowup",
    "arrowdown",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "arrowleft",
    "arrowright",
    "b",
    "a",
  ];
  window.addEventListener("keydown", (e) => {
    konami.push((e.key || "").toLowerCase());
    if (konami.length > seq.length) konami.shift();
    if (konami.length === seq.length && seq.every((k, i) => konami[i] === k)) {
      konami = [];
      spawnLeafRain(44);
      showToast("KONAMI - secret garden unlocked");
    }
  });

  // ---------- swipe navigation (mobile / tablet only) ----------
  // Only a deliberate horizontal drag advances; a tap or vertical scroll never does.
  const stage = root.querySelector<HTMLElement>("[data-stage]");
  if (stage) {
    let touch: { x: number; y: number; t: number; lock: number } | null = null;
    stage.addEventListener(
      "touchstart",
      (e) => {
        if (layout === "desktop") {
          touch = null;
          return;
        }
        const target = e.target as HTMLElement;
        if (
          target.closest?.(
            "[data-bottomnav],[data-nav-sheet],button,a,input,textarea,[data-sanctum-card]"
          )
        ) {
          touch = null;
          return;
        }
        const t = e.touches[0];
        touch = { x: t.clientX, y: t.clientY, t: Date.now(), lock: 0 }; // lock: 0 undecided, 1 horizontal, -1 vertical
      },
      { passive: true }
    );
    stage.addEventListener(
      "touchmove",
      (e) => {
        if (!touch) return;
        const t = e.touches[0];
        const dx = t.clientX - touch.x;
        const dy = t.clientY - touch.y;
        if (touch.lock === 0 && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) {
          touch.lock = Math.abs(dx) > Math.abs(dy) ? 1 : -1;
        }
      },
      { passive: true }
    );
    stage.addEventListener(
      "touchend",
      (e) => {
        const s = touch;
        touch = null;
        if (!s || layout === "desktop" || s.lock !== 1) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - s.x;
        if (Date.now() - s.t > 800 || Math.abs(dx) < 60) return;
        step(dx < 0 ? 1 : -1);
      },
      { passive: true }
    );
  }

  // ---------- boot ----------
  applySection(section);
  window.addEventListener("resize", () => {
    layout = detectLayout();
    if (layout === "desktop") closeSheet(); // the sheet is a mobile/tablet affordance
  });
}
