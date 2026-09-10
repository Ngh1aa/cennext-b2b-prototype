import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";

const capabilities = [
  {
    number: "01",
    title: "E-commerce data management",
    description:
      "Accurate, scalable product data workflows that keep B2B catalogues moving.",
    tag: "DATA OPERATIONS",
  },
  {
    number: "02",
    title: "3D modelling",
    description:
      "Technical visualisation and production-ready modelling for complex products.",
    tag: "TECHNICAL DESIGN",
  },
  {
    number: "03",
    title: "Other services",
    description:
      "Flexible support for the operational details that help your business grow.",
    tag: "CUSTOM WORKFLOWS",
  },
];

const steps = [
  {
    number: "01",
    title: "Understand",
    text: "We learn the workflow behind the request, not just the request itself.",
  },
  {
    number: "02",
    title: "Build",
    text: "We turn repeatable detail into a clear, well-managed operating system.",
  },
  {
    number: "03",
    title: "Improve",
    text: "We stay close to the work and keep finding the next useful gain.",
  },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-label="CenNext home">
      <span className="brand-mark__dot" aria-hidden="true" />
      <span className="brand-mark__word">CENNEXT</span>
    </span>
  );
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`section-label ${light ? "section-label--light" : ""}`}>
      <span className="section-label__line" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-nav">
        <div className="site-nav__inner">
          <a className="site-nav__brand" href="#top" aria-label="CenNext home">
            <BrandMark />
          </a>
          <nav className="site-nav__links" aria-label="Primary navigation">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#method">Our method</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="nav-cta" href="#contact">
            Let&apos;s talk <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero__backdrop" aria-hidden="true" />
          <div className="hero__grid" aria-hidden="true" />
          <div className="container hero__inner">
            <div className="hero__copy">
              <div className="eyebrow eyebrow--light">BPO FOR THE INDUSTRIAL ECONOMY</div>
              <h1>
                Where complex
                <span>operations</span>
                become clear.
              </h1>
              <p className="hero__lead">
                CenNext is the reliable operational partner behind the details that keep B2B manufacturing moving.
              </p>
              <div className="hero__actions">
                <a className="btn btn-primary" href="#services">
                  Explore capabilities <ArrowUpRight size={17} aria-hidden="true" />
                </a>
                <a className="text-link text-link--light" href="#contact">
                  Start a conversation <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="hero__aside">
              <div className="hero__aside-label">CENNEXT / EST. 2014</div>
              <div className="hero__aside-rule" aria-hidden="true" />
              <p>Structured support for the work your customers never see.</p>
            </div>
          </div>
          <div className="container hero__footer">
            <div className="hero__scroll-note">
              <span className="hero__scroll-dot" aria-hidden="true" />
              <span>Scroll to explore</span>
            </div>
            <div className="hero__location">HANOI · VIETNAM</div>
          </div>
        </section>

        <section className="signal-band" aria-label="Company highlights">
          <div className="container signal-band__inner">
            <div className="signal-band__intro">A calmer way to scale the back office</div>
            <div className="signal-band__stats">
              <div className="stat"><strong>10<span>+</span></strong><small>Years of growth</small></div>
              <div className="stat"><strong>03</strong><small>Offices</small></div>
              <div className="stat"><strong>18<span>+</span></strong><small>People in motion</small></div>
              <div className="stat"><strong>08<span>+</span></strong><small>Success projects</small></div>
            </div>
          </div>
        </section>

        <section className="about-section section-pad" id="about">
          <div className="container about-section__grid">
            <div className="section-index">01 <span>/</span> 04</div>
            <div className="about-section__copy">
              <SectionLabel>ABOUT CENNEXT</SectionLabel>
              <h2>Good operations create room for <em>better</em> decisions.</h2>
            </div>
            <div className="about-section__detail">
              <p className="lead-copy">We provide professional BPO services for a leading B2B platform connecting buyers and suppliers across manufacturing and industry.</p>
              <p className="body-copy">From data-rich catalogues to technical modelling, our teams bring focus, consistency and care to the work that sits between a great product and the people looking for it.</p>
              <a className="text-link" href="#method">How we work <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="services-section section-pad" id="services">
          <div className="container">
            <div className="services-section__head">
              <div>
                <SectionLabel>OUR SERVICES</SectionLabel>
                <h2>Precision where it matters.</h2>
              </div>
              <p>Three ways we help ambitious industrial businesses make complexity feel manageable.</p>
            </div>
            <div className="capability-list">
              {capabilities.map((capability) => (
                <a className="capability-card" href="#contact" key={capability.number}>
                  <div className="capability-card__top">
                    <span className="capability-card__number">{capability.number}</span>
                    <span className="capability-card__tag">{capability.tag}</span>
                  </div>
                  <div className="capability-card__main">
                    <div>
                      <h3>{capability.title}</h3>
                      <p>{capability.description}</p>
                    </div>
                    <span className="capability-card__arrow" aria-hidden="true"><ArrowUpRight size={22} /></span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="method-section section-pad" id="method">
          <div className="container method-section__grid">
            <div className="method-section__intro">
              <SectionLabel light>OUR METHOD</SectionLabel>
              <h2>Make the details work harder.</h2>
              <p>Clear thinking, careful execution and an operating rhythm built around your goals.</p>
              <div className="method-section__seal"><span>CN</span><small>OPERATIONS<br />WITH INTENT</small></div>
            </div>
            <div className="method-steps">
              {steps.map((step) => (
                <div className="method-step" key={step.number}>
                  <div className="method-step__number">{step.number}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                  <Plus className="method-step__plus" size={19} strokeWidth={1.5} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="proof-section section-pad">
          <div className="container proof-section__inner">
            <div className="proof-section__mark" aria-hidden="true">“</div>
            <blockquote>Built for the details your customers never see — and the results they always do.</blockquote>
            <div className="proof-section__footer"><span>THE CENNEXT PROMISE</span><span className="proof-section__line" aria-hidden="true" /><span>01 / 01</span></div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container contact-section__inner">
            <div className="contact-section__copy">
              <SectionLabel>START A CONVERSATION</SectionLabel>
              <h2>Let&apos;s make your next workflow <em>lighter.</em></h2>
              <a className="btn btn-dark" href="mailto:hr.recruitment@cennext.com">Get in touch <ArrowUpRight size={17} aria-hidden="true" /></a>
            </div>
            <div className="contact-section__details">
              <div className="contact-detail"><span>VISIT US</span><p>Building D, No. 22 Thanh Cong Street,<br />Giang Vo Ward, Hanoi</p></div>
              <div className="contact-detail"><span>EMAIL</span><a href="mailto:hr.recruitment@cennext.com">hr.recruitment@cennext.com</a></div>
              <div className="contact-detail"><span>FOLLOW</span><p>LinkedIn&nbsp;&nbsp; / &nbsp;&nbsp;Facebook&nbsp;&nbsp; / &nbsp;&nbsp;TikTok</p></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div><BrandMark /><p>Where you find smart.</p></div>
          <div className="site-footer__meta"><span>© 2026 CenNext</span><span className="prototype-note"><Check size={13} aria-hidden="true" /> Prototype · Content Test pending</span></div>
          <a className="footer-top" href="#top" aria-label="Back to top">Back to top <ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
      </footer>
    </div>
  );
}

export { BrandMark, SectionLabel };

