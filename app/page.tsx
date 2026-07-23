import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A personal corner of the internet",
  description:
    "A personal corner of the internet belonging to Juan Karlo “JK” de Guzman: a curious learner, teacher, builder, reader, and Christian from the Philippines.",
};

const threads = [
  {
    number: "01",
    title: "Learning in public",
    body: "I like taking things apart until the pieces start making sense. Lately that has meant systems, AI, Linux, and a lot of patient note-taking.",
    color: "terracotta",
  },
  {
    number: "02",
    title: "Language & connection",
    body: "Teaching English has taught me to notice the small distance between knowing a word and feeling confident enough to use it.",
    color: "olive",
  },
  {
    number: "03",
    title: "Faith & questions",
    body: "Christian faith, theology, grace, and the kind of questions that become more honest when they are given time.",
    color: "blue",
  },
  {
    number: "04",
    title: "Small things with weight",
    body: "Books with margins, useful stationery, thoughtful design, and making ordinary systems feel a little more humane.",
    color: "mustard",
  },
];

const nowItems = [
  ["making", "A home for my thoughts on the web"],
  ["learning", "How ideas, people, and systems connect"],
  ["teaching", "Practical language for real conversations"],
  ["returning to", "Good questions, good books, and quiet mornings"],
];

export default function Home() {
  return (
    <main id="top" className="site-shell">
      <header className="site-header shell">
        <a className="wordmark" href="#top" aria-label="JK home">
          <span className="wordmark-mark">JK</span>
          <span className="wordmark-copy">personal notes</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#threads">Threads</a>
          <a href="#now">Now</a>
          <a className="nav-button" href="#contact">Say hello</a>
        </nav>
      </header>

      <div className="shell">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="kicker"><span className="kicker-mark" /> A personal website · Marikina, Philippines</p>
            <h1 id="hero-title">Hi, I&apos;m <span>JK.</span></h1>
            <p className="hero-lede">This is a small corner of the internet for the things that make me, me.</p>
            <p className="hero-body">I&apos;m a curious person who learns across boundaries: language and theology, teaching and building, ideas and the everyday life where they become useful.</p>
            <a className="ink-link" href="#about">Come in, have a look <span aria-hidden="true">↘</span></a>
          </div>

          <div className="hero-collage" aria-label="An abstract paper collage representing JK">
            <div className="collage-card collage-card-back" />
            <div className="collage-card collage-card-front">
              <div className="portrait-sun" />
              <div className="portrait-arch"><span>J</span><strong>K</strong></div>
              <span className="portrait-caption">a life in progress</span>
              <span className="portrait-date">1988 → ∞</span>
            </div>
            <div className="collage-note">
              <span>hello</span>
              <small>glad you&apos;re here</small>
            </div>
            <div className="collage-stamp">PH<br /><b>∞</b></div>
          </div>
        </section>

        <section id="about" className="about-section section-rule" aria-labelledby="about-title">
          <div className="section-label">01 / A little about me</div>
          <div className="about-copy">
            <h2 id="about-title">I&apos;m not just one thing.</h2>
            <p>My life makes more sense as a collection of threads than as a single title. I care about understanding how things work, helping people find their voice, and staying awake to the questions underneath the obvious ones.</p>
            <p>Some days that looks like teaching. Some days it looks like reading, troubleshooting, writing, praying, or building a small system that makes tomorrow easier. I like the overlap.</p>
            <div className="about-signature">— JK</div>
          </div>
        </section>

        <section id="threads" className="threads-section" aria-labelledby="threads-title">
          <div className="section-intro">
            <div className="section-label">02 / The threads</div>
            <h2 id="threads-title">A few things I keep coming back to.</h2>
          </div>
          <div className="thread-grid">
            {threads.map((thread) => (
              <article className={`thread-card thread-card-${thread.color}`} key={thread.number}>
                <div className="thread-topline"><span>{thread.number}</span><span className="thread-dot" aria-hidden="true" /></div>
                <h3>{thread.title}</h3>
                <p>{thread.body}</p>
                <span className="thread-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section id="now" className="now-section section-rule" aria-labelledby="now-title">
          <div className="now-heading">
            <div className="section-label">03 / At the moment</div>
            <h2 id="now-title">What&apos;s on my desk.</h2>
            <p className="now-updated">Updated July 2026 · give or take</p>
          </div>
          <div className="now-list">
            {nowItems.map(([label, value]) => (
              <div className="now-row" key={label}>
                <span className="now-label">{label}</span>
                <span className="now-value">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="quote-section" aria-label="A personal note">
          <span className="quote-mark" aria-hidden="true">“</span>
          <blockquote>Pay attention to what makes you more human.</blockquote>
          <p>That&apos;s usually where the good work begins.</p>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-doodle" aria-hidden="true"><span /><span /><span /></div>
          <div className="section-label">04 / Open door</div>
          <h2 id="contact-title">If you found your way here, say hello.</h2>
          <p>I&apos;m always glad to meet a thoughtful person, hear a good question, or trade notes about something worth caring about.</p>
          <a className="button button-dark" href="mailto:hello@iamjk.site">Write to JK <span aria-hidden="true">↗</span></a>
        </section>

        <footer className="site-footer">
          <span>© 2026 Juan Karlo de Guzman</span>
          <span>Made with care · iamjk.site</span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </main>
  );
}
