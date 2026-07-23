export const metadata = {
  title: "JK de Guzman | A personal field guide",
  description:
    "A personal field guide to JK de Guzman: a systems-minded learner, English teacher, Christian, and curious human in Marikina, Philippines.",
};

const strengths = [
  ["01", "Maximizer", "I keep asking how a good thing could become a better one."],
  ["02", "Connectedness", "I notice the threads between people, ideas, systems, and the bigger picture."],
  ["03", "Input", "I collect books, notes, tools, questions, and anything worth returning to."],
  ["04", "Belief", "Clear values make decisions steadier, especially when things get complicated."],
  ["05", "Individualization", "I pay attention to what makes a person distinct and what helps them do their best work."],
];

const interests = [
  ["Faith", "A Christian shaped by Scripture, Reformed theology, and the conviction that what we believe changes how we live."],
  ["Language", "English teaching, pronunciation, clear writing, and the small difference a well-made sentence can make."],
  ["Systems", "Linux, AI infrastructure, browsers, phones, networks, containers, and the satisfying moment when the logs finally make sense."],
  ["Ideas", "Theology, psychology, science, philosophy, visual design, business systems, and films that leave a door open in your mind."],
];

const signalDots = Array.from({ length: 68 }, (_, index) => index);

export default function Home() {
  return (
    <main id="main-content" className="site-shell">
      <header className="site-header" aria-label="Site header">
        <a className="brand" href="#top" aria-label="JK de Guzman home">
          <span className="brand-mark">JK</span>
          <span className="brand-name">Juan Karlo de Guzman</span>
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#interests">Interests</a>
          <a href="#field-notes">Field notes</a>
          <a className="nav-cta" href="#contact">Say hello <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section id="top" className="hero section-frame" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> Personal field guide / Marikina, Philippines</p>
          <h1 id="hero-title">A person is a <em>collection</em> of connections.</h1>
          <p className="hero-deck">I&apos;m JK. I teach, troubleshoot, read, build, and keep following the threads between things.</p>
          <a className="primary-link" href="#about">Start here <span aria-hidden="true">↓</span></a>
        </div>

        <div className="signal-wrap" aria-hidden="true">
          <div className="signal-halo signal-halo-one" />
          <div className="signal-halo signal-halo-two" />
          <div className="signal-sphere">
            {signalDots.map((dot) => <span key={dot} className="signal-dot" />)}
            <span className="signal-core" />
          </div>
          <span className="signal-caption signal-caption-top">PERSON / SYSTEM / STORY</span>
          <span className="signal-caption signal-caption-bottom">INPUT → CONNECTION → MEANING</span>
        </div>

        <div className="hero-footer" aria-hidden="true">
          <span>SCROLL TO EXPLORE</span>
          <span className="hero-line" />
          <span>001 / 006</span>
        </div>
      </section>

      <section id="about" className="about section-frame" aria-labelledby="about-title">
        <div className="section-intro">
          <p className="section-index">01 / About</p>
          <p className="section-note">A little context</p>
        </div>
        <div className="about-grid">
          <h2 id="about-title">Hello, I&apos;m <em>JK.</em></h2>
          <div className="about-copy">
            <p className="lead-copy">I&apos;m Juan Karlo de Guzman, usually just JK. I live in Marikina City, Philippines, and I move between technology, communication, education, operations, theology, and design.</p>
            <p>I&apos;m drawn to things with layers. A Linux system. A difficult paragraph. A church tradition. A person&apos;s particular way of seeing the world. I like taking something apart carefully, understanding what each piece does, then putting it back together so it is clearer and more useful.</p>
            <p>English and Filipino are part of my daily life, and Taglish is never far away. I teach English with a practical, conversational bias. I care about confidence, pronunciation, and the moment a learner realizes they can say the thing they were trying to say.</p>
          </div>
        </div>
        <div className="about-facts" aria-label="A few facts about JK">
          <div><span>Based in</span><strong>Marikina City, PH</strong></div>
          <div><span>Speaks</span><strong>English / Filipino</strong></div>
          <div><span>Birthday</span><strong>November 21 · Scorpio</strong></div>
          <div><span>Chinese zodiac</span><strong>Dragon</strong></div>
        </div>
      </section>

      <section id="interests" className="interests section-frame" aria-labelledby="interests-title">
        <div className="section-intro">
          <p className="section-index">02 / Interests</p>
          <p className="section-note">The recurring subjects</p>
        </div>
        <div className="section-heading-row">
          <h2 id="interests-title">The things I <em>come back to.</em></h2>
          <p>Not a finished list. More like a map of the questions that keep opening into other questions.</p>
        </div>
        <div className="interest-grid">
          {interests.map(([title, body], index) => (
            <article className={`interest-card interest-card-${index + 1}`} key={title}>
              <span className="card-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section id="field-notes" className="field-notes section-frame" aria-labelledby="field-notes-title">
        <div className="section-intro">
          <p className="section-index">03 / Field notes</p>
          <p className="section-note">How I tend to work</p>
        </div>
        <div className="notes-grid">
          <div>
            <h2 id="field-notes-title">I learn by <em>getting my hands on it.</em></h2>
            <p className="notes-lede">Deploy it. Test the assumption. Read the logs. Find the boundary. Fix the underlying thing. Document what happened.</p>
            <p>That loop works for infrastructure, a new browser, a teaching material, a design system, or a question I cannot stop thinking about. I prefer evidence to confident-sounding guesses, and I like explanations that survive contact with the real world.</p>
          </div>
          <ol className="process-list" aria-label="JK's learning loop">
            <li><span>01</span><strong>See the whole system</strong><small>What is connected to what?</small></li>
            <li><span>02</span><strong>Make the boundaries visible</strong><small>Where does state live? What can fail?</small></li>
            <li><span>03</span><strong>Try the practical version</strong><small>Build a small thing and watch it behave.</small></li>
            <li><span>04</span><strong>Leave a clearer trail</strong><small>Test, fix, explain, and make it reproducible.</small></li>
          </ol>
        </div>
      </section>

      <section className="strengths section-frame" aria-labelledby="strengths-title">
        <div className="section-intro">
          <p className="section-index">04 / Five signals</p>
          <p className="section-note">CliftonStrengths · top five</p>
        </div>
        <div className="section-heading-row">
          <h2 id="strengths-title">A useful shorthand, <em>not a box.</em></h2>
          <p>These five themes describe some of the patterns I recognize in myself: improving, connecting, collecting, grounding, and noticing the individual.</p>
        </div>
        <div className="strength-list">
          {strengths.map(([number, title, body]) => (
            <article className="strength-row" key={title}>
              <span className="strength-number">{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="strength-symbol" aria-hidden="true">+</span>
            </article>
          ))}
        </div>
      </section>

      <section className="details section-frame" aria-labelledby="details-title">
        <div className="section-intro">
          <p className="section-index">05 / Small details</p>
          <p className="section-note">The texture around the edges</p>
        </div>
        <div className="details-grid">
          <h2 id="details-title">A few things that make me <em>me.</em></h2>
          <div className="detail-columns">
            <ul>
              <li>Left-handed. Usually carrying a black 0.4 or 0.5 mm gel pen.</li>
              <li>Drawn to modern, rounded typography and careful spacing.</li>
              <li>Fond of early internet nostalgia and Netscape-era computing.</li>
              <li>Likes privacy tools, browser-engine rabbit holes, and hardware comparisons.</li>
            </ul>
            <ul>
              <li>Reads theology, psychology, science, philosophy, and whatever makes me pause.</li>
              <li>Keeps a Kindle Oasis nearby and still enjoys a good paper pad.</li>
              <li>Favorite worlds include <em>Interstellar</em>, <em>Dark</em>, <em>Touch</em>, and <em>Inception</em>.</li>
              <li>Believes AI should assist people, not erase the value of human work.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="contact" className="contact section-frame" aria-labelledby="contact-title">
        <div className="contact-signal" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        <p className="section-index">06 / Contact</p>
        <h2 id="contact-title">If one of these threads <em>crosses yours,</em> say hello.</h2>
        <p className="contact-copy">Talk to me about faith, language, systems, books, the web, or a question that has been following you around.</p>
        <a className="primary-link primary-link-large" href="mailto:hello@iamjk.site">Email JK <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="site-footer">
        <span>© 2026 Juan Karlo de Guzman</span>
        <span>iamjk.site / a personal field guide</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
