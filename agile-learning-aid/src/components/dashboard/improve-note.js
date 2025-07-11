import axios from 'axios';
import { Client } from '@notionhq/client';

const NOTION_API_KEY = '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';
const OPENROUTER_API_KEY = 'API_KEY';
const NOTION_DATABASE_ID = 'ID';

const notion = new Client({ auth: NOTION_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { note } = req.body;
  
  if (!note || !note.trim()) {
    return res.status(400).json({ error: 'Note content is required.' });
  }

  try {
    // Call AI service to improve the note
    const aiPrompt = `Improve this note for better clarity and grammar:\n\n"${note}"`;
    
    const aiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-4',
        max_tokens: 200,
        messages: [{ role: 'user', content: aiPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://yourdomain.com',
          'X-Title': 'Student Notes Portal',
        },
      }
    );

    const improvedNote = aiResponse.data.choices[0].message.content;

    // Save to Notion
    await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        Name: {
          title: [{ type: 'text', text: { content: 'Improved Note' } }],
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: { content: improvedNote },
              },
            ],
          },
        },
      ],
    });

    return res.status(200).json({ improved: improvedNote });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to improve note.' });
  }
}
