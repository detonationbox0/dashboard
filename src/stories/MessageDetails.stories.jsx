import MessageDetails from "../MessageDetails";

const meta = {
  title: "MessageDetails",
  component: MessageDetails,
  parameters: {
    docs: {
      description: {
        component:
          "Shows the most recent message preview for a Gmail thread.",
      },
    },
  },
};

export default meta;

export const Preview = {
  args: {
    threadId: "187c1aa6e0b9d3ab",
    initialSnippet: "Latest message snippet appears here.",
    disableFetch: true,
  },
};
