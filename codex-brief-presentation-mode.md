# Codex Brief — Viva Brasil Travel Studio: Presentation Mode + Client Detail Screen

**Project location:** `/Users/seanlurie/Documents/Vyager Digital/prospects/viva-brasil-studio-mockup/`

**Existing screens:** `01-dashboard.html`, `02-intake.html`, `03-review.html`, `04-stories.html`, `05-draft.html`

**Design tokens (match exactly across all new work):**
- Background: `#F4F2EE`
- Navy: `#141E3D` (sidebar), `#1E2D5A` (text)
- Gold: `#C9902A`
- Card bg: `#fff`, border: `#E0DDD8`
- Fonts: Bebas Neue (display), Oswald (labels/nav), Montserrat (body)

---

## Task 1 — New screen: `02-client.html` (Client Detail)

Build a client detail screen that opens when Daniel clicks a client row from the dashboard. Must match the sidebar/layout of all existing screens exactly.

### Header
Client name, status badge, origin country, trip type, last updated date.

Use this dummy client: **Klaus & Margot Brenner** — Swiss couple, 14 days, Pantanal + Lençóis Maranhenses, status: Proposal Sent.

### Panel 1 — Call Notes
Raw textarea showing Daniel's original call notes (dummy text, realistic). Read-only. Small "Edit" link top right.

### Panel 2 — Proposals
List of proposal versions. Each row:
- Version label (e.g. "Proposal v1", "Proposal v2")
- Date generated
- Language badges: PT / DE / FR — active or greyed out depending on what was generated
- Download icon

Show 2 dummy versions.

### Panel 3 — Selected Destinations
Horizontal row of small destination cards — thumbnail image, destination name, category tag (e.g. "Pantanal", "Lençóis Maranhenses"). Use existing image assets from `assets/`. Show 3–4 cards.

---

## Task 2 — Shared tour engine: `assets/tour.js`

A shared script included in every screen. Manages a click-to-advance presentation mode. Tracks position across pages using a `?tour=N` query parameter.

### Behaviour

- A **"Present"** button appears fixed top-right on every screen. Gold background, Oswald font, uppercase. Clicking it starts the tour at step 1 for that page.
- Tour mode dims the entire screen with a dark overlay (`rgba(0,0,0,0.55)`).
- The active element is highlighted — use `box-shadow: 0 0 0 9999px rgba(0,0,0,0.55)` on the element. CSS only, no canvas.
- A tooltip card appears near the highlighted element.
- Prev / Next controls inside the tooltip. ESC or a close icon exits.
- On Next, if the next step is on a different screen, navigate to that screen with `?tour=N` appended.

### Tooltip structure

```
[ Main copy — 1 to 2 short lines. White. Montserrat 15px. Line-height 1.6. ]

─────────────────────────── (thin gold border)

[ Behind the scenes — 1 to 2 short lines. Lighter grey. Montserrat 13px. ]
```

Not every step has a "Behind the scenes" section. Only add it where specified below.

---

## Task 3 — Tour copy (exact, do not rewrite)

Implement the following steps in order. Each step specifies: the screen, the element to highlight, the main copy, and the behind the scenes note if applicable.

---

### Step 1 — Dashboard (`01-dashboard.html`)
**Highlight:** `.cards` (the three stat cards)
**Main copy:**
> Here's where your pipeline lives.
> Every lead, every status, at a glance.

---

### Step 2 — Client List (`01-dashboard.html`)
**Highlight:** `.panel` (the recent clients table)
**Main copy:**
> Every client you've worked with — organised and searchable.

**Behind the scenes:**
> Each record holds their profile, selected destinations, every proposal version, and all three language outputs.

---

### Step 3 — Client Detail (`02-client.html`)
**Highlight:** The proposals panel
**Main copy:**
> Every version of every proposal, stored.
> Pick up where you left off, any time.

**Behind the scenes:**
> Each record stores the client profile, the destinations selected, and all language versions — generated once, available instantly.

---

### Step 4 — Intake (`02-intake.html`)
**Highlight:** The call notes textarea
**Main copy:**
> Paste your notes from the call.
> One click — and the AI takes over.

**Behind the scenes:**
> The AI pulls out the key details — name, origin, budget, travel dates, interests, and group size — into separate fields.

---

### Step 5 — Review (`03-review.html`)
**Highlight:** The extracted fields / editable profile area
**Main copy:**
> You see what the AI picked up.
> Adjust anything that doesn't look right.

**Behind the scenes:**
> This profile is saved to a dedicated database.
> Every step that follows — destination matching, proposal writing, translation — reads from this record.

---

### Step 6 — Stories (`04-stories.html`)
**Highlight:** The story card grid
**Main copy:**
> The AI recommends which destinations to include.
> It explains why for each one.

**Behind the scenes:**
> Your destinations are already loaded — every text, photo, and tag, structured and ready.
> The AI reads from a dedicated database.
> The client's profile is matched against your full destination library. The best fits come first.

*Note: This behind the scenes note is 3 lines — render each on its own line with slightly more spacing between them.*

---

### Step 7 — Draft (`05-draft.html`)
**Highlight:** The proposal body / main editable area
**Main copy:**
> Your proposal. In your voice.
> Ready to edit and send.

**Behind the scenes:**
> Before writing, the AI loads a selection of your past proposals as reference.
> It matches your tone and structure — then writes.
> Language versions are generated and stored at the same time.

*Note: Same as above — 3 lines, render with spacing.*

---

## Notes for Codex

- Do not alter any existing screen content. Add tour anchors (`data-tour-id`) to existing elements where needed, but make no visual changes outside tour mode.
- The "Present" button must not interfere with the existing layout. Fixed position, top-right, z-index above everything.
- Tour state should reset cleanly when ESC is pressed or the close icon is clicked.
- Test that navigating between screens via Next preserves tour position correctly using the `?tour=N` param.
- The `02-client.html` screen must be linked from client rows in `01-dashboard.html` (replace or supplement the existing `02-intake.html` link on client rows — clicking a row opens the client detail, not intake).
