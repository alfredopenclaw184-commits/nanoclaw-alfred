---
name: kyros-design
description: Matt's universal design rules for Kyros client sites - typography, colors, layout, anti-patterns
tags: [design, kyros, css, frontend]
---

# Design Preferences — Matt's Universal Rules

_Extracted from: Trillium v2, Kyros (in-progress), Discord feedback (Mar 14-20, 2026), git history_
_Last updated: 2026-04-04_

---

## Typography

### Typography Hierarchy (Kyros Standard)
Weight hierarchy must flow downward — section headings heaviest, body lightest:

| Element | Weight | Notes |
|---------|--------|-------|
| Section headings (h2) | 600 | Standard for service/conversion sites. 700 feels aggressive, 400 is editorial/luxury. |
| Card titles | 500 | Subordinate to section headings. Never heavier than section heading. |
| Feature list items | 500 | Same as card titles. |
| Body/description text | 400 | Lightest weight for supporting copy. |
| Prices | 500 | Match card title weight. |
| Eyebrows/labels | 700 | Small caps labels can be heavier since they're tiny. |

**Critical:** Set base heading weight in `index.css` under `h1, h2, h3...` rule. Global CSS can override Tailwind classes, so inline styles or explicit fontWeight in components is safer.

### Headlines
- **Kyros/SaaS:** Plus Jakarta Sans 600 weight for section headings. Tight letter-spacing (-0.02em to -0.04em). Clamp sizing for responsive.
- **Construction/Industrial:** Oswald 700 weight, all caps, letter-spacing 0.08em for section headers.
- **Size:** Clamp sizing — hero headlines typically `clamp(2.6rem, 5.5vw, 4.2rem)`. Section headings ~3.8rem.
- **Line height:** 1.1 to 1.2 for headlines.

### Body
- **Trillium:** Poppins 400-600 → later switched to Work Sans (more industrial).
- **Kyros:** Inter 400-500 for cards, Plus Jakarta Sans for headings.
- **Size:** 0.875rem to 0.965rem for body copy, 0.9rem baseline.
- **Line height:** 1.6 to 1.8 for readability.
- **Color:** Muted text (`#757575` on light, `rgba(255,255,255,0.45)` on dark).

### Section Labels/Eyebrows
- ALL CAPS.
- 0.65rem to 0.72rem.
- Font weight 700.
- Letter-spacing 0.14em to 0.16em.
- Accent color or muted gray.

### Rejected Fonts
- **Instrument Serif** — "too editorial"
- **Syne** — "looks genuinely disgusting"

---

## Color

### Universal Rule
- **Colors are derived from the client's logo, not predetermined.** Extract primary and accent colors directly from the logo. These become the palette for the entire site.
- If no logo is provided, ask before picking colors. Never default to a generic palette.
- Maintain adequate contrast for readability (dark text on light, light text on dark).

### Example Palettes (for reference only — not defaults)

**Trillium (Construction/B2B)**
| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#2a3457` | Primary dark, footer bg |
| Silver | `#70787e` | Accent, CTAs |
| White | `#ffffff` | Background, cards |
| Body | `#757575` | Body text |
| Light BG | `#f8f8f8` | Alternate section backgrounds |

**Kyros (SaaS/Tech)**
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#07050e` | Deep dark navy |
| Accent | `#0066ff` to `#00d4ff` | Blue gradient for CTAs, glows |
| Glass BG | `rgba(255,255,255,0.04)` | Card backgrounds |
| Glass Border | `rgba(255,255,255,0.08)` | Card borders |
| Text | `#f8f8fc` | Primary text on dark |
| Text Muted | `rgba(255,255,255,0.45)` | Secondary text |

---

## Layout & Structure

### Max Widths
- Content container: 1080px to 1280px.
- Narrower text blocks: 480px to 640px.
- Pricing cards: roughly 50/50 grid.

### Spacing
- Section padding: 96px vertical on desktop, 64px on mobile.
- Section gap: Use `<hr class="section-rule">` between sections (1px solid line).
- Card padding: 24px to 28px.
- Grid gaps: 16px to 28px between cards.

