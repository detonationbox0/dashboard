import App from '../App';

const meta = {
  title: 'App',
  component: App,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        // High-level description for Storybook docs.
        component:
          'Dashboard shell with a primary email pane, secondary/tertiary placeholder panes, and a slide-in message viewer. Includes Google auth checks, inbox loading, controller navigation, and a settings drawer.',
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
          'If not authenticated, the app shows a Google connect prompt. When authenticated, open Settings (Start button or floating settings button) to load the inbox or sign out. Use the controller, Tab key, or mouse to move focus between panes and open a message in the side panel.',
      },
    },
  },
};
