# Homepage Redesign — Implementation Plan (Sections 1–3)

Based on Figma file `2785-22335` (1713px desktop frame).

---

## 1. Type Variable Migration Plan

### New Font Families Required

| Font | Used In | Source | Risk |
|------|---------|--------|------|
| **iCiel Pony** (Regular 400) | Hero display title | Commercial font — need .woff2 files | **HIGH**: Must confirm we have the license + files. Fallback: keep Nunito 900 until resolved. |
| **SF Pro Rounded** (Heavy 800) | Section headings (Heading MD) | Apple system font — NOT redistributable as webfont | **HIGH**: Cannot use on non-Apple devices. **Recommendation**: Use Nunito 800 (current) as cross-browser equivalent; it's already very close visually. |
| **Caveat** (Bold 700) | Polaroid captions | Google Fonts — free | LOW: Easy to add via Google Fonts link. |
| **ABC Gravity Variable** / **Tanker** | Crisis section title | Commercial display fonts | **HIGH**: Need .woff2 files. Fallback: use a free condensed display font or export as SVG. |

### Typography Token Comparison

| Token | Current (shared.css) | Figma New | Delta |
|-------|---------------------|-----------|-------|
| **Display** (hero title) | `.t-heading-lg`: Nunito 40px/900/44px | iCiel Pony 62px/400/66px | **New font**, size 40→62, weight 900→400, lh 44→66 |
| **Heading MD** (section h2s) | `.t-heading-md`: Nunito 32px/800/48px, ls: -0.72px | SF Pro Rounded 30px/800/36px, ls: 0 | Font change (rec: keep Nunito), size 32→30, lh 48→36, ls -0.72→0 |
| **Subtitle** (hero desc) | `.hero-description`: Manrope 19px/500/32px | Manrope 19px/500/32px | **No change** |
| **Body LG** | `.t-body-lg`: 19px/500/32px | Manrope 18px/500/28px, ls: 0 | size 19→18, lh 32→28 |
| **Body MD** | `.t-body`: 18px/500/30px, ls: 0.05px | Manrope 16px/500/26px, ls: 0.05px | size 18→16, lh 30→26 |
| **Body SM** | `.t-body-sm`: 17px/500/28px, ls: 0.1px | Manrope 15px/500/28px, ls: 0.1px | size 17→15 |
| **Title** | `.t-title`: Nunito 18px/800 | Manrope 16px/700/24px, ls: 0.05px | Font Nunito→Manrope, size 18→16, weight 800→700 |

### Color Changes

| Element | Current | Figma New | Notes |
|---------|---------|-----------|-------|
| Body text secondary | `#424242` / `var(--dark-2)` | `#6e6e6e` (Neutral Medium) | Lighter gray everywhere |
| Hero badge text | `#786526` | `#544c33` | Darker, less golden |
| Hero badge bg | `rgba(253,240,197,0.58)` | `rgba(171,161,129,0.2)` | More muted/neutral |
| Hero title color | `#362709` | `#181818` (Neutral) | Darker, less warm |
| Crisis stat numbers | `#fdf0c5` (gold) | `#e33535` (red) | **Major**: gold → red |
| Crisis bg | `#1a1a1a` solid | `linear-gradient(-33.2deg, #101010 29.4%, #090909 100%)` | Gradient + inner shadow |
| Crisis CTA button | dark bg | `#e33535` (red) | Red instead of dark |

### Migration Action Items

1. **Add Google Font**: Add `Caveat:wght@700` to the fonts import link in `<head>`
2. **Obtain iCiel Pony**: Request .woff2 files from design team; add `@font-face` declaration. Until available, use Nunito 900 as fallback.
3. **Obtain ABC Gravity / Tanker**: Request .woff2 files. Until available, consider exporting the crisis title as an SVG image, OR use a free condensed display font like "Anton" or "Bebas Neue" from Google Fonts.
4. **Do NOT update shared.css typography tokens globally** — the Figma Body LG/MD/SM values differ significantly from current. These changes would cascade to ALL pages. Instead, apply the new values only within the 3 updated homepage sections via scoped CSS. Global migration can happen later.
5. **Add new CSS variable**: `--neutral-medium: #6e6e6e` to `:root`

---

## 2. Section-by-Section Breakdown

### Section 1: Header / Hero

#### Current vs. New — Structural Comparison

