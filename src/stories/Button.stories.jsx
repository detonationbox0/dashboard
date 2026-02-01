import Button from "../components/Button.jsx";

const meta = {
  title: "Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        // Storybook summary for the button component.
        component:
          "Base button component that uses theme variables for background, border, and interaction states.",
      },
    },
  },
};

export default meta;

export const Default = {
  args: {
    children: "Button",
  },
};

export const Hover = {
  args: {
    // State mimics hover styling in CSS.
    children: "Hover",
    state: "hover",
  },
};

export const Active = {
  args: {
    // State mimics active styling in CSS.
    children: "Active",
    state: "active",
  },
};

export const Disabled = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};
