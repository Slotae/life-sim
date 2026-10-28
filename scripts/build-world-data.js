const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "data", "world-profiles.json");
const browserPath = path.join(projectRoot, "data", "world-profiles.js");
const countries = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

if (!Array.isArray(countries) || countries.length === 0) {
  throw new Error("The World Bank country snapshot is empty or invalid.");
}

const output = [
  "/* Generated from world-profiles.json. Edit the JSON source, then run this script. */",
  `window.LIFE_SIM_COUNTRIES = ${JSON.stringify(countries)};`,
  "",
].join("\n");

fs.writeFileSync(browserPath, output, "utf8");
console.log(`Prepared ${countries.length} country profiles for the browser.`);
