import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";
import crypto from "crypto";

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate TTS audio using Coqui
async function convertTextToSpeech({ text, fileName, modelId = "tts_models/en/ljspeech/tacotron2-DDC" }) {
  const outputDir = path.join(__dirname, "public", "output", "audios");
  const outputPath = path.join(outputDir, fileName);

  // Ensure the output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Create a temporary text file to hold the input text (safer than shell-passing it directly)
  const tempTextPath = path.join(os.tmpdir(), `tts_input_${crypto.randomUUID()}.txt`);
  fs.writeFileSync(tempTextPath, text, "utf-8");

  const command = `tts --text_path "${tempTextPath}" --out_path "${outputPath}" --model_name "${modelId}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      // Clean up temp file
      fs.unlink(tempTextPath, () => {});

      if (error) {
        console.error("TTS Error:", stderr);
        reject(new Error(`TTS generation failed: ${stderr || error.message}`));
      } else {
        if (stderr) console.warn("TTS Warning:", stderr);
        console.log("TTS Output:", stdout);
        resolve(outputPath);
      }
    });
  });
}

// Available voice models for frontend or API dropdown
async function getVoices() {
  return [
    {
      name: "LJSpeech (female, English)",
      id: "tts_models/en/ljspeech/tacotron2-DDC",
    },
    {
      name: "VCTK (multi-speaker, English)",
      id: "tts_models/en/vctk/vits",
    },
    {
      name: "Multilingual YourTTS",
      id: "tts_models/multilingual/multi-dataset/your_tts",
    },
  ];
}

export { convertTextToSpeech, getVoices };
