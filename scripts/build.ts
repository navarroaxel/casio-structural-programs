// Writes every program as a .g1m (g1m/) and as plain text (listings/), straight from the listings in src/lib/casioPrograms.ts.
import { mkdirSync, writeFileSync } from "node:fs";
import { buildG1m } from "../src/lib/casioG1m";
import {
  EXCENTR_LINES, EXCENTR_NAME, PANDEO_LINES, PANDEO_NAME, PERFILES_LINES, PERFILES_NAME, REACC_LINES, REACC_NAME,
  RETIC_LINES, RETIC_NAME, SECCION_LINES, SECCION_NAME, TRACCION_LINES, TRACCION_NAME, VIGACAB_LINES, VIGACAB_NAME,
} from "../src/lib/casioPrograms";

const PROGRAMS: [string, string[]][] = [
  [REACC_NAME, REACC_LINES], [SECCION_NAME, SECCION_LINES], [VIGACAB_NAME, VIGACAB_LINES], [TRACCION_NAME, TRACCION_LINES],
  [PANDEO_NAME, PANDEO_LINES], [RETIC_NAME, RETIC_LINES], [PERFILES_NAME, PERFILES_LINES], [EXCENTR_NAME, EXCENTR_LINES],
];

mkdirSync("g1m", { recursive: true });
mkdirSync("listings", { recursive: true });
for (const [name, lines] of PROGRAMS) {
  const g1m = buildG1m(name, lines);
  writeFileSync(`g1m/${name}.g1m`, g1m);
  writeFileSync(`listings/${name}.txt`, lines.join("\n") + "\n");
  console.log(`${name.padEnd(9)} ${String(lines.length).padStart(4)} lines  ${String(g1m.length).padStart(6)} bytes`);
}
