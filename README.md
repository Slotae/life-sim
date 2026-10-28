# Life.SIM — One Life, Many Worlds

A choice-led life simulator. The clock runs on its own, then pauses at decisions that can change a whole chapter of the character's life.

## Play

Open `index.html` in a browser. The first decision appears at age 18. Choose one of three paths; years then pass automatically until the next major event. Use **1×**, **2×**, or **4×** to set the pace, or pause the clock yourself between events.

Choices affect work, study, housing, savings, debt, health, relationships, family care, and where the character lives. University and job applications compare the character's study, language, practical, and interview scores against a visible entry threshold. Scores improve through study, work, and time abroad. The in-game clock advances through a daily routine, while the character and pixel-art scene change with each new life, activity, and city.

## Project layout

- `index.html` — one-screen interface
- `styles.css` — layout and visual design
- `js/life-sim.js` — life model, finances, events, and user interaction
- `js/pixel-scene.js` — hand-drawn animated canvas scene
- `data/world-profiles.json` — editable country-level source snapshot
- `data/world-profiles.js` — browser-ready copy, generated from the JSON file

The game has no backend or database. To refresh the browser data after editing the JSON, run `node scripts/build-world-data.js`. GitHub Pages runs that step automatically when `main` changes.

## How the simulation works

Population and crude birth rate influence the starting country draw. Country-level income, consumption, inequality, life expectancy, healthcare, unemployment, and other indicators shape the starting conditions. Yearly costs rise over time; earnings, job stability, savings, and debt respond to the character's choices. Family structure and individual outcomes are modeled estimates, not observed records or predictions.

World Bank indicators use the latest available non-missing value for each series, so indicator years differ. Missing indicators remain unavailable instead of being filled with invented values.

Source: [World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)
