// api/check-sentence.js

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { words, sentence } = req.body;
  if (!words || !sentence || words.length === 0) {
    return res.status(400).json({ error: 'Words and sentence are required.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const wordListString = Array.isArray(words) ? words.join(', ') : words;

  const payload = {
    contents: [{
      parts: [{
        text: `你是一个友善且专业的英语老师。请判断句子 "${sentence}" 是否正确地使用了以下所有单词: "${wordListString}"。你的回答必须严格遵循以下JSON格式，所有内容都必须使用中文，不要包含任何额外的解释或markdown标记：
        {
          "is_correct": boolean,
          "explanation": "简短解释，说明用法是否地道，或者句子有什么问题",
          "correct_example": "提供一个使用了所有这些单词的正确、地道的例句"
        }`
      }]
    }],
    generationConfig: {
      response_mime_type: "application/json",
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    // Gemini API with json response_mime_type returns the JSON directly in the text part.
    const feedbackJson = JSON.parse(data.candidates[0].content.parts[0].text);
    res.status(200).json(feedbackJson);

  } catch (error) {
    console.error('Check Sentence Backend Error:', error);
    res.status(500).json({ error: 'Failed to get feedback from AI.', details: error.message });
  }
};