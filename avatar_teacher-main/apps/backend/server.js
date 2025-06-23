import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";

import { generateMessages, parser } from "./modules/openAI.mjs";
import { lipSync } from "./modules/lip-sync.mjs";
import { sendDefaultMessages } from "./modules/defaultMessages.mjs";
import { convertAudioToText } from "./modules/whisper.mjs";
import { getVoices } from "./modules/tts.mjs";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());
const port = 3000;

// ===== History JSON Setup =====
const historyFilePath = path.resolve("data", "history.json");

// Ensure file exists
if (!fs.existsSync(historyFilePath)) {
  fs.mkdirSync(path.dirname(historyFilePath), { recursive: true });
  fs.writeFileSync(historyFilePath, "[]");
}

function getHistory() {
  try {
    return JSON.parse(fs.readFileSync(historyFilePath, "utf-8"));
  } catch {
    return [];
  }
}

function saveHistory({ question, answer }) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    question,
    answer,
    timestamp: new Date().toISOString(),
  });
  fs.writeFileSync(historyFilePath, JSON.stringify(history.slice(0, 50), null, 2));
}

function clearHistory() {
  fs.writeFileSync(historyFilePath, JSON.stringify([], null, 2));
}

// ===== Routes =====

// --- Get available voices ---
app.get("/voices", async (req, res) => {
  try {
    const voices = await getVoices();
    res.send(voices);
  } catch (error) {
    console.error("Error fetching voices:", error.message, error.stack);
    res.status(500).send({ error: "Failed to fetch voices" });
  }
});

// --- Text to Speech ---
app.post("/tts", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).send({ error: "Missing message in request" });
    }

    const defaultMessages = await sendDefaultMessages({ userMessage });
    if (defaultMessages) {
      return res.send({ messages: defaultMessages });
    }

    const messages = await generateMessages(userMessage);
    const syncedMessages = await lipSync(messages);

    // Save to history
    saveHistory({
      question: userMessage,
      answer: messages.map(m => m.text).join(" "),
    });

    res.send({ messages: syncedMessages });
  } catch (error) {
    console.error("Error in /tts:", error.message, error.stack);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// --- Speech to Text ---
app.post("/sts", async (req, res) => {
  try {
    const base64Audio = req.body.audio;
    if (!base64Audio) {
      return res.status(400).send({ error: "Missing audio in request" });
    }

    const audioData = Buffer.from(base64Audio, "base64");
    const userMessage = await convertAudioToText({ audioData });

    const messages = await generateMessages(userMessage);
    const syncedMessages = await lipSync(messages);

    // Save to history
    saveHistory({
      question: userMessage,
      answer: messages.map(m => m.text).join(" "),
    });

    res.send({ messages: syncedMessages });
  } catch (error) {
    console.error("Error in /sts:", error.message, error.stack);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// --- Get chat history ---
app.get("/history", (req, res) => {
  try {
    res.send(getHistory());
  } catch (err) {
    console.error("Error reading history:", err);
    res.status(500).send({ error: "Could not load history" });
  }
});

// --- Clear chat history ---
app.delete("/history", (req, res) => {
  try {
    clearHistory();
    res.send({ message: "Chat history cleared" });
  } catch (err) {
    console.error("Error clearing history:", err);
    res.status(500).send({ error: "Could not clear history" });
  }
});

app.listen(port, () => {
  console.log(`Jack is listening on port ${port}`);
});
