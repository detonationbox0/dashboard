import { createElement, useEffect, useState } from "react";
import "../src/styles/theme.css";
import { applyTheme, defaultThemeName, themeNames, themes } from "../src/theme/theme.js";

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  globalTypes: {
    theme: {
      // Expose theme switching in the Storybook toolbar.
      name: "Theme",
      description: "Global theme for components",
      defaultValue: defaultThemeName,
      toolbar: {
        icon: "circlehollow",
        items: themeNames.map((name) => ({
          value: name,
          title: themes[name]?.name || name,
        })),
      },
    },
    accentPreset: {
      name: "Accent Preset",
      description: "Quick accent color presets for buttons and panels",
      defaultValue: "",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "", title: "Theme default" },
          { value: "#4ff2c9", title: "Green" },
          { value: "#dc143c", title: "Crimson" },
        ],
      },
    },
    accentColor: {
      name: "Accent Color",
      description: "Custom accent color (hex or rgb, overrides preset when set)",
      defaultValue: "",
      control: { type: "text" },
    },
  },
  decorators: [
    (Story, context) => {
      // Apply the selected theme and wrap stories in a themed surface.
      const ThemedCanvas = () => {
        const [accentInput, setAccentInput] = useState("");

        useEffect(() => {
          applyTheme(context.globals.theme || defaultThemeName);
        }, [context.globals.theme]);

        useEffect(() => {
          const accentPreset = context.globals.accentPreset;
          const accentColor = accentInput.trim();
          const resolvedAccent = accentColor || accentPreset || "";
          const root = document.documentElement;
          if (resolvedAccent) {
            root.style.setProperty("--button-hover-border", resolvedAccent);
            root.style.setProperty("--panel-selected-border", resolvedAccent);
          } else {
            root.style.removeProperty("--button-hover-border");
            root.style.removeProperty("--panel-selected-border");
          }
        }, [accentInput, context.globals.accentPreset]);

        return createElement(
          "div",
          {
            style: {
              minHeight: "100vh",
              background: "var(--app-bg)",
              color: "var(--app-text)",
              position: "relative",
            },
          },
          createElement(
            "div",
            {
              style: {
                position: "absolute",
                top: "16px",
                right: "16px",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid var(--panel-border)",
                background: "var(--panel-bg)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--app-font)",
                fontSize: "12px",
                color: "var(--app-text)",
                zIndex: 2,
              },
            },
            createElement(
              "label",
              { style: { fontSize: "12px" } },
              "Accent"
            ),
            createElement("input", {
              type: "text",
              value: accentInput,
              onChange: (event) => setAccentInput(event.target.value),
              placeholder: "#4ff2c9 or rgb(79, 242, 201)",
              style: {
                minWidth: "190px",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid var(--panel-border)",
                background: "var(--input-indicator-bg)",
                color: "var(--app-text)",
                fontFamily: "var(--app-font)",
              },
            }),
            createElement("input", {
              type: "color",
              value: accentInput || "#4ff2c9",
              onChange: (event) => setAccentInput(event.target.value),
              title: "Pick accent color",
              style: {
                width: "32px",
                height: "32px",
                padding: 0,
                border: "1px solid var(--panel-border)",
                background: "transparent",
                borderRadius: "8px",
                cursor: "pointer",
              },
            })
          ),
          createElement(Story)
        );
      };

      return createElement(ThemedCanvas);
    },
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
};

export default preview;
