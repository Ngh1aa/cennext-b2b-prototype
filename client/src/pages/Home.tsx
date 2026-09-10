import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

const failureCauses = [
  "Overheating and bearing wear caused by load conditions, lubrication issues, or improper alignment",
  "Moisture ingress that leads to contamination or corrosion",
  "Electrical imbalance or insulation breakdown",
  "Exposure to corrosive chemicals or dust in manufacturing environments",
  "Degradation over time and lack of scheduled maintenance",
];

const capabilities = [
  "AC and DC motor repair up to 500 HP",
  "Skilled technicians trained to follow recognized industry standards (EASA-compliant)",
  "Rotor core testing, burnout ovens, and balancing",
  "Factory-authorized warranty repair for leading motor manufacturers",
  "Industrial motor rewinding",
];

const programFeatures = [
  "Pickup and return of motors on a scheduled basis",
  "Accommodation for industrial campuses or multi-site operations",
  "Serialized tracking and repair documentation",
  "Preferred pricing options for customers with long-term service needs",
];

const warningSigns = [
  "Noticeable increase in vibration or changes in operating sound",
  "Higher than normal power consumption during standard operating conditions",
  "Tripped breakers or activation of thermal protection during startup or runtime",
  "Irregular speed, reduced torque, or difficulty maintaining load",
  "Evidence of bearing wear, misalignment, or heat-related discoloration",
  "Visible damage to wiring, insulation, connectors, or enclosure components",
];

const comparison = [
  ["Cost", "~30–60% the cost of new motor (depending on damage & labor)", "Full cost of new motor + possible lead time/shipping charges"],
  ["Lead Time", "Standard turnaround time is 2 weeks. Rush repair is available.", "Varies by model — can be up to 25 weeks depending on supply chain"],
  ["Motor Age", "Ideal for motors less than 15–20 years old with available parts", "Best if motor is outdated, inefficient, or parts are obsolete"],
  ["Energy Efficiency", "Retains original efficiency rating", "Newer models offer improved energy efficiency (IE3, IE4, etc.)"],
  ["Part Availability", "Repair feasible when OEM parts are still accessible", "Replace when parts are obsolete or discontinued"],
  ["Warranty Impact", "Covered when serviced at authorized repair center (like GIE)", "New OEM warranties typically range 1–3 years"],
  ["Downtime Impact", "Less downtime in most cases, especially for common or stocked motors", "Potentially longer downtime if new motor isn’t in stock"],
  ["Sustainability", "Extends life of existing assets, reduces waste", "May be more energy efficient, but creates disposal/waste considerations"],
];

function BrandMark() {
  return <span className="brand-mark"><span className="brand-mark__rotor" aria-hidden="true"><i /><i /><i /><i /></span><span className="brand-mark__word">GIE</span></span>;
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className={`section-label ${light ? "section-label--light" : ""}`}><span className="section-label__line" aria-hidden="true" /><span>{children}</span></div>;
}

