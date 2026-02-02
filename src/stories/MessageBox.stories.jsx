import MessageBox from "../MessageBox";

const meta = {
  title: "MessageBox",
  component: MessageBox,
  parameters: {
    docs: {
      description: {
        // Storybook summary for the message box UI.
        component:
          "Selectable message row used in the inbox list, supporting controller focus plus hover/click selection.",
      },
    },
  },
};

export default meta;

export const Selected = {
  args: {
    // Demonstrate the selected style.
    from: "fromme@hotmail.com, alsofromme@gmail.com",
    subject: "Hate, Inc.: Why Today's Media Makes Us Despise One Another",
    selected: true,
  },
};

export const Unselected = {
  args: {
    from: "newsletter@somewhere.com",
    subject: "Your weekly digest is ready",
    selected: false,
  },
};
