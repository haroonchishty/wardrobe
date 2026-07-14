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
    const error = await response.json();
    throw new Error(error.error || "Failed to run model");
  }

  const { output, url } = await response.json();
  return { output, url };
}