### Section Order (Typical)
1. Fixed Nav
2. Hero (video or canvas background)
3. Stats/Proof Bar (optional)
4. Logo Strip (for B2B with notable clients)
5. Services
6. About / Why Us
7. Gallery / Work (optional)
8. Pricing (Kyros only)
9. Contact / CTA Band
10. Footer

---

## Hero / Above the Fold

### What Matt Likes
- **Full-bleed video/canvas backgrounds** — hero takes up most of viewport (90vh).
- **Content positioned left** (Trillium) or **centered** (Kyros).
- **Single headline + short subtext + CTA buttons.**
- **No big logo in hero** — logo lives in nav only.
- **Single CTA button preferred** (Kyros direction); dual CTAs acceptable for B2B.
- **Subtle motion** — animated canvas ribbons (Kyros), subtle video loops (Trillium).

### Hero Copy Pattern
- Headline: Benefit-driven, short. "Websites That Win You Clients" or "Commercial Concrete Built to Last"
- Subtext: One-liner with trust signals. "A custom website. One-time payment. Full ownership."
- CTA: "Book a Call" (Kyros), "Request a Quote" (Trillium)

### Rejected
- **Badge/pill announcements on hero** — \"tacky\". Subtle eyebrow badges OK, flashy is not.
- **\"Get a Preview\" secondary CTA** — removed from Kyros nav. Previews are for qualified leads only.
- **\"AI-powered\" in copy** — \"cringe\"
- **Stats strips with big numbers in colored boxes** — The "40+ / 100+ / A+" pattern in golden boxes screams AI-generated. Either integrate stats into copy naturally ("Over 100 homes since 1985") or remove entirely.
- **Zoomed/cropped client images** — If client images look bad at full-bleed, generate with Imagen 3 instead.
- **Oval CTAs** — Look cheap and AI. Use sharp rectangles for premium feel.

### When Client Images Are Unusable
Generate hero imagery with Imagen 3 via Vertex AI:
```python
vertexai.init(project="bigmike-489218", location="us-central1")
model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
response = model.generate_images(
    prompt="[Industry scene], golden hour, cinematic, professional photography",
    aspect_ratio="16:9"
)
```

---

## Navigation

### Desktop
- Fixed/sticky at top.
- Height: 62px to 78px.
- Logo left, links center, CTA right.
- Links: 0.85rem to 0.9rem, weight 500-600, muted color hover to white/accent.
- CTA: Pill or rounded rectangle, filled accent color.

### Mobile
- Hamburger menu (three bars).
- Full-screen or dropdown overlay.
- Nav CTA remains visible.

### Nav Logo
- **Kyros:** Just \"K\" in nav, white, no \"yros\"
- **Trillium:** Actual company logo in nav.

### Logo Handling (All Clients)
**Priority order:**
1. Client-provided vector file (SVG, AI, EPS)
2. Clean PNG with transparent background
3. Text wordmark as fallback

**Never do:** Crop logos from header images or screenshots. The extracted portion always looks broken — this was tried on Hayes Construction and the result was unusable.

**Text wordmark fallback:**
```jsx
<span className="text-[accent] font-bold text-[24px]">COMPANY</span>
<span className="text-white font-light text-[24px]">NAME</span>
```

---

## Animation & Motion

### Canvas Animations (Kyros Hero)
- **Horizontal flowing ribbons** — silk/liquid motion.
- **Deep blue palette** — multiple opacity layers.
- **Subtle ambient glow** — radial gradient from center, low opacity.
- **Speed:** Smooth, not frantic. Animation delta ~0.012 per frame.

### Video Backgrounds (Trillium)
- **Veo 3.1** for AI-generated video from static photos.
- **Documentary feel, not cinematic drama** — "subtle animation... workers move naturally in place."
- **Hide AI watermarks** with CSS `transform: scale(1.1)`.
- **Loop:** 8-second seamless loops preferred.

### Scroll Animations
- **Fade-up on scroll** — sections fade in as they enter viewport.
- **Card hover lift** — `translateY(-5px)` with `cubic-bezier(0.22,1,0.36,1)` easing.
- **Image scale on hover** — 1.03x to 1.05x.

### Rejected
- **CSS scroll-snap on `html`** — causes issues. Apply on scroll container or `body`.
- **Dramatic spray/smoke effects in video** — clean, minimal motion only.

---

## Modal Design (Contact/CTA Modals)

