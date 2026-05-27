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

  Forest: {
    base: "#2a9d8f",
    preview: ["#52b788", "#0077b6", "#1b4332"],
    mood: "nature",
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

  ColorblindSafe: {
    base: "#0072B2",
    preview: [
      "#0072B2",
      "#E69F00",
      "#009E73",
      "#CC79A7",
      "#56B4E9",
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



const repeatPalette = (colors, count) =>
  Array.from({ length: count }, (_, i) =>
    colors[i % colors.length]
  );


const gradientPalette = (base, count) =>
  chroma
    .scale(["#4361ee", base, "#ffafcc"])
    .mode("lab")
    .colors(count);


const analogousPalette = (base, count) =>
  Array.from({ length: count }, (_, i) =>
    chroma(base)
      .set("hsl.h", `+${i * 10}`)
      .saturate(0.15)
      .hex()
  );

const shufflePalette = (base, count) => {
  return chroma
    .scale([
      chroma(base).brighten(1.5),
      base,
      chroma(base).darken(1.5),
    ])
    .mode("lab")
    .colors(count);
}
export const generatePalette = (
  paletteName = "Standard",
  mode = "repeat",
  count = 5
) => {
  const theme =
    CHART_PALETTES[paletteName] ||
    CHART_PALETTES.Standard;

  const { base, preview, mood } = theme;

  switch (mode) {
    case "gradient":
      return gradientPalette(base, count);

    case "shuffle":
      return shufflePalette(base, count);

    case "analogous":
      return analogousPalette(base, count);

    case "repeat":
    default:
      switch (mood) {
        case "warm":
          return chroma.scale(['#ffcf33', base, '#9e2a2b']).mode('lch').colors(count);
        case "cool":
        return chroma.scale(['#a2d2ff', base, '#3a0ca3']).mode('lch').colors(count);
          

        case "soft":
          return chroma
            .scale([
              chroma(base).brighten(2),
              base,
            ])
            .mode("lab")
            .colors(count);

        case "dark":
          return chroma
            .scale([
              chroma(base).darken(2),
              base,
              chroma(base).brighten(1),
            ])
            .mode("lch")
            .colors(count);

        case "accessible":
          return repeatPalette(preview, count);
        case "nature":
          return chroma.scale(['#52b788', '#ffcf33', base]).mode('lch').colors(count);
          
        default:
          return repeatPalette([base], count);
      }
  }
};

export const DEFAULT_PALETTE = "Standard";