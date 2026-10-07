# Processing the Dead — top-down 5 minute prototype

This prototype tests the stronger version of the idea:

**a visually escalating afterlife-office management/incremental game**, rather than a pure clicker.

## What changes during the run

- Start with one clerk, one desk and a queue of souls.
- Manual processing earns Authority immediately.
- First efficiency choice arrives quickly.
- Printer physically appears.
- Automation begins.
- Staffing/machinery choice changes the office.
- Filing Cabinet appears.
- More workers/desks can appear depending on choices.
- Floating numbers and throughput multipliers reinforce every improvement.
- Soul Tube arrives as the ~4–5 minute visual payoff.

Headline stats remain visible:

- Authority
- Souls processed
- Souls / min
- Office efficiency

## Run locally

No install or build step.

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Economy smoke test

If Node is installed:

```bash
node economy-test.mjs
```

This checks two representative upgrade paths using a baseline of about one deliberate manual action per second.

## Playtest recommendation

Do not explain the game beforehand.

Give the player the page and see whether they voluntarily reach the Soul Tube.

Afterwards ask:

1. Which prototype did you prefer overall?
2. What moment made the office feel most satisfying?
3. Was anything confusing without explanation?
4. Did you enjoy watching the office become more efficient?

## Scope

Intentionally excluded:

- saves
- prestige/restructure
- policies/mandates
- incidents
- backend
- accounts
- monetisation
- long-term progression
- anything beyond the Soul Tube

The purpose is only to test whether the first five minutes are satisfying.


## v3 additions

This version adds three player-agency systems:

- **Visible bottlenecks** — Walking / Intake / Filing waste is shown live.
- **Clerk roles** — with multiple workers, assign each to Intake, Processing or Filing; routes visibly change.
- **Filing Cabinet placement** — choose among three cabinet locations with different walking/throughput effects.

These are deliberately small choices so the game stays a five-minute prototype rather than becoming a full management sim.


## v4 onboarding pass
- First-shift briefing explains Process → Earn → Buy → Automate → Optimise.
- First action and first upgrade are explicitly guided.
- Once automation starts, the main button becomes optional help rather than the implied core loop.
- The game then points players toward bottlenecks and worker management.


## v5 themed visual overhaul
Approved mockup direction applied: dark framed UI, warm office palette, teal spectral glow, richer props, tiny office workers, posters, plants, floor branding and a much chunkier Soul Tube.


## v6 reference-match visual polish

- Uses the approved Department 42 header artwork from the reference screenshot.
- Enlarges and centralises the Department 42 floor emblem.
- Reworks the right rail into a cork bulletin board with pinned-paper / Post-it style surfaces.
- Reduces the rigid stacked-panel feel while preserving the same gameplay and controls.


## v7 share polish
- Moved PROCESSING labels above the processing desks.
- Clerks now stop in front of desks instead of walking through/standing on the furniture.
