# iamjk.site design guide

**Status:** implementation reference for the current site
**Reviewed:** 2026-08-08
**Audience:** future content, visual, and implementation changes

iamjk.site is a personal field guide for Juan Karlo “JK” de Guzman. It is deliberately personal rather than a work portfolio: visitors should meet a person through his faith, language, systems curiosity, technology shifts, books, ideas, and practical way of learning.

The 2026-08-08 context refresh adds public details about JK’s early Windows 95-era computing, online English teaching since 2019, interdisciplinary study interests, reading habits, need for quiet after social intensity, and preference for inspectable systems with practical convenience. Keep the site human and specific without publishing the source profile itself.

## Product and voice

- Use American English (`en-US`).
- Write in a natural, conversational first-person voice.
- Prefer concrete details over broad positioning language.
- Keep the tone thoughtful, direct, warm, and slightly curious.
- Do not publish JK’s age or year of birth.
- The public page may mention November 21, Scorpio, Dragon, and the Philippines; it must not identify a more precise city.
- Do not publish a personal email address. The contact section invites people to look JK up online.
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
| `--ink` | `#080909` | page and canvas base |
| `--ink-soft` | `#101111` | dark raised surfaces |
| `--ink-raised` | `#171817` | readable surface layers |
| `--paper` | `#f1eee8` | primary text |
| `--paper-soft` | `#d2cec5` | body copy |
| `--muted` | `#9a9991` | secondary text |
| `--line` | `rgba(241, 238, 232, 0.16)` | quiet borders and separators |
| `--line-strong` | `rgba(241, 238, 232, 0.34)` | readable borders and focus |
| `--accent` | `#c8844a` | warm amber/rust emphasis |
| `--accent-bright` | `#efb36b` | active emphasis and key words |
| `--cool` | `#9ec5c3` | cool signal details |
| `--rust` | `#b9684d` | secondary signal details |
| `--sage` | `#88967e` | tertiary signal details |

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
- Pointer movement adds restrained parallax on capable devices.
- Scrolling changes the scene target and reveal state.
- `IntersectionObserver` adds content reveals without relying on experimental scroll-timeline APIs.
- CSS transforms, opacity, and `requestAnimationFrame` provide the cross-engine baseline.
- `prefers-reduced-motion: reduce` must remove non-essential movement while retaining content, contrast, and section state.
- Never make text unreadable until an animation completes.

Keep animations short, interruptible, and subordinate to reading. Use transforms and opacity rather than layout-affecting animation. Avoid animating height, top, left, or large paint-heavy effects.

## Responsive rules

- Test at narrow mobile widths, including 320px, 375px, and 390px, plus desktop widths around 1280px and 1440px.
- Use `100dvh` only where dynamic viewport height is intended; do not force content into a fixed mobile viewport.
- Respect safe-area insets for fixed or edge-adjacent controls.
- Allow long headings and body copy to wrap naturally.
- Stack the four interest cards and the two detail columns on small screens.
- Keep the canvas decorative and behind content; it must never create horizontal scrolling.
- Use a touch-safe interaction model. Pointer-only effects must be optional and must not be required to discover content.

## Accessibility and browser baseline

- Keep `<html lang="en-US">`, the skip link, landmarks, heading hierarchy, labels, and visible `:focus-visible` styles.
- Decorative canvas and scene motifs remain `aria-hidden="true"`.
- Do not use color alone to communicate meaning.
- Keep contrast strong enough for body copy and metadata on the charcoal surfaces.
- Use standard Canvas 2D, `requestAnimationFrame`, `IntersectionObserver`, CSS Grid, transforms, and custom properties.
- Avoid relying on experimental `animation-timeline` features or browser-specific prefixes.
- The source is designed for Blink, WebKit, and Gecko from a standards baseline. Direct local rendering should be verified in an available browser; actual Firefox, Safari, and Chromium runs should be added to CI when those engines are available.
- Use WCAG 2.2 as the accessibility reference, especially contrast, reflow, focus visibility, and animation from interaction.
- Keep Astro’s static output and canonical site configuration aligned with the official configuration reference.

## Change checklist

Before accepting a visual change:

1. Run `pnpm run check`.
2. Run `pnpm test`, which builds first and checks the rendered document.
3. Confirm `dist/index.html` and `dist/_astro/*.js` are produced.
4. Run the source and generated-output privacy scans in `SECURITY.md`.
5. Check desktop and mobile widths for overflow, clipping, overlap, and unreadable text.
6. Check keyboard focus, reduced motion, and no-script behavior.
7. Confirm no blur, backdrop blur, shadow, purple/violet palette drift, city-level location, age/year of birth, or email address has returned.
8. Review the diff and keep the generated `dist/` output out of Git.

## Implementation source

The implementation is intentionally small:

- `src/pages/index.astro`: page structure, content, canvas script, and metadata.
- `app/globals.css`: tokens, layout, responsive rules, motifs, motion, and contrast surfaces.
- `astro.config.mjs`: static output and canonical site URL.
- `tests/rendered-html.test.mjs`: build-output and design invariant checks.
