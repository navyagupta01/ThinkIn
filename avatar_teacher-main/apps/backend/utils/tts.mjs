// utils/tts.mjs
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID || "Chris"; // fallback voice

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converts text to speech using ElevenLabs API
 * @param {string} text - The message to convert
 * @param {string} outputPath - Full path to save output audio (e.g., .mp3 or .wav)
 */
async function textToSpeech(text, outputPath) {
  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`;

    const response = await axios.post(
      url,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_LABS_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    fs.writeFileSync(outputPath, response.data);
    console.log(`TTS audio saved at: ${outputPath}`);
  } catch (error) {
    console.error("TTS Error:", error.response?.data || error.message);
    throw error;
  }
}

export { textToSpeech };
