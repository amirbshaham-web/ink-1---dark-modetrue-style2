import { useState, useCallback } from "react";

const cmykChannels = [
  { key: "c", label: "C", color: "#00bcd4" },
  { key: "m", label: "M", color: "#e91e8c" },
  { key: "y", label: "Y", color: "#f9e000" },
  { key: "k", label: "K", color: "#9e9e9e" },
] as const;

type CmykKey = "c" | "m" | "y" | "k";

// CMYK values are now 0–255 internally
function cmykToRgb(c: number, m: number, y: number, k: number) {
  const cn = c / 255, mn = m / 255, yn = y / 255, kn = k / 255;
  return {
    r: Math.round(255 * (1 - cn) * (1 - kn)),
    g: Math.round(255 * (1 - mn) * (1 - kn)),
    b: Math.round(255 * (1 - yn) * (1 - kn)),
  };
}

function rgbToCmyk(r: number, g: number, b: number): Record<CmykKey, number> {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 255 };
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 255),
    m: Math.round(((1 - gn - k) / (1 - k)) * 255),
    y: Math.round(((1 - bn - k) / (1 - k)) * 255),
    k: Math.round(k * 255),
  };
}

function toHex(n: number) { return n.toString(16).padStart(2, "0").toUpperCase(); }

function parseHex(raw: string) {
  const s = raw.replace(/^#/, "").trim();
  if (!/^[0-9A-Fa-f]{6}$/.test(s)) return null;
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function clampByte(v: number) { return Math.max(0, Math.min(255, Math.round(v))); }
function clampPct(v: number) { return Math.max(0, Math.min(100, Math.round(v))); }

interface ArtboardState {
  cmyk: Record<CmykKey, number>;
  common: number;
  hexInput: string | null;
  rgbInput: { r: string | null; g: string | null; b: string | null };
  cmykInput: Record<CmykKey, string | null>;
}

function useArtboard(init: Record<CmykKey, number>) {
  const [cmyk, setCmyk] = useState<Record<CmykKey, number>>(init);
  const [common, setCommon] = useState(0);
  const [hexInput, setHexInput] = useState<string | null>(null);
  const [rgbInput, setRgbInput] = useState<{ r: string | null; g: string | null; b: string | null }>({ r: null, g: null, b: null });
  const [cmykInput, setCmykInput] = useState<Record<CmykKey, string | null>>({ c: null, m: null, y: null, k: null });

  const { r, g, b } = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  const handleCmykChange = useCallback((key: CmykKey, value: number) => {
    setCmyk((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleHexCommit = () => {
    if (hexInput !== null) {
      const parsed = parseHex(hexInput);
      if (parsed) setCmyk(rgbToCmyk(parsed.r, parsed.g, parsed.b));
    }
    setHexInput(null);
  };

  const handleRgbFocus = (ch: "r" | "g" | "b", val: number) =>
    setRgbInput((prev) => ({ ...prev, [ch]: String(val) }));
  const handleRgbChange = (ch: "r" | "g" | "b", val: string) =>
    setRgbInput((prev) => ({ ...prev, [ch]: val }));
  const handleRgbCommit = (ch: "r" | "g" | "b") => {
    const raw = rgbInput[ch];
    if (raw !== null) {
      const n = parseInt(raw, 10);
      if (!isNaN(n)) {
        const nr = ch === "r" ? clampByte(n) : r;
        const ng = ch === "g" ? clampByte(n) : g;
        const nb = ch === "b" ? clampByte(n) : b;
        setCmyk(rgbToCmyk(nr, ng, nb));
      }
    }
    setRgbInput((prev) => ({ ...prev, [ch]: null }));
  };

  const handleCmykInputFocus = (key: CmykKey) =>
    setCmykInput((prev) => ({ ...prev, [key]: String(cmyk[key]) }));
  const handleCmykInputChange = (key: CmykKey, val: string) =>
    setCmykInput((prev) => ({ ...prev, [key]: val }));
  const handleCmykInputCommit = (key: CmykKey) => {
    const raw = cmykInput[key];
    if (raw !== null) {
      const n = parseInt(raw, 10);
      if (!isNaN(n)) setCmyk((prev) => ({ ...prev, [key]: clampByte(n) }));
    }
    setCmykInput((prev) => ({ ...prev, [key]: null }));
  };

  return {
    cmyk, common, setCommon,
    r, g, b, hex,
    hexInput, setHexInput, commitHex: handleHexCommit,
    rgbInput,
    onCmykChange: handleCmykChange,
    onRgbFocus: handleRgbFocus,
    onRgbChange: handleRgbChange,
    onRgbCommit: handleRgbCommit,
    cmykInput,
    onCmykInputFocus: handleCmykInputFocus,
    onCmykInputChange: handleCmykInputChange,
    onCmykInputCommit: handleCmykInputCommit,
  };
}

interface ArtboardProps {
  headline: string;
  showCommon?: boolean;
  cmyk: Record<CmykKey, number>;
  common?: number;
  onCmykChange: (key: CmykKey, value: number) => void;
  onCommonChange?: (value: number) => void;
  r: number; g: number; b: number;
  hex: string;
  hexInput: string | null;
  setHexInput: (v: string | null) => void;
  commitHex: () => void;
  rgbInput: { r: string | null; g: string | null; b: string | null };
  onRgbFocus: (ch: "r" | "g" | "b", val: number) => void;
  onRgbChange: (ch: "r" | "g" | "b", val: string) => void;
  onRgbCommit: (ch: "r" | "g" | "b") => void;
  cmykInput: Record<CmykKey, string | null>;
  onCmykInputFocus: (key: CmykKey) => void;
  onCmykInputChange: (key: CmykKey, val: string) => void;
  onCmykInputCommit: (key: CmykKey) => void;
}

function Artboard({
  headline, showCommon = false,
  cmyk, common = 0, onCmykChange, onCommonChange,
  r, g, b, hex,
  hexInput, setHexInput, commitHex,
  rgbInput, onRgbFocus, onRgbChange, onRgbCommit,
  cmykInput, onCmykInputFocus, onCmykInputChange, onCmykInputCommit,
}: ArtboardProps) {
  const rgbCss = `rgb(${r}, ${g}, ${b})`;
  const gradientBorder = `linear-gradient(135deg, ${rgbCss} 0%, rgba(${r},${g},${b},0.15) 100%)`;

  const labelClass = "font-medium text-[#444] text-[8px] tracking-[0] leading-[normal] [font-family:'Inter',Helvetica]";
  const inputBase = "w-full bg-transparent outline-none [font-family:'Inter',Helvetica] font-normal text-[#333] text-[10px] tracking-[0.04px] leading-5 caret-[#333]";
  const fieldBox = (active: boolean, extra?: string) =>
    `flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] rounded ring-inset ${active ? "ring-1 ring-[#333]/30" : ""} ${extra ?? ""}`;

  const displayHex = hexInput !== null ? hexInput : hex;
  const displayR = rgbInput.r !== null ? rgbInput.r : String(r);
  const displayG = rgbInput.g !== null ? rgbInput.g : String(g);
  const displayB = rgbInput.b !== null ? rgbInput.b : String(b);

  return (
    <div className="rounded-xl p-[2px]" style={{ background: gradientBorder, transition: "background 0.15s ease" }}>
      <div className="flex flex-col bg-white rounded-[10px] p-3 gap-3" style={{ width: 260 }}>
        <div className="[font-family:'Inter',Helvetica] font-semibold text-[#222] text-[11px] tracking-[0.02em]">
          {headline}
        </div>

        <div className="w-full h-[72px] rounded-lg" style={{ backgroundColor: rgbCss, transition: "background-color 0.1s ease" }} />

        <div className="flex flex-col gap-2">
          {cmykChannels.map(({ key, label, color }) => {
            const rawVal = cmykInput[key];
            const displayVal = rawVal !== null ? rawVal : String(cmyk[key]);
            return (
              <div key={key} className="flex flex-col gap-[5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className={labelClass}>{label}</span>
                  <div className={fieldBox(rawVal !== null, "w-[44px]")}>
                    <input
                      className={`${inputBase} text-right`}
                      value={displayVal}
                      onFocus={() => onCmykInputFocus(key)}
                      onChange={(e) => onCmykInputChange(key, e.target.value)}
                      onBlur={() => onCmykInputCommit(key)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") onCmykInputCommit(key);
                      }}
                      spellCheck={false}
                      maxLength={3}
                    />
                  </div>
                </div>
                <div className="relative w-full h-[6px] rounded-full bg-[#e8e8e8] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
                    style={{ width: `${(cmyk[key] / 255) * 100}%`, backgroundColor: color }}
                  />
                  <input
                    type="range" min={0} max={255} value={cmyk[key]}
                    onChange={(e) => onCmykChange(key, Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: 1 }}
                  />
                </div>
              </div>
            );
          })}

          {showCommon && (
            <div className="flex flex-col gap-[5px]">
              <div className="flex items-center justify-between gap-2">
                <span className={labelClass}>Common</span>
                <div className={fieldBox(false, "w-[44px]")}>
                  <input className={`${inputBase} text-right`} value={String(common)} readOnly spellCheck={false} maxLength={3} />
                </div>
              </div>
              <div className="relative w-full h-[6px] rounded-full bg-[#e8e8e8] overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75" style={{ width: `${common}%`, backgroundColor: "#a78bfa" }} />
                <input
                  type="range" min={0} max={100} value={common}
                  onChange={(e) => onCommonChange?.(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ zIndex: 1 }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1 w-[64px]">
            <div className={labelClass}>HEX</div>
            <div className={fieldBox(hexInput !== null)}>
              <input
                className={`${inputBase} mt-[-0.4px]`}
                value={displayHex}
                onFocus={() => setHexInput(hex)}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={commitHex}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") setHexInput(null);
                }}
                spellCheck={false}
                maxLength={7}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <div className={labelClass}>RGB</div>
            <div className="flex items-center gap-px">
              {(
                [
                  { ch: "r" as const, val: displayR, border: "rounded-[4px_0px_0px_4px]" },
                  { ch: "g" as const, val: displayG, border: "" },
                  { ch: "b" as const, val: displayB, border: "rounded-[0px_4px_4px_0px]" },
                ] as const
              ).map(({ ch, val, border }) => (
                <div
                  key={ch}
                  className={`flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] flex-1 ring-inset ${border} ${rgbInput[ch] !== null ? "ring-1 ring-[#333]/30" : ""}`}
                >
                  <input
                    className={`${inputBase} text-right mt-[-0.4px]`}
                    value={val}
                    onFocus={() => onRgbFocus(ch, ch === "r" ? r : ch === "g" ? g : b)}
                    onChange={(e) => onRgbChange(ch, e.target.value)}
                    onBlur={() => onRgbCommit(ch)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      if (e.key === "Escape") onRgbCommit(ch);
                    }}
                    spellCheck={false}
                    maxLength={3}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const DarkModeTrueStyle = (): JSX.Element => {
  const inputBoard  = useArtboard({ c: 97, m: 171, y: 0,   k: 13 });
  const outputBoard = useArtboard({ c: 0,  m: 0,   y: 0,   k: 128 });
  const gammaBoard  = useArtboard({ c: 0,  m: 51,  y: 255, k: 0 });

  return (
    <div className="flex items-start gap-4 p-8 bg-[#f5f5f5] min-h-screen">
      <Artboard
        headline="Input"
        cmyk={inputBoard.cmyk} onCmykChange={inputBoard.onCmykChange}
        r={inputBoard.r} g={inputBoard.g} b={inputBoard.b} hex={inputBoard.hex}
        hexInput={inputBoard.hexInput} setHexInput={inputBoard.setHexInput} commitHex={inputBoard.commitHex}
        rgbInput={inputBoard.rgbInput}
        onRgbFocus={inputBoard.onRgbFocus} onRgbChange={inputBoard.onRgbChange} onRgbCommit={inputBoard.onRgbCommit}
        cmykInput={inputBoard.cmykInput}
        onCmykInputFocus={inputBoard.onCmykInputFocus} onCmykInputChange={inputBoard.onCmykInputChange} onCmykInputCommit={inputBoard.onCmykInputCommit}
      />
      <Artboard
        headline="Output"
        cmyk={outputBoard.cmyk} onCmykChange={outputBoard.onCmykChange}
        r={outputBoard.r} g={outputBoard.g} b={outputBoard.b} hex={outputBoard.hex}
        hexInput={outputBoard.hexInput} setHexInput={outputBoard.setHexInput} commitHex={outputBoard.commitHex}
        rgbInput={outputBoard.rgbInput}
        onRgbFocus={outputBoard.onRgbFocus} onRgbChange={outputBoard.onRgbChange} onRgbCommit={outputBoard.onRgbCommit}
        cmykInput={outputBoard.cmykInput}
        onCmykInputFocus={outputBoard.onCmykInputFocus} onCmykInputChange={outputBoard.onCmykInputChange} onCmykInputCommit={outputBoard.onCmykInputCommit}
      />
      <Artboard
        headline="Gamma"
        showCommon
        cmyk={gammaBoard.cmyk} onCmykChange={gammaBoard.onCmykChange}
        common={gammaBoard.common} onCommonChange={gammaBoard.setCommon}
        r={gammaBoard.r} g={gammaBoard.g} b={gammaBoard.b} hex={gammaBoard.hex}
        hexInput={gammaBoard.hexInput} setHexInput={gammaBoard.setHexInput} commitHex={gammaBoard.commitHex}
        rgbInput={gammaBoard.rgbInput}
        onRgbFocus={gammaBoard.onRgbFocus} onRgbChange={gammaBoard.onRgbChange} onRgbCommit={gammaBoard.onRgbCommit}
        cmykInput={gammaBoard.cmykInput}
        onCmykInputFocus={gammaBoard.onCmykInputFocus} onCmykInputChange={gammaBoard.onCmykInputChange} onCmykInputCommit={gammaBoard.onCmykInputCommit}
      />
    </div>
  );
};
