import { useLayoutEffect, useEffect } from "react";
import App from "../App";

const fakeMessages = [
  {
    id: "msg-1001",
    from: "Avery Chen <avery@studio.io>",
    to: "You <you@dashboard.local>",
    subject: "Welcome aboard",
    snippet: "We are excited to get you set up for the new sprint.",
    body:
      "Hey team,\n\nWe are excited to get you set up for the new sprint. The first milestone is due next Friday. Let me know if you need anything.\n\n- Avery",
  },
  {
    id: "msg-1002",
    from: "Billing <billing@cloudhost.com>",
    to: "You <you@dashboard.local>",
    subject: "Invoice paid",
    snippet: "Thanks for your payment. Your plan renews on March 1.",
    body:
      "Your payment was successful. Your current plan will renew on March 1. If you need to update billing info, visit your account page.",
  },
  {
    id: "msg-1003",
    from: "Studio Ops <ops@studio.io>",
    to: "You <you@dashboard.local>",
    subject: "Design review notes",
    snippet: "Attached are notes from today's review.",
    body:
      "Hi,\n\nAttached are the notes from today’s design review. Key takeaways: tighten the navigation hierarchy and clarify state transitions.\n\nThanks,\nOps",
  },
];

const createJsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

const MockedFetch = ({ children }) => {
  useLayoutEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input?.url || "";
      if (url.endsWith("/auth/me")) {
        return createJsonResponse({ ok: true });
      }
      if (url.endsWith("/api/inbox")) {
        return createJsonResponse({ messages: fakeMessages });
      }
      if (url.endsWith("/auth/logout")) {
        return new Response("", { status: 200 });
      }
      return originalFetch(input, init);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return children;
};

const AutoOpenSettings = ({ children }) => {
  useEffect(() => {
    let attempts = 0;
    let raf;
    const trigger = () => {
      attempts += 1;
      window.dispatchEvent(new MouseEvent("mousemove"));
      const button = document.querySelector(".floating-settings");
      if (button) {
        button.click();
        return;
      }
      if (attempts < 30) {
        raf = requestAnimationFrame(trigger);
      }
    };
    raf = requestAnimationFrame(trigger);
    return () => cancelAnimationFrame(raf);
  }, []);

  return children;
};

const AutoOpenFirstMessage = ({ children }) => {
  useEffect(() => {
    let attempts = 0;
    let raf;
    const trigger = () => {
      attempts += 1;
      const message = document.querySelector(".message-box");
      if (message) {
        message.click();
        return;
      }
      if (attempts < 40) {
        raf = requestAnimationFrame(trigger);
      }
    };
    raf = requestAnimationFrame(trigger);
    return () => cancelAnimationFrame(raf);
  }, []);

  return children;
};

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

export const GoogleLoginPage = {
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

export const DashboardWithMessages = {
  decorators: [
    (Story) => (
      <MockedFetch>
        <Story />
      </MockedFetch>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Mocks Google auth + inbox data so the full dashboard UI renders with sample email content.",
      },
    },
  },
};

export const DashboardWithSettingsOpen = {
  decorators: [
    (Story) => (
      <MockedFetch>
        <AutoOpenSettings>
          <Story />
        </AutoOpenSettings>
      </MockedFetch>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Mocks auth + inbox and auto-opens the settings drawer so the side menu is visible.",
      },
    },
  },
};

export const DashboardWithMessageOpen = {
  decorators: [
    (Story) => (
      <MockedFetch>
        <AutoOpenFirstMessage>
          <Story />
        </AutoOpenFirstMessage>
      </MockedFetch>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Mocks auth + inbox and opens the first message so the detail panel is visible.",
      },
    },
  },
};
