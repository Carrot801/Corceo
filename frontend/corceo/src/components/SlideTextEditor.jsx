import React, { useState, useRef, useEffect } from "react";

const FONT_SIZES = [
  { label: "XS", value: 12 },
  { label: "S", value: 14 },
  { label: "M", value: 16 },
  { label: "L", value: 20 },
  { label: "XL", value: 26 },
  { label: "2XL", value: 32 },
];

const BULLET_STYLES = [
  { label: "None", value: "none", symbol: "—" },
  { label: "Bullet", value: "disc", symbol: "•" },
  { label: "Number", value: "decimal", symbol: "1." },
  { label: "Arrow", value: "arrow", symbol: "→" },
  { label: "Square", value: "square", symbol: "▪" },
];

const TEXT_COLORS = [
  { label: "Ink", value: "#1a1a1a" },
  { label: "Slate", value: "#475569" },
  { label: "Blue", value: "#185FA5" },
  { label: "Teal", value: "#0F6E56" },
  { label: "Coral", value: "#993C1D" },
  { label: "Purple", value: "#534AB7" },
  { label: "Pink", value: "#993556" },
  { label: "Amber", value: "#854F0B" },
];

const DEFAULT_POINT = () => ({
  id: Date.now() + Math.random(),
  text: "",
  fontSize: 16,
  color: "#1a1a1a",
  bold: false,
  italic: false,
  bulletStyle: "none",
  align: "left",
});

