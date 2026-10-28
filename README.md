# Life Sim Prototype

Static browser game prototype. Open `index.html` directly; it has no build step or backend. The first decision appears at age 18. Choose one of three paths; time then advances and pauses at later life events. Use 1×, 2×, or 4× to change the simulation pace.

## What's included

- Time advances automatically and pauses at major life decisions.
- Pixel-art daily activity scene with a visible SVG fallback.
- One-screen overview for money, family, work, health, and country context.
- Country-level World Bank indicators embedded in `index.html`; `data/world-profiles.json` is the editable data snapshot.

## Data notes

Country indicators use the latest non-missing World Bank WDI value available for each series, so years vary. Birthplace draws use population and crude birth rate as a proxy. Household income, expenses, family composition, and individual outcomes are simulation estimates calibrated from country-level consumption, GDP per capita, inequality, and fertility. They are not observed personal records or predictions.

Source: [World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)

