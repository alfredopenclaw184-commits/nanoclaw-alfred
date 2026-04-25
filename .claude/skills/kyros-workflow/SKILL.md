---
name: kyros-workflow
description: Two-phase build workflow for Kyros client sites. Phase 1 = research + approval gate. Phase 2 = build.
tags: [kyros, workflow, build, mandatory]
---

# Kyros Build Workflow

Mandatory process for every build task. No exceptions.

---

## PHASE 1 — RESEARCH (No Code Generation Allowed)

This phase produces documents for approval. No components, no JSX, no styling until Phase 2.

### Step 1.1: Read hard constraints
- Load kyros-rules skill (NEVER/ALWAYS constraints)
- Load kyros-defaults skill (industry defaults)
- Load memories/learned-rules.md (accumulated corrections)
- Confirm: echo back NEVER rules count and ALWAYS rules count

### Step 1.2: Scrape the client URL completely
- All text content (headings, paragraphs, service names, about copy)
- All CSS colors (hex values from stylesheets and inline styles)
- All image URLs on the site
- Meta tags (title, description, OG tags)
- Page structure (sections, navigation items)
- Contact info (phone, email, address)

**Check for multiple source sites:** If the URL is a pages.dev/rebuilt site, search for the client's original domain (e.g., clientname.com). The original site often has:
- The real logo file (not just text wordmark)
- Full project gallery (dozens of images vs 4-5 on rebuild)
- Additional pages (Testimonials, Green Building, Blog)
- More trust signals (association memberships, certifications)
- Social media links

Merge assets from both sites. Original logo colors take precedence over rebuilt site CSS.

**Check for multiple source sites:** If the URL is a pages.dev/rebuilt site, search for the client's original domain (e.g., clientname.com). The original site often has:
- The real logo file (not just text wordmark)
- Full project gallery (dozens of images vs 4-5 on rebuild)
- Additional pages (Testimonials, Green Building, Blog)
- More trust signals (association memberships, certifications)
- Social media links

Merge assets from both sites. Original logo colors take precedence over rebuilt site CSS.

### Step 1.3: Download all assets
- Download every image to `project/assets/`
- Extract logo and produce transparent PNG (remove background regardless of color)
- Note: **Client site fonts are IGNORED** — fonts come from template, not existing site

### Step 1.4: Classify industry and select template
Based on site content, classify into one of:
- **contractor** — construction, home builders, landscaping, flooring → `templates/contractor-DESIGN.md`
- **manufacturing** — machine shops, precision, industrial, fabrication → `templates/manufacturing-DESIGN.md`
- **trades** — HVAC, electrical, plumbing, home services → `templates/trades-DESIGN.md`

### Step 1.5: Extract colors (from CSS or logo, NOT from template)
- **Primary**: Extract from CSS variables (--primary, --brand, etc.) or logo dominant color
- **Accent**: Extract from secondary CSS color, or generate complement per template rules
- **Hover variants**: Generate per template formula (Primary -12%, Accent -18%)

**HSL to Hex conversion** (if CSS uses HSL variables):
```python
import colorsys
def hsl_to_hex(h, s, l):  # h in degrees, s/l in percent
    r, g, b = colorsys.hls_to_rgb(h/360, l/100, s/100)
    return '#{:02x}{:02x}{:02x}'.format(int(r*255), int(g*255), int(b*255))
```

**HSL to Hex conversion** (if CSS uses HSL variables):
```python
import colorsys
def hsl_to_hex(h, s, l):  # h in degrees, s/l in percent
    r, g, b = colorsys.hls_to_rgb(h/360, l/100, s/100)
    return '#{:02x}{:02x}{:02x}'.format(int(r*255), int(g*255), int(b*255))
```

### Step 1.6: Populate DESIGN.md
- Copy selected template to `project/DESIGN.md`
- Replace color derivation section with actual extracted hex values
- Include hover variants with exact hex codes
- **DO NOT change fonts** — fonts are prescribed by template, not extracted from client site

### Step 1.7: Create content-brief.md
Document all extracted content:
```markdown
# Content Brief: [Company Name]

## Company
- Name: [extracted]
- Tagline: [extracted or derived from H1]
- Location: [extracted]

## Services
- [service 1]
- [service 2]
- [service 3]

## About
[extracted about text]

## Contact
- Phone: [extracted]
- Email: [extracted]
- Address: [extracted]

## Trust Signals
- [years in business]
- [certifications]
- [accreditations]

## Assets
- Logo: assets/logo.png
- Hero: assets/[filename]
- [all other images with paths]
```

