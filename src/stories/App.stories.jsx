import App from '../App';

const meta = {
  title: 'App',
  component: App,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        // High-level description for Storybook docs.
        component:
          'Dashboard proof of concept. Checks Google authentication before showing the inbox list. Includes inbox loading, controller input state, a settings side panel, and a side-panel view for the selected message.',
      },
    },
  },
};

export default meta;

export const Primary = {
  parameters: {
    docs: {
      description: {
        // Usage notes shown in Storybook for this example.
        story:
          'If not authenticated, the app shows a Google connect prompt. When authenticated, use "Load Inbox" to fetch /api/inbox and "Sign out" to clear the session. Use the controller or mouse to open a message in the side panel; Settings opens a full-height panel on the right.',
      },
    },
  },
};
