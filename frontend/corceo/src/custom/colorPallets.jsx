import chroma from "chroma-js";

/*
 * Palette types:
 *
 * categorical:
 * Used when every color represents a separate category.
 * Examples: bars, pie slices, multiple line series.
 *
 * sequential:
 * Used when colors represent an ordered scale from low to high.
 * Examples: heatmaps and ranked values.
 *
 * diverging:
 * Used when values move away from a meaningful center.
 * Examples: negative → zero → positive.
 */
export const CHART_PALETTES = {
  Standard: {
    base: "#6366f1",
    preview: [
      "#818cf8",
      "#6366f1",
      "#4338ca",
    ],
    mood: "balanced",
    type: "categorical",

    strategy: {
      mode: "distinct",
      colorSpace: "lch",
      hueSpread: 170,
      lightness: [43, 76],
      chroma: [38, 72],
    },
  },

  Ocean: {
    base: "#0077b6",
    preview: [
      "#90e0ef",
      "#00b4d8",
      "#0077b6",
      "#023e8a",
    ],
    mood: "cool",
    type: "sequential",

    strategy: {
      mode: "tonal",
      colorSpace: "lch",
      hueSpread: 60,
      lightness: [30, 84],
      chroma: [28, 68],
    },
  },

  Warm: {
    base: "#e76f51",
    preview: [
      "#f4a261",
      "#e76f51",
      "#d62828",
      "#9d0208",
    ],
    mood: "warm",
    type: "categorical",

    strategy: {
      mode: "distinct",
      colorSpace: "lch",
      hueSpread: 95,
      lightness: [42, 78],
      chroma: [45, 82],
    },
  },

  Pastel: {
    base: "#ffafcc",
    preview: [
      "#ffc8dd",
      "#ffafcc",
      "#cdb4db",
      "#bde0fe",
      "#a2d2ff",
      "#caffbf",
      "#fdffb6",
      "#ffd6a5",
    ],
    mood: "soft",
    type: "categorical",

    strategy: {
      mode: "pastel",
      colorSpace: "lch",
      hueSpread: 320,
      lightness: [76, 91],
      chroma: [18, 40],
    },
  },

  DeepSpace: {
    base: "#3a0ca3",
    preview: [
      "#4cc9f0",
      "#4361ee",
      "#3a0ca3",
      "#7209b7",
      "#240046",
    ],
    mood: "dark",
    type: "categorical",

    strategy: {
      mode: "distinct",
      colorSpace: "lch",
      hueSpread: 145,
      lightness: [30, 68],
      chroma: [48, 88],
    },
  },

  Forest: {
    base: "#2a9d8f",
    preview: [
      "#95d5b2",
      "#74c69d",
      "#52b788",
      "#2a9d8f",
      "#1a5e63",
      "#114246",
    ],
    mood: "nature",
    type: "sequential",

    strategy: {
      mode: "tonal",
      colorSpace: "lch",
      hueSpread: 65,
      lightness: [30, 84],
      chroma: [24, 60],
    },
  },

  Sunset: {
    base: "#f97316",
    preview: [
      "#ffed4a",
      "#ff9f1c",
      "#f97316",
      "#e11d48",
      "#9f1239",
      "#4c0519",
    ],
    mood: "vibrant",
    type: "sequential",

    strategy: {
      mode: "tonal",
      colorSpace: "lch",
      hueSpread: 110,
      lightness: [28, 88],
      chroma: [45, 90],
    },
  },

  Cyberpunk: {
    base: "#ff007f",
    preview: [
      "#00f5d4",
      "#00bbf9",
      "#7b2cbf",
      "#ff007f",
      "#ff5400",
      "#9e0059",
    ],
    mood: "neon",
    type: "categorical",

    strategy: {
      mode: "neon",
      colorSpace: "lch",
      hueSpread: 330,
      lightness: [52, 73],
      chroma: [68, 108],
    },
  },

  Corporate: {
    base: "#475569",
    preview: [
      "#cbd5e1",
      "#94a3b8",
      "#64748b",
      "#475569",
      "#334155",
      "#1e293b",
    ],
    mood: "monochrome",
    type: "sequential",

    strategy: {
      mode: "monochrome",
      colorSpace: "lab",
      lightness: [24, 84],
      chroma: [2, 18],
    },
  },

  Vintage: {
    base: "#8c7853",
    preview: [
      "#e0d6b8",
      "#b8a374",
      "#8c7853",
      "#704c38",
      "#4a2810",
    ],
    mood: "retro",
    type: "sequential",

    strategy: {
      mode: "tonal",
      colorSpace: "lch",
      hueSpread: 70,
      lightness: [30, 84],
      chroma: [18, 48],
    },
  },

  Nordic: {
    base: "#4c566a",
    preview: [
      "#d8dee9",
      "#8fbcbb",
      "#88c0d0",
      "#81a1c1",
      "#5e81ac",
      "#4c566a",
    ],
    mood: "frost",
    type: "categorical",

    strategy: {
      mode: "distinct",
      colorSpace: "lch",
      hueSpread: 100,
      lightness: [42, 86],
      chroma: [12, 42],
    },
  },

  Volcanic: {
    base: "#370617",
    preview: [
      "#ffba08",
      "#faa307",
      "#f48c06",
      "#dc2f02",
      "#9d0208",
      "#370617",
    ],
    mood: "intense",
    type: "sequential",

    strategy: {
      mode: "tonal",
      colorSpace: "lch",
      hueSpread: 90,
      lightness: [24, 84],
      chroma: [50, 96],
    },
  },

  Botanical: {
    base: "#6b705c",
    preview: [
      "#ffe8d6",
      "#ddbea9",
      "#b7b7a4",
      "#a3b18a",
      "#588157",
      "#344e41",
    ],
    mood: "earthy",
    type: "categorical",

    strategy: {
      mode: "distinct",
      colorSpace: "lch",
      hueSpread: 120,
      lightness: [34, 88],
      chroma: [16, 46],
    },
  },

  ElectricVolt: {
    base: "#ccff00",
    preview: [
      "#ccff00",
      "#10b981",
      "#06b6d4",
      "#3b82f6",
      "#6366f1",
      "#0f172a",
    ],
    mood: "high-energy",
    type: "categorical",

    strategy: {
      mode: "distinct",
      colorSpace: "lch",
      hueSpread: 260,
      lightness: [38, 84],
      chroma: [48, 95],
    },
  },

  BerryCream: {
    base: "#7209b7",
    preview: [
      "#f72585",
      "#b5179e",
      "#7209b7",
      "#3f37c9",
      "#4361ee",
      "#4cc9f0",
    ],
    mood: "playful",
    type: "categorical",

    strategy: {
      mode: "distinct",
      colorSpace: "lch",
      hueSpread: 180,
      lightness: [42, 76],
      chroma: [50, 90],
    },
  },

  Terracotta: {
    base: "#b1563d",
    preview: [
      "#f2ccc3",
      "#e79780",
      "#b1563d",
      "#7c3622",
      "#491b0d",
    ],
    mood: "warm-rustic",
    type: "sequential",

    strategy: {
      mode: "tonal",
      colorSpace: "lch",
      hueSpread: 55,
      lightness: [28, 86],
      chroma: [26, 64],
    },
  },

  ColorblindSafe: {
    base: "#0072b2",
    preview: [
      "#0072b2",
      "#e69f00",
      "#009e73",
      "#cc79a7",
      "#56b4e9",
      "#d55e00",
      "#f0e442",
      "#000000",
    ],
    mood: "accessible",
    type: "categorical",

    strategy: {
      mode: "fixed",
      allowGeneratedColors: false,
    },
  },
};

