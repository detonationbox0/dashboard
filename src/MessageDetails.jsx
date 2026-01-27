import { useEffect, useState } from "react";

function MessageDetails({ threadId, initialSnippet = "", disableFetch = false }) {
  const [snippet, setSnippet] = useState(initialSnippet);
  const [isLoading, setIsLoading] = useState(!initialSnippet && !disableFetch);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!threadId || disableFetch) return;

    let isActive = true;
    setIsLoading(true);
    setError("");

    fetch(`/api/threads/${threadId}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!isActive) return;
        setSnippet(data.snippet || "");
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err.message || "Failed to load message details");
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [threadId, disableFetch, initialSnippet]);

  if (isLoading) return <p className="message-box__status">Loading latest message...</p>;
  if (error) return <p className="message-box__status">Error: {error}</p>;
  if (!snippet) return <p className="message-box__status">No message preview available.</p>;

  return (
    <p className="message-box__snippet">{snippet}</p>
  );
}

export default MessageDetails;
