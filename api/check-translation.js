// api/check-translation.js

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { original_chinese, user_translation } = req.body;
  if (!original_chinese || !user_translation) {
    return res.status(400).json({ error: 'Original sentence and user translation are required.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: `你是一位专业的英汉翻译老师。请评估用户的英文翻译是否准确、地道地表达了中文原文的意思。你的回答必须严格遵循JSON格式，所有内容都必须使用中文，不要包含任何额外的解释或markdown标记。重要：如果生成的文本中包含任何双引号(")，你必须用反斜杠进行转义，写作 \\"。
        中文原文是：“${original_chinese}”。用户的英文翻译是：“${user_translation}”。请返回JSON格式的批改结果：{"is_correct": boolean, "explanation": "对用户的翻译进行点评，指出优点和可以改进的地方。", "better_translation": "提供一个或多个更优美、更地道的参考翻译。"}`
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
    const feedbackJson = JSON.parse(data.candidates[0].content.parts[0].text);
    res.status(200).json(feedbackJson);

  } catch (error) {
    console.error('Check Translation Backend Error:', error);
    res.status(500).json({ error: 'Failed to get feedback from AI.', details: error.message });
  }
};
