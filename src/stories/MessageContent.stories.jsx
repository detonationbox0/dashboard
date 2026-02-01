import MessageContent from "../components/MessageContent.jsx";

const meta = {
  title: "MessageContent",
  component: MessageContent,
  parameters: {
    docs: {
      description: {
        component:
          "Right-side slide-in message viewer that surfaces sender, recipient, subject, body, and controller-focused actions.",
      },
    },
  },
};

export default meta;

export const Open = {
  args: {
    open: true,
    selectedActionIndex: 0,
    message: {
      from: "Grace Hopper <grace@navy.mil>",
      to: "Ada Lovelace <ada@analytic.engine>",
      subject: "Compiler notes",
      snippet:
        "The newest pass includes tighter validation and a more forgiving fallback.",
      body:
        "Ada,\n\nThe compiler pass now checks for relocation edge cases and aligns the output with the updated notes you sent. I kept the heuristics adjustable in case we need to tune performance.\n\nGrace",
    },
  },
};

export const Closed = {
  args: {
    open: false,
    selectedActionIndex: 2,
    message: {
      from: "newsletter@somewhere.com",
      to: "you@example.com",
      subject: "Weekly digest",
      snippet: "Here is your weekly digest.",
    },
  },
};
