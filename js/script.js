"use strict";
/* Portfolio: filterable Grid (drag to explore) and Index (cursor preview), plus an in-page live viewer. */

const CATS = { 
  web: "Websites", 
  figma: "Figma", 
  print: "Print", 
  restoration: "Restoration" 
};

const fig = (id, slug, node) => `https://www.figma.com/design/${id}/${slug}?node-id=${node}`;

/* One entry per work. Optional `cover: "assets/covers/<id>.jpg"` sets its own thumbnail; otherwise the default SVG is used. */
const PROJECTS = [
  { id: "diary", t: "My Diary", c: "web", y: 2026, k: "site", u: "https://mydiary-project.onrender.com"},
  { id: "shine", t: "ShineAuto", c: "web", y: 2024, k: "site", u: "https://iuliaroshior.github.io/CarWash/" },
  { id: "mood", t: "Mood Calendar", c: "web", y: 2026, k: "site", u: "https://iuliaroshior.github.io/MoodCalendar/" },
  { id: "atelier", t: "Atelier Épur", c: "web", y: 2026, k: "site", u: "https://iuliaroshior.github.io/shopifyFrance/" },
  { id: "bloom", t: "Bloom & Co.", c: "web", y: 2025, k: "site", u: "https://iuliaroshior.github.io/BloomFlowerShop/" },
  { id: "todo", t: "To Do List", c: "web", y: 2023, k: "site", u: "https://iuliaroshior.github.io/JS_Individual_work/" },
  { id: "diary-ui", t: "My Diary UI", c: "figma", y: 2026, k: "figma", u: fig("0vRhFU2eazqTAlR0LOYsiQ", "My-Diary-%7C-Task-Dashboard-%C2%B7-Desktop---Mobile", "0-1") },
  { id: "shine-ui", t: "ShineAuto UI", c: "figma", y: 2024, k: "figma", u: fig("wRq4ayyEkqPUXJiH55osvN", "ShineAuto-%7C-Premium-Car-Wash-%E2%80%94-Responsive-Landing-Page", "0-1") },
  { id: "mood-ui", t: "Mood Calendar UI", c: "figma", y: 2026, k: "figma", u: fig("6PglL6cYKzYGQQTt6wCVKl", "Mood-Calendar-%7C-Responsive-UI", "0-1") },
  { id: "atelier-ui", t: "Atelier Épur UI", c: "figma", y: 2026, k: "figma", u: fig("DYjAKQcfPbfUq1qBpAiMKM", "Atelier_Epur", "0-1") },
  { id: "bloom-ui", t: "Bloom & Co. UI", c: "figma", y: 2025, k: "figma", u: fig("pw8iR0tRcEjNH3IVNbbBzU", "Bloom---Co.-%E2%80%94-Flower-Boutique-%7C-Desktop---Mobile-UI", "0-1") },
  { id: "oasis", t: "Oasis Stays", c: "figma", y: 2023, k: "figma", u: fig("OJunMR0UjVBQmg65RvuyDl", "Oasis-Stays-%E2%80%94-Short-Term-Rental-Website-Wireframes", "0-1") },
  { id: "bus", t: "BusGo", c: "figma", y: 2026, k: "figma", u: fig("ILhD3aRM60nbERjDLAEweW", "%D0%92%D0%B0%D1%80%D0%B8%D0%B0%D0%BD%D1%82-%E2%84%965-%E2%80%94-%D0%9F%D0%BE%D0%BA%D1%83%D0%BF%D0%BA%D0%B0-%D0%B1%D0%B8%D0%BB%D0%B5%D1%82%D0%B0-%D0%BD%D0%B0-%D0%B0%D0%B2%D1%82%D0%BE%D0%B1%D1%83%D1%81", "0-1") },
  { id: "aura", t: "AURA travel", c: "print", y: 2026, k: "pdf", u: "assets/pdf/AURA_Travel.pdf" },
  { id: "cream", t: "VERA", c: "print", y: 2026, k: "pdf", u: "assets/pdf/creamAdvertisement.PDF" }
];

const $ = (id) => document.getElementById(id);
const grid = $("grid"), index = $("index"), peek = $("peek"), viewer = $("viewer");
const state = { 

  cat: "all",
  view: "grid", 
  current: -1 

};

function el(tag, cls, text) {

  const node = document.createElement(tag);

  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text; // textContent only: never innerHTML

  return node;
}

const visible = () => PROJECTS.filter((p) => state.cat === "all" || p.c === state.cat);
const pad = (n) => String(n + 1).padStart(2, "0");

