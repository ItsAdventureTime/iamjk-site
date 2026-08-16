# iamjk.site design guide

**Status:** implementation reference for the current site
**Reviewed:** 2026-08-16
**Audience:** future content, visual, and implementation changes

iamjk.site is a personal field guide for Juan Karlo “JK” de Guzman. It is deliberately personal rather than a work portfolio: visitors should meet a person through his faith, language, systems curiosity, technology shifts, books, ideas, and practical way of learning.

The 2026-08-08 context refresh adds public details about JK’s early Windows 95-era computing, online English teaching since 2019, interdisciplinary study interests, reading habits, need for quiet after social intensity, and preference for inspectable systems with practical convenience. Keep the site human and specific without publishing the source profile itself.

## Product and voice

- Use American English (`en-US`).
- Write in a natural, conversational first-person voice.
- Keep sentences short, clear, and easy to scan.
- Prefer active voice and concrete wording; cut filler, vague claims, and sales language.
- Keep navigation labels, form instructions, and status messages direct and easy to understand.
- Proofread public copy and avoid em dashes or en dashes.
- Prefer concrete details over broad positioning language.
- Keep the tone thoughtful, direct, warm, and slightly curious.
- Do not publish JK’s age or year of birth.
- The public page may mention November 21, Scorpio, Dragon, and the Philippines; it must not identify a more precise city.
- Do not publish a personal email address. The contact section invites people to
  write through the protected form.
- Remove copy that sounds like a generic template, corporate slogan, or artificial call to action.

## Visual direction

The visual language is a dark, masculine field of signals: near-black surfaces, warm amber accents, restrained cool marks, crisp borders, and a shared orbit/network system that changes as visitors move through the page.

It is not a photography-led page. The visual identity comes from:

- one shared fixed canvas field behind the content;
- a CSS-rendered motif for each topic section;
- sparse particles, orbits, axes, nodes, devices, and connectors;
- purposeful typography;
- readable charcoal surfaces placed over motion;
- a strict ban on blur, backdrop blur, glows, and decorative shadows.

The visual system should feel engineered and tactile without becoming a dashboard.

## Tokens

The source of truth is `app/globals.css`. Keep these values aligned with the implementation:

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0c1010` | page and canvas base |
| `--ink-soft` | `#131918` | dark raised surfaces |
| `--ink-raised` | `#1c2522` | readable surface layers |
| `--paper` | `#f4f1eb` | primary text |
| `--paper-soft` | `#cdd4cf` | body copy |
| `--muted` | `#98a29c` | secondary text |
| `--line` | `rgba(241, 238, 232, 0.16)` | quiet borders and separators |
| `--line-strong` | `rgba(241, 238, 232, 0.34)` | readable borders and focus |
| `--accent` | `#c8844a` | warm amber/rust emphasis |
| `--accent-bright` | `#efb36b` | active emphasis and key words |
| `--cool` | `#9eb9b2` | cool signal details |
| `--rust` | `#b5795f` | secondary signal details |
| `--sage` | `#8d9d86` | tertiary signal details |

Typography uses the broadly available Arial/Helvetica system stack for display and body text, with a monospace stack for labels and metadata. Do not add a remote font dependency without a clear performance and visual reason.

## Layout and section map

The page is one static Astro document at `src/pages/index.astro`, organized as eight navigable sections:

| Section | Topic | Visual role |
|---|---|---|
| Hero | person | opening orbit field and invitation to explore |
| About | faith | personal context and facts |
| Interests | language | recurring subjects represented as four cards |
| Field notes | systems | hands-on learning loop |
| Current stack | technology | Apple-to-Nothing and Linux direction |
| Five signals | strengths | Maximizer, Connectedness, Input, Belief, Individualization |
| Details | individual | personal habits, tastes, and ideas |
| Contact | contact | online-first invitation without an email address |

Desktop uses a wide reading frame with the animated field allowed to cross the composition. Mobile becomes a single readable column. Content surfaces should use available width well, but every visible gap must support hierarchy, scanning, rhythm, or the animation’s breathing room.

Avoid:

