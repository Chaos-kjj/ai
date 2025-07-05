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
  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";

  const payload = {
    model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B", // 使用您指定的模型
    messages: [
      {
        role: "system",
        content: "你是一个遵循指令的AI助手。你的任务是根据用户给定的主题，生成一个符合要求的中文句子，并以指定的JSON格式返回。"
      },
      {
        role: "user",
        content: `任务：生成一个与主题“${topic}”相关的中文句子。
        要求：
        1. 句子必须优美且有一定意境。
        2. 句子长度严格控制在20到30个汉字之间。
        3. 你的输出必须是严格的JSON格式，只包含一个键 "chinese_sentence"。
        
        示例输入: "雨后的彩虹"
        示例输出: {"chinese_sentence": "雨后初晴，一道绚丽的彩虹如梦之桥横跨天际。"}

        现在，请为主题“${topic}”生成句子。`
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
    const challengeData = JSON.parse(jsonString);

    res.status(200).json(challengeData);

  } catch (error) {
    console.error('Get Translation Challenge Backend Error:', error);
    res.status(500).json({ error: 'Failed to get sentence from AI.', details: error.message });
  }
};
