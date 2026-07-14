const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";

export async function uploadImage(base64Image) {
  const response = await fetch(`${API_BASE}/api/upload-imgbb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: base64Image })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Image upload failed");
  }

  const data = await response.json();
  return { url: data.url };
}
