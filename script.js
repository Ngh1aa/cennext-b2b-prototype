(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav__links");
  const navLinks = [...document.querySelectorAll('.site-nav__links a[href^="#"]')];

  const setMenu = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setMenu(open);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) setMenu(false);
  });

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    }, {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0, 0.15, 0.35, 0.6]
    });

    sections.forEach((section) => observer.observe(section));
  }
})();
