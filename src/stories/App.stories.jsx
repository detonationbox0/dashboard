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
          'Dashboard proof of concept. Shows gamepad connection state, recent inputs, and device info. Includes a Connect Gmail link, inbox loading, message previews, and a fullscreen toggle.',
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
          'Connect a gamepad to see live input state. Use "Load Inbox" to fetch /api/inbox, and "Full Screen" to request fullscreen mode.',
      },
    },
  },
};