- empty viewport-height gaps that separate a heading from its content;
- cards whose fixed height is much taller than their content;
- elements aligned to different invisible baselines;
- text placed directly over high-contrast canvas details;
- decorative objects that compete with the message;
- horizontal overflow at any viewport width.

## Readability surfaces

Text must remain the primary visual signal. Use a semi-transparent charcoal surface with a crisp border when a background motif crosses behind copy:

```css
background: rgba(16, 17, 17, 0.88);
border: 1px solid var(--line-strong);
```

Use stronger opacity on small screens or where the canvas is dense. Do not use `backdrop-filter`, `filter: blur()`, `box-shadow`, or glow effects to repair contrast. The content should remain readable because the surface is dark enough, the type is large enough, and the layout gives it room.

Readable zones are not opaque black panels: the animated field should remain visible at the edges and through the composition around the panel. The panel is a contrast tool, not a second background.

## Motion model

Motion is part of the page’s structure, not decoration:

- The fixed canvas draws the shared orbit/network field.
- The active section changes the field’s phase and label.
- The readout follows the section crossing a fixed viewport focus line, with a visible-section fallback; it uses the visible section’s own number, title, and note while the canvas keeps a separate thematic phase.
- Pointer movement adds restrained parallax on capable devices.
- Scrolling changes the scene target and reveal state; section geometry is sampled only when scroll or resize marks it dirty.
- `IntersectionObserver` adds content reveals without relying on experimental scroll-timeline APIs.
- CSS transforms, opacity, and `requestAnimationFrame` provide the cross-engine baseline.
- GSAP `3.15.0` owns the small interaction layer: `gsap.matchMedia()` scopes
  fine-pointer and reduced-motion behavior, while `ScrollTrigger` drives the
  thin progress cue without scroll-jacking or pinned reading content.
- SmoothUI is used as a visual reference for deliberate surfaces, clear
  interactive states, and compact motion cues. Its React/Tailwind components
  are adapted as Astro/CSS patterns here rather than adding a second UI
  runtime or migrating the page’s architecture.
- Cap canvas pixel density on mobile and stop scheduling frames while the document is hidden; resume cleanly on visibility changes.
- `prefers-reduced-motion: reduce` must remove non-essential movement while retaining content, contrast, and section state.
- Never make text unreadable until an animation completes.

Keep animations short, interruptible, and subordinate to reading. Use transforms and opacity rather than layout-affecting animation. Avoid animating height, top, left, or large paint-heavy effects.

- Keep direct navigation feedback close to 160ms so a click or tap feels immediate.
- Keep reveal transitions short enough that content never feels blocked while a
  visitor scrolls; reduced motion must collapse all transition and animation
  delays.

## Responsive rules

- Test at narrow mobile widths, including 320px, 375px, and 390px, plus desktop widths around 1280px and 1440px.
- Use `100dvh` only where dynamic viewport height is intended; do not force content into a fixed mobile viewport.
- Respect safe-area insets for fixed or edge-adjacent controls.
- Allow long headings and body copy to wrap naturally.
- Stack the four interest cards and the two detail columns on small screens.
- Keep the canvas decorative and behind content; it must never create horizontal scrolling.
- Keep primary navigation links and the “Say hello” CTA in a visible control
  group with centered labels and a shared 48px minimum height. On narrow
  screens, let the navigation rail scroll horizontally instead of shrinking or
  hiding the controls needed to understand the page.
- Below 560px, keep every primary section reachable through the touch-safe,
  horizontally scrollable navigation rail; only the rail may scroll, never the
  page viewport.
- Use a touch-safe interaction model. Pointer-only effects must be optional and must not be required to discover content.

## Accessibility and browser baseline

- Keep `<html lang="en-US">`, the skip link, landmarks, heading hierarchy, labels, and visible `:focus-visible` styles.
- Decorative canvas and scene motifs remain `aria-hidden="true"`.
- Do not use color alone to communicate meaning.
- Keep contrast strong enough for body copy and metadata on the charcoal surfaces.
- The contact form must retain native validation, announce pending/success/error
  feedback through its live status, and expose its busy state to assistive tech.
