<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨

You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

---

## INSTRUCTIONS

- **MAX 5 lines** per entry - be concise but informative
- **Include file paths** of key files modified or discovered
- **Note patterns/conventions** found in the codebase
- **Sort entries by date** in DESCENDING order (most recent first)
- If this file gets corrupted, messy, or unsorted -> re-create it. 
- CRITICAL: Updating this file at the END of EVERY response is MANDATORY.
- CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

</instructions>

<changelog>
<!-- NEXT_ENTRY_HERE -->

## 2026-03-12 (6)
- Gave each artboard its own independent state via `useArtboard` custom hook
- CMYK sliders now range 0–255; Common slider stays 0–100; fill % adjusted accordingly
- Input/Output/Gamma start with distinct preset colours
- Modified: `src/screens/DarkModeTrueStyle/DarkModeTrueStyle.tsx`

## 2026-03-12 (5)
- Converted to light mode, removed "CMYK" label under swatch, added gradient border per artboard
- Tripled artboard into Input / Output / Gamma panels side-by-side
- Gamma-only "Common" slider (purple, 0–100) added below K slider
- Extracted `Artboard` component; shared colour state drives all three panels
- Modified: `src/screens/DarkModeTrueStyle/DarkModeTrueStyle.tsx`

## 2026-03-12 (4)
- Merged color picker + CMYK panel into a single unified artboard (removed separate color-wheel panel)
- Added editable CMYK input fields alongside each slider with focus/blur/Enter/Escape commit flow
- Added `clampPct` helper and `cmykInput` state mirroring `rgbInput` pattern
- Modified: `src/screens/DarkModeTrueStyle/DarkModeTrueStyle.tsx`

## 2026-03-12 (3)
- Made HEX and RGB fields editable with back-propagation to CMYK sliders
- Added `rgbToCmyk` conversion, `parseHex` utility, and `clampByte` helper
- HEX/RGB inputs use controlled local edit state, committed on blur or Enter
- Fields show a subtle focus ring while editing; Escape cancels without committing

## 2026-03-12 (2)
- Wired CMYK sliders to live HEX/RGB output via `cmykToRgb` conversion function
- Modified: `src/screens/DarkModeTrueStyle/DarkModeTrueStyle.tsx`
- HEX field, R/G/B fields, swatch bar, and color wheel tint overlay all update in real time
- CMYK range changed to 0–100 (correct CMYK convention); sliders drive all color outputs

## 2026-03-12
- Added interactive CMYK sliders panel to the right of the color picker
- Modified: `src/screens/DarkModeTrueStyle/DarkModeTrueStyle.tsx`
- Sliders use React state, range 0–255, with colored fill tracks for C/M/Y/K
</changelog>
