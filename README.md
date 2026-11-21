# casio-structural-programs

Eight **Casio fx-9860GIII** Basic programs for structural-analysis exams, plus the tooling that builds them: a `.g1m` file writer and a small Casio Basic interpreter used to run every listing in the tests.

The programs were written for a university course (Estabilidad / structural stability) and use its conventions: **kg, m, kg·m, kg/cm²**, and the course's left-handed global triad. The numbers they print are checked against an independent solver (the direct-stiffness 2D/3D solvers and the section checks of [Sagitta](https://github.com/navarroaxel/sagitta), vendored here under `src/lib/`).

> **Not run on real hardware by the test-suite.** The listings are executed by `src/lib/__tests__/casioBasic.ts` (an interpreter of the Basic subset they use) and compared with the solver. The `.g1m` container was verified by rebuilding four real `.g1m` files byte for byte, but the graphics commands and some key codes are the least-checked part. See [Verification status](#verification-status).

## Programs

| Program | What it does |
| --- | --- |
| **REACC** | Support reactions of a statically determinate **3D frame** fixed at A, from its loads (point forces, distributed loads, moments). Loads persist between runs (lists 11–21). Menu: add loads, list / delete loads, reactions, section cut at the base of a vertical column (N, Qx, Qy, Mx, My in the local triad). |
| **SECC** (SECCION) | Lightest **IPB 100…600** whose max σ ≤ σ_adm for given N, Mx, My. Picks the face (strong axis against the larger moment), gives the neutral axis intercepts and draws the section, σ at the four corners, the critical corner, the σ(Mx) and σ(My) bow-ties and the **resultant (oblique) diagram**. A menu lets you see every view again. |
| **VIGACAB** | Horizontal beam held by a vertical **cable** at one end and pinned at the other, with any number of point loads plus a uniform load. Mmax, lightest IPB by Sx, the cable's tension / area / diameter / elongation, and the moment diagram. |
| **TRACCION** | A truss bar in **tension**: A ≥ N/σ_adm, lightest IPB by area. |
| **PANDEO** | A truss bar in **compression**: I_min = P·(βL)²/(π²E) (Euler, weak axis), lightest IPB with Iy ≥ I_min, its P_cr and a warning when σ = P/A exceeds σ_adm. |
| **RETIC** | Bar forces of a statically determinate **truss** (3–6 nodes, up to 9 bars, a pinned support and a roller). The structure is **drawn on the graph screen while you load it**; nodes, bars, supports and loaded nodes are chosen on the drawing with the cursor or with the number keys. Gaussian elimination written in Basic. Output: N per bar with T / C, the critical bars, the length of the most compressed one, the reactions. |
| **PERFILES** | Lookup of the 23 IPN and 24 IPB of the course table (A, weight, Sx, Sy, Ix, Iy): scroll a series, or ask for the lightest profile that reaches a required value. |
| **EXCENTR** | **Eccentric axial load** on an IPN / IPB (oblique compound bending): N, Mx = P·ey, My = P·ex, σ at the four corners, neutral axis, P_max and the drawing. |

Every choice is an **arrow-key menu** (`▲ ▼` move a `>`, `EXE` chooses). Each item ends with a small superscript number: pressing that number key chooses it at once. `EXIT` or `0` leave.

Typical exam chain: `VIGACAB` (cable force) → `RETIC` (truss bar forces with that load) → `TRACCION` / `PANDEO` (size each bar); and `REACC` → `SECCION` for a 3D column.

## Getting the programs onto the calculator

1. Build (or use the committed files): `npm install && npm run build` writes
   - `g1m/*.g1m` — ready-to-copy program files,
   - `listings/*.txt` — the plain Basic text, one statement line per line.
2. **From a computer:** connect the calculator over USB (mass-storage mode) and copy the `.g1m` files into the **`@MainMem`** folder (fx-9860GIII manual, p. 13-6).
3. **By hand:** type a listing in `PRGM` mode (`F3` NEW). The listings use only the fx-9860G command set; `→` is the store key, `◢` is the display command, `–` is the (–) key.

The programs share the calculator's variables `A–Z`; **lists 1–10** are scratch for every program except REACC, which keeps its loads in lists 11–21 (a test enforces it).

## Repository layout

```
src/lib/casioPrograms.ts      the listings (as arrays of lines) + TypeScript twins of their arithmetic
src/lib/casioG1m.ts           tokenizer and .g1m main-memory file writer
src/lib/__tests__/casioBasic.ts        interpreter of the Basic subset (Locate 21×7 limits, graphics recorder, Getkey)
src/lib/__tests__/casioPrograms.test.ts every program run end to end and compared with the solver
src/lib/__tests__/casioG1m.test.ts      token round-trip, file structure
src/lib/*.ts (the rest)       vendored from Sagitta: solver, sampling, profiles table, section guide, checks, presets
scripts/build.ts              writes g1m/ and listings/
g1m/, listings/               build output (committed for convenience)
```

`npm test` runs the whole suite (112 checks). `npm run typecheck` runs `tsc`.

The vendored files under `src/lib/` (everything except `casio*.ts`) are copies of the Sagitta app's modules. They exist only so the tests can compare the calculator programs against a real solver; they are not needed to *use* the programs.

## How it works

- **Listings are data.** Each program is an array of strings in `casioPrograms.ts`; helper generators (`menuLines`, `RET_DRAW`, `SIGMA_DIAGRAMS`, …) emit the repeated Basic. TypeScript functions (`reactionsFromLoads`, `chooseIPB`, `cableBeam`, `tensionBar`, `compressionBar`, `findProfile`, …) do the same arithmetic so the tests can compare the two.
- **The interpreter fails like the calculator.** `casioBasic.ts` throws on a `Locate` outside the 21-column × 7-line text screen, or text that runs past column 21 (the calculator's *Argument ERROR*), and records every graphics command per screen.
- **The `.g1m` writer** (`casioG1m.ts`): inverted 32-byte standard header, group `PROGRAM`, directory `system`, file type 1, 10 zero bytes of password, tokens, 1–4 zero bytes of padding. Token codes come from [Cahute](https://cahute.org)'s `chars.toml` (`F7xx` for If / Then / Else / IfEnd / For / To / Next / Stop / Locate / ClrText / Text / F-Line / PlotOn / Circle…, `7F51` List, `7F8F` Getkey, `0E` →, `0C` ◢, `87` (–), `99` −, `A9` ×, `B9` ÷, `97` Abs, `DE` Intg).
- **Key codes** for the menus are read from the manual's Getkey chart (p. 8-18): `▲ 28`, `▼ 37`, `◄ 38`, `► 27`, `EXE 31`, `EXIT 47`, digits `0=71 1=72 2=62 3=52 4=73 5=63 6=53 7=74 8=64 9=54`.

## Verification status

Checked:

- Every program's numbers against the solver / checks of the app (reactions of the 3D presets, bar forces of three trusses, IPB choices, cable and beam, section stresses, eccentric load).
- The `.g1m` container, by rebuilding four real files byte for byte (only 9 reserved header bytes differ; they have no function). Tokens by decoding with Cahute's table and by round-trip tests.
- Text-screen limits (`Locate` columns / lines) in the interpreter.

**Not verified on a real fx-9860GIII:**

- The Basic syntax itself was only checked against chapter 8 of the manual.
- Graphics commands (`Cls`, `ViewWindow`, `F-Line`, `PlotOn`, `Circle`, `Text`, `Horizontal`, `Vertical`) and `Intg` are not in the four real files used to check the container.
- Superscript digits (`E5Cx`) in strings. (Subscript letters, "Mini Latin" `E7xx`, were removed: a file using them vanished from the calculator after copying.)
- `◄ ►` key codes: `▲ ▼ EXE` and the number keys are confirmed on a calculator, the horizontal arrows are taken from the manual. RETIC is the program that uses them.

If something misbehaves on the device, please open an issue with the program name, the screen, and what you pressed.

## Units and conventions

- Forces in **kg**, lengths in **m**, moments in **kg·m**, section properties in **cm** (cm², cm³, cm⁴), σ in **kg/cm²** (default σ_adm 1600; SECCION 1400; `0` at a σ_adm prompt means the default). E = 2.1·10⁶ kg/cm².
- IPN / IPB data are the CIRSOC table of the course; `profiles.ts` has a test that checks every row against its geometry.
- Internal forces: N > 0 tension; the 3D local triad is the course's left-handed one (z along the member, x out of the plane, y to the right for columns / down for beams).
- `PANDEO` uses Euler only (pinned ends unless β is typed, weak axis, safety coefficient 1).

## Origin

Extracted from the [Sagitta](https://github.com/navarroaxel/sagitta) frame-diagram simulator, where the programs were developed together with a study page and the section-cut guide.

## License

[MIT](LICENSE). The files under `src/lib/` that come from Sagitta are the same author's and carry the same license.
