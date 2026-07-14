import express from "express";
import cors from "cors";
import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const MODEL_ID = "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985";

function extractOutputUrl(output) {
  if (!output) return null;
  if (typeof output.url === "function") return output.url();
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    if (typeof output[0] === "string") return output[0];
    if (output[0]?.url) return output[0].url;
  }
  if (output.url) return output.url;
  return null;
}

app.post("/api/run-vton", async (req, res) => {
  try {
    const { garm_img, human_img, garment_des } = req.body;

    if (!garm_img || !human_img) {
      return res.status(400).json({ error: "Missing required fields: garm_img, human_img" });
    }

    function removeEmptyStrings(data) {
      return Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== "")
      );
    }

    const input = removeEmptyStrings({
      garm_img,
      human_img,
      garment_des
    });

    const output = await replicate.run(MODEL_ID, { input });
    const url = extractOutputUrl(output);

    res.json({ output, url });
  } catch (error) {
    console.error("Error running model:", error);
    res.status(500).json({ error: error.message || "Failed to run model" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
