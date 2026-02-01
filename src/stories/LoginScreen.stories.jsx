import LoginScreen from "../LoginScreen";

const meta = {
  title: "LoginScreen",
  component: LoginScreen,
  parameters: {
    docs: {
      description: {
        // Storybook summary for the login screen.
        component:
          "Simple auth gate that prompts the user to connect their Google account before viewing the inbox.",
      },
    },
  },
};

export default meta;

export const Default = {
  args: {
    error: "",
    onConnect: () => {},
  },
};

export const WithError = {
  args: {
    // Showcase a failure message beneath the CTA.
    error: "Failed to check authentication",
    onConnect: () => {},
  },
};
