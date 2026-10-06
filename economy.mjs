export const upgrades = [
  {
    id: "stamp",
    name: "Proper Rubber Stamp",
    short: "Stamp",
    cost: 25,
    kind: "upgrade",
    description: "Process each soul twice as efficiently.",
    target: "20–30 sec",
    effect: { clickValue: 2 }
  },
  {
    id: "printer",
    name: "Department Printer",
    short: "Printer",
    cost: 80,
    kind: "milestone",
    description: "A printer appears. It wheezes out forms all by itself.",
    target: "45–75 sec",
    effect: { passiveRate: 0.5 }
  },
  {
    id: "automation",
    name: "Automatic Form Feeder",
    short: "Automation",
    cost: 80,
    kind: "upgrade",
    description: "Your first promotion: paperwork now trickles through without you.",
    target: "~90 sec",
    effect: { clickValue: 3, passiveRate: 1.2 }
  },
  {
    id: "labels",
    name: "Pre-Printed Case Labels",
    short: "Labels",
    cost: 110,
    kind: "upgrade",
    description: "Less handwriting. More throughput. Fewer hauntings.",
    target: "~2 min",
    effect: { clickValue: 4 }
  },
  {
    id: "filing",
    name: "Filing Cabinet",
    short: "Filing Cabinet",
    cost: 230,
    kind: "milestone",
    description: "A permanent home for the paperwork nobody intends to read.",
    target: "2–3 min",
    effect: { passiveRate: 2.5 }
  },
  {
    id: "trolley",
    name: "Archive Trolley",
    short: "Trolley",
    cost: 190,
    kind: "upgrade",
    description: "The dead move faster when forms have wheels.",
    target: "~3 min",
    effect: { passiveRate: 3.5 }
  },
  {
    id: "bell",
    name: "Clerk's Service Bell",
    short: "Bell",
    cost: 260,
    kind: "upgrade",
    description: "Ding once. Somehow everyone works harder.",
    target: "~4 min",
    effect: { clickValue: 6 }
  },
  {
    id: "tube",
    name: "Soul Tube",
    short: "Soul Tube",
    cost: 420,
    kind: "milestone",
    description: "Install the pneumatic tube and complete the prototype.",
    target: "4–5 min",
    effect: {}
  }
];

export function initialEconomy() {
  return {
    authority: 0,
    clickValue: 1,
    passiveRate: 0,
    purchased: []
  };
}

export function applyUpgrade(state, upgrade) {
  const next = { ...state, purchased: [...state.purchased, upgrade.id] };
  next.authority -= upgrade.cost;
  if (upgrade.effect.clickValue !== undefined) next.clickValue = upgrade.effect.clickValue;
  if (upgrade.effect.passiveRate !== undefined) next.passiveRate = upgrade.effect.passiveRate;
  return next;
}

export function simulate({ clicksPerSecond = 1, tickSeconds = 0.1 } = {}) {
  let state = initialEconomy();
  let elapsed = 0;
  let lastPurchaseAt = 0;
  const results = [];

  for (const upgrade of upgrades) {
    let guard = 0;
    while (state.authority + 1e-9 < upgrade.cost) {
      const incomePerSecond = state.passiveRate + (state.clickValue * clicksPerSecond);
      state.authority += incomePerSecond * tickSeconds;
      elapsed += tickSeconds;
      guard += 1;
      if (guard > 100000) throw new Error("Economy simulation did not converge.");
    }

    const authorityBefore = state.authority;
    state = applyUpgrade(state, upgrade);
    const gap = elapsed - lastPurchaseAt;
    results.push({
      id: upgrade.id,
      name: upgrade.name,
      elapsed,
      gap,
      authorityBefore,
      clickValue: state.clickValue,
      passiveRate: state.passiveRate
    });
    lastPurchaseAt = elapsed;
  }

  return {
    clicksPerSecond,
    milestones: results,
    totalSeconds: elapsed,
    maxGap: Math.max(...results.map(x => x.gap))
  };
}
