import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal archive",
  description:
    "The personal site of Juan Karlo “JK” de Guzman: faith, language, curiosity, craft, and the life between the tabs.",
};

const interests = [
  { number: "01", title: "Conviction", body: "Christian faith, theology, grace, and the convictions that shape how I see the world and treat people.", color: "oxide" },
  { number: "02", title: "Language", body: "Teaching English, sharpening communication, and helping people say what they actually mean.", color: "forest" },
  { number: "03", title: "Curiosity", body: "Books, history, AI, Linux, economics, and the satisfaction of following a question all the way down.", color: "brass" },
  { number: "04", title: "Craft", body: "Good writing, useful systems, thoughtful design, and the discipline of making things properly.", color: "slate" },
];

const nowItems = [
  ["reading", "slowly, with a pencil nearby"],
  ["learning", "how ideas, people, and systems connect"],
  ["building", "a better home for the things I think about"],
  ["keeping", "my standards high and my explanations clear"],
];

export default function Home() {
  return (
    <main id="top" className="site-shell">
      <header className="site-header shell">
        <a className="wordmark" href="#top" aria-label="JK home"><span className="wordmark-mark">JK</span><span className="wordmark-copy">personal archive</span></a>
        <nav aria-label="Primary navigation"><a href="#about">About</a><a href="#interests">Interests</a><a href="#now">Now</a><a className="nav-button" href="#contact">Contact</a></nav>
      </header>

      <div className="shell">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="kicker"><span className="kicker-rule" /> Personal archive / Marikina, Philippines / 1988—present</p>
            <h1 id="hero-title">No single <span>lane.</span></h1>
            <p className="hero-lede">I&apos;m Juan Karlo “JK” de Guzman.</p>
            <p className="hero-body">This is the part of the internet where I can be more than a job description: a Christian, teacher, builder, reader, and student of the world around me.</p>
            <a className="ink-link" href="#about">Enter the archive <span aria-hidden="true">↘</span></a>
          </div>

          <div className="hero-board" aria-label="A personal archive board for JK">
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
            <h2 id="about-title">More than a title.</h2>
            <p>I&apos;ve never been especially interested in being reduced to one neat label. I like the overlap between disciplines, where technology meets communication, where theology meets ordinary life, and where learning becomes something useful.</p>
            <p>I&apos;m drawn to things with structure and substance. Clear words. Honest work. Good questions. Systems that hold up. Faith that is lived, not merely displayed.</p>
            <div className="about-signature">— JK</div>
          </div>
        </section>

        <section id="interests" className="interests-section" aria-labelledby="interests-title">
          <div className="section-intro"><div className="section-label">02 / Interests</div><h2 id="interests-title">The things I take seriously.</h2></div>
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
          <div className="now-heading"><div className="section-label">03 / Current page</div><h2 id="now-title">What&apos;s on the desk.</h2><p className="now-updated">Updated July 2026</p></div>
          <div className="now-list">{nowItems.map(([label, value]) => <div className="now-row" key={label}><span className="now-label">{label}</span><span className="now-value">{value}</span></div>)}</div>
        </section>

        <section className="statement-section" aria-label="A personal statement"><p className="statement-kicker">A working principle</p><blockquote>Build a life with enough substance that it does not need to announce itself.</blockquote><span className="statement-mark" aria-hidden="true">✳</span></section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title"><div className="contact-line" aria-hidden="true" /><div className="section-label">04 / Contact</div><h2 id="contact-title">If you want to talk, write.</h2><p>No funnel. No pitch deck. Just an open line for a thoughtful note, a good question, or a conversation worth having.</p><a className="button button-dark" href="mailto:hello@iamjk.site">Email JK <span aria-hidden="true">↗</span></a></section>

        <footer className="site-footer"><span>© 2026 Juan Karlo de Guzman</span><span>iamjk.site / personal archive</span><a href="#top">Back to top ↑</a></footer>
      </div>
    </main>
  );
}
