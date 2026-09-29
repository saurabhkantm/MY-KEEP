import React from "react";
import { Check } from "lucide-react";

export const KEEP_COLORS = [
  { id: "default", name: "Default", light: "#ffffff", dark: "#1f2937" },
  { id: "coral", name: "Coral", light: "#ffcdd2", dark: "#5c2025" },
  { id: "peach", name: "Peach", light: "#ffe0b2", dark: "#57311b" },
  { id: "sand", name: "Sand", light: "#fff9c4", dark: "#524017" },
  { id: "mint", name: "Mint", light: "#dcedc8", dark: "#25432c" },
  { id: "sage", name: "Sage", light: "#b2dfdb", dark: "#1a423f" },
  { id: "fog", name: "Fog", light: "#b3e5fc", dark: "#193f54" },
  { id: "storm", name: "Storm", light: "#c5cae9", dark: "#232d4b" },
  { id: "dusk", name: "Dusk", light: "#e1bee7", dark: "#3d234d" },
  { id: "blossom", name: "Blossom", light: "#f8bbd0", dark: "#502137" },
  { id: "clay", name: "Clay", light: "#d7ccc8", dark: "#3d352b" },
  { id: "chalk", name: "Chalk", light: "#f5f5f5", dark: "#2d3748" }
];

export default function ColorPicker({ selectedColor = "default", onSelect, isDarkMode, onClose }) {
  return (
    <div
      className="color-palette-popover"
      onClick={(e) => e.stopPropagation()}
    >
      {KEEP_COLORS.map(c => {
        const bg = isDarkMode ? c.dark : c.light;
        const isSelected = selectedColor === c.id;
        return (
          <button
            key={c.id}
            type="button"
            className={`color-swatch ${isSelected ? "active" : ""}`}
            style={{ backgroundColor: bg }}
            title={c.name}
            onClick={() => {
              onSelect(c.id);
              if (onClose) onClose();
            }}
          >
            {isSelected && (
              <Check size={14} style={{ color: isDarkMode ? "#fff" : "#333", margin: "auto" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
