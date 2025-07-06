// api/check-translation.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { original_chinese, user_translation, aiConfig } = req.body;
  if (!original_chinese || !user_translation || !aiConfig || !aiConfig.url || !aiConfig.model) {
    return res.status(400).json({ error: 'Original sentence, user translation, and AI config are required.' });
  }

  // 优化后的Prompt，明确指示explanation用中文，better_translation用英文
  const prompt = `You are a professional Chinese-English translation teacher. Your task is to evaluate the user's translation.
Original Chinese sentence: "${original_chinese}".
User's English translation: "${user_translation}".
You must respond ONLY with a valid JSON object. Do not add any text outside the JSON object.
The JSON object structure is:
{
  "is_correct": boolean,
  "explanation": "Comment on the user's translation, pointing out its strengths and areas for improvement.",
  "better_translation": "Provide one or more improved, more elegant, or more natural reference translations."
}
IMPORTANT INSTRUCTION: The value for the "explanation" field MUST be written in Chinese. The value for the "better_translation" field MUST be written in English.`;
  
  const payload = {
    model: aiConfig.model,
    prompt: prompt,
    format: "json",
    stream: false
  };

  try {
    const response = await fetch(`${aiConfig.url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const feedbackJson = JSON.parse(data.response);
    res.status(200).json(feedbackJson);

  } catch (error)
 {
    console.error('Check Translation Backend Error:', error);
    res.status(500).json({ error: 'Failed to get feedback from local AI.', details: error.message });
  }
};
