// api/get-definition.js

module.exports = async (req, res) => {
  // 1. 检查请求方法和内容
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: 'Word is required.' });
  }

  // 2. 准备向 SiliconCloud API 发送的请求
  const apiKey = process.env.GOOGLE_API_KEY; // 我们继续使用这个环境变量名，但它现在存的是SiliconCloud的密钥
  const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";

  const payload = {
    model: "alibaba/Qwen2-7B-Instruct", // 使用通义千问模型
    messages: [
      {
        role: "system",
        content: "你是一个精准的英汉词典。你的任务是为用户提供的单词返回其音标和最核心的中文释义。你必须严格按照用户要求的JSON格式返回，不要包含任何额外的解释或文字。"
      },
      {
        role: "user",
        content: `请提供单词 "${word}" 的信息。返回的JSON格式必须是：{"pronunciation": "这里是音标", "definition": "这里是中文释义"}`
      }
    ],
    // 强制要求AI返回JSON格式，这非常重要！
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
    // 从AI返回的复杂结构中提取出我们需要的内容
    const definitionJson = JSON.parse(data.choices[0].message.content);

    res.status(200).json(definitionJson);

  } catch (error) {
    console.error('Get Definition Backend Error:', error);
    res.status(500).json({ error: 'Failed to get definition from AI.', details: error.message });
  }
};
