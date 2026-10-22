/* ==========================================================
   EZ Media — скрипты
   ========================================================== */

const TELEGRAM_URL = "https://t.me/ezmedias";

document.documentElement.classList.add("js");

// 1. Все Telegram-ссылки (элементы с атрибутом data-tg)
document.querySelectorAll("[data-tg]").forEach((link) => {
  link.href = TELEGRAM_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

// 2. Аккордеон
const accordions = document.querySelectorAll("[data-acc]");

accordions.forEach((acc) => {
  const button = acc.querySelector(".acc__btn");
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    acc.classList.toggle("is-open", !open);
  });
});

// Управление стрелками, Home и End между заголовками вкладок
const accButtons = Array.from(document.querySelectorAll(".acc__btn"));
accButtons.forEach((button, i) => {
  button.addEventListener("keydown", (e) => {
    let next = null;
    if (e.key === "ArrowDown") next = accButtons[(i + 1) % accButtons.length];
    if (e.key === "ArrowUp") next = accButtons[(i - 1 + accButtons.length) % accButtons.length];
    if (e.key === "Home") next = accButtons[0];
    if (e.key === "End") next = accButtons[accButtons.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  });
});

// 3. Плавное появление блоков при прокрутке
const revealTargets = document.querySelectorAll(".section__head, .accordion, .about__text, .principles li, .cta");
revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

// 4. Текущий год в подвале
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// 5. Мобильное меню
const burger = document.querySelector(".burger");
const nav = document.getElementById("nav");
if (burger && nav) {
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    nav.classList.toggle("is-open", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 721px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
}
