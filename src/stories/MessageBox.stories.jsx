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
    label: "1",
    selected: true,
  },
};

export const Unselected = {
  args: {
    label: "2",
    selected: false,
  },
};
