// api/check-sentence.js

module.exports = async (req, res) => {
  // 1. 检查请求方法和内容
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { word, sentence } = req.body;
  if (!word || !sentence) {
    return res.status(400).json({ error: 'Word and sentence are required.' });
  }

  // 2. 准备向 SiliconCloud API 发送的请求
  const apiKey = process.env.GOOGLE_API_KEY; // 我们继续使用这个环境变量名
  const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";

  const payload = {
    model: "alibaba/Qwen2-7B-Instruct",
    messages: [
      {
        role: "system",
        content: "你是一个友善且专业的英语老师。你的任务是判断用户提供的句子是否正确地使用了给定的单词，并提供反馈。你的回答必须严格遵循用户指定的JSON格式，所有内容都必须使用中文。"
      },
      {
        role: "user",
        content: `请判断句子 "${sentence}" 是否正确地使用了单词 "${word}"。返回的JSON格式必须是：{"is_correct": boolean, "explanation": "简短解释", "correct_example": "提供一两个正确例句"}`
      }
    ],
    // 强制要求AI返回JSON格式
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
    const feedbackJson = JSON.parse(data.choices[0].message.content);

    res.status(200).json(feedbackJson);

  } catch (error) {
    console.error('Check Sentence Backend Error:', error);
    res.status(500).json({ error: 'Failed to get feedback from AI.', details: error.message });
  }
};
