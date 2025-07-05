// api/get-translation-challenge.js

module.exports = async (req, res) => {
  // 1. 检查请求方法和内容
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  // 2. 准备向 Google Gemini API 发送的请求
  const apiKey = process.env.GOOGLE_API_KEY; // 从Vercel环境变量中读取您的Gemini API密钥
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: `你是一个中文作家。请根据用户提供的主题，生成一个优美的、长度在20到30个汉字之间的中文句子。你的回答必须严格遵循以下JSON格式，只包含一个键'chinese_sentence'，不要有任何额外的解释或markdown标记。重要：如果生成的句子中包含任何双引号(")，你必须用反斜杠进行转义，写作 \\"。
        主题是：“${topic}”。`
      }]
    }],
    generationConfig: {
      response_mime_type: "application/json",
    }
  };

  // 3. 发送请求并处理响应
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const challengeData = JSON.parse(data.candidates[0].content.parts[0].text);

    res.status(200).json(challengeData);

  } catch (error) {
    console.error('Get Translation Challenge Backend Error:', error);
    res.status(500).json({ error: 'Failed to get sentence from AI.', details: error.message });
  }
};
