---
version: alpha
name: Minna de Gohankai / STUDIO HOLIDAY
description: >
  Design system for the STUDIO HOLIDAY "みんなでごはん会" (communal-meal) site: a single
  long vertical page where a fixed green leaf-pattern background stays put while a
  scroll-lifted noren (fabric curtain) hero reveals a logo video. Warm, plain, hand-made
  tone built on a rounded gothic typeface and generous whitespace. Layout, colour and type
  are distilled from the published STUDIO version (raw measurements in
  studio-source/DESIGN-SPEC.md); the hero is a deliberate brush-up beyond it.

colors:
  brand-green: "#6ab31d"    # signature: leaf pattern, carousel nav border/arrows, icons
  accent-orange: "#ff5035"  # interaction (hover) only
  ink: "#333333"            # body text on surfaces (cards)
  surface: "#ffffff"        # background of cards, footer, info panels
  on-brand: "#ffffff"       # text sitting on the green pattern background
  border: "#e6e6e6"         # hairline dividers

typography:
  message-lead:             # white message copy over the green background
    fontFamily: Zen Maru Gothic
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0.15em
  card-title:               # company name in the info card
    fontFamily: Zen Maru Gothic
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.15em
  card-body:                # address / hours / links in the info card
    fontFamily: Zen Maru Gothic
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.15em
  caption:                  # carousel caption
    fontFamily: Zen Maru Gothic
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.15em

rounded:
  sm: 8px        # carousel image
  md: 20px       # info card
  full: 9999px   # circular carousel nav buttons (actual value 50%)
  hero: 80px     # large rounded top edge of the footer

spacing:
  xs: 16px       # default gap
  sm: 24px       # gap between footer blocks
  md: 40px       # card padding / row gap
  lg: 60px       # footer vertical gap
  xl: 64px       # footer top padding

components:
  info-card:
    background: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 40px
    width: 956px
  nav-button:
    size: 20px
    background: "{colors.surface}"
    border: "1px solid {colors.brand-green}"
    rounded: "{rounded.full}"
    hoverBackground: "{colors.accent-orange}"
  footer:
    background: "{colors.surface}"
    roundedTop: "{rounded.hero}"
    borderTop: "1px solid {colors.border}"
---

# DESIGN.md — Minna de Gohankai / STUDIO HOLIDAY

> The visual contract shared between the AI coding agent (Claude Code) and humans for this
> site. Engineering/architecture rationale lives in `DECISIONS.md`; the raw STUDIO
> measurements live in `studio-source/DESIGN-SPEC.md`. The three files divide the work.

## Overview

A plain, warm site introducing a weekly communal meal held in a small kitchen in
Shin-Ōkubo. The mood is the friendliness of "sharing one pot" (同釜共食). A green leaf
pattern covers the whole background; as you scroll down the single page, a noren (fabric
curtain) hero is approached and lifts to reveal a logo video, then holds — a quiet,
tactile sequence you can even nudge with the cursor. Comfort comes from whitespace, rounded
shapes, and a soft rounded typeface rather than flashiness. One page, vertical scroll. (The
hero is a brush-up beyond the STUDIO original; the rest still follows the extracted STUDIO
values.)

## Colors

- **brand-green `#6ab31d`** — the face of the site. Fixed background leaf pattern, carousel
  nav borders and arrow icons. The lead decorative color.
- **accent-orange `#ff5035`** — a pop that appears only on hover (nav button hover fill).
  Never used in the resting state.
- **ink `#333333`** — text on light surfaces (the info card). Do not use pure black.
- **surface `#ffffff`** — background of panels: info card, footer.
- **on-brand `#ffffff`** — message text laid over the section background photos. Always white, for contrast.
- **border `#e6e6e6`** — very faint lines, e.g. the footer divider.

Choose by role: white text over the message background photos, ink text over white surfaces.
Note the message sections use full-cover background **photos** — Message 1 a pink-toned photo,
Message 2 a green-pattern photo — not flat color fills. **Don't add the flat `#ef5b9f` color band**
from the old design; the pink here is photographic.

## Typography

- One typeface: **Zen Maru Gothic** (rounded gothic), with **Lato** as the Latin fallback.
  Fonts are self-hosted (`public/fonts/`).
- All Japanese text shares **`letter-spacing: 0.15em` / `line-height: 1.4`**. The relaxed
  tracking is a fingerprint of this design.
- Weights: **500** for body, **700** for the message lead only. Available: 300/400/500/700/900.
- Levels: `message-lead` (16/700, white over the message photos) / `card-title` (20/500, company name) /
  `card-body` (16/500, address etc.) / `caption` (12/500, carousel).
- Message copy is centered — each line shrink-wraps to its content and is centered as a block.

## Layout

- **1280px reference width**, centered. Two breakpoints: **840px (tablet) / 540px (mobile)**
  via `max-width` media queries.
