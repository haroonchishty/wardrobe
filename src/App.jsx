import { useMemo, useState } from "react";
import { runVtonModel } from "./api/replicateClient";

const DEFAULT_GARM_IMG = "https://replicate.delivery/pbxt/KgwTlZyFx5aUU3gc5gMiKuD5nNPTgliMlLUWx160G4z99YjO/sweater.webp";
// const DEFAULT_HUMAN_IMG = `${import.meta.env.BASE_URL}model/model.jpeg`;
const DEFAULT_HUMAN_IMG = `https://raw.githubusercontent.com/haroonchishty/wardrobe/refs/heads/main/public/model/model.jpeg`;

function App() {
  const [garmImg, setGarmImg] = useState(DEFAULT_GARM_IMG);
  const [humanImg, setHumanImg] = useState(DEFAULT_HUMAN_IMG);
  const [garmentDesc, setGarmentDesc] = useState("");
  const [status, setStatus] = useState("Ready to generate.");
  const [resultUrl, setResultUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const previewItems = useMemo(
    () => [
      { label: "Garment image", value: garmImg },
      { label: "Person image", value: humanImg }
    ],
    [garmImg, humanImg]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResultUrl(null);
    setIsLoading(true);
    setStatus("Running model...");

    try {
      const input = {
        garm_img: garmImg,
        human_img: humanImg,
        garment_des: garmentDesc
      };

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
            <label>
              Garment image URL
              <input
                type="url"
                value={garmImg}
                onChange={(event) => setGarmImg(event.target.value)}
                placeholder="https://example.com/garment.png"
                required
              />
            </label>

            <label>
              Human image URL
              <input
                type="url"
                value={humanImg}
                onChange={(event) => setHumanImg(event.target.value)}
                placeholder="https://example.com/person.png"
                required
              />
            </label>

            <label>
              Garment description (optional)
              <input
                type="text"
                value={garmentDesc}
                onChange={(event) => setGarmentDesc(event.target.value)}
                placeholder=""
              />
            </label>

            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate try-on"}
            </button>
          </form>

          <div className="status-card">
            <div className="status-row">
              <span>Status</span>
              <strong>{status}</strong>
            </div>
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
