---
name: kyros-rules
description: Hard constraints for Kyros site builds. NEVER/ALWAYS rules that override defaults.
tags: [kyros, rules, constraints, mandatory]
---

# Site Generator — Rules (Machine-Parseable)

_Hard constraints. Always enforce. No exceptions unless explicitly overridden in client brief._
_Last updated: 2026-04-04_

---

## NEVER DO

- NEVER put the logo in the hero section — nav only
- NEVER use Instrument Serif or Syne fonts
- NEVER use "AI-powered" in copy
- NEVER use flashy announcement badges/pills in hero
- NEVER advertise preview links publicly — for qualified leads only
- NEVER use `position:fixed` on canvas elements behind video backgrounds
- NEVER apply CSS scroll-snap on `html` element
- NEVER include AGENTS.md or workspace files in client repos
- NEVER preview video assets via `file://` — always use a local server
- NEVER deploy with adversarial score below 3.5
- NEVER use stock photos — solid gradients or real client imagery only
- NEVER use emoji as icons — SVG only
- NEVER include FAQ sections, Blog/News sections, or social links unless explicitly requested
- NEVER use generic AI slop copy — run through stop-slop filter
- NEVER pick colors without a logo — extract from client logo or ask
- NEVER include fake testimonials in final delivery (placeholder only)
- NEVER put arrows on secondary CTAs
- NEVER use "Learn More" as CTA text — use specific action verbs
- NEVER use em dashes (—) anywhere in content or code
- NEVER use rounded-full/pill-shaped CTA buttons — looks cheap and AI-generated. Sharp rectangles only (0-4px radius max).
- NEVER use bright accent colors (golden, orange) for header or large section backgrounds — accent is for buttons and small highlights only. Dark sections use warm brown (#3B2F1E or similar).
- NEVER use generic SVG line icons for trust badges or main content — use real project photography as card backgrounds instead

---

## ALWAYS DO

- ALWAYS extract color palette from client logo
- ALWAYS put logo in nav (left-aligned)
- ALWAYS use clamp() for responsive font sizing
- ALWAYS include: Services section, Contact/CTA band, Footer
- ALWAYS use SVG icons, not emoji
- ALWAYS run copy through stop-slop filter before finalizing
- ALWAYS use section padding: 96px vertical desktop / 64px mobile
- ALWAYS use `<hr class="section-rule">` between sections (1px divider)
- ALWAYS test mobile at 375px
- ALWAYS verify adversarial score ≥ 3.5 before delivery
- ALWAYS clean AGENTS.md and workspace files from client repos before delivery
- ALWAYS use one primary CTA per section
- ALWAYS verify with actual browser before saying done

---

## TYPOGRAPHY RULES

- Headlines: clamp sizing, `clamp(2.6rem, 5.5vw, 4.2rem)` for hero
- Line height: 1.1–1.2 for headlines, 1.6–1.8 for body
- Section eyebrows: ALL CAPS, 0.65–0.72rem, weight 700, letter-spacing 0.14–0.16em
- Body text: 0.875–0.965rem, muted color
- Rejected fonts: Instrument Serif, Syne

---

## LAYOUT RULES

- Max content width: 1080–1280px
- Narrow text blocks: 480–640px
- Card padding: 24–28px
- Grid gaps: 16–28px
- Section order: Nav → Hero → Stats (opt) → Logo Strip (opt) → Services → About → Gallery (opt) → Pricing (opt) → Contact → Footer

---

## ANIMATION RULES

- Canvas hero: horizontal ribbon motion, delta ~0.012/frame, NOT frantic
- Video hero: documentary feel, 8-second loops, hide watermarks with `scale(1.1)`
- Scroll: fade-up on viewport enter
- Card hover: `translateY(-5px)` with `cubic-bezier(0.22,1,0.36,1)`
- Image hover: scale 1.03–1.05x
- NO: dramatic spray/smoke/mist/dust cloud effects
- NO: generic bounce, elastic overshoot animations

---

## CTA RULES

- CTA copy is business-type specific (see kyros-defaults skill)
- Hero: 1–2 buttons max
- Nav: single filled CTA button (not text link)
- Contact section: phone/email as links, not buttons
- No arrows on secondary CTAs

---

## SCROLL SNAP RULES

- Scroll snap is situational — not a default
- If used: apply to scroll container or `body`, NOT `html`
- Use JS wheel intercept as fallback for mobile

---

## CONFLICT RESOLUTION

When rules conflict, apply in this priority order:

1. **Client explicit override** — if the client brief specifies something, it wins
2. **Accessibility** — WCAG compliance beats aesthetic preference every time
3. **NEVER rules** — hard stops override defaults
4. **ALWAYS rules** — defaults apply when nothing above overrides
5. **Defaults (kyros-defaults skill)** — fill remaining gaps

**Common conflicts and resolutions:**

| Conflict | Resolution |
|---|---|
| Logo is monochrome (black/white only) | Use logo as-is for nav; derive accent from industry defaults; ask Matt before picking a palette color |
| Client brief conflicts with a NEVER rule | Flag it — don't silently override. Ask before proceeding. |
| Two ALWAYS rules contradict each other | Apply the more specific one; flag in review notes |
| No logo provided | Ask before picking colors. Do not default to a generic palette. |
| Logo colors fail WCAG contrast | Adjust lightness/darkness to meet 4.5:1 ratio; keep hue. Flag the change in review. |

**When in doubt: ask. Don't guess on color, don't guess on structure.**

---

## ACCESSIBILITY RULES

- **Contrast (text on background):** Minimum 4.5:1 ratio (WCAG AA) for normal text, 3:1 for large text
- **Contrast (UI components):** Minimum 3:1 for buttons, borders, focus indicators
- **Alt text:** All `<img>` tags require descriptive `alt` attributes. Decorative images: `alt=""`
- **Focus states:** All interactive elements must have visible focus outlines
- **Touch targets:** Minimum 44x44px for all interactive elements on mobile
