import MessageBox from "../MessageBox";

const meta = {
  title: "MessageBox",
  component: MessageBox,
  parameters: {
    docs: {
      description: {
        component:
          "Small selectable box used for controller-driven navigation placeholders.",
      },
    },
  },
};

export default meta;

export const Selected = {
  args: {
    id: "187c1aa7e7b1a1f2",
    threadId: "187c1aa6e0b9d3ab",
    selected: true,
  },
};

export const Unselected = {
  args: {
    id: "187c1aa7e7b1a1f3",
    threadId: "187c1aa6e0b9d3ac",
    selected: false,
  },
};
