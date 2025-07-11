import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get current directory name (for relative paths)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate speech using Coqui TTS via CLI
async function convertTextToSpeech({ text, fileName }) {
  const outputPath = path.isAbsolute(fileName)
    ? fileName
    : path.join(__dirname, "public", "output", fileName);

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const command = `"../../ttsenv/Scripts/ttx.exe" --text "${text.replace(/"/g, '\\"')}" --out_path "${outputPath}" --model_path "../../../tts_models--en--vctk--vits/model_file.pth" --config_path "../../../tts_models--en--vctk--vits/config.json" --speaker_idx "p230"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("TTS Error:", stderr);
        reject(error);
      } else {
        console.log("TTS Output:", stdout);
        resolve(outputPath);
      }
    });
  });
}

// Dummy fallback for getVoices
async function getVoices() {
  return [
    {
      name: "LJSpeech",
      id: "tts_models/en/ljspeech/tacotron2-DDC",
    },
  ];
}

export { convertTextToSpeech, getVoices };
