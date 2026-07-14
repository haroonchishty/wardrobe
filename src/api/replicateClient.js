const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";

export async function runVtonModel(input) {
  const response = await fetch(`${API_BASE}/api/run-vton`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    let message = "Failed to run model";
    try {
      const error = await response.json();
      message = error.error || message;
      if (error.details) {
        message += `: ${error.details}`;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = `${message}: ${text}`;
      }
    }
    throw new Error(message);
  }

  const { output, url } = await response.json();
  return { output, url };
}