export const PALETTE_MODES = [
  "automatic",
  "distinct",
  "gradient",
  "pastel",
  "neon",
  "monochrome",
  "analogous",
  "shuffle",
  "repeat",
];

export const DEFAULT_PALETTE = "Standard";
export const DEFAULT_PALETTE_MODE = "automatic";

const DEFAULT_COLOR = "#6366f1";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHue(hue) {
  return ((hue % 360) + 360) % 360;
}

function isValidColor(color) {
  return (
    typeof color === "string" &&
    chroma.valid(color)
  );
}

function normalizeColors(colors = []) {
  if (!Array.isArray(colors)) {
    return [];
  }

  return [
    ...new Set(
      colors
        .filter(isValidColor)
        .map((color) =>
          chroma(color).hex().toLowerCase()
        )
    ),
  ];
}

function getSafeLch(
  color,
  fallbackHue = 260
) {
  const safeColor = isValidColor(color)
    ? color
    : DEFAULT_COLOR;

  const [
    rawLightness,
    rawChroma,
    rawHue,
  ] = chroma(safeColor).lch();

  return {
    lightness: Number.isFinite(
      rawLightness
    )
      ? rawLightness
      : 60,

    chroma: Number.isFinite(rawChroma)
      ? rawChroma
      : 50,

    hue: Number.isFinite(rawHue)
      ? rawHue
      : fallbackHue,
  };
}