### Step 1.8: Present for approval
Output smoke test table + both files:
```
📋 PHASE 1 COMPLETE — AWAITING APPROVAL

Template selected: [contractor/manufacturing/trades]
Reason: [why this classification]

| Check | Result |
|-------|--------|
| Correct template? | PASS/FAIL |
### Step 1.8: Present for approval
Output smoke test table + both files:
```
📋 PHASE 1 COMPLETE — AWAITING APPROVAL

Template selected: [contractor/manufacturing/trades]
Reason: [why this classification]

| Check | Result |
|-------|--------|
| Correct template? | PASS/FAIL |
| Colors extracted (not invented)? | PASS/FAIL |
| Hover variants calculated? | PASS/FAIL |
| All images downloaded? | PASS/FAIL - [count] images |
| Fonts from template not site? | PASS/FAIL |
| All services captured? | PASS/FAIL |
| Trust signals extracted? | PASS/FAIL |
| Contact info complete? | PASS/FAIL |

=== DESIGN.md ===
[full content]

=== content-brief.md ===
[full content]

Ready to proceed to Phase 2? (yes/no)
```

**STOP HERE. Do not proceed to Phase 2 until explicit approval.**

---

## PHASE 2 — BUILD (Only After Phase 1 Approval)

### Step 2.0: Gate check (MANDATORY)
Before generating ANY code in a project:
- Check for DESIGN.md in project root and docs/
- If found: read it, follow ALL constraints — colors, fonts, spacing, components, anti-patterns
- Every visual decision comes from this file. No improvising.
- **If DESIGN.md not found: STOP and flag it. Do not proceed.**

### Step 2.1: Load specs
- Read DESIGN.md — every component follows this spec exactly
- Read content-brief.md — all copy comes from here, no improvising
- If the user explicitly says to use the `impeccable` skill for the redesign, follow the real impeccable flow instead of hand-rolling the design pass:
  1. Confirm `.impeccable.md` design context exists (or run `impeccable teach`)
  2. Run `shape` to produce the design brief for the requested scope (hero-only or full page)
  3. Load the references named in the brief, at minimum typography + spatial references
  4. Build from that brief and visually iterate in browser
  5. Do not claim a pass was done with impeccable if you skipped shape/reference loading and just improvised the layout

### Step 2.2: Use all client images
- Every image downloaded in Phase 1 must appear somewhere in the build
- If more images than component slots: add a gallery section
- No placeholder images. No stock photos. Client assets only.

### Step 2.3: Build components per DESIGN.md
- Follow typography specs exactly (font family, weight, size, line-height, letter-spacing)
- Follow color roles exactly (what color goes where)
- Follow spacing specs exactly (padding, margins, gaps)
- Follow component patterns exactly (card structure, button styles, etc.)

### Step 2.4: Verify before deploy
- Local build runs clean with no errors
- Open in browser, click through all nav items
- Check mobile viewport
- Verify all images load
- Verify all links work

### Step 2.5: Deploy
- Deploy to Cloudflare Pages
- Verify live URL loads correctly

### Step 2.6: Self-score
- Score against kyros-scoring criteria
- Must be >= 3.5/5.0 to ship
- If below, fix issues and re-score
- Verify directly with build output, browser checks, screenshots, and file receipts. Do not require a separate Codex adversarial review gate when Codex is the everyday model.

### Step 2.7: Notify
```bash
echo "✅ [client]: [URL] | Score: [X/5.0] | Fix rounds: [N]"
```

---

## Session Logging

At session start:
- Write entry to memories/sessions.jsonl

At session end:
- Log session end with scorecard
- Log at least 1 observation (what you learned, what could improve)
- If corrections received during session, add to memories/learned-rules.md with verify: check

---

## Error Handling

- If you hit a failure: stop, bring 3 options, let Matt decide
- If you fail the same thing twice: escalate immediately, don't try a third time
- If a tool isn't working: check tool config, try alternative, report if stuck
- ALWAYS verify against source files, not CLI output. Source files are truth.
- Acknowledge within 10 seconds if a task will take time: "On it — [what]"
