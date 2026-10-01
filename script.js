const $ = (s) => document.querySelector(s);
const PAL = [
  ["#ff6b6b", "#feca57", "#1b1464"],
  ["#00c2a8", "#0b3d5c", "#f4e285"],
  ["#7b2ff7", "#f107a3", "#ffd6a5"],
  ["#2d6a4f", "#95d5b2", "#fefae0"],
  ["#ff9a3c", "#3a0ca3", "#fcd5ce"],
  ["#1d3557", "#a8dadc", "#e63946"],
];
const rng = (s) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function art(it) {
  const r = rng(it.seed * 7919),
    p = PAL[it.seed % PAL.length],
    W = 600,
    H = it.h;
  let g = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>`;
  if (it.cat === "Waves") {
    for (let i = 0; i < 7; i++) {
      const y = H * (0.2 + i * 0.12),
        a = 15 + r() * 40,
        f = 1 + r() * 2,
        ph = r() * 6;
      let d = `M0 ${H}L0 ${y}`;
      for (let x = 0; x <= W; x += 20)
        d += `L${x} ${(y + Math.sin((x / W) * f * 6.28 + ph) * a).toFixed(1)}`;
      g += `<path d="${d}L${W} ${H}Z" fill="${p[i % 3]}" opacity="${(0.3 + i * 0.09).toFixed(2)}"/>`;
    }
  } else if (it.cat === "Dunes") {
    g += `<circle cx="${W * (0.25 + r() * 0.5)}" cy="${H * 0.3}" r="${50 + r() * 50}" fill="${p[2]}" opacity=".9"/>`;
    for (let i = 0; i < 5; i++) {
      const y = H * (0.5 + i * 0.1),
        a = 30 + r() * 50;
      g += `<path d="M0 ${H}L0 ${y}C${W * 0.3} ${y - a} ${W * 0.6} ${y + a} ${W} ${y - a / 2}L${W} ${H}Z" fill="${p[(i + 1) % 3]}" opacity="${(0.4 + i * 0.12).toFixed(2)}"/>`;
    }
  } else if (it.cat === "Orbits") {
    const cx = W * (0.3 + r() * 0.4),
      cy = H * (0.3 + r() * 0.4);
    for (let i = 1; i < 9; i++) {
      const rad = i * 38;
      g += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${p[i % 3]}" stroke-width="${1 + r() * 3}" opacity=".7"/>`;
      const a = r() * 6.28;
      g += `<circle cx="${cx + Math.cos(a) * rad}" cy="${cy + Math.sin(a) * rad}" r="${5 + r() * 10}" fill="${p[(i + 1) % 3]}"/>`;
    }
    g += `<circle cx="${cx}" cy="${cy}" r="26" fill="${p[2]}"/>`;
  } else {
    const n = 3,
      s = W / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < Math.floor(H / s); j++) {
        const c = p[Math.floor(r() * 3)],
          t = r();
        g +=
          t < 0.4
            ? `<rect x="${i * s}" y="${j * s}" width="${s}" height="${s}" fill="${c}" opacity=".85"/>`
            : t < 0.7
              ? `<circle cx="${i * s + s / 2}" cy="${j * s + s / 2}" r="${s / 2 - 8}" fill="${c}"/>`
              : `<path d="M${i * s} ${j * s + s}L${i * s + s} ${j * s + s}L${i * s + s} ${j * s}Z" fill="${c}" opacity=".8"/>`;
      }
  }
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`,
    )
  );
}

const names = {
  Waves: ["Low tide", "Salt wind", "Undertow", "Slow swell"],
  Dunes: ["Dry heat", "Last light", "Ridge line", "Sand clock"],
  Orbits: ["Small sun", "Loop", "Satellite", "Halo"],
  Blocks: ["Tile study", "Corner", "Quilt", "Grid noise"],
};
let items = [],
  id = 0;
Object.keys(names).forEach((cat, ci) =>
  names[cat].forEach((t, i) =>
    items.push({
      id: id++,
      title: t,
      cat,
      seed: ci * 4 + i + 1,
      h: [420, 560, 700, 480][(ci + i) % 4],
      src: null,
    }),
  ),
);
items.forEach((it) => (it.src = art(it)));
items = items.sort((a, b) => ((a.seed * 37) % 11) - ((b.seed * 37) % 11));

let favs = new Set();
try {
  favs = new Set(JSON.parse(localStorage.getItem("frames-favs") || "[]"));
} catch (e) {}
const saveFavs = () => {
  try {
    localStorage.setItem("frames-favs", JSON.stringify([...favs]));
  } catch (e) {}
};

let cat = "All",
  query = "",
  sort = "def",
  view = [],
  cur = -1,
  lastFocus = null;
const cats = ["All", ...Object.keys(names), "Mine", "Favorites"];

function renderChips() {
  $("#chips").innerHTML = cats
    .map(
      (c) =>
        `<button class="chip" aria-pressed="${c === cat}" data-c="${c}">${c}</button>`,
    )
    .join("");
}
function filtered() {
  const r = items.filter(
    (it) =>
      (cat === "All" ||
        (cat === "Favorites" ? favs.has(it.id) : it.cat === cat)) &&
      it.title.toLowerCase().includes(query),
  );
  if (sort === "az") r.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "za") r.sort((a, b) => b.title.localeCompare(a.title));
  if (sort === "fav") r.sort((a, b) => favs.has(b.id) - favs.has(a.id));
  return r;
}
function render() {
  view = filtered();
  $("#grid").innerHTML = view
    .map(
      (it, i) =>
        `<figure><button data-i="${i}" aria-label="Open ${it.title}"><img src="${it.src}" alt="${it.title}" loading="lazy"></button><figcaption>${it.title}</figcaption><button class="heart" data-f="${it.id}" aria-pressed="${favs.has(it.id)}" aria-label="Favorite ${it.title}">${favs.has(it.id) ? "♥" : "♡"}</button></figure>`,
    )
    .join("");
  $("#empty").hidden = view.length > 0;
  $("#count").textContent =
    view.length + (view.length === 1 ? " image" : " images");
}
function toggleFav(i) {
  favs.has(i) ? favs.delete(i) : favs.add(i);
  saveFavs();
}

$("#chips").onclick = (e) => {
  const b = e.target.closest("[data-c]");
  if (!b) return;
  cat = b.dataset.c;
  renderChips();
  render();
};
$("#q").oninput = (e) => {
  query = e.target.value.trim().toLowerCase();
  render();
};
$("#grid").onclick = (e) => {
  const h = e.target.closest("[data-f]");
  if (h) {
    toggleFav(+h.dataset.f);
    render();
    return;
  }
  const b = e.target.closest("[data-i]");
  if (b) {
    lastFocus = b;
    open(+b.dataset.i);
  }
};

/* Lightbox */
function open(i) {
  cur = i;
  const it = view[i];
  $("#big").src = it.src;
  $("#big").alt = it.title;
  $("#big").classList.remove("zoom");
  $("#cap").innerHTML =
    `${it.title}<small>${it.cat} · ${i + 1} of ${view.length}</small>`;
  const f = favs.has(it.id);
  $("#lf").textContent = f ? "♥" : "♡";
  $("#lf").setAttribute("aria-pressed", f);
  $("#rm").hidden = it.cat !== "Mine";
  $("#lb").classList.add("on");
  $("#x").focus();
}
function close() {
  play(false);
  $("#lb").classList.remove("on");
  cur = -1;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
const step = (d) => {
  if (view.length) open((cur + d + view.length) % view.length);
};
$("#x").onclick = close;
$("#pv").onclick = () => step(-1);
$("#nx").onclick = () => step(1);
$("#lb").onclick = (e) => {
  if (e.target.id === "lb") close();
};
$("#lf").onclick = () => {
  toggleFav(view[cur].id);
  const id = view[cur].id;
  render();
  cur = view.findIndex((v) => v.id === id);
  open(cur);
};
$("#rm").onclick = () => {
  const id = view[cur].id;
  items = items.filter((it) => it.id !== id);
  favs.delete(id);
  saveFavs();
  render();
  view.length ? open(Math.min(cur, view.length - 1)) : close();
};
document.addEventListener("keydown", (e) => {
  if (cur < 0) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
  if (e.key === "p" || e.key === "P") play(!timer);
});

/* Slideshow, zoom, swipe */
let timer = null;
function play(on) {
  clearInterval(timer);
  timer = null;
  $("#pl").textContent = on ? "❚❚" : "▶";
  $("#pl").setAttribute("aria-pressed", on);
  if (on) timer = setInterval(() => step(1), 3000);
}
$("#pl").onclick = () => play(!timer);
$("#big").onclick = (e) => {
  const im = e.currentTarget,
    z = im.classList.toggle("zoom");
  if (z) {
    const r = im.getBoundingClientRect();
    im.style.transformOrigin =
      ((e.clientX - r.left) / r.width) * 100 +
      "% " +
      ((e.clientY - r.top) / r.height) * 100 +
      "%";
  }
};
let tx = null;
$("#lb").addEventListener(
  "touchstart",
  (e) => {
    tx = e.touches[0].clientX;
  },
  { passive: true },
);
$("#lb").addEventListener("touchend", (e) => {
  if (tx === null) return;
  const dx = e.changedTouches[0].clientX - tx;
  tx = null;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
});

/* Toolbar: sort, size, theme */
$("#sort").onchange = (e) => {
  sort = e.target.value;
  render();
};
$("#size").oninput = (e) => {
  $("#grid").style.columnWidth = e.target.value + "px";
};
$("#theme").onclick = () => {
  const d = document.documentElement,
    dark = d.dataset.theme
      ? d.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme:dark)").matches;
  d.dataset.theme = dark ? "light" : "dark";
};

/* Upload */
function addFiles(files) {
  [...files]
    .filter((f) => f.type.startsWith("image/"))
    .forEach((f) => {
      const r = new FileReader();
      r.onload = () => {
        items.unshift({
          id: id++,
          title: f.name.replace(/\.[^.]+$/, ""),
          cat: "Mine",
          src: r.result,
        });
        render();
      };
      r.readAsDataURL(f);
    });
}
$("#up").onclick = () => $("#file").click();
$("#file").onchange = (e) => {
  addFiles(e.target.files);
  e.target.value = "";
  cat = "Mine";
  renderChips();
};
["dragover", "dragenter"].forEach((t) =>
  addEventListener(t, (e) => {
    e.preventDefault();
    document.body.classList.add("drop");
  }),
);
["dragleave", "drop"].forEach((t) =>
  addEventListener(t, (e) => {
    e.preventDefault();
    document.body.classList.remove("drop");
  }),
);
addEventListener("drop", (e) => {
  if (e.dataTransfer?.files.length) {
    addFiles(e.dataTransfer.files);
    cat = "Mine";
    renderChips();
  }
});

renderChips();
render();