### Final Approved Pattern
- **Modal background:** White, rounded-3xl corners, soft shadow
- **Card layout:** 3 horizontal cards with flex-1 (equal width), gap-4
- **Card style:** Gradient blue (from-[#0066ff] to-[#00d4ff]) with rounded-2xl corners
- **Card size:** minHeight 160px, py-10 px-6
- **Icons:** w-10 h-10, white, strokeWidth 1.5, positioned at TOP of card
- **Labels:** text-lg font-semibold white, positioned at BOTTOM of card (mt-auto)
- **Glow:** box-shadow: 0 8px 32px rgba(0, 102, 255, 0.25)
- **Hover:** scale-[1.02] brightness-110
- **Standard labels:** "Book a Meeting" | "Call Now" | "Send a Message"

### Implementation
```tsx
<div className="h-full flex flex-col items-center justify-between py-10 px-6 rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#00d4ff]"
  style={{ boxShadow: "0 8px 32px rgba(0, 102, 255, 0.25)", minHeight: "160px" }}>
  <Calendar className="w-10 h-10 text-white" strokeWidth={1.5} />
  <span className="text-lg font-semibold text-white whitespace-nowrap mt-auto">Book a Meeting</span>
</div>
```

### Iteration History (what Matt rejected)
1. Dark modal with row-based options — "gross"
2. White modal with circular blue icons + black labels below — icons too heavy, black text "throws me off"
3. Large blue square cards with text inside (full-size) — "that aint it", too chunky
4. Tiny icons with tiny labels outside — too small, not premium
5. Medium icons with small labels outside — wanted text inside cards, white text only

### Icon Selection
- **Book a Meeting:** Use `Video` icon (video camera), NOT `Calendar` — calendar looks too similar to Mail/envelope icon
- **Call Now:** Use `Phone` icon
- **Send a Message:** Use `Mail` icon
- Icons must be visually distinct from each other at a glance

### Key Learnings
- Text MUST be inside the blue cards, not below them
- Text MUST be white — no black text in modal
- Icon at top, text at bottom (justify-between)
- Medium-sized cards (not square aspect ratio, more rectangular ~160px tall)
- Text needs to be large enough (text-lg) to feel premium
- **NO SUBHEADINGS** — subheadings (phone number, email, calendly link) add clutter. "The action speaks for itself." If someone clicks "Call Now" they'll see the number. Simpler = more premium.
- Match gradient to site's primary CTA button (from-[#0066ff] to-[#00d4ff] for Kyros)

## Premium CTA Sections

For full-width CTA sections (like "Preview Before Purchase"), add visual depth:

### Glow Behind Heading
```tsx
{/* Radial gradient blur centered behind text */}
<div 
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none"
  style={{ background: 'radial-gradient(ellipse, rgba(0,102,255,0.15) 0%, transparent 70%)' }}
/>
<div className="relative z-10">
  {/* heading and subtext */}
</div>
```

### Premium Button Styling
```tsx
<Button
  className="h-14 px-10 rounded-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] hover:brightness-110 transition-all duration-300 hover:scale-105"
  style={{ boxShadow: '0 0 40px rgba(0,102,255,0.4), 0 0 80px rgba(0,102,255,0.2)' }}
>
```

Key elements:
- Double-layer glow shadow (40px tight + 80px ambient)
- Larger button (h-14 px-10 vs h-12 px-8)
- Subtle hover scale (1.05)

### Balancing Uneven Background Image Shading
When a background image has uneven lighting (one side lighter than the other), use a gradient overlay to balance it:

```tsx
<div className="relative" style={{backgroundImage: 'url(/path/to/image.png)', backgroundSize: 'cover'}}>
  {/* Gradient overlay to balance shading */}
  <div 
    className="absolute inset-0 pointer-events-none"
    style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.35) 100%)' }}
  />
  {/* Content with relative z-10 */}
</div>
```

**Tuning tips:**
- Start with low opacity values (0.15-0.35) — heavy darkening creates a "funnel effect"
- The `transparent` stop in the middle keeps the center clean
- Adjust percentages (30%, 70%) to control where darkening begins
- Test visually — the goal is balanced shading, not perfectly symmetrical
- If one side of the source image is much lighter, increase that side's opacity while keeping the other side lower

---

## CTAs

### Primary Buttons
- **Trillium:** Silver background (`#70787e`), white text, uppercase, letter-spacing 0.06em to 0.08em, rounded 4px.
- **Kyros:** Blue gradient (`#0066ff` to `#00d4ff`) or solid accent, white text, rounded 8-10px.

### Secondary/Ghost Buttons
- Transparent background, border (white or accent), text same color as border.
- Hover: subtle background fill, border color shift.

### CTA Text
- CTA copy depends on the business type — not a universal default
- **Service/B2B:** "Request a Quote", "Get a Quote", "Call Us"
- **SaaS/productized:** "Book a Call", "Get Started"
- **Portfolio/credibility:** "View Our Work", "See Projects"
- **Local service:** Phone number as primary CTA
- No arrow on secondary CTAs

### Placement
- Hero: 1-2 buttons max.
- Nav: Single CTA button (solid, not text link).
- Contact section: Phone/email/schedule as links, not buttons.

---

## Cards & Components

### Service Cards
- Image top (240px height), body below.
- Subtle border (`1px solid #e0e3e7`).
- Accent border on top edge (3px colored bar).
- Hover: shadow + lift.
- Border radius: 6-8px.

### Glass Cards (Dark Mode)
- Background: `rgba(255,255,255,0.04)` to `rgba(255,255,255,0.06)`.
- Border: `rgba(255,255,255,0.08)` to `rgba(255,255,255,0.14)`.
- Backdrop blur: 12-20px.
- Gradient border shimmer (pseudo-element with mask composite).
- Border radius: 16-20px.

### Stats Bar
- Grid of 3-4 stats.
- Label above (small caps, muted), value below (large, bold).
- Dividers between items (1px vertical line).
- Dark background (navy) for contrast.

---

## Anti-Patterns (what Matt has explicitly rejected)

### Typography
- Instrument Serif — "too editorial"
- Syne — "looks genuinely disgusting"
- Generic AI copy — run through stop-slop filter

### Hero
- Big logo in hero — logo goes in nav only
- Flashy announcement badges — "tacky"
- "AI-powered" language — "cringe"
- Multiple CTAs cluttering hero — one primary, one secondary max
- Advertising preview links publicly — reserved for qualified leads

### Layout
- Position:fixed canvas behind video — causes fighting. Canvas inside section.
- CSS scroll-snap on `html` — apply on container or `body` instead
- Dramatic video effects — no spray, smoke, mist, dust clouds

### Code
- AGENTS.md files in client repos — clean up before delivery
- File:// preview for videos — always use local server
- Iterating on broken CSS — start from solid foundation

### Process
- Skipping quality gates — all stages mandatory
- Deploying with adversarial score < 3.5 — fix first

### "AI Lazy" Aesthetic (avoid these tells)
- **Oval/pill CTAs** — look cheap and template-generic. Use sharp rectangles for premium feel.
- **Generic SVG line icons** — lazy placeholder look. Use real imagery, custom graphics, or no icons.
- **Golden/colored stat boxes in hero** — screams "AI stats counter component". Integrate stats into copy naturally ("Over 100 homes built") or use subtle light-background strip with small text.
- **Small trust badges** — credentials need visual weight (60px+ height). Use circular badge graphics with dark backgrounds, not tiny text labels.
- **Placeholder logos** — a single letter in a square reads as unfinished. Extract real logo or get clean file from client.
- **Green accent on construction sites** — sage green looked ugly with warm browns. Stick to warm earth tones unless brand dictates otherwise.

---

## Logo Extraction from Header Images

When client only has logo embedded in a header/banner image:

1. **Use vision_analyze first** to locate the logo within the image — ask for approximate pixel coordinates
2. **Crop iteratively** — logo position descriptions are approximate, expect 2-3 crop attempts
3. **Verify each crop** with vision_analyze before using
4. **Save multiple versions**: icon-only, icon+text, full header crop
5. **Note for client**: cropped logos work but aren't ideal. Request clean vector file for final delivery.

```python
from PIL import Image
img = Image.open('header.jpg')
# Crop based on vision analysis coordinates
logo = img.crop((x1, y1, x2, y2))
logo.save('logo-extracted.png')
```

---

_This document is the source of truth for design decisions. Update as new builds reveal preferences._
