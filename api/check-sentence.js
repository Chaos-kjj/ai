// api/check-sentence.js

// 使用Node.js的fetch
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  // 从请求体中获取单词、句子以及AI配置
  const { words, sentence, aiConfig } = req.body;
  if (!words || !sentence || !aiConfig || !aiConfig.url || !aiConfig.model) {
    return res.status(400).json({ error: 'Words, sentence, and AI config are required.' });
  }

  const wordListString = Array.isArray(words) ? words.join(', ') : words;
  
  // 为Ollama准备的Prompt
  const prompt = `You are a friendly and professional English teacher. Your task is to determine if the sentence "${sentence}" correctly and naturally uses all of the following words: "${wordListString}". 
  You must respond ONLY with a valid JSON object in the following format. Do not include any other text, explanations, or markdown formatting.
  {
    "is_correct": boolean,
    "explanation": "Provide a brief explanation in Chinese about whether the usage is natural or if there are any issues.",
    "correct_example": "Provide a correct and natural example sentence in English that uses all the given words."
  }`;

  // 为Ollama准备的Payload
  const payload = {
    model: aiConfig.model,
    prompt: prompt,
    format: "json", // 请求Ollama直接输出JSON
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
    // Ollama在非流式JSON模式下，会把JSON字符串放在response字段里
    const feedbackJson = JSON.parse(data.response);
    res.status(200).json(feedbackJson);

  } catch (error) {
    console.error('Check Sentence Backend Error:', error);
    res.status(500).json({ error: 'Failed to get feedback from local AI.', details: error.message });
  }
};
