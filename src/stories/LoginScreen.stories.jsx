import LoginScreen from "../LoginScreen";

const meta = {
  title: "LoginScreen",
  component: LoginScreen,
  parameters: {
    docs: {
      description: {
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
    error: "Failed to check authentication",
    onConnect: () => {},
  },
};
