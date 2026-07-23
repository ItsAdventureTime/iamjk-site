import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal archive",
  description:
    "A personal website for JK de Guzman in Marikina, Philippines: faith, language, technology, books, and the questions he keeps coming back to.",
};

const interests = [
  { number: "01", title: "Faith", body: "Christian faith and Reformed theology. I’m interested in what people believe and how those beliefs shape everyday life.", color: "oxide" },
  { number: "02", title: "Language", body: "I teach English and care about the difference a clear sentence can make.", color: "forest" },
  { number: "03", title: "Technology", body: "AI, Linux, web infrastructure, phones, browsers, and the fun of finding out what is happening under the hood.", color: "brass" },
  { number: "04", title: "Ideas & design", body: "Books, film, psychology, science, visual design, and the small details that make something work well.", color: "slate" },
];

const nowItems = [
  ["reading", "books, essays, and anything that makes me stop and think"],
  ["learning", "more about AI systems, infrastructure, and the web"],
  ["teaching", "practical English that people can actually use"],
  ["making", "this site into a better home for the things I care about"],
];

export default function Home() {
  return (
    <main id="main-content" className="site-shell">
      <header className="site-header shell">
        <a className="wordmark" href="#main-content" aria-label="JK home"><span className="wordmark-mark">JK</span><span className="wordmark-copy">personal archive</span></a>
        <nav aria-label="Primary navigation"><a href="#about">About</a><a href="#interests">Interests</a><a href="#now">Now</a><a className="nav-button" href="#contact">Contact</a></nav>
      </header>

      <div className="shell">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="kicker"><span className="kicker-rule" /> Personal website / Marikina, Philippines / 1988—present</p>
            <h1 id="hero-title">I&apos;m <span>JK.</span></h1>
            <p className="hero-lede">I&apos;m Juan Karlo “JK” de Guzman.</p>
            <p className="hero-body">I live in Marikina, Philippines, and I’m interested in how people, ideas, and systems fit together. This is where I keep the personal stuff: what I’m learning, what I care about, and what I’m working on.</p>
            <a className="ink-link" href="#about">A little about me <span aria-hidden="true">↘</span></a>
          </div>

          <div className="hero-board" aria-hidden="true">
            <div className="board-header"><span>INDEX / 001</span><span>JKD</span></div>
            <div className="board-monogram"><span>J</span><strong>K</strong></div>
            <div className="board-caption">PERSONAL<br /><b>ARCHIVE</b></div>
            <div className="board-lines" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="board-footer"><span>FAITH</span><span>LANGUAGE</span><span>IDEAS</span><span>CRAFT</span></div>
            <div className="board-stamp">PH<br /><b>∞</b></div>
          </div>
        </section>

        <section id="about" className="about-section section-rule" aria-labelledby="about-title">
          <div className="section-label">01 / About</div>
          <div className="about-copy">
            <h2 id="about-title">A little context.</h2>
            <p>I’ve worked across technology, education, operations, and communication. Those threads still show up in how I think: I like understanding how things work, explaining them clearly, and making useful things that hold up.</p>
            <p>I’m a Christian, an English teacher, and a lifelong learner. I read widely, ask a lot of questions, and try to stay honest about what I know and what I’m still figuring out.</p>
            <div className="about-signature">JK</div>
          </div>
        </section>

        <section id="interests" className="interests-section" aria-labelledby="interests-title">
          <div className="section-intro"><div className="section-label">02 / Interests</div><h2 id="interests-title">The stuff I come back to.</h2></div>
          <div className="interest-grid">
            {interests.map((interest) => (
              <article className={`interest-card interest-card-${interest.color}`} key={interest.number}>
                <div className="interest-topline"><span>{interest.number}</span><span className="interest-mark" aria-hidden="true" /></div>
                <h3>{interest.title}</h3><p>{interest.body}</p><span className="interest-rule" aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section id="now" className="now-section section-rule" aria-labelledby="now-title">
          <div className="now-heading"><div className="section-label">03 / Now</div><h2 id="now-title">What I&apos;m into right now.</h2><p className="now-updated">Last updated July 2026</p></div>
          <div className="now-list">{nowItems.map(([label, value]) => <div className="now-row" key={label}><span className="now-label">{label}</span><span className="now-value">{value}</span></div>)}</div>
        </section>

        <section className="statement-section" aria-label="A personal note"><p className="statement-kicker">A personal note</p><blockquote>I’m still figuring some things out. That’s part of the point.</blockquote><span className="statement-mark" aria-hidden="true">✳</span></section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title"><div className="contact-line" aria-hidden="true" /><div className="section-label">04 / Contact</div><h2 id="contact-title">Say hello.</h2><p>If you’d like to talk about faith, language, technology, books, or something I haven’t thought about yet, send me a note.</p><a className="button button-dark" href="mailto:hello@iamjk.site">Email JK <span aria-hidden="true">↗</span></a></section>

        <footer className="site-footer"><span>© 2026 Juan Karlo de Guzman</span><span>iamjk.site / personal archive</span><a href="#main-content">Back to top ↑</a></footer>
      </div>
    </main>
  );
}
