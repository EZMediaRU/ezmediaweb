/* ==========================================================
   EZ Media — страница портфолио
   Количество и формат работ задаются в portfolio/config.js
   ========================================================== */
(function () {
  "use strict";

  const BASE = "portfolio";
  const cfg = typeof PORTFOLIO_CONFIG !== "undefined" ? PORTFOLIO_CONFIG : {};

  // Список работ: [{ n: 1, files: ["portfolio/video/video1.mp4", ...] }]
  function buildWorks(type) {
    const c = cfg[type] || {};
    const count = Math.max(0, parseInt(c.count, 10) || 0);
    const ext = String(c.ext || (type === "video" ? "mp4" : "jpg")).replace(/^\./, "");
    const subs = c.subs || {};
    const works = [];
    for (let n = 1; n <= count; n++) {
      const files = [`${BASE}/${type}/${type}${n}.${ext}`];
      const extra = Math.max(0, parseInt(subs[n], 10) || 0);
      for (let m = 1; m <= extra; m++) files.push(`${BASE}/${type}/${type}${n}.${m}.${ext}`);
      works.push({ n, files });
    }
    return works;
  }

  const lazyVideos = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const v = entry.target;
          v.src = v.dataset.src + "#t=0.001"; // показать первый кадр
          v.preload = "metadata";
          lazyVideos.unobserve(v);
        });
      }, { rootMargin: "300px" })
    : null;

  function missing(item, path) {
    item.textContent = "";
    const note = document.createElement("p");
    note.className = "missing";
    note.textContent = "Файл не найден: " + path;
    item.appendChild(note);
  }

  function makeItem(type, file, n) {
    const item = document.createElement("div");
    item.className = "work__item";

    if (type === "video") {
      const v = document.createElement("video");
      v.controls = true;
      v.playsInline = true;
      v.preload = "none";
      v.setAttribute("aria-label", "Проект " + n);
      v.dataset.src = file;
      v.addEventListener("error", () => missing(item, file));
      if (lazyVideos) lazyVideos.observe(v);
      else v.src = file;
      item.appendChild(v);
    } else {
      const a = document.createElement("a");
      a.href = file;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", "Открыть проект " + n + " в полном размере");
      const img = document.createElement("img");
      img.src = file;
      img.alt = "Web-проект " + n;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => missing(item, file));
      a.appendChild(img);
      item.appendChild(a);
    }
    return item;
  }

  function makeCard(type, work) {
    const card = document.createElement("article");
    card.className = "work";

    const media = document.createElement("div");
    media.className = "work__media";
    work.files.forEach((f) => media.appendChild(makeItem(type, f, work.n)));

    const meta = document.createElement("div");
    meta.className = "work__meta";
    const title = document.createElement("strong");
    title.textContent = "Проект " + work.n;
    meta.appendChild(title);

    if (work.files.length > 1) {
      media.tabIndex = 0;
      media.setAttribute("role", "group");
      media.setAttribute("aria-label", "Проект " + work.n + ": материалы, листайте вбок");
      const counter = document.createElement("span");
      counter.className = "work__count";
      counter.textContent = "1 / " + work.files.length;
      meta.appendChild(counter);
      media.addEventListener("scroll", () => {
        const i = Math.round(media.scrollLeft / media.clientWidth) + 1;
        counter.textContent = i + " / " + work.files.length;
      }, { passive: true });
    }

    card.append(media, meta);
    return card;
  }

  function render(panel) {
    const type = panel.dataset.type;
    const works = buildWorks(type);
    if (!works.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Здесь скоро появятся примеры работ.";
      panel.classList.add("works--empty");
      panel.appendChild(empty);
      return;
    }
    works.forEach((w) => panel.appendChild(makeCard(type, w)));
  }

  document.querySelectorAll(".works").forEach(render);

  // Вкладки «Монтаж» / «Web»
  const tabs = Array.from(document.querySelectorAll(".tab"));

  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      if (!on) panel.querySelectorAll("video").forEach((v) => v.pause());
    });
    if (focus) tab.focus();
    if (history.replaceState) history.replaceState(null, "", "#" + tab.dataset.type);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  // Открытие нужной вкладки по ссылке portfolio.html#web
  const fromHash = tabs.find((t) => "#" + t.dataset.type === location.hash);
  if (fromHash) selectTab(fromHash, false);
})();