const DEFAULT_COVER = "assets/rose-curve.svg"; // relative to index.html

/* Thumbnail for a work: its own `cover` image, or the default SVG. */
function thumb(p) {

  if (p.canvas) return p.canvas;

  const img = el("img");
  img.src = p.cover || DEFAULT_COVER; 
  img.alt = ""; 
  img.width = 400; 
  img.height = 500;
  img.decoding = "async"; 
  img.draggable = false;

  p.canvas = img;

  return img;
}

/* ---------- Rendering ---------- */
function tile(p, i) {
 
  const li = el("li"), b = el("button", "tile");
  b.type = "button";
  b.append(thumb(p), el("span", "ti", p.t), el("span", "ca", CATS[p.c]));
  b.addEventListener("click", () => { if (!didDrag) openViewer(p); });
  li.append(b);

  return li;
}

function row(p, i) {

  const li = el("li"), b = el("button", "row");

  b.type = "button";
  b.append(el("span", "t", p.t), el("span", "c", CATS[p.c]), el("span", "y", String(p.y)));
  b.addEventListener("click", () => openViewer(p));
  b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") showPeek(p, e); });
  b.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") movePeek(e); });
  b.addEventListener("pointerleave", () => peek.classList.remove("on"));
  li.append(b);

  return li;
}

function render() {

  const list = visible();

  grid.replaceChildren(...list.map(tile));
  index.replaceChildren(...list.map(row));
  grid.hidden = state.view !== "grid";
  $("gallery").hidden = state.view !== "grid";
  index.hidden = state.view !== "index";
  $("count").textContent = `${list.length} ${list.length === 1 ? "work" : "works"}`;
  $("hint").textContent = state.view === "grid" ? "Drag to explore, click to preview" : "Hover for a preview, click to open";
}

function setPressed(groupId, attr, value) {
  $(groupId).querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === value)));
}

$("filters").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  state.cat = b.dataset.cat; setPressed("filters", "cat", state.cat); grid.scrollLeft = 0; render();
});

$("views").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  state.view = b.dataset.view; setPressed("views", "view", state.view); render();
});

/* ---------- Drag to explore (mouse); touch and keyboard use native scrolling ---------- */
let didDrag = false;

grid.addEventListener("pointerdown", (e) => {

  if (e.pointerType !== "mouse" || e.button !== 0) return;
  const startX = e.clientX, startLeft = grid.scrollLeft;
  didDrag = false;
  const move = (m) => {

    const dx = m.clientX - startX;
    if (Math.abs(dx) > 5) {

      didDrag = true; 
      grid.classList.add("dragging");
      
    }

    grid.scrollLeft = startLeft - dx;

  };

  const up = () => {

    grid.classList.remove("dragging");
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    setTimeout(() => { didDrag = false; }, 0); // lets the click handler see the flag first
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);

});

/* ---------- Index hover preview ---------- */
function showPeek(p, e) { 

  peek.src = thumb(p).src; 
  peek.classList.add("on"); 
  movePeek(e); 

}
function movePeek(e) { 

  peek.style.transform = `translate(${Math.min(e.clientX + 24, innerWidth - 200)}px, ${Math.min(e.clientY - 110, innerHeight - 245)}px)`; 

}

/* ---------- Viewer: loads an iframe only when a work is opened ---------- */
function compare(p) {

  const box = el("div", "compare"), after = el("img"), before = el("img", "before"), range = el("input");

  after.src = p.after; 
  after.alt = "Restored photograph";
  before.src = p.before; 
  before.alt = "Original photograph";
  range.type = "range"; 
  range.min = 0; 
  range.max = 100; 
  range.value = 50;

  range.setAttribute("aria-label", "Reveal the original photograph");

  const update = () => { box.style.setProperty("--split", `${range.value}%`); range.setAttribute("aria-valuetext", `${range.value}% of the original visible`); };
  range.addEventListener("input", update); update();
  box.append(after, before, range);

  return box;
}