| Aspect | Current | Figma New |
|--------|---------|-----------|
| Max-width | 1560px | **1480px** |
| Padding | 136px top, 40px sides, 48px bottom | **176px top**, ~116.5px sides (auto from 1480 centered), implied bottom from content |
| Left column | flex:1, gap:40px | **700px fixed**, gap:**96px** (badge→bottom), **64px** (badge→text) |
| Right column | flex:1, 3-image grid | **700px fixed**, 3 overlapping polaroid cards |
| Gap between columns | 40px | **80px** (1480 - 700 - 700 = 80) |
| Title | Nunito 40px/900 `"Waar hoop niet opgeeft"` | iCiel Pony 62px/400 `"Waar hoop een thuis vind"` |
| Description | Manrope 19px, max-width 462px, color #424242 | Manrope 19px, **width 614px**, color **#6e6e6e** |
| Title→Desc gap | 16px | **32px** |
| Badge→Title gap | (inside 40px column gap) | **64px** explicit |
| Stats area | 3 number stats (800+, 60+, 1200+) | **3 social media badges** (Facebook, Instagram, TikTok) |
| Stats divider | 0.5px line above | **0.5px border-top rgba(0,0,0,0.5)**, **56px padding-top** |
| Stats gap | 72px between stat items | **16px gap**, each flex:1, with icon+text |
| Image treatment | Rounded grid (1 large + 2 small) | **3 polaroid cards**, overlapping, rotated |

#### Polaroid Cards — Detailed Specs

