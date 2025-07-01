const axios = require('axios');
const { Client } = require('@notionhq/client');
const readline = require('readline');

// === YOUR API KEYS ===
const NOTION_API_KEY = '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';
const OPENROUTER_API_KEY = "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"

// === SETUP NOTION CLIENT ===
const notion = new Client({ auth: NOTION_API_KEY });

// === YOUR DATABASE ID ===
const databaseId = "903ccdf22962419282b3856ebbe177bf";

// === Setup readline interface ===
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function for question prompts
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Get AI-enhanced note
async function getAISuggestion(prompt) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-4',
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          // Remove or update referer header if needed
          // 'HTTP-Referer': 'https://yourdomain.com',
          'X-Title': 'Student Notes Portal'
        }
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ OpenRouter Error:", error.response?.data || error.message);
    return null;
  }
}

// Save note to Notion database
async function saveToNotionPage(title, content) {
  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            { type: "text", text: { content: title } }
          ]
        }
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { type: "text", text: { content } }
            ]
          }
        }
      ]
    });
    console.log("✅ Note saved to Notion successfully.");
  } catch (error) {
    console.error("❌ Notion Error:", error.body || error.message);
  }
}

// Main flow
(async () => {
  const studentNote = await askQuestion("📝 Please enter your note: ");

  if (!studentNote.trim()) {
    console.log("⚠ Empty note provided. Exiting.");
    rl.close();
    process.exit(0);
  }

  console.log("🧠 Getting AI-enhanced note...");

  const aiPrompt = `Improve this note for better clarity, grammar, and formatting:\n\n"${studentNote}"`;
  const improvedNote = await getAISuggestion(aiPrompt);

  if (!improvedNote) {
    console.log("❌ Failed to get improved note. Saving original note.");
    await saveToNotionPage("Student Note (Original)", studentNote);
    rl.close();
    return;
  }

  console.log("\n📝 AI Improved Note:\n", improvedNote);

  // Ask user if they want to accept or edit the improved note
  let userChoice = await askQuestion("\nDo you want to (a)ccept the improved note, (e)dit it, or (r)eject and save original? (a/e/r): ");
  userChoice = userChoice.trim().toLowerCase();

  let finalNote;

  if (userChoice === 'e') {
    finalNote = await askQuestion("\nPlease enter your edited note:\n");
  } else if (userChoice === 'r') {
    finalNote = studentNote;
  } else {
    finalNote = improvedNote;
  }

  await saveToNotionPage("Student Note", finalNote);

  rl.close();
})();