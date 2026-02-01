import { createElement } from "react";
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
  },
  decorators: [
    (Story, context) => {
      // Apply the selected theme and wrap stories in a themed surface.
      applyTheme(context.globals.theme || defaultThemeName);
      return createElement(
        "div",
        {
          style: {
            minHeight: "100vh",
            background: "var(--app-bg)",
            color: "var(--app-text)",
          },
        },
        createElement(Story)
      );
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