- Use standard Canvas 2D, `requestAnimationFrame`, `IntersectionObserver`, CSS Grid, transforms, and custom properties.
- Avoid relying on experimental `animation-timeline` features or browser-specific prefixes.
- The source is designed for Blink, WebKit, and Gecko from a standards baseline. Direct local rendering should be verified in an available browser; actual Firefox, Safari, and Chromium runs should be added to CI when those engines are available.
- Use WCAG 2.2 as the accessibility reference, especially contrast, reflow, focus visibility, and animation from interaction.
- Keep Astro’s static output and canonical site configuration aligned with the official configuration reference.

## Current standards review

The 2026-08-16 review keeps the pinned Astro 7 stack and applies the current
standards baseline without adding a UI framework or client-side routing:

- **WCAG 2.2:** preserve readable contrast, reflow at narrow widths and zoom,
  visible keyboard focus, meaningful headings and labels, and non-motion access
  to every section.
- **WAI-ARIA/APG:** use native landmarks and links first; use
  `aria-current="location"` only for the active same-page section link.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables the continuous
  canvas scheduler, pointer parallax, GSAP entrance motion, and non-essential
  CSS delays. Section/readout changes remain available as static updates when
  the visitor scrolls.
- **GSAP interaction boundary:** `gsap.matchMedia()` owns media-query setup and
  cleanup; `ScrollTrigger` is limited to the scroll-progress indicator. No
  scroll-jacking, pinned reading panels, or layout-affecting animation is used.
- **SmoothUI adaptation:** the site adopts the reference repo’s component-level
  emphasis on visible states, tactile controls, and restrained transitions
  while keeping the existing Astro/CSS architecture and server-rendered page.
- **Responsive interaction:** keep the viewport zoomable, use flexible grids,
  preserve source-order reading flow, and give primary touch targets at least
  44px of usable height where the layout permits. The primary navigation and
  “Say hello” CTA use a 48px minimum height in the current implementation.
- **Astro baseline:** keep static output and the existing Node adapter; do not
  adopt View Transitions or another animation layer unless the page gains
  multi-route navigation and the accessibility behavior is tested.

Reference pages reviewed:

- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/ARIA/apg/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- https://www.w3.org/WAI/WCAG22/Techniques/css/C39
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-behavior
- https://web.dev/articles/accessible-responsive-design
- https://docs.astro.build/en/guides/view-transitions/
- https://astro.build/blog/astro-7/
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://github.com/educlopez/smoothui

## Change checklist

Before accepting a visual change:

1. Run `jk-sbx-project ensure` and verify `jk-sbx-project exec ./scripts/sandbox-node.sh node --version` reports Node 24.18.0.
2. Run `jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm sh -c 'CI=true pnpm install --frozen-lockfile && CI=true pnpm run check && CI=true pnpm test'`.
3. Confirm `dist/index.html` and `dist/_astro/*.js` are produced.
4. Run the source and generated-output privacy scans in `SECURITY.md`.
5. Check desktop and mobile widths for overflow, clipping, overlap, and unreadable text; verify that every primary navigation control and the “Say hello” CTA share a 48px height, remain discoverable in the mobile rail, and expose a clear overflow cue when needed.
6. Check keyboard focus, reduced motion, and no-script behavior.
7. Confirm no blur, backdrop blur, shadow, purple/violet palette drift, city-level location, age/year of birth, or email address has returned.
8. Review the diff and keep the generated `dist/` output out of Git.
9. For releases, use `scripts/deploy-vps.sh` so the pinned Node 24 Alpine image is built for the VPS inside the Docker Sandbox, only the saved image is transferred, the rootless Caddyfile is formatted and validated before a graceful reload, endpoint smoke checks run, and only then does the remote VPS Bunny purge happen.

## Implementation source

The implementation is intentionally small:

- `src/pages/index.astro`: page structure, content, canvas script, and metadata.
- `app/globals.css`: tokens, layout, responsive rules, motifs, motion, and contrast surfaces.
- `astro.config.mjs`: static output and canonical site URL.
- `tests/rendered-html.test.mjs`: build-output and design invariant checks.