function BulletList({ items, className = "" }: { items: string[]; className?: string }) {
  return <ul className={`bullet-list ${className}`}>{items.map((item) => <li key={item}><Check size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul>;
}

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-nav">
        <div className="site-nav__inner">
          <a className="site-nav__brand" href="#top" aria-label="Gainesville Industrial Electric home"><BrandMark /></a>
          <nav className="site-nav__links" aria-label="Primary navigation">
            <a href="#services">Services</a><a href="#programs">Programs</a><a href="#compare">Repair vs. Replace</a><a href="#trust">Why GIE</a>
          </nav>
          <a className="nav-cta" href="https://www.gainesvilleindustrial.com/contact/">Request a quote <ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero__backdrop" aria-hidden="true" /><div className="hero__grid" aria-hidden="true" />
          <div className="container hero__inner">
            <div className="hero__copy">
              <div className="eyebrow eyebrow--light">INDUSTRIAL ELECTRIC MOTOR REPAIR</div>
              <h1>Keep critical equipment <span>running.</span></h1>
              <p className="hero__lead">Gainesville Industrial Electric provides industrial electric motor repair services that help facilities keep equipment running and avoid costly downtime.</p>
              <div className="hero__actions"><a className="btn btn-primary" href="https://www.gainesvilleindustrial.com/contact/">Contact our repair team <ArrowUpRight size={17} aria-hidden="true" /></a><a className="text-link text-link--light" href="#services">Explore capabilities <ArrowRight size={16} aria-hidden="true" /></a></div>
            </div>
            <div className="hero__aside"><div className="hero__aside-label">GIE / SERVING INDUSTRY FOR 60+ YEARS</div><div className="hero__aside-rule" aria-hidden="true" /><p>Fast turnaround, factory-authorized repairs, and AC and DC motor expertise supported by a skilled in-house team.</p></div>
          </div>
          <div className="container hero__footer"><div className="hero__scroll-note"><span className="hero__scroll-dot" aria-hidden="true" /><span>Explore our services</span></div><div className="hero__location">GAINESVILLE · FLORIDA</div></div>
        </section>

        <section className="signal-band" aria-label="Service highlights"><div className="container signal-band__inner"><div className="signal-band__intro">Reliable service for critical assets</div><div className="signal-band__stats"><div className="stat"><strong>60<span>+</span></strong><small>Years of service</small></div><div className="stat"><strong>500</strong><small>HP repair capacity</small></div><div className="stat"><strong>AC/DC</strong><small>Motor expertise</small></div><div className="stat"><strong>24/7</strong><small>Emergency service</small></div></div></div></section>

        <section className="about-section section-pad" id="causes"><div className="container about-section__grid"><div className="section-index">01 <span>/</span> 07</div><div className="about-section__copy"><SectionLabel>COMMON CAUSES OF MOTOR FAILURE</SectionLabel><h2>Small issues can become <em>big</em> shutdowns.</h2></div><div className="about-section__detail"><p className="lead-copy">Industrial motors operate in harsh environments, and many failures start as minor issues that go unnoticed.</p><p className="body-copy">Problems that are not addressed early can lead to unexpected shutdowns, safety risks, and major repair costs. Some of the most common contributors to failure include:</p><BulletList items={failureCauses} /></div></div></section>

        <section className="callout-section"><div className="container callout-section__inner"><div><span className="callout-section__label">EARLY DIAGNOSTICS</span><h2>80% of electric motor failures are preventable with early diagnostics</h2></div></div></section>

        <section className="services-section section-pad" id="services"><div className="container"><div className="services-section__head"><div><SectionLabel>OUR REPAIR CAPABILITIES</SectionLabel><h2>AC, DC, rewinding <em>& more.</em></h2></div><p>Gainesville Industrial Electric provides complete electric motor repair services, with capabilities including:</p></div><div className="capability-list">{capabilities.map((item, index) => <a className="capability-card" href="https://www.gainesvilleindustrial.com/contact/" key={item}><div className="capability-card__top"><span className="capability-card__number">0{index + 1}</span><span className="capability-card__tag">REPAIR CAPABILITY</span></div><div className="capability-card__main"><h3>{item}</h3><span className="capability-card__arrow" aria-hidden="true"><ArrowUpRight size={22} /></span></div></a>)}</div></div></section>

        <section className="program-section section-pad" id="programs"><div className="container program-section__grid"><div className="program-section__intro"><SectionLabel light>VOLUME REPAIR PROGRAMS</SectionLabel><h2>Support for every motor in your <em>plant.</em></h2><p>Gainesville Industrial Electric provides structured repair programs for facilities requiring service for multiple motors on a recurring basis.</p><a className="btn btn-primary" href="https://www.gainesvilleindustrial.com/contact/">Ask about plant support <ArrowUpRight size={17} aria-hidden="true" /></a></div><div className="program-section__detail"><div className="program-section__eyebrow">AVAILABLE PROGRAM FEATURES</div><BulletList items={programFeatures} className="bullet-list--light" /><div className="program-callout"><span>Ask us about high-volume support for your plant or fleet.</span></div></div></div></section>

        <section className="warning-section section-pad" id="warning"><div className="container warning-section__grid"><div><SectionLabel>SIGNS YOU NEED PROFESSIONAL MOTOR REPAIR</SectionLabel><h2>Listen closely. Your motor may be telling you <em>something.</em></h2></div><div className="warning-section__detail"><p className="lead-copy">Electric motors can show measurable indications of wear or developing faults. Identifying changes in performance early can help determine whether corrective maintenance or repairs are needed.</p><BulletList items={warningSigns} /><p className="body-copy">If any of these conditions are present, inspection and diagnostic testing can help determine the source of the issue, assess the extent of damage, and identify whether repairs or replacement are appropriate.</p></div></div></section>

        <section className="compare-section section-pad" id="compare"><div className="container"><div className="compare-section__head"><div><SectionLabel>REPAIR VS. REPLACE</SectionLabel><h2>What&apos;s right for <em>you?</em></h2></div><p>Evaluating whether to repair or replace an electric motor depends on factors such as cost, availability of parts, operating requirements, and required turnaround time.</p></div><div className="compare-section__copy"><p>Repair costs can vary based on condition, but are often 30% to 60% of the cost of a new motor. Repair work may include reconditioning, bearing replacement, or full rewind services when appropriate. Replacement may be selected when equipment is obsolete, damaged beyond practical repair, or when parts cannot be sourced within an acceptable timeframe.</p><p>For motors rated at 100 horsepower and below, replacement is often more economical than performing a full rewind. Rewinding in this range is generally limited to motors that are specialized or custom, or when replacement motors have extended lead times. Reconditioning and bearing replacement are common options for motors under 100 horsepower when major components remain structurally sound.</p><p>When evaluating options, it can be useful to consider energy efficiency, expected service life, and availability of compatible parts. New motors may provide updated efficiency ratings and features, while repair maintains existing specifications. Lead times for replacement motors vary based on model availability and supply conditions, which may influence scheduling decisions.</p><p>Gainesville Industrial Electric provides information on cost, lead time, and feasibility to help customers evaluate the available options.</p></div><div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>Factor</th><th>Repair</th><th>Replace</th></tr></thead><tbody>{comparison.map(([factor, repair, replace]) => <tr key={factor}><th scope="row">{factor}</th><td>{repair}</td><td>{replace}</td></tr>)}</tbody></table></div></div></section>

        <section className="trust-section section-pad" id="trust"><div className="container trust-section__grid"><div className="trust-section__intro"><SectionLabel light>WHY END USERS TRUST GIE</SectionLabel><h2>Experience that keeps your operation <em>moving.</em></h2></div><div className="trust-section__detail"><p className="lead-copy">Gainesville Industrial Electric has provided electric motor repair services for more than 60 years. We are a factory-authorized warranty repair center for leading brands and maintain an extensive inventory of OEM replacement parts.</p><p className="body-copy">All repair work is performed by our highly trained in-house team with fast turnaround times. We also provide local support and emergency service to keep your motors running in peak condition when you need them most.</p><div className="trust-badges"><div><span>Factory<br />Authorized</span></div><div><span>OEM<br />Parts</span></div><div><span>EASA<br />Compliant</span></div><div><span>24/7<br />Support</span></div></div></div></div></section>

        <section className="contact-section" id="contact"><div className="container contact-section__inner"><div className="contact-section__copy"><SectionLabel>REQUEST A REPAIR OR QUOTE</SectionLabel><h2>Keep your next shutdown <em>short.</em></h2><p className="contact-section__lead">Gainesville Industrial Electric performs repair services for industrial AC and DC motors, including reconditioning, bearing replacement, rewinding, and structured programs for facilities with multiple motors. We also support equipment that is older or difficult to replace and can accommodate a range of service needs, from individual repairs to ongoing maintenance programs.</p><a className="btn btn-dark" href="https://www.gainesvilleindustrial.com/contact/">Contact our repair team <ArrowUpRight size={17} aria-hidden="true" /></a></div><div className="contact-section__details"><div className="contact-detail"><span>CONTACT</span><p>For more information about our industrial electric motor repair capabilities, contact us or request a quote today.</p></div><div className="contact-detail"><span>REQUEST A QUOTE</span><a href="https://www.gainesvilleindustrial.com/contact/">gainesvilleindustrial.com/contact</a></div><div className="contact-detail"><span>COMPANY</span><p>Gainesville Industrial Electric</p></div></div></div></section>
      </main>

      <footer className="site-footer"><div className="container site-footer__inner"><div><BrandMark /><p>Industrial motor repair you can rely on.</p></div><div className="site-footer__meta"><span>Gainesville Industrial Electric</span><span className="prototype-note"><Check size={13} aria-hidden="true" /> Content Test integrated</span></div><a className="footer-top" href="#top" aria-label="Back to top">Back to top <ArrowUpRight size={14} aria-hidden="true" /></a></div></footer>
    </div>
  );
}

export { BrandMark, SectionLabel };
