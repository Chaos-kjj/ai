// api/get-translation-challenge.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { topic, aiConfig } = req.body;
  if (!topic || !aiConfig || !aiConfig.url || !aiConfig.model) {
    return res.status(400).json({ error: 'Topic and AI config are required.' });
  }

  const prompt = `You are a Chinese writer. Based on the user-provided topic, generate a beautiful Chinese sentence between 20 and 30 characters long.
  The topic is: "${topic}".
  You must respond ONLY with a valid JSON object containing a single key 'chinese_sentence'. Do not include any other explanations or markdown formatting.
  {
    "chinese_sentence": "Your generated sentence goes here."
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
    const challengeData = JSON.parse(data.response);
    res.status(200).json(challengeData);

  } catch (error) {
    console.error('Get Translation Challenge Backend Error:', error);
    res.status(500).json({ error: 'Failed to get sentence from local AI.', details: error.message });
  }
};
