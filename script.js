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

  // Turn the original one-page prototype navigation into a multi-page site.
  if (!document.body.classList.contains("inner-page") && nav) {
    const destinations = ["services.html", "programs.html", "repair-vs-replace.html", "why-gie.html"];
    [...nav.querySelectorAll("a")].forEach((link, index) => {
      if (destinations[index]) link.href = destinations[index];
    });
    const navCta = document.querySelector(".nav-cta");
    if (navCta) navCta.href = "contact.html";
  }
})();

// Concept journey uses the existing script owner; old page selectors stay unchanged.
(() => {
  if (!document.body.classList.contains('concept-site')) return;
  document.body.classList.add('is-enhanced');
  const toggle = document.querySelector('.c-menu-toggle');
  const nav = document.querySelector('.c-nav');
  function setMenu(open, returnFocus = false) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true); });
  const desktop = matchMedia('(min-width:900px)');
  desktop.addEventListener('change', () => setMenu(false));
  const serviceData = {
    automation: {title:'Automation & control', description:'Clarify control requirements, equipment interfaces and test expectations before a project starts.', inputs:['Equipment and process overview','Existing control system, if known','Production and access constraints'], outputs:['Control scope and system boundaries','Interface and responsibility checklist','Test criteria and handover outline']},
    integration: {title:'System integration', description:'Make the interfaces between equipment, systems and project partners explicit.', inputs:['Systems that need to exchange information','Available interface documentation','Dependencies and responsibility boundaries'], outputs:['Interface and ownership map','Integration requirements and dependencies','Coordination and handover checklist']},
    modernization: {title:'Modernization', description:'Plan the next change around the equipment and constraints already in place.', inputs:['Current equipment and documentation','Known reliability or maintainability concerns','Access windows and production constraints'], outputs:['Current-system assessment outline','Staged migration and dependency roadmap','Verification and documentation plan']}
  };
  const requested = new URLSearchParams(location.search).get('service');
  const validService = Object.hasOwn(serviceData, requested) ? requested : null;
  const serviceTitle = document.getElementById('service-title');
  if (serviceTitle) {
    const chosen = validService || 'automation'; const data = serviceData[chosen];
    serviceTitle.textContent = data.title;
    document.getElementById('service-description').textContent = data.description;
    for (const key of ['inputs','outputs']) {
      document.getElementById('service-'+key).replaceChildren(...data[key].map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    }
    document.querySelector('[data-service="'+chosen+'"]').setAttribute('aria-current','true');
    document.getElementById('service-cta').href = 'contact.html?service='+chosen;
  }
  const form = document.getElementById('brief-form');
  if (!form) return;
  document.getElementById('details-fields').disabled = false;
  const service = document.getElementById('service');
  service.value = validService || 'unsure';
  const summary = document.getElementById('error-summary');
  const review = document.getElementById('review-panel');
  const success = document.getElementById('success-panel');
  function showStage(stage) {
    form.hidden = stage !== 'details'; review.hidden = stage !== 'review'; success.hidden = stage !== 'success';
    summary.hidden = true;
    document.getElementById('progress-details').toggleAttribute('aria-current', stage === 'details');
    document.getElementById('progress-review').toggleAttribute('aria-current', stage !== 'details');
    document.querySelector('.c-progress [aria-current]').setAttribute('aria-current','step');
    const target = stage === 'details' ? service : document.getElementById(stage === 'review' ? 'review-title' : 'success-title');
    target.focus();
  }
  function data() {
    return { 'Project type':serviceData[service.value]?.title || 'Not sure yet', 'What needs to change':document.getElementById('scope').value.trim(), Company:document.getElementById('company').value.trim() || 'Not provided', 'Work email':document.getElementById('email').value.trim(), 'Timing or constraints':document.getElementById('timing').value.trim() || 'Not provided' };
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); const errors = [];
    for (const id of ['scope','email']) {
      const input = document.getElementById(id); let message = '';
      if (id === 'scope' && input.value.trim().length < 10) message = 'Describe the change in at least 10 characters.';
      if (id === 'email' && (!input.value.trim() || !input.validity.valid)) message = 'Enter a valid email address.';
      input.setAttribute('aria-invalid', String(Boolean(message)));
      const error = document.getElementById(id+'-error'); error.hidden = !message; error.textContent = message;
      if (message) errors.push({id,message});
    }
    if (errors.length) {
      document.getElementById('error-links').replaceChildren(...errors.map(({id,message}) => { const li=document.createElement('li'); const a=document.createElement('a'); a.href='#'+id; a.textContent=message; a.addEventListener('click', event=>{event.preventDefault();document.getElementById(id).focus();});li.append(a);return li; }));
      summary.hidden=false; summary.focus(); return;
    }
    const rows=[];
    for (const [key,value] of Object.entries(data())) { const dt=document.createElement('dt');dt.textContent=key; const dd=document.createElement('dd');dd.textContent=value;rows.push(dt,dd); }
    document.getElementById('review-values').replaceChildren(...rows);showStage('review');
  });
  document.getElementById('edit-brief').addEventListener('click',()=>showStage('details'));
  document.getElementById('revise-brief').addEventListener('click',()=>showStage('details'));
  document.getElementById('prepare-brief').addEventListener('click',()=>showStage('success'));
  document.getElementById('download-brief').addEventListener('click',()=>{
    const text='G.I.E CONCEPT - LOCAL PROJECT BRIEF\nNo request was sent.\n\n'+Object.entries(data()).map(([key,value])=>key+':\n'+value).join('\n\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='gie-project-brief.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();
