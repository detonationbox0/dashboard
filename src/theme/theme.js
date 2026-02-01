import themeConfig from "./themes.json";

// Theme definitions are stored in JSON to keep style tokens editable.
export const themes = themeConfig.themes || {};
export const themeNames = Object.keys(themes);
export const defaultThemeName = themeConfig.default || themeNames[0] || "dark";

export function applyTheme(themeName) {
  // Resolve a valid theme name and apply its CSS variables.
  const name = themes[themeName] ? themeName : defaultThemeName;
  const theme = themes[name];
  if (!theme || typeof document === "undefined") {
    return name;
  }

  const root = document.documentElement;
  const vars = theme.vars || {};

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Set color-scheme so form controls match the theme.
  if (theme.colorScheme) {
    root.style.setProperty("color-scheme", theme.colorScheme);
  } else {
    root.style.removeProperty("color-scheme");
  }

  // Helpful for debugging and theming selectors.
  root.dataset.theme = name;
  return name;
}