function openViewer(p) {

  const list = visible(); 
  state.current = list.indexOf(p);

  $("v-meta").textContent = `${CATS[p.c]} · ${p.y}`;
  $("v-title").textContent = p.t;

  const open = $("v-open");

  $("v-body").classList.remove("is-mobile");
  $("v-devices").hidden = p.k !== "site";  
  $("v-desktop").setAttribute("aria-pressed", "true");
  $("v-mobile").setAttribute("aria-pressed", "false");

  open.style.display = p.c === "restoration" ? "none" : "";

  if (p.k === "compare") { 
    open.hidden = true; 
    $("v-body").replaceChildren(compare(p)); 
  }
  else {
    open.hidden = false; open.href = p.u;

    const f = el("iframe");

    f.title = `Preview of ${p.t}`; f.referrerPolicy = "no-referrer";

    if (p.k !== "pdf") f.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups"; // PDFs need the browser viewer
    f.src = p.k === "figma" ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(p.u)}` : p.u;
    $("v-body").replaceChildren(f);
  }

  if (!viewer.open) viewer.showModal();
}
function step(d) { 

  const l = visible(); 

  openViewer(l[(state.current + d + l.length) % l.length]); 
}

$("v-prev").addEventListener("click", () => step(-1));
$("v-next").addEventListener("click", () => step(1));
$("v-close").addEventListener("click", () => viewer.close());

viewer.addEventListener("close", () => $("v-body").replaceChildren()); // unload the preview

viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); }); // backdrop click

/* ---------- Restoration: auto-detect assets/restoration/{Before,After}/N.ext ---------- */

const probe = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(u); i.onerror = () => res(null); i.src = u; });

async function find(folder, n) {

  for (const ext of ["jpg", "jpeg", "png", "webp"]) { 
    const u = await probe(`assets/restoration/${folder}/${n}.${ext}`); if (u) return u; 
  }

  return null;
}

async function loadRestorations() {
  let missing = 0;
  for (let n = 1; n <= 100 && missing < 3; n++) {
    const [before, after] = await Promise.all(
      [
        find("Before", n), 

        find("After", n)
      ]
    );
    if (!before || !after) {
       
      missing++; 

       continue; 

      }
    missing = 0;
    PROJECTS.push(
      {

        id: `rest${n}`, 
        t: `Restored photograph ${n}`, 
        c: "restoration", 
        y: 2025, 
        k: "compare", 
        before, after, cover: after });

  }

  render();

}

render();

loadRestorations().catch(() => {});

/* ---------- Smooth appearance of website elements ---------- */
(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

        return;
    }

    const selector = [

        "header",
        "main h1",
        "main h2",
        "main h3",
        "main p",
        "main .tile",
        "main .row",
        "#filters",
        "#views",
        "footer"

    ].join(", ");

    const prepared = new WeakSet();

    const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle(
            "reveal-pending",
            !entry.isIntersecting);
    });
}, {
    threshold: 0,
    rootMargin: "0px 0px -20px 0px"
});
    function prepareElements() {
        document.querySelectorAll(selector).forEach((element) => {
            if (prepared.has(element)) return;

            prepared.add(element);
            element.classList.add("reveal", "reveal-pending");

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!element.isConnected) return;

                    element.classList.add("reveal-ready");
                    observer.observe(element);
                });
            });
        });
    }

    prepareElements();

    const mutations = new MutationObserver(prepareElements);

    mutations.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

/* ---------- Desktop / Mobile preview ---------- */
function setPreviewSize(isMobile) {
    $("v-body").classList.toggle("is-mobile", isMobile);

    $("v-desktop").setAttribute(
        "aria-pressed",
        String(!isMobile)
    );

    $("v-mobile").setAttribute(
        "aria-pressed",
        String(isMobile)
    );
}

$("v-desktop").addEventListener("click", () => {
    setPreviewSize(false);
});

$("v-mobile").addEventListener("click", () => {
    setPreviewSize(true);
});

/* ---------- Gallery arrows ---------- */
(() => {
    const prev = $("grid-prev");
    const next = $("grid-next");

    function updateArrows() {
        const maxScroll = grid.scrollWidth - grid.clientWidth;

        prev.disabled = grid.scrollLeft <= 2;
        next.disabled = grid.scrollLeft >= maxScroll - 2;
    }

    function moveGallery(direction) {
        const card = grid.querySelector("li");
        if (!card) return;

        const gap = parseFloat(getComputedStyle(grid).gap) || 0;
        const distance = card.getBoundingClientRect().width + gap;

        grid.scrollBy({
            left: direction * distance,
            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth"
        });
    }

    prev.addEventListener("click", () => moveGallery(-1));
    next.addEventListener("click", () => moveGallery(1));

    grid.addEventListener("scroll", updateArrows, {
        passive: true
    });

    const resizeObserver = new ResizeObserver(updateArrows);
    resizeObserver.observe(grid);

    const contentObserver = new MutationObserver(() => {
        requestAnimationFrame(updateArrows);
    });

    contentObserver.observe(grid, {
        childList: true
    });

    updateArrows();
})();