function repeatPalette(colors, count) {
  const safeColors =
    normalizeColors(colors);

  if (safeColors.length === 0) {
    return Array(count).fill(
      DEFAULT_COLOR
    );
  }

  return Array.from(
    { length: count },
    (_, index) =>
      safeColors[
        index % safeColors.length
      ]
  );
}

/*
 * Reorders a sequence so nearby items are less similar.
 *
 * Original:
 * light, medium-light, medium, dark
 *
 * Spread:
 * light, dark, medium-light, medium
 */
function spreadColorOrder(colors) {
  const safeColors =
    normalizeColors(colors);

  const result = [];

  let left = 0;
  let right = safeColors.length - 1;

  while (left <= right) {
    result.push(safeColors[left]);

    if (left !== right) {
      result.push(safeColors[right]);
    }

    left += 1;
    right -= 1;
  }

  return result;
}

/*
 * Chooses colors using a farthest-point strategy.
 *
 * Each new color is selected because its nearest
 * existing selected color is as far away as possible.
 */
function selectMostDistinct(
  colors,
  count,
  initialColors = []
) {
  const candidates =
    normalizeColors(colors);

  const initial =
    normalizeColors(initialColors).filter(
      (color) =>
        candidates.includes(color)
    );

  if (count <= 0) {
    return [];
  }

  if (candidates.length === 0) {
    return Array(count).fill(
      DEFAULT_COLOR
    );
  }

  if (candidates.length <= count) {
    return repeatPalette(
      candidates,
      count
    );
  }

  const selected =
    initial.length > 0
      ? initial.slice(0, count)
      : [candidates[0]];

  const remaining =
    candidates.filter(
      (color) =>
        !selected.includes(color)
    );

  while (
    selected.length < count &&
    remaining.length > 0
  ) {
    let bestIndex = 0;
    let bestDistance = -Infinity;

    remaining.forEach(
      (candidate, index) => {
        const closestDistance =
          Math.min(
            ...selected.map(
              (selectedColor) =>
                chroma.distance(
                  candidate,
                  selectedColor,
                  "lab"
                )
            )
          );

        if (
          closestDistance >
          bestDistance
        ) {
          bestDistance =
            closestDistance;

          bestIndex = index;
        }
      }
    );

    selected.push(
      remaining[bestIndex]
    );

    remaining.splice(bestIndex, 1);
  }

  return selected;
}

function tonalPalette(theme, count) {
  const preview = normalizeColors(
    theme.preview
  );

  const colors =
    preview.length > 0
      ? preview
      : [
          isValidColor(theme.base)
            ? theme.base
            : DEFAULT_COLOR,
        ];

  if (count === 1) {
    return [
      colors[
        Math.floor(colors.length / 2)
      ],
    ];
  }

  return chroma
    .scale(colors)
    .mode(
      theme.strategy?.colorSpace ||
        "lch"
    )
    .correctLightness()
    .colors(count)
    .map((color) =>
      chroma(color).hex()
    );
}

function monochromePalette(
  theme,
  count
) {
  const strategy =
    theme.strategy || {};

  const [
    minLightness,
    maxLightness,
  ] =
    strategy.lightness || [26, 84];

  const base = chroma(
    isValidColor(theme.base)
      ? theme.base
      : DEFAULT_COLOR
  );

  const light = base.set(
    "lab.l",
    maxLightness
  );

  const dark = base.set(
    "lab.l",
    minLightness
  );

  if (count === 1) {
    return [base.hex()];
  }

  return chroma
    .scale([light, base, dark])
    .mode("lab")
    .colors(count)
    .map((color) =>
      chroma(color).hex()
    );
}

function buildHueCandidates(
  theme,
  candidateCount,
  {
    defaultLightness = [40, 78],
    defaultChroma = [32, 74],
    defaultHueSpread = 300,
  } = {}
) {
  const strategy =
    theme.strategy || {};

  const [
    minLightness,
    maxLightness,
  ] =
    strategy.lightness ||
    defaultLightness;

  const [minChroma, maxChroma] =
    strategy.chroma || defaultChroma;

  const hueSpread =
    strategy.hueSpread ??
    defaultHueSpread;

  const baseLch = getSafeLch(
    theme.base
  );

  return Array.from(
    { length: candidateCount },
    (_, index) => {
      const progress =
        candidateCount <= 1
          ? 0
          : index /
            (candidateCount - 1);

      const hue = normalizeHue(
        baseLch.hue +
          progress * hueSpread
      );

      /*
       * Use more than a basic alternating pattern,
       * so the candidate pool contains varied tones.
       */
      const lightnessPosition =
        (index * 0.61803398875) % 1;

      const chromaPosition =
        (index * 0.41421356237) % 1;

      const lightness =
        minLightness +
        lightnessPosition *
          (maxLightness -
            minLightness);

      const colorChroma =
        minChroma +
        chromaPosition *
          (maxChroma - minChroma);

      return chroma
        .lch(
          clamp(
            lightness,
            minLightness,
            maxLightness
          ),
          clamp(
            colorChroma,
            minChroma,
            maxChroma
          ),
          hue
        )
        .hex();
    }
  );
}

