# Kyros Build Tools

_Tool configurations and workflows for site builds._
_Last updated: 2026-04-02_

---

## Video Generation (Veo 3.1)

### Access
- **Veo 3.1 via Vertex AI** for all Kyros client work (720p+)
- Project: `bigmike-489218`
- Region: `us-central1`

### Use Cases
- Hero video backgrounds (job site footage, documentary feel)
- Product demos
- Atmospheric loops (8-second seamless)

### Workflow (MANDATORY)
1. Generate video via Veo (Vertex AI)
2. Use browser to VIEW the generated video — actually watch it
3. Evaluate: Does it look good? Motion natural? No artifacts? Matches client brand?
4. If bad → regenerate with adjusted prompt (max 3 attempts total)
5. If 3 attempts all fail → fall back to enhanced static image via Nano Banana
6. NEVER ship a bad video just because you generated it
7. NEVER skip video for service-b2b clients — they require hero video per defaults

### Video Specs
- Documentary feel, not cinematic drama
- 8-second seamless loops preferred
- Hide AI watermarks with CSS `transform: scale(1.1)`
- NO dramatic spray/smoke/mist/dust cloud effects

### Quick-Iteration Alternative
- **Seedance 2.0** for quick iterations (480p only)
- Access: NordVPN → Jakarta + CapCut on iPhone
- NOT suitable for final client delivery — use Veo for final

---

## Image Generation (Nano Banana / Imagen)

### Nano Banana Pro/2 (Gemini Image)
- Primary tool for all image generation
- Use for: hero images, product shots, logo edits, marketing visuals

### Imagen 3 via Vertex AI
- Same project as Veo (`bigmike-489218`, `us-central1`)
- Use for: high-quality programmatic images when Nano Banana doesn't cut it

### Image Specs
- NEVER use stock photos — solid gradients or real client imagery only
- If client has existing photos, scrape and upscale before using
- Fallback: industry-appropriate professional imagery

---

## SVG/Icons

### When to Create
- Logos, icons, graphics
- Industry-specific icons (construction, tech, etc.)

### Kyros Wordmark Specs
- Font: Inter 800
- "K" lettermark for nav
- Full "kyros" wordmark where needed
- Keep SVGs clean and optimized

### Rules
- NEVER use emoji as icons — SVG only
- Icons should match the visual language of the site

---

## Web Design Stack

### Build With
- Vite
- React
- Tailwind CSS
- (or whatever the project specifies)

### Deploy To
- Cloudflare Pages

### Verify With
- Browser tools — actually click through the site
- Mobile viewport at 375px
- Check console for errors

---

## Color Extraction

### Process
1. Get client logo
2. Extract 2-4 colors directly from logo
3. Derive accent/highlight colors from primary
4. If logo is monochrome: use as-is for nav, derive accent from industry defaults, ASK before picking palette
5. Verify all colors meet WCAG contrast requirements

### Tools
- Browser DevTools color picker
- Any color extraction tool

### Rules
- NEVER guess colors
- NEVER use generic palettes
- If no logo provided: ASK before proceeding

---

## Browser Verification

### Required Checks
1. Desktop view (1280px+)
2. Mobile view (375px)
3. Click through all nav links
4. Test all CTAs
5. Check console for errors
6. Verify videos/animations load
7. Screenshot verification for output

### Screenshot Requirements
- Include in task completion output
- Show both desktop and mobile views if possible
