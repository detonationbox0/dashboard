import "../src/styles/theme.css";
import { applyTheme, defaultThemeName, themeNames, themes } from "../src/theme/theme.js";

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  globalTypes: {
    theme: {
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
      applyTheme(context.globals.theme || defaultThemeName);
      return Story();
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
