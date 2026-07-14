import { useMemo, useState } from "react";
import { runVtonModel } from "./api/replicateClient";
import { uploadImage } from "./api/imgbbClient";

const DEFAULT_GARM_IMG = "https://replicate.delivery/pbxt/KgwTlZyFx5aUU3gc5gMiKuD5nNPTgliMlLUWx160G4z99YjO/sweater.webp";
// const DEFAULT_HUMAN_IMG = `${import.meta.env.BASE_URL}model/model.jpeg`;
// const DEFAULT_HUMAN_IMG = `https://raw.githubusercontent.com/haroonchishty/wardrobe/refs/heads/main/public/model/model.jpeg`;
const DEFAULT_HUMAN_IMG = "https://replicate.delivery/pbxt/KgwTlhCMvDagRrcVzZJbuozNJ8esPqiNAIJS3eMgHrYuHmW4/KakaoTalk_Photo_2024-04-04-21-44-45.png";

function App() {
  const [garmImg, setGarmImg] = useState(DEFAULT_GARM_IMG);
  const [humanImg, setHumanImg] = useState(DEFAULT_HUMAN_IMG);
  const [garmentDesc, setGarmentDesc] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Ready to generate.");
  const [resultUrl, setResultUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [error, setError] = useState(null);

  const previewItems = useMemo(
    () => [
      { label: "Garment image", value: garmImg },
      { label: "Person image", value: humanImg }
    ],
    [garmImg, humanImg]
  );

  const handleFileUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setUploadingField(field);
    setStatus(`Uploading ${field === "garment" ? "garment" : "person"} image...`);

    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64 = fileData.split(",")[1];
      const { url } = await uploadImage(base64);
      if (!url) {
        throw new Error("Image upload failed");
      }

      if (field === "garment") {
        setGarmImg(url);
      } else {
        setHumanImg(url);
      }

      setStatus("Image uploaded successfully.");
    } catch (err) {
      setError(err.message || "Upload failed.");
      setStatus("Image upload failed.");
    } finally {
      setUploading(false);
      setUploadingField("");
    }
  };

  const cleanInput = (data) =>
    Object.fromEntries(
      Object.entries(data).filter(([key, value]) =>
        key === "garment_des" ? value !== undefined && value !== null : value !== undefined && value !== null && value !== ""
      )
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResultUrl(null);
    setIsLoading(true);
    setStatus("Running model...");

    try {
      const input = cleanInput({
        garm_img: garmImg,
        human_img: humanImg,
        garment_des: garmentDesc,
        category: category || "upper_body"
      });

      const { url } = await runVtonModel(input);
      if (!url) {
        throw new Error("Unable to extract image URL from model output.");
      }

      setResultUrl(url);
      setStatus("Generated successfully.");
    } catch (err) {
      setError(err.message || "Unexpected error.");
      setStatus("Generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          {/* <p className="eyebrow">Wardrobe</p> */}
          <h1>Saaniya's Wardrobe</h1>
        </div>
      </header>

      <main>
        <section className="panel">
          <form onSubmit={handleSubmit}>
            <label className="file-button">
              <span>
                {uploading && uploadingField === "human"
                  ? "Uploading person image..."
                  : "Choose person image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleFileUpload(event, "human")}
                disabled={uploading}
              />
            </label>

            <label className="file-button">
              <span>
                {uploading && uploadingField === "garment"
                  ? "Uploading garment image..."
                  : "Choose garment image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleFileUpload(event, "garment")}
                disabled={uploading}
              />
            </label>

            <label>
              Garment description (optional)
              <input
                type="text"
                value={garmentDesc}
                onChange={(event) => setGarmentDesc(event.target.value)}
                placeholder="e.g. pink floral top"
              />
            </label>

            <label>
              Category (optional)
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">—</option>
                <option value="upper_body">Upper body</option>
                <option value="lower_body">Lower body</option>
                <option value="dresses">Dresses</option>
              </select>
            </label>

            <button type="submit" className="primary-button" disabled={isLoading || uploading}>
              {isLoading ? "Generating..." : uploading ? "Upload in progress..." : "Generate try-on"}
            </button>
          </form>

          <div className="status-card">
            <div className="status-row">
              <span>Status</span>
              <strong>{status}</strong>
            </div>
            {uploading && (
              <div className="upload-progress">
                <span className="spinner" />
                {uploadingField === "garment" ? "Uploading garment image..." : "Uploading person image..."}
              </div>
            )}
            {error && <div className="error">{error}</div>}
            {resultUrl && (
              <div className="result-card">
                <p>Generated try-on</p>
                <img src={resultUrl} alt="Generated try-on result" className="result-image" />
                <a href={resultUrl} target="_blank" rel="noreferrer">
                  Download original
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="panel preview-panel">
          <h2>Preview inputs</h2>
          <div className="preview-grid">
            {previewItems.map((item) => (
              <div key={item.label} className="preview-card">
                <p>{item.label}</p>
                <img src={item.value} alt={item.label} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>
          Made with love by 
          <><br /></>
          <code>Shwifty Software Solutions™</code>
        </p>
      </footer>
    </div>
  );
}

export default App;