Each polaroid card (CSS class: `.hero-polaroid`):
- **Size**: 312 x 376px
- **Background**: white
- **Border**: 0.5px solid rgba(0,0,0,0.06)
- **Border-radius**: 12px
- **Shadow**: `0px 1px 3px rgba(0,0,0,0.03), 0px 2px 6.669px rgba(0,0,0,0.04)`
- **Padding**: 16px top, 16px left/right, 0 bottom (caption area handles spacing)
- **Inner structure** (top to bottom):
  1. **Background decoration**: Subtle paw-print pattern + gradient overlay (white→#fff2db). Implement as a pseudo-element or background-image.
  2. **Photo**: flex:1, border-radius 4px, object-fit cover
  3. **Caption bar**: flex row, justify-content: space-between, padding 16px vertical
     - Left: caption text — **Caveat Bold 20px**, color black
     - Right: dog name — **Caveat Bold 22px**, color black, **opacity 40%**
  4. **Washi tape**: Absolute-positioned at top center, ~92x41px. Export from Figma as PNG/SVG asset.

**Three card positions** (within 700x800 right column, absolute positioning):

| Card | Left | Top | Rotation | Z-index | Content |
|------|------|-----|----------|---------|---------|
| 1 (center) | 0.5px | 195px | **-14deg** | 1 | "Lekker dutte" / Lilli |
| 2 (top-right) | 236.5px | -89px | (need to check, likely ~5-8deg) | 2 | "Best friends <3" / Lilli |
| 3 (bottom-right) | 236.5px | 428px | (need to check, likely ~3-5deg) | 0 | "Ff uitrusten" / Lilli |

#### Social Stats — Bottom Area

Replace `.hero-stats` + `.hero-stat` with new social badges:
- Container: flex row, gap 16px, padding-top 56px, border-top 0.5px rgba(0,0,0,0.5)
- Each badge (flex:1): flex row, gap 20px, align-items center, overflow clip, padding 4px vertical
  - Icon: 40x40px (Facebook/Instagram/TikTok logo — use existing SVGs or export from Figma)
  - Text column:
    - Title: Manrope Bold 16px, #181818 — platform name
    - Body: Manrope Medium 15px, #6e6e6e — follower count

#### Animation Plan for Polaroids

**Trigger**: On page load (not scroll-triggered — hero is visible immediately).

**Approach**: CSS keyframe animation with staggered delays.

```
@keyframes polaroidIn {
  from {
    opacity: 0;
    transform: rotate(var(--rotation)) translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: rotate(var(--rotation)) translateY(0) scale(1);
  }
}
```

| Card | Delay | Duration | Easing |
|------|-------|----------|--------|
| 1 (center) | 0.3s | 0.8s | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| 2 (top-right) | 0.5s | 0.8s | same |
| 3 (bottom-right) | 0.7s | 0.8s | same |

**Performance**: Use `will-change: transform, opacity` on each polaroid. Each card already uses `transform: rotate()` so adding translateY causes no extra composite layers. No layout thrash since all cards are absolutely positioned.

#### What to Change vs. Rebuild

- **REBUILD**: `.hero-grid`, `.hero-grid-large`, `.hero-grid-stack`, `.hero-grid-small` → Replace entirely with `.hero-polaroids` container + 3 `.hero-polaroid` cards
- **REBUILD**: `.hero-stats`, `.hero-stat`, `.hero-stat-number`, `.hero-stat-label`, `.hero-stat-secondary` → Replace with `.hero-socials` container + 3 `.hero-social` items
- **UPDATE**: `.hero-content` — max-width 1560→1480, padding top 136→176
- **UPDATE**: `.hero-left` — flex:1 → width:700px, gap 40→96
- **UPDATE**: `.hero-text` — max-width 462→614, gap 16→32
- **UPDATE**: `.hero-badge` — bg color, text color
- **UPDATE**: `.hero-title` — font-family, size, weight, line-height (once iCiel Pony available)
- **UPDATE**: `.hero-description` — color #424242→#6e6e6e
- **REMOVE**: `.hero-divider` (no longer exists in design)
- **REMOVE**: `.hero-buttons` (mobile CTA buttons — verify if still needed at SM/XS)

---

### Section 2: Dog Cards

#### Current vs. New — Structural Comparison

| Aspect | Current | Figma New |
|--------|---------|-----------|
| Section max-width | 1560px | **1480px** |
| Header padding | 72px top, 40px sides, 40px bottom | **72px top**, 40px sides, **0px bottom** (cards follow directly) |
| Header h2 | `.t-heading-md` (Nunito 32px) | SF Pro Rounded 30px/800/36px (use Nunito w/ updated values) |
| Header desc | max-width 600px | **640px** |
| Desc color | #424242 | **#6e6e6e** |
| Desc gap | 12px | 12px (same) |
| Card container | Carousel, edge-to-edge | Flex row, gap **32px**, full-width overflow |
| Card size | Variable width | **360 x 420px** fixed |
| Card bg | White / transparent | **#fdfbf8** (warm off-white) |
| Card border-radius | 8px | **20px** |
| Card border | 1px solid rgba(0,0,0,0.08) | **None** (just bg color) |
| Card padding | 0 (image is flush) | **12px** all sides |
| Image radius | 8px top | **12px** all corners (within inner container) |
| Image container | Inner rounded-rect with 20px radius, overflow clip | Same approach |
| Card body padding | 12px | **px:12px, py:16px** |
| Dog name font | 18px/600 (varies) | **Manrope Bold 16px**, #181818 |
| Description | Single line, 15px | **15px, max-height 48px** (2-line clamp), #6e6e6e |
| Card link | "Meer info →" text link | **Removed** — replaced by meta row |
| Meta row (NEW) | N/A | **Gender + Age** row, opacity 75%, 15px, gap 16px |
| Bottom buttons | Single "Bekijk alle honden" | **Two buttons**: primary "Bekijk alle honden" + secondary "Meer over adopteren" |
| Buttons padding | 40px sides, 72px bottom | pt:**48px**, pb:**72px** |
| Bottom divider | 1560px wide | **1480px** wide |

#### Card Layout (New Structure)

```
.dog-card (360x420, bg:#fdfbf8, rounded:20px, p:12px)
  └── .dog-card-inner (flex col, rounded:20px, overflow:clip, h:100%)
      ├── .dog-card-img (flex:1, rounded:12px, object-fit:cover)
      └── .dog-card-body (px:12, py:16, flex col, gap:8)
          ├── .dog-card-name-desc (flex col, gap:4)
          │   ├── .dog-card-name (Manrope Bold 16px, #181818)
          │   └── .dog-card-desc (Manrope Medium 15px, #6e6e6e, 2-line clamp)
          └── .dog-card-meta (flex row, gap:16, opacity:0.75)
              ├── gender text
              └── age text
```

#### What to Change vs. Rebuild

- **UPDATE**: `.dogs-header-wrap` max-width, `.dogs-header` max-width 600→640
- **UPDATE**: `.dogs-header p` color to #6e6e6e
- **UPDATE**: `.dog-card` — size, bg, border-radius, padding, border removal
- **UPDATE**: `.dog-card-inner` — border-radius, overflow
- **UPDATE**: `.dog-card-img` — border-radius 8→12px
- **UPDATE**: `.dog-card-body` — padding values
- **UPDATE**: `.dog-card-name` — font-size, weight adjustments
- **UPDATE**: `.dog-card-desc` — color, add 2-line clamp (max-height:48px, overflow:hidden)
- **ADD**: `.dog-card-meta` — new element for gender + age
- **REMOVE**: `.dog-card-link` ("Meer info →")
- **ADD**: Secondary button "Meer over adopteren" in buttons area
- **UPDATE**: `dog-card.js` — add meta row HTML, remove link element

---

### Section 3: Crisis Section (NET-NEW rebuild)

This is a **complete redesign**. The existing `.problem` / `.problem-*` CSS and HTML should be rebuilt from scratch while preserving the JS functionality (photo reveal, Supabase loading).

#### Layout Structure

```
.problem (full-width, gradient bg, inner-shadow, overflow:hidden)
  └── .problem-inner (max-width:1480px, flex row, centered)
      ├── .problem-left (flex:1, pr:64px, pt:140px)
      │   ├── .problem-header (flex col, gap:12px, pr:120px, pb:16px)
      │   │   ├── .problem-title (multi-font, mixed colors, uppercase)
      │   │   │   ├── span.crisis-red "EEN CRISIS" (#e33535)
      │   │   │   └── span.crisis-muted "DIE NIEMAND ZIET" (rgba(255,255,255,0.6))
      │   │   ├── .problem-decorative-line (252px, 2px, #6a6a6a, positioned)
      │   │   └── .problem-desc (Manrope 18/28, white, opacity:56%)
      │   └── .problem-data (flex col, gap:24px)
      │       ├── .problem-data-label "De data spreekt voor zich" (Manrope Bold 16px, white, opacity:88%)
      │       ├── .problem-stats-row (flex row, gap:16px)
      │       │   ├── .problem-stat-card (glass card, flex:1)
      │       │   │   ├── stat row 1: "200.000+" / "Zwerfhonden in de regio"
      │       │   │   └── stat row 2: "20%" / "Overlevingskans van pups"
      │       │   └── .problem-stat-card (glass card, flex:1)
      │       │       ├── stat row 1: "3-4 jaar" / "Levensverwachting"
      │       │       └── stat row 2: "1/10" / "Sterft in het verkeer"
      │       └── .problem-stat-card.full-width
      │           └── "€0" + "Overheidssubsidie" (horizontal)
      └── .problem-right (flex:1, h:784px, overflow:clip, relative)
          ├── .problem-photo-grid (3x3 grid, opacity:2%, mix-blend:luminosity)
          └── .problem-reveal-btn (absolute centered, red pill button)
```

#### Key CSS Properties

**Section background**:
```css
background: linear-gradient(-33.2deg, #101010 29.4%, #090909 100%);
box-shadow: inset 0px 4px 8px rgba(0,0,0,0.55);
```

**Glass stat cards**:
```css
backdrop-filter: blur(22px);
border: 1px solid rgba(255,255,255,0.05);
border-radius: 8px;
padding: 2px 22px;
```

**Stat row** (inside card):
```css
padding: 16px 0;
border-bottom: 0.5px solid rgba(255,255,255,0.08);
/* last row: no border */
```

**Stat number**: `color: #e33535; font: Manrope Medium 16px/26px; white-space: nowrap;`
**Stat label**: `color: white; opacity: 0.4-0.56; font: Manrope Medium 16px/26px;`

**Photo grid** (right column): 3 rows x 3 cols, each cell flex:1, images absolute+cover, all with `mix-blend-mode: luminosity; opacity: 0.02;`. On reveal, animate to `opacity: 1; mix-blend-mode: normal;`.

**Reveal button**: `bg: #e33535; border-radius: 100px; 240x43px; Manrope Bold 14px; color: rgba(255,255,255,0.9);` — centered over photo grid.

#### What to Preserve

- **Photo reveal JS logic**: The `revealBtn`, `problemPhotos`, Supabase image loading, and click-to-reveal behavior should be preserved and adapted to work with the new 3x3 grid layout.
- **i18n keys**: Keep the existing `index.crisis.*` translation keys.
- **Responsive XS layout**: The existing XS (≤767px) table-like stat layout can be kept but should be adapted to match the new stat data structure.

---

## 3. Animation Plan for Polaroids

### Page-Load Entrance Animation

```css
@keyframes polaroidIn {
  0% {
    opacity: 0;
    transform: rotate(var(--rot)) translateY(48px) scale(0.92);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--rot)) translateY(0) scale(1);
  }
}

.hero-polaroid {
  will-change: transform, opacity;
  animation: polaroidIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-polaroid:nth-child(1) { --rot: -14deg; animation-delay: 0.2s; }
.hero-polaroid:nth-child(2) { --rot: 8deg;   animation-delay: 0.45s; }
.hero-polaroid:nth-child(3) { --rot: -5deg;  animation-delay: 0.7s; }
```

### Performance Considerations

- All 3 cards are `position: absolute` inside `.hero-polaroids` — no layout thrash
- `will-change: transform, opacity` promotes to own compositor layer
- `cubic-bezier(0.22, 1, 0.36, 1)` = smooth ease-out with slight overshoot
- Total animation duration: 0.7s delay + 0.9s = 1.6s before all 3 are settled
- Remove `will-change` after animation completes (via `animationend` event) to free GPU memory

### Optional: Subtle Hover Float

```css
.hero-polaroid {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.hero-polaroid:hover {
  transform: rotate(var(--rot)) translateY(-6px) scale(1.02);
}
```

---

## 4. Risk Flags

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **iCiel Pony font not available** — commercial font, no .woff2 files in repo | HIGH | Keep Nunito 900 as fallback. Request files from designer. Can swap in later with zero layout changes if we set the CSS custom property. |
| 2 | **SF Pro Rounded not web-distributable** — Apple's license prohibits webfont embedding | HIGH | **Recommend keeping Nunito 800** for headings. It's visually similar and already loaded. The Figma may just be using SF Pro as a design tool default. |
| 3 | **ABC Gravity / Tanker fonts for crisis title** — commercial display fonts | HIGH | Options: (a) Request .woff2 files, (b) export title as SVG, (c) use free alternatives like "Anton" or "Bebas Neue" from Google Fonts. |
| 4 | **Polaroid paw-print pattern** — decorative bg overlay on polaroid cards | LOW | Export the paw SVG from Figma. Can be implemented as a `background-image` with `background-size` and gradient overlay. Could also skip for v1 and add later. |
| 5 | **Washi tape asset** — decorative tape on top of each polaroid | LOW | Export from Figma as PNG with transparency. Absolute position at top-center of each card. |
| 6 | **Polaroid rotation angles** — only card 1 has confirmed -14deg, cards 2 & 3 need measurement | LOW | Measure from Figma or estimate from screenshot. Can fine-tune visually during implementation. |
| 7 | **Responsive breakpoints not designed** — Figma only shows 1713px desktop | MEDIUM | Infer from current responsive patterns. Hero polaroids → single column stack at SM. Crisis → stack columns at SM. Dog cards remain carousel. |
| 8 | **Photo reveal grid change** — current: horizontal strip of photos. New: 3x3 grid with luminosity blend | MEDIUM | Need to adapt the Supabase photo loading to populate a 3x3 grid instead of a horizontal scroll. The reveal animation changes from showing/hiding a strip to fading in the grid. |
| 9 | **"Meer over adopteren" button** — new secondary button in dog section links to adoptie.html. Need i18n key. | LOW | Add `index.dogs.btn2` translation key. |
| 10 | **Global typography cascade risk** — changing shared.css type tokens affects ALL pages | HIGH | **Do NOT change shared.css tokens yet.** Apply Figma values via scoped styles in index.html only. Global migration is a separate task. |

---

## 5. Implementation Order

1. **Font setup** — Add Caveat to Google Fonts import. Set up @font-face for any custom fonts we have files for.
2. **Hero section** — Rebuild right column (polaroids), update left column (text + social stats), animation
3. **Dog cards section** — Update card component, add meta row, add secondary button
4. **Crisis section** — Full rebuild of HTML structure, CSS, adapt photo reveal JS
5. **Responsive** — Update SM/XS breakpoints for all 3 sections
6. **QA pass** — Cross-browser test, verify i18n, check all breakpoints
