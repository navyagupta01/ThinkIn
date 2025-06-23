// apps/backend/modules/whisper.mjs

import { convertAudioToMp3 } from "../utils/audios.mjs";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;

// To allow __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertAudioToText({ audioData }) {
  try {
    const mp3AudioData = await convertAudioToMp3({ audioData });
    const outputPath = path.join(__dirname, "..", "modules","public","output","modules","public", "output.mp3");
    fs.writeFileSync(outputPath, mp3AudioData);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(outputPath));
    formData.append("model", "whisper-1");

    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${openAIApiKey}`,
      },
    });

    fs.unlinkSync(outputPath); // Clean up

    return response.data.text;
  } catch (error) {
    console.error("Whisper transcription error:", error?.response?.data || error.message);
    throw error;
  }
}

export { convertAudioToText };
