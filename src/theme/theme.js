import themeConfig from "./themes.json";

export const themes = themeConfig.themes || {};
export const themeNames = Object.keys(themes);
export const defaultThemeName = themeConfig.default || themeNames[0] || "dark";

export function applyTheme(themeName) {
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

  if (theme.colorScheme) {
    root.style.setProperty("color-scheme", theme.colorScheme);
  } else {
    root.style.removeProperty("color-scheme");
  }

  root.dataset.theme = name;
  return name;
}
