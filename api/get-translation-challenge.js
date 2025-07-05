// api/get-translation-challenge.js

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";

  const payload = {
    model: "deepseek-ai/deepseek-v2-lite",
    messages: [
      {
        role: "system",
        content: "你是一个中文作家。请根据用户提供的主题，生成一个优美的、长度在20到30个汉字之间的中文句子。你的回答必须严格遵循JSON格式，只包含一个键'chinese_sentence'。重要：如果生成的句子中包含任何双引号(\")，你必须用反斜杠进行转义，写作 \\\"。"
      },
      {
        role: "user",
        content: `主题是：“${topic}”。`
      }
    ],
    response_format: { "type": "json_object" }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`SiliconCloud API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain a valid JSON object.");
    }
    const jsonString = jsonMatch[0];
    const challengeData = JSON.parse(jsonString);

    res.status(200).json(challengeData);

  } catch (error) {
    console.error('Get Translation Challenge Backend Error:', error);
    res.status(500).json({ error: 'Failed to get sentence from AI.', details: error.message });
  }
};
