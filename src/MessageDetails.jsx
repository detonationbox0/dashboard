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

  if (isLoading) return <p>Loading latest message...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!snippet) return <p>No message preview available.</p>;

  return (
    <p>{snippet}</p>
  );
}

export default MessageDetails;
