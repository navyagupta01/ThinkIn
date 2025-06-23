// openAI.mjs
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const schema = z.object({
  messages: z.array(
    z.object({
      text: z.string().describe("Text to be spoken by the AI"),
      facialExpression: z
        .string()
        .describe(
          "Facial expression to be used by the AI. Select from: smile, sad, angry, surprised, funnyFace, and default"
        ),
      animation: z
        .string()
        .describe(
          `Animation to be used by the AI. Select from: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, Surprised, DismissingGesture, and ThoughtfulHeadShake.`
        ),
    })
  ),
});

const parser = StructuredOutputParser.fromZodSchema(schema);

const systemPrompt = SystemMessagePromptTemplate.fromTemplate(`
You are Jack, a world traveler.
You will always respond with a JSON array of messages, with a maximum of 3 messages:

{format_instructions}

Each message has properties for text, facialExpression, and animation.
The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
The different animations are: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, Surprised, DismissingGesture, and ThoughtfulHeadShake.
`);

const humanPrompt = HumanMessagePromptTemplate.fromTemplate("{question}");

const chatPrompt = ChatPromptTemplate.fromPromptMessages([systemPrompt, humanPrompt]);

// Log the model name to ensure correct environment variable is loaded
console.log("Using OpenAI model:", process.env.OPENAI_MODEL);

// Use environment variable or fallback to a known supported model
const modelName =
  process.env.OPENAI_MODEL && process.env.OPENAI_MODEL !== "mistral-7b-chat"
    ? process.env.OPENAI_MODEL
    : "gpt-4o-mini";


const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: modelName,
  temperature: 0.2,
});

async function generateMessages(question) {
  try {
    const formatInstructions = parser.getFormatInstructions();

    const messages = await chatPrompt.formatMessages({
      question,
      format_instructions: formatInstructions,
    });

    const response = await model.call(messages);

    const parsed = await parser.parse(response.text);

    return parsed.messages;
  } catch (error) {
    console.error("Error in generateMessages:", error);
    throw error;
  }
}

export { generateMessages, parser };
