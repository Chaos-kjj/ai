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

  const prompt = `You are a professional Chinese-English translation teacher. Your task is to evaluate whether the user's English translation accurately and naturally expresses the meaning of the original Chinese sentence.
  The original Chinese sentence is: "${original_chinese}".
  The user's English translation is: "${user_translation}".
  You must respond ONLY with a valid JSON object in the following format. All string values in the JSON must be in Chinese.
  {
    "is_correct": boolean,
    "explanation": "Comment on the user's translation, pointing out its strengths and areas for improvement.",
    "better_translation": "Provide one or more improved, more elegant, or more natural reference translations."
  }`;
  
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