- Single long page. Main blocks in DOM order (top → bottom):
  1. **Fixed background** — green leaf pattern, `background-size: cover; repeat`, full-screen
     `position: fixed`. The base for everything below.
  2. **Noren hero** — a pinned stage (`.noren-hero`, ~300vh so it holds ~2 viewports). A
     single-SVG noren (connected top band + 3 flaps split by 2 slits; logo and rod tabs
     painted on) is approached (scale) and lifts (translateY) on scroll to reveal the
     video; the flaps sway to pointer/tap (see Motion).
  3. **Intro video** — centered behind the noren over the fixed pattern; fades in mid-scroll
     and plays. Not a separate section anymore — it lives inside the hero reveal.
  4. **Message 1** — full-cover **pink background photo** (torn frame + kitchen group shot);
     three centered white lines sit in the lower half (greeting / "now running" / intent).
  5. **Message 2 + info card** — full-cover **green-pattern background photo** behind a white
     call-to-action line and a white rounded card (left 380px: company name + address; right
     441px: carousel). The feature photo (block 6) also sits over this same background.
  6. **Photo section** — a wide photo shown at 605px height, centered (450px on mobile).
  7. **Footer** — a white panel with a large rounded top edge: logo + wordmark + faint divider.
- Key sizes: info card 956×380 / padding 40 / left column 380 / right column 441. Footer
  inner width 1280 / padding 64·40·24 / gap 60.

## Elevation & Depth

Box-shadows are essentially unused. Depth comes from **layering and the fixed/scroll
contrast**:

- Fixed green pattern (backmost, `z-index: 0`) → sticky hero/video pass over it
  (`z-index: 1`) → normal-flow messages/card → footer (`z-index: 1`, `position: absolute;
  bottom: 0`).
- Cards and the footer read as raised via **white surface + rounded corners + faint border**,
  not shadow.

## Shapes

- Corner radius scales by role: images `sm 8px` / card `md 20px` / nav buttons `full` (circle)
  / footer top `hero 80px`.
- The 80px footer radius reads like the soft rim of a large bowl. It's a design accent — do
  not shrink it.

## Components

- **info-card** — white, radius 20px, padding 40px, width 956px; two columns on desktop
  (`space-between`). On mobile (540): stacked, gap 16, padding 20, margin 20,
  width `calc(100% - 40px)`.
- **carousel** — 302px tall, `overflow: hidden`. Slides transition via `translateX(∓100%)`
  (see Motion) and auto-play. Images are radius 8px with a caption below. Nav is
  absolutely positioned at the bottom center.
- **nav-button** — 20px circle (32px on mobile). White background, `1px solid brand-green`,
  brand-green icon. **On hover: accent-orange fill, white icon.**
- **footer** — white panel, top radius 80px, `position: absolute; bottom: 0`. Holds the
  logo (144px wide) and wordmark (32px tall) in a row (gap 40), with an `#e6e6e6` 1px
  divider beneath.

## Motion

Keep motion quiet and slow; avoid flashy effects. The one playful, tactile note is the
noren sway.

- **appear (shared)** — elements start at `opacity: 0; translateY(20px)` and settle into
  place/opacity over `500ms ease-in-out` when they enter the viewport.
- **noren reveal** — pure CSS scroll-driven (`animation-timeline: scroll()`). Over the first
  viewport the noren approaches (`scale 1 → 1.12`) then lifts (`translateY 0 → -125%`);
  `fill: both` holds it lifted for the rest of the pin, whose length is set only by
  `.noren-hero` height (~2 viewports).
- **noren sway** — `<noren-cloth>` (plain-TS Web Component) leans the flaps with a coupled
  damped spring on pointer sweep / tap (top-anchored `skewX`); still when untouched.
- **video reveal** — the centered video goes `opacity 0 → 1` mid-scroll while it starts
  playing (no blur).
- **carousel** — slide transition `cubic-bezier(0.58, 0.21, 0.41, 0.96)`; nav
  `cubic-bezier(0.4, 0.4, 0.05, 1)`. Auto-play enabled.
- **body background** — `transition: background 0.5s cubic-bezier(0.4, 0.4, 0, 1)`.
- Under `prefers-reduced-motion: reduce`, disable the noren reveal + sway, the video fade,
  and the appear animations; the base state shows the raised noren (video visible) and the
  page must remain statically reachable.

> The noren hero's full spec lives in `DECISIONS.md` (決定 11). The STUDIO-derived sections'
> raw measurements are in `studio-source/DESIGN-SPEC.md`. This file keeps only the essentials.

## Do's and Don'ts

**Do**

- Text over the message background photos must be **white (on-brand)**; text over white surfaces must be **ink `#333`**.
- Always apply `letter-spacing: 0.15em` / `line-height: 1.4` to Japanese text.
- Keep the 1280px reference and 840/540 breakpoints.
- Keep motion slow and soft (fade / blur / gentle zoom).
- Keep Japanese copy verbatim — do not normalize full-width hyphen 「−」 or 「,,,」.

**Don't**

- **Don't add the flat `#ef5b9f` pink color band** from the old design. (The pink in Message 1 is a
  background *photo*, `message_bg.webp`, not a CSS color.)
- Don't bring back the old "chopsticks" images (absent from this design). The noren hero IS
  the current design — a deliberate brush-up (a new single-SVG noren + CSS scroll reveal),
  not the old JS `intro-sequence` (which is gone).
- Don't use accent-orange in the resting state (hover only).
- Don't lean on shadows; build depth from layering, rounded corners, and faint borders.
- Don't use pure black `#000` or generic fonts like Arial/Inter.
