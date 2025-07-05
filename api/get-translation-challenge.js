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

  // 2. 准备向 SiliconCloud API 发送的请求
  const apiKey = process.env.GOOGLE_API_KEY; // 我们继续使用这个环境变量名
  const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";

  const payload = {
    model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    messages: [
      {
        role: "system",
        content: "你是一个中文作家。请根据用户提供的主题，生成一个优美的、长度在20到30个汉字之间的中文句子。你的回答必须严格遵循JSON格式，只包含一个键'chinese_sentence'，不要有任何额外的解释或markdown标记。"
      },
      {
        role: "user",
        content: `主题是：“${topic}”。`
      }
    ],
    response_format: { "type": "json_object" }
  };

  // 3. 发送请求并处理响应
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
    const content = JSON.parse(data.choices[0].message.content);

    res.status(200).json(content);

  } catch (error) {
    console.error('Get Translation Challenge Backend Error:', error);
    res.status(500).json({ error: 'Failed to get sentence from AI.', details: error.message });
  }
};
