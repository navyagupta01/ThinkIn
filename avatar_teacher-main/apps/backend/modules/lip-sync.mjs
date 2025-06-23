import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64 } from "../utils/files.mjs";

const MAX_RETRIES = 10;
const RETRY_DELAY = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Lip-sync processing function
 * @param {Array} messages - Array of message objects with a `text` field
 * @returns {Array} messages with added `audio` and `lipsync` properties
 */
const lipSync = async (messages) => {
  if (!Array.isArray(messages)) {
    throw new Error("lipSync: Expected 'messages' to be an array.");
  }

  const audioBasePath = 'C:/games/coding/Intel/avatar_teacher-main/apps/backend/modules/public/output/modules';

  // Step 1: Convert each message text to speech
  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `${audioBasePath}/message_${index}.mp3`;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await convertTextToSpeech({ text: message.text, fileName });
          await delay(RETRY_DELAY);
          break;
        } catch (error) {
          if (error.response?.status === 429 && attempt < MAX_RETRIES - 1) {
            console.warn(`Rate limited on message ${index}, retrying...`);
            await delay(RETRY_DELAY);
          } else {
            console.error(`Failed to synthesize message ${index}:`, error);
            throw error;
          }
        }
      }

      console.log(`Message ${index} converted to speech`);
    })
  );

  // Step 2: Generate phonemes and attach base64 audio + lipsync data
  await Promise.all(
    messages.map(async (message, index) => {
      const mp3File = `${audioBasePath}/message_${index}.mp3`;
      const jsonFile = `${audioBasePath}/message_${index}.json`;

      try {
        await getPhonemes({ message: index, basePath: audioBasePath });
        message.audio = await audioFileToBase64({ fileName: mp3File });
        message.lipsync = await readJsonTranscript({ fileName: jsonFile });
        console.log(`Lip sync data generated for message ${index}`);
      } catch (error) {
        console.error(`Error while getting phonemes for message ${index}:`, error);
      }
    })
  );

  return messages;
};

export { lipSync };