// ─── Single point row ─────────────────────────────────────────────────────────
function PointRow({ point, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [focused, setFocused] = useState(false);
  const textRef = useRef(null);

  const update = (patch) => onChange({ ...point, ...patch });

  const renderBulletPrefix = () => {
    if (point.bulletStyle === "none") return null;
    if (point.bulletStyle === "arrow") return <span style={{ marginRight: 6, color: point.color, fontSize: point.fontSize }}>→</span>;
    if (point.bulletStyle === "disc") return <span style={{ marginRight: 6, color: point.color, fontSize: point.fontSize }}>•</span>;
    if (point.bulletStyle === "square") return <span style={{ marginRight: 6, color: point.color, fontSize: point.fontSize }}>▪</span>;
    return null;
  };

  return (
    <div
      style={{
        border: `1px solid ${focused ? "#3b82f6" : "#e2e8f0"}`,
        borderRadius: 10,
        background: "#fff",
        marginBottom: 8,
        transition: "border-color 0.15s",
        boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 10px",
          borderBottom: "1px solid #f1f5f9",
          flexWrap: "wrap",
          background: "#fafafa",
          borderRadius: "9px 9px 0 0",
        }}
      >
        {/* Font size */}
        <div style={{ display: "flex", gap: 2 }}>
          {FONT_SIZES.map((fs) => (
            <button
              key={fs.value}
              title={`${fs.value}px`}
              onClick={() => update({ fontSize: fs.value })}
              style={{
                padding: "2px 6px",
                fontSize: 11,
                fontWeight: point.fontSize === fs.value ? 700 : 400,
                background: point.fontSize === fs.value ? "#1e40af" : "transparent",
                color: point.fontSize === fs.value ? "#fff" : "#64748b",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              {fs.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 4px" }} />

        {/* Bold / Italic */}
        <button
          title="Bold"
          onClick={() => update({ bold: !point.bold })}
          style={{
            width: 26, height: 26, borderRadius: 5, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 13,
            background: point.bold ? "#1e40af" : "transparent",
            color: point.bold ? "#fff" : "#64748b",
          }}
        >B</button>
        <button
          title="Italic"
          onClick={() => update({ italic: !point.italic })}
          style={{
            width: 26, height: 26, borderRadius: 5, border: "none", cursor: "pointer",
            fontStyle: "italic", fontSize: 13, fontWeight: 600,
            background: point.italic ? "#1e40af" : "transparent",
            color: point.italic ? "#fff" : "#64748b",
          }}
        >I</button>

        <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 4px" }} />

        {/* Alignment */}
        {["left", "center", "right"].map((align) => (
          <button
            key={align}
            title={`Align ${align}`}
            onClick={() => update({ align })}
            style={{
              width: 26, height: 26, borderRadius: 5, border: "none", cursor: "pointer",
              fontSize: 12,
              background: point.align === align ? "#1e40af" : "transparent",
              color: point.align === align ? "#fff" : "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {align === "left" && (
              <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><rect x="0" y="0" width="13" height="1.5" rx="0.75" fill="currentColor"/><rect x="0" y="3" width="9" height="1.5" rx="0.75" fill="currentColor"/><rect x="0" y="6" width="11" height="1.5" rx="0.75" fill="currentColor"/><rect x="0" y="9" width="7" height="1.5" rx="0.75" fill="currentColor"/></svg>
            )}
            {align === "center" && (
              <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><rect x="0" y="0" width="13" height="1.5" rx="0.75" fill="currentColor"/><rect x="2" y="3" width="9" height="1.5" rx="0.75" fill="currentColor"/><rect x="1" y="6" width="11" height="1.5" rx="0.75" fill="currentColor"/><rect x="3" y="9" width="7" height="1.5" rx="0.75" fill="currentColor"/></svg>
            )}
            {align === "right" && (
              <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><rect x="0" y="0" width="13" height="1.5" rx="0.75" fill="currentColor"/><rect x="4" y="3" width="9" height="1.5" rx="0.75" fill="currentColor"/><rect x="2" y="6" width="11" height="1.5" rx="0.75" fill="currentColor"/><rect x="6" y="9" width="7" height="1.5" rx="0.75" fill="currentColor"/></svg>
            )}
          </button>
        ))}

        <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 4px" }} />

        {/* Bullet style */}
        <select
          value={point.bulletStyle}
          onChange={(e) => update({ bulletStyle: e.target.value })}
          style={{
            fontSize: 12, padding: "2px 4px", border: "1px solid #e2e8f0",
            borderRadius: 5, background: "#fff", color: "#374151", cursor: "pointer",
          }}
        >
          {BULLET_STYLES.map((b) => (
            <option key={b.value} value={b.value}>{b.symbol} {b.label}</option>
          ))}
        </select>

        <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 4px" }} />

        {/* Color swatches */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {TEXT_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => update({ color: c.value })}
              style={{
                width: 17, height: 17,
                borderRadius: "50%",
                background: c.value,
                border: point.color === c.value ? "2px solid #1e40af" : "1.5px solid #e2e8f0",
                cursor: "pointer",
                outline: point.color === c.value ? "2px solid #93c5fd" : "none",
                outlineOffset: 1,
              }}
            />
          ))}
          {/* Custom color input */}
          <label title="Custom color" style={{ position: "relative", width: 17, height: 17, cursor: "pointer" }}>
            <input
              type="color"
              value={point.color}
              onChange={(e) => update({ color: e.target.value })}
              style={{ opacity: 0, position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer" }}
            />
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 17, height: 17, borderRadius: "50%",
              background: "linear-gradient(135deg, #f00, #0f0, #00f)",
              border: "1.5px solid #e2e8f0", fontSize: 10, color: "#fff",
            }}>+</span>
          </label>
        </div>

        {/* Spacer + move/delete */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <button
            disabled={isFirst}
            title="Move up"
            onClick={onMoveUp}
            style={{
              width: 22, height: 22, border: "none", borderRadius: 4,
              background: "transparent", color: "#94a3b8", cursor: isFirst ? "default" : "pointer",
              opacity: isFirst ? 0.3 : 1, fontSize: 13,
            }}
          >↑</button>
          <button
            disabled={isLast}
            title="Move down"
            onClick={onMoveDown}
            style={{
              width: 22, height: 22, border: "none", borderRadius: 4,
              background: "transparent", color: "#94a3b8", cursor: isLast ? "default" : "pointer",
              opacity: isLast ? 0.3 : 1, fontSize: 13,
            }}
          >↓</button>
          <button
            title="Delete point"
            onClick={onDelete}
            style={{
              width: 22, height: 22, border: "none", borderRadius: 4,
              background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 14,
            }}
          >×</button>
        </div>
      </div>

      {/* Text input */}
      <div style={{ display: "flex", alignItems: "flex-start", padding: "10px 12px" }}>
        {renderBulletPrefix()}
        <textarea
          ref={textRef}
          value={point.text}
          placeholder="Type your annotation..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            update({ text: e.target.value });
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: point.fontSize,
            fontWeight: point.bold ? 700 : 400,
            fontStyle: point.italic ? "italic" : "normal",
            color: point.color,
            textAlign: point.align,
            background: "transparent",
            lineHeight: 1.5,
            minHeight: 36,
            fontFamily: "inherit",
            overflow: "hidden",
          }}
          rows={1}
        />
      </div>
    </div>
  );
}

// ─── Preview renderer ──────────────────────────────────────────────────────────
function PointPreview({ points }) {
  if (!points?.length) {
    return (
      <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
        No annotations yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {points.map((p, i) => {
        const getPrefix = () => {
          if (p.bulletStyle === "none") return null;
          if (p.bulletStyle === "decimal") return <span style={{ marginRight: 8, color: p.color, fontWeight: 700, fontSize: p.fontSize }}>{i + 1}.</span>;
          if (p.bulletStyle === "disc") return <span style={{ marginRight: 8, color: p.color, fontSize: p.fontSize }}>•</span>;
          if (p.bulletStyle === "square") return <span style={{ marginRight: 8, color: p.color, fontSize: p.fontSize }}>▪</span>;
          if (p.bulletStyle === "arrow") return <span style={{ marginRight: 8, color: p.color, fontSize: p.fontSize }}>→</span>;
          return null;
        };

        return (
          <div key={p.id} style={{ display: "flex", alignItems: "flex-start", textAlign: p.align, justifyContent: p.align === "center" ? "center" : p.align === "right" ? "flex-end" : "flex-start" }}>
            {getPrefix()}
            <span style={{
              fontSize: p.fontSize,
              fontWeight: p.bold ? 700 : 400,
              fontStyle: p.italic ? "italic" : "normal",
              color: p.color,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}>{p.text || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Empty annotation</span>}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main exported component ───────────────────────────────────────────────────
/**
 * SlideTextEditor
 *
 * Props:
 *   points: array of point objects (stored on slide.points)
 *   onChange: (newPoints) => void  — called on every edit
 *
 * Usage in NewStory:
 *   <SlideTextEditor
 *     points={slides[activeSlideIndex].points || []}
 *     onChange={(pts) => {
 *       const updated = [...slides];
 *       updated[activeSlideIndex] = { ...updated[activeSlideIndex], points: pts };
 *       setSlides(updated);
 *     }}
 *   />
 */
export default function SlideTextEditor({ points = [], onChange }) {
  const [tab, setTab] = useState("edit"); // "edit" | "preview"

  const updatePoint = (id, updated) =>
    onChange(points.map((p) => (p.id === id ? updated : p)));

  const deletePoint = (id) => onChange(points.filter((p) => p.id !== id));

  const movePoint = (id, dir) => {
    const idx = points.findIndex((p) => p.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === points.length - 1)) return;
    const next = [...points];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    onChange(next);
  };

  const addPoint = () => onChange([...points, DEFAULT_POINT()]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0",
        marginBottom: 12, paddingBottom: 0,
      }}>
        {["edit", "preview"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2px solid #2563eb" : "2px solid transparent",
              color: tab === t ? "#2563eb" : "#64748b",
              cursor: "pointer",
              marginBottom: -1,
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8", alignSelf: "center", paddingRight: 4 }}>
          {points.length} annotation{points.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 2 }}>
        {tab === "edit" ? (
          <>
            {points.length === 0 && (
              <div style={{
                border: "1.5px dashed #cbd5e1", borderRadius: 10,
                padding: "20px 16px", textAlign: "center",
                color: "#94a3b8", fontSize: 13, marginBottom: 10,
              }}>
                Add annotations to narrate this slide
              </div>
            )}

            {points.map((p, i) => (
              <PointRow
                key={p.id}
                point={p}
                isFirst={i === 0}
                isLast={i === points.length - 1}
                onChange={(updated) => updatePoint(p.id, updated)}
                onDelete={() => deletePoint(p.id)}
                onMoveUp={() => movePoint(p.id, -1)}
                onMoveDown={() => movePoint(p.id, 1)}
              />
            ))}

            <button
              onClick={addPoint}
              style={{
                width: "100%",
                padding: "9px 0",
                marginTop: 4,
                border: "1.5px dashed #93c5fd",
                borderRadius: 10,
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add annotation
            </button>
          </>
        ) : (
          <div style={{
            background: "#fafafa", borderRadius: 10,
            padding: "16px 18px", minHeight: 80,
            border: "1px solid #f1f5f9",
          }}>
            <PointPreview points={points} />
          </div>
        )}
      </div>
    </div>
  );
}
