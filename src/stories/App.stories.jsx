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
          'Dashboard proof of concept. Checks Google authentication before showing the inbox list. Includes inbox loading, a fullscreen toggle, controller input state, and a diagnostic panel for raw gamepad values.',
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
          'If not authenticated, the app shows a Google connect prompt. When authenticated, use "Load Inbox" to fetch /api/inbox, "Sign out" to clear the session, and "Full Screen" to request fullscreen mode. Expand "Gamepad Diagnostics" to inspect mapping, ID, and raw input values.',
      },
    },
  },
};
