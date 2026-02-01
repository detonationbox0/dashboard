import Message from "../Message";

const meta = {
  title: "Message",
  component: Message,
  parameters: {
    docs: {
      description: {
        // Storybook summary for the message wrapper.
        component:
          "Basic inbox row that shows a Gmail message id and thread id with a preview section.",
      },
    },
  },
};

export default meta;

export const Primary = {
  args: {
    id: "187c1aa7e7b1a1f2",
    threadId: "187c1aa6e0b9d3ab",
  },
};
