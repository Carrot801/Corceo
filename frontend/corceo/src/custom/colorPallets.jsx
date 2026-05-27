import chroma from "chroma-js";

export const CHART_PALETTES = {
  Standard: {
    base: "#6366f1",
    preview: ["#818cf8", "#6366f1", "#4338ca"],
    mood: "balanced",
  },
  Ocean: {
    base: "#0077b6",
    preview: ["#00b4d8", "#0077b6", "#023e8a"],
    mood: "cool",
  },
  Warm: {
    base: "#e76f51",
    preview: ["#f4a261", "#e76f51", "#d62828"],
  	mood: "warm",
  },
  Pastel: {
    base: "#ffafcc",
    preview: ["#ffc8dd", "#ffafcc", "#bde0fe"],
    mood: "soft",
  },
  DeepSpace: {
    base: "#3a0ca3",
    preview: ["#4361ee", "#3a0ca3", "#240046"],
    mood: "dark",
  },

  Forest: {
    base: "#2a9d8f",
    preview: ["#74c69d", "#52b788", "#2a9d8f", "#1a5e63", "#114246"],
    mood: "nature",
  },
  Sunset: {
    base: "#f97316",
    preview: ["#ffed4a", "#ff9f1c", "#f97316", "#e11d48", "#4c0519"],
    mood: "vibrant",
  },
  Cyberpunk: {
    base: "#ff007f",
    preview: ["#00f5d4", "#7b2cbf", "#ff007f", "#ff5400", "#9e0059"],
    mood: "neon",
  },
  Corporate: {
    base: "#475569",
    preview: ["#cbd5e1", "#94a3b8", "#64748b", "#475569", "#1e293b"],
    mood: "monochrome",
  },
  Vintage: {
    base: "#8c7853",
    preview: ["#e0d6b8", "#b8a374", "#8c7853", "#704c38", "#4a2810"],
    mood: "retro",
  },

  Nordic: {
    base: "#4c566a",
    preview: ["#8fbcbb", "#88c0d0", "#81a1c1", "#5e81ac", "#4c566a"],
    mood: "frost",
  },
  Volcanic: {
    base: "#370617",
    preview: ["#faa307", "#f48c06", "#dc2f02", "#9d0208", "#370617"],
    mood: "intense",
  },
  Botanical: {
    base: "#6b705c",
    preview: ["#ddbea9", "#ffe8d6", "#b7b7a4", "#a3b18a", "#344e41"],
    mood: "earthy",
  },
  ElectricVolt: {
    base: "#ccff00",
    preview: ["#ccff00", "#10b981", "#3b82f6", "#6366f1", "#0f172a"],
    mood: "high-energy",
  },
  BerryCream: {
    base: "#7209b7",
    preview: ["#f72585", "#b5179e", "#7209b7", "#3f37c9", "#4cc9f0"],
    mood: "playful",
  },
  Terracotta: {
    base: "#b1563d",
    preview: ["#f2ccc3", "#e79780", "#b1563d", "#7c3622", "#491b0d"],
    mood: "warm-rustic",
  },

  ColorblindSafe: {
    base: "#0072B2",
    preview: [
      "#56B4E9",
      "#0072B2",
      "#009E73",
      "#E69F00",
      "#CC79A7",
    ],
    mood: "accessible",
  },
};

export const PALETTE_MODES = [
  "repeat",
  "gradient",
  "shuffle",
  "analogous",
];

function tonalPalette(preview, count) {
  return chroma
    .scale(preview)
    .mode("lab")          
    .correctLightness()   
    .colors(count);
}

function analogousPalette(preview, count) {
  const baseColor = preview[0] || "#6366f1";
  const centerHue = chroma(baseColor).get("lch.h");

  return Array.from({ length: count }, (_, i) => {
    const shift = (i - count / 2) * 12; 
    return chroma(baseColor)
      .set("lch.h", centerHue + shift)
      .hex();
  });
}

function shufflePalette(preview, count) {
  const colors = chroma
    .scale(preview)
    .mode("lch")
    .colors(count);

  return [...colors]
    .map((c) => ({ c, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.c);
}

function repeatPalette(preview, count) {
  return Array.from({ length: count }, (_, i) => {
    return preview[i % preview.length];
  });
}

export const generatePalette = (
  paletteName = "Standard",
  mode = "repeat",
  count = 5
) => {
  const theme =
    CHART_PALETTES[paletteName] ||
    CHART_PALETTES.Standard;

  const { base, preview } = theme;
  const safePreview = preview?.length ? preview : [base];

  switch (mode) {
    case "gradient":
      return tonalPalette(safePreview, count);
    case "shuffle":
      return shufflePalette(safePreview, count);
    case "analogous":
      return analogousPalette(safePreview, count);
    case "repeat":
    default:
      return repeatPalette(safePreview, count);
  }
};

export const DEFAULT_PALETTE = "Standard";