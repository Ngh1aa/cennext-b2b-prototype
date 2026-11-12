/*
 * G.I.E concept prototype: local data store and page workflows.
 * No network requests are made. Everything the visitor enters is kept in
 * sessionStorage for this tab only, seeded from data.js.
 */
(() => {
  'use strict';
  const SEED = window.GIE_SEED;
  if (!SEED) return;

  /* ---------- Store ---------- */
  const KEY = 'gie-demo-state';
  const FLASH_KEY = 'gie-demo-flash';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  let memoryState = null;

  function freshState() {
    return {
      version: SEED.version,
      requests: clone(SEED.requests),
      messages: clone(SEED.messages),
      settings: { failNext: false },
      seq: { rfq: 1003, msg: 1 },
      activeDraftId: '',
      assessment: null
    };
  }
  function readState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY));
      if (saved && saved.version === SEED.version) return saved;
    } catch (error) { if (memoryState) return memoryState; }
    if (memoryState) return memoryState;
    const state = freshState();
    writeState(state);
    return state;
  }
  function writeState(state) {
    memoryState = state;
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (error) { /* memory only */ }
  }
  function update(mutator) {
    const state = readState();
    const result = mutator(state);
    writeState(state);
    return result;
  }
  function resetState() {
    memoryState = null;
    try { sessionStorage.removeItem(KEY); } catch (error) { /* ignore */ }
    writeState(freshState());
  }
  function setFlash(text) { try { sessionStorage.setItem(FLASH_KEY, text); } catch (error) { /* ignore */ } }
  function takeFlash() {
    try { const text = sessionStorage.getItem(FLASH_KEY); sessionStorage.removeItem(FLASH_KEY); return text; } catch (error) { return ''; }
  }

  /* Simulated service call: a short delay, and an optional one-off failure. */
  const LATENCY = 320;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function simulate(work, ms = LATENCY) {
    await wait(ms);
    const shouldFail = update((state) => {
      const fail = Boolean(state.settings.failNext);
      state.settings.failNext = false;
      return fail;
    });
    syncFailToggle();
    if (shouldFail) throw new Error('Simulated connection failure');
    return work();
  }

  /* ---------- Helpers ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const params = new URLSearchParams(location.search);
  const isConcept = document.body.classList.contains('concept-site');
  const page = document.body.dataset.page || '';
  const nowIso = () => new Date().toISOString();
  const serviceById = (id) => SEED.services.find((s) => s.id === id);
  const programById = (id) => SEED.programs.find((p) => p.id === id);
  const serviceTitle = (id) => (id === 'unsure' ? 'Not sure yet' : (serviceById(id)?.title || 'Not chosen'));
  const btnClass = (kind) => isConcept
    ? (kind === 'primary' ? 'c-button' : kind === 'danger' ? 'c-button c-button-danger' : 'c-button c-button-secondary')
    : (kind === 'primary' ? 'btn btn-dark' : kind === 'danger' ? 'btn btn-dark ui-btn-danger' : 'btn ui-btn-ghost');

  function formatDate(iso, withTime = true) {
    if (!iso) return 'Not set';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Not set';
    const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return withTime ? `${day}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : day;
  }
  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  const getPath = (obj, path) => path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  function setPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((acc, key) => (acc[key] ??= {}), obj);
    target[last] = value;
  }

  const STATUS = {
    draft: { label: 'Draft', tone: 'neutral' },
    submitted: { label: 'Submitted', tone: 'ok' },
    'in-review': { label: 'In review', tone: 'info' },
    withdrawn: { label: 'Withdrawn', tone: 'muted' }
  };
  const statusBadge = (status) => `<span class="ui-badge ui-badge--${STATUS[status]?.tone || 'neutral'}">${esc(STATUS[status]?.label || status)}</span>`;

  /* ---------- Shared UI: toast, dialog, states ---------- */
  let toastEl;
  let toastTimer;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ui-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.hidden = true;
      document.body.append(toastEl);
    }
    toastEl.textContent = text;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 5000);
  }

  function confirmDialog({ title, text, confirm, cancel = 'Cancel', danger = false }) {
    return new Promise((resolve) => {
      const dialog = document.createElement('dialog');
      dialog.className = 'ui-dialog';
      dialog.setAttribute('aria-labelledby', 'ui-dialog-title');
      dialog.setAttribute('aria-describedby', 'ui-dialog-text');
      dialog.innerHTML = `<h2 id="ui-dialog-title">${esc(title)}</h2><p id="ui-dialog-text">${esc(text)}</p>
        <div class="ui-actions"><button type="button" class="${btnClass('secondary')}" data-value="cancel">${esc(cancel)}</button>
        <button type="button" class="${btnClass(danger ? 'danger' : 'primary')}" data-value="ok">${esc(confirm)}</button></div>`;
      dialog.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-value]');
        if (button) dialog.close(button.dataset.value);
      });
      dialog.addEventListener('close', () => { resolve(dialog.returnValue === 'ok'); dialog.remove(); });
      document.body.append(dialog);
      dialog.showModal();
      dialog.querySelector('[data-value="cancel"]').focus();
    });
  }

  const loadingState = (label) => `<div class="ui-state ui-state--loading" role="status"><span class="ui-spinner" aria-hidden="true"></span><p>${esc(label)}</p><div class="ui-skeleton" aria-hidden="true"><span></span><span></span><span></span></div></div>`;
  function errorState(container, title, retry) {
    container.innerHTML = `<div class="ui-state ui-state--error" role="alert"><h2>${esc(title)}</h2><p>The prototype simulated a connection failure. Nothing was lost: your data is still in this tab.</p><div class="ui-actions"><button type="button" class="${btnClass('primary')}" data-retry>Try again</button></div></div>`;
    $('[data-retry]', container).addEventListener('click', retry);
    $('[data-retry]', container).focus();
  }
  async function load(container, label, work, render, errorTitle) {
    container.setAttribute('aria-busy', 'true');
    container.innerHTML = loadingState(label);
    try {
      const data = await simulate(work);
      container.removeAttribute('aria-busy');
      render(data);
    } catch (error) {
      container.removeAttribute('aria-busy');
      errorState(container, errorTitle, () => load(container, label, work, render, errorTitle));
    }
  }

  /* ---------- Demo controls (every site page) ---------- */
  function syncFailToggle() {
    const box = $('#demo-fail');
    if (box) box.checked = Boolean(readState().settings.failNext);
  }
  function mountDemoControls() {
    const footer = $('.c-footer') || $('.site-footer');
    if (!footer || $('.ui-demo', footer)) return;
    const wrap = document.createElement('div');
    wrap.className = `ui-demo ${isConcept ? 'c-container' : 'container'}`;
    wrap.innerHTML = `<p><strong>Prototype data.</strong> Requests and messages stay in this browser tab only. Nothing is sent anywhere.</p>
      <label class="ui-check"><input type="checkbox" id="demo-fail"> Simulate a failure on the next request</label>
      <button type="button" class="ui-demo__reset" id="demo-reset">Reset demo data</button>`;
    footer.append(wrap);
    syncFailToggle();
    $('#demo-fail').addEventListener('change', (event) => {
      update((state) => { state.settings.failNext = event.target.checked; });
      toast(event.target.checked ? 'The next request in this prototype will fail once.' : 'Failure simulation is off.');
    });
    $('#demo-reset').addEventListener('click', async () => {
      const ok = await confirmDialog({ title: 'Reset demo data?', text: 'This removes every draft, request and message you created in this tab and restores the example data.', confirm: 'Reset demo data', danger: true });
      if (!ok) return;
      resetState();
      setFlash('Demo data was reset to the original examples.');
      location.reload();
    });
  }

  /* ---------- Request helpers ---------- */
  function blankRequest() {
    return {
      id: '', example: false, status: 'draft', createdAt: '', updatedAt: '', submittedAt: '',
      service: '', program: '', step: 1,
      equipment: { type: '', makeModel: '', quantity: 1, site: '', description: '', constraints: '' },
      schedule: { urgency: '', startDate: '', budget: '', notes: '' },
      attachments: [],
      contact: { name: '', company: '', email: '', phone: '', method: 'Email' },
      assessment: null,
      history: []
    };
  }
  function nextRequestId(state) { const id = `RFQ-${state.seq.rfq}`; state.seq.rfq += 1; return id; }
  function persistNew(request, note = 'Draft started.') {
    return update((state) => {
      request.id = nextRequestId(state);
      request.createdAt = request.updatedAt = nowIso();
      request.history = [{ status: 'draft', at: request.createdAt, note }];
      state.requests.push(clone(request));
      state.activeDraftId = request.id;
      return request.id;
    });
  }
  const findRequest = (id) => readState().requests.find((r) => r.id === id);
  function requestTitle(request) {
    const site = request.equipment?.site || request.equipment?.type || 'Site not set';
    return `${serviceTitle(request.service)}, ${site}`;
  }
  function requestSections(request) {
    const urgency = SEED.options.urgency.find((u) => u.id === request.schedule.urgency);
    return [
      { step: 1, title: 'Service', rows: [['Service', serviceTitle(request.service)], ['Related program', programById(request.program)?.title || 'None']] },
      { step: 2, title: 'Equipment and site', rows: [['Equipment type', request.equipment.type || 'Not provided'], ['Make or model', request.equipment.makeModel || 'Not provided'], ['Quantity', String(request.equipment.quantity || '')], ['Site or area', request.equipment.site || 'Not provided'], ['What needs to change', request.equipment.description || 'Not provided'], ['Site constraints', request.equipment.constraints || 'Not provided']] },
      { step: 3, title: 'Timeline and budget', rows: [['Urgency', urgency ? `${urgency.label}: ${urgency.text}` : 'Not provided'], ['Target start', request.schedule.startDate ? formatDate(request.schedule.startDate, false) : 'Not set'], ['Budget range', request.schedule.budget || 'Not provided'], ['Notes', request.schedule.notes || 'Not provided']] },
      { step: 4, title: 'Attachments', rows: [['Files', request.attachments.length ? request.attachments.map((f) => `${f.name} (${formatBytes(f.size)})`).join('\n') : 'No files added']] },
      { step: 5, title: 'Contact details', rows: [['Name', request.contact.name || 'Not provided'], ['Company', request.contact.company || 'Not provided'], ['Work email', request.contact.email || 'Not provided'], ['Phone', request.contact.phone || 'Not provided'], ['Preferred contact', request.contact.method || 'Email']] }
    ];
  }
  const sectionsHtml = (request, editable) => requestSections(request).map((section) => `
    <section class="ui-review-section" aria-labelledby="review-${section.step}">
      <div class="ui-review-head"><h3 id="review-${section.step}">${esc(section.title)}</h3>${editable ? `<button type="button" class="c-text-button" data-goto="${section.step}">Edit<span class="ui-sr"> ${esc(section.title.toLowerCase())}</span></button>` : ''}</div>
      <dl class="c-review-values">${section.rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    </section>`).join('') + (request.assessment ? `<section class="ui-review-section"><div class="ui-review-head"><h3>Repair or replace screening</h3></div><dl class="c-review-values"><dt>Result</dt><dd>${esc(request.assessment.verdict)}</dd><dt>Answers</dt><dd>${esc(request.assessment.summary)}</dd></dl></section>` : '');

  function downloadText(request) {
    const text = [`G.I.E CONCEPT PROTOTYPE - PROJECT BRIEF ${request.id}`, 'This is a prototype. Nothing was sent to anyone.', '']
      .concat(requestSections(request).flatMap((s) => [`== ${s.title} ==`, ...s.rows.map(([k, v]) => `${k}: ${v}`), '']))
      .join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `gie-brief-${request.id.toLowerCase()}.txt`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- Service detail ---------- */
  function initServiceDetail() {
    const view = $('#service-view');
    const id = params.get('id');
    const render = (service) => {
      if (!service) {
        document.title = 'Service not found | G.I.E Concept';
        view.innerHTML = `<section class="c-container c-section c-detail-intro"><a class="c-breadcrumb" href="services.html">Services /</a><h1>We could not find that service.</h1><p class="c-lead">The link may be out of date${id ? ` (“${esc(id)}”)` : ''}. Choose one of the proposed services below.</p>
          <ul class="ui-link-list">${SEED.services.map((s) => `<li><a href="service.html?id=${s.id}">${esc(s.title)}<span aria-hidden="true">↗</span></a></li>`).join('')}</ul></section>`;
        return;
      }
      document.title = `${service.title} | G.I.E Concept`;
      const programs = service.relatedPrograms.map(programById).filter(Boolean);
      view.innerHTML = `
        <section class="c-container c-section c-detail-intro"><a class="c-breadcrumb" href="services.html">Services /</a><h1>${esc(service.title)}</h1><p class="c-lead">${esc(service.description)}</p>
          <div class="ui-actions"><a class="c-button" href="rfq.html?service=${service.id}">Start a brief for this service <span aria-hidden="true">↗</span></a><a class="c-text-link" href="services.html?service=${service.id}">Compare with other services</a></div></section>
        <section class="c-container c-section c-detail-grid" aria-label="Service detail">
          <div class="c-detail-main">
            <h2>How the scope is built</h2>
            <ol class="c-process">${service.process.map((p, i) => `<li><span class="c-process__no">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></li>`).join('')}</ol>
          </div>
          <aside class="c-scope-document c-detail-aside">
            <h2>Scope at a glance</h2>
            <div class="c-scope-block"><h3>Bring what you know</h3><ul>${service.inputs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
            <div class="c-scope-block"><h3>Proposed deliverables</h3><ul>${service.deliverables.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
            <div class="c-scope-boundary"><h3>Agree before implementation</h3><p>${esc(service.boundaries)}</p></div>
          </aside>
        </section>
        <section class="c-container c-section" aria-labelledby="related-title"><h2 id="related-title">Related programs</h2>
          ${programs.length ? `<div class="c-card-grid">${programs.map((p) => `<a class="c-link-card" href="program.html?id=${p.id}"><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="c-link-card__go">View program <span aria-hidden="true">↗</span></span></a>`).join('')}</div>`
            : `<div class="ui-empty"><h3>No related programs yet</h3><p>This service is usually scoped as a one-off project.</p></div>`}
        </section>
        <section class="c-container c-section c-scope-end"><h2>Ready to describe your project?</h2><p>The brief builder walks you through equipment, timing, attachments and contact details. It is a prototype: nothing is sent.</p><a class="c-button" href="rfq.html?service=${service.id}">Start this brief <span aria-hidden="true">↗</span></a></section>`;
    };
    load(view, 'Loading service…', () => serviceById(id), render, 'We could not load this service.');
  }

  /* ---------- Programs (list + detail, legacy layout) ---------- */
  function initProgramList() {
    const list = $('#program-list');
    if (!list) return;
    load(list, 'Loading programs…', () => SEED.programs, (programs) => {
      list.innerHTML = programs.length
        ? `<div class="fit-grid">${programs.map((p, i) => `<a class="fit-card program-link" href="program.html?id=${p.id}"><div class="micro-label">Program ${String(i + 1).padStart(2, '0')}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="program-link__go">View program <span aria-hidden="true">↗</span></span></a>`).join('')}</div>`
        : `<div class="ui-empty"><h3>No programs listed</h3><p>Programs will appear here when they are defined.</p></div>`;
    }, 'We could not load the programs.');
  }

  function initProgramDetail() {
    const view = $('#program-view');
    const id = params.get('id');
    load(view, 'Loading program…', () => programById(id), (program) => {
      if (!program) {
        document.title = 'Program not found | Gainesville Industrial Electric';
        view.innerHTML = `<section class="inner-section ui-notfound"><div class="container"><div class="kicker">Programs</div><h1>Program not found.</h1><p>The program${id ? ` “${esc(id)}”` : ''} does not exist or the link is out of date.</p><div class="ui-actions"><a class="btn btn-dark" href="programs.html">See all programs <span>↗</span></a></div></div></section>`;
        return;
      }
      document.title = `${program.title} | Gainesville Industrial Electric`;
      const services = program.relatedServices.map(serviceById).filter(Boolean);
      view.innerHTML = `
        <section class="page-hero program-hero"><div class="container page-hero__inner"><div><a class="ui-crumb" href="programs.html">Programs /</a><div class="page-hero__kicker">${esc(program.kicker)}</div><h1>${esc(program.title)}</h1><p class="page-hero__lead">${esc(program.lead)}</p></div><aside class="page-hero__aside"><div class="page-hero__meta">Best fit</div><p>${esc(program.bestFit)}</p></aside></div></section>
        <section class="inner-section inner-section--deep"><div class="container"><div class="section-head"><div><div class="kicker kicker--light">Program flow</div><h2>How the program runs.</h2></div><p>Each stage repeats on a schedule agreed with the plant.</p></div>
          <div class="program-flow">${program.steps.map((s, i) => `<article class="program-card"><span class="step-no">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><strong>${esc(s.outcome)}</strong></article>`).join('')}</div></div></section>
        <section class="inner-section"><div class="container"><div class="section-head"><div><div class="kicker">What it includes</div><h2>Proposed program scope.</h2></div><p>Concept scope for discussion. Final terms would be agreed for each plant.</p></div>
          <div class="fit-grid">${program.includes.map((x) => `<article class="fit-card"><div class="micro-label">${esc(x.label)}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div></div></section>
        <section class="inner-section inner-section--blue"><div class="container feature-split"><div class="feature-split__sticky"><div class="kicker">Is this for your plant?</div><h2>Signals that this program fits.</h2></div>
          <div class="feature-stack">${program.signals.map((s, i) => `<div class="feature-row"><span class="step-no">${'ABC'[i] || i + 1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></div>`).join('')}</div></div></section>
        <section class="inner-section inner-section--paper-deep"><div class="container"><div class="section-head"><div><div class="kicker">Related services</div><h2>Services used in this program.</h2></div></div>
          ${services.length ? `<div class="fit-grid">${services.map((s) => `<a class="fit-card program-link" href="service.html?id=${s.id}"><div class="micro-label">Service</div><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p><span class="program-link__go">View service <span aria-hidden="true">↗</span></span></a>`).join('')}</div>` : '<div class="ui-empty"><h3>No related services</h3><p>This program stands on its own.</p></div>'}</div></section>
        <section class="contact-section"><div class="container contact-section__inner"><div class="contact-section__copy"><h2>Start a brief for this program.</h2><p class="contact-section__lead">The brief builder carries the program into your request. It is a prototype: nothing is sent.</p><a class="btn btn-dark" href="rfq.html?program=${program.id}">Start a program brief <span>↗</span></a></div>
          <div class="contact-section__details"><div class="contact-detail"><span>Other programs</span>${SEED.programs.filter((p) => p.id !== program.id).map((p) => `<a href="program.html?id=${p.id}">${esc(p.title)}</a>`).join('')}</div></div></div></section>`;
    }, 'We could not load this program.');
  }

  /* ---------- Repair vs replace decision tool ---------- */
  const RVR_FIELDS = [
    { name: 'hp', label: 'Motor size (HP)' },
    { name: 'age', label: 'Age of the motor' },
    { name: 'failure', label: 'What failed?' },
    { name: 'parts', label: 'Parts availability' },
    { name: 'special', label: 'Is it a specialized or custom motor?' },
    { name: 'lead', label: 'Replacement lead time' },
    { name: 'downtime', label: 'Cost of downtime' }
  ];
  const RVR_TEXT = {
    age: { new: 'Under 5 years', mid: '5 to 15 years', old: 'Over 15 years' },
    failure: { bearing: 'Bearings or other mechanical wear', winding: 'Winding failure', repeat: 'Repeated failure of the same kind', core: 'Core, frame or shaft damage' },
    parts: { available: 'Available', limited: 'Limited', obsolete: 'Obsolete' },
    special: { yes: 'Yes', no: 'No' },
    lead: { stock: 'In stock', weeks: '2 to 6 weeks', long: 'More than 6 weeks' },
    downtime: { low: 'Low', moderate: 'Moderate', high: 'High' }
  };
  function scoreRvr(a) {
    const repair = []; const replace = []; let score = 0;
    const hp = Number(a.hp);
    if (hp > 100) { score += 2; repair.push('Motors above 100 HP are usually worth repairing.'); }
    else if (a.special !== 'yes') { score -= 1; replace.push('Standard motors at 100 HP and below are often cheaper to replace than rewind.'); }
    if (a.age === 'new') { score += 1; repair.push('A motor under 5 years old usually has plenty of service life left.'); }
    if (a.age === 'old') { score -= 1; replace.push('A motor over 15 years old may be less efficient than a current model.'); }
    if (a.failure === 'bearing') { score += 2; repair.push('Bearing and mechanical wear is a routine repair.'); }
    if (a.failure === 'winding' && hp > 100) { score += 1; repair.push('A rewind is often economical on larger motors.'); }
    if (a.failure === 'repeat') { score -= 2; replace.push('Repeated failures suggest a root cause that repair alone may not fix.'); }
    if (a.failure === 'core') { score -= 3; replace.push('Core, frame or shaft damage makes repair expensive and uncertain.'); }
    if (a.parts === 'available') { score += 1; repair.push('Repair parts are available.'); }
    if (a.parts === 'obsolete') { score -= 3; replace.push('Obsolete parts make repair hard to support.'); }
    if (a.special === 'yes') { score += 2; repair.push('Specialized motors are hard to replace like for like.'); }
    if (a.lead === 'stock') { score -= 1; replace.push('A replacement is available from stock.'); }
    if (a.lead === 'long') { score += 2; repair.push('A long replacement lead time favours repair.'); if (a.downtime === 'high') { score += 1; repair.push('High downtime cost makes the long wait expensive.'); } }
    let verdict = 'Close call: get an inspection before deciding';
    let tone = 'info';
    if (score >= 2) { verdict = 'Repair looks favourable'; tone = 'ok'; }
    if (score <= -2) { verdict = 'Replacement looks favourable'; tone = 'warn'; }
    const summary = [`${hp} HP`, RVR_TEXT.age[a.age], RVR_TEXT.failure[a.failure], `parts ${RVR_TEXT.parts[a.parts].toLowerCase()}`, a.special === 'yes' ? 'specialized' : 'standard', `lead time ${RVR_TEXT.lead[a.lead].toLowerCase()}`, `downtime cost ${RVR_TEXT.downtime[a.downtime].toLowerCase()}`].join(', ');
    return { verdict, tone, score, repair, replace, summary, answers: { ...a } };
  }
  function initRvrTool() {
    const form = $('#rvr-form');
    if (!form) return;
    const result = $('#rvr-result');
    const summaryBox = $('#rvr-errors');
    const values = () => Object.fromEntries(RVR_FIELDS.map((f) => [f.name, (form.elements[f.name]?.value || '').trim()]));
    function validateOne(name) {
      const v = values()[name];
      let message = '';
      if (name === 'hp') {
        const n = Number(v);
        if (!v) message = 'Enter the motor size in HP.';
        else if (!Number.isFinite(n) || n <= 0 || n > 10000) message = 'Enter a size between 1 and 10,000 HP.';
      } else if (!v) message = `Choose an answer for “${RVR_FIELDS.find((f) => f.name === name).label}”.`;
      const error = $(`#rvr-${name}-error`);
      error.textContent = message; error.hidden = !message;
      const target = form.querySelector(`[name="${name}"]`);
      const group = target.closest('fieldset') || target;
      group.setAttribute('aria-invalid', String(Boolean(message)));
      return message;
    }
    form.addEventListener('change', (event) => { if (event.target.name && form.dataset.touched) validateOne(event.target.name); });
    form.addEventListener('focusout', (event) => { if (event.target.name === 'hp' && event.target.value) validateOne('hp'); });
    function showResult(assessment) {
      result.hidden = false;
      result.innerHTML = `<div class="rvr-verdict rvr-verdict--${assessment.tone}"><div class="micro-label">Screening result</div><h3 id="rvr-verdict-title" tabindex="-1">${esc(assessment.verdict)}</h3><p>${esc(assessment.summary)}.</p></div>
        <div class="rvr-reasons"><div><h4>Points toward repair</h4>${assessment.repair.length ? `<ul>${assessment.repair.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '<p>None from your answers.</p>'}</div>
        <div><h4>Points toward replacement</h4>${assessment.replace.length ? `<ul>${assessment.replace.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '<p>None from your answers.</p>'}</div></div>
        <p class="rvr-note">A screening aid, not a quote. Final feasibility depends on inspecting the actual motor.</p>
        <div class="ui-actions"><button type="button" class="btn btn-dark" id="rvr-carry">Carry this into a project brief <span>↗</span></button><button type="button" class="btn ui-btn-ghost" id="rvr-reset">Start over</button></div>`;
      $('#rvr-carry').addEventListener('click', () => {
        const request = blankRequest();
        request.service = 'repair';
        request.step = 2;
        request.assessment = { verdict: assessment.verdict, summary: assessment.summary };
        request.equipment.type = 'Electric motor';
        request.equipment.makeModel = `${assessment.answers.hp} HP`;
        request.equipment.description = `Screening result: ${assessment.verdict}. Failure: ${RVR_TEXT.failure[assessment.answers.failure]}.`;
        request.schedule.urgency = assessment.answers.downtime === 'high' ? 'urgent' : '';
        const id = persistNew(request, 'Draft started from the repair or replace screening tool.');
        setFlash(`Draft ${id} started with your screening result.`);
        location.href = `rfq.html?id=${id}&step=2`;
      });
      $('#rvr-reset').addEventListener('click', () => {
        form.reset(); delete form.dataset.touched; result.hidden = true; result.innerHTML = '';
        update((state) => { state.assessment = null; });
        $$('[aria-invalid]', form).forEach((el) => el.setAttribute('aria-invalid', 'false'));
        form.elements.hp.focus();
      });
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.dataset.touched = '1';
      const errors = RVR_FIELDS.map((f) => [f.name, validateOne(f.name)]).filter(([, m]) => m);
      if (errors.length) {
        summaryBox.hidden = false;
        $('ul', summaryBox).innerHTML = errors.map(([name, m]) => `<li><a href="#rvr-${name}">${esc(m)}</a></li>`).join('');
        summaryBox.focus();
        return;
      }
      summaryBox.hidden = true;
      const assessment = scoreRvr(values());
      update((state) => { state.assessment = assessment; });
      showResult(assessment);
      $('#rvr-verdict-title').focus();
    });
    summaryBox.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      event.preventDefault();
      const name = link.getAttribute('href').replace('#rvr-', '');
      form.querySelector(`[name="${name}"]`).focus();
    });
    const saved = readState().assessment;
    if (saved) {
      Object.entries(saved.answers).forEach(([name, value]) => {
        const el = form.elements[name];
        if (!el) return;
        if (el instanceof RadioNodeList) { const radio = [...el].find((r) => r.value === value); if (radio) radio.checked = true; } else el.value = value;
      });
      showResult(saved);
    }
  }

  /* ---------- RFQ / project brief builder ---------- */
  const STEPS = ['Service', 'Equipment and site', 'Timeline and budget', 'Attachments', 'Contact details', 'Review', 'Confirmation'];
  const MAX_FILES = 10;
  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  const today = () => new Date().toISOString().slice(0, 10);

  const RFQ_FIELDS = {
    1: [
      { name: 'service', path: 'service', kind: 'cards', label: 'Which service fits best?', required: true,
        options: () => SEED.services.map((s) => ({ value: s.id, label: s.title, text: s.summary })).concat([{ value: 'unsure', label: 'Not sure yet', text: 'Describe the problem and leave the scope open.' }]),
        validate: (v) => (v ? '' : 'Choose a service, or “Not sure yet”.') },
      { name: 'program', path: 'program', kind: 'select', label: 'Related plant support program', required: false,
        options: () => [{ value: '', label: 'No program' }].concat(SEED.programs.map((p) => ({ value: p.id, label: p.title }))) }
    ],
    2: [
      { name: 'type', path: 'equipment.type', kind: 'select', label: 'Equipment type', required: true,
        options: () => [{ value: '', label: 'Choose equipment type' }].concat(SEED.options.equipmentTypes.map((t) => ({ value: t, label: t }))),
        validate: (v) => (v ? '' : 'Choose the type of equipment.') },
      { name: 'makeModel', path: 'equipment.makeModel', kind: 'text', label: 'Make, model or rating', required: false, maxlength: 120, placeholder: 'For example, 150 HP TEFC, frame 445T' },
      { name: 'quantity', path: 'equipment.quantity', kind: 'number', label: 'Quantity', required: true, min: 1, max: 999,
        validate: (v) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 999 ? '' : 'Enter a whole number from 1 to 999.'; } },
      { name: 'site', path: 'equipment.site', kind: 'text', label: 'Site or area', required: true, maxlength: 120, autocomplete: 'off', placeholder: 'For example, Packing hall, Line 3',
        validate: (v) => (v.trim().length >= 2 ? '' : 'Enter the site or area where the equipment is.') },
      { name: 'description', path: 'equipment.description', kind: 'textarea', label: 'What needs to change?', required: true, maxlength: 1500,
        help: 'A short description is enough. Avoid confidential information.',
        validate: (v) => (v.trim().length >= 20 ? '' : `Describe the change in at least 20 characters (${v.trim().length} so far).`) },
      { name: 'constraints', path: 'equipment.constraints', kind: 'textarea', label: 'Site constraints', required: false, maxlength: 600, rows: 3, placeholder: 'Access, shutdown windows, safety rules' }
    ],
    3: [
      { name: 'urgency', path: 'schedule.urgency', kind: 'cards', label: 'How urgent is it?', required: true,
        options: () => SEED.options.urgency.map((u) => ({ value: u.id, label: u.label, text: u.text })),
        validate: (v) => (v ? '' : 'Choose how urgent the work is.') },
      { name: 'startDate', path: 'schedule.startDate', kind: 'date', label: 'Target start date', required: false,
        validate: (v) => (!v || v >= today() ? '' : 'Choose a date from today onwards, or leave it empty.') },
      { name: 'budget', path: 'schedule.budget', kind: 'select', label: 'Budget range', required: true,
        options: () => [{ value: '', label: 'Choose a budget range' }].concat(SEED.options.budgets.map((b) => ({ value: b, label: b }))),
        validate: (v) => (v ? '' : 'Choose a budget range, or “Not decided yet”.') },
      { name: 'notes', path: 'schedule.notes', kind: 'textarea', label: 'Timing notes', required: false, maxlength: 600, rows: 3 }
    ],
    4: [],
    5: [
      { name: 'name', path: 'contact.name', kind: 'text', label: 'Full name', required: true, maxlength: 120, autocomplete: 'name',
        validate: (v) => (v.trim().length >= 2 ? '' : 'Enter your name.') },
      { name: 'company', path: 'contact.company', kind: 'text', label: 'Company', required: true, maxlength: 120, autocomplete: 'organization',
        validate: (v) => (v.trim().length >= 2 ? '' : 'Enter your company name.') },
      { name: 'email', path: 'contact.email', kind: 'email', label: 'Work email', required: true, maxlength: 254, autocomplete: 'email',
        validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@company.com.') },
      { name: 'method', path: 'contact.method', kind: 'cards', label: 'Preferred contact method', required: true,
        options: () => SEED.options.contactMethods.map((m) => ({ value: m, label: m, text: m === 'Email' ? 'Reply by email' : 'A call back' })),
        validate: (v) => (v ? '' : 'Choose a contact method.') },
      { name: 'phone', path: 'contact.phone', kind: 'tel', label: 'Phone', required: false, maxlength: 30, autocomplete: 'tel',
        help: 'Required if you prefer a call back.',
        validate: (v, request) => {
          const digits = v.replace(/\D/g, '');
          if (!v.trim()) return request.contact.method === 'Phone' ? 'Enter a phone number for a call back.' : '';
          return /^[+\d\s().-]+$/.test(v) && digits.length >= 7 && digits.length <= 15 ? '' : 'Enter a phone number with 7 to 15 digits.';
        } }
    ]
  };

  function fieldHtml(f, request) {
    const value = getPath(request, f.path) ?? '';
    const id = `f-${f.name}`;
    const req = f.required ? '<span>(required)</span>' : '<span>(optional)</span>';
    const help = f.help ? `<p id="${id}-help" class="c-field-help">${esc(f.help)}</p>` : '';
    const describedBy = [f.help ? `${id}-help` : '', `${id}-error`].filter(Boolean).join(' ');
    const error = `<p id="${id}-error" class="c-field-error" hidden></p>`;
    if (f.kind === 'cards') {
      return `<fieldset class="c-field c-choice" id="${id}" aria-describedby="${id}-error"><legend class="c-choice__legend">${esc(f.label)} ${req}</legend>
        <div class="c-choice__grid">${f.options().map((o, i) => `<label class="c-choice__card"><input type="radio" name="${f.name}" id="${id}-${i}" value="${esc(o.value)}" ${String(value) === String(o.value) ? 'checked' : ''}><span class="c-choice__title">${esc(o.label)}</span>${o.text ? `<span class="c-choice__text">${esc(o.text)}</span>` : ''}</label>`).join('')}</div>${error}</fieldset>`;
    }
    const common = `id="${id}" name="${f.name}" aria-describedby="${describedBy}"${f.required ? ' required' : ''}${f.maxlength ? ` maxlength="${f.maxlength}"` : ''}${f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ''}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}`;
    let control;
    if (f.kind === 'select') control = `<select ${common}>${f.options().map((o) => `<option value="${esc(o.value)}" ${String(value) === String(o.value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
    else if (f.kind === 'textarea') control = `<textarea ${common} rows="${f.rows || 4}">${esc(value)}</textarea>`;
    else control = `<input ${common} type="${f.kind}" value="${esc(value)}"${f.min ? ` min="${f.min}"` : ''}${f.max ? ` max="${f.max}"` : ''}${f.kind === 'date' ? ` min="${today()}"` : ''}${f.kind === 'number' ? ' inputmode="numeric"' : ''}>`;
    return `<div class="c-field"><label for="${id}">${esc(f.label)} ${req}</label>${help}${control}${error}</div>`;
  }

  function initRfq() {
    const root = $('#rfq-app');
    const panel = $('#rfq-panel');
    const stepper = $('#rfq-stepper');
    const meter = $('#rfq-meter');
    const saveStatus = $('#rfq-save');
    let request = null;
    let current = 1;
    let persisted = false;
    let saveTimer = null;
    let touched = new Set();

    function setUrl() {
      if (!request.id) return;
      const url = `rfq.html?id=${encodeURIComponent(request.id)}${current > 1 && current < 7 ? `&step=${current}` : ''}${current === 7 ? '&done=1' : ''}`;
      history.replaceState(null, '', url);
    }
    function saveNow() {
      clearTimeout(saveTimer);
      saveTimer = null;
      if (!persisted) {
        persistNew(request);
        persisted = true;
      } else {
        request.updatedAt = nowIso();
        update((state) => {
          const index = state.requests.findIndex((r) => r.id === request.id);
          if (index >= 0) state.requests[index] = clone(request); else state.requests.push(clone(request));
          state.activeDraftId = request.id;
        });
      }
      setUrl();
      saveStatus.textContent = `Draft ${request.id} saved at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
      saveStatus.dataset.state = 'saved';
    }
    function scheduleSave() {
      saveStatus.textContent = 'Saving draft…';
      saveStatus.dataset.state = 'saving';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveNow, 400);
    }
    window.addEventListener('pagehide', () => { if (saveTimer) saveNow(); });

    function renderStepper() {
      const furthest = Math.max(request.step || 1, current);
      meter.innerHTML = `<span>Step ${current} of ${STEPS.length}</span><strong>${esc(STEPS[current - 1])}</strong><span class="c-meter" aria-hidden="true"><span style="width:${Math.round((current / STEPS.length) * 100)}%"></span></span>`;
      stepper.innerHTML = STEPS.map((title, index) => {
        const n = index + 1;
        const state = n === current ? 'current' : n < current || (n <= furthest && current !== 7) ? 'done' : 'todo';
        const canJump = current !== 7 && n !== current && n <= furthest && n < 7;
        const label = `<span class="c-stepper__no" aria-hidden="true">${n}</span><span>${esc(title)}</span>`;
        return `<li class="c-stepper__item is-${state}"${n === current ? ' aria-current="step"' : ''}>${canJump ? `<button type="button" data-goto="${n}">${label}</button>` : `<span class="c-stepper__static">${label}</span>`}</li>`;
      }).join('');
    }

    function validateField(f) {
      let value;
      if (f.kind === 'cards') value = panel.querySelector(`input[name="${f.name}"]:checked`)?.value || '';
      else value = panel.querySelector(`[name="${f.name}"]`)?.value ?? '';
      const message = f.validate ? f.validate(String(value), request) : '';
      const error = $(`#f-${f.name}-error`, panel);
      if (error) { error.textContent = message; error.hidden = !message; }
      const control = $(`#f-${f.name}`, panel);
      if (control) control.setAttribute('aria-invalid', String(Boolean(message)));
      return message;
    }
    function validateStep(n) {
      const errors = (RFQ_FIELDS[n] || []).map((f) => ({ f, message: validateField(f) })).filter((x) => x.message);
      const summary = $('#rfq-errors', panel);
      if (errors.length) {
        summary.hidden = false;
        $('ul', summary).innerHTML = errors.map(({ f, message }) => `<li><a href="#f-${f.name}" data-focus="${f.name}">${esc(message)}</a></li>`).join('');
        summary.focus();
        return false;
      }
      if (summary) summary.hidden = true;
      return true;
    }

    function goTo(n, { focus = true } = {}) {
      current = n;
      if (current <= 6) request.step = Math.max(request.step || 1, current);
      touched = new Set();
      render();
      if (persisted) { saveNow(); }
      if (focus) {
        const heading = $('#rfq-step-title', panel);
        heading?.focus();
        root.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    }

    function stepShell(n, body, { next = 'Continue', back = true } = {}) {
      const toReview = (request.step || 1) >= 6 && n < 6;
      return `<div id="rfq-errors" class="c-errors" tabindex="-1" role="alert" hidden><h2>Please check these details</h2><ul></ul></div>
        <form id="rfq-form" novalidate>
          <h2 id="rfq-step-title" class="c-step-title" tabindex="-1">${esc(STEPS[n - 1])}</h2>
          ${body}
          <div class="c-form-actions">${back && n > 1 ? `<button type="button" class="c-button c-button-secondary" data-back>Back</button>` : ''}
          <button type="submit" class="c-button">${esc(next)} <span aria-hidden="true">→</span></button>
          ${toReview ? '<button type="button" class="c-text-button" data-review>Save and return to review</button>' : ''}</div>
        </form>`;
    }

    function renderAttachments() {
      const list = request.attachments;
      return `<div class="c-field"><p class="c-field-help" id="files-help">Add drawings, photos or I/O lists. Only the file name and size are kept in this tab. Files are not uploaded or read. Up to ${MAX_FILES} files, ${formatBytes(MAX_FILE_BYTES)} each.</p>
        <label class="c-dropzone" for="f-files"><span class="c-dropzone__title">Choose files</span><span class="c-dropzone__text">or drop them here</span></label>
        <input id="f-files" class="ui-visually-hidden-input" type="file" multiple aria-describedby="files-help f-files-error">
        <p id="f-files-error" class="c-field-error" role="alert" hidden></p></div>
        <div class="c-files" aria-live="polite">${list.length
          ? `<h3>${list.length} file${list.length === 1 ? '' : 's'} added</h3><ul class="c-file-list">${list.map((file, i) => `<li><span class="c-file-list__name">${esc(file.name)}</span><span class="c-file-list__size">${esc(formatBytes(file.size))}</span><button type="button" class="c-text-button" data-remove="${i}">Remove<span class="ui-sr"> ${esc(file.name)}</span></button></li>`).join('')}</ul>`
          : '<div class="ui-empty ui-empty--compact"><h3>No files added</h3><p>Attachments are optional. You can continue without them.</p></div>'}</div>`;
    }
    function addFiles(fileList) {
      const errors = [];
      for (const file of fileList) {
        if (request.attachments.length >= MAX_FILES) { errors.push(`Only ${MAX_FILES} files can be added.`); break; }
        if (file.size > MAX_FILE_BYTES) { errors.push(`${file.name} is larger than ${formatBytes(MAX_FILE_BYTES)}.`); continue; }
        if (request.attachments.some((f) => f.name === file.name)) { errors.push(`${file.name} is already in the list.`); continue; }
        request.attachments.push({ name: file.name, size: file.size });
      }
      render();
      saveNow();
      const error = $('#f-files-error', panel);
      if (errors.length) { error.textContent = errors.join(' '); error.hidden = false; }
      toast(errors.length ? 'Some files were not added.' : 'Files added to the list.');
      $('#f-files', panel)?.focus();
    }

    function renderReview() {
      return `<div id="rfq-submit-error" class="c-errors" tabindex="-1" role="alert" hidden><h2>We could not submit your request.</h2><p>The prototype simulated a connection failure. Your draft is still saved in this tab.</p><button type="button" class="c-button" data-retry>Try again</button></div>
        <h2 id="rfq-step-title" class="c-step-title" tabindex="-1">Review your request</h2>
        <p class="c-small">Check each section. Submitting records the request in this tab only. It is a prototype, so nothing is sent to G.I.E or anyone else.</p>
        ${sectionsHtml(request, true)}
        <div class="c-form-actions"><button type="button" class="c-button c-button-secondary" data-back>Back</button><button type="button" class="c-button" id="rfq-submit">Submit request <span aria-hidden="true">→</span></button><button type="button" class="c-text-button" data-download>Download a copy</button></div>`;
    }
    function renderConfirmation() {
      return `<div class="c-confirm"><p class="c-document-label">Reference ${esc(request.id)}</p>
        <h2 id="rfq-step-title" class="c-step-title" tabindex="-1">Request ${esc(request.id)} is recorded in this prototype.</h2>
        <p><strong>Nothing was sent.</strong> This is a prototype without a live service: no one at G.I.E or anywhere else has received your request. It is kept in this browser tab until you close it or reset the demo data.</p>
        <p>In a live service, the next step would be a review of your brief and a reply to ${esc(request.contact.email)}.</p>
        <div class="c-form-actions"><a class="c-button" href="request.html?id=${encodeURIComponent(request.id)}">View request status <span aria-hidden="true">↗</span></a><a class="c-button c-button-secondary" href="requests.html">My requests</a><button type="button" class="c-text-button" data-download>Download a copy</button><a class="c-text-button" href="rfq.html?new=1">Start another brief</a></div></div>`;
    }

    function render() {
      renderStepper();
      if (current === 7) { panel.innerHTML = renderConfirmation(); return; }
      if (current === 6) { panel.innerHTML = renderReview(); return; }
      let body = (RFQ_FIELDS[current] || []).map((f) => fieldHtml(f, request)).join('');
      if (current === 1 && request.assessment) body = `<div class="ui-note"><strong>Screening result carried over:</strong> ${esc(request.assessment.verdict)}. ${esc(request.assessment.summary)}.</div>` + body;
      if (current === 2 && request.assessment) body = `<div class="ui-note"><strong>From the screening tool:</strong> ${esc(request.assessment.verdict)}.</div>` + body;
      if (current === 3) body += request.schedule.urgency === 'urgent' ? '<div class="ui-note" id="urgent-note">Equipment down now? A live provider would ask you to phone. This prototype cannot take calls or dispatch anyone.</div>' : '';
      if (current === 4) body = renderAttachments();
      panel.innerHTML = stepShell(current, body, { next: current === 5 ? 'Review request' : 'Continue' });
    }

    /* Event delegation for the whole panel and stepper. */
    root.addEventListener('click', (event) => {
      const goto = event.target.closest('[data-goto]');
      if (goto) { goTo(Number(goto.dataset.goto)); return; }
      if (event.target.closest('[data-back]')) { goTo(Math.max(1, current - 1)); return; }
      if (event.target.closest('[data-review]')) { if (validateStep(current)) goTo(6); return; }
      const remove = event.target.closest('[data-remove]');
      if (remove) {
        const [file] = request.attachments.splice(Number(remove.dataset.remove), 1);
        render(); saveNow(); toast(`${file.name} removed.`);
        ($('[data-remove]', panel) || $('#f-files', panel))?.focus();
        return;
      }
      if (event.target.closest('[data-download]')) { downloadText(request); return; }
      const focusLink = event.target.closest('[data-focus]');
      if (focusLink) { event.preventDefault(); const target = panel.querySelector(`[name="${focusLink.dataset.focus}"]`); target?.focus(); return; }
      if (event.target.closest('#rfq-submit') || event.target.closest('[data-retry]')) submit();
    });
    root.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateStep(current)) return;
      goTo(current + 1);
    });
    root.addEventListener('input', (event) => onFieldChange(event));
    root.addEventListener('change', (event) => {
      if (event.target.id === 'f-files') { addFiles(event.target.files); return; }
      onFieldChange(event);
    });
    root.addEventListener('focusout', (event) => {
      const f = (RFQ_FIELDS[current] || []).find((x) => x.name === event.target.name);
      if (f && f.kind !== 'cards' && (touched.has(f.name) || event.target.value)) { touched.add(f.name); validateField(f); }
    });
    root.addEventListener('dragover', (event) => { if (event.target.closest('.c-dropzone')) { event.preventDefault(); event.target.closest('.c-dropzone').classList.add('is-over'); } });
    root.addEventListener('dragleave', (event) => { event.target.closest('.c-dropzone')?.classList.remove('is-over'); });
    root.addEventListener('drop', (event) => { if (event.target.closest('.c-dropzone')) { event.preventDefault(); addFiles(event.dataTransfer.files); } });

    function onFieldChange(event) {
      const f = (RFQ_FIELDS[current] || []).find((x) => x.name === event.target.name);
      if (!f) return;
      let value = event.target.value;
      if (f.kind === 'number') value = value === '' ? '' : Number(value);
      setPath(request, f.path, value);
      if (f.kind === 'cards' || f.kind === 'select') { touched.add(f.name); validateField(f); }
      else if (touched.has(f.name)) validateField(f);
      if (f.name === 'method' && current === 5) { const phone = RFQ_FIELDS[5].find((x) => x.name === 'phone'); if (touched.has('phone') || value === 'Email') validateField(phone); }
      if (f.name === 'urgency') { render(); $(`input[name="urgency"][value="${value}"]`, panel)?.focus(); }
      scheduleSave();
    }

    async function submit() {
      const button = $('#rfq-submit', panel);
      const errorBox = $('#rfq-submit-error', panel);
      for (let n = 1; n <= 5; n += 1) {
        const missing = (RFQ_FIELDS[n] || []).some((f) => f.validate && f.validate(String(getPath(request, f.path) ?? ''), request));
        if (missing) { toast(`Step ${n} needs attention before you submit.`); goTo(n); validateStep(n); return; }
      }
      errorBox.hidden = true;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      button.innerHTML = '<span class="ui-spinner ui-spinner--inline" aria-hidden="true"></span> Submitting…';
      try {
        await simulate(() => true, 700);
        const at = nowIso();
        request.status = 'submitted';
        request.submittedAt = at;
        request.updatedAt = at;
        request.step = 6;
        request.history.push({ status: 'submitted', at, note: 'Submitted in this prototype. Nothing was sent.' });
        update((state) => {
          const index = state.requests.findIndex((r) => r.id === request.id);
          if (index >= 0) state.requests[index] = clone(request); else state.requests.push(clone(request));
          state.activeDraftId = '';
        });
        saveStatus.textContent = `Request ${request.id} submitted in this prototype`;
        saveStatus.dataset.state = 'saved';
        goTo(7);
      } catch (error) {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.innerHTML = 'Submit request <span aria-hidden="true">→</span>';
        errorBox.hidden = false;
        errorBox.focus();
      }
    }

    function showBanner(html) {
      const banner = $('#rfq-banner');
      banner.innerHTML = html;
      banner.hidden = false;
    }

    function start() {
      const state = readState();
      const id = params.get('id');
      if (id) {
        const found = state.requests.find((r) => r.id === id);
        if (!found) {
          root.innerHTML = `<div class="ui-state ui-state--empty"><h2>We could not find request ${esc(id)}.</h2><p>It may have been removed when the demo data was reset, or the link belongs to another browser tab.</p><div class="ui-actions"><a class="c-button" href="rfq.html?new=1">Start a new brief <span aria-hidden="true">↗</span></a><a class="c-button c-button-secondary" href="requests.html">My requests</a></div></div>`;
          return;
        }
        request = clone(found);
        persisted = true;
        if (found.status !== 'draft') {
          if (params.get('done') && found.status === 'submitted') { current = 7; render(); return; }
          root.innerHTML = `<div class="ui-state ui-state--empty"><h2>${esc(found.id)} can no longer be edited.</h2><p>Only drafts can be edited. This request is ${esc(STATUS[found.status].label.toLowerCase())}. Duplicate it to start a new draft with the same details.</p><div class="ui-actions"><a class="c-button" href="request.html?id=${encodeURIComponent(found.id)}">View request <span aria-hidden="true">↗</span></a><a class="c-button c-button-secondary" href="requests.html">My requests</a></div></div>`;
          return;
        }
        const step = Number(params.get('step')) || 1;
        current = Math.min(Math.max(1, step), Math.min(6, request.step || 1));
        update((s) => { s.activeDraftId = found.id; });
        saveStatus.textContent = `Editing draft ${found.id}. Changes save automatically.`;
      } else {
        const active = state.activeDraftId && state.requests.find((r) => r.id === state.activeDraftId && r.status === 'draft');
        const wantsNew = params.get('new') || params.get('service') || params.get('program');
        if (active && !wantsNew) {
          request = clone(active);
          persisted = true;
          current = Math.min(6, request.step || 1);
          setUrl();
          showBanner(`<p>You are continuing draft <strong>${esc(active.id)}</strong> from earlier in this tab.</p><a class="c-text-link" href="rfq.html?new=1">Start a new brief instead</a>`);
          saveStatus.textContent = `Editing draft ${active.id}. Changes save automatically.`;
        } else {
          request = blankRequest();
          const service = params.get('service');
          const program = params.get('program');
          if (service && serviceById(service)) request.service = service;
          if (program && programById(program)) {
            request.program = program;
            if (!request.service) request.service = programById(program).relatedServices[0] || '';
          }
          if (request.service || request.program) { saveNow(); toast(`Draft ${request.id} started with your selection.`); }
          else saveStatus.textContent = 'Your draft saves automatically as you type.';
        }
      }
      render();
    }
    start();
  }

  /* ---------- My requests ---------- */
  function initRequests() {
    const view = $('#requests-view');
    let filter = params.get('status') || 'all';
    let query = '';
    const FILTERS = [['all', 'All'], ['draft', 'Drafts'], ['active', 'Submitted'], ['withdrawn', 'Withdrawn']];
    const matches = (r) => (filter === 'all' || (filter === 'active' ? ['submitted', 'in-review'].includes(r.status) : r.status === filter))
      && (!query || `${r.id} ${requestTitle(r)} ${r.equipment.description} ${r.contact.company}`.toLowerCase().includes(query.toLowerCase()));

    function renderList(requests) {
      const sorted = [...requests].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      if (!sorted.length) {
        view.innerHTML = `<div class="ui-empty"><h2>No requests yet</h2><p>Briefs you start or submit in this tab will appear here.</p><a class="c-button" href="rfq.html?new=1">Prepare a project brief <span aria-hidden="true">↗</span></a></div>`;
        return;
      }
      const count = (key) => sorted.filter((r) => (key === 'all' ? true : key === 'active' ? ['submitted', 'in-review'].includes(r.status) : r.status === key)).length;
      view.innerHTML = `<div class="c-toolbar"><div class="c-filters" role="group" aria-label="Filter by status">${FILTERS.map(([key, label]) => `<button type="button" class="c-chip" data-filter="${key}" aria-pressed="${filter === key}">${label} <span>${count(key)}</span></button>`).join('')}</div>
        <div class="c-field c-search"><label for="request-search">Search requests</label><input id="request-search" type="search" value="${esc(query)}" placeholder="Reference, site or company"></div></div>
        <div id="request-results" aria-live="polite"></div>`;
      const results = $('#request-results');
      const paint = () => {
        const shown = sorted.filter(matches);
        results.innerHTML = shown.length
          ? `<p class="c-small" id="result-count">${shown.length} of ${sorted.length} request${sorted.length === 1 ? '' : 's'}</p><ul class="c-request-list">${shown.map((r) => `<li><a class="c-request-row" href="request.html?id=${encodeURIComponent(r.id)}"><span class="c-request-row__id">${esc(r.id)}${r.example ? ' <span class="ui-tag">Example</span>' : ''}</span><span class="c-request-row__title">${esc(requestTitle(r))}</span><span class="c-request-row__status">${statusBadge(r.status)}</span><span class="c-request-row__date">Updated ${esc(formatDate(r.updatedAt))}</span></a></li>`).join('')}</ul>`
          : `<div class="ui-empty ui-empty--compact"><h3>No requests match</h3><p>Try another status or search term.</p><button type="button" class="c-button c-button-secondary" data-clear>Clear filters</button></div>`;
      };
      paint();
      view.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-filter]');
        if (chip) {
          filter = chip.dataset.filter;
          $$('[data-filter]', view).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
          history.replaceState(null, '', filter === 'all' ? 'requests.html' : `requests.html?status=${filter}`);
          paint();
        }
        if (event.target.closest('[data-clear]')) {
          filter = 'all'; query = '';
          $('#request-search').value = '';
          $$('[data-filter]', view).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === 'all')));
          history.replaceState(null, '', 'requests.html');
          paint();
          $('#request-search').focus();
        }
      });
      $('#request-search').addEventListener('input', (event) => { query = event.target.value.trim(); paint(); });
    }
    load(view, 'Loading your requests…', () => clone(readState().requests), renderList, 'We could not load your requests.');
  }

  /* ---------- Request detail ---------- */
  const STAGES = [['draft', 'Draft'], ['submitted', 'Submitted'], ['in-review', 'In review'], ['quoted', 'Quote prepared']];
  function timelineHtml(request) {
    const reached = request.history.map((h) => h.status);
    const withdrawn = request.status === 'withdrawn';
    const currentIndex = withdrawn ? -1 : STAGES.findIndex(([key]) => key === request.status);
    const stages = STAGES.map(([key, label], i) => {
      const event = request.history.find((h) => h.status === key);
      let state = 'todo';
      if (event) state = 'done';
      if (i === currentIndex) state = 'current';
      if (withdrawn && !event) return '';
      const note = event ? `${formatDate(event.at)}. ${event.note}` : key === 'quoted' ? 'Would follow a real review. Not simulated in this prototype.' : 'Not reached yet.';
      return `<li class="c-timeline__item is-${state}"${state === 'current' ? ' aria-current="step"' : ''}><span class="c-timeline__dot" aria-hidden="true"></span><div><h3>${label}${state === 'current' ? ' <span class="ui-sr">(current status)</span>' : ''}</h3><p>${esc(note)}</p></div></li>`;
    }).join('');
    const w = withdrawn ? request.history.filter((h) => h.status === 'withdrawn').pop() : null;
    return `<ol class="c-timeline">${stages}${w ? `<li class="c-timeline__item is-current is-withdrawn" aria-current="step"><span class="c-timeline__dot" aria-hidden="true"></span><div><h3>Withdrawn</h3><p>${esc(formatDate(w.at))}. ${esc(w.note)}</p></div></li>` : ''}</ol>${reached.length ? '' : ''}`;
  }
  function initRequestDetail() {
    const view = $('#request-view');
    const id = params.get('id');
    const render = (request) => {
      if (!request) {
        document.title = 'Request not found | G.I.E Concept';
        view.innerHTML = `<div class="ui-state ui-state--empty"><h1 class="c-detail-title">Request not found.</h1><p>${id ? `There is no request ${esc(id)} in this tab.` : 'No request reference was given.'} Requests live only in the browser tab where they were created, and a reset removes them.</p><div class="ui-actions"><a class="c-button" href="requests.html">Back to my requests <span aria-hidden="true">↗</span></a></div></div>`;
        return;
      }
      document.title = `${request.id} | My requests | G.I.E Concept`;
      const isDraft = request.status === 'draft';
      const canWithdraw = ['submitted', 'in-review'].includes(request.status);
      view.innerHTML = `
        <div class="c-detail-head"><div><p class="c-document-label">${esc(request.id)}${request.example ? ' (example data)' : ''}</p><h1 class="c-detail-title">${esc(requestTitle(request))}</h1><p class="c-detail-meta">${statusBadge(request.status)} <span>Created ${esc(formatDate(request.createdAt))}</span></p></div>
          <div class="ui-actions c-detail-actions">
            ${isDraft ? `<a class="c-button" href="rfq.html?id=${encodeURIComponent(request.id)}&step=${Math.min(6, request.step || 1)}">Continue editing <span aria-hidden="true">↗</span></a>` : `<button type="button" class="c-button" disabled aria-describedby="edit-locked">Edit</button>`}
            <button type="button" class="c-button c-button-secondary" data-action="duplicate">Duplicate</button>
            ${isDraft ? '<button type="button" class="c-button c-button-secondary" data-action="withdraw">Discard draft</button>' : canWithdraw ? '<button type="button" class="c-button c-button-secondary" data-action="withdraw">Withdraw request</button>' : ''}
          </div>
          ${isDraft ? '' : `<p id="edit-locked" class="c-small c-detail-lock">${request.status === 'withdrawn' ? 'Withdrawn requests are closed.' : 'Submitted requests are locked.'} Duplicate it to make changes in a new draft.</p>`}
        </div>
        <div id="action-error" class="c-errors" tabindex="-1" role="alert" hidden><h2>That action did not complete.</h2><p>The prototype simulated a connection failure. Nothing changed.</p><button type="button" class="c-button" data-action="retry">Try again</button></div>
        <div class="c-detail-grid c-detail-grid--request">
          <section class="c-detail-aside c-scope-document" aria-labelledby="timeline-title"><h2 id="timeline-title">Status</h2>${timelineHtml(request)}<p class="c-small">Status changes after submission are simulated for the example only. Nothing was sent.</p></section>
          <section class="c-detail-main c-form-panel" aria-label="Request details">${sectionsHtml(request, false)}</section>
        </div>`;
      let lastAction = '';
      view.onclick = async (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        let action = button.dataset.action;
        if (action === 'retry') action = lastAction;
        lastAction = action;
        if (action === 'duplicate') {
          const copy = clone(request);
          Object.assign(copy, { example: false, status: 'draft', submittedAt: '', step: Math.min(6, Math.max(request.step || 1, 1)) });
          const newId = persistNew(copy, `Duplicated from ${request.id}.`);
          setFlash(`Draft ${newId} created from ${request.id}.`);
          location.href = `rfq.html?id=${encodeURIComponent(newId)}&step=${copy.step}`;
          return;
        }
        if (action === 'withdraw') {
          const ok = await confirmDialog(isDraft
            ? { title: `Discard draft ${request.id}?`, text: 'The draft will be closed and can no longer be edited. You can still view or duplicate it.', confirm: 'Discard draft', danger: true }
            : { title: `Withdraw ${request.id}?`, text: 'The request will be marked as withdrawn. In this prototype nothing is sent, so no one needs to be told.', confirm: 'Withdraw request', danger: true });
          if (!ok) return;
          $('#action-error').hidden = true;
          button.disabled = true;
          try {
            await simulate(() => true, 500);
            update((state) => {
              const r = state.requests.find((x) => x.id === request.id);
              const at = nowIso();
              r.status = 'withdrawn'; r.updatedAt = at;
              r.history.push({ status: 'withdrawn', at, note: isDraft ? 'Draft discarded.' : 'Withdrawn by you in this prototype.' });
              if (state.activeDraftId === r.id) state.activeDraftId = '';
            });
            toast(isDraft ? `Draft ${request.id} discarded.` : `${request.id} withdrawn.`);
            render(findRequest(request.id));
            $('.c-detail-title', view)?.setAttribute('tabindex', '-1');
            $('.c-detail-title', view)?.focus();
          } catch (error) {
            button.disabled = false;
            $('#action-error').hidden = false;
            $('#action-error').focus();
          }
        }
      };
    };
    load(view, 'Loading request…', () => findRequest(id), render, 'We could not load this request.');
  }

  /* ---------- Contact form ---------- */
  function initContact() {
    const form = $('#contact-form');
    const success = $('#contact-success');
    const failure = $('#contact-failure');
    const summary = $('#contact-errors');
    const fields = {
      'c-name': (v) => (v.trim().length >= 2 ? '' : 'Enter your name.'),
      'c-email': (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@company.com.'),
      'c-topic': (v) => (v ? '' : 'Choose what your message is about.'),
      'c-message': (v) => (v.trim().length >= 20 ? '' : `Write at least 20 characters (${v.trim().length} so far).`)
    };
    const topic = $('#c-topic');
    topic.innerHTML = '<option value="">Choose a topic</option>' + SEED.options.contactTopics.map((t) => `<option>${esc(t)}</option>`).join('');
    const ref = params.get('request');
    if (ref) { topic.value = 'An existing request'; $('#c-ref').value = ref; }
    const check = (id) => {
      const input = $(`#${id}`);
      const message = fields[id](input.value);
      input.setAttribute('aria-invalid', String(Boolean(message)));
      const error = $(`#${id}-error`); error.textContent = message; error.hidden = !message;
      return message;
    };
    form.addEventListener('focusout', (event) => { if (fields[event.target.id] && (event.target.value || event.target.dataset.touched)) { event.target.dataset.touched = '1'; check(event.target.id); } });
    form.addEventListener('input', (event) => { if (fields[event.target.id] && event.target.dataset.touched) check(event.target.id); });
    form.addEventListener('change', (event) => { if (event.target.id === 'c-topic') { event.target.dataset.touched = '1'; check('c-topic'); } });
    summary.addEventListener('click', (event) => { const a = event.target.closest('a'); if (a) { event.preventDefault(); $(a.getAttribute('href')).focus(); } });
    async function send() {
      const errors = Object.keys(fields).map((id) => { $(`#${id}`).dataset.touched = '1'; return [id, check(id)]; }).filter(([, m]) => m);
      if (errors.length) {
        summary.hidden = false;
        $('ul', summary).innerHTML = errors.map(([id, m]) => `<li><a href="#${id}">${esc(m)}</a></li>`).join('');
        summary.focus();
        return;
      }
      summary.hidden = true; failure.hidden = true;
      const button = $('#contact-submit');
      button.disabled = true;
      button.innerHTML = '<span class="ui-spinner ui-spinner--inline" aria-hidden="true"></span> Sending…';
      try {
        const message = await simulate(() => update((state) => {
          const m = { id: `MSG-${String(state.seq.msg).padStart(4, '0')}`, at: nowIso(), name: $('#c-name').value.trim(), email: $('#c-email').value.trim(), company: $('#c-company').value.trim(), topic: topic.value, reference: $('#c-ref').value.trim(), message: $('#c-message').value.trim() };
          state.seq.msg += 1;
          state.messages.push(m);
          return m;
        }), 600);
        form.hidden = true;
        success.hidden = false;
        $('#contact-ref').textContent = message.id;
        $('#contact-email').textContent = message.email;
        $('#contact-success-title').focus();
      } catch (error) {
        failure.hidden = false;
        failure.focus();
      } finally {
        button.disabled = false;
        button.innerHTML = 'Send message <span aria-hidden="true">→</span>';
      }
    }
    form.addEventListener('submit', (event) => { event.preventDefault(); send(); });
    $('#contact-retry').addEventListener('click', send);
    $('#contact-again').addEventListener('click', () => {
      form.reset();
      $$('[data-touched]', form).forEach((el) => { delete el.dataset.touched; el.setAttribute('aria-invalid', 'false'); });
      $$('.c-field-error', form).forEach((el) => { el.hidden = true; });
      success.hidden = true; form.hidden = false;
      $('#c-name').focus();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    readState();
    mountDemoControls();
    const flash = takeFlash();
    if (flash) toast(flash);
    const routes = { service: initServiceDetail, program: initProgramDetail, programs: initProgramList, rfq: initRfq, requests: initRequests, request: initRequestDetail, contact: initContact, rvr: initRvrTool };
    routes[page]?.();
  }
  boot();
})();
