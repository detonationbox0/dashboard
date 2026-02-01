

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  // Pick up local stories from src.
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  // Common Storybook addons (a11y, docs, onboarding, etc).
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-vite",
  "docs": {
    "autodocs": "tag"
  }
};
export default config;
