import Button from "../components/Button.jsx";

const meta = {
  title: "Button",
  component: Button,
  parameters: {
    docs: {
      description: {
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
    children: "Hover",
    state: "hover",
  },
};

export const Active = {
  args: {
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
