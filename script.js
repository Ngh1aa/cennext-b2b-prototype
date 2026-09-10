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

  // HD photography replacement. The previous GIE assets used *-thumb.jpg files
  // and were being stretched far beyond their native size, which caused blur.
  const photos = {
    hero: {
      image: "https://images.unsplash.com/photo-1776090188275-72957bae4ed7?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      source: "https://unsplash.com/photos/industrial-factory-interior-with-large-machinery-and-overhead-lighting-cdBOHC22CU4",
      label: "Photo · LISK OBE / Unsplash ↗"
    },
    failure: {
      image: "https://images.unsplash.com/photo-1772588063102-eed5af095b9e?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      source: "https://unsplash.com/photos/several-old-dusty-electric-motors-piled-together-nq27Foc7OqY",
      label: "Electric motors · MChe Lee / Unsplash ↗"
    },
    workshop: {
      image: "https://images.unsplash.com/photo-1645258044234-f4ba2655baf1?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      source: "https://unsplash.com/photos/a-man-working-on-a-machine-in-a-factory-0-8N8xSzlVo",
      label: "Workshop · Mick Henson / Unsplash ↗"
    },
    technician: {
      image: "https://images.pexels.com/photos/32208781/pexels-photo-32208781/free-photo-of-technician-repairing-industrial-machine-equipment.jpeg?auto=compress&dpr=1&h=750&w=1260",
      source: "https://www.pexels.com/photo/technician-repairing-industrial-machine-equipment-32208781/",
      label: "Technician · Bulat843 / Pexels ↗"
    },
    repair: {
      image: "https://images.pexels.com/photos/33118657/pexels-photo-33118657/free-photo-of-technician-repairing-machine-in-workshop.jpeg?auto=compress&dpr=1&h=750&w=1260",
      source: "https://www.pexels.com/photo/technician-repairing-machine-in-workshop-33118657/",
      label: "Repair work · Bulat843 / Pexels ↗"
    },
    factory: {
      image: "https://images.unsplash.com/photo-1777464375799-768774f30542?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      source: "https://unsplash.com/photos/industrial-factory-interior-with-machinery-and-equipment-J5DO_DiE3IY",
      label: "Factory floor · Aditi Toys / Unsplash ↗"
    },
    motor: {
      image: "https://images.unsplash.com/photo-1700727448550-c1af9cf9acc7?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      source: "https://unsplash.com/photos/a-man-working-on-a-machine-in-a-factory--TZcFPh253w",
      label: "Motor assembly · TruckRun / Unsplash ↗"
    }
  };

  const setPhoto = (selector, photo) => {
    const img = document.querySelector(`${selector} img`);
    const credit = document.querySelector(`${selector} .photo-credit`);
    if (img) {
      img.src = photo.image;
      img.removeAttribute("srcset");
      img.decoding = "async";
    }
    if (credit) {
      credit.href = photo.source;
      credit.textContent = photo.label;
    }
  };

  const hero = document.querySelector(".hero");
  if (hero) hero.style.backgroundImage = `url("${photos.hero.image}")`;
  const heroCredit = document.querySelector(".photo-credit--hero");
  if (heroCredit) {
    heroCredit.href = photos.hero.source;
    heroCredit.textContent = photos.hero.label;
  }

  setPhoto(".about-section__media .section-photo:first-child", photos.failure);
  setPhoto(".services-gallery .media-card:nth-child(1)", photos.workshop);
  setPhoto(".services-gallery .media-card:nth-child(2)", photos.technician);
  setPhoto(".services-gallery .media-card:nth-child(3)", photos.repair);
  setPhoto(".program-photo", photos.factory);
  setPhoto(".warning-section__visual", photos.repair);
  setPhoto(".compare-photo", photos.motor);

  const sourceNote = document.querySelector(".photo-source-note");
  if (sourceNote) {
    sourceNote.innerHTML = 'High-resolution photography sourced from <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">Unsplash</a> and <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">Pexels</a>.';
  }
})();