function distinctPalette(
  theme,
  count
) {
  const preview = normalizeColors(
    theme.preview
  );

  if (count <= preview.length) {
    return selectMostDistinct(
      preview,
      count,
      preview.slice(0, 1)
    );
  }

  const candidateCount = Math.max(
    count * 14,
    120
  );

  const generated =
    buildHueCandidates(
      theme,
      candidateCount
    );

  return selectMostDistinct(
    [...preview, ...generated],
    count,
    preview.slice(
      0,
      Math.min(
        preview.length,
        count
      )
    )
  );
}

function pastelPalette(theme, count) {
  const preview = normalizeColors(
    theme.preview
  );

  const pastelCandidates =
    buildHueCandidates(
      theme,
      Math.max(count * 14, 120),
      {
        defaultLightness: [76, 91],
        defaultChroma: [18, 40],
        defaultHueSpread: 320,
      }
    );

  return selectMostDistinct(
    [
      ...preview,
      ...pastelCandidates,
    ],
    count,
    preview.slice(
      0,
      Math.min(
        preview.length,
        count
      )
    )
  );
}

function neonPalette(theme, count) {
  const preview = normalizeColors(
    theme.preview
  );

  const neonCandidates =
    buildHueCandidates(
      theme,
      Math.max(count * 16, 140),
      {
        defaultLightness: [52, 73],
        defaultChroma: [68, 108],
        defaultHueSpread: 330,
      }
    );

  return selectMostDistinct(
    [
      ...preview,
      ...neonCandidates,
    ],
    count,
    preview.slice(
      0,
      Math.min(
        preview.length,
        count
      )
    )
  );
}
function analogousPalette(theme, count) {
  const preview = normalizeColors(
    theme?.preview
  );

  const baseColor =
    preview[
      Math.floor(preview.length / 2)
    ] ||
    theme?.base ||
    DEFAULT_COLOR;

  const {
    lightness,
    chroma: baseChroma,
    hue,
  } = getSafeLch(baseColor);

  const hueSpread =
    theme?.strategy?.hueSpread ??
    100;

  const [
    minLightness,
    maxLightness,
  ] =
    theme?.strategy?.lightness ??
    [38, 80];

  const [
    minChroma,
    maxChroma,
  ] =
    theme?.strategy?.chroma ??
    [28, 72];

  const candidateCount = Math.max(
    count * 10,
    80
  );

  const generated = Array.from(
    { length: candidateCount },
    (_, index) => {
      const progress =
        candidateCount <= 1
          ? 0
          : index /
              (candidateCount - 1) -
            0.5;

      const shiftedHue =
        normalizeHue(
          hue +
            progress * hueSpread
        );

      const lightnessShift =
        ((index % 5) - 2) * 6;

      const chromaShift =
        ((index % 3) - 1) * 8;

      return chroma
        .lch(
          clamp(
            lightness +
              lightnessShift,
            minLightness,
            maxLightness
          ),
          clamp(
            baseChroma +
              chromaShift,
            minChroma,
            maxChroma
          ),
          shiftedHue
        )
        .hex();
    }
  );

  return selectMostDistinct(
    [...preview, ...generated],
    count,
    preview.slice(0, 1)
  );
}
/*
 * This shuffle is deterministic.
 * It does not use Math.random(), so colors do not
 * unexpectedly change after re-render or export.
 */
function shufflePalette(
  theme,
  count
) {
  const colors = tonalPalette(
    theme,
    count
  );

  return spreadColorOrder(colors);
}

