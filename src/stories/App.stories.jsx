import App from '../App';

const meta = {
  title: 'App',
  component: App,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dashboard proof of concept. Shows gamepad connection state, recent inputs, and device info. Includes controller-selectable message boxes, inbox loading, a fullscreen toggle, and a diagnostic panel that surfaces raw gamepad values.',
      },
    },
  },
};

export default meta;

export const Primary = {
  parameters: {
    docs: {
      description: {
        story:
          'Connect a gamepad to see live input state. Use "Load Inbox" to fetch /api/inbox, and "Full Screen" to request fullscreen mode. Expand "Gamepad Diagnostics" to inspect mapping, ID, and raw input values.',
      },
    },
  },
};
