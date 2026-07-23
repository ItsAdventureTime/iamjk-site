import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JK de Guzman | Systems, infrastructure, and clear thinking",
  description:
    "The personal site of Juan Karlo de Guzman, an AI infrastructure engineer, educator, and founder-operator based in the Philippines.",
};

const disciplines = [
  {
    number: "01",
    title: "AI infrastructure",
    body: "Self-hosted LLM systems, GPU inference, automation, and the Linux layers that make them dependable.",
    tags: ["LLMOps", "GPU inference", "Containers"],
  },
  {
    number: "02",
    title: "Language & learning",
    body: "Practical English education that makes room for confidence, context, and the real work people need to do.",
    tags: ["ESL", "Pronunciation", "Communication"],
  },
  {
    number: "03",
    title: "Operations & systems",
    body: "Clearer handoffs, better documentation, and calm execution across technical and human workflows.",
    tags: ["Automation", "Project work", "Documentation"],
  },
];

const method = [
  ["01", "Deploy", "Put the system in the real world."],
  ["02", "Observe", "Read the logs and watch the edges."],
  ["03", "Isolate", "Find the boundary where the assumption breaks."],
  ["04", "Document", "Leave the next person a map, not a mystery."],
];

export default function Home() {
  return (
    <main>
      <header className="site-header shell">
        <a className="wordmark" href="#top" aria-label="JK home">
          <span className="wordmark-mark">JK</span>
          <span className="wordmark-type">de Guzman</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#method">Method</a>
          <a className="nav-contact" href="#contact">
            Say hello <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <div id="top" className="shell page-grid">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Systems / Communication / Curiosity</p>
            <h1 id="hero-title">
              I build <em>calm</em> systems for complicated work.
            </h1>
            <p className="hero-intro">
              I&apos;m JK, an AI infrastructure engineer, educator, and founder-operator. I work at the seam between dependable technology and clear human communication.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">Explore the work <span aria-hidden="true">↓</span></a>
              <a className="text-link" href="#contact">Start a conversation <span aria-hidden="true">↗</span></a>
            </div>
          </div>

          <div className="hero-art" aria-label="A systems field note showing layered infrastructure and an observation log">
            <div className="art-topline"><span>FIELD NOTE / 001</span><span>MARIKINA · PH</span></div>
            <div className="art-core">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="core-glow" />
              <div className="core-label">observe<br /><strong>the system</strong></div>
              <span className="signal signal-one" />
              <span className="signal signal-two" />
              <span className="signal signal-three" />
            </div>
            <div className="art-log">
              <div><span className="log-prompt">$</span> inspect --assumptions</div>
              <div className="log-muted">layers found: <b>05</b></div>
              <div className="log-muted">failure mode: <b className="log-accent">isolated</b></div>
              <div className="log-status"><span /> system steady</div>
            </div>
            <span className="art-index">01—04</span>
          </div>
        </section>

        <section className="signal-strip" aria-label="Current focus">
          <span>Current focus</span>
          <strong>AI infrastructure / DevOps / LLMOps</strong>
          <span className="strip-rule" />
          <span>Based in</span>
          <strong>Marikina City, Philippines</strong>
        </section>

        <section id="work" className="section work-section" aria-labelledby="work-title">
          <div className="section-heading">
            <p className="eyebrow">01 / The intersection</p>
            <h2 id="work-title">Different disciplines.<br /><em>One operating system.</em></h2>
          </div>
          <div className="discipline-grid">
            {disciplines.map((item) => (
              <article className="discipline-card" key={item.number}>
                <div className="card-number">{item.number}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="tag-row">
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="method" className="section method-section" aria-labelledby="method-title">
          <div className="method-intro">
            <p className="eyebrow">02 / The working model</p>
            <h2 id="method-title">Reverse-engineering is a <em>way of seeing.</em></h2>
            <p>I learn by doing the work for real: deploy, break an assumption, inspect what happened, and fix the underlying cause. The result is usually simpler than the first idea.</p>
          </div>
          <ol className="method-list">
            {method.map(([number, title, body]) => (
              <li key={number}>
                <span className="method-number">{number}</span>
                <span className="method-title">{title}</span>
                <span className="method-body">{body}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="note-section" aria-label="A personal note">
          <div className="note-pin" aria-hidden="true" />
          <p className="eyebrow">A note from the desk</p>
          <blockquote>“The goal is not to make complexity disappear. It is to make the boundaries visible enough that people can work with it.”</blockquote>
          <p className="note-signoff">— JK</p>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <p className="eyebrow">03 / Open channel</p>
          <div className="contact-layout">
            <h2 id="contact-title">Let&apos;s make the next system <em>make sense.</em></h2>
            <div className="contact-copy">
              <p>I&apos;m interested in thoughtful technical work, useful collaborations, and conversations where the details matter.</p>
              <a className="button button-light" href="mailto:hello@iamjk.site">Email JK <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <span>© 2026 Juan Karlo de Guzman</span>
          <span>Built with intent · iamjk.site</span>
        </footer>
      </div>
    </main>
  );
}