function customPalette(
  customColors,
  count,
  {
    extend = true,
    extensionMode = "distinct",
  } = {}
) {
  const safeColors =
    normalizeColors(customColors);

  if (safeColors.length === 0) {
    return [];
  }

  if (safeColors.length >= count) {
    return safeColors.slice(0, count);
  }

  if (!extend) {
    return repeatPalette(
      safeColors,
      count
    );
  }

  const customTheme = {
    base: safeColors[0],
    preview: safeColors,
    type: "categorical",

    strategy: {
      mode: extensionMode,
      colorSpace: "lch",
      hueSpread: 300,
      lightness: [38, 80],
      chroma: [30, 82],
    },
  };

  switch (extensionMode) {
    case "gradient":
      return tonalPalette(
        customTheme,
        count
      );

    case "analogous":
      return analogousPalette(
        customTheme,
        count
      );

    case "pastel":
      return pastelPalette(
        customTheme,
        count
      );

    case "neon":
      return neonPalette(
        customTheme,
        count
      );

    case "repeat":
      return repeatPalette(
        safeColors,
        count
      );

    case "distinct":
    default:
      return distinctPalette(
        customTheme,
        count
      );
  }
}

/*
 * Main public function.
 *
 * options:
 * - useCustomPalette
 * - customColors
 * - extendCustomPalette
 * - customExtensionMode
 * - ordered
 */
export function generatePalette(
  paletteName = DEFAULT_PALETTE,
  mode = DEFAULT_PALETTE_MODE,
  count = 5,
  options = {}
) {
  const safeCount = Math.max(
    1,
    Math.floor(Number(count) || 1)
  );

  const {
    useCustomPalette = false,
    customColors = [],
    extendCustomPalette = true,
    customExtensionMode = "distinct",
    ordered = true,
  } = options;

  if (useCustomPalette) {
    const customResult =
      customPalette(
        customColors,
        safeCount,
        {
          extend:
            extendCustomPalette,

          extensionMode:
            customExtensionMode,
        }
      );

    if (customResult.length > 0) {
      return customResult;
    }
  }

  const theme =
    CHART_PALETTES[paletteName] ||
    CHART_PALETTES[
      DEFAULT_PALETTE
    ];

  const preview = normalizeColors(
    theme.preview
  );

  const safePreview =
    preview.length > 0
      ? preview
      : [
          isValidColor(theme.base)
            ? theme.base
            : DEFAULT_COLOR,
        ];

  /*
   * A fixed palette, such as ColorblindSafe,
   * should not generate unverified colors.
   */
  if (
    theme.strategy
      ?.allowGeneratedColors === false
  ) {
    return repeatPalette(
      safePreview,
      safeCount
    );
  }

  const resolvedMode =
    mode === "automatic"
      ? theme.strategy?.mode ||
        (
          theme.type ===
          "sequential"
            ? "gradient"
            : "distinct"
        )
      : mode;

  let result;

  switch (resolvedMode) {
    case "distinct":
      result = distinctPalette(
        theme,
        safeCount
      );
      break;

    case "gradient":
    case "tonal":
      result = tonalPalette(
        theme,
        safeCount
      );
      break;

    case "pastel":
      result = pastelPalette(
        theme,
        safeCount
      );
      break;

    case "neon":
      result = neonPalette(
        theme,
        safeCount
      );
      break;

    case "monochrome":
      result = monochromePalette(
        theme,
        safeCount
      );
      break;

    case "analogous":
      result = analogousPalette(
        theme,
        safeCount
      );
      break;

    case "shuffle":
      result = shufflePalette(
        theme,
        safeCount
      );
      break;

    case "repeat":
    default:
      result = repeatPalette(
        safePreview,
        safeCount
      );
      break;
  }

  /*
   * Sequential scales must preserve their order.
   * Categorical scales may be spread so adjacent
   * colors look less similar.
   */
  if (
    !ordered &&
    (
      resolvedMode === "gradient" ||
      resolvedMode === "tonal"
    )
  ) {
    return spreadColorOrder(result);
  }

  return result;
}

/*
 * Useful for displaying palette information
 * inside PalettePicker or Sidebar.
 */
export function getPaletteDefinition(
  paletteName
) {
  return (
    CHART_PALETTES[paletteName] ||
    CHART_PALETTES[
      DEFAULT_PALETTE
    ]
  );
}

export function getPaletteNames() {
  return Object.keys(CHART_PALETTES);
}

export function getPalettePreview(
  paletteName,
  count = 8,
  mode = "automatic"
) {
  return generatePalette(
    paletteName,
    mode,
    count
  );
}

export function validateCustomPalette(
  colors
) {
  const inputColors = Array.isArray(
    colors
  )
    ? colors
    : [];

  const validColors = normalizeColors(
    inputColors
  );

  const invalidColors =
    inputColors.filter(
      (color) =>
        !isValidColor(color)
    );

  return {
    validColors,
    invalidColors,
    isValid:
      validColors.length > 0 &&
      invalidColors.length === 0,
  };
}