// api/check-translation.js

module.exports = async (req, res) => {
  // 1. 检查请求方法和内容
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { original_chinese, user_translation } = req.body;
  if (!original_chinese || !user_translation) {
    return res.status(400).json({ error: 'Original sentence and user translation are required.' });
  }

  // 2. 准备向 SiliconCloud API 发送的请求
  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";

  const payload = {
    model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B", // 使用您指定的模型
    messages: [
      {
        role: "system",
        content: "你是一位专业的英汉翻译老师。你的任务是评估用户的英文翻译，并以指定的JSON格式返回结构化的反馈。所有内容都必须使用中文。"
      },
      {
        role: "user",
        content: `任务：评估英文翻译。
        中文原文：“${original_chinese}”
        用户翻译：“${user_translation}”
        
        请返回JSON格式的批改结果，包含以下三个键：
        1. "is_correct": (boolean) 用户的翻译在语法和核心意思上是否基本正确。
        2. "explanation": (string) 对用户的翻译进行点评，指出优点和可以改进的地方。
        3. "better_translation": (string) 提供一个或多个更优美、更地道的参考翻译。`
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
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("AI response did not contain a valid JSON object.");
    }
    const jsonString = jsonMatch[0];
    const feedbackJson = JSON.parse(jsonString);

    res.status(200).json(feedbackJson);

  } catch (error) {
    console.error('Check Translation Backend Error:', error);
    res.status(500).json({ error: 'Failed to get feedback from AI.', details: error.message });
  }
};